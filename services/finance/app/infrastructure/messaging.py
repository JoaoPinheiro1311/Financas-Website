import pika
import json
import os

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')

def publish_event(event_type: str, payload: dict):
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, connection_attempts=1, retry_delay=1))
        channel = connection.channel()
        channel.exchange_declare(exchange='events', exchange_type='topic')
        
        message = json.dumps(payload)
        channel.basic_publish(exchange='events', routing_key=event_type, body=message)
        connection.close()
        print(f" [x] Sent {event_type}:{message}")
    except Exception as e:
        print(f" [FALLBACK] RabbitMQ nao disponivel. Evento {event_type} logado localmente: {payload}")
        # Opcional: Salvar em ficheiro local para o Notification Service ler
        with open("events_log.json", "a") as f:
            f.write(json.dumps({"type": event_type, "data": payload}) + "\n")
