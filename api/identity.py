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
        for mod in list(sys.modules.keys()):
            if mod == 'app' or mod.startswith('app.'):
                del sys.modules[mod]

        service_root = Path(__file__).parent.parent / "services" / "identity"
        sys.path.insert(0, str(service_root))
        report.append(f"Identity Root: {service_root}")

        from app.main import app as real_app
        return real_app, report
    except Exception as e:
        report.append(f"CRASH IDENTITY: {str(e)}")
        report.append(traceback.format_exc())
        return None, report

real_app, report = debug_import()
if real_app:
    app = real_app
else:
    @app.get("/{path:path}")
    @app.post("/{path:path}")
    async def diag(path: str):
        return JSONResponse(status_code=500, content={"error": "Identity Boot Failure", "report": report})
