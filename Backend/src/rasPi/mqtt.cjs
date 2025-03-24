/* Base run for connecting to pi */
const mqtt = require('mqtt');

const brokerIP = 'mqtt://100.110.144.47'; // Subject to change
const client = mqtt.connect(brokerIP);

client.on('connect', () => {
  console.log('Connected to MQTT Broker');
  client.subscribe('My_Topic', (err) => {
    if(!err){
      console.log('Subscribed to My_Topic');
    }
  })
})

client.on('message', (topic, message) =>{
  const data = message.toString();
  console.log(`Received message on ${topic}: ${data}`);
});