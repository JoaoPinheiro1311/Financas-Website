"""
Catch-all route handler for Vercel
Routes all API requests to the Flask application
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set environment
os.environ['VERCEL'] = '1'

from app import app
from werkzeug.exceptions import NotFound

def handler(request):
    """
    Handler for all routes
    Vercel calls this with a WSGI request object
    """
    try:
        # Create WSGI environ from the request
        environ = {
            'REQUEST_METHOD': request.method,
            'SCRIPT_NAME': '',
            'PATH_INFO': request.path,
            'QUERY_STRING': request.query_string or '',
            'CONTENT_TYPE': request.headers.get('content-type', ''),
            'CONTENT_LENGTH': request.headers.get('content-length', ''),
            'SERVER_NAME': request.host.split(':')[0],
            'SERVER_PORT': request.host.split(':')[1] if ':' in request.host else '443',
            'SERVER_PROTOCOL': 'HTTP/1.1',
            'wsgi.version': (1, 0),
            'wsgi.url_scheme': 'https',
            'wsgi.input': request.stream,
            'wsgi.errors': sys.stderr,
            'wsgi.multithread': True,
            'wsgi.multiprocess': False,
            'wsgi.run_once': False,
        }
        
        # Add headers to environ
        for key, value in request.headers:
            key = key.upper().replace('-', '_')
            if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
                key = f'HTTP_{key}'
            environ[key] = value
        
        # Call the Flask app
        return app(environ, lambda *args: None)
    
    except Exception as e:
        print(f"Error in handler: {e}")
        import traceback
        traceback.print_exc()
        return NotFound()
