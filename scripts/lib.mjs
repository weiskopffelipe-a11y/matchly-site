// =====================================================================
// MATCHLY — funções compartilhadas pelo robô de coleta e pelo importador
// Roda em Node 20+ (GitHub Actions). Não precisa instalar nada.
// =====================================================================
import crypto from "node:crypto";

export const ENV = process.env;
export const SITE = ENV.SITE_URL || "https://matchly.com.br";
export const UA = `MatchlyBot/1.0 (+${SITE}/robo; vagas para o portal Matchly)`;
export const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------- Supabase -------------------------------
const SUPA = (ENV.SUPABASE_URL || "").replace(/\/$/, "");
const CHAVE = ENV.SUPABASE_SERVICE_KEY || "";
// Chaves novas do Supabase (sb_secret_…) vão só no cabeçalho "apikey"; as antigas (eyJ…) também no Authorization
export const cabecalhoChave = (k) => (k.startsWith("eyJ") ? { apikey: k, Authorization: `Bearer ${k}` } : { apikey: k });
export function exigirSupabase() {
  if (!SUPA || !CHAVE) {
    console.error("Faltam SUPABASE_URL e SUPABASE_SERVICE_KEY. Cadastre os dois em Settings → Secrets → Actions do GitHub.");
    process.exit(1);
  }
}
export async function db(caminho, { method = "GET", body, prefer, headers = {} } = {}) {
  for (let tentativa = 1; ; tentativa++) {
    const r = await fetch(`${SUPA}/rest/v1/${caminho}`, {
      method,
      headers: { ...cabecalhoChave(CHAVE), "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (r.ok) { const t = await r.text(); return t ? JSON.parse(t) : null; }
    const erro = await r.text();
    if ((r.status >= 500 || r.status === 429) && tentativa < 4) { await dormir(1500 * tentativa); continue; }
    throw new Error(`Supabase ${method} ${caminho.split("?")[0]} → ${r.status}: ${erro.slice(0, 300)}`);
  }
}
// lista para filtros "in.(...)" do PostgREST
export const lista = (vals) => `(${vals.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(",")})`;
export const pedacos = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

// ------------------------------ HTTP educado ------------------------------
const ultimoAcesso = new Map();   // um pedido por segundo por site, no máximo
export async function baixar(url, { tipo = "texto", timeout = 15000, metodo = "GET", corpo, headers = {} } = {}) {
  const host = new URL(url).host;
  const espera = (ultimoAcesso.get(host) || 0) + 1000 - Date.now();
  if (espera > 0) await dormir(espera);
  ultimoAcesso.set(host, Date.now());
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, {
      method: metodo, signal: ctrl.signal, redirect: "follow",
      headers: { "User-Agent": UA, Accept: tipo === "json" ? "application/json" : "text/html,application/xhtml+xml", "Accept-Language": "pt-BR,pt;q=0.9", ...headers },
      body: corpo,
    });
    if (!r.ok) { const e = new Error(`HTTP ${r.status} em ${host}`); e.status = r.status; throw e; }
    const tam = +(r.headers.get("content-length") || 0);
    if (tam > 6_000_000) throw new Error(`Página grande demais em ${host}`);
    return tipo === "json" ? await r.json() : await r.text();
  } finally { clearTimeout(t); }
}

// robots.txt: o robô só lê o que o site permite
const robotsCache = new Map();
export async function permitido(url) {
  const u = new URL(url);
  if (!robotsCache.has(u.origin)) {
    let regras = [];
    try {
      const txt = await baixar(`${u.origin}/robots.txt`, { timeout: 8000 });
      // grupos: linhas "User-agent" seguidas valem para as regras logo abaixo
      let ativo = false, lendoAgentes = false;
      for (const linha of txt.split(/\r?\n/)) {
        const [k, ...resto] = linha.replace(/#.*/, "").split(":");
        const chave = (k || "").trim().toLowerCase(), valor = resto.join(":").trim();
        if (!chave) continue;
        if (chave === "user-agent") {
          if (!lendoAgentes) ativo = false;
          const ag = valor.toLowerCase();
          ativo = ativo || ag === "*" || ag.includes("matchlybot");
          lendoAgentes = true;
        } else {
          lendoAgentes = false;
          if (ativo && (chave === "disallow" || chave === "allow") && valor) regras.push({ permitir: chave === "allow", prefixo: valor });
        }
      }
    } catch (e) { if (e.status >= 500) regras = [{ permitir: false, prefixo: "/" }]; } // robots indisponível por erro do servidor: não arrisca
    robotsCache.set(u.origin, regras);
  }
  const caminho = u.pathname + u.search;
  let melhor = null;
  for (const r of robotsCache.get(u.origin)) {
    const re = new RegExp("^" + r.prefixo.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
    if (re.test(caminho) && (!melhor || r.prefixo.length > melhor.prefixo.length)) melhor = r;
  }
  return !melhor || melhor.permitir;
}

// ------------------------------ Texto ------------------------------------
export const norm = (s) => (s || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
export const hash = (...p) => crypto.createHash("sha1").update(p.map(norm).join("|")).digest("hex");
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", ccedil: "ç", atilde: "ã", otilde: "õ", aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", acirc: "â", ecirc: "ê", ocirc: "ô", agrave: "à" };
export const desentidade = (s) => (s || "").replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m);
export function semHtml(html) {
  return desentidade(desentidade(html || ""))
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|li|h\d|br|tr)>|<br\s*\/?>/gi, "\n").replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();
}
export const corta = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");

// ------------------------- Classificação por regras -----------------------
// As mesmas áreas e habilidades que o site usa para calcular a compatibilidade.
const AREA_KEYS = {
  "Alimentação": ["cozinh", "chapa", "chapeir", "lanch", "fast food", "padar", "padeir", "garco", "garcom", "garconete", "restaurant", "aliment", "confeit", "pizz", "salgad", "copeir", "barista"],
  "Atendimento": ["atend", "operador de caixa", "operadora de caixa", "recepc", "recepcion", "telemarketing", "balcao", "sac ", "call center"],
  "Varejo": ["repositor", "estoqu", "empacot", "supermercado", "fiscal de loja", "conferente"],
  "Vendas": ["vendedor", "vendas", "consultor de vendas", "promotor", "representante comercial"],
  "Logística": ["motorist", "entregad", "carga", "descarga", "almoxarif", "galpao", "delivery", "armazem", "motoboy", "logistic", "separador", "operador de empilhadeira"],
  "Serviços": ["limpeza", "faxin", "diarist", "lavand", "jardin", "zelad", "servicos gerais", "camareir", "passeador"],
  "Portaria": ["porteir", "portaria", "vigia", "controlador de acesso", "vigilante"],
  "Construção": ["pedreir", "servente", "obra", "pintor", "eletricist", "encanad", "construc", "mestre de obras", "carpinteir"],
  "Cuidados": ["cuidador", "baba", "idoso", "tecnico de enfermagem", "auxiliar de enfermagem", "acompanhante"],
  "Administrativo": ["administr", "escritorio", "assistente adm", "auxiliar adm", "aprendiz", "recursos humanos", "financeir", "faturamento"],
  "Produção": ["producao", "fabrica", "operador de maquina", "costur", "embalag", "montador", "metalurg", "ajudante geral"],
  "Dados": ["dados", "analista de bi", "business intelligence", "cientista de dados"],
  "Produto": ["product manager", "product owner", "produto digital"],
  "Marketing": ["marketing", "midia", "social media"],
};
const SKILL_KEYS = {
  "Atendimento ao cliente": ["atend", "cliente", "balcao", "recepc"], "Vendas": ["vend", "metas", "comissao"], "Organização": ["organiz"],
  "Preparo de alimentos": ["cozinh", "lanche", "chapa", "preparo"], "Higiene e manipulação de alimentos": ["manipulac", "boas praticas"],
  "Controle de estoque": ["estoque", "reposic", "conferenc", "inventario"], "Esforço físico": ["carregar", "carga e descarga", "peso", "esforco fisico"],
  "Cuidados básicos de saúde": ["medicac", "acamad", "curativo", "sinais vitais"], "Paciência": ["crianca", "idoso"], "Pequenos reparos": ["manutenc", "reparo"],
  "CNH B": ["cnh b", "cnh ab", "categoria b"], "CNH A": ["cnh a ", "cnh a,", "moto propria", "motocicleta"], "CNH D": ["cnh d", "categoria d"],
  "Informática básica": ["pacote office", "informatica basica", "computador"], "Excel": ["excel", "planilha"], "Comunicação": ["comunicac", "telefone"],
  "Trabalho em equipe": ["trabalho em equipe", "trabalhar em equipe"], "Segurança do trabalho": ["epi", "nr-", "seguranca do trabalho"],
  "Agilidade": ["agilidade", "dinamismo"], "Responsabilidade": ["responsab", "pontualidade", "comprometimento"],
  "SQL": ["sql"], "Power BI": ["power bi"], "Python": ["python"],
};
const ESCOLA = [
  [/(nao (e )?(exig|necessari|precis)\w*|sem exigencia de|independente de) (escolaridade|estudo)/, "Não estudei"],
  [/(superior|graduac|bacharel|tecnolog)[^.\n]{0,25}(complet|conclu)/, "Graduação"], [/ensino superior|graduac|faculdade/, "Graduação"],
  [/curso tecnico|tecnico em /, "Técnico"],
  [/(ensino )?medio (complet|conclu)|2[ºo°] grau completo/, "Médio"], [/(ensino )?medio (incomplet|cursando)/, "Médio incompleto"], [/ensino medio/, "Médio"],
  [/fundamental (complet|conclu)/, "Fundamental"], [/fundamental (incomplet|cursando)|alfabetizad/, "Fundamental incompleto"], [/ensino fundamental/, "Fundamental"],
];
const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
const ESTADOS = { "sao paulo": "SP", "rio de janeiro": "RJ", "minas gerais": "MG", "parana": "PR", "santa catarina": "SC", "rio grande do sul": "RS", "bahia": "BA", "pernambuco": "PE", "ceara": "CE", "goias": "GO", "distrito federal": "DF", "espirito santo": "ES", "para": "PA", "amazonas": "AM", "maranhao": "MA", "paraiba": "PB", "rio grande do norte": "RN", "alagoas": "AL", "sergipe": "SE", "piaui": "PI", "mato grosso do sul": "MS", "mato grosso": "MT", "tocantins": "TO", "rondonia": "RO", "acre": "AC", "amapa": "AP", "roraima": "RR" };

export function separarLocal(txt) {
  const t = (txt || "").replace(/,?\s*(brasil|brazil|br)\s*$/i, "").trim();
  if (!t) return { cidade: "", uf: "" };
  const partes = t.split(/\s*[,/–|]\s*|\s+-\s+/).map((p) => p.trim()).filter((p) => p && !/remot|home office|h[ií]brid/i.test(p));
  const sigla = partes.find((p) => UFS.includes(p.toUpperCase()));
  // "São Paulo, SP": com a sigla presente, o nome por extenso é a cidade
  if (sigla) return { cidade: partes.find((p) => p !== sigla) || "", uf: sigla.toUpperCase() };
  const estado = partes.find((p) => ESTADOS[norm(p)]);
  const outra = partes.find((p) => !ESTADOS[norm(p)]);
  if (estado && outra) return { cidade: outra, uf: ESTADOS[norm(estado)] };
  // só "São Paulo" ou "Rio de Janeiro": vale como cidade (capital) e estado
  if (estado) return { cidade: estado, uf: ESTADOS[norm(estado)] };
  return { cidade: partes[0] || "", uf: "" };
}
export function detectarModelo(txt) {
  const t = norm(txt);
  if (/hibrid/.test(t)) return "Híbrido";
  if (/(100% )?remot|home ?office|trabalho de casa|anywhere/.test(t)) return "Remoto";
  return "Presencial";
}
export function detectarContrato(txt) {
  const t = norm(txt);
  if (/jovem aprendiz|\baprendiz\b/.test(t)) return "Aprendiz";
  if (/estagi|intern(ship)?\b/.test(t)) return "Estágio";
  if (/temporari|safra|\bfreela/.test(t)) return /freela/.test(t) ? "Freelancer" : "Temporário";
  if (/\bpj\b|pessoa juridica|contractor/.test(t)) return "PJ";
  if (/diaria|diarista/.test(t)) return "Diária";
  return "CLT";
}
export function detectarSalario(txt) {
  const t = (txt || "").replace(/\s+/g, " ");
  const m = t.match(/R\$\s?([\d.]+(?:,\d{2})?)(?:\s*(?:a|até|-|–)\s*R?\$?\s?([\d.]+(?:,\d{2})?))?(\s*(?:por|\/)\s*(hora|h|dia|mês|mes))?/i);
  if (!m) return null;
  const num = (s) => +s.replace(/\./g, "").replace(",", ".");
  const min = num(m[1]), max = m[2] ? num(m[2]) : min;
  if (!min || min < 5) return null;
  const u = norm(m[4] || "");
  const unidade = u.startsWith("h") ? "/hora" : u.startsWith("d") ? "/dia" : min < 400 ? "/dia" : "/mês";
  return { salario_min: min, salario_max: Math.max(min, max), unidade };
}
export function detectarEscolaridade(txt) {
  const t = norm(txt);
  for (const [re, nivel] of ESCOLA) if (re.test(t)) return nivel;
  return null;
}
export function exigeExperiencia(txt) {
  const t = norm(txt);
  if (/sem experiencia|nao (e necessari|exige|precisa).{0,20}experiencia|primeiro emprego|nao e necessario ter experiencia|treinamento completo/.test(t)) return false;
  return /experiencia (comprovada|anterior|minima|de \d|na funcao|na area)|\d+ anos? de experiencia/.test(t);
}
export const detectarArea = (txt) => { const t = " " + norm(txt) + " "; return Object.keys(AREA_KEYS).find((a) => AREA_KEYS[a].some((k) => t.includes(k))) || null; };
export const detectarHabilidades = (txt) => { const t = " " + norm(txt) + " "; return Object.keys(SKILL_KEYS).filter((k) => SKILL_KEYS[k].some((w) => t.includes(w))); };
const BENEF = ["Vale transporte", "Vale refeição", "Vale alimentação", "Cesta básica", "Plano de saúde", "Plano odontológico", "Seguro de vida", "PLR", "Comissão", "Auxílio creche", "Refeição no local", "Gympass", "Day off"];
export const detectarBeneficios = (txt) => { const t = norm(txt); return BENEF.filter((b) => t.includes(norm(b))); };

// ------------------------------ Anti-fraude ------------------------------
// Não acusa ninguém: só tira a vaga do ar até uma pessoa revisar.
export function sinaisSuspeitos(v) {
  const t = norm(`${v.titulo} ${v.descricao}`);
  const s = [];
  if (/(taxa|pagamento|deposito|pix|boleto).{0,40}(inscric|cadastro|curso|uniforme|exame|treinamento|kit)|(pague|pagar|investimento inicial)/.test(t)) s.push("pede dinheiro do candidato");
  if (/ganhe ate|renda extra garantida|trabalhe de casa e ganhe|sem sair de casa.{0,20}(r\$|reais)/.test(t)) s.push("promessa de ganho fácil");
  if (/(chama|chamar|envie|mande).{0,20}(whats|zap)/.test(t) && !v.url) s.push("contato só por WhatsApp");
  if (/marketing multinivel|piramide|revenda.{0,15}kit/.test(t)) s.push("parece venda de kit ou pirâmide");
  if (v.unidade === "/mês" && v.salario_max > 15000 && /auxiliar|ajudante|atendente|repositor|limpeza|empacot/.test(t)) s.push("salário fora do normal para a função");
  if (v.url && /bit\.ly|tinyurl|encurt|wa\.me/.test(v.url)) s.push("link encurtado ou de WhatsApp");
  return s;
}

