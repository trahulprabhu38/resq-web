import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageWrapper from '../components/PageWrapper';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  // Hospital staff specific fields
  const [hospitalInfo, setHospitalInfo] = useState({
    name: '',
    address: '',
    department: '',
    position: '',
    staffId: '',
    contact: '',
  });

  // Set initial role from URL parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && (roleParam === 'medical_staff' || roleParam === 'patient')) {
      setRole(roleParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        name,
        email,
        password,
        role,
        ...(role === 'medical_staff' && { hospital: hospitalInfo }),
      };
      const response = await register(userData);
      console.log('Registration successful:', response);
      
      // Navigate based on role
      if (role === 'medical_staff') {
        navigate('/dashboard');
      } else {
        navigate('/medical-info');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalInfoChange = (field) => (e) => {
    setHospitalInfo({
      ...hospitalInfo,
      [field]: e.target.value,
    });
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <PageWrapper>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', mx: 'auto', mt: '100px' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Register {role === 'medical_staff' ? 'as Medical Staff' : 'as Patient'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Register As</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  label="Register As"
                  required
                  disabled={loading}
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="medical_staff">Medical Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Grid>

            {role === 'medical_staff' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Hospital Information
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hospital Name"
                    value={hospitalInfo.name}
                    onChange={handleHospitalInfoChange('name')}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hospital Address"
                    value={hospitalInfo.address}
                    onChange={handleHospitalInfoChange('address')}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={hospitalInfo.department}
                    onChange={handleHospitalInfoChange('department')}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={hospitalInfo.position}
                    onChange={handleHospitalInfoChange('position')}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Staff ID"
                    value={hospitalInfo.staffId}
                    onChange={handleHospitalInfoChange('staffId')}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={hospitalInfo.contact}
                    onChange={handleHospitalInfoChange('contact')}
                    required
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <MuiLink
            component="button"
            variant="body2"
            onClick={handleLoginClick}
            sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Already have an account? Login
          </MuiLink>
        </Box>
      </Paper>
    </PageWrapper>
  );
};

export default Register; 