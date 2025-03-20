import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Fade } from "react-awesome-reveal";
import QuizIcon from "@mui/icons-material/Quiz"; // Icon for technical questions
import VideocamIcon from "@mui/icons-material/Videocam"; // Icon for proctoring
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone"; // Icon for no mobile devices
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline"; // Icon for no other persons
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Icon for not leaving
import TabIcon from "@mui/icons-material/Tab"; // Icon for no tab switching
import FlagIcon from "@mui/icons-material/Flag"; // Icon for flagging violations

const theme = {
  primary: "#0277bd",
  secondary: "#0288d1",
  neutral: "#333",
  backgroundImage: "url(https://www.transparenttextures.com/patterns/geometry.png)",
};

const JobDetailsPage = () => {
  const [jobCode, setJobCode] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // State for dialog popup
  const navigate = useNavigate();
  const location = useLocation();
  const candidateId = location.state?.candidateId;

  const fetchJobDetails = async () => {
    setError(null);

    if (!jobCode.trim()) {
      setError("Please enter a job code.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/recruiter/job-details/?job_code=${jobCode}`);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Error fetching job details.");
        setJobDetails(null);
        return;
      }

      const data = await response.json();

      if (data.status === "success") {
        setJobDetails(data.data);
      } else {
        setError(data.message);
        setJobDetails(null);
      }
    } catch (error) {
      setError("Failed to fetch job details. Please try again.");
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleStartInterview = () => {
    navigate("/start-interview", { state: { candidateId, jobCode, jobDetails } });
  };

  // Function to navigate to the homepage
  const handleLogoClick = () => {
    navigate("/"); // Assuming "/" is the route for your homepage
  };

  return (
    <Box
      sx={{
        backgroundImage: theme.backgroundImage,
        backgroundSize: "cover",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        position: "relative",
      }}
    >
      {/* Top-Left Branding */}
      <Typography
        variant="h3"
        onClick={handleLogoClick} // Add click handler
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          fontFamily: "Poppins, sans-serif",
          fontWeight: 700,
          color: theme.primary,
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          cursor: "pointer", // Indicate it's clickable
          "&:hover": {
            color: theme.secondary, // Slight hover effect
            transition: "color 0.3s ease", // Smooth transition
          },
        }}
      >
        FairHire
      </Typography>

      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Fade cascade>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: "16px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(5px)",
              borderLeft: `4px solid ${theme.secondary}`,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                color: theme.primary,
                mb: 4,
                textAlign: "center",
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              Job Details
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  color: theme.primary,
                  mb: 2,
                }}
              >
                Enter Job Code
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Open Sans, sans-serif",
                  color: theme.neutral,
                  mb: 2,
                }}
              >
                Enter the job code shared with you by the recruiter:
              </Typography>
              <TextField
                label="Job Code"
                variant="outlined"
                fullWidth
                value={jobCode}
                onChange={(e) => setJobCode(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: theme.secondary,
                  color: "#fff",
                  padding: "12px 40px",
                  fontSize: "18px",
                  fontFamily: "Open Sans, sans-serif",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: theme.primary,
                    transform: "scale(1.02)",
                    transition: "all 0.3s",
                  },
                }}
                onClick={fetchJobDetails}
              >
                Fetch Job Details
              </Button>
            </Box>

            {error && (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#c62828",
                  mb: 3,
                  textAlign: "center",
                }}
              >
                {error}
              </Typography>
            )}

            {jobDetails && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    color: theme.secondary,
                    mb: 2,
                    textAlign: "center",
                  }}
                >
                  {jobDetails.job_name}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "bold",
                    color: theme.neutral,
                    mb: 1,
                  }}
                >
                  Job Description:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "Open Sans, sans-serif",
                    color: theme.neutral,
                    mb: 3,
                  }}
                >
                  {jobDetails.job_description}
                </Typography>

                <Box sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: theme.secondary,
                      color: "#fff",
                      padding: "12px 30px",
                      fontSize: "18px",
                      fontFamily: "Open Sans, sans-serif",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: theme.primary,
                        transform: "scale(1.02)",
                        transition: "all 0.3s",
                      },
                    }}
                    onClick={handleOpenDialog}
                  >
                    Start Interview
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Fade>
      </Container>

      {/* Popup Dialog for Interview Instructions */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
            color: theme.primary,
            textAlign: "center",
          }}
        >
          Interview Instructions
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <QuizIcon sx={{ color: theme.secondary }} />
              </ListItemIcon>
              <ListItemText
                primary="You will be asked technical questions based on your skills and the job role."
                primaryTypographyProps={{
                  fontFamily: "Open Sans, sans-serif",
                  color: theme.neutral,
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <VideocamIcon sx={{ color: theme.secondary }} />
              </ListItemIcon>
              <ListItemText
                primary="Camera proctoring will be enabled throughout the interview to ensure integrity."
                primaryTypographyProps={{
                  fontFamily: "Open Sans, sans-serif",
                  color: theme.neutral,
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PhoneIphoneIcon sx={{ color: theme.secondary }} />
              </ListItemIcon>
              <ListItemText
                primary="No mobile devices, digital devices, or smartwatches are allowed during the interview."
                primaryTypographyProps={{
                  fontFamily: "Open Sans, sans-serif",
                  color: theme.neutral,
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PeopleOutlineIcon sx={{ color: theme.secondary }} />
              </ListItemIcon>
              <ListItemText
                primary="No other persons besides the candidate are allowed in the room."
                primaryTypographyProps={{
                  fontFamily: "Open Sans, sans-serif",
                  color: theme.neutral,
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ExitToAppIcon sx={{ color: theme.secondary }} />
              </ListItemIcon>
              <ListItemText
                primary="Do not leave your seat until the interview is complete."
                primaryTypographyProps={{
                  fontFamily: "Open Sans, sans-serif",
                  color: theme.neutral,
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TabIcon sx={{ color: theme.secondary }} />
              </ListItemIcon>
              <ListItemText
                primary="Tab switching or navigating away from the interview window is not permitted."
                primaryTypographyProps={{
                  fontFamily: "Open Sans, sans-serif",
                  color: theme.neutral,
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FlagIcon sx={{ color: theme.secondary }} />
              </ListItemIcon>
              <ListItemText
                primary="Any detected violations will be flagged and reported to the recruiter."
                primaryTypographyProps={{
                  fontFamily: "Open Sans, sans-serif",
                  color: theme.neutral,
                }}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: theme.secondary,
              color: "#fff",
              padding: "10px 30px",
              fontSize: "16px",
              fontFamily: "Open Sans, sans-serif",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              textTransform: "none",
              "&:hover": {
                backgroundColor: theme.primary,
                transform: "scale(1.02)",
                transition: "all 0.3s",
              },
            }}
            onClick={handleStartInterview}
          >
            Start Interview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobDetailsPage;