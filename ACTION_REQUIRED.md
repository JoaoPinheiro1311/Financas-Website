# 🎯 AÇÃO IMEDIATA NECESSÁRIA

## ⏱️ Tempo: 5-10 minutos

---

## O Problema

Seu app está em **https://financas-website.vercel.app** mas o Google está rejeitando o login porque a configuração no Google Cloud Console não corresponde.

**Erro**: `redirect_uri_mismatch`

---

## A Solução (3 passos)

### PASSO 1️⃣: Abrir Google Cloud Console
```
https://console.cloud.google.com
```

### PASSO 2️⃣: Encontrar OAuth Settings
1. Seleccione seu projeto
2. "APIs & Services"
3. "Credentials"
4. Seleccione "OAuth 2.0 Client ID" (tipo: Web application)

### PASSO 3️⃣: Adicionar Redirect URIs

**Encontre a secção: "Authorized redirect URIs"**

**Limpe o que lá está e adicione APENAS estas 2 linhas:**

```
http://localhost:5000/callback/google
https://financas-website.vercel.app/callback/google
```

**Depois clique: "SAVE"**

---

## ✅ Pronto!

Aguarde 1-2 minutos e teste:  
https://financas-website.vercel.app

---

## Dúvidas?

Ler o ficheiro: **`OAUTH_FIX.md`**

---

**Tudo pronto no backend! Agora é só Google OAuth.** ✅
