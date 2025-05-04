import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  useTheme,
  Paper,
  Stack,
  Divider,
  Link,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  Rating
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const features = [
  {
    icon: <DashboardIcon fontSize="large" color="primary" />,
    title: 'Interactive Dashboard',
    description: 'Get a comprehensive view of school performance with our intuitive dashboard'
  },
  {
    icon: <PeopleIcon fontSize="large" color="primary" />,
    title: 'Student Management',
    description: 'Manage student profiles, attendance, performance and more in one place'
  },
  {
    icon: <SchoolIcon fontSize="large" color="primary" />,
    title: 'Teacher Management',
    description: 'Streamline teacher scheduling, performance tracking, and professional development'
  },
  {
    icon: <MenuBookIcon fontSize="large" color="primary" />,
    title: 'Course Management',
    description: 'Create and manage courses, curriculum planning and resource allocation'
  },
  {
    icon: <AssessmentIcon fontSize="large" color="primary" />,
    title: 'Detailed Reports',
    description: 'Generate insightful reports on attendance, grades, and overall performance'
  },
  {
    icon: <PersonAddIcon fontSize="large" color="primary" />,
    title: 'Admissions',
    description: 'Simplify the admission process with online applications and tracking'
  }
];

// Add testimonials data
const testimonials = [
  {
    name: "Sarah Johnson",
    position: "Principal, Westfield Academy",
    comment: "Implementing this School Management System has transformed our administrative processes. We've reduced paperwork by 80% and our staff can focus more on what matters - the students.",
    rating: 5
  },
  {
    name: "Michael Chen",
    position: "IT Director, Riverdale High School",
    comment: "After evaluating several systems, this platform stood out for its intuitive interface and comprehensive feature set. The support team has been exceptional throughout our onboarding.",
    rating: 5
  },
  {
    name: "Dr. Amelia Patel",
    position: "Superintendent, Springfield District",
    comment: "The analytics and reporting capabilities have given us unprecedented insights into student performance trends. It's helping us make data-driven decisions to improve educational outcomes.",
    rating: 4.5
  }
];

// Add FAQ items
const faqs = [
  {
    question: "How easy is it to migrate from our current system?",
    answer: "Our team provides comprehensive migration support. We have experience integrating with most popular school management systems and can transfer your data seamlessly with minimal disruption to your operations."
  },
  {
    question: "Is the platform secure for handling student data?",
    answer: "Absolutely. We prioritize data security with end-to-end encryption, regular security audits, and full compliance with educational data protection regulations including FERPA and GDPR."
  },
  {
    question: "Can we customize the platform for our school's specific needs?",
    answer: "Yes, our system is highly customizable. You can configure user roles, permission sets, and workflows to match your institution's processes. For more specialized needs, our development team can build custom modules."
  },
  {
    question: "What kind of training and support do you provide?",
    answer: "We offer comprehensive onboarding training for administrators, teachers, and staff. Our support team is available via email, chat, and phone. We also provide an extensive knowledge base with tutorials and best practices."
  },
  {
    question: "Do you offer mobile access for parents and students?",
    answer: "Yes, our platform is fully mobile-responsive and we offer dedicated mobile apps for both iOS and Android. Parents and students can access grades, attendance, announcements, and more on the go."
  }
];

// Add statistics data
const statistics = [
  { 
    icon: <AutoGraphIcon fontSize="large" color="primary" />,
    value: "95%", 
    label: "Administrative Efficiency Increase" 
  },
  { 
    icon: <PeopleIcon fontSize="large" color="primary" />,
    value: "250+", 
    label: "Schools Onboarded" 
  },
  { 
    icon: <EventNoteIcon fontSize="large" color="primary" />,
    value: "68%", 
    label: "Reduction in Paperwork" 
  },
  { 
    icon: <EmojiEventsIcon fontSize="large" color="primary" />,
    value: "4.8/5", 
    label: "Customer Satisfaction" 
  }
];

const Landing: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          pt: 8,
          pb: 12,
        }}
        elevation={0}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item md={7} xs={12}>
              <Typography variant="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Modern School Management System
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                Streamline educational administration with our comprehensive, user-friendly platform designed for modern schools.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  variant="contained" 
                  size="large" 
                  color="secondary"
                  sx={{ px: 4, py: 1.5 }}
                >
                  Sign In
                </Button>
                <Button 
                  component={RouterLink} 
                  to="/register" 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Register
                </Button>
              </Stack>
            </Grid>
            <Grid item md={5} xs={12} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="/school-illustration.svg"
                alt="School Management"
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, fontWeight: 700 }}>
          Transforming Education Administration
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {statistics.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, fontWeight: 700 }}>
          Features that Transform Education Management
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[10]
                  }
                }}
                elevation={2}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, fontWeight: 700 }}>
            Trusted by Educational Leaders
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    pt: 6,
                    pb: 3,
                    px: 3
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: 'calc(50% - 25px)',
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme.palette.primary.main,
                      color: 'white'
                    }}
                  >
                    <FormatQuoteIcon />
                  </Box>
                  
                  <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                      "{testimonial.comment}"
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="h6" component="div" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {testimonial.position}
                      </Typography>
                      <Rating value={testimonial.rating} precision={0.5} readOnly sx={{ mt: 1 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, fontWeight: 700 }}>
          Frequently Asked Questions
        </Typography>
        
        <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          {faqs.map((faq, index) => (
            <Accordion 
              key={index}
              expanded={expandedFaq === `panel${index}`}
              onChange={handleFaqChange(`panel${index}`)}
              disableGutters
              elevation={0}
              sx={{
                border: 0,
                '&:not(:last-child)': {
                  borderBottom: 1,
                  borderColor: 'divider'
                },
                '&:before': {
                  display: 'none',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
                sx={{ py: 2 }}
              >
                <Typography variant="h6" fontWeight="medium">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Container>

      {/* Call to Action */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <Paper 
            elevation={4}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))'
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Ready to Transform Your School's Administration?
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '80%', mx: 'auto' }}>
              Join thousands of educational institutions that have streamlined their operations with our comprehensive School Management System.
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 5, py: 1.5 }}
            >
              Get Started Today
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          bgcolor: 'background.paper',
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                School MS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Simplifying education management for a better learning experience.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  &copy; {new Date().getFullYear()} School Management System
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Features
              </Typography>
              <Link component={RouterLink} to="/login" color="text.secondary" display="block" sx={{ mb: 1 }}>Dashboard</Link>
              <Link component={RouterLink} to="/login" color="text.secondary" display="block" sx={{ mb: 1 }}>Student Management</Link>
              <Link component={RouterLink} to="/login" color="text.secondary" display="block" sx={{ mb: 1 }}>Teacher Management</Link>
              <Link component={RouterLink} to="/login" color="text.secondary" display="block">Reports</Link>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Resources
              </Typography>
              <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>Documentation</Link>
              <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>Support</Link>
              <Link href="#" color="text.secondary" display="block">Blog</Link>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Company
              </Typography>
              <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>About Us</Link>
              <Link href="#" color="text.secondary" display="block" sx={{ mb: 1 }}>Contact</Link>
              <Link href="#" color="text.secondary" display="block">Privacy Policy</Link>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;