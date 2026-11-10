// =====================================================================
// MATCHLY — leitores de vagas
// Cada função recebe o identificador da empresa naquela fonte e devolve
// uma lista de vagas "brutas", que o coletor padroniza com montarVaga().
//
// Só usamos canais públicos e oficiais:
//   • APIs públicas de quadro de vagas dos sistemas de RH (Greenhouse, Lever,
//     SmartRecruiters, Recruitee, Ashby) — feitas para exibir as vagas fora do site deles;
//   • a página de vagas da própria empresa, lendo o formato JobPosting
//     (o mesmo que o Google usa), e só onde o robots.txt permite;
//   • APIs de agregadores com chave própria (Adzuna, Jooble).
// =====================================================================
import { baixar, permitido, semHtml, desentidade, detectarFonte, dominioDe, perguntarIa, iaLigada, corta, log } from "./lib.mjs";

// ------------------------------ Greenhouse ------------------------------
export async function greenhouse(token) {
  const d = await baixar(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=true`, { tipo: "json" });
  return (d.jobs || []).map((j) => ({
    id_externo: j.id, titulo: j.title, local: j.location?.name || "", url: j.absolute_url,
    descricao_html: desentidade(j.content || ""), publicada_em: j.first_published || j.updated_at,
    tipo: (j.metadata || []).map((m) => `${m.name}: ${m.value}`).join(" "),
  }));
}

// -------------------------------- Lever ---------------------------------
export async function lever(site) {
  let d;
  try { d = await baixar(`https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`, { tipo: "json" }); }
  catch (e) { if (e.status !== 404) throw e; d = []; }
  if (!Array.isArray(d) || !d.length) {
    try { d = await baixar(`https://api.eu.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`, { tipo: "json" }); } catch { d = []; }
  }
  return (Array.isArray(d) ? d : []).map((j) => {
    const s = j.salaryRange;
    const unidade = /hour/i.test(s?.interval || "") ? "/hora" : /day/i.test(s?.interval || "") ? "/dia" : "/mês";
    return {
      id_externo: j.id, titulo: j.text, local: j.categories?.location || (j.categories?.allLocations || []).join(", "),
      url: j.hostedUrl, publicada_em: j.createdAt ? new Date(j.createdAt) : null,
      descricao_texto: [j.descriptionPlain, ...(j.lists || []).map((l) => `${l.text}\n${semHtml(l.content)}`), j.additionalPlain].filter(Boolean).join("\n\n"),
      modelo: j.workplaceType === "remote" ? "Remoto" : j.workplaceType === "hybrid" ? "Híbrido" : j.workplaceType === "onsite" ? "Presencial" : undefined,
      tipo: j.categories?.commitment || "",
      salario: s && s.currency === "BRL" && s.min ? { salario_min: s.min, salario_max: s.max || s.min, unidade: /year/i.test(s.interval || "") ? "/mês" : unidade } : null,
    };
  }).map((v) => (v.salario && v.salario.unidade === "/mês" && v.salario.salario_min > 40000 ? { ...v, salario: { ...v.salario, salario_min: v.salario.salario_min / 12, salario_max: v.salario.salario_max / 12 } } : v));
}

// ---------------------------- SmartRecruiters ----------------------------
export async function smartrecruiters(empresa) {
  const vagas = [];
  for (let offset = 0; offset < 1000; offset += 100) {
    const d = await baixar(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(empresa)}/postings?limit=100&offset=${offset}`, { tipo: "json" });
    const lote = d.content || [];
    for (const j of lote) {
      vagas.push({
        id_externo: j.id, titulo: j.name, url: `https://jobs.smartrecruiters.com/${empresa}/${j.id}`,
        cidade: j.location?.city || "", uf: (j.location?.region || "").length === 2 ? j.location.region.toUpperCase() : "",
        local: [j.location?.city, j.location?.region].filter(Boolean).join(", "),
        modelo: j.location?.remote ? "Remoto" : j.location?.hybrid ? "Híbrido" : undefined,
        publicada_em: j.releasedDate, tipo: j.typeOfEmployment?.label || "",
        descricao_texto: [j.function?.label, j.experienceLevel?.label].filter(Boolean).join(" · "),
      });
    }
    if (lote.length < 100 || vagas.length >= (d.totalFound || 0)) break;
  }
  return vagas;
}

