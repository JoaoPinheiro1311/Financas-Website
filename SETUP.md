# 🚀 Quick Setup - Prepare for Vercel Deployment

Este ficheiro contém os passos rápidos para preparar seu projeto para Vercel.

## ✅ Checklist Pré-Deployment

### 1. Verificar Ficheiros Criados
- [ ] `.env.example` - Template de variáveis de ambiente
- [ ] `vercel.json` - Configuração Vercel
- [ ] `api/index.py` - Handler Vercel Python
- [ ] `api/wsgi.py` - WSGI wrapper
- [ ] `DEPLOY.md` - Guia completo de deployment

### 2. Verificar Dependências

```bash
# Python - executar na raiz do projeto
pip install -r requirements.txt

# Node.js
npm install
```

### 3. Testar Localmente

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
python app.py
```

Aceda a http://localhost:5174

### 4. Setup Google OAuth

1. Vá para https://console.cloud.google.com
2. Crie uma nova aplicação OAuth 2.0
3. Adicione credenciais:
   - **Tipos de cliente**: Web application
   - **URIs Autorizadas**:
     - http://localhost:5000/callback/google
     - https://seu-app.vercel.app/callback/google
     - https://seu-app.vercel.app/api/callback/google

4. Copie o `Client ID` e `Client Secret` para `.env`

### 5. Setup Supabase

1. Vá para https://supabase.com/dashboard
2. Crie um novo projeto ou use um existente
3. Vá para Settings > API > Project API Keys
4. Copie a `URL` e `Service Role Key` para `.env`

### 6. Configurar Git

```bash
git init
git add .
git commit -m "Initial commit - ready for Vercel"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

### 7. Deploy no Vercel

#### Opção A: Via CLI (mais rápido)

```bash
npm install -g vercel
vercel
```

Responda às perguntas:
- Project name: `seu-app-name`
- Framework: `Vite`
- Output directory: `dist`

#### Opção B: Via Vercel Dashboard

1. Vá para https://vercel.com/dashboard
2. New Project > Import Git Repository
3. Selecione seu repositório
4. Clique Import

### 8. Adicionar Variáveis de Ambiente no Vercel

No Vercel Dashboard:
1. Settings > Environment Variables
2. Adicione cada variável:

```
GOOGLE_CLIENT_ID → [seu-client-id]
GOOGLE_CLIENT_SECRET → [seu-secret]
REDIRECT_URI → https://seu-app.vercel.app/callback/google
FRONTEND_URL → https://seu-app.vercel.app
FLASK_SECRET_KEY → [gerar com: python -c "import secrets; print(secrets.token_hex(32))"]
SUPABASE_URL → [seu-url]
SUPABASE_SERVICE_KEY → [seu-service-key]
ALLOWED_ORIGINS → https://seu-app.vercel.app,http://localhost:5174
```

### 9. Verificar Deploy

1. Após push para main, Vercel fará deploy automático
2. Vá para: https://seu-app.vercel.app
3. Se tiver erro 502, verifique:
   - Variáveis de ambiente no Vercel
   - Logs em Vercel Dashboard > Functions
   - Google OAuth redirect URI

## 🔧 Configuração Avançada

### SSL/TLS
- Vercel configura automaticamente (grátis com Let's Encrypt)

### Custom Domain
1. Vercel Dashboard > Settings > Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

### Analytics e Monitoramento
- Vercel Analytics já está incluído
- Vá para Analytics no dashboard para ver métricas

## 🐛 Troubleshooting

### Erro 502 - Bad Gateway
```
Motivo: API Python não está respondendo
Solução:
1. Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` estão configurados
2. Verifique os logs em Vercel > Functions
3. Teste a API com: curl https://seu-app.vercel.app/api/health
```

### Erro CORS
```
Motivo: Origin não permitido
Solução:
1. Atualize `ALLOWED_ORIGINS` no Vercel
2. Incluir `https://seu-app.vercel.app` (com https)
3. Aguarde 5 minutos para o cache limpar
```

### Sessão não persiste
```
Motivo: Flask sessions não funcionam bem em serverless
Solução: 
1. Implementar JWT em vez de sessões
2. Usar localStorage para tokens
3. Exemplo: auth.ts/js com localStorage
```

## 📚 Recursos Úteis

- [Vercel Python Support](https://vercel.com/docs/functions/serverless-functions/python-support)
- [Flask on Vercel](https://vercel.com/guides/using-flask-with-vercel)
- [Google OAuth Setup](https://console.cloud.google.com)
- [Supabase Docs](https://supabase.com/docs)

## 📞 Próximos Passos

1. [ ] Implementar JWT para melhor persistência de sessão
2. [ ] Adicionar rate limiting
3. [ ] Setup CI/CD com GitHub Actions
4. [ ] Implementar caching com Vercel KV
5. [ ] Adicionar testes automatizados
6. [ ] Implementar logging centralizado
7. [ ] Setup de backups do Supabase

---

**Quando estiver pronto, rode:**
```bash
git push origin main
```

Vercel fará o deploy automaticamente! 🚀
