import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  MenuItem,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { authService, RegisterRequest } from '../services/authService';

// Update roles to match the valid case-sensitive values and include descriptions
const roles = [
  { value: 'ADMIN', label: 'ADMIN - Full system administrative access' },
  { value: 'TEACHER', label: 'TEACHER - Access to teaching-related functions' },
  { value: 'STUDENT', label: 'STUDENT - Access to student-specific features' },
  { value: 'STAFF', label: 'STAFF - General staff access' },
  { value: 'PARENT', label: 'PARENT - Parent/guardian access' },
];

const Register = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    password: '',
    email: '',
    role: '',
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof RegisterRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await authService.register(formData);
      showNotification({
        type: 'success',
        message: 'Registration successful! Please login.',
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract error message from API response
      let message = 'Registration failed. Please try again.';
      
      if (error.message && typeof error.message === 'string') {
        // Direct error message in the error object
        message = error.message;
      } else if (error.response) {
        // Error in axios response format
        if (error.response.data && error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data && typeof error.response.data === 'string') {
          message = error.response.data;
        }
      }
      
      setErrorMessage(message);
      showNotification({
        type: 'error',
        message: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h4" align="center" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 4 }}>
              Register for a new account
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Full Name"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              margin="normal"
              required
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={handleChange('username')}
              margin="normal"
              required
              disabled={isLoading}
              error={!!errorMessage && errorMessage.toLowerCase().includes('username')}
              helperText={errorMessage && errorMessage.toLowerCase().includes('username') ? errorMessage : ''}
            />

            <TextField
              fullWidth
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange('email')}
              margin="normal"
              required
              disabled={isLoading}
              error={!!errorMessage && errorMessage.toLowerCase().includes('email')}
              helperText={errorMessage && errorMessage.toLowerCase().includes('email') ? errorMessage : ''}
            />

            <TextField
              fullWidth
              select
              label="Role"
              value={formData.role}
              onChange={handleChange('role')}
              margin="normal"
              required
              disabled={isLoading}
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange('password')}
              margin="normal"
              required
              disabled={isLoading}
              error={!!errorMessage && errorMessage.toLowerCase().includes('password')}
              helperText={errorMessage && errorMessage.toLowerCase().includes('password') ? errorMessage : ''}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Register'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login">
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;