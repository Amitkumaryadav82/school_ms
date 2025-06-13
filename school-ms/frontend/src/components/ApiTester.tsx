import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';
import api from '../services/api';

/**
 * Simple component to test API endpoints directly
 */
const ApiTester: React.FC = () => {
  const [endpoint, setEndpoint] = useState<string>('/api/exams/types');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = async () => {
    setLoading(true);
    setResult(null);
    setError(null);    try {
      // Make request to the specified endpoint
      // If the endpoint starts with /api/, remove it to avoid adding it twice
      let processedEndpoint = endpoint;
      if (endpoint.startsWith('/api/')) {
        processedEndpoint = endpoint.substring(4);
        console.log('Removed /api prefix. Using endpoint:', processedEndpoint);
      }
      
      const response = await api.get(processedEndpoint);
      
      console.log('API Test Response:', response);
      setResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      console.error('API Test Error:', err);
      setError(`${err.message}${err.response ? ` - ${JSON.stringify(err.response.data)}` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>API Endpoint Tester</Typography>
      
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          label="API Endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="e.g., /api/exams/types"
          sx={{ mr: 2 }}
        />
        <Button 
          variant="contained" 
          onClick={testEndpoint}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Test'}
        </Button>
      </Box>
      
      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary">Result:</Typography>
          <pre style={{ overflow: 'auto', maxHeight: '300px', background: '#f5f5f5', padding: '10px' }}>
            {result}
          </pre>
        </Box>
      )}
      
      {error && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="error">Error:</Typography>
          <pre style={{ overflow: 'auto', maxHeight: '300px', background: '#ffeeee', padding: '10px' }}>
            {error}
          </pre>
        </Box>
      )}
    </Paper>
  );
};

export default ApiTester;
