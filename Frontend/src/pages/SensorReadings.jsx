import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

// CSS Stylings
import './SensorReadings.css';

const SensorReadings = () => {
  const { sensor_name } = useParams();
  const [reading, setReading] = useState(null);
  const [sensorStatus, setSensorStatus] = useState(null);
  const wsRef = useRef(null);

  const navigate = useNavigate();
  const [selectedSensors, setSelectedSensors] = useState([]);

  useEffect(() => {
    const fetchSensorStatus = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/sensors/disabled/${sensor_name}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        
        if (data.length > 0) {
            setSensorStatus(data[0].is_disabled);
        }
        else{
            setSensorStatus(false); 
        }
      } catch (error) {
        console.error("Error fetching sensor status:", error);
      }
    };
    
    fetchSensorStatus();
  }, [sensor_name]);

  // Toggle 
  const toggleSensorStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/sensors/disabled/${sensor_name}/toggle`, {
        method: "POST",
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const result = await response.json();
      setSensorStatus(result.is_disabled);
    } catch (error) {
      console.error("Error toggling sensor status:", error);
    }
  };

  // Load selected sensors from localStorage once on mount
  useEffect(() => {
      const savedSensors = JSON.parse(localStorage.getItem("selectedSensors")) || [];
      setSelectedSensors(savedSensors);
  }, []); 

  // WebSocket Connection for Live Data
  useEffect(() => {
      if (!sensor_name) return;

      const socket = new WebSocket(`ws://localhost:8080/readings/${sensor_name}`);
      wsRef.current = socket;

      socket.onopen = () => console.log(`Connected to WebSocket for sensor: ${sensor_name}`);

      socket.onmessage = (event) => {
          try {
              const data = JSON.parse(event.data);
              console.log('Received data:', data);
              setReading(data);
          } catch (error) {
              console.error('Error parsing WebSocket message:', error);
          }
      };

      socket.onclose = () => console.log(`WebSocket closed for sensor: ${sensor_name}`);
      socket.onerror = (error) => console.error('WebSocket error:', error);

      // Cleanup WebSocket on unmount or when sensor changes
      return () => {
          if (wsRef.current) {
              wsRef.current.close();
              wsRef.current = null;
          }
      };
    }, [sensor_name]);

    // Ensure sensor is added only once to localStorage
    useEffect(() => {
        if (!sensor_name) return;

        setSelectedSensors((prevSensors) => {
            if (!prevSensors.includes(sensor_name)) {
                const updatedSensors = [...prevSensors, sensor_name];
                localStorage.setItem("selectedSensors", JSON.stringify(updatedSensors));
                return updatedSensors;
            }
            return prevSensors;
        });
    }, [sensor_name]);

    // Navigation Logic
    const currentIndex = selectedSensors.indexOf(sensor_name);

    const handleNext = () => {
        if (currentIndex !== -1 && currentIndex < selectedSensors.length - 1) {
            setReading(null);
            navigate(`/readings/${encodeURIComponent(selectedSensors[currentIndex + 1])}`);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setReading(null);
            navigate(`/readings/${encodeURIComponent(selectedSensors[currentIndex - 1])}`);
        }
    };

    return (
        <div>
            <h1 className="dash-title">
                Live Sensor Readings for: 
                <span className="sensor-name">{decodeURIComponent(sensor_name)}</span>
            </h1>

            {reading ? (
                <div className="curr-readings">
                    <p className="measure"><strong>Temperature:</strong> {reading.temperature} °C</p>
                    <p className="measure"><strong>Humidity:</strong> {reading.humidity}% RH</p>
                </div>
            ) : (
                <div className="curr-readings">
                    <p>Waiting for updates...</p>
                </div>
            )}

            <div className="sensor-toggle">
                <p><strong>Status:</strong> {sensorStatus ? "Disabled" : "Enabled"}</p>
                <button onClick={toggleSensorStatus} className="toggle-btn">
                {sensorStatus ? "Enable Sensor" : "Disable Sensor"}
                </button>
            </div>

            <div className="navigation-buttons">
                {currentIndex > 0 && <button onClick={handlePrevious}>Previous Sensor</button>}
                {currentIndex < selectedSensors.length - 1 && <button onClick={handleNext}>Next Sensor</button>}
            </div>
            { selectedSensors.length > 1 && (
              <div className="sensor-list">
                  <h3>Current Sensors:</h3>
                  <ul>
                  {selectedSensors
                      .filter(sensor => sensor !== sensor_name)
                      .map((sensor, index) => (
                        <li key={index}>
                          <Link to={`/readings/${encodeURIComponent(sensor)}`}>
                            {sensor}
                          </Link>
                        </li>
                    ))}
                  </ul>
              </div>
            )}
        </div>
    );
};

export default SensorReadings;
