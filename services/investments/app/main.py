from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Investment Service",
    description="Microserviço especializado em portfólio de investimentos. Consome APIs externas para cotações de Cripto (BTC/ETH) e Ativos, permitindo a visualização em tempo real do património.",
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
    return {"message": "Investment Service API", "status": "running"}

@app.get("/api/health")
@app.get("/api/v1/investments/api/health")
def health_check():
    return {"status": "ok"}


from app.api.investments import router as investments_router
# Para compatibilidade com Vercel e local
app.include_router(investments_router, prefix="/api/v1/investments", tags=["Investments"])
app.include_router(investments_router, tags=["Investments"])

