import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Typography, Box, Grid, Paper } from '@mui/material';
import { Fade } from 'react-awesome-reveal';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BalanceIcon from '@mui/icons-material/Balance';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// Theme constants
const theme = {
  primary: '#0277bd',
  secondary: '#0288d1',
  neutral: '#333',
  backgroundImage: 'url(https://www.transparenttextures.com/patterns/geometry.png)',
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{
      backgroundImage: theme.backgroundImage,
      backgroundSize: 'cover',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Main Content (fits within viewport) */}
      <Box sx={{
        height: '100vh', // Ensures Hero, Recruiter Login, and Features fit in viewport
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Hero Section */}
        <Box sx={{
          padding: { xs: '40px 0', md: '80px 0' },
          textAlign: 'center',
          flexShrink: 0, // Prevents shrinking
        }}>
          <Container maxWidth="lg">
            <Fade cascade>
              <Typography variant="h2" sx={{
                fontWeight: 700,
                color: theme.primary,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}>
                FairHire
              </Typography>
              <Typography variant="h5" sx={{ color: theme.neutral, mb: 4 }}>
                Precision Hiring with AI-Powered Insights
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/upload')}
                sx={{
                  backgroundColor: theme.primary,
                  color: '#fff',
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: theme.secondary },
                }}
              >
                Begin Your Journey
              </Button>
            </Fade>
          </Container>
        </Box>

        {/* Recruiter Login Button */}
        <Box sx={{ position: 'absolute', top: '20px', right: '20px' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/recruiter-login')}
            sx={{
              borderColor: theme.primary,
              color: theme.primary,
              borderRadius: '25px',
              '&:hover': { backgroundColor: 'rgba(2, 119, 189, 0.1)' },
            }}
          >
            Recruiter Login
          </Button>
        </Box>

        {/* Features Section */}
        <Container sx={{ my: { xs: 4, md: 6 }, flexGrow: 1 }}>
          <Fade>
            <Typography variant="h4" sx={{ textAlign: 'center', color: theme.primary, mb: 4 }}>
              Why Choose FairHire?
            </Typography>
          </Fade>
          <Grid container spacing={4}>
            {[
              { title: "AI-Powered Precision", description: "Leverage AI for accurate, unbiased assessments.", icon: <AutoFixHighIcon /> },
              { title: "Fairness First", description: "Minimize bias to ensure equal opportunities.", icon: <BalanceIcon /> },
              { title: "Adaptive Interviews", description: "Dynamic questions tailored to your skills.", icon: <QuestionAnswerIcon /> },
            ].map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Fade delay={index * 200}>
                  <Paper sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    borderLeft: `4px solid ${theme.secondary}`,
                    '&:hover': { transform: 'translateY(-5px)' },
                  }}>
                    <Box sx={{ color: theme.primary, mb: 1 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ color: theme.primary, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.neutral }}>
                      {feature.description}
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer & Contact Section (scrollable below viewport) */}
      <Box sx={{
        borderTop: `1px solid ${theme.secondary}`,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        py: 4,
        textAlign: 'center',
      }}>
        <Container>
          <Fade>
            <Typography variant="h4" sx={{ color: theme.primary, mb: 2 }}>
              Contact Us
            </Typography>
            <Typography variant="body1" sx={{ color: theme.neutral, mb: 2 }}>
              Have questions? We’re here to assist you.
            </Typography>
            <Typography variant="body2" sx={{ color: theme.neutral }}>
              Email: <strong>fairhire073@gmail.com</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: theme.neutral }}>
              Address: <strong>MITS, Varikoli, Ernakulam</strong>
            </Typography>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;