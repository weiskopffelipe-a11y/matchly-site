-- =====================================================================
-- MATCHLY — banco de dados
-- Cole tudo isto no Supabase: menu SQL Editor → New query → Run.
-- Pode rodar de novo sem medo: só cria o que ainda não existe.
-- =====================================================================

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------
-- EMPRESAS: as do radar (monitoradas) e as que se cadastraram sozinhas
-- ---------------------------------------------------------------------
create table if not exists empresas (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  razao_social  text,
  cnpj          text unique,
  dominio       text,
  site          text,
  logo_url      text,
  setor         text,
  cidade        text,
  uf            text,
  tamanho       text,
  descricao     text,
  beneficios    text[] not null default '{}',
  responsavel   text,
  email_contato text,
  telefone      text,
  origem        text not null default 'radar' check (origem in ('radar', 'cadastro')),
  verificada    boolean not null default false,
  criada_em     timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);
-- quem publica pelo site: "empresa" ou "pessoa" (particular), e o acesso sem senha
alter table empresas add column if not exists tipo text not null default 'empresa';
alter table empresas add column if not exists token_hash text;
create unique index if not exists empresas_token_uq on empresas (token_hash);
create unique index if not exists empresas_dominio_uq on empresas (dominio);  -- vários sem domínio (null) são permitidos
create index if not exists empresas_nome_trgm on empresas using gin (nome gin_trgm_ops);

-- ---------------------------------------------------------------------
-- FONTES: de onde o robô lê as vagas de cada empresa
--   greenhouse / lever / smartrecruiters / recruitee / ashby → APIs públicas oficiais dos sistemas de RH
--   pagina    → página de vagas da própria empresa (lê o formato JobPosting, respeitando o robots.txt)
--   descobrir → só temos o site; o robô procura a página de vagas na primeira passada
-- ---------------------------------------------------------------------
create table if not exists fontes (
  id                bigint generated always as identity primary key,
  empresa_id        uuid not null references empresas(id) on delete cascade,
  tipo              text not null check (tipo in ('greenhouse','lever','smartrecruiters','recruitee','ashby','pagina','descobrir')),
  identificador     text not null,
  ativa             boolean not null default true,
  autorizada        boolean not null default false,  -- true quando a própria empresa cadastrou a fonte
  proxima_coleta    timestamptz not null default now(),
  ultima_coleta     timestamptz,
  falhas            int not null default 0,
  ultimo_erro       text,
  vagas_encontradas int not null default 0,
  unique (tipo, identificador)
);
create index if not exists fontes_fila_idx on fontes (proxima_coleta) where ativa;

-- ---------------------------------------------------------------------
-- VAGAS
-- ---------------------------------------------------------------------
create table if not exists vagas (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid references empresas(id) on delete cascade,
  fonte_id          bigint references fontes(id) on delete set null,
  origem            text not null,          -- greenhouse, lever, pagina, adzuna, jooble, cadastro...
  id_externo        text not null,
  fonte_nome        text,                   -- o que aparece para o candidato: "Greenhouse", "site da empresa", "Adzuna"
  titulo            text not null,
  descricao         text,
  cidade            text,
  uf                text,
  modelo            text,                   -- Presencial / Híbrido / Remoto
  contrato          text,                   -- CLT / PJ / Temporário / Estágio / Aprendiz / Freelancer
  salario_min       numeric,
  salario_max       numeric,
  unidade           text default '/mês',
  escolaridade      text,
  exige_experiencia boolean not null default false,
  area              text,
  habilidades       text[] not null default '{}',
  beneficios        text[] not null default '{}',
  url               text,                   -- link oficial onde a pessoa se candidata
  publicada_em      timestamptz,
  coletada_em       timestamptz not null default now(),
  vista_em          timestamptz not null default now(),
  ativa             boolean not null default true,
  suspeita          boolean not null default false,
  motivos_suspeita  text[] not null default '{}',
  classificada_ia   boolean not null default false,
  hash_conteudo     text,                   -- título + empresa + cidade: acha a mesma vaga vinda de fontes diferentes
  assinatura        text,                   -- muda quando a vaga é editada: só então o robô regrava
  unique (origem, id_externo)
);
alter table vagas add column if not exists assinatura text;
alter table vagas add column if not exists particular boolean not null default false;  -- publicada por uma pessoa (não empresa)
create index if not exists vagas_empresa_idx on vagas (empresa_id);
create index if not exists vagas_lista_idx on vagas (ativa, suspeita, publicada_em desc);
create index if not exists vagas_cidade_idx on vagas (lower(cidade));
create index if not exists vagas_hash_idx on vagas (hash_conteudo);
create index if not exists vagas_titulo_trgm on vagas using gin (titulo gin_trgm_ops);

