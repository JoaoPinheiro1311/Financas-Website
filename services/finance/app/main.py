from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Finance Service",
    description="Cérebro financeiro do sistema. Gere transações, orçamentos, categorias e integra o 'Financial Sensei' (IA Gemini) para insights inteligentes.",
    version="1.0.0",
    contact={
        "name": "João Pinheiro",
        "url": "https://github.com/JoaoPinheiro1311",
    }
)

allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Finance Service API", "status": "running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

from app.api.transactions import router as transactions_router
from app.api.categories import router as categories_router
from app.api.summary import router as summary_router
from app.api.subscriptions import router as subscriptions_router
from app.api.export import router as export_router
from app.api.chat import router as chat_router
from app.api.budgets import router as budgets_router

# Para compatibilidade com Vercel e local, incluímos as rotas com e sem prefixo
app.include_router(transactions_router, prefix="/api/v1/transactions", tags=["Transactions"])
app.include_router(transactions_router, tags=["Transactions"])

app.include_router(categories_router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(categories_router, tags=["Categories"])

app.include_router(summary_router, prefix="/api/v1/summary", tags=["Summary"])
app.include_router(summary_router, tags=["Summary"])

app.include_router(subscriptions_router, prefix="/api/v1/subscriptions", tags=["Subscriptions"])
app.include_router(subscriptions_router, tags=["Subscriptions"])

app.include_router(export_router, prefix="/api/v1/export", tags=["Export"])
app.include_router(export_router, tags=["Export"])

app.include_router(chat_router, prefix="/api/v1/chat", tags=["AI Chat"])
app.include_router(chat_router, tags=["AI Chat"])

app.include_router(budgets_router, prefix="/api/v1/budgets", tags=["Budgets"])
app.include_router(budgets_router, tags=["Budgets"])

