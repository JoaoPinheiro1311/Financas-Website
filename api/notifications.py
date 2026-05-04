import sys
import os
from pathlib import Path

service_root = Path(__file__).parent.parent / "services" / "notifications"
sys.path.insert(0, str(service_root))

from app.main import app

app = app
