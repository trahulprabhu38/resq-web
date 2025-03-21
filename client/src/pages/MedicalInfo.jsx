import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import DownloadIcon from '@mui/icons-material/Download';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import PageWrapper from '../components/PageWrapper';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const MedicalInfo = () => {
  const { token, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [medicalInfo, setMedicalInfo] = useState({
    bloodType: '',
    allergies: [],
    medications: [],
    conditions: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      groupNumber: '',
    }
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });
  const [newCondition, setNewCondition] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    console.log('=== MedicalInfo State Updated ===');
    console.log('Current medical info:', medicalInfo);
    console.log('Has QR code:', !!qrCode);
    console.log('Is editing:', isEditing);
    console.log('Current tab:', tabValue);
  }, [medicalInfo, qrCode, isEditing, tabValue]);

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    console.log('Fetching medical info on mount');
    fetchMedicalInfo();
  }, [isAuthenticated, navigate]);

  const fetchMedicalInfo = async () => {
    if (!token) {
      console.log('No token available, returning');
      setError('Please log in to view medical information');
      navigate('/login');
      return;
    }

    try {
      console.log('\n=== Fetching Medical Info ===');
      console.log('Auth token:', token.substring(0, 20) + '...');
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/medical/patient/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('\nServer Response:', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });


      if (!response.data) {
        console.log('No data received from server');
        setError('No medical information available');
        return;
      }

      console.log('\nRaw response data:', JSON.stringify(response.data, null, 2));


      const data = response.data;
      const updatedMedicalInfo = {
        bloodType: data.bloodType || '',
        allergies: Array.isArray(data.allergies) ? data.allergies.filter(a => a && typeof a === 'string') : [],
        medications: Array.isArray(data.medications) ? data.medications.filter(m => m && m.name).map(med => ({
          name: med.name || '',
          dosage: med.dosage || '',
          frequency: med.frequency || ''
        })) : [],
        conditions: Array.isArray(data.conditions) ? data.conditions.filter(c => c && typeof c === 'string') : [],
        emergencyContact: {
          name: data.emergencyContact?.name || '',
          relationship: data.emergencyContact?.relationship || '',
          phone: data.emergencyContact?.phone || '',
        },
        insuranceInfo: {
          provider: data.insuranceInfo?.provider || '',
          policyNumber: data.insuranceInfo?.policyNumber || '',
          groupNumber: data.insuranceInfo?.groupNumber || '',
        },
        lastUpdated: data.lastUpdated || new Date().toISOString()
      };

  
      
      setMedicalInfo(prevState => {
        console.log('\nState update:', {
          previous: {
            bloodType: prevState.bloodType,
            allergiesCount: prevState.allergies.length,
            medicationsCount: prevState.medications.length,
            conditionsCount: prevState.conditions.length
          },
          new: {
            bloodType: updatedMedicalInfo.bloodType,
            allergiesCount: updatedMedicalInfo.allergies.length,
            medicationsCount: updatedMedicalInfo.medications.length,
            conditionsCount: updatedMedicalInfo.conditions.length
          }
        });
        return updatedMedicalInfo;
      });

      if (data.qrCode) {
        console.log('Setting QR code from response');
        setQrCode(data.qrCode);
      }

      setSuccess('Medical information loaded successfully');
            setError(''); 

            setIsEditing(false);
      setTabValue(0);
    } catch (err) {
      console.error('\n=== Error Fetching Medical Info ===');
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data
      });
      
      if (err.response?.status === 401) {
        console.log('Unauthorized, redirecting to login');
        setError('Please log in to view medical information');
        navigate('/login');
      } else {
        const errorMessage = err.response?.data?.details || 
                           err.response?.data?.message || 
                           'Error fetching medical information';
        setError(errorMessage);
        console.error('Setting error message:', errorMessage);
      }
      setSuccess(''); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please log in to update medical information');
      navigate('/login');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      // Validate required fields
      if (!medicalInfo.bloodType) {
        setError('Please select a blood type');
        return;
      }

      if (!user?.name) {
        setError('User name is required');
        return;
      }

      const dataToSend = {
        name: user.name,
        bloodType: medicalInfo.bloodType,
        allergies: medicalInfo.allergies.filter(allergy => allergy.trim() !== ''),
        medications: medicalInfo.medications.filter(med => med.name.trim() !== '').map(med => ({
          name: med.name.trim(),
          dosage: med.dosage?.trim() || '',
          frequency: med.frequency?.trim() || ''
        })),
        conditions: medicalInfo.conditions.filter(condition => condition.trim() !== ''),
        emergencyContact: {
          name: medicalInfo.emergencyContact?.name?.trim() || '',
          relationship: medicalInfo.emergencyContact?.relationship?.trim() || '',
          phone: medicalInfo.emergencyContact?.phone?.trim() || ''
        },
        insuranceInfo: {
          provider: medicalInfo.insuranceInfo?.provider?.trim() || '',
          policyNumber: medicalInfo.insuranceInfo?.policyNumber?.trim() || '',
          groupNumber: medicalInfo.insuranceInfo?.groupNumber?.trim() || ''
        }
      };

      console.log('Sending medical info update...', dataToSend);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/medical`,
        dataToSend,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        setSuccess('Medical information saved successfully');
        setMedicalInfo(response.data.data);
        if (response.data.data.qrCode) {
          setQrCode(response.data.data.qrCode);
        }
      } else {
        setError(response.data.message || 'Failed to save medical information');
      }
    } catch (err) {
      console.error('Error saving medical info:', err);
      const errorMessage = err.response?.data?.details || 
                         err.response?.data?.message || 
                         'Error saving medical information';
      setError(errorMessage);
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setMedicalInfo({
        ...medicalInfo,
        allergies: [...medicalInfo.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index) => {
    setMedicalInfo({
      ...medicalInfo,
      allergies: medicalInfo.allergies.filter((_, i) => i !== index),
    });
  };

  const handleAddMedication = () => {
    if (newMedication.name.trim()) {
      setMedicalInfo({
        ...medicalInfo,
        medications: [...medicalInfo.medications, { ...newMedication }],
      });
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const handleRemoveMedication = (index) => {
    setMedicalInfo({
      ...medicalInfo,
      medications: medicalInfo.medications.filter((_, i) => i !== index),
    });
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setMedicalInfo({
        ...medicalInfo,
        conditions: [...medicalInfo.conditions, newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (index) => {
    setMedicalInfo({
      ...medicalInfo,
      conditions: medicalInfo.conditions.filter((_, i) => i !== index),
    });
  };

  const handleDownloadQR = () => {
    if (qrCode) {
      const svg = document.querySelector('.QRCode svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `medical-qr-${user?.name || 'patient'}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  };

  const renderMedicalForm = () => (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth margin="normal">
        <InputLabel>Blood Type</InputLabel>
        <Select
          value={medicalInfo.bloodType}
          onChange={(e) =>
            setMedicalInfo({ ...medicalInfo, bloodType: e.target.value })
          }
          label="Blood Type"
          required
        >
          <MenuItem value="A+">A+</MenuItem>
          <MenuItem value="A-">A-</MenuItem>
          <MenuItem value="B+">B+</MenuItem>
          <MenuItem value="B-">B-</MenuItem>
          <MenuItem value="AB+">AB+</MenuItem>
          <MenuItem value="AB-">AB-</MenuItem>
          <MenuItem value="O+">O+</MenuItem>
          <MenuItem value="O-">O-</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Allergies</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            label="New Allergy"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAddAllergy}
            disabled={!newAllergy.trim()}
          >
            Add
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {medicalInfo.allergies.map((allergy, index) => (
            <Chip
              key={index}
              label={allergy}
              onDelete={() => handleRemoveAllergy(index)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Medications</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            label="Medication Name"
            value={newMedication.name}
            onChange={(e) =>
              setNewMedication({ ...newMedication, name: e.target.value })
            }
          />
          <TextField
            label="Dosage"
            value={newMedication.dosage}
            onChange={(e) =>
              setNewMedication({ ...newMedication, dosage: e.target.value })
            }
          />
          <TextField
            label="Frequency"
            value={newMedication.frequency}
            onChange={(e) =>
              setNewMedication({ ...newMedication, frequency: e.target.value })
            }
          />
          <Button
            variant="contained"
            onClick={handleAddMedication}
            disabled={!newMedication.name.trim()}
          >
            Add
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {medicalInfo.medications.map((med, index) => (
            <Chip
              key={index}
              label={`${med.name} - ${med.dosage} - ${med.frequency}`}
              onDelete={() => handleRemoveMedication(index)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Conditions</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            label="New Condition"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAddCondition}
            disabled={!newCondition.trim()}
          >
            Add
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {medicalInfo.conditions.map((condition, index) => (
            <Chip
              key={index}
              label={condition}
              onDelete={() => handleRemoveCondition(index)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Emergency Contact</Typography>
        <TextField
          fullWidth
          label="Name"
          value={medicalInfo.emergencyContact.name}
          onChange={(e) =>
            setMedicalInfo({
              ...medicalInfo,
              emergencyContact: {
                ...medicalInfo.emergencyContact,
                name: e.target.value,
              },
            })
          }
          margin="normal"
        />
        <TextField
          fullWidth
          label="Relationship"
          value={medicalInfo.emergencyContact.relationship}
          onChange={(e) =>
            setMedicalInfo({
              ...medicalInfo,
              emergencyContact: {
                ...medicalInfo.emergencyContact,
                relationship: e.target.value,
              },
            })
          }
          margin="normal"
        />
        <TextField
          fullWidth
          label="Phone"
          value={medicalInfo.emergencyContact.phone}
          onChange={(e) =>
            setMedicalInfo({
              ...medicalInfo,
              emergencyContact: {
                ...medicalInfo.emergencyContact,
                phone: e.target.value,
              },
            })
          }
          margin="normal"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
        >
          Save Medical Information
        </Button>
      </Box>
    </form>
  );

  const renderMedicalDetails = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setIsEditing(true)}
        >
          Edit Information
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Blood Type</Typography>
        <Typography variant="body1" color={medicalInfo.bloodType ? 'text.primary' : 'text.secondary'}>
          {medicalInfo.bloodType || 'Not specified'}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Allergies</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.isArray(medicalInfo.allergies) && medicalInfo.allergies.length > 0 ? (
            medicalInfo.allergies.map((allergy, index) => (
              <Chip 
                key={index} 
                label={allergy}
                color="error"
                variant="outlined"
              />
            ))
          ) : (
            <Typography color="text.secondary">No allergies specified</Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Medications</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.isArray(medicalInfo.medications) && medicalInfo.medications.length > 0 ? (
            medicalInfo.medications.map((med, index) => (
              <Chip
                key={index}
                label={`${med.name}${med.dosage ? ` - ${med.dosage}` : ''}${med.frequency ? ` - ${med.frequency}` : ''}`}
                color="primary"
                variant="outlined"
              />
            ))
          ) : (
            <Typography color="text.secondary">No medications specified</Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Medical Conditions</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.isArray(medicalInfo.conditions) && medicalInfo.conditions.length > 0 ? (
            medicalInfo.conditions.map((condition, index) => (
              <Chip 
                key={index} 
                label={condition}
                color="warning"
                variant="outlined"
              />
            ))
          ) : (
            <Typography color="text.secondary">No medical conditions specified</Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
        {medicalInfo.emergencyContact && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body1">
              <strong>Name:</strong> {medicalInfo.emergencyContact.name || 'Not specified'}
            </Typography>
            <Typography variant="body1">
              <strong>Relationship:</strong> {medicalInfo.emergencyContact.relationship || 'Not specified'}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {medicalInfo.emergencyContact.phone || 'Not specified'}
            </Typography>
          </Box>
        )}
      </Box>

      {medicalInfo.lastUpdated && (
        <Typography variant="caption" color="text.secondary">
          Last Updated: {new Date(medicalInfo.lastUpdated).toLocaleString()}
        </Typography>
      )}
    </Box>
  );

  const renderQRCode = () => {
    if (!qrCode) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" gutterBottom>
            No QR Code Available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Please save your medical information first to generate a QR code.
          </Typography>
        </Box>
      );
    }

    try {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your Medical QR Code
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Show this QR code to medical staff in case of emergency. When scanned, it will display your complete medical information.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 3,
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 2,
            border: '1px solid',
            borderColor: 'divider',
            maxWidth: 400,
            mx: 'auto'
          }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'white',
              borderRadius: 1,
              boxShadow: 1
            }}
            className="QRCode">
              <QRCodeSVG
                value={JSON.stringify({
                  type: 'patient_id',
                  id: user?._id || ''
                })}
                size={300}
                level="H"
                includeMargin={true}
                style={{ width: '300px', height: '300px' }}
              />
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadQR}
              sx={{ 
                minWidth: 200,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              Download QR Code
            </Button>
            
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(medicalInfo.lastUpdated).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      );
    } catch (error) {
      console.error('Error rendering QR code:', error);
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" gutterBottom color="error">
            Error Generating QR Code
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            There was an error generating your QR code. Please try saving your medical information again.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(true)}
            sx={{ mt: 2 }}
          >
            Edit Medical Information
          </Button>
        </Box>
      );
    }
  };

  return (
    <PageWrapper>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ mb: 3 }}
        >
          Medical Information
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ 
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Tab 
            label="Medical Details" 
            icon={<LocalHospitalIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="QR Code" 
            icon={<QrCodeIcon />} 
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          px: { xs: 1, sm: 2 },
          py: 2
        }}>
          {tabValue === 0 && (
            isEditing ? renderMedicalForm() : renderMedicalDetails()
          )}
          
          {tabValue === 1 && renderQRCode()}
        </Box>
      </Paper>
    </PageWrapper>
  );
};

export default MedicalInfo; 