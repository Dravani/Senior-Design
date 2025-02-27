import React from "react";

// CSS Stylings
import './UserSensorHub.css'

const UserSensorHub = () => {
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
                        <tr>
                            <td>Test</td>
                            <td>Active</td>
                            <td>0s</td>
                        </tr>
                    </tbody>                  
                </table>
            </div>
        </div>

    );
}

export default UserSensorHub;