// =====================================================================
// MATCHLY — robô de coleta de vagas
// O GitHub roda este arquivo sozinho, de 3 em 3 horas (veja .github/workflows/coletar.yml).
//
// Em cada rodada:
//   1. pega as empresas do radar que estão na vez (fila por data);
//   2. lê as vagas de cada uma pela fonte certa;
//   3. padroniza (cidade, salário, escolaridade, experiência, área) — por regras e, se ligada, pela IA;
//   4. tira do ar o que parece golpe, até alguém revisar;
//   5. salva o que é novo, atualiza o que mudou e encerra o que sumiu do site da empresa;
//   6. busca vagas de entrada nos agregadores (Adzuna, Jooble), sem duplicar.
//
// Ajustes (variáveis no GitHub, opcionais):
//   LOTE=6000            empresas por rodada
//   SIMULTANEAS=12       empresas lidas ao mesmo tempo
//   TEMPO_MAX_MIN=50     a rodada para sozinha depois desse tempo
//   MAX_IA=300           limite de consultas à IA por rodada (custo)
//   ADZUNA_CHAMADAS=4    chamadas por rodada (o plano grátis dá ~1.000 por mês)
//   JOOBLE_CHAMADAS=2
// =====================================================================
import { db, lista, pedacos, log, montarVaga, classificarComIa, iaLigada, totalChamadasIa, exigirSupabase, ENV } from "./lib.mjs";
import { LEITORES, NOME_FONTE, descobrir, adzuna, jooble } from "./fontes.mjs";

exigirSupabase();
const LOTE = +ENV.LOTE || 6000;
const SIMULTANEAS = +ENV.SIMULTANEAS || 12;
const FIM = Date.now() + (+ENV.TEMPO_MAX_MIN || 50) * 60_000;
const MAX_IA = +ENV.MAX_IA || 300;
const HORA = 3600_000;
const agora = () => new Date().toISOString();
const depois = (h) => new Date(Date.now() + h * HORA).toISOString();

const placar = { fontes_lidas: 0, vagas_novas: 0, vagas_atualizadas: 0, vagas_encerradas: 0, suspeitas: 0, erros: 0 };
const [coleta] = await db("coletas", { method: "POST", body: {}, prefer: "return=representation" });

// ------------------------- salvar vagas de uma fonte -------------------------
async function salvar(vagas, origem) {
  if (!vagas.length) return;
  // o que já existe e não mudou: só marca como "vista" (não gasta IA de novo)
  const existentes = new Map();
  for (const p of pedacos(vagas.map((v) => v.id_externo), 80)) {
    const rows = await db(`vagas?select=id_externo,assinatura&origem=eq.${origem}&id_externo=in.${encodeURIComponent(lista(p))}`);
    rows.forEach((r) => existentes.set(r.id_externo, r.assinatura));
  }
  const iguais = vagas.filter((v) => existentes.get(v.id_externo) === v.assinatura);
  let mudaram = vagas.filter((v) => existentes.get(v.id_externo) !== v.assinatura);

  for (const p of pedacos(iguais.map((v) => v.id_externo), 80)) {
    await db(`vagas?origem=eq.${origem}&id_externo=in.${encodeURIComponent(lista(p))}`, { method: "PATCH", body: { vista_em: agora(), ativa: true } });
  }
  // a IA completa o que as regras não acharam (área ou escolaridade)
  if (iaLigada()) {
    mudaram = await Promise.all(mudaram.map(async (v) => {
      if ((v.area && v.escolaridade) || totalChamadasIa() >= MAX_IA || v.suspeita) return v;
      try { return await classificarComIa(v); } catch (e) { log("IA falhou:", e.message); return v; }
    }));
  }
  const colunas = (v) => ({ classificada_ia: false, ...v });
  for (const p of pedacos(mudaram.map(colunas), 300)) {
    await db("vagas?on_conflict=origem,id_externo", { method: "POST", body: p, prefer: "resolution=merge-duplicates,return=minimal" });
  }
  placar.vagas_novas += mudaram.filter((v) => !existentes.has(v.id_externo)).length;
  placar.vagas_atualizadas += mudaram.filter((v) => existentes.has(v.id_externo)).length + iguais.length;
  placar.suspeitas += mudaram.filter((v) => v.suspeita).length;
}

// ------------------------------- uma fonte -------------------------------
async function processar(f) {
  const empresa = f.empresas || {};
  const inicio = agora();
  try {
    if (f.tipo === "descobrir") {
      const achadas = await descobrir(f.identificador);
      if (achadas.length) {
        await db("fontes?on_conflict=tipo,identificador", { method: "POST", prefer: "resolution=ignore-duplicates,return=minimal",
          body: achadas.map((a) => ({ empresa_id: f.empresa_id, tipo: a.tipo, identificador: a.identificador, autorizada: f.autorizada })) });
        await db(`fontes?id=eq.${f.id}`, { method: "PATCH", body: { ativa: false, ultima_coleta: inicio, ultimo_erro: `virou: ${achadas.map((a) => a.tipo).join(", ")}` } });
      } else {
        await db(`fontes?id=eq.${f.id}`, { method: "PATCH", body: { ultima_coleta: inicio, proxima_coleta: depois(24 * 30), ultimo_erro: "página de vagas não encontrada" } });
      }
      placar.fontes_lidas++;
      return;
    }

    // Páginas hospedadas na Gupy só são lidas quando a própria empresa cadastrou a fonte no Matchly.
    // Para o resto, o caminho oficial é o programa de parceiros de job boards da Gupy.
    if (f.tipo === "pagina" && /gupy\.io/i.test(f.identificador) && !f.autorizada) {
      await db(`fontes?id=eq.${f.id}`, { method: "PATCH", body: { ativa: false, ultimo_erro: "Gupy: aguardando cadastro da empresa ou parceria com a Gupy" } });
      return;
    }

    const brutas = await LEITORES[f.tipo](f.identificador);
    const ctx = { empresa_id: f.empresa_id, fonte_id: f.id, origem: f.tipo, fonte_nome: NOME_FONTE[f.tipo], empresa_nome: empresa.nome, cidade: empresa.cidade, uf: empresa.uf };
    const vistas = new Map();
    for (const b of brutas) { try { const v = montarVaga(b, ctx); vistas.set(v.id_externo, v); } catch { /* vaga sem título */ } }
    const vagas = [...vistas.values()].filter((v) => v.titulo);
    await salvar(vagas, f.tipo);

    // tudo desta fonte que não apareceu agora foi retirado pela empresa: encerra
    const encerradas = await db(`vagas?select=id&fonte_id=eq.${f.id}&ativa=eq.true&vista_em=lt.${encodeURIComponent(inicio)}`,
      { method: "PATCH", body: { ativa: false }, prefer: "return=representation", headers: { Accept: "application/json" } });
    placar.vagas_encerradas += (encerradas || []).length;

    await db(`fontes?id=eq.${f.id}`, { method: "PATCH", body: {
      ultima_coleta: inicio, falhas: 0, ultimo_erro: null, vagas_encontradas: vagas.length,
      proxima_coleta: depois(vagas.length ? 12 : 72),          // com vagas: 2x por dia; sem vagas: a cada 3 dias
    } });
    placar.fontes_lidas++;
  } catch (e) {
    placar.erros++;
    const falhas = (f.falhas || 0) + 1;
    await db(`fontes?id=eq.${f.id}`, { method: "PATCH", body: {
      falhas, ultimo_erro: String(e.message).slice(0, 300), ultima_coleta: inicio,
      ativa: !e.bloqueado && falhas < 8,                              // robots.txt proíbe, ou falhou 8 vezes: desliga
      proxima_coleta: depois(Math.min(24 * 7, 6 * 2 ** falhas)),
    } }).catch(() => {});
  }
}

// ------------------------------ fila do radar ------------------------------
async function radar() {
  let feitas = 0;
  while (feitas < LOTE && Date.now() < FIM) {
    const fila = await db(`fontes?select=*,empresas(nome,cidade,uf,dominio)&ativa=eq.true&proxima_coleta=lte.${encodeURIComponent(agora())}&order=proxima_coleta.asc&limit=${Math.min(500, LOTE - feitas)}`);
    if (!fila.length) break;
    // reserva o lote para que outra rodada não pegue as mesmas empresas
    for (const p of pedacos(fila.map((f) => f.id), 200)) await db(`fontes?id=in.(${p.join(",")})`, { method: "PATCH", body: { proxima_coleta: depois(2) } });
    let i = 0;
    await Promise.all(Array.from({ length: SIMULTANEAS }, async () => {
      while (i < fila.length && Date.now() < FIM) await processar(fila[i++]);
    }));
    feitas += fila.length;
    log(`radar: ${feitas} fontes · ${placar.vagas_novas} novas · ${placar.vagas_encerradas} encerradas · ${placar.erros} erros`);
  }
}

// -------------------------------- agregadores --------------------------------
// Vagas de entrada nas maiores cidades. Cada rodada pega a próxima combinação.
const TERMOS = ["atendente", "auxiliar de limpeza", "repositor", "operador de caixa", "ajudante geral", "auxiliar de cozinha", "vendedor", "motorista",
  "estoquista", "porteiro", "jovem aprendiz", "auxiliar de produção", "cuidador de idosos", "recepcionista", "garçom", "auxiliar administrativo"];
