import sys
from pathlib import Path

# Fallback para o Identity Service se for chamado diretamente via /api
service_root = Path(__file__).parent.parent / "services" / "identity"
sys.path.insert(0, str(service_root))

from app.main import app

# Exportar como app para o Vercel
app = app
