import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  InputAdornment,
  Tooltip,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Collapse,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  School as SchoolIcon,
  Article as ArticleIcon
} from '@mui/icons-material';

interface PaymentFiltersProps {
  selectedClass: string;
  selectedSection: string;
  filterStudentName: string;
  availableClasses: string[];
  availableSections: string[];
  startDate: string;
  endDate: string;
  paymentStatus: string;
  paymentMethod: string;
  minAmount: string;
  maxAmount: string;
  activeFilters: string[];
  onClassChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSectionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStudentNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPaymentStatusChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPaymentMethodChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMinAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFilter: (filterType: string) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  onSwitchToStudentView: () => void;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  selectedClass,
  selectedSection,
  filterStudentName,
  availableClasses,
  availableSections,
  startDate,
  endDate,
  paymentStatus,
  paymentMethod,
  minAmount,
  maxAmount,
  activeFilters,
  onClassChange,
  onSectionChange,
  onStudentNameChange,
  onStartDateChange,
  onEndDateChange,
  onPaymentStatusChange,
  onPaymentMethodChange,
  onMinAmountChange,
  onMaxAmountChange,
  onClearFilter,
  onResetFilters,
  onApplyFilters,
  onSwitchToStudentView
}) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Badge 
            badgeContent={activeFilters.length} 
            color="primary"
            overlap="circular"
            sx={{ mr: 1 }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
              sx={{ mr: 1 }}
            >
              {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Badge>
          
          <Button 
            variant="outlined"
            color="secondary"
            onClick={onResetFilters}
            disabled={activeFilters.length === 0}
            startIcon={<RefreshIcon />}
          >
            Reset
          </Button>
        </Box>

        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onSwitchToStudentView}
        >
          Back to Student Search
        </Button>
      </Box>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {activeFilters.map(filter => {
              const [type, value] = filter.split(':');
              const label = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${value}`;
              return (
                <Chip
                  key={filter}
                  label={label}
                  onDelete={() => onClearFilter(type)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Collapsible filter panel */}
      <Collapse in={filtersExpanded}>
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} /> Payment Filters
            </Typography>
            
            <Grid container spacing={2}>
              {/* Student filters */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1, fontSize: '1rem' }} /> Student Information
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Class/Grade"
                  value={selectedClass}
                  onChange={onClassChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><ClassIcon color="action" fontSize="small" /></InputAdornment>
                  }}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {availableClasses.map(classGrade => (
                    <MenuItem key={classGrade} value={classGrade}>
                      {classGrade}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Section"
                  value={selectedSection}
                  onChange={onSectionChange}
                  variant="outlined"
                  size="small"
                  disabled={!selectedClass}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SchoolIcon color="action" fontSize="small" /></InputAdornment>
                  }}
                >
                  <MenuItem value="">All Sections</MenuItem>
                  {availableSections.map(section => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={filterStudentName}
                  onChange={onStudentNameChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon color="action" fontSize="small" /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={onApplyFilters} 
                          edge="end"
                          size="small"
                        >
                          <SearchIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onApplyFilters();
                    }
                  }}
                />
              </Grid>

              {/* Payment date filters */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateRangeIcon sx={{ mr: 1, fontSize: '1rem' }} /> Payment Date Range
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="From Date"
                  type="date"
                  value={startDate}
                  onChange={onStartDateChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="To Date"
                  type="date"
                  value={endDate}
                  onChange={onEndDateChange}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Payment details filters */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArticleIcon sx={{ mr: 1, fontSize: '1rem' }} /> Payment Details
                </Typography>
                <Divider sx={{ mb: 1 }} />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Payment Status"
                  value={paymentStatus}
                  onChange={onPaymentStatusChange}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="REFUNDED">Refunded</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={onPaymentMethodChange}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="">All Methods</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                  <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  <MenuItem value="CHEQUE">Cheque</MenuItem>
                  <MenuItem value="ONLINE">Online</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item container xs={12} sm={6} md={4} spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Amount"
                    type="number"
                    value={minAmount}
                    onChange={onMinAmountChange}
                    variant="outlined"
                    size="small"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Amount"
                    type="number"
                    value={maxAmount}
                    onChange={onMaxAmountChange}
                    variant="outlined"
                    size="small"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onApplyFilters}
                startIcon={<SearchIcon />}
              >
                Apply Filters
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
};

export default PaymentFilters;
