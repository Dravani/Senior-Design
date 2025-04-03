import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import ProjectChart from "../components/ProjectChart";


// CSS Stylings
import "./ProjectPage.css"

const ProjectPage = () => {
    const { project_name } = useParams();

    // Selection Options
    const [sensors, setSensors] = useState([]); 
    const [selectedSensor, setSelectedSensor] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [liveMode, setLiveMode] = useState(false);
    const [dataType, setDataType] = useState("humidity");

    const location = useLocation();
    const description = location.state?.description || "No description provided.";

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/sensors/');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const json = await response.json();
        
                // Extract unique sensor names
                const uniqueSensors = [...new Set(json.map(sensor => sensor.sensor_name).filter(Boolean))];
        
                setSensors(uniqueSensors);  // Now it's an array
            } catch (error) {
                console.error('Failed to fetch sensors:', error);
            }
        };
        
    
            fetchSensors();
    }, []);

    return (
        <div className="project-page">
            <div className="dash-title">
                <h1>{decodeURIComponent(project_name)}</h1>
                <h2>{description}</h2>

                <label htmlFor="sensor-select">Choose a sensor:</label>
                <select
                    id="sensor-select"
                    value={selectedSensor}
                    onChange={(e) => setSelectedSensor(e.target.value)}
                >
                    <option value="" disabled>-- Choose a Sensor --</option>
                    {sensors.map((sensor, index) => (
                        <option key={index} value={sensor}>{sensor}</option>
                    ))}
                </select>

                <div className="time-range">
                    <label>Start Time:</label>
                    <input 
                        type="datetime-local" 
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)} 
                    />

                    <label>End Time:</label>
                    <input 
                        type="datetime-local" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)} 
                        disabled={liveMode}
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={liveMode}
                            onChange={(e) => setLiveMode(e.target.checked)}
                        />
                        Live Mode
                    </label>
                </div>
                <div className="data-selection">
                    <label>Select Data Type:</label>
                    <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
                        <option value="humidity">Humidity</option>
                        <option value="temperature">Temperature</option>
                    </select>
                </div>
                {selectedSensor && startTime && (liveMode || endTime) && (
                    <div className="chart-container">
                     <ProjectChart 
                        sensorName={selectedSensor}
                        dataType={dataType} 
                        liveMode={liveMode} 
                        startTime={startTime} 
                        endTime={endTime} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPage;
