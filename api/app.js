// =====================================================================
// MATCHLY — /api/app  (vagas, candidaturas, contas, avaliações e avisos)
// Roda na Vercel com a chave secreta do Supabase, que nunca vai para o navegador.
//
//   GET  ?acao=status | vagas | avaliacoes&empresa=ID | push_chave
//   POST ?acao=publicar | painel | etapa | vista | encerrar          (quem contrata)
//        ?acao=cadastro | salvar_perfil | candidatar | minhas         (quem procura trabalho)
//        ?acao=entrar | definir_senha                                (celular + senha de 6 números)
//        ?acao=avaliar                                               (estrelas depois da contratação)
//        ?acao=inscrever                                             (avisos no celular)
//        ?acao=talentos | convidar                                   (quem contrata procura pessoas cadastradas)
//        ?acao=recusar_convite                                       (quem procura trabalho)
//
// Acesso: cada aparelho recebe uma chave aleatória (no banco fica só o hash).
// Para entrar em outro aparelho: celular (ou e-mail) + senha de 6 números.
// =====================================================================
import crypto from "node:crypto";
import { gerarChaves, enviarPush } from "../lib/push.js";
import { canais, enviarEmail, enviarSMS, modeloEmail } from "../lib/avisos.js";

const SUPA = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const CHAVE = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
const SITE = process.env.SITE_URL || "https://matchly-site.vercel.app";

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

const hash = (t) => crypto.createHash("sha256").update(String(t)).digest("hex");
const novoToken = () => crypto.randomBytes(24).toString("base64url");
const limpa = (s, n = 300) => String(s ?? "").replace(/[<>]/g, "").trim().slice(0, n);
const lista = (a, n = 20, m = 60) => (Array.isArray(a) ? a.slice(0, n).map((x) => limpa(x, m)).filter(Boolean) : []);
const num = (v) => { const x = Number(v); return Number.isFinite(x) && x >= 0 && x < 1e7 ? x : null; };
const uuid = (v) => /^[0-9a-f-]{36}$/i.test(String(v || ""));
const sai = (res, status, dados) => res.status(status).json(dados);

const CONTRATOS = ["CLT", "PJ", "Temporário", "Estágio", "Aprendiz", "Freelancer", "Diária", "Por hora"];
const UNIDADES = ["/hora", "/dia", "/mês"];
// o que quem contrata pode fazer: chamar para conversar, enviar proposta, cancelar a proposta (volta para conversa) ou não seguir.
// "Contratada" só acontece quando o trabalhador aceita a proposta (acao=responder_proposta).
const ETAPAS = ["Candidatura enviada", "Entrevista", "Proposta", "Recusada"];
const PAPEIS = ["empresa", "candidato"];
// vaga que pede dinheiro do candidato vai para revisão em vez de ir ao ar
const PEDE_DINHEIRO = /(pagar|pague|pagamento|taxa|dep[oó]sito|pix|boleto|investimento).{0,40}(inscri|curso|material|uniforme|cadastro|exame|kit|treinamento|vaga)/i;

// limite simples contra abuso (por instância): N chamadas por IP e por ação a cada hora
const usos = new Map();
const LIMITES = { publicar: 20, candidatar: 40, cadastro: 10, entrar: 30, definir_senha: 20, avaliar: 60, inscrever: 30,
  etapa: 600, vista: 600, encerrar: 60, painel: 2000, minhas: 400, salvar_perfil: 300, talentos: 600, convidar: 200, recusar_convite: 100, responder_proposta: 100 };
function excedeu(req, acao) {
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  const k = `${acao}:${ip}`;
  const janela = (usos.get(k) || []).filter((t) => Date.now() - t < 3600_000);
  janela.push(Date.now()); usos.set(k, janela);
  return janela.length > (LIMITES[acao] || 200);
}

// ------------------------------------------------------------------ acesso
async function criarAcesso(tipo, id) {
  const token = novoToken();
  await db("acessos", { method: "POST", prefer: "return=minimal", body: { token_hash: hash(token), dono_tipo: tipo, dono_id: id } });
  return token;
}
async function donoDoToken(token, tipo) {
  if (!token || String(token).length < 20) return null;
  const h = hash(token);
  const tabela = tipo === "empresa" ? "empresas" : "candidatos";
  const campos = tipo === "empresa" ? "id,nome,tipo,setor,cidade,uf,logo_url,verificada,telefone,email_contato" : "id,nome,telefone,cidade";
  const [a] = await db(`acessos?select=dono_id&token_hash=eq.${h}&dono_tipo=eq.${tipo}&limit=1`);
  const filtro = a ? `id=eq.${a.dono_id}` : `token_hash=eq.${h}`;   // chaves antigas ficavam na própria linha
  const [r] = await db(`${tabela}?select=${campos}&${filtro}&limit=1`);
  return r || null;
}
const empresaDoToken = (t) => donoDoToken(t, "empresa");
const candidatoDoToken = (t) => donoDoToken(t, "candidato");

