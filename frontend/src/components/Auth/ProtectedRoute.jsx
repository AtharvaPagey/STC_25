// frontend/src/components/Auth/ProtectedRoute.jsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("ACCESS_TOKEN");

  // If there's a token, show the child component (e.g., Dashboard)
  // Otherwise, redirect to the login page
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
