from fastapi import APIRouter, HTTPException, Body, Query
from app.infrastructure.supabase_client import supabase
from datetime import datetime
import calendar

router = APIRouter()

@router.get("")
@router.get("/")
async def get_budgets(user_id: int, month: str = Query(None)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    if not month:
        month = datetime.now().strftime('%Y-%m')
        
    try:
        # Buscar orçamentos
        budgets_resp = supabase.table('budgets').select('*').eq('user_id', user_id).eq('month', month).execute()
        budgets = budgets_resp.data or []
        
        # Buscar despesas do mês
        year, m = map(int, month.split('-'))
        last_day = calendar.monthrange(year, m)[1]
        start_date = f"{month}-01"
        end_date = f"{month}-{last_day:02d}"
        
        expenses_resp = supabase.table('expenses').select('amount, categories(name)').eq('user_id', user_id).eq('type', 'expense').gte('date', start_date).lte('date', end_date).execute()
        expenses = expenses_resp.data or []
        
        # Agrupar por categoria
        spent_by_category = {}
        for e in expenses:
            cat = (e.get('categories') or {}).get('name', 'Outros')
            spent_by_category[cat] = spent_by_category.get(cat, 0) + float(e['amount'])
            
        result = []
        for b in budgets:
            cat_name = b['category']
            spent = spent_by_category.get(cat_name, 0)
            result.append({
                'id': b['id'],
                'category': cat_name,
                'amount': float(b['amount']),
                'spent': round(spent, 2),
                'percent': round((spent / float(b['amount']) * 100), 1) if float(b['amount']) > 0 else 0,
                'month': b['month']
            })
            
        return {"budgets": result, "month": month}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
@router.post("/")
async def create_budget(user_id: int, data: dict = Body(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        budget_data = {
            'user_id': user_id,
            'category': data['category'],
            'amount': float(data['amount']),
            'month': data.get('month', datetime.now().strftime('%Y-%m'))
        }
        # Upsert: se já houver orçamento para esta categoria no mesmo mês, atualiza
        response = supabase.table('budgets').upsert(budget_data, on_conflict='user_id, category, month').execute()
        return {"budget": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
