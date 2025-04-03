import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaHome, FaChartBar, FaCog, FaPlus } from "react-icons/fa";
import "./NavBar.css";

const NavBar = () => {
  const navigate = useNavigate();

  const getFirstSensor = () => {
    const savedSensors = JSON.parse(localStorage.getItem("selectedSensors")) || [];
    return savedSensors.length > 0 ? savedSensors[0] : null;
  };

  const [firstSensor, setFirstSensor] = useState(getFirstSensor);

  useEffect(() => {
    const updateFirstSensor = () => {
      setFirstSensor(getFirstSensor());
    };
  
    // Listen for storage event and manual updates
    window.addEventListener("storage", updateFirstSensor);
    
    // Check for updates in the app itself (if sensors change in the same app)
    const interval = setInterval(updateFirstSensor, 1000); 
  
    return () => {
      window.removeEventListener("storage", updateFirstSensor);
      clearInterval(interval);
    };
  }, []);
  

  const handleReadingsNav = () =>{
    if(firstSensor){

      // Check if we're already on the correct readings page
      if (location.pathname.startsWith("/readings/")) {
        return;
      }

      navigate(`/readings/${encodeURIComponent(firstSensor)}`);
    } else {
      alert("Currently not reading sensors");
    }
  }

  return (
    <div className="NavBar">
      {/* Profile Section */}
      <div className="profile-section">
        <img src="https://via.placeholder.com/80" alt="Profile" className="profile-pic" />
        <Link to="/login" className="logout-link">
          <button className="logout-btn">
            Logout <FaSignOutAlt />
          </button>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="nav-items">
        <Link to="/sensors" className="nav-link"><FaHome className="nav-icon" title="Sensors" /></Link>
        <span onClick={handleReadingsNav}><FaPlus className="nav-icon" title="Readings" /></span>
        <Link to="/projects" className="nav-link"><FaChartBar className="nav-icon" title="Projects" /></Link>
        <Link to="/settings" className="nav-link"><FaCog className="nav-icon" title="Settings" /></Link>
      </div>
    </div>
  );
};

export default NavBar;
