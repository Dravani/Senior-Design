import paho.mqtt.client as mqtt
import json
import requests

# Credentials for whichever DB / Service we choose
supabase_url = ""
supabse_key = ""
table_name = "Sensor"

headers = {
    "apikey": supabse_key,
    "Authorization": f"Bearer {supabse_key}",
    "Content-Type": f"application/json",
    "Prefer": "return=representation"
}

# Credentials to Create Broker
MQTT_BROKER = "" # Dependent IP of Pi
MQTT_PORT = 1883
MQTT_TOPIC = "My_Topic" # Can Be Edited But must match across

# Function that creates the subscription (so Arduino knows where to connect)
def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker with code {rc}")
    client.subscribe(MQTT_TOPIC)

# When Broker receives message
def on_message(client, userdata, msg):
    try:
        # Message format: {"metric": number, "metric": number}
        # Need to develop standard tables representing each Sensor 
        # Ideally Receive: Table Name -> Sensor Name (personalized by user) sensor metric, sensor metric
        payload = msg.payload.decode()
        print(f"Received MQTT message: '{payload}' (length {len(payload)})")
        if not payload:
            print("Empty message received!")
            return

        # Following the Message Format Above - allows it to be formatted to json
        data = json.loads(payload)

        print(f"Data: {data}")
        
        # Send to DB
        # response = requests.post(
        #     f"{supabase_url}/rest/v1/{table_name}",
        #     headers=headers,
        #     json=data
        # )

        # if response.status_code in [200, 201]:
        #     print("Data sent to Supabase:", response.json())
        
        # else:
        #     print(f"Failed to send to Supabase: {response.status_code} - {response.text}")

    except Exception as e:
        print("Error:", e)

# Connection begins and we infinitely loop. 
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_forever()