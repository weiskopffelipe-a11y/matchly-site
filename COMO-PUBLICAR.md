# Como colocar o Matchly no ar — passo a passo

Você vai usar dois programas grátis:
- **GitHub Desktop**: guarda os arquivos do site.
- **Vercel**: transforma esses arquivos num site com link.

> Se você já fez a Parte A antes, pule direto para a **Parte C**.

---

## Parte A — Preparar (só na primeira vez)

### 1. Criar uma conta no GitHub
1. Abra o site **github.com**.
2. Clique em **Sign up**, no canto de cima.
3. Digite seu e-mail, crie uma senha e escolha um nome de usuário.
4. Confirme o código que chegar no seu e-mail.

### 2. Instalar o GitHub Desktop
1. Abra o site **desktop.github.com**.
2. Clique no botão roxo **Download for Windows**.
3. Abra o arquivo baixado. Ele instala sozinho.
4. Quando o programa abrir, clique em **Sign in to GitHub.com**.
5. Vai abrir o navegador. Clique no botão verde **Authorize desktop**.
6. Volte para o GitHub Desktop e clique em **Finish**.

### 3. Extrair o site
1. Abra a pasta **Downloads**.
2. Clique com o botão direito em `matchly-computador.zip`.
3. Escolha **Extrair tudo** e depois clique em **Extrair**.
4. Vai aparecer uma pasta `matchly-computador`. Dentro dela está a pasta `matchly`.

---

## Parte B — Colocar o site no ar (só na primeira vez)

### 4. Colocar os arquivos no GitHub
1. No GitHub Desktop, clique em **File**, no canto de cima à esquerda.
2. Clique em **Add local repository**.
3. Clique em **Choose...** e escolha a pasta `matchly` (a que está dentro de `matchly-computador`).
4. Vai aparecer um aviso em vermelho. Clique no link azul **create a repository**.
5. Na janela que abrir, não mude nada. Clique em **Create repository**.
6. No alto da tela, clique no botão azul **Publish repository**.
7. **Desmarque** o quadradinho **Keep this code private**.
8. Clique em **Publish repository**.

### 5. Ligar a Vercel
1. Abra o site **vercel.com**.
2. Clique em **Sign Up**.
3. Escolha **Hobby**, digite seu nome e clique em **Continue**.
4. Clique em **Continue with GitHub** e depois em **Authorize Vercel**.
5. Na tela da Vercel, clique em **Add New...** e depois em **Project**.
6. Na lista, procure `matchly` e clique em **Import** ao lado dele.
   *Se `matchly` não aparecer na lista, clique em **Adjust GitHub App Permissions**, escolha **All repositories** e clique em **Save**.*
7. Na tela seguinte, não mude nada. Clique em **Deploy**.
8. Espere 1 ou 2 minutos, até aparecer **Congratulations!**.
9. Clique em **Continue to Dashboard**.
10. O link do seu site aparece em **Domains**. Ele termina com `.vercel.app`.

✅ **Pronto! O site está no ar.** Copie esse link e mande para quem você quiser.

---

## Parte C — Mudar o site depois (sempre que eu mandar um arquivo novo)

### 6. Trocar o arquivo
1. Baixe o arquivo novo que eu mandar (por exemplo, `matchly.jsx`). Ele vai para a pasta **Downloads**.
   *Se ele chegar com o nome `matchly (1).jsx`, clique com o botão direito, escolha **Renomear** e deixe só `matchly.jsx`.*
2. Abra a pasta `Downloads` → `matchly-computador` → `matchly` → `src`.
3. Apague o `matchly.jsx` que está lá.
4. Copie o `matchly.jsx` novo e cole dentro da pasta `src`.

### 7. Enviar a mudança
1. Abra o GitHub Desktop.
2. À esquerda, vai aparecer **1 changed file**.
3. Embaixo, à esquerda, no campo **Summary**, escreva: `Site novo`.
4. Clique no botão azul **Commit to main**.
5. No alto da tela, clique em **Push origin**.

✅ **Em 2 minutos o site muda sozinho.** Para conferir, abra a Vercel, entre em **Deployments** e veja se aparece **Ready** em verde.

---

## Se der algum problema

- **Aparece "Error" na Vercel:** abra o erro, tire um print e me mande.
- **O site não mudou:** veja se você clicou em **Push origin**. Depois aperte **Ctrl + F5** no site.
- **O GitHub Desktop não mostra "1 changed file":** o arquivo foi colado na pasta errada. Ele precisa ficar dentro da pasta `src`.

Para ligar o banco de dados e o robô de vagas (opcional), veja o arquivo `DETALHES.md`.
