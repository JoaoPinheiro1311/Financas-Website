from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import threading
from app.infrastructure.messaging import start_consumer

app = FastAPI(
    title="Notification Service",
    description="Sistema de alertas e notificações assíncronas. Integra com RabbitMQ para processar eventos em background e manter o utilizador informado.",
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

@app.on_event("startup")
async def startup_event():
    # Iniciar o consumidor de mensagens em uma thread separada
    thread = threading.Thread(target=start_consumer, daemon=True)
    thread.start()

@app.get("/")
def read_root():
    return {"message": "Notification Service API", "status": "running"}

@app.get("/api/health")
@app.get("/api/v1/notifications/api/health")
def health_check():
    return {"status": "ok"}


from app.api.notifications import router as notifications_router
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["Notifications"])