const CIDADES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Fortaleza", "Recife", "Curitiba", "Porto Alegre", "Goiânia", "Brasília", "Manaus", "Belém", "Campinas", "Guarulhos"];
const empresaPorNome = new Map();
async function empresaDoAgregador(nome) {
  const chave = (nome || "Empresa não informada").trim();
  if (empresaPorNome.has(chave)) return empresaPorNome.get(chave);
  let [e] = await db(`empresas?select=id,nome&nome=ilike.${encodeURIComponent(chave.replace(/[%_*]/g, ""))}&limit=1`);
  if (!e) [e] = await db("empresas", { method: "POST", body: { nome: chave, origem: "radar" }, prefer: "return=representation" });
  empresaPorNome.set(chave, e);
  return e;
}
async function agregadores() {
  const rodada = Math.floor(Date.now() / (3 * HORA));
  for (const [leitor, nome, n] of [[adzuna, "adzuna", +ENV.ADZUNA_CHAMADAS || 4], [jooble, "jooble", +ENV.JOOBLE_CHAMADAS || 2]]) {
    for (let k = 0; k < n; k++) {
      const idx = rodada * n + k;
      const termo = TERMOS[idx % TERMOS.length], cidade = CIDADES[Math.floor(idx / TERMOS.length) % CIDADES.length];
      try {
        const brutas = await leitor(termo, cidade);
        if (!brutas.length) continue;
        const vagas = [];
        for (const b of brutas) {
          const e = await empresaDoAgregador(b.empresa);
          vagas.push(montarVaga(b, { empresa_id: e.id, origem: nome, fonte_nome: NOME_FONTE[nome], empresa_nome: e.nome }));
        }
        // não duplica: se a mesma vaga já veio direto da empresa, fica a da empresa
        const hashes = new Set();
        for (const p of pedacos(vagas.map((v) => v.hash_conteudo), 80)) {
          (await db(`vagas?select=hash_conteudo&ativa=eq.true&origem=not.in.(adzuna,jooble)&hash_conteudo=in.${encodeURIComponent(lista(p))}`)).forEach((r) => hashes.add(r.hash_conteudo));
        }
        await salvar(vagas.filter((v) => !hashes.has(v.hash_conteudo)), nome);
        log(`${nome}: "${termo}" em ${cidade} → ${brutas.length} vagas`);
      } catch (e) { placar.erros++; log(`${nome} falhou:`, e.message); }
    }
  }
  // vagas de agregador que não aparecem há 10 dias, e qualquer vaga com mais de 60 dias, saem do ar
  const limite = new Date(Date.now() - 10 * 24 * HORA).toISOString();
  const velhas = new Date(Date.now() - 60 * 24 * HORA).toISOString();
  const a = await db(`vagas?select=id&origem=in.(adzuna,jooble)&ativa=eq.true&vista_em=lt.${encodeURIComponent(limite)}`, { method: "PATCH", body: { ativa: false }, prefer: "return=representation" });
  const b = await db(`vagas?select=id&ativa=eq.true&publicada_em=lt.${encodeURIComponent(velhas)}`, { method: "PATCH", body: { ativa: false }, prefer: "return=representation" });
  placar.vagas_encerradas += (a || []).length + (b || []).length;
  // faxina: vaga encerrada há mais de 30 dias é apagada, para o banco grátis (500 MB) não encher
  const mes = new Date(Date.now() - 30 * 24 * HORA).toISOString();
  await db(`vagas?ativa=eq.false&vista_em=lt.${encodeURIComponent(mes)}`, { method: "DELETE", prefer: "return=minimal" }).catch((e) => log("faxina falhou:", e.message));
  await db(`coletas?iniciada_em=lt.${encodeURIComponent(mes)}`, { method: "DELETE", prefer: "return=minimal" }).catch(() => {});
}

// ---------------------------------- rodada ----------------------------------
log("Matchly: começando a coleta", iaLigada() ? "(IA ligada)" : "(IA desligada)");
try {
  await radar();
  if (Date.now() < FIM) await agregadores();
} finally {
  const resumo = `${placar.fontes_lidas} fontes lidas, ${placar.vagas_novas} vagas novas, ${placar.vagas_atualizadas} conferidas, ${placar.vagas_encerradas} encerradas, ${placar.suspeitas} em revisão, ${placar.erros} erros`;
  await db(`coletas?id=eq.${coleta.id}`, { method: "PATCH", body: { ...placar, chamadas_ia: totalChamadasIa(), terminada_em: agora(), resumo } }).catch(() => {});
  log("Fim:", resumo);
}
