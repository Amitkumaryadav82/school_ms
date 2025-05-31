import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Typography, 
  Alert, 
  CircularProgress,
  Box,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import config from '../config/environment';
import { testBackendConnectivity } from '../utils/connectivityCheck';

interface ConnectionSettingsProps {
  open: boolean;
  onClose: () => void;
}

const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({ open, onClose }) => {
  const [apiUrl, setApiUrl] = useState(config.apiUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [recommendedPorts, setRecommendedPorts] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>("");
  
  useEffect(() => {
    if (open) {
      setApiUrl(config.apiUrl);
      setTestResult(null);
      
      // Extract current port and generate alternatives
      try {
        const url = new URL(config.apiUrl);
        const currentPort = url.port;
        setRecommendedPorts(['8080', '8081', '8082', '5000', '3000'].filter(p => p !== currentPort));
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
    }
  }, [open]);
  
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testBackendConnectivity();
      
      if (result.isConnected) {
        setTestResult({
          success: true,
          message: `Successfully connected to ${result.workingUrl || apiUrl}`,
          details: result
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to connect to server',
          details: result
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error.message}`,
        details: error
      });
    } finally {
      setTesting(false);
    }
  };
  
  const handleApply = () => {
    if (apiUrl !== config.apiUrl) {
      config.apiUrl = apiUrl;
      sessionStorage.setItem('detectedApiUrl', apiUrl);
      console.log(`✅ API URL updated to: ${apiUrl}`);
      
      // Show confirmation
      setTestResult({
        success: true,
        message: `API URL updated to ${apiUrl}`
      });
      
      // Reload after a delay to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      onClose();
    }
  };
  
  const handleReset = () => {
    const defaultUrl = import.meta.env.MODE !== 'production' 
      ? 'http://localhost:8080' 
      : window.location.origin;
      
    setApiUrl(defaultUrl);
    setTestResult({
      success: true,
      message: `Reset to default URL: ${defaultUrl}`
    });
  };
  
  const handlePortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const port = event.target.value as string;
    setSelectedPort(port);
    
    try {
      const url = new URL(apiUrl);
      url.port = port;
      setApiUrl(url.toString());
    } catch (e) {
      console.error('Error updating port:', e);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>API Connection Settings</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Configure the connection to the backend API server. 
          Changes will take effect after saving and may require a page reload.
        </Typography>
        
        {testResult && (
          <Alert 
            severity={testResult.success ? "success" : "error"} 
            sx={{ mt: 2, mb: 2 }}
          >
            {testResult.message}
          </Alert>
        )}
        
        <Box mt={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="API URL"
                fullWidth
                variant="outlined"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                helperText="Example: http://localhost:8080"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Port Selection:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {recommendedPorts.map(port => (
                  <Chip 
                    key={port} 
                    label={`Port ${port}`} 
                    onClick={() => {
                      try {
                        const url = new URL(apiUrl);
                        url.port = port;
                        setApiUrl(url.toString());
                      } catch (e) {
                        console.error('Error updating port:', e);
                      }
                    }} 
                    color="primary" 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset to Default
        </Button>
        <Button onClick={handleTest} disabled={testing}>
          {testing ? <CircularProgress size={24} /> : 'Test Connection'}
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleApply} color="primary" variant="contained">
          Save & Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConnectionSettings;