Relatório Técnico Final - FinanceLog

Projeto: FinanceLog - Plataforma de Gestão Financeira Inteligente
Data: Janeiro 2026
Autor: João Pinheiro

═══════════════════════════════════════════════════════════════════════════

1. RESUMO DO PROJETO

O FinanceLog é uma plataforma web de gestão financeira pessoal que permite aos utilizadores controlar despesas, receitas, investimentos e objetivos de poupança de forma integrada. O projeto surge da necessidade crescente de ferramentas digitais que facilitem a literacia financeira e auxiliem na tomada de decisões informadas sobre finanças pessoais.

A solução oferece autenticação segura via OAuth, dashboard interativo, chatbot com inteligência artificial para aconselhamento financeiro, e integração com mercados de ações e criptomoedas em tempo real.

Objetivos principais:
• Centralizar informações financeiras pessoais numa única plataforma
• Proporcionar análise automática da saúde financeira
• Oferecer aconselhamento financeiro através de IA
• Facilitar o acompanhamento de investimentos e objetivos de poupança

═══════════════════════════════════════════════════════════════════════════

2. ARQUITETURA E TECNOLOGIAS

2.1 Arquitetura Geral

O sistema segue uma arquitetura cliente-servidor com separação clara entre front-end e back-end:

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React SPA     │ ◄────── │   Flask API     │ ◄────── │  Supabase DB    │
│  (Front-end)    │  HTTPS  │   (Back-end)    │  REST   │  (PostgreSQL)   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                            
        │                           ├────────► Google OAuth 2.0
        │                           │
        │                           ├────────► Google Gemini AI
        │                           │
        └───────────────────────────┴────────► APIs Externas
                                               (Mercados Financeiros)

2.2 Stack Tecnológico

Front-End:
• React 18.2 - Framework principal para interfaces reativas
• React Router 6 - Gestão de rotas e navegação SPA
• Vite 5 - Ferramenta de build rápida e otimizada
• Tailwind CSS 3.4 - Framework CSS utility-first para design responsivo
• Vercel - Plataforma de deployment e hosting

Back-End:
• Flask 3.0 - Framework web Python minimalista e flexível
• Flask-CORS - Gestão de políticas CORS para comunicação segura
• Python-Jose - Validação e gestão de tokens JWT
• Google GenAI 1.56 - Cliente Python para integração com Gemini
• Supabase Client 2.27 - SDK para interação com base de dados

Base de Dados:
• Supabase (PostgreSQL) - Base de dados relacional como serviço
• JSONB - Armazenamento flexível de notificações

Justificativas:
• React + Vite: Desenvolvimento rápido com Hot Module Replacement e bundle otimizado
• Flask: Leveza e flexibilidade para APIs RESTful sem overhead desnecessário
• Supabase: Solução gerida que reduz complexidade operacional, oferece Row Level Security e backups automáticos
• Tailwind CSS: Desenvolvimento ágil de interfaces responsivas sem sair do HTML
• OAuth 2.0: Standard da indústria para autenticação segura sem gestão de palavras-passe

═══════════════════════════════════════════════════════════════════════════

3. BASE DE DADOS

3.1 Modelo Entidade-Relacionamento

