from fastapi import APIRouter, HTTPException, Body
from app.infrastructure.supabase_client import supabase

router = APIRouter()

@router.get("/")

async def get_user_settings(user_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        # Garantir que user_id é tratado como int se chegar como string
        u_id = int(str(user_id))
        response = supabase.table('user_settings').select('*').eq('user_id', u_id).execute()
        
        if response.data and len(response.data) > 0:
            settings = response.data[0]
            return {
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
                    'xp': settings.get('xp', 0),
                    'level': settings.get('level', 1),
                }
            }
        else:
            # Retornar configurações padrão
            return {
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
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
@router.put("/")

async def update_user_settings(user_id: int, data: dict = Body(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        u_id = int(str(user_id))
        settings_data = {
            'user_id': u_id,
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
        
        supabase.table('user_settings').upsert(settings_data).execute()
        return {'message': 'Configurações atualizadas', 'settings': settings_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
