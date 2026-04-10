import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminGuard = ({ children }) => {
  const token = localStorage.getItem("admin_token");
  const adminUser = JSON.parse(localStorage.getItem("admin_user") || "null");

  if (!token || adminUser?.accountType !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminGuard;