import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Button,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  QrCode as QrCodeIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import PageWrapper from '../components/PageWrapper';

const PatientInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/medical/patient/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setPatient(response.data);
      setQrValue(JSON.stringify({
        id: response.data._id,
        name: response.data.name,
        bloodType: response.data.bloodType,
        allergies: response.data.allergies
      }));
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError(err.response?.data?.message || 'Error fetching patient information');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Medical Info - ${patient.name}`,
        text: `Medical information for ${patient.name}`,
        url: window.location.href
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const renderPatientDetails = () => (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Personal Information</Typography>
        <Typography><strong>Name:</strong> {patient.name}</Typography>
        <Typography><strong>Blood Type:</strong> {patient.bloodType}</Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Medical Information</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Allergies</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {patient.allergies?.length > 0 ? (
              patient.allergies.map((allergy, index) => (
                <Chip key={index} label={allergy} color="primary" variant="outlined" />
              ))
            ) : (
              <Typography color="text.secondary">No allergies specified</Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Medications</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {patient.medications?.length > 0 ? (
              patient.medications.map((med, index) => (
                <Chip
                  key={index}
                  label={`${med.name} - ${med.dosage} - ${med.frequency}`}
                  color="primary"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography color="text.secondary">No medications specified</Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Medical Conditions</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {patient.conditions?.length > 0 ? (
              patient.conditions.map((condition, index) => (
                <Chip key={index} label={condition} color="primary" variant="outlined" />
              ))
            ) : (
              <Typography color="text.secondary">No conditions specified</Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
        {patient.emergencyContact ? (
          <>
            <Typography><strong>Name:</strong> {patient.emergencyContact.name}</Typography>
            <Typography><strong>Relationship:</strong> {patient.emergencyContact.relationship}</Typography>
            <Typography><strong>Phone:</strong> {patient.emergencyContact.phone}</Typography>
          </>
        ) : (
          <Typography color="text.secondary">No emergency contact specified</Typography>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6" gutterBottom>Insurance Information</Typography>
        {patient.insuranceInfo ? (
          <>
            <Typography><strong>Provider:</strong> {patient.insuranceInfo.provider}</Typography>
            <Typography><strong>Policy Number:</strong> {patient.insuranceInfo.policyNumber}</Typography>
            <Typography><strong>Group Number:</strong> {patient.insuranceInfo.groupNumber}</Typography>
          </>
        ) : (
          <Typography color="text.secondary">No insurance information specified</Typography>
        )}
      </Box>
    </Box>
  );

  const renderQRCode = () => (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3
    }}>
      <Typography variant="h6" align="center" gutterBottom>
        Scan this QR code to access emergency medical information
      </Typography>
      
      <Paper 
        elevation={3}
        sx={{ 
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2
        }}
      >
        <QRCode 
          value={qrValue}
          size={256}
          level="H"
          includeMargin={true}
        />
      </Paper>

      <Typography variant="body2" color="text.secondary" align="center">
        This QR code contains basic medical information that can be crucial in emergencies
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Paper 
        elevation={3}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          p: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate('/dashboard')} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Patient Details
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleShare}
              color="primary"
              size="small"
            >
              <ShareIcon />
            </IconButton>
            <IconButton
              onClick={() => navigate(`/patient/${id}/edit`)}
              color="primary"
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Tab 
            icon={<EditIcon />}
            iconPosition="start"
            label="Details" 
          />
          <Tab 
            icon={<QrCodeIcon />}
            iconPosition="start"
            label="QR Code" 
          />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 0 ? renderPatientDetails() : renderQRCode()}
        </Box>
      </Paper>
    </PageWrapper>
  );
};

export default PatientInfo; 