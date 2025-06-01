import React, { useState } from 'react';
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
import ConnectionSettings from './ConnectionSettings';
import { useConnection } from '../context/ConnectionContext';
import config from '../config/environment';

const ConnectionStatusIndicator: React.FC = () => {
  const { connectionState, checkConnection, setShowConnectionSettings } = useConnection();
  const { connected, checking, lastChecked } = connectionState;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
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
    setShowConnectionSettings(true);
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
    </>
  );
};

export default ConnectionStatusIndicator;