// ------------------------------- Recruitee -------------------------------
export async function recruitee(sub) {
  const d = await baixar(`https://${encodeURIComponent(sub)}.recruitee.com/api/offers/`, { tipo: "json" });
  return (d.offers || []).map((j) => ({
    id_externo: j.id, titulo: j.title, url: j.careers_url, cidade: j.city || "", local: [j.city, j.state_code || j.state_name].filter(Boolean).join(", "),
    modelo: j.remote ? "Remoto" : j.hybrid ? "Híbrido" : undefined, publicada_em: j.published_at, tipo: j.employment_type_code || "",
    descricao_html: `${j.description || ""}\n${j.requirements || ""}`,
  }));
}

// --------------------------------- Ashby ---------------------------------
export async function ashby(board) {
  const d = await baixar(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}?includeCompensation=true`, { tipo: "json" });
  return (d.jobs || []).filter((j) => j.isListed !== false).map((j) => ({
    id_externo: j.id, titulo: j.title, url: j.jobUrl, local: j.location || "", publicada_em: j.publishedAt, tipo: j.employmentType || "",
    modelo: j.workplaceType === "Remote" || j.isRemote ? "Remoto" : j.workplaceType === "Hybrid" ? "Híbrido" : undefined,
    descricao_texto: j.descriptionPlain || semHtml(j.descriptionHtml || ""),
  }));
}

// ------------------- Página de vagas da própria empresa -------------------
function jobPostingsDoHtml(html, base) {
  const achados = [];
  const visitar = (o) => {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(visitar);
    const t = [].concat(o["@type"] || []).map(String);
    if (t.includes("JobPosting")) achados.push(o);
    if (o["@graph"]) visitar(o["@graph"]);
    if (o.itemListElement) visitar(o.itemListElement.map((i) => i.item || i));
  };
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visitar(JSON.parse(m[1].trim())); } catch { /* bloco quebrado: ignora */ }
  }
  return achados.map((j) => {
    const loc = [].concat(j.jobLocation || [])[0]?.address || {};
    const sal = j.baseSalary?.value || {};
    const unidadeSal = /hour/i.test(sal.unitText || "") ? "/hora" : /day/i.test(sal.unitText || "") ? "/dia" : "/mês";
    const url = j.url || j.sameAs || base;
    if (j.validThrough && new Date(j.validThrough) < new Date()) return null;   // vaga já vencida
    return {
      id_externo: j.identifier?.value || j.identifier || url || `${j.title}-${j.datePosted}`,
      titulo: j.title, url: new URL(url, base).href, publicada_em: j.datePosted,
      cidade: loc.addressLocality || "", uf: (loc.addressRegion || "").length === 2 ? loc.addressRegion.toUpperCase() : "",
      local: [loc.addressLocality, loc.addressRegion].filter(Boolean).join(", "),
      modelo: /telecommute/i.test(j.jobLocationType || "") ? "Remoto" : undefined,
      tipo: [].concat(j.employmentType || []).join(" "),
      descricao_html: j.description || "",
      salario: (sal.minValue || sal.value) && (j.baseSalary?.currency || "BRL") === "BRL"
        ? { salario_min: +(sal.minValue || sal.value), salario_max: +(sal.maxValue || sal.minValue || sal.value), unidade: /year/i.test(sal.unitText || "") ? "/mês" : unidadeSal } : null,
    };
  }).filter(Boolean).filter((v) => v.titulo);
}

const PALAVRAS_LINK_VAGA = /vaga|vagas|job|jobs|oportunidade|position|carreira|career|trabalhe|opening/i;
export async function pagina(url, { permitirIa = true } = {}) {
  if (!(await permitido(url))) { const e = new Error("robots.txt não permite ler esta página"); e.bloqueado = true; throw e; }
  const html = await baixar(url);
  let vagas = jobPostingsDoHtml(html, url);
  if (vagas.length) return vagas;

  // A lista não tem o formato JobPosting: abre os links que parecem de vaga (no mesmo site)
  const host = new URL(url).host;
  const links = [...new Set([...html.matchAll(/href=["']([^"'#]+)["']/gi)].map((m) => { try { return new URL(desentidade(m[1]), url).href; } catch { return null; } })
    .filter((h) => h && new URL(h).host === host && h !== url && PALAVRAS_LINK_VAGA.test(new URL(h).pathname) && new URL(h).pathname.split("/").filter(Boolean).length >= 2))].slice(0, 40);
  for (const l of links) {
    try { if (await permitido(l)) vagas.push(...jobPostingsDoHtml(await baixar(l), l)); } catch { /* link quebrado */ }
  }
  if (vagas.length) return vagas;

  // Último recurso: a IA lê o texto da página e aponta as vagas que estão escritas nela
  if (permitirIa && iaLigada()) {
    const texto = corta(semHtml(html), 9000);
    const linksTexto = [...html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map((m) => { try { return `${semHtml(m[2]).slice(0, 80)} -> ${new URL(desentidade(m[1]), url).href}`; } catch { return null; } })
      .filter(Boolean).slice(0, 150).join("\n");
    const r = await perguntarIa(
      `Esta é a página de vagas de uma empresa. Liste SOMENTE as vagas de emprego que estão escritas no texto.
Responda APENAS com um JSON: [{"titulo": "...", "cidade": "... ou vazio", "link": "um dos links da lista abaixo ou vazio", "resumo": "uma frase tirada do texto"}]
Se não houver vagas, responda []. Não invente vagas, cidades nem links.`,
      `${texto}\n\nLINKS DA PÁGINA:\n${linksTexto}`, 1500);
    const linksValidos = new Set(linksTexto.split("\n").map((l) => l.split(" -> ")[1]));
    if (Array.isArray(r)) {
      vagas = r.filter((x) => x && x.titulo && texto.toLowerCase().includes(String(x.titulo).toLowerCase().slice(0, 25)))
        .slice(0, 60).map((x) => ({
          id_externo: x.link && linksValidos.has(x.link) ? x.link : `${url}#${x.titulo}`, titulo: x.titulo, cidade: x.cidade || "",
          url: x.link && linksValidos.has(x.link) ? x.link : url, descricao_texto: x.resumo || "",
        }));
    }
  }
  return vagas;
}

