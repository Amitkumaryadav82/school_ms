import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Alert,
  Paper,
  FormControlLabel,
  Switch,
  Collapse,
  Divider,
  Grid,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Debug info collection on component mount and handle URL parameters
  useEffect(() => {
    try {
      console.log('🔍 Login component mounted');
      console.log('⚙️ API URL from environment config:', 
        import.meta.env.MODE === 'production' 
          ? import.meta.env.VITE_API_URL || 'https://api.schoolms.com'
          : 'http://localhost:8080'
      );
      
      // Check for "reason" query parameter to display appropriate messages
      const urlParams = new URLSearchParams(window.location.search);
      const reason = urlParams.get('reason');
      
      if (reason) {
        console.log('Login reason parameter found:', reason);
        
        if (reason === 'expired') {
          setError('Your session has expired. Please log in again.');
        } else if (reason === 'invalid') {
          setError('Authentication error. Please log in again with valid credentials.');
        } else if (reason === 'permission') {
          setError('You do not have permission to access that resource. Please log in with an account that has the required permissions.');
        } else if (reason === 'timeout') {
          setError('You have been logged out due to inactivity.');
        }
      }
    } catch (e) {
      console.error('Error in debug collection:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDetailedError(null);
    setTestResult(null);
    
    try {
      setIsLoading(true);
      console.log(`🔐 Attempting login with username: ${username}`);
      
      // Try direct API call first to debug
      if (debugMode) {
        console.log('🧪 Debug mode: Making direct API call instead of using auth context');
        try {
          const directLoginResponse = await authService.login({ username, password });
          console.log('✅ Direct login API call successful:', directLoginResponse);
          setTestResult('Direct API call successful! Proceeding with normal login flow...');
          // Continue with normal login
        } catch (directError: unknown) {
          console.error('❌ Direct login API call failed:', directError);
          setDetailedError(directError);
          setTestResult(`Direct API call failed: ${(directError as Error)?.message || JSON.stringify(directError)}`);
          throw directError;
        }
      }
      
      // Regular login through context
      await login(username, password);
      console.log('✅ Login successful through auth context');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      setDetailedError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test connection to server
  const testServerConnection = async () => {
    try {
      setIsLoading(true);
      setTestResult(null);
      
      const apiUrl = import.meta.env.MODE === 'production' 
        ? import.meta.env.VITE_API_URL || 'https://api.schoolms.com'
        : 'http://localhost:8080';
        
      console.log(`🧪 Testing server connection to ${apiUrl}/health`);
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const message = `Server connection successful: ${await response.text()}`;
        setTestResult(message);
        console.log('✅', message);
      } else {
        const message = `Server returned status: ${response.status} ${response.statusText}`;
        setTestResult(message);
        console.warn('⚠️', message);
      }
    } catch (e: any) {
      const message = `Server connection failed: ${e.message}`;
      setTestResult(message);
      console.error('❌', message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test login with the correct endpoint
  const testLogin = async () => {
    if (!username || !password) {
      setTestResult('Please enter username and password before testing');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDetailedError(null);
    setTestResult('Testing login with /api/auth/login endpoint...');
    
    try {
      const apiUrl = import.meta.env.MODE === 'production' 
        ? import.meta.env.VITE_API_URL || 'https://api.schoolms.com'
        : 'http://localhost:8080';
      
      console.log(`🧪 Testing login with ${apiUrl}/api/auth/login`);
      
      const response = await authService.login({ username, password });
      
      if (response && response.data) {
        setTestResult(`Login successful! Received token and user details.`);
        console.log('✅ Test login successful:', response.data);
      }
    } catch (e: any) {
      const message = `Login test failed: ${e.message || JSON.stringify(e)}`;
      setTestResult(message);
      console.error('❌', message);
      setDetailedError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 450, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {testResult && (
            <Alert severity="info" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
              {testResult}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || !username || !password}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showAdvanced}
                    onChange={() => setShowAdvanced(!showAdvanced)}
                  />
                }
                label="Show debugging tools"
              />
            </Box>
            
            <Collapse in={showAdvanced}>
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Debugging Tools
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={debugMode}
                      onChange={() => setDebugMode(!debugMode)}
                      disabled={isLoading}
                    />
                  }
                  label="Debug mode (direct API calls)"
                />
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled={isLoading}
                      onClick={testServerConnection}
                    >
                      Test Server Connection
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled={isLoading || !username || !password}
                      onClick={testLogin}
                    >
                      Test Login
                    </Button>
                  </Grid>
                </Grid>
                
                {detailedError && (
                  <Box sx={{ mt: 2, overflow: 'auto' }}>
                    <Typography variant="subtitle2" color="error">
                      Detailed Error:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.100' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
                        {JSON.stringify(detailedError, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
              </Paper>
            </Collapse>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;