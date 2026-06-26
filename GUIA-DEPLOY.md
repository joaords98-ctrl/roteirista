# 🚀 Guia de Deploy — RoterizAI

Você não precisa programar pra colocar isso no ar. Siga na ordem. Tempo estimado: **40-60 min** na primeira vez.

Você vai conectar 3 serviços (todos com plano grátis pra começar):
- **GitHub** → guarda o código
- **Supabase** → banco de dados + login
- **Vercel** → coloca o site no ar
- **Anthropic** → a IA que escreve os roteiros (essa é paga por uso, ~centavos por roteiro)

---

## PARTE 1 — Chave da Anthropic (a IA)

1. Acesse **https://console.anthropic.com**
2. Crie a conta (ou faça login).
3. No menu, vá em **Settings → Billing** e adicione **créditos** (pode começar com US$ 5; cada roteiro custa fração de centavo).
4. Vá em **Settings → API Keys → Create Key**.
5. Dê um nome (ex: "roteiro-mvp") e **copie a chave** (começa com `sk-ant-...`).
   - ⚠️ Ela só aparece UMA vez. Cole num bloco de notas temporário.

---

## PARTE 2 — Supabase (banco + login)

1. Acesse **https://supabase.com** → **Start your project** → login com GitHub.
2. **New project**. Dê um nome, crie uma **senha de banco** (guarde) e escolha a região (ex: South America / São Paulo).
3. Espere ~2 min o projeto subir.
4. No menu lateral: **SQL Editor → New query**.
5. Abra o arquivo `supabase-schema.sql` (está na pasta do projeto), **copie TODO o conteúdo**, cole no editor e clique **Run**. Deve aparecer "Success".
6. Agora pegue as credenciais: menu **Project Settings (engrenagem) → Data API**:
   - Copie o **Project URL** (algo como `https://xxxx.supabase.co`)
   - Copie a **anon public key** (chave longa)
7. **Importante — desligar confirmação de e-mail** (pra testar rápido):
   - Menu **Authentication → Sign In / Providers → Email** (ou **Settings**).
   - Desmarque **"Confirm email"** e salve. (Em produção real, deixe ligado.)

---

## PARTE 3 — Subir o código pro GitHub

**Opção A — pelo site (sem terminal):**
1. Crie conta em **https://github.com**.
2. **New repository** → nome `roteiro-mvp` → **Private** → Create.
3. Na pasta do projeto no seu PC, descompacte o ZIP que recebeu.
4. Na página do repo vazio, clique **"uploading an existing file"** e arraste TODOS os arquivos e pastas (menos `node_modules` e `.env.local`, que já estão no `.gitignore`).
5. **Commit changes**.

**Opção B — com Git instalado (terminal):**
```bash
cd roteiro-mvp
git init
git add .
git commit -m "MVP inicial"
git remote add origin https://github.com/SEU-USUARIO/roteiro-mvp.git
git push -u origin main
```

---

## PARTE 4 — Vercel (colocar no ar)

1. Acesse **https://vercel.com** → login com GitHub.
2. **Add New → Project** → selecione o repositório `roteiro-mvp` → **Import**.
3. Antes de clicar Deploy, abra **Environment Variables** e adicione as 3 chaves:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | seu Project URL do Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sua anon key do Supabase |
   | `ANTHROPIC_API_KEY` | sua chave `sk-ant-...` |

4. Clique **Deploy**. Espere ~2 min.
5. Vai aparecer um link tipo `https://roteiro-mvp.vercel.app`. **Está no ar!**

---

## PARTE 5 — Testar

1. Abra o link da Vercel.
2. Clique **Cadastre-se**, crie uma conta com e-mail e senha.
3. Preencha o **perfil** (Camada 2).
4. No dashboard, descreva uma apuração e clique **Gerar roteiro**.
5. O roteiro aparece com a verificação de compliance automática. 🎉

---

## 💡 Rodar no seu PC antes (opcional)

Se quiser testar local primeiro:
```bash
cd roteiro-mvp
npm install
# crie um arquivo .env.local com as 3 chaves (use .env.example como modelo)
npm run dev
# abra http://localhost:3000
```

---

## ❓ Problemas comuns

- **"Failed to fetch" ao gerar**: a `ANTHROPIC_API_KEY` está errada ou sem créditos. Confira no Console da Anthropic.
- **Não consigo cadastrar / "email not confirmed"**: você esqueceu de desligar "Confirm email" no Supabase (Parte 2, passo 7).
- **"relation perfis does not exist"**: o SQL da Parte 2 não rodou. Refaça o passo 5.
- **Mudou variável de ambiente na Vercel?** Precisa **Redeploy** (aba Deployments → ⋯ → Redeploy).

---

## 🔮 Próximos passos (Camada 2 avançada — DNA que aprende)

Este MVP já salva métricas reais por vídeo. O próximo passo natural é criar uma função que lê o histórico de roteiros + métricas e **recalcula o DNA Editorial automaticamente** (ex: "seus hooks com número rendem 18% mais retenção"). A estrutura do banco (`dna` em jsonb + colunas de métricas) já está pronta pra isso — é só pedir quando quiser evoluir.
