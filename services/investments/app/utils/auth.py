from fastapi import Request, HTTPException, Depends
from jose import jwt
import os

JWT_SECRET = os.getenv('JWT_SECRET', 'fallback_secret')
ALGORITHM = "HS256"

async def get_current_user(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        user_id = request.query_params.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail="Header de autorização ausente")
        return {"user_id": int(user_id), "is_verified": False}
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return {"user_id": payload.get("user_id"), "is_verified": True, "email": payload.get("email")}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")
