from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Identity Service",
    description="Responsável pela autenticação de utilizadores (Google OAuth2), gestão de tokens JWT e definições de perfil. É o guardião do acesso ao ecossistema Finance Log.",
    version="1.0.0",
    contact={
        "name": "João Pinheiro",
        "url": "https://github.com/JoaoPinheiro1311",
    }
)

# Configurar CORS (ajustar conforme necessario)
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
    return {"message": "Identity Service API", "status": "running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Import and include routers here later
from app.api.auth import router as auth_router
from app.api.settings import router as settings_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(settings_router, prefix="/api/v1/auth/user/settings", tags=["User Settings"])
