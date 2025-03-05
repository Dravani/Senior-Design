import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import UserSensorHub from './pages/UserSensorHub';
import UserProjectHub from './pages/UserProjectHub';
import NavBar from "./components/NavBar";

const Layout = () => {
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" ||  location.pathname === "/";

  return (
    <div style={{ display: "flex" }}>
      {!isAuthPage && <NavBar />} 
      <div style={{ marginLeft: isAuthPage ? "0" : "100px", width: "100%" }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Login />} />
          <Route path="/projects" element={<UserProjectHub />} />
          <Route path="/sensors" element={<UserSensorHub />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
