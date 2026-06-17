from app.infrastructure.supabase_client import supabase
from app.infrastructure.messaging import publish_event
from app.utils.auth import get_current_user
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional

router = APIRouter()

@router.get("/")
async def get_transactions(
    limit: int = 50, 
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        query = supabase.table('expenses').select('*, categories(name, colour)').eq('user_id', user_id).order('date', desc=True).limit(limit)
        
        if start_date:
            query = query.gte('date', start_date)
        if end_date:
            query = query.lte('date', end_date)
        
        response = query.execute()
        return {"transactions": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def add_transaction(data: dict, current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        # Tipo de transação
        transaction_type = 'expense' if data.get('tipo') == 'despesa' else 'income'

        # Encontrar category_id pelo nome (silencioso em caso de erro)
        category_id = None
        if data.get('categoria'):
            try:
                cat_resp = supabase.table('categories').select('id').eq('name', data.get('categoria')).eq('user_id', user_id).limit(1).execute()
                if cat_resp.data:
                    category_id = cat_resp.data[0]['id']
            except:
                pass

        # Inserir transacao
        transaction_data = {
            'user_id': user_id,
            'type': transaction_type,
            'amount': float(data['valor']),
            'currency': data.get('moeda', 'EUR'),
            'date': data['data'],
            'notes': data.get('descricao', '') or data.get('notas', ''),
        }
        # Só incluir category_id se existir (evitar erros com NULL)
        if category_id is not None:
            transaction_data['category_id'] = category_id

        
        response = supabase.table('expenses').insert(transaction_data).execute()
        
        if response.data:
            # Check Budget
            if transaction_type == 'expense':
                try:
                    month = data['data'][:7] # YYYY-MM
                    # Get budget
                    b_resp = supabase.table('budgets').select('amount, category').eq('user_id', user_id).eq('month', month).execute()
                    # (This is simplified, should really check category too if provided)
                    if b_resp.data:
                        # Simple check: check total expenses for month
                        e_resp = supabase.table('expenses').select('amount').eq('user_id', user_id).eq('type', 'expense').gte('date', f"{month}-01").execute()
                        total_spent = sum(float(e['amount']) for e in (e_resp.data or []))
                        budget_limit = float(b_resp.data[0]['amount'])
                        if total_spent > budget_limit:
                            publish_event("budget_exceeded", {
                                "user_id": user_id, 
                                "month": month, 
                                "limit": budget_limit, 
                                "spent": total_spent
                            })
                except: pass

            # Publicar evento assincrono
            publish_event("transaction_created", {"user_id": user_id, "amount": float(data['valor']), "type": transaction_type})
            
            # God-Tier: Recompensa XP/Gamification
            try:
                # Evento interno para o Identity atribuir XP
                publish_event("gain_xp", {"user_id": user_id, "xp": 15})
            except: pass
            
            return {"transaction": response.data[0], "message": "Transacao adicionada"}
        
        raise HTTPException(status_code=400, detail="Failed to create transaction")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
