import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

interface LoadingProps {
  message?: string;
  size?: number;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', size }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: size ? 'auto' : 200,
      }}
    >
      <CircularProgress size={size} />
      {!size && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;