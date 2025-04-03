import React from "react";
import { useLocation, useParams } from "react-router-dom";
import ProjectChart from "../components/ProjectChart";


// CSS Stylings
import "./ProjectPage.css"

const ProjectPage = () => {
    const { project_name } = useParams();
    const location = useLocation();
    const description = location.state?.description || "No description provided.";

    return (
        <div className="project-page">
            <div className="dash-title">
                <h1>{decodeURIComponent(project_name)}</h1>
                <h2>{description}</h2>
                <ProjectChart />
            </div>
        </div>
    );
};

export default ProjectPage;
