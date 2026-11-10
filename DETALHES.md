# Matchly — guia detalhado (celular, extras e limites)

Tudo aqui dá para fazer pelo celular, no navegador. São quatro partes. Faça na ordem: depois de cada uma o site já funciona, só que com mais coisas ligadas.

| Parte | O que você ganha | Tempo |
|---|---|---|
| A. Atualizar o site | Matchly no ar, em modo demonstração | 10 min |
| B. Ligar o banco de dados | Empresas se cadastram de verdade, com logo | 10 min |
| C. Ligar o robô | Vagas reais das empresas do seu radar, atualizadas sozinhas | 15 min |
| D. Extras | Logos automáticas, IA, e-mails, mais fontes de vagas | quando quiser |

> **Dica para o celular:** no GitHub e na Vercel, abra o menu do navegador e marque **"Versão para computador"**. Aparecem todos os botões.

---

## Parte A — Atualizar o site

O projeto agora tem várias pastas. Pelo celular não dá para subir pastas no GitHub, então você vai subir um arquivo .zip e deixar o próprio GitHub abrir ele.

**1. Crie o "abridor de zip".** No seu repositório do GitHub: **Add file → Create new file**. No nome, digite exatamente:

```
.github/workflows/desempacotar.yml
```

Cole isto e toque em **Commit changes**:

```yaml
name: Desempacotar projeto
on:
  workflow_dispatch:
permissions:
  contents: write
jobs:
  desempacotar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          unzip -o matchly.zip -d .
          rm -f matchly.zip src/sti.jsx src/esfe.jsx
          git config user.name "matchly-bot"
          git config user.email "matchly-bot@users.noreply.github.com"
          git add -A
          git commit -m "Projeto Matchly" || echo "Nada novo"
          git push
```

**2. Suba o zip.** **Add file → Upload files** → escolha o `matchly.zip` → **Commit changes**.

**3. Abra o zip.** Toque na aba **Actions** do repositório. Se aparecer um aviso pedindo para ativar, toque em **I understand my workflows, go ahead and enable them**. Escolha **Desempacotar projeto → Run workflow → Run workflow**. Espere a bolinha ficar verde (uns 30 segundos).

**4. Pronto.** A Vercel percebe a mudança e publica sozinha em 1 a 2 minutos. Abra seu link: o site agora é o Matchly, em **modo demonstração** (com vagas de exemplo e um aviso dizendo isso).

> Por que não veio tudo no zip? Por segurança, o GitHub não deixa um robô criar arquivos de agendamento. Os dois que faltam você cria na Parte C, do mesmo jeito do passo 1.

---

## Parte B — Ligar o banco de dados (Supabase)

O Supabase guarda as empresas, as vagas e as logos. O plano grátis basta para começar.

**1. Crie o projeto.** Entre em **supabase.com** → **Start your project** → entre com o GitHub → **New project**. Nome: `matchly`. Crie uma senha forte e guarde. Região: **South America (São Paulo)**. Toque em **Create**. Espere uns 2 minutos.

**2. Crie as tabelas.** No GitHub, abra o arquivo `supabase.sql` do repositório, toque em **Raw** e copie tudo. No Supabase: menu **SQL Editor → New query** → cole → **Run**. Deve aparecer *Success*.

**3. Copie três informações.** No Supabase: **Project Settings → API Keys** (e **Data API** para o endereço):

- **Project URL** — algo como `https://abcd1234.supabase.co`
- **Publishable key** — começa com `sb_publishable_`
- **Secret key** — começa com `sb_secret_` (toque em *Reveal*). **Esta é secreta: nunca cole no código.**

**4. Entregue para a Vercel.** Na Vercel: seu projeto → **Settings → Environment Variables**. Crie uma por vez (nome à esquerda, valor à direita):

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | o Project URL |
| `VITE_SUPABASE_ANON_KEY` | a publishable key |
| `SUPABASE_URL` | o Project URL (de novo) |
| `SUPABASE_SERVICE_KEY` | a secret key |

Depois: aba **Deployments** → nos três pontinhos do último → **Redeploy**.

