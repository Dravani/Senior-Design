import React from "react";
import { FaSignOutAlt, FaHome, FaChartBar, FaCog, FaPlus } from "react-icons/fa";
import "./NavBar.css";

const NavBar = () => {
  return (
    <div className="NavBar">
      <div className="profile-section">
        <img src="https://via.placeholder.com/80" alt="Profile" className="profile-pic" />
        <button className="logout-btn">
          Logout <FaSignOutAlt />
        </button>
      </div>

      <div className="nav-items">
        <FaHome className="nav-icon" />
        <FaPlus className="nav-icon" />
        <FaChartBar className="nav-icon" />
        <FaCog className="nav-icon" />
      </div>
    </div>
  );
};

export default NavBar;
