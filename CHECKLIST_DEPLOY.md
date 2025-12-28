# 🎯 Checklist de Deploy - Vercel

## ✅ Fase 1: Preparação Local (Faça isto ANTES de push)

### Dependências
- [ ] `npm install` - instalou dependências Node
- [ ] `pip install -r requirements.txt` - instalou Python deps
- [ ] Nenhum erro durante instalação

### Configuração
- [ ] Copiar `.env.example` para `.env`
- [ ] Preencher todas as variáveis em `.env`
- [ ] `GOOGLE_CLIENT_ID` preenchido
- [ ] `GOOGLE_CLIENT_SECRET` preenchido
- [ ] `SUPABASE_URL` preenchido
- [ ] `SUPABASE_SERVICE_KEY` preenchido
- [ ] `FLASK_SECRET_KEY` é valor aleatório

### Teste Local
- [ ] Terminal 1: `npm run dev` funciona (http://localhost:5174)
- [ ] Terminal 2: `python app.py` funciona (http://localhost:5000)
- [ ] Pode aceder a homepage
- [ ] Pode tentar login Google

### Build
- [ ] `npm run build` funciona sem erros
- [ ] Pasta `dist/` criada
- [ ] `npm run preview` funciona

---

## ✅ Fase 2: Git Setup

### Repositório
- [ ] GitHub account criada
- [ ] Repositório criado (não clonado, novo)
- [ ] Inicial commit local

### Comandos Git
```bash
git init                                          # ✓
git add .                                         # ✓
git commit -m "Initial commit - Vercel ready"   # ✓
git branch -M main                               # ✓
git remote add origin https://github.com/...    # ✓
git push -u origin main                         # ✓
```

---

## ✅ Fase 3: Vercel Setup

### Criação App
- [ ] Ir para vercel.com/dashboard
- [ ] "Add New" > "Project"
- [ ] Seleccionar repositório GitHub
- [ ] Clicker "Import"
- [ ] Vercel fez o primeiro deploy

### Variáveis de Ambiente
No Vercel Dashboard > Settings > Environment Variables:

```
GOOGLE_CLIENT_ID
✓ Adicionado: [ ]

GOOGLE_CLIENT_SECRET  
✓ Adicionado: [ ]

REDIRECT_URI
✓ Valor: https://seu-app.vercel.app/callback/google
✓ Adicionado: [ ]

FRONTEND_URL
✓ Valor: https://seu-app.vercel.app
✓ Adicionado: [ ]

FLASK_SECRET_KEY
✓ Valor: [gerar com: python -c "import secrets; print(secrets.token_hex(32))"]
✓ Adicionado: [ ]

SUPABASE_URL
✓ Adicionado: [ ]

SUPABASE_SERVICE_KEY
✓ Adicionado: [ ]

ALLOWED_ORIGINS
✓ Valor: https://seu-app.vercel.app,http://localhost:5174
✓ Adicionado: [ ]

GOOGLE_API_KEY (opcional)
✓ Adicionado: [ ]

MASSIVE_API_KEY (opcional)
✓ Adicionado: [ ]

OPENAI_API_KEY (opcional)
✓ Adicionado: [ ]
```

---

## ✅ Fase 4: Google OAuth Configuração

### Google Cloud Console
- [ ] Ir para console.cloud.google.com
- [ ] Seleccionar seu projeto
- [ ] APIs & Services > Credentials
- [ ] OAuth 2.0 Client IDs (seleccionar)

### Authorized redirect URIs
Adicionar estas 2 linhas:
```
- [ ] http://localhost:5000/callback/google
- [ ] https://seu-app.vercel.app/callback/google
```

- [ ] Salvar alterações
- [ ] Copiar Client ID para Vercel
- [ ] Copiar Client Secret para Vercel

---

## ✅ Fase 5: Supabase Verificação

### Database
- [ ] Supabase project criado
- [ ] Database "users" existe
- [ ] Database "expenses" existe
- [ ] Database "categories" existe
- [ ] Database "savings_goals" existe
- [ ] Database "investments" existe
- [ ] Database "user_settings" existe

### API Keys
- [ ] Settings > API > Project URL copiado
- [ ] Settings > API > Service Role Key copiado

### Backups
- [ ] Database backups automáticos ativados

---

## ✅ Fase 6: Verificação Final

### Health Check
Visitando `https://seu-app.vercel.app/api/health`:
- [ ] Retorna: `{"status": "ok"}`

### Frontend
Visitando `https://seu-app.vercel.app`:
- [ ] Página carrega
- [ ] Styling correcto
- [ ] Nenhum erro de console

### Login
Clicando em "Login com Google":
- [ ] Redireciona para Google
- [ ] Após aceitar, volta para app
- [ ] Dashboard carrega
- [ ] Utilizador logged in

---

## ❌ Troubleshooting

### Se erro 404
- [ ] Verificar logs em Vercel > Functions
- [ ] Confirmar `SUPABASE_URL` no Vercel
- [ ] Confirmar `SUPABASE_SERVICE_KEY` no Vercel
- [ ] Fazer novo deploy: `git push origin main`

### Se erro 502
- [ ] Variáveis de ambiente incompletas
- [ ] Supabase API não responde
- [ ] Timeout na requisição
- [ ] Ver logs: `vercel logs`

### Se erro CORS
- [ ] Atualizar `ALLOWED_ORIGINS` no Vercel
- [ ] Incluir seu domínio com https://
- [ ] Aguardar 5 minutos para cache limpar
- [ ] Testar com `curl -H "Origin: https://seu-app.vercel.app"`

### Se sessão não persiste
- [ ] Considera implementar JWT
- [ ] Usar localStorage para tokens
- [ ] Check: `SESSION_COOKIE_SECURE=True`

---

## 📊 Pós-Deploy Monitoramento

### Vercel Dashboard
- [ ] Deployments history
- [ ] Functions > Invocations
- [ ] Analytics > Traffic
- [ ] Logs para errors

### Supabase Dashboard
- [ ] Database logs
- [ ] Performance metrics
- [ ] Storage usage
- [ ] Backup status

### Google Analytics (opcional)
- [ ] Setup Google Analytics para site

---

## 🎉 Sucesso!

Se tudo passou:
- [x] **App está em produção! 🚀**
- [x] **Todos podem aceder online**
- [x] **Google OAuth funciona**
- [x] **Database conectado**
- [x] **Pronto para milhões de utilizadores!**

---

## 📞 Próximas Melhorias

Priority 1:
- [ ] Implementar JWT
- [ ] Rate limiting
- [ ] Error monitoring

Priority 2:
- [ ] Caching strategies
- [ ] Image optimization
- [ ] SEO improvements

Priority 3:
- [ ] Mobile app
- [ ] Offline mode
- [ ] Push notifications

---

**Data Completação**: _______________  
**Versão App**: _______________  
**Notas**: _______________

---

Print este checklist e marque conforme progride! ✅
