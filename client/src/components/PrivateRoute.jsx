import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [], requireVerification = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  // Check if verification is required and user is not verified
  if (requireVerification && user.role === 'medical_staff' && !user.isVerified) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute; 