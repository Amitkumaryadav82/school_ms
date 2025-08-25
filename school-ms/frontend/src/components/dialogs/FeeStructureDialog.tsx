import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import {
  
} from '@mui/icons-material';
import { FeeStructure, PaymentSchedule } from '../../services/feeService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fee-dialog-tabpanel-${index}`}
      aria-labelledby={`fee-dialog-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface FeeStructureDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FeeStructure) => void;
  initialData?: FeeStructure | null;
  loading?: boolean;
}

const FeeStructureDialog: React.FC<FeeStructureDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading
}) => {
  const isEdit = !!initialData?.id;
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState<FeeStructure>({
    classGrade: 0,
    annualFees: 0,
    buildingFees: 0,
    labFees: 0,
    paymentSchedules: [],
    lateFees: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        classGrade: initialData.classGrade,
        annualFees: initialData.annualFees,
        buildingFees: initialData.buildingFees,
        labFees: initialData.labFees,
        paymentSchedules: initialData.paymentSchedules || [],
        lateFees: initialData.lateFees || [],
        totalFees: initialData.totalFees
      });
    } else {
      // Default values for new fee structure
      setFormData({
        classGrade: 1,
        annualFees: 0,
        buildingFees: 0,
        labFees: 0,
        paymentSchedules: [
          { scheduleType: 'MONTHLY', amount: 0, isEnabled: true },
          { scheduleType: 'QUARTERLY', amount: 0, isEnabled: true },
          { scheduleType: 'YEARLY', amount: 0, isEnabled: true }
        ],
        lateFees: []
      });
    }
    setTabValue(0);
  }, [initialData, open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field: keyof FeeStructure) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData((prev: FeeStructure) => ({
      ...prev,
      [field]: value
    }));

    // Clear error message when field is updated
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePaymentScheduleChange = (index: number, field: keyof PaymentSchedule, value: any) => {
    const updatedSchedules = [...formData.paymentSchedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: value
    };

    setFormData((prev: FeeStructure) => ({
      ...prev,
      paymentSchedules: updatedSchedules
    }));
  };

  const updatePaymentScheduleAmounts = (annualFees: number) => {
    const updatedSchedules = formData.paymentSchedules.map((schedule: PaymentSchedule) => {
      let amount = 0;
      switch (schedule.scheduleType) {
        case 'MONTHLY':
          amount = parseFloat((annualFees / 12).toFixed(2));
          break;
        case 'QUARTERLY':
          amount = parseFloat((annualFees / 4).toFixed(2));
          break;
        case 'YEARLY':
          amount = annualFees;
          break;
      }
      return { ...schedule, amount };
    });

    setFormData((prev: FeeStructure) => ({
      ...prev,
      paymentSchedules: updatedSchedules
    }));
  };

  const handleAnnualFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const annualFees = Number(e.target.value);
    setFormData((prev: FeeStructure) => ({
      ...prev,
      annualFees
    }));

    // Update payment schedule amounts when annual fees change
    updatePaymentScheduleAmounts(annualFees);
  };

  const validateForm = (): boolean => {
    const validationErrors: Record<string, string> = {};

    if (!formData.classGrade) {
      validationErrors.classGrade = 'Class/Grade is required';
    }

    if (formData.annualFees < 0) {
      validationErrors.annualFees = 'Annual fees cannot be negative';
    }

    if (formData.buildingFees < 0) {
      validationErrors.buildingFees = 'Building fees cannot be negative';
    }

    if (formData.labFees < 0) {
      validationErrors.labFees = 'Lab fees cannot be negative';
    }

    // Validate at least one payment schedule is enabled
    if (!formData.paymentSchedules.some(schedule => schedule.isEnabled)) {
      validationErrors.paymentSchedules = 'At least one payment schedule must be enabled';
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
      maxWidth="md"
      aria-labelledby="fee-structure-dialog-title"
    >
      <DialogTitle id="fee-structure-dialog-title">
        {initialData ? 'Edit Fee Structure' : 'Create Fee Structure'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="fee structure tabs"
          >
            <Tab label="Basic Information" />
            <Tab label="Payment Schedules" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Class/Grade"
                type="number"
                value={formData.classGrade}
                onChange={handleInputChange('classGrade')}
                InputProps={{ inputProps: { min: 1, max: 12 } }}
                disabled={isEdit} // Can't change grade if editing
                error={!!errors.classGrade}
                helperText={errors.classGrade}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                required
                label="Annual Fees"
                type="number"
                value={formData.annualFees}
                onChange={handleAnnualFeesChange}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0 } 
                }}
                error={!!errors.annualFees}
                helperText={errors.annualFees}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Building Fees"
                type="number"
                value={formData.buildingFees}
                onChange={handleInputChange('buildingFees')}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0 } 
                }}
                error={!!errors.buildingFees}
                helperText={errors.buildingFees}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lab Fees"
                type="number"
                value={formData.labFees}
                onChange={handleInputChange('labFees')}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0 } 
                }}
                error={!!errors.labFees}
                helperText={errors.labFees}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary">
                Total Fees: ₹{(Number(formData.annualFees) + Number(formData.buildingFees) + Number(formData.labFees)).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Configure payment schedules and amounts. Enable or disable payment options as needed.
          </Typography>
          
          {errors.paymentSchedules && (
            <FormHelperText error>{errors.paymentSchedules}</FormHelperText>
          )}
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {formData.paymentSchedules.map((schedule: PaymentSchedule, index: number) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle1">
                          {schedule.scheduleType.charAt(0) + schedule.scheduleType.slice(1).toLowerCase()} Payment
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Amount"
                          type="number"
                          value={schedule.amount}
                          onChange={(e) => handlePaymentScheduleChange(index, 'amount', Number(e.target.value))}
                          InputProps={{ 
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            inputProps: { min: 0 } 
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={schedule.isEnabled}
                              onChange={(e) => handlePaymentScheduleChange(index, 'isEnabled', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Enable this payment option"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
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

export default FeeStructureDialog;