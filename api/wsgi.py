import os
import sys
from pathlib import Path

# Adicionar o diretório raiz ao path
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

from app import app

# Versão WSGI que Vercel consegue usar
# Isto é usado automaticamente pelo Vercel
__all__ = ['app']
