import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Diagnóstico
print(f"DEBUG: CWD em supabase_client: {os.getcwd()}")

# Procurar .env
found_env = False
for path in [".env", "../../.env", "../../../.env", "../../../../.env"]:
    if os.path.exists(path):
        print(f"DEBUG: Encontrado .env em: {os.path.abspath(path)}")
        load_dotenv(path)
        found_env = True

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

print(f"DEBUG: SUPABASE_URL: '{SUPABASE_URL}'")

supabase: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("DEBUG: Cliente Supabase inicializado")
    except Exception as e:
        print(f"DEBUG: Erro ao inicializar Supabase: {e}")

def sync_user_with_supabase(external_id: str, email: str, display_name: str) -> int:
    try:
        if not supabase:
            print("ERROR: Supabase nao inicializado no sync_user")
            return None
        
        user_data = {
            'external_id': external_id,
            'provider': 'google',
            'email': email,
            'display_name': display_name
        }
        
        existing_user = supabase.table('users').select('id').eq('external_id', external_id).eq('provider', 'google').execute()
        
        if existing_user.data and len(existing_user.data) > 0:
            user_id = existing_user.data[0]['id']
            supabase.table('users').update({'email': email, 'display_name': display_name}).eq('id', user_id).execute()
            return user_id
        else:
            response = supabase.table('users').insert(user_data).execute()
            if response.data and len(response.data) > 0:
                return response.data[0]['id']
        return None
    except Exception as e:
        print(f"ERROR sync_user: {e}")
        return None