// ----------- Descoberta: só temos o site, onde ficam as vagas? -----------
const CAMINHOS = ["/trabalhe-conosco", "/carreiras", "/vagas", "/careers", "/jobs", "/trabalhe-com-a-gente", "/oportunidades"];
export async function descobrir(dominio) {
  const raiz = `https://${dominio}`;
  const achadas = [];
  let html = "";
  if (await permitido(raiz + "/")) { try { html = await baixar(raiz + "/"); } catch { /* site fora do ar */ } }
  const urls = [...html.matchAll(/href=["']([^"'#]+)["']/gi)].map((m) => { try { return new URL(desentidade(m[1]), raiz).href; } catch { return null; } }).filter(Boolean);
  for (const u of urls) { const f = detectarFonte(u); if (f && f.tipo !== "pagina") achadas.push(f); }
  if (/gupy\.io/i.test(html)) { const m = html.match(/https?:\/\/[\w-]+\.gupy\.io/i); if (m) achadas.push({ tipo: "pagina", identificador: m[0] }); }
  if (!achadas.length) {
    const candidatos = urls.filter((u) => dominioDe(u) === dominio && /trabalhe|carreira|vagas|career|jobs|oportunidade/i.test(new URL(u).pathname)).slice(0, 3);
    for (const c of CAMINHOS) candidatos.push(raiz + c);
    for (const c of [...new Set(candidatos)]) {
      try {
        if (!(await permitido(c))) continue;
        const h = await baixar(c, { timeout: 10000 });
        const ats = [...h.matchAll(/href=["']([^"'#]+)["']|src=["']([^"'#]+)["']/gi)].map((m) => detectarFonte(m[1] || m[2])).find((f) => f && f.tipo !== "pagina");
        if (ats) { achadas.push(ats); break; }
        if (/JobPosting/.test(h) || PALAVRAS_LINK_VAGA.test(h.slice(0, 20000))) { achadas.push({ tipo: "pagina", identificador: c }); break; }
      } catch { /* caminho não existe */ }
    }
  }
  const unicas = new Map(achadas.map((f) => [`${f.tipo}:${f.identificador}`, f]));
  return [...unicas.values()].slice(0, 3);
}

