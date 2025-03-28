import React, { useState, useEffect } from "react";

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

    // Temporary Function to Grab Whatever Sensors Exist
    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/sensors/');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const json = await response.json();
                console.log(json[2].sensor_name)

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
                console.log(sensors)
            } catch (error) {
                console.error('Failed to fetch sensors:', error);
            }
        };

        fetchSensors();
    }, []);

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
                                    <td>{sensorName}</td>
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