// ------------------------------------------------------------------ senha de 6 números
const normalizaLogin = (v) => { const s = String(v || "").trim().toLowerCase(); if (s.includes("@")) return /^\S+@\S+\.\S+$/.test(s) ? s : ""; const d = s.replace(/\D/g, ""); return d.length >= 10 && d.length <= 13 ? d.replace(/^55(?=\d{10,11}$)/, "") : ""; };
const senhaValida = (s) => /^\d{6}$/.test(String(s || ""));
const fazSenha = (s) => { const sal = crypto.randomBytes(16).toString("hex"); return `${sal}:${crypto.scryptSync(String(s), sal, 32).toString("hex")}`; };
const confere = (s, guardada) => { const [sal, h] = String(guardada).split(":"); if (!sal || !h) return false; const x = crypto.scryptSync(String(s), sal, 32); return crypto.timingSafeEqual(x, Buffer.from(h, "hex")); };
async function definirSenha(tipo, donoId, login, senha) {
  const [outra] = await db(`contas?select=id,dono_id&login=eq.${encodeURIComponent(login)}&dono_tipo=eq.${tipo}&limit=1`);
  if (outra && outra.dono_id !== donoId) { const e = new Error("login em uso"); e.status = 409; throw e; }
  const [minha] = await db(`contas?select=id&dono_id=eq.${donoId}&dono_tipo=eq.${tipo}&limit=1`);
  const dados = { login, senha_hash: fazSenha(senha), falhas: 0, bloqueada_ate: null };
  if (minha) await db(`contas?id=eq.${minha.id}`, { method: "PATCH", body: dados });
  else await db("contas", { method: "POST", prefer: "return=minimal", body: { ...dados, dono_tipo: tipo, dono_id: donoId } });
}

// ------------------------------------------------------------------ avisos
async function chavesPush() {
  const [c] = await db("config?select=valor&chave=eq.vapid&limit=1");
  if (c) return JSON.parse(c.valor);
  const novas = gerarChaves();
  await db("config?on_conflict=chave", { method: "POST", prefer: "resolution=ignore-duplicates,return=minimal", body: [{ chave: "vapid", valor: JSON.stringify(novas) }] });
  const [g] = await db("config?select=valor&chave=eq.vapid&limit=1");   // se duas instâncias criaram ao mesmo tempo, vale a gravada
  return JSON.parse(g.valor);
}
async function avisar(tipo, donoId, dados) {
  try {
    const inscricoes = await db(`push_inscricoes?select=endpoint,p256dh,auth&dono_tipo=eq.${tipo}&dono_id=eq.${donoId}&limit=10`);
    if (!inscricoes.length) return;
    const chaves = await chavesPush();
    await Promise.all(inscricoes.map(async (i) => {
      const st = await enviarPush({ endpoint: i.endpoint, keys: { p256dh: i.p256dh, auth: i.auth } }, dados, chaves, SITE).catch(() => 0);
      if (st === 404 || st === 410) await db(`push_inscricoes?endpoint=eq.${encodeURIComponent(i.endpoint)}`, { method: "DELETE" }).catch(() => {});
    }));
  } catch (e) { console.error("aviso", e.message); }
}
// avisos para quem procura trabalho: celular (push), e-mail e SMS, conforme o que a pessoa escolheu em "Avisos"
//   tipo: "candidatura" (candidatura enviada) | "respostas" (empresa viu, chamou, contratou, recusou, convidou) | "novasVagas"
async function avisarCandidato(id, tipo, { titulo, texto, url = "/#candidaturas", botao = "Abrir o Matchly", sms }) {
  try {
    const [c] = await db(`candidatos?select=telefone,perfil&id=eq.${id}&limit=1`);
    const al = c?.perfil?.alertas || {};
    if (al[tipo] === false) return;
    await avisar("candidato", id, { title: titulo, body: texto, url });
    const email = al.email || c?.perfil?.profile?.email;
    if (email && al.porEmail !== false) await enviarEmail(email, titulo, modeloEmail({ titulo, texto: texto.replace(/\n/g, "<br>"), botao, link: SITE + url, site: SITE }));
    if (al.porSMS && (c?.telefone || c?.perfil?.profile?.phone)) await enviarSMS(c.telefone || c.perfil.profile.phone, sms || `Matchly: ${titulo}${/[.!?]$/.test(titulo) ? "" : "."} ${texto}`.slice(0, 300));
  } catch (e) { console.error("avisarCandidato", e.message); }
}
async function avisarEmpresaPorEmail(empresaId, titulo, texto) {
  try {
    const [e] = await db(`empresas?select=email_contato&id=eq.${empresaId}&limit=1`);
    if (e?.email_contato) await enviarEmail(e.email_contato, titulo, modeloEmail({ titulo, texto, botao: "Ver na minha área", link: SITE + "/#area", site: SITE }));
  } catch { /* segue */ }
}

// combinação simples usada nos avisos de vagas novas: mesma cidade (ou remoto) e mesma área ou função
const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const palavras = (s) => semAcento(s).split(/[^a-z0-9]+/).filter((w) => w.length > 3);
function combinaVaga(perfil = {}, v) {
  const pf = perfil.prefs || {}, pr = perfil.profile || {};
  const cidadeC = semAcento(pf.city || pr.city).trim(), cidadeV = semAcento(v.cidade).trim();
  if (v.modelo !== "Remoto" && cidadeC && cidadeV && cidadeC !== cidadeV) return false;
  if ((pf.areas || []).includes(v.area)) return true;
  const alvo = new Set([pf.mainRole, ...(pf.altRoles || []), pr.role, ...(pr.experiences || []).map((e) => e.title)].flatMap(palavras));
  return palavras(v.titulo).some((w) => alvo.has(w));
}
const pagaTexto = (v) => { const u = { "/dia": " por dia", "/hora": " por hora" }[v.unidade] || " por mês"; const x = +v.salario_max || +v.salario_min; return x ? `R$ ${Math.round(x).toLocaleString("pt-BR")}${u}` : "valor a combinar"; };

