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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminEnabled, setIsAdminEnabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check URL parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const secretKey = params.get('key');
    setIsAdminEnabled(secretKey === 'resqadmin');
    
    if (secretKey === 'resqadmin' && role === 'patient') {
      setRole('admin');
      setEmail('admin@resq.com');
    }
  }, [location.search, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent admin login if secret key is not present
    if (role === 'admin' && !isAdminEnabled) {
      setError('Invalid access attempt');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', { email, role });
      const response = await login(email, password);
      console.log('Login successful:', response);
      
      // Route based on role
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else if (response.user.role === 'medical_staff') {
        navigate('/dashboard');
      } else {
        navigate('/medical-info');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (role === 'admin' && !isAdminEnabled) {
      setError('Invalid access attempt');
      return;
    }
    // Navigate to register with the appropriate role parameter
    navigate(role !== 'patient' ? `/register?role=${role}` : '/register');
  };

  return (
    <PageWrapper>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', mx: 'auto', mt: '100px' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
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
                <InputLabel>Login As</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => {
                    // Prevent selecting admin role if not enabled
                    if (e.target.value === 'admin' && !isAdminEnabled) {
                      setError('Invalid access attempt');
                      return;
                    }
                    setRole(e.target.value);
                    setError(''); // Clear any existing errors
                  }}
                  label="Login As"
                  required
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="medical_staff">Medical Staff</MenuItem>
                  {isAdminEnabled && <MenuItem value="admin">Administrator</MenuItem>}
                </Select>
              </FormControl>
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <MuiLink
            component="button"
            variant="body2"
            onClick={handleRegisterClick}
            sx={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Don't have an account? Register
          </MuiLink>
        </Box>
      </Paper>
    </PageWrapper>
  );
};

export default Login; 