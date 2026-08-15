import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Guards admin routes. If no JWT token is stored, redirects to /admin/login.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('nitw_admin_token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
