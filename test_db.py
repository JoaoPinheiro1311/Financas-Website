import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "services", "finance")))
from app.infrastructure.supabase_client import supabase

async def test():
    try:
        # Test investments
        r = supabase.table('investments').insert({
            'user_id': 3,
            'symbol': 'TEST',
            'market': 'STK',
            'quantity': 1,
            'avg_price': 100,
            'last_price': 100,
            'currency': 'EUR'
        }).execute()
        print("Investments OK:", r.data)
    except Exception as e:
        print("Investments ERROR:", str(e))

    try:
        # Test subscriptions
        r = supabase.table('subscriptions').insert({
            'user_id': 3,
            'name': 'Test',
            'amount': 10,
            'billing_day': 1,
            'category': 'Serviços',
            'is_active': True,
            'color': '#ffffff'
        }).execute()
        print("Subscriptions OK:", r.data)
    except Exception as e:
        print("Subscriptions ERROR:", str(e))

asyncio.run(test())
