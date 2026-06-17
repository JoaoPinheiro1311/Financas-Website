from app.infrastructure.supabase_client import supabase
from app.utils.auth import get_current_user
from fastapi import APIRouter, HTTPException, Depends
import random
import requests

router = APIRouter()

@router.get("/")
async def get_investments(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        response = supabase.table('investments').select('*').eq('user_id', user_id).execute()
        investments = response.data if response.data else []
        
        formatted = []
        
        # Obter IDs de cripto para CoinGecko (mapeamento simples)
        crypto_map = {"BTC": "bitcoin", "ETH": "ethereum", "SOL": "solana"}
        symbols = [inv.get('symbol', '').upper() for inv in investments]
        crypto_ids = [crypto_map[s] for s in symbols if s in crypto_map]
        
        current_prices = {}
        if crypto_ids:
            try:
                url = f"https://api.coingecko.com/api/v3/simple/price?ids={','.join(crypto_ids)}&vs_currencies=eur"
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    for s, cid in crypto_map.items():
                        if cid in data:
                            current_prices[s] = data[cid]['eur']
            except:
                pass # Fallback para simulação se a API falhar

        for inv in investments:
            symbol = inv.get('symbol', '').upper()
            base_price = float(inv.get('last_price', 0))
            
            if symbol in current_prices:
                real_price = current_prices[symbol]
            else:
                # Simular flutuação para ativos não-crypto ou se a API falhar
                fluctuation = random.uniform(-0.005, 0.005)
                real_price = base_price * (1 + fluctuation)
            
            formatted.append({
                'id': inv['id'],
                'symbol': symbol,
                'quantity': float(inv.get('quantity', 0)),
                'avg_price': float(inv.get('avg_price', 0)),
                'last_price': round(real_price, 2),
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
            'market': data.get('market', 'stock').lower() if data.get('market') not in ['STK', 'stock'] else 'stock',
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
        import traceback
        err = traceback.format_exc()
        raise HTTPException(status_code=500, detail=str(err))

@router.get("/search")
async def search_stocks(q: str):
    mock_stocks = [
        {"symbol": "AAPL", "name": "Apple Inc."},
        {"symbol": "TSLA", "name": "Tesla Inc."},
        {"symbol": "MSFT", "name": "Microsoft Corp."},
        {"symbol": "GOOGL", "name": "Alphabet Inc."},
        {"symbol": "AMZN", "name": "Amazon.com Inc."},
        {"symbol": "NVDA", "name": "NVIDIA Corp."},
        {"symbol": "META", "name": "Meta Platforms Inc."},
        {"symbol": "NFLX", "name": "Netflix Inc."},
        {"symbol": "BTC", "name": "Bitcoin"},
        {"symbol": "ETH", "name": "Ethereum"},
        {"symbol": "SOL", "name": "Solana"},
    ]
    results = [s for s in mock_stocks if q.upper() in s["symbol"] or q.lower() in s["name"].lower()]
    return {"results": results}

@router.get("/price/{symbol}")
async def get_stock_price(symbol: str):
    import random
    # Retorna um preço simulado entre 50 e 500 para testes
    return {"price": round(random.uniform(50, 500), 2)}