**Teste:** abra o site → **Cadastrar empresa** → preencha com um CNPJ seu → envie a logo → **Cadastrar empresa**. No Supabase, em **Table Editor → empresas**, ela aparece. A logo fica em **Storage → logos**.

> Enquanto não houver vagas no banco, o feed mostra "Ainda não há vagas carregadas". É a Parte C que traz as vagas.

---

## Parte C — Ligar o robô que busca vagas

O robô roda de graça dentro do GitHub, a cada 3 horas, mesmo com o celular desligado.

**1. Dê ao GitHub a chave do banco.** No repositório: **Settings → Secrets and variables → Actions → New repository secret**. Crie dois:

| Nome | Valor |
|---|---|
| `SUPABASE_URL` | o Project URL |
| `SUPABASE_SERVICE_KEY` | a secret key |

**2. Crie o agendamento do robô.** **Add file → Create new file**, nome:

```
.github/workflows/coletar.yml
```

```yaml
name: Coletar vagas
on:
  schedule:
    - cron: "17 */3 * * *"
  workflow_dispatch:
concurrency:
  group: coleta
jobs:
  coletar:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node scripts/coletar.mjs
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          ADZUNA_APP_ID: ${{ secrets.ADZUNA_APP_ID }}
          ADZUNA_APP_KEY: ${{ secrets.ADZUNA_APP_KEY }}
          JOOBLE_API_KEY: ${{ secrets.JOOBLE_API_KEY }}
          SITE_URL: ${{ vars.SITE_URL }}
```

**3. Crie o importador do radar.** Mais um arquivo, nome:

```
.github/workflows/importar-radar.yml
```

```yaml
name: Importar radar de empresas
on:
  workflow_dispatch:
    inputs:
      arquivo:
        description: "Nome do arquivo CSV"
        default: "radar.csv"
        required: true
jobs:
  importar:
    runs-on: ubuntu-latest
    timeout-minutes: 120
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node scripts/importar-radar.mjs "${{ inputs.arquivo }}"
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

**4. Prepare a sua lista de empresas.** No Google Planilhas ou Excel, uma linha por empresa, com estes títulos na primeira linha (só `nome` é obrigatório; quanto mais colunas, melhor):

```
nome,site,pagina_vagas,cnpj,setor,cidade,uf
```

- `site` — o endereço da empresa (`mercadoboavista.com.br`). Se você não souber a página de vagas, o robô procura sozinho.
- `pagina_vagas` — o link da página de vagas, se você souber (`https://empresa.gupy.io`, `https://jobs.lever.co/empresa`, `https://empresa.com.br/trabalhe-conosco`).

Baixe como **CSV**, renomeie para `radar.csv` e suba no repositório (**Add file → Upload files**). O arquivo `radar-exemplo.csv` mostra o formato. Até 25 MB por arquivo dá para subir pelo site: se a sua lista de 100 mil empresas passar disso, divida em `radar1.csv`, `radar2.csv`…

**5. Importe.** **Actions → Importar radar de empresas → Run workflow** (digite o nome do arquivo, se não for `radar.csv`). Cem mil empresas levam por volta de 10 minutos.

**6. Rode o robô pela primeira vez.** **Actions → Coletar vagas → Run workflow.** Depois disso ele roda sozinho a cada 3 horas.

**Como acompanhar:** no Supabase, **SQL Editor**, rode:

```sql
select * from painel;
```

Mostra quantas empresas estão no radar, quantas fontes ainda estão na fila, quantas vagas estão no ar e quantas estão em revisão. Para ver o que aconteceu em cada rodada: `select * from coletas order by id desc limit 10;`

---

## Parte D — Extras (todos opcionais)

