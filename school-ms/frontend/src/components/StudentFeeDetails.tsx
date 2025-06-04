import React from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { StudentFeeDetails as StudentFeeDetailsType } from '../types/payment.types';

interface StudentFeeDetailsProps {
  feeDetails: StudentFeeDetailsType | null;
}

const StudentFeeDetails: React.FC<StudentFeeDetailsProps> = ({ feeDetails }) => {
  if (!feeDetails || !feeDetails.feeStructure) {
    return <Typography>No fee details available</Typography>;
  }

  const { feeStructure } = feeDetails;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Fee Structure Details
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Class Grade:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {feeStructure.classGrade}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Annual Fees:
                </Typography>
              </Grid>              <Grid item xs={6}>
                <Typography variant="body2">
                  ₹{feeStructure.annualFees?.toFixed(2)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Building Fees:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  ₹{feeStructure.buildingFees?.toFixed(2)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Lab Fees:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  ₹{feeStructure.labFees?.toFixed(2)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Total Fees:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  ₹{feeStructure.totalFees?.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Student Fee Assignment
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Student ID:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {feeDetails.studentId}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Student Fee ID:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {feeDetails.studentFeeId || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentFeeDetails;
