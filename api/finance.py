import sys
import os
import traceback
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

def debug_import():
    report = []
    try:
        # 1. Limpar cache de módulos
        for mod in list(sys.modules.keys()):
            if mod == 'app' or mod.startswith('app.'):
                del sys.modules[mod]

        # 2. Configurar caminhos
        service_root = Path(__file__).parent.parent / "services" / "finance"
        sys.path.insert(0, str(service_root))
        report.append(f"Service Root: {service_root}")

        # 3. Tentar carregar componentes um a um
        report.append("A carregar Infraestrutura...")
        from app.infrastructure.supabase_client import supabase
        
        report.append("A carregar Auth...")
        from app.utils.auth import get_current_user
        
        report.append("A carregar Summary...")
        from app.api.summary import router as r1
        
        report.append("A carregar Chat...")
        from app.api.chat import router as r2
        
        report.append("A carregar Main App...")
        from app.main import app as real_app
        
        return real_app, report
    except Exception as e:
        report.append(f"CRASH DETECTADO: {str(e)}")
        report.append(traceback.format_exc())
        return None, report

real_app, import_report = debug_import()

if real_app:
    app = real_app
else:
    # Se falhar, qualquer pedido ao serviço devolve o relatório de erro
    @app.get("/{path:path}")
    async def diag_get(path: str):
        return JSONResponse(status_code=500, content={"debug_report": import_report})
    
    @app.post("/{path:path}")
    async def diag_post(path: str):
        return JSONResponse(status_code=500, content={"debug_report": import_report})
