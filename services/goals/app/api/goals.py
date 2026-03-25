from fastapi import APIRouter, HTTPException
from app.infrastructure.supabase_client import supabase

router = APIRouter()

@router.get("/")
async def get_goals(user_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        response = supabase.table('savings_goals').select('*').eq('user_id', user_id).execute()
        goals = response.data if response.data else []
        
        # Mapear para os nomes que o frontend espera (compatibilidade com monolito)
        formatted_goals = []
        for goal in goals:
            formatted_goals.append({
                'id': goal['id'],
                'nome': goal.get('name', 'Sem nome'),
                'valorAtual': float(goal.get('current_amount', 0)),
                'valorObjetivo': float(goal.get('target_amount', 0)),
                'prazo': goal.get('deadline', ''),
                'categoria': 'Outros'
            })
            
        return {"goals": formatted_goals}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_goal(user_id: int, data: dict):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        goal_data = {
            'user_id': user_id,
            'name': data.get('nome'),
            'target_amount': float(data.get('valorObjetivo', 0)),
            'current_amount': float(data.get('valorAtual', 0)),
            'deadline': data.get('prazo')
        }
        response = supabase.table('savings_goals').insert(goal_data).execute()
        if response.data:
            return {"goal": response.data[0], "message": "Objetivo criado com sucesso"}
        raise HTTPException(status_code=400, detail="Failed to create goal")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{goal_id}")
async def update_goal(goal_id: int, data: dict):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        update_data = {}
        if 'valorAtual' in data:
            update_data['current_amount'] = float(data['valorAtual'])
        
        response = supabase.table('savings_goals').update(update_data).eq('id', goal_id).execute()
        if response.data:
            return {"goal": response.data[0]}
        raise HTTPException(status_code=404, detail="Goal not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
