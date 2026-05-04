import sys
import os
from pathlib import Path

for mod in list(sys.modules.keys()):
    if mod == 'app' or mod.startswith('app.'):
        del sys.modules[mod]

service_root = Path(__file__).parent.parent / "services" / "notifications"
sys.path.insert(0, str(service_root))

from app.main import app as notifications_app
app = notifications_app
