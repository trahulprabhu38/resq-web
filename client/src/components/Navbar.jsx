import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <RouterLink to="/" className="logo">
          ResQ
        </RouterLink>
        
        <nav className="nav-links">
          
          {user ? (
            <>
              <Button
                component={RouterLink}
                to="/dashboard"
                className="nav-link"
              >
                My Profile
              </Button>
              {user.role === 'patient' && (
                <Button
                  component={RouterLink}
                  to="/medical-info"
                  className="nav-link"
                >
                  Medical Info
                </Button>
              )}
              {user.role === 'medical_staff' && (
                <Button
                  component={RouterLink}
                  to="/scan"
                  className="nav-link"
                >
                  Scan QR
                </Button>
              )}
              <Button 
                onClick={handleLogout}
                className="btn-black"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/register"
              className="btn-black"
            >
              Login / Get QR Code
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;