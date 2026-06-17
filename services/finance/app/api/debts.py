from fastapi import APIRouter, HTTPException, Depends
from app.infrastructure.supabase_client import supabase
from app.utils.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/")
async def get_debts(current_user: dict = Depends(get_current_user)):
    """Lista todas as dívidas do utilizador"""
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        resp = supabase.table('debts').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        debts = resp.data or []
        total_debt = sum(float(d.get('remaining_amount', 0)) for d in debts)
        return {"debts": debts, "total_debt": total_debt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_debt(data: dict, current_user: dict = Depends(get_current_user)):
    """Cria uma nova dívida"""
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        debt_data = {
            'user_id': user_id,
            'name': data.get('name', ''),
            'type': data.get('type', 'personal'),        # personal, mortgage, car, credit_card, student
            'total_amount': float(data.get('total_amount', 0)),
            'remaining_amount': float(data.get('remaining_amount', data.get('total_amount', 0))),
            'interest_rate': float(data.get('interest_rate', 0)),
            'monthly_payment': float(data.get('monthly_payment', 0)),
            'due_date': data.get('due_date'),
            'creditor': data.get('creditor', ''),
            'notes': data.get('notes', ''),
        }
        resp = supabase.table('debts').insert(debt_data).execute()
        if resp.data:
            return {"debt": resp.data[0], "message": "Dívida criada com sucesso"}
        raise HTTPException(status_code=400, detail="Falha ao criar dívida")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{debt_id}")
async def update_debt(debt_id: int, data: dict, current_user: dict = Depends(get_current_user)):
    """Atualiza uma dívida (ex: pagamento parcial)"""
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        update_data = {k: v for k, v in data.items() if k in [
            'name', 'remaining_amount', 'interest_rate', 'monthly_payment', 'due_date', 'creditor', 'notes', 'type'
        ]}
        resp = supabase.table('debts').update(update_data).eq('id', debt_id).eq('user_id', user_id).execute()
        if resp.data:
            return {"debt": resp.data[0], "message": "Dívida atualizada"}
        raise HTTPException(status_code=404, detail="Dívida não encontrada")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{debt_id}")
async def delete_debt(debt_id: int, current_user: dict = Depends(get_current_user)):
    """Remove uma dívida"""
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        supabase.table('debts').delete().eq('id', debt_id).eq('user_id', user_id).execute()
        return {"message": "Dívida removida com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
