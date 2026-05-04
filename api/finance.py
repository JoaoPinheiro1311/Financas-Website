import sys
import os
import traceback
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Criamos uma app temporária para caso o carregamento falhe
app = FastAPI()

try:
    # Limpar cache de módulos para evitar conflitos
    for mod in list(sys.modules.keys()):
        if mod == 'app' or mod.startswith('app.'):
            del sys.modules[mod]

    # Configurar caminho do serviço
    service_root = Path(__file__).parent.parent / "services" / "finance"
    sys.path.insert(0, str(service_root))

    # Tentar carregar a app real
    from app.main import app as real_app
    app = real_app

except Exception as e:
    error_info = {
        "error": "Erro no arranque do serviço de Finanças",
        "details": str(e),
        "traceback": traceback.format_exc(),
        "sys_path": sys.path,
        "cwd": os.getcwd()
    }
    
    @app.get("/{path:path}")
    async def error_handler(path: str):
        return JSONResponse(status_code=500, content=error_info)

    @app.post("/{path:path}")
    async def error_handler_post(path: str):
        return JSONResponse(status_code=500, content=error_info)
