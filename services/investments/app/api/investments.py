from app.infrastructure.supabase_client import supabase
from app.utils.auth import get_current_user
from fastapi import APIRouter, HTTPException, Depends
import random

router = APIRouter()

@router.get("/")
async def get_investments(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        response = supabase.table('investments').select('*').eq('user_id', user_id).execute()
        investments = response.data if response.data else []
        
        # O frontend StockInvestments.jsx usa .map() e espera os nomes originais da DB:
        # inv.avg_price, inv.last_price, inv.symbol, inv.quantity
        formatted = []
        for inv in investments:
            # God-Tier Feature: Simular flutuação de preço real-time
            base_price = float(inv.get('last_price', 0))
            fluctuation = random.uniform(-0.005, 0.005) # +/- 0.5%
            simulated_price = base_price * (1 + fluctuation)
            
            formatted.append({
                'id': inv['id'],
                'symbol': inv.get('symbol'),
                'quantity': float(inv.get('quantity', 0)),
                'avg_price': float(inv.get('avg_price', 0)),
                'last_price': round(simulated_price, 2),
                'market': inv.get('market'),
            })
        return {"investments": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def add_investment(data: dict, current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        investment_data = {
            'user_id': user_id,
            'symbol': data['symbol'],
            'market': data.get('market', 'STK'),
            'quantity': float(data.get('quantity', 0)),
            'avg_price': float(data.get('purchase_price', 0)),
            'last_price': float(data.get('purchase_price', 0)),
            'currency': 'EUR'
        }
        response = supabase.table('investments').insert(investment_data).execute()
        if response.data:
            return {"investment": response.data[0]}
        raise HTTPException(status_code=400, detail="Failed to create investment")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
