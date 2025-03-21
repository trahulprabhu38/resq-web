import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QRScanner = () => {
  const [error, setError] = useState('');
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staffStatus, setStaffStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkStaffStatus();
  }, []);

  const checkStaffStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to scan QR codes');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/medical/staff-status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Staff status response:', response.data);

      if (!response.data.success) {
        setError('You need to be registered as medical staff to use this feature.');
        setLoading(false);
        return;
      }

      if (!response.data.data.isApproved) {
        setError('Your staff access is pending approval. Please contact your administrator.');
        setLoading(false);
        return;
      }

      setStaffStatus(response.data.data);
      setScanning(true);
      setLoading(false);
    } catch (err) {
      console.error('Error checking staff status:', err);
      setError('Error verifying staff access. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scanning && staffStatus?.isApproved) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // Only log critical errors, ignore common scan errors
          if (!errorMessage.includes('No MultiFormat Readers were able to detect the code')) {
            console.error('QR Scanner error:', errorMessage);
          }
        }
      );

      return () => {
        scanner.clear();
      };
    }
  }, [scanning, staffStatus]);

  const handleScan = async (data) => {
    setScanning(false);
    try {
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to scan QR codes');
      }

      let qrData;
      try {
        // Try to parse the QR code data
        qrData = JSON.parse(data);
      } catch (parseError) {
        // If parsing fails, try using the data directly as a patient ID
        // This provides backwards compatibility with older QR codes
        qrData = {
          type: 'patient_id',
          id: data
        };
      }

      // Validate QR code format
      if (!qrData.id) {
        throw new Error('Invalid QR code format: missing patient ID');
      }

      // Make API request with the patient ID
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/medical/scan`,
        { patientId: qrData.id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Invalid response from server');
      }

      setMedicalInfo(response.data.data);
      setError('');
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        // Server responded with an error
        switch (err.response.status) {
          case 401:
            setError('Your session has expired. Please log in again.');
            navigate('/login');
            break;
          case 403:
            setError(err.response.data?.message || 'You are not authorized to scan QR codes.');
            break;
          case 404:
            setError('Patient information not found');
            break;
          default:
            setError(err.response.data?.message || 'Error processing QR code');
        }
      } else if (err.request) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(err.message || 'Error processing QR code');
      }
      
      setMedicalInfo(null);
      console.error('Scan error:', err);
    }
  };

  const handleReset = () => {
    setScanning(true);
    setMedicalInfo(null);
    setError('');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Scan Patient QR Code
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 2 }}
                  action={
                    error.includes('log in') && (
                      <Button color="inherit" size="small" onClick={handleLogin}>
                        Log In
                      </Button>
                    )
                  }
                >
                  {error}
                </Alert>
              )}

              {staffStatus?.isApproved ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    {scanning ? (
                      <Box sx={{ width: 300, height: 300 }}>
                        <div id="reader"></div>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                          {medicalInfo ? 'Scan Complete' : 'Scan Failed'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {medicalInfo ? 'Patient information has been retrieved' : 'Please try again'}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {medicalInfo && (
                    <Card>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>
                          Patient Information
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                          Name: {medicalInfo.patient.name}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Blood Type
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {medicalInfo.bloodType}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Allergies
                        </Typography>
                        {medicalInfo.allergies.length > 0 ? (
                          medicalInfo.allergies.map((allergy, index) => (
                            <Typography key={index} variant="body1">
                              • {allergy}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body1">No allergies listed</Typography>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Medications
                        </Typography>
                        {medicalInfo.medications.length > 0 ? (
                          medicalInfo.medications.map((med, index) => (
                            <Typography key={index} variant="body1">
                              • {med.name} - {med.dosage} - {med.frequency}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body1">No medications listed</Typography>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Conditions
                        </Typography>
                        {medicalInfo.conditions.length > 0 ? (
                          medicalInfo.conditions.map((condition, index) => (
                            <Typography key={index} variant="body1">
                              • {condition}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body1">No conditions listed</Typography>
                        )}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Emergency Contact
                        </Typography>
                        <Typography variant="body1">
                          Name: {medicalInfo.emergencyContact.name}
                        </Typography>
                        <Typography variant="body1">
                          Relationship: {medicalInfo.emergencyContact.relationship}
                        </Typography>
                        <Typography variant="body1">
                          Phone: {medicalInfo.emergencyContact.phone}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  {!scanning && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleReset}
                      >
                        Scan Another QR Code
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <Typography variant="body1" color="error" gutterBottom>
                    {error || 'You do not have permission to scan QR codes'}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default QRScanner; 