from fastapi import APIRouter, HTTPException, Body
from app.infrastructure.supabase_client import supabase
from datetime import datetime, timedelta
from typing import List, Optional

router = APIRouter()

@router.get("/")

async def get_subscriptions(user_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        response = supabase.table('subscriptions').select('*').eq('user_id', user_id).order('billing_day').execute()
        subs = response.data if response.data else []
        
        today = datetime.now()
        result = []
        for s in subs:
            billing_day = s.get('billing_day', 1)
            # Calcular próxima data de débito
            try:
                if today.day <= billing_day:
                    next_billing = today.replace(day=billing_day)
                else:
                    if today.month == 12:
                        next_billing = today.replace(year=today.year + 1, month=1, day=billing_day)
                    else:
                        next_billing = today.replace(month=today.month + 1, day=billing_day)
            except ValueError:
                # Caso dia seja 31 e o mês só tenha 30
                next_billing = (today.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)

            days_until = (next_billing.date() - today.date()).days
            
            result.append({
                'id': s['id'],
                'name': s['name'],
                'amount': float(s['amount']),
                'billing_day': billing_day,
                'category': s.get('category', 'Serviços'),
                'is_active': s.get('is_active', True),
                'color': s.get('color', '#3B82F6'),
                'days_until': days_until,
                'next_billing': next_billing.strftime('%Y-%m-%d'),
            })
            
        total_monthly = sum(s['amount'] for s in result if s['is_active'])
        return {'subscriptions': result, 'total_monthly': round(total_monthly, 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")

async def create_subscription(user_id: int, data: dict = Body(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        insert_data = {
            'user_id': user_id,
            'name': data['name'],
            'amount': float(data['amount']),
            'billing_day': int(data['billing_day']),
            'category': data.get('category', 'Serviços'),
            'is_active': data.get('is_active', True),
            'color': data.get('color', '#3B82F6'),
        }
        response = supabase.table('subscriptions').insert(insert_data).execute()
        if response.data:
            return {'subscription': response.data[0], 'message': 'Subscrição criada'}
        raise HTTPException(status_code=400, detail="Erro ao criar subscrição")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{sub_id}")
async def update_subscription(user_id: int, sub_id: int, data: dict = Body(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        # Verificar posse
        check = supabase.table('subscriptions').select('user_id').eq('id', sub_id).execute()
        if not check.data or check.data[0]['user_id'] != user_id:
            raise HTTPException(status_code=404, detail="Subscrição não encontrada")
            
        update_data = {}
        for field in ['name', 'category', 'color', 'is_active']:
            if field in data:
                update_data[field] = data[field]
        if 'amount' in data:
            update_data['amount'] = float(data['amount'])
        if 'billing_day' in data:
            update_data['billing_day'] = int(data['billing_day'])
            
        response = supabase.table('subscriptions').update(update_data).eq('id', sub_id).execute()
        return {'subscription': response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{sub_id}")
async def delete_subscription(user_id: int, sub_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        supabase.table('subscriptions').delete().eq('id', sub_id).eq('user_id', user_id).execute()
        return {'message': 'Removida com sucesso'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
