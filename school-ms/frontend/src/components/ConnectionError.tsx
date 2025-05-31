import React, { useState } from 'react';
import { 
  Box, 
  Alert, 
  AlertTitle, 
  Button, 
  Typography, 
  Paper,
  Collapse
} from '@mui/material';
import { WifiOff, Settings as SettingsIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import ConnectionSettings from './ConnectionSettings';
import { testBackendConnectivity } from '../utils/connectivityCheck';

interface ConnectionErrorProps {
  error?: Error | string;
  message?: string;
  title?: string;
  onRetry?: () => void;
  showFallbackUI?: boolean;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({
  error,
  message = 'Failed to connect to the backend server',
  title = 'Connection Error',
  onRetry,
  showFallbackUI = true
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleRetry = async () => {
    try {
      const result = await testBackendConnectivity();
      
      if (result.isConnected) {
        if (onRetry) onRetry();
      } else {
        alert('Backend server is still unreachable. Please check your connection settings.');
      }
    } catch (err) {
      console.error('Error testing connectivity:', err);
    }
  };
  
  if (!showFallbackUI) {
    return null;
  }

  const errorMessage = error instanceof Error ? error.message : 
                      typeof error === 'string' ? error : 
                      message;
  
  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'error.main',
          borderRadius: 1
        }}
      >
        <Alert 
          severity="error"
          icon={<WifiOff />}
          sx={{ mb: 2 }}
        >
          <AlertTitle>{title}</AlertTitle>
          {errorMessage}
        </Alert>
        
        <Box sx={{ my: 2 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            This could be due to:
          </Typography>
          <ul>
            <li>The backend server is not running</li>
            <li>Network connectivity issues</li>
            <li>Incorrect API URL configuration</li>
            <li>CORS or authentication problems</li>
          </ul>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
          >
            Retry Connection
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            Connection Settings
          </Button>
          
          {error && (
            <Button 
              variant="text"
              color="inherit"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          )}
        </Box>
        
        {error && (
          <Collapse in={showDetails}>
            <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
                {error instanceof Error ? error.stack || error.message : error}
              </Typography>
            </Box>
          </Collapse>
        )}
      </Paper>
      
      <ConnectionSettings 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </Box>
  );
};

export default ConnectionError;