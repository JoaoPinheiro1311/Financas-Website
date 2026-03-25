from fastapi import APIRouter, HTTPException
from app.infrastructure.supabase_client import supabase

router = APIRouter()

@router.get("/")
async def get_notifications(user_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        response = supabase.table('notifications').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        return {"notifications": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        response = supabase.table('notifications').update({'is_read': True}).eq('id', notification_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
