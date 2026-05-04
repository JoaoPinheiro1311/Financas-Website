import sys
import os
from pathlib import Path

# Add the service directory to sys.path so 'from app...' works correctly
service_root = Path(__file__).parent.parent / "services" / "identity"
sys.path.insert(0, str(service_root))

from app.main import app

# Vercel needs the app object to be exported
# FastAPI is ASGI, which Vercel supports
app = app
