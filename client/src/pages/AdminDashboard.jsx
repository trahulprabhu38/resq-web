import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  TablePagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import axios from 'axios';
import PageWrapper from '../components/PageWrapper';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllStaff = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/all-staff`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStaffMembers(response.data);
    } catch (err) {
      setError('Failed to fetch staff members');
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    fetchAllStaff();
  }, []);

  const handleVerify = async (userId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-staff/${userId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccessMessage('Staff member verified successfully');
      fetchAllStaff();
    } catch (err) {
      setError('Failed to verify staff member');
      console.error('Error:', err);
    }
  };

  const handleRevoke = async (userId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/revoke-staff/${userId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSuccessMessage('Staff verification revoked successfully');
      fetchAllStaff();
    } catch (err) {
      setError('Failed to revoke staff verification');
      console.error('Error:', err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredStaff = staffMembers.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.hospital?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.hospital?.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.hospital?.staffId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage staff verifications and hospital access
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocalHospitalIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5">Medical Staff Management</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by name, email, hospital, department, or staff ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Hospital</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Staff ID</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Joined</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStaff
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((staff) => (
                          <TableRow key={staff._id}>
                            <TableCell>{staff.name}</TableCell>
                            <TableCell>{staff.email}</TableCell>
                            <TableCell>{staff.hospital?.name}</TableCell>
                            <TableCell>{staff.hospital?.department}</TableCell>
                            <TableCell>{staff.hospital?.position}</TableCell>
                            <TableCell>{staff.hospital?.staffId}</TableCell>
                            <TableCell>{staff.hospital?.contact}</TableCell>
                            <TableCell>
                              <Chip
                                icon={staff.isVerified ? <VerifiedIcon /> : <GppMaybeIcon />}
                                label={staff.isVerified ? "Verified" : "Pending"}
                                color={staff.isVerified ? "success" : "warning"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {format(new Date(staff.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Verify Staff Member">
                                <IconButton
                                  color="success"
                                  onClick={() => handleVerify(staff._id)}
                                  disabled={staff.isVerified}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Revoke Verification">
                                <IconButton
                                  color="error"
                                  onClick={() => handleRevoke(staff._id)}
                                  disabled={!staff.isVerified}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      {filteredStaff.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            <Typography variant="body1" sx={{ py: 2 }}>
                              No staff members found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredStaff.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </PageWrapper>
  );
};

export default AdminDashboard; 