// vaga nova: aviso no celular, na hora, para quem tem perfil parecido
async function avisarNovaVaga(vaga, empresaNome) {
  try {
    const subs = await db("push_inscricoes?select=dono_id&dono_tipo=eq.candidato&limit=3000");
    const ids = [...new Set(subs.map((x) => x.dono_id))].slice(0, 250);
    if (!ids.length) return;
    const cands = await db(`candidatos?select=id,perfil&id=in.(${ids.join(",")})`);
    const alvo = cands.filter((c) => c.perfil?.alertas?.novasVagas !== false && combinaVaga(c.perfil, vaga)).slice(0, 150);
    await Promise.race([
      Promise.all(alvo.map((c) => avisar("candidato", c.id, { title: "Vaga nova que combina com você", body: `${vaga.titulo} · ${empresaNome} · ${pagaTexto(vaga)}`, url: "/" }))),
      new Promise((r) => setTimeout(r, 6000)),
    ]);
  } catch (e) { console.error("avisarNovaVaga", e.message); }
}

// ------------------------------------------------------------------ avaliações
const resumo = (notas) => (notas.length ? { media: Math.round((notas.reduce((a, n) => a + n, 0) / notas.length) * 10) / 10, total: notas.length } : null);
function agrupar(linhas, campo) {
  const m = {};
  linhas.forEach((a) => { (m[a[campo]] ||= []).push(a.nota); });
  return Object.fromEntries(Object.entries(m).map(([k, v]) => [k, resumo(v)]));
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const acao = String(req.query?.acao || "");
  if (!SUPA || !CHAVE) return sai(res, 503, { erro: "Banco de dados ainda não configurado.", banco: false });

  let d = req.body;
  if (typeof d === "string") { try { d = JSON.parse(d); } catch { d = null; } }
  d = d && typeof d === "object" ? d : {};

  try {
    // ================================================================ leitura pública
    if (acao === "status") {
      const ok = await db("avaliacoes?select=id&limit=1").then(() => true).catch(() => false);
      return sai(res, 200, { banco: true, tabelas: ok, canais: { celular: true, ...canais() } });
    }

    if (acao === "vagas") {
      const rows = await db("vagas?select=id,empresa_id,origem,titulo,descricao,cidade,uf,modelo,contrato,salario_min,salario_max,unidade,escolaridade,exige_experiencia,area,habilidades,beneficios,url,fonte_nome,publicada_em,coletada_em,particular,horarios," +
        "empresas(id,nome,dominio,site,logo_url,setor,cidade,uf,tamanho,descricao,beneficios,verificada,tipo)" +
        "&ativa=eq.true&suspeita=eq.false&order=publicada_em.desc.nullslast&limit=1500");
      const ids = [...new Set(rows.map((v) => v.empresa_id).filter(Boolean))];
      const notas = ids.length ? await db(`avaliacoes?select=empresa_id,nota&de=eq.candidato&empresa_id=in.(${ids.join(",")})&limit=20000`) : [];
      // vaga nova aparece em poucos segundos: o cache da Vercel guarda a lista por 5s no máximo
      res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=5");
      return sai(res, 200, { vagas: rows, empresas: ids.length, avaliacoes: agrupar(notas, "empresa_id") });
    }

    if (acao === "avaliacoes") {
      if (!uuid(req.query.empresa)) return sai(res, 400, { erro: "Empresa inválida." });
      const itens = await db(`avaliacoes?select=nota,comentario,criada_em,candidaturas(vagas(titulo))&de=eq.candidato&empresa_id=eq.${req.query.empresa}&order=criada_em.desc&limit=100`);
      res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
      return sai(res, 200, { resumo: resumo(itens.map((i) => i.nota)),
        itens: itens.map((i) => ({ nota: i.nota, comentario: i.comentario, criada_em: i.criada_em, vaga: i.candidaturas?.vagas?.titulo || "" })) });
    }

    if (acao === "push_chave") {
      res.setHeader("Cache-Control", "s-maxage=3600");
      return sai(res, 200, { chave: (await chavesPush()).publica });
    }

    if (acao === "resumo_diario") {
      const segredo = process.env.CRON_SECRET;
      const autorizado = segredo ? req.headers.authorization === `Bearer ${segredo}` : /vercel-cron/i.test(req.headers["user-agent"] || "");
      if (!autorizado) return sai(res, 401, { erro: "Só o agendador da Vercel pode chamar." });
      const ligados = canais();
      if (!ligados.email && !ligados.sms) return sai(res, 200, { ok: true, enviados: 0, motivo: "e-mail e SMS ainda não configurados" });
      const desde = new Date(Date.now() - 26 * 3600e3).toISOString();
      const vagas = await db(`vagas?select=id,titulo,cidade,modelo,area,salario_min,salario_max,unidade,empresas(nome)&ativa=eq.true&suspeita=eq.false&publicada_em=gte.${desde}&order=publicada_em.desc&limit=300`);
      if (!vagas.length) return sai(res, 200, { ok: true, enviados: 0, motivo: "nenhuma vaga nova" });
      const limite = Date.now() - 20 * 3600e3, comeco = Date.now();
      const cands = await db("candidatos?select=id,telefone,perfil,ultimo_resumo&order=atualizado_em.desc&limit=2000");
      let enviados = 0;
      for (const c of cands) {
        if (Date.now() - comeco > 45_000 || enviados >= 300) break;
        const al = c.perfil?.alertas || {};
        if (al.novasVagas === false || (c.ultimo_resumo && new Date(c.ultimo_resumo).getTime() > limite)) continue;
        const email = al.email || c.perfil?.profile?.email;
        const querEmail = ligados.email && email && al.porEmail !== false, querSMS = ligados.sms && al.porSMS && c.telefone;
        if (!querEmail && !querSMS) continue;
        const ja = new Set((await db(`candidaturas?select=vaga_id&candidato_id=eq.${c.id}&limit=500`)).map((x) => x.vaga_id));
        const lista = vagas.filter((v) => !ja.has(v.id) && combinaVaga(c.perfil, v)).slice(0, 5);
        if (!lista.length) continue;
        const titulo = lista.length === 1 ? "1 vaga nova que combina com você" : `${lista.length} vagas novas que combinam com você`;
        if (querEmail) await enviarEmail(email, titulo, modeloEmail({ titulo, site: SITE, botao: "Ver as vagas", link: SITE + "/",
          texto: lista.map((v) => `• <b>${v.titulo}</b> — ${v.empresas?.nome || ""}, ${v.cidade || ""} · ${pagaTexto(v)}`).join("<br>") }));
        if (querSMS) await enviarSMS(c.telefone, `Matchly: ${titulo}. Ex.: ${lista[0].titulo} (${pagaTexto(lista[0])}). Veja em ${SITE.replace(/^https?:\/\//, "")}`);
        await db(`candidatos?id=eq.${c.id}`, { method: "PATCH", body: { ultimo_resumo: new Date().toISOString() } });
        enviados++;
      }
      return sai(res, 200, { ok: true, enviados, vagas: vagas.length });
    }

    if (req.method !== "POST") return sai(res, 405, { erro: "Use POST." });
    if (excedeu(req, acao)) return sai(res, 429, { erro: "Muitas tentativas seguidas. Espere um pouco e tente de novo." });

    // ================================================================ entrar em outro aparelho
    if (acao === "entrar") {
      const tipo = PAPEIS.includes(d.papel) ? d.papel : null;
      const login = normalizaLogin(d.login);
      if (!tipo || !login) return sai(res, 400, { erro: "Digite o seu WhatsApp com DDD." });
      if (!senhaValida(d.senha)) return sai(res, 400, { erro: "A senha tem 6 números." });
      const [conta] = await db(`contas?select=id,dono_id,senha_hash,falhas,bloqueada_ate&login=eq.${encodeURIComponent(login)}&dono_tipo=eq.${tipo}&limit=1`);
      if (!conta) return sai(res, 404, { erro: tipo === "empresa" ? "Não achamos esse contato. Confira o número ou publique sua primeira vaga." : "Não achamos esse número. Confira ou faça o seu cadastro." });
      if (conta.bloqueada_ate && new Date(conta.bloqueada_ate) > new Date())
        return sai(res, 429, { erro: "Muitas senhas erradas. Por segurança, espere 15 minutos e tente de novo." });
      if (!confere(d.senha, conta.senha_hash)) {
        const falhas = (conta.falhas || 0) + 1;
        await db(`contas?id=eq.${conta.id}`, { method: "PATCH", body: falhas >= 5 ? { falhas: 0, bloqueada_ate: new Date(Date.now() + 15 * 60_000).toISOString() } : { falhas } });
        return sai(res, 401, { erro: falhas >= 5 ? "Muitas senhas erradas. Espere 15 minutos." : `Senha errada. Você ainda tem ${5 - falhas} tentativa(s).` });
      }
      await db(`contas?id=eq.${conta.id}`, { method: "PATCH", body: { falhas: 0, bloqueada_ate: null } });
      const token = await criarAcesso(tipo, conta.dono_id);
      if (tipo === "candidato") {
        const [c] = await db(`candidatos?select=nome,perfil&id=eq.${conta.dono_id}&limit=1`);
        return sai(res, 200, { token, nome: c?.nome, perfil: c?.perfil || {} });
      }
      const [e] = await db(`empresas?select=nome&id=eq.${conta.dono_id}&limit=1`);
      return sai(res, 200, { token, nome: e?.nome });
    }

    if (acao === "definir_senha") {
      const tipo = PAPEIS.includes(d.papel) ? d.papel : null;
      const dono = tipo ? await donoDoToken(d.token, tipo) : null;
      if (!dono) return sai(res, 401, { erro: "Acesso não encontrado." });
      const login = normalizaLogin(d.login);
      if (!login) return sai(res, 400, { erro: "Digite um WhatsApp com DDD (ou um e-mail)." });
      if (!senhaValida(d.senha)) return sai(res, 400, { erro: "A senha precisa ter 6 números." });
      try { await definirSenha(tipo, dono.id, login, d.senha); }
      catch (e) { if (e.status === 409) return sai(res, 409, { erro: "Esse número já é usado por outra conta." }); throw e; }
      return sai(res, 200, { ok: true, login });
    }

    // ================================================================ quem contrata
    if (acao === "publicar") {
      const c = d.contratante || {}, v = d.vaga || {};
      let empresa = null, token = null;
      if (d.token) {
        empresa = await empresaDoToken(d.token);
        if (!empresa) return sai(res, 401, { erro: "Seu acesso não foi encontrado. Entre com seu WhatsApp e senha." });
      }
      const titulo = limpa(v.titulo, 120);
      if (!titulo) return sai(res, 400, { erro: "Diga qual é a função ou o serviço." });
      if (!empresa) {
        const nome = limpa(c.nome, 160);
        if (!nome) return sai(res, 400, { erro: "Informe seu nome ou o nome da empresa." });
        const contato = limpa(c.contato, 160);
        const login = normalizaLogin(contato);
        if (!login) return sai(res, 400, { erro: "Informe um WhatsApp com DDD ou um e-mail." });
        if (d.senha !== undefined && !senhaValida(d.senha)) return sai(res, 400, { erro: "A senha precisa ter 6 números." });
        if (d.senha) {
          const [existe] = await db(`contas?select=id&login=eq.${encodeURIComponent(login)}&dono_tipo=eq.empresa&limit=1`);
          if (existe) return sai(res, 409, { erro: "Esse contato já tem conta. Toque em Entrar e use sua senha." });
        }
        const pessoa = c.tipo === "Pessoa";
        [empresa] = await db("empresas", { method: "POST", prefer: "return=representation", body: {
          nome, tipo: pessoa ? "pessoa" : "empresa",
          setor: pessoa ? "Contratante particular" : (limpa(c.setor, 80) || "Empresa"),
          cidade: limpa(c.cidade, 80) || null, uf: limpa(c.uf, 2).toUpperCase() || null,
          telefone: login.includes("@") ? null : contato, email_contato: login.includes("@") ? login : null,
          responsavel: pessoa ? nome : null, origem: "cadastro", verificada: false,
        } });
        token = await criarAcesso("empresa", empresa.id);
        if (d.senha) await definirSenha("empresa", empresa.id, login, d.senha);
      }
      const sMin = num(v.salario_min), sMax = num(v.salario_max);
      const descricao = limpa(v.descricao, 5000);
      const suspeita = PEDE_DINHEIRO.test(`${titulo} ${descricao}`);
      const [vaga] = await db("vagas", { method: "POST", prefer: "return=representation", body: {
        empresa_id: empresa.id, origem: "matchly", id_externo: crypto.randomUUID(), fonte_nome: "Matchly",
        titulo, descricao: descricao || null,
        cidade: limpa(v.cidade, 80) || empresa.cidade || null, uf: limpa(v.uf, 2).toUpperCase() || null,
        modelo: ["Presencial", "Híbrido", "Remoto"].includes(v.modelo) ? v.modelo : "Presencial",
        contrato: CONTRATOS.includes(v.contrato) ? v.contrato : "CLT",
        salario_min: sMin, salario_max: sMax !== null && sMin !== null && sMax < sMin ? sMin : sMax,
        unidade: UNIDADES.includes(v.unidade) ? v.unidade : "/mês",
        escolaridade: limpa(v.escolaridade, 40) || null, exige_experiencia: !!v.exige_experiencia,
        area: limpa(v.area, 60) || null, habilidades: lista(v.habilidades), beneficios: lista(v.beneficios, 15, 40),
        horarios: lista(v.horarios, 8, 30), particular: empresa.tipo === "pessoa", publicada_em: new Date().toISOString(), ativa: true,
        suspeita, motivos_suspeita: suspeita ? ["Pede pagamento do candidato"] : [],
      } });
      if (!suspeita) await avisarNovaVaga(vaga, empresa.nome);
      return sai(res, 201, { token, empresa: { id: empresa.id, nome: empresa.nome }, vaga, revisao: suspeita });
    }

    // ---------------------------------------------------------------- banco de talentos
    if (acao === "talentos" || acao === "convidar") {
      const empresa = await empresaDoToken(d.token);
      if (!empresa) return sai(res, 401, { erro: "Seu acesso não foi encontrado. Entre com seu WhatsApp e senha." });
      const minhasVagas = await db(`vagas?select=id,titulo,ativa&empresa_id=eq.${empresa.id}`);
      const ids = minhasVagas.map((v) => v.id);

      if (acao === "talentos") {
        const linhas = await db("candidatos?select=id,nome,cidade,perfil,atualizado_em&order=atualizado_em.desc&limit=400");
        const visiveis = linhas.filter((c) => c.perfil?.profile && c.perfil.visivel !== false);
        const cids = visiveis.map((c) => c.id);
        const notas = cids.length ? await db(`avaliacoes?select=candidato_id,nota&de=eq.empresa&candidato_id=in.(${cids.join(",")})&limit=20000`) : [];
        const ligacoes = ids.length && cids.length ? await db(`candidaturas?select=candidato_id,vaga_id,etapa&vaga_id=in.(${ids.join(",")})&limit=5000`) : [];
        const porNota = agrupar(notas, "candidato_id");
        // o contato só aparece quando a pessoa se candidata ou aceita o convite
        const semContato = (p) => {
          const { phone, email, ...resto } = p.profile || {};
          return { profile: { ...resto, referencias: (resto.referencias || []).map((r) => ({ nome: r.nome, relacao: r.relacao })) }, prefs: p.prefs || {} };
        };
        return sai(res, 200, { pessoas: visiveis.map((c) => ({
          id: c.id, nome: c.nome, cidade: c.cidade, atualizado_em: c.atualizado_em, perfil: semContato(c.perfil),
          nota: porNota[c.id] || null, ligacoes: ligacoes.filter((l) => l.candidato_id === c.id).map((l) => ({ vaga_id: l.vaga_id, etapa: l.etapa })),
        })) });
      }

      if (!uuid(d.candidatoId) || !ids.includes(d.vagaId)) return sai(res, 400, { erro: "Escolha uma das suas vagas." });
      const vaga = minhasVagas.find((v) => v.id === d.vagaId);
      if (!vaga.ativa) return sai(res, 400, { erro: "Essa vaga já foi encerrada." });
      const [cand] = await db(`candidatos?select=id,nome&id=eq.${d.candidatoId}&limit=1`);
      if (!cand) return sai(res, 404, { erro: "Pessoa não encontrada." });
      try {
        await db("candidaturas", { method: "POST", prefer: "return=minimal", body: { candidato_id: cand.id, vaga_id: vaga.id, etapa: "Convite", curriculo: {}, vista: true } });
      } catch (e) {
        if (e.status === 409) return sai(res, 409, { erro: "Essa pessoa já foi convidada ou já se candidatou a essa vaga." });
        throw e;
      }
      await avisarCandidato(cand.id, "respostas", { titulo: `${empresa.nome} convidou você`, texto: `Para a vaga de ${vaga.titulo}. Abra o Matchly para ver e responder.`, botao: "Ver o convite" });
      return sai(res, 201, { ok: true });
    }

    if (["painel", "etapa", "vista", "encerrar"].includes(acao)) {
      const empresa = await empresaDoToken(d.token);
      if (!empresa) return sai(res, 401, { erro: "Seu acesso não foi encontrado. Entre com seu WhatsApp e senha." });
      const vagas = await db(`vagas?select=id,titulo,cidade,uf,modelo,contrato,salario_min,salario_max,unidade,habilidades,area,escolaridade,exige_experiencia,descricao,ativa,suspeita,publicada_em,particular,horarios&empresa_id=eq.${empresa.id}&order=publicada_em.desc.nullslast`);
      const ids = vagas.map((v) => v.id);

      if (acao === "painel") {
        const candidaturas = ids.length
          ? await db(`candidaturas?select=id,vaga_id,candidato_id,etapa,mensagem,curriculo,vista,criada_em,atualizada_em,candidatos(id,nome,cidade)&vaga_id=in.(${ids.join(",")})&order=criada_em.desc&limit=2000`)
          : [];
        const cids = [...new Set(candidaturas.map((c) => c.candidato_id))];
        const notasCand = cids.length ? await db(`avaliacoes?select=candidato_id,nota&de=eq.empresa&candidato_id=in.(${cids.join(",")})&limit=20000`) : [];
        const dadas = await db(`avaliacoes?select=candidatura_id,nota&de=eq.empresa&empresa_id=eq.${empresa.id}&limit=5000`);
        const recebidas = await db(`avaliacoes?select=nota&de=eq.candidato&empresa_id=eq.${empresa.id}&limit=5000`);
        const [conta] = await db(`contas?select=login&dono_tipo=eq.empresa&dono_id=eq.${empresa.id}&limit=1`);
        const notaCand = agrupar(notasCand, "candidato_id");
        const dadaPor = Object.fromEntries(dadas.map((a) => [a.candidatura_id, a.nota]));
        return sai(res, 200, {
          empresa: { id: empresa.id, nome: empresa.nome, tipo: empresa.tipo, cidade: empresa.cidade, verificada: empresa.verificada },
          conta: conta ? { login: conta.login } : null, avaliacao: resumo(recebidas.map((a) => a.nota)),
          vagas, candidaturas: candidaturas.map((c) => ({ ...c, nota_candidato: notaCand[c.candidato_id] || null, minha_avaliacao: dadaPor[c.id] || null })),
        });
      }
      if (acao === "encerrar") {
        if (!ids.includes(d.vagaId)) return sai(res, 404, { erro: "Vaga não encontrada." });
        await db(`vagas?id=eq.${d.vagaId}`, { method: "PATCH", body: { ativa: false } });
        return sai(res, 200, { ok: true });
      }
      if (!ids.length) return sai(res, 404, { erro: "Candidatura não encontrada." });
      if (acao === "vista") {
        const alvo = (Array.isArray(d.ids) ? d.ids : []).filter(uuid).slice(0, 200);
        if (alvo.length) {
          const marcadas = await db(`candidaturas?id=in.(${alvo.join(",")})&vaga_id=in.(${ids.join(",")})&vista=eq.false`, { method: "PATCH", prefer: "return=representation", body: { vista: true } });
          for (const c of marcadas) {
            const v = vagas.find((x) => x.id === c.vaga_id);
            await avisar("candidato", c.candidato_id, { title: `${empresa.nome} viu seu currículo`, body: `Vaga: ${v?.titulo || ""}`, url: "/#candidaturas" });
          }
        }
        return sai(res, 200, { ok: true });
      }
      if (acao === "etapa") {
        if (!uuid(d.id) || !ETAPAS.includes(d.etapa)) return sai(res, 400, { erro: "Dados inválidos." });
        const r = await db(`candidaturas?id=eq.${d.id}&vaga_id=in.(${ids.join(",")})`, { method: "PATCH", prefer: "return=representation",
          body: { etapa: d.etapa, vista: true, atualizada_em: new Date().toISOString() } });
        if (!r.length) return sai(res, 404, { erro: "Candidatura não encontrada." });
        const v = vagas.find((x) => x.id === r[0].vaga_id);
        const textos = { Entrevista: [`${empresa.nome} quer conversar com você`, "Fique de olho no seu WhatsApp."],
          Proposta: [`${empresa.nome} quer contratar você!`, "Abra o Matchly para aceitar ou recusar a proposta."],
          Contratada: [`Você foi contratado(a) por ${empresa.nome}!`, "Depois do serviço, conte como foi: avalie a empresa no Matchly."],
          Recusada: [`${empresa.nome} seguiu com outra pessoa`, "Continue se candidatando. Outras vagas vão aparecer."] };
        if (textos[d.etapa]) await avisarCandidato(r[0].candidato_id, "respostas", { titulo: textos[d.etapa][0], texto: `${v?.titulo ? `Vaga: ${v.titulo}. ` : ""}${textos[d.etapa][1]}` });
        return sai(res, 200, { ok: true, candidatura: r[0] });
      }
    }

    // ================================================================ quem procura trabalho
    if (acao === "cadastro") {
      const p = d.perfil && typeof d.perfil === "object" ? d.perfil : {};
      if (JSON.stringify(p).length > 100_000) return sai(res, 400, { erro: "Perfil grande demais." });
      const nome = limpa(p.profile?.name, 120);
      if (!nome) return sai(res, 400, { erro: "Falta o seu nome." });
      const login = normalizaLogin(d.login || p.profile?.phone);
      if (d.senha && (!login || !senhaValida(d.senha))) return sai(res, 400, { erro: "Confira o WhatsApp e a senha de 6 números." });
      if (d.senha) {
        const [existe] = await db(`contas?select=id&login=eq.${encodeURIComponent(login)}&dono_tipo=eq.candidato&limit=1`);
        if (existe) return sai(res, 409, { erro: "Esse WhatsApp já tem cadastro no Matchly. Toque em Entrar e use a sua senha." });
      }
      const [c] = await db("candidatos", { method: "POST", prefer: "return=representation", body: {
        nome, telefone: limpa(p.profile?.phone, 30) || null, cidade: limpa(p.profile?.city, 80) || null, perfil: p, curriculo: {},
      } });
      const token = await criarAcesso("candidato", c.id);
      if (d.senha) await definirSenha("candidato", c.id, login, d.senha);
      return sai(res, 201, { token, conta: !!d.senha });
    }

    if (acao === "salvar_perfil") {
      const c = await candidatoDoToken(d.token);
      if (!c) return sai(res, 401, { erro: "Acesso não encontrado." });
      const p = d.perfil && typeof d.perfil === "object" ? d.perfil : null;
      if (!p || JSON.stringify(p).length > 100_000) return sai(res, 400, { erro: "Perfil inválido." });
      await db(`candidatos?id=eq.${c.id}`, { method: "PATCH", body: { perfil: p, nome: limpa(p.profile?.name, 120) || c.nome,
        telefone: limpa(p.profile?.phone, 30) || null, cidade: limpa(p.profile?.city, 80) || null, atualizado_em: new Date().toISOString() } });
      return sai(res, 200, { ok: true });
    }

    if (acao === "candidatar") {
      if (!uuid(d.vagaId)) return sai(res, 400, { erro: "Vaga inválida." });
      const [vaga] = await db(`vagas?select=id,titulo,origem,ativa,suspeita,empresa_id,empresas(nome,email_contato)&id=eq.${d.vagaId}&limit=1`);
      if (!vaga || !vaga.ativa || vaga.suspeita) return sai(res, 404, { erro: "Esta vaga não está mais no ar." });
      if (vaga.origem !== "matchly") return sai(res, 400, { erro: "Esta vaga recebe candidaturas no site da empresa." });
      const curriculo = d.curriculo && typeof d.curriculo === "object" ? d.curriculo : {};
      if (JSON.stringify(curriculo).length > 80_000) return sai(res, 400, { erro: "Currículo grande demais." });
      const c = d.candidato || {};
      const nome = limpa(c.nome || curriculo.nome, 120);
      if (!nome) return sai(res, 400, { erro: "Falta o seu nome no currículo." });

      let candidato = d.token ? await candidatoDoToken(d.token) : null, token = null;
      const dados = { nome, telefone: limpa(c.telefone || curriculo.tel, 30) || null, cidade: limpa(c.cidade || curriculo.cidade, 80) || null,
        curriculo, atualizado_em: new Date().toISOString() };
      if (candidato) await db(`candidatos?id=eq.${candidato.id}`, { method: "PATCH", body: dados });
      else {
        [candidato] = await db("candidatos", { method: "POST", prefer: "return=representation", body: dados });
        token = await criarAcesso("candidato", candidato.id);
      }
      try {
        // se a empresa tinha convidado, a candidatura é o "sim" ao convite
        const [convite] = await db(`candidaturas?select=id,etapa&candidato_id=eq.${candidato.id}&vaga_id=eq.${vaga.id}&limit=1`);
        let cand;
        if (convite && ["Convite", "Convite recusado"].includes(convite.etapa)) {
          [cand] = await db(`candidaturas?id=eq.${convite.id}`, { method: "PATCH", prefer: "return=representation", body: {
            curriculo, mensagem: limpa(d.mensagem, 600) || null, etapa: "Candidatura enviada", vista: false, criada_em: new Date().toISOString(), atualizada_em: new Date().toISOString() } });
        } else {
          [cand] = await db("candidaturas", { method: "POST", prefer: "return=representation", body: {
            candidato_id: candidato.id, vaga_id: vaga.id, curriculo, mensagem: limpa(d.mensagem, 600) || null,
          } });
        }
        const primeiro = nome.split(" ")[0];
        await avisar("empresa", vaga.empresa_id, { title: `Nova candidatura: ${primeiro}`, body: `Para a vaga de ${vaga.titulo}. Toque para ver o currículo.`, url: "/#area" });
        await avisarEmpresaPorEmail(vaga.empresa_id, `Nova candidatura para ${vaga.titulo}`, `${primeiro} enviou o currículo para a vaga <b>${vaga.titulo}</b>.`);
        await avisarCandidato(candidato.id, "candidatura", { titulo: "Candidatura enviada!", texto: `Seu currículo foi para ${vaga.empresas?.nome || "a empresa"}, vaga de ${vaga.titulo}. Avisamos quando responderem.`, botao: "Acompanhar candidatura" });
        return sai(res, 201, { token, candidatura: { id: cand.id, etapa: cand.etapa, criada_em: cand.criada_em } });
      } catch (e) {
        if (e.status === 409) return sai(res, 409, { token, erro: "Você já se candidatou a esta vaga." });
        throw e;
      }
    }

    // o trabalhador responde à proposta de contratação
    if (acao === "responder_proposta") {
      const candidato = await candidatoDoToken(d.token);
      if (!candidato || !uuid(d.id)) return sai(res, 401, { erro: "Acesso não encontrado." });
      const novo = d.aceitar ? "Contratada" : "Proposta recusada";
      const r = await db(`candidaturas?id=eq.${d.id}&candidato_id=eq.${candidato.id}&etapa=eq.Proposta`, { method: "PATCH", prefer: "return=representation",
        body: { etapa: novo, atualizada_em: new Date().toISOString() } });
      if (!r.length) return sai(res, 409, { erro: "Essa proposta não está mais disponível." });
      const [v] = await db(`vagas?select=titulo,empresa_id&id=eq.${r[0].vaga_id}&limit=1`);
      const primeiro = String(candidato.nome || "").split(" ")[0];
      if (v) {
        const titulo = d.aceitar ? `${primeiro} aceitou a sua proposta!` : `${primeiro} recusou a proposta`;
        const texto = d.aceitar ? `Para a vaga de ${v.titulo}. Combine os detalhes pelo WhatsApp. Depois do serviço, avalie no Matchly.` : `Para a vaga de ${v.titulo}. Você pode procurar outras pessoas em Encontrar pessoas.`;
        await avisar("empresa", v.empresa_id, { title: titulo, body: texto, url: "/#area" });
        await avisarEmpresaPorEmail(v.empresa_id, titulo, texto);
      }
      return sai(res, 200, { ok: true, etapa: novo });
    }

    if (acao === "recusar_convite") {
      const candidato = await candidatoDoToken(d.token);
      if (!candidato || !uuid(d.id)) return sai(res, 401, { erro: "Acesso não encontrado." });
      await db(`candidaturas?id=eq.${d.id}&candidato_id=eq.${candidato.id}&etapa=eq.Convite`, { method: "PATCH", body: { etapa: "Convite recusado", atualizada_em: new Date().toISOString() } });
      return sai(res, 200, { ok: true });
    }

    if (acao === "minhas") {
      const candidato = await candidatoDoToken(d.token);
      if (!candidato) return sai(res, 401, { erro: "Acesso não encontrado." });
      const candidaturas = await db(`candidaturas?select=id,vaga_id,etapa,vista,criada_em,atualizada_em,vagas(titulo,empresa_id,empresas(nome))&candidato_id=eq.${candidato.id}&order=criada_em.desc`);
      const dadas = await db(`avaliacoes?select=candidatura_id,nota&de=eq.candidato&candidato_id=eq.${candidato.id}&limit=2000`);
      const [conta] = await db(`contas?select=login&dono_tipo=eq.candidato&dono_id=eq.${candidato.id}&limit=1`);
      const dadaPor = Object.fromEntries(dadas.map((a) => [a.candidatura_id, a.nota]));
      return sai(res, 200, { conta: conta ? { login: conta.login } : null,
        candidaturas: candidaturas.map((c) => ({ id: c.id, vaga_id: c.vaga_id, etapa: c.etapa, vista: c.vista, criada_em: c.criada_em, atualizada_em: c.atualizada_em,
          vaga: c.vagas?.titulo || "", empresa: c.vagas?.empresas?.nome || "", minha_avaliacao: dadaPor[c.id] || null })) });
    }

    // ================================================================ avaliações (só depois de contratar)
    if (acao === "avaliar") {
      const tipo = PAPEIS.includes(d.papel) ? d.papel : null;
      const dono = tipo ? await donoDoToken(d.token, tipo) : null;
      if (!dono) return sai(res, 401, { erro: "Acesso não encontrado." });
      const nota = Math.round(Number(d.nota));
      if (!uuid(d.candidaturaId) || !(nota >= 1 && nota <= 5)) return sai(res, 400, { erro: "Escolha de 1 a 5 estrelas." });
      const [c] = await db(`candidaturas?select=id,etapa,candidato_id,vagas(empresa_id)&id=eq.${d.candidaturaId}&limit=1`);
      const empresaId = c?.vagas?.empresa_id;
      if (!c || (tipo === "candidato" && c.candidato_id !== dono.id) || (tipo === "empresa" && empresaId !== dono.id))
        return sai(res, 404, { erro: "Candidatura não encontrada." });
      if (c.etapa !== "Contratada") return sai(res, 400, { erro: "Dá para avaliar depois que a contratação acontece." });
      await db("avaliacoes?on_conflict=candidatura_id,de", { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: [{
        candidatura_id: c.id, de: tipo, empresa_id: empresaId, candidato_id: c.candidato_id, nota, comentario: limpa(d.comentario, 400) || null,
      }] });
      return sai(res, 200, { ok: true });
    }

    // ================================================================ avisos no celular
    if (acao === "inscrever") {
      const tipo = PAPEIS.includes(d.papel) ? d.papel : null;
      const dono = tipo ? await donoDoToken(d.token, tipo) : null;
      if (!dono) return sai(res, 401, { erro: "Acesso não encontrado." });
      const i = d.inscricao || {};
      if (!/^https:\/\//.test(i.endpoint || "") || !i.keys?.p256dh || !i.keys?.auth) return sai(res, 400, { erro: "Inscrição inválida." });
      await db("push_inscricoes?on_conflict=endpoint", { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: [{
        endpoint: String(i.endpoint).slice(0, 1000), p256dh: limpa(i.keys.p256dh, 200), auth: limpa(i.keys.auth, 100), dono_tipo: tipo, dono_id: dono.id,
      }] });
      await avisar(tipo, dono.id, { title: "Avisos ligados", body: tipo === "empresa" ? "Você vai saber na hora quando chegar um currículo." : "Você vai saber na hora quando uma empresa responder.", url: tipo === "empresa" ? "/#area" : "/#candidaturas" });
      return sai(res, 200, { ok: true });
    }

    return sai(res, 404, { erro: "Ação desconhecida." });
  } catch (e) {
    console.error(acao, e.status, e.message);
    return sai(res, 500, { erro: "Não foi possível concluir agora. Tente de novo em alguns minutos." });
  }
}
