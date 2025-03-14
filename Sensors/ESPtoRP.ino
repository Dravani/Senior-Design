#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "WhiteSky-Sweetwater";
const char* password = "pr5a5tgg";

const char* mqtt_server = "100.110.144.47";

WiFiClient espClient;
PubSubClient client(espClient);

char msg[50];
int value = 0;
const char* device_name = "sam";

void setup(){
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void setup_wifi(){
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    attempts++;
    if(attempts > 3){
      ESP.restart();
    }

    Serial.print(".");
  }

  Serial.println("");
  Serial.println("Wifi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* message, unsigned int length){
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;

  for (int i = 0; i < length; i++){
    messageTemp += (char)message[i];
    Serial.println();


    if(String(topic) == "My_Topic"){
      Serial.print("Changing output to ");
      client.publish("My_Topic", "Message Received at ESP32");

    }
  }

}

void reconnect(){
  while(!client.connected()){
    Serial.print("attempting mqtt connection...");
    if(client.connect(device_name)){
      Serial.println("connected");
      client.subscribe("My_Topic");
    }
    else{
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println("try again in 5 seconds");

      delay(5000);
    }
  }
}

void loop(){
  if(!client.connected()){
    reconnect();
  }

  client.loop();
}