Código Mermaid para gerar diagrama (colar em https://mermaid.live):

erDiagram
    users ||--o{ categories : "cria"
    users ||--o{ expenses : "regista"
    users ||--o{ budgets : "define"
    users ||--o{ savings_goals : "estabelece"
    users ||--o{ investments : "possui"
    users ||--o{ notifications : "recebe"
    categories ||--o{ expenses : "categoriza"
    investments ||--o{ investment_tx : "gera"
    
    users {
        bigint id PK
        text external_id
        text provider
        text display_name
        text email UK
        timestamp created_at
    }
    
    categories {
        int id PK
        bigint user_id FK
        text name
        text colour
    }
    
    expenses {
        int id PK
        bigint user_id FK
        enum type
        numeric amount
        char currency
        int category_id FK
        date date
        text notes
        timestamp created_at
    }
    
    budgets {
        int id PK
        bigint user_id FK
        text name
        numeric amount
        enum period
        date start_date
        date end_date
    }
    
    savings_goals {
        int id PK
        bigint user_id FK
        text name
        numeric target_amount
        numeric current_amount
        date deadline
    }
    
    investments {
        int id PK
        bigint user_id FK
        text symbol
        enum market
        numeric quantity
        numeric avg_price
        numeric last_price
        char currency
    }
    
    investment_tx {
        int id PK
        int investment_id FK
        enum type
        numeric quantity
        numeric price
        date date
    }
    
    notifications {
        int id PK
        bigint user_id FK
        text type
        jsonb payload
        boolean is_read
        timestamp created_at
    }

3.2 Tabelas Principais

users - Armazenamento de utilizadores autenticados
• Campos: id, external_id, provider, display_name, email, created_at
• Constraint: Unicidade em (external_id, provider)

expenses - Registo de transações financeiras
• Campos: id, user_id, type (ENUM: expense/income), amount, currency, category_id, date, notes
• Constraint: amount > 0

investments - Portfólio de ativos
• Campos: id, user_id, symbol, market (ENUM: stock/crypto), quantity, avg_price, last_price, currency
• Constraint: Unicidade em (user_id, symbol)

savings_goals - Objetivos de poupança
• Campos: id, user_id, name, target_amount, current_amount, deadline
• Constraint: target_amount > 0

3.3 Queries Principais

Resumo financeiro mensal:

SELECT 
  type,
  SUM(amount) as total,
  currency
FROM expenses
WHERE user_id = ? AND date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY type, currency;

Portfólio de investimentos com valor atual:

SELECT 
  symbol,
  market,
  quantity,
  avg_price,
  last_price,
  (quantity * last_price) as current_value,
  ((last_price - avg_price) / avg_price * 100) as return_percentage
FROM investments
WHERE user_id = ? AND quantity > 0
ORDER BY current_value DESC;

Progresso de objetivos de poupança:

SELECT 
  name,
  target_amount,
  current_amount,
  (current_amount::float / target_amount * 100) as progress_percentage,
  deadline
FROM savings_goals
WHERE user_id = ?
ORDER BY deadline ASC;

═══════════════════════════════════════════════════════════════════════════

4. INTEGRAÇÃO DE SERVIÇOS EXTERNOS

4.1 Google OAuth 2.0

Implementação:
• Authorization Code Flow com PKCE
• Validação de tokens JWT com chaves públicas Google (JWKS)
• Sincronização automática de utilizadores na base de dados
• Gestão de sessões com Flask session cookies

Endpoints utilizados:
• accounts.google.com/o/oauth2/v2/auth - Autorização
• oauth2.googleapis.com/token - Troca de código por tokens
• www.googleapis.com/oauth2/v3/userinfo - Dados do utilizador

4.2 Google Gemini AI

Funcionalidade: Chatbot de aconselhamento financeiro personalizado

Implementação:
• Modelo: gemini-1.5-flash (otimizado para conversação)
• System prompt customizado para contexto financeiro português
• Histórico de conversação para manter contexto
• Integração de dados do utilizador (despesas, orçamento, investimentos)

Endpoint interno: POST /api/chat

Exemplo de integração:

model = genai.GenerativeModel('gemini-1.5-flash')
chat = model.start_chat(history=conversation_history)
response = chat.send_message(user_message)

4.3 APIs de Mercados Financeiros

Integração para cotações em tempo real:
• Possibilidade de integração com Alpha Vantage ou Yahoo Finance
• Atualização automática de preços de ações e criptomoedas
• Cache de cotações para otimizar pedidos

4.4 Web Services e API RESTful

O sistema implementa três web services principais em arquitetura RESTful para comunicação entre front-end e back-end:

1. Web Service de Transações (ws/user/id/transactions)
Endpoint: GET /api/user/{user_id}/transactions
Descrição: Retorna todas as transações financeiras de um utilizador específico
Parâmetros: user_id (identificador único do utilizador)
Resposta: Lista de transações com id, tipo (despesa/receita), valor, categoria, data e notas
Formato: JSON
Autenticação: Session cookie obrigatório
Funcionalidade: Permite ao front-end obter histórico completo de movimentos financeiros para visualização no dashboard

2. Web Service de Resumo Financeiro (summary)
Endpoint: GET /api/activity-summary
Descrição: Fornece resumo agregado da atividade financeira do utilizador autenticado
Resposta: Totais de despesas, receitas, saldo mensal, transações recentes
Cálculos: Agregação de valores por tipo de transação, filtragem por período
Formato: JSON
Autenticação: Session cookie obrigatório
Funcionalidade: Alimenta widgets de análise financeira e métricas do dashboard

3. Web Service de Objetivos de Poupança (savingsgoal)
Endpoint: GET /api/savings-goals
Descrição: Lista todos os objetivos de poupança definidos pelo utilizador
Resposta: Array com nome do objetivo, valor alvo, valor atual, deadline, percentagem de progresso
Formato: JSON
Autenticação: Session cookie obrigatório
Funcionalidade: Permite visualização e acompanhamento de metas financeiras

Características Técnicas dos Web Services:
• Protocolo: HTTPS
• Formato de dados: JSON para request/response
• Autenticação: Session-based authentication com cookies seguros (httpOnly, secure flags)
• Status codes HTTP: 200 (sucesso), 401 (não autenticado), 404 (não encontrado), 500 (erro servidor)
• Validação: Input validation no back-end com tratamento de erros
• CORS: Configurado com supports_credentials=True para permitir cookies cross-origin
• Segurança: Queries parametrizadas via Supabase client (proteção SQL injection)
• Performance: Cache de sessão para reduzir consultas à base de dados

═══════════════════════════════════════════════════════════════════════════

5. FRONT-END - PRINCIPAIS FUNCIONALIDADES

5.1 Landing Page
• Design moderno e responsivo com Tailwind CSS
• Secções: Hero, Features, Benefits, FAQ, About
• Animações smooth scroll e back-to-top
• Call-to-action para registo

5.2 Sistema de Autenticação
• Login via Google com um clique
• Redirecionamento seguro após autenticação
• Gestão de estado de sessão com React Context
• Toast notifications para feedback ao utilizador

5.3 Dashboard Interativo

Sistema de Tabs:
• Atividade Financeira: Visualização de transações recentes, formulário de adição de despesas/receitas
• Saúde Financeira: Análise de cash flow, gráficos de categorias, alertas de orçamento
• Objetivos de Poupança: Criação e acompanhamento de metas com progress bars
• Investimentos: Portfólio de ações/crypto, análise de retorno, histórico de transações
• Perfil: Dados do utilizador e configurações

Componentes reutilizáveis:
• AddTransaction.jsx - Formulário modal para transações
• FinancialHealth.jsx - Cards de métricas e gráficos
• StockInvestments.jsx - Gestão de portfólio
• Modal.jsx - Sistema de modais genérico
• Toast.jsx - Sistema de notificações

5.4 Chatbot de IA
• Interface flutuante acessível em todas as páginas
• Histórico de conversação persistente na sessão
• Loading states durante processamento
• Design responsivo que se adapta a mobile

═══════════════════════════════════════════════════════════════════════════

6. QUALIDADE E SEGURANÇA

6.1 Estratégias de Segurança

Autenticação e Autorização:
• OAuth 2.0 elimina gestão de palavras-passe
• Validação de tokens JWT com verificação de assinatura
• Session cookies com flag httpOnly e secure
• Verificação de autenticação em todas as rotas protegidas

Proteção de Dados:
• CORS configurado com origins permitidas explícitas
• Variáveis de ambiente para secrets (.env)
• SQL injection prevention via Supabase client (parametrized queries)
• HTTPS obrigatório em produção

Validação:
• Validação de input no front-end e back-end
• Constraints de base de dados (CHECK, NOT NULL, UNIQUE)
• Sanitização de dados do utilizador

6.2 Qualidade de Código

Boas Práticas:
• Separação de concerns (componentes React modulares)
• API RESTful com nomenclatura consistente
• Tratamento de erros com try-catch e feedback ao utilizador
• Comentários e documentação em código crítico
• Uso de TypeScript enum simulados (Python) para type safety

Performance:
• Build otimizado com Vite + Terser
• Lazy loading de componentes pesados
• Cache de dados no cliente quando apropriado
• Queries SQL otimizadas com índices

═══════════════════════════════════════════════════════════════════════════

7. DESAFIOS E SOLUÇÕES

7.1 Integração OAuth com SPA
Desafio: Coordenar redirecionamentos OAuth mantendo estado da aplicação React.
Solução: Implementação de CallbackHandler.jsx dedicado para processar callback e redirecionar para dashboard após validação de sessão.

7.2 CORS e Cookies em Desenvolvimento
Desafio: Gestão de sessões entre diferentes portos (Vite:5174, Flask:5000).
Solução: Configuração explícita de CORS(supports_credentials=True) e credentials: 'include' no fetch do React.

7.3 Contexto do Chatbot AI
Desafio: Fornecer contexto financeiro relevante sem sobrecarregar o modelo.
Solução: Agregação de dados do utilizador (totais mensais, objetivos, investimentos) num resumo compacto enviado no system prompt.

7.4 Gestão de Estado Complexo
Desafio: Sincronizar estado entre múltiplos componentes do dashboard.
Solução: Sistema de callbacks para refresh de dados após operações CRUD, com loading states granulares.

7.5 Deploy Full-Stack
Desafio: Deploy separado de front-end (Vercel) e back-end (Python).
Solução: Estrutura de projeto compatível com Vercel Serverless Functions (api/ folder), permitindo deploy unificado ou separado.

═══════════════════════════════════════════════════════════════════════════

8. CONCLUSÃO

O FinanceLog representa uma solução completa e moderna para gestão financeira pessoal, combinando tecnologias web atuais com inteligência artificial. A arquitetura escolhida garante escalabilidade, segurança e experiência de utilizador fluida.

Principais conquistas:
• Sistema de autenticação robusto e seguro sem gestão de palavras-passe
• Base de dados normalizada com integridade referencial
• Interface responsiva e intuitiva com React e Tailwind
• Integração bem-sucedida de IA para aconselhamento financeiro
• Estrutura de código modular e manutenível

Perspetivas futuras:
• Implementação de notificações push para alertas
• Dashboard analytics com gráficos mais avançados (Chart.js/D3.js)
• Exportação de relatórios em PDF
• Aplicação mobile com React Native
• Integração com bancos via Open Banking

O projeto demonstra capacidade de integrar múltiplas tecnologias numa solução coesa, aplicando boas práticas de desenvolvimento web, segurança e design centrado no utilizador.
