import React from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';

const ExamsLandingPage = () => (
  <Box p={3}>
    <Typography variant="h4" gutterBottom>Exams Module</Typography>
    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
      Welcome to the Exams module. Please select an option below:
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <Card elevation={3}>
          <CardActionArea component={Link} to="/examinations/configuration">
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Exam Configuration
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Set up and manage exam details, schedules, and patterns.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card elevation={3}>
          <CardActionArea component={Link} to="/exams/marks/entry">
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Marks Entry
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Enter and update student marks for examinations.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card elevation={3}>
          <CardActionArea component={Link} to="/exams/report-cards">
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Report Cards
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Generate and print report cards for a class across selected exams.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default ExamsLandingPage;
