import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "services", "finance")))
from app.infrastructure.supabase_client import supabase

async def test():
    # Attempt to insert without market or with 'crypto', 'stock', etc.
    types = ['STOCK', 'CRYPTO', 'stock', 'crypto', 'Bolsa', 'Mercado']
    for t in types:
        try:
            r = supabase.table('investments').insert({
                'user_id': 3,
                'symbol': 'TEST',
                'market': t,
                'quantity': 1,
                'avg_price': 100,
                'last_price': 100,
                'currency': 'EUR'
            }).execute()
            print("OK with:", t)
            # delete it
            supabase.table('investments').delete().eq('id', r.data[0]['id']).execute()
            return
        except Exception as e:
            pass

asyncio.run(test())
