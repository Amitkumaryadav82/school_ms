import React from 'react';
import { useServerStatus, ServerStatus } from '../services/ServerStatusService';
import { Box, Typography, Tooltip, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import HelpIcon from '@mui/icons-material/Help';

/**
 * Component that displays the current server connection status.
 * Shows a visual indicator that changes based on connection state.
 */
const ServerStatusIndicator: React.FC = () => {
  const serverStatus = useServerStatus();

  const getStatusIcon = (status: ServerStatus) => {
    switch (status.status) {
      case 'ONLINE':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'OFFLINE':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'DEGRADED':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'ERROR':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'UNKNOWN':
      default:
        return <HelpIcon sx={{ color: 'info.main' }} />;
    }
  };

  const getStatusColor = (status: ServerStatus) => {
    switch (status.status) {
      case 'ONLINE':
        return 'success.main';
      case 'OFFLINE':
        return 'error.main';
      case 'DEGRADED':
        return 'warning.main';
      case 'ERROR':
        return 'error.main';
      case 'UNKNOWN':
      default:
        return 'info.main';
    }
  };

  const getStatusText = (status: ServerStatus) => {
    switch (status.status) {
      case 'ONLINE':
        return 'Connected';
      case 'OFFLINE':
        return 'Disconnected';
      case 'DEGRADED':
        return 'Degraded';
      case 'ERROR':
        return 'Error';
      case 'UNKNOWN':
      default:
        return 'Checking...';
    }
  };

  const getTooltipContent = (status: ServerStatus) => {
    let content = status.message;
    
    if (status.details) {
      const detailsStr = typeof status.details === 'object' 
        ? JSON.stringify(status.details, null, 2) 
        : status.details.toString();
      
      content += `\n\nDetails: ${detailsStr}`;
    }

    if (status.error) {
      content += `\n\nError: ${status.error.message || 'Unknown error'}`;
    }

    return content;
  };

  return (
    <Tooltip 
      title={<pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>{getTooltipContent(serverStatus)}</pre>}
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
          borderColor: getStatusColor(serverStatus)
        }}
      >
        {serverStatus.status === 'UNKNOWN' ? (
          <CircularProgress size={20} color="info" />
        ) : (
          getStatusIcon(serverStatus)
        )}
        <Typography variant="caption" color={getStatusColor(serverStatus)} sx={{ fontWeight: 'medium' }}>
          {getStatusText(serverStatus)}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default ServerStatusIndicator;