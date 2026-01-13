# Prompt para ChatGPT/Gemini - Relatório Técnico FinanceLog

Cole este prompt no ChatGPT ou Gemini para gerar o relatório:

---

**PROMPT:**

Preciso que escrevas um relatório técnico final em português de Portugal (PTPT) para o meu projeto académico. Escreve de forma natural, como um estudante universitário escreveria (não demasiado formal, mas profissional). O relatório deve ter 5-10 páginas e seguir esta estrutura:

**Nome do Projeto:** FinanceLog - Plataforma de Gestão Financeira Inteligente

**Contexto Técnico:**

1. **Stack Tecnológico:**
   - Front-end: React 18.2, React Router 6, Vite 5, Tailwind CSS 3.4
   - Back-end: Flask 3.0 (Python), Flask-CORS
   - Base de Dados: Supabase (PostgreSQL)
   - Autenticação: Google OAuth 2.0 com JWT
   - IA: Google Gemini AI (modelo gemini-1.5-flash)
   - Deploy: Vercel (front-end), serverless functions (back-end)

2. **Arquitetura:**
   - Arquitetura cliente-servidor (SPA React + API REST Flask)
   - Separação clara front-end/back-end
   - Comunicação via HTTPS com CORS configurado
   - Sessões geridas com cookies seguros

3. **Base de Dados (8 tabelas principais):**
   - `users` (utilizadores OAuth)
   - `categories` (categorias de transações)
   - `expenses` (despesas e receitas - tipos: expense/income)
   - `budgets` (orçamentos - períodos: monthly/yearly/custom)
   - `savings_goals` (objetivos de poupança)
   - `investments` (portfólio de ações e cripto - mercados: stock/crypto)
   - `investment_tx` (transações de investimento - tipos: buy/sell)
   - `notifications` (notificações com payload JSONB)
   
   Relações: Users 1:N com todas as outras (CASCADE delete), Categories 1:N Expenses, Investments 1:N Investment_tx

4. **Funcionalidades Principais:**
   - Landing page responsiva com secções (Hero, Features, Benefits, FAQ)
   - Login via Google (OAuth 2.0 - um clique, sem gestão de passwords)
   - Dashboard interativo com 5 tabs:
     * Atividade Financeira (adicionar transações, visualizar histórico)
     * Saúde Financeira (análise de cash flow, categorias, alertas)
     * Objetivos de Poupança (criar metas, acompanhar progresso)
     * Investimentos (portfólio ações/crypto, análise de retorno)
     * Perfil (dados do utilizador)
   - Chatbot de IA flutuante para aconselhamento financeiro personalizado
   - Sistema de notificações Toast

5. **Integrações Externas:**
   - Google OAuth 2.0 (Authorization Code Flow com validação JWT/JWKS)
   - Google Gemini AI (conversação com contexto financeiro do utilizador)
   - Possibilidade de APIs de mercados (Alpha Vantage/Yahoo Finance) para cotações em tempo real

6. **Segurança e Qualidade:**
   - OAuth elimina gestão de passwords
   - Session cookies com httpOnly e secure flags
   - CORS com origins explícitas
   - Validação de input front-end e back-end
   - Constraints SQL (CHECK, UNIQUE, NOT NULL)
   - Variáveis de ambiente para secrets
   - Build otimizado com Vite + Terser

7. **Desafios Enfrentados:**
   - Coordenar redirecionamentos OAuth com SPA React (solução: CallbackHandler dedicado)
   - CORS e cookies entre diferentes portos em desenvolvimento (solução: supports_credentials=True)
   - Fornecer contexto ao chatbot sem sobrecarregar (solução: agregação de dados em resumo compacto)
   - Deploy full-stack separado (solução: estrutura compatível Vercel serverless)

---

**Instruções de Escrita:**

1. Escreve em **português de Portugal** (não brasileiro)
2. Tom natural e profissional (como estudante universitário)
3. Inclui diagramas em ASCII art quando relevante (arquitetura, modelo ER)
4. Justifica escolhas técnicas de forma breve
5. Inclui 2-3 exemplos de queries SQL importantes
6. Sê específico nos nomes das tecnologias e versões
7. Na conclusão, menciona perspetivas futuras: notificações push, gráficos avançados, exportação PDF, app mobile React Native, Open Banking

**Estrutura Obrigatória:**
1. Resumo do Projeto (objetivo, contexto)
2. Arquitetura e Tecnologias (diagramas ASCII, justificações)
3. Base de Dados (modelo ER, queries principais)
4. Integração de Serviços Externos (APIs, IA)
5. Front-End (principais funcionalidades)
6. Qualidade e Segurança (estratégias aplicadas)
7. Desafios e Soluções
8. Conclusão

Começa já a escrever o relatório completo!
