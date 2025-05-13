import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, 
  Tabs, Tab, Button, FormControl, Select, MenuItem,
  TextField, InputLabel, IconButton, Tooltip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import paymentAnalyticsService, { 
  AnalyticsSummary, DateRange, ClassWiseCollection 
} from '../services/paymentAnalyticsService';
import DataTable from './DataTable';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const PaymentAnalytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (tabValue === 0) {
        data = await paymentAnalyticsService.getAnalyticsSummary(dateRange);
      } else if (tabValue === 1) {
        if (selectedClass > 0) {
          data = await paymentAnalyticsService.getClassAnalytics(selectedClass, dateRange);
        } else {
          data = await paymentAnalyticsService.getAnalyticsSummary(dateRange);
        }      }
      setAnalytics(data || null);
    } catch (err) {
      setError("Failed to load analytics data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [tabValue, dateRange, selectedClass]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDateChange = (type: 'start' | 'end', date: Date | null) => {
    if (date) {
      setDateRange(prev => ({
        ...prev,
        [type === 'start' ? 'startDate' : 'endDate']: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    setExportLoading(format);
    try {
      const blob = await paymentAnalyticsService.exportPaymentReport(format, dateRange);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(`Failed to export report as ${format.toUpperCase()}`);
      console.error(err);
    } finally {
      setExportLoading(null);
    }
  };

  if (loading && !analytics) return <Loading />;
  if (error && !analytics) return <ErrorMessage message={error} title="Analytics Error" />;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Class-wise Analysis" />
        </Tabs>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={new Date(dateRange.startDate)}
              onChange={(date) => handleDateChange('start', date)}
              slotProps={{ textField: { size: 'small', sx: { mr: 1 } } }}
            />
            <DatePicker
              label="End Date"
              value={new Date(dateRange.endDate)}
              onChange={(date) => handleDateChange('end', date)}
              slotProps={{ textField: { size: 'small', sx: { mr: 1 } } }}
            />
          </LocalizationProvider>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAnalytics}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          startIcon={exportLoading === 'csv' ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          onClick={() => handleExport('csv')}
          disabled={!!exportLoading}
          sx={{ mr: 1 }}
        >
          CSV
        </Button>
        <Button 
          variant="outlined" 
          startIcon={exportLoading === 'excel' ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          onClick={() => handleExport('excel')}
          disabled={!!exportLoading}
          sx={{ mr: 1 }}
        >
          Excel
        </Button>
        <Button 
          variant="outlined" 
          startIcon={exportLoading === 'pdf' ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          onClick={() => handleExport('pdf')}
          disabled={!!exportLoading}
        >
          PDF
        </Button>
      </Box>

      {analytics && (
        <>
          <TabPanel value={tabValue} index={0}>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Revenue</Typography>
                    <Typography variant="h4">${analytics.totalRevenue.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Outstanding</Typography>
                    <Typography variant="h4">${analytics.outstandingAmount.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Collection Rate</Typography>
                    <Typography variant="h4">{(analytics.overallCollectionRate * 100).toFixed(1)}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Late Fees</Typography>
                    <Typography variant="h4">${analytics.lateFeesCollected.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Monthly Trends Chart */}
            <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Monthly Collection Trends</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={analytics.monthlyTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="collected" name="Collected" stroke="#8884d8" />
                  <Line type="monotone" dataKey="due" name="Due Amount" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* Payment Method Distribution */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Payment Method Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.paymentMethodDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="method"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.paymentMethodDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Class-wise Collection Rate</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={analytics.classWiseCollection}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" label={{ value: 'Grade', position: 'insideBottom', offset: -5 }} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />                      <Bar dataKey="collectionRate" name="Collection Rate (%)" fill="#8884d8">
                        <RechartsTooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="class-select-label">Select Class</InputLabel>
                <Select
                  labelId="class-select-label"
                  id="class-select"
                  value={selectedClass}
                  label="Select Class"
                  onChange={(e) => setSelectedClass(Number(e.target.value))}
                >
                  <MenuItem value={0}>All Classes</MenuItem>
                  {analytics.classWiseCollection.map((cls) => (
                    <MenuItem key={cls.grade} value={cls.grade}>Grade {cls.grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Class-specific stats */}
            {selectedClass > 0 ? (
              <>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>Total Students</Typography>
                        <Typography variant="h4">
                          {analytics.classWiseCollection.find(c => c.grade === selectedClass)?.studentCount || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>Amount Collected</Typography>
                        <Typography variant="h4">
                          ${analytics.classWiseCollection.find(c => c.grade === selectedClass)?.collected.toLocaleString() || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>Amount Due</Typography>
                        <Typography variant="h4">
                          ${analytics.classWiseCollection.find(c => c.grade === selectedClass)?.due.toLocaleString() || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>Collection Rate</Typography>
                        <Typography variant="h4">
                          {((analytics.classWiseCollection.find(c => c.grade === selectedClass)?.collectionRate || 0) * 100).toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {/* More class-specific charts can be added here */}
              </>
            ) : (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Select a specific class for detailed analysis or view the overview of all classes below.
                </Typography>
              </Box>
            )}

            <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Class-wise Collection Analysis</Typography>
              <DataTable
                columns={[                  { id: 'grade', label: 'Grade', format: (value: number) => `Grade ${value}` },
                  { id: 'studentCount', label: 'Students' },
                  { id: 'collected', label: 'Collected', format: (value: number) => `$${value.toLocaleString()}` },
                  { id: 'due', label: 'Outstanding', format: (value: number) => `$${value.toLocaleString()}` },
                  { id: 'collectionRate', label: 'Collection %', format: (value: number) => `${(value * 100).toFixed(1)}%` },
                ]}
                data={analytics.classWiseCollection || []}
              />
            </Paper>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default PaymentAnalytics;