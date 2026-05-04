from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
import os
import requests
from jose import jwt
from app.infrastructure.supabase_client import sync_user_with_supabase, supabase

router = APIRouter()

# Mock de sessao em memoria para demonstracao deste projeto universitario
SESSIONS = {}

# URLs do Google OAuth
GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
REDIRECT_URI = os.getenv('REDIRECT_URI')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5174')

@router.get("/login/google")
def login_google(request: Request):
    """Redireciona o usuario para o Google OAuth"""
    # Se não houver REDIRECT_URI no env, tenta construir dinamicamente
    actual_redirect_uri = REDIRECT_URI
    if not actual_redirect_uri:
        if "localhost" in request.url.netloc:
            actual_redirect_uri = "http://localhost:8001/api/v1/auth/callback/google"
        else:
            # No Vercel, usamos o próprio host da requisição
            actual_redirect_uri = f"https://{request.url.netloc}/api/v1/auth/callback/google"
            
    if not GOOGLE_CLIENT_ID:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=config_error&details=GOOGLE_CLIENT_ID_missing")
    
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': actual_redirect_uri,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"{GOOGLE_AUTH_URL}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return RedirectResponse(auth_url)


@router.get("/callback/google")
async def callback_google(request: Request, code: str = None, error: str = None):
    """Processa o callback do Google OAuth"""
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=google_error&details={error}")
    
    if not code:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_code")
    
    # Determinar REDIRECT_URI dinamicamente (deve coincidir com o do login_google)
    actual_redirect_uri = REDIRECT_URI
    if not actual_redirect_uri:
        if "localhost" in request.url.netloc:
            actual_redirect_uri = "http://localhost:8001/api/v1/auth/callback/google"
        else:
            actual_redirect_uri = f"https://{request.url.netloc}/api/v1/auth/callback/google"

    try:
        # Trocar codigo por token
        token_data = {
            'code': code,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uri': actual_redirect_uri,
            'grant_type': 'authorization_code'
        }
        
        token_response = requests.post(GOOGLE_TOKEN_URL, data=token_data, timeout=10)

        
        if token_response.status_code != 200:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=token_exchange_failed")
        
        tokens = token_response.json()
        id_token = tokens.get('id_token')
        
        if not id_token:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=no_id_token")
        
        # Decodificar ID token
        decoded_token = jwt.get_unverified_claims(id_token)
        external_id = decoded_token.get('sub')
        email = decoded_token.get('email')
        display_name = decoded_token.get('name', email.split('@')[0] if email else 'User')
        
        # Sincronizar com Supabase
        user_id = sync_user_with_supabase(external_id, email, display_name)
        
        if not user_id:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=db_error")
        
        # Gerar JWT Real
        jwt_token = jwt.encode(
            {"user_id": user_id, "email": email, "name": display_name},
            os.getenv('JWT_SECRET', 'fallback_secret'),
            algorithm="HS256"
        )
        
        # Guardar na "sessao"
        SESSIONS[str(user_id)] = {
            "user_id": user_id,
            "email": email,
            "display_name": display_name,
            "token": jwt_token
        }
        
        # Redirect com cookies
        response = RedirectResponse(f"{FRONTEND_URL}/dashboard")
        response.set_cookie(key="user_id", value=str(user_id), httponly=False)
        response.set_cookie(key="access_token", value=jwt_token, httponly=False)
        return response
        
    except Exception as e:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=callback_error&details={str(e)[:100]}")

@router.get("/dashboard")
async def get_dashboard(request: Request):
    """Retorna dados do usuario logado (usado via apiFetch)"""
    user_id = request.cookies.get("user_id")
    if not user_id or user_id not in SESSIONS:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return SESSIONS[user_id]

@router.post("/logout")
async def logout():
    """Logout simples"""
    response = RedirectResponse(f"{FRONTEND_URL}/login")
    response.delete_cookie("user_id")
    return {"success": True}
