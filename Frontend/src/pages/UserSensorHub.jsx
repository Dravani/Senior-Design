import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// CSS Stylings
import './UserSensorHub.css'

const UserSensorHub = () => {
    const [sensors, setSensors] = useState([]);

    // Local Storage for sensors so we can navigate through multiple on the sensors page
    const [selectedSensors, setSelectedSensors] = useState(() => {
        return new Set(JSON.parse(localStorage.getItem("selectedSensors")) || [])
    })

    // Fetch sensor data from API
    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/sensors/');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const json = await response.json();

                console.log(json)

                const mappedSensors = json.map(sensor => ({
                    name: sensor.sensor_name,
                    isDisabled: sensor.is_disabled,
                    duration: sensor.duration
                }));

                setSensors(mappedSensors);
            } catch (error) {
                console.error('Failed to fetch sensors:', error);
            }
        };

        fetchSensors();
    }, []);

    const handleSensorClick = (sensorName) => {
        if (!selectedSensors.has(sensorName)) {
            const updatedSensors = new Set(selectedSensors);
            updatedSensors.add(sensorName);

            setSelectedSensors(updatedSensors);
            localStorage.setItem("selectedSensors", JSON.stringify([...updatedSensors]));
        }
    };

    return (
        <div className="user-sensor-hub">
            <div className="dash-title">
                <h1>Welcome, User!</h1>
                <h2><span className="underline">Active Sensors</span></h2>
            </div>
            <div className="sensor-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Last Reading</th>
                        </tr>
                    </thead>  
                    <tbody>
                        {sensors.length > 0 ? (
                            sensors.map((sensor, index) => (
                                <tr key={index}>
                                    <td>
                                        <Link to={`/readings/${encodeURIComponent(sensor.name)}`} className="sensor-link" onClick={() => handleSensorClick(sensor.name)}>
                                            {sensor.name}
                                        </Link>
                                    </td>
                                    <td>{sensor.isDisabled ? 'Disabled' : 'Enabled'}</td>
                                    <td>{sensor.duration}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No sensors available</td>
                            </tr>
                        )}
                    </tbody>              
                </table>
            </div>
        </div>
    );
}

export default UserSensorHub;
