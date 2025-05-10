import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  InputAdornment
} from '@mui/material';
import { TransportRoute } from '../../services/feeService';

interface TransportRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransportRoute) => void;
  initialData?: TransportRoute | null;
  loading?: boolean;
}

const TransportRouteDialog: React.FC<TransportRouteDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading
}) => {
  const isEdit = !!initialData?.id;
  
  const [formData, setFormData] = useState<TransportRoute>({
    routeName: '',
    routeDescription: '',
    feeAmount: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        routeName: initialData.routeName,
        routeDescription: initialData.routeDescription,
        feeAmount: initialData.feeAmount
      });
    } else {
      // Default values for new transport route
      setFormData({
        routeName: '',
        routeDescription: '',
        feeAmount: 0
      });
    }
  }, [initialData, open]);

  const handleInputChange = (field: keyof TransportRoute) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'feeAmount' ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear error message when field is updated
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: Record<string, string> = {};

    if (!formData.routeName.trim()) {
      validationErrors.routeName = 'Route name is required';
    }

    if (formData.feeAmount < 0) {
      validationErrors.feeAmount = 'Fee amount cannot be negative';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="transport-route-dialog-title"
    >
      <DialogTitle id="transport-route-dialog-title">
        {initialData ? 'Edit Transport Route' : 'Create Transport Route'}
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Route Name"
              value={formData.routeName}
              onChange={handleInputChange('routeName')}
              error={!!errors.routeName}
              helperText={errors.routeName}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Route Description"
              multiline
              rows={2}
              value={formData.routeDescription}
              onChange={handleInputChange('routeDescription')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Fee Amount"
              type="number"
              value={formData.feeAmount}
              onChange={handleInputChange('feeAmount')}
              InputProps={{ 
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { min: 0 } 
              }}
              error={!!errors.feeAmount}
              helperText={errors.feeAmount}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransportRouteDialog;