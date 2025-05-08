import React, { useState } from 'react';
import { Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails, Chip, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * A component that helps debug authentication issues
 * This should only be used during development
 */
const AuthDebugger: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force a refresh
  const refresh = () => setRefreshKey(prev => prev + 1);

  React.useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Decode the JWT token
        const parts = token.split('.');
        if (parts.length !== 3) {
          setTokenInfo({ error: 'Invalid token format' });
          return;
        }
        
        // Decode the payload part (index 1)
        const payload = JSON.parse(atob(parts[1]));
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < now;
        
        setTokenInfo({
          ...payload,
          isExpired,
          expiresIn: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Unknown',
          decodedPayload: payload
        });
      } catch (e) {
        setTokenInfo({ error: 'Failed to decode token', details: e.message });
      }
    } else {
      setTokenInfo({ error: 'No token found in localStorage' });
    }
  }, [refreshKey]);

  // Get user info
  const userInfo = React.useMemo(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return { error: 'No user data found' };
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return { error: 'Failed to parse user data', details: e.message };
    }
  }, [refreshKey]);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ mb: 2, border: '1px solid #ddd' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">Authentication Debugger</Typography>
          
          {tokenInfo?.isExpired ? (
            <Chip 
              icon={<ErrorIcon />} 
              label="Token Expired" 
              color="error" 
              size="small" 
            />
          ) : tokenInfo?.error ? (
            <Chip 
              icon={<ErrorIcon />} 
              label="Auth Error" 
              color="error" 
              size="small"
            />
          ) : (
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Token Valid" 
              color="success" 
              size="small"
            />
          )}
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        <Box sx={{ mb: 1 }}>
          <Button 
            size="small" 
            startIcon={<RefreshIcon />} 
            onClick={refresh} 
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Refresh Auth Data
          </Button>
        </Box>
        
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>User Information:</Typography>
        <Paper sx={{ p: 1, mb: 2, bgcolor: '#f8f9fa', overflowX: 'auto' }}>
          <pre style={{ margin: 0 }}>
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </Paper>
        
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Token Information:</Typography>
        <Paper sx={{ p: 1, mb: 2, bgcolor: '#f8f9fa', overflowX: 'auto' }}>
          <pre style={{ margin: 0 }}>
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </Paper>
        
        {tokenInfo?.isExpired && (
          <Typography color="error" variant="body2">
            Your token has expired at {tokenInfo.expiresIn}. You need to log in again.
          </Typography>
        )}
        
        {tokenInfo?.error && (
          <Typography color="error" variant="body2">
            Authentication error: {tokenInfo.error}
          </Typography>
        )}
        
        <Typography variant="caption" color="textSecondary">
          This debugger is intended for development use only
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default AuthDebugger;