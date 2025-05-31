import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Badge, 
  Tooltip, 
  Menu, 
  MenuItem,
  Divider,
  Typography,
  Box
} from '@mui/material';
import { WifiOff, Wifi, Settings, Refresh, OpenInNew } from '@mui/icons-material';
import { testBackendConnectivity } from '../utils/connectivityCheck';
import ConnectionSettings from './ConnectionSettings';
import config from '../config/environment';

const ConnectionStatusIndicator: React.FC = () => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  const checkConnection = async () => {
    if (checking) return;
    
    setChecking(true);
    try {
      const result = await testBackendConnectivity();
      setConnected(result.isConnected);
      setLastChecked(new Date());
      
      // Update config if a working URL was found
      if (result.workingUrl && result.workingUrl !== config.apiUrl) {
        console.log(`🔄 Updating API URL to ${result.workingUrl}`);
        config.apiUrl = result.workingUrl;
        sessionStorage.setItem('detectedApiUrl', result.workingUrl);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setConnected(false);
    } finally {
      setChecking(false);
    }
  };
  
  useEffect(() => {
    checkConnection();
    
    const intervalId = setInterval(() => {
      checkConnection();
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  
  const handleClose = () => {
    setMenuAnchor(null);
  };
  
  const handleCheckNow = () => {
    checkConnection();
    handleClose();
  };
  
  const handleOpenSettings = () => {
    setShowSettings(true);
    handleClose();
  };
  
  const getStatusInfo = () => {
    if (connected === null) return { label: 'Checking connection...', color: 'default' };
    if (connected) return { label: 'Connected to backend', color: 'success' };
    return { label: 'Backend connection issues', color: 'error' };
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <>
      <Tooltip title={statusInfo.label}>
        <IconButton
          color={connected ? 'success' : connected === false ? 'error' : 'default'}
          onClick={handleClick}
        >
          <Badge
            color={checking ? 'info' : 'default'}
            variant="dot"
            invisible={!checking}
          >
            {connected ? <Wifi /> : <WifiOff />}
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 250,
          },
        }}
      >
        <MenuItem disabled>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              Backend Connection Status
            </Typography>
            <Typography variant="body2" color={connected ? 'success.main' : 'error.main'}>
              {connected ? 'Connected' : 'Disconnected'}
            </Typography>
            {lastChecked && (
              <Typography variant="caption" color="text.secondary">
                Last checked: {lastChecked.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCheckNow}>
          <Refresh sx={{ mr: 1 }} fontSize="small" />
          Check connection now
        </MenuItem>
        <MenuItem onClick={handleOpenSettings}>
          <Settings sx={{ mr: 1 }} fontSize="small" />
          Connection settings
        </MenuItem>
        <MenuItem onClick={() => {
          window.open('/api/docs', '_blank');
          handleClose();
        }}>
          <OpenInNew sx={{ mr: 1 }} fontSize="small" />
          View API docs
        </MenuItem>
      </Menu>
      
      <ConnectionSettings 
        open={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
};

export default ConnectionStatusIndicator;