import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  FormHelperText,
  Tooltip,
  IconButton,
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Student } from '../../services/studentService';
import feeService, { FeeStructure, TransportRoute } from '../../services/feeService';
import { validateStudent } from '../../utils/validation';
import BaseDialog from './BaseDialog';
import StudentFeeDetails from '../../components/StudentFeeDetails';
import { StudentFeeDetails as StudentFeeDetailsType } from '../../types/payment.types';

// Extended fee structure interface that includes transport fees
interface ExtendedFeeStructure extends FeeStructure {
  transportFee?: number;
}

interface StudentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Student) => Promise<void>;
  initialData?: Partial<Student>;
  loading?: boolean;
}

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C', 'D'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const transportModes = ['School Bus', 'Self'];

// Get current date in YYYY-MM-DD format for default value
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get a date 10 years ago in YYYY-MM-DD format for default DOB
const getDefaultDOB = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 10); // Set to 10 years ago as a reasonable default
  return date.toISOString().split('T')[0];
};

const StudentDialog: React.FC<StudentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>(
    initialData || {
      name: '',
      studentId: '',
      grade: '',
      section: '',
      dateOfBirth: getDefaultDOB(), // Use a date in the past instead of current date
      gender: '',
      bloodGroup: '',
      address: '',
      email: '',
      parentName: '',
      phoneNumber: '', // This is required by the API
      parentPhone: '+91', // Changed from parentContact to match interface
      emergencyContact: '', // Changed from additionalContact to match interface
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      // New TC-related fields
      guardianOccupation: '',
      guardianOfficeAddress: '',
      aadharNumber: '',
      udiseNumber: '',
      houseAlloted: '',
      guardianAnnualIncome: '',
      previousSchool: '',
      tcNumber: '',
      tcReason: '',
      tcDate: '',
      whatsappNumber: '',
      subjects: '',
      transportMode: '',
      busRouteNumber: '',
      medicalConditions: '',
      // Fee related fields
      feeStructureId: undefined,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | false>('panel1');
  const [feeStructure, setFeeStructure] = useState<ExtendedFeeStructure | null>(null);
  const [loadingFeeStructure, setLoadingFeeStructure] = useState(false);
  const [feeDetailsExpanded, setFeeDetailsExpanded] = useState(false);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  const [loadingTransportRoutes, setLoadingTransportRoutes] = useState(false);

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Fetch fee structure when grade changes
  const fetchFeeStructure = async (grade: string) => {
    if (!grade) return;
    
    try {
      setLoadingFeeStructure(true);
      const gradeNumber = parseInt(grade, 10);
      const feeStructureData = await feeService.getFeeStructureByGrade(gradeNumber);
      setFeeStructure(feeStructureData);
      
      // Update the form data with fee structure ID
      setFormData(prev => ({
        ...prev,
        feeStructureId: feeStructureData.id
      }));
      
      // Expand fee details panel to show the loaded fee structure
      setFeeDetailsExpanded(true);
    } catch (error) {
      console.error('Error fetching fee structure:', error);
      setFeeStructure(null);
    } finally {
      setLoadingFeeStructure(false);
    }
  };

  // Fetch transport routes when transport mode changes
  const fetchTransportRoutes = async () => {
    try {
      setLoadingTransportRoutes(true);
      const routes = await feeService.getAllTransportRoutes();
      setTransportRoutes(routes || []);
    } catch (error) {
      console.error('Error fetching transport routes:', error);
      setTransportRoutes([]);
    } finally {
      setLoadingTransportRoutes(false);
    }
  };

  // Handle grade change specifically to fetch fee structure
  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const grade = e.target.value;
    
    // Update the form data
    setFormData(prev => ({
      ...prev,
      grade
    }));
    
    if (errors.grade) {
      setErrors(prev => ({
        ...prev,
        grade: ''
      }));
    }
    
    // Fetch fee structure for the selected grade
    fetchFeeStructure(grade);
  };
  // Handle transport mode change specifically to fetch transport routes
  const handleTransportModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const transportMode = e.target.value;
    
    // Update the form data
    setFormData(prev => ({
      ...prev,
      transportMode,
      // Clear bus route number if transport mode is not School Bus
      busRouteNumber: transportMode === 'School Bus' ? prev.busRouteNumber : ''
    }));
    
    // If changing away from School Bus, remove transport fees
    if (transportMode !== 'School Bus' && feeStructure?.transportFee) {
      const updatedFeeStructure = {
        ...feeStructure,
        transportFee: 0,
        totalFees: (feeStructure.annualFees + feeStructure.buildingFees + feeStructure.labFees)
      };
      setFeeStructure(updatedFeeStructure);
    }
      if (transportMode === 'School Bus') {
      fetchTransportRoutes();
    }
  };
  
  // Handle bus route change to update fee structure with transport fees
  const handleBusRouteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busRouteId = e.target.value;
    
    // Update the form data
    setFormData(prev => ({
      ...prev,
      busRouteNumber: busRouteId
    }));
    
    if (feeStructure) {
      // Handle case when no route is selected (empty string)
      if (!busRouteId) {
        const updatedFeeStructure = {
          ...feeStructure,
          transportFee: 0,
          totalFees: (feeStructure.annualFees + feeStructure.buildingFees + feeStructure.labFees)
        };
        setFeeStructure(updatedFeeStructure);
        return;
      }
      
      // Find the selected route
      const selectedRoute = transportRoutes.find(route => route.id === parseInt(busRouteId));
      
      if (selectedRoute) {
        // Create updated fee structure with transport fees included
        const updatedFeeStructure = {
          ...feeStructure,
          transportFee: selectedRoute.feeAmount,
          totalFees: (feeStructure.annualFees + feeStructure.buildingFees + feeStructure.labFees + selectedRoute.feeAmount)
        };
        
        // Make sure the Fee Details section is expanded to show the transport fees
        setFeeDetailsExpanded(true);
        
        // Set the updated fee structure with transport fees
        setFeeStructure(updatedFeeStructure);
      }    }
  };

  // Reset form to current date when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        // When editing an existing student, populate form with their data
        setFormData(initialData);
        
        // If the student has a transport mode of School Bus, load the route details
        if (initialData.transportMode === 'School Bus' && initialData.busRouteNumber) {
          fetchTransportRoutes().then(() => {
            // After routes are loaded, update the fee structure with the transport fee
            setTimeout(() => {
              const routeId = initialData.busRouteNumber;
              const selectedRoute = transportRoutes.find(route => route.id === parseInt(routeId.toString()));
              
              if (selectedRoute && feeStructure) {
                const updatedFeeStructure = {
                  ...feeStructure,
                  transportFee: selectedRoute.feeAmount,
                  totalFees: (feeStructure.annualFees + feeStructure.buildingFees + feeStructure.labFees + selectedRoute.feeAmount)
                };
                setFeeStructure(updatedFeeStructure);
              }
            }, 500); // Small delay to ensure transportRoutes is populated
          });
        }
      } else {
        // When creating a new student, set default values
        setFormData(prev => ({
          ...prev,
          dateOfBirth: getDefaultDOB()
        }));
      }
      
      // Fetch transport routes when dialog opens
      fetchTransportRoutes();
    }
  }, [open, initialData]);  const handleChange = (field: keyof Student) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    
    // Enforce +91 prefix for parent phone
    if (field === 'parentPhone' && !value.startsWith('+91')) {
      value = '+91' + value.replace(/^\+91/g, '');
    }
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));    }
  };

  const validateForm = (): boolean => {
    const validationErrors = validateStudent(formData as Student);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
    return true;
  }

  const handleSubmit = () => {
    // Create a copy of formData for submission
    const submitData = {
      ...formData,
      // Ensure phoneNumber is set (required by backend)
      phoneNumber: formData.parentPhone || '',
    };
    
    // Validate date of birth is in the past
    const dob = new Date(submitData.dateOfBirth || '');
    const today = new Date();
    if (dob >= today) {
      setErrors(prev => ({
        ...prev,
        dateOfBirth: 'Date of birth must be in the past'
      }));
      return;
    }
    
    // Create a validation context that tells validateStudent whether we're
    // creating or updating a student
    const isEdit = !!initialData?.id;
    
    // Perform validation - with context about whether this is an edit operation
    const validationErrors = validateStudent(submitData as Student, { isEdit });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onSubmit(submitData as Student);
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Student' : 'Add New Student'}
      submitLabel={initialData ? 'Update' : 'Submit'}
      onSubmit={handleSubmit}
      maxWidth="md"
      loading={loading}
      disableSubmitButton={false}
    >
      <Box sx={{ width: '100%' }}>
        <Accordion expanded={expanded === 'panel1'} onChange={handleAccordionChange('panel1')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Basic Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={formData.studentId}
                  onChange={handleChange('studentId')}
                  error={!!errors.studentId}
                  helperText={errors.studentId || "Student ID cannot be changed after creation"}
                  required
                  disabled={!!initialData?.id}
                  InputProps={{
                    endAdornment: !initialData?.id && (
                      <InputAdornment position="end">
                        <Tooltip title="Enter a unique Student ID. This cannot be changed later.">
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.grade}>
                  <InputLabel>Grade</InputLabel>
                  <Select
                    value={formData.grade}
                    onChange={handleGradeChange as any}
                    label="Grade"
                    required
                  >
                    {grades.map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        Grade {grade}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.grade && <FormHelperText>{errors.grade}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={formData.section}
                    onChange={handleChange('section') as any}
                    label="Section"
                  >
                    {sections.map((section) => (
                      <MenuItem key={section} value={section}>
                        Section {section}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange('dateOfBirth')}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={handleChange('gender') as any}
                    label="Gender"
                    required
                  >
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    value={formData.bloodGroup}
                    onChange={handleChange('bloodGroup') as any}
                    label="Blood Group"
                  >
                    <MenuItem value="">Not Specified</MenuItem>
                    {bloodGroups.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="House Alloted"
                  value={formData.houseAlloted}
                  onChange={handleChange('houseAlloted')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange('address')}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Medical Conditions"
                  value={formData.medicalConditions}
                  onChange={handleChange('medicalConditions')}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel2'} onChange={handleAccordionChange('panel2')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Parent/Guardian Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parent/Guardian Name"
                  value={formData.parentName}
                  onChange={handleChange('parentName')}
                  error={!!errors.parentName}
                  helperText={errors.parentName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parent Phone"
                  value={formData.parentPhone}
                  onChange={handleChange('parentPhone')}
                  error={!!errors.parentPhone}
                  helperText={errors.parentPhone || "Must start with +91 followed by 10 digits"}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Number"
                  value={formData.emergencyContact}
                  onChange={handleChange('emergencyContact')}
                  error={!!errors.emergencyContact}
                  helperText={errors.emergencyContact}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="WhatsApp Number"
                  value={formData.whatsappNumber}
                  onChange={handleChange('whatsappNumber')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parent/Guardian Email"
                  type="email"
                  value={formData.parentEmail}
                  onChange={handleChange('parentEmail')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guardian Occupation"
                  value={formData.guardianOccupation}
                  onChange={handleChange('guardianOccupation')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guardian Annual Income"
                  value={formData.guardianAnnualIncome}
                  onChange={handleChange('guardianAnnualIncome')}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guardian Office Address"
                  value={formData.guardianOfficeAddress}
                  onChange={handleChange('guardianOfficeAddress')}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel3'} onChange={handleAccordionChange('panel3')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Identification & Records</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Aadhar Number"
                  value={formData.aadharNumber}
                  onChange={handleChange('aadharNumber')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="UDISE Number"
                  value={formData.udiseNumber}
                  onChange={handleChange('udiseNumber')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Previous School"
                  value={formData.previousSchool}
                  onChange={handleChange('previousSchool')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subjects"
                  value={formData.subjects}
                  onChange={handleChange('subjects')}
                  multiline
                  rows={2}
                  placeholder="Comma separated list of subjects"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Admission Date"
                  type="date"
                  value={formData.admissionDate}
                  onChange={handleChange('admissionDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel4'} onChange={handleAccordionChange('panel4')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Transfer Certificate Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="TC Number"
                  value={formData.tcNumber}
                  onChange={handleChange('tcNumber')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="TC Date"
                  type="date"
                  value={formData.tcDate}
                  onChange={handleChange('tcDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="TC Reason"
                  value={formData.tcReason}
                  onChange={handleChange('tcReason')}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>        <Accordion 
          expanded={feeDetailsExpanded || expanded === 'panel5'} 
          onChange={handleAccordionChange('panel5')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Fee Details</Typography>
            {loadingFeeStructure && (
              <CircularProgress size={20} sx={{ ml: 2 }} />
            )}
          </AccordionSummary>
          <AccordionDetails>
            {loadingFeeStructure ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
              </Box>
            ) : feeStructure ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Fee Structure for Grade {feeStructure.classGrade}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Annual Fees:
                      </Typography>
                      <Typography variant="body1">
                        ₹{feeStructure.annualFees?.toFixed(2)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Building Fees:
                      </Typography>
                      <Typography variant="body1">
                        ₹{feeStructure.buildingFees?.toFixed(2)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Lab Fees:
                      </Typography>
                      <Typography variant="body1">
                        ₹{feeStructure.labFees?.toFixed(2)}
                      </Typography>
                        {/* Always show transport fee line, but only show amount when it exists */}
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Transport Fees:
                      </Typography>
                      <Typography variant="body1">
                        {feeStructure.transportFee ? `₹${feeStructure.transportFee.toFixed(2)}` : '₹0.00'}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        Total Fees:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        ₹{(feeStructure.totalFees || 
                           (feeStructure.annualFees + feeStructure.buildingFees + feeStructure.labFees + (feeStructure.transportFee || 0)))?.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  {feeStructure.paymentSchedules && feeStructure.paymentSchedules.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Payment Schedules
                        </Typography>
                        <Grid container spacing={1}>
                          {feeStructure.paymentSchedules
                            .filter(schedule => schedule.isEnabled)
                            .map((schedule, index) => (
                              <Grid item xs={12} key={index}>
                                <Box 
                                  sx={{ 
                                    p: 1, 
                                    bgcolor: formData.paymentScheduleId === schedule.id ? 'primary.light' : 'background.paper',
                                    border: '1px solid',
                                    borderColor: formData.paymentScheduleId === schedule.id ? 'primary.main' : 'divider',
                                    borderRadius: 1,
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      paymentScheduleId: schedule.id
                                    }));
                                  }}
                                >
                                  <Typography variant="body2" fontWeight="medium">
                                    {schedule.scheduleType} Payment
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    ₹{schedule.amount?.toFixed(2)} per payment
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                        </Grid>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Select a grade to view the fee structure details
              </Typography>
            )}
          </AccordionDetails>        </Accordion>

        <Accordion expanded={expanded === 'panel6'} onChange={handleAccordionChange('panel6')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Transportation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Transport Mode</InputLabel>
                  <Select
                    value={formData.transportMode}
                    onChange={handleTransportModeChange as any}
                    label="Transport Mode"
                  >
                    <MenuItem value="">Not Specified</MenuItem>
                    {transportModes.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Bus Route Number</InputLabel>                  <Select
                    value={formData.busRouteNumber || ''}
                    onChange={(e) => {
                      const busRouteId = e.target.value;
                      // Update form data
                      setFormData(prev => ({
                        ...prev,
                        busRouteNumber: busRouteId
                      }));
                      
                      // Update fee structure with transport fee
                      if (feeStructure) {
                        const selectedRoute = transportRoutes.find(route => route.id === parseInt(busRouteId.toString()));
                        if (selectedRoute) {
                          const updatedFeeStructure = {
                            ...feeStructure,
                            transportFee: selectedRoute.feeAmount,
                            totalFees: (feeStructure.annualFees + feeStructure.buildingFees + feeStructure.labFees + selectedRoute.feeAmount)
                          };
                          setFeeStructure(updatedFeeStructure);
                          setFeeDetailsExpanded(true);
                        }
                      }
                    }}
                    label="Bus Route Number"
                    disabled={formData.transportMode !== 'School Bus'}
                  >
                    {transportRoutes.map((route) => (
                      <MenuItem key={route.id} value={route.id}>
                        {route.routeName} - {route.routeDescription}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </BaseDialog>
  );
};

export default StudentDialog;