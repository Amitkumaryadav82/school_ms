import React, { useEffect } from 'react';
import { useServerStatus, ServerStatus } from '../services/ServerStatusService';
import { Box, Typography, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * Component that only shows when the server is connected,
 * and logs issues to the console instead of displaying them.
 */
const ServerStatusIndicator: React.FC = () => {
  const serverStatus = useServerStatus();

  // Log server status changes to console instead of showing UI indicator
  useEffect(() => {
    if (serverStatus.status !== 'ONLINE') {
      console.log(`Server Status: ${serverStatus.status}`);
      if (serverStatus.message) {
        console.log(`Message: ${serverStatus.message}`);
      }
      if (serverStatus.details) {
        console.log('Details:', serverStatus.details);
      }
      if (serverStatus.error) {
        console.error('Server connection error:', serverStatus.error);
      }
    }
  }, [serverStatus]);

  // Only render something if the server is online
  if (serverStatus.status !== 'ONLINE') {
    return null; // Return nothing when not connected
  }
  
  return (
    <Tooltip 
      title="Server is connected"
      arrow
      placement="bottom-end"
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          padding: '4px 8px',
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'success.main'
        }}
      >
        <CheckCircleIcon sx={{ color: 'success.main' }} />
        <Typography variant="caption" color="success.main" sx={{ fontWeight: 'medium' }}>
          Connected
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default ServerStatusIndicator;