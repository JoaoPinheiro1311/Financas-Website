from datetime import datetime, timedelta
from app.utils.auth import get_current_user
from fastapi import APIRouter, HTTPException, Depends
from app.infrastructure.supabase_client import supabase
import os
import google.genai as genai

router = APIRouter()

@router.get("/")
async def get_activity_summary(
    start_date: str = None, 
    end_date: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Retorna o resumo completo de atividade financeira (Portado do Monolito)"""
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        today = datetime.now()
        if not start_date:
            start_date = today.replace(day=1).strftime('%Y-%m-%d')
        if not end_date:
            next_month = today.replace(day=28) + timedelta(days=4)
            end_date = (next_month - timedelta(days=next_month.day)).strftime('%Y-%m-%d')
        
        response = supabase.table('expenses').select('*, categories(name, colour)').eq('user_id', user_id).gte('date', start_date).lte('date', end_date).order('date', desc=True).execute()
        transactions = response.data if response.data else []
        
        total_income = sum(float(t['amount']) for t in transactions if t['type'] == 'income')
        total_expense = sum(float(t['amount']) for t in transactions if t['type'] == 'expense')
        balance = total_income - total_expense
        
        expenses_by_category = {}
        for t in transactions:
            if t['type'] == 'expense' and t.get('categories'):
                cat_name = t['categories']['name']
                if cat_name not in expenses_by_category:
                    expenses_by_category[cat_name] = {'valor': 0, 'categoria': cat_name}
                expenses_by_category[cat_name]['valor'] += float(t['amount'])
        
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
        
        ultimas_transacoes = []
        for t in transactions[:10]:
            ultimas_transacoes.append({
                'id': t['id'],
                'descricao': t.get('notes', 'Sem descricao') or 'Sem descricao',
                'valor': float(t['amount']) if t['type'] == 'income' else -float(t['amount']),
                'tipo': 'receita' if t['type'] == 'income' else 'despesa',
                'data': t['date']
            })
        
        return {
            'saldoAtual': balance,
            'despesasMes': total_expense,
            'receitasMes': total_income,
            'proximosPagamentos': [],
            'despesasPorCategoria': despesas_por_categoria,
            'ultimasTransacoes': ultimas_transacoes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def get_financial_health(current_user: dict = Depends(get_current_user)):
    """Calcula metricas de saude financeira completas"""
    user_id = current_user['user_id']
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        response = supabase.table('expenses').select('type, amount').eq('user_id', user_id).execute()
        trx = response.data if response.data else []
        income = sum(float(t['amount']) for t in trx if t['type'] == 'income')
        expense = sum(float(t['amount']) for t in trx if t['type'] == 'expense')
        
        inv_resp = supabase.table('investments').select('quantity, last_price').eq('user_id', user_id).execute()
        investments_total = sum(float(i.get('quantity', 0)) * float(i.get('last_price', 0)) for i in (inv_resp.data or []))
        
        goals_resp = supabase.table('savings_goals').select('current_amount').eq('user_id', user_id).execute()
        fundo_emergencia = sum(float(g.get('current_amount', 0)) for g in (goals_resp.data or []))
        
        taxa_poupanca = ((income - expense) / income * 100) if income > 0 else 0
        meses_reserva = fundo_emergencia / (expense / 12) if expense > 0 else 12 if fundo_emergencia > 0 else 0
        
        health_score = 50
        health_score += min(25, taxa_poupanca) if taxa_poupanca > 0 else -10
        health_score += min(25, meses_reserva * 4)
        
        return {
            'healthScore': round(max(0, min(100, health_score))),
            'metrics': {
                'rendaMensal': income,
                'despesasMensais': expense,
                'poupancaMensal': income - expense,
                'fundoEmergencia': fundo_emergencia,
                'dividas': 0,
                'investimentos': investments_total
            },
            'taxaPoupanca': round(taxa_poupanca, 1),
            'mesesFundoEmergencia': round(meses_reserva, 1),
            'taxaEndividamento': 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis")
async def get_ai_analysis(current_user: dict = Depends(get_current_user)):
    """Gera um relatório de análise financeira usando IA (Gemini)"""
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        return {"analysis": "Configure a sua chave de API para receber análises de IA personalizadas."}
    
    try:
        health_data = await get_financial_health(current_user)
        metrics = health_data['metrics']
        
        prompt = f"""
        Como coach financeiro, analisa estes dados de um utilizador:
        - Rendimento: {metrics['rendaMensal']} EUR
        - Despesas: {metrics['despesasMensais']} EUR
        - Fundo Emergência: {metrics['fundoEmergencia']} EUR
        - Investimentos: {metrics['investimentos']} EUR
        - Pontuação de Saúde: {health_data['healthScore']}/100
        
        Escreve um parágrafo curto (3 frases) em Português com um conselho positivo e uma área de melhoria.
        Sê encorajador e prático. Usa texto simples.
        """
        
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        return {"analysis": response.text}
    except Exception as e:
        return {"analysis": "Parabéns por acompanhares as tuas finanças! Continua a registar os teus gastos para uma análise mais profunda."}

@router.get("/insights")
async def get_smart_insights(current_user: dict = Depends(get_current_user)):
    """Gera previsões e insights profundos (Smart Insights)"""
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        return {"insights": [], "suggestion": "Ativa a IA para veres o teu futuro financeiro."}
    
    try:
        health_data = await get_financial_health(current_user)
        metrics = health_data['metrics']
        
        prompt = f"""
        Como analista financeiro preditivo, olha para estes dados:
        - Saldo: {metrics['rendaMensal'] - metrics['despesasMensais']} EUR/mês
        - Investimentos: {metrics['investimentos']} EUR
        - Fundo: {metrics['fundoEmergencia']} EUR
        
        Gera 3 previsões curtas em JSON:
        [
          {{"title": "Projeção 6 Meses", "value": "EUR XXX", "desc": "baseado no teu ritmo de poupança"}},
          {{"title": "Poder de Investimento", "value": "Alto/Médio/Baixo", "desc": "sugestão de alocação"}},
          {{"title": "Score de Liberdade", "value": "XX%", "desc": "quão perto estás de cobrir 1 ano de gastos"}}
        ]
        Responde APENAS o JSON, sem markdown.
        """
        
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
        
        # Parse JSON from response
        import json, re
        text = response.text.strip()
        # Find JSON array using regex
        json_match = re.search(r'\[.*\]', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
        
        insights = json.loads(text)
        return {"insights": insights}
    except Exception as e:
        print(f"Insights Error: {e}")
        return {"insights": [
            {"title": "Projeção 6 Meses", "value": "A Calcular...", "desc": "Precisamos de registar mais 3-5 transações para maior precisão."},
            {"title": "Poder de Investimento", "value": "Equilibrado", "desc": "Tens margem para reforçar o teu PPR ou fundo de índice."},
            {"title": "Score de Liberdade", "value": "12%", "desc": "Estás no caminho certo. Continua a poupar 20% do teu rendimento."}
        ]}
