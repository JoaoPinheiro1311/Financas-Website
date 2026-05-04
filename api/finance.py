import sys
import os
from pathlib import Path

# Limpar cache de módulos para evitar conflitos entre serviços no Vercel
for mod in list(sys.modules.keys()):
    if mod == 'app' or mod.startswith('app.'):
        del sys.modules[mod]

service_root = Path(__file__).parent.parent / "services" / "finance"
sys.path.insert(0, str(service_root))

from app.main import app as finance_app
app = finance_app
