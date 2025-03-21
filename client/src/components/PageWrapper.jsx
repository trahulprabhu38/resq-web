import React from 'react';
import { Container, Box } from '@mui/material';

const PageWrapper = ({ children, maxWidth = "lg" }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        paddingTop: '100px', // Space for navbar
        paddingBottom: '2rem',
        backgroundColor: 'background.default'
      }}
    >
      <Container maxWidth={maxWidth}>
        <Box sx={{ 
          height: '100%',
          minHeight: 'calc(100vh - 180px)', // Account for padding and margins
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default PageWrapper; 