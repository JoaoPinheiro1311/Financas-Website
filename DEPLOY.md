# Finanças Inteligentes - Guia de Deployment no Vercel

## 📋 Visão Geral da Arquitetura

Este projeto é uma aplicação full-stack:
- **Frontend**: React + Vite (hospedado em Vercel)
- **Backend**: Flask + Python (serverless functions em Vercel)
- **Database**: Supabase (PostgreSQL gerenciado)

## 🚀 Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

1. **Conta no Vercel** - https://vercel.com/signup
2. **Conta no Supabase** - https://supabase.com
3. **Projeto Google Cloud** com OAuth configurado
4. **Git** instalado localmente
5. **Node.js** 18+ e npm/yarn

## 🔧 Configuração Local

### 1. Variáveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Preencha com os seus dados:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
REDIRECT_URI=http://localhost:5000/callback/google
FRONTEND_URL=http://localhost:5174

# Flask
FLASK_SECRET_KEY=seu-secret-key-aleatorio

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...seu-service-key

# APIs (Opcional)
GOOGLE_API_KEY=sua-api-key
MASSIVE_API_KEY=sua-massive-api-key
OPENAI_API_KEY=sua-openai-api-key
```

### 2. Instalação de Dependências

```bash
# Instalar dependências Node.js
npm install

# Instalar dependências Python (recomendado em venv)
python -m venv venv
source venv/bin/activate  # ou `venv\Scripts\activate` no Windows
pip install -r requirements.txt
```

### 3. Executar Localmente

```bash
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: Backend (Flask)
python app.py
```

Aceda a `http://localhost:5174` no browser.

## 🌐 Deploy no Vercel

### 1. Prepara o Repositório Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

### 2. Conectar no Vercel

Opção A: Via CLI
```bash
npm install -g vercel
vercel
```

Opção B: Via Dashboard
1. Vá para https://vercel.com/dashboard
2. Clique em "Add New..." > "Project"
3. Selecione seu repositório Git
4. Clique "Import"

### 3. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel:
1. Vá para "Settings" > "Environment Variables"
2. Adicione todas as variáveis do `.env.example`:

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
REDIRECT_URI → https://seu-app.vercel.app/callback/google
FRONTEND_URL → https://seu-app.vercel.app
FLASK_SECRET_KEY
SUPABASE_URL
SUPABASE_SERVICE_KEY
GOOGLE_API_KEY (opcional)
MASSIVE_API_KEY (opcional)
OPENAI_API_KEY (opcional)
ALLOWED_ORIGINS → https://seu-app.vercel.app,http://localhost:5174
```

### 4. Configurar Google OAuth para Vercel

No Google Cloud Console:
1. Vá para "APIs & Services" > "Credentials"
2. Selecione sua aplicação OAuth
3. Adicione em "Authorized redirect URIs":
   - `https://seu-app.vercel.app/callback/google`
   - `https://seu-app.vercel.app/api/callback/google`

### 5. Deploy

```bash
git push origin main
```

O Vercel fará o deploy automaticamente!

## 📁 Estrutura do Projeto

```
.
├── api/                        # Serverless functions Python
│   ├── __init__.py
│   ├── index.py               # Handler Vercel
│   └── wsgi.py                # WSGI wrapper
├── src/                        # Frontend React
│   ├── components/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── app.py                      # Backend Flask
├── requirements.txt            # Dependências Python
├── package.json                # Dependências Node.js
├── vercel.json                 # Configuração Vercel
├── vite.config.js              # Configuração Vite
├── tailwind.config.js          # Configuração Tailwind
└── index.html                  # HTML principal
```

## 🔗 Endpoints da API

### Autenticação
- `POST /login/google` - Inicia login OAuth
- `GET /callback/google` - Callback OAuth
- `POST /api/logout` - Faz logout

### Protegidos (requerem autenticação)
- `GET /api/dashboard` - Info do utilizador
- `GET /api/categories` - Lista categorias
- `GET /api/transactions` - Lista transações
- `POST /api/transactions` - Cria transação
- `GET /api/activity-summary` - Resumo atividade
- `GET /api/financial-health` - Saúde financeira
- `GET /api/savings-goals` - Objetivos poupança
- `POST /api/savings-goals` - Cria objetivo
- `GET /api/user/settings` - Configurações
- `PUT /api/user/settings` - Atualiza configurações
- `GET /api/investments/stocks` - Lista investimentos
- `POST /api/investments/stocks` - Adiciona investimento
- `GET /api/stock/<symbol>` - Dados ação
- `POST /api/chat` - Chatbot finanças

### Públicos (web services)
- `GET /ws/users/<user_id>/transactions` - Transações públicas
- `GET /ws/users/<user_id>/summary` - Resumo público
- `GET /ws/users/<user_id>/savings-goals` - Objetivos públicos

## 🐛 Troubleshooting

### Erro: "GOOGLE_CLIENT_ID not configured"
- Verifique as variáveis no Vercel Dashboard
- Confirme que usou os nomes exatos das variáveis

### Erro: "Database not configured"
- Adicione `SUPABASE_URL` e `SUPABASE_SERVICE_KEY`
- Confirme que a base de dados Supabase está online

### Erro CORS
- Atualize `ALLOWED_ORIGINS` no Vercel com seu domínio
- Certifique-se de incluir `https://` (não `http://`)

### Sessão não persiste
- Flask usa cookies de sessão - Vercel pode ter limitações
- Considere usar JWT ou localStorage para autenticação
- Verifique `SESSION_COOKIE_SECURE=True` para HTTPS

### Problema com ficheiros estáticos
- Vercel automáticamente serve ficheiros em `/public`
- Para `/dist`, use o `outputDirectory` em `vercel.json`

## 📊 Monitoramento

No Vercel Dashboard:
- **Deployments**: Ver histórico e logs
- **Functions**: Monitorar uso serverless
- **Analytics**: Traffic e performance

## 🔐 Segurança

Checklist antes de ir para produção:

- [ ] Mudar `FLASK_SECRET_KEY` para um valor aleatório
- [ ] Usar variáveis de ambiente para todas as chaves
- [ ] HTTPS ativado (Vercel faz automaticamente)
- [ ] CORS configurado apenas para domínios necessários
- [ ] Validação de input em todos os endpoints
- [ ] Rate limiting considerado (usar middleware)
- [ ] Logs de segurança configurados no Supabase

## 📞 Suporte

- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Flask**: https://flask.palletsprojects.com
- **Documentação Supabase**: https://supabase.com/docs
- **Documentação React**: https://react.dev

## 📝 Notas Importantes

1. **Serverless Python**: O Flask é executado como serverless functions
2. **Cold Starts**: Primeira execução pode ser lenta (~1-2s)
3. **Sessões**: Usar Supabase ou JWT para manter sessões entre requisições
4. **Limite de tempo**: Funções serverless têm timeout (Vercel: 60s)
5. **Limitações Vercel Free**: 100GB bandwidth/mês, máx 100 execuções/dia

## 🎯 Próximos Passos

1. Implementar JWT para autenticação (melhor que sessões)
2. Adicionar rate limiting
3. Implementar caching (Redis ou Vercel KV)
4. Setup CI/CD avançado
5. Monitoramento e alertas
6. Testes automatizados

---

**Boa sorte com o deployment! 🚀**
