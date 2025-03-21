import React, { useState, useRef } from 'react';
import {
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Input,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { QrScanner } from '@yudiel/react-qr-scanner';

const Scan = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        // Process the QR code from the image
        processQRCode(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processQRCode = async (imageData) => {
    setLoading(true);
    setError('');
    try {
      // Create a new QrScanner instance
      const qrScanner = new QrScanner();
      
      // Scan the image
      const result = await qrScanner.scanImage(imageData);
      
      if (result) {
        console.log('QR Code Raw Content:', result);
        
        // Parse the JSON content
        let qrData;
        try {
          qrData = JSON.parse(result);
        } catch (parseError) {
          console.error('Failed to parse QR code content:', parseError);
          throw new Error('Invalid QR code format');
        }

        // Validate the QR data structure
        if (!qrData.type || qrData.type !== 'patient_id' || !qrData.id) {
          throw new Error('Invalid QR code format: missing required fields');
        }

        console.log('Parsed QR Data:', qrData);
        
        // Use the patient ID from the parsed data
        const patientId = qrData.id;
        console.log('Patient ID:', patientId);
        
        // Fetch patient info using the ID
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/medical/scan`, 
          { patientId },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        console.log('Server Response:', response.data);
        
        // Check if the response contains valid data
        if (!response.data.success || !response.data.data) {
          throw new Error('Invalid response from server');
        }
        
        // Navigate to patient info page with the data
        navigate('/patient-info', { 
          state: { 
            patientInfo: response.data.data,
            patientId 
          }
        });
      } else {
        throw new Error('No QR code found in image');
      }
    } catch (err) {
      console.error('QR Code Processing Error:', err);
      setError(err.message || 'Failed to process QR code');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f5f5f5',
      p: 3
    }}>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: '#fff',
          borderRadius: 2
        }}
      >
        <IconButton
          onClick={() => navigate('/dashboard')}
          sx={{ color: 'primary.main' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" color="primary">
          Scan Patient QR Code
        </Typography>
      </Paper>

      {/* Main Content */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          bgcolor: '#fff',
          borderRadius: 2
        }}
      >
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* File Upload Area */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            height: 300,
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#f8f8f8'
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected QR Code"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          ) : (
            <>
              <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="body1" color="textSecondary" align="center">
                Upload a QR code image
              </Typography>
            </>
          )}
        </Box>

        {/* Hidden File Input */}
        <Input
          type="file"
          inputRef={fileInputRef}
          sx={{ display: 'none' }}
          onChange={handleFileSelect}
          accept="image/*"
        />

        {/* Upload Button */}
        <Button
          variant="contained"
          onClick={triggerFileInput}
          startIcon={<UploadFileIcon />}
          disabled={loading}
          sx={{
            minWidth: 200,
            height: 48,
            borderRadius: 24,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Processing...' : 'Select QR Code Image'}
        </Button>

        {/* Instructions */}
        <Typography 
          variant="body2" 
          color="textSecondary" 
          align="center"
          sx={{ maxWidth: 400 }}
        >
          Upload a clear image of the patient's QR code. The image should be well-lit and in focus.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Scan; 