// ------------------------- Montagem da vaga final -------------------------
export function montarVaga(bruta, ctx) {
  const descricao = corta(bruta.descricao_texto || semHtml(bruta.descricao_html || ""), 5000);   // 5 mil letras: cabe no plano grátis do Supabase
  const tudo = `${bruta.titulo}\n${bruta.local || ""}\n${descricao}`;
  const local = bruta.cidade || bruta.uf ? { cidade: bruta.cidade || "", uf: bruta.uf || "" } : separarLocal(bruta.local);
  const salario = bruta.salario || detectarSalario(tudo);
  const v = {
    empresa_id: ctx.empresa_id, fonte_id: ctx.fonte_id ?? null, origem: ctx.origem, fonte_nome: ctx.fonte_nome,
    id_externo: String(bruta.id_externo), titulo: corta(desentidade(bruta.titulo).trim(), 200), descricao,
    cidade: local.cidade || ctx.cidade || null, uf: local.uf || ctx.uf || null,
    modelo: bruta.modelo || detectarModelo(`${bruta.local || ""} ${bruta.titulo} ${descricao.slice(0, 1500)}`),
    contrato: bruta.contrato || detectarContrato(`${bruta.titulo} ${bruta.tipo || ""} ${descricao.slice(0, 2000)}`),
    salario_min: salario?.salario_min ?? null, salario_max: salario?.salario_max ?? null, unidade: salario?.unidade || "/mês",
    escolaridade: detectarEscolaridade(descricao),
    exige_experiencia: exigeExperiencia(descricao),
    area: detectarArea(bruta.titulo) || detectarArea(descricao.slice(0, 1500)),
    habilidades: detectarHabilidades(tudo).slice(0, 10),
    beneficios: detectarBeneficios(descricao),
    url: bruta.url || null,
    publicada_em: bruta.publicada_em ? new Date(bruta.publicada_em).toISOString() : new Date().toISOString(),
    vista_em: new Date().toISOString(), ativa: true,
  };
  v.motivos_suspeita = sinaisSuspeitos(v);
  v.suspeita = v.motivos_suspeita.length > 0;
  v.hash_conteudo = hash(v.titulo.replace(/\(a\)|\(o\)/gi, ""), (ctx.empresa_nome || "").replace(/\b(ltda|s\.?a\.?|me|eireli)\b/gi, ""), v.cidade || "");
  v.assinatura = hash(v.titulo, v.cidade || "", v.uf || "", descricao, String(v.salario_min), String(v.salario_max), v.url || "");
  return v;
}

