import React from "react";

// CSS Stylings
import './UserProjectHub.css'

const UserProjectHub = () => {
    return (
        <div className="user-project-hub">
            <div className="dash-title">
                <h2><span className="underline">Projects</span></h2>
            </div>
            <div className="project-cards">
                <div className="card">
                    <span className="card-title">+</span>
                </div>
            </div>
        </div>
    )
}

export default UserProjectHub;