import sys
import os
import traceback
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

try:
    for mod in list(sys.modules.keys()):
        if mod == 'app' or mod.startswith('app.'):
            del sys.modules[mod]

    service_root = Path(__file__).parent.parent / "services" / "identity"
    sys.path.insert(0, str(service_root))

    from app.main import app as real_app
    app = real_app

except Exception as e:
    error_info = {
        "error": "Erro no arranque do serviço de Identidade",
        "details": str(e),
        "traceback": traceback.format_exc()
    }
    
    @app.get("/{path:path}")
    async def error_handler(path: str):
        return JSONResponse(status_code=500, content=error_info)
