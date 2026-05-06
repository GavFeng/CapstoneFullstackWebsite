import React from 'react';
import { Navigate } from 'react-router-dom';

// Security wrapper for protected routes
const AdminGuard = ({ children }) => {
  const token = localStorage.getItem("admin_token");
  const adminUser = JSON.parse(localStorage.getItem("admin_user") || "null");

  // Ensure the User is 'Admin'
  if (!token || adminUser?.accountType !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminGuard;