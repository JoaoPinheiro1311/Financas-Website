from fastapi import APIRouter, HTTPException, Body
import os
from google import genai

from app.infrastructure.supabase_client import supabase
from datetime import datetime, timedelta

router = APIRouter()

FINANCE_SYSTEM_PROMPT = """És o Grande Sensei Financeiro 🧘‍♂️💰. 
O teu dever é guiar o discípulo (utilizador) pelo caminho da prosperidade e disciplina monetária.

O teu tom deve ser:
- Sábio e experiente (usa metáforas de disciplina, como artes marciais ou equilíbrio).
- Pragmático e focado em resultados.
- Às vezes um pouco "místico", mas sempre com conselhos financeiros reais e matemáticos.

As tuas áreas de mestria são:
- Domínio do Orçamento (Budgeting).
- A arte da Poupança e o crescimento dos Investimentos.
- O equilíbrio entre rendimento e despesa.

CONTEXTO DO DISCÍPULO:
{user_context}

Usa estes dados para dar conselhos baseados na realidade dele. 
Se ele perguntar algo não financeiro, lembra-o gentilmente que o foco hoje é o equilíbrio da sua carteira. 
Responde sempre em Português de Portugal."""

def get_fallback_response(user_message: str):
    return "Como posso ajudar com as suas finanças hoje? Posso dar dicas de poupança, investimentos ou gestão de dívidas."

async def get_user_context(user_id: int):
    """Gera um resumo textual dos dados do usuário para a IA"""
    if not supabase: return "Dados indisponíveis."
    try:
        # Saldo e Transações
        resp = supabase.table('expenses').select('type, amount').eq('user_id', user_id).execute()
        trx = resp.data or []
        income = sum(float(t['amount']) for t in trx if t['type'] == 'income')
        expense = sum(float(t['amount']) for t in trx if t['type'] == 'expense')
        
        # Investimentos
        inv_resp = supabase.table('investments').select('quantity, last_price').eq('user_id', user_id).execute()
        inv_total = sum(float(i['quantity']) * float(i['last_price']) for i in (inv_resp.data or []))
        
        # Objetivos
        goals_resp = supabase.table('savings_goals').select('name, target_amount, current_amount').eq('user_id', user_id).execute()
        goals = goals_resp.data or []
        goals_str = ", ".join([f"{g['name']} ({round(g['current_amount']/g['target_amount']*100)}%)" for g in goals if g['target_amount'] > 0])
        
        return f"""
        - Saldo Total (Entradas - Saídas): {income - expense:.2f} EUR
        - Receitas Totais: {income:.2f} EUR
        - Despesas Totais: {expense:.2f} EUR
        - Total Investido: {inv_total:.2f} EUR
        - Objetivos de Poupança: {goals_str if goals_str else 'Nenhum definido'}
        """
    except:
        return "Erro ao carregar contexto financeiro."

@router.post("/")

async def chat(user_id: int, data: dict = Body(...)):
    user_message = data.get('message', '').strip()
    conversation_history = data.get('conversationHistory', [])
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")
        
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        return {"response": get_fallback_response(user_message), "status": "fallback"}
        
    try:
        client = genai.Client(api_key=api_key)
        
        # Obter contexto dinâmico
        context = await get_user_context(user_id)
        system_instruction = FINANCE_SYSTEM_PROMPT.format(user_context=context)
        
        # Formatar mensagens
        messages = []
        for msg in conversation_history[-10:]:
            role = 'model' if msg.get('role') in ['bot', 'assistant', 'model'] else 'user'
            messages.append(genai.types.Content(role=role, parts=[genai.types.Part(text=msg.get('content', ''))]))
            
        messages.append(genai.types.Content(role='user', parts=[genai.types.Part(text=user_message)]))
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=messages,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7
            )
        )
        
        return {"response": response.text, "status": "success"}
    except Exception as e:
        print(f"Erro Gemini: {e}")
        return {"response": get_fallback_response(user_message), "status": "error_fallback"}
