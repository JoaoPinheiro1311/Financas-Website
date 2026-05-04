import sys
import os
from pathlib import Path

for mod in list(sys.modules.keys()):
    if mod == 'app' or mod.startswith('app.'):
        del sys.modules[mod]

service_root = Path(__file__).parent.parent / "services" / "investments"
sys.path.insert(0, str(service_root))

from app.main import app as investments_app
app = investments_app
