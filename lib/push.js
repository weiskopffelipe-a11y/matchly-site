// =====================================================================
// MATCHLY — avisos no celular (Web Push), sem serviço pago.
// Implementa a criptografia padrão (RFC 8291, aes128gcm) e a assinatura
// VAPID (RFC 8292) só com o node:crypto.
// =====================================================================
import crypto from "node:crypto";

const b64u = (buf) => Buffer.from(buf).toString("base64url");

// par de chaves do servidor (P-256). A pública vai para o navegador; a privada fica no banco.
export function gerarChaves() {
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.generateKeys();
  return { publica: b64u(ecdh.getPublicKey()), privada: b64u(ecdh.getPrivateKey()) };
}

// "crachá" do servidor para o serviço de push (JWT ES256 com validade de 12h)
export function assinaturaVapid(audiencia, contato, chaves) {
  const pub = Buffer.from(chaves.publica, "base64url");
  const chave = crypto.createPrivateKey({
    key: { kty: "EC", crv: "P-256", d: chaves.privada, x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)) },
    format: "jwk",
  });
  const cab = b64u(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const corpo = b64u(JSON.stringify({ aud: audiencia, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: contato }));
  const assinatura = crypto.sign("sha256", Buffer.from(`${cab}.${corpo}`), { key: chave, dsaEncoding: "ieee-p1363" });
  return `${cab}.${corpo}.${b64u(assinatura)}`;
}

const hkdf = (sal, ikm, info, tamanho) => Buffer.from(crypto.hkdfSync("sha256", ikm, sal, info, tamanho));

// cifra a mensagem para um aparelho (só ele consegue abrir)
export function cifrar(inscricao, texto, { sal = crypto.randomBytes(16), efemera } = {}) {
  const uaPub = Buffer.from(inscricao.keys.p256dh, "base64url");
  const segredo = Buffer.from(inscricao.keys.auth, "base64url");
  const as = efemera || crypto.createECDH("prime256v1");
  if (!efemera) as.generateKeys();
  const asPub = as.getPublicKey();
  const compartilhado = as.computeSecret(uaPub);
  const ikm = hkdf(segredo, compartilhado, Buffer.concat([Buffer.from("WebPush: info\0"), uaPub, asPub]), 32);
  const cek = hkdf(sal, ikm, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdf(sal, ikm, Buffer.from("Content-Encoding: nonce\0"), 12);
  const c = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const cifrado = Buffer.concat([c.update(Buffer.concat([Buffer.from(texto), Buffer.from([2])])), c.final(), c.getAuthTag()]);
  const cab = Buffer.alloc(21);
  sal.copy(cab, 0); cab.writeUInt32BE(4096, 16); cab.writeUInt8(asPub.length, 20);
  return Buffer.concat([cab, asPub, cifrado]);
}

// envia um aviso. Devolve o status HTTP do serviço de push (201 = entregue; 404/410 = inscrição morta)
export async function enviarPush(inscricao, dados, chaves, contato) {
  const u = new URL(inscricao.endpoint);
  const jwt = assinaturaVapid(`${u.protocol}//${u.host}`, contato, chaves);
  const r = await fetch(inscricao.endpoint, {
    method: "POST",
    headers: {
      TTL: "86400", Urgency: "high", "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream",
      Authorization: `vapid t=${jwt}, k=${chaves.publica}`,
    },
    body: cifrar(inscricao, JSON.stringify(dados)),
  });
  return r.status;
}