// --------------------------------- IA ------------------------------------
// Usada só quando as regras não bastam. Nunca inventa: o que não estiver no texto volta vazio.
const IA_CHAVE = ENV.ANTHROPIC_API_KEY || "";
const IA_MODELO = ENV.IA_MODELO || "claude-haiku-4-5-20251001";
export const iaLigada = () => !!IA_CHAVE;
let chamadasIa = 0;
export const totalChamadasIa = () => chamadasIa;
export async function perguntarIa(instrucao, texto, maxTokens = 700) {
  if (!IA_CHAVE) return null;
  chamadasIa++;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": IA_CHAVE, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: IA_MODELO, max_tokens: maxTokens, messages: [{ role: "user", content: `${instrucao}\n\n<texto>\n${texto}\n</texto>` }] }),
  });
  if (!r.ok) throw new Error(`IA ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const out = await r.json();
  const bruto = (out.content || []).map((c) => c.text || "").join("");
  const m = bruto.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  try { return m ? JSON.parse(m[0]) : null; } catch { return null; }
}

const AREAS_VALIDAS = Object.keys(AREA_KEYS);
const ESCOLAS_VALIDAS = ["Não estudei", "Fundamental incompleto", "Fundamental", "Médio incompleto", "Médio", "Técnico", "Graduação"];
export async function classificarComIa(v) {
  const r = await perguntarIa(
    `Você classifica vagas de emprego brasileiras. Leia o texto e responda APENAS com um JSON:
{"area": uma de ${JSON.stringify(AREAS_VALIDAS)} ou null,
 "escolaridade": uma de ${JSON.stringify(ESCOLAS_VALIDAS)} ou null,
 "exige_experiencia": true/false,
 "contrato": "CLT"|"PJ"|"Temporário"|"Estágio"|"Aprendiz"|"Freelancer"|"Diária"|null,
 "modelo": "Presencial"|"Híbrido"|"Remoto"|null,
 "salario_min": número ou null, "salario_max": número ou null, "unidade": "/mês"|"/dia"|"/hora"|null,
 "habilidades": até 6 itens curtos em português, tirados do texto}
Regras: use só o que está escrito no texto. Se algo não aparece, use null. Nunca estime salário.`,
    corta(`Cargo: ${v.titulo}\nLocal: ${v.cidade || ""} ${v.uf || ""}\n\n${v.descricao}`, 6000), 400);
  if (!r) return v;
  const ok = (x, lista) => (lista.includes(x) ? x : null);
  return {
    ...v,
    area: ok(r.area, AREAS_VALIDAS) || v.area,
    escolaridade: ok(r.escolaridade, ESCOLAS_VALIDAS) || v.escolaridade,
    exige_experiencia: typeof r.exige_experiencia === "boolean" ? r.exige_experiencia : v.exige_experiencia,
    contrato: r.contrato || v.contrato, modelo: r.modelo || v.modelo,
    salario_min: v.salario_min ?? (typeof r.salario_min === "number" ? r.salario_min : null),
    salario_max: v.salario_max ?? (typeof r.salario_max === "number" ? r.salario_max : null),
    unidade: v.salario_min ? v.unidade : r.unidade || v.unidade,
    habilidades: [...new Set([...(v.habilidades || []), ...(Array.isArray(r.habilidades) ? r.habilidades.slice(0, 6).map(String) : [])])].slice(0, 10),
    classificada_ia: true,
  };
}

// ----------------------- Descobrir o sistema de vagas -----------------------
export const PADROES_ATS = [
  [/(?:boards|job-boards)\.greenhouse\.io\/(?:embed\/job_board\?for=)?([\w-]+)/i, "greenhouse"],
  [/boards-api\.greenhouse\.io\/v1\/boards\/([\w-]+)/i, "greenhouse"],
  [/jobs\.(?:eu\.)?lever\.co\/([\w.-]+)/i, "lever"],
  [/(?:jobs|careers)\.smartrecruiters\.com\/([\w-]+)/i, "smartrecruiters"],
  [/\/\/([\w-]+)\.recruitee\.com/i, "recruitee"],
  [/jobs\.ashbyhq\.com\/([\w.-]+)/i, "ashby"],
];
export function detectarFonte(url) {
  if (!url) return null;
  for (const [re, tipo] of PADROES_ATS) { const m = url.match(re); if (m) return { tipo, identificador: m[1] }; }
  try { new URL(url); return { tipo: "pagina", identificador: url }; } catch { return null; }
}
export const dominioDe = (url) => { try { return new URL(/^https?:/i.test(url) ? url : "https://" + url).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };
