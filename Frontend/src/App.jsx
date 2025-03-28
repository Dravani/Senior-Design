import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UserSensorHub from './pages/UserSensorHub';
import UserProjectHub from './pages/UserProjectHub';
import SensorReadings from './pages/SensorReadings';
import NavBar from "./components/NavBar";
import { Outlet } from 'react-router-dom';

// Layout Component for Protected Pages
const DashboardLayout = () => {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflowX: "hidden" }}>
      <NavBar />
      <div style={{
        flex: 1,
        paddingLeft: "100px",
        boxSizing: "border-box",
        overflowX: "hidden"
      }}>
        <Outlet /> {/* Renders the matching route inside this layout */}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Pages (No NavBar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes (With NavBar) */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<UserProjectHub />} /> {/* Default route */}
          <Route path="projects" element={<UserProjectHub />} />
          <Route path="sensors" element={<UserSensorHub />} />
          <Route path="readings/:sensor_name" element={<SensorReadings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
