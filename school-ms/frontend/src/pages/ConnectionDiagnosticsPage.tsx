import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import ConnectionDiagnosticsTool from '../components/ConnectionDiagnosticsTool';
import ConnectionSettings from '../components/ConnectionSettings';
import { useConnection } from '../context/ConnectionContext';

const ConnectionDiagnosticsPage: React.FC = () => {
  const { setShowConnectionSettings } = useConnection();
  
  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Connection Diagnostics
        </Typography>
        
        <Typography variant="body1" paragraph>
          Use this page to diagnose connection issues with the backend server. If you're experiencing
          problems logging in or accessing data, the diagnostic tool can help identify the cause.
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => setShowConnectionSettings(true)}
            sx={{ mr: 2 }}
          >
            Connection Settings
          </Button>
          
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <ConnectionDiagnosticsTool />
        </Box>
      </Paper>
      
      <ConnectionSettings />
    </Container>
  );
};

export default ConnectionDiagnosticsPage;
