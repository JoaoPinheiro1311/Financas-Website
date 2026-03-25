import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Procurar .env local, na raiz do servico ou na raiz do projeto
load_dotenv(".env")
load_dotenv("../../.env")
load_dotenv("../../../.env")
load_dotenv("../../../../.env")

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

supabase: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        print(f"Error initializing Supabase: {e}")
