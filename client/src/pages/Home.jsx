import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Box,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';

const Home = () => {
  return (
    <div className="app-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>YOUR HEALTH, ONE SCAN AWAY!</h1>
            <div className="progress-bar">
              <div className="progress-dot active"></div>
              <div className="progress-line"></div>
              <div className="progress-dot"></div>
              <div className="progress-line"></div>
              <div className="progress-dot"></div>
            </div>
            <p>
              When every second counts, ResQ provides instant access to your critical medical information through a simple QR code scan.
            </p>
            <div className="stats-cards-container">
              <div className="stats-card">
                <AccessTimeIcon 
                  className="stats-card-icon"
                  sx={{ fontSize: 48, color: 'var(--primary-blue)' }} 
                />
                <div className="stat-number">30</div>
                <div className="stat-label">SECONDS TO ACCESS CRITICAL INFO</div>
              </div>
              <div className="stats-card">
                <LocalHospitalIcon 
                  className="stats-card-icon"
                  sx={{ fontSize: 48, color: 'var(--primary-blue)' }} 
                />
                <div className="stat-number">24/7</div>
                <div className="stat-label">EMERGENCY ASSISTANCE</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="/images/logo.png" 
              alt="ResQ Logo" 
              className="main-logo"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-grid">
        <div className="feature-card">
          <QrCodeIcon className="feature-icon" sx={{ color: 'var(--primary-blue)' }} />
          <h3 className="feature-title">Instant Access</h3>
          <p className="feature-description">
            Quick scan of your personal QR code reveals vital medical information when you can't communicate
          </p>
        </div>

        <div className="feature-card">
          <ContactEmergencyIcon className="feature-icon" sx={{ color: 'var(--primary-blue)' }} />
          <h3 className="feature-title">Critical Information</h3>
          <p className="feature-description">
            Store blood type, allergies, conditions, and emergency contacts all in one secure place
          </p>
        </div>

        <div className="feature-card">
          <SecurityIcon className="feature-icon" sx={{ color: 'var(--primary-blue)' }} />
          <h3 className="feature-title">Secure & Private</h3>
          <p className="feature-description">
            Your medical information is encrypted and only accessible to authorized medical personnel
          </p>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="hero-section bottom-cta" style={{ background: 'var(--accent-gray)' }}>
        <div className="hero-content">
          <div className="hero-text centered-content">
            <h2>Get Your Emergency QR Code Now</h2>
            <p>Register in minutes and receive your personalized medical information QR code instantly</p>
            <Button
              component={RouterLink}
              to="/register"
              className="btn-black"
              variant="contained"
              size="large"
            >
              Login / Get QR Code
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 