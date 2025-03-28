import React from "react";
import { Link } from "react-router-dom";
import { FaSignOutAlt, FaHome, FaChartBar, FaCog, FaPlus } from "react-icons/fa";
import "./NavBar.css";

const NavBar = () => {
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
        <Link to="/sensors" className="nav-link"><FaPlus className="nav-icon" title="Readings" /></Link>
        <Link to="/projects" className="nav-link"><FaChartBar className="nav-icon" title="Projects" /></Link>
        <Link to="/settings" className="nav-link"><FaCog className="nav-icon" title="Settings" /></Link>
      </div>
    </div>
  );
};

export default NavBar;
