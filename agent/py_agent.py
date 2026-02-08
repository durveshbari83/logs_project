import requests
import socket
import time
from datetime import datetime

SERVER = "http://172.21.10.41:3000/api/logs"   # adjust port if needed
DEVICE_ID = socket.gethostname()

def send(event="heartbeat"):
    payload = {
        "device_id": DEVICE_ID,
        "app_name": "python_agent",
        "event_type": event,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    try:
        r = requests.post(SERVER, json=payload, timeout=5)
        print("sent", r.status_code)
    except Exception as e:
        print("error", e)

while True:
    send("heartbeat")
    time.sleep(60)
