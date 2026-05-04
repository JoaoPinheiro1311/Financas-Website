import sys
from pathlib import Path

service_root = Path(__file__).parent.parent / "services" / "identity"
sys.path.insert(0, str(service_root))

from app.main import app

app = app
