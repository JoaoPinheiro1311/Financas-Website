import sys
from pathlib import Path

# Redirecionar para o Identity Service por padrão
service_root = Path(__file__).parent.parent / "services" / "identity"
sys.path.insert(0, str(service_root))

from app.main import app

app = app