// ------------------------------ Agregadores ------------------------------
// Adzuna: plano grátis com cerca de 1.000 chamadas por mês. Exige mostrar "Vagas por Adzuna".
export async function adzuna(termo, cidade) {
  const { ADZUNA_APP_ID: id, ADZUNA_APP_KEY: chave } = process.env;
  if (!id || !chave) return [];
  const q = new URLSearchParams({ app_id: id, app_key: chave, what: termo, results_per_page: "50", "content-type": "application/json", sort_by: "date", max_days_old: "20" });
  if (cidade) q.set("where", cidade);
  const d = await baixar(`https://api.adzuna.com/v1/api/jobs/br/search/1?${q}`, { tipo: "json" });
  return (d.results || []).map((j) => ({
    id_externo: j.id, titulo: semHtml(j.title), empresa: j.company?.display_name || "", local: j.location?.display_name || cidade || "",
    url: j.redirect_url, publicada_em: j.created, descricao_texto: semHtml(j.description),
    // Adzuna às vezes informa o valor anual: acima de R$ 25 mil tratamos como ano e dividimos por 12
    salario: j.salary_min && String(j.salary_is_predicted) !== "1" ? { salario_min: j.salary_min, salario_max: j.salary_max || j.salary_min, unidade: "/mês" } : null,
    tipo: [j.contract_type, j.contract_time].filter(Boolean).join(" "),
  })).map((v) => (v.salario && v.salario.salario_min > 25000 ? { ...v, salario: { ...v.salario, salario_min: v.salario.salario_min / 12, salario_max: v.salario.salario_max / 12 } } : v));
}

// Jooble: chave grátis pedida no site deles. Os links levam para a página da Jooble.
export async function jooble(termo, cidade) {
  const chave = process.env.JOOBLE_API_KEY;
  if (!chave) return [];
  const d = await baixar(`https://jooble.org/api/${chave}`, {
    tipo: "json", metodo: "POST", corpo: JSON.stringify({ keywords: termo, location: cidade || "", page: "1" }),
    headers: { "Content-Type": "application/json" },
  });
  return (d.jobs || []).map((j) => ({
    id_externo: j.id, titulo: semHtml(j.title), empresa: j.company || "", local: j.location || cidade || "",
    url: j.link, publicada_em: j.updated, descricao_texto: semHtml(j.snippet), tipo: j.type || "",
  }));
}

export const LEITORES = { greenhouse, lever, smartrecruiters, recruitee, ashby, pagina };
export const NOME_FONTE = { greenhouse: "Greenhouse", lever: "Lever", smartrecruiters: "SmartRecruiters", recruitee: "Recruitee", ashby: "Ashby", pagina: "site da empresa", adzuna: "Adzuna", jooble: "Jooble" };
export { log };
