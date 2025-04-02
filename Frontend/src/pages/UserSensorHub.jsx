import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// CSS Stylings
import './UserSensorHub.css'

// WILL EVENTUALLY MOVE TO READINGS PAGE 
const UserSensorHub = () => {
    // const socket = new WebSocket('ws://localhost:8080');

    // socket.onmessage = (event) => {
    //     const message = JSON.parse(event.data);
    //     console.log('Received from backend: ', message);
    // }

    const [sensors, setSensors] =  useState(new Set());

    // Local Storage for sensors so we can navigate through multiple on the sensors page
    const [selectedSensors, setSelectedSensors] = useState(() => {
        return new Set(JSON.parse(localStorage.getItem("selectedSensors")) || [])
    })

    // Temporary Function to Grab Whatever Sensors Exist
    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/sensors/');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const json = await response.json();

                // Ensure sensor name is unique and not null
                const uniqueSensors = new Set();
                json.forEach(sensor => {
                    if(sensor.sensor_name == null){
                        return;
                    }
                    if (!uniqueSensors.has(sensor.sensor_name)) {
                        uniqueSensors.add(sensor.sensor_name);
                    }
                });
                
                setSensors(uniqueSensors);
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
                            <th>Duration</th>
                        </tr>
                    </thead>  
                    <tbody>
                        {sensors.size > 0 ? (
                            [...sensors].map((sensorName, index) => (
                                <tr key={index}>
                                    <td>
                                        <Link to={`/readings/${encodeURIComponent(sensorName)}`} className="sensor-link" onClick={() => handleSensorClick(sensorName)}>
                                            {sensorName}
                                        </Link>
                                    </td>
                                    <td>Active</td>
                                    <td>N/A</td>
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