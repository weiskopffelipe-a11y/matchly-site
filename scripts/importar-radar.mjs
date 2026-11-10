// =====================================================================
// MATCHLY — importa a sua lista de empresas (o "radar") para o banco
//
// Use uma planilha salva como CSV (separado por vírgula ou ponto e vírgula)
// com uma linha de cabeçalho. Colunas aceitas (só "nome" é obrigatória):
//
//   nome, site, pagina_vagas, cnpj, setor, cidade, uf
//
//   • pagina_vagas: link da página de vagas (Gupy, Greenhouse, Lever, "trabalhe conosco"...)
//   • sem pagina_vagas mas com site: o robô procura sozinho a página de vagas
//
// Pode rodar quantas vezes quiser: empresas repetidas (mesmo site ou CNPJ) não duplicam.
// Uso:  node scripts/importar-radar.mjs radar.csv
// =====================================================================
import fs from "node:fs";
import { db, pedacos, lista, log, exigirSupabase, detectarFonte, dominioDe } from "./lib.mjs";

exigirSupabase();
const arquivo = process.argv[2] || "radar.csv";
if (!fs.existsSync(arquivo)) { console.error(`Não achei o arquivo ${arquivo}. Suba o CSV para a raiz do repositório.`); process.exit(1); }

// ------------------------------ leitor de CSV ------------------------------
function lerCsv(txt) {
  txt = txt.replace(/^﻿/, "");
  const sep = (txt.split("\n")[0].match(/;/g) || []).length > (txt.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
  const linhas = []; let campo = "", linha = [], aspas = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (aspas) { if (c === '"' && txt[i + 1] === '"') { campo += '"'; i++; } else if (c === '"') aspas = false; else campo += c; }
    else if (c === '"') aspas = true;
    else if (c === sep) { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && txt[i + 1] === "\n") i++; linha.push(campo); linhas.push(linha); linha = []; campo = ""; }
    else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const cab = linhas.shift().map((h) => h.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_"));
  const apelidos = { empresa: "nome", razao_social: "nome", website: "site", url: "site", dominio: "site", vagas: "pagina_vagas", link_vagas: "pagina_vagas", carreiras: "pagina_vagas", estado: "uf", municipio: "cidade" };
  return linhas.filter((l) => l.some((x) => x.trim())).map((l) => Object.fromEntries(cab.map((h, i) => [apelidos[h] || h, (l[i] || "").trim()])));
}

const linhas = lerCsv(fs.readFileSync(arquivo, "utf8")).filter((l) => l.nome);
log(`${linhas.length.toLocaleString("pt-BR")} empresas no arquivo`);

let empresas = 0, fontes = 0, semCanal = 0;
for (const lote of pedacos(linhas, 500)) {
  const registros = lote.map((l) => {
    const cnpj = (l.cnpj || "").replace(/\D/g, "");
    return {
      nome: l.nome.slice(0, 200), site: l.site || null, dominio: l.site ? dominioDe(l.site) || null : null,
      cnpj: cnpj.length === 14 ? cnpj : null, setor: l.setor || null, cidade: l.cidade || null, uf: (l.uf || "").toUpperCase().slice(0, 2) || null,
      origem: "radar", _vagas: l.pagina_vagas || "",
    };
  });
  // sem domínio repetido dentro do mesmo lote
  const vistos = new Set();
  const unicos = registros.filter((r) => { const k = r.dominio || r.cnpj || `${r.nome}|${r.cidade}`; if (vistos.has(k)) return false; vistos.add(k); return true; });
  const limpo = (r) => { const { _vagas, ...x } = r; return x; };

  // empresas que já existem (inclusive as que se cadastraram sozinhas) não são sobrescritas
  const inserir = async (rows, conflito) => {
    if (!rows.length) return;
    try { await db(`empresas?on_conflict=${conflito}`, { method: "POST", body: rows.map(limpo), prefer: "resolution=ignore-duplicates,return=minimal" }); }
    catch { for (const r of rows) await db(`empresas?on_conflict=${conflito}`, { method: "POST", body: [limpo(r)], prefer: "resolution=ignore-duplicates,return=minimal" }).catch(() => {}); }
  };
  const comDominio = unicos.filter((r) => r.dominio), comCnpj = unicos.filter((r) => !r.dominio && r.cnpj), resto = unicos.filter((r) => !r.dominio && !r.cnpj);
  await inserir(comDominio, "dominio");
  await inserir(comCnpj, "cnpj");
  const salvos = [];
  for (const p of pedacos(comDominio.map((r) => r.dominio), 100)) salvos.push(...await db(`empresas?select=id,dominio,cnpj,nome&dominio=in.${encodeURIComponent(lista(p))}`));
  for (const p of pedacos(comCnpj.map((r) => r.cnpj), 100)) salvos.push(...await db(`empresas?select=id,dominio,cnpj,nome&cnpj=in.${encodeURIComponent(lista(p))}`));
  if (resto.length) salvos.push(...await db("empresas?select=id,dominio,cnpj,nome", { method: "POST", body: resto.map(limpo), prefer: "return=representation" }));
  empresas += salvos.length;

  const idDe = new Map(salvos.map((e) => [e.dominio || e.cnpj || e.nome, e.id]));
  const novasFontes = [];
  for (const r of unicos) {
    const id = idDe.get(r.dominio || r.cnpj || r.nome);
    if (!id) continue;
    const f = detectarFonte(r._vagas);
    if (f) novasFontes.push({ empresa_id: id, ...f });
    else if (r.dominio) novasFontes.push({ empresa_id: id, tipo: "descobrir", identificador: r.dominio });
    else semCanal++;
  }
  if (novasFontes.length) {
    await db("fontes?on_conflict=tipo,identificador", { method: "POST", body: novasFontes, prefer: "resolution=ignore-duplicates,return=minimal" });
    fontes += novasFontes.length;
  }
  log(`… ${empresas.toLocaleString("pt-BR")} empresas, ${fontes.toLocaleString("pt-BR")} fontes`);
}

log(`Pronto: ${empresas.toLocaleString("pt-BR")} empresas e ${fontes.toLocaleString("pt-BR")} fontes de vagas no radar.`);
if (semCanal) log(`${semCanal.toLocaleString("pt-BR")} empresas sem site nem página de vagas: entram só pelas vagas dos agregadores ou se se cadastrarem.`);
