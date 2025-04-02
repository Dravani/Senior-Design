import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

// CSS Stylings
import './SensorReadings.css'

const SensorReadings = () => {
  const { sensor_name } = useParams(); 
  const [reading, setReading] = useState(null);
  const wsRef = useRef(null)

  useEffect(() => {
    // Function to create the WebSocket connection for the sensor
    const connectWebSocket = () => {
      // Create WebSocket connection with the sensor name
      const socket = new WebSocket(`ws://localhost:8080/readings/${sensor_name}`);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log(`Connected to WebSocket for sensor: ${sensor_name}`);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);
        setReading(data);
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sensor_name]); 

  return (
    <div>
      <h1 className="dash-title">Live Sensor Readings for: <span className="sensor-name">{decodeURIComponent(sensor_name)}</span></h1>
      {reading ? (
        <div className="curr-readings">
          <p className="measure"><strong>Temperature:</strong> {reading.temperature} °C</p>
          <p className="measure"><strong>Humidity:</strong> {reading.humidity}% RH</p>
        </div>
      ) : (
        <p>Waiting for updates...</p>
      )}
    </div>
  );
};

export default SensorReadings;
