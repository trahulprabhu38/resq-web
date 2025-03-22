import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import BarChartIcon from '@mui/icons-material/BarChart';
import PageWrapper from '../components/PageWrapper';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const renderPatientDashboard = () => (
    <>
      <Grid container spacing={3} sx={{ flex: 1, mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Profile Information</Typography>
              </Box>
              <Typography variant="body1">Name: {user?.name}</Typography>
              <Typography variant="body1">Email: {user?.email}</Typography>
              <Typography variant="body1">Role: {user?.role}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalHospitalIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Medical Information</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Manage your medical information, including blood type, allergies, medications, and more.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate('/medical-info')}
              >
                View/Edit Medical Info
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <QrCodeIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Your QR Code</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Access your medical QR code to share with medical staff in case of emergency at incredible speed.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate('/medical-info')}
              >
                View QR Code
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Health Analytics Dashboard</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                View your detailed health analytics and insights through our interactive dashboard.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<BarChartIcon />}
                onClick={() => window.open('https://checkup-bot.streamlit.app/', '_blank')}
                sx={{ mt: 2 }}
              >
                Open Health Analytics Dashboard
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  const renderStaffDashboard = () => (
    <Grid container spacing={3} sx={{ flex: 1 }}>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocalHospitalIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5">Hospital Information</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" color="primary">Staff Details</Typography>
                <Tooltip 
                  title={user?.isVerified 
                    ? "Your account has been verified by an administrator" 
                    : "Your account is pending verification by an administrator"}
                  arrow
                >
                  <Chip
                    icon={user?.isVerified ? <VerifiedIcon /> : <GppMaybeIcon />}
                    label={user?.isVerified ? "Verified Staff" : "Pending Verification"}
                    color={user?.isVerified ? "success" : "warning"}
                    variant="outlined"
                    size="small"
                  />
                </Tooltip>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {user?.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Staff ID:</strong> {user?.hospital?.staffId}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Position:</strong> {user?.hospital?.position}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary" gutterBottom>Hospital Details</Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Hospital Name:</strong> {user?.hospital?.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Department:</strong> {user?.hospital?.department}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Address:</strong> {user?.hospital?.address}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Contact:</strong> {user?.hospital?.contact}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <QrCodeIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5">Patient Scanner</Typography>
            </Box>
            {user?.isVerified ? (
              <>
                <Typography variant="body1" paragraph>
                  Scan a patient's QR code to access their medical information in case of emergency.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/scan')}
                    startIcon={<QrCodeIcon />}
                  >
                    Open Scanner
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Make sure you have camera permissions enabled to use the scanner.
                  </Typography>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <GppMaybeIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="warning.main">
                  Verification Required
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Your account needs to be verified by an administrator before you can access the scanner.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please contact your hospital administrator for verification.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <PageWrapper maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          Welcome, {user?.name}!
        </Typography>

        {user?.role === 'patient' ? renderPatientDashboard() : renderStaffDashboard()}
      </Paper>
    </PageWrapper>
  );
};

export default Dashboard; 