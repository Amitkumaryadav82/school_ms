import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { apiDiagnostics, ApiTestEndpoint, ApiTestResult } from '../../utils/debugUtils';

interface ApiTestDialogProps {
  open: boolean;
  onClose: () => void;
  entityType: string;
  customEndpoints?: ApiTestEndpoint[];
}

/**
 * A reusable dialog for testing API endpoints
 * This is used for development and diagnostics only
 */
const ApiTestDialog: React.FC<ApiTestDialogProps> = ({
  open,
  onClose,
  entityType,
  customEndpoints = []
}) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiTestResult[]>([]);

  const runApiTests = async () => {
    setLoading(true);
    setResults([]);
    
    // Combine default endpoints with any custom endpoints
    const endpoints = [
      ...apiDiagnostics.getCommonEndpoints(entityType),
      ...customEndpoints
    ];
    
    const testResults = await apiDiagnostics.runApiTests(endpoints);
    setResults(testResults);
    setLoading(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>API Endpoint Diagnostics</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Testing different API endpoints to find which one works with your backend.
        </Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {results.length > 0 && (
          <List>
            {results.map((result, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText 
                    primary={`${result.name} - ${result.success ? '✅ Success' : '❌ Failed'} (${result.status})`}
                    secondary={
                      <Box 
                        component="pre" 
                        sx={{ 
                          mt: 1, 
                          p: 1, 
                          bgcolor: 'grey.100', 
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {result.success 
                          ? JSON.stringify(result.data, null, 2)
                          : result.error
                        }
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={runApiTests} disabled={loading} color="primary">
          Run API Tests
        </Button>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiTestDialog;