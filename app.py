import os
from flask import Flask, redirect, request, session, jsonify
from flask_cors import CORS
import requests
from jose import jwt
from supabase import create_client, Client
from dotenv import load_dotenv
import json

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')

# Configurar CORS para permitir requisições do frontend React
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5174,http://localhost:3000').split(',')
CORS(app, supports_credentials=True, origins=allowed_origins)

# Variáveis de ambiente
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Inicializar cliente Supabase (apenas se as variáveis estiverem configuradas)
supabase: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("[OK] Cliente Supabase inicializado com sucesso")
    except Exception as e:
        print(f"[WARNING] Erro ao inicializar Supabase: {e}")
        supabase = None
else:
    print("[WARNING] SUPABASE_URL ou SUPABASE_SERVICE_KEY nao configurados")

# URLs do Google OAuth
GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs'

# Redirect URI (ajuste conforme necessário)
REDIRECT_URI = os.getenv('REDIRECT_URI', 'http://localhost:5000/callback/google')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5174')


@app.route('/login/google')
def login_google():
    """Redireciona o usuário para o Google OAuth"""
    if not GOOGLE_CLIENT_ID:
        print("[ERROR] GOOGLE_CLIENT_ID nao configurado")
        return redirect(f"{FRONTEND_URL}/login?error=config_error&details=GOOGLE_CLIENT_ID_missing")
    
    print(f"\n{'='*50}")
    print("[INFO] Iniciando login Google OAuth")
    print(f"{'='*50}")
    print(f"[INFO] Redirect URI: {REDIRECT_URI}")
    print(f"[INFO] Client ID: {GOOGLE_CLIENT_ID[:20]}...")
    
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"{GOOGLE_AUTH_URL}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    print(f"[INFO] URL de autorizacao gerada")
    print(f"{'='*50}\n")
    return redirect(auth_url)


@app.route('/callback/google')
def callback_google():
    """Processa o callback do Google OAuth"""
    code = request.args.get('code')
    error = request.args.get('error')
    
    print(f"\n{'='*50}")
    print("[INFO] Callback recebido do Google")
    print(f"{'='*50}")
    print(f"Code: {'[OK]' if code else '[ERROR]'}")
    print(f"Error: {error if error else 'Nenhum'}")
    
    if error:
        print(f"[ERROR] Erro do Google: {error}")
        return redirect(f"{FRONTEND_URL}/login?error=google_error&details={error}")
    
    if not code:
        print("[ERROR] Codigo de autorizacao nao recebido")
        return redirect(f"{FRONTEND_URL}/login?error=no_code")
    
    try:
        print("[INFO] Trocando codigo por token...")
        
        # Verificar se as credenciais estão configuradas
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            print("[ERROR] GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET nao configurados")
            print(f"   GOOGLE_CLIENT_ID: {'✅ Configurado' if GOOGLE_CLIENT_ID else '❌ Não configurado'}")
            print(f"   GOOGLE_CLIENT_SECRET: {'✅ Configurado' if GOOGLE_CLIENT_SECRET else '❌ Não configurado'}")
            return redirect(f"{FRONTEND_URL}/login?error=config_error")
        
        print(f"   📍 Redirect URI: {REDIRECT_URI}")
        print(f"   📍 Token URL: {GOOGLE_TOKEN_URL}")
        
        # Trocar código por token
        token_data = {
            'code': code,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uri': REDIRECT_URI,
            'grant_type': 'authorization_code'
        }
        
        print(f"   📤 Enviando requisição para trocar código...")
        token_response = requests.post(GOOGLE_TOKEN_URL, data=token_data, timeout=10)
        
        print(f"   📥 Status da resposta: {token_response.status_code}")
        
        if token_response.status_code != 200:
            error_text = token_response.text
            print(f"❌ Erro ao trocar código: {token_response.status_code}")
            print(f"   Resposta completa: {error_text}")
            
            # Tentar parsear erro JSON se possível
            try:
                error_json = token_response.json()
                error_description = error_json.get('error_description', error_json.get('error', 'Erro desconhecido'))
                print(f"   Erro do Google: {error_description}")
                return redirect(f"{FRONTEND_URL}/login?error=token_exchange_failed&details={error_description[:100]}")
            except:
                return redirect(f"{FRONTEND_URL}/login?error=token_exchange_failed&status={token_response.status_code}")
        
        token_response.raise_for_status()
        tokens = token_response.json()
        print(f"   ✅ Token recebido com sucesso")
        
        id_token = tokens.get('id_token')
        access_token = tokens.get('access_token')
        
        if not id_token:
            print("❌ ID token não recebido na resposta")
            return redirect(f"{FRONTEND_URL}/login?error=no_id_token")
        
        print("✅ Token recebido, decodificando...")
        # Decodificar e validar ID token (sem verificação de assinatura para simplificar)
        # Em produção, você deve verificar a assinatura usando JWKS
        decoded_token = jwt.get_unverified_claims(id_token)
        
        # Extrair informações do usuário
        external_id = decoded_token.get('sub')
        email = decoded_token.get('email')
        display_name = decoded_token.get('name', email.split('@')[0] if email else 'User')
        
        print(f"👤 Usuário: {email} ({external_id})")
        
        if not external_id or not email:
            print("❌ Informações do usuário incompletas no token")
            return redirect(f"{FRONTEND_URL}/login?error=invalid_token")
        
        print("💾 Sincronizando com Supabase...")
        # Verificar ou criar usuário no Supabase
        user_id = sync_user_with_supabase(external_id, email, display_name)
        
        if not user_id:
            print("❌ Erro ao sincronizar com Supabase")
            return redirect(f"{FRONTEND_URL}/login?error=db_error")
        
        print(f"✅ Usuário sincronizado: ID {user_id}")
        
        # Criar sessão
        session['user_id'] = user_id
        session['email'] = email
        session['display_name'] = display_name
        
        print("✅ Sessão criada, redirecionando para dashboard...")
        print(f"{'='*50}\n")
        
        # Redirecionar para dashboard
        return redirect(f"{FRONTEND_URL}/dashboard")
        
    except requests.RequestException as e:
        print(f"❌ Erro na requisição HTTP: {e}")
        print(f"   Tipo: {type(e).__name__}")
        error_details = str(e)
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_json = e.response.json()
                error_details = error_json.get('error_description', error_json.get('error', error_details))
                print(f"   Erro do Google: {error_details}")
            except:
                error_details = e.response.text[:200] if e.response.text else error_details
                print(f"   Resposta: {error_details}")
        import traceback
        traceback.print_exc()
        return redirect(f"{FRONTEND_URL}/login?error=token_exchange_failed&details={error_details[:100]}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        print(f"   Tipo: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return redirect(f"{FRONTEND_URL}/login?error=callback_error&details={str(e)[:100]}")


def sync_user_with_supabase(external_id: str, email: str, display_name: str) -> int:
    """Sincroniza usuário com Supabase - cria se não existir, atualiza se existir"""
    try:
        # Verificar se cliente Supabase foi inicializado
        if not supabase:
            print("❌ Cliente Supabase não inicializado")
            if not SUPABASE_URL:
                print("   ❌ SUPABASE_URL não configurado no .env")
            if not SUPABASE_SERVICE_KEY:
                print("   ❌ SUPABASE_SERVICE_KEY não configurado no .env")
            return None
        
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            print("❌ SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados")
            return None
        
        print(f"   🔍 Sincronizando usuário: {external_id}")
        print(f"   📍 Supabase URL: {SUPABASE_URL[:30]}...")
        
        # Preparar dados do usuário
        user_data = {
            'external_id': external_id,
            'provider': 'google',
            'email': email,
            'display_name': display_name
        }
        
        print(f"   📝 Dados do usuário: {user_data}")
        
        # Verificar se usuário já existe e inserir/atualizar conforme necessário
        # Trata o caso de chave duplicada de forma robusta
        try:
            # Primeiro, verificar se usuário já existe
            existing_user = supabase.table('users').select('id').eq('external_id', external_id).eq('provider', 'google').execute()
            
            if existing_user.data and len(existing_user.data) > 0:
                # Usuário existe, atualizar informações
                user_id = existing_user.data[0]['id']
                print(f"   ✅ Usuário encontrado: ID {user_id}, atualizando...")
                response = supabase.table('users').update({
                    'email': email,
                    'display_name': display_name
                }).eq('id', user_id).execute()
                
                print(f"   ✅ Usuário atualizado com sucesso")
                return user_id
            else:
                # Usuário não existe, tentar criar novo
                print(f"   ➕ Criando novo usuário...")
                try:
                    response = supabase.table('users').insert(user_data).execute()
                    
                    if response.data and len(response.data) > 0:
                        user_id = response.data[0]['id']
                        print(f"   ✅ Usuário criado: ID {user_id}")
                        return user_id
                    else:
                        print("❌ Erro: Nenhum dado retornado do insert")
                        return None
                except Exception as insert_error:
                    # Se for erro de chave duplicada (race condition), buscar o usuário existente
                    error_str = str(insert_error)
                    if '23505' in error_str or 'duplicate key' in error_str.lower():
                        print(f"   ⚠️  Chave duplicada detectada (possível race condition), buscando usuário existente...")
                        try:
                            response = supabase.table('users').select('id').eq('external_id', external_id).eq('provider', 'google').execute()
                            if response.data and len(response.data) > 0:
                                user_id = response.data[0]['id']
                                print(f"   ✅ Usuário encontrado após erro de duplicata: ID {user_id}")
                                # Atualizar informações
                                supabase.table('users').update({
                                    'email': email,
                                    'display_name': display_name
                                }).eq('id', user_id).execute()
                                return user_id
                            else:
                                print("   ❌ Usuário não encontrado após erro de duplicata")
                                return None
                        except Exception as retry_error:
                            print(f"   ❌ Erro ao buscar usuário após duplicata: {retry_error}")
                            import traceback
                            traceback.print_exc()
                            return None
                    else:
                        # Outro tipo de erro, propagar
                        raise
                    
        except Exception as db_error:
            print(f"   ❌ Erro no banco de dados: {db_error}")
            print(f"   Tipo: {type(db_error).__name__}")
            print("   💡 Dica: Verifique se a tabela 'users' existe e tem a estrutura correta")
            print("   💡 Execute o script sql.md no SQL Editor do Supabase")
            import traceback
            traceback.print_exc()
            return None
                
    except Exception as e:
        print(f"❌ Erro ao sincronizar com Supabase: {e}")
        print(f"   Tipo: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return None


@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    """Endpoint protegido que verifica se o usuário está logado"""
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    return jsonify({
        'logged_in': True,
        'user_id': user_id,
        'email': session.get('email'),
        'display_name': session.get('display_name')
    }), 200


@app.route('/api/logout', methods=['POST'])
def logout():
    """Limpa a sessão do usuário"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200


@app.route('/', methods=['GET'])
def root():
    """Root endpoint - health check"""
    return jsonify({'message': 'Financas API', 'status': 'running'}), 200


@app.route('/api/health', methods=['GET'])
def health():
    """Endpoint de health check"""
    return jsonify({'status': 'ok'}), 200


def require_auth():
    """Helper function para verificar autenticação"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return user_id


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Busca categorias do usuário"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        # Buscar categorias do usuário
        response = supabase.table('categories').select('*').eq('user_id', user_id).execute()
        categories = response.data if response.data else []
        
        # Se não houver categorias, criar categorias padrão
        if not categories:
            default_categories = [
                {'name': 'Alimentação', 'colour': '#FF5733'},
                {'name': 'Transporte', 'colour': '#337AFF'},
                {'name': 'Habitação', 'colour': '#33FF49'},
                {'name': 'Saúde', 'colour': '#FF33F5'},
                {'name': 'Lazer', 'colour': '#33FFF5'},
                {'name': 'Educação', 'colour': '#FFA833'},
                {'name': 'Serviços', 'colour': '#8333FF'},
                {'name': 'Outros', 'colour': '#808080'},
            ]
            
            for cat in default_categories:
                try:
                    supabase.table('categories').insert({
                        'user_id': user_id,
                        'name': cat['name'],
                        'colour': cat['colour']
                    }).execute()
                except Exception as e:
                    print(f"Erro ao criar categoria {cat['name']}: {e}")
            
            # Buscar novamente após criar
            response = supabase.table('categories').select('*').eq('user_id', user_id).execute()
            categories = response.data if response.data else []
        
        return jsonify({'categories': categories}), 200
    except Exception as e:
        print(f"Erro ao buscar categorias: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Busca transações do usuário"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        # Parâmetros de query
        limit = request.args.get('limit', 50, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Construir query
        query = supabase.table('expenses').select('*, categories(name, colour)').eq('user_id', user_id).order('date', desc=True).order('created_at', desc=True).limit(limit)
        
        if start_date:
            query = query.gte('date', start_date)
        if end_date:
            query = query.lte('date', end_date)
        
        response = query.execute()
        transactions = response.data if response.data else []
        
        return jsonify({'transactions': transactions}), 200
    except Exception as e:
        print(f"Erro ao buscar transações: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """Adiciona uma nova transação"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        data = request.get_json()
        
        # Validar dados
        if not data.get('descricao') or not data.get('valor') or not data.get('tipo') or not data.get('data'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Mapear tipo: 'despesa' -> 'expense', 'receita' -> 'income'
        transaction_type = 'expense' if data['tipo'] == 'despesa' else 'income'
        
        # Buscar ou criar categoria
        category_id = None
        if data.get('categoria'):
            # Buscar categoria pelo nome
            cat_response = supabase.table('categories').select('id').eq('user_id', user_id).eq('name', data['categoria']).execute()
            if cat_response.data and len(cat_response.data) > 0:
                category_id = cat_response.data[0]['id']
            else:
                # Criar categoria se não existir
                new_cat = supabase.table('categories').insert({
                    'user_id': user_id,
                    'name': data['categoria'],
                    'colour': '#808080'
                }).execute()
                if new_cat.data and len(new_cat.data) > 0:
                    category_id = new_cat.data[0]['id']
        
        # Combinar descrição e notas
        notes = data.get('descricao', '')
        if data.get('notas'):
            notes = f"{notes}\n{data['notas']}".strip()
        
        # Inserir transação
        transaction_data = {
            'user_id': user_id,
            'type': transaction_type,
            'amount': float(data['valor']),
            'currency': data.get('moeda', 'EUR'),
            'category_id': category_id,
            'date': data['data'],
            'notes': notes
        }
        
        response = supabase.table('expenses').insert(transaction_data).execute()
        
        if response.data and len(response.data) > 0:
            # Buscar a transação criada com categoria
            created = response.data[0]
            if category_id:
                cat_response = supabase.table('categories').select('name, colour').eq('id', category_id).execute()
                if cat_response.data:
                    created['categories'] = cat_response.data[0]
            
            return jsonify({'transaction': created, 'message': 'Transação adicionada com sucesso'}), 201
        else:
            return jsonify({'error': 'Failed to create transaction'}), 500
            
    except Exception as e:
        print(f"Erro ao adicionar transação: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/activity-summary', methods=['GET'])
def get_activity_summary():
    """Busca resumo da atividade financeira"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        # Parâmetros de query
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Se não especificado, usar mês atual
        from datetime import datetime, timedelta
        if not start_date:
            today = datetime.now()
            start_date = today.replace(day=1).strftime('%Y-%m-%d')
        if not end_date:
            today = datetime.now()
            next_month = today.replace(day=28) + timedelta(days=4)
            end_date = (next_month - timedelta(days=next_month.day)).strftime('%Y-%m-%d')
        
        # Buscar todas as transações do período
        response = supabase.table('expenses').select('*, categories(name, colour)').eq('user_id', user_id).gte('date', start_date).lte('date', end_date).order('date', desc=True).order('created_at', desc=True).execute()
        transactions = response.data if response.data else []
        
        # Calcular totais
        total_income = sum(float(t['amount']) for t in transactions if t['type'] == 'income')
        total_expense = sum(float(t['amount']) for t in transactions if t['type'] == 'expense')
        balance = total_income - total_expense
        
        # Calcular despesas por categoria
        expenses_by_category = {}
        for t in transactions:
            if t['type'] == 'expense' and t.get('categories'):
                cat_name = t['categories']['name']
                if cat_name not in expenses_by_category:
                    expenses_by_category[cat_name] = {'valor': 0, 'categoria': cat_name}
                expenses_by_category[cat_name]['valor'] += float(t['amount'])
        
        # Converter para lista e calcular percentagens
        total_expense_for_percent = total_expense if total_expense > 0 else 1
        despesas_por_categoria = [
            {
                'categoria': cat['categoria'],
                'valor': cat['valor'],
                'percentagem': round((cat['valor'] / total_expense_for_percent) * 100, 1)
            }
            for cat in expenses_by_category.values()
        ]
        despesas_por_categoria.sort(key=lambda x: x['valor'], reverse=True)
        
        # Buscar próximos pagamentos (despesas futuras)
        today = datetime.now().strftime('%Y-%m-%d')
        try:
            future_response = supabase.table('expenses').select('*').eq('user_id', user_id).eq('type', 'expense').gte('date', today).order('date', desc=False).limit(10).execute()
        except Exception:
            future_response = type('obj', (object,), {'data': []})()
        proximos_pagamentos = []
        for t in (future_response.data if future_response.data else []):
            proximos_pagamentos.append({
                'id': t['id'],
                'descricao': t.get('notes', 'Sem descrição') or 'Sem descrição',
                'valor': float(t['amount']),
                'data': t['date'],
                'categoria': 'Despesa'
            })
        
        # Últimas transações (ordenadas por data mais recente)
        ultimas_transacoes = []
        sorted_transactions = sorted(transactions, key=lambda x: (x['date'], x.get('created_at', '')), reverse=True)
        for t in sorted_transactions[:10]:
            ultimas_transacoes.append({
                'id': t['id'],
                'descricao': t.get('notes', 'Sem descrição') or 'Sem descrição',
                'valor': float(t['amount']) if t['type'] == 'income' else -float(t['amount']),
                'tipo': 'receita' if t['type'] == 'income' else 'despesa',
                'data': t['date']
            })
        
        return jsonify({
            'saldoAtual': balance,
            'despesasMes': total_expense,
            'receitasMes': total_income,
            'proximosPagamentos': proximos_pagamentos,
            'despesasPorCategoria': despesas_por_categoria,
            'ultimasTransacoes': ultimas_transacoes
        }), 200
        
    except Exception as e:
        print(f"Erro ao buscar resumo: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/financial-health', methods=['GET'])
def get_financial_health():
    """Calcula métricas de saúde financeira"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        from datetime import datetime, timedelta
        
        # Calcular período do mês atual
        today = datetime.now()
        start_date = today.replace(day=1).strftime('%Y-%m-%d')
        next_month = today.replace(day=28) + timedelta(days=4)
        end_date = (next_month - timedelta(days=next_month.day)).strftime('%Y-%m-%d')
        
        # Buscar transações do mês atual
        response = supabase.table('expenses').select('type, amount').eq('user_id', user_id).gte('date', start_date).lte('date', end_date).execute()
        transactions = response.data if response.data else []
        
        # Calcular renda e despesas mensais
        renda_mensal = sum(float(t['amount']) for t in transactions if t['type'] == 'income')
        despesas_mensais = sum(float(t['amount']) for t in transactions if t['type'] == 'expense')
        poupanca_mensal = renda_mensal - despesas_mensais
        
        # Calcular fundo de emergência (soma dos objetivos de poupança)
        savings_response = supabase.table('savings_goals').select('current_amount').eq('user_id', user_id).execute()
        savings_goals = savings_response.data if savings_response.data else []
        fundo_emergencia = sum(float(sg.get('current_amount', 0)) for sg in savings_goals)
        
        # Calcular investimentos totais
        investments_response = supabase.table('investments').select('quantity, avg_price, last_price').eq('user_id', user_id).execute()
        investments = investments_response.data if investments_response.data else []
        investimentos = 0
        for inv in investments:
            # Usar last_price se disponível, senão avg_price
            price = float(inv.get('last_price') or inv.get('avg_price') or 0)
            quantity = float(inv.get('quantity', 0))
            investimentos += price * quantity
        
        # Dívidas (por enquanto 0, pode ser expandido no futuro)
        dividas = 0
        
        # Calcular métricas derivadas
        taxa_poupanca = (poupanca_mensal / renda_mensal * 100) if renda_mensal > 0 else 0
        meses_fundo_emergencia = (fundo_emergencia / despesas_mensais) if despesas_mensais > 0 else 0
        taxa_endividamento = (dividas / renda_mensal * 100) if renda_mensal > 0 else 0
        
        # Calcular score de saúde financeira (0-100)
        # Baseado em:
        # - Taxa de poupança (40 pontos): 20% = 20pts, 30%+ = 40pts
        # - Fundo de emergência (30 pontos): 6 meses = 20pts, 12 meses+ = 30pts
        # - Taxa de endividamento (20 pontos): < 10% = 20pts, < 20% = 15pts, < 30% = 10pts
        # - Investimentos (10 pontos): ter investimentos = 10pts
        
        # Score de poupança (0-40 pontos)
        if taxa_poupanca < 0:
            score_poupanca = 0
        elif taxa_poupanca >= 30:
            score_poupanca = 40
        elif taxa_poupanca >= 20:
            score_poupanca = 20 + ((taxa_poupanca - 20) / 10) * 20  # Linear entre 20% e 30%
        else:
            score_poupanca = (taxa_poupanca / 20) * 20  # Linear até 20%
        
        # Score de emergência (0-30 pontos)
        if meses_fundo_emergencia >= 12:
            score_emergencia = 30
        elif meses_fundo_emergencia >= 6:
            score_emergencia = 20 + ((meses_fundo_emergencia - 6) / 6) * 10  # Linear entre 6 e 12 meses
        else:
            score_emergencia = (meses_fundo_emergencia / 6) * 20  # Linear até 6 meses
        
        # Score de endividamento (0-20 pontos)
        if taxa_endividamento < 10:
            score_endividamento = 20
        elif taxa_endividamento < 20:
            score_endividamento = 15
        elif taxa_endividamento < 30:
            score_endividamento = 10
        else:
            score_endividamento = 0
        
        # Score de investimentos (0-10 pontos)
        score_investimentos = 10 if investimentos > 0 else 0
        
        health_score = round(score_poupanca + score_emergencia + score_endividamento + score_investimentos)
        health_score = max(0, min(100, health_score))  # Garantir entre 0 e 100
        
        return jsonify({
            'healthScore': health_score,
            'metrics': {
                'rendaMensal': renda_mensal,
                'despesasMensais': despesas_mensais,
                'poupancaMensal': poupanca_mensal,
                'fundoEmergencia': fundo_emergencia,
                'dividas': dividas,
                'investimentos': investimentos
            },
            'taxaPoupanca': round(taxa_poupanca, 1),
            'mesesFundoEmergencia': round(meses_fundo_emergencia, 1),
            'taxaEndividamento': round(taxa_endividamento, 1)
        }), 200
        
    except Exception as e:
        print(f"Erro ao calcular saúde financeira: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/savings-goals', methods=['GET'])
def get_savings_goals():
    """Busca objetivos de poupança do usuário"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        response = supabase.table('savings_goals').select('*').eq('user_id', user_id).order('deadline', desc=False).execute()
        goals = response.data if response.data else []
        
        # Formatar dados para o frontend
        formatted_goals = []
        for goal in goals:
            formatted_goals.append({
                'id': goal['id'],
                'nome': goal['name'],
                'valorAtual': float(goal.get('current_amount', 0)),
                'valorObjetivo': float(goal['target_amount']),
                'prazo': goal.get('deadline', ''),
                'categoria': 'Outros'  # A categoria não está na tabela, pode ser adicionada depois
            })
        
        return jsonify({'goals': formatted_goals}), 200
        
    except Exception as e:
        print(f"Erro ao buscar objetivos de poupança: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/savings-goals', methods=['POST'])
def create_savings_goal():
    """Cria um novo objetivo de poupança"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        data = request.get_json()
        
        if not data.get('nome') or not data.get('valorObjetivo') or not data.get('prazo'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        goal_data = {
            'user_id': user_id,
            'name': data['nome'],
            'target_amount': float(data['valorObjetivo']),
            'current_amount': float(data.get('valorAtual', 0)),
            'deadline': data['prazo']
        }
        
        response = supabase.table('savings_goals').insert(goal_data).execute()
        
        if response.data and len(response.data) > 0:
            created = response.data[0]
            return jsonify({
                'goal': {
                    'id': created['id'],
                    'nome': created['name'],
                    'valorAtual': float(created.get('current_amount', 0)),
                    'valorObjetivo': float(created['target_amount']),
                    'prazo': created.get('deadline', ''),
                    'categoria': 'Outros'
                },
                'message': 'Objetivo de poupança criado com sucesso'
            }), 201
        else:
            return jsonify({'error': 'Failed to create savings goal'}), 500
            
    except Exception as e:
        print(f"Erro ao criar objetivo de poupança: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/savings-goals/<int:goal_id>', methods=['PUT'])
def update_savings_goal(goal_id):
    """Atualiza um objetivo de poupança"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        data = request.get_json()
        
        # Verificar se o objetivo pertence ao usuário
        check_response = supabase.table('savings_goals').select('user_id').eq('id', goal_id).execute()
        if not check_response.data or len(check_response.data) == 0:
            return jsonify({'error': 'Savings goal not found'}), 404
        
        if check_response.data[0]['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Preparar dados para atualização
        update_data = {}
        if 'nome' in data:
            update_data['name'] = data['nome']
        if 'valorObjetivo' in data:
            update_data['target_amount'] = float(data['valorObjetivo'])
        if 'valorAtual' in data:
            update_data['current_amount'] = float(data['valorAtual'])
        if 'prazo' in data:
            update_data['deadline'] = data['prazo']
        
        if not update_data:
            return jsonify({'error': 'No fields to update'}), 400
        
        response = supabase.table('savings_goals').update(update_data).eq('id', goal_id).execute()
        
        if response.data and len(response.data) > 0:
            updated = response.data[0]
            return jsonify({
                'goal': {
                    'id': updated['id'],
                    'nome': updated['name'],
                    'valorAtual': float(updated.get('current_amount', 0)),
                    'valorObjetivo': float(updated['target_amount']),
                    'prazo': updated.get('deadline', ''),
                    'categoria': 'Outros'
                },
                'message': 'Objetivo de poupança atualizado com sucesso'
            }), 200
        else:
            return jsonify({'error': 'Failed to update savings goal'}), 500
            
    except Exception as e:
        print(f"Erro ao atualizar objetivo de poupança: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/savings-goals/<int:goal_id>', methods=['DELETE'])
def delete_savings_goal(goal_id):
    """Deleta um objetivo de poupança"""
    user_id = require_auth()
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    try:
        # Verificar se o objetivo pertence ao usuário
        check_response = supabase.table('savings_goals').select('user_id').eq('id', goal_id).execute()
        if not check_response.data or len(check_response.data) == 0:
            return jsonify({'error': 'Savings goal not found'}), 404
        
        if check_response.data[0]['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        response = supabase.table('savings_goals').delete().eq('id', goal_id).execute()
        
        return jsonify({'message': 'Objetivo de poupança deletado com sucesso'}), 200
            
    except Exception as e:
        print(f"Erro ao deletar objetivo de poupança: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ====== ROTAS API MASSIVE.COM ======

MASSIVE_API_KEY = os.getenv('MASSIVE_API_KEY')
MASSIVE_API_BASE_URL = 'https://api.massive.com'

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    """Busca dados de ação da API Massive.com"""
    
    try:
        symbol = symbol.upper()
        
        # Se temos a chave de API, tentar usar
        if MASSIVE_API_KEY:
            try:
                # Chamar API Massive
                headers = {
                    'Authorization': f'Bearer {MASSIVE_API_KEY}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(
                    f'{MASSIVE_API_BASE_URL}/quote/{symbol}',
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    return jsonify({
                        'symbol': symbol,
                        'price': data.get('last'),
                        'currency': data.get('currency', 'USD'),
                        'timestamp': data.get('timestamp'),
                        'change': data.get('change'),
                        'changePercent': data.get('changePercent'),
                        'high': data.get('high'),
                        'low': data.get('low'),
                        'open': data.get('open'),
                        'volume': data.get('volume'),
                        'name': data.get('description', symbol)
                    }), 200
            except Exception as e:
                print(f"Aviso: Erro ao buscar de Massive API: {e}")
                # Continuar com fallback
        
        # Fallback: Preços simulados para demonstração
        fallback_prices = {
            'AAPL': {'price': 236.50, 'name': 'Apple Inc.', 'currency': 'USD', 'change': 2.50, 'changePercent': 1.07},
            'MSFT': {'price': 420.75, 'name': 'Microsoft Corporation', 'currency': 'USD', 'change': 5.25, 'changePercent': 1.26},
            'GOOGL': {'price': 192.30, 'name': 'Alphabet Inc.', 'currency': 'USD', 'change': -1.20, 'changePercent': -0.62},
            'AMZN': {'price': 210.45, 'name': 'Amazon.com Inc.', 'currency': 'USD', 'change': 3.15, 'changePercent': 1.52},
            'TSLA': {'price': 285.20, 'name': 'Tesla Inc.', 'currency': 'USD', 'change': -4.80, 'changePercent': -1.66},
            'META': {'price': 605.75, 'name': 'Meta Platforms Inc.', 'currency': 'USD', 'change': 8.50, 'changePercent': 1.42},
            'NFLX': {'price': 298.60, 'name': 'Netflix Inc.', 'currency': 'USD', 'change': 2.40, 'changePercent': 0.81},
            'NVDA': {'price': 975.50, 'name': 'NVIDIA Corporation', 'currency': 'USD', 'change': 15.30, 'changePercent': 1.59},
            'JPM': {'price': 221.80, 'name': 'JPMorgan Chase & Co.', 'currency': 'USD', 'change': 1.20, 'changePercent': 0.54},
            'V': {'price': 305.40, 'name': 'Visa Inc.', 'currency': 'USD', 'change': 3.60, 'changePercent': 1.19},
            'WMT': {'price': 89.75, 'name': 'Walmart Inc.', 'currency': 'USD', 'change': 1.15, 'changePercent': 1.29},
            'DIS': {'price': 92.30, 'name': 'The Walt Disney Company', 'currency': 'USD', 'change': -0.70, 'changePercent': -0.75},
            'INTC': {'price': 42.80, 'name': 'Intel Corporation', 'currency': 'USD', 'change': 0.50, 'changePercent': 1.18},
            'AMD': {'price': 189.50, 'name': 'Advanced Micro Devices Inc.', 'currency': 'USD', 'change': 4.20, 'changePercent': 2.27},
            'PYPL': {'price': 82.45, 'name': 'PayPal Holdings Inc.', 'currency': 'USD', 'change': 1.30, 'changePercent': 1.60},
            'UBER': {'price': 75.20, 'name': 'Uber Technologies Inc.', 'currency': 'USD', 'change': -0.80, 'changePercent': -1.05},
            'SPOT': {'price': 252.10, 'name': 'Spotify Technology S.A.', 'currency': 'USD', 'change': 5.40, 'changePercent': 2.19},
            'COIN': {'price': 195.60, 'name': 'Coinbase Global Inc.', 'currency': 'USD', 'change': 8.30, 'changePercent': 4.43},
            'ORCL': {'price': 163.90, 'name': 'Oracle Corporation', 'currency': 'USD', 'change': 2.10, 'changePercent': 1.30},
            'CSCO': {'price': 56.75, 'name': 'Cisco Systems Inc.', 'currency': 'USD', 'change': 0.45, 'changePercent': 0.80},
        }
        
        if symbol in fallback_prices:
            data = fallback_prices[symbol]
            return jsonify({
                'symbol': symbol,
                'price': data['price'],
                'currency': data['currency'],
                'change': data['change'],
                'changePercent': data['changePercent'],
                'name': data['name'],
                'source': 'fallback'
            }), 200
        else:
            return jsonify({'error': f'Stock symbol {symbol} not found'}), 404
    
    except Exception as e:
        print(f"Erro ao buscar dados da ação: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/stocks/search', methods=['GET'])
def search_stocks():
    """Busca ações pelo símbolo"""
    query = request.args.get('q', '').upper()
    
    if not query or len(query) < 1:
        return jsonify({'error': 'Query parameter required'}), 400
    
    try:
        # Lista de ações populares para autocomplete
        popular_stocks = [
            {'symbol': 'AAPL', 'name': 'Apple Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'exchange': 'NASDAQ'},
            {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'META', 'name': 'Meta Platforms Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'NFLX', 'name': 'Netflix Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'exchange': 'NASDAQ'},
            {'symbol': 'JPM', 'name': 'JPMorgan Chase & Co.', 'exchange': 'NYSE'},
            {'symbol': 'V', 'name': 'Visa Inc.', 'exchange': 'NYSE'},
            {'symbol': 'WMT', 'name': 'Walmart Inc.', 'exchange': 'NYSE'},
            {'symbol': 'DIS', 'name': 'The Walt Disney Company', 'exchange': 'NYSE'},
            {'symbol': 'INTC', 'name': 'Intel Corporation', 'exchange': 'NASDAQ'},
            {'symbol': 'AMD', 'name': 'Advanced Micro Devices Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'PYPL', 'name': 'PayPal Holdings Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'UBER', 'name': 'Uber Technologies Inc.', 'exchange': 'NYSE'},
            {'symbol': 'SPOT', 'name': 'Spotify Technology S.A.', 'exchange': 'NYSE'},
            {'symbol': 'COIN', 'name': 'Coinbase Global Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'ORCL', 'name': 'Oracle Corporation', 'exchange': 'NYSE'},
            {'symbol': 'CSCO', 'name': 'Cisco Systems Inc.', 'exchange': 'NASDAQ'},
        ]
        
        # Filtrar stocks que contêm a query
        results = [s for s in popular_stocks if query in s['symbol'] or query in s['name'].upper()]
        
        # Se não encontrar com autocomplete local, tentar API Massive como fallback
        if not results and MASSIVE_API_KEY:
            try:
                headers = {
                    'Authorization': f'Bearer {MASSIVE_API_KEY}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(
                    f'{MASSIVE_API_BASE_URL}/search',
                    headers=headers,
                    params={'query': query},
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results = data.get('results', [])[:10]
            except:
                pass  # Usar apenas resultados locais se API falhar
        
        return jsonify({
            'results': results[:10]
        }), 200
    
    except Exception as e:
        print(f"Erro ao buscar ações: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/stock/quote/<symbol>', methods=['GET'])
def get_stock_quote(symbol):
    """Obtém cotação de uma ação com dados detalhados"""
    if not MASSIVE_API_KEY:
        return jsonify({'error': 'Massive API key not configured'}), 500
    
    try:
        symbol = symbol.upper()
        
        headers = {
            'Authorization': f'Bearer {MASSIVE_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(
            f'{MASSIVE_API_BASE_URL}/quote/{symbol}',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 404:
            return jsonify({'error': f'Stock symbol {symbol} not found'}), 404
        
        if response.status_code != 200:
            return jsonify({'error': f'Massive API error: {response.status_code}'}), response.status_code
        
        data = response.json()
        
        return jsonify(data), 200
    
    except Exception as e:
        print(f"Erro ao buscar cotação: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ====== WEB SERVICES PÚBLICOS (SEM AUTENTICAÇÃO) ======

@app.route('/ws/users/<int:user_id>/transactions', methods=['GET'])
def ws_public_transactions(user_id: int):
    """Exibe as últimas transações de um utilizador sem exigir sessão (read-only)."""
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500

    try:
        limit = request.args.get('limit', 20, type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Evitar abusos com um teto simples
        limit = max(1, min(limit, 100))

        query = (
            supabase
            .table('expenses')
            .select('id, date, amount, type, currency, notes, categories(name, colour)')
            .eq('user_id', user_id)
            .order('date', desc=True)
            .order('created_at', desc=True)
            .limit(limit)
        )

        if start_date:
            query = query.gte('date', start_date)
        if end_date:
            query = query.lte('date', end_date)

        response = query.execute()
        rows = response.data or []

        transactions = [
            {
                'id': row['id'],
                'data': row['date'],
                'valor': float(row['amount']),
                'tipo': 'receita' if row['type'] == 'income' else 'despesa',
                'moeda': row.get('currency', 'EUR'),
                'categoria': (row.get('categories') or {}).get('name'),
                'corCategoria': (row.get('categories') or {}).get('colour'),
                'descricao': row.get('notes') or ''
            }
            for row in rows
        ]

        return jsonify({
            'user_id': user_id,
            'total': len(transactions),
            'transactions': transactions
        }), 200

    except Exception as e:
        print(f"Erro no web service de transações públicas: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/ws/users/<int:user_id>/summary', methods=['GET'])
def ws_public_summary(user_id: int):
    """Resumo financeiro público por utilizador (totais e percentagens por categoria)."""
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500

    try:
        from datetime import datetime, timedelta

        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Período padrão: mês corrente
        if not start_date or not end_date:
            today = datetime.now()
            month_start = today.replace(day=1).strftime('%Y-%m-%d')
            next_month = today.replace(day=28) + timedelta(days=4)
            month_end = (next_month - timedelta(days=next_month.day)).strftime('%Y-%m-%d')
            start_date = start_date or month_start
            end_date = end_date or month_end

        response = (
            supabase
            .table('expenses')
            .select('amount, type, date, categories(name)')
            .eq('user_id', user_id)
            .gte('date', start_date)
            .lte('date', end_date)
            .execute()
        )
        transactions = response.data or []

        total_income = sum(float(t['amount']) for t in transactions if t['type'] == 'income')
        total_expense = sum(float(t['amount']) for t in transactions if t['type'] == 'expense')
        balance = total_income - total_expense

        expenses_by_category = {}
        for t in transactions:
            if t['type'] != 'expense':
                continue
            cat_name = (t.get('categories') or {}).get('name', 'Sem categoria')
            expenses_by_category.setdefault(cat_name, 0)
            expenses_by_category[cat_name] += float(t['amount'])

        expense_total_for_percent = total_expense if total_expense > 0 else 1
        despesas_por_categoria = [
            {
                'categoria': cat,
                'valor': valor,
                'percentagem': round((valor / expense_total_for_percent) * 100, 1)
            }
            for cat, valor in expenses_by_category.items()
        ]
        despesas_por_categoria.sort(key=lambda x: x['valor'], reverse=True)

        return jsonify({
            'user_id': user_id,
            'periodo': {'inicio': start_date, 'fim': end_date},
            'totais': {
                'receitas': total_income,
                'despesas': total_expense,
                'saldo': balance
            },
            'despesasPorCategoria': despesas_por_categoria
        }), 200

    except Exception as e:
        print(f"Erro no web service de resumo público: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/ws/users/<int:user_id>/savings-goals', methods=['GET'])
def ws_public_savings_goals(user_id: int):
    """Lista objetivos de poupança de um utilizador (somente leitura, sem sessão)."""
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500

    try:
        response = (
            supabase
            .table('savings_goals')
            .select('id, name, target_amount, current_amount, deadline')
            .eq('user_id', user_id)
            .order('deadline', desc=False)
            .execute()
        )

        goals = response.data or []
        formatted = [
            {
                'id': g['id'],
                'nome': g['name'],
                'valorObjetivo': float(g['target_amount']),
                'valorAtual': float(g.get('current_amount', 0)),
                'prazo': g.get('deadline') or ''
            }
            for g in goals
        ]

        return jsonify({
            'user_id': user_id,
            'total': len(formatted),
            'goals': formatted
        }), 200

    except Exception as e:
        print(f"Erro no web service de objetivos públicos: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ====== ENDPOINTS DE CONFIGURAÇÕES DO USUÁRIO ======

@app.route('/api/user/settings', methods=['GET'])
def get_user_settings():
    """Obtém as configurações do usuário"""
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        response = supabase.table('user_settings').select('*').eq('user_id', user_id).execute()
        
        if response.data and len(response.data) > 0:
            settings = response.data[0]
            return jsonify({
                'settings': {
                    'telefone': settings.get('telefone'),
                    'dataNascimento': settings.get('data_nascimento'),
                    'endereco': settings.get('endereco'),
                    'cidade': settings.get('cidade'),
                    'codigoPostal': settings.get('codigo_postal'),
                    'pais': settings.get('pais', 'Portugal'),
                    'moeda': settings.get('moeda', 'EUR'),
                    'idioma': settings.get('idioma', 'pt-PT'),
                    'tema': settings.get('tema', 'claro'),
                    'notificacoes': {
                        'email': settings.get('notificacoes_email', True),
                        'sms': settings.get('notificacoes_sms', False),
                        'push': settings.get('notificacoes_push', True),
                    },
                    'nivelPrivacidade': settings.get('nivel_privacidade', 'normal'),
                    'rendaMensal': float(settings.get('renda_mensal', 0)) if settings.get('renda_mensal') else None,
                    'metaPoupancaMensal': float(settings.get('meta_poupanca_mensal', 0)) if settings.get('meta_poupanca_mensal') else None,
                    'fundoEmergencia': float(settings.get('fundo_emergencia', 0)) if settings.get('fundo_emergencia') else None,
                }
            }), 200
        else:
            # Retornar configurações padrão se não existir
            return jsonify({
                'settings': {
                    'telefone': None,
                    'dataNascimento': None,
                    'endereco': None,
                    'cidade': None,
                    'codigoPostal': None,
                    'pais': 'Portugal',
                    'moeda': 'EUR',
                    'idioma': 'pt-PT',
                    'tema': 'claro',
                    'notificacoes': {
                        'email': True,
                        'sms': False,
                        'push': True,
                    },
                    'nivelPrivacidade': 'normal',
                    'rendaMensal': None,
                    'metaPoupancaMensal': None,
                    'fundoEmergencia': None,
                }
            }), 200
    
    except Exception as e:
        print(f"Erro ao obter configurações: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/settings', methods=['PUT', 'POST'])
def update_user_settings():
    """Atualiza as configurações do usuário"""
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        
        # Preparar dados para o Supabase
        settings_data = {
            'user_id': user_id,
            'telefone': data.get('telefone'),
            'data_nascimento': data.get('dataNascimento'),
            'endereco': data.get('endereco'),
            'cidade': data.get('cidade'),
            'codigo_postal': data.get('codigoPostal'),
            'pais': data.get('pais', 'Portugal'),
            'moeda': data.get('moeda', 'EUR'),
            'idioma': data.get('idioma', 'pt-PT'),
            'tema': data.get('tema', 'claro'),
            'notificacoes_email': data.get('notificacoes', {}).get('email', True),
            'notificacoes_sms': data.get('notificacoes', {}).get('sms', False),
            'notificacoes_push': data.get('notificacoes', {}).get('push', True),
            'nivel_privacidade': data.get('nivelPrivacidade', 'normal'),
            'renda_mensal': data.get('rendaMensal'),
            'meta_poupanca_mensal': data.get('metaPoupancaMensal'),
            'fundo_emergencia': data.get('fundoEmergencia'),
        }
        
        # Tentar atualizar, se não existir, criar
        response = supabase.table('user_settings').upsert(settings_data).execute()
        
        return jsonify({
            'message': 'Configurações atualizadas com sucesso',
            'settings': settings_data
        }), 200
    
    except Exception as e:
        print(f"Erro ao atualizar configurações: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ====== ENDPOINTS DE INVESTIMENTOS EM AÇÕES ======

@app.route('/api/investments/stocks', methods=['GET'])
def get_stock_investments():
    """Obtém todos os investimentos em ações do usuário"""
    print("[DEBUG] GET /api/investments/stocks")
    if not supabase:
        print("[ERROR] Supabase not configured")
        return jsonify({'error': 'Database not configured'}), 500
    
    user_id = session.get('user_id')
    print(f"[DEBUG] user_id: {user_id}")
    if not user_id:
        print("[WARNING] Not authenticated")
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        print(f"[DEBUG] Fetching investments for user_id: {user_id}")
        response = supabase.table('investments').select('*').eq('user_id', user_id).execute()
        print(f"[DEBUG] Response data: {response.data}")
        
        investments = []
        for inv in response.data or []:
            investments.append({
                'id': inv['id'],
                'symbol': inv['symbol'],
                'quantity': inv['quantity'],
                'avg_price': float(inv.get('avg_price', 0) or 0),
                'last_price': float(inv.get('last_price', 0) or 0),
                'market': inv.get('market', 'stocks'),
                'currency': inv.get('currency', 'USD'),
            })
        
        print(f"[DEBUG] Returning {len(investments)} investments")
        return jsonify({'investments': investments}), 200
    
    except Exception as e:
        print(f"[ERROR] Erro ao obter investimentos: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/investments/stocks', methods=['POST'])
def add_stock_investment():
    """Adiciona um novo investimento em ações"""
    print("[DEBUG] POST /api/investments/stocks")
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    user_id = session.get('user_id')
    print(f"[DEBUG] user_id: {user_id}")
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        print(f"[DEBUG] Received data: {data}")
        
        investment_data = {
            'user_id': user_id,
            'symbol': data['symbol'].upper(),
            'quantity': int(data['quantity']),
            'avg_price': float(data['purchase_price']),
            'last_price': float(data['purchase_price']),
            'market': 'stock',
            'currency': 'USD',
        }
        
        print(f"[DEBUG] Inserting investment: {investment_data}")
        response = supabase.table('investments').insert(investment_data).execute()
        
        print(f"[DEBUG] Response: {response.data}")
        inv_data = response.data[0] if response.data else {}
        investment = {
            'id': inv_data.get('id'),
            'symbol': inv_data.get('symbol'),
            'quantity': inv_data.get('quantity'),
            'avg_price': float(inv_data.get('avg_price', 0) or 0),
            'last_price': float(inv_data.get('last_price', 0) or 0),
            'market': inv_data.get('market', 'stocks'),
            'currency': inv_data.get('currency', 'USD'),
        }
        return jsonify({
            'message': 'Investimento adicionado com sucesso',
            'investment': investment
        }), 201
    
    except Exception as e:
        print(f"[ERROR] Erro ao adicionar investimento: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/investments/stocks/<int:investment_id>', methods=['DELETE'])
def delete_stock_investment(investment_id):
    """Remove um investimento em ações"""
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        response = supabase.table('investments').delete().eq('id', investment_id).eq('user_id', user_id).execute()
        
        return jsonify({'message': 'Investimento removido com sucesso'}), 200
    
    except Exception as e:
        print(f"Erro ao remover investimento: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/investments/stocks/<int:investment_id>', methods=['PUT'])
def update_stock_investment(investment_id):
    """Atualiza um investimento em ações (principalmente o preço atual)"""
    if not supabase:
        return jsonify({'error': 'Database not configured'}), 500
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        
        update_data = {}
        if 'quantity' in data:
            update_data['quantity'] = int(data['quantity'])
        
        response = supabase.table('investments').update(update_data).eq('id', investment_id).eq('user_id', user_id).execute()
        
        return jsonify({'message': 'Investimento atualizado com sucesso'}), 200
    
    except Exception as e:
        print(f"Erro ao atualizar investimento: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# Chatbot de IA para finanças
FINANCE_SYSTEM_PROMPT = """Você é um assistente financeiro experiente e amigável. 
Sua função é ajudar os usuários com:
- Dicas de budgeting e gestão financeira
- Conselhos sobre poupança e investimentos
- Análise de despesas
- Estratégias de redução de custos
- Educação financeira básica

Sempre forneça conselhos práticos, baseados em boas práticas financeiras.
Mantenha um tom amigável, profissional e informativo.
Se a pergunta não for relacionada com finanças, redirecione gentilmente para tópicos financeiros."""

def get_ai_response(user_message, conversation_history=None):
    """Obter resposta do assistente de IA usando Google Generative AI (Gemini)"""
    api_key = GOOGLE_API_KEY or OPENAI_API_KEY
    if not api_key:
        print("[WARN] Nenhuma API key configurada (GOOGLE_API_KEY ou OPENAI_API_KEY)")
        return get_fallback_response(user_message)

    try:
        import google.genai as genai

        print("[AI] Usando chave do Gemini (Google API)")
        if GOOGLE_API_KEY:
            print("[AI] Fonte da chave: GOOGLE_API_KEY")
        elif OPENAI_API_KEY:
            print("[AI] Fonte da chave: OPENAI_API_KEY (reutilizada para Gemini)")

        client = genai.Client(api_key=api_key)

        def to_content(msg):
            role = msg.get('role', 'user')
            if role in ['bot', 'assistant']:
                role = 'model'
            elif role != 'user':
                role = 'user'
            text = msg.get('content', '')
            return genai.types.Content(
                role=role,
                parts=[genai.types.Part(text=text)],
            )

        history = [to_content(m) for m in (conversation_history or [])][-10:]
        messages = history + [genai.types.Content(role="user", parts=[genai.types.Part(text=user_message)])]

        response = client.models.generate_content(
            model="models/gemini-2.0-flash-lite",
            contents=messages,
            config=genai.types.GenerateContentConfig(
                temperature=0.6,
                top_p=0.95,
                max_output_tokens=400,
                system_instruction=FINANCE_SYSTEM_PROMPT,
                safety_settings=[
                    genai.types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="BLOCK_ONLY_HIGH",
                    ),
                    genai.types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="BLOCK_ONLY_HIGH",
                    ),
                    genai.types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="BLOCK_ONLY_HIGH",
                    ),
                    genai.types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="BLOCK_ONLY_HIGH",
                    ),
                ],
            ),
        )

        text = getattr(response, 'text', '') or ''

        if not text.strip():
            print("[AI] Resposta vazia ou bloqueada, caindo para fallback")
            return get_fallback_response(user_message)

        print("[AI] Resposta Gemini gerada com sucesso")
        return text.strip()

    except Exception as e:
        print(f"[ERROR] Erro ao chamar Google Generative AI: {e}")
        import traceback
        traceback.print_exc()
        return get_fallback_response(user_message)

def get_fallback_response(user_message):
    """Respostas predefinidas quando OpenAI não está disponível"""
    message_lower = user_message.lower()
    
    if any(word in message_lower for word in ['orçamento', 'budget', 'gastar']):
        return """Para criar um orçamento eficaz:
1. Liste todas as suas despesas mensais
2. Divida em categorias (habitação, alimentação, transporte, etc.)
3. Defina limites para cada categoria
4. Revise mensalmente e ajuste conforme necessário

Uma boa prática é usar a regra 50/30/20:
- 50% para necessidades
- 30% para desejos
- 20% para poupança e dívidas"""
    
    elif any(word in message_lower for word in ['poupar', 'economizar', 'save']):
        return """Dicas para poupar dinheiro:
1. Automatize suas economias (transfira para conta de poupança automaticamente)
2. Defina metas de poupança claras
3. Encontre áreas para reduzir gastos
4. Use apps para rastrear despesas
5. Cancele assinaturas que não usa

Comece com pequenas quantidades e aumente gradualmente!"""
    
    elif any(word in message_lower for word in ['investimento', 'investir', 'stocks', 'ações']):
        return """Para começar a investir:
1. Tenha uma emergência de 3-6 meses de despesas
2. Entenda seus objetivos e horizonte de tempo
3. Considere sua tolerância ao risco
4. Diversifique sua carteira
5. Comece com educação antes de investir

Tipos de investimentos: ações, ETFs, fundos mútuos, renda fixa, criptomoedas."""
    
    elif any(word in message_lower for word in ['dívida', 'empréstimo', 'debt', 'crédito']):
        return """Estratégia para gerenciar dívidas:
1. Liste todas as dívidas com taxa de juros
2. Priorize pagamento das mais altas taxas
3. Negocie taxas menores se possível
4. Faça pagamentos extras quando puder
5. Evite acumular novas dívidas

Métodos: Snowball (menores primeiro) ou Avalanche (maiores juros primeiro)."""
    
    else:
        return """Posso ajudá-lo com:
- Dicas de orçamento e gestão de dinheiro
- Estratégias de poupança
- Planejamento de investimentos
- Gestão de dívidas
- Educação financeira básica

O que você gostaria de saber sobre finanças?"""

@app.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint para o chatbot de finanças"""
    if not session.get('user_id'):
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        conversation_history = data.get('conversationHistory', [])
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        response = get_ai_response(user_message, conversation_history)
        
        return jsonify({
            'response': response,
            'status': 'success'
        }), 200
    
    except Exception as e:
        print(f"Erro no endpoint /api/chat: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Verificar se variáveis de ambiente estão configuradas
    required_vars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"[WARNING] Missing environment variables: {', '.join(missing_vars)}")
        print("Please set them in a .env file or environment variables")
    
    # Detectar se estamos em Vercel
    is_vercel = os.getenv('VERCEL') == '1'
    
    # Em Vercel, não iniciar servidor (serverless)
    if not is_vercel:
        print("\n" + "="*50)
        print("[START] Servidor Flask iniciando...")
        print("="*50)
        print(f"[INFO] URL: http://localhost:5000")
        print(f"[INFO] Health Check: http://localhost:5000/api/health")
        print(f"[INFO] Login Google: http://localhost:5000/login/google")
        print("="*50)
        print("[INFO] Mantenha este terminal aberto!")
        print("="*50 + "\n")
        
        app.run(debug=True, port=5000, host='127.0.0.1')

