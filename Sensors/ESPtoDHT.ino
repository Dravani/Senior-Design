
#include <DHT.h>
#define LED_BULLITIN 2

DHT dht(4, DHT11);

void setup() {
  dht.begin();
  delay(2000);
  Serial.begin(9600);
  pinMode(LED_BULLITIN, OUTPUT);
  
}
// the loop function runs over and over again forever
void loop() {
  Serial.println("Hello!");
  digitalWrite(LED_BULLITIN, HIGH);
  delay(1000);
  digitalWrite(LED_BULLITIN, LOW);
  delay(1000);

  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  Serial.print("Temp: ");
  Serial.print(temp);
  Serial.print(" C ");
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print(" % ");
  delay(2000);
}
  

