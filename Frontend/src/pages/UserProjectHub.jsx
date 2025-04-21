import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// CSS Stylings
import './UserProjectHub.css';

const UserProjectHub = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [project_name, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Get current user from session storage
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const username = currentUser?.username || '';

    useEffect(() => {
        if (!username) {
            navigate('/login');
            return;
        }
        
        // Fetch user's projects
        const fetchProjects = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/projects?username=${username}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [username, navigate]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleCreateProject = async () => {
        if (project_name.trim() === "") return;
        
        try {
            // Save project to database
            const response = await fetch('http://localhost:3000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: project_name,
                    description,
                    username
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const savedProject = await response.json();
            
            // Navigate to the project page
            navigate(`/projects/${savedProject.id}`, { 
                state: { 
                    project_name: savedProject.name, 
                    description: savedProject.description,
                    project_id: savedProject.id
                } 
            });
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        }
    };

    return (
        <div className="user-project-hub">
            <div className="dash-title">
                <h1>Welcome, {username}!</h1>
                <h2><span className="underline">Projects</span></h2>
            </div>

            {loading ? (
                <div className="loading">Loading projects...</div>
            ) : (
                <div className="project-cards">
                    {projects.map(project => (
                        <div 
                            key={project.id} 
                            className="project-card"
                            onClick={() => navigate(`/projects/${project.id}`, { 
                                state: { 
                                    project_name: project.name, 
                                    description: project.description,
                                    project_id: project.id
                                } 
                            })}
                        >
                            <h3>{project.name}</h3>
                            <p>{project.description}</p>
                            <span className="project-date">
                                {new Date(project.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                    
                    {/* Create new project card */}
                    <div className="card" onClick={toggleMenu}>
                        <span className="card-title">+</span>
                    </div>
                </div>
            )}

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
