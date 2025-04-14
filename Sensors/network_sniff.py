from scapy.all import sniff, IP, TCP, UDP, ICMP # type: ignore
import requests
import json

# SupaBase *** CHANGE TO CURRENT 
SUPABASE_URL = ''
SUPABASE_API_KEY = ''
SUPABASE_TABLE = 'Network'

# The IP address you want to filter for
TARGET_IP = ''

# Protocol to sniff: change this to 'TCP', 'UDP', or 'ICMP'
PROTOCOL = 'TCP'

# A mapping that helps us swap between different protocols
PROTOCOL_MAP = {
    'TCP': (TCP, 'tcp'),
    'UDP': (UDP, 'udp'),
    'ICMP': (ICMP, 'icmp')
}

if PROTOCOL not in PROTOCOL_MAP:
    raise ValueError(f"Unsupported protocol: {PROTOCOL}")

# Get the correct scapy layer and BPF filter string
layer, bpf_filter = PROTOCOL_MAP[PROTOCOL]

def send_to_supabase(data):
    headers = {
        'apikey': SUPABASE_API_KEY,
        'Authorization': f'Bearer {SUPABASE_API_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
    }
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}",
        headers=headers,
        data=json.dumps(data)
    )
    if response.status_code not in (200, 201):
        print("Failed to send data:", response.text)

def process_packet(packet):
    if IP in packet and layer in packet:
        ip_layer = packet[IP]
        proto_layer = packet[layer]

        if ip_layer.src == TARGET_IP or ip_layer.dst == TARGET_IP:
            packet_len = len(packet)
            ip_addr = ip_layer.src if ip_layer.src == TARGET_IP else ip_layer.dst

            data = {
                "ip": ip_addr,
                "packet_length": packet_len
            }

            print(f"Sending to Supabase: {data}")
            send_to_supabase(data)


# Start sniffing network traffic on the default interface
print(f"Sniffing {PROTOCOL} packets involving {TARGET_IP}...\n")
sniff(filter=f"{bpf_filter} and host {TARGET_IP}", prn=process_packet)
