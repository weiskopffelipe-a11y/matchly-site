// =====================================================================
// MATCHLY — /api/app  (vagas, candidaturas e área de quem contrata)
// Roda na Vercel com a chave secreta do Supabase, que nunca vai para o navegador.
//
//   GET  /api/app?acao=status        → o banco está ligado?
//   GET  /api/app?acao=vagas         → vagas no ar (para o feed)
//   POST /api/app?acao=publicar      → quem contrata publica uma vaga (cria o acesso na primeira vez)
//   POST /api/app?acao=painel        → candidaturas recebidas (quem contrata)
//   POST /api/app?acao=etapa         → quem contrata muda a etapa de uma candidatura
//   POST /api/app?acao=vista         → marca candidaturas como vistas
//   POST /api/app?acao=encerrar      → tira uma vaga do ar
//   POST /api/app?acao=candidatar    → o trabalhador envia o currículo para uma vaga
//   POST /api/app?acao=minhas        → o trabalhador vê em que etapa estão as candidaturas dele
//
// Acesso sem senha: cada contratante e cada trabalhador recebe uma chave aleatória
// (guardada no aparelho). No banco fica só o "hash" dela.
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

const hash = (t) => crypto.createHash("sha256").update(String(t)).digest("hex");
const novoToken = () => crypto.randomBytes(24).toString("base64url");
const limpa = (s, n = 300) => String(s ?? "").replace(/[<>]/g, "").trim().slice(0, n);
const lista = (a, n = 20, m = 60) => (Array.isArray(a) ? a.slice(0, n).map((x) => limpa(x, m)).filter(Boolean) : []);
const num = (v) => { const x = Number(v); return Number.isFinite(x) && x >= 0 && x < 1e7 ? x : null; };
const uuid = (v) => /^[0-9a-f-]{36}$/i.test(String(v || ""));

const CONTRATOS = ["CLT", "PJ", "Temporário", "Estágio", "Aprendiz", "Freelancer", "Diária", "Por hora"];
const UNIDADES = ["/hora", "/dia", "/mês"];
const ETAPAS = ["Candidatura enviada", "Entrevista", "Contratada", "Recusada"];
// vaga que pede dinheiro do candidato vai para revisão em vez de ir ao ar
const PEDE_DINHEIRO = /(pagar|pague|pagamento|taxa|dep[oó]sito|pix|boleto|investimento).{0,40}(inscri|curso|material|uniforme|cadastro|exame|kit|treinamento|vaga)/i;

// limite simples contra abuso (por instância): N chamadas por IP e por ação a cada hora
const usos = new Map();
const LIMITES = { publicar: 20, candidatar: 40, etapa: 600, vista: 600, encerrar: 60, painel: 2000, minhas: 400 };
function excedeu(req, acao) {
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  const k = `${acao}:${ip}`;
  const janela = (usos.get(k) || []).filter((t) => Date.now() - t < 3600_000);
  janela.push(Date.now()); usos.set(k, janela);
  return janela.length > (LIMITES[acao] || 200);
}

async function empresaDoToken(token) {
  if (!token || String(token).length < 20) return null;
  const r = await db(`empresas?select=id,nome,tipo,setor,cidade,uf,logo_url,verificada&token_hash=eq.${hash(token)}&limit=1`);
  return r[0] || null;
}
async function candidatoDoToken(token) {
  if (!token || String(token).length < 20) return null;
  const r = await db(`candidatos?select=id,nome&token_hash=eq.${hash(token)}&limit=1`);
  return r[0] || null;
}

const sai = (res, status, dados) => res.status(status).json(dados);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const acao = String(req.query?.acao || "");
  if (!SUPA || !CHAVE) return sai(res, 503, { erro: "Banco de dados ainda não configurado.", banco: false });

  let d = req.body;
  if (typeof d === "string") { try { d = JSON.parse(d); } catch { d = null; } }
  d = d && typeof d === "object" ? d : {};

  try {
    // ------------------------------------------------------------------ leitura pública
    if (acao === "status") {
      const ok = await db("candidatos?select=id&limit=1").then(() => true).catch(() => false);
      return sai(res, 200, { banco: true, tabelas: ok });
    }

    if (acao === "vagas") {
      const rows = await db("vagas?select=id,empresa_id,origem,titulo,descricao,cidade,uf,modelo,contrato,salario_min,salario_max,unidade,escolaridade,exige_experiencia,area,habilidades,beneficios,url,fonte_nome,publicada_em,coletada_em,particular," +
        "empresas(id,nome,dominio,site,logo_url,setor,cidade,uf,tamanho,descricao,beneficios,verificada,tipo)" +
        "&ativa=eq.true&suspeita=eq.false&order=publicada_em.desc.nullslast&limit=1500");
      let total = 0;
      try {
        const r = await fetch(`${SUPA}/rest/v1/empresas?select=id&limit=1`, { headers: { ...cabecalhoChave(CHAVE), Prefer: "count=exact" } });
        total = +(r.headers.get("content-range") || "").split("/")[1] || 0;
      } catch { /* só informativo */ }
      res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=60");
      return sai(res, 200, { vagas: rows, empresas: total });
    }

    if (req.method !== "POST") return sai(res, 405, { erro: "Use POST." });
    if (excedeu(req, acao)) return sai(res, 429, { erro: "Muitas tentativas seguidas. Espere um pouco e tente de novo." });

    // ------------------------------------------------------------------ quem contrata
    if (acao === "publicar") {
      const c = d.contratante || {}, v = d.vaga || {};
      let empresa = null, token = null;
      if (d.token) {
        empresa = await empresaDoToken(d.token);
        if (!empresa) return sai(res, 401, { erro: "Seu acesso não foi encontrado. Abra de novo o link de acesso que você guardou." });
      }
      const titulo = limpa(v.titulo, 120);
      if (!titulo) return sai(res, 400, { erro: "Diga qual é a função ou o serviço." });
      if (!empresa) {
        const nome = limpa(c.nome, 160);
        if (!nome) return sai(res, 400, { erro: "Informe seu nome ou o nome da empresa." });
        if (!limpa(c.contato)) return sai(res, 400, { erro: "Informe um telefone ou e-mail de contato." });
        const pessoa = c.tipo === "Pessoa";
        token = novoToken();
        const contato = limpa(c.contato, 160);
        [empresa] = await db("empresas", { method: "POST", prefer: "return=representation", body: {
          nome, tipo: pessoa ? "pessoa" : "empresa",
          setor: pessoa ? "Contratante particular" : (limpa(c.setor, 80) || "Empresa"),
          cidade: limpa(c.cidade, 80) || null, uf: limpa(c.uf, 2).toUpperCase() || null,
          telefone: /@/.test(contato) ? null : contato, email_contato: /@/.test(contato) ? contato : null,
          responsavel: pessoa ? nome : null, origem: "cadastro", verificada: false, token_hash: hash(token),
        } });
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
        particular: empresa.tipo === "pessoa", publicada_em: new Date().toISOString(), ativa: true,
        suspeita, motivos_suspeita: suspeita ? ["Pede pagamento do candidato"] : [],
      } });
      return sai(res, 201, { token, empresa, vaga, revisao: suspeita });
    }

    if (["painel", "etapa", "vista", "encerrar"].includes(acao)) {
      const empresa = await empresaDoToken(d.token);
      if (!empresa) return sai(res, 401, { erro: "Seu acesso não foi encontrado. Abra de novo o link de acesso que você guardou." });
      const vagas = await db(`vagas?select=id,titulo,cidade,uf,modelo,contrato,salario_min,salario_max,unidade,habilidades,area,escolaridade,exige_experiencia,descricao,ativa,suspeita,publicada_em,particular&empresa_id=eq.${empresa.id}&order=publicada_em.desc.nullslast`);
      const ids = vagas.map((v) => v.id);

      if (acao === "painel") {
        const candidaturas = ids.length
          ? await db(`candidaturas?select=id,vaga_id,etapa,mensagem,curriculo,vista,criada_em,atualizada_em,candidatos(id,nome,cidade)&vaga_id=in.(${ids.join(",")})&order=criada_em.desc&limit=2000`)
          : [];
        return sai(res, 200, { empresa, vagas, candidaturas });
      }
      if (acao === "encerrar") {
        if (!ids.includes(d.vagaId)) return sai(res, 404, { erro: "Vaga não encontrada." });
        await db(`vagas?id=eq.${d.vagaId}`, { method: "PATCH", body: { ativa: false } });
        return sai(res, 200, { ok: true });
      }
      if (!ids.length) return sai(res, 404, { erro: "Candidatura não encontrada." });
      if (acao === "vista") {
        const alvo = (Array.isArray(d.ids) ? d.ids : []).filter(uuid).slice(0, 200);
        if (alvo.length) await db(`candidaturas?id=in.(${alvo.join(",")})&vaga_id=in.(${ids.join(",")})`, { method: "PATCH", body: { vista: true } });
        return sai(res, 200, { ok: true });
      }
      if (acao === "etapa") {
        if (!uuid(d.id) || !ETAPAS.includes(d.etapa)) return sai(res, 400, { erro: "Dados inválidos." });
        const r = await db(`candidaturas?id=eq.${d.id}&vaga_id=in.(${ids.join(",")})`, { method: "PATCH", prefer: "return=representation",
          body: { etapa: d.etapa, vista: true, atualizada_em: new Date().toISOString() } });
        if (!r.length) return sai(res, 404, { erro: "Candidatura não encontrada." });
        return sai(res, 200, { ok: true, candidatura: r[0] });
      }
    }

    // ------------------------------------------------------------------ quem procura trabalho
    if (acao === "candidatar") {
      if (!uuid(d.vagaId)) return sai(res, 400, { erro: "Vaga inválida." });
      const [vaga] = await db(`vagas?select=id,origem,ativa,suspeita&id=eq.${d.vagaId}&limit=1`);
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
        token = novoToken();
        [candidato] = await db("candidatos", { method: "POST", prefer: "return=representation", body: { ...dados, token_hash: hash(token) } });
      }
      try {
        const [cand] = await db("candidaturas", { method: "POST", prefer: "return=representation", body: {
          candidato_id: candidato.id, vaga_id: vaga.id, curriculo, mensagem: limpa(d.mensagem, 600) || null,
        } });
        return sai(res, 201, { token, candidatura: { id: cand.id, etapa: cand.etapa, criada_em: cand.criada_em } });
      } catch (e) {
        if (e.status === 409) return sai(res, 409, { token, erro: "Você já se candidatou a esta vaga." });
        throw e;
      }
    }

    if (acao === "minhas") {
      const candidato = await candidatoDoToken(d.token);
      if (!candidato) return sai(res, 401, { erro: "Acesso não encontrado." });
      const candidaturas = await db(`candidaturas?select=id,vaga_id,etapa,vista,criada_em,atualizada_em&candidato_id=eq.${candidato.id}&order=criada_em.desc`);
      return sai(res, 200, { candidaturas });
    }

    return sai(res, 404, { erro: "Ação desconhecida." });
  } catch (e) {
    console.error(acao, e.status, e.message);
    return sai(res, 500, { erro: "Não foi possível concluir agora. Tente de novo em alguns minutos." });
  }
}
