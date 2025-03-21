import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageWrapper from '../components/PageWrapper';

const PatientList = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
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
    },
  });
  const [patients, setPatients] = useState([]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/medical/patients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setPatients(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.response?.data?.message || 'Error fetching patient list');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(true);
    setEditingPatientId(patient._id);
    setFormData({
      name: patient.name || '',
      bloodType: patient.bloodType || '',
      allergies: patient.allergies || [],
      medications: patient.medications || [],
      conditions: patient.conditions || [],
      emergencyContact: {
        name: patient.emergencyContact?.name || '',
        relationship: patient.emergencyContact?.relationship || '',
        phone: patient.emergencyContact?.phone || '',
      },
      insuranceInfo: {
        provider: patient.insuranceInfo?.provider || '',
        policyNumber: patient.insuranceInfo?.policyNumber || '',
        groupNumber: patient.insuranceInfo?.groupNumber || '',
      },
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/medical/patient/${id}`);
      fetchPatients();
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Error deleting patient');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPatient(false);
    setFormData({
      name: '',
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
      },
    });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validate required fields
      if (!formData.name || !formData.bloodType) {
        setError('Name and Blood Type are required');
        return;
      }

      const endpoint = editingPatient 
        ? `${import.meta.env.VITE_API_URL}/medical/patient/${editingPatientId}`
        : `${import.meta.env.VITE_API_URL}/medical/patient`;

      const method = editingPatient ? 'put' : 'post';

      const response = await axios[method](
        endpoint,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        await fetchPatients(); // Refresh the patient list
        handleCloseDialog();
      } else {
        throw new Error(response.data.message || 'Failed to update patient information');
      }
    } catch (err) {
      console.error('Error updating/creating patient:', err);
      setError(err.response?.data?.message || 'Error updating patient information');
    }
  };

  const handleAddMedication = () => {
    if (newMedication.name.trim()) {
      setFormData({
        ...formData,
        medications: [...formData.medications, { ...newMedication }]
      });
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const handleRemoveMedication = (index) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>Loading patient information...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">Patient not found</Alert>
        </Box>
      </Container>
    );
  }

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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h4" component="h1">
            Patient List
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditingPatient(false);
              setOpenDialog(true);
            }}
          >
            Add New Patient
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          px: { xs: 1, sm: 2 },
          py: 2
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {patients.map((patient) => (
                <Grid item xs={12} md={6} key={patient._id}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        mb: 2 
                      }}>
                        <Typography variant="h6" component="h2">
                          {patient.name}
                        </Typography>
                        <Box>
                          <IconButton 
                            onClick={() => handleEdit(patient)}
                            size="small"
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(patient._id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Blood Type: {patient.bloodType}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Allergies:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {patient.allergies?.length > 0 ? (
                            patient.allergies.map((allergy, index) => (
                              <Chip key={index} label={allergy} size="small" />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">No allergies specified</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Medications:</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {patient.medications?.length > 0 ? (
                            patient.medications.map((med, index) => (
                              <Chip
                                key={index}
                                label={`${med.name} - ${med.dosage} - ${med.frequency}`}
                                size="small"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">No medications specified</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Conditions:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {patient.conditions?.length > 0 ? (
                            patient.conditions.map((condition, index) => (
                              <Chip key={index} label={condition} size="small" />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">No conditions specified</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Emergency Contact:</Typography>
                        {patient.emergencyContact ? (
                          <>
                            <Typography variant="body2">Name: {patient.emergencyContact.name}</Typography>
                            <Typography variant="body2">Relationship: {patient.emergencyContact.relationship}</Typography>
                            <Typography variant="body2">Phone: {patient.emergencyContact.phone}</Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No emergency contact specified</Typography>
                        )}
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Insurance Information:</Typography>
                        {patient.insuranceInfo ? (
                          <>
                            <Typography variant="body2">Provider: {patient.insuranceInfo.provider}</Typography>
                            <Typography variant="body2">Policy Number: {patient.insuranceInfo.policyNumber}</Typography>
                            <Typography variant="body2">Group Number: {patient.insuranceInfo.groupNumber}</Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No insurance information specified</Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
          <DialogContent dividers>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!formData.name}
              helperText={!formData.name ? 'Name is required' : ''}
            />
            
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Blood Type</InputLabel>
              <Select
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                label="Blood Type"
                error={!formData.bloodType}
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
              <Typography variant="subtitle1" gutterBottom>Medications</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Name"
                  size="small"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                />
                <TextField
                  label="Dosage"
                  size="small"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                />
                <TextField
                  label="Frequency"
                  size="small"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                />
                <Button
                  variant="contained"
                  onClick={handleAddMedication}
                  disabled={!newMedication.name.trim()}
                  size="small"
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {formData.medications.map((med, index) => (
                  <Chip
                    key={index}
                    label={`${med.name} - ${med.dosage} - ${med.frequency}`}
                    onDelete={() => handleRemoveMedication(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <TextField
              margin="dense"
              label="Allergies (comma-separated)"
              fullWidth
              value={formData.allergies.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
              })}
            />
            
            <TextField
              margin="dense"
              label="Conditions (comma-separated)"
              fullWidth
              value={formData.conditions.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                conditions: e.target.value.split(',').map(c => c.trim()).filter(c => c) 
              })}
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Emergency Contact</Typography>
              <TextField
                margin="dense"
                label="Name"
                fullWidth
                value={formData.emergencyContact.name}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                })}
              />
              <TextField
                margin="dense"
                label="Relationship"
                fullWidth
                value={formData.emergencyContact.relationship}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                })}
              />
              <TextField
                margin="dense"
                label="Phone"
                fullWidth
                value={formData.emergencyContact.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                })}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Insurance Information</Typography>
              <TextField
                margin="dense"
                label="Provider"
                fullWidth
                value={formData.insuranceInfo.provider}
                onChange={(e) => setFormData({
                  ...formData,
                  insuranceInfo: { ...formData.insuranceInfo, provider: e.target.value }
                })}
              />
              <TextField
                margin="dense"
                label="Policy Number"
                fullWidth
                value={formData.insuranceInfo.policyNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  insuranceInfo: { ...formData.insuranceInfo, policyNumber: e.target.value }
                })}
              />
              <TextField
                margin="dense"
                label="Group Number"
                fullWidth
                value={formData.insuranceInfo.groupNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  insuranceInfo: { ...formData.insuranceInfo, groupNumber: e.target.value }
                })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
            >
              {editingPatient ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </PageWrapper>
  );
};

export default PatientList; 