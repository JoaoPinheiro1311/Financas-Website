import pika
import json
import os
from app.infrastructure.supabase_client import supabase

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')

def callback(ch, method, properties, body):
    print(f" [x] Received {method.routing_key}:{body}")
    data = json.loads(body)
    
    # Criar notificacao no Supabase
    if supabase:
        try:
            notification_data = {
                'user_id': data.get('user_id'),
                'type': method.routing_key,
                'payload': data,
                'is_read': False
            }
            supabase.table('notifications').insert(notification_data).execute()
            print(f" [OK] Notification stored for user {data.get('user_id')}")
        except Exception as e:
            print(f" [ERROR] Failed to store notification: {e}")

def start_consumer():
    print(" [*] Tentando iniciar consumidor de eventos...")
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, connection_attempts=1, retry_delay=1))
        channel = connection.channel()
        channel.exchange_declare(exchange='events', exchange_type='topic')
        
        result = channel.queue_declare(queue='', exclusive=True)
        queue_name = result.method.queue
        
        channel.queue_bind(exchange='events', queue=queue_name, routing_key='#')
        
        print(' [*] Waiting for events. To exit press CTRL+C')
        channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
        channel.start_consuming()
    except Exception as e:
        print(f" [FALLBACK] RabbitMQ nao disponivel. O Notification Service monitorizara o ficheiro 'events_log.json'.")
        # Polling simples do ficheiro de log (apenas para demonstracao se o RabbitMQ nao existir)
        import time
        last_pos = 0
        while True:
            if os.path.exists("events_log.json"):
                with open("events_log.json", "r") as f:
                    f.seek(last_pos)
                    lines = f.readlines()
                    last_pos = f.tell()
                    for line in lines:
                        try:
                            evt = json.loads(line)
                            # Simular callback
                            callback(None, type('obj', (object,), {'routing_key': evt['type']})(), None, json.dumps(evt['data']))
                        except:
                            pass
            time.sleep(2)
