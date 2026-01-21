import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import { testBackendConnectivity } from '../utils/connectivityCheck';
import { runAuthDiagnostics } from '../utils/authDiagnostic';
import { useConnection } from '../context/ConnectionContext';
import config from '../config/environment';

interface DiagnosticsResult {
  status: 'success' | 'warning' | 'error' | 'unknown';
  message: string;
  details?: any;
}

const ConnectionDiagnosticsTool: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, DiagnosticsResult>>({});
  const { setShowConnectionSettings } = useConnection();

  const runDiagnostics = async () => {
    setRunning(true);
    setResults({});

    try {
      // Step 1: Basic connectivity check
      setResults(prev => ({
        ...prev,
        connectivity: {
          status: 'unknown',
          message: 'Testing backend server connectivity...'
        }
      }));
      
      try {
        const connectivity = await testBackendConnectivity();
        if (connectivity.isConnected) {
          setResults(prev => ({
            ...prev,
            connectivity: {
              status: 'success',
              message: `Successfully connected to ${connectivity.workingUrl || config.apiUrl}`,
              details: connectivity
            }
          }));

          // If we found a different working URL, suggest using it
          if (connectivity.workingUrl && connectivity.workingUrl !== config.apiUrl) {
            setResults(prev => ({
              ...prev,
              apiUrl: {
                status: 'warning',
                message: `Your API URL may be incorrect. Consider using ${connectivity.workingUrl} instead.`,
                details: {
                  currentUrl: config.apiUrl,
                  suggestedUrl: connectivity.workingUrl
                }
              }
            }));
          }
        } else {
          setResults(prev => ({
            ...prev,
            connectivity: {
              status: 'error',
              message: 'Failed to connect to backend server.',
              details: connectivity
            }
          }));
        }
      } catch (error) {
        setResults(prev => ({
          ...prev,
          connectivity: {
            status: 'error',
            message: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        }));
      }

      // Step 2: Auth endpoints check
      setResults(prev => ({
        ...prev,
        auth: {
          status: 'unknown',
          message: 'Testing authentication endpoints...'
        }
      }));

      try {
        const authDiagnostics = await runAuthDiagnostics();
        
        if (authDiagnostics.authEndpointAvailable) {
          setResults(prev => ({
            ...prev,
            auth: {
              status: 'success',
              message: 'Authentication endpoints are accessible.',
              details: authDiagnostics
            }
          }));
        } else if (authDiagnostics.corsIssues) {
          setResults(prev => ({
            ...prev,
            auth: {
              status: 'warning',
              message: 'CORS issues detected with authentication endpoints.',
              details: authDiagnostics
            },
            cors: {
              status: 'error',
              message: 'CORS configuration appears to be incorrect.',
              details: authDiagnostics.problems.filter(p => p.type === 'cors')
            }
          }));
        } else {
          setResults(prev => ({
            ...prev,
            auth: {
              status: 'error',
              message: 'Authentication endpoints are not accessible.',
              details: authDiagnostics
            }
          }));
        }
        
        // Add any problems to the results
        if (authDiagnostics.problems.length > 0) {
          authDiagnostics.problems.forEach(problem => {
            setResults(prev => ({
              ...prev,
              [problem.type]: {
                status: problem.severity === 'high' ? 'error' : 'warning',
                message: problem.description,
                details: problem
              }
            }));
          });
        }
        
      } catch (error) {
        setResults(prev => ({
          ...prev,
          auth: {
            status: 'error',
            message: `Auth diagnostics error: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        }));
      }

      // Step 3: Database check through API
      setResults(prev => ({
        ...prev,
        database: {
          status: 'unknown',
          message: 'Testing database connection through API...'
        }
      }));

      try {
        // Simple test endpoint that requires database access
        const response = await fetch(`${config.apiUrl}/api/auth/health`);
        if (response.ok) {
          const data = await response.json();
          setResults(prev => ({
            ...prev,
            database: {
              status: 'success',
              message: 'Database connection appears to be working.',
              details: data
            }
          }));
        } else {
          setResults(prev => ({
            ...prev,
            database: {
              status: 'warning',
              message: `Database check received status ${response.status}.`,
              details: { status: response.status }
            }
          }));
        }
      } catch (error) {
        // If we couldn't connect earlier, this might fail too, so don't overwrite with error
        if (results.connectivity?.status !== 'error') {
          setResults(prev => ({
            ...prev,
            database: {
              status: 'error',
              message: `Database check error: ${error instanceof Error ? error.message : String(error)}`,
              details: error
            }
          }));
        }
      }

    } finally {
      setRunning(false);
    }
  };

  // Run diagnostics on first load
  useEffect(() => {
    runDiagnostics();
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <HelpIcon color="disabled" />;
    }
  };

  const getOverallStatus = (): 'success' | 'warning' | 'error' | 'info' => {
    const statuses = Object.values(results).map(r => r.status);
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.includes('success') && !statuses.includes('unknown')) return 'success';
    return 'info'; // Changed from 'unknown' to 'info'
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>        <Typography variant="h5">Connection Diagnostics</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => setShowConnectionSettings(true)}
            sx={{ mr: 1 }}
          >
            Connection Settings
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={runDiagnostics} 
            disabled={running}
            startIcon={running ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {running ? 'Running...' : 'Run Diagnostics'}
          </Button>
        </Box>
      </Box>

      <Alert 
        severity={getOverallStatus()} 
        sx={{ mb: 2 }}
      >
        {getOverallStatus() === 'success' && 'All systems appear to be functioning correctly.'}
        {getOverallStatus() === 'warning' && 'There are some issues that may affect system functionality.'}
        {getOverallStatus() === 'error' && 'Critical issues detected. The system may not function correctly.'}
        {getOverallStatus() === 'info' && 'System status is being determined...'}
      </Alert>

      <List>
        {Object.entries(results).map(([key, result]) => (
          <React.Fragment key={key}>
            <ListItem>
              <ListItemIcon>{statusIcon(result.status)}</ListItemIcon>
              <ListItemText
                primary={key.charAt(0).toUpperCase() + key.slice(1)}
                secondary={result.message}
              />
              {result.details && (
                <Chip 
                  label="Details" 
                  size="small" 
                  onClick={() => console.log(`${key} details:`, result.details)} 
                />
              )}
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>

      {(getOverallStatus() === 'warning' || getOverallStatus() === 'error') && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Troubleshooting Suggestions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {results.connectivity?.status === 'error' && (
                <ListItem>
                  <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                  <ListItemText 
                    primary="Backend Server Unavailable" 
                    secondary={`Make sure the backend server is running on port ${new URL(config.apiUrl).port}. Try different ports in Connection Settings.`} 
                  />
                </ListItem>
              )}
              {results.cors?.status === 'error' && (
                <ListItem>
                  <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                  <ListItemText 
                    primary="CORS Configuration Issue" 
                    secondary="The backend CORS configuration might not allow requests from this origin. Check the CORS settings in the backend." 
                  />
                </ListItem>
              )}
              {results.database?.status === 'error' && (
                <ListItem>
                  <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                  <ListItemText 
                    primary="Database Connection Issue" 
                    secondary="Check if the database is running and properly configured in the backend." 
                  />
                </ListItem>
              )}
              {results.api_prefix?.status === 'warning' && (
                <ListItem>
                  <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                  <ListItemText 
                    primary="API Path Prefix Issue" 
                    secondary="There may be inconsistencies in how API paths are formed. Check endpoint prefixes." 
                  />
                </ListItem>
              )}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};

export default ConnectionDiagnosticsTool;