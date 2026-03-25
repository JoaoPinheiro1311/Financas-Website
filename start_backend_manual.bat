@echo off
echo Iniciando Microservicos...

:: Instalar dependencias base se necessario
pip install -r services/requirements.base.txt

echo [1/5] Iniciando Identity Service na porta 8001...
start "Identity Service" cmd /k "cd services/identity && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001"

echo [2/5] Iniciando Finance Service na porta 8002...
start "Finance Service" cmd /k "cd services/finance && python -m uvicorn app.main:app --host 0.0.0.0 --port 8002"

echo [3/5] Iniciando Investment Service na porta 8003...
start "Investment Service" cmd /k "cd services/investments && python -m uvicorn app.main:app --host 0.0.0.0 --port 8003"

echo [4/5] Iniciando Goals Service na porta 8004...
start "Goals Service" cmd /k "cd services/goals && python -m uvicorn app.main:app --host 0.0.0.0 --port 8004"

echo [5/5] Iniciando Notification Service na porta 8005...
start "Notification Service" cmd /k "cd services/notifications && python -m uvicorn app.main:app --host 0.0.0.0 --port 8005"

echo Todos os servicos foram iniciados em novas janelas.
echo Nota: O RabbitMQ (Docker) nao foi detectado. O sistema usara log local como fallback.
pause
