"""
Vercel Serverless Function Entry Point
This is the main handler for all API requests on Vercel
"""

import sys
import os
from pathlib import Path

# Add parent directory to path to import app
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set environment for serverless
os.environ['VERCEL'] = '1'

# Import Flask app - this is the WSGI application
from app import app

# Export as WSGI application for Vercel
__all__ = ['app']
