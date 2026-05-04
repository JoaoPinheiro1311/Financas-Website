from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Goals Service",
    description="Gestor de objetivos de poupança. Permite criar metas, acompanhar o progresso e visualizar o roadmap para a liberdade financeira.",
    version="1.0.0",
    contact={
        "name": "João Pinheiro",
        "url": "https://github.com/JoaoPinheiro1311",
    }
)

allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5174,http://localhost:3000').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Goals Service API", "status": "running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

from app.api.goals import router as goals_router
# Para compatibilidade com Vercel e local
app.include_router(goals_router, prefix="/api/v1/goals", tags=["Goals"])
app.include_router(goals_router, tags=["Goals"])

