import React, { Component, ErrorInfo, ReactNode, useContext } from 'react';
import { Box, Button, Typography, Paper, Alert, AlertTitle } from '@mui/material';
import { Refresh as RefreshIcon, Settings as SettingsIcon } from '@mui/icons-material';
import ConnectionContext from '../context/ConnectionContext';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onReset?: () => void;
  connectionContext?: React.ContextType<typeof ConnectionContext>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isConnectionError: boolean;
}

// Create a context consumer component to access ConnectionContext from a class component
class NetworkErrorBoundaryWithContext extends React.Component<Props> {
  static contextType = ConnectionContext;
  context!: React.ContextType<typeof ConnectionContext>;
  
  render() {
    return <NetworkErrorBoundary {...this.props} connectionContext={this.context} />;
  }
}

/**
 * NetworkErrorBoundary component that catches errors related to network connectivity
 * and provides options to retry or adjust connection settings.
 */
class NetworkErrorBoundary extends Component<Props, State> {  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isConnectionError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Check if this is likely a network error
    const isConnectionError = this.isNetworkError(error);
    this.setState({ isConnectionError });
    
    // Log the error for debugging
    console.error('Network Error Boundary caught an error:', error, errorInfo);
  }

  isNetworkError(error: Error): boolean {
    const errorString = error.toString().toLowerCase();
    const networkErrorKeywords = [
      'network', 
      'connection', 
      'failed to fetch',
      'cors',
      'refused',
      'timeout',
      'offline',
      'net::err',
      'axios',
      '401',
      '403',
      '404',
      '500',
      '502',
      '503',
      '504'
    ];
    
    return networkErrorKeywords.some(keyword => errorString.includes(keyword));
  }
  handleReset = async (): Promise<void> => {
    // Test connectivity before resetting
    try {
      let isConnected = false;
      if (this.props.connectionContext) {
        isConnected = await this.props.connectionContext.checkConnection();
      }
      
      if (isConnected) {
        // If connection is restored, reset the error state
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
          this.props.onReset();
        }
      } else {
        // If still disconnected, show a message
        alert('Backend server is still unreachable. Please check your connection settings.');
      }
    } catch (error) {
      console.error('Error testing connectivity:', error);
      alert('Could not test connectivity. Please try again.');
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallbackComponent && !this.state.isConnectionError) {
        return this.props.fallbackComponent;
      }

      // Default network error UI
      return (
        <Box sx={{ p: 3 }}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              backgroundColor: this.state.isConnectionError ? 'error.light' : 'warning.light',
              color: 'white'
            }}
          >
            <Alert 
              severity={this.state.isConnectionError ? "error" : "warning"}
              variant="filled"
              sx={{ mb: 2 }}
            >
              <AlertTitle>
                {this.state.isConnectionError 
                  ? 'Connection Error' 
                  : 'Something went wrong'
                }
              </AlertTitle>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Alert>
            
            <Typography variant="body1" component="div" sx={{ mb: 2, color: 'text.primary' }}>
              {this.state.isConnectionError
                ? 'Unable to connect to the backend server. This could be due to network issues or the server may be down.'
                : 'The application encountered an error and could not complete your request.'
              }
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
              >
                Retry
              </Button>
                {this.state.isConnectionError && this.props.connectionContext && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<SettingsIcon />}
                  onClick={() => this.props.connectionContext?.setShowConnectionSettings(true)}
                >
                  Connection Settings
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default NetworkErrorBoundaryWithContext;
