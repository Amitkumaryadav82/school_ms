import React from 'react';
import { Box, Button, Typography, Paper, Alert, AlertTitle } from '@mui/material';
import { Refresh as RefreshIcon, Settings as SettingsIcon } from '@mui/icons-material';
import ConnectionSettings from './ConnectionSettings';

interface NetworkErrorWrapperProps {
  children: React.ReactNode;
}

/**
 * A simpler component to wrap Dashboard content with network error handling.
 * Unlike a full error boundary, this component doesn't catch errors, but provides
 * a consistent way to display connection-related errors.
 */
const NetworkErrorWrapper: React.FC<NetworkErrorWrapperProps> = ({ children }) => {
  const [showSettings, setShowSettings] = React.useState(false);
  
  return (
    <>
      {children}
      
      <ConnectionSettings 
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default NetworkErrorWrapper;
