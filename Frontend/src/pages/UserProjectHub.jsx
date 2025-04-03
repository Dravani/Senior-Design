import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// CSS Stylings
import './UserProjectHub.css';

const UserProjectHub = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [project_name, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleCreateProject = () => {
        if (project_name.trim() === "") return;
        navigate(`/projects/${encodeURIComponent(project_name)}`, { state: { project_name, description } });
    };

    return (
        <div className="user-project-hub">
            <div className="dash-title">
                <h1>Welcome, User!</h1>
                <h2><span className="underline">Projects</span></h2>
            </div>
            <div className="project-cards">
                <div className="card" onClick={toggleMenu}>
                    <span className="card-title">+</span>
                </div>
            </div>

            {isMenuOpen && (
                <div className="create-project-menu">
                    <div className="menu-content">
                        <h2>Create New Project!</h2>
                        <input 
                            type="text" 
                            placeholder="Project Name"
                            value={project_name}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                        <input 
                            type="text" 
                            className="project-description" 
                            placeholder="Project Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <button onClick={handleCreateProject}>Create</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProjectHub;