-- ---------------------------------------------------------------------
-- CANDIDATOS E CANDIDATURAS
-- O trabalhador não cria senha: o site guarda uma chave no aparelho dele.
-- A candidatura guarda a cópia do currículo exatamente como foi enviada.
-- ---------------------------------------------------------------------
create table if not exists candidatos (
  id            uuid primary key default gen_random_uuid(),
  token_hash    text not null unique,
  nome          text not null,
  telefone      text,
  cidade        text,
  curriculo     jsonb not null default '{}',
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists candidaturas (
  id            uuid primary key default gen_random_uuid(),
  candidato_id  uuid not null references candidatos(id) on delete cascade,
  vaga_id       uuid not null references vagas(id) on delete cascade,
  etapa         text not null default 'Candidatura enviada',
  mensagem      text,
  curriculo     jsonb not null default '{}',
  vista         boolean not null default false,
  criada_em     timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  unique (candidato_id, vaga_id)
);
create index if not exists candidaturas_vaga_idx on candidaturas (vaga_id, criada_em desc);

create table if not exists denuncias (
  id         uuid primary key default gen_random_uuid(),
  vaga_id    uuid references vagas(id) on delete cascade,
  empresa_id uuid references empresas(id) on delete cascade,
  motivo     text not null,
  detalhes   text,
  status     text not null default 'Em análise',
  criada_em  timestamptz not null default now()
);

create table if not exists coletas (
  id            bigint generated always as identity primary key,
  iniciada_em   timestamptz not null default now(),
  terminada_em  timestamptz,
  fontes_lidas  int default 0,
  vagas_novas   int default 0,
  vagas_atualizadas int default 0,
  vagas_encerradas  int default 0,
  suspeitas     int default 0,
  chamadas_ia   int default 0,
  erros         int default 0,
  resumo        text
);

-- ---------------------------------------------------------------------
-- SEGURANÇA (RLS)
-- O site usa a chave pública (anon): ela só LÊ vagas ativas e dados públicos das empresas.
-- Tudo que grava passa pelo robô ou pela /api, com a chave secreta (service_role).
-- ---------------------------------------------------------------------
alter table empresas     enable row level security;
alter table fontes       enable row level security;
alter table vagas        enable row level security;
alter table candidatos   enable row level security;
alter table candidaturas enable row level security;
alter table denuncias    enable row level security;
alter table coletas      enable row level security;

drop policy if exists "empresas visiveis" on empresas;
create policy "empresas visiveis" on empresas for select to anon, authenticated using (true);
-- CNPJ, e-mail e telefone de contato nunca saem para o público:
revoke select on empresas from anon, authenticated;
grant select (id, nome, dominio, site, logo_url, setor, cidade, uf, tamanho, descricao, beneficios, verificada, origem, tipo)
  on empresas to anon, authenticated;

drop policy if exists "vagas ativas" on vagas;
create policy "vagas ativas" on vagas for select to anon, authenticated using (ativa and not suspeita);

-- candidatos e candidaturas: nenhuma política pública. Só a /api (chave secreta) lê e grava,
-- e ela confere a chave de acesso de quem pede.

drop policy if exists "qualquer um denuncia" on denuncias;
create policy "qualquer um denuncia" on denuncias for insert to anon, authenticated with check (true);

-- ---------------------------------------------------------------------
-- ARMAZENAMENTO DAS LOGOS (pasta pública "logos")
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Painel rápido: rode "select * from painel;" para ver como está a coleta
-- ---------------------------------------------------------------------
create or replace view painel as
select
  (select count(*) from empresas)                                   as empresas,
  (select count(*) from empresas where origem = 'cadastro')         as empresas_cadastradas,
  (select count(*) from fontes where ativa)                         as fontes_ativas,
  (select count(*) from fontes where ativa and proxima_coleta <= now()) as fontes_na_fila,
  (select count(*) from vagas where ativa and not suspeita)          as vagas_no_ar,
  (select count(*) from vagas where suspeita and ativa)             as vagas_em_revisao,
  (select max(terminada_em) from coletas)                           as ultima_coleta;
revoke all on painel from anon, authenticated;

-- limpa os dados do teste de instalação (10/11/2026)
delete from empresas   where origem = 'cadastro' and nome in ('TESTE Matchly', 'TESTE Matchly 2');
delete from candidatos where nome = 'TESTE Trabalhador';

-- avisa a API do Supabase que as tabelas mudaram
notify pgrst, 'reload schema';
