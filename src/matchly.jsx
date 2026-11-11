import React, { useState, useMemo, useEffect, useRef } from "react";

/* =========================================================================
   Matchly — Parte 1 (núcleo do produto)
   Inclui: design system, landing, cadastro em etapas, perfil com IA,
   preferências, matching explicável, feed "Para você", busca avançada,
   salvos com pastas, ATS pessoal (kanban), estatísticas, modo escuro,
   navegação mobile.
   Dados de vagas = demonstração. Pontos de integração marcados no código.
   ========================================================================= */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

.jm { --wine:#7A1B2E; --wine-2:#5E1222; --wine-tint:#FBF4F5; --wine-line:#E8D2D7;
  --bg:#FFFFFF; --surface:#FFFFFF; --surface-2:#F8F6F5; --ink:#12161F; --ink-2:#4B5158;
  --ink-3:#8A8F96; --line:#E7E3E0; --ok:#1B7A47; --warn:#A96C00; --bad:#B3261E;
  --radius:12px; --shadow:0 1px 2px rgba(18,22,31,.04), 0 12px 32px rgba(18,22,31,.07);
  --display:'Fraunces',Georgia,serif;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:var(--ink); background:var(--bg); min-height:100vh; -webkit-font-smoothing:antialiased; }
.jm[data-theme="dark"] { --wine:#D0637A; --wine-2:#E08194; --wine-tint:#241419; --wine-line:#4E222B;
  --bg:#0C0E13; --surface:#141820; --surface-2:#1A1F28; --ink:#F4F2F0; --ink-2:#B9BEC5;
  --ink-3:#848A92; --line:#262C36; --shadow:0 1px 2px rgba(0,0,0,.4), 0 12px 32px rgba(0,0,0,.4); }

.jm *{box-sizing:border-box}
.jm button{font-family:inherit}
.jm h1,.jm h2{font-family:var(--display);font-weight:600;letter-spacing:-.015em;line-height:1.08;margin:0;color:var(--ink)}
.jm h3,.jm h4{margin:0;font-weight:600;letter-spacing:-.01em;line-height:1.25;color:var(--ink)}
.jm h1{font-size:clamp(34px,5.2vw,60px)}
.jm h2{font-size:clamp(24px,3.2vw,34px)}
.jm h3{font-size:18px}
.jm p{margin:0;color:var(--ink-2);line-height:1.65}
.jm a{color:var(--wine);text-decoration:none;border-bottom:1px solid var(--wine-line)}
.jm a:hover{border-color:var(--wine)}
.jm a.btn{border-bottom-width:1px}.jm a.btn-p,.jm a.btn-p:hover{color:#fff;border-color:transparent}
.jm :focus-visible{outline:2px solid var(--wine);outline-offset:2px;border-radius:6px}

.wrap{max-width:1160px;margin:0 auto;padding:0 28px}
.row{display:flex;align-items:center;gap:12px}
.between{display:flex;align-items:center;justify-content:space-between;gap:12px}
.col{display:flex;flex-direction:column}
.muted{color:var(--ink-3);font-size:13px}
.small{font-size:13.5px;color:var(--ink-2)}
.grow{flex:1}
.center{text-align:center}
.eyebrow{font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--wine)}
.lead{font-size:18px;line-height:1.6;color:var(--ink-2)}
.rule{width:44px;height:2px;background:var(--wine);border-radius:2px;margin:18px 0}

.hdr{position:sticky;top:0;z-index:40;background:color-mix(in srgb,var(--bg) 88%,transparent);
  backdrop-filter:saturate(1.4) blur(12px);border-bottom:1px solid var(--line)}
.hdr .inner{height:70px;display:flex;align-items:center;gap:30px}
.logo{font-size:21px;font-weight:700;letter-spacing:-.02em;cursor:pointer;color:var(--ink);font-family:var(--display)}
.nav{display:flex;gap:22px;flex:1}
.nav button{background:none;border:0;color:var(--ink-2);font-size:14px;cursor:pointer;padding:8px 0;white-space:nowrap;
  position:relative;transition:color .15s}
.nav button:after{content:"";position:absolute;left:0;right:100%;bottom:2px;height:1.5px;background:var(--wine);transition:right .22s ease}
.nav button:hover{color:var(--ink)}
.nav button:hover:after{right:0}
.nav button[data-on="1"]{color:var(--wine);font-weight:500}
.nav button[data-on="1"]:after{right:0}

.btn{border:1px solid transparent;border-radius:8px;padding:11px 18px;font-size:14px;font-weight:500;
  cursor:pointer;transition:background .16s,border-color .16s,box-shadow .16s,transform .08s;
  display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap}
.btn:active{transform:translateY(1px)}
.btn-p{background:var(--wine);color:#fff;box-shadow:0 1px 2px rgba(122,27,46,.25)}
.btn-p:hover{background:var(--wine-2);box-shadow:0 6px 18px rgba(122,27,46,.22)}
.jm[data-theme="dark"] .btn-p{color:#140A0E}
.btn-s{background:var(--surface);color:var(--ink);border-color:var(--line)}
.btn-s:hover{border-color:var(--ink);box-shadow:var(--shadow)}
.btn-g{background:none;color:var(--ink-2);border-color:transparent;padding:9px 11px}
.btn-g:hover{background:var(--surface-2);color:var(--ink)}
.btn-sm{padding:8px 13px;font-size:13px}
.btn:disabled,.btn.off{opacity:.45;cursor:not-allowed;box-shadow:none}

.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:22px}
.card-h{transition:border-color .2s,box-shadow .2s,transform .2s}
.card-h:hover{border-color:var(--wine-line);box-shadow:var(--shadow);transform:translateY(-2px)}
.field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
.field label{font-size:13.5px;font-weight:500;color:var(--ink)}
.input,.select,.ta{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:8px;
  background:var(--surface-2);color:var(--ink);font-size:14.5px;font-family:inherit;transition:border-color .15s,background .15s}
.input:focus,.select:focus,.ta:focus{outline:none;border-color:var(--wine);background:var(--surface);box-shadow:0 0 0 3px var(--wine-tint)}
.ta{min-height:96px;resize:vertical;line-height:1.6}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 18px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.grid-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px}

.chip{border:1px solid var(--line);background:var(--surface);color:var(--ink-2);border-radius:999px;
  padding:7px 14px;font-size:13.5px;cursor:pointer;transition:.15s}
.chip:hover{border-color:var(--ink-3);color:var(--ink)}
.chip[data-on="1"]{background:var(--wine);border-color:var(--wine);color:#fff;font-weight:500}
.jm[data-theme="dark"] .chip[data-on="1"]{color:#140A0E}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.tag{background:var(--surface-2);border:1px solid var(--line);border-radius:7px;padding:5px 9px;
  font-size:12.5px;color:var(--ink-2)}

.score{font-weight:600;font-size:15px;color:var(--wine);white-space:nowrap;font-variant-numeric:tabular-nums}
.badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 11px;font-size:12px;font-weight:500}
.b-green{background:rgba(27,122,71,.1);color:var(--ok)}
.b-yellow{background:rgba(169,108,0,.12);color:var(--warn)}
.b-red{background:rgba(179,38,30,.1);color:var(--bad)}
.b-wine{background:var(--wine-tint);color:var(--wine);border:1px solid var(--wine-line)}
.bar{height:6px;background:var(--surface-2);border:1px solid var(--line);border-radius:99px;overflow:hidden}
.bar>i{display:block;height:100%;background:var(--wine);border-radius:99px;transition:width .6s cubic-bezier(.4,0,.2,1)}
.ring{position:relative;flex:none}
.ring svg{transform:rotate(-90deg)}
.ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--wine);font-variant-numeric:tabular-nums}

.divide>*+*{border-top:1px solid var(--line)}
.steps{display:flex;gap:8px;margin-bottom:28px}
.steps i{height:3px;flex:1;background:var(--line);border-radius:2px;transition:background .3s}
.steps i[data-on="1"]{background:var(--wine)}
.kanban{display:flex;gap:14px;overflow-x:auto;padding-bottom:12px}
.kcol{min-width:252px;width:252px;flex:none;background:var(--surface-2);border:1px solid var(--line);
  border-radius:var(--radius);padding:12px}
.kcol[data-over="1"]{border-color:var(--wine);background:var(--wine-tint)}
.kcard{background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:13px;margin-bottom:10px;cursor:grab}
.kcard:hover{border-color:var(--wine-line);box-shadow:var(--shadow)}
.note{background:var(--wine-tint);border:1px solid var(--wine-line);border-radius:var(--radius);padding:15px 17px;font-size:13.5px;color:var(--ink-2);line-height:1.6}
.empty{text-align:center;padding:60px 24px;border:1px dashed var(--line);border-radius:var(--radius);background:var(--surface-2)}
.toast{position:fixed;left:50%;bottom:calc(28px + var(--barh));transform:translateX(-50%);background:var(--ink);color:var(--bg);
  padding:12px 20px;border-radius:99px;font-size:14px;z-index:90;box-shadow:var(--shadow);animation:up .25s ease}
@keyframes up{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
.mobnav{display:none}
.sec{padding-top:84px;padding-bottom:84px}

.ink-panel{background:var(--ink);color:#fff;border-radius:18px;padding:52px}
.ink-panel h2,.ink-panel h3{color:#fff}
.ink-panel p{color:rgba(255,255,255,.72)}
.jm[data-theme="dark"] .ink-panel{background:var(--surface-2);border:1px solid var(--line)}

.hero-demo{border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:var(--shadow);overflow:hidden}
.hero-demo .top{border-bottom:1px solid var(--line);padding:13px 18px;background:var(--surface-2)}
.dot{width:9px;height:9px;border-radius:99px;background:var(--line);display:inline-block;margin-right:6px}
.num{width:34px;height:34px;border-radius:99px;border:1px solid var(--wine-line);color:var(--wine);
  display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;flex:none;font-family:var(--display)}
.skel{animation:sk 1.2s ease-in-out infinite;background:var(--surface-2);border-radius:10px}
@keyframes sk{0%,100%{opacity:.5}50%{opacity:1}}
.fade{animation:fade .4s ease both}
@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.sheet{position:fixed;inset:0;background:rgba(12,14,19,.5);backdrop-filter:blur(3px);display:flex;
  align-items:center;justify-content:center;padding:20px;z-index:80;animation:fade .2s ease both}
@media print{.jm{background:#fff}.jm *{visibility:hidden}.cv-print,.cv-print *{visibility:visible}
  .cv-print{position:absolute;left:0;top:0;width:100%;border:0!important;box-shadow:none!important}.cv-print button{display:none}}
/* faixa de doação fixa */
.jm{--barh:0px}
.jm[data-bar="1"]{--barh:58px}
.donatebar{position:fixed;left:0;right:0;bottom:0;z-index:55;background:#7A1B2E;color:#fff;height:58px;
  box-shadow:0 -6px 24px rgba(18,22,31,.12);animation:barin .35s ease both}
@keyframes barin{from{transform:translateY(100%)}to{transform:none}}
.donatebar .inner{height:100%;display:flex;align-items:center;gap:14px}
.donatebar b{font-weight:600;font-size:15px;letter-spacing:-.005em}
.donatebar .sub{color:rgba(255,255,255,.75);font-size:13.5px}
.donatebar .cta{background:#fff;color:#7A1B2E;border:0;border-radius:8px;padding:9px 16px;font-weight:600;font-size:14px;cursor:pointer;white-space:nowrap}
.donatebar .cta:hover{background:#FBF4F5}
.donatebar .fechar{background:none;border:0;color:rgba(255,255,255,.8);cursor:pointer;padding:8px;border-radius:6px;display:flex}
.donatebar .fechar:hover{background:rgba(255,255,255,.12);color:#fff}
.jm{padding-bottom:var(--barh)}
.fab{position:fixed;right:20px;bottom:calc(24px + var(--barh));z-index:60}
.fabpanel{position:fixed;right:20px;bottom:calc(90px + var(--barh));z-index:60}

/* rodapé */
.foot{border-top:1px solid var(--line);background:var(--surface-2);margin-top:40px}
.foot .cols{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:32px;padding:44px 0 28px}
.foot h4{font-size:13px;font-weight:600;margin-bottom:12px;color:var(--ink)}
.foot button.lk{display:block;background:none;border:0;padding:4px 0;color:var(--ink-2);font-size:14px;cursor:pointer;text-align:left}
.foot button.lk:hover{color:var(--wine)}
.foot .base{border-top:1px solid var(--line);padding:18px 0 22px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}

/* cadastro rápido e blocos de tipo de trabalho */
.tipos{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:12px}
.tipo{border:1.5px solid var(--line);background:var(--surface);border-radius:12px;padding:16px 14px;text-align:left;cursor:pointer;
  display:flex;flex-direction:column;gap:10px;transition:border-color .15s,background .15s,transform .1s;color:var(--ink);min-height:112px;position:relative}
.tipo:hover{border-color:var(--ink-3)}
.tipo:active{transform:scale(.98)}
.tipo .ico{width:40px;height:40px;border-radius:10px;background:var(--wine-tint);color:var(--wine);display:flex;align-items:center;justify-content:center}
.tipo b{font-size:14.5px;font-weight:600;line-height:1.25}
.tipo small{font-size:12.5px;color:var(--ink-3);line-height:1.35}
.tipo[data-on="1"]{border-color:var(--wine);background:var(--wine-tint)}
.tipo[data-on="1"] .ico{background:var(--wine);color:#fff}
.tipo .ok{position:absolute;top:10px;right:10px;width:22px;height:22px;border-radius:99px;background:var(--wine);color:#fff;display:flex;align-items:center;justify-content:center}
.opcoes{display:grid;gap:10px}
.opcao{border:1.5px solid var(--line);background:var(--surface);border-radius:12px;padding:15px 16px;text-align:left;cursor:pointer;display:flex;gap:12px;align-items:center;color:var(--ink);font-size:15px}
.opcao:hover{border-color:var(--ink-3)}
.opcao[data-on="1"]{border-color:var(--wine);background:var(--wine-tint)}
.opcao .rd{width:20px;height:20px;border-radius:99px;border:2px solid var(--line);flex:none;display:flex;align-items:center;justify-content:center}
.opcao[data-on="1"] .rd{border-color:var(--wine)}
.opcao[data-on="1"] .rd:after{content:"";width:10px;height:10px;border-radius:99px;background:var(--wine)}
.opcao small{display:block;color:var(--ink-3);font-size:13px;margin-top:2px}
.big .input{font-size:16px;padding:14px 15px}
.passo{font-size:13px;color:var(--ink-3);font-weight:500}
.trust{display:flex;gap:18px;flex-wrap:wrap}
.trust span{display:inline-flex;align-items:center;gap:7px;font-size:14px;color:var(--ink-2)}
.trust span svg{color:var(--wine)}
.mobnav button svg{width:21px;height:21px}
.only-m{display:none}
.chips.rolar{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.chips.rolar::-webkit-scrollbar{display:none}
.chips.rolar .chip{flex:none}
@media (max-width:900px){
  .only-m{display:inline}
  .foot .cols{grid-template-columns:1fr 1fr;gap:26px}
  .donatebar .sub{display:none}
  .donatebar b{font-size:13.5px}
  .jm[data-bar="1"][data-logged="1"] .donatebar{bottom:64px}
  .jm[data-logged="1"]{--navh:64px}
  .fab{bottom:calc(84px + var(--barh))}
  .fabpanel{bottom:calc(148px + var(--barh))}
  .jm[data-logged="1"] .toast{bottom:calc(84px + var(--barh))}
}
@media (max-width:520px){
  .hdr .inner{gap:10px}
  .hdr .inner > .row{gap:2px}
  .hdr .btn-g{padding:8px 7px}
  .logo .col > span:last-child{font-size:9.5px!important}
  .tipos{grid-template-columns:1fr 1fr;gap:10px}
  .tipo{min-height:104px;padding:14px 12px}
  .donatebar .inner{gap:10px}
  .donatebar .cta{padding:8px 12px;font-size:13px}
}
@media (prefers-reduced-motion: reduce){.jm *{animation:none!important;transition:none!important}}

@media (max-width:1180px){.nav{gap:16px}.nav button{font-size:13.5px}}
@media (max-width:900px){
  .wrap{padding:0 18px}
  .nav{display:none}
  .grid2,.grid3{grid-template-columns:1fr}
  .sec{padding-top:52px;padding-bottom:52px}
  .ink-panel{padding:30px;border-radius:14px}
  .hide-m{display:none!important}
  .mobnav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:50;background:var(--surface);
    border-top:1px solid var(--line);padding:6px 2px 10px}
  .mobnav button{flex:1;background:none;border:0;display:flex;flex-direction:column;align-items:center;
    gap:3px;font-size:10px;color:var(--ink-3);cursor:pointer;padding:6px 2px}
  .mobnav button[data-on="1"]{color:var(--wine)}
  .pad-m{padding-bottom:84px}
}
`;

/* ------------------------------- DADOS ---------------------------------- */
/* INTEGRAÇÃO: substituir por API autorizada de vagas (feed/ATS parceiro).   */

const COMPANIES = [
  { id: "c1", name: "Banco Aurora", sector: "Fintech", size: "+5.000", city: "São Paulo", verified: true, culture: ["Crescimento rápido", "Trabalho colaborativo"] },
  { id: "c2", name: "Lar Digital", sector: "Proptech", size: "1.000–5.000", city: "São Paulo", verified: true, culture: ["Startup", "Flexibilidade"] },
  { id: "c3", name: "Bebidas Horizonte", sector: "Indústria / Tech", size: "+5.000", city: "Belo Horizonte", verified: true, culture: ["Empresa grande", "Estabilidade"] },
  { id: "c4", name: "Dataforma", sector: "Consultoria de dados", size: "200–1.000", city: "Remoto", verified: true, culture: ["Startup", "Crescimento rápido"] },
  { id: "c5", name: "Hospital Santa Clara", sector: "Saúde", size: "+5.000", city: "São Paulo", verified: true, culture: ["Estabilidade", "Empresa grande"] },
  { id: "c6", name: "Perfumaria Flor de Lis", sector: "Varejo", size: "+5.000", city: "Curitiba", verified: false, culture: ["Empresa grande", "Liderança"] },
  { id: "c7", name: "Supermercado Bom Preço", sector: "Supermercado", size: "1.000–5.000", city: "São Paulo", verified: true, culture: ["Empresa grande", "Estabilidade"] },
  { id: "c8", name: "Farmácia Vida", sector: "Farmácia", size: "200–1.000", city: "São Paulo", verified: true, culture: ["Empresa pequena", "Trabalho colaborativo"] },
  { id: "c9", name: "Transportes Rota Sul", sector: "Logística", size: "1.000–5.000", city: "Guarulhos", verified: true, culture: ["Estabilidade", "Trabalho independente"] },
  { id: "c10", name: "Restaurante Sabor Mineiro", sector: "Alimentação", size: "1–200", city: "São Paulo", verified: false, culture: ["Empresa pequena", "Trabalho colaborativo"] },
  { id: "c11", name: "Clean Serviços", sector: "Limpeza e facilities", size: "200–1.000", city: "São Paulo", verified: true, culture: ["Estabilidade", "Trabalho colaborativo"] },
  { id: "c12", name: "Burger Prime", sector: "Fast food", size: "1.000–5.000", city: "São Paulo", verified: true, culture: ["Primeiro emprego", "Trabalho colaborativo"] },
  { id: "c13", name: "Padaria Pão Quente", sector: "Padaria", size: "1–200", city: "São Paulo", verified: true, culture: ["Empresa pequena", "Estabilidade"] },
  { id: "c14", name: "Lojas Popular Calçados", sector: "Loja de calçados", size: "200–1.000", city: "São Paulo", verified: true, culture: ["Empresa grande", "Crescimento rápido"] },
  { id: "c15", name: "Conecta Contact Center", sector: "Telemarketing", size: "1.000–5.000", city: "São Paulo", verified: true, culture: ["Primeiro emprego", "Empresa grande"] },
  { id: "c16", name: "Construtora Alvorada", sector: "Construção civil", size: "200–1.000", city: "São Paulo", verified: true, culture: ["Estabilidade", "Trabalho colaborativo"] },
  { id: "c17", name: "Zeladoria Predial SP", sector: "Portaria e zeladoria", size: "200–1.000", city: "São Paulo", verified: true, culture: ["Estabilidade", "Trabalho independente"] },
  { id: "c19", name: "Família Albuquerque", sector: "Contratante particular", size: "—", city: "São Paulo", verified: false, culture: ["Flexibilidade"] },
  { id: "c20", name: "Buffet Festa Boa", sector: "Eventos", size: "11–50", city: "São Paulo", verified: true, culture: ["Trabalho colaborativo"] },
  { id: "c21", name: "Mudanças Leste Rápido", sector: "Mudanças e fretes", size: "11–50", city: "São Paulo", verified: true, culture: ["Trabalho colaborativo"] },
  { id: "c22", name: "Lava Rápido Brilho", sector: "Lava-rápido", size: "1–10", city: "São Paulo", verified: true, culture: ["Empresa pequena"] },
  { id: "c23", name: "Juliana P.", sector: "Contratante particular", size: "—", city: "São Paulo", verified: false, culture: ["Flexibilidade"] },
  { id: "c24", name: "Móveis Casa Nova", sector: "Loja de móveis", size: "51–200", city: "São Paulo", verified: true, culture: ["Estabilidade"] },
  { id: "c25", name: "Divulga Já Promoções", sector: "Divulgação", size: "11–50", city: "São Paulo", verified: true, culture: ["Primeiro emprego"] },
  { id: "c26", name: "Rafael M.", sector: "Contratante particular", size: "—", city: "São Paulo", verified: false, culture: ["Flexibilidade"] },
  { id: "c18", name: "Cuidar Bem", sector: "Cuidados e saúde", size: "1–200", city: "São Paulo", verified: true, culture: ["Empresa pequena", "Flexibilidade"] },
];

const JOBS = [
  { id: "j1", title: "Analista de Dados Pleno", companyId: "c1", area: "Dados", city: "São Paulo", state: "SP", model: "Remoto", contract: "CLT", sMin: 8000, sMax: 11000, seniority: "Pleno", years: 3, edu: "Graduação", langs: [["Inglês", "Intermediário"]], posted: 1, skills: ["SQL", "Power BI", "Python", "Modelagem de dados", "ETL"], benefits: ["Plano de saúde", "Vale refeição", "Auxílio home office", "PLR"], desc: "Construir análises e painéis que apoiam decisões de produto e crédito, trabalhando próximo às áreas de negócio." },
  { id: "j2", title: "Analista de BI Sênior", companyId: "c4", area: "Dados", city: "Remoto", state: "—", model: "Remoto", contract: "PJ", sMin: 10000, sMax: 14000, seniority: "Sênior", years: 5, edu: "Graduação", langs: [["Inglês", "Avançado"]], posted: 2, skills: ["Power BI", "SQL", "Azure", "DAX", "Data Warehouse"], benefits: ["Horário flexível", "Auxílio educação"], desc: "Liderar projetos de BI em clientes de médio e grande porte, do levantamento de requisitos à entrega do painel." },
  { id: "j3", title: "Analista de Dados Júnior", companyId: "c2", area: "Dados", city: "São Paulo", state: "SP", model: "Híbrido", contract: "CLT", sMin: 4500, sMax: 6000, seniority: "Júnior", years: 1, edu: "Graduação", langs: [], posted: 1, skills: ["SQL", "Excel", "Python"], benefits: ["Vale refeição", "Gympass"], desc: "Apoiar o time de dados na construção de relatórios recorrentes e na qualidade das bases." },
  { id: "j4", title: "Engenheiro(a) de Dados Pleno", companyId: "c3", area: "Dados", city: "Belo Horizonte", state: "MG", model: "Híbrido", contract: "CLT", sMin: 11000, sMax: 15000, seniority: "Pleno", years: 4, edu: "Graduação", langs: [["Inglês", "Intermediário"]], posted: 4, skills: ["Python", "Spark", "Airflow", "SQL", "AWS"], benefits: ["Plano de saúde", "PLR", "Previdência privada"], desc: "Desenvolver e manter pipelines de dados em ambiente cloud para produtos internos." },
  { id: "j5", title: "Especialista em Analytics", companyId: "c5", area: "Dados", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 13000, sMax: 17000, seniority: "Sênior", years: 6, edu: "Pós-graduação", langs: [["Inglês", "Avançado"]], posted: 6, skills: ["SQL", "Estatística", "Python", "Power BI", "Storytelling"], benefits: ["Plano de saúde", "Estacionamento"], desc: "Estruturar a área de analytics clínico, definindo indicadores e modelos preditivos." },
  { id: "j6", title: "Analista de Business Intelligence", companyId: "c6", area: "Dados", city: "Curitiba", state: "PR", model: "Híbrido", contract: "CLT", sMin: 7000, sMax: 9000, seniority: "Pleno", years: 3, edu: "Graduação", langs: [], posted: 3, skills: ["Power BI", "SQL", "Excel", "Google Analytics"], benefits: ["Vale refeição", "Desconto em produtos"], desc: "Sustentar os painéis de vendas do varejo e apoiar campanhas com análises de comportamento." },
  { id: "j7", title: "Product Analyst", companyId: "c2", area: "Produto", city: "São Paulo", state: "SP", model: "Remoto", contract: "CLT", sMin: 9000, sMax: 12000, seniority: "Pleno", years: 3, edu: "Graduação", langs: [["Inglês", "Intermediário"]], posted: 2, skills: ["SQL", "Amplitude", "Testes A/B", "Python"], benefits: ["Auxílio home office", "Plano de saúde"], desc: "Medir o impacto das entregas de produto e transformar dados de uso em decisões." },
  { id: "j8", title: "Cientista de Dados Pleno", companyId: "c1", area: "Dados", city: "São Paulo", state: "SP", model: "Remoto", contract: "CLT", sMin: 12000, sMax: 16000, seniority: "Pleno", years: 4, edu: "Graduação", langs: [["Inglês", "Avançado"]], posted: 5, skills: ["Python", "Machine Learning", "SQL", "Estatística"], benefits: ["PLR", "Plano de saúde", "Auxílio creche"], desc: "Desenvolver modelos de risco e de propensão em escala." },
  { id: "j9", title: "Analista de Dados (Marketing)", companyId: "c6", area: "Marketing", city: "Remoto", state: "—", model: "Remoto", contract: "CLT", sMin: 6500, sMax: 8500, seniority: "Pleno", years: 2, edu: "Graduação", langs: [], posted: 1, skills: ["SQL", "Google Analytics", "Power BI", "Excel"], benefits: ["Horário flexível", "Vale refeição"], desc: "Analisar performance de mídia e jornada do cliente para o time de crescimento." },
  { id: "j41", title: "Diarista — terças e sextas", companyId: "c19", particular: true, area: "Serviços", city: "São Paulo", state: "SP", model: "Presencial", contract: "Diária", sMin: 170, sMax: 190, unit: "/dia", seniority: "Júnior", years: 1, edu: "Não estudei", langs: [], posted: 0, skills: ["Organização", "Responsabilidade"], benefits: ["Pagamento no dia", "Vale transporte"], desc: "Limpeza completa de apartamento de 3 quartos em Moema, às terças e sextas, das 8h às 16h. Material de limpeza fornecido. Pagamento por Pix no fim de cada dia." },
  { id: "j42", title: "Garçom extra para casamento", companyId: "c20", area: "Alimentação", city: "São Paulo", state: "SP", model: "Presencial", contract: "Diária", sMin: 160, sMax: 180, unit: "/dia", seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 1, skills: ["Atendimento ao cliente", "Agilidade", "Trabalho em equipe"], benefits: ["Pagamento no dia", "Refeição no local"], desc: "Sábado, das 17h à 1h, casamento para 200 convidados. Camisa fornecida pelo buffet; venha de calça e sapato pretos. Treinamento rápido antes do evento." },
  { id: "j43", title: "Ajudante de mudança (sábado)", companyId: "c21", area: "Logística", city: "São Paulo", state: "SP", model: "Presencial", contract: "Diária", sMin: 150, sMax: 170, unit: "/dia", seniority: "Júnior", years: 0, edu: "Não estudei", langs: [], posted: 0, skills: ["Esforço físico", "Trabalho em equipe"], benefits: ["Pagamento no dia", "Refeição no local"], desc: "Carregar e organizar móveis e caixas numa mudança residencial na Penha. Das 7h até terminar (previsão 15h). Não precisa de experiência." },
  { id: "j44", title: "Passeador(a) de cães", companyId: "c23", particular: true, area: "Serviços", city: "São Paulo", state: "SP", model: "Presencial", contract: "Por hora", sMin: 25, sMax: 30, unit: "/hora", seniority: "Júnior", years: 0, edu: "Não estudei", langs: [], posted: 2, skills: ["Responsabilidade", "Experiência com animais"], desc: "Dois passeios por dia, de manhã e no fim da tarde, com dois cães de porte médio em Pinheiros. 40 minutos cada passeio, de segunda a sexta.", benefits: ["Pagamento semanal"] },
  { id: "j45", title: "Pintor(a) — 10 diárias garantidas", companyId: "c16", area: "Construção", city: "São Paulo", state: "SP", model: "Presencial", contract: "Diária", sMin: 200, sMax: 240, unit: "/dia", seniority: "Júnior", years: 1, edu: "Não estudei", langs: [], posted: 1, skills: ["Esforço físico", "Pequenos reparos"], benefits: ["Pagamento no dia", "Material fornecido", "Refeição na obra"], desc: "Pintura interna de 3 apartamentos na Vila Prudente. 10 dias de trabalho garantidos, com chance de continuar na próxima obra." },
  { id: "j46", title: "Montador(a) de móveis", companyId: "c24", area: "Serviços", city: "São Paulo", state: "SP", model: "Presencial", contract: "Freelancer", sMin: 180, sMax: 230, unit: "/dia", seniority: "Júnior", years: 1, edu: "Fundamental", langs: [], posted: 3, skills: ["Pequenos reparos", "Organização"], benefits: ["Pagamento semanal", "Vale transporte"], desc: "Montagem de móveis na casa dos clientes da loja, com rota definida no dia anterior. Ferramentas próprias são um diferencial." },
  { id: "j47", title: "Lavador(a) de carros", companyId: "c22", area: "Serviços", city: "São Paulo", state: "SP", model: "Presencial", contract: "Diária", sMin: 100, sMax: 120, unit: "/dia", seniority: "Júnior", years: 0, edu: "Não estudei", langs: [], posted: 1, skills: ["Agilidade", "Organização"], benefits: ["Pagamento no dia", "Refeição no local"], desc: "Lavagem simples e completa, de terça a sábado, das 8h às 17h, no Tatuapé. Ensinamos tudo no primeiro dia." },
  { id: "j48", title: "Ajudante de cozinha — fins de semana", companyId: "c10", area: "Alimentação", city: "São Paulo", state: "SP", model: "Presencial", contract: "Diária", sMin: 130, sMax: 150, unit: "/dia", seniority: "Júnior", years: 0, edu: "Fundamental incompleto", langs: [], posted: 0, skills: ["Preparo de alimentos", "Higiene e manipulação de alimentos"], benefits: ["Pagamento no dia", "Refeição no local"], desc: "Sábados e domingos, das 10h às 17h. Pré-preparo, lavar louça e manter a cozinha organizada durante o almoço." },
  { id: "j49", title: "Panfletagem — meio período", companyId: "c25", area: "Vendas", city: "São Paulo", state: "SP", model: "Presencial", contract: "Diária", sMin: 70, sMax: 90, unit: "/dia", seniority: "Júnior", years: 0, edu: "Não estudei", langs: [], posted: 2, skills: ["Comunicação", "Agilidade"], benefits: ["Pagamento no dia", "Vale transporte"], desc: "Entrega de folhetos no centro, das 9h às 13h, de segunda a sexta. Bom para quem estuda à tarde." },
  { id: "j50", title: "Faxina pós-obra (2 dias)", companyId: "c26", particular: true, area: "Serviços", city: "São Paulo", state: "SP", model: "Presencial", contract: "Diária", sMin: 220, sMax: 250, unit: "/dia", seniority: "Júnior", years: 1, edu: "Não estudei", langs: [], posted: 1, skills: ["Organização", "Esforço físico"], benefits: ["Pagamento no dia"], desc: "Limpeza pesada de casa recém-reformada na Mooca: tirar respingos de tinta, poeira de obra e limpar vidros. Dois dias, sexta e sábado." },
  { id: "j51", title: "Babá — sábados à noite", companyId: "c23", particular: true, area: "Cuidados", city: "São Paulo", state: "SP", model: "Presencial", contract: "Por hora", sMin: 30, sMax: 35, unit: "/hora", seniority: "Júnior", years: 1, edu: "Médio", langs: [], posted: 3, skills: ["Paciência", "Responsabilidade"], benefits: ["Transporte de volta pago"], desc: "Cuidar de uma criança de 6 anos aos sábados, das 19h às 23h, em Pinheiros. Referências de outras famílias são bem-vindas." },
  { id: "j21", title: "Atendente de Fast Food", companyId: "c12", area: "Alimentação", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1550, sMax: 1850, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 1, skills: ["Atendimento ao cliente", "Trabalho em equipe", "Agilidade"], benefits: ["Refeição no local", "Vale transporte", "Plano de saúde"], desc: "Atender no caixa e no balcão, montar pedidos e manter o salão limpo. Não precisa de experiência: o treinamento é feito na loja. Aceita primeiro emprego e maiores de 16 anos como aprendiz." },
  { id: "j22", title: "Chapeiro(a)", companyId: "c12", area: "Alimentação", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1700, sMax: 2100, seniority: "Júnior", years: 1, edu: "Fundamental incompleto", langs: [], posted: 2, skills: ["Preparo de alimentos", "Agilidade", "Higiene e manipulação de alimentos"], benefits: ["Refeição no local", "Vale transporte"], desc: "Preparar lanches na chapa durante o turno, seguindo o padrão da rede. Escala 6x1 com folga na semana." },
  { id: "j23", title: "Atendente de Padaria", companyId: "c13", area: "Alimentação", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1600, sMax: 1900, seniority: "Júnior", years: 0, edu: "Fundamental incompleto", langs: [], posted: 1, skills: ["Atendimento ao cliente", "Organização", "Trabalho em equipe"], benefits: ["Refeição no local", "Vale transporte", "Cesta básica"], desc: "Atender no balcão, montar as bandejas e repor os produtos. Turno da manhã, das 6h às 14h." },
  { id: "j24", title: "Auxiliar de Padeiro", companyId: "c13", area: "Alimentação", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1750, sMax: 2100, seniority: "Júnior", years: 0, edu: "Não estudei", langs: [], posted: 3, skills: ["Preparo de alimentos", "Trabalho em equipe", "Responsabilidade"], benefits: ["Refeição no local", "Cesta básica", "Vale transporte"], desc: "Ajudar o padeiro no preparo e na assadeira. Aprende na prática, sem exigência de escolaridade." },
  { id: "j25", title: "Garçom / Garçonete", companyId: "c10", area: "Alimentação", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1600, sMax: 2200, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 2, skills: ["Atendimento ao cliente", "Agilidade", "Trabalho em equipe"], benefits: ["Refeição no local", "Gorjeta", "Vale transporte"], desc: "Anotar pedidos, servir as mesas e organizar o salão no horário do almoço." },
  { id: "j26", title: "Empacotador(a)", companyId: "c7", area: "Varejo", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1450, sMax: 1620, seniority: "Júnior", years: 0, edu: "Fundamental incompleto", langs: [], posted: 1, skills: ["Agilidade", "Trabalho em equipe", "Atendimento ao cliente"], benefits: ["Cesta básica", "Vale transporte"], desc: "Empacotar as compras no caixa e ajudar o cliente até o carro. Ótima porta de entrada: quem se destaca costuma virar operador de caixa." },
  { id: "j27", title: "Estoquista", companyId: "c14", area: "Varejo", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1700, sMax: 2000, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 2, skills: ["Organização", "Controle de estoque", "Trabalho em equipe"], benefits: ["Vale transporte", "Vale refeição", "Desconto na loja"], desc: "Receber mercadoria, conferir e organizar o depósito da loja." },
  { id: "j28", title: "Vendedor(a) de Calçados", companyId: "c14", area: "Vendas", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1600, sMax: 2800, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 1, skills: ["Vendas", "Atendimento ao cliente", "Comunicação"], benefits: ["Comissão", "Vale transporte", "Desconto na loja"], desc: "Atender na loja e vender. Salário fixo mais comissão: quem vende bem tira acima de R$ 2.500." },
  { id: "j29", title: "Operador(a) de Telemarketing", companyId: "c15", area: "Atendimento", city: "São Paulo", state: "SP", model: "Híbrido", contract: "CLT", sMin: 1500, sMax: 1900, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 1, skills: ["Comunicação", "Atendimento ao cliente", "Informática básica"], benefits: ["Vale transporte", "Vale refeição", "Plano de saúde", "Comissão"], desc: "Atender clientes por telefone em turno de 6 horas. Treinamento pago de 10 dias, sem exigência de experiência." },
  { id: "j30", title: "Porteiro(a)", companyId: "c17", area: "Portaria", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1900, sMax: 2300, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 3, skills: ["Responsabilidade", "Atendimento ao cliente", "Comunicação"], benefits: ["Vale transporte", "Cesta básica", "Adicional noturno"], desc: "Controlar a entrada do prédio, receber encomendas e anotar as ocorrências. Escala 12x36, com opção de turno noturno." },
  { id: "j31", title: "Zelador(a)", companyId: "c17", area: "Serviços", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1800, sMax: 2200, seniority: "Júnior", years: 1, edu: "Fundamental incompleto", langs: [], posted: 4, skills: ["Organização", "Responsabilidade", "Pequenos reparos"], benefits: ["Vale transporte", "Cesta básica", "Moradia no local"], desc: "Cuidar da conservação do condomínio e acompanhar prestadores de serviço. Algumas unidades oferecem moradia." },
  { id: "j32", title: "Ajudante de Pedreiro", companyId: "c16", area: "Construção", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1800, sMax: 2200, seniority: "Júnior", years: 0, edu: "Não estudei", langs: [], posted: 2, skills: ["Trabalho em equipe", "Esforço físico", "Segurança do trabalho"], benefits: ["Vale transporte", "Cesta básica", "Refeição na obra"], desc: "Auxiliar o pedreiro no preparo de massa, transporte de material e limpeza da obra. Não exige experiência nem escolaridade." },
  { id: "j33", title: "Servente de Obra", companyId: "c16", area: "Construção", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1700, sMax: 2000, seniority: "Júnior", years: 0, edu: "Não estudei", langs: [], posted: 5, skills: ["Esforço físico", "Trabalho em equipe", "Segurança do trabalho"], benefits: ["Vale transporte", "Refeição na obra"], desc: "Organizar e limpar o canteiro de obras, carregar material e apoiar as equipes." },
  { id: "j34", title: "Cuidador(a) de Idosos", companyId: "c18", area: "Cuidados", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 2000, sMax: 2600, seniority: "Júnior", years: 1, edu: "Fundamental", langs: [], posted: 1, skills: ["Paciência", "Responsabilidade", "Cuidados básicos de saúde"], benefits: ["Vale transporte", "Vale refeição", "Curso pago pela empresa"], desc: "Acompanhar o idoso na rotina do dia, medicação nos horários e companhia. A empresa paga o curso de cuidador para quem for aprovado." },
  { id: "j35", title: "Babá", companyId: "c18", area: "Cuidados", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1800, sMax: 2400, seniority: "Júnior", years: 1, edu: "Fundamental", langs: [], posted: 3, skills: ["Paciência", "Responsabilidade", "Organização"], benefits: ["Vale transporte", "Refeição no local"], desc: "Cuidar de duas crianças no período da tarde, incluindo lanche e apoio na lição de casa." },
  { id: "j36", title: "Ajudante de Carga e Descarga", companyId: "c9", area: "Logística", city: "Guarulhos", state: "SP", model: "Presencial", contract: "CLT", sMin: 1700, sMax: 2000, seniority: "Júnior", years: 0, edu: "Não estudei", langs: [], posted: 2, skills: ["Esforço físico", "Trabalho em equipe", "Organização"], benefits: ["Vale transporte", "Cesta básica", "Vale refeição"], desc: "Carregar e descarregar caminhões e conferir a mercadoria no galpão." },
  { id: "j37", title: "Entregador(a) de Delivery", companyId: "c12", area: "Logística", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1900, sMax: 2600, seniority: "Júnior", years: 0, edu: "Fundamental incompleto", langs: [], posted: 1, skills: ["CNH A", "Agilidade", "Atendimento ao cliente"], benefits: ["Vale combustível", "Refeição no local", "Vale transporte"], desc: "Entregar pedidos na região da loja usando moto própria. Ajuda de custo para combustível e manutenção." },
  { id: "j38", title: "Auxiliar de Lavanderia", companyId: "c11", area: "Serviços", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1550, sMax: 1800, seniority: "Júnior", years: 0, edu: "Fundamental incompleto", langs: [], posted: 4, skills: ["Organização", "Responsabilidade", "Trabalho em equipe"], benefits: ["Vale transporte", "Vale refeição", "Uniforme"], desc: "Separar, lavar e dobrar peças em lavanderia industrial. Treinamento na primeira semana." },
  { id: "j39", title: "Jardineiro(a)", companyId: "c17", area: "Serviços", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1700, sMax: 2100, seniority: "Júnior", years: 0, edu: "Não estudei", langs: [], posted: 6, skills: ["Esforço físico", "Responsabilidade", "Organização"], benefits: ["Vale transporte", "Cesta básica"], desc: "Cuidar dos jardins e áreas comuns de três condomínios, com material fornecido." },
  { id: "j40", title: "Jovem Aprendiz — Administrativo", companyId: "c15", area: "Administrativo", city: "São Paulo", state: "SP", model: "Presencial", contract: "Aprendiz", sMin: 900, sMax: 1100, seniority: "Júnior", years: 0, edu: "Médio incompleto", langs: [], posted: 1, skills: ["Informática básica", "Organização", "Comunicação"], benefits: ["Vale transporte", "Vale refeição", "Curso gratuito"], desc: "Programa para jovens de 16 a 22 anos que estão estudando. Meio período, com curso profissionalizante pago pela empresa." },
  { id: "j11", title: "Operador(a) de Caixa", companyId: "c7", area: "Atendimento", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1620, sMax: 1900, seniority: "Júnior", years: 0, edu: "Médio", langs: [], posted: 1, skills: ["Atendimento ao cliente", "Organização", "Trabalho em equipe"], benefits: ["Vale transporte", "Cesta básica", "Refeição no local"], desc: "Registrar as compras, receber pagamentos e atender os clientes com agilidade e simpatia. Não é preciso experiência anterior: há treinamento na primeira semana." },
  { id: "j12", title: "Repositor(a) de Mercadorias", companyId: "c7", area: "Varejo", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1520, sMax: 1750, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 2, skills: ["Organização", "Trabalho em equipe", "Controle de validade"], benefits: ["Vale transporte", "Cesta básica"], desc: "Abastecer as prateleiras, conferir validade e manter o setor organizado. Escala 6x1." },
  { id: "j13", title: "Atendente de Farmácia", companyId: "c8", area: "Atendimento", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1800, sMax: 2200, seniority: "Júnior", years: 1, edu: "Médio", langs: [], posted: 1, skills: ["Atendimento ao cliente", "Vendas", "Informática básica"], benefits: ["Vale transporte", "Desconto em medicamentos", "Comissão"], desc: "Atender no balcão, orientar sobre produtos de conveniência e operar o sistema da loja." },
  { id: "j14", title: "Auxiliar de Limpeza", companyId: "c11", area: "Serviços", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1550, sMax: 1800, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 3, skills: ["Organização", "Responsabilidade", "Trabalho em equipe"], benefits: ["Vale transporte", "Vale refeição", "Uniforme"], desc: "Limpeza e conservação de escritórios em horário comercial. Material e uniforme fornecidos." },
  { id: "j15", title: "Motorista Entregador", companyId: "c9", area: "Logística", city: "Guarulhos", state: "SP", model: "Presencial", contract: "CLT", sMin: 2400, sMax: 2900, seniority: "Pleno", years: 2, edu: "Médio", langs: [], posted: 2, skills: ["CNH B", "Direção defensiva", "Atendimento ao cliente", "Organização"], benefits: ["Vale transporte", "Vale refeição", "Plano de saúde"], desc: "Realizar entregas na região metropolitana com veículo da empresa, conferindo carga e comprovantes." },
  { id: "j16", title: "Auxiliar de Cozinha", companyId: "c10", area: "Alimentação", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 1600, sMax: 1900, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 4, skills: ["Higiene e manipulação de alimentos", "Trabalho em equipe", "Organização"], benefits: ["Refeição no local", "Vale transporte"], desc: "Apoiar a cozinha no pré-preparo, higienização e organização durante o almoço." },
  { id: "j17", title: "Recepcionista", companyId: "c5", area: "Atendimento", city: "São Paulo", state: "SP", model: "Presencial", contract: "CLT", sMin: 2000, sMax: 2400, seniority: "Júnior", years: 1, edu: "Médio", langs: [], posted: 2, skills: ["Atendimento ao cliente", "Informática básica", "Comunicação", "Organização"], benefits: ["Plano de saúde", "Vale refeição", "Vale transporte"], desc: "Receber pacientes, confirmar cadastros e encaminhar para os atendimentos." },
  { id: "j18", title: "Auxiliar Administrativo", companyId: "c9", area: "Administrativo", city: "Guarulhos", state: "SP", model: "Híbrido", contract: "CLT", sMin: 2100, sMax: 2500, seniority: "Júnior", years: 1, edu: "Médio", langs: [], posted: 1, skills: ["Excel", "Rotinas administrativas", "Organização", "Informática básica"], benefits: ["Vale transporte", "Vale refeição", "Auxílio educação"], desc: "Cuidar de planilhas, arquivos e conferência de documentos da operação." },
  { id: "j19", title: "Vendedor(a) de Loja", companyId: "c6", area: "Vendas", city: "Curitiba", state: "PR", model: "Presencial", contract: "CLT", sMin: 1800, sMax: 2600, seniority: "Júnior", years: 1, edu: "Médio", langs: [], posted: 3, skills: ["Vendas", "Atendimento ao cliente", "Comunicação"], benefits: ["Comissão", "Vale transporte", "Desconto em produtos"], desc: "Atender clientes na loja, apresentar produtos e bater metas do time." },
  { id: "j20", title: "Auxiliar de Produção", companyId: "c3", area: "Produção", city: "Belo Horizonte", state: "MG", model: "Presencial", contract: "CLT", sMin: 2000, sMax: 2300, seniority: "Júnior", years: 0, edu: "Fundamental", langs: [], posted: 5, skills: ["Trabalho em equipe", "Organização", "Segurança do trabalho"], benefits: ["Cesta básica", "Vale transporte", "Plano de saúde", "PLR"], desc: "Atuar na linha de produção seguindo os procedimentos de qualidade e segurança. Turno diurno." },
  { id: "j10", title: "Coordenador(a) de Dados", companyId: "c3", area: "Dados", city: "São Paulo", state: "SP", model: "Híbrido", contract: "CLT", sMin: 16000, sMax: 21000, seniority: "Coordenação", years: 8, edu: "Pós-graduação", langs: [["Inglês", "Avançado"]], posted: 7, skills: ["Gestão de time", "SQL", "Governança de dados", "Cloud"], benefits: ["PLR", "Previdência privada", "Plano de saúde"], desc: "Liderar time de 8 pessoas entre engenharia e análise de dados." },
];

const SYNONYMS = [
  ["analista de dados", "analista de bi", "analista de business intelligence", "product analyst", "analista de inteligência de mercado"],
  ["engenheiro de dados", "engenheiro(a) de dados", "desenvolvedor etl"],
  ["cientista de dados", "especialista em analytics", "estatístico"],
];
const SKILL_NEAR = { "power bi": ["dax", "tableau", "looker"], "sql": ["modelagem de dados", "data warehouse"], "python": ["pandas", "machine learning", "estatística"], "excel": ["google sheets"] };
const EDU_RANK = { "Não estudei": 0.4, "Fundamental incompleto": 0.7, "Fundamental": 1, "Médio incompleto": 1.5, "Médio": 2, "Técnico": 3, "Tecnólogo": 4, "Graduação": 5, "Pós-graduação": 6, "MBA": 6, "Mestrado": 7, "Doutorado": 8 };
const SEM_ESCOLA = ["Não estudei", "Fundamental incompleto", "Fundamental"];
const LANG_RANK = { "Básico": 1, "Intermediário": 2, "Avançado": 3, "Fluente": 4, "Nativo": 4 };

const DEFAULT_PROFILE = {
  name: "Ana Ribeiro", role: "Atendente", city: "São Paulo", country: "Brasil", uf: "SP", bairro: "Itaquera",
  phone: "(11) 98888-0000", email: "ana.ribeiro@email.com", tz: "GMT-3 (Brasília)", nascimento: "2003-05-14",
  photo: "AR", years: 1, cnh: "Não tenho", sobre: "Gosto de lidar com gente e aprendo rápido o sistema da loja. Sou pontual e não tenho problema com escala de fim de semana.",
  inicio: "Imediatamente", horarios: ["Manhã", "Tarde", "Fim de semana"], mudanca: false, pcd: "",
  documentos: ["RG", "CPF", "Carteira de Trabalho Digital", "Comprovante de residência"],
  cursos: [{ nome: "Atendimento ao cliente", inst: "Senac", horas: "40", ano: "2023" }],
  referencias: [{ nome: "Marcos Lima", relacao: "Gerente na Center Modas", tel: "(11) 97000-1234" }],
  mostrarSalario: false,
  languages: [{ name: "Português", level: "Nativo" }],
  education: [{ level: "Médio", course: "Ensino médio", school: "EE Prof. Silva", status: "Concluído", end: "2022", mode: "Presencial" }],
  experiences: [
    { title: "Atendente de loja", company: "Loja Center Modas", area: "Vendas", start: "2024", end: "Atual", cidade: "São Paulo", vinculo: "Carteira assinada", model: "Presencial", skills: ["Atendimento ao cliente", "Vendas"], raw: "atendia os clientes, arrumava as araras e ajudava no caixa quando enchia", results: "Atendimento aos clientes. Organização das araras. Apoio no caixa em horários de movimento." },
  ],
  skills: ["Atendimento ao cliente", "Organização", "Trabalho em equipe", "Vendas"],
  certifications: [],
  portfolio: [],
};

const DEFAULT_PREFS = {
  mainRole: "Atendente", altRoles: ["Operadora de caixa", "Vendedora", "Recepcionista"], avoidRoles: [],
  city: "São Paulo", country: "Brasil", maxKm: 20, willMove: false,
  models: ["Presencial", "Híbrido"], contracts: ["CLT", "Aprendiz", "Temporário"],
  sMin: 1500, sTarget: 1900, sIdeal: 2400, currency: "BRL",
  benefits: ["Vale transporte", "Vale refeição", "Cesta básica"],
  schedule: ["Integral", "Meio período"],
  culture: ["Trabalho colaborativo", "Estabilidade"],
  areas: ["Atendimento", "Loja e mercado"],
  minMatch: 60,
};

/* Cadastro novo começa vazio: cada pessoa recebe vagas a partir do que ela mesma informou */
const EMPTY_PROFILE = {
  name: "", role: "", city: "", country: "Brasil", uf: "", bairro: "", phone: "", email: "", tz: "GMT-3 (Brasília)", photo: "", years: 0,
  nascimento: "", cnh: "Não tenho", sobre: "", inicio: "Imediatamente", horarios: [], mudanca: false, pcd: "", documentos: [],
  cursos: [], referencias: [], mostrarSalario: false,
  languages: [{ name: "Português", level: "Nativo" }], education: [], experiences: [], skills: [], certifications: [], portfolio: [],
};
const EMPTY_PREFS = {
  ...DEFAULT_PREFS, mainRole: "", altRoles: [], avoidRoles: [], city: "", models: [], contracts: [],
  sMin: "", sTarget: "", sIdeal: "", benefits: [], culture: [], areas: [],
};

/* ------------------------------ MATCHING -------------------------------- */
const norm = (s) => (s || "").toLowerCase().trim();
const sameFamily = (a, b) => {
  if (!a || !a.trim() || !b || !b.trim()) return 0;
  a = norm(a).replace(/\s+(júnior|pleno|sênior|senior|jr|pl|sr)\b.*/, "");
  b = norm(b).replace(/\s+(júnior|pleno|sênior|senior|jr|pl|sr)\b.*/, "");
  if (!a || !b) return 0;
  if (a === b) return 1;
  if ((a.length > 3 && b.includes(a)) || (b.length > 3 && a.includes(b))) return 0.9;
  for (const g of SYNONYMS) {
    const ha = g.some((x) => a.includes(x)), hb = g.some((x) => b.includes(x));
    if (ha && hb) return 0.82;
  }
  return 0.35;
};
const skillHit = (need, have) => {
  const n = norm(need);
  if (have.some((h) => norm(h) === n)) return 1;
  if (have.some((h) => norm(h).includes(n) || n.includes(norm(h)))) return 0.85;
  const near = SKILL_NEAR[n] || [];
  if (have.some((h) => near.includes(norm(h)))) return 0.6;
  return 0;
};

/* Áreas de trabalho: reconhecidas por palavras do cargo, do que a pessoa fazia e das habilidades */
const AREA_KEYS = {
  "Alimentação": ["cozinh", "chapa", "chapeir", "lanch", "fast food", "padar", "padeir", "garç", "restaurant", "aliment", "comida", "confeit", "pizz", "salgad", "marmit", "bar "],
  "Atendimento": ["atend", "caixa", "recepç", "recepcion", "telemarketing", "balcão", "cliente", "sac"],
  "Varejo": ["repositor", "repo", "estoqu", "empacot", "mercado", "supermercado", "prateleir", "gôndola"],
  "Vendas": ["vend", "comissão", "loja", "promotor"],
  "Logística": ["motorist", "entreg", "carga", "descarga", "carreg", "moto", "caminh", "galpão", "delivery", "armazém", "motoboy"],
  "Serviços": ["limp", "faxin", "diarist", "lavand", "jardin", "zelad", "serviços gerais", "passead", "cachorro", "lav"],
  "Portaria": ["porteir", "portaria", "vigia", "controle de acesso"],
  "Construção": ["pedreir", "servente", "obra", "pintor", "pintur", "eletric", "encanad", "constru", "massa", "reboc"],
  "Cuidados": ["cuidad", "babá", "idos", "criança", "acamad", "enferm", "remédio"],
  "Administrativo": ["administr", "escritório", "arquiv", "document", "planilh", "aprendiz", "assistente"],
  "Produção": ["produç", "fábrica", "linha de", "montag", "operador de máquina", "costur", "embal"],
  "Dados": ["dados", "analista", "sql", "power bi", "python", " bi"],
  "Produto": ["produto", "product"],
  "Marketing": ["marketing", "mídia", "redes sociais"],
};
const AREA_LABELS = {
  "Comida e lanchonete": ["Alimentação"], "Atendimento": ["Atendimento"], "Loja e mercado": ["Varejo", "Vendas"],
  "Entregas e transporte": ["Logística"], "Limpeza e serviços gerais": ["Serviços"], "Portaria": ["Portaria"],
  "Obras": ["Construção"], "Cuidar de pessoas": ["Cuidados"], "Escritório": ["Administrativo"],
  "Fábrica": ["Produção"], "Tecnologia e dados": ["Dados", "Produto", "Marketing"],
  "Jardim e manutenção": ["Serviços"], "Eventos e serviços": ["Alimentação", "Serviços", "Logística"], "Carga e estoque": ["Logística", "Varejo"],
};
const detectAreas = (text) => { const t = " " + norm(text) + " "; return Object.keys(AREA_KEYS).filter((a) => AREA_KEYS[a].some((k) => t.includes(k))); };
const GENERIC = ["organização", "trabalho em equipe", "responsabilidade", "agilidade", "comunicação", "paciência"];
const STOP = ["de", "da", "do", "das", "dos", "em", "para", "com", "jovem", "júnior", "pleno", "sênior", "auxiliar", "ajudante", "assistente", "e", "o", "a"];
const toks = (s) => norm(s).replace(/\(.*?\)/g, " ").split(/[^a-zà-ú0-9]+/).filter((w) => w.length > 2 && !STOP.includes(w));
const sameWord = (a, b) => a === b || (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5));

function titleFit(role, title) {
  if (!role || !role.trim()) return 0;
  const fam = sameFamily(role, title);
  if (fam >= 0.82) return fam;
  const a = toks(role), b = toks(title);
  if (!a.length || !b.length) return 0;
  const shared = a.filter((x) => b.some((y) => sameWord(x, y))).length;
  return shared ? 0.6 + 0.4 * (shared / Math.min(a.length, b.length)) : 0;
}

function userSignals(profile, prefs) {
  const roles = [prefs.mainRole, ...(prefs.altRoles || []), ...profile.experiences.map((e) => e.title)].filter((r) => r && r.trim());
  const texto = [...roles, ...profile.experiences.map((e) => `${e.raw || ""} ${e.results || ""} ${e.area || ""}`), ...profile.skills].join(" ");
  const areas = new Set(detectAreas(texto));
  (prefs.areas || []).forEach((l) => (AREA_LABELS[l] || []).forEach((a) => areas.add(a)));
  const skills = [...new Set([...profile.skills, ...profile.experiences.flatMap((e) => e.skills || [])])];
  return { roles, areas: [...areas], skills };
}

const HORARIOS = ["Manhã", "Tarde", "Noite", "Madrugada", "Fim de semana", "Escala 6x1", "Escala 12x36"];
function matchJob(job, profile, prefs) {
  const sig = userSignals(profile, prefs);

  // 1. tipo de trabalho: cargo parecido ou mesma área que a pessoa marcou / já fez
  const tFit = sig.roles.length ? Math.max(...sig.roles.map((r) => titleFit(r, job.title))) : 0;
  const aFit = sig.areas.includes(job.area);
  const semSinal = !sig.roles.length && !sig.areas.length;
  const cargo = semSinal ? 55 : Math.round(Math.max(tFit, aFit ? 0.8 : 0, 0.12) * 100);

  // 2. habilidades: as específicas pesam mais que as genéricas
  const hits = job.skills.map((sk) => ({ s: sk, v: skillHit(sk, sig.skills), w: GENERIC.includes(norm(sk)) ? 0.5 : 1.5 }));
  const wsum = hits.reduce((a, b) => a + b.w, 0);
  const habilidades = Math.round((hits.reduce((a, b) => a + b.v * b.w, 0) / wsum) * 100);

  // 3. experiência: vaga sem exigência não penaliza quem nunca trabalhou
  const relevante = tFit >= 0.6 || aFit;
  const anos = relevante ? profile.years : profile.years * 0.5;
  const experiencia = job.years === 0 ? 100 : Math.round(Math.min(1, anos / job.years) * 100);

  // 4. escolaridade: não informar é neutro; ficar muito abaixo do pedido derruba a nota
  const need = EDU_RANK[job.edu] || 1;
  const informou = profile.education.length > 0;
  const mine = informou ? Math.max(...profile.education.map((e) => (e.status === "Cursando" || e.status === "Incompleto" ? (EDU_RANK[e.level] || 0) - 0.5 : EDU_RANK[e.level] || 0))) : null;
  const formacao = !informou ? 75 : Math.max(10, Math.min(100, Math.round((mine / need) * 100)));
  const gapEdu = informou ? need - mine : 0;
  const tetoEdu = gapEdu >= 2 ? 38 : gapEdu >= 0.8 ? 62 : 100;

  // 5. salário (convertido para valor mensal)
  const mult = UNIT_MULT[prefs.sUnit || "/mês"] || 1;
  const sMin = (+prefs.sMin || 0) * mult, sT = (+prefs.sTarget || 0) * mult, sI = (+prefs.sIdeal || 0) * mult;
  const jobMax = monthlyOf(job, job.sMax);
  const alvoSal = sT || sMin;
  const salario = !sMin && !sT && !sI ? 80 : !job.sMax ? 70 : jobMax >= (sI || sT || sMin) ? 100 : jobMax >= alvoSal ? 90
    : sMin && jobMax >= sMin ? 75 : Math.max(20, Math.round((jobMax / Math.max(1, alvoSal)) * 70));

  // 5b. horário e escala: só conta quando a vaga informa
  const hv = job.horarios || [], hp = profile.horarios || [];
  const horario = !hv.length ? null : !hp.length ? 70 : hp.includes("Qualquer horário") ? 100
    : Math.max(25, Math.round((hv.filter((h) => hp.includes(h)).length / hv.length) * 100));

  // 6. local, modelo e contrato
  const localizacao = job.model === "Remoto" ? 100 : !prefs.city ? 75 : norm(job.city) === norm(prefs.city) ? 100 : prefs.willMove ? 65 : 30;
  const modelo = !prefs.models?.length || prefs.models.includes(job.model) ? 100 : 35;
  const contrato = !prefs.contracts?.length || prefs.contracts.includes(job.contract) ? 100 : 25;

  // 7. idioma, só quando a vaga pede
  let idioma = null;
  if (job.langs.length) {
    idioma = 100;
    for (const [l, lvl] of job.langs) {
      const m = profile.languages.find((x) => norm(x.name) === norm(l));
      idioma = Math.min(idioma, Math.round(((m ? LANG_RANK[m.level] || 1 : 0) / (LANG_RANK[lvl] || 2)) * 100));
    }
    idioma = Math.max(10, Math.min(100, idioma));
  }

  const dims = { "Tipo de trabalho": cargo, "O que você sabe fazer": habilidades, Experiência: experiencia, Escolaridade: formacao, Salário: salario, Localização: localizacao, Contrato: contrato, "Modelo de trabalho": modelo };
  const W = { "Tipo de trabalho": 0.28, "O que você sabe fazer": 0.18, Experiência: 0.12, Escolaridade: 0.08, Salário: 0.1, Localização: 0.09, Contrato: 0.11, "Modelo de trabalho": 0.04 };
  if (idioma !== null) { dims.Idioma = idioma; W.Idioma = 0.08; }
  if (horario !== null) { dims["Horário e escala"] = horario; W["Horário e escala"] = 0.08; }
  let total = 0, wt = 0;
  for (const k in dims) { total += dims[k] * W[k]; wt += W[k]; }
  let score = total / wt;

  const evitar = (prefs.avoidRoles || []).some((r) => titleFit(r, job.title) >= 0.6);
  score = Math.min(score, tetoEdu, evitar ? 25 : 100);
  if (job.posted <= 1) score += 1;
  score = Math.max(1, Math.min(99, Math.round(score)));

  const missing = hits.filter((h) => h.v < 0.6).map((h) => h.s);
  const matched = hits.filter((h) => h.v >= 0.6).map((h) => h.s);

  const gaps = [];
  if (gapEdu >= 0.8) gaps.push(`A vaga pede ${job.edu.toLowerCase()} e o seu perfil mostra um estudo menor. Algumas empresas aceitam quem está estudando: vale perguntar.`);
  if (missing.length) gaps.push(`A vaga pede ${missing.join(", ")} e isso ainda não está no seu perfil. Se você já fez algo parecido, adicione.`);
  if (job.years > 0 && experiencia < 100) gaps.push(job.years <= 1 ? "A vaga pede um pouco de experiência na função." : `A vaga pede ${job.years} anos de experiência na área.`);
  if (idioma !== null && idioma < 80) gaps.push(`Pede ${job.langs.map((l) => l.join(" ")).join(", ")}.`);
  if (job.sMax && alvoSal && jobMax < alvoSal) gaps.push(`Paga ${payLabel(job)}, menos do que você quer receber (${salarioTexto(prefs.sTarget || prefs.sMin, prefs.sUnit)}).`);
  if (horario !== null && horario < 60 && hp.length) gaps.push(`O horário da vaga é ${hv.join(", ").toLowerCase()} e você marcou ${hp.join(", ").toLowerCase()}.`);
  if (evitar) gaps.push("Você marcou que não quer esse tipo de trabalho.");

  const why = [];
  if (tFit >= 0.6) why.push(`É parecida com o que você procura ou já fez (${sig.roles.find((r) => titleFit(r, job.title) >= 0.6)}).`);
  else if (aFit) why.push(`É da área de ${job.area.toLowerCase()}, que combina com o seu perfil.`);
  if (job.years === 0) why.push("Não exige experiência. Dá para começar mesmo sem carteira assinada antes.");
  if (SEM_ESCOLA.includes(job.edu)) why.push("Aceita quem tem ensino fundamental ou menos.");
  if (matched.length) why.push(`Você já sabe ${matched.slice(0, 3).join(", ")}, que é o que eles pedem.`);
  if (localizacao === 100) why.push(job.model === "Remoto" ? "É de casa." : `Fica em ${job.city}, na sua cidade.`);
  if (job.sMax && salario >= 90 && (sMin || sT)) why.push(`Paga ${payLabel(job)}, dentro do que você pediu.`);
  if (horario === 100) why.push(`O horário (${hv.join(", ").toLowerCase()}) bate com o seu.`);

  return { score, dims, why, gaps, matched, missing, label: score >= 85 ? "Excelente combinação" : score >= 70 ? "Boa combinação" : "Baixa combinação" };
}

const money = (n) => "R$ " + Math.round(n).toLocaleString("pt-BR");
const UNIT_MULT = { "/mês": 1, "/dia": 22, "/hora": 176 };
const monthlyOf = (j, v) => v * (UNIT_MULT[j.unit || "/mês"] || 1);
const UNID_NOME = { "/mês": "por mês", "/dia": "por dia", "/hora": "por hora" };
const salarioTexto = (v, u) => `${money(+v)} ${UNID_NOME[u] || "por mês"}`;
const payLabel = (j) => {
  if (!j.sMax && !j.sMin) return "Salário a combinar";
  const u = j.unit === "/dia" ? " por dia" : j.unit === "/hora" ? " por hora" : "/mês";
  return !j.sMin || j.sMin === j.sMax ? `${money(j.sMax || j.sMin)}${u}` : `${money(j.sMin)}–${money(j.sMax)}${u}`;
};
const companyOf = (id) => COMPANIES.find((c) => c.id === id);
const initials = (s) => (s || "").trim().split(/\s+/).slice(0, 2).map((x) => x[0] || "").join("").toUpperCase() || "?";

/* ------------------------------ CONFIGURAÇÃO ----------------------------- */
/* Preenchidas na Vercel (Settings → Environment Variables). Sem elas o site roda em modo demonstração. */
const ENV = (() => { try { return import.meta.env || {}; } catch (e) { return {}; } })();
const CFG = {
  supaUrl: ENV.VITE_SUPABASE_URL || "", supaKey: ENV.VITE_SUPABASE_ANON_KEY || "",
  logoToken: ENV.VITE_LOGO_DEV_TOKEN || "",
};
// "ao vivo" = o banco está ligado na Vercel (o vite.config.js liga VITE_AO_VIVO sozinho)
const AO_VIVO = ENV.VITE_AO_VIVO === "1" || !!(CFG.supaUrl && CFG.supaKey);

/* Conversa com o servidor (/api/app). As chaves de acesso ficam só neste aparelho. */
const api = async (acao, dados) => {
  let r;
  try {
    r = await fetch(`/api/app?acao=${acao}`, dados === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) });
  } catch (e) { throw new Error("Sem conexão com a internet. Confira e tente de novo."); }
  const out = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(out.erro || "Não foi possível falar com o servidor agora."); e.status = r.status; e.dados = out; throw e; }
  return out;
};
const CHAVES = {
  get: (k) => { try { return localStorage.getItem("matchly:acesso-" + k) || ""; } catch (e) { return ""; } },
  set: (k, v) => { try { localStorage.setItem("matchly:acesso-" + k, v); } catch (e) { /* modo anônimo */ } },
  del: (k) => { try { localStorage.removeItem("matchly:acesso-" + k); } catch (e) { /* segue */ } },
};
// link de acesso da área de quem contrata: https://site/#acesso=CHAVE
const ACESSO_LINK = (() => {
  try {
    const m = window.location.hash.match(/acesso=([A-Za-z0-9_-]{20,})/);
    if (!m) return false;
    CHAVES.set("empresa", m[1]);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    return true;
  } catch (e) { return false; }
})();
try { if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual"; } catch (e) { /* segue */ }
const linkDeAcesso = (t) => `${window.location.origin}/#acesso=${t}`;
const ETAPA_EMPRESA = { "Candidatura enviada": "Nova", "Entrevista": "Em conversa", "Proposta": "Proposta enviada", "Contratada": "Contratado(a)", "Recusada": "Não seguiu", "Proposta recusada": "Recusou a proposta" };
const PASSOS_EMPRESA = ["Recebida", "Conversa", "Proposta", "Contratado"];
const passoEmpresa = (e) => ({ "Candidatura enviada": 0, "Entrevista": 1, "Proposta": 2, "Contratada": 3 }[e] ?? 0);
const quandoFoi = (iso) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "agora"; if (s < 3600) return `há ${Math.floor(s / 60)} min`; if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};
const soDigitos = (s) => String(s || "").replace(/\D/g, "");
const linkWhats = (tel, texto) => { const d = soDigitos(tel); if (d.length < 10) return null; return `https://wa.me/${d.length <= 11 ? "55" + d : d}?text=${encodeURIComponent(texto)}`; };
/* Exemplos (empresas, vagas e candidatos fictícios) só aparecem na prévia.
   No site publicado começa vazio: as empresas entram quando decidirem se cadastrar. */
const DEMO = !AO_VIVO && !ENV.PROD;
const dominioDe = (url) => { try { return new URL(/^https?:/.test(url) ? url : "https://" + url).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };


/* ------------------------------- ÍCONES --------------------------------- */
/* Desenhados em traço, herdam a cor do texto. Substituem os emojis da interface. */
const ICON_PATHS = {
  pin: "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z M12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z",
  briefcase: "M3 8.5h18v11H3z M8.5 8.5V6a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 6v2.5 M3 13h18",
  money: "M3 6.5h18v11H3z M12 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z M6 9.5v5 M18 9.5v5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3.2 2",
  calendar: "M4 5.5h16v15H4z M4 10h16 M8.5 3v5 M15.5 3v5",
  check: "M5 12.5l4.2 4.2L19 7",
  checkCircle: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M8 12.3l2.8 2.8L16.3 9.5",
  x: "M6 6l12 12 M18 6L6 18",
  home: "M4 11l8-7 8 7v9H4z M10 20v-5h4v5",
  search: "M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4z M16 16l5 5",
  heart: "M12 20s-7.5-4.6-9-9.4C2 7.4 4.2 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3 0 5.2 2.9 4.2 6.1C19.5 15.4 12 20 12 20z",
  list: "M8 6.5h12 M8 12h12 M8 17.5h12 M4 6.5h.01 M4 12h.01 M4 17.5h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.5 20.5c1-3.6 4-5.5 7.5-5.5s6.5 1.9 7.5 5.5",
  more: "M5 12h.01 M12 12h.01 M19 12h.01",
  bell: "M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z M10 20.5a2 2 0 0 0 4 0",
  download: "M12 4v11 M7 10.5l5 5 5-5 M5 20h14",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M2.5 20c.8-3.4 3.3-5.5 6.5-5.5s5.7 2.1 6.5 5.5 M16 4.3a3.5 3.5 0 0 1 0 6.4 M18 14.8c1.8.8 3 2.6 3.5 5.2",
  plus: "M12 5v14 M5 12h14 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2.5v2 M12 19.5v2 M4.6 4.6 6 6 M18 18l1.4 1.4 M2.5 12h2 M19.5 12h2 M4.6 19.4 6 18 M18 6l1.4-1.4",
  chat: "M4 5h16v11H9l-5 4z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  back: "M19 12H5 M11 6l-6 6 6 6",
  out: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  shield: "M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z M8.8 12l2.3 2.3 4.2-4.3",
  alert: "M12 4l9 16H3z M12 10v4.5 M12 17.5h.01",
  bolt: "M13 3L5 13.5h6L10 21l8-10.5h-6z",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z",
  file: "M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6",
  folder: "M3 6.5h6l2 2h10v10H3z",
  chart: "M4 20V4 M4 20h16 M8 16v-4 M12 16V8 M16 16v-6",
  lock: "M6 10.5h12v10H6z M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3",
  card: "M3 6h18v12H3z M3 10h18 M7 15h4",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M15.5 8.5l-2 5-5 2 2-5z",
  scale: "M12 4v16 M7 20h10 M5 8h14 M5 8l-2.5 6h5z M19 8l-2.5 6h5z",
  mic: "M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z M6 11a6 6 0 0 0 12 0 M12 17v4",
  building: "M5 21V4h10v17 M15 9h4v12 M3 21h18 M8 8h1 M11 8h1 M8 12h1 M11 12h1 M8 16h1 M11 16h1",
  idcard: "M3 5.5h18v13H3z M8.5 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M5.5 16c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2 M14 10h4 M14 13.5h4",
  puzzle: "M10 4h4v3a1.5 1.5 0 1 0 3 0V4h3v6h-3a1.5 1.5 0 1 0 0 3h3v7h-6v-3a1.5 1.5 0 1 0-3 0v3H4v-7h3a1.5 1.5 0 1 0 0-3H4V4h6",
  grad: "M2.5 9L12 5l9.5 4L12 13z M6.5 11v4.5c1.5 1.4 3.4 2 5.5 2s4-.6 5.5-2V11 M21.5 9v5",
  // tipos de trabalho
  broom: "M14.5 3.5l-3.5 8 M8 11.5h7.5l2 9.5H6z M10 21l.7-4 M13.5 21l.2-4",
  hammer: "M14 6l4 4-2 2-4-4z M12.5 7.5L4 16l2.5 2.5L15 10 M17 4.5l2.5 2.5",
  utensils: "M7 3v8 M4.5 3v5a2.5 2.5 0 0 0 5 0V3 M7 11v10 M17 21V3c-2.2 0-3.5 2.4-3.5 6v4H17",
  truck: "M2.5 6.5h11v9h-11z M13.5 9.5h4l3 3.2v2.8h-7 M7 18.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z M17 18.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z",
  store: "M4 9.5h16 M5 9.5V20h14V9.5 M3.5 9.5L5.5 4h13l2 5.5 M10 20v-5h4v5",
  headset: "M4.5 14v-2a7.5 7.5 0 0 1 15 0v2 M4.5 13.5h3v5h-3z M16.5 13.5h3v5h-3z M19.5 18.5c0 1.5-1.5 2.5-4 2.5h-2",
  hands: "M12 20s-6.5-3.8-8-8c-.8-2.4.7-5 3.3-5 1.9 0 3.2 1 4.7 2.7C13.5 8 14.8 7 16.7 7c2.6 0 4.1 2.6 3.3 5-1.5 4.2-8 8-8 8z M9 12h6",
  leaf: "M5 19c0-8 5-13.5 14-14 0 9-5.5 14-14 14z M5 19l7.5-7.5",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M18.5 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z",
  box: "M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z M3.5 7.5L12 11.5l8.5-4 M12 11.5v9",
  key: "M8 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M11.5 11H21 M18 11v3 M15.5 11v2",
  factory: "M3 20V10l5 3V10l5 3V6h3l1 4h1l1-6h2v16z M7 17h2 M12 17h2",
};
function Ic({ n, s = 18, w = 1.7, style }) {
  const d = ICON_PATHS[n];
  if (!d) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ flex: "none", display: "inline-block", verticalAlign: "-0.18em", ...style }}>
      {d.split(" M").map((seg, i) => <path key={i} d={(i ? "M" : "") + seg} />)}
    </svg>
  );
}
const Tag = ({ i, children }) => <span className="tag row" style={{ gap: 6, display: "inline-flex" }}><Ic n={i} s={14} />{children}</span>;

/* ------------------------- TIPOS DE TRABALHO ---------------------------- */
/* Usados no cadastro rápido e na página inicial. "area" é uma chave de AREA_LABELS. */
const TIPOS = [
  { id: "limpeza", label: "Limpeza e faxina", icon: "broom", area: "Limpeza e serviços gerais", role: "Diarista", skills: ["Organização", "Responsabilidade"], ex: "Diarista, faxina, lavanderia" },
  { id: "obras", label: "Obras e reformas", icon: "hammer", area: "Obras", role: "Ajudante de obra", skills: ["Esforço físico", "Segurança do trabalho"], ex: "Ajudante, servente, pintor" },
  { id: "cozinha", label: "Cozinha e lanchonete", icon: "utensils", area: "Comida e lanchonete", role: "Auxiliar de cozinha", skills: ["Preparo de alimentos", "Higiene e manipulação de alimentos"], ex: "Chapeiro, garçom, padaria" },
  { id: "entregas", label: "Entregas e motorista", icon: "truck", area: "Entregas e transporte", role: "Entregador", skills: ["Agilidade", "Responsabilidade"], ex: "Entregador, motorista, motoboy" },
  { id: "loja", label: "Loja e mercado", icon: "store", area: "Loja e mercado", role: "Atendente de loja", skills: ["Atendimento ao cliente", "Vendas"], ex: "Repositor, caixa, vendedor" },
  { id: "atendimento", label: "Atendimento", icon: "headset", area: "Atendimento", role: "Atendente", skills: ["Atendimento ao cliente", "Comunicação"], ex: "Recepção, telemarketing" },
  { id: "cuidar", label: "Cuidar de pessoas", icon: "hands", area: "Cuidar de pessoas", role: "Cuidador(a)", skills: ["Paciência", "Cuidados básicos de saúde"], ex: "Babá, cuidador de idosos" },
  { id: "jardim", label: "Jardim e manutenção", icon: "leaf", area: "Jardim e manutenção", role: "Jardineiro", skills: ["Pequenos reparos", "Esforço físico"], ex: "Jardinagem, zeladoria, reparos" },
  { id: "eventos", label: "Eventos e serviços", icon: "sparkle", area: "Eventos e serviços", role: "Ajudante de eventos", skills: ["Agilidade", "Trabalho em equipe"], ex: "Garçom extra, mudança, panfleto" },
  { id: "carga", label: "Carga e estoque", icon: "box", area: "Carga e estoque", role: "Ajudante de carga", skills: ["Esforço físico", "Controle de estoque"], ex: "Carga e descarga, estoquista" },
  { id: "portaria", label: "Portaria", icon: "key", area: "Portaria", role: "Porteiro(a)", skills: ["Responsabilidade", "Comunicação"], ex: "Porteiro, controlador de acesso" },
  { id: "fabrica", label: "Fábrica e produção", icon: "factory", area: "Fábrica", role: "Auxiliar de produção", skills: ["Trabalho em equipe", "Segurança do trabalho"], ex: "Linha de produção, embalagem" },
];
const CONTRATOS_BICO = ["Diária", "Por hora", "Freelancer", "Temporário"];
const rotuloAvulso = (j) => (j.unit === "/hora" || j.contract === "Por hora" ? "Por hora" : j.contract === "Freelancer" ? "Freelancer" : "Diária");
const ehBico = (j) => ["Diária", "Por hora", "Freelancer"].includes(j.contract) || j.unit === "/dia" || j.unit === "/hora";
const pagaNoDia = (j) => (j.benefits || []).some((b) => /pagamento no dia|paga no dia/i.test(b));

/* ---------------------------- COMPONENTES UI ---------------------------- */
function CompanyLogo({ c, size = 44, radius = 10 }) {
  const [falhou, setFalhou] = useState(false);
  const dom = c?.domain || dominioDe(c?.site || "");
  const src = c?.logo || (dom && CFG.logoToken ? `https://img.logo.dev/${dom}?token=${CFG.logoToken}&size=${size * 2}&format=png` : "");
  const box = { width: size, height: size, flex: "none", borderRadius: radius, border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center" };
  if (src && !falhou) return <div style={box}><img src={src} alt={`Logo ${c.name}`} loading="lazy" onError={() => setFalhou(true)} style={{ width: "100%", height: "100%", objectFit: "contain", padding: size > 50 ? 8 : 5 }} /></div>;
  return <div style={{ ...box, background: "var(--surface-2)", fontWeight: 600, fontSize: Math.max(12, size / 3.2), color: "var(--ink-2)", fontFamily: "var(--display)" }}>{initials(c?.name || "?")}</div>;
}

const Ring = ({ v, size = 64 }) => {
  const r = size / 2 - 5, c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--wine)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <b>{v}%</b>
    </div>
  );
};

const Mark = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flex: "none" }}>
    <path d="M46 12 A24 24 0 1 0 46 52" fill="none" stroke="var(--ink)" strokeWidth="11" />
    <path d="M28 21 h8 v5 h-8 z" fill="none" stroke="var(--wine)" strokeWidth="3" />
    <rect x="21" y="26" width="26" height="16" rx="3" fill="var(--wine)" />
    <rect x="30" y="31" width="7" height="6" rx="1.5" fill="none" stroke="var(--bg)" strokeWidth="2.4" />
    <path d="M21 33 h26" stroke="var(--bg)" strokeWidth="2" />
    <path d="M49 24 L61 33 L49 42 Z" fill="var(--wine)" />
  </svg>
);

const Logo = ({ onClick }) => (
  <div className="logo row" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick()} style={{ gap: 10 }}>
    <Mark size={32} />
    <span className="col" style={{ lineHeight: 1 }}>
      <span style={{ color: "var(--ink)", fontSize: 22, letterSpacing: "-.01em" }}>Match<span style={{ color: "var(--wine)" }}>ly</span></span>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, fontWeight: 500, color: "var(--ink-3)", letterSpacing: ".03em", marginTop: 3, whiteSpace: "nowrap" }}>encontre seu trabalho ideal</span>
    </span>
  </div>
);

const MatchBadge = ({ m }) => {
  const cls = m.score >= 85 ? "b-green" : m.score >= 70 ? "b-yellow" : "b-red";
  return <span className={"badge " + cls}><i style={{ width: 7, height: 7, borderRadius: 99, background: "currentColor", display: "inline-block" }} />{m.label}</span>;
};

function Field({ label, hint, children }) {
  return <div className="field"><label>{label}</label>{children}{hint && <span className="muted">{hint}</span>}</div>;
}

function ChipGroup({ options, value, onChange, multi = true }) {
  const on = (o) => (multi ? value.includes(o) : value === o);
  const toggle = (o) => {
    if (!multi) return onChange(o);
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  };
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={o} type="button" className="chip" data-on={on(o) ? "1" : "0"} onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  );
}

/* --------------------------------- APP ---------------------------------- */
/* Até o login com conta estar ligado, o perfil fica guardado no próprio aparelho da pessoa */
const GUARDADO = (() => { try { return JSON.parse(localStorage.getItem("matchly:v1") || "null"); } catch (e) { return null; } })();

export default function App() {
  const [dark, setDark] = useState(!!GUARDADO?.dark);
  const [view, setView] = useState(() => {
    if (ACESSO_LINK) return "recruiter";
    const h = typeof window !== "undefined" ? window.location.hash : "";
    if (["#area", "#candidaturas", "#avisos", "#instalar"].includes(h)) { try { window.history.replaceState(null, "", window.location.pathname); } catch (e) { /* segue */ } }
    if (h === "#area") return "recruiter";
    if (h === "#instalar") return "instalar";
    if (h === "#avisos" && GUARDADO?.logged) return "alerts";
    if (h === "#candidaturas" && GUARDADO?.logged) return "apps";
    if (GUARDADO?.logged) return "dash";
    return AO_VIVO && CHAVES.get("empresa") ? "recruiter" : "landing";
  });
  const [openJob, setOpenJob] = useState(null);
  const [logged, setLogged] = useState(!!GUARDADO?.logged);
  const [profile, setProfile] = useState(GUARDADO?.profile || DEFAULT_PROFILE);
  const [prefs, setPrefs] = useState(GUARDADO?.prefs || DEFAULT_PREFS);
  const [saved, setSaved] = useState(GUARDADO?.saved || (!DEMO ? {} : { j2: "Alta prioridade" }));
  const [hidden, setHidden] = useState(GUARDADO?.hidden || []);
  const [apps, setApps] = useState(GUARDADO?.apps || (!DEMO ? [] : [
    { id: "a1", jobId: "j6", stage: "Candidatura enviada", date: "02/09", notes: "" },
    { id: "a2", jobId: "j7", stage: "Entrevista", date: "28/08", notes: "Entrevista com a gestora, 12/09 às 14h." },
    { id: "a3", jobId: "j9", stage: "Interessadas", date: "05/09", notes: "" },
  ]));
  const [toast, setToast] = useState("");
  const [autopilot, setAutopilot] = useState(true);
  const [preTipo, setPreTipo] = useState([]);
  const [barra, setBarra] = useState(() => { try { return sessionStorage.getItem("matchly:barra") !== "fechada"; } catch (e) { return true; } });
  const fecharBarra = () => { setBarra(false); try { sessionStorage.setItem("matchly:barra", "fechada"); } catch (e) { /* segue */ } };
  const [role, setRole] = useState("Candidato");
  const [myJobs, setMyJobs] = useState([]);
  const [jobsVersion, setJobsVersion] = useState(0);
  const bumpJobs = () => setJobsVersion((v) => v + 1);
  const [following, setFollowing] = useState(DEMO ? ["c1"] : []);
  const [companyOpen, setCompanyOpen] = useState(null);
  const [compare, setCompare] = useState(DEMO ? ["j1", "j2"] : []);
  const [alerts, setAlerts] = useState({ ...AVISOS_PADRAO, ...(GUARDADO?.alerts || {}) });
  const [privacy, setPrivacy] = useState({ visibility: "Somente recrutadores", findable: true, resume: true, aiData: true, notify: true });
  const [notifs, setNotifs] = useState(GUARDADO?.notifs || (!DEMO ? [] : [
    { id: "n1", icon: "star", title: "Match alto: 96% em Analista de Dados Pleno", text: "Banco Aurora · São Paulo · remoto", time: "há 2h", read: false, jobId: "j1" },
    { id: "n2", icon: "mic", title: "Entrevista confirmada", text: "Lar Digital · Product Analyst · 12/09 às 14h", time: "há 5h", read: false },
    { id: "n3", icon: "building", title: "Dataforma está contratando", text: "Empresa que você segue publicou 1 vaga nova", time: "ontem", read: true, jobId: "j2" },
    { id: "n4", icon: "file", title: "Sua candidatura mudou de status", text: "Perfumaria Flor de Lis · em processo seletivo", time: "2 dias", read: true },
    { id: "n5", icon: "clock", title: "Prazo de candidatura em 3 dias", text: "Engenheiro(a) de Dados Pleno · Bebidas Horizonte", time: "3 dias", read: true, jobId: "j4" },
  ]));


  useEffect(() => {
    if (!logged && !GUARDADO) return;
    try { localStorage.setItem("matchly:v1", JSON.stringify({ dark, logged, profile, prefs, saved, hidden, apps, notifs, alerts })); } catch (e) { /* modo anônimo: segue sem guardar */ }
  }, [dark, logged, profile, prefs, saved, hidden, apps, notifs, alerts]);

  /* Modo ao vivo: troca os dados de demonstração pelas vagas coletadas e pelas empresas cadastradas */
  const [radarTotal, setRadarTotal] = useState(0);
  const [carregando, setCarregando] = useState(AO_VIVO);
  const recarregar = useRef(() => Promise.resolve());
  useEffect(() => {
    if (!AO_VIVO) return;
    let primeira = true;
    const carregar = async () => {
      try {
        const out = await api("vagas");
        const rows = out.vagas || [];
        const emp = new Map();
        rows.forEach((v) => { const e = v.empresas; if (e && !emp.has(e.id)) emp.set(e.id, {
          id: e.id, name: e.nome, sector: e.setor || (e.tipo === "pessoa" ? "Contratante particular" : "Empresa"), size: e.tamanho || "—", city: e.cidade || "—", verified: !!e.verificada,
          culture: [], logo: e.logo_url || "", domain: e.dominio || "", site: e.site || "", descricao: e.descricao || "", beneficios: e.beneficios || [],
          nota: out.avaliacoes?.[e.id] || null }); });
        const vagas = rows.map((v) => ({
          id: v.id, title: v.titulo, companyId: v.empresa_id, area: v.area || "Atendimento", city: v.cidade || "—", state: v.uf || "—",
          model: v.modelo || "Presencial", contract: v.contrato || "CLT", sMin: +v.salario_min || 0, sMax: +v.salario_max || +v.salario_min || 0,
          unit: v.unidade || "/mês", seniority: "Júnior", years: v.exige_experiencia ? 1 : 0, edu: v.escolaridade || "Fundamental", langs: [],
          posted: Math.max(0, Math.round((Date.now() - new Date(v.publicada_em || v.coletada_em).getTime()) / 864e5)),
          skills: v.habilidades?.length ? v.habilidades : ["Responsabilidade"], benefits: v.beneficios || [], desc: v.descricao || "",
          url: v.origem === "matchly" ? "" : (v.url || ""), fonte: v.fonte_nome || "", coletadaEm: (v.coletada_em || "").slice(0, 10), suspeita: !!v.suspeita,
          interna: v.origem === "matchly", particular: !!v.particular, horarios: v.horarios || [] }));
        const tot = out.empresas || 0;
        // troca tudo de uma vez, sem nenhuma espera no meio, para a tela nunca ver dados pela metade
        COMPANIES.splice(0, COMPANIES.length, ...emp.values());
        JOBS.splice(0, JOBS.length, ...vagas);
        const existe = new Set(vagas.map((v) => v.id));
        setApps((a) => a.filter((x) => x.remoteId || existe.has(x.jobId)));
        setSaved((sv) => Object.fromEntries(Object.entries(sv).filter(([k]) => existe.has(k))));
        if (primeira) { setCompare([]); setNotifs((n) => n.filter((x) => !/^n\d$/.test(x.id))); }
        setRadarTotal(tot);
        setJobsVersion((x) => x + 1);
      } catch (e) {
        console.error(e);
        if (primeira) setToast("Não foi possível carregar as vagas agora. Tente de novo em alguns minutos.");
      } finally { setCarregando(false); primeira = false; }
    };
    recarregar.current = carregar;
    carregar();
    // vagas novas aparecem sozinhas, sem precisar recarregar a página
    const t = setInterval(carregar, 60000);
    return () => clearInterval(t);
  }, []);
  // tocar num aviso com o app já aberto: /#area ou /#candidaturas
  useEffect(() => {
    const f = () => {
      const h = window.location.hash;
      const destino = { "#area": "recruiter", "#candidaturas": "apps", "#avisos": "alerts", "#instalar": "instalar" }[h];
      if (!destino) return;
      try { window.history.replaceState(null, "", window.location.pathname); } catch (e) { /* segue */ }
      setOpenJob(null); setCompanyOpen(null);
      setView(destino); setSinc((x) => x + 1);
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const [sinc, setSinc] = useState(0);
  const [abaEmpresa, setAbaEmpresa] = useState("cands");
  useEffect(() => {
    if (!AO_VIVO) return;
    let vivo = true;
    const conferir = async () => {
      const token = CHAVES.get("candidato");
      if (!token) return;
      try {
        const { candidaturas } = await api("minhas", { token });
        if (!vivo) return;
        const porId = new Map(candidaturas.map((c) => [c.id, c]));
        setApps((lista) => {
          const avisos = [];
          const conhecidas = new Set(lista.map((a) => a.remoteId).filter(Boolean));
          const nova = lista.map((a) => {
            const c = a.remoteId && porId.get(a.remoteId);
            if (!c) return a;
            const vista = c.vista && !a.vista;
            const mudou = c.etapa !== a.stage && c.etapa !== "Candidatura enviada";
            if (mudou && c.etapa === "Proposta recusada") return { ...a, stage: c.etapa };
            if (c.etapa === "Convite recusado") return { ...a, stage: "Convite recusado" };
            const avaliou = c.minha_avaliacao || a.avaliou || null;
            const nomes = { vagaNome: c.vaga || a.vagaNome, empresaNome: c.empresa || a.empresaNome };
            if (!vista && !mudou) return avaliou !== a.avaliou || nomes.vagaNome !== a.vagaNome ? { ...a, avaliou, ...nomes } : a;
            const nome = c.empresa || "A empresa";
            if (mudou) avisos.push(c.etapa === "Proposta" ? [`${nome} quer contratar você!`, `Vaga: ${c.vaga}. Veja em Candidaturas e aceite ou recuse.`, "star"]
              : c.etapa === "Entrevista" ? [`${nome} quer conversar com você`, `Vaga: ${c.vaga}. Fique de olho no seu WhatsApp.`, "mic"]
              : c.etapa === "Contratada" ? [`Você foi contratado(a) por ${nome}!`, `Vaga: ${c.vaga}. Depois, conte como foi: avalie a empresa.`, "star"]
              : [`${nome} seguiu com outra pessoa`, `Vaga: ${c.vaga}. Continue se candidatando, outras vagas vão aparecer.`, "file"]);
            else avisos.push([`${nome} viu seu currículo`, `Vaga: ${c.vaga}.`, "checkCircle"]);
            return { ...a, stage: mudou ? c.etapa : a.stage, vista: c.vista, avaliou, ...nomes };
          });
          // aparelho novo: traz as candidaturas que só existem no servidor
          candidaturas.filter((c) => !conhecidas.has(c.id) && c.etapa === "Convite").forEach((c) =>
            avisos.push([`${c.empresa || "Uma empresa"} convidou você`, `Para a vaga de ${c.vaga}. Veja em Candidaturas e responda.`, "star"]));
          candidaturas.filter((c) => !conhecidas.has(c.id) && c.etapa !== "Convite recusado").forEach((c) => nova.push({
            id: "r" + c.id, remoteId: c.id, jobId: c.vaga_id, stage: c.etapa, vista: c.vista, avaliou: c.minha_avaliacao || null,
            date: new Date(c.criada_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), notes: "", vagaNome: c.vaga, empresaNome: c.empresa }));
          if (avisos.length) {
            setNotifs((n) => [...avisos.map(([title, text, icon], i) => ({ id: "s" + Date.now() + i, icon, title, text, time: "agora", read: false })), ...n]);
            setToast(avisos[0][0]);
          }
          return nova;
        });
      } catch (e) { /* tenta de novo na próxima volta */ }
    };
    conferir();
    const t = setInterval(conferir, 30000);
    return () => { vivo = false; clearInterval(t); };
  }, [sinc]);

  // perfil guardado também no servidor: assim a pessoa entra de outro celular e encontra tudo
  useEffect(() => {
    if (!AO_VIVO || !logged || !CHAVES.get("candidato")) return;
    const t = setTimeout(() => { api("salvar_perfil", { token: CHAVES.get("candidato"), perfil: { profile, prefs, visivel: privacy.findable !== false, alertas: alerts } }).catch(() => {}); }, 3000);
    return () => clearTimeout(t);
  }, [profile, prefs, logged, privacy.findable, alerts]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); }, [toast]);
  const say = (m) => setToast(m);

  const matches = useMemo(() => {
    const map = {};
    JOBS.forEach((j) => (map[j.id] = matchJob(j, profile, prefs)));
    return map;
  }, [profile, prefs, jobsVersion]);

  const feed = useMemo(
    () => JOBS.filter((j) => !hidden.includes(j.id)).sort((a, b) => matches[b.id].score - matches[a.id].score),
    [matches, hidden, jobsVersion]
  );

  const go = (v) => { setOpenJob(null); setCompanyOpen(null); if (v !== "cvedit") setRevisarVaga(null); setView(v); window.scrollTo({ top: 0 }); };
  // abrir uma vaga, uma empresa ou trocar de tela sempre começa do topo (antes ficava na altura da tela anterior)
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view, openJob, companyOpen]);
  const requireLogin = (v) => (logged ? go(v) : go("signup"));
  // Entrar: em modo ao vivo só entra quem já se cadastrou neste aparelho
  // sair da conta (fica em Mais): neste aparelho some tudo; para voltar, entra com WhatsApp e senha
  const sairDaConta = () => {
    if (AO_VIVO) {
      CHAVES.del("candidato");
      try { localStorage.removeItem("matchly:v1"); localStorage.removeItem("matchly:avisos-candidato"); } catch (e) { /* segue */ }
      setProfile(EMPTY_PROFILE); setPrefs(EMPTY_PREFS); setApps([]); setSaved({}); setNotifs([]);
    }
    setLogged(false); go("landing"); setToast("Você saiu da sua conta.");
  };
  const entrar = () => {
    const temCadastro = !!(GUARDADO?.profile?.name || CHAVES.get("candidato"));
    if (AO_VIVO && !temCadastro && CHAVES.get("empresa")) { go("recruiter"); return; }
    if (AO_VIVO && !temCadastro) { go("entrar"); return; }
    setLogged(true); go("dash");
  };
  const comecar = (tipos = []) => { setPreTipo(tipos); go("signup"); };

  const toggleSave = (id) => {
    setSaved((s) => { const n = { ...s }; if (n[id]) { delete n[id]; say("Vaga removida dos salvos"); } else { n[id] = "Sem pasta"; say("Vaga salva"); } return n; });
  };
  const apply = (jobId, extra = {}) => {
    const convite = apps.find((a) => a.jobId === jobId && a.stage === "Convite");
    if (convite) {
      setApps((a) => a.map((x) => (x.id === convite.id ? { ...x, ...extra, stage: "Candidatura enviada", date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) } : x)));
      return say("Pronto! Seu currículo foi enviado para quem convidou você.");
    }
    if (apps.some((a) => a.jobId === jobId)) return say("Você já acompanha esta vaga");
    setApps((a) => [...a, { id: "a" + Date.now(), jobId, stage: "Candidatura enviada", date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), notes: "", ...extra }]);
    say(extra.externo ? "Anotamos no seu painel. Termine a candidatura no site da empresa." : "Candidatura enviada. Acompanhe pelo painel de candidaturas.");
  };
  // "Editar currículo" a partir da revisão: depois de salvar, volta para a mesma vaga com a revisão aberta
  const [revisarVaga, setRevisarVaga] = useState(null);
  const editarParaVaga = (jobId) => { setRevisarVaga(jobId); go("cvedit"); };

  const setFolder = (id, f) => setSaved((s) => ({ ...s, [id]: f }));

  const ctx = { profile, setProfile, prefs, setPrefs, matches, saved, toggleSave, setFolder, apply, apps, setApps, go, say, setOpenJob, hidden, setHidden, feed, logged, autopilot, setAutopilot,
    radarTotal, carregando, comecar, setSaved, revisarVaga, setRevisarVaga, editarParaVaga, role, setRole, setLogged, myJobs, setMyJobs, bumpJobs, jobsVersion, following, setFollowing, companyOpen, setCompanyOpen, compare, setCompare, alerts, setAlerts, privacy, setPrivacy, notifs, setNotifs, sincronizar: () => setSinc((x) => x + 1), sairDaConta, abaEmpresa, setAbaEmpresa,
    sairDaEmpresa: () => { CHAVES.del("empresa"); try { localStorage.removeItem("matchly:avisos-empresa"); } catch (e) { /* segue */ } setRole("Candidato"); setAbaEmpresa("cands"); go("landing"); setToast("Você saiu da conta de quem contrata."); }, recarregarVagas: () => recarregar.current() };

  // conta de quem contrata: fica entrada até tocar em "Sair da conta"
  const temEmpresa = AO_VIVO && !logged && !!CHAVES.get("empresa");
  const comMenu = logged || temEmpresa;
  const MENU_EMPRESA = [["cands", "users", "Candidatos"], ["talentos", "search", "Encontrar pessoas"], ["vagas", "briefcase", "Minhas vagas"], ["hire", "plus", "Publicar vaga"], ["conta", "user", "Minha conta"]];
  const irEmpresa = (k) => { if (k === "hire") return go("hire"); setAbaEmpresa(k); go("recruiter"); };
  const naAbaEmpresa = (k) => (k === "hire" ? view === "hire" : view === "recruiter" && abaEmpresa === k && !openJob);
  const navItems = [["dash", "Início"], ["feed", "Vagas"], ["apps", "Candidaturas"], ["cv", "Meu currículo"], ["profile", "Meu perfil"], ["hub", "Mais"]];
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="jm" data-theme={dark ? "dark" : "light"} data-bar={barra && view !== "donate" ? "1" : "0"} data-logged={comMenu ? "1" : "0"}>
      <style>{CSS}</style>

      <header className="hdr">
        <div className="wrap inner">
          <Logo onClick={() => (temEmpresa ? irEmpresa("cands") : go(logged ? "dash" : "landing"))} />
          {temEmpresa ? (
            <nav className="nav">
              {MENU_EMPRESA.map(([k, , l]) => <button key={k} data-on={naAbaEmpresa(k) ? "1" : "0"} onClick={() => irEmpresa(k)}>{l}</button>)}
            </nav>
          ) : logged ? (
            <nav className="nav">
              {navItems.map(([v, l]) => (
                <button key={v} data-on={view === v ? "1" : "0"} onClick={() => go(v)}>{l}</button>
              ))}
            </nav>
          ) : (
            <nav className="nav">
              <button data-on={view === "search" ? "1" : "0"} onClick={() => go("search")}>Vagas</button>
              <button data-on={view === "companies" ? "1" : "0"} onClick={() => go("companies")}>Empresas</button>
              <button data-on={view === "help" ? "1" : "0"} onClick={() => go("help")}>Como funciona</button>
              <button data-on={view === "hire" || view === "recruiter" ? "1" : "0"} onClick={() => go(CHAVES.get("empresa") ? "recruiter" : "hire")}>Para quem contrata</button>
            </nav>
          )}
          <div className="row">
            {logged && (
              <button className="btn btn-g" onClick={() => go("notifs")} aria-label="Notificações" style={{ position: "relative" }}>
                <Ic n="bell" s={19} />{unread > 0 && <span style={{ position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 99, background: "var(--wine)", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unread}</span>}
              </button>
            )}
            <button className="btn btn-g" onClick={() => setDark(!dark)} title="Alternar modo escuro" aria-label="Alternar modo escuro"><Ic n={dark ? "sun" : "moon"} s={18} /></button>
            {!comMenu && (
              <>
                <button className="btn btn-g hide-m" onClick={entrar}>Entrar</button>
                <button className="btn btn-p btn-sm" onClick={() => go("cadastro")}><span className="hide-m">Cadastre-se grátis</span><span className="only-m">Cadastrar</span></button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={comMenu ? "pad-m" : ""}>
        {openJob ? (JOBS.some((j) => j.id === openJob) ? <JobPage id={openJob} ctx={ctx} /> : <ErrorPage kind="errjob" ctx={ctx} />) :
          companyOpen && companyOf(companyOpen) ? <CompanyPage id={companyOpen} ctx={ctx} /> :
          view === "hub" ? <Hub go={go} role={role} setRole={setRole} ctx={ctx} /> :
          view === "cadastro" ? <EscolherCadastro ctx={ctx} /> :
          view === "resume" ? <ResumeAI ctx={ctx} /> :
          view === "cv" ? <MeuCurriculo ctx={ctx} /> :
          view === "cover" ? <CoverLetter ctx={ctx} /> :
          view === "interview" ? <Interview ctx={ctx} /> :
          view === "career" ? <Career ctx={ctx} /> :
          view === "companies" ? <Companies ctx={ctx} /> :
          view === "compare" ? <Compare ctx={ctx} /> :
          view === "alerts" ? <Alerts ctx={ctx} /> :
          view === "notifs" ? <Notifications ctx={ctx} /> :
          view === "calendar" ? <Calendar ctx={ctx} /> :
          view === "privacy" ? <Privacy ctx={ctx} /> :
          view === "recruiter" ? <Recruiter ctx={ctx} /> :
          view === "admin" ? <Admin ctx={ctx} /> :
          view === "donate" ? <Donate ctx={ctx} /> :
          view === "help" ? <Help ctx={ctx} /> :
          view === "hire" ? <HirePost ctx={ctx} /> :
          view === "companyRegister" ? <CompanyRegister ctx={ctx} /> :
          view.startsWith("err") ? <ErrorPage kind={view} ctx={ctx} /> :
          view === "landing" ? <Landing go={go} comecar={comecar} matches={matches} /> :
          view === "entrar" ? <Entrar ctx={ctx} /> :
          view === "instalar" ? <Instalar ctx={ctx} /> :
          view === "signup" ? <QuickSignup key={preTipo.join(",")} ctx={ctx} inicial={preTipo} /> :
          view === "cvedit" ? <Signup ctx={ctx} onDone={() => {
            setLogged(true); setToast("Currículo atualizado");
            if (revisarVaga) { setView("feed"); setOpenJob(revisarVaga); window.scrollTo({ top: 0 }); } else go("cv");
          }} /> :
          view === "dash" ? <Dashboard ctx={ctx} /> :
          view === "feed" ? <Feed ctx={ctx} /> :
          view === "search" ? <Search ctx={ctx} /> :
          view === "saved" ? <Saved ctx={ctx} /> :
          view === "apps" ? <Applications ctx={ctx} /> :
          view === "profile" ? <Profile ctx={ctx} /> :
          view === "prefs" ? <Preferences ctx={ctx} /> :
          view === "stats" ? <Stats ctx={ctx} /> : null}
      </main>

      {temEmpresa && (
        <nav className="mobnav">
          {MENU_EMPRESA.map(([k, i, l]) => (
            <button key={k} data-on={naAbaEmpresa(k) ? "1" : "0"} onClick={() => irEmpresa(k)}><Ic n={i} s={21} />{{ talentos: "Pessoas", vagas: "Vagas", hire: "Publicar", conta: "Conta" }[k] || l}</button>
          ))}
        </nav>
      )}
      {logged && (
        <nav className="mobnav">
          {[["dash", "home", "Início"], ["feed", "briefcase", "Vagas"], ["apps", "list", "Candidaturas"], ["cv", "idcard", "Currículo"], ["profile", "user", "Perfil"], ["hub", "more", "Mais"]].map(([v, i, l]) => (
            <button key={v} data-on={view === v && !openJob ? "1" : "0"} onClick={() => go(v)}>
              <Ic n={i} s={21} />{l}
            </button>
          ))}
        </nav>
      )}
      {(!comMenu || view === "landing") && view !== "signup" && view !== "cvedit" ? <Rodape go={go} comecar={comecar} /> : null}
      {logged && <Assistant ctx={ctx} />}
      {barra && view !== "donate" && <FaixaDoacao go={go} fechar={fecharBarra} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

/* ------------------------------- LANDING -------------------------------- */
function Landing({ comecar, go, matches }) {
  const vitrine = ["j42", "j21", "j43", "j13"].map((id) => JOBS.find((j) => j.id === id)).filter(Boolean);
  const demo = (vitrine.length >= 3 ? vitrine : [...JOBS].sort((a, b) => a.posted - b.posted)).slice(0, 4);
  return (
    <>
      <section className="wrap" style={{ padding: "72px 28px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 56, alignItems: "center" }} className="hero-grid">
          <div>
            <span className="eyebrow">Trabalho perto de você</span>
            <h1 style={{ margin: "16px 0 0" }}>
              Da diária ao<br />emprego fixo,<br /><em style={{ color: "var(--wine)", fontStyle: "italic" }}>sem complicação.</em>
            </h1>
            <div className="rule" />
            <p className="lead" style={{ maxWidth: 500 }}>
              Diária de faxina, ajudante de obra, cozinha, entregas, loja. Cadastre-se em um minuto, sem currículo
              e sem diploma, e veja as vagas da sua região com o valor e o horário.
            </p>
            <div className="row" style={{ marginTop: 30, flexWrap: "wrap" }}>
              <button className="btn btn-p" style={{ padding: "13px 24px", fontSize: 15 }} onClick={() => comecar([])}>Quero trabalhar <Ic n="arrow" s={16} /></button>
              <button className="btn btn-s" style={{ padding: "13px 22px", fontSize: 15 }} onClick={() => go("hire")}>Quero contratar</button>
            </div>
            <div className="trust" style={{ marginTop: 26 }}>
              <span><Ic n="checkCircle" />Grátis para quem procura</span>
              <span><Ic n="checkCircle" />Cadastro em 1 minuto</span>
              <span><Ic n="checkCircle" />Nenhuma vaga pode cobrar de você</span>
            </div>
            <div style={{ marginTop: 18 }}><BotaoInstalar compacto /></div>
          </div>

          {demo.length === 0 ? (
          <div className="hero-demo fade">
            <div className="top between">
              <span className="small" style={{ fontWeight: 600, color: "var(--ink)" }}>As primeiras vagas estão chegando</span>
              <span className="muted">novo</span>
            </div>
            <div style={{ padding: "22px 20px" }}>
              <p style={{ margin: 0 }}>O Matchly acabou de abrir. As empresas e as pessoas que contratam estão começando a entrar e publicar vagas.</p>
              <p className="muted" style={{ margin: "10px 0 0" }}>Faça seu cadastro agora. Quando aparecer uma vaga que combina com você, ela fica no seu painel.</p>
              <div className="row" style={{ marginTop: 18, flexWrap: "wrap" }}>
                <button className="btn btn-p btn-sm" onClick={() => comecar([])}>Fazer meu cadastro</button>
                <button className="btn btn-s btn-sm" onClick={() => go("companyRegister")}>Cadastrar minha empresa</button>
              </div>
            </div>
          </div>
          ) : (
          <div className="hero-demo fade">
            <div className="top between">
              <span className="small" style={{ fontWeight: 600, color: "var(--ink)" }}>Vagas abertas hoje</span>
              <span className="muted">{AO_VIVO ? "atualizado agora" : "exemplos"}</span>
            </div>
            <div className="divide">
              {demo.map((j) => {
                const c = companyOf(j.companyId);
                return (
                  <div key={j.id} style={{ padding: "15px 18px", display: "flex", gap: 14, alignItems: "center" }}>
                    <CompanyLogo c={c} size={40} />
                    <div className="grow" style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.title}</h3>
                      <div className="muted">{c.name} · {j.city}</div>
                    </div>
                    <div className="col" style={{ alignItems: "flex-end", gap: 4 }}>
                      <span className="small" style={{ fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>{payLabel(j)}</span>
                      <span className={"badge " + (ehBico(j) ? "b-wine" : "b-green")} style={{ padding: "2px 8px", fontSize: 11 }}>{ehBico(j) ? rotuloAvulso(j) : j.contract}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </section>

      <section className="wrap sec" style={{ paddingTop: 64 }}>
        <div className="between" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <span className="eyebrow">Escolha por onde começar</span>
            <h2 style={{ marginTop: 14 }}>Que tipo de trabalho você procura?</h2>
          </div>
          <p className="muted" style={{ maxWidth: 320 }}>Toque numa área para se cadastrar já com ela marcada. Dá para escolher mais de uma.</p>
        </div>
        <div className="tipos" style={{ marginTop: 28 }}>
          {TIPOS.map((t) => (
            <button key={t.id} type="button" className="tipo" onClick={() => comecar([t.id])}>
              <span className="ico"><Ic n={t.icon} s={22} /></span>
              <span><b>{t.label}</b><br /><small>{t.ex}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 84 }}>
        <span className="eyebrow">Como funciona</span>
        <h2 style={{ marginTop: 14, maxWidth: 620 }}>Três passos, sem papelada.</h2>
        <div className="grid3" style={{ marginTop: 34 }}>
          {[
            ["Diga o que você faz", "Nome, WhatsApp e o tipo de trabalho. Não precisa de currículo, diploma nem experiência."],
            ["Veja vagas perto de você", "Cada vaga mostra quanto paga, o horário, se é diária ou fixa e o que pede, em palavras simples."],
            ["Fale com quem contrata", "Candidate-se no site da empresa ou pelo contato de quem publicou. Acompanhe tudo pelo celular."],
          ].map(([t, d], i) => (
            <div key={t}>
              <div className="num">{i + 1}</div>
              <h3 style={{ marginTop: 16 }}>{t}</h3>
              <p style={{ marginTop: 8, fontSize: 14.5 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 84 }}>
        <div className="card" style={{ padding: "34px 34px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }} id="seguranca">
          {[
            ["shield", "Vagas conferidas", "Vaga que pede dinheiro, taxa ou curso pago sai do ar até alguém revisar."],
            ["building", "Empresas identificadas", "Empresas se cadastram com CNPJ e ganham selo depois da verificação."],
            ["lock", "Seu contato protegido", "Seu WhatsApp só aparece para quem você autorizar. Você pode apagar tudo quando quiser."],
          ].map(([i, t, d]) => (
            <div key={t} className="row" style={{ alignItems: "flex-start", gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--wine-tint)", color: "var(--wine)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Ic n={i} s={20} /></span>
              <div><h3 style={{ fontSize: 15.5 }}>{t}</h3><p style={{ marginTop: 6, fontSize: 14 }}>{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 84 }}>
        <div className="ink-panel" style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 40, alignItems: "center" }}>
          <div>
            <span className="eyebrow" style={{ color: "#E08194" }}>Para quem contrata</span>
            <h2 style={{ marginTop: 14 }}>Precisa de alguém hoje?</h2>
            <p style={{ marginTop: 14, maxWidth: 460 }}>
              Vale para o comércio do bairro e para você, que precisa de uma diarista, de um ajudante para a mudança
              ou de um garçom para a festa. Publique de graça, veja quem combina e converse direto.
            </p>
            <div className="row" style={{ marginTop: 26, flexWrap: "wrap" }}>
              <button className="btn btn-p" onClick={() => go("hire")}>Publicar uma vaga</button>
              <button className="btn" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.3)" }} onClick={() => go("companyRegister")}>Cadastrar minha empresa</button>
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            {[["broom", "Diarista", "R$ 170 por dia"], ["box", "Ajudante de mudança", "R$ 160 por dia"], ["utensils", "Garçom para evento", "R$ 170 por noite"], ["store", "Atendente de loja", "R$ 1.900/mês"]].map(([i, x, v]) => (
              <div key={x} className="between" style={{ border: "1px solid rgba(255,255,255,.16)", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "rgba(255,255,255,.92)" }}>
                <span className="row" style={{ gap: 10 }}><Ic n={i} s={17} />{x}</span><span style={{ color: "rgba(255,255,255,.6)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 72 }}>
        <div className="between" style={{ flexWrap: "wrap", gap: 24, borderTop: "1px solid var(--line)", paddingTop: 44 }}>
          <div style={{ maxWidth: 460 }}>
            <h2>Seu próximo trabalho pode começar hoje.</h2>
            <p style={{ marginTop: 14 }}>Cadastro grátis, em menos de um minuto, pelo celular.</p>
          </div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn-p" style={{ padding: "13px 24px", fontSize: 15 }} onClick={() => comecar([])}>Quero trabalhar <Ic n="arrow" s={16} /></button>
            <button className="btn btn-s" onClick={() => go("help")}>Documentos e dicas</button>
          </div>
        </div>
      </section>
      <style>{`@media(max-width:900px){.hero-grid{grid-template-columns:1fr!important;gap:36px!important}.ink-panel{grid-template-columns:1fr!important}#seguranca{grid-template-columns:1fr!important;padding:24px!important}}`}</style>
    </>
  );
}

/* --------------------------- RODAPÉ E DOAÇÃO ---------------------------- */
function Rodape({ go, comecar }) {
  const col = (titulo, itens) => (
    <div><h4>{titulo}</h4>{itens.map(([t, f]) => <button key={t} className="lk" onClick={f}>{t}</button>)}</div>
  );
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="cols">
          <div>
            <Logo onClick={() => go("landing")} />
            <p style={{ marginTop: 14, fontSize: 14, maxWidth: 300 }}>Vagas de emprego e diárias perto de você. Gratuito para quem procura.</p>
          </div>
          {col("Para quem procura", [["Ver vagas", () => go("search")], ["Cadastre-se grátis", () => go("cadastro")], ["Documentos e dicas", () => go("help")], ["Instalar no celular", () => go("instalar")]])}
          {col("Para quem contrata", [["Publicar uma vaga", () => go("hire")], ["Cadastrar empresa", () => go("companyRegister")], ["Empresas", () => go("companies")]])}
          {col("Matchly", [["Privacidade", () => go("privacy")], ["Segurança e golpes", () => go("help")], ["Apoie o projeto", () => go("donate")]])}
        </div>
        <div className="base muted">
          <span>© {new Date().getFullYear()} Matchly. Nenhuma vaga publicada aqui pode cobrar dinheiro de candidatos.</span>
          <span>Feito no Brasil</span>
        </div>
      </div>
    </footer>
  );
}

function FaixaDoacao({ go, fechar }) {
  return (
    <aside className="donatebar" aria-label="Pedido de doação">
      <div className="wrap inner">
        <Ic n="heart" s={20} style={{ color: "#fff" }} />
        <div className="grow" style={{ minWidth: 0, lineHeight: 1.25 }}>
          <b>Doe para ajudar a manter este site no ar</b>
          <div className="sub">O Matchly é gratuito para quem procura trabalho e se mantém com doações.</div>
        </div>
        <button className="cta" onClick={() => go("donate")}>Doar via Pix</button>
        <button className="fechar" onClick={fechar} aria-label="Fechar aviso de doação"><Ic n="x" s={18} /></button>
      </div>
    </aside>
  );
}

/* ------------------ REESCRITA DA EXPERIÊNCIA (sem inventar nada) -------- */
const FALA = [
  [/\bdava (o |os |a |as )?rem[eé]dios?/g, "administrava os remédios"], [/\bdava (a |o )?medica[çc][ãa]o/g, "administrava a medicação"],
  [/\bfazia (a |o )?(comida|janta|almo[çc]o|refei[çc][õo]es)/g, "preparava as refeições"], [/\bfazia (os )?lanches?/g, "preparava os lanches"],
  [/\bpassava pano( no ch[ãa]o)?/g, "limpava o chão"], [/\bvarria/g, "limpava"], [/\bbatia (a |as )?metas?/g, "cumpria as metas"],
  [/\bquando enchia\b/g, "em horários de movimento"], [/\bna correria\b/g, "em horários de movimento"],
  [/(^|\s)vó(?=[\s,.]|$)/g, "$1avó"], [/(^|\s)vô(?=[\s,.]|$)/g, "$1avô"],
  [/\bdava banho (neles|nelas|nele|nela)/g, "cuidava do banho"], [/\bdava banho\b/g, "cuidava do banho"],
  [/\bpra\b/g, "para"], [/\bvc\b/g, "você"], [/\bq\b/g, "que"], [/\btbm?\b/g, "também"], [/\bn\b/g, "não"],
  [/\bc\/\b/g, "com"], [/\btipo\b,?/g, ""], [/\bné\b/g, ""], [/\blá\b/g, ""], [/^\s*eu\s+/g, ""], [/\s+eu\s+/g, " "], [/\s{2,}/g, " "]];
const VERBOS = [
  ["descarreg", "Descarga", "de"], ["carreg", "Carga", "de"], ["atend", "Atendimento", "a"], ["ajud", "Apoio", "a"],
  ["auxili", "Apoio", "a"], ["limp", "Limpeza", "de"], ["arrum", "Organização", "de"], ["organiz", "Organização", "de"],
  ["vend", "Venda", "de"], ["cuid", "Cuidado", "de"], ["cozinh", "Preparo de refeições", ""], ["prepar", "Preparo", "de"],
  ["entreg", "Entrega", "de"], ["dirig", "Condução", "de"], ["recep", "Recepção", "de"], ["receb", "Recebimento", "de"],
  ["confer", "Conferência", "de"], ["lav", "Lavagem", "de"], ["repu", "Reposição", "de"], ["repo", "Reposição", "de"],
  ["cobr", "Cobrança", "de"], ["administr", "Administração", "de"], ["cumpr", "Cumprimento", "de"], ["abri", "Abertura", "de"], ["fech", "Fechamento", "de"], ["control", "Controle", "de"],
  ["anot", "Registro", "de"], ["separ", "Separação", "de"], ["embal", "Embalagem", "de"], ["mont", "Montagem", "de"],
  ["pint", "Pintura", "de"], ["consert", "Reparo", "de"], ["cort", "Corte", "de"], ["servi", "Serviço", "de"],
  ["opera", "Operação", "de"], ["passe", "Passeio", ""], ["passav", "Passagem", "de"], ["trabalh", "Trabalho", ""],
  ["era", "Atuação como", ""], ["fic", "Atuação", ""], ["fiz", "", ""], ["faz", "", ""], ["faç", "", ""],
];
const PREPS = ["no", "na", "nos", "nas", "em", "com", "para", "de", "do", "da", "dos", "das", "ao", "à", "aos", "às", "pelo", "pela", "num", "numa", "como", "quando", "durante"];
const REG = { a: { o: "ao", a: "à", os: "aos", as: "às" }, de: { o: "do", a: "da", os: "dos", as: "das", um: "de um", uma: "de uma" } };

const verbOf = (w) => VERBOS.find(([st]) => norm(w).startsWith(st) && !(st === "era" && norm(w) !== "era"));
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

function convertClause(c) {
  const words = c.trim().split(/\s+/);
  const v = verbOf(words[0] || "");
  if (!v) return { text: cap(c.trim()), nounOnly: false };
  const [, noun, reg] = v;
  let rest = words.slice(1).join(" ");
  if (!noun) return { text: cap(rest.replace(/^(o|a|os|as|um|uma)\s+/i, "")), nounOnly: false };
  if (!rest) return { text: noun, nounOnly: true };
  const first = rest.split(" ")[0].toLowerCase();
  if (PREPS.includes(first) || !reg) return { text: `${noun} ${rest}`, nounOnly: false };
  const art = REG[reg][first];
  if (art) rest = `${art} ${rest.split(" ").slice(1).join(" ")}`;
  else rest = `${reg} ${rest}`;
  return { text: `${noun} ${rest}`, nounOnly: false };
}

function polishExperience(raw) {
  let t = " " + raw.toLowerCase() + " ";
  FALA.forEach(([re, to]) => (t = t.replace(re, to)));
  const pedacos = [];
  t.split(/[\n.;!?]+|,\s*/).forEach((piece) => {
    const partes = piece.trim().split(/\s+e\s+/);
    let atual = partes[0];
    for (let k = 1; k < partes.length; k++) {
      if (verbOf(partes[k].split(" ")[0])) { pedacos.push(atual); atual = partes[k]; }
      else atual += " e " + partes[k];
    }
    pedacos.push(atual);
  });
  const conv = pedacos.map((x) => x.trim()).filter((x) => x.length > 1).map(convertClause);
  const frases = [];
  for (let k = 0; k < conv.length; k++) {
    if (conv[k].nounOnly && conv[k + 1]) {
      frases.push(`${conv[k].text} e ${conv[k + 1].text.charAt(0).toLowerCase()}${conv[k + 1].text.slice(1)}`); k++;
    } else frases.push(conv[k].text);
  }
  const POS = [[/^Lavagem e passagem de (as |a )?roupas?/i, "Lavar e passar roupas"], [/^Passagem de (as |a )?roupas?/i, "Passar roupas"], [/^Limpeza de o /i, "Limpeza do "], [/\bde o\b/g, "do"], [/\bde a\b/g, "da"]];
  return [...new Set(frases.map((f) => { let x = f.replace(/\s+/g, " ").trim(); POS.forEach(([re, to]) => (x = x.replace(re, to))); return x; }).filter(Boolean))]
    .map((f) => f.replace(/[.\s]*$/, ".")).join(" ");
}

const SKILL_KEYS = {
  "Atendimento ao cliente": ["atend", "cliente", "balcão", "recep"], "Vendas": ["vend", "meta", "comissão"],
  "Organização": ["organiz", "arrum"], "Preparo de alimentos": ["cozinh", "lanch", "chapa", "prepar", "salgad", "pão"],
  "Higiene e manipulação de alimentos": ["higien", "manipul"], "Controle de estoque": ["estoque", "repu", "repo", "confer"],
  "Esforço físico": ["carreg", "descarreg", "peso", "obra", "massa"], "Cuidados básicos de saúde": ["remédio", "medica", "acamad", "curativo"],
  "Paciência": ["criança", "idos"], "Pequenos reparos": ["consert", "reparo", "manuten"], "CNH B": ["carro", "dirig", "van"],
  "CNH A": ["moto"], "Informática básica": ["computador", "sistema", "e-mail"], "Excel": ["excel", "planilha"],
  "Experiência com animais": ["cachorro", "animal", "pet", "gato"], "Comunicação": ["telefone", "ligaç"],
};
const detectSkills = (text) => { const t = norm(text); return Object.keys(SKILL_KEYS).filter((k) => SKILL_KEYS[k].some((w) => t.includes(w))); };


/* ---------------------------- CADASTRO RÁPIDO --------------------------- */
/* Quatro telas curtas. As duas últimas são opcionais. O currículo completo fica para depois. */
const mascaraTel = (v) => { const d = v.replace(/\D/g, "").slice(0, 11);
  return d.length <= 2 ? d : d.length <= 7 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`; };

const Opcao = ({ on, onClick, titulo, sub }) => (
  <button type="button" className="opcao" data-on={on ? "1" : "0"} onClick={onClick}>
    <span className="rd" /><span><span>{titulo}</span>{sub && <small>{sub}</small>}</span>
  </button>
);

const TEMPOS = { "Menos de 6 meses": 0.3, "De 6 meses a 1 ano": 0.75, "De 1 a 2 anos": 1.5, "De 2 a 5 anos": 3.5, "Mais de 5 anos": 6 };
const VINCULOS = ["Com carteira assinada", "Sem carteira", "Por conta própria", "Diária", "Temporário"];
const FUNCOES = [...new Set([...TIPOS.map((t) => t.role), "Diarista", "Faxineira", "Auxiliar de limpeza", "Pedreiro", "Servente", "Pintor", "Garçom",
  "Chapeiro", "Cozinheira", "Repositor", "Operador de caixa", "Vendedor", "Motorista", "Motoboy", "Babá", "Cuidadora de idosos", "Porteiro", "Jardineiro",
  "Estoquista", "Auxiliar de produção", "Recepcionista", "Manicure", "Costureira", "Lavador de carros"])];
const novoTrabalho = () => ({ title: "", company: "", tempo: "", vinculo: "", atual: false, raw: "", results: "" });

function QuickSignup({ ctx, inicial = [] }) {
  const [passo, setPasso] = useState(0);
  const [f, setF] = useState({ nome: "", tel: "", cidade: "", bairro: "", tipos: inicial, formato: "Tanto faz",
    trabalhos: [novoTrabalho()], semExperiencia: false, horarios: [], inicio: "Imediatamente", estudo: "", cnh: "Não tenho", documentos: [], sobre: "", salario: "", salUnit: "", mostrarSal: true });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const unidadeSal = f.salUnit || (f.formato === "Emprego fixo" ? "/mês" : "/dia");
  const setT = (i, k, v) => setF((x) => { const t = [...x.trabalhos]; t[i] = { ...t[i], [k]: v }; return { ...x, trabalhos: t }; });
  const [erro, setErro] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [jaTem, setJaTem] = useState(false);
  const telOk = f.tel.replace(/\D/g, "").length >= 10;
  const TOTAL = 4;

  const avancar = () => {
    if (passo === 0) {
      if (!f.nome.trim()) return setErro("Escreva o seu nome.");
      if (!telOk) return setErro("Coloque o seu WhatsApp com DDD. É por ele que quem contrata fala com você.");
      if (!f.cidade.trim()) return setErro("Diga a sua cidade, para mostrarmos vagas perto de você.");
      if (AO_VIVO && !/^\d{6}$/.test(senha)) return setErro("Crie uma senha de 6 números. Com ela você entra de outro celular.");
    }
    if (passo === 1 && !f.tipos.length) return setErro("Escolha pelo menos um tipo de trabalho.");
    if (passo === 2 && !f.semExperiencia) {
      const incompleto = f.trabalhos.find((t) => (t.company || t.raw || t.tempo) && !t.title.trim());
      if (incompleto) return setErro("Diga qual era a sua função em cada trabalho, ou apague o que ficou pela metade.");
    }
    setErro("");
    if (passo < TOTAL - 1) { setPasso(passo + 1); window.scrollTo({ top: 0 }); return; }
    concluir();
  };

  const concluir = async () => {
    const escolhidos = TIPOS.filter((t) => f.tipos.includes(t.id));
    const trabalhos = f.semExperiencia ? [] : f.trabalhos.filter((t) => t.title.trim());
    const experiences = trabalhos.map((t) => ({
      title: t.title.trim(), company: t.company.trim(), area: detectAreas(`${t.title} ${t.raw}`)[0] || "", start: "", end: t.atual ? "Atual" : "",
      tempo: t.tempo, vinculo: t.vinculo, model: "Presencial", cidade: "", raw: t.raw.trim(), results: t.results.trim(),
      skills: detectSkills(`${t.title} ${t.raw}`),
    }));
    const anos = Math.round(trabalhos.reduce((a, t) => a + (TEMPOS[t.tempo] ?? 0.5), 0) * 10) / 10;
    const contratos = f.formato === "Diária ou por hora" ? CONTRATOS_BICO : f.formato === "Emprego fixo" ? ["CLT", "Aprendiz", "Estágio"] : [...CONTRATOS_BICO, "CLT", "Aprendiz", "Estágio"];
    const CNH = { "A (moto)": ["A", ["CNH A"]], "B (carro)": ["B", ["CNH B"]], "AB": ["AB", ["CNH A", "CNH B"]], "C, D ou E": ["C, D ou E", ["CNH B"]] };
    const [cnhCat, cnhSkills] = CNH[f.cnh] || ["Não tenho", []];
    const novoPerfil = {
      ...EMPTY_PROFILE, name: f.nome.trim(), phone: f.tel, city: f.cidade.trim(), bairro: f.bairro.trim(), years: anos,
      experiences, sobre: f.sobre.trim(), cnh: cnhCat, documentos: f.documentos,
      skills: [...new Set([...escolhidos.flatMap((t) => t.skills), ...experiences.flatMap((e) => e.skills), ...cnhSkills])],
      horarios: f.horarios, inicio: f.inicio,
      education: f.estudo ? [{ level: f.estudo, course: "", school: "", status: "Concluído", end: "" }] : [],
      role: escolhidos[0]?.role || experiences[0]?.title || "", cadastroRapido: true,
      mostrarSalario: f.mostrarSal && +f.salario > 0,
    };
    const novasPrefs = { ...EMPTY_PREFS, mainRole: escolhidos[0]?.role || "", altRoles: escolhidos.slice(1).map((t) => t.role),
      city: f.cidade.trim(), areas: escolhidos.map((t) => t.area), models: ["Presencial", "Híbrido"], contracts: contratos,
      sTarget: +f.salario > 0 ? +f.salario : "", sUnit: unidadeSal };
    if (AO_VIVO) {
      setEnviando(true);
      try {
        const r = await api("cadastro", { perfil: { profile: novoPerfil, prefs: novasPrefs }, login: f.tel, senha });
        CHAVES.set("candidato", r.token);
      } catch (e) {
        setEnviando(false);
        if (e.status === 409) { setJaTem(true); setPasso(0); window.scrollTo({ top: 0 }); return setErro(e.message); }
        // sem internet ou servidor fora: o cadastro fica neste aparelho e sobe depois
      }
      setEnviando(false);
    }
    ctx.setProfile(novoPerfil);
    ctx.setPrefs(novasPrefs);
    ctx.setApps([]); ctx.setSaved({}); ctx.setHidden([]);
    ctx.setNotifs([{ id: "boasvindas", icon: "checkCircle", title: "Cadastro feito", text: "Avisamos aqui quando aparecer vaga nova que combine com você.", time: "agora", read: false }]);
    ctx.setLogged(true);
    ctx.say(`Pronto, ${f.nome.trim().split(" ")[0]}! Estas são as vagas que combinam com você.`);
    ctx.go("feed");
  };

  const melhorar = (i) => {
    const t = f.trabalhos[i];
    if ((t.raw || "").trim().length < 4) { setErro("Escreva primeiro o que você fazia, do seu jeito."); return; }
    setErro(""); setT(i, "results", polishExperience(t.raw));
  };

  const titulos = ["Vamos começar", "Que trabalho você procura?", "Onde você já trabalhou?", "Só mais um pouco"];
  const subs = [
    "Leva poucos minutos. Não precisa de currículo.",
    "Escolha quantos quiser. Mostramos primeiro as vagas dessas áreas.",
    "Conte seus trabalhos anteriores, com ou sem carteira assinada. Vale emprego, diária e trabalho por conta própria.",
    "Tudo aqui é opcional, mas ajuda quem contrata a escolher você.",
  ];

  return (
    <div className="wrap" style={{ maxWidth: 720, padding: "40px 24px 80px" }}>
      <div className="between" style={{ marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <span className="passo">Passo {passo + 1} de {TOTAL}{passo >= 2 ? " · opcional" : ""}</span>
        {passo === 0 && <button className="btn btn-g btn-sm" onClick={() => ctx.go("cvedit")}>Prefiro preencher o currículo completo</button>}
      </div>
      <div className="steps">{Array.from({ length: TOTAL }, (_, i) => <i key={i} data-on={i <= passo ? "1" : "0"} />)}</div>
      <h2>{titulos[passo]}</h2>
      <p style={{ marginTop: 8, marginBottom: 26 }}>{subs[passo]}</p>

      {passo === 0 && (
        <div className="card big">
          <Field label="Seu nome"><input id="q-nome" className="input" autoFocus autoComplete="name" value={f.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Como você quer ser chamado" /></Field>
          <Field label="WhatsApp" hint="Só aparece para quem você autorizar.">
            <input id="q-tel" className="input" inputMode="tel" autoComplete="tel" value={f.tel} onChange={(e) => set("tel", mascaraTel(e.target.value))} placeholder="(11) 90000-0000" />
          </Field>
          {AO_VIVO && <CampoSenha id="q-senha" valor={senha} onChange={setSenha} rotulo="Crie uma senha de 6 números" dica="Com o seu WhatsApp e esta senha, você entra de qualquer celular." />}
          <div className="grid2">
            <Field label="Cidade"><input id="q-cidade" className="input" autoComplete="address-level2" value={f.cidade} onChange={(e) => set("cidade", e.target.value)} placeholder="Ex.: São Paulo" /></Field>
            <Field label="Bairro (opcional)"><input id="q-bairro" className="input" value={f.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Ex.: Itaquera" /></Field>
          </div>
        </div>
      )}

      {passo === 1 && (
        <>
          <div className="tipos">
            {TIPOS.map((t) => {
              const on = f.tipos.includes(t.id);
              return (
                <button key={t.id} type="button" className="tipo" data-on={on ? "1" : "0"} aria-pressed={on}
                  onClick={() => set("tipos", on ? f.tipos.filter((x) => x !== t.id) : [...f.tipos, t.id])}>
                  {on && <span className="ok"><Ic n="check" s={14} w={2.4} /></span>}
                  <span className="ico"><Ic n={t.icon} s={22} /></span>
                  <span><b>{t.label}</b><br /><small>{t.ex}</small></span>
                </button>
              );
            })}
          </div>
          <h3 style={{ marginTop: 30, marginBottom: 12, fontSize: 16 }}>Que tipo de vaga serve para você?</h3>
          <div className="opcoes">
            <Opcao on={f.formato === "Diária ou por hora"} onClick={() => set("formato", "Diária ou por hora")} titulo="Diária ou por hora" sub="Serviços avulsos, muitas vezes pagos no mesmo dia" />
            <Opcao on={f.formato === "Emprego fixo"} onClick={() => set("formato", "Emprego fixo")} titulo="Emprego fixo" sub="Com carteira assinada, salário todo mês e benefícios" />
            <Opcao on={f.formato === "Tanto faz"} onClick={() => set("formato", "Tanto faz")} titulo="Tanto faz" sub="Quero ver todas as opções" />
          </div>
        </>
      )}

      {passo === 2 && (
        <div className="col" style={{ gap: 16 }}>
          {!f.semExperiencia && f.trabalhos.map((t, i) => (
            <div className="card" key={i}>
              <div className="between" style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 15 }}>{f.trabalhos.length > 1 ? `Trabalho ${i + 1}` : "Seu último trabalho"}</h3>
                {f.trabalhos.length > 1 && <button className="btn btn-g btn-sm" onClick={() => set("trabalhos", f.trabalhos.filter((_, k) => k !== i))}>Remover</button>}
              </div>
              <div className="grid2">
                <Field label="O que você fazia (função)">
                  <input id={`q-funcao-${i}`} className="input" list="q-funcoes" value={t.title} onChange={(e) => setT(i, "title", e.target.value)} placeholder="Ex.: Diarista, ajudante de obra" />
                </Field>
                <Field label="Onde trabalhou (opcional)">
                  <input id={`q-local-${i}`} className="input" value={t.company} onChange={(e) => setT(i, "company", e.target.value)} placeholder="Empresa, loja ou família" />
                </Field>
              </div>
              <Field label="Por quanto tempo">
                <ChipGroup multi={false} options={Object.keys(TEMPOS)} value={t.tempo} onChange={(v) => setT(i, "tempo", v)} />
              </Field>
              <Field label="Como era o trabalho">
                <ChipGroup multi={false} options={VINCULOS} value={t.vinculo} onChange={(v) => setT(i, "vinculo", v)} />
              </Field>
              <label className="row small" style={{ gap: 8, cursor: "pointer", marginBottom: 14 }}>
                <input id={`q-atual-${i}`} type="checkbox" checked={t.atual} onChange={(e) => setT(i, "atual", e.target.checked)} style={{ accentColor: "var(--wine)", width: 17, height: 17 }} />
                Ainda trabalho lá
              </label>
              <Field label="Conte o que você fazia no dia a dia (opcional)" hint={Reconhecedor ? "Escreva ou fale do seu jeito. Depois, se quiser, a gente arruma o texto para o currículo, sem inventar nada." : "Escreva do seu jeito. Depois, se quiser, a gente arruma o texto para o currículo, sem inventar nada."}>
                <textarea id={`q-raw-${i}`} className="ta" value={t.raw} onChange={(e) => setT(i, "raw", e.target.value)} placeholder="Ex.: limpava a casa toda, passava roupa e cuidava das plantas" />
                <div style={{ marginTop: 8 }}><BotaoFalar rotulo="Contar falando" onTexto={(txt) => setF((x) => { const tt = [...x.trabalhos]; tt[i] = { ...tt[i], raw: `${tt[i].raw} ${txt}`.trim() }; return { ...x, trabalhos: tt }; })} /></div>
              </Field>
              {t.raw.trim().length > 3 && (
                <button className="btn btn-s btn-sm" onClick={() => melhorar(i)}><Ic n="sparkle" s={15} /> {t.results ? "Refazer texto" : "Arrumar texto para o currículo"}</button>
              )}
              {t.results && (
                <div className="note" style={{ marginTop: 12 }}>
                  <div className="small" style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Como vai aparecer no currículo</div>
                  <textarea id={`q-res-${i}`} className="ta" style={{ minHeight: 70, background: "var(--surface)" }} value={t.results} onChange={(e) => setT(i, "results", e.target.value)} />
                </div>
              )}
            </div>
          ))}
          <datalist id="q-funcoes">{FUNCOES.map((x) => <option key={x} value={x} />)}</datalist>
          {!f.semExperiencia ? (
            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button className="btn btn-s" onClick={() => set("trabalhos", [...f.trabalhos, novoTrabalho()])}>Adicionar outro trabalho</button>
              <button className="btn btn-g" onClick={() => set("semExperiencia", true)}>Ainda não trabalhei</button>
            </div>
          ) : (
            <div className="note">
              Tudo bem. Muitas vagas aqui não pedem experiência, e vamos mostrar essas primeiro.
              <div style={{ marginTop: 10 }}><button className="btn btn-s btn-sm" onClick={() => set("semExperiencia", false)}>Na verdade, já trabalhei</button></div>
            </div>
          )}
        </div>
      )}

      {passo === 3 && (
        <div className="col" style={{ gap: 26 }}>
          <div>
            <h3 style={{ marginBottom: 6, fontSize: 16 }}>Quanto você quer receber?</h3>
            <p className="muted" style={{ marginBottom: 12 }}>Usamos para mostrar primeiro as vagas que pagam o que você pede. Se não souber, deixe em branco.</p>
            <ChipGroup multi={false} options={["Por dia", "Por mês", "Por hora"]} value={{ "/dia": "Por dia", "/mês": "Por mês", "/hora": "Por hora" }[unidadeSal]}
              onChange={(v) => set("salUnit", { "Por dia": "/dia", "Por mês": "/mês", "Por hora": "/hora" }[v])} />
            <div className="row" style={{ gap: 10, marginTop: 12, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>R$</span>
              <input id="q-salario" className="input" inputMode="numeric" style={{ maxWidth: 180, fontSize: 16 }} value={f.salario}
                onChange={(e) => set("salario", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder={unidadeSal === "/dia" ? "Ex.: 150" : unidadeSal === "/hora" ? "Ex.: 20" : "Ex.: 1800"} />
              <span className="muted">{UNID_NOME[unidadeSal]}</span>
            </div>
            {+f.salario > 0 && (
              <label className="row small" style={{ gap: 8, cursor: "pointer", marginTop: 12 }}>
                <input id="q-mostrar-sal" type="checkbox" checked={f.mostrarSal} onChange={(e) => set("mostrarSal", e.target.checked)} style={{ accentColor: "var(--wine)", width: 17, height: 17 }} />
                Mostrar esse valor no meu currículo para quem contrata
              </label>
            )}
          </div>
          <div>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Quando você pode trabalhar?</h3>
            <ChipGroup options={[...HORARIOS, "Qualquer horário"]} value={f.horarios} onChange={(v) => set("horarios", v)} />
          </div>
          <div>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Pode começar quando?</h3>
            <ChipGroup multi={false} options={["Imediatamente", "Esta semana", "Em 15 dias", "Em 30 dias"]} value={f.inicio} onChange={(v) => set("inicio", v)} />
          </div>
          <div>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Tem carteira de motorista?</h3>
            <ChipGroup multi={false} options={["Não tenho", "A (moto)", "B (carro)", "AB", "C, D ou E"]} value={f.cnh} onChange={(v) => set("cnh", v)} />
          </div>
          <div>
            <h3 style={{ marginBottom: 6, fontSize: 16 }}>Quais documentos você já tem?</h3>
            <p className="muted" style={{ marginBottom: 12 }}>Quem contrata prefere quem pode começar logo.</p>
            <ChipGroup options={["RG", "CPF", "Carteira de Trabalho Digital", "Comprovante de residência"]} value={f.documentos} onChange={(v) => set("documentos", v)} />
          </div>
          <div>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Até onde você estudou?</h3>
            <select id="q-estudo" className="select" style={{ maxWidth: 360, fontSize: 15, padding: "12px 13px" }} value={f.estudo} onChange={(e) => set("estudo", e.target.value)}>
              <option value="">Prefiro não dizer</option>
              {["Não estudei", "Fundamental incompleto", "Fundamental", "Médio incompleto", "Médio", "Técnico", "Graduação"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <h3 style={{ marginBottom: 6, fontSize: 16 }}>Quer contar algo sobre você?</h3>
            <p className="muted" style={{ marginBottom: 12 }}>Aparece no topo do seu currículo. Duas ou três frases bastam.</p>
            <textarea id="q-sobre" className="ta" value={f.sobre} onChange={(e) => set("sobre", e.target.value)} placeholder="Ex.: Sou pontual, gosto de trabalhar com público e aprendo rápido." />
            <div style={{ marginTop: 8 }}><BotaoFalar rotulo="Contar falando" onTexto={(txt) => setF((x) => ({ ...x, sobre: `${x.sobre} ${txt}`.trim() }))} /></div>
          </div>
        </div>
      )}

      {erro && <div className="note" role="alert" style={{ marginTop: 18, borderColor: "var(--bad)", color: "var(--bad)" }}>{erro}
        {jaTem && <div style={{ marginTop: 10 }}><button className="btn btn-p btn-sm" onClick={() => { ctx.setRole("Candidato"); ctx.go("entrar"); }}>Entrar com a minha senha</button></div>}</div>}
      {AO_VIVO && passo === 0 && !erro && <p className="small" style={{ marginTop: 14 }}>Já tem cadastro? <a href="#" onClick={(e) => { e.preventDefault(); ctx.setRole("Candidato"); ctx.go("entrar"); }}>Entrar</a></p>}
      <div className="between" style={{ marginTop: 26, flexWrap: "wrap", gap: 10 }}>
        <button className="btn btn-g" onClick={() => (passo ? setPasso(passo - 1) : ctx.go("landing"))}><Ic n="back" s={16} /> Voltar</button>
        <div className="row" style={{ gap: 8 }}>
          {passo >= 2 && passo < TOTAL - 1 && <button className="btn btn-g" onClick={() => { setErro(""); setPasso(passo + 1); window.scrollTo({ top: 0 }); }}>Pular</button>}
          <button className="btn btn-p" style={{ padding: "13px 26px", fontSize: 15 }} onClick={avancar} disabled={enviando}>
            {enviando ? "Salvando…" : passo < TOTAL - 1 ? "Continuar" : "Ver vagas para mim"} <Ic n="arrow" s={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- SIGNUP -------------------------------- */
function Signup({ ctx, onDone }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState(ctx.logged ? ctx.profile : EMPTY_PROFILE);
  const set = (k, v) => setP((prev) => ({ ...prev, [k]: v }));
  const [aiBusy, setAiBusy] = useState(null);

  const addEdu = () => set("education", [...p.education, { level: "Graduação", course: "", school: "", status: "Cursando", end: "" }]);
  const addExp = () => set("experiences", [...p.experiences, { title: "", company: "", area: "", start: "", end: "", model: "Presencial", skills: [], raw: "", results: "" }]);
  const upd = (key, i, field, val) => setP((prev) => { const arr = [...prev[key]]; arr[i] = { ...arr[i], [field]: val }; return { ...prev, [key]: arr }; });
  const del = (key, i) => setP((prev) => ({ ...prev, [key]: prev[key].filter((_, x) => x !== i) }));

  const improve = (i) => {
    const e = p.experiences[i];
    const fonte = (e.raw || "").trim();
    if (fonte.length < 4) { ctx.say("Primeiro conte com o que você trabalhava"); return; }
    setAiBusy(i);
    setTimeout(() => {
      const texto = polishExperience(fonte);
      const achadas = detectSkills(`${fonte} ${e.title || ""}`);
      const area = detectAreas(`${fonte} ${e.title || ""}`)[0] || e.area;
      setP((prev) => {
        const arr = [...prev.experiences];
        arr[i] = { ...arr[i], results: texto, area, skills: [...new Set([...(arr[i].skills || []), ...achadas])] };
        return { ...prev, experiences: arr, skills: [...new Set([...prev.skills, ...achadas])] };
      });
      setAiBusy(null);
      ctx.say(achadas.length ? `Texto pronto. Também marcamos: ${achadas.slice(0, 3).join(", ")}` : "Texto pronto. Confira se ficou do seu jeito");
    }, 650);
  };

  const [pf, setPf] = useState(ctx.logged ? ctx.prefs : EMPTY_PREFS);
  const setPref = (k, v) => setPf((prev) => ({ ...prev, [k]: v }));
  const steps = ["Seus dados", "Até onde você estudou", "Onde você já trabalhou", "O que você procura"];
  const [erro, setErro] = useState("");
  const next = () => {
    if (step === 0 && !p.name.trim()) { setErro("Escreva pelo menos o seu nome."); return; }
    if (step === 0 && !p.city.trim()) { setErro("Diga a cidade onde você mora: é o que mais muda as vagas que aparecem."); return; }
    setErro("");
    if (step < 3) { setStep(step + 1); window.scrollTo({ top: 0 }); return; }
    const role = pf.mainRole.trim() || p.experiences[0]?.title || "";
    ctx.setProfile({ ...p, role, photo: initials(p.name) });
    ctx.setPrefs({ ...pf, mainRole: role, city: pf.city || p.city, altRoles: pf.altRoles.filter((x) => x.trim()) });
    onDone();
  };

  return (
    <div className="wrap" style={{ maxWidth: 720, padding: "48px 24px 80px" }}>
      <div className="steps">{[0, 1, 2, 3].map((i) => <i key={i} data-on={i <= step ? "1" : "0"} />)}</div>
      <p className="muted">Etapa {step + 1} de 4</p>
      <h2 style={{ margin: "6px 0 24px" }}>{steps[step]}</h2>

      {step === 0 && (
        <div className="card">
          <div className="row" style={{ marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, background: "var(--wine-tint)", color: "var(--wine)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 20, border: "1px solid var(--wine-line)" }}>
              {p.name.trim() ? initials(p.name) : "?"}
            </div>
            <button className="btn btn-s btn-sm" onClick={() => ctx.say("Envio de foto: conectar armazenamento de arquivos")}>Enviar foto</button>
          </div>
          <Field label="Nome completo"><input className="input" value={p.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <div className="grid2">
            <Field label="Data de nascimento"><input className="input" type="date" value={p.nascimento || ""} onChange={(e) => set("nascimento", e.target.value)} /></Field>
            <Field label="País"><input className="input" value={p.country} onChange={(e) => set("country", e.target.value)} /></Field>
            <Field label="Cidade"><input className="input" value={p.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="Estado (UF)">
              <select className="select" value={p.uf || ""} onChange={(e) => set("uf", e.target.value)}>
                <option value="">Escolha</option>
                {UFS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Bairro" hint="Quem contrata olha muito a distância até o trabalho."><input className="input" value={p.bairro || ""} onChange={(e) => set("bairro", e.target.value)} /></Field>
            <Field label="Telefone"><input className="input" value={p.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="E-mail"><input className="input" type="email" value={p.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Fuso horário">
              <select className="select" value={p.tz} onChange={(e) => set("tz", e.target.value)}>
                {TZ_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Quanto tempo de trabalho você já tem (em anos)"><input className="input" type="number" min="0" value={p.years} onChange={(e) => set("years", +e.target.value)} /></Field>
          </div>
          <Field label="Carteira de motorista (CNH)">
            <ChipGroup multi={false} options={["Não tenho", "A", "B", "AB", "C", "D", "E"]} value={p.cnh || "Não tenho"} onChange={(v) => set("cnh", v)} />
          </Field>
          <Field label="Documentos que você já tem" hint="Aparece no currículo como selo. Ajuda quem contrata a saber que você pode começar logo.">
            <ChipGroup options={["RG", "CPF", "Carteira de Trabalho Digital", "Comprovante de residência", "Título de eleitor", "Certificado de reservista", "PIS/NIS"]} value={p.documentos || []} onChange={(v) => set("documentos", v)} />
          </Field>
          <Field label="Pessoa com deficiência (opcional)" hint="Só informe se quiser. Ajuda a encontrar vagas afirmativas, e não aparece sem você permitir.">
            <input className="input" value={p.pcd || ""} onChange={(e) => set("pcd", e.target.value)} placeholder="Deixe em branco se preferir não informar" />
          </Field>
          <Field label="Idiomas">
            <div className="col" style={{ gap: 8 }}>
              {p.languages.map((l, i) => (
                <div className="row" key={i}>
                  <input className="input" value={l.name} onChange={(e) => upd("languages", i, "name", e.target.value)} />
                  <select className="select" value={l.level} onChange={(e) => upd("languages", i, "level", e.target.value)}>
                    {["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                  <button className="btn btn-g btn-sm" onClick={() => del("languages", i)}>Remover</button>
                </div>
              ))}
              <button className="btn btn-s btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => set("languages", [...p.languages, { name: "", level: "Básico" }])}>Adicionar idioma</button>
            </div>
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="col" style={{ gap: 16 }}>
          {p.education.map((e, i) => (
            <div className="card" key={i}>
              <div className="between" style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 15 }}>Formação {i + 1}</h3>
                <button className="btn btn-g btn-sm" onClick={() => del("education", i)}>Remover</button>
              </div>
              <div className="grid2">
                <Field label="Nível">
                  <select className="select" value={e.level} onChange={(ev) => upd("education", i, "level", ev.target.value)}>
                    {["Não estudei", "Fundamental incompleto", "Fundamental", "Médio incompleto", "Médio", "Técnico", "Tecnólogo", "Graduação", "Pós-graduação", "MBA", "Mestrado", "Doutorado"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="Curso"><input className="input" value={e.course} onChange={(ev) => upd("education", i, "course", ev.target.value)} /></Field>
                <Field label="Instituição"><input className="input" value={e.school} onChange={(ev) => upd("education", i, "school", ev.target.value)} /></Field>
                <Field label="Status">
                  <select className="select" value={e.status} onChange={(ev) => upd("education", i, "status", ev.target.value)}>
                    {["Cursando", "Concluído", "Trancado", "Incompleto"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="Conclusão"><input className="input" placeholder="2024" value={e.end} onChange={(ev) => upd("education", i, "end", ev.target.value)} /></Field>
                <Field label="Modalidade">
                  <select className="select" value={e.mode || "Presencial"} onChange={(ev) => upd("education", i, "mode", ev.target.value)}>
                    {["Presencial", "EAD", "Híbrido"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          ))}
          <button className="btn btn-s" onClick={addEdu}>Adicionar formação</button>
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Cursos livres</h3>
            <p className="muted" style={{ marginBottom: 14 }}>Senac, Senai, CRAS, curso online, igreja — tudo vale. Curso de poucas horas também conta.</p>
            {(p.cursos || []).map((c, i) => (
              <div key={i} className="grid2" style={{ borderTop: i ? "1px solid var(--line)" : 0, paddingTop: i ? 14 : 0 }}>
                <Field label="Nome do curso"><input className="input" value={c.nome} onChange={(ev) => upd("cursos", i, "nome", ev.target.value)} /></Field>
                <Field label="Onde fez"><input className="input" value={c.inst} onChange={(ev) => upd("cursos", i, "inst", ev.target.value)} /></Field>
                <Field label="Horas"><input className="input" type="number" value={c.horas} onChange={(ev) => upd("cursos", i, "horas", ev.target.value)} /></Field>
                <Field label="Ano"><div className="row"><input className="input" value={c.ano} onChange={(ev) => upd("cursos", i, "ano", ev.target.value)} />
                  <button className="btn btn-g btn-sm" onClick={() => del("cursos", i)}>Remover</button></div></Field>
              </div>
            ))}
            <button className="btn btn-s btn-sm" onClick={() => set("cursos", [...(p.cursos || []), { nome: "", inst: "", horas: "", ano: "" }])}>Adicionar curso</button>
          </div>
          <div className="note">
            Muita gente consegue emprego sem ter terminado a escola, e várias vagas aqui aceitam isso.
            Se preferir, siga em frente sem preencher.
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-s btn-sm" onClick={() => { set("education", []); setStep(2); }}>Não quero informar estudo</button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="col" style={{ gap: 16 }}>
          {p.experiences.map((e, i) => (
            <div className="card" key={i}>
              <div className="between" style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 15 }}>Experiência {i + 1}</h3>
                <button className="btn btn-g btn-sm" onClick={() => del("experiences", i)}>Remover</button>
              </div>
              <div className="grid2">
                <Field label="Onde você trabalhou"><input className="input" placeholder="Nome do lugar ou da família" value={e.company} onChange={(ev) => upd("experiences", i, "company", ev.target.value)} /></Field>
                <Field label="Qual era a sua função"><input className="input" placeholder="Ex.: atendente, ajudante, diarista" value={e.title} onChange={(ev) => upd("experiences", i, "title", ev.target.value)} /></Field>
                <Field label="Começou em"><input className="input" placeholder="2023" value={e.start} onChange={(ev) => upd("experiences", i, "start", ev.target.value)} /></Field>
                <Field label="Saiu em"><input className="input" placeholder="Ainda trabalho lá" value={e.end} onChange={(ev) => upd("experiences", i, "end", ev.target.value)} /></Field>
                <Field label="Cidade"><input className="input" value={e.cidade || ""} onChange={(ev) => upd("experiences", i, "cidade", ev.target.value)} /></Field>
              </div>
              <Field label="Como era o trabalho" hint="Trabalho sem carteira também é experiência e conta no currículo.">
                <ChipGroup multi={false} options={["Carteira assinada", "Sem carteira", "Por conta própria", "Diária", "Temporário", "Estágio ou aprendiz", "Voluntário"]} value={e.vinculo || ""} onChange={(v) => upd("experiences", i, "vinculo", v)} />
              </Field>

              <Field label="Com o que você trabalhava?" hint="Explique do seu jeito, como se estivesse contando para alguém. Ex.: atendia os clientes, arrumava as prateleiras e ajudava no caixa quando enchia.">
                <textarea className="ta" value={e.raw || ""} onChange={(ev) => upd("experiences", i, "raw", ev.target.value)} placeholder="Conte aqui, sem se preocupar com as palavras certas" />
              </Field>
              <button className="btn btn-p btn-sm" disabled={aiBusy !== null} onClick={() => improve(i)} style={{ marginBottom: 18 }}>
                {aiBusy === i ? "Montando o texto…" : e.results ? "Refazer com IA" : "Melhorar com IA"}
              </button>

              <Field label="O que você fazia no dia a dia" hint="É esse texto que aparece no seu currículo para quem contrata. Pode editar à vontade.">
                <textarea className="ta" value={e.results} onChange={(ev) => upd("experiences", i, "results", ev.target.value)}
                  placeholder="Toque em Melhorar com IA: montamos este texto a partir da sua explicação acima, sem inventar nada." />
              </Field>
              {(e.skills || []).length > 0 && (
                <div className="chips">{e.skills.map((x) => <Tag key={x} i="check">{x}</Tag>)}</div>
              )}
            </div>
          ))}
          <button className="btn btn-s" onClick={addExp}>Adicionar experiência</button>
          <div className="note">
            Nunca trabalhou de carteira assinada? Sem problema. Marque abaixo e vamos priorizar vagas
            que não exigem experiência.
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-s btn-sm" onClick={() => { setP({ ...p, experiences: [], years: 0 }); ctx.say("Vamos buscar vagas de primeiro emprego para você"); }}>
                Ainda não tenho experiência
              </button>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Quem pode falar bem de você (opcional)</h3>
            <p className="muted" style={{ marginBottom: 14 }}>Antigo chefe, professor, cliente. O telefone só aparece para quem contrata se você autorizar.</p>
            {(p.referencias || []).map((r, i) => (
              <div key={i} className="grid2" style={{ borderTop: i ? "1px solid var(--line)" : 0, paddingTop: i ? 14 : 0 }}>
                <Field label="Nome"><input className="input" value={r.nome} onChange={(ev) => upd("referencias", i, "nome", ev.target.value)} /></Field>
                <Field label="Quem é para você"><input className="input" placeholder="Ex.: minha gerente" value={r.relacao} onChange={(ev) => upd("referencias", i, "relacao", ev.target.value)} /></Field>
                <Field label="Telefone"><div className="row"><input className="input" value={r.tel} onChange={(ev) => upd("referencias", i, "tel", ev.target.value)} />
                  <button className="btn btn-g btn-sm" onClick={() => del("referencias", i)}>Remover</button></div></Field>
              </div>
            ))}
            <button className="btn btn-s btn-sm" onClick={() => set("referencias", [...(p.referencias || []), { nome: "", relacao: "", tel: "" }])}>Adicionar referência</button>
          </div>
          <Field label="O que você sabe fazer" hint="Marque tudo que se encaixa, mesmo que tenha aprendido fora de um emprego.">
            <ChipGroup
              options={["Atendimento ao cliente", "Vendas", "Organização", "Trabalho em equipe", "Agilidade", "Responsabilidade", "Esforço físico", "Preparo de alimentos", "Higiene e manipulação de alimentos", "Controle de estoque", "Informática básica", "Excel", "Comunicação", "Paciência", "Cuidados básicos de saúde", "Pequenos reparos", "Segurança do trabalho", "CNH A", "CNH B", "SQL", "Power BI", "Python"]}
              value={p.skills} onChange={(v) => set("skills", v)} />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Que tipo de trabalho você quer</h3>
            <Field label="Fale um pouco sobre você" hint="Duas ou três frases. É a primeira coisa que quem contrata lê no seu currículo.">
              <textarea className="ta" value={p.sobre || ""} onChange={(e) => set("sobre", e.target.value)} placeholder="Ex.: Sou pontual, gosto de trabalhar com público e aprendo rápido." />
            </Field>
            <Field label="Áreas que te interessam" hint="Marque quantas quiser. É o que mais muda as vagas que aparecem para você.">
              <ChipGroup options={Object.keys(AREA_LABELS)} value={pf.areas || []} onChange={(v) => setPref("areas", v)} />
            </Field>
            <Field label="Qual vaga você procura?" hint="Escreva o cargo do jeito que ele aparece nos anúncios.">
              <input className="input" value={pf.mainRole} onChange={(e) => setPref("mainRole", e.target.value)} placeholder="Ex.: Operador de caixa" />
            </Field>
            <Field label="Aceita também" hint="Separe por vírgula. Amplia suas chances.">
              <input className="input" value={pf.altRoles.join(", ")} onChange={(e) => setPref("altRoles", e.target.value.split(",").map((x) => x.trim()))} />
            </Field>
            <Field label="Como você quer trabalhar">
              <ChipGroup options={["Presencial", "Híbrido", "Remoto"]} value={pf.models} onChange={(v) => setPref("models", v)} />
            </Field>
            <Field label="Tipo de contrato">
              <ChipGroup options={["CLT", "PJ", "Freelancer", "Estágio", "Aprendiz", "Temporário"]} value={pf.contracts} onChange={(v) => setPref("contracts", v)} />
            </Field>
            <Field label="Quando pode começar">
              <ChipGroup multi={false} options={["Imediatamente", "Em 15 dias", "Em 30 dias", "Ainda estou empregado"]} value={p.inicio || "Imediatamente"} onChange={(v) => set("inicio", v)} />
            </Field>
            <Field label="Horários em que pode trabalhar">
              <ChipGroup options={[...HORARIOS, "Qualquer horário"]} value={p.horarios || []} onChange={(v) => set("horarios", v)} />
            </Field>
            <Field label="Aceita trabalhar em outra cidade?">
              <ChipGroup multi={false} options={["Sim", "Não"]} value={p.mudanca ? "Sim" : "Não"} onChange={(v) => { set("mudanca", v === "Sim"); setPref("willMove", v === "Sim"); }} />
            </Field>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 6 }}>Pretensão salarial</h3>
            <p className="muted" style={{ marginBottom: 16 }}>Serve para calcular a compatibilidade. Só aparece para a empresa se você marcar a opção abaixo.</p>
            <Field label="Como você quer receber">
          <ChipGroup multi={false} options={["Por dia", "Por mês", "Por hora"]} value={{ "/dia": "Por dia", "/mês": "Por mês", "/hora": "Por hora" }[pf.sUnit || "/mês"]}
            onChange={(v) => setPref("sUnit", { "Por dia": "/dia", "Por mês": "/mês", "Por hora": "/hora" }[v])} />
        </Field>
            <div className="grid2">
              <Field label="Mínimo que aceito" hint="Abaixo disso, não me mostre.">
                <input className="input" type="number" value={pf.sMin} onChange={(e) => setPref("sMin", +e.target.value)} />
              </Field>
              <Field label={`Quanto quero receber (${UNID_NOME[pf.sUnit || "/mês"]})`} hint="O valor que você pede na entrevista.">
                <input className="input" type="number" value={pf.sTarget} onChange={(e) => setPref("sTarget", +e.target.value)} />
              </Field>
              <Field label="Salário ideal" hint="O que faria você trocar de emprego na hora.">
                <input className="input" type="number" value={pf.sIdeal} onChange={(e) => setPref("sIdeal", +e.target.value)} />
              </Field>
              <Field label="Moeda">
                <select className="select" value={pf.currency} onChange={(e) => setPref("currency", e.target.value)}>
                  {["BRL", "USD", "EUR"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Benefícios que fazem diferença para você">
              <ChipGroup options={["Vale transporte", "Vale refeição", "Cesta básica", "Plano de saúde", "Comissão", "Auxílio creche", "Horário flexível", "Auxílio educação"]} value={pf.benefits} onChange={(v) => setPref("benefits", v)} />
            </Field>
            <Switch on={!!p.mostrarSalario} onChange={(v) => set("mostrarSalario", v)} label="Mostrar meu salário desejado no currículo" />
          </div>
        </div>
      )}

      {erro && <div className="note" style={{ marginTop: 18, borderColor: "var(--bad)", color: "var(--bad)" }}>{erro}</div>}
      <div className="between" style={{ marginTop: 24 }}>
        <button className="btn btn-g" onClick={() => {
          if (step) return setStep(step - 1);
          if (ctx.revisarVaga) { const v = ctx.revisarVaga; ctx.go("feed"); ctx.setOpenJob(v); return; }
          ctx.go(ctx.logged ? "cv" : "landing");
        }}>Voltar</button>
        <button className="btn btn-p" onClick={next}>{step < 3 ? "Continuar" : ctx.revisarVaga ? "Salvar e voltar para a candidatura" : ctx.logged ? "Salvar currículo" : "Concluir e ver minhas vagas"}</button>
      </div>
    </div>
  );
}

/* ------------------------------ DASHBOARD ------------------------------- */
function strength(p) {
  let s = 40;
  if (p.experiences.length) s += 15;
  if (p.experiences.length > 1) s += 8;
  if (p.education.length) s += 10;
  if (p.skills.length >= 5) s += 12;
  if (p.languages.length > 1) s += 6;
  if (p.certifications.length) s += 6;
  if (p.portfolio.length) s += 8;
  return Math.min(100, s);
}

function Dashboard({ ctx }) {
  const { profile, matches, feed, apps, go, setOpenJob, autopilot, setAutopilot } = ctx;
  const top = feed.slice(0, 3);
  const above90 = feed.filter((j) => matches[j.id].score >= 90).length;
  const st = strength(profile);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="wrap" style={{ padding: "36px 24px 60px" }}>
      <h2>{greet}{profile.name.trim() ? `, ${profile.name.trim().split(" ")[0]}` : ""}</h2>
      <p style={{ marginTop: 6 }}>Seu perfil está {st}% completo.</p>
      <div className="bar" style={{ maxWidth: 320, marginTop: 10 }}><i style={{ width: st + "%" }} /></div>
      <div className="row" style={{ marginTop: 16, gap: 8, flexWrap: "wrap" }}><BotaoInstalar compacto /></div>

      <div className="grid-cards" style={{ marginTop: 28, gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
        {[["briefcase", feed.filter((j) => matches[j.id].score >= 70).length, "vagas que combinam", "feed"],
          ["bolt", feed.filter((j) => ehBico(j)).length, "diárias e por hora", "feed"],
          ["list", apps.length, "candidaturas", "apps"],
          ["mic", apps.filter((a) => a.stage.includes("ntrevista")).length, "entrevistas", "apps"]].map(([i, n, l, v]) => (
          <button key={l} className="card card-h" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go(v)}>
            <span style={{ color: "var(--wine)" }}><Ic n={i} s={20} /></span>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, fontFamily: "var(--display)" }}>{n}</div>
            <div className="muted">{l}</div>
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div className="grow">
          <div className="row"><h3>Busca automática</h3>
            <span className={"badge " + (autopilot ? "b-green" : "b-red")}>{autopilot ? "Ativo" : "Pausado"}</span></div>
          <p style={{ marginTop: 6, fontSize: 14 }}>
            Procuramos vagas novas todos os dias e avisamos quando aparecer algo que combina com você.
            Nada é enviado em seu nome sem a sua confirmação.
          </p>
        </div>
        <button className="btn btn-s" onClick={() => setAutopilot(!autopilot)}>{autopilot ? "Pausar" : "Ativar"}</button>
      </div>

      <div className="between" style={{ marginTop: 40, marginBottom: 14 }}>
        <h3>Melhores oportunidades para você</h3>
        <button className="btn btn-g btn-sm" onClick={() => go("feed")}>Ver todas</button>
      </div>
      <div className="col" style={{ gap: 14 }}>
        {top.map((j) => <JobCard key={j.id} job={j} ctx={ctx} />)}
      </div>

      <div className="card" style={{ marginTop: 32, borderColor: "var(--wine-line)" }}>
        <h3>Seu próximo passo</h3>
        <p style={{ marginTop: 8, fontSize: 14 }}>
          {!profile.experiences.length && !profile.sobre
            ? "Complete seu currículo com os lugares onde já trabalhou, mesmo sem carteira assinada. Quem contrata chama primeiro quem tem perfil completo."
            : "Confira a lista de documentos e as dicas para a entrevista. Chegar preparado faz diferença."}
        </p>
        <div className="row" style={{ marginTop: 14, flexWrap: "wrap" }}>
          {!profile.experiences.length && !profile.sobre
            ? <button className="btn btn-p btn-sm" onClick={() => go("cvedit")}>Completar currículo</button>
            : <button className="btn btn-p btn-sm" onClick={() => go("help")}>Ver documentos e dicas</button>}
          <button className="btn btn-s btn-sm" onClick={() => go("cv")}>Ver meu currículo</button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- CARDS --------------------------------- */
function JobCard({ job, ctx }) {
  const m = ctx.matches[job.id];
  const c = companyOf(job.companyId);
  const [why, setWhy] = useState(false);
  const isSaved = !!ctx.saved[job.id];
  return (
    <article className="card card-h jobcard">
      <div className="row" style={{ alignItems: "flex-start", gap: 14 }}>
        <CompanyLogo c={c} size={46} />
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: 16, cursor: "pointer" }} onClick={() => ctx.setOpenJob(job.id)}>{job.title}</h3>
              <div className="small row" style={{ marginTop: 2, gap: 6 }}>{c.name}{c.verified && <span title="Empresa verificada" style={{ color: "var(--ok)", display: "inline-flex" }}><Ic n="checkCircle" s={14} /></span>}{c.nota && <Estrelas r={c.nota} pequeno />}</div>
            </div>
            <div className="score">Combina {m.score}%</div>
          </div>
        </div>
      </div>
      <div className="row" style={{ marginTop: 14, gap: 18, flexWrap: "wrap", fontSize: 14 }}>
        <span className="row" style={{ gap: 6, fontWeight: 600, color: "var(--ink)" }}><Ic n="money" s={16} />{payLabel(job)}</span>
        <span className="row small" style={{ gap: 6 }}><Ic n="pin" s={15} />{job.city}</span>
        <span className="row small" style={{ gap: 6 }}><Ic n="briefcase" s={15} />{job.contract}{job.model !== "Presencial" ? ` · ${job.model}` : ""}</span>
        <span className="row small" style={{ gap: 6 }}><Ic n="clock" s={15} />{job.posted === 0 ? "hoje" : `há ${job.posted}d`}</span>
      </div>
      <div className="chips" style={{ marginTop: 12 }}>
        {ehBico(job) && <span className="badge b-wine"><Ic n="bolt" s={12} />{rotuloAvulso(job)}</span>}
        {pagaNoDia(job) && <span className="badge b-green">Paga no dia</span>}
        {job.particular && <span className="badge b-wine">Contratante particular</span>}
        {job.horarios?.length > 0 && <span className="badge"><Ic n="clock" s={12} />{job.horarios.join(" · ")}</span>}
        {job.years === 0 && <span className="badge b-green">Não exige experiência</span>}
        {SEM_ESCOLA.includes(job.edu) && <span className="badge b-wine">Aceita ensino fundamental</span>}
      </div>
      <div className="row" style={{ marginTop: 14, flexWrap: "wrap", gap: 8 }}>
        <button className="btn btn-p btn-sm" onClick={() => ctx.setOpenJob(job.id)}>Ver vaga</button>
        <button className="btn btn-s btn-sm" onClick={() => ctx.toggleSave(job.id)}>{isSaved ? <><Ic n="check" s={14} /> Salva</> : "Salvar"}</button>
        <button className="btn btn-g btn-sm" onClick={() => { ctx.setHidden([...ctx.hidden, job.id]); ctx.say("Vagas parecidas aparecerão menos"); }}>Não tenho interesse</button>
        <button className="btn btn-g btn-sm" onClick={() => setWhy(!why)} style={{ color: "var(--wine)" }}>Por que esta vaga?</button>
      </div>
      {why && (
        <div className="note" style={{ marginTop: 12 }}>
          <MatchBadge m={m} />
          <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
            {m.why.map((w, k) => <li key={k} style={{ marginBottom: 4 }}>{w}</li>)}
          </ul>
        </div>
      )}
    </article>
  );
}

/* --------------------------------- FEED --------------------------------- */
const QUICK = ["Todas", "Diárias", "Emprego fixo", "Sem experiência", "Perto de mim", "Paga mais"];
/* Filtros de vagas para quem procura trabalho */
const FILTROS_VAZIOS = { paga: false, unidades: [], horarios: [], contratos: [], semExp: false, fundamental: false, cidade: false };
const contarFiltros = (f) => (f.paga ? 1 : 0) + (f.unidades.length ? 1 : 0) + (f.horarios.length ? 1 : 0) + (f.contratos.length ? 1 : 0) + (f.semExp ? 1 : 0) + (f.fundamental ? 1 : 0) + (f.cidade ? 1 : 0);
const UNID_FILTRO = { "Por dia": "/dia", "Por hora": "/hora", "Por mês": "/mês" };
function aplicarFiltros(lista, f, prefs) {
  const alvo = (+prefs.sTarget || +prefs.sMin || 0) * (UNIT_MULT[prefs.sUnit || "/mês"] || 1);
  return lista.filter((j) => {
    if (f.paga && alvo && !(j.sMax && monthlyOf(j, j.sMax) >= alvo)) return false;
    if (f.unidades.length && !f.unidades.map((u) => UNID_FILTRO[u]).includes(j.unit || "/mês")) return false;
    if (f.horarios.length && !(j.horarios || []).some((h) => f.horarios.includes(h))) return false;
    if (f.contratos.length && !f.contratos.includes(j.contract)) return false;
    if (f.semExp && j.years > 0) return false;
    if (f.fundamental && !SEM_ESCOLA.includes(j.edu)) return false;
    if (f.cidade && prefs.city && norm(j.city) !== norm(prefs.city) && j.model !== "Remoto") return false;
    return true;
  });
}
function PainelFiltros({ f, setF, prefs, go }) {
  const set = (k, v) => setF({ ...f, [k]: v });
  const temSalario = +prefs.sTarget > 0 || +prefs.sMin > 0;
  return (
    <div className="card" style={{ marginTop: 10 }}>
      <Field label="Quanto paga">
        {temSalario ? (
          <label className="row small" style={{ gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={f.paga} onChange={(e) => set("paga", e.target.checked)} style={{ accentColor: "var(--wine)", width: 17, height: 17 }} />
            Só vagas que pagam o que eu quero receber ({salarioTexto(prefs.sTarget || prefs.sMin, prefs.sUnit)}) ou mais
          </label>
        ) : <p className="small">Diga quanto quer receber em <a href="#" onClick={(e) => { e.preventDefault(); go("prefs"); }}>O que eu procuro</a> para filtrar pelo salário.</p>}
      </Field>
      <Field label="Forma de pagamento"><ChipGroup options={Object.keys(UNID_FILTRO)} value={f.unidades} onChange={(v) => set("unidades", v)} /></Field>
      <Field label="Horário e escala" hint="Vagas que não informam o horário ficam de fora deste filtro."><ChipGroup options={HORARIOS} value={f.horarios} onChange={(v) => set("horarios", v)} /></Field>
      <Field label="Tipo de contratação"><ChipGroup options={["Diária", "Por hora", "CLT", "Temporário", "Freelancer", "Aprendiz", "Estágio"]} value={f.contratos} onChange={(v) => set("contratos", v)} /></Field>
      <div className="col" style={{ gap: 8 }}>
        {[["semExp", "Não exige experiência"], ["fundamental", "Aceita ensino fundamental ou menos"], ["cidade", `Só na minha cidade${prefs.city ? ` (${prefs.city})` : ""} ou de casa`]].map(([k, l]) => (
          <label key={k} className="row small" style={{ gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} style={{ accentColor: "var(--wine)", width: 17, height: 17 }} />{l}
          </label>
        ))}
      </div>
    </div>
  );
}

/* Filtro por porcentagem de combinação (usado pelo trabalhador e por quem contrata) */
function FiltroPorcentagem({ valor, onChange, total, mostrando, nome }) {
  return (
    <div className="card" style={{ marginTop: 14, padding: "14px 16px" }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 8 }}>
        <label htmlFor={`min-${nome}`} style={{ fontSize: 14, fontWeight: 600 }}>
          {valor === 0 ? `Mostrando todas as ${nome}` : `Só ${nome} que combinam ${valor}% ou mais`}
        </label>
        <span className="muted">{mostrando} de {total}</span>
      </div>
      <input id={`min-${nome}`} type="range" min="0" max="95" step="5" value={valor} onChange={(e) => onChange(+e.target.value)}
        style={{ accentColor: "var(--wine)", width: "100%", marginTop: 10 }} aria-label={`Porcentagem mínima de combinação para ${nome}`} />
      <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 6 }}>
        {[0, 50, 70, 85].map((v) => <button key={v} className="chip" data-on={valor === v ? "1" : "0"} onClick={() => onChange(v)}>{v === 0 ? "Todas" : `${v}%+`}</button>)}
      </div>
    </div>
  );
}

function Feed({ ctx }) {
  const [loading, setLoading] = useState(true);
  const [quick, setQuick] = useState("Todas");
  const [minimo, setMinimo] = useState(() => { try { return +sessionStorage.getItem("matchly:minimo") || 0; } catch (e) { return 0; } });
  const mudarMinimo = (v) => { setMinimo(v); try { sessionStorage.setItem("matchly:minimo", String(v)); } catch (e) { /* segue */ } };
  useEffect(() => { const t = setTimeout(() => setLoading(false), 550); return () => clearTimeout(t); }, []);
  const [filtros, setFiltrosRaw] = useState(() => { try { return { ...FILTROS_VAZIOS, ...JSON.parse(sessionStorage.getItem("matchly:filtros") || "{}") }; } catch (e) { return FILTROS_VAZIOS; } });
  const setFiltros = (f) => { setFiltrosRaw(f); try { sessionStorage.setItem("matchly:filtros", JSON.stringify(f)); } catch (e) { /* segue */ } };
  const [abrirFiltros, setAbrirFiltros] = useState(false);
  let lista = aplicarFiltros(ctx.feed.filter((j) => (ctx.matches[j.id]?.score ?? 0) >= minimo), filtros, ctx.prefs);
  if (quick === "Diárias") lista = lista.filter((j) => ehBico(j));
  if (quick === "Emprego fixo") lista = lista.filter((j) => !ehBico(j));
  if (quick === "Sem experiência") lista = lista.filter((j) => j.years === 0);
  if (quick === "Sem exigir estudo") lista = lista.filter((j) => SEM_ESCOLA.includes(j.edu));
  if (quick === "Perto de mim") lista = lista.filter((j) => j.city === ctx.prefs.city || j.model === "Remoto");
  if (quick === "Paga mais") lista = [...lista].sort((a, b) => monthlyOf(b, b.sMax) - monthlyOf(a, a.sMax));
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 860 }}>
      <div className="between">
        <div><h2>Vagas para você</h2><p className="muted" style={{ marginTop: 4 }}>As que mais combinam com você aparecem primeiro.</p></div>
        <div className="row" style={{ gap: 8 }}><button className="btn btn-g btn-sm" onClick={() => ctx.go("search")}><Ic n="search" s={15} /> Buscar</button>
        <button className="btn btn-s btn-sm" onClick={async () => { setLoading(true); if (AO_VIVO) await ctx.recarregarVagas?.(); setTimeout(() => { setLoading(false); ctx.say("Vagas atualizadas"); }, AO_VIVO ? 0 : 600); }}>Atualizar</button></div>
      </div>
      <div className="chips rolar" style={{ marginTop: 16 }}>
        {QUICK.map((q) => <button key={q} className="chip" data-on={quick === q ? "1" : "0"} onClick={() => setQuick(q)}>{q}</button>)}
      </div>
      <FiltroPorcentagem valor={minimo} onChange={mudarMinimo} total={ctx.feed.length} mostrando={lista.length} nome="vagas" />
      <div className="row" style={{ marginTop: 10, gap: 8, flexWrap: "wrap" }}>
        <button className={"btn btn-sm " + (contarFiltros(filtros) ? "btn-p" : "btn-s")} onClick={() => setAbrirFiltros(!abrirFiltros)} aria-expanded={abrirFiltros}>
          <Ic n="list" s={15} /> Mais filtros{contarFiltros(filtros) ? ` (${contarFiltros(filtros)})` : ""}
        </button>
        {contarFiltros(filtros) > 0 && <button className="btn btn-g btn-sm" onClick={() => setFiltros(FILTROS_VAZIOS)}>Limpar filtros</button>}
      </div>
      {abrirFiltros && <PainelFiltros f={filtros} setF={setFiltros} prefs={ctx.prefs} go={ctx.go} />}
      <div className="row small" style={{ marginTop: 14, alignItems: "flex-start", gap: 8 }}>
        <span style={{ color: "var(--wine)", marginTop: 1 }}><Ic n="shield" s={16} /></span><span>Nenhuma vaga séria cobra dinheiro. Se pedirem taxa, curso ou depósito, denuncie.
        {" "}<a href="#" onClick={(e) => { e.preventDefault(); ctx.go("help"); }}>Ver o guia completo</a>.</span>
      </div>
      {AO_VIVO ? (
        <p className="muted" style={{ margin: "8px 0 18px" }}>
          {ctx.carregando ? "Carregando vagas…" : `${JOBS.length.toLocaleString("pt-BR")} ${JOBS.length === 1 ? "vaga aberta" : "vagas abertas"}${ctx.radarTotal ? ` de ${ctx.radarTotal.toLocaleString("pt-BR")} ${ctx.radarTotal === 1 ? "empresa ou contratante" : "empresas e contratantes"}` : ""}.`}
        </p>
      ) : DEMO ? (
        <p className="muted" style={{ margin: "8px 0 18px" }}>Modo demonstração: vagas e empresas de exemplo.</p>
      ) : <div style={{ height: 18 }} />}
      {loading || ctx.carregando ? (
        <div className="col" style={{ gap: 14 }}>{[1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 150 }} />)}</div>
      ) : JOBS.length === 0 ? (
        <div className="empty"><h3>Ainda não há vagas publicadas</h3>
          <p style={{ marginTop: 8 }}>O Matchly acabou de abrir e as empresas estão começando a entrar. Deixe seu cadastro pronto: quando aparecer uma vaga que combina com você, ela aparece aqui.</p>
          <button className="btn btn-s btn-sm" style={{ marginTop: 14 }} onClick={() => ctx.go("cvedit")}>Completar meu currículo</button></div>
      ) : lista.length === 0 ? (
        <div className="empty"><h3>Nenhuma vaga com esse filtro</h3><p style={{ marginTop: 8 }}>{minimo > 0 ? `Nenhuma vaga combina ${minimo}% ou mais com você agora. Baixe a porcentagem para ver mais.` : "Reabra as vagas ocultadas ou amplie suas preferências."}</p>
          <button className="btn btn-s btn-sm" style={{ marginTop: 14 }} onClick={() => { mudarMinimo(0); setQuick("Todas"); setFiltros(FILTROS_VAZIOS); ctx.setHidden([]); }}>Mostrar todas</button></div>
      ) : (
        <div className="col" style={{ gap: 14 }}>{lista.map((j) => <JobCard key={j.id} job={j} ctx={ctx} />)}</div>
      )}
    </div>
  );
}

/* -------------------------------- BUSCA --------------------------------- */
function Search({ ctx }) {
  const [q, setQ] = useState("");
  const [models, setModels] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [sen, setSen] = useState([]);
  const [minS, setMinS] = useState(0);
  const [minM, setMinM] = useState(0);
  const [easy, setEasy] = useState([]);
  const [savedSearches, setSavedSearches] = useState(["Diarista perto de casa", "Ajudante de cozinha fim de semana"]);

  const results = JOBS.filter((j) => {
    const c = companyOf(j.companyId);
    const text = (j.title + c.name + j.skills.join(" ") + j.city + j.area).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (models.length && !models.includes(j.model)) return false;
    if (contracts.length && !contracts.includes(j.contract)) return false;
    if (sen.length && !sen.includes(j.seniority)) return false;
    if (j.sMax < minS) return false;
    if (ctx.matches[j.id].score < minM) return false;
    if (easy.includes("Diária ou por hora") && !ehBico(j)) return false;
    if (easy.includes("Não exige experiência") && j.years > 0) return false;
    if (easy.includes("Aceita ensino fundamental") && !SEM_ESCOLA.includes(j.edu)) return false;
    return true;
  }).sort((a, b) => ctx.matches[b.id].score - ctx.matches[a.id].score);

  return (
    <div className="wrap" style={{ padding: "32px 24px 60px" }}>
      <h2>Buscar vagas</h2>
      <div className="row" style={{ marginTop: 16, flexWrap: "wrap" }}>
        <input className="input grow" placeholder="Cargo, empresa, palavra-chave ou habilidade" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 240 }} />
        <button className="btn btn-s" onClick={() => { setSavedSearches([...savedSearches, q || "Busca sem termo"]); ctx.say("Pesquisa salva — avisamos quando surgirem vagas novas"); }}>Salvar pesquisa</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, marginTop: 24 }} className="search-grid">
        <aside className="card" style={{ alignSelf: "start", position: "sticky", top: 84 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Filtros</h3>
          <Field label="Modelo de trabalho"><ChipGroup options={["Remoto", "Híbrido", "Presencial"]} value={models} onChange={setModels} /></Field>
          <Field label="Tipo de contrato"><ChipGroup options={["Diária", "Por hora", "CLT", "Temporário", "Freelancer", "Aprendiz", "Estágio", "PJ"]} value={contracts} onChange={setContracts} /></Field>
          <Field label="Nível da vaga"><ChipGroup options={["Júnior", "Pleno", "Sênior", "Coordenação"]} value={sen} onChange={setSen} /></Field>
          <Field label="Facilidades">
            <ChipGroup options={["Diária ou por hora", "Não exige experiência", "Aceita ensino fundamental"]} value={easy} onChange={setEasy} />
          </Field>
          <Field label={`Salário a partir de ${money(minS)}`}>
            <input type="range" min="0" max="20000" step="500" value={minS} onChange={(e) => setMinS(+e.target.value)} style={{ accentColor: "var(--wine)", width: "100%" }} />
          </Field>
          <Field label={`Compatibilidade mínima: ${minM}%`}>
            <input type="range" min="0" max="95" step="5" value={minM} onChange={(e) => setMinM(+e.target.value)} style={{ accentColor: "var(--wine)", width: "100%" }} />
          </Field>
          <button className="btn btn-g btn-sm" onClick={() => { setModels([]); setContracts([]); setSen([]); setMinS(0); setMinM(0); setQ(""); setEasy([]); }}>Limpar filtros</button>
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 16, paddingTop: 14 }}>
            <h3 style={{ fontSize: 14, marginBottom: 8 }}>Pesquisas salvas</h3>
            {savedSearches.map((s, i) => <div key={i} className="small row" style={{ marginBottom: 6, gap: 6 }}><Ic n="search" s={14} />{s}</div>)}
          </div>
        </aside>

        <div>
          <p className="muted" style={{ marginBottom: 12 }}>{results.length} vaga(s) encontrada(s)</p>
          {results.length === 0 ? (
            <div className="empty"><h3>Nenhuma vaga com esses filtros</h3><p style={{ marginTop: 8 }}>Reduza a compatibilidade mínima ou remova um filtro para ampliar o resultado.</p></div>
          ) : <div className="col" style={{ gap: 14 }}>{results.map((j) => <JobCard key={j.id} job={j} ctx={ctx} />)}</div>}
        </div>
      </div>
      <style>{`@media(max-width:900px){.search-grid{grid-template-columns:1fr!important} .search-grid aside{position:static!important}}`}</style>
    </div>
  );
}

/* ------------------------------ VAGA (PÁGINA) --------------------------- */
function JobPage({ id, ctx }) {
  const job = JOBS.find((j) => j.id === id);
  const c = companyOf(job.companyId);
  const m = ctx.matches[id];
  const [tab, setTab] = useState("vaga");
  const [confirm, setConfirm] = useState(ctx.revisarVaga === id);
  useEffect(() => { if (ctx.revisarVaga === id) ctx.setRevisarVaga(null); }, []);
  // convite ainda sem resposta não conta como candidatura: o botão continua "Candidatar-me"
  const applied = ctx.apps.some((a) => a.jobId === id && !String(a.stage).startsWith("Convite"));
  const enviada = ctx.apps.find((a) => a.jobId === id && !String(a.stage).startsWith("Convite"));

  return (
    <div className="wrap" style={{ padding: "24px 24px 60px", maxWidth: 900 }}>
      <button className="btn btn-g btn-sm" onClick={() => ctx.setOpenJob(null)}>← Voltar</button>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2>{job.title}</h2>
            <p style={{ marginTop: 6 }}>{[c.name, c.sector, c.size && c.size !== "—" && `${c.size} funcionários`].filter(Boolean).join(" · ")}</p>
            <div className="chips" style={{ marginTop: 12 }}>
              {ehBico(job) && <span className="badge b-wine"><Ic n="bolt" s={12} />{rotuloAvulso(job)}</span>}
              {pagaNoDia(job) && <span className="badge b-green">Paga no dia</span>}
              <Tag i="money">{payLabel(job)}</Tag><Tag i="pin">{job.city}</Tag>
              <Tag i="briefcase">{job.model} · {job.contract}</Tag>
              <Tag i="clock">{job.posted === 0 ? "publicada hoje" : `publicada há ${job.posted} dia(s)`}</Tag>
            </div>
          </div>
          <div className="col" style={{ alignItems: "center", gap: 8 }}>
            <Ring v={m.score} size={78} /><MatchBadge m={m} />
          </div>
        </div>
        <div className="row" style={{ marginTop: 18, flexWrap: "wrap" }}>
          {applied ? (
            <button className="btn btn-s" onClick={() => setConfirm(true)}><Ic n="checkCircle" s={16} /> {enviada?.externo ? "Candidatura no site da empresa" : "Candidatura enviada"} · ver currículo</button>
          ) : (
            <button className="btn btn-p" onClick={() => setConfirm(true)}>Candidatar-me</button>
          )}
          <button className="btn btn-s" onClick={() => ctx.toggleSave(id)}>{ctx.saved[id] ? <><Ic n="check" s={14} /> Salva</> : "Salvar"}</button>
          <button className="btn btn-s" onClick={() => ctx.say("Currículo adaptado gerado — revise as alterações antes de aplicar")}>Adaptar meu currículo</button>
        </div>
        {job.fonte && <p className="muted" style={{ marginTop: 14 }}>Vaga encontrada em {job.fonte}{job.coletadaEm ? ` · conferida em ${dataBR(job.coletadaEm)}` : ""}. A candidatura acontece no site oficial.</p>}
        {(job.suspeita || !c.verified) && (
          <div className="note" style={{ marginTop: 16, borderColor: "var(--warn)", background: "rgba(176,114,0,.07)" }}>
            Atenção: esta empresa ainda não passou pela verificação. Confira os dados antes de enviar documentos pessoais.
          </div>
        )}
      </div>

      <div className="row" style={{ margin: "22px 0 14px", gap: 4, borderBottom: "1px solid var(--line)" }}>
        {[["vaga", "Descrição"], ["match", "Compatibilidade"], ["gap", "O que falta"]].map(([k, l]) => (
          <button key={k} className="btn btn-g btn-sm" onClick={() => setTab(k)}
            style={{ borderRadius: 0, borderBottom: "2px solid " + (tab === k ? "var(--wine)" : "transparent"), color: tab === k ? "var(--wine)" : "var(--ink-2)" }}>{l}</button>
        ))}
      </div>

      {tab === "vaga" && (
        <div className="card">
          <p>{job.desc}</p>
          <h3 style={{ marginTop: 20, fontSize: 15 }}>Requisitos</h3>
          <div className="chips" style={{ marginTop: 10 }}>
            {job.skills.map((s) => <Tag key={s} i={m.matched.includes(s) ? "check" : "x"}>{s}</Tag>)}
          </div>
          <h3 style={{ marginTop: 20, fontSize: 15 }}>Benefícios</h3>
          <div className="chips" style={{ marginTop: 10 }}>{job.benefits.map((b) => <span key={b} className="tag">{b}</span>)}</div>
        </div>
      )}

      {tab === "match" && (
        <div className="card">
          <h3>Por que essa vaga combina com você?</h3>
          <ul style={{ margin: "10px 0 22px", paddingLeft: 18, color: "var(--ink-2)", lineHeight: 1.7 }}>
            {m.why.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
          {Object.entries(m.dims).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div className="between" style={{ marginBottom: 5 }}><span className="small">{k}</span><span className="small" style={{ fontWeight: 600 }}>{Math.min(100, v)}%</span></div>
              <div className="bar"><i style={{ width: Math.min(100, v) + "%" }} /></div>
            </div>
          ))}
        </div>
      )}

      {tab === "gap" && (
        <div className="card">
          <h3>O que falta para conseguir esse emprego?</h3>
          <p style={{ marginTop: 8 }}>Você atende a {m.matched.length} de {job.skills.length} requisitos técnicos listados.</p>
          <div className="col" style={{ gap: 8, margin: "16px 0" }}>
            {job.skills.map((s) => (
              <div key={s} className="row"><span style={{ color: m.matched.includes(s) ? "var(--ok)" : "var(--bad)" }}><Ic n={m.matched.includes(s) ? "check" : "x"} s={16} w={2.2} /></span><span className="small">{s}</span></div>
            ))}
          </div>
          {m.gaps.map((g, i) => <div className="note" key={i} style={{ marginBottom: 8 }}>{g}</div>)}
          <div className="note" style={{ borderColor: "var(--wine)" }}>
            <b style={{ color: "var(--ink)" }}>Plano para subir de {m.score}% para {Math.min(97, m.score + 14)}%</b>
            <ol style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {(m.missing[0] ? [`Fazer um curso prático de ${m.missing[0]} e publicar um projeto no portfólio.`] : [])
                .concat(["Adicionar resultados numéricos às suas experiências.", "Solicitar uma recomendação de gestor anterior."])
                .map((x, i) => <li key={i} style={{ marginBottom: 4 }}>{x}</li>)}
            </ol>
          </div>
        </div>
      )}

      {confirm && <RevisarCandidatura job={job} c={c} m={m} ctx={ctx} enviada={enviada} fechar={() => setConfirm(false)} />}
    </div>
  );
}


/* ------------------------- REVISÃO DA CANDIDATURA ----------------------- */
/* Antes de enviar, a pessoa vê o currículo exatamente como a empresa vai receber. */
function pontosDeAtencao(p, job, m) {
  const itens = [];
  if (!p.phone) itens.push(["phone", "Seu WhatsApp não está no currículo. Sem ele a empresa não tem como falar com você."]);
  if (!(p.sobre || "").trim()) itens.push(["user", "Você ainda não escreveu nada sobre você. Duas frases já ajudam a empresa a te conhecer."]);
  if (!p.experiences?.length && job.years > 0) itens.push(["briefcase", "Esta vaga pede experiência e seu currículo não mostra trabalhos anteriores. Vale contar até os trabalhos sem carteira."]);
  if (p.experiences?.some((e) => !(e.results || e.raw || "").trim())) itens.push(["file", "Em algum trabalho falta contar o que você fazia no dia a dia."]);
  if (m.missing.length) itens.push(["check", `A vaga pede ${m.missing.slice(0, 3).join(", ").toLowerCase()}. Se você sabe fazer, coloque no currículo.`]);
  if (!p.documentos?.length) itens.push(["idcard", "Diga quais documentos você já tem. Quem contrata prefere quem pode começar logo."]);
  return itens;
}

const RASCUNHOS = new Map();   // mensagem e opções ficam guardadas se a pessoa sair para editar o currículo
function RevisarCandidatura({ job, c, m, ctx, enviada, fechar }) {
  const p = ctx.profile;
  const r0 = RASCUNHOS.get(job.id) || {};
  const [salario, setSalario] = useState(r0.salario ?? !!p.mostrarSalario);
  const [refs, setRefs] = useState(r0.refs ?? true);
  const [msg, setMsg] = useState(r0.msg || "");
  useEffect(() => { if (!enviada) RASCUNHOS.set(job.id, { salario, refs, msg }); }, [salario, refs, msg]);
  const [conferi, setConferi] = useState(false);
  const externo = !!job.url;
  const primeiro = (p.name || "").trim().split(" ")[0];

  // depois de enviada, mostra a cópia que foi enviada (não a versão atual do perfil)
  const cv = enviada?.cv || { ...cvFromProfile({ ...p, mostrarSalario: salario }, ctx.prefs), referencias: refs ? cvFromProfile(p, ctx.prefs).referencias : [] };
  const atencao = enviada ? [] : pontosDeAtencao(p, job, m);

  const sugestao = () => setMsg([
    `Olá! Tenho interesse na vaga de ${job.title}.`,
    p.experiences?.[0]?.title ? `Já trabalhei como ${p.experiences[0].title.toLowerCase()}${p.experiences[0].tempo ? ` (${p.experiences[0].tempo.toLowerCase()})` : ""}.` : "Ainda não trabalhei nessa função, mas aprendo rápido e tenho vontade de começar.",
    p.bairro || p.city ? `Moro em ${p.bairro || p.city}${p.inicio === "Imediatamente" ? " e posso começar imediatamente" : ""}.` : "",
    "Fico à disposição para conversar.",
  ].filter(Boolean).join(" "));

  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const enviar = async () => {
    const extra = { cv, mensagem: msg.trim(), externo, enviadoEm: new Date().toISOString() };
    // vaga publicada no próprio Matchly: o currículo vai de verdade para quem contrata
    if (AO_VIVO && job.interna && !externo) {
      setEnviando(true); setErroEnvio("");
      try {
        const out = await api("candidatar", { token: CHAVES.get("candidato") || undefined, vagaId: job.id, curriculo: cv, mensagem: extra.mensagem,
          candidato: { nome: p.name, telefone: p.phone, cidade: p.city } });
        if (out.token) CHAVES.set("candidato", out.token);
        extra.remoteId = out.candidatura.id;
      } catch (e) {
        if (e.status === 409) { if (e.dados?.token) CHAVES.set("candidato", e.dados.token); }
        else { setErroEnvio(e.message); setEnviando(false); return; }
      }
      setEnviando(false);
    }
    ctx.apply(job.id, extra);
    RASCUNHOS.delete(job.id);
    fechar();
  };

  return (
    <div className="sheet" onClick={fechar} style={{ alignItems: "flex-start", overflowY: "auto", padding: "16px max(12px, env(safe-area-inset-right, 0px)) 0 max(12px, env(safe-area-inset-left, 0px))" }}>
      <div style={{ maxWidth: 900, width: "100%", margin: "8px 0 0" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Revisar candidatura">
        <div className="card" style={{ padding: "22px 24px" }}>
          <div className="between" style={{ alignItems: "flex-start", gap: 12 }}>
            <div>
              <span className="eyebrow">{enviada ? "Candidatura enviada" : "Antes de enviar"}</span>
              <h2 style={{ marginTop: 8, fontSize: 26 }}>{enviada ? "O currículo que você enviou" : "Confira o seu currículo"}</h2>
            </div>
            <button className="btn btn-g btn-sm" onClick={fechar} aria-label="Fechar"><Ic n="x" s={18} /></button>
          </div>
          <div className="row" style={{ marginTop: 16, gap: 14, padding: "14px 16px", background: "var(--surface-2)", borderRadius: 10, flexWrap: "wrap" }}>
            <CompanyLogo c={c} size={42} />
            <div className="grow" style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{job.title}</div>
              <div className="muted">{c.name} · {job.city} · {payLabel(job)}</div>
            </div>
            {enviada && <span className="badge b-green">Enviada em {enviada.date}</span>}
          </div>

          {!enviada && (
            <>
              <p style={{ marginTop: 16, fontSize: 14.5 }}>
                {externo
                  ? "Esta empresa recebe candidaturas no site dela. Confira seu currículo aqui e, se o site pedir, baixe o PDF para anexar."
                  : `É exatamente isto que ${c.name} vai receber. Ao enviar, a empresa passa a ver seu WhatsApp e seu e-mail.`}
              </p>

              {atencao.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <h3 style={{ fontSize: 15, marginBottom: 10 }}>Dá para melhorar antes de enviar</h3>
                  <div className="col" style={{ gap: 8 }}>
                    {atencao.map(([i, t]) => (
                      <div key={t} className="row small" style={{ alignItems: "flex-start", gap: 10, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 9 }}>
                        <span style={{ color: "var(--warn)", marginTop: 1 }}><Ic n={i} s={16} /></span><span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
                    <button className="btn btn-s btn-sm" onClick={() => ctx.editarParaVaga(job.id)}><Ic n="file" s={15} /> Editar meu currículo</button>
                    <span className="muted">Depois de salvar, você volta para esta tela.</span>
                  </div>
                </div>
              )}

              {(+ctx.prefs.sTarget > 0 || (p.referencias || []).some((r) => r.nome)) && (
                <div style={{ marginTop: 20, display: "grid", gap: 4 }}>
                  <h3 style={{ fontSize: 15, marginBottom: 4 }}>O que enviar</h3>
                  {+ctx.prefs.sTarget > 0 && <Switch on={salario} onChange={setSalario} label={`Mostrar quanto quero receber (${salarioTexto(ctx.prefs.sTarget, ctx.prefs.sUnit)})`} />}
                  {(p.referencias || []).some((r) => r.nome) && <Switch on={refs} onChange={setRefs} label="Incluir minhas referências" />}
                </div>
              )}

              {!externo && (
                <div style={{ marginTop: 14 }}>
                  <div className="between" style={{ marginBottom: 6 }}>
                    <label htmlFor="rev-msg" style={{ fontSize: 13.5, fontWeight: 500 }}>Mensagem para quem contrata (opcional)</label>
                    <button className="btn btn-g btn-sm" onClick={sugestao}><Ic n="sparkle" s={14} /> Escrever para mim</button>
                  </div>
                  <textarea id="rev-msg" className="ta" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={600}
                    placeholder={`Ex.: Olá! Tenho interesse na vaga e posso começar ${p.inicio === "Imediatamente" ? "agora" : "em breve"}.`} />
                  <div style={{ marginTop: 8 }}><BotaoFalar rotulo="Falar a mensagem" onTexto={(t) => setMsg((x) => `${x} ${t}`.trim().slice(0, 600))} /></div>
                </div>
              )}
            </>
          )}
          {enviada?.mensagem && (
            <div className="note" style={{ marginTop: 16 }}><b style={{ color: "var(--ink)" }}>Sua mensagem:</b> {enviada.mensagem}</div>
          )}
        </div>

        <div className="muted" style={{ margin: "18px 4px 8px", fontWeight: 500 }}>{enviada ? "Cópia do currículo no dia do envio" : `Como ${c.name} vai ver`}</div>
        <Curriculo cv={cv} destaque={job.skills} />

        <div style={{ position: "sticky", bottom: 0, marginTop: 14, padding: "14px 0 calc(14px + env(safe-area-inset-bottom, 0px))", background: "linear-gradient(to top, var(--bg) 70%, transparent)" }}>
          <div className="card" style={{ padding: "14px 18px", boxShadow: "var(--shadow)" }}>
            {enviada ? (
              <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
                <span className="small">Para mudar algo, edite o currículo. As próximas candidaturas já saem com a versão nova.</span>
                <button className="btn btn-p btn-sm" onClick={fechar}>Fechar</button>
              </div>
            ) : (
              <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
                {erroEnvio && <div className="small" style={{ width: "100%", color: "var(--bad)" }}>{erroEnvio}</div>}
                <label className="row small" style={{ gap: 8, cursor: "pointer" }}>
                  <input id="rev-conferi" type="checkbox" checked={conferi} onChange={(e) => setConferi(e.target.checked)} style={{ accentColor: "var(--wine)", width: 18, height: 18 }} />
                  Conferi meu currículo{primeiro ? `, ${primeiro}` : ""}. As informações estão certas.
                </label>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-g" onClick={() => ctx.editarParaVaga(job.id)}>Editar currículo</button>
                  {externo ? (
                    <a className={"btn btn-p" + (conferi ? "" : " off")} href={conferi ? job.url : undefined} target="_blank" rel="noopener noreferrer"
                      aria-disabled={!conferi} onClick={(e) => { if (!conferi) { e.preventDefault(); return; } enviar(); }}>
                      Continuar no site da empresa <Ic n="out" s={15} />
                    </a>
                  ) : (
                    <button className="btn btn-p" disabled={!conferi || enviando} onClick={enviar}>{enviando ? "Enviando…" : <>Enviar candidatura <Ic n="arrow" s={16} /></>}</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- SALVOS -------------------------------- */
const FOLDERS = ["Sem pasta", "Empresas dos sonhos", "Alta prioridade", "Trabalho remoto", "Candidaturas futuras"];
function Saved({ ctx }) {
  const ids = Object.keys(ctx.saved).filter((id) => JOBS.some((j) => j.id === id));
  const [folder, setFolder] = useState("Todas");
  const list = ids.filter((id) => folder === "Todas" || ctx.saved[id] === folder);
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 860 }}>
      <h2>Vagas salvas</h2>
      <div className="chips" style={{ margin: "16px 0 22px" }}>
        {["Todas", ...FOLDERS].map((f) => (
          <button key={f} className="chip" data-on={folder === f ? "1" : "0"} onClick={() => setFolder(f)}>
            {f}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="empty"><h3>Nada salvo por aqui</h3><p style={{ marginTop: 8 }}>Salve vagas no feed para compará-las depois com calma.</p>
          <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => ctx.go("feed")}>Ver vagas para você</button></div>
      ) : (
        <div className="col" style={{ gap: 14 }}>
          {list.map((id) => (
            <div key={id}>
              <JobCard job={JOBS.find((j) => j.id === id)} ctx={ctx} />
              <div className="row" style={{ marginTop: 6 }}>
                <span className="muted">Pasta:</span>
                <select className="select" style={{ width: "auto" }} value={ctx.saved[id]}
                  onChange={(e) => { ctx.setFolder(id, e.target.value); ctx.say("Movida para " + e.target.value); }}>
                  {FOLDERS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- CANDIDATURAS ----------------------------- */
const STAGES = ["Interessadas", "Candidatura enviada", "Processo seletivo", "Entrevista", "Segunda entrevista", "Oferta", "Contratada", "Recusada"];
/* Andamento de uma candidatura, em passos simples */
const PASSOS = ["Enviada", "Empresa viu", "Conversa", "Proposta", "Contratado"];
const FIM_SEM = ["Recusada", "Proposta recusada", "Convite recusado"];
function passoDe(a) {
  const m = { "Interessadas": 0, "Candidatura enviada": a.vista ? 1 : 0, "Processo seletivo": 1, "Entrevista": 2, "Segunda entrevista": 2, "Oferta": 3, "Proposta": 3, "Contratada": 4 };
  return m[a.stage] ?? 0;
}
function Andamento({ a }) {
  const atual = passoDe(a), fim = FIM_SEM.includes(a.stage);
  return (
    <div className="row" style={{ gap: 0, marginTop: 12, alignItems: "flex-start" }} aria-label={`Etapa: ${PASSOS[atual]}`}>
      {PASSOS.map((p, i) => {
        const feito = !fim && i <= atual;
        return (
          <div key={p} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <div className="row" style={{ alignItems: "center", gap: 0 }}>
              <span style={{ flex: 1, height: 3, background: i === 0 ? "transparent" : feito ? "var(--wine)" : "var(--line)" }} />
              <span style={{ width: 14, height: 14, borderRadius: 99, flex: "none", background: feito ? "var(--wine)" : "var(--surface)", border: `2px solid ${feito ? "var(--wine)" : "var(--line)"}` }} />
              <span style={{ flex: 1, height: 3, background: i === PASSOS.length - 1 ? "transparent" : !fim && i < atual ? "var(--wine)" : "var(--line)" }} />
            </div>
            <div style={{ fontSize: 11, marginTop: 4, color: feito && i === atual ? "var(--wine)" : "var(--ink-3)", fontWeight: feito && i === atual ? 600 : 400 }}>{p}</div>
          </div>
        );
      })}
    </div>
  );
}

function Applications({ ctx }) {
  const { apps, setApps } = ctx;
  const [vendo, setVendo] = useState(null);
  const [avaliando, setAvaliando] = useState(null);
  const [respondendo, setRespondendo] = useState(null);
  const infoDe = (a) => { const j = JOBS.find((x) => x.id === a.jobId); return { j, titulo: j ? j.title : a.vagaNome || "Vaga", empresa: (j && companyOf(j.companyId)?.name) || a.empresaNome || "A empresa" }; };
  const responder = async (a, aceitar) => {
    setRespondendo(a.id);
    try {
      if (a.remoteId && AO_VIVO) await api("responder_proposta", { token: CHAVES.get("candidato"), id: a.remoteId, aceitar });
      setApps(apps.map((x) => (x.id === a.id ? { ...x, stage: aceitar ? "Contratada" : "Proposta recusada" } : x)));
      ctx.say(aceitar ? "Parabéns! Você aceitou a proposta. Combine os detalhes pelo WhatsApp." : "Tudo bem. A empresa vai saber que você recusou.");
    } catch (e) { ctx.say(e.message); } finally { setRespondendo(null); }
  };
  const propostas = apps.filter((a) => a.stage === "Proposta" || a.stage === "Oferta");
  const convites = apps.filter((a) => a.stage === "Convite");
  const andamento = apps.filter((a) => !["Convite", "Proposta", "Oferta", "Convite recusado"].includes(a.stage) && (a.vagaNome || JOBS.some((x) => x.id === a.jobId)));
  const ativas = andamento.filter((a) => !FIM_SEM.includes(a.stage)), encerradas = andamento.filter((a) => FIM_SEM.includes(a.stage));
  const situacao = (a) => {
    if (a.externo) return "Você se candidatou no site da empresa. Acompanhe por lá.";
    return { 0: "Seu currículo chegou. Agora é esperar a empresa ver.", 1: "A empresa já viu o seu currículo.", 2: "A empresa quer conversar com você. Fique de olho no WhatsApp.", 3: "A empresa enviou uma proposta.", 4: "Você foi contratado(a)!" }[passoDe(a)];
  };

  const Cartao = ({ a }) => {
    const { j, titulo, empresa } = infoDe(a);
    const fim = FIM_SEM.includes(a.stage);
    return (
      <div className="card">
        <div className="between" style={{ gap: 10, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: "var(--ink)" }}>{titulo}</div>
            <div className="muted">{empresa}{j ? ` · ${payLabel(j)}` : ""} · desde {a.date}</div>
          </div>
          {a.stage === "Contratada" ? <span className="badge b-green">Contratado(a)</span> : fim ? <span className="badge">{a.stage === "Proposta recusada" ? "Você recusou" : "Não seguiu"}</span> : null}
        </div>
        {!fim && <Andamento a={a} />}
        <p className="small" style={{ marginTop: 10 }}>{fim ? (a.stage === "Proposta recusada" ? "Você recusou a proposta." : "A empresa seguiu com outra pessoa. Continue se candidatando: outras vagas vão aparecer.") : situacao(a)}</p>
        <div className="row" style={{ marginTop: 10, gap: 8, flexWrap: "wrap" }}>
          {a.remoteId && a.stage === "Contratada" && (a.avaliou
            ? <span className="small">Você avaliou: <span style={{ color: "#C98A00" }}>{"★".repeat(a.avaliou)}</span></span>
            : <button className="btn btn-s btn-sm" onClick={() => setAvaliando(a)}><span style={{ color: "#C98A00" }}>★</span> Avaliar a empresa</button>)}
          {a.cv && <button className="btn btn-g btn-sm" onClick={() => setVendo(a)}><Ic n="file" s={14} /> Currículo enviado</button>}
          {j && <button className="btn btn-g btn-sm" onClick={() => ctx.setOpenJob(j.id)}>Ver a vaga</button>}
        </div>
      </div>
    );
  };

  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 820 }}>
      <h2>Minhas candidaturas</h2>
      <p className="muted" style={{ marginTop: 4 }}>Aqui você vê em que passo está cada vaga: enviada, empresa viu, conversa, proposta e contratado.</p>
      <div style={{ marginTop: 16 }}><BotaoAvisos papel="candidato" ctx={ctx} texto="Receba um aviso no celular quando a empresa responder." /></div>

      {propostas.map((a) => {
        const { j, titulo, empresa } = infoDe(a);
        return (
          <div key={a.id} className="card" style={{ marginTop: 16, borderColor: "var(--wine)", borderWidth: 2 }}>
            <span className="eyebrow">Proposta de contratação</span>
            <h3 style={{ marginTop: 8, fontSize: 19 }}>{empresa} quer contratar você!</h3>
            <p style={{ marginTop: 6 }}>Para a vaga de <b>{titulo}</b>{j ? ` · ${payLabel(j)} · ${j.city}` : ""}.</p>
            <p className="small" style={{ marginTop: 8 }}>Se aceitar, a empresa fica sabendo na hora e vocês combinam os detalhes pelo WhatsApp. Nunca pague nada para começar a trabalhar.</p>
            <div className="row" style={{ marginTop: 14, gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-p" disabled={respondendo === a.id} onClick={() => responder(a, true)}><Ic n="check" s={16} /> Aceitar a proposta</button>
              <button className="btn btn-s" disabled={respondendo === a.id} onClick={() => responder(a, false)}>Recusar</button>
              {j && <button className="btn btn-g btn-sm" onClick={() => ctx.setOpenJob(j.id)}>Ver a vaga</button>}
            </div>
          </div>
        );
      })}

      {convites.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Convites para você</h3>
          <div className="col" style={{ gap: 10 }}>
            {convites.map((a) => {
              const { j, titulo, empresa } = infoDe(a);
              return (
                <div key={a.id} className="card" style={{ borderColor: "var(--wine)" }}>
                  <div style={{ fontWeight: 600 }}>{empresa} convidou você</div>
                  <div className="muted">Para a vaga de {titulo}{j ? ` · ${payLabel(j)} · ${j.city}` : ""}</div>
                  <p className="small" style={{ marginTop: 10 }}>Quem contrata viu o seu perfil e acha que você combina. Se quiser, envie o seu currículo: só então a empresa vê o seu WhatsApp.</p>
                  <div className="row" style={{ marginTop: 12, gap: 8, flexWrap: "wrap" }}>
                    {j ? <button className="btn btn-p btn-sm" onClick={() => { ctx.setOpenJob(j.id); ctx.setRevisarVaga?.(j.id); }}>Enviar meu currículo</button>
                      : <span className="small muted">Essa vaga já foi encerrada.</span>}
                    <button className="btn btn-g btn-sm" onClick={async () => {
                      try { await api("recusar_convite", { token: CHAVES.get("candidato"), id: a.remoteId }); } catch (e) { /* segue */ }
                      setApps(apps.map((x) => (x.id === a.id ? { ...x, stage: "Convite recusado" } : x))); ctx.say("Tudo bem. A empresa vai saber que agora não.");
                    }}>Agora não</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h3 style={{ fontSize: 16, margin: "24px 0 10px" }}>Em andamento ({ativas.length})</h3>
      {ativas.length === 0 ? (
        <div className="empty"><h3>Nenhuma candidatura em andamento</h3><p style={{ marginTop: 8 }}>Escolha uma vaga e toque em Candidatar-me. Você acompanha tudo por aqui.</p>
          <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => ctx.go("feed")}>Ver vagas</button></div>
      ) : <div className="col" style={{ gap: 12 }}>{ativas.map((a) => <Cartao key={a.id} a={a} />)}</div>}

      {encerradas.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, margin: "24px 0 10px" }}>Encerradas ({encerradas.length})</h3>
          <div className="col" style={{ gap: 12 }}>{encerradas.map((a) => <Cartao key={a.id} a={a} />)}</div>
        </>
      )}

      {avaliando && (
        <JanelaAvaliar titulo={`Como foi trabalhar ${avaliando.empresaNome ? `com ${avaliando.empresaNome}` : "nessa vaga"}?`}
          sub="Sua nota aparece na página da empresa e ajuda outras pessoas. Seu nome não aparece."
          dica="Conte como foi: pagaram certo e no dia? O lugar era seguro? Trataram você com respeito?"
          fechar={() => setAvaliando(null)}
          onEnviar={async (nota, comentario) => {
            await api("avaliar", { token: CHAVES.get("candidato"), papel: "candidato", candidaturaId: avaliando.remoteId, nota, comentario });
            setApps(apps.map((x) => (x.id === avaliando.id ? { ...x, avaliou: nota } : x)));
            ctx.say("Obrigado! Sua avaliação ajuda outras pessoas.");
          }} />
      )}
      {vendo && JOBS.some((x) => x.id === vendo.jobId) && (() => {
        const j = JOBS.find((x) => x.id === vendo.jobId);
        return <RevisarCandidatura job={j} c={companyOf(j.companyId)} m={ctx.matches[j.id]} ctx={ctx} enviada={vendo} fechar={() => setVendo(null)} />;
      })()}
    </div>
  );
}

/* -------------------------------- PERFIL -------------------------------- */
function Profile({ ctx }) {
  const { profile: p, setProfile } = ctx;
  const st = strength(p);
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 860 }}>
      <div className="card">
        <div className="row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: 99, background: "var(--wine-tint)", border: "1px solid var(--wine-line)", color: "var(--wine)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 600 }}>{initials(p.name)}</div>
          <div className="grow">
            <h2>{p.name}</h2>
            <p style={{ marginTop: 4 }}>{ctx.prefs.mainRole} · {p.city}, {p.country}</p>
          </div>
          <div style={{ minWidth: 180 }}>
            <div className="between"><span className="small">Força do perfil</span><span className="score">{st}/100</span></div>
            <div className="bar" style={{ marginTop: 6 }}><i style={{ width: st + "%" }} /></div>
          </div>
        </div>
        <div className="between card" style={{ marginTop: 18, background: "var(--surface-2)", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="muted">Pretensão salarial</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{+ctx.prefs.sTarget > 0 ? salarioTexto(ctx.prefs.sTarget, ctx.prefs.sUnit) : "A combinar"}{+ctx.prefs.sMin > 0 && <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}> · aceito a partir de {money(+ctx.prefs.sMin)}</span>}</div>
          </div>
          <div className="row"><button className="btn btn-s btn-sm" onClick={() => ctx.go("prefs")}>Alterar</button>
            <button className="btn btn-p btn-sm" onClick={() => ctx.go("cv")}>Ver meu currículo</button>
            <button className="btn btn-s btn-sm" onClick={() => ctx.go("cvedit")}>Editar currículo</button></div>
        </div>
        <div className="note" style={{ marginTop: 18 }}>
          {!p.experiences.length
            ? "Conte onde você já trabalhou, mesmo sem carteira assinada. Quem contrata chama primeiro quem mostra experiência."
            : !(p.documentos || []).length
              ? "Diga quais documentos você já tem. Quem contrata prefere quem pode começar logo."
              : !(p.cursos || []).length
                ? "Coloque os cursos que você fez, mesmo os curtos e gratuitos, como os do Senac, do Senai ou do CRAS."
                : "Seu currículo está bem completo. Mantenha seus horários atualizados para receber as vagas certas."}
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-p btn-sm" onClick={() => ctx.go("cvedit")}>Completar currículo</button>
          </div>
        </div>
      </div>

      <Section title="Experiência">
        {p.experiences.map((e, i) => (
          <div key={i} style={{ padding: "14px 0" }}>
            <div className="between"><h3 style={{ fontSize: 15 }}>{e.title}</h3><span className="muted">{e.start} – {e.end}</span></div>
            <div className="small">{e.company} · {e.model}</div>
            <p style={{ marginTop: 8, fontSize: 14 }}>{e.results || e.raw}</p>
          </div>
        ))}
      </Section>

      <Section title="Formação">
        {p.education.map((e, i) => (
          <div key={i} style={{ padding: "14px 0" }}>
            <h3 style={{ fontSize: 15 }}>{e.level} em {e.course}</h3>
            <div className="small">{e.school} · {e.status} {e.end && "· " + e.end}</div>
          </div>
        ))}
      </Section>

      <Section title="Habilidades">
        <div className="chips" style={{ paddingTop: 14 }}>{p.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
      </Section>

      <Section title="Idiomas e certificações">
        <div className="chips" style={{ paddingTop: 14 }}>
          {p.languages.map((l) => <span key={l.name} className="tag">{l.name} · {l.level}</span>)}
          {p.certifications.map((c) => <Tag key={c} i="grad">{c}</Tag>)}
          {p.portfolio.map((c) => <Tag key={c} i="folder">{c}</Tag>)}
        </div>
      </Section>
      <ContaCandidato ctx={ctx} />
    </div>
  );
}
/* Entrar de outro celular: WhatsApp + senha de 6 números */
function ContaCandidato({ ctx }) {
  const [conta, setConta] = useState(undefined);
  const token = CHAVES.get("candidato");
  useEffect(() => {
    if (!AO_VIVO || !token) return;
    api("minhas", { token }).then((r) => setConta(r.conta)).catch(() => setConta(null));
  }, [token]);
  if (!AO_VIVO || !token || conta === undefined) return null;
  return (
    <Section title="Entrar de outro celular">
      <div style={{ paddingTop: 14 }}>
        <BotaoAvisos papel="candidato" ctx={ctx} texto="Receba um aviso no celular quando uma empresa responder." />
        <DefinirSenha papel="candidato" ctx={ctx} jaTem={conta?.login} loginInicial={conta?.login ? mascaraTel(conta.login) : ctx.profile.phone || ""} />
      </div>
    </Section>
  );
}
const Section = ({ title, children }) => (
  <div className="card" style={{ marginTop: 16 }}>
    <div className="between"><h3>{title}</h3></div>
    <div className="divide">{children}</div>
  </div>
);

/* ----------------------------- PREFERÊNCIAS ----------------------------- */
function Preferences({ ctx }) {
  const { prefs, setPrefs, say } = ctx;
  const [f, setF] = useState(prefs);
  const set = (k, v) => setF({ ...f, [k]: v });
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 760 }}>
      <h2>Preferências de emprego</h2>
      <p style={{ marginTop: 6 }}>É daqui que sai a sua nota de compatibilidade.</p>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 14 }}>Cargo</h3>
        <Field label="Áreas que te interessam">
          <ChipGroup options={Object.keys(AREA_LABELS)} value={f.areas || []} onChange={(v) => set("areas", v)} />
        </Field>
        <Field label="Cargo principal"><input className="input" value={f.mainRole} onChange={(e) => set("mainRole", e.target.value)} /></Field>
        <Field label="Cargos alternativos" hint="Separe por vírgula.">
          <input className="input" value={f.altRoles.join(", ")} onChange={(e) => set("altRoles", e.target.value.split(",").map((s) => s.trimStart()))} /></Field>
        <Field label="Cargos que não deseja">
          <input className="input" value={f.avoidRoles.join(", ")} onChange={(e) => set("avoidRoles", e.target.value.split(",").map((s) => s.trim()))} /></Field>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 14 }}>Local e modelo</h3>
        <div className="grid2">
          <Field label="Cidade"><input className="input" value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="País"><input className="input" value={f.country} onChange={(e) => set("country", e.target.value)} /></Field>
        </div>
        <Field label={`Distância máxima: ${f.maxKm} km`}>
          <input type="range" min="0" max="120" step="5" value={f.maxKm} onChange={(e) => set("maxKm", +e.target.value)} style={{ accentColor: "var(--wine)", width: "100%" }} /></Field>
        <Field label="Aceita mudar de cidade?">
          <ChipGroup options={["Sim", "Não"]} multi={false} value={f.willMove ? "Sim" : "Não"} onChange={(v) => set("willMove", v === "Sim")} /></Field>
        <Field label="Modelo de trabalho"><ChipGroup options={["Remoto", "Híbrido", "Presencial"]} value={f.models} onChange={(v) => set("models", v)} /></Field>
        <Field label="Tipo de contrato"><ChipGroup options={["CLT", "PJ", "Freelancer", "Estágio", "Aprendiz", "Temporário", "Contrato internacional"]} value={f.contracts} onChange={(v) => set("contracts", v)} /></Field>
        <Field label="Horário"><ChipGroup options={["Integral", "Meio período", "Flexível", "Noturno", "Fim de semana"]} value={f.schedule} onChange={(v) => set("schedule", v)} /></Field>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 14 }}>Quanto você quer receber</h3>
        <Field label="Como você quer receber">
          <ChipGroup multi={false} options={["Por dia", "Por mês", "Por hora"]} value={{ "/dia": "Por dia", "/mês": "Por mês", "/hora": "Por hora" }[f.sUnit || "/mês"]}
            onChange={(v) => set("sUnit", { "Por dia": "/dia", "Por mês": "/mês", "Por hora": "/hora" }[v])} />
        </Field>
        <div className="grid2">
          <Field label={`Mínimo que aceito (${UNID_NOME[f.sUnit || "/mês"]})`}><input className="input" type="number" value={f.sMin} onChange={(e) => set("sMin", +e.target.value)} /></Field>
          <Field label={`Quanto quero receber (${UNID_NOME[f.sUnit || "/mês"]})`}><input id="p-salario" className="input" type="number" value={f.sTarget} onChange={(e) => set("sTarget", +e.target.value)} /></Field>
          <Field label={`Ideal (${UNID_NOME[f.sUnit || "/mês"]})`}><input className="input" type="number" value={f.sIdeal} onChange={(e) => set("sIdeal", +e.target.value)} /></Field>
          <Field label="Moeda">
            <select className="select" value={f.currency} onChange={(e) => set("currency", e.target.value)}>{["BRL", "USD", "EUR"].map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <label className="row small" style={{ gap: 8, cursor: "pointer", marginBottom: 14 }}>
          <input type="checkbox" checked={!!ctx.profile.mostrarSalario} onChange={(e) => ctx.setProfile({ ...ctx.profile, mostrarSalario: e.target.checked })} style={{ accentColor: "var(--wine)", width: 17, height: 17 }} />
          Mostrar o valor que quero receber no meu currículo, para quem contrata
        </label>
        <Field label="Benefícios importantes">
          <ChipGroup options={["Plano de saúde", "Vale refeição", "Auxílio home office", "PLR", "Previdência privada", "Horário flexível", "Auxílio educação", "Gympass"]} value={f.benefits} onChange={(v) => set("benefits", v)} /></Field>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 14 }}>Cultura</h3>
        <ChipGroup options={["Ambiente corporativo", "Startup", "Empresa grande", "Empresa pequena", "Trabalho colaborativo", "Trabalho independente", "Crescimento rápido", "Estabilidade", "Liderança", "Flexibilidade"]} value={f.culture} onChange={(v) => set("culture", v)} />
        <Field label={`Só me avise acima de ${f.minMatch}% de compatibilidade`} hint="Vale para alertas por e-mail e notificações.">
          <input type="range" min="50" max="95" step="5" value={f.minMatch} onChange={(e) => set("minMatch", +e.target.value)} style={{ accentColor: "var(--wine)", width: "100%", marginTop: 10 }} /></Field>
      </div>

      <div className="row" style={{ marginTop: 20, justifyContent: "flex-end" }}>
        <button className="btn btn-g" onClick={() => setF(prefs)}>Descartar</button>
        <button className="btn btn-p" onClick={() => { setPrefs(f); say("Preferências salvas — recalculamos suas vagas"); ctx.go("feed"); }}>Salvar preferências</button>
      </div>
    </div>
  );
}

/* ----------------------------- ESTATÍSTICAS ----------------------------- */
function Stats({ ctx }) {
  const { apps, matches, saved } = ctx;
  const avg = JOBS.length ? Math.round(JOBS.reduce((a, j) => a + matches[j.id].score, 0) / JOBS.length) : null;
  const data = [
    ["Vagas visualizadas", DEMO ? 128 : "—"], ["Vagas salvas", Object.keys(saved).length],
    ["Candidaturas", apps.length], ["Entrevistas", apps.filter((a) => a.stage.includes("ntrevista")).length],
    ["Compatibilidade média", avg === null ? "—" : avg + "%"], ["Taxa de resposta", DEMO ? "31%" : "—"],
  ];
  const week = [4, 7, 3, 9, 12, 6, 8];
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 860 }}>
      <h2>Meu desempenho</h2>
      <div className="grid-cards" style={{ marginTop: 20 }}>
        {data.map(([l, v]) => (
          <div className="card" key={l}><div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div><div className="muted">{l}</div></div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Vagas compatíveis por dia</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140, marginTop: 20 }}>
          {week.map((v, i) => (
            <div key={i} className="col grow" style={{ alignItems: "center", gap: 6 }}>
              <div style={{ width: "100%", height: (v / 12) * 110, background: "var(--wine)", borderRadius: "6px 6px 0 0", opacity: .85 }} />
              <span className="muted">{["S", "T", "Q", "Q", "S", "S", "D"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   PARTE 2 — currículo, carta, entrevista, assistente, carreira, empresas,
   comparador, alertas, notificações, calendário, privacidade, recrutador,
   administrador, preços e páginas de erro.
   ========================================================================= */

const Switch = ({ on, onChange, label }) => (
  <div className="between" style={{ padding: "12px 0" }}>
    <span className="small">{label}</span>
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)}
      style={{ width: 44, height: 25, borderRadius: 99, border: "1px solid var(--line)", cursor: "pointer",
        background: on ? "var(--wine)" : "var(--surface-2)", position: "relative", transition: ".18s" }}>
      <span style={{ position: "absolute", top: 2, left: on ? 21 : 2, width: 19, height: 19, borderRadius: 99,
        background: "#fff", transition: ".18s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
    </button>
  </div>
);

/* Cadastro: primeiro a pessoa diz se procura trabalho ou se quer contratar */
function EscolherCadastro({ ctx }) {
  const Op = ({ icone, titulo, sub, onClick, id }) => (
    <button id={id} className="card card-h" onClick={onClick} style={{ textAlign: "left", cursor: "pointer", display: "flex", gap: 16, alignItems: "flex-start", width: "100%" }}>
      <span style={{ flex: "none", width: 52, height: 52, borderRadius: 14, background: "var(--wine-tint)", color: "var(--wine)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n={icone} s={26} /></span>
      <span><b style={{ fontSize: 18, color: "var(--ink)" }}>{titulo}</b><span className="small" style={{ display: "block", marginTop: 6 }}>{sub}</span></span>
    </button>
  );
  return (
    <div className="wrap" style={{ maxWidth: 640, padding: "44px 24px 80px" }}>
      <h2>Cadastre-se grátis</h2>
      <p style={{ marginTop: 8, marginBottom: 24 }}>Para começar, diga o que você quer fazer no Matchly.</p>
      <div className="col" style={{ gap: 14 }}>
        <Op id="cad-trabalho" icone="briefcase" titulo="Procuro trabalho" sub="Diária, emprego fixo ou primeiro emprego. Cadastro em 1 minuto, sem precisar de currículo." onClick={() => { ctx.setRole("Candidato"); ctx.comecar([]); }} />
        <Op id="cad-contratar" icone="building" titulo="Quero contratar" sub="Para empresas e para pessoas que precisam de alguém: diarista, babá, passeador de cachorro, ajudante. Publicar a vaga é grátis." onClick={() => { ctx.setRole("Contratante"); ctx.go("hire"); }} />
      </div>
      <p className="small" style={{ marginTop: 18 }}>Tem uma empresa e quer a página dela com logo e site? <a href="#" onClick={(e) => { e.preventDefault(); ctx.go("companyRegister"); }}>Cadastrar empresa</a></p>
      <p className="small" style={{ marginTop: 8 }}>Já tem cadastro? <a href="#" onClick={(e) => { e.preventDefault(); ctx.go("entrar"); }}>Entrar</a></p>
    </div>
  );
}

/* Minha conta (em Mais): com que dados a pessoa entra e o botão de sair */
function MinhaConta({ ctx }) {
  const [confirmar, setConfirmar] = useState(false);
  const p = ctx.profile || {};
  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div className="row" style={{ gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 99, background: "var(--wine-tint)", color: "var(--wine)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{initials(p.name)}</span>
          <div>
            <div style={{ fontWeight: 600, color: "var(--ink)" }}>{p.name || "Minha conta"}</div>
            <div className="small">{AO_VIVO ? <>Você entra com o WhatsApp <b>{p.phone || "—"}</b> e a sua senha de 6 números.</> : p.phone || ""}</div>
          </div>
        </div>
        {!confirmar ? (
          <button className="btn btn-s btn-sm" onClick={() => setConfirmar(true)}>Sair da conta</button>
        ) : (
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="small">Sair da conta neste aparelho?</span>
            <button className="btn btn-p btn-sm" onClick={ctx.sairDaConta}>Sim, sair</button>
            <button className="btn btn-g btn-sm" onClick={() => setConfirmar(false)}>Cancelar</button>
          </div>
        )}
      </div>
      {confirmar && AO_VIVO && <p className="small" style={{ marginTop: 10 }}>Para entrar de novo, ou entrar com outra conta, toque em <b>Entrar</b> e use o WhatsApp e a senha.</p>}
    </div>
  );
}

const Hub = ({ go, role, setRole, ctx }) => {
  const items = [
    ["help", "puzzle", "Como conseguir a vaga", "Documentos, entrevista e cuidado com golpes"],
    ["donate", "heart", "Apoiar o projeto", "Doação via Pix para manter o site gratuito"],
    ["cv", "idcard", "Meu currículo completo", "Como quem contrata vê você, pronto para PDF"],
    ["saved", "heart", "Vagas salvas", "As vagas que você guardou, por pasta"],
    ["prefs", "compass", "O que eu procuro", "Tipo de trabalho, salário, horários e local"],
    ["resume", "file", "Currículo com IA", "Score ATS, correções e versão por vaga"],
    ["cover", "chat", "Carta de apresentação", "Gerada a partir do seu perfil e da vaga"],
    ["interview", "mic", "Entrevista IA", "Simulação com avaliação e nota"],
    ["career", "compass", "Meu próximo passo", "Plano de carreira e análise de gap"],
    ["companies", "building", "Empresas", "Perfis, vagas abertas e cultura"],
    ["compare", "scale", "Comparar vagas", "Até 4 vagas lado a lado"],
    ["alerts", "bell", "Avisos", "Por celular, e-mail ou SMS: vagas novas e respostas"],
    ["instalar", "download", "Colocar na tela de início", "Use o Matchly como um aplicativo, no Android ou iPhone"],
    ["notifs", "list", "Notificações", "Tudo que aconteceu por aqui"],
    ["calendar", "calendar", "Calendário", "Entrevistas, prazos e lembretes"],
    ["stats", "chart", "Meu desempenho", "Números da sua busca"],
    ["privacy", "lock", "Privacidade e segurança", "Quem vê o quê e seus dados"],
  ];
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px" }}>
      <h2>Mais</h2>
      <p style={{ marginTop: 6 }}>Sua conta e tudo o que o Matchly faz.</p>
      {ctx && <MinhaConta ctx={ctx} />}
      <div style={{ marginTop: 14 }}><BotaoInstalar compacto /></div>
      <div className="grid-cards" style={{ marginTop: 24 }}>
        {items.map(([v, i, t, d]) => (
          <button key={v} className="card card-h" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go(v)}>
            <span style={{ color: "var(--wine)" }}><Ic n={i} s={22} /></span>
            <h3 style={{ fontSize: 15, marginTop: 8 }}>{t}</h3>
            <p style={{ fontSize: 13, marginTop: 4 }}>{d}</p>
          </button>
        ))}
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3>Trocar de visão</h3>
        <p style={{ fontSize: 14, marginTop: 6 }}>Permissões separadas por papel. Cada visão só enxerga os próprios dados.</p>
        <div className="chips" style={{ marginTop: 12 }}>
          {(!DEMO ? ["Candidato", "Contratante"] : ["Candidato", "Contratante", "Administrador"]).map((r) => (
            <button key={r} className="chip" data-on={role === r ? "1" : "0"}
              onClick={() => { setRole(r); go(r === "Contratante" ? "recruiter" : r === "Administrador" ? "admin" : "dash"); }}>{r}</button>
          ))}
        </div>
      </div>
      {DEMO && <div className="row" style={{ marginTop: 20, flexWrap: "wrap" }}>
        <button className="btn btn-s btn-sm" onClick={() => go("err404")}>Ver página 404</button>
        <button className="btn btn-s btn-sm" onClick={() => go("errjob")}>Ver vaga encerrada</button>
        <button className="btn btn-s btn-sm" onClick={() => go("err500")}>Ver erro do servidor</button>
      </div>}
    </div>
  );
};


const SemVagas = ({ ctx }) => (
  <div className="wrap" style={{ padding: "48px 24px" }}>
    <div className="empty"><h3>Ainda não há vagas publicadas</h3>
      <p style={{ marginTop: 8 }}>As empresas estão começando a entrar no Matchly. Assim que publicarem vagas, esta ferramenta passa a funcionar.</p>
      <button className="btn btn-s btn-sm" style={{ marginTop: 14 }} onClick={() => ctx.go("feed")}>Ir para o feed</button></div>
  </div>
);
/* ---------------------------- CURRÍCULO COMPLETO ------------------------ */
const NOW_YEAR = new Date().getFullYear();
const ehAtual = (v) => !v || /atual|hoje|ainda|trabalho l[áa]|present/i.test(v);
const anoDe = (v) => { const m = String(v || "").match(/(19|20)\d{2}/); return m ? +m[0] : null; };
function duracao(ini, fim) {
  const a = anoDe(ini), b = ehAtual(fim) ? NOW_YEAR : anoDe(fim);
  if (!a || !b || b < a) return "";
  const d = b - a;
  return d === 0 ? "menos de 1 ano" : d === 1 ? "1 ano" : `${d} anos`;
}
function idadeDe(nasc, fallback) {
  if (!nasc) return fallback || null;
  const n = new Date(nasc + "T12:00:00"); if (isNaN(n)) return fallback || null;
  const h = new Date(); let i = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) i--;
  return i > 0 && i < 110 ? i : null;
}
const dataBR = (iso) => { if (!iso) return ""; const d = new Date(iso + "T12:00:00"); return isNaN(d) ? iso : d.toLocaleDateString("pt-BR"); };

/* Converte o perfil do candidato (ou um candidato do painel) no mesmo formato de currículo */
function cvFromProfile(p, prefs = {}) {
  return {
    nome: p.name || "Seu nome", objetivo: prefs.mainRole || p.role || p.experiences?.[0]?.title || "",
    idade: idadeDe(p.nascimento, p.idade), nascimento: p.nascimento, bairro: p.bairro, cidade: p.city, uf: p.uf,
    tel: p.phone, email: p.email, sobre: p.sobre, cnh: p.cnh, pcd: p.pcd,
    inicio: p.inicio, horarios: p.horarios || [], mudanca: !!p.mudanca,
    modelos: prefs.models || [], contratos: prefs.contracts || [],
    documentos: p.documentos || [],
    pretensao: p.mostrarSalario && prefs.sTarget ? +prefs.sTarget : null, pretensaoUnidade: prefs.sUnit || "/mês",
    anos: p.years || 0,
    experiencias: (p.experiences || []).map((e) => ({ cargo: e.title, empresa: e.company, cidade: e.cidade, inicio: e.start, fim: e.end,
      tempo: e.tempo, vinculo: e.vinculo, desc: e.results || e.raw, habilidades: e.skills || [] })),
    formacao: (p.education || []).map((e) => ({ nivel: e.level, curso: e.course, inst: e.school, status: e.status, ano: e.end, modalidade: e.mode })),
    cursos: (p.cursos || []).filter((c) => c.nome).concat((p.certifications || []).map((c) => (typeof c === "string" ? { nome: c } : c))),
    habilidades: p.skills || [], idiomas: (p.languages || []).filter((l) => l.name),
    referencias: (p.referencias || []).filter((r) => r.nome), atualizado: new Date().toISOString().slice(0, 10),
  };
}

const CvSec = ({ titulo, children, vazio }) => (
  <section style={{ marginTop: 26 }}>
    <div className="eyebrow" style={{ marginBottom: 10 }}>{titulo}</div>
    {children || <p className="muted">{vazio || "Não informado"}</p>}
  </section>
);
const CvLinha = ({ k, v }) => v ? (
  <div className="between" style={{ padding: "7px 0", borderBottom: "1px solid var(--line)", alignItems: "flex-start", gap: 14 }}>
    <span className="muted" style={{ flex: "none" }}>{k}</span><span className="small" style={{ textAlign: "right", color: "var(--ink)" }}>{v}</span>
  </div>
) : null;

function Curriculo({ cv, destaque = [], contatoOculto = false, onRevelar, mostrarRefs = true }) {
  const local = [cv.bairro, cv.cidade && (cv.uf ? `${cv.cidade}/${cv.uf}` : cv.cidade)].filter(Boolean).join(", ");
  const temCnh = cv.cnh && cv.cnh !== "Não tenho";
  const docsOk = ["RG", "CPF", "Carteira de Trabalho Digital"].every((d) => cv.documentos.includes(d));
  const totalAnos = cv.experiencias.reduce((a, e) => { const x = anoDe(e.inicio), y = ehAtual(e.fim) ? NOW_YEAR : anoDe(e.fim); return a + (x && y && y >= x ? y - x : 0); }, 0) || Math.floor(cv.anos || 0);
  const destaca = (h) => destaque.map(norm).includes(norm(h));

  return (
    <article className="card cv-print" style={{ padding: 0, overflow: "hidden" }}>
      <header style={{ padding: "30px 32px 24px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)" }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: 99, background: "var(--wine)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 24, flex: "none", fontFamily: "var(--display)" }}>{initials(cv.nome)}</div>
          <div className="grow" style={{ minWidth: 220 }}>
            <h2 style={{ fontSize: 30 }}>{cv.nome}</h2>
            {cv.objetivo && <p style={{ marginTop: 4, fontSize: 16, color: "var(--wine)", fontWeight: 500 }}>{cv.objetivo}</p>}
            <p className="small" style={{ marginTop: 6 }}>{[cv.idade && `${cv.idade} anos`, local].filter(Boolean).join(" · ")}</p>
            <div className="chips" style={{ marginTop: 12 }}>
              {cv.inicio === "Imediatamente" && <span className="badge b-green">Pode começar já</span>}
              {docsOk && <span className="badge b-green">Documentos em dia</span>}
              {temCnh && <span className="badge b-wine">CNH {cv.cnh}</span>}
              {cv.experiencias.length === 0 && <span className="badge b-wine">Primeiro emprego</span>}
              {totalAnos > 0 && <span className="badge b-wine">{totalAnos} {totalAnos === 1 ? "ano" : "anos"} de experiência</span>}
            </div>
          </div>
        </div>
        <div className="row" style={{ marginTop: 18, flexWrap: "wrap", gap: 18 }}>
          {contatoOculto ? (
            <button className="btn btn-s btn-sm" onClick={onRevelar}>Ver telefone e e-mail</button>
          ) : (<>
            {cv.tel && <span className="small row" style={{ gap: 6 }}><Ic n="phone" s={15} />{cv.tel}</span>}
            {cv.email && <span className="small row" style={{ gap: 6 }}><Ic n="chat" s={15} />{cv.email}</span>}
          </>)}
        </div>
      </header>

      <div className="cv-cols" style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 36, padding: "6px 32px 30px" }}>
        <div>
          <CvSec titulo="Sobre mim" vazio="A pessoa ainda não escreveu um resumo.">
            {cv.sobre && <p style={{ fontSize: 15 }}>{cv.sobre}</p>}
          </CvSec>

          <CvSec titulo={`Experiência${cv.experiencias.length ? ` (${cv.experiencias.length})` : ""}`} vazio="Ainda sem experiência registrada — procurando o primeiro emprego.">
            {cv.experiencias.length > 0 && (
              <div className="col" style={{ gap: 0 }}>
                {cv.experiencias.map((e, i) => (
                  <div key={i} style={{ position: "relative", paddingLeft: 20, paddingBottom: i < cv.experiencias.length - 1 ? 22 : 0, borderLeft: "2px solid var(--wine-line)", marginLeft: 5 }}>
                    <span style={{ position: "absolute", left: -7, top: 4, width: 12, height: 12, borderRadius: 99, background: ehAtual(e.fim) ? "var(--wine)" : "var(--surface)", border: "2px solid var(--wine)" }} />
                    <h3 style={{ fontSize: 16 }}>{e.cargo || "Função não informada"}</h3>
                    {(e.empresa || e.cidade) && <div className="small" style={{ marginTop: 2, color: "var(--ink)" }}>{[e.empresa, e.cidade].filter(Boolean).join(" · ")}</div>}
                    <div className="muted" style={{ marginTop: 3 }}>
                      {[e.inicio && `${e.inicio} – ${ehAtual(e.fim) ? "hoje" : e.fim}`, (e.inicio && duracao(e.inicio, e.fim)) || e.tempo, !e.inicio && e.fim === "Atual" && "trabalho atual", e.vinculo].filter(Boolean).join(" · ")}
                    </div>
                    {e.desc && <p style={{ marginTop: 8, fontSize: 14 }}>{e.desc}</p>}
                    {e.habilidades?.length > 0 && <div className="chips" style={{ marginTop: 8 }}>{e.habilidades.map((h) => <span key={h} className="tag">{h}</span>)}</div>}
                  </div>
                ))}
              </div>
            )}
          </CvSec>

          <CvSec titulo="Estudo" vazio="Preferiu não informar a escolaridade.">
            {cv.formacao.length > 0 && cv.formacao.map((f, i) => (
              <div key={i} style={{ padding: "10px 0", borderTop: i ? "1px solid var(--line)" : 0 }}>
                <h3 style={{ fontSize: 15 }}>{f.nivel}{f.curso && f.curso.toLowerCase() !== `ensino ${String(f.nivel).toLowerCase()}` ? ` — ${f.curso}` : ""}</h3>
                <div className="muted" style={{ marginTop: 3 }}>{[f.inst, f.status, f.ano && (f.status === "Cursando" ? `previsão ${f.ano}` : f.ano), f.modalidade].filter(Boolean).join(" · ")}</div>
              </div>
            ))}
          </CvSec>

          <CvSec titulo="Cursos e certificados" vazio="Nenhum curso informado.">
            {cv.cursos.length > 0 && cv.cursos.map((c, i) => (
              <div key={i} className="between" style={{ padding: "8px 0", borderTop: i ? "1px solid var(--line)" : 0, alignItems: "flex-start" }}>
                <div><div style={{ fontSize: 14, fontWeight: 500 }}>{c.nome}</div><div className="muted">{[c.inst, c.horas && `${c.horas}h`].filter(Boolean).join(" · ")}</div></div>
                <span className="muted">{c.ano}</span>
              </div>
            ))}
          </CvSec>
        </div>

        <aside>
          <CvSec titulo="Dados pessoais">
            <div>
              <CvLinha k="Idade" v={cv.idade && `${cv.idade} anos`} />
              <CvLinha k="Nascimento" v={dataBR(cv.nascimento)} />
              <CvLinha k="Mora em" v={local} />
              <CvLinha k="CNH" v={temCnh ? `Categoria ${cv.cnh}` : "Não possui"} />
              <CvLinha k="PcD" v={cv.pcd} />
            </div>
          </CvSec>

          <CvSec titulo="Disponibilidade">
            <div>
              <CvLinha k="Começa" v={cv.inicio} />
              <CvLinha k="Horários" v={cv.horarios.join(", ")} />
              <CvLinha k="Formato" v={cv.modelos.join(", ")} />
              <CvLinha k="Contrato" v={cv.contratos.join(", ")} />
              <CvLinha k="Outra cidade" v={cv.mudanca ? "Aceita" : "Não"} />
              <CvLinha k="Quer receber" v={cv.pretensao ? salarioTexto(cv.pretensao, cv.pretensaoUnidade) : "A combinar"} />
            </div>
          </CvSec>

          <CvSec titulo="O que sabe fazer" vazio="Nenhuma habilidade marcada.">
            {cv.habilidades.length > 0 && (
              <div className="chips">{cv.habilidades.map((h) => (
                <span key={h} className="tag" style={destaca(h) ? { borderColor: "var(--wine)", color: "var(--wine)", background: "var(--wine-tint)" } : {}}>{destaca(h) ? "✓ " : ""}{h}</span>
              ))}</div>
            )}
          </CvSec>

          <CvSec titulo="Idiomas">
            {cv.idiomas.length > 0 && <div>{cv.idiomas.map((l) => <CvLinha key={l.name} k={l.name} v={l.level} />)}</div>}
          </CvSec>

          <CvSec titulo="Documentos" vazio="Ainda organizando os documentos.">
            {cv.documentos.length > 0 && <div className="col" style={{ gap: 6 }}>{cv.documentos.map((d) => <div key={d} className="small row" style={{ gap: 6 }}><span style={{ color: "var(--ok)" }}><Ic n="check" s={14} w={2.2} /></span>{d}</div>)}</div>}
          </CvSec>

          {mostrarRefs && (
            <CvSec titulo="Referências" vazio="Sem referências informadas.">
              {cv.referencias.length > 0 && cv.referencias.map((r, i) => (
                <div key={i} style={{ padding: "8px 0", borderTop: i ? "1px solid var(--line)" : 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.nome}</div>
                  <div className="muted">{r.relacao}{r.tel && !contatoOculto ? ` · ${r.tel}` : ""}</div>
                </div>
              ))}
            </CvSec>
          )}
        </aside>
      </div>

      <footer className="between muted" style={{ padding: "14px 32px", borderTop: "1px solid var(--line)", flexWrap: "wrap", gap: 8 }}>
        <span>Atualizado em {dataBR(cv.atualizado)}</span><span>Currículo gerado pelo Matchly</span>
      </footer>
      <style>{`@media(max-width:760px){.cv-cols{grid-template-columns:1fr!important;gap:0!important;padding:4px 20px 24px!important}}`}</style>
    </article>
  );
}

function MeuCurriculo({ ctx }) {
  const cv = cvFromProfile(ctx.profile, ctx.prefs);
  const faltando = [
    !cv.sobre && "um resumo sobre você", !cv.nascimento && "a data de nascimento", !cv.bairro && "o bairro",
    !cv.horarios.length && "os horários em que pode trabalhar", !cv.documentos.length && "os documentos que já tem",
    cv.experiencias.some((e) => !e.desc) && "o que você fazia em cada trabalho",
  ].filter(Boolean);
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 960 }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div><h2>Meu currículo</h2><p className="muted" style={{ marginTop: 4 }}>É exatamente assim que quem contrata vê você.</p></div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="btn btn-s btn-sm" onClick={() => ctx.go("cvedit")}>Editar informações</button>
          <button className="btn btn-p btn-sm" onClick={() => { try { window.print(); } catch (e) { ctx.say("Use o menu do navegador para imprimir"); } }}>Baixar em PDF</button>
        </div>
      </div>
      {faltando.length > 0 && (
        <div className="note" style={{ marginBottom: 18 }}>
          Seu currículo fica mais forte se você completar: {faltando.join(", ")}.
        </div>
      )}
      <Curriculo cv={cv} />
      <button className="btn btn-g btn-sm" style={{ marginTop: 18 }} onClick={() => ctx.go("resume")}>Ver nota do currículo e adaptar para uma vaga →</button>
    </div>
  );
}

/* --------------------------- IA DE CURRÍCULO ---------------------------- */
function atsScore(p) {
  let s = 55, tips = [];
  if (p.skills.length >= 6) s += 10; else tips.push("Liste ao menos 6 habilidades técnicas com o nome exato usado nas vagas.");
  if (p.experiences.every((e) => /\d/.test(e.results || ""))) s += 12; else tips.push("Inclua números nos resultados (%, R$, prazo). Sistemas ATS e recrutadores priorizam conquistas mensuráveis.");
  if (p.certifications.length) s += 8; else tips.push("Adicione uma certificação reconhecida da sua área.");
  if (p.education.length) s += 8;
  if (p.languages.length > 1) s += 5; else tips.push("Informe o nível de inglês — 6 em cada 10 vagas de dados pedem leitura técnica.");
  if (!p.portfolio.length) tips.push("Anexe links de portfólio: repositórios, painéis públicos ou estudos de caso.");
  return { score: Math.min(99, s), tips };
}

function ResumeAI({ ctx }) {
  const { profile: p, matches } = ctx;
  const { score, tips } = atsScore(p);
  const [jobId, setJobId] = useState(JOBS[0]?.id);
  const [changes, setChanges] = useState(null);
  const [ok, setOk] = useState([]);
  const job = JOBS.find((j) => j.id === jobId);
  const m = matches[jobId];
  if (!job || !m) return <SemVagas ctx={ctx} />;

  const adapt = () => {
    const list = [
      { id: 1, t: "Título do currículo", from: p.experiences[0]?.title || p.role, to: job.title.replace(/ (Júnior|Pleno|Sênior)$/, "") },
      { id: 2, t: "Resumo", from: p.sobre || "(sem resumo)", to: `${p.years ? `${p.years} ${p.years === 1 ? "ano" : "anos"} de experiência` : "Procurando o primeiro emprego"}${m.matched.length ? `, com prática em ${m.matched.slice(0, 3).join(", ").toLowerCase()}` : ""}. ${p.sobre || ""}`.trim() },
      { id: 3, t: "Ordem das habilidades", from: p.skills.join(", "), to: [...m.matched, ...p.skills.filter((s) => !m.matched.includes(s))].join(", ") },
      { id: 4, t: "Palavras-chave da vaga", from: "—", to: `Incluir ${job.skills.filter((s) => m.matched.includes(s)).join(", ")} nas descrições onde você realmente usou.` },
    ];
    setChanges(list); setOk(list.map((c) => c.id));
    ctx.say("A IA só reorganiza o que já existe no seu perfil");
  };

  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 900 }}>
      <h2>Currículo</h2>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div><h3>Nota do seu currículo</h3><p style={{ fontSize: 14, marginTop: 4 }}>Mostra se o seu currículo está claro para quem contrata e para os sistemas das empresas.</p></div>
          <div className="row"><Ring v={score} /><span className="score">{score}/100</span></div>
        </div>
        <div className="col" style={{ gap: 10, marginTop: 18 }}>
          {tips.length === 0 ? <p className="small">Nenhum problema encontrado. Currículo pronto para envio.</p> :
            tips.map((t, i) => <div className="note" key={i}>{t}</div>)}
        </div>
        <div className="row" style={{ marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn btn-p btn-sm" onClick={() => ctx.say("Currículo revisado — abra o perfil para conferir")}>Corrigir com IA</button>
          <button className="btn btn-s btn-sm" onClick={() => ctx.say("PDF gerado")}>Baixar em PDF</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Currículo adaptado para uma vaga</h3>
        <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <select className="select grow" value={jobId} onChange={(e) => { setJobId(e.target.value); setChanges(null); }} style={{ minWidth: 220 }}>
            {JOBS.map((j) => <option key={j.id} value={j.id}>{j.title} — {companyOf(j.companyId).name}</option>)}
          </select>
          <button className="btn btn-p" onClick={adapt}>Adaptar meu currículo</button>
        </div>

        {changes && (
          <div style={{ marginTop: 18 }}>
            <h3 style={{ fontSize: 15 }}>Alterações realizadas pela IA</h3>
            <p className="muted" style={{ marginTop: 4 }}>Nada é aplicado sem a sua aprovação. Nenhuma experiência, formação ou habilidade é inventada.</p>
            <div className="col divide" style={{ marginTop: 12 }}>
              {changes.map((c) => (
                <label key={c.id} className="row" style={{ padding: "12px 0", alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={ok.includes(c.id)} style={{ accentColor: "var(--wine)", marginTop: 4 }}
                    onChange={() => setOk(ok.includes(c.id) ? ok.filter((x) => x !== c.id) : [...ok, c.id])} />
                  <div className="grow">
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.t}</div>
                    <div className="muted" style={{ textDecoration: "line-through" }}>{c.from}</div>
                    <div className="small" style={{ color: "var(--wine)" }}>{c.to}</div>
                  </div>
                </label>
              ))}
            </div>
            <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} disabled={!ok.length}
              onClick={() => ctx.say(`${ok.length} alteração(ões) aplicadas nesta versão`)}>Aprovar alterações</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- CARTA DE APRESENTAÇÃO ---------------------- */
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const TZ_OPTIONS = [
  "GMT-5 (Acre)", "GMT-4 (Manaus)", "GMT-3 (Brasília)", "GMT-2 (Fernando de Noronha)",
  "GMT-3 (Buenos Aires)", "GMT-4 (Santiago)", "GMT-5 (Lima / Bogotá)", "GMT-5 (Nova York)",
  "GMT-8 (Los Angeles)", "GMT+0 (Lisboa / Londres)", "GMT+1 (Madri / Berlim)", "GMT+9 (Tóquio)",
];

function buildLetter({ p, job, c, tone, situation, highlight, matched, variant }) {
  const pick = (arr, off = 0) => arr[(variant + off) % arr.length];
  const first = p.name.split(" ")[0];
  const exp = p.experiences[0];
  const strong = matched.length ? matched.slice(0, 3).join(", ") : (p.skills.slice(0, 3).join(", ") || "responsabilidade, pontualidade e vontade de aprender");
  const jobSkills = job.skills.slice(0, 2).join(" e ");

  const openings = {
    Formal: [`Prezados responsáveis pela seleção da ${c.name},`, `À equipe de Recursos Humanos da ${c.name},`, `Prezado(a) recrutador(a),`],
    Profissional: [`Olá, time da ${c.name},`, `Olá! Tudo bem?`, `Bom dia, equipe da ${c.name},`],
    Direto: [`Olá,`, `Boa tarde,`, `Olá, pessoal da ${c.name},`],
    Criativo: [`Oi, ${c.name}!`, `Olá! Vi a vaga e não quis deixar passar.`, `Oi, pessoal —`],
  }[tone];

  const intro = [
    `Me chamo ${p.name} e estou me candidatando à vaga de ${job.title}.`,
    `Vi a vaga de ${job.title} e quero muito fazer parte do time. Meu nome é ${p.name}.`,
    `Sou ${p.name} e escrevo para demonstrar interesse na vaga de ${job.title}, em ${job.city}.`,
    `Encontrei a oportunidade de ${job.title} e senti que combina com o que procuro. Sou ${p.name}, moro em ${p.city}.`,
  ];

  const body = {
    "Tenho experiência na área": [
      `Trabalho na área há ${p.years || 1} ano(s). ${exp ? `Na ${exp.company} atuei como ${exp.title}, onde ${(exp.results || "cuidei da rotina do setor").replace(/^./, (x) => x.toLowerCase())}` : ""} No dia a dia lido bem com ${strong}.`,
      `Já atuei em função parecida e conheço a rotina de perto: ${strong}. ${exp ? `Minha experiência mais recente foi na ${exp.company}, como ${exp.title}.` : ""} Sei o ritmo que a função exige e gosto de trabalhar assim.`,
      `Tenho ${p.years || 1} ano(s) de prática com ${strong}, que é exatamente o que a vaga pede. ${exp ? `Saí da ${exp.company} buscando um lugar onde eu possa crescer.` : ""}`,
      `Conheço bem a função. ${exp ? `Como ${exp.title} na ${exp.company},` : "No meu último trabalho,"} aprendi a resolver imprevistos sem perder a qualidade do atendimento, e é isso que levo comigo para qualquer equipe.`,
    ],
    "Tenho experiência em outra área": [
      `Minha experiência vem de outra área, mas várias coisas se repetem: ${strong}. Aprendo rápido e não tenho receio de começar de baixo para fazer bem feito.`,
      `Ainda não atuei especificamente como ${job.title}, porém já trabalhei com público, prazo e rotina puxada. ${exp ? `Na ${exp.company} fui ${exp.title}.` : ""} O que me falta de prática eu compenso com dedicação.`,
      `Venho de uma função diferente, e foi ali que desenvolvi ${strong}. Estou fazendo essa mudança com consciência: quero aprender ${jobSkills} e construir carreira nessa área.`,
      `Estou em transição de área. ${exp ? `Trabalhei na ${exp.company} e` : "No meu último emprego"} aprendi a cumprir horário, trabalhar em equipe e assumir o que é meu. São bases que servem em qualquer lugar.`,
    ],
    "Estou começando agora": [
      `Esta seria minha primeira oportunidade formal. Tenho ${p.education[0] ? `${p.education[0].level.toLowerCase()} ${p.education[0].status === "Cursando" ? "em andamento" : "concluído"}` : "ensino médio"}, disponibilidade de horário e muita vontade de aprender a função direito.`,
      `Estou começando agora no mercado. Não tenho experiência registrada em carteira, mas tenho compromisso com horário, facilidade para aprender e vontade de crescer dentro da empresa.`,
      `Busco meu primeiro emprego e sei que o começo é assim: chegar disposto, ouvir quem tem experiência e fazer bem o que for pedido. É o que ofereço.`,
      `Esta é minha primeira candidatura para ${job.title}. Tenho disponibilidade ${job.model === "Remoto" ? "para trabalho remoto" : `para trabalhar em ${job.city}`} e estou pronto(a) para aprender ${jobSkills} desde o primeiro dia.`,
    ],
  }[situation];

  const why = [
    `Escolhi a ${c.name} porque acompanho o trabalho de vocês em ${c.sector.toLowerCase()} e gostaria de fazer parte disso.`,
    `O que me atraiu na vaga foi o formato ${job.model.toLowerCase()} e o fato de ser na ${c.name}, uma empresa de ${c.sector.toLowerCase()} com nome na região.`,
    `Me interessei pela ${c.name} pela estrutura e pela chance de crescer junto com o time${job.benefits[0] ? `, além de benefícios como ${job.benefits.slice(0, 2).join(" e ").toLowerCase()}` : ""}.`,
    `Procuro estabilidade e um lugar onde eu possa ficar por bastante tempo. A ${c.name} me parece esse lugar.`,
  ];

  const close = {
    Formal: [`Coloco-me à disposição para uma entrevista no horário que for mais conveniente. Agradeço a atenção.`, `Fico no aguardo de um retorno e desde já agradeço pela consideração da minha candidatura.`, `Agradeço o tempo dedicado à leitura e permaneço à disposição para os próximos passos do processo.`],
    Profissional: [`Fico à disposição para conversar e mostrar melhor como posso ajudar o time. Obrigado(a) pela atenção!`, `Seria ótimo conversar com vocês sobre a vaga. Estou disponível no horário que for melhor.`, `Se fizer sentido, adoraria participar de uma entrevista. Obrigado(a) desde já!`],
    Direto: [`Estou disponível para começar imediatamente. Meu contato está abaixo.`, `Se der certo, podemos conversar quando for melhor para vocês.`, `Fico no aguardo. Obrigado(a).`],
    Criativo: [`Se quiserem me conhecer melhor, é só chamar — prometo chegar no horário.`, `Estou pronto(a) para somar com o time. Basta dar o sinal.`, `Espero ter a chance de mostrar isso pessoalmente. Até breve!`],
  }[tone];

  const parts = [
    pick(openings, 0), "",
    pick(intro, 1), "",
    pick(body, 2), "",
    pick(why, 3),
  ];
  if (highlight.trim()) parts.push("", `Queria destacar ainda: ${highlight.trim()}`);
  if (tone === "Direto") {
    // versão enxuta: corta o parágrafo de motivação
    parts.splice(6, 2);
  }
  parts.push("", pick(close, 1), "", `${p.name}`, `${p.phone} · ${p.email}`);
  return parts.join("\n");
}

function CoverLetter({ ctx }) {
  const { profile: p } = ctx;
  const [jobId, setJobId] = useState(JOBS[0]?.id);
  const [tone, setTone] = useState("Profissional");
  const [situation, setSituation] = useState("Tenho experiência na área");
  const [highlight, setHighlight] = useState("");
  const [text, setText] = useState("");
  const [variant, setVariant] = useState(0);
  const [busy, setBusy] = useState(false);
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return <SemVagas ctx={ctx} />;
  const c = companyOf(job.companyId);
  const m = ctx.matches[jobId];

  const gen = (v) => {
    setBusy(true);
    setTimeout(() => {
      setText(buildLetter({ p, job, c, tone, situation, highlight, matched: m.matched, variant: v }));
      setBusy(false);
    }, 600);
  };

  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 780 }}>
      <h2>Carta de apresentação</h2>
      <p style={{ marginTop: 6 }}>Escrita com o que está no seu perfil. Você escolhe o tom e o texto muda de verdade a cada versão.</p>
      <div className="card" style={{ marginTop: 18 }}>
        <Field label="Vaga">
          <select className="select" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            {JOBS.map((j) => <option key={j.id} value={j.id}>{j.title} — {companyOf(j.companyId).name}</option>)}
          </select>
        </Field>
        <Field label="Sua situação" hint="Isso muda completamente o texto do meio da carta.">
          <ChipGroup options={["Tenho experiência na área", "Tenho experiência em outra área", "Estou começando agora"]} multi={false} value={situation} onChange={setSituation} />
        </Field>
        <Field label="Tom"><ChipGroup options={["Formal", "Profissional", "Direto", "Criativo"]} multi={false} value={tone} onChange={setTone} /></Field>
        <Field label="Algo que você quer destacar (opcional)" hint="Ex.: tenho disponibilidade para começar amanhã; moro a 10 minutos da loja.">
          <input className="input" value={highlight} onChange={(e) => setHighlight(e.target.value)} placeholder="Escreva com suas palavras" />
        </Field>
        <button className="btn btn-p" onClick={() => { setVariant(0); gen(0); }} disabled={busy}>{busy ? "Escrevendo…" : "Criar carta de apresentação"}</button>
      </div>
      {text && (
        <div className="card" style={{ marginTop: 16 }}>
          <textarea className="ta" style={{ minHeight: 360, lineHeight: 1.7 }} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn btn-p btn-sm" onClick={() => ctx.say("Carta anexada à candidatura")}>Usar esta carta</button>
            <button className="btn btn-s btn-sm" onClick={() => { const v = variant + 1; setVariant(v); gen(v); }}>Gerar outra versão</button>
            <button className="btn btn-g btn-sm" onClick={() => ctx.say("Texto copiado")}>Copiar</button>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>Leia antes de enviar e ajuste o que não soar como você. A carta só usa informações que você mesmo cadastrou.</p>
        </div>
      )}
    </div>
  );
}

/* --------------------------- SIMULADOR DE ENTREVISTA -------------------- */
function Interview({ ctx }) {
  const [jobId, setJobId] = useState(JOBS[0]?.id);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [ans, setAns] = useState([]);
  const [cur, setCur] = useState("");
  const [done, setDone] = useState(false);
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return <SemVagas ctx={ctx} />;

  const qs = [
    `Conte sobre um projeto em que você usou ${job.skills[0]} do início ao fim.`,
    `Esta vaga é ${job.model.toLowerCase()} e ${job.seniority.toLowerCase()}. Como você organiza sua rotina de trabalho hoje?`,
    `Descreva uma situação em que os dados contrariaram a opinião da área de negócio. O que você fez?`,
    `Qual foi o erro técnico mais caro que você cometeu e o que mudou depois dele?`,
    `Por que a ${companyOf(job.companyId).name} e por que agora?`,
  ];

  const send = () => {
    const next = [...ans, cur]; setAns(next); setCur("");
    if (i === qs.length - 1) setDone(true); else setI(i + 1);
  };

  const avg = ans.length ? Math.min(96, 58 + Math.round(ans.reduce((a, b) => a + Math.min(120, b.length), 0) / ans.length / 4)) : 0;
  const crit = [["Clareza", avg], ["Objetividade", Math.max(40, avg - 6)], ["Conhecimento técnico", Math.min(98, avg + 5)],
    ["Comunicação", avg], ["Confiança", Math.max(40, avg - 3)], ["Adequação à vaga", ctx.matches[jobId].score]];

  if (!started) return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 700 }}>
      <h2>Entrevista IA</h2>
      <p style={{ marginTop: 6 }}>A IA assume o papel de recrutador e faz perguntas baseadas na vaga escolhida.</p>
      <div className="card" style={{ marginTop: 18 }}>
        <Field label="Simular entrevista para">
          <select className="select" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            {JOBS.map((j) => <option key={j.id} value={j.id}>{j.title} — {companyOf(j.companyId).name}</option>)}
          </select>
        </Field>
        <p className="muted">5 perguntas · responda por texto. Ao final você recebe uma nota e o que melhorar.</p>
        <button className="btn btn-p" style={{ marginTop: 14 }} onClick={() => setStarted(true)}>Começar entrevista</button>
      </div>
    </div>
  );

  if (done) return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 700 }}>
      <h2>Resultado da simulação</h2>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="row"><Ring v={avg} size={78} /><div><h3>{avg}/100</h3><p style={{ fontSize: 14 }}>{avg >= 80 ? "Pronto para a entrevista real." : "Boa base, com pontos claros a ajustar."}</p></div></div>
        <div style={{ marginTop: 20 }}>
          {crit.map(([k, v]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div className="between" style={{ marginBottom: 5 }}><span className="small">{k}</span><span className="small">{v}%</span></div>
              <div className="bar"><i style={{ width: v + "%" }} /></div>
            </div>
          ))}
        </div>
        <div className="note" style={{ marginTop: 8 }}>
          <b style={{ color: "var(--ink)" }}>Como melhorar</b>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            <li>Use a estrutura situação → ação → resultado em cada resposta.</li>
            <li>Encerre sempre com um número: prazo, percentual ou volume.</li>
            <li>Cite a ferramenta exata da vaga ({job.skills.slice(0, 2).join(" e ")}) quando ela fizer parte da história.</li>
          </ul>
        </div>
        <button className="btn btn-s btn-sm" style={{ marginTop: 16 }} onClick={() => { setStarted(false); setDone(false); setI(0); setAns([]); }}>Nova simulação</button>
      </div>
    </div>
  );

  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 700 }}>
      <div className="steps">{qs.map((_, k) => <i key={k} data-on={k <= i ? "1" : "0"} />)}</div>
      <p className="muted">Pergunta {i + 1} de {qs.length}</p>
      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ fontSize: 17, lineHeight: 1.4 }}>{qs[i]}</h3>
        <textarea className="ta" style={{ marginTop: 16, minHeight: 150 }} value={cur} placeholder="Escreva sua resposta…" onChange={(e) => setCur(e.target.value)} />
        <div className="between" style={{ marginTop: 12 }}>
          <span className="muted">{cur.length} caracteres</span>
          <button className="btn btn-p" disabled={cur.trim().length < 10} onClick={send}>{i === qs.length - 1 ? "Finalizar" : "Responder"}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- PLANO DE CARREIRA ------------------------- */
function Career({ ctx }) {
  const { profile: p, prefs, matches, feed } = ctx;
  const target = feed.find((j) => matches[j.id].score < 90) || feed[0];
  if (!target) return <SemVagas ctx={ctx} />;
  const m = matches[target.id];
  const steps = [
    ["Agora", "Melhorar currículo", `Adicionar números aos resultados e subir o score ATS para mais de 90.`],
    ["Próximos 30 dias", `Aprender ${m.missing[0] || "uma ferramenta de cloud"}`, "Curso prático + um projeto pessoal publicado no portfólio."],
    ["Próximos 3 meses", "Buscar uma certificação", "Certificações de fornecedor (Microsoft, AWS, Google) aumentam a aprovação na triagem."],
    ["Próximos 6 meses", "Candidatar-se a cargos de maior nível", `Com o gap fechado, vagas de ${prefs.mainRole} sênior passam a ficar acima de 90%.`],
  ];
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 780 }}>
      <h2>Meu próximo passo</h2>
      <p style={{ marginTop: 6 }}>Plano montado a partir do seu perfil e das vagas que você vem olhando.</p>

      <div style={{ marginTop: 26, borderLeft: "2px solid var(--wine-line)", paddingLeft: 22 }}>
        {steps.map(([when, what, how], i) => (
          <div key={i} style={{ position: "relative", paddingBottom: 26 }}>
            <span style={{ position: "absolute", left: -30, top: 4, width: 12, height: 12, borderRadius: 99, background: i === 0 ? "var(--wine)" : "var(--surface)", border: "2px solid var(--wine)" }} />
            <div className="muted">{when}</div>
            <h3 style={{ fontSize: 16, marginTop: 2 }}>{what}</h3>
            <p style={{ fontSize: 14, marginTop: 4 }}>{how}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h3>O que falta para conseguir esse emprego?</h3>
        <p className="small" style={{ marginTop: 4 }}>{target.title} — {companyOf(target.companyId).name}</p>
        <div className="col" style={{ gap: 8, margin: "14px 0" }}>
          {target.skills.map((s) => <div key={s} className="row"><span style={{ color: m.matched.includes(s) ? "var(--ok)" : "var(--bad)" }}><Ic n={m.matched.includes(s) ? "check" : "x"} s={16} w={2.2} /></span><span className="small">{s}</span></div>)}
          <div className="row"><span style={{ color: p.years >= target.years ? "var(--ok)" : "var(--bad)" }}><Ic n={p.years >= target.years ? "check" : "x"} s={16} w={2.2} /></span><span className="small">{target.years} anos de experiência</span></div>
        </div>
        <div className="note">Plano para aumentar sua compatibilidade de {m.score}% para {Math.min(96, m.score + 14)}%.</div>
      </div>
    </div>
  );
}

/* -------------------------------- EMPRESAS ------------------------------ */
/* Compatibilidade com uma empresa = a vaga dela que mais combina com a pessoa */
function compatEmpresa(id, matches) {
  let melhor = null;
  JOBS.forEach((j) => { if (j.companyId === id && matches[j.id] && (!melhor || matches[j.id].score > melhor.score)) melhor = { score: matches[j.id].score, job: j, m: matches[j.id] }; });
  return melhor;
}
function Companies({ ctx }) {
  const { following, setFollowing, setCompanyOpen } = ctx;
  const [q, setQ] = useState("");
  const [so, setSo] = useState(ctx.logged ? "Mais compatíveis" : "Todas");
  const [lim, setLim] = useState(24);
  const compat = (id) => compatEmpresa(id, ctx.matches);
  const lista = COMPANIES.filter((c) => {
    if (q && !norm(`${c.name} ${c.sector} ${c.city}`).includes(norm(q))) return false;
    const n = JOBS.filter((j) => j.companyId === c.id).length;
    if (so === "Com vagas abertas" && !n) return false;
    if (so === "Verificadas" && !c.verified) return false;
    return true;
  }).sort((a, b) => so === "Mais compatíveis" ? (compat(b.id)?.score || 0) - (compat(a.id)?.score || 0)
    : JOBS.filter((j) => j.companyId === b.id).length - JOBS.filter((j) => j.companyId === a.id).length);
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px" }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 14 }}>
        <div><h2>Empresas</h2><p className="muted" style={{ marginTop: 4 }}>{`${COMPANIES.length} ${COMPANIES.length === 1 ? "empresa" : "empresas"} com vagas`} · as vagas são atualizadas automaticamente</p></div>
        <button className="btn btn-p btn-sm" onClick={() => ctx.go("companyRegister")}>Cadastrar minha empresa</button>
      </div>
      <div className="row" style={{ marginTop: 18, flexWrap: "wrap" }}>
        <input className="input grow" style={{ minWidth: 220 }} placeholder="Buscar empresa, ramo ou cidade" value={q} onChange={(e) => { setQ(e.target.value); setLim(24); }} />
      </div>
      <div className="chips" style={{ marginTop: 12 }}>
        {[...(ctx.logged ? ["Mais compatíveis"] : []), "Todas", "Com vagas abertas", "Verificadas"].map((x) => <button key={x} className="chip" data-on={so === x ? "1" : "0"} onClick={() => setSo(x)}>{x}</button>)}
      </div>
      {COMPANIES.length === 0 ? (
        <div className="empty" style={{ marginTop: 22 }}><h3>Nenhuma empresa cadastrada ainda</h3>
          <p style={{ marginTop: 8 }}>O Matchly acabou de abrir. As empresas aparecem aqui conforme forem se cadastrando.</p>
          <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => ctx.go("companyRegister")}>Cadastrar minha empresa</button></div>
      ) : lista.length === 0 && <div className="empty" style={{ marginTop: 22 }}><h3>Nenhuma empresa encontrada</h3><p style={{ marginTop: 8 }}>Tente outro nome ou cidade.</p></div>}
      <div className="grid-cards" style={{ marginTop: 22 }}>
        {lista.slice(0, lim).map((c) => {
          const open = JOBS.filter((j) => j.companyId === c.id).length;
          return (
            <div className="card card-h" key={c.id}>
              <div className="row">
                <CompanyLogo c={c} size={46} />
                <div className="grow"><h3 style={{ fontSize: 15 }}>{c.name}</h3><div className="muted">{c.sector}</div></div>
                {c.nota && <Estrelas r={c.nota} pequeno />}
              </div>
              {ctx.logged && compat(c.id) && <div className="row small" style={{ marginTop: 10, gap: 8 }}><span className="score">Combina até {compat(c.id).score}%</span><span className="muted">com você</span></div>}
              <div className="chips" style={{ marginTop: 12 }}>
                {c.city && c.city !== "—" && <Tag i="pin">{c.city}</Tag>}{c.size && c.size !== "—" && <Tag i="user">{c.size}</Tag>}
                {c.verified ? <span className="badge b-green">Verificada</span> : <span className="badge b-yellow">Não verificada</span>}
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn btn-p btn-sm" onClick={() => setCompanyOpen(c.id)}>Ver perfil ({open})</button>
                <button className="btn btn-s btn-sm" onClick={() => setFollowing(following.includes(c.id) ? following.filter((x) => x !== c.id) : [...following, c.id])}>
                  {following.includes(c.id) ? "Seguindo" : "Seguir"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {lista.length > lim && <div className="center" style={{ marginTop: 22 }}><button className="btn btn-s" onClick={() => setLim(lim + 24)}>Mostrar mais empresas ({lista.length - lim})</button></div>}
    </div>
  );
}

function CompanyPage({ id, ctx }) {
  const c = companyOf(id);
  const jobs = JOBS.filter((j) => j.companyId === id);
  const benefits = [...new Set([...(c.beneficios || []), ...jobs.flatMap((j) => j.benefits || [])])];
  return (
    <div className="wrap" style={{ padding: "24px 24px 60px", maxWidth: 900 }}>
      <button className="btn btn-g btn-sm" onClick={() => ctx.setCompanyOpen(null)}>← Voltar</button>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <CompanyLogo c={c} size={76} radius={14} />
          <div className="grow">
            <h2 className="row" style={{ gap: 12, flexWrap: "wrap" }}>{c.name} <Estrelas r={c.nota} /></h2>
            <p style={{ marginTop: 4 }}>{[c.sector, c.city !== "—" && c.city, c.size && c.size !== "—" && `${c.size} funcionários`].filter(Boolean).join(" · ")}</p>
            <div className="chips" style={{ marginTop: 8 }}>
              {c.verified ? <span className="badge b-green">Empresa verificada</span> : c.pending ? <span className="badge b-yellow">Verificação pendente</span> : <span className="badge b-yellow">Não verificada</span>}
              {c.site && <a href={/^https?:/.test(c.site) ? c.site : "https://" + c.site} target="_blank" rel="noopener noreferrer" className="small">{dominioDe(c.site)} ↗</a>}
            </div>
          </div>
          <button className="btn btn-s btn-sm" onClick={() => ctx.setFollowing(ctx.following.includes(c.id) ? ctx.following.filter((x) => x !== c.id) : [...ctx.following, c.id])}>
            {ctx.following.includes(c.id) ? "Seguindo" : "Seguir empresa"}</button>
        </div>
        <p style={{ marginTop: 16 }}>{c.descricao || (c.sector === "Contratante particular"
          ? "Pessoa que contrata pelo Matchly. As vagas abaixo foram publicadas aqui mesmo, e o currículo vai direto para ela."
          : c.site || c.domain
            ? `${c.sector ? `Empresa do ramo de ${String(c.sector).toLowerCase()}. ` : ""}As vagas abaixo são atualizadas automaticamente a partir da página oficial da empresa.`
            : `${c.sector && c.sector !== "Empresa" ? `Empresa do ramo de ${String(c.sector).toLowerCase()}. ` : ""}As vagas abaixo foram publicadas direto no Matchly.`)}</p>
        <div className="chips" style={{ marginTop: 14 }}>{c.culture.map((x) => <span key={x} className="tag">{x}</span>)}</div>
        {benefits.length > 0 && <><h3 style={{ marginTop: 20, fontSize: 15 }}>Benefícios</h3>
        <div className="chips" style={{ marginTop: 10 }}>{benefits.map((b) => <span key={b} className="tag">{b}</span>)}</div></>}
      </div>
      {ctx.logged && compatEmpresa(c.id, ctx.matches) && (() => {
        const k = compatEmpresa(c.id, ctx.matches);
        return (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="between" style={{ flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: 16 }}>Sua compatibilidade com {c.name}</h3>
              <span className="score">Até {k.score}%</span>
            </div>
            <p className="small" style={{ marginTop: 6 }}>A vaga que mais combina com você aqui é <b>{k.job.title}</b>. A análise compara o tipo de trabalho, o que você sabe fazer, experiência, estudo, quanto você quer receber, horário, cidade e tipo de contratação.</p>
            {k.m.why.length > 0 && <ul className="small" style={{ margin: "10px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>{k.m.why.slice(0, 3).map((w) => <li key={w}>{w}</li>)}</ul>}
            {k.m.gaps.length > 0 && <div className="note small" style={{ marginTop: 10 }}><b style={{ color: "var(--ink)" }}>Para combinar mais:</b> {k.m.gaps[0]}</div>}
            <button className="btn btn-s btn-sm" style={{ marginTop: 12 }} onClick={() => ctx.setOpenJob(k.job.id)}>Ver essa vaga</button>
          </div>
        );
      })()}
      <AvaliacoesDaEmpresa id={c.id} />
      <h3 style={{ margin: "24px 0 14px" }}>Vagas abertas ({jobs.length})</h3>
      {jobs.length === 0 && <div className="empty"><h3>Nenhuma vaga aberta agora</h3><p style={{ marginTop: 8 }}>Siga a empresa e avisamos quando abrir algo.</p></div>}
      <div className="col" style={{ gap: 14 }}>{jobs.map((j) => <JobCard key={j.id} job={j} ctx={ctx} />)}</div>
    </div>
  );
}


/* -------------------------- CADASTRO DE EMPRESA ------------------------- */
function cnpjValido(v) {
  const n = (v || "").replace(/\D/g, "");
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const dv = (base) => { let soma = 0, peso = base.length - 7; for (const d of base) { soma += +d * peso--; if (peso < 2) peso = 9; } const r = soma % 11; return r < 2 ? 0 : 11 - r; };
  return dv(n.slice(0, 12)) === +n[12] && dv(n.slice(0, 13)) === +n[13];
}
const mascaraCnpj = (v) => v.replace(/\D/g, "").slice(0, 14).replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
const ATS_PADROES = [[/greenhouse\.io\/([\w-]+)/i, "greenhouse"], [/jobs\.lever\.co\/([\w-]+)/i, "lever"], [/smartrecruiters\.com\/([\w-]+)/i, "smartrecruiters"],
  [/([\w-]+)\.recruitee\.com/i, "recruitee"], [/jobs\.ashbyhq\.com\/([\w-]+)/i, "ashby"], [/([\w-]+)\.gupy\.io/i, "gupy"]];
const detectarAts = (url) => { for (const [re, nome] of ATS_PADROES) { const m = (url || "").match(re); if (m) return { fonte: nome, id: m[1] }; } return url ? { fonte: "pagina", id: url } : null; };

function CompanyRegister({ ctx }) {
  const [f, setF] = useState({ nome: "", razao: "", cnpj: "", site: "", setor: "", cidade: "", uf: "SP", tamanho: "1–10", descricao: "",
    beneficios: [], responsavel: "", cargoResp: "", email: "", tel: "", vagasUrl: "", aceite: false });
  const [logo, setLogo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const ats = detectarAts(f.vagasUrl.trim());

  const escolherLogo = (file) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type)) { setErro("A logo precisa ser PNG, JPG, WEBP ou SVG."); return; }
    if (file.size > 600 * 1024) { setErro("A logo pode ter no máximo 600 KB."); return; }
    const r = new FileReader(); r.onload = () => { setLogo(r.result); setErro(""); }; r.readAsDataURL(file);
  };

  const enviar = async () => {
    const dom = dominioDe(f.site);
    const emailDom = (f.email.split("@")[1] || "").toLowerCase();
    if (!f.nome.trim()) return setErro("Escreva o nome da empresa.");
    if (f.cnpj.replace(/\D/g, "") && !cnpjValido(f.cnpj)) return setErro("Esse CNPJ não é válido. Confira os números ou deixe em branco.");
    if (!f.responsavel.trim() || !/\S+@\S+\.\S+/.test(f.email)) return setErro("Informe o nome e um e-mail de quem responde pela empresa.");
    if (!f.aceite) return setErro("É preciso aceitar os termos para publicar vagas.");
    setErro(""); setEnviando(true);
    const dados = { ...f, cnpj: f.cnpj.replace(/\D/g, ""), dominio: dom, logo, fonte: ats?.fonte || null, fonteId: ats?.id || null,
      emailCorporativo: !!dom && emailDom.endsWith(dom) };
    try {
      if (AO_VIVO) {
        const r = await fetch("/api/empresas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) });
        const out = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(out.erro || "Não foi possível cadastrar agora.");
        if (out.token) CHAVES.set("empresa", out.token);
        ctx.setRole("Contratante");
        ctx.say("Empresa cadastrada! Agora publique sua primeira vaga.");
        ctx.go("hire");
        return;
      }
      const id = "e" + Date.now();
      COMPANIES.unshift({ id, name: f.nome.trim(), sector: f.setor || "", size: f.tamanho, city: f.cidade ? `${f.cidade}/${f.uf}` : "", verified: false, pending: true,
        culture: [], logo, domain: dom, site: f.site, descricao: f.descricao, beneficios: f.beneficios });
      ctx.bumpJobs();
      if (!AO_VIVO) ctx.say(DEMO ? "Empresa cadastrada (modo demonstração)." : "Empresa cadastrada só neste aparelho: o banco de dados ainda não foi ligado.");
      ctx.setCompanyOpen(id);
    } catch (e) { setErro(e.message); } finally { setEnviando(false); }
  };

  return (
    <div className="wrap" style={{ padding: "36px 24px 80px", maxWidth: 760 }}>
      <span className="eyebrow">Para empresas</span>
      <h2 style={{ marginTop: 12 }}>Cadastre sua empresa</h2>
      <p style={{ marginTop: 8 }}>Grátis. Sua página aparece com a sua logo, e as vagas que você publicar vão direto para quem combina com elas.</p>

      <div className="card" style={{ marginTop: 22 }}>
        <h3 style={{ marginBottom: 16 }}>Logo e identidade</h3>
        <div className="row" style={{ alignItems: "center", gap: 18, flexWrap: "wrap", marginBottom: 18 }}>
          <CompanyLogo c={{ name: f.nome || "Sua empresa", logo, domain: dominioDe(f.site) }} size={84} radius={16} />
          <div className="col" style={{ gap: 8 }}>
            <label className="btn btn-s btn-sm" style={{ cursor: "pointer" }}>
              {logo ? "Trocar logo" : "Enviar logo"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style={{ display: "none" }} onChange={(e) => escolherLogo(e.target.files?.[0])} />
            </label>
            {logo && <button className="btn btn-g btn-sm" onClick={() => setLogo("")}>Remover</button>}
            <span className="muted">Quadrada, fundo transparente ou branco, até 600 KB.</span>
          </div>
        </div>
        <div className="grid2">
          <Field label="Nome da empresa"><input className="input" value={f.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Como os clientes conhecem" /></Field>
          <Field label="Razão social"><input className="input" value={f.razao} onChange={(e) => set("razao", e.target.value)} /></Field>
          <Field label="CNPJ (opcional)" hint={f.cnpj.replace(/\D/g, "").length === 14 ? (cnpjValido(f.cnpj) ? "✓ CNPJ válido" : "CNPJ inválido") : "Se tiver, ajuda a ganhar o selo de empresa verificada. Não aparece no site."}>
            <input className="input" inputMode="numeric" value={f.cnpj} onChange={(e) => set("cnpj", mascaraCnpj(e.target.value))} placeholder="00.000.000/0000-00" />
          </Field>
          <Field label="Site"><input className="input" value={f.site} onChange={(e) => set("site", e.target.value)} placeholder="www.suaempresa.com.br" /></Field>
          <Field label="Ramo"><input className="input" value={f.setor} onChange={(e) => set("setor", e.target.value)} placeholder="Ex.: supermercado, restaurante" /></Field>
          <Field label="Número de funcionários">
            <select className="select" value={f.tamanho} onChange={(e) => set("tamanho", e.target.value)}>
              {["1–10", "11–50", "51–200", "200–1.000", "1.000–5.000", "+5.000"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Cidade"><input className="input" value={f.cidade} onChange={(e) => set("cidade", e.target.value)} /></Field>
          <Field label="Estado">
            <select className="select" value={f.uf} onChange={(e) => set("uf", e.target.value)}>{UFS.map((u) => <option key={u}>{u}</option>)}</select>
          </Field>
        </div>
        <Field label="Sobre a empresa" hint="Duas ou três frases sobre o que vocês fazem e como é trabalhar aí.">
          <textarea className="ta" value={f.descricao} onChange={(e) => set("descricao", e.target.value)} />
        </Field>
        <Field label="Benefícios que vocês oferecem">
          <ChipGroup options={["Vale transporte", "Vale refeição", "Cesta básica", "Plano de saúde", "Plano odontológico", "Refeição no local", "Comissão", "PLR", "Auxílio creche", "Desconto em produtos"]} value={f.beneficios} onChange={(v) => set("beneficios", v)} />
        </Field>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 6 }}>Já publica vagas em outro lugar?</h3>
        <p className="muted" style={{ marginBottom: 14 }}>Cole o link da sua página de vagas. Se ela usa Gupy, Greenhouse, Lever, SmartRecruiters, Recruitee ou Ashby, o Matchly traz as vagas sozinho e mantém atualizadas.</p>
        <Field label="Link da página de vagas (opcional)">
          <input className="input" value={f.vagasUrl} onChange={(e) => set("vagasUrl", e.target.value)} placeholder="https://suaempresa.gupy.io" />
        </Field>
        {ats && <div className="note">{ats.fonte === "pagina" ? "Vamos ler as vagas publicadas nessa página, respeitando as regras do site." : `Detectamos ${ats.fonte[0].toUpperCase() + ats.fonte.slice(1)}. As vagas entram automaticamente.`}</div>}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 14 }}>Quem responde pela empresa</h3>
        <div className="grid2">
          <Field label="Nome"><input className="input" value={f.responsavel} onChange={(e) => set("responsavel", e.target.value)} /></Field>
          <Field label="Cargo"><input className="input" value={f.cargoResp} onChange={(e) => set("cargoResp", e.target.value)} placeholder="Ex.: RH, gerente, dono" /></Field>
          <Field label="E-mail" hint="Com e-mail do domínio da empresa a verificação é mais rápida."><input className="input" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Telefone"><input className="input" value={f.tel} onChange={(e) => set("tel", e.target.value)} /></Field>
        </div>
        <label className="row" style={{ alignItems: "flex-start", cursor: "pointer", marginTop: 4 }}>
          <input type="checkbox" checked={f.aceite} onChange={(e) => set("aceite", e.target.checked)} style={{ accentColor: "var(--wine)", marginTop: 3 }} />
          <span className="small">Confirmo que represento esta empresa, que as vagas são reais e que nunca vamos cobrar nenhum valor de candidatos.</span>
        </label>
      </div>

      {erro && <div className="note" style={{ marginTop: 16, borderColor: "var(--bad)", color: "var(--bad)" }}>{erro}</div>}
      <div className="between" style={{ marginTop: 22 }}>
        <button className="btn btn-g" onClick={() => ctx.go("companies")}>Voltar</button>
        <button className="btn btn-p" disabled={enviando} onClick={enviar}>{enviando ? "Enviando…" : "Cadastrar empresa"}</button>
      </div>
      <p className="muted" style={{ marginTop: 14 }}>Empresas novas aparecem com o selo "verificação pendente" até conferirmos os dados e o contato. O CNPJ é opcional.</p>
    </div>
  );
}

/* ------------------------------ COMPARADOR ------------------------------ */
function Compare({ ctx }) {
  const { compare, setCompare, matches } = ctx;
  const sel = compare.map((id) => JOBS.find((j) => j.id === id)).filter(Boolean);
  const best = sel.length ? sel.reduce((a, b) => (matches[a.id].score >= matches[b.id].score ? a : b)) : null;
  const toggle = (id) => setCompare(compare.includes(id) ? compare.filter((x) => x !== id) : compare.length >= 4 ? (ctx.say("Máximo de 4 vagas"), compare) : [...compare, id]);
  const rows = [
    ["Pagamento", (j) => payLabel(j)],
    ["Compatibilidade", (j) => matches[j.id].score + "%"],
    ["Trabalho", (j) => `${j.model} · ${j.contract}`],
    ["Experiência pedida", (j) => `${j.years} anos · ${j.seniority}`],
    ["Benefícios", (j) => j.benefits.slice(0, 3).join(", ")],
    ["Crescimento", (j) => (j.seniority === "Coordenação" ? "Gestão de time" : j.seniority === "Sênior" ? "Caminho para especialista" : "Espaço para promoção")],
  ];
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px" }}>
      <h2>Comparar vagas</h2>
      <p style={{ marginTop: 6 }}>Selecione até 4 vagas.</p>
      <div className="chips" style={{ margin: "16px 0 24px" }}>
        {JOBS.map((j) => <button key={j.id} className="chip" data-on={compare.includes(j.id) ? "1" : "0"} onClick={() => toggle(j.id)}>{j.title}</button>)}
      </div>
      {sel.length < 2 ? (
        <div className="empty"><h3>Escolha pelo menos duas vagas</h3><p style={{ marginTop: 8 }}>A comparação fica lado a lado, critério por critério.</p></div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead><tr>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--line)", fontSize: 13 }}>Critério</th>
                {sel.map((j) => <th key={j.id} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                  {j.title}<div className="muted" style={{ fontWeight: 400 }}>{companyOf(j.companyId).name}</div></th>)}
              </tr></thead>
              <tbody>
                {rows.map(([label, fn]) => (
                  <tr key={label}>
                    <td style={{ padding: "12px", borderBottom: "1px solid var(--line)", fontSize: 13, color: "var(--ink-3)" }}>{label}</td>
                    {sel.map((j) => <td key={j.id} style={{ padding: "12px", borderBottom: "1px solid var(--line)", fontSize: 13 }}>{fn(j)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="note" style={{ marginTop: 20 }}>
            <b style={{ color: "var(--ink)" }}>Recomendação da IA</b>
            <p style={{ marginTop: 6 }}>
              {best.title} na {companyOf(best.companyId).name} é a mais adequada: {matches[best.id].score}% de compatibilidade,
              faixa até {money(best.sMax)} e modelo {best.model.toLowerCase()}, que está entre as suas preferências.
              {" "}{matches[best.id].missing.length ? `O ponto de atenção é ${matches[best.id].missing[0]}.` : "Você cobre todos os requisitos listados."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------- ALERTAS ------------------------------- */
const AVISOS_PADRAO = { novasVagas: true, candidatura: true, respostas: true, porEmail: true, email: "", porSMS: false };
function Alerts({ ctx }) {
  const { alerts, setAlerts, say, profile } = ctx;
  const [a, setA] = useState({ ...AVISOS_PADRAO, ...alerts, email: alerts.email || profile.email || "" });
  const [canaisOn, setCanaisOn] = useState(null);
  useEffect(() => { if (AO_VIVO) api("status").then((r) => setCanaisOn(r.canais || {})).catch(() => setCanaisOn({})); }, []);
  const set = (k, v) => setA({ ...a, [k]: v });
  const emBreve = (c) => AO_VIVO && canaisOn && !canaisOn[c];
  const salvar = () => {
    if (a.porEmail && a.email && !/^\S+@\S+\.\S+$/.test(a.email)) return say("Confira o e-mail.");
    setAlerts(a); say("Avisos salvos.");
  };
  const Caixa = ({ k, titulo, sub }) => (
    <label className="row" style={{ gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "10px 0" }}>
      <input type="checkbox" checked={!!a[k]} onChange={(e) => set(k, e.target.checked)} style={{ accentColor: "var(--wine)", width: 20, height: 20, marginTop: 2 }} />
      <span><b style={{ fontSize: 14.5 }}>{titulo}</b><br /><span className="small">{sub}</span></span>
    </label>
  );
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 700 }}>
      <h2>Avisos</h2>
      <p style={{ marginTop: 6 }}>Escolha o que você quer saber e por onde. Você pode mudar quando quiser.</p>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ fontSize: 16, marginBottom: 4 }}>O que avisar</h3>
        <Caixa k="novasVagas" titulo="Vagas novas que combinam comigo" sub="No celular, na hora. Por e-mail ou SMS, um resumo por dia." />
        <Caixa k="candidatura" titulo="Minha candidatura foi enviada" sub="A confirmação de que o currículo chegou na empresa." />
        <Caixa k="respostas" titulo="Respostas das empresas" sub="Quando a empresa vê o currículo, chama para conversar, contrata, recusa ou convida você." />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Por onde avisar</h3>
        <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
          <b style={{ fontSize: 14.5 }}><Ic n="bell" s={16} /> No celular (notificação)</b>
          <p className="small" style={{ margin: "4px 0 10px" }}>Grátis e na hora. No iPhone, primeiro coloque o Matchly na tela de início.</p>
          {AO_VIVO && CHAVES.get("candidato") ? <BotaoAvisos papel="candidato" ctx={ctx} texto="Ligue os avisos neste aparelho." /> : <p className="small muted">Disponível depois do cadastro.</p>}
          <button className="btn btn-g btn-sm" onClick={() => ctx.go("instalar")}>Como colocar o Matchly na tela de início</button>
        </div>
        <div style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
          <Caixa k="porEmail" titulo="Por e-mail" sub={emBreve("email") ? "Estamos ligando o envio de e-mails. Deixe o seu e-mail aqui que você começa a receber assim que estiver pronto." : "Grátis. Chega na sua caixa de entrada."} />
          {a.porEmail && <input className="input" type="email" inputMode="email" value={a.email} onChange={(e) => set("email", e.target.value.trim())} placeholder="seuemail@gmail.com" />}
        </div>
        <div style={{ paddingTop: 12 }}>
          <Caixa k="porSMS" titulo="Por SMS" sub={emBreve("sms") ? "Em breve. Se marcar agora, você começa a receber assim que o envio de SMS estiver ligado." : `Mensagem de texto para ${profile.phone || "o seu celular"}.`} />
        </div>
      </div>
      <button className="btn btn-p" style={{ marginTop: 16 }} onClick={salvar}>Salvar avisos</button>
    </div>
  );
}

/* ----------------------------- NOTIFICAÇÕES ----------------------------- */
function Notifications({ ctx }) {
  const { notifs, setNotifs, setOpenJob } = ctx;
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 720 }}>
      <div className="between"><h2>Notificações</h2>
        <button className="btn btn-g btn-sm" onClick={() => setNotifs(notifs.map((n) => ({ ...n, read: true })))}>Marcar todas como lidas</button></div>
      <div className="card divide" style={{ marginTop: 18, padding: 0 }}>
        {notifs.map((n) => (
          <button key={n.id} style={{ display: "flex", gap: 12, width: "100%", textAlign: "left", padding: 16, background: n.read ? "transparent" : "var(--wine-tint)", border: 0, cursor: "pointer", alignItems: "flex-start" }}
            onClick={() => { setNotifs(notifs.map((x) => (x.id === n.id ? { ...x, read: true } : x))); if (n.jobId) setOpenJob(n.jobId); }}>
            <span style={{ color: "var(--wine)", marginTop: 2 }}><Ic n={n.icon} s={18} /></span>
            <span className="grow"><span style={{ display: "block", fontSize: 14, fontWeight: n.read ? 400 : 600, color: "var(--ink)" }}>{n.title}</span>
              <span className="muted">{n.text}</span></span>
            <span className="muted">{n.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- CALENDÁRIO ----------------------------- */
function Calendar({ ctx }) {
  const events = !DEMO ? {} : { 12: [["mic", "Entrevista — Product Analyst, 14h"]], 15: [["clock", "Prazo de candidatura — Analista de Dados Pleno"]], 18: [["mic", "Segunda entrevista — Lar Digital, 10h"]], 22: [["calendar", "Lembrete: atualizar portfólio"]] };
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 860 }}>
      <h2>Calendário</h2>
      <p style={{ marginTop: 6 }}>{DEMO ? "Setembro de 2026" : new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(/^./, (c) => c.toUpperCase())} · entrevistas, prazos e lembretes em um lugar só.</p>
      <div className="card" style={{ marginTop: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
          {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => <div key={i} className="muted" style={{ textAlign: "center", paddingBottom: 6 }}>{d}</div>)}
          {days.map((d) => (
            <div key={d} style={{ minHeight: 62, border: "1px solid var(--line)", borderRadius: 8, padding: 6, background: events[d] ? "var(--wine-tint)" : "transparent" }}>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{d}</div>
              {(events[d] || []).map(([ic, t], i) => <div key={i} style={{ fontSize: 10, color: "var(--wine)", marginTop: 3, lineHeight: 1.3 }}>{t.split("—")[0]}</div>)}
            </div>
          ))}
        </div>
      </div>
      <h3 style={{ margin: "24px 0 12px" }}>Próximos eventos</h3>
      {Object.keys(events).length === 0 && <p className="muted">Nenhum evento ainda. Quando uma empresa marcar uma entrevista com você, ela aparece aqui.</p>}
      <div className="card divide" style={Object.keys(events).length === 0 ? { display: "none" } : undefined}>
        {Object.entries(events).map(([d, list]) => list.map(([ic, t], i) => (
          <div key={d + i} className="row" style={{ padding: "12px 0" }}>
            <span style={{ color: "var(--wine)" }}><Ic n={ic} s={18} /></span>
            <div className="grow"><div style={{ fontSize: 14 }}>{t}</div><div className="muted">{d}/09/2026</div></div>
            <button className="btn btn-g btn-sm" onClick={() => ctx.say("Lembrete criado para 1 dia antes")}>Lembrar</button>
          </div>
        )))}
      </div>
    </div>
  );
}

/* --------------------------- PRIVACIDADE E SEGURANÇA -------------------- */
function Privacy({ ctx }) {
  const { privacy, setPrivacy, say } = ctx;
  const [confirm, setConfirm] = useState(false);
  const s = (k) => (v) => setPrivacy({ ...privacy, [k]: v });
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 720 }}>
      <h2>Privacidade e segurança</h2>
      <div className="card" style={{ marginTop: 18 }}>
        <h3>Quem vê o seu perfil</h3>
        <Field label="Visibilidade do perfil">
          <ChipGroup options={["Público", "Somente recrutadores", "Privado"]} multi={false} value={privacy.visibility} onChange={s("visibility")} /></Field>
        <div className="divide">
          <Switch on={privacy.findable} onChange={s("findable")} label="Recrutadores podem me encontrar na busca" />
          <Switch on={privacy.resume} onChange={s("resume")} label="Recrutadores podem abrir meu currículo" />
          <Switch on={privacy.aiData} onChange={s("aiData")} label="Usar meus dados para melhorar as recomendações da IA" />
          <Switch on={privacy.notify} onChange={s("notify")} label="Receber notificações" />
        </div>
        <p className="muted" style={{ marginTop: 12 }}>Nenhuma informação de contato é exibida publicamente sem a sua autorização.</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Seus dados</h3>
        <div className="row" style={{ marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn btn-s btn-sm" onClick={() => say("Exportação enviada para o seu e-mail")}>Exportar meus dados</button>
          <button className="btn btn-s btn-sm" onClick={() => say("Histórico de navegação apagado")}>Apagar histórico de uso</button>
          <button className="btn btn-s btn-sm" style={{ color: "var(--bad)", borderColor: "var(--bad)" }} onClick={() => setConfirm(true)}>Excluir conta</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Segurança da conta</h3>
        <div className="divide">
          {[["E-mail verificado", "ana.ribeiro@email.com · confirmado"],
            ["Verificação em duas etapas", "Ative para proteger o acesso"],
            ["Sessões ativas", "2 dispositivos conectados"],
            ["Registro de acessos", "Último acesso hoje, 09:14, São Paulo"]].map(([t, d]) => (
            <div key={t} className="between" style={{ padding: "12px 0" }}>
              <div><div style={{ fontSize: 14 }}>{t}</div><div className="muted">{d}</div></div>
              <button className="btn btn-g btn-sm" onClick={() => say("Abrindo configuração de segurança")}>Gerenciar</button>
            </div>
          ))}
        </div>
      </div>

      {confirm && (
        <div className="sheet" onClick={() => setConfirm(false)}>
          <div className="card" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <h3>Excluir sua conta</h3>
            <p style={{ marginTop: 8 }}>Isso apaga perfil, currículos, candidaturas e alertas. A ação não pode ser desfeita.</p>
            <div className="row" style={{ marginTop: 18, justifyContent: "flex-end" }}>
              <button className="btn btn-g" onClick={() => setConfirm(false)}>Manter conta</button>
              <button className="btn btn-p" style={{ background: "var(--bad)" }} onClick={() => { setConfirm(false); say("Solicitação registrada — você tem 14 dias para cancelar"); }}>Excluir definitivamente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ------------------------ PROCURO TRABALHADORES ------------------------- */
const SUGESTOES_PESSOA = ["Passeador(a) de cachorro", "Diarista / faxina", "Babá", "Cuidador(a) de idosos", "Jardineiro(a)", "Pintor(a)", "Ajudante de mudança", "Cozinheira(o) em casa", "Montador de móveis", "Pedreiro para pequena obra"];
const SUGESTOES_EMPRESA = ["Atendente", "Operador(a) de caixa", "Repositor(a)", "Garçom / Garçonete", "Auxiliar de limpeza", "Motorista entregador", "Estoquista", "Porteiro(a)", "Vendedor(a)", "Auxiliar de cozinha"];
const HABILIDADES = ["Atendimento ao cliente", "Vendas", "Organização", "Trabalho em equipe", "Agilidade", "Responsabilidade", "Paciência", "Esforço físico", "Preparo de alimentos", "Higiene e manipulação de alimentos", "Cuidados básicos de saúde", "Controle de estoque", "Informática básica", "Pequenos reparos", "CNH A", "CNH B", "Experiência com animais"];

function HirePost({ ctx }) {
  const [tipo, setTipo] = useState("Pessoa");
  const [f, setF] = useState({
    nome: "", setor: "", titulo: "", desc: "", cidade: "São Paulo", model: "Presencial",
    contract: "Diária", unit: "/dia", sMin: 120, sMax: 150, exige: "Não", edu: "Não exijo",
    skills: [], contato: "", freq: "Uma vez por semana", horarios: [],
  });
  const set = (k, v) => setF({ ...f, [k]: v });
  const [erro, setErro] = useState("");
  const sugestoes = tipo === "Pessoa" ? SUGESTOES_PESSOA : SUGESTOES_EMPRESA;

  const temAcesso = AO_VIVO && !!CHAVES.get("empresa");
  const [enviando, setEnviando] = useState(false);
  const [senha, setSenha] = useState("");
  const publicar = async () => {
    if ((!temAcesso && (!f.nome.trim() || !f.contato.trim())) || !f.titulo.trim()) {
      setErro("Preencha seu nome, o que você precisa e um contato.");
      return;
    }
    if (+f.sMax < +f.sMin) { setErro("O valor máximo não pode ser menor que o mínimo."); return; }
    if (AO_VIVO && !temAcesso && !/^\d{6}$/.test(senha)) { setErro("Crie uma senha de 6 números. Você vai usar para entrar de outro aparelho."); return; }
    const area = detectAreas(`${f.titulo} ${f.desc}`)[0] || (tipo === "Pessoa" ? "Serviços" : "Atendimento");
    const habilidades = f.skills.length ? f.skills : [...new Set([...detectSkills(`${f.titulo} ${f.desc}`), "Responsabilidade"])];
    if (AO_VIVO) {
      setErro(""); setEnviando(true);
      try {
        const out = await api("publicar", {
          token: CHAVES.get("empresa") || undefined, senha: temAcesso ? undefined : senha,
          contratante: { tipo, nome: f.nome, setor: f.setor, contato: f.contato, cidade: f.cidade },
          vaga: { titulo: f.titulo, descricao: (f.desc.trim() || `Preciso de ${f.titulo.toLowerCase()} em ${f.cidade}.`) + (tipo === "Pessoa" ? ` Frequência: ${f.freq.toLowerCase()}.` : ""),
            cidade: f.cidade, modelo: f.model, contrato: f.contract, salario_min: +f.sMin || null, salario_max: +f.sMax || null, unidade: f.unit,
            escolaridade: f.edu === "Não exijo" ? "Não estudei" : f.edu, exige_experiencia: f.exige === "Sim", area, habilidades, horarios: f.horarios,
            beneficios: tipo === "Pessoa" ? ["Pagamento no dia"] : [] },
        });
        if (out.token) CHAVES.set("empresa", out.token);
        ctx.setRole("Contratante");
        ctx.say(out.revisao ? "Recebemos a vaga. Ela vai passar por uma revisão antes de ir ao ar." : "Vaga publicada! Ela já aparece para quem procura trabalho.");
        ctx.go("recruiter");
      } catch (e) { setErro(e.message); }
      finally { setEnviando(false); }
      return;
    }
    const cid = "x" + Date.now();
    COMPANIES.unshift({
      id: cid, name: f.nome.trim(),
      sector: tipo === "Pessoa" ? "Contratante particular" : (f.setor.trim() || "Empresa"),
      size: tipo === "Pessoa" ? "—" : "1–200", city: f.cidade, verified: false,
      culture: tipo === "Pessoa" ? ["Trabalho independente", "Flexibilidade"] : ["Empresa pequena", "Trabalho colaborativo"],
    });
    const jid = "v" + Date.now();
    JOBS.unshift({
      id: jid, title: f.titulo.trim(), companyId: cid, area,
      city: f.cidade, state: "—", model: f.model, contract: f.contract,
      sMin: +f.sMin, sMax: +f.sMax, unit: f.unit, seniority: "Júnior",
      years: f.exige === "Sim" ? 1 : 0, edu: f.edu === "Não exijo" ? "Não estudei" : f.edu,
      langs: [], posted: 0, skills: habilidades, horarios: f.horarios,
      benefits: tipo === "Pessoa" ? ["Pagamento no dia"] : ["Vale transporte"],
      desc: (f.desc.trim() || `Preciso de ${f.titulo.toLowerCase()} em ${f.cidade}.`) + (tipo === "Pessoa" ? ` Frequência: ${f.freq.toLowerCase()}. Contato: ${f.contato}.` : ` Contato: ${f.contato}.`),
      particular: tipo === "Pessoa",
    });
    ctx.setMyJobs([jid, ...ctx.myJobs]);
    ctx.bumpJobs();
    ctx.setRole("Contratante");
    if (DEMO) ctx.setLogged(true);
    ctx.say(DEMO ? "Vaga publicada! Já aparece para os candidatos." : "Vaga salva só neste aparelho: o banco de dados ainda não foi ligado.");
    ctx.go("recruiter");
  };

  return (
    <div className="wrap" style={{ padding: "36px 24px 80px", maxWidth: 720 }}>
      <h2>Procuro trabalhadores</h2>
      <p style={{ marginTop: 8 }}>
        Vale para empresa e também para quem precisa de ajuda em casa: um passeador para o cachorro,
        alguém para a faxina, uma babá, um jardineiro. Publicar é grátis.
      </p>

      {temAcesso ? (
        <div className="note" style={{ marginTop: 22 }}>Você já tem uma área de quem contrata neste aparelho. A vaga nova entra junto com as outras.
          {" "}<a href="#" onClick={(e) => { e.preventDefault(); ctx.go("recruiter"); }}>Ver minha área</a></div>
      ) : (
      <div className="card" style={{ marginTop: 22 }}>
        <Field label="Quem está contratando">
          <ChipGroup multi={false} value={tipo} onChange={(v) => { setTipo(v); set("contract", v === "Pessoa" ? "Diária" : "CLT"); }}
            options={["Pessoa", "Empresa"]} />
        </Field>
        <Field label={tipo === "Pessoa" ? "Seu nome" : "Nome da empresa"}>
          <input className="input" value={f.nome} onChange={(e) => set("nome", e.target.value)} placeholder={tipo === "Pessoa" ? "Ex.: Maria Souza" : "Ex.: Mercadinho do Zé"} />
        </Field>
        {tipo === "Empresa" && (
          <Field label="Ramo da empresa"><input className="input" value={f.setor} onChange={(e) => set("setor", e.target.value)} placeholder="Ex.: Mercado, lanchonete, loja" /></Field>
        )}
        <Field label="Seu telefone com WhatsApp ou e-mail" hint={AO_VIVO ? "Não aparece na vaga. Os candidatos enviam o currículo pelo site e você vê tudo na sua área." : "Telefone com WhatsApp ou e-mail."}>
          <input className="input" value={f.contato} onChange={(e) => set("contato", e.target.value)} placeholder="(11) 90000-0000" />
        </Field>
        {AO_VIVO && <CampoSenha id="h-senha" valor={senha} onChange={setSenha} rotulo="Crie uma senha de 6 números" dica="Com o seu contato e esta senha, você entra na sua área de qualquer celular ou computador." />}
        {AO_VIVO && <p className="small" style={{ marginTop: -4 }}>Já publicou antes? <a href="#" onClick={(e) => { e.preventDefault(); ctx.setRole("Contratante"); ctx.go("entrar"); }}>Entre na sua conta</a>.</p>}
      </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 14 }}>Do que você precisa</h3>
        <Field label="Função ou serviço">
          <input className="input" value={f.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Escreva ou escolha abaixo" />
        </Field>
        <div className="chips" style={{ marginBottom: 16 }}>
          {sugestoes.map((x) => <button key={x} className="chip" data-on={f.titulo === x ? "1" : "0"} onClick={() => set("titulo", x)}>{x}</button>)}
        </div>
        <Field label="Explique com suas palavras">
          <textarea className="ta" value={f.desc} onChange={(e) => set("desc", e.target.value)}
            placeholder={tipo === "Pessoa" ? "Ex.: Preciso de alguém para passear com meu cachorro de porte médio, de manhã, perto do metrô." : "Ex.: Atendimento no balcão, das 8h às 16h, escala 6x1."} />
        </Field>
        {tipo === "Pessoa" && (
          <Field label="Com que frequência">
            <ChipGroup multi={false} value={f.freq} onChange={(v) => set("freq", v)}
              options={["Uma vez", "Uma vez por semana", "Duas a três vezes por semana", "Todos os dias"]} />
          </Field>
        )}
        <div className="grid2">
          <Field label="Cidade"><input className="input" value={f.cidade} onChange={(e) => set("cidade", e.target.value)} /></Field>
          <Field label="Onde é o trabalho">
            <select className="select" value={f.model} onChange={(e) => set("model", e.target.value)}>
              {["Presencial", "Híbrido", "Remoto"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Horário e escala" hint="Marque todos que valem. Ajuda a achar quem pode trabalhar nesse horário.">
          <ChipGroup options={HORARIOS} value={f.horarios} onChange={(v) => set("horarios", v)} />
        </Field>
        <Field label="Tipo de contratação">
          <ChipGroup multi={false} value={f.contract} onChange={(v) => set("contract", v)}
            options={tipo === "Pessoa" ? ["Diária", "Por hora", "Freelancer", "Temporário"] : ["CLT", "Temporário", "Aprendiz", "Freelancer", "Diária"]} />
        </Field>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 14 }}>Quanto você paga</h3>
        <Field label="Forma de pagamento">
          <ChipGroup multi={false} value={f.unit} onChange={(v) => set("unit", v)} options={["/hora", "/dia", "/mês"]} />
        </Field>
        <div className="grid2">
          <Field label="De (R$)"><input className="input" type="number" value={f.sMin} onChange={(e) => set("sMin", e.target.value)} /></Field>
          <Field label="Até (R$)"><input className="input" type="number" value={f.sMax} onChange={(e) => set("sMax", e.target.value)} /></Field>
        </div>
        <p className="muted">Vagas com valor informado recebem bem mais candidatos do que as que escrevem "a combinar".</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 14 }}>O que você exige</h3>
        <Field label="Precisa ter experiência?" hint="Dizer que não precisa amplia muito o número de candidatos.">
          <ChipGroup multi={false} value={f.exige} onChange={(v) => set("exige", v)} options={["Não", "Sim"]} />
        </Field>
        <Field label="Escolaridade mínima">
          <select className="select" value={f.edu} onChange={(e) => set("edu", e.target.value)}>
            {["Não exijo", "Fundamental", "Médio", "Técnico", "Graduação"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="O que a pessoa precisa saber fazer">
          <ChipGroup value={f.skills} onChange={(v) => set("skills", v)} options={HABILIDADES} />
        </Field>
      </div>

      {erro && <div className="note" style={{ marginTop: 16, borderColor: "var(--bad)", color: "var(--bad)" }}>{erro}</div>}

      <div className="between" style={{ marginTop: 22 }}>
        <button className="btn btn-g" onClick={() => ctx.go("landing")}>Voltar</button>
        <button className="btn btn-p" onClick={publicar} disabled={enviando}>{enviando ? "Publicando…" : "Publicar e ver candidatos"}</button>
      </div>
      <p className="muted" style={{ marginTop: 14 }}>
        Ao publicar você concorda em tratar os candidatos com respeito e em não cobrar nenhum valor deles.
        Vagas que pedem dinheiro são removidas.
      </p>
    </div>
  );
}

/* ------------------------------ CONTRATANTE ----------------------------- */
/* Candidatos de demonstração: cada um com o currículo completo, no mesmo formato do cadastro */
const mk = (o) => ({ country: "Brasil", tz: "GMT-3 (Brasília)", languages: [{ name: "Português", level: "Nativo" }], certifications: [], portfolio: [], ...o });
const CANDIDATES = [
  { id: "u1", fit: 0.95, perfil: mk({ name: "Ana Ribeiro", city: "São Paulo", uf: "SP", bairro: "Itaquera", nascimento: "2003-05-14", phone: "(11) 98888-0000", email: "ana.ribeiro@email.com",
      sobre: "Trabalho com atendimento desde 2024. Gosto de lidar com gente, aprendo rápido o sistema da loja e não tenho problema com escala de fim de semana.",
      cnh: "Não tenho", inicio: "Imediatamente", horarios: ["Manhã", "Tarde", "Fim de semana"], documentos: ["RG", "CPF", "Carteira de Trabalho Digital", "Comprovante de residência", "PIS/NIS"],
      experiences: [{ title: "Atendente de loja", company: "Center Modas", cidade: "São Paulo", start: "2024", end: "Atual", vinculo: "Carteira assinada", skills: ["Atendimento ao cliente", "Vendas"], results: "Atendimento aos clientes. Organização das araras. Apoio no caixa em horários de movimento." },
        { title: "Ajudante na feira", company: "Banca da família", cidade: "São Paulo", start: "2020", end: "2023", vinculo: "Sem carteira", skills: ["Atendimento ao cliente"], results: "Montagem da banca, atendimento e troco aos sábados." }],
      education: [{ level: "Médio", course: "Ensino médio", school: "EE Prof. Silva", status: "Concluído", end: "2021", mode: "Presencial" }],
      cursos: [{ nome: "Atendimento ao cliente", inst: "Senac", horas: "40", ano: "2023" }, { nome: "Informática básica", inst: "CRAS Itaquera", horas: "20", ano: "2022" }],
      skills: ["Atendimento ao cliente", "Vendas", "Organização", "Trabalho em equipe"], referencias: [{ nome: "Marcos Lima", relacao: "Gerente na Center Modas", tel: "(11) 97000-1234" }], years: 2 }),
    prefs: { mainRole: "Atendente de loja", models: ["Presencial"], contracts: ["CLT", "Temporário"] } },
  { id: "u2", fit: 0.82, perfil: mk({ name: "Bruno Salles", city: "Guarulhos", uf: "SP", bairro: "Cumbica", nascimento: "1996-09-02", phone: "(11) 97777-1122", email: "bruno.salles@email.com",
      sobre: "Três anos carregando e conferindo mercadoria em galpão. Nunca faltei sem avisar e topo turno da noite.",
      cnh: "B", inicio: "Imediatamente", horarios: ["Manhã", "Noite", "Madrugada", "Escala 12x36"], mudanca: true, documentos: ["RG", "CPF", "Carteira de Trabalho Digital", "Certificado de reservista", "Título de eleitor"],
      experiences: [{ title: "Ajudante de carga e descarga", company: "Transportes Rota Sul", cidade: "Guarulhos", start: "2022", end: "2025", vinculo: "Carteira assinada", skills: ["Esforço físico", "Controle de estoque"], results: "Carga e descarga de caminhões. Conferência das notas. Organização do estoque no galpão." },
        { title: "Servente de obra", company: "Construtora Alvorada", cidade: "São Paulo", start: "2021", end: "2022", vinculo: "Temporário", skills: ["Esforço físico", "Segurança do trabalho"], results: "Apoio às equipes e limpeza do canteiro de obras." }],
      education: [{ level: "Fundamental", course: "Ensino fundamental", school: "EMEF Jardim Cumbica", status: "Concluído", end: "2011" }],
      cursos: [{ nome: "NR-11 — operação de empilhadeira", inst: "Senai", horas: "16", ano: "2025" }],
      skills: ["Esforço físico", "Organização", "Responsabilidade", "Controle de estoque", "CNH B"], referencias: [{ nome: "Carla Duarte", relacao: "Encarregada na Rota Sul", tel: "(11) 96000-4455" }], years: 4 }),
    prefs: { mainRole: "Ajudante de carga", models: ["Presencial"], contracts: ["CLT"] } },
  { id: "u3", fit: 0.7, perfil: mk({ name: "Carla Menezes", city: "São Paulo", uf: "SP", bairro: "Capão Redondo", nascimento: "2008-02-20", phone: "(11) 96666-3344", email: "carla.menezes@email.com",
      sobre: "Estou no último ano da escola e procuro o primeiro emprego. Ajudo minha mãe na banca da feira aos sábados e sou muito organizada.",
      cnh: "Não tenho", inicio: "Imediatamente", horarios: ["Tarde", "Noite", "Fim de semana"], documentos: ["RG", "CPF"],
      experiences: [], education: [{ level: "Médio", course: "Ensino médio", school: "EE Capão Redondo", status: "Cursando", end: "2026" }],
      cursos: [{ nome: "Informática básica", inst: "CRAS Capão Redondo", horas: "30", ano: "2025" }],
      skills: ["Trabalho em equipe", "Responsabilidade", "Organização", "Informática básica"], referencias: [{ nome: "Prof.ª Lúcia Alves", relacao: "Professora de matemática", tel: "" }], years: 0 }),
    prefs: { mainRole: "Jovem aprendiz", models: ["Presencial", "Híbrido"], contracts: ["Aprendiz", "Estágio"] } },
  { id: "u4", fit: 0.88, perfil: mk({ name: "Diego Lopes", city: "São Paulo", uf: "SP", bairro: "Penha", nascimento: "1994-11-11", phone: "(11) 95555-7788", email: "diego.lopes@email.com",
      sobre: "Quatro anos na chapa em lanchonete de movimento. Aguento pico de pedido sem perder o padrão e cuido da limpeza da praça.",
      cnh: "A", inicio: "Em 15 dias", horarios: ["Tarde", "Noite", "Escala 6x1"], documentos: ["RG", "CPF", "Carteira de Trabalho Digital", "Comprovante de residência"],
      experiences: [{ title: "Chapeiro", company: "Lanchonete do Val", cidade: "São Paulo", start: "2021", end: "Atual", vinculo: "Carteira assinada", skills: ["Preparo de alimentos", "Agilidade"], results: "Preparo de lanches na chapa. Controle do ponto da carne. Organização da praça no fim do turno." },
        { title: "Auxiliar de cozinha", company: "Restaurante Sabor Mineiro", cidade: "São Paulo", start: "2020", end: "2021", vinculo: "Carteira assinada", skills: ["Higiene e manipulação de alimentos"], results: "Pré-preparo dos alimentos e higienização da cozinha." }],
      education: [{ level: "Fundamental", course: "Ensino fundamental", school: "EMEF Penha", status: "Concluído", end: "2009" }, { level: "Médio incompleto", course: "Ensino médio (EJA)", school: "CIEJA Penha", status: "Cursando", end: "2027", mode: "Presencial" }],
      cursos: [{ nome: "Boas práticas de manipulação de alimentos", inst: "Senai", horas: "20", ano: "2022" }],
      skills: ["Preparo de alimentos", "Agilidade", "Trabalho em equipe", "Higiene e manipulação de alimentos", "CNH A"], referencias: [{ nome: "Valdir Santos", relacao: "Dono da Lanchonete do Val", tel: "(11) 94000-8899" }], years: 5 }),
    prefs: { mainRole: "Chapeiro", models: ["Presencial"], contracts: ["CLT"] } },
  { id: "u5", fit: 0.9, perfil: mk({ name: "Elisa Faria", city: "São Paulo", uf: "SP", bairro: "Santana", nascimento: "1987-07-30", phone: "(11) 94444-9900", email: "elisa.faria@email.com",
      sobre: "Cuidei de dois idosos, um deles acamado. Tenho curso de cuidadora, primeiros socorros e referências das famílias.",
      cnh: "B", inicio: "Imediatamente", horarios: ["Manhã", "Tarde"], documentos: ["RG", "CPF", "Carteira de Trabalho Digital", "Comprovante de residência", "Título de eleitor"],
      experiences: [{ title: "Cuidadora de idosos", company: "Família particular", cidade: "São Paulo", start: "2023", end: "2025", vinculo: "Carteira assinada", skills: ["Cuidados básicos de saúde", "Paciência"], results: "Administração dos remédios nos horários. Higiene e banho. Acompanhamento em consultas e companhia durante o dia." },
        { title: "Diarista", company: "Clientes particulares", cidade: "São Paulo", start: "2018", end: "2023", vinculo: "Por conta própria", skills: ["Organização"], results: "Limpeza e organização de residências duas vezes por semana." }],
      education: [{ level: "Médio", course: "Ensino médio", school: "EE Santana", status: "Concluído", end: "2005" }],
      cursos: [{ nome: "Cuidador de idosos", inst: "Instituto Cuidar", horas: "160", ano: "2022" }, { nome: "Primeiros socorros", inst: "Cruz Vermelha", horas: "8", ano: "2023" }],
      skills: ["Paciência", "Cuidados básicos de saúde", "Responsabilidade", "Organização", "CNH B"], referencias: [{ nome: "Regina Prado", relacao: "Filha do idoso atendido", tel: "(11) 93000-1100" }], years: 7 }),
    prefs: { mainRole: "Cuidadora de idosos", models: ["Presencial"], contracts: ["CLT", "Diária"] } },
  { id: "u6", fit: 0.86, perfil: mk({ name: "Fábio Nunes", city: "São Paulo", uf: "SP", bairro: "Vila Maria", nascimento: "1981-03-08", phone: "(11) 93333-2211", email: "fabio.nunes@email.com",
      sobre: "Cuido de jardim de condomínio há cinco anos. Faço poda, grama, adubação e pequenos reparos.",
      cnh: "Não tenho", inicio: "Em 30 dias", horarios: ["Manhã", "Tarde"], documentos: ["RG", "CPF", "Carteira de Trabalho Digital"],
      experiences: [{ title: "Jardineiro", company: "Zeladoria Predial SP", cidade: "São Paulo", start: "2020", end: "Atual", vinculo: "Carteira assinada", skills: ["Esforço físico", "Pequenos reparos"], results: "Manutenção dos jardins de três condomínios. Poda, corte de grama e adubação. Apoio à zeladoria em pequenos reparos." }],
      education: [{ level: "Fundamental incompleto", course: "Ensino fundamental", school: "Escola rural de Itambé (BA)", status: "Incompleto", end: "" }],
      cursos: [], skills: ["Esforço físico", "Responsabilidade", "Pequenos reparos"], referencias: [], years: 5 }),
    prefs: { mainRole: "Jardineiro", models: ["Presencial"], contracts: ["CLT", "Diária"] } },
].map((c) => ({ ...c, name: c.perfil.name, role: c.prefs.mainRole, city: c.perfil.city, bairro: c.perfil.bairro, skills: c.perfil.skills,
  idade: idadeDe(c.perfil.nascimento), exp: c.perfil.years ? `${c.perfil.years} ${c.perfil.years === 1 ? "ano" : "anos"}` : "Sem experiência" }));

function CandidateCV({ cand, job, score, onClose, onInvite, say }) {
  const [contato, setContato] = useState(false);
  const cv = cvFromProfile(cand.perfil, cand.prefs);
  const bate = job ? cand.skills.filter((x) => job.skills.map(norm).includes(norm(x))) : [];
  return (
    <div className="sheet" onClick={onClose} style={{ alignItems: "flex-start", overflowY: "auto" }}>
      <div style={{ maxWidth: 900, width: "100%", margin: "20px 0" }} onClick={(e) => e.stopPropagation()}>
        <div className="card between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10, position: "sticky", top: 0, zIndex: 2 }}>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <span className="badge b-wine">Combina {score}%</span>
            {job && <span className="small">para {job.title} · tem {bate.length} de {job.skills.length} pontos pedidos</span>}
          </div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn btn-p btn-sm" onClick={() => { onInvite(); onClose(); }}>Chamar para conversar</button>
            <button className="btn btn-s btn-sm" onClick={() => { try { window.print(); } catch (e) { say("Use o menu do navegador para imprimir"); } }}>PDF</button>
            <button className="btn btn-g btn-sm" onClick={onClose} aria-label="Fechar">Fechar ×</button>
          </div>
        </div>
        <Curriculo cv={cv} destaque={job ? job.skills : []} contatoOculto={!contato}
          onRevelar={() => { setContato(true); say("Contato liberado. O candidato foi avisado."); }} />
      </div>
    </div>
  );
}

/* Mesma lógica do lado do candidato, vista pelo contratante: tipo de trabalho pesa mais */
function scoreCandidate(cand, job) {
  if (!job) return Math.round(cand.fit * 100);
  const papeis = [cand.role, ...cand.perfil.experiences.map((e) => e.title)];
  const cargo = Math.max(0, ...papeis.map((r) => titleFit(r, job.title)));
  const area = detectAreas(papeis.join(" ") + " " + cand.skills.join(" ")).includes(job.area);
  const tipo = Math.max(cargo, area ? 0.75 : 0.15);
  const need = job.skills.map(norm);
  const hab = need.length ? cand.skills.filter((s) => need.includes(norm(s))).length / need.length : 0.5;
  const local = norm(cand.city) === norm(job.city) || job.model === "Remoto" ? 1 : cand.perfil.mudanca ? 0.6 : 0.3;
  const exp = job.years === 0 ? 1 : cand.perfil.years >= job.years ? 1 : cand.perfil.years ? 0.6 : 0.2;
  return Math.max(15, Math.min(98, Math.round(tipo * 42 + hab * 28 + local * 18 + exp * 12)));
}

/* ===================== CONTA, AVALIAÇÕES, AVISOS, ÁUDIO, INSTALAR ===================== */

/* ---- estrelas ---- */
const fmtNota = (n) => String(n).replace(".", ",");
const Estrelas = ({ r, pequeno }) => r && r.total ? (
  <span className="row" style={{ gap: 4, fontSize: pequeno ? 12.5 : 13.5, color: "var(--ink-2)", whiteSpace: "nowrap" }} title={`${fmtNota(r.media)} de 5, ${r.total} avaliação(ões)`}>
    <span style={{ color: "#C98A00", fontSize: pequeno ? 13 : 15 }}>★</span><b style={{ color: "var(--ink)" }}>{fmtNota(r.media)}</b><span className="muted">({r.total})</span>
  </span>
) : null;
function EscolherNota({ valor, onChange }) {
  const nomes = ["", "Muito ruim", "Ruim", "Regular", "Bom", "Ótimo"];
  return (
    <div>
      <div className="row" style={{ gap: 6 }} role="radiogroup" aria-label="Nota">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={valor === n} aria-label={`${n} estrela${n > 1 ? "s" : ""}`} onClick={() => onChange(n)}
            style={{ fontSize: 34, lineHeight: 1, background: "none", border: 0, cursor: "pointer", padding: 2, color: n <= valor ? "#C98A00" : "var(--line)" }}>★</button>
        ))}
      </div>
      <div className="small" style={{ marginTop: 4, minHeight: 18 }}>{nomes[valor] || "Toque nas estrelas"}</div>
    </div>
  );
}
function JanelaAvaliar({ titulo, sub, dica, onEnviar, fechar }) {
  const [nota, setNota] = useState(0);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const enviar = async () => {
    if (!nota) return setErro("Escolha de 1 a 5 estrelas.");
    setEnviando(true); setErro("");
    try { await onEnviar(nota, texto.trim()); fechar(); } catch (e) { setErro(e.message); setEnviando(false); }
  };
  return (
    <div className="sheet" onClick={fechar} style={{ alignItems: "center" }}>
      <div className="card" style={{ maxWidth: 480, width: "100%" }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={titulo}>
        <h3>{titulo}</h3>
        {sub && <p className="small" style={{ marginTop: 6 }}>{sub}</p>}
        <div style={{ margin: "16px 0" }}><EscolherNota valor={nota} onChange={setNota} /></div>
        <textarea className="ta" maxLength={400} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={dica} style={{ minHeight: 90 }} />
        <div style={{ marginTop: 8 }}><BotaoFalar onTexto={(t) => setTexto((x) => (x + " " + t).trim().slice(0, 400))} rotulo="Falar o comentário" /></div>
        {erro && <div className="small" style={{ color: "var(--bad)", marginTop: 10 }}>{erro}</div>}
        <div className="row" style={{ marginTop: 16, justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-g" onClick={fechar}>Agora não</button>
          <button className="btn btn-p" disabled={enviando} onClick={enviar}>{enviando ? "Enviando…" : "Enviar avaliação"}</button>
        </div>
      </div>
    </div>
  );
}
function AvaliacoesDaEmpresa({ id }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    if (!AO_VIVO || !/^[0-9a-f-]{36}$/i.test(id)) return;
    let vivo = true;
    api(`avaliacoes&empresa=${id}`).then((x) => vivo && setD(x)).catch(() => vivo && setD({ resumo: null, itens: [] }));
    return () => { vivo = false; };
  }, [id]);
  if (!AO_VIVO) return null;
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontSize: 16 }}>Avaliações de quem trabalhou aqui</h3>
        {d?.resumo && <Estrelas r={d.resumo} />}
      </div>
      <p className="muted" style={{ marginTop: 4 }}>Só quem foi contratado pelo Matchly pode avaliar. Assim as notas são de verdade.</p>
      {!d ? <div className="skel" style={{ height: 60, marginTop: 12 }} /> : d.itens.length === 0 ? (
        <p className="small" style={{ marginTop: 12 }}>Ainda não há avaliações. Elas aparecem aqui depois das primeiras contratações.</p>
      ) : (
        <div className="col divide" style={{ marginTop: 10 }}>
          {d.itens.map((a, i) => (
            <div key={i} style={{ padding: "12px 0" }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: "#C98A00", letterSpacing: 1 }}>{"★".repeat(a.nota)}<span style={{ color: "var(--line)" }}>{"★".repeat(5 - a.nota)}</span></span>
                <span className="muted">{a.vaga ? `Trabalhou como ${a.vaga.toLowerCase()} · ` : ""}{quandoFoi(a.criada_em)}</span>
              </div>
              {a.comentario && <p className="small" style={{ marginTop: 6, color: "var(--ink)" }}>{a.comentario}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- falar em vez de escrever (reconhecimento de voz do próprio navegador, grátis) ---- */
const Reconhecedor = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
function BotaoFalar({ onTexto, rotulo = "Falar em vez de escrever" }) {
  const [ouvindo, setOuvindo] = useState(false);
  const [aviso, setAviso] = useState("");
  const rec = useRef(null);
  useEffect(() => () => { try { rec.current?.stop(); } catch (e) { /* já parou */ } }, []);
  if (!Reconhecedor) return null;
  const iniciar = () => {
    try {
      const r = new Reconhecedor();
      r.lang = "pt-BR"; r.continuous = true; r.interimResults = false;
      r.onresult = (e) => { let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript; if (t.trim()) onTexto(t.trim()); };
      r.onerror = (e) => { setOuvindo(false); setAviso(e.error === "not-allowed" ? "Libere o microfone para o Matchly nas configurações do navegador." : e.error === "no-speech" ? "Não ouvi nada. Tente de novo, perto do celular." : ""); };
      r.onend = () => setOuvindo(false);
      rec.current = r; r.start(); setOuvindo(true); setAviso("");
    } catch (e) { setAviso("Não deu para usar o microfone aqui."); }
  };
  const parar = () => { try { rec.current?.stop(); } catch (e) { /* já parou */ } setOuvindo(false); };
  return (
    <span className="row" style={{ gap: 8, flexWrap: "wrap" }}>
      <button type="button" className={"btn btn-sm " + (ouvindo ? "btn-p" : "btn-s")} onClick={ouvindo ? parar : iniciar} aria-pressed={ouvindo}>
        <Ic n="mic" s={15} /> {ouvindo ? "Gravando… toque para parar" : rotulo}
      </button>
      {ouvindo && <span className="small muted">Fale com calma. O texto aparece aqui.</span>}
      {aviso && <span className="small" style={{ color: "var(--bad)" }}>{aviso}</span>}
    </span>
  );
}

/* ---- instalar no celular e avisos (Web Push) ---- */
let PEDIDO_INSTALAR = null;
const ouvintesInstalar = new Set();
const NO_APP = typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);
const EH_IPHONE = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
const PODE_SW = typeof window !== "undefined" && ENV.PROD && "serviceWorker" in navigator && window.location.protocol === "https:";
if (PODE_SW) {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); PEDIDO_INSTALAR = e; ouvintesInstalar.forEach((f) => f()); });
  window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => {}); });
}
function BotaoInstalar({ compacto }) {
  const [, atualizar] = useState(0);
  const [ajuda, setAjuda] = useState(false);
  const [feito, setFeito] = useState(false);
  useEffect(() => { const f = () => atualizar((x) => x + 1); ouvintesInstalar.add(f); return () => ouvintesInstalar.delete(f); }, []);
  if (NO_APP || feito) return null;
  const instalar = async () => {
    if (PEDIDO_INSTALAR) { PEDIDO_INSTALAR.prompt(); const r = await PEDIDO_INSTALAR.userChoice.catch(() => ({})); if (r.outcome === "accepted") setFeito(true); PEDIDO_INSTALAR = null; return; }
    try { window.location.hash = "#instalar"; } catch (e) { setAjuda(true); }
  };
  return (
    <>
      <button className={"btn btn-s" + (compacto ? " btn-sm" : "")} onClick={instalar}><Ic n="download" s={16} /> Instalar o Matchly no celular</button>
      {ajuda && (
        <div className="sheet" onClick={() => setAjuda(false)} style={{ alignItems: "center" }}>
          <div className="card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3>Colocar o Matchly na tela do iPhone</h3>
            <ol className="small" style={{ margin: "14px 0 0", paddingLeft: 20, lineHeight: 1.9 }}>
              <li>Abra o site no <b>Safari</b>.</li>
              <li>Toque no botão <b>Compartilhar</b> (o quadrado com a seta para cima).</li>
              <li>Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.</li>
            </ol>
            <p className="small" style={{ marginTop: 12 }}>Depois, abra o Matchly pelo ícone. Assim você também recebe os avisos.</p>
            <button className="btn btn-p btn-sm" style={{ marginTop: 16 }} onClick={() => setAjuda(false)}>Entendi</button>
          </div>
        </div>
      )}
    </>
  );
}
const pushSuportado = () => PODE_SW && "PushManager" in window && "Notification" in window;
const b64ParaBytes = (s) => { const b = atob((s + "=".repeat((4 - (s.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(b, (c) => c.charCodeAt(0)); };
async function ligarAvisos(papel) {
  const token = CHAVES.get(papel);
  if (!token) throw new Error("Faça o cadastro primeiro.");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Os avisos foram bloqueados. Libere as notificações do Matchly nas configurações do navegador.");
  const reg = await navigator.serviceWorker.ready;
  const { chave } = await api("push_chave");
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ParaBytes(chave) });
  await api("inscrever", { token, papel, inscricao: sub.toJSON() });
  try { localStorage.setItem("matchly:avisos-" + papel, "1"); } catch (e) { /* segue */ }
}
function BotaoAvisos({ papel, ctx, texto }) {
  const [estado, setEstado] = useState(() => { try { return localStorage.getItem("matchly:avisos-" + papel) === "1" && Notification.permission === "granted" ? "ligado" : "desligado"; } catch (e) { return "desligado"; } });
  if (!AO_VIVO || !CHAVES.get(papel)) return null;
  if (!pushSuportado()) {
    if (EH_IPHONE && !NO_APP) return <div className="note small" style={{ marginBottom: 14 }}>No iPhone, para receber avisos, primeiro coloque o Matchly na tela de início. <BotaoInstalar compacto /></div>;
    return null;
  }
  if (estado === "ligado") return null;
  const ligar = async () => {
    setEstado("ligando");
    try { await ligarAvisos(papel); setEstado("ligado"); ctx.say("Avisos ligados neste aparelho."); }
    catch (e) { setEstado("desligado"); ctx.say(e.message); }
  };
  return (
    <div className="note row" style={{ marginBottom: 14, gap: 12, flexWrap: "wrap", justifyContent: "space-between" }}>
      <span className="row small" style={{ gap: 8 }}><Ic n="bell" s={18} />{texto}</span>
      <button className="btn btn-p btn-sm" disabled={estado === "ligando"} onClick={ligar}>{estado === "ligando" ? "Ligando…" : "Ligar avisos"}</button>
    </div>
  );
}

/* ---- tutorial: colocar o Matchly na tela de início ---- */
const EH_ANDROID = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
function Passo({ n, titulo, children }) {
  return (
    <div className="row" style={{ gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ flex: "none", width: 32, height: 32, borderRadius: 99, background: "var(--wine)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{n}</span>
      <div><b style={{ fontSize: 15 }}>{titulo}</b><div className="small" style={{ marginTop: 4 }}>{children}</div></div>
    </div>
  );
}
const Tecla = ({ children }) => <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 8px", border: "1px solid var(--line)", borderRadius: 6, background: "var(--surface-2)", fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>{children}</span>;
function Instalar({ ctx }) {
  const [so, setSo] = useState(EH_IPHONE ? "iPhone" : "Android");
  const [, atualizar] = useState(0);
  useEffect(() => { const f = () => atualizar((x) => x + 1); ouvintesInstalar.add(f); return () => ouvintesInstalar.delete(f); }, []);
  return (
    <div className="wrap" style={{ padding: "36px 24px 70px", maxWidth: 680 }}>
      <span className="eyebrow">Aplicativo</span>
      <h2 style={{ marginTop: 10 }}>Coloque o Matchly na tela de início</h2>
      <p style={{ marginTop: 8 }}>Fica com um ícone igual aos outros aplicativos, abre mais rápido e recebe os avisos de vagas. Não precisa baixar nada da loja e não ocupa espaço.</p>
      {NO_APP && <div className="note" style={{ marginTop: 16 }}><Ic n="checkCircle" s={16} /> Você já está usando o Matchly como aplicativo. Tudo certo!</div>}
      {!NO_APP && PEDIDO_INSTALAR && (
        <div className="card" style={{ marginTop: 18, borderColor: "var(--wine)" }}>
          <b>O seu celular permite instalar com um toque.</b>
          <div style={{ marginTop: 12 }}><BotaoInstalar /></div>
        </div>
      )}
      <div className="chips" style={{ marginTop: 22 }} role="tablist">
        {["Android", "iPhone"].map((x) => <button key={x} role="tab" aria-selected={so === x} className="chip" data-on={so === x ? "1" : "0"} onClick={() => setSo(x)}>{x === "Android" ? "Android (Samsung, Motorola, Xiaomi...)" : "iPhone"}</button>)}
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        {so === "Android" ? (
          <>
            <Passo n={1} titulo="Abra o Matchly no Google Chrome">Entre em <b>matchly-site.vercel.app</b> pelo Chrome (o navegador com a bolinha colorida).</Passo>
            <Passo n={2} titulo="Toque nos três pontinhos">No canto de cima, à direita, toque em <Tecla>⋮</Tecla>.</Passo>
            <Passo n={3} titulo="Escolha “Adicionar à tela inicial”">Pode aparecer como <Tecla>Instalar aplicativo</Tecla> ou <Tecla>Adicionar à tela inicial</Tecla>.</Passo>
            <Passo n={4} titulo="Confirme">Toque em <Tecla>Instalar</Tecla> ou <Tecla>Adicionar</Tecla>. O ícone do Matchly aparece junto com os seus aplicativos.</Passo>
            <p className="small muted" style={{ marginTop: 12 }}>No navegador da Samsung: toque em <Tecla>☰</Tecla> embaixo e depois em <Tecla>Adicionar página a</Tecla> → <Tecla>Tela inicial</Tecla>.</p>
          </>
        ) : (
          <>
            <Passo n={1} titulo="Abra o Matchly no Safari">Entre em <b>matchly-site.vercel.app</b> pelo Safari (a bússola azul). No iPhone, só o Safari consegue fazer isso.</Passo>
            <Passo n={2} titulo="Toque no botão Compartilhar">É o quadrado com uma seta para cima <Tecla>⬆︎</Tecla>, na barra de baixo.</Passo>
            <Passo n={3} titulo="Escolha “Adicionar à Tela de Início”">Role a lista para baixo até achar <Tecla>Adicionar à Tela de Início ⊞</Tecla>.</Passo>
            <Passo n={4} titulo="Toque em Adicionar">No canto de cima, à direita. Pronto: o ícone do Matchly aparece na tela.</Passo>
            <p className="small muted" style={{ marginTop: 12 }}>Para receber os avisos no iPhone, abra o Matchly pelo ícone e toque em <b>Ligar avisos</b>. Funciona a partir do iOS 16.4.</p>
          </>
        )}
      </div>
      <div className="note" style={{ marginTop: 16 }}>
        <b style={{ color: "var(--ink)" }}>Depois de instalar:</b> abra pelo ícone e ligue os avisos em <a href="#" onClick={(e) => { e.preventDefault(); ctx.go(ctx.logged ? "alerts" : "signup"); }}>{ctx.logged ? "Avisos" : "faça seu cadastro"}</a>. Assim você fica sabendo na hora de vagas novas e das respostas das empresas.
      </div>
    </div>
  );
}

/* ---- senha de 6 números ---- */
function CampoSenha({ id, valor, onChange, rotulo = "Senha de 6 números", dica }) {
  const [ver, setVer] = useState(false);
  return (
    <Field label={rotulo} hint={dica}>
      <div className="row" style={{ gap: 8 }}>
        <input id={id} className="input" type={ver ? "text" : "password"} inputMode="numeric" autoComplete="new-password" maxLength={6}
          value={valor} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" style={{ letterSpacing: ver ? 2 : 6, maxWidth: 200 }} />
        <button type="button" className="btn btn-g btn-sm" onClick={() => setVer(!ver)}>{ver ? "Esconder" : "Mostrar"}</button>
      </div>
    </Field>
  );
}
function DefinirSenha({ papel, ctx, loginInicial = "", jaTem }) {
  const [login, setLogin] = useState(loginInicial);
  const [senha, setSenha] = useState("");
  const [ok, setOk] = useState(jaTem || "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const salvar = async () => {
    if (!/^\d{6}$/.test(senha)) return setErro("A senha precisa ter 6 números.");
    setEnviando(true); setErro("");
    try { const r = await api("definir_senha", { token: CHAVES.get(papel), papel, login, senha }); setOk(r.login); setSenha(""); ctx.say("Senha salva. Agora você entra de qualquer aparelho."); }
    catch (e) { setErro(e.message); } finally { setEnviando(false); }
  };
  return (
    <div>
      {ok && <p className="small" style={{ marginBottom: 12 }}><Ic n="checkCircle" s={15} /> Você entra de outro aparelho com <b>{ok}</b> e a sua senha. Para trocar a senha, digite uma nova abaixo.</p>}
      <Field label={papel === "empresa" ? "WhatsApp ou e-mail" : "Seu WhatsApp"}>
        <input className="input" inputMode={papel === "empresa" ? "email" : "tel"} value={login} onChange={(e) => setLogin(papel === "empresa" && /[a-z@]/i.test(e.target.value) ? e.target.value : mascaraTel(e.target.value))} placeholder="(11) 90000-0000" />
      </Field>
      <CampoSenha valor={senha} onChange={setSenha} rotulo={ok ? "Nova senha de 6 números" : "Crie uma senha de 6 números"} />
      {erro && <div className="small" style={{ color: "var(--bad)", marginBottom: 10 }}>{erro}</div>}
      <button className="btn btn-p btn-sm" disabled={enviando} onClick={salvar}>{enviando ? "Salvando…" : ok ? "Trocar senha" : "Salvar senha"}</button>
    </div>
  );
}

/* ---- entrar em outro aparelho ---- */
function Entrar({ ctx }) {
  const [papel, setPapel] = useState(ctx.role === "Contratante" ? "empresa" : "candidato");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [esqueci, setEsqueci] = useState(false);
  const entrar = async () => {
    if (!/^\d{6}$/.test(senha)) return setErro("A senha tem 6 números.");
    setEnviando(true); setErro("");
    try {
      const r = await api("entrar", { papel, login, senha });
      CHAVES.set(papel, r.token);
      if (papel === "empresa") { ctx.setRole("Contratante"); ctx.say(`Bem-vindo(a) de volta, ${String(r.nome || "").split(" ")[0]}!`); ctx.go("recruiter"); return; }
      if (r.perfil?.profile?.name) { ctx.setProfile({ ...EMPTY_PROFILE, ...r.perfil.profile }); if (r.perfil.prefs) ctx.setPrefs({ ...EMPTY_PREFS, ...r.perfil.prefs }); }
      ctx.setApps([]); ctx.setLogged(true); ctx.sincronizar?.();
      ctx.say(`Bem-vindo(a) de volta, ${String(r.nome || "").split(" ")[0]}!`); ctx.go("dash");
    } catch (e) { setErro(e.message); } finally { setEnviando(false); }
  };
  return (
    <div className="wrap" style={{ maxWidth: 520, padding: "48px 24px 80px" }}>
      <h2>Entrar</h2>
      <p style={{ marginTop: 8, marginBottom: 22 }}>Use o WhatsApp e a senha de 6 números que você criou no cadastro.</p>
      <div className="card big">
        <Field label="Você é">
          <ChipGroup multi={false} value={papel === "empresa" ? "Quem contrata" : "Quem procura trabalho"} onChange={(v) => setPapel(v === "Quem contrata" ? "empresa" : "candidato")}
            options={["Quem procura trabalho", "Quem contrata"]} />
        </Field>
        <Field label={papel === "empresa" ? "WhatsApp ou e-mail" : "Seu WhatsApp"}>
          <input id="e-login" className="input" inputMode={papel === "empresa" ? "email" : "tel"} autoComplete="username" value={login}
            onChange={(e) => setLogin(papel === "empresa" && /[a-z@]/i.test(e.target.value) ? e.target.value : mascaraTel(e.target.value))} placeholder="(11) 90000-0000" />
        </Field>
        <CampoSenha id="e-senha" valor={senha} onChange={setSenha} rotulo="Senha de 6 números" />
        {erro && <div className="note" role="alert" style={{ marginBottom: 14, borderColor: "var(--bad)", color: "var(--bad)" }}>{erro}</div>}
        <button className="btn btn-p" style={{ width: "100%", padding: "13px 0" }} disabled={enviando} onClick={entrar}>{enviando ? "Entrando…" : "Entrar"}</button>
        <div className="between" style={{ marginTop: 16, flexWrap: "wrap", gap: 8 }}>
          <button className="btn btn-g btn-sm" onClick={() => setEsqueci(!esqueci)}>Esqueci a senha</button>
          <button className="btn btn-g btn-sm" onClick={() => (papel === "empresa" ? ctx.go("hire") : ctx.comecar([]))}>Ainda não tenho cadastro</button>
        </div>
        {esqueci && (
          <div className="note small" style={{ marginTop: 12 }}>
            Se você ainda está usando o Matchly em outro aparelho, abra por lá {papel === "empresa" ? "a sua área (aba Acesso)" : "Meu perfil"} e crie uma senha nova.
            Se não tem mais acesso a nenhum aparelho, faça um cadastro novo.
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------- ÁREA DE QUEM CONTRATA (banco ligado) ------------------ */
/* As candidaturas chegam pelo servidor. A tela confere sozinha a cada 10 segundos. */
const vagaDoBanco = (v) => ({ id: v.id, title: v.titulo, city: v.cidade || "—", model: v.modelo || "Presencial", contract: v.contrato || "CLT",
  sMin: +v.salario_min || 0, sMax: +v.salario_max || +v.salario_min || 0, unit: v.unidade || "/mês", skills: v.habilidades || [], area: v.area || "",
  years: v.exige_experiencia ? 1 : 0, ativa: v.ativa, suspeita: v.suspeita, particular: v.particular, publicada: v.publicada_em,
  edu: v.escolaridade || "Não estudei", horarios: v.horarios || [], langs: [], posted: 5, state: v.uf || "—" });
const candDoCv = (cv = {}) => ({ fit: 0.5, role: cv.objetivo || cv.experiencias?.[0]?.cargo || "", city: cv.cidade || "", skills: cv.habilidades || [],
  perfil: { experiences: (cv.experiencias || []).map((e) => ({ title: e.cargo || "" })), mudanca: !!cv.mudanca, years: +cv.anos || 0 } });
function bip() {
  try {
    const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
    const a = new A(), o = a.createOscillator(), g = a.createGain();
    o.frequency.value = 880; g.gain.setValueAtTime(0.12, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.35);
    o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 0.35);
  } catch (e) { /* sem som */ }
}

/* Todas as pessoas cadastradas, com filtro por porcentagem. O contato só aparece quando a pessoa aceita o convite. */
const candDoPerfil = (p = {}) => {
  const pr = p.profile || {}, pf = p.prefs || {};
  return { fit: 0.5, role: pf.mainRole || pr.role || pr.experiences?.[0]?.title || "", city: pr.city || "", skills: pr.skills || [],
    perfil: { experiences: pr.experiences || [], mudanca: !!pr.mudanca, years: +pr.years || 0 } };
};
function EncontrarPessoas({ ctx, token, vagas, aoConvidar }) {
  const ativas = vagas.filter((v) => v.ativa && !v.suspeita);
  const [pessoas, setPessoas] = useState(null);
  const [erro, setErro] = useState("");
  const [vagaId, setVagaId] = useState(ativas[0]?.id || "");
  const [minimo, setMinimo] = useState(0);
  const [busca, setBusca] = useState("");
  const [vendo, setVendo] = useState(null);
  const [limite, setLimite] = useState(30);
  const [fp, setFp] = useState({ cabe: false, horario: false, cidade: false });
  const carregar = () => api("talentos", { token }).then((r) => { setPessoas(r.pessoas); setErro(""); }).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); const t = setInterval(carregar, 60000); return () => clearInterval(t); }, []);
  const vaga = ativas.find((v) => v.id === vagaId) || null;

  if (erro && !pessoas) return <div className="empty"><h3>Não deu para carregar</h3><p style={{ marginTop: 8 }}>{erro}</p><button className="btn btn-s btn-sm" style={{ marginTop: 14 }} onClick={carregar}>Tentar de novo</button></div>;
  if (!pessoas) return <div className="col" style={{ gap: 12 }}>{[1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 110 }} />)}</div>;

  // mesma análise que o trabalhador vê do lado dele: todos os dados do perfil contra a vaga
  const todas = pessoas.map((p) => ({ ...p, cand: candDoPerfil(p.perfil) }))
    .map((p) => {
      const m = vaga ? matchJob(vaga, { ...EMPTY_PROFILE, ...(p.perfil.profile || {}) }, { ...EMPTY_PREFS, ...(p.perfil.prefs || {}) }) : null;
      return { ...p, m, score: m ? m.score : null, ligacao: vaga ? p.ligacoes.find((l) => l.vaga_id === vaga.id) : null };
    });
  const cabe = (p) => { const pf = p.perfil.prefs || {}; const quer = (+pf.sTarget || +pf.sMin || 0) * (UNIT_MULT[pf.sUnit || "/mês"] || 1); return !quer || !vaga?.sMax || monthlyOf(vaga, vaga.sMax) >= quer; };
  const noHorario = (p) => { const hp = p.perfil.profile?.horarios || []; return !vaga?.horarios?.length || hp.includes("Qualquer horário") || vaga.horarios.some((h) => hp.includes(h)); };
  const naCidade = (p) => !vaga || vaga.model === "Remoto" || norm(p.perfil.prefs?.city || p.perfil.profile?.city || p.cidade) === norm(vaga.city);
  const lista = todas
    .filter((p) => p.score === null || p.score >= minimo)
    .filter((p) => (!fp.cabe || cabe(p)) && (!fp.horario || noHorario(p)) && (!fp.cidade || naCidade(p)))
    .filter((p) => !busca.trim() || norm(`${p.nome} ${p.cand.role} ${p.cidade} ${p.perfil.profile?.bairro || ""} ${p.cand.skills.join(" ")}`).includes(norm(busca)))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || String(b.atualizado_em).localeCompare(String(a.atualizado_em)));

  const convidar = async (p) => {
    if (!vaga) return ctx.say("Escolha a vaga para o convite.");
    try {
      await api("convidar", { token, candidatoId: p.id, vagaId: vaga.id });
      ctx.say(`Convite enviado para ${String(p.nome).split(" ")[0]}. Se aceitar, o currículo com o WhatsApp chega em Candidatos.`);
      carregar(); aoConvidar?.();
    } catch (e) { ctx.say(e.message); }
  };
  const rotulo = (l) => !l ? null : l.etapa === "Convite" ? "Convite enviado" : l.etapa === "Convite recusado" ? "Recusou o convite" : "Já se candidatou";

  return (
    <>
      <p className="small" style={{ marginBottom: 12 }}>Aqui aparecem <b>todas as pessoas cadastradas</b> no Matchly, mesmo as que ainda não se candidataram. O WhatsApp só aparece quando a pessoa aceita o seu convite.</p>
      <div className="card" style={{ marginBottom: 4 }}>
        {ativas.length > 0 ? (
          <Field label="Comparar com a vaga">
            <select className="select" value={vagaId} onChange={(e) => setVagaId(e.target.value)}>
              {ativas.map((v) => <option key={v.id} value={v.id}>{v.title} — {v.city}</option>)}
            </select>
          </Field>
        ) : <div className="note small" style={{ marginBottom: 12 }}>Publique uma vaga para ver quanto cada pessoa combina e poder convidar. <a href="#" onClick={(e) => { e.preventDefault(); ctx.go("hire"); }}>Publicar vaga</a></div>}
        <Field label="Buscar por nome, função, bairro ou habilidade">
          <input className="input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: diarista, Itaquera, cozinha" />
        </Field>
      </div>
      {vaga && <FiltroPorcentagem valor={minimo} onChange={setMinimo} total={todas.length} mostrando={lista.length} nome="pessoas" />}
      {vaga && (
        <div className="row" style={{ marginTop: 10, gap: 8, flexWrap: "wrap" }}>
          {[["cabe", "Pede até o que eu pago"], ["horario", "Pode no horário da vaga"], ["cidade", "Mora na cidade da vaga"]].map(([k, l]) => (
            <button key={k} className="chip" data-on={fp[k] ? "1" : "0"} onClick={() => setFp({ ...fp, [k]: !fp[k] })}>{l}</button>
          ))}
        </div>
      )}
      <div className="col" style={{ gap: 12, marginTop: 14 }}>
        {pessoas.length === 0 && <div className="empty"><h3>Ainda não há pessoas cadastradas</h3><p style={{ marginTop: 8 }}>Assim que alguém fizer o cadastro no Matchly, aparece aqui.</p></div>}
        {pessoas.length > 0 && lista.length === 0 && <div className="empty"><h3>Ninguém com esse filtro</h3><p style={{ marginTop: 8 }}>Baixe a porcentagem ou limpe a busca para ver mais pessoas.</p>
          <button className="btn btn-s btn-sm" style={{ marginTop: 14 }} onClick={() => { setMinimo(0); setBusca(""); }}>Mostrar todas</button></div>}
        {lista.slice(0, limite).map((p) => {
          const pr = p.perfil.profile || {};
          const idade = idadeDe(pr.nascimento);
          return (
            <div className="card card-h" key={p.id}>
              <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div className="row">
                  <div style={{ width: 40, height: 40, borderRadius: 99, background: "var(--wine-tint)", color: "var(--wine)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>{initials(p.nome)}</div>
                  <div><h3 style={{ fontSize: 15 }}>{p.nome}</h3>
                    <div className="muted">{[p.cand.role, idade ? `${idade} anos` : "", pr.bairro ? `${pr.bairro}, ${p.cidade || pr.city || ""}` : p.cidade || pr.city].filter(Boolean).join(" · ")}</div>
                    <div className="muted" style={{ marginTop: 2 }}>{p.cand.perfil.years ? `${String(p.cand.perfil.years).replace(".", ",")} ano(s) de experiência` : "Procurando o primeiro emprego"}{pr.inicio ? ` · começa ${String(pr.inicio).toLowerCase()}` : ""}</div>
                    {pr.mostrarSalario && +p.perfil.prefs?.sTarget > 0 && <div className="small" style={{ marginTop: 2, color: "var(--ink)" }}><Ic n="money" s={14} /> Quer receber {salarioTexto(p.perfil.prefs.sTarget, p.perfil.prefs.sUnit)}</div>}
                    {p.nota && <div className="row small" style={{ marginTop: 4, gap: 6 }}><Estrelas r={p.nota} pequeno /> <span className="muted">de quem já contratou</span></div>}</div>
                </div>
                <div className="row" style={{ flexWrap: "wrap" }}>
                  {p.score !== null && <span className="score">Combina {p.score}%</span>}
                  {rotulo(p.ligacao) && <span className="badge b-green">{rotulo(p.ligacao)}</span>}
                </div>
              </div>
              {p.cand.skills.length > 0 && <div className="chips" style={{ marginTop: 10 }}>{p.cand.skills.slice(0, 8).map((x) => <span key={x} className="tag">{x}</span>)}</div>}
              {p.m && <div className="row small" style={{ marginTop: 8, gap: 10, flexWrap: "wrap" }}>{Object.entries(p.m.dims).filter(([, v]) => v >= 90).slice(0, 4).map(([k]) => <span key={k} style={{ color: "var(--ok)" }}>✓ {k}</span>)}{Object.entries(p.m.dims).filter(([, v]) => v < 50).slice(0, 2).map(([k]) => <span key={k} style={{ color: "var(--warn)" }}>! {k}</span>)}</div>}
              <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
                <button className="btn btn-s btn-sm" onClick={() => setVendo(p)}>Ver currículo</button>
                {vaga && !p.ligacao && <button className="btn btn-p btn-sm" onClick={() => convidar(p)}>Convidar para a vaga</button>}
              </div>
            </div>
          );
        })}
        {lista.length > limite && <button className="btn btn-s" onClick={() => setLimite(limite + 30)}>Mostrar mais ({lista.length - limite})</button>}
      </div>
      {vendo && (
        <div className="sheet" onClick={() => setVendo(null)} style={{ alignItems: "flex-start", overflowY: "auto" }}>
          <div style={{ maxWidth: 900, width: "100%", margin: "20px 0" }} onClick={(e) => e.stopPropagation()}>
            <div className="card between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10, position: "sticky", top: 0, zIndex: 2 }}>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {vendo.score !== null && <span className="badge b-wine">Combina {vendo.score}%</span>}
                <span className="small">O WhatsApp aparece quando a pessoa aceitar o convite.</span>
              </div>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {vaga && !vendo.ligacao && <button className="btn btn-p btn-sm" onClick={() => { convidar(vendo); setVendo(null); }}>Convidar para a vaga</button>}
                <button className="btn btn-g btn-sm" onClick={() => setVendo(null)} aria-label="Fechar">Fechar ×</button>
              </div>
            </div>
            <Curriculo cv={cvFromProfile(vendo.perfil.profile || {}, vendo.perfil.prefs || {})} destaque={vaga?.skills || []} mostrarRefs={false} />
          </div>
        </div>
      )}
    </>
  );
}

function SairEmpresa({ sair }) {
  const [c, setC] = useState(false);
  return !c ? <button className="btn btn-s btn-sm" onClick={() => setC(true)}>Sair da conta</button> : (
    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
      <span className="small">Sair neste aparelho?</span>
      <button className="btn btn-p btn-sm" onClick={sair}>Sim, sair</button>
      <button className="btn btn-g btn-sm" onClick={() => setC(false)}>Cancelar</button>
    </div>
  );
}

/* Contratar em 3 passos: chamar para conversar → enviar proposta → a pessoa aceita */
function EtapasEmpresa({ c, nome, zap, abrir, mudar, avaliar }) {
  const fim = c.etapa === "Recusada" || c.etapa === "Proposta recusada";
  const atual = passoEmpresa(c.etapa);
  const texto = {
    "Candidatura enviada": `Próximo passo: veja o currículo e chame ${nome} para conversar.`,
    "Entrevista": `Conversaram e gostou? Envie a proposta de contratação. ${nome} aceita ou recusa pelo Matchly.`,
    "Proposta": `Proposta enviada. Aguardando a resposta de ${nome}.`,
    "Contratada": `${nome} aceitou a proposta. Combine os detalhes pelo WhatsApp.`,
    "Recusada": "Você não seguiu com essa pessoa.",
    "Proposta recusada": `${nome} recusou a proposta.`,
  }[c.etapa] || "";
  return (
    <div style={{ marginTop: 12 }}>
      {!fim && (
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {PASSOS_EMPRESA.map((p, i) => (
            <span key={p} className="small" style={{ padding: "3px 10px", borderRadius: 99, fontWeight: i === atual ? 600 : 400,
              background: i <= atual ? "var(--wine-tint)" : "var(--surface-2)", color: i <= atual ? "var(--wine)" : "var(--ink-3)" }}>{i + 1}. {p}</span>
          ))}
        </div>
      )}
      <p className="small" style={{ marginTop: 8, color: "var(--ink)" }}>{texto}</p>
      <div className="row" style={{ marginTop: 10, gap: 8, flexWrap: "wrap" }}>
        <button className={"btn btn-sm " + (c.etapa === "Candidatura enviada" ? "btn-s" : "btn-g")} onClick={abrir}>Ver currículo</button>
        {c.etapa === "Candidatura enviada" && (zap
          ? <a className="btn btn-p btn-sm" href={zap} target="_blank" rel="noopener noreferrer" onClick={() => mudar("Entrevista")}>Chamar para conversar no WhatsApp</a>
          : <button className="btn btn-p btn-sm" onClick={() => mudar("Entrevista")}>Chamar para conversar</button>)}
        {c.etapa === "Entrevista" && <button className="btn btn-p btn-sm" onClick={() => mudar("Proposta")}>Enviar proposta de contratação</button>}
        {(c.etapa === "Entrevista" || c.etapa === "Proposta" || c.etapa === "Contratada") && zap && <a className="btn btn-s btn-sm" href={zap} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
        {c.etapa === "Proposta" && <button className="btn btn-g btn-sm" onClick={() => mudar("Entrevista")}>Cancelar proposta</button>}
        {(c.etapa === "Candidatura enviada" || c.etapa === "Entrevista") && <button className="btn btn-g btn-sm" onClick={() => mudar("Recusada")}>Não seguir</button>}
        {c.etapa === "Contratada" && (c.minha_avaliacao
          ? <span className="small" style={{ alignSelf: "center" }}>Você avaliou: <span style={{ color: "#C98A00" }}>{"★".repeat(c.minha_avaliacao)}</span></span>
          : <button className="btn btn-s btn-sm" onClick={avaliar}><span style={{ color: "#C98A00" }}>★</span> Avaliar {nome}</button>)}
      </div>
    </div>
  );
}

function RecruiterAoVivo({ ctx }) {
  const token = CHAVES.get("empresa");
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const tab = ctx.abaEmpresa || "cands", setTab = ctx.setAbaEmpresa || (() => {});
  const [vagaSel, setVagaSel] = useState("todas");
  const [aberto, setAberto] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [avaliando, setAvaliando] = useState(null);
  const conhecidas = useRef(null);

  const carregar = async () => {
    try {
      const d = await api("painel", { token });
      const ids = new Set(d.candidaturas.map((c) => c.id));
      if (conhecidas.current) {
        const novas = d.candidaturas.filter((c) => !conhecidas.current.has(c.id));
        if (novas.length) {
          const quem = novas[0].candidatos?.nome?.split(" ")[0] || "Alguém";
          const texto = novas.length === 1 ? `Nova candidatura: ${quem}` : `${novas.length} novas candidaturas`;
          ctx.say(texto); bip();
          try { if (window.Notification?.permission === "granted" && document.hidden) new window.Notification("Matchly", { body: texto }); } catch (e) { /* segue */ }
        }
      }
      conhecidas.current = ids;
      setDados(d); setErro("");
    } catch (e) { setErro(e.message); }
  };
  useEffect(() => {
    if (!token) return;
    carregar();
    const t = setInterval(carregar, 10000);
    return () => clearInterval(t);
  }, [token]);

  const ehConvite = (c) => String(c.etapa).startsWith("Convite");
  const reais = dados ? dados.candidaturas.filter((c) => !ehConvite(c)) : [];
  const novas = reais.filter((c) => !c.vista).length;
  useEffect(() => {
    const antes = document.title;
    document.title = novas ? `(${novas}) Matchly` : "Matchly — encontre seu trabalho ideal";
    return () => { document.title = antes; };
  }, [novas]);

  if (!token) return (
    <div className="wrap" style={{ padding: "48px 24px", maxWidth: 720 }}>
      <h2>Área de quem contrata</h2>
      <div className="empty" style={{ marginTop: 20 }}>
        <h3>Você ainda não publicou vagas neste aparelho</h3>
        <p style={{ marginTop: 8 }}>Publique uma vaga e os currículos chegam aqui, na hora. Se você já publicou em outro aparelho, entre com seu WhatsApp e senha.</p>
        <div className="row" style={{ marginTop: 14, gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-p btn-sm" onClick={() => ctx.go("hire")}>Publicar vaga</button>
          <button className="btn btn-s btn-sm" onClick={() => { ctx.setRole("Contratante"); ctx.go("entrar"); }}>Entrar</button>
        </div>
      </div>
    </div>
  );
  if (!dados) return (
    <div className="wrap" style={{ padding: "48px 24px", maxWidth: 720 }}>
      {erro ? <div className="empty"><h3>Não deu para abrir sua área</h3><p style={{ marginTop: 8 }}>{erro}</p>
        <div className="row" style={{ marginTop: 14, gap: 8, justifyContent: "center" }}>
          <button className="btn btn-s btn-sm" onClick={carregar}>Tentar de novo</button>
          <button className="btn btn-p btn-sm" onClick={() => { ctx.setRole("Contratante"); ctx.go("entrar"); }}>Entrar com WhatsApp e senha</button>
        </div></div>
        : <div className="col" style={{ gap: 14 }}>{[1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 110 }} />)}</div>}
    </div>
  );

  const vagas = dados.vagas.map(vagaDoBanco);
  const porVaga = Object.fromEntries(vagas.map((v) => [v.id, v]));
  const cands = reais.filter((c) => vagaSel === "todas" || c.vaga_id === vagaSel)
    .map((c) => ({ ...c, vaga: porVaga[c.vaga_id], score: porVaga[c.vaga_id] ? scoreCandidate(candDoCv(c.curriculo), porVaga[c.vaga_id]) : null }));
  const mudar = async (c, etapa) => {
    try {
      await api("etapa", { token, id: c.id, etapa });
      ctx.say({ Entrevista: "Pronto: em conversa. A pessoa recebe um aviso.", Proposta: "Proposta enviada! Avisamos quando a pessoa aceitar ou recusar.",
        Recusada: "Pronto. A pessoa vai saber que você seguiu com outra pessoa." }[etapa] || "Atualizado.");
      carregar();
    } catch (e) { ctx.say(e.message); }
  };
  const abrir = (c) => { setAberto(c); if (!c.vista) api("vista", { token, ids: [c.id] }).then(carregar).catch(() => {}); };
  const encerrar = async (v) => { try { await api("encerrar", { token, vagaId: v.id }); ctx.say("Vaga encerrada e retirada do site."); carregar(); } catch (e) { ctx.say(e.message); } };
  const link = linkDeAcesso(token);
  const copiar = async () => { try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2500); } catch (e) { ctx.say("Selecione o link e copie"); } };
  const e = dados.empresa;

  return (
    <div className="wrap" style={{ padding: "32px 24px 60px" }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div><h2 className="row" style={{ gap: 12, flexWrap: "wrap" }}>{e.nome} <Estrelas r={dados.avaliacao} /></h2>
          <p className="muted row" style={{ marginTop: 4, gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--ok)", display: "inline-block" }} />
            Área de quem contrata · atualiza sozinha a cada 10 segundos
          </p></div>
        <button className="btn btn-p btn-sm" onClick={() => ctx.go("hire")}>Publicar outra vaga</button>
      </div>

      <div className="grid-cards" style={{ marginTop: 20 }}>
        {[["Vagas no ar", vagas.filter((v) => v.ativa && !v.suspeita).length], ["Candidaturas", reais.length],
          ["Ainda não vistas", novas], ["Convites enviados", dados.candidaturas.filter((c) => c.etapa === "Convite").length]].map(([l, v]) => (
          <div className="card" key={l}><div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div><div className="muted">{l}</div></div>
        ))}
      </div>

      <div className="row" style={{ margin: "20px 0 16px", gap: 4, borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
        {[["cands", `Candidatos${novas ? ` (${novas} ${novas === 1 ? "nova" : "novas"})` : ""}`], ["talentos", "Encontrar pessoas"], ["vagas", "Minhas vagas"], ["conta", "Minha conta"]].map(([k, l]) => (
          <button key={k} className="btn btn-g btn-sm" onClick={() => setTab(k)}
            style={{ borderRadius: 0, borderBottom: "2px solid " + (tab === k ? "var(--wine)" : "transparent"), color: tab === k ? "var(--wine)" : "var(--ink-2)" }}>{l}</button>
        ))}
      </div>

      {tab === "cands" && (
        <>
          <BotaoAvisos papel="empresa" ctx={ctx} texto="Receba um aviso no celular na hora em que chegar um currículo." />
          {vagas.length > 1 && (
            <div className="chips" style={{ marginBottom: 14 }}>
              <button className="chip" data-on={vagaSel === "todas" ? "1" : "0"} onClick={() => setVagaSel("todas")}>Todas as vagas</button>
              {vagas.map((v) => <button key={v.id} className="chip" data-on={vagaSel === v.id ? "1" : "0"} onClick={() => setVagaSel(v.id)}>{v.title}</button>)}
            </div>
          )}
          {cands.length === 0 ? (
            <div className="empty"><h3>Nenhuma candidatura ainda</h3>
              <p style={{ marginTop: 8 }}>Assim que alguém enviar o currículo, ele aparece aqui na hora, com um aviso sonoro. Enquanto isso, procure pessoas cadastradas e convide quem combina.</p>
              <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => setTab("talentos")}>Encontrar pessoas</button>
              {window.Notification && window.Notification.permission === "default" && (
                <button className="btn btn-s btn-sm" style={{ marginTop: 14 }} onClick={() => window.Notification.requestPermission().then(() => ctx.say("Pronto. Avisamos mesmo com a aba minimizada."))}>Avisar também quando a aba estiver minimizada</button>
              )}</div>
          ) : (
            <div className="col" style={{ gap: 12 }}>
              {cands.map((c) => {
                const cv = c.curriculo || {};
                const zap = linkWhats(cv.tel, `Olá, ${(c.candidatos?.nome || cv.nome || "").split(" ")[0]}! Vi sua candidatura no Matchly para a vaga de ${c.vaga?.title || ""}. Podemos conversar?`);
                return (
                  <div className="card card-h" key={c.id} style={!c.vista ? { borderColor: "var(--wine)" } : undefined}>
                    <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
                      <div className="row">
                        <div style={{ width: 40, height: 40, borderRadius: 99, background: "var(--wine-tint)", color: "var(--wine)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>{initials(c.candidatos?.nome || cv.nome)}</div>
                        <div><h3 style={{ fontSize: 15 }}>{c.candidatos?.nome || cv.nome}</h3>
                          <div className="muted">{[cv.objetivo, cv.idade ? `${cv.idade} anos` : "", cv.bairro || cv.cidade].filter(Boolean).join(" · ")}</div>
                          {cv.pretensao > 0 && <div className="small" style={{ marginTop: 2, color: "var(--ink)" }}><Ic n="money" s={14} /> Quer receber {salarioTexto(cv.pretensao, cv.pretensaoUnidade)}</div>}
                          <div className="muted" style={{ marginTop: 2 }}>Para {c.vaga?.title || "vaga encerrada"} · {quandoFoi(c.criada_em)}</div>
                          {c.nota_candidato && <div className="row small" style={{ marginTop: 4, gap: 6 }}><Estrelas r={c.nota_candidato} pequeno /> <span className="muted">de quem já contratou</span></div>}</div>
                      </div>
                      <div className="row" style={{ flexWrap: "wrap" }}>
                        {!c.vista && <span className="badge b-wine">Nova</span>}
                        {c.score !== null && <span className="score">Combina {c.score}%</span>}
                        {c.etapa !== "Candidatura enviada" && <span className="badge b-green">{ETAPA_EMPRESA[c.etapa] || c.etapa}</span>}
                      </div>
                    </div>
                    {c.mensagem && <div className="note" style={{ marginTop: 10 }}>“{c.mensagem}”</div>}
                    {(cv.habilidades || []).length > 0 && <div className="chips" style={{ marginTop: 10 }}>{cv.habilidades.slice(0, 8).map((x) => <span key={x} className="tag">{x}</span>)}</div>}
                    <EtapasEmpresa c={c} nome={(c.candidatos?.nome || cv.nome || "").split(" ")[0]} zap={zap} abrir={() => abrir(c)} mudar={(e) => mudar(c, e)} avaliar={() => setAvaliando(c)} />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "talentos" && <EncontrarPessoas ctx={ctx} token={token} vagas={vagas} aoConvidar={carregar} />}

      {tab === "vagas" && (
        vagas.length === 0 ? (
          <div className="empty"><h3>Nenhuma vaga publicada</h3>
            <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => ctx.go("hire")}>Publicar agora</button></div>
        ) : (
          <div className="col divide card" style={{ padding: 0 }}>
            {vagas.map((v) => (
              <div key={v.id} className="between" style={{ padding: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 15 }}>{v.title}</h3>
                  <div className="muted">{v.city} · {v.contract} · {payLabel(v)} · {reais.filter((c) => c.vaga_id === v.id).length} candidatura(s)</div>
                </div>
                <div className="row">
                  {v.suspeita ? <span className="badge">Em revisão</span> : v.ativa ? <span className="badge b-green">No ar</span> : <span className="badge">Encerrada</span>}
                  <button className="btn btn-s btn-sm" onClick={() => { setVagaSel(v.id); setTab("cands"); }}>Ver candidatos</button>
                  {v.ativa && <button className="btn btn-g btn-sm" onClick={() => encerrar(v)}>Encerrar</button>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "conta" && (
        <>
        <div className="card between" style={{ maxWidth: 680, marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, color: "var(--ink)" }}>{e.nome}</div>
            <div className="small">{dados.conta?.login ? <>Você entra com <b>{dados.conta.login.includes("@") ? dados.conta.login : mascaraTel(dados.conta.login)}</b> e a sua senha de 6 números.</> : "Crie uma senha abaixo para entrar de outros aparelhos."}</div>
          </div>
          <SairEmpresa sair={ctx.sairDaEmpresa} />
        </div>
        <div className="card" style={{ maxWidth: 680, marginBottom: 16 }}>
          <h3>Entrar de outro aparelho</h3>
          <p style={{ marginTop: 8, marginBottom: 14 }}>No outro celular ou computador, toque em <b>Entrar</b>, escolha <b>Quem contrata</b> e use o WhatsApp (ou e-mail) e a senha de 6 números.</p>
          <DefinirSenha papel="empresa" ctx={ctx} jaTem={dados.conta?.login} loginInicial={dados.conta?.login || ""} />
        </div>
        <div className="card" style={{ maxWidth: 680 }}>
          <h3>Ou guarde este link</h3>
          <p style={{ marginTop: 8 }}>Ele abre a sua área em qualquer celular ou computador, sem senha. Não mande para outras pessoas: quem tiver o link vê os currículos que você recebeu.</p>
          <input className="input" readOnly value={link} onFocus={(ev) => ev.target.select()} style={{ marginTop: 12, fontSize: 13 }} />
          <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn btn-p btn-sm" onClick={copiar}>{copiado ? "Copiado!" : "Copiar link"}</button>
            <a className="btn btn-s btn-sm" href={`https://wa.me/?text=${encodeURIComponent("Meu acesso ao Matchly (não compartilhar): " + link)}`} target="_blank" rel="noopener noreferrer">Mandar para o meu WhatsApp</a>
          </div>
        </div>
        </>
      )}
      {avaliando && (
        <JanelaAvaliar titulo={`Como foi o trabalho de ${(avaliando.candidatos?.nome || avaliando.curriculo?.nome || "").split(" ")[0]}?`}
          sub="A nota aparece para outras pessoas que forem contratar. Seja justo: ela ajuda quem trabalhou bem."
          dica="Chegou no horário? Fez o combinado? Contrataria de novo?"
          fechar={() => setAvaliando(null)}
          onEnviar={async (nota, comentario) => { await api("avaliar", { token, papel: "empresa", candidaturaId: avaliando.id, nota, comentario }); ctx.say("Avaliação enviada. Obrigado!"); carregar(); }} />
      )}

      {aberto && (
        <div className="sheet" onClick={() => setAberto(null)} style={{ alignItems: "flex-start", overflowY: "auto" }}>
          <div style={{ maxWidth: 900, width: "100%", margin: "20px 0" }} onClick={(ev) => ev.stopPropagation()}>
            <div className="card between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10, position: "sticky", top: 0, zIndex: 2 }}>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {aberto.score !== null && <span className="badge b-wine">Combina {aberto.score}%</span>}
                <span className="small">para {aberto.vaga?.title || "vaga encerrada"} · enviado {quandoFoi(aberto.criada_em)}</span>
              </div>
              <div className="row" style={{ flexWrap: "wrap" }}>
                <button className="btn btn-s btn-sm" onClick={() => { try { window.print(); } catch (er) { ctx.say("Use o menu do navegador para imprimir"); } }}>PDF</button>
                <button className="btn btn-g btn-sm" onClick={() => setAberto(null)} aria-label="Fechar">Fechar ×</button>
              </div>
            </div>
            {aberto.mensagem && <div className="note" style={{ marginBottom: 12 }}><b style={{ color: "var(--ink)" }}>Mensagem:</b> {aberto.mensagem}</div>}
            <Curriculo cv={aberto.curriculo || {}} destaque={aberto.vaga?.skills || []} />
          </div>
        </div>
      )}
    </div>
  );
}

function Recruiter({ ctx }) {
  if (AO_VIVO) return <RecruiterAoVivo ctx={ctx} />;
  const { myJobs, setMyJobs, bumpJobs } = ctx;
  const meus = myJobs.map((id) => JOBS.find((j) => j.id === id)).filter(Boolean);
  const [tab, setTab] = useState(meus.length ? "cands" : "painel");
  const [jobSel, setJobSel] = useState(meus[0]?.id || null);
  const [min, setMin] = useState(0);
  const [status, setStatus] = useState({});
  const [cv, setCv] = useState(null);
  const job = JOBS.find((j) => j.id === jobSel) || meus[0] || null;

  const lista = CANDIDATES.map((c) => ({ ...c, score: scoreCandidate(c, job) }))
    .filter((c) => c.score >= min).sort((a, b) => b.score - a.score);

  const mover = (id, st) => { setStatus({ ...status, [id]: st }); ctx.say(st === "Entrevista" ? "Convite enviado. O candidato foi avisado." : "Status atualizado."); };

  const encerrar = (id) => {
    const k = JOBS.findIndex((x) => x.id === id);
    if (k >= 0) JOBS.splice(k, 1);
    setMyJobs(myJobs.filter((x) => x !== id));
    bumpJobs(); ctx.say("Vaga encerrada e retirada do site.");
  };

  return (
    <div className="wrap" style={{ padding: "32px 24px 60px" }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div><h2>Área de quem contrata</h2>
          <p className="muted" style={{ marginTop: 4 }}>
            {meus.length ? `${meus.length} vaga(s) publicada(s) por você` : "Publique sua primeira vaga em 2 minutos"}
          </p></div>
        <button className="btn btn-p btn-sm" onClick={() => ctx.go("hire")}>Publicar vaga</button>
      </div>

      <div className="row" style={{ margin: "20px 0 16px", gap: 4, borderBottom: "1px solid var(--line)" }}>
        {[["painel", "Visão geral"], ["cands", "Candidatos"], ["vagas", "Minhas vagas"]].map(([k, l]) => (
          <button key={k} className="btn btn-g btn-sm" onClick={() => setTab(k)}
            style={{ borderRadius: 0, borderBottom: "2px solid " + (tab === k ? "var(--wine)" : "transparent"), color: tab === k ? "var(--wine)" : "var(--ink-2)" }}>{l}</button>
        ))}
      </div>

      {tab === "painel" && (
        <>
          <div className="grid-cards">
            {[["Vagas publicadas", meus.length], ["Candidatos disponíveis", lista.length],
              ["Convites enviados", Object.values(status).filter((x) => x === "Entrevista").length],
              ["Contratados", Object.values(status).filter((x) => x === "Contratado").length]].map(([l, v]) => (
              <div className="card" key={l}><div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div><div className="muted">{l}</div></div>
            ))}
          </div>
          {!meus.length && (
            <div className="empty" style={{ marginTop: 20 }}>
              <h3>Você ainda não publicou nada</h3>
              <p style={{ marginTop: 8 }}>Precisa de um passeador para o cachorro, alguém para a faxina ou um atendente para a loja? É grátis.</p>
              <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => ctx.go("hire")}>Publicar vaga</button>
            </div>
          )}
        </>
      )}

      {tab === "cands" && (
        <>
          {CANDIDATES.length === 0 && <div className="empty" style={{ marginBottom: 16 }}><h3>Ainda não há candidatos</h3><p style={{ marginTop: 8 }}>Publique sua vaga. As pessoas que se cadastrarem e combinarem com ela vão aparecer aqui.</p></div>}
          <div className="card" style={{ marginBottom: 16 }}>
            {meus.length > 0 && (
              <Field label="Candidatos para a vaga">
                <select className="select" value={jobSel || ""} onChange={(e) => setJobSel(e.target.value)}>
                  {meus.map((j) => <option key={j.id} value={j.id}>{j.title} — {j.city}</option>)}
                </select>
              </Field>
            )}
            <Field label={`Mostrar quem combina mais de ${min}%`}>
              <input type="range" min="0" max="95" step="5" value={min} onChange={(e) => setMin(+e.target.value)} style={{ accentColor: "var(--wine)", width: "100%" }} />
            </Field>
          </div>
          <div className="col" style={{ gap: 12 }}>
            {lista.map((c) => (
              <div className="card card-h" key={c.id}>
                <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
                  <div className="row">
                    <div style={{ width: 40, height: 40, borderRadius: 99, background: "var(--wine-tint)", color: "var(--wine)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13 }}>{initials(c.name)}</div>
                    <div><h3 style={{ fontSize: 15 }}>{c.name}</h3><div className="muted">{c.role} · {c.exp} · {c.city}</div></div>
                  </div>
                  <div className="row">
                    <span className="score">Combina {c.score}%</span>
                    {status[c.id] && <span className="badge b-wine">{status[c.id]}</span>}
                  </div>
                </div>
                <div className="chips" style={{ marginTop: 10 }}>{c.skills.map((x) => <span key={x} className="tag">{x}</span>)}</div>
                <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
                  <button className="btn btn-p btn-sm" onClick={() => setCv(c)}>Ver currículo</button>
                  <button className="btn btn-s btn-sm" onClick={() => mover(c.id, "Entrevista")}>Chamar para conversar</button>
                  <button className="btn btn-s btn-sm" onClick={() => mover(c.id, "Contratado")}>Marcar como contratado</button>
                  <button className="btn btn-g btn-sm" onClick={() => mover(c.id, "Não seguiu")}>Agora não</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {cv && <CandidateCV cand={cv} job={job} score={cv.score} say={ctx.say} onClose={() => setCv(null)} onInvite={() => mover(cv.id, "Entrevista")} />}

      {tab === "vagas" && (
        meus.length === 0 ? (
          <div className="empty"><h3>Nenhuma vaga publicada</h3>
            <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => ctx.go("hire")}>Publicar agora</button></div>
        ) : (
          <div className="col divide card" style={{ padding: 0 }}>
            {meus.map((j) => (
              <div key={j.id} className="between" style={{ padding: 16, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 15 }}>{j.title}</h3>
                  <div className="muted">{j.city} · {j.contract} · {payLabel(j)}</div>
                  {j.particular && <span className="badge b-wine" style={{ marginTop: 6 }}>Contratante particular</span>}
                </div>
                <div className="row">
                  <span className="badge b-green">No ar</span>
                  <button className="btn btn-s btn-sm" onClick={() => { setJobSel(j.id); setTab("cands"); }}>Ver candidatos</button>
                  <button className="btn btn-g btn-sm" onClick={() => encerrar(j.id)}>Encerrar</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ------------------------------ ADMINISTRADOR --------------------------- */
function Admin({ ctx }) {
  const [tab, setTab] = useState("metrics");
  const [reports, setReports] = useState([
    { id: "r1", type: "Vaga falsa", target: "Vaga: Analista de Dados — empresa não verificada", status: "Em análise" },
    { id: "r2", type: "Spam", target: "Empresa: Perfumaria Flor de Lis (conta duplicada)", status: "Em análise" },
    { id: "r3", type: "Informações incorretas", target: "Vaga: Product Analyst — salário divergente", status: "Resolvida" },
  ]);
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px" }}>
      <h2>Administração</h2>
      <div className="row" style={{ margin: "20px 0 16px", gap: 4, borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
        {[["metrics", "Métricas"], ["users", "Usuários"], ["comps", "Empresas"], ["reports", "Denúncias"], ["integr", "Integrações"]].map(([k, l]) => (
          <button key={k} className="btn btn-g btn-sm" onClick={() => setTab(k)}
            style={{ borderRadius: 0, borderBottom: "2px solid " + (tab === k ? "var(--wine)" : "transparent"), color: tab === k ? "var(--wine)" : "var(--ink-2)" }}>{l}</button>
        ))}
      </div>

      {tab === "metrics" && (
        <div className="grid-cards">
          {[["Usuários ativos", "12.480"], ["Empresas", "318"], ["Vagas publicadas", "1.902"], ["Candidaturas hoje", "744"], ["Compatibilidade média", "78%"], ["Erros nas últimas 24h", "3"]]
            .map(([l, v]) => <div className="card" key={l}><div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div><div className="muted">{l}</div></div>)}
        </div>
      )}

      {tab === "users" && (
        <div className="card divide" style={{ padding: 0 }}>
          {CANDIDATES.map((c) => (
            <div key={c.id} className="between" style={{ padding: 14, flexWrap: "wrap", gap: 10 }}>
              <div><div style={{ fontSize: 14 }}>{c.name}</div><div className="muted">Candidato · {c.role} · {c.city}</div></div>
              <div className="row">
                <button className="btn btn-g btn-sm" onClick={() => ctx.say("Perfil aberto")}>Ver</button>
                <button className="btn btn-s btn-sm" style={{ color: "var(--bad)", borderColor: "var(--line)" }} onClick={() => ctx.say("Conta bloqueada e usuário notificado")}>Bloquear</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "comps" && (
        <div className="card divide" style={{ padding: 0 }}>
          {COMPANIES.map((c) => (
            <div key={c.id} className="between" style={{ padding: 14, flexWrap: "wrap", gap: 10 }}>
              <div><div style={{ fontSize: 14 }}>{c.name}</div><div className="muted">{c.sector} · {c.verified ? "verificada" : "aguardando verificação"}</div></div>
              <button className="btn btn-s btn-sm" onClick={() => ctx.say(c.verified ? "Verificação revogada" : "Empresa verificada")}>{c.verified ? "Revogar selo" : "Verificar"}</button>
            </div>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div className="col" style={{ gap: 12 }}>
          <div className="note">Sinalizações não acusam ninguém automaticamente. Cada caso passa por análise humana antes de qualquer bloqueio.</div>
          {reports.map((r) => (
            <div className="card" key={r.id}>
              <div className="between" style={{ flexWrap: "wrap", gap: 8 }}>
                <div><h3 style={{ fontSize: 15 }}>{r.type}</h3><div className="muted">{r.target}</div></div>
                <span className={"badge " + (r.status === "Resolvida" ? "b-green" : "b-yellow")}>{r.status}</span>
              </div>
              {r.status !== "Resolvida" && (
                <div className="row" style={{ marginTop: 12 }}>
                  <button className="btn btn-p btn-sm" onClick={() => { setReports(reports.map((x) => x.id === r.id ? { ...x, status: "Resolvida" } : x)); ctx.say("Denúncia resolvida"); }}>Marcar como resolvida</button>
                  <button className="btn btn-s btn-sm" onClick={() => ctx.say("Conteúdo removido temporariamente")}>Remover conteúdo</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "integr" && (
        <div className="col" style={{ gap: 12 }}>
          {[["API de vagas do parceiro A", "Não conectada", "Informe a chave da API e a URL do feed autorizado."],
            ["Feed do ATS da empresa", "Não conectada", "Requer contrato de uso e endpoint público autorizado."],
            ["Serviço de e-mail transacional", "Não conectada", "Necessário para alertas e verificação de conta."],
            ["Provedor de IA (geração de texto)", "Não conectada", "Chave de API usada no currículo, carta e entrevista."]].map(([n, s, d]) => (
            <div className="card between" key={n} style={{ flexWrap: "wrap", gap: 10 }}>
              <div><h3 style={{ fontSize: 15 }}>{n}</h3><p style={{ fontSize: 13, marginTop: 4 }}>{d}</p></div>
              <div className="row"><span className="badge b-red">{s}</span>
                <button className="btn btn-s btn-sm" onClick={() => ctx.say("Configure as credenciais no ambiente do servidor")}>Conectar</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- PREÇOS -------------------------------- */
function Pricing({ ctx }) {
  const plans = [
    ["Gratuito", "R$ 0", ["Busca completa de vagas", "Perfil profissional", "Recomendações básicas", "Até 3 candidaturas organizadas"], false],
    ["Pro", "R$ 29/mês", ["Matching avançado com explicação", "Currículo com IA e score ATS", "Carta de apresentação", "Simulador de entrevista", "Alertas avançados"], true],
    ["Premium", "R$ 59/mês", ["Tudo do Pro", "Autopilot com automação avançada", "Plano de carreira completo", "Preparação personalizada por vaga", "Prioridade nas respostas da IA"], false],
  ];
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px" }}>
      <h2>Planos</h2>
      <p style={{ marginTop: 6 }}>Buscar vagas, montar o perfil e se candidatar continuam gratuitos. Sempre.</p>
      <div className="grid3" style={{ marginTop: 26 }}>
        {plans.map(([name, price, feats, hi]) => (
          <div className="card" key={name} style={hi ? { borderColor: "var(--wine)", boxShadow: "var(--shadow)" } : {}}>
            {hi && <span className="badge b-wine" style={{ marginBottom: 10 }}>Mais escolhido</span>}
            <h3>{name}</h3>
            <div style={{ fontSize: 30, fontWeight: 700, margin: "8px 0 16px" }}>{price}</div>
            <div className="col" style={{ gap: 8 }}>{feats.map((f) => <div key={f} className="small row" style={{ gap: 8 }}><span style={{ color: "var(--wine)" }}><Ic n="check" s={14} w={2.2} /></span>{f}</div>)}</div>
            <button className={"btn " + (hi ? "btn-p" : "btn-s")} style={{ width: "100%", marginTop: 18 }}
              onClick={() => ctx.say(name === "Gratuito" ? "Você já está no plano gratuito" : "Checkout: conectar provedor de pagamento")}>
              {name === "Gratuito" ? "Plano atual" : "Assinar " + name}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ PÁGINAS DE ERRO ------------------------- */
function ErrorPage({ kind, ctx }) {
  const map = {
    err404: ["404", "Esta página não existe", "O endereço pode ter mudado. Volte para o início ou busque uma vaga.", "Ir para o início", "dash"],
    err500: ["500", "Algo quebrou do nosso lado", "A falha foi registrada e a equipe já foi avisada. Tente de novo em alguns minutos.", "Tentar novamente", "dash"],
    erroff: ["Sem conexão", "Você está offline", "Suas vagas salvas continuam disponíveis assim que a conexão voltar.", "Ver salvos", "saved"],
    errjob: ["Vaga encerrada", "Esta vaga não está mais disponível", "A empresa encerrou o processo. Veja abaixo oportunidades parecidas.", "Ver feed", "feed"],
  };
  const [code, title, text, cta, dest] = map[kind];
  return (
    <div className="wrap" style={{ padding: "60px 24px", maxWidth: 700 }}>
      <div className="center">
        <div style={{ fontSize: 44, fontWeight: 700, color: "var(--wine)", letterSpacing: "-.04em" }}>{code}</div>
        <h2 style={{ marginTop: 10 }}>{title}</h2>
        <p style={{ marginTop: 10 }}>{text}</p>
        <button className="btn btn-p" style={{ marginTop: 20 }} onClick={() => ctx.go(dest)}>{cta}</button>
      </div>
      {kind === "errjob" && (
        <div style={{ marginTop: 40 }}>
          <h3 style={{ marginBottom: 14 }}>Vagas semelhantes</h3>
          <div className="col" style={{ gap: 14 }}>{ctx.feed.slice(0, 2).map((j) => <JobCard key={j.id} job={j} ctx={ctx} />)}</div>
        </div>
      )}
    </div>
  );
}



/* --------------------------- AJUDA / PRIMEIROS PASSOS ------------------- */
function Help({ ctx }) {
  const blocos = [
    ["file", "Documentos que quase toda vaga pede", [
      "RG e CPF (pode ser a versão digital, pelo app Gov.br).",
      "Carteira de Trabalho Digital: baixe o app Carteira de Trabalho Digital e entre com a conta Gov.br. Não precisa mais do documento azul de papel.",
      "Comprovante de residência (conta de luz ou água no seu nome ou de quem mora com você).",
      "Número do PIS/NIS, que aparece dentro do app da Carteira de Trabalho.",
      "Se tiver: certificado de reservista (homens) e título de eleitor.",
    ]],
    ["idcard", "Não tem algum documento?", [
      "RG e CPF são gratuitos na primeira via no Poupatempo ou no posto de identificação da sua cidade.",
      "O CPF também sai na hora pelo site da Receita Federal, sem custo.",
      "Sem endereço fixo: CRAS e Centro POP ajudam a tirar documentos e aceitam ser endereço de referência.",
      "Procure o CRAS do seu bairro. O atendimento é gratuito e eles também indicam cursos e vagas.",
    ]],
    ["chat", "Como se sair bem na entrevista", [
      "Chegue 15 minutos antes. Atraso é o que mais elimina candidato.",
      "Roupa limpa e simples basta. Não precisa de roupa social.",
      "Se perguntarem sobre experiência e você não tiver, diga a verdade e complete: o que você sabe fazer e que aprende rápido.",
      "Leve os documentos e uma caneta.",
      "Pergunte sobre horário, salário e vale transporte no fim. Isso mostra interesse, não atrevimento.",
    ]],
    ["shield", "Como não cair em golpe", [
      "Vaga de verdade nunca cobra dinheiro. Nada de taxa de cadastro, exame, uniforme ou curso para ser contratado.",
      "Desconfie de quem só fala por WhatsApp e não informa o nome da empresa nem o endereço.",
      "Não envie foto de documento antes de ser contratado e de conhecer a empresa.",
      "Salário muito acima do normal para a função quase sempre é armadilha.",
      "Achou algo estranho? Use o botão de denunciar dentro da vaga. A gente analisa.",
    ]],
    ["compass", "Primeiros passos aqui no site", [
      "Preencha o perfil com calma, mesmo sem experiência. Leva uns 5 minutos.",
      "Use o filtro Sem experiência no feed para ver só o que cabe agora.",
      "Salve as vagas que gostou e organize em pastas.",
      "Quando for se candidatar, gere a carta de apresentação: ela ajuda bastante quando o currículo é curto.",
      "Acompanhe tudo na aba Candidaturas para não perder nenhum retorno.",
    ]],
  ];
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 760 }}>
      <h2>Como conseguir a vaga</h2>
      <p style={{ marginTop: 8 }}>Um guia direto, para quem está começando ou voltando ao mercado.</p>
      <div className="col" style={{ gap: 16, marginTop: 22 }}>
        {blocos.map(([ic, t, itens]) => (
          <div className="card" key={t}>
            <div className="row"><span style={{ color: "var(--wine)" }}><Ic n={ic} s={20} /></span><h3 style={{ fontSize: 16 }}>{t}</h3></div>
            <div className="col" style={{ gap: 10, marginTop: 14 }}>
              {itens.map((i, k) => <div key={k} className="small" style={{ lineHeight: 1.6 }}>· {i}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 16, borderColor: "var(--wine-line)" }}>
        <h3>Precisa conversar com alguém?</h3>
        <p style={{ fontSize: 14, marginTop: 8 }}>
          O CRAS atende de graça e ajuda com documentos, cadastro em programas sociais e encaminhamento para vagas.
          A agência do trabalhador da sua cidade (Sine) também tem vagas e cursos gratuitos.
        </p>
        <button className="btn btn-p btn-sm" style={{ marginTop: 14 }} onClick={() => ctx.go("feed")}>Ver vagas para mim</button>
      </div>
    </div>
  );
}

/* -------------------------------- DOAÇÕES ------------------------------- */
const PIX_KEY = "weiskopffelipe@gmail.com";
function Donate({ ctx }) {
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState(20);
  const copy = () => {
    try { navigator.clipboard.writeText(PIX_KEY); } catch (e) {}
    setCopied(true); ctx.say("Chave Pix copiada"); setTimeout(() => setCopied(false), 2500);
  };
  return (
    <div className="wrap" style={{ padding: "32px 24px 60px", maxWidth: 640 }}>
      <h2>Apoie o Matchly</h2>
      <p style={{ marginTop: 8 }}>
        O site é gratuito para quem está procurando emprego e vai continuar assim. Quem puder contribuir ajuda a
        pagar servidor, envio de e-mails e o processamento da IA — e mantém as ferramentas abertas para quem mais precisa.
      </p>

      <div className="card" style={{ marginTop: 22, borderColor: "var(--wine-line)" }}>
        <h3>Doar por Pix</h3>
        <div className="chips" style={{ margin: "14px 0" }}>
          {[5, 10, 20, 50, 100].map((v) => (
            <button key={v} className="chip" data-on={amount === v ? "1" : "0"} onClick={() => setAmount(v)}>R$ {v}</button>
          ))}
        </div>
        <div className="between" style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8, padding: "12px 14px", flexWrap: "wrap", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div className="muted">Chave Pix (e-mail)</div>
            <div style={{ fontSize: 15, fontWeight: 600, wordBreak: "break-all" }}>{PIX_KEY}</div>
          </div>
          <button className="btn btn-p btn-sm" onClick={copy}>{copied ? "Copiada" : "Copiar chave"}</button>
        </div>

        <ol className="small" style={{ margin: "18px 0 0", paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Copie a chave acima.</li>
          <li>No app do seu banco, escolha <b>Pix → Pagar com chave</b> e cole.</li>
          <li>Digite o valor, por exemplo R$ {amount},00, e confirme. Qualquer quantia ajuda.</li>
        </ol>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Outras formas de ajudar</h3>
        <div className="col" style={{ gap: 10, marginTop: 12 }}>
          <div className="small">· Indique o site para alguém que está procurando emprego</div>
          <div className="small">· Conte o que faltou para você: o retorno orienta as próximas melhorias</div>
          <div className="small">· Se você contrata, publique suas vagas por aqui</div>
        </div>
        <div className="row" style={{ marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn btn-s btn-sm" onClick={() => ctx.say("Link do site copiado")}>Compartilhar o site</button>
          <button className="btn btn-g btn-sm" onClick={() => ctx.say("Obrigado! Sua mensagem foi registrada")}>Enviar sugestão</button>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 20 }}>
        Doações são voluntárias, não dão acesso a recursos pagos e não geram vínculo com nenhuma vaga ou empresa.
      </p>
    </div>
  );
}

/* ---------------------------- ASSISTENTE (CHAT) ------------------------- */
function Assistant({ ctx }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ me: false, t: "Oi! Posso analisar vagas, revisar seu currículo, sugerir salário e preparar você para entrevistas. O que você quer resolver agora?" }]);
  const [v, setV] = useState("");
  const boxRef = useRef(null);
  useEffect(() => { boxRef.current?.scrollTo(0, 9e9); }, [msgs, open]);

  const answer = (q) => {
    const s = q.toLowerCase();
    const { profile: p, prefs, matches, feed } = ctx;
    const top = feed[0], m = top ? matches[top.id] : null;
    if (!top && !(s.includes("currículo") || s.includes("curriculo") || s.includes("entrevista")))
      return "Ainda não há vagas publicadas. O Matchly acabou de abrir e as empresas estão começando a entrar. Enquanto isso, deixe seu currículo pronto: quando aparecer uma vaga para você, ela fica no seu painel.";
    if (s.includes("vaga") && (s.includes("combina") || s.includes("melhor")))
      return `Hoje a melhor é ${top.title} na ${companyOf(top.companyId).name}, com ${m.score}%. Pesa a favor: ${m.why[0] || "seu histórico na área"} A faixa é de ${money(top.sMin)} a ${money(top.sMax)}.`;
    if (s.includes("currículo") || s.includes("curriculo"))
      return `Seu score ATS está em ${atsScore(p).score}/100. O ajuste de maior impacto agora: ${atsScore(p).tips[0] || "manter os resultados numéricos que você já tem."}`;
    if (s.includes("salário") || s.includes("salario") || s.includes("pedir"))
    {
      const proximas = feed.slice(0, 12).filter((j) => j.sMax > 0);
      if (!proximas.length) return "Ainda não há vagas com valor informado para o seu perfil. Quando aparecerem, eu mostro a faixa de pagamento.";
      const contagem = {}; proximas.forEach((j) => { const u = j.unit || "/mês"; contagem[u] = (contagem[u] || 0) + 1; });
      const unidade = Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a])[0];
      const mesmas = proximas.filter((j) => (j.unit || "/mês") === unidade);
      const min = Math.min(...mesmas.map((j) => j.sMin || j.sMax)), max = Math.max(...mesmas.map((j) => j.sMax));
      const nome = unidade === "/dia" ? "por dia" : unidade === "/hora" ? "por hora" : "por mês";
      const meio = Math.round(((min + max) / 2) / (unidade === "/mês" ? 50 : 5)) * (unidade === "/mês" ? 50 : 5);
      const pedido = +prefs.sTarget > 0 && (prefs.sUnit || "/mês") === unidade ? +prefs.sTarget : meio;
      return `As vagas que mais combinam com você pagam de ${money(min)} a ${money(max)} ${nome}. Se perguntarem quanto você quer, peça por volta de ${money(pedido)} ${nome}, que fica no meio da faixa. Se a vaga já diz o valor, não precisa negociar na primeira conversa.`;
    }
    if (s.includes("qualificad") || s.includes("consigo"))
      return `Para ${top.title} você cobre ${m.matched.length} de ${top.skills.length} requisitos. ${m.missing.length ? `Falta ${m.missing.join(", ")}.` : "Está qualificada."}`;
    if (s.includes("habilidade") || s.includes("aprender"))
      return `Pelas vagas que você tem olhado, ${m.missing[0] || "cloud (AWS ou Azure)"} é o que mais aparece e você ainda não tem no perfil. Um curso curto e um projeto público já mudam sua nota.`;
    if (s.includes("entrevista"))
      return `Use situação → ação → resultado e termine com um número. Quer simular? Abra a Entrevista IA e escolha a vaga — a avaliação vem com nota por critério.`;
    if (s.includes("vale a pena"))
      return `Depende do que você prioriza. ${top.title} tem ${m.score}% de compatibilidade e modelo ${top.model.toLowerCase()}. Se o salário pesa mais, compare com as outras no comparador antes de decidir.`;
    return `Posso responder sobre vagas compatíveis, currículo, salário, entrevistas e próximos passos de carreira. Sobre "${q}", me dá um pouco mais de contexto?`;
  };

  const send = () => {
    if (!v.trim()) return;
    const q = v; setV("");
    setMsgs((m) => [...m, { me: true, t: q }]);
    setTimeout(() => setMsgs((m) => [...m, { me: false, t: answer(q) }]), 500);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="Abrir assistente"
        className="fab" style={{ width: 54, height: 54, borderRadius: 99, border: "1px solid var(--wine)", background: "var(--wine)", color: "#fff", fontSize: 20, cursor: "pointer", boxShadow: "var(--shadow)" }}>
        <Ic n={open ? "x" : "chat"} s={22} />
      </button>
      {open && (
        <div className="card fabpanel" style={{ width: "min(360px, calc(100vw - 40px))", padding: 0, boxShadow: "var(--shadow)", display: "flex", flexDirection: "column", maxHeight: "min(520px, 70vh)" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
            <h3 style={{ fontSize: 15 }}>Assistente Matchly</h3>
            <div className="muted">Responde com base no seu perfil</div>
          </div>
          <div ref={boxRef} style={{ padding: 14, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "85%", fontSize: 13.5, lineHeight: 1.5,
                background: m.me ? "var(--wine)" : "var(--surface-2)", color: m.me ? "#fff" : "var(--ink)",
                border: m.me ? "none" : "1px solid var(--line)", padding: "9px 12px", borderRadius: 12 }}>{m.t}</div>
            ))}
            {msgs.length === 1 && (
              <div className="chips" style={{ marginTop: 4 }}>
                {["Quais vagas combinam comigo?", "Meu currículo está bom?", "Quanto devo pedir de salário?"].map((q) => (
                  <button key={q} className="chip" onClick={() => { setMsgs((m) => [...m, { me: true, t: q }]); setTimeout(() => setMsgs((m) => [...m, { me: false, t: answer(q) }]), 400); }}>{q}</button>
                ))}
              </div>
            )}
          </div>
          <div className="row" style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
            <input className="input" value={v} placeholder="Pergunte alguma coisa…" onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="btn btn-p btn-sm" onClick={send}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
}

/* No site publicado não há dados de exemplo: tudo começa vazio. */
if (!DEMO) { COMPANIES.length = 0; JOBS.length = 0; CANDIDATES.length = 0; }