| O quê | Onde conseguir | Onde colar |
|---|---|---|
| **Logos automáticas** das empresas do radar, pelo site delas | logo.dev → crie a conta grátis → copie a *publishable key* | Vercel: `VITE_LOGO_DEV_TOKEN` |
| **IA** que classifica vagas mal escritas e lê páginas sem formato padrão | console.anthropic.com → API Keys | GitHub Secrets: `ANTHROPIC_API_KEY` |
| **Vagas da Adzuna** (agregador, plano grátis) | developer.adzuna.com | GitHub Secrets: `ADZUNA_APP_ID` e `ADZUNA_APP_KEY` |
| **Vagas da Jooble** | jooble.org/api/about | GitHub Secrets: `JOOBLE_API_KEY` |
| **E-mail de confirmação** no cadastro de empresa | resend.com | Vercel: `RESEND_API_KEY`, `EMAIL_REMETENTE`, `EMAIL_ADMIN` |

Sobre o custo da IA: o robô só chama a IA quando as regras não conseguem classificar a vaga, nunca para a mesma vaga duas vezes, e no máximo 300 vezes por rodada. Para mudar o limite: GitHub → **Settings → Secrets and variables → Actions → Variables** → `MAX_IA`.

---

## O que você precisa saber antes de divulgar

**De onde as vagas vêm, de verdade.** O robô traz vagas de três jeitos, todos permitidos:

1. Empresas que usam os sistemas de RH Greenhouse, Lever, SmartRecruiters, Recruitee ou Ashby. Esses sistemas oferecem um canal público feito para exibir as vagas em outros sites.
2. Empresas que publicam as vagas no próprio site no formato que o Google usa (JobPosting). O robô respeita o `robots.txt` de cada site: onde a empresa diz "não leia", ele não lê.
3. Empresas que se cadastram no Matchly, e os agregadores Adzuna e Jooble.

Das suas 100 mil empresas, só uma parte publica vagas em algum desses canais — muita empresa pequena divulga vaga em grupo de WhatsApp ou placa na porta. O painel mostra o número real depois da primeira semana.

**O que o robô não faz, de propósito:** ler LinkedIn, Indeed, Catho, InfoJobs ou Vagas.com. Os termos de uso desses sites proíbem, e eles bloqueiam quem tenta.

**Gupy.** É o sistema de vagas mais usado no Brasil. O robô só lê páginas da Gupy de empresas que se cadastraram no Matchly (elas autorizam ao informar o link). Para receber as vagas de todas as empresas da Gupy, o caminho oficial é se inscrever como *job board parceiro* na Gupy. Se aprovarem, eles mandam um link com todas as vagas liberadas — aí é só ligar um leitor novo no robô.

**Primeira volta completa.** Com 100 mil empresas, o robô leva uns 3 dias para passar por todas. Depois, empresas com vagas abertas são conferidas duas vezes por dia, e as sem vagas a cada 3 dias. Vaga que some do site da empresa sai do Matchly na rodada seguinte.

**Vagas suspeitas** (pedem dinheiro, prometem ganho fácil, usam link encurtado) não aparecem no site. Ficam marcadas para você revisar no Supabase: `select titulo, motivos_suspeita from vagas where suspeita;`. Se estiver tudo certo, mude `suspeita` para `false` no Table Editor.

**Minutos grátis do GitHub.** Repositório **público**: ilimitado. Repositório **privado**: 2.000 minutos por mês, que o robô de 3 em 3 horas pode ultrapassar. Deixar o repositório público é seguro — as chaves ficam guardadas em Secrets e não aparecem para ninguém. Se preferir privado, troque `*/3` por `*/8` no `coletar.yml`.

**Agendamento pausado.** Se o repositório ficar 60 dias sem nenhuma alteração, o GitHub pausa o robô e manda um e-mail. Basta entrar em **Actions → Coletar vagas → Enable workflow**.

**Login dos candidatos.** Por enquanto o perfil de cada pessoa fica guardado no próprio celular ou computador dela. Funciona, mas se ela trocar de aparelho, começa de novo. O banco já tem a tabela `perfis` pronta para o próximo passo: login com e-mail pelo Supabase.

**Adzuna.** Se ligar, o contrato deles pede que as vagas apareçam com a indicação da origem. O Matchly já mostra "Vaga encontrada em Adzuna" na página da vaga.

**Privacidade (LGPD).** Antes de divulgar para candidatos de verdade, publique uma política de privacidade dizendo quais dados você guarda e para quê. O site já tem a página de privacidade onde a pessoa controla o que mostra.
