const subscribers = {};
const sockets = {};

export const subscribeToSensor = (sensorName, sensorType, callback) => {
    if (!subscribers[sensorName]) {
        subscribers[sensorName] = [];
    }
    subscribers[sensorName].push(callback);

    if (!sockets[sensorName]) {
        const socketUrl = sensorType === "DHT"
            ? `ws://localhost:8080/readings/${sensorName}`
            : `ws://localhost:8080/network/${sensorName}`;
        
        const socket = new WebSocket(socketUrl);
        sockets[sensorName] = socket;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            subscribers[sensorName]?.forEach(cb => cb(data));
        };

        socket.onopen = () => console.log(`Connected to WebSocket: ${sensorName}`);
        socket.onerror = (e) => console.error(`WebSocket error: ${sensorName}`, e);
        socket.onclose = () => {
            console.log(`WebSocket closed: ${sensorName}`);
            delete sockets[sensorName];
        };
    }

    return () => {
        subscribers[sensorName] = subscribers[sensorName].filter(cb => cb !== callback);
        if (subscribers[sensorName].length === 0) {
            sockets[sensorName]?.close();
            delete sockets[sensorName];
        }
    };
};
