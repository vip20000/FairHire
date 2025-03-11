import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Typography, Box, Grid, Paper } from '@mui/material';
import { Fade } from 'react-awesome-reveal';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BalanceIcon from '@mui/icons-material/Balance';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// Theme constants with the original background image
const theme = {
  primary: '#0277bd',   // Darker blue
  secondary: '#0288d1', // Lighter blue
  neutral: '#333',      // Darker text for contrast
  backgroundImage: 'url(https://www.transparenttextures.com/patterns/geometry.png)', // Original background
};

const Home = () => {
  const navigate = useNavigate();

  const handleStart = () => navigate('/upload');
  const handleRecruiterLogin = () => navigate('/recruiter-login');

  return (
    <Box sx={{
      backgroundImage: theme.backgroundImage,
      backgroundSize: 'cover',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Hero Section */}
      <Box sx={{
        padding: { xs: '40px 0', md: '80px 0' }, // No overlay as in the original
        textAlign: 'center',
      }}>
        <Container maxWidth="lg">
          <Fade cascade>
            <Typography variant="h2" sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              color: theme.primary, // Updated color
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', // Softer shadow from updated version
            }}>
              FairHire
            </Typography>
            <Typography variant="h5" sx={{
              fontFamily: 'Open Sans, sans-serif',
              color: theme.neutral, // Updated color
              mb: 4,
              fontSize: { xs: '1.25rem', md: '1.75rem' },
            }}>
              Precision Hiring with AI-Powered Insights {/* Updated text */}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
              aria-label="Start Interview Process"
              sx={{
                backgroundColor: theme.primary, // Updated color
                color: '#fff',
                padding: { xs: '10px 20px', md: '12px 30px' },
                fontSize: { xs: '16px', md: '18px' },
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', // Softer shadow from updated version
                fontFamily: 'Open Sans, sans-serif',
                textTransform: 'none',
                '&:hover': { backgroundColor: theme.secondary, transform: 'translateY(-2px)', transition: 'all 0.3s' }, // Updated hover
              }}
            >
              Begin Your Journey {/* Updated text */}
            </Button>
          </Fade>
        </Container>
      </Box>

      {/* Recruiter Login Button */}
      <Box sx={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1 }}>
        <Button
          variant="outlined" // Updated to outlined as in the revised version
          onClick={handleRecruiterLogin}
          aria-label="Login as Recruiter"
          sx={{
            borderColor: theme.primary, // Updated color
            color: theme.primary, // Updated color
            borderRadius: '25px',
            padding: '8px 16px',
            fontFamily: 'Open Sans, sans-serif',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)', // Softer shadow
            textTransform: 'none',
            '&:hover': { backgroundColor: 'rgba(2, 119, 189, 0.1)', borderColor: theme.secondary, transform: 'translateY(-1px)', transition: 'all 0.3s' }, // Updated hover
            '&:focus': { outline: `2px solid ${theme.primary}` },
          }}
        >
          Recruiter Login {/* Updated text */}
        </Button>
      </Box>

      {/* Features Section */}
      <Container sx={{ my: { xs: 4, md: 8 } }}>
        <Fade>
          <Typography variant="h4" sx={{
            textAlign: 'center',
            color: theme.primary, // Updated color
            mb: 4,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600, // From updated version
          }}>
            Why Choose FairHire? {/* Updated text */}
          </Typography>
        </Fade>
        <Grid container spacing={4}>
          {[
            { title: "AI-Powered Precision", description: "Leverage cutting-edge AI for accurate and unbiased assessments.", icon: <AutoFixHighIcon /> }, // Updated text
            { title: "Fairness First", description: "Minimize human bias to ensure equal opportunities for all.", icon: <BalanceIcon /> }, // Updated text
            { title: "Adaptive Interviews", description: "Dynamic questions tailored to your skills and experience.", icon: <QuestionAnswerIcon /> }, // Updated text
          ].map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Fade delay={index * 200}>
                <Paper sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)', // Softer shadow from updated version
                  borderLeft: `4px solid ${theme.secondary}`,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)' }, // Updated hover
                  minHeight: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                  <Box sx={{ color: theme.primary, mb: 1 }}>{feature.icon}</Box> {/* Updated color */}
                  <Typography variant="h6" sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: theme.primary, // Updated color
                    mb: 1,
                  }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{
                    fontFamily: 'Open Sans, sans-serif',
                    color: theme.neutral, // Updated color
                  }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact Section */}
      <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', py: 6 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Fade>
            <Typography variant="h4" sx={{
              color: theme.primary, // Updated color
              mb: 2,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600, // From updated version
            }}>
              Contact Us {/* Updated text */}
            </Typography>
            <Typography variant="body1" sx={{
              color: theme.neutral, // Updated color
              mb: 3,
              fontFamily: 'Open Sans, sans-serif',
            }}>
              Have questions or want to explore FairHire? We’re here to assist you. {/* Updated text */}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.neutral, mb: 1 }}>
              Email: <strong>fairhire073@gmail.com</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: theme.neutral }}>
              Address: <strong>MITS, Varikoli, Ernakulam</strong>
            </Typography>
          </Fade>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{
        borderTop: `1px solid ${theme.secondary}`,
        py: 2,
        mt: 'auto',
        textAlign: 'center',
        backgroundColor: 'transparent',
      }}>
        <Container>
          <Typography variant="body2" sx={{
            color: theme.neutral, // Updated color
            fontFamily: 'Open Sans, sans-serif',
          }}>
            © {new Date().getFullYear()} FairHire. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;