from fastapi import APIRouter, HTTPException
from app.infrastructure.supabase_client import supabase

router = APIRouter()

@router.get("/")
async def get_categories(user_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        response = supabase.table('categories').select('*').eq('user_id', user_id).execute()
        return {"categories": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def add_category(user_id: int, data: dict):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        category_data = {
            'user_id': user_id,
            'name': data['name'],
            'colour': data.get('colour', '#808080')
        }
        response = supabase.table('categories').insert(category_data).execute()
        if response.data:
            return {"category": response.data[0]}
        raise HTTPException(status_code=400, detail="Failed to create category")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
