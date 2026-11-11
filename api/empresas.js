// =====================================================================
// MATCHLY — POST /api/empresas  (cadastro de empresa feito pelo site)
// Roda na Vercel. Usa a chave secreta do Supabase, que nunca vai para o navegador.
// =====================================================================

import crypto from "node:crypto";

const SUPA = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const CHAVE = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";

const cabecalhoChave = (k) => (k.startsWith("eyJ") ? { apikey: k, Authorization: `Bearer ${k}` } : { apikey: k });
const db = async (caminho, { method = "GET", body, prefer } = {}) => {
  const r = await fetch(`${SUPA}/rest/v1/${caminho}`, {
    method,
    headers: { ...cabecalhoChave(CHAVE), "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const txt = await r.text();
  if (!r.ok) { const e = new Error(txt); e.status = r.status; throw e; }
  return txt ? JSON.parse(txt) : null;
};

function cnpjValido(v) {
  const n = String(v || "").replace(/\D/g, "");
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const dv = (base) => { let soma = 0, peso = base.length - 7; for (const d of base) { soma += +d * peso--; if (peso < 2) peso = 9; } const r = soma % 11; return r < 2 ? 0 : 11 - r; };
  return dv(n.slice(0, 12)) === +n[12] && dv(n.slice(0, 13)) === +n[13];
}
const limpa = (s, n = 300) => String(s || "").replace(/[<>]/g, "").trim().slice(0, n);
const TIPOS_ATS = ["greenhouse", "lever", "smartrecruiters", "recruitee", "ashby"];

// limite simples contra abuso: 5 cadastros por IP a cada hora (por instância)
const tentativas = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ erro: "Use POST." });
  if (!SUPA || !CHAVE) return res.status(503).json({ erro: "Banco de dados ainda não configurado." });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || "?";
  const janela = (tentativas.get(ip) || []).filter((t) => Date.now() - t < 3600_000);
  if (janela.length >= 5) return res.status(429).json({ erro: "Muitas tentativas. Tente de novo em uma hora." });
  tentativas.set(ip, [...janela, Date.now()]);

  let d = req.body;
  if (typeof d === "string") { try { d = JSON.parse(d); } catch { d = null; } }
  if (!d || typeof d !== "object") return res.status(400).json({ erro: "Dados inválidos." });

  const cnpj = String(d.cnpj || "").replace(/\D/g, "");
  if (!limpa(d.nome)) return res.status(400).json({ erro: "Informe o nome da empresa." });
  if (cnpj && !cnpjValido(cnpj)) return res.status(400).json({ erro: "CNPJ inválido. Confira os números ou deixe em branco." });
  if (!/^\S+@\S+\.\S+$/.test(d.email || "") || !limpa(d.responsavel)) return res.status(400).json({ erro: "Informe nome e e-mail do responsável." });
  if (!d.aceite) return res.status(400).json({ erro: "É preciso aceitar os termos." });

  // logo: imagem de até 600 KB; SVG com código é recusado
  let logo = null;
  if (d.logo) {
    const m = String(d.logo).match(/^data:(image\/(png|jpeg|webp|svg\+xml));base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return res.status(400).json({ erro: "Formato de logo não aceito." });
    const bytes = Buffer.from(m[3], "base64");
    if (bytes.length > 600 * 1024) return res.status(400).json({ erro: "A logo pode ter no máximo 600 KB." });
    if (m[2] === "svg+xml" && /<script|on\w+\s*=|javascript:/i.test(bytes.toString("utf8"))) return res.status(400).json({ erro: "Esse SVG tem código embutido. Envie PNG." });
    logo = { tipo: m[1], ext: m[2] === "jpeg" ? "jpg" : m[2] === "svg+xml" ? "svg" : m[2], bytes };
  }

  try {
    const existe = cnpj ? await db(`empresas?select=id&cnpj=eq.${cnpj}&limit=1`) : [];
    const dominio = limpa(d.dominio, 120).toLowerCase() || null;
    const dados = {
      nome: limpa(d.nome, 200), razao_social: limpa(d.razao, 200) || null, cnpj: cnpj || null, dominio, site: limpa(d.site, 200) || null,
      setor: limpa(d.setor, 80) || null, cidade: limpa(d.cidade, 80) || null, uf: limpa(d.uf, 2).toUpperCase() || null,
      tamanho: limpa(d.tamanho, 20) || null, descricao: limpa(d.descricao, 1200) || null,
      beneficios: Array.isArray(d.beneficios) ? d.beneficios.slice(0, 15).map((b) => limpa(b, 40)) : [],
      responsavel: limpa(d.responsavel, 120), email_contato: limpa(d.email, 160), telefone: limpa(d.tel, 30) || null,
      origem: "cadastro", tipo: "empresa", verificada: false, atualizada_em: new Date().toISOString(),
    };
    // acesso sem senha à área de quem contrata: a chave fica no aparelho, no banco só o hash
    const token = crypto.randomBytes(24).toString("base64url");
    dados.token_hash = crypto.createHash("sha256").update(token).digest("hex");
    if (existe.length) return res.status(409).json({ erro: "Esse CNPJ já está cadastrado. Se a página é sua, fale com a gente para assumir o controle." });

    // se a empresa já estava no radar (pelo site), assume aquele registro em vez de criar outro
    let empresa;
    const doRadar = dominio ? await db(`empresas?select=id,origem&dominio=eq.${encodeURIComponent(dominio)}&limit=1`) : [];
    if (doRadar.length) [empresa] = await db(`empresas?id=eq.${doRadar[0].id}`, { method: "PATCH", body: dados, prefer: "return=representation" });
    else [empresa] = await db("empresas", { method: "POST", body: dados, prefer: "return=representation" });

    if (logo) {
      const arquivo = `${empresa.id}.${logo.ext}`;
      const up = await fetch(`${SUPA}/storage/v1/object/logos/${arquivo}`, {
        method: "POST", headers: { ...cabecalhoChave(CHAVE), "Content-Type": logo.tipo, "x-upsert": "true", "Cache-Control": "3600" }, body: logo.bytes,
      });
      if (up.ok) await db(`empresas?id=eq.${empresa.id}`, { method: "PATCH", body: { logo_url: `${SUPA}/storage/v1/object/public/logos/${arquivo}` } });
    }

    // a página de vagas que a própria empresa informou entra no robô como fonte autorizada
    if (d.fonte && d.fonteId) {
      const tipo = TIPOS_ATS.includes(d.fonte) ? d.fonte : "pagina";
      const identificador = tipo === "pagina" ? limpa(d.vagasUrl || d.fonteId, 400) : limpa(d.fonteId, 120);
      await db("fontes?on_conflict=tipo,identificador", { method: "POST", prefer: "resolution=merge-duplicates,return=minimal",
        body: [{ empresa_id: empresa.id, tipo, identificador, autorizada: true, ativa: true, falhas: 0, proxima_coleta: new Date().toISOString() }] });
    } else if (dominio) {
      await db("fontes?on_conflict=tipo,identificador", { method: "POST", prefer: "resolution=ignore-duplicates,return=minimal",
        body: [{ empresa_id: empresa.id, tipo: "descobrir", identificador: dominio, autorizada: true }] });
    }

    // e-mail de confirmação (opcional: só se o Resend estiver configurado)
    if (process.env.RESEND_API_KEY && process.env.EMAIL_REMETENTE) {
      const enviar = (para, assunto, html) => fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_REMETENTE, to: para, subject: assunto, html }),
      }).catch(() => {});
      await enviar(dados.email_contato, "Recebemos o cadastro da sua empresa no Matchly",
        `<p>Olá, ${dados.responsavel}!</p><p>A página da <b>${dados.nome}</b> já está no Matchly com o selo "verificação pendente". Vamos conferir o CNPJ e o contato em até 2 dias úteis.</p><p>Equipe Matchly</p>`);
      if (process.env.EMAIL_ADMIN) await enviar(process.env.EMAIL_ADMIN, `Nova empresa para verificar: ${dados.nome}`, `<p>${dados.nome} · CNPJ ${cnpj} · ${dados.email_contato}</p>`);
    }

    return res.status(201).json({ ok: true, id: empresa.id, token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Não foi possível cadastrar agora. Tente de novo em alguns minutos." });
  }
}
