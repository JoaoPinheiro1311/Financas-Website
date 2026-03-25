# Finance Log: Ecossistema de Microserviços de Elite 🚀🧘‍♂️💎

![Banner](https://img.shields.io/badge/Status-God--Tier-emerald?style=for-the-badge&logo=rocket)
![Backend](https://img.shields.io/badge/Backend-FastAPI-blue?style=for-the-badge&logo=fastapi)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue?style=for-the-badge&logo=react)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-orange?style=for-the-badge&logo=docker)

Bem-vindo ao **Finance Log**, a plataforma de gestão financeira definitiva que utiliza uma arquitetura distribuída e Inteligência Artificial para te ajudar a atingir a liberdade financeira.

---

## 🏗️ 1. Arquitetura do Sistema
O projeto foi construído sobre uma rede de **5 microserviços** independentes e desacoplados, cada um com a sua própria responsabilidade e base de dados (ou lógica de integração).

| Serviço | Porta | Tecnologias | Responsabilidade |
| :--- | :--- | :--- | :--- |
| **Identity Service** | `8001` | FastAPI, Google OAuth2 | Autenticação, Tokens JWT, Definições de Perfil e Segurança. |
| **Finance Service** | `8002` | FastAPI, Gemini AI | Core Financeiro: Transações, Orçamentos e Chat AI Contextual. |
| **Investment Service** | `8003` | FastAPI, Crypto APIs | Portfolio, Cotações de Cripto (BTC/ETH) e Ativos em tempo real. |
| **Goals Service** | `8004` | FastAPI, Pydantic | Metas de Poupança e Planeamento de Roadmap Financeiro. |
| **Notification Service** | `8005` | FastAPI, RabbitMQ | Alertas Assíncronos e subscrição de eventos de sistema. |

---

## 📄 2. Documentação de API (Swagger/OpenAPI)

### O que é o Swagger?
O **Swagger** (formalmente conhecido como OpenAPI) é uma ferramenta industrial standard que gera uma interface interativa diretamente a partir do código fonte. Para cada microserviço deste projeto, o Swagger permite:
- **Visualização**: Ver todos os endpoints (rotas) disponíveis de forma organizada.
- **Interação**: Testar os pedidos (GET, POST, etc.) diretamente no browser sem ferramentas externas.
- **Contrato**: Serve como a "verdade única" para o frontend saber exatamente o que esperar do backend.

### Endpoints de Documentação
Podes aceder ao Swagger de cada serviço nos seguintes links (com os serviços a correr):
- **Identity**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **Finance**: [http://localhost:8002/docs](http://localhost:8002/docs)
- **Investment**: [http://localhost:8003/docs](http://localhost:8003/docs)
- **Goals**: [http://localhost:8004/docs](http://localhost:8004/docs)
- **Notification**: [http://localhost:8005/docs](http://localhost:8005/docs)

---

## 🛠️ 3. Como Iniciar (Setup Local)

### Pré-requisitos:
- **Docker & Docker Compose**: Recomendado para orquestração simplificada.
- **Node.js 18+**: Necessário para o frontend React.
- **Python 3.10+**: Caso desejes correr os serviços manualmente.

### Utilizando o Setup Automático (Windows):
Executa o script `setup.bat` na raiz do projeto. Ele irá:
1. Instalar as dependências do Frontend (`npm install`).
2. Criar o ambiente virtual Python se necessário.
3. Fornecer as instruções finais para iniciar o ecossistema.

### Comandos de Execução:
- **Microserviços (via Docker)**: `docker-compose up --build`
- **Microserviços (Manual)**: Executa `start_backend_manual.bat`
- **Frontend**: `npm run dev` (Acede em `http://localhost:5174`)

---

## 📂 4. Estrutura do Repositório (Source Code)

Este repositório está organizado para facilitar a escalabilidade:
```text
.
├── services/               # Todos os microserviços Python
│   ├── identity/           # Lógica de Auth e Users
│   ├── finance/            # Lógica de Transações e IA
│   └── ...                 # Outros serviços
├── src/                    # Frontend React 18 (Vite)
├── api/                    # Adaptadores para Vercel Serverless
├── docker-compose.yml      # Orquestração do ecossistema
└── README.md               # Esta documentação
```

---

## 🐙 5. Publicação no GitHub

Para publicar este projeto no teu GitHub, segue estes passos:

1. **Criar um Repositório Novo** no GitHub (ex: `finance-log-microservices`).
2. **Adicionar o Remote**:
   ```bash
   git remote add origin https://github.com/O-TEU-USER/o-teu-repo.git
   ```
3. **Submeter o Código**:
   ```bash
   git add .
   git commit -m "feat: complete microservices ecosystem with swagger docs"
   git push -u origin main
   ```

---

## 🧘‍♂️ 6. Filosofia de Desenvolvimento
Este projeto foi desenvolvido com uma mentalidade de **Visual Excellence** e **High Performance**. Cada componente foi auditado para garantir que a experiência do utilizador é fluida e o código é limpo.

---
**Desenvolvido por João Pinheiro - Março 2026** 🚀🥇
