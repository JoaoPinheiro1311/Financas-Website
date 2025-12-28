# 🔐 Configuração Google OAuth - Importante!

## ⚠️ Erro Atual: redirect_uri_mismatch

Você recebeu este erro porque o Google OAuth não reconhece a `redirect_uri` que o seu app está usando.

---

## 🔧 Como Corrigir

### Passo 1: Ir para Google Cloud Console
1. Ir para https://console.cloud.google.com
2. Selecionar seu projeto
3. APIs & Services > Credentials
4. Selecionar a aplicação OAuth 2.0 do tipo "Web application"

### Passo 2: Adicionar Redirect URIs

**Encontrar a seção "Authorized redirect URIs"**

Limpar as URIs antigas e adicionar APENAS estas 2:

```
http://localhost:5000/callback/google
https://financas-website.vercel.app/callback/google
```

**IMPORTANTE:**
- Use `https://` em produção (não `http://`)
- Não use `/api/callback/google` (o Vercel reescreve automaticamente)
- Não use `/callback` sem `/google`

### Passo 3: Salvar

Clique em "Save" para salvar as alterações.

---

## 🌐 Como funciona no seu app

### Fluxo de Login

1. **Utilizador clica "Login com Google"** (frontend React)
   ```
   https://financas-website.vercel.app/login
   → Botão clica em LoginButton.jsx
   ```

2. **Redireciona para /login/google** (Flask)
   ```
   POST /login/google
   → Flask constrói URL Google OAuth
   → Redireciona para: https://accounts.google.com/o/oauth2/v2/auth?...&redirect_uri=https://financas-website.vercel.app/callback/google
   ```

3. **Utilizador faz login no Google**
   ```
   Google autentica o utilizador
   ```

4. **Google redireciona de volta para seu app**
   ```
   GET https://financas-website.vercel.app/callback/google?code=...&state=...
   → Vercel reescreve para /api (Flask handler)
   → Flask processa o callback
   → Flask cria sessão do utilizador
   → Flask redireciona para /dashboard
   ```

5. **Utilizador vê Dashboard**
   ```
   https://financas-website.vercel.app/dashboard
   ```

---

## ✅ Variáveis de Ambiente Vercel

Certifique-se que estas estão corretas no Vercel Dashboard:

| Variável | Valor | Notas |
|----------|-------|-------|
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Do Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `gho_xxx` | Do Google Cloud Console |
| `REDIRECT_URI` | `https://financas-website.vercel.app/callback/google` | ⭐ IMPORTANTE: https:// |
| `FRONTEND_URL` | `https://financas-website.vercel.app` | Seu domínio Vercel |

---

## 🧪 Teste Local

Para testar localmente:

1. Certifique-se que `REDIRECT_URI=http://localhost:5000/callback/google` no `.env`
2. Adicionar `http://localhost:5000/callback/google` ao Google Cloud Console
3. Executar:
   ```bash
   npm run dev      # Terminal 1
   python app.py    # Terminal 2
   ```
4. Ir para http://localhost:5174
5. Clicar em "Login com Google"

---

## 📋 Checklist

- [ ] Google Cloud Console acessível
- [ ] Projeto OAuth 2.0 encontrado
- [ ] Redirect URIs limpos (apenas 2)
- [ ] `http://localhost:5000/callback/google` adicionado
- [ ] `https://financas-website.vercel.app/callback/google` adicionado
- [ ] "Save" clicado
- [ ] Aguardado ~1 minuto para aplicar
- [ ] Variáveis no Vercel atualizadas (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] Vercel fez novo deploy
- [ ] Teste no https://financas-website.vercel.app

---

## 🔍 Debug

Se ainda receber erro:

1. **Verificar Logs Vercel**
   ```
   Vercel Dashboard > Functions > Ver logs
   ```

2. **Copiar o erro exato**
   - Qual é o `redirect_uri` que o Google está rejeitando?
   - Comparar com o que está no Google Cloud Console

3. **Verificar URL completa no browser**
   ```
   https://accounts.google.com/o/oauth2/v2/auth?
   client_id=YOUR_CLIENT_ID&
   redirect_uri=https://seu-app.vercel.app/callback/google&
   ...
   ```

4. **Limpar browser cache**
   - Ctrl+Shift+Delete (ou Cmd+Shift+Delete no Mac)
   - Limpar cookies e site data

---

## 💡 Dicas

- O Google demora ~1 minuto para aplicar alterações
- Se mudou o `client_id` ou `secret`, precisa atualizar no Vercel
- OAuth é sensível a maiúsculas/minúsculas
- Sempre use `https://` em produção
- Para localhost sempre use `http://`

---

**Após fazer estas mudanças, faça novo commit e push:**

```bash
git add .
git commit -m "Fix: Update OAuth redirect URIs"
git push origin main
```

Vercel fará novo deploy automaticamente!
