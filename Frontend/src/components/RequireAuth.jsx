// components/RequireAuth.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem("currentUser"); // or localStorage if you store there

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;
