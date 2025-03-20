import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Fade as MuiFade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid, // Added Grid import
} from "@mui/material";
import { Fade } from "react-awesome-reveal";
import ApplicantList from "./ApplicantList";
import WorkIcon from "@mui/icons-material/Work";
import DescriptionIcon from "@mui/icons-material/Description";
import NumbersIcon from "@mui/icons-material/Numbers";
import CodeIcon from "@mui/icons-material/Code";

// Theme constants (matching other pages)
const theme = {
  primary: "#0277bd",   // Darker blue
  secondary: "#0288d1", // Lighter blue
  neutral: "#333",      // Darker text for contrast
  backgroundImage: "url(https://www.transparenttextures.com/patterns/geometry.png)",
};

const buttonStyles = {
  py: 2,
  px: 6, // Unified rectangular size for all buttons
  fontFamily: "Open Sans, sans-serif",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
  transition: "all 0.3s ease",
  width: "200px", // Fixed width for consistent rectangular shape
};

const RecruiterDashboard = () => {
  const [selectedJob, setSelectedJob] = useState("");
  const [jobText, setJobText] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [activeTab, setActiveTab] = useState("JobSetup");
  const navigate = useNavigate();

  // Expanded job options (more technical roles)
  const jobOptions = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer",
    "Machine Learning Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Cybersecurity Analyst",
    "Cloud Architect",
    "AI Research Scientist",
    "Blockchain Developer",
    "QA Engineer",
    "System Administrator",
    "Mobile App Developer",
  ];

  // Expanded question options
  const questionOptions = [5, 10, 15, 20, 25, 30, 35, 40];

  // Fetch CSRF token
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/recruiter/csrf-token/", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch CSRF token");
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async () => {
    if (!selectedJob || !jobText || !questionCount || !uniqueCode) {
      setAlertMessage("Please fill all fields.");
      return;
    }
    setAlertMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/recruiter/job-details/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          job_name: selectedJob,
          job_description: jobText,
          num_questions: questionCount,
          job_code: uniqueCode,
        }),
      });

      if (response.ok) {
        alert("Job details saved successfully!");
        setSelectedJob("");
        setJobText("");
        setQuestionCount("");
        setUniqueCode("");
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.message || "Failed to save job details.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setAlertMessage("Something went wrong. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://127.0.0.1:8000/recruiter/logout/", {
        method: "POST",
        headers: { "X-CSRFToken": csrfToken },
        credentials: "include",
      });
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      setAlertMessage("Failed to log out. Please try again.");
    }
  };

  // Function to generate a random 6-character job code
  const handleGenerateCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setUniqueCode(code);
  };

  return (
    <Box
      sx={{
        backgroundImage: theme.backgroundImage,
        backgroundSize: "cover",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Sidebar with Floating Buttons */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          p: 2,
          zIndex: 10,
        }}
      >
        {/* FairHire Title in Top-Left */}
        <Fade direction="down">
          <Typography
            variant="h3"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              color: theme.primary,
              mb: 8,
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            FairHire
          </Typography>
        </Fade>

        {/* Floating Buttons - Middle Left */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Fade direction="left" delay={200}>
            <Button
              onClick={() => setActiveTab("JobSetup")}
              sx={{
                ...buttonStyles,
                backgroundColor: activeTab === "JobSetup" ? theme.secondary : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "JobSetup" ? "#fff" : theme.secondary,
                mb: 2,
                "&:hover": {
                  backgroundColor: activeTab === "JobSetup" ? theme.primary : "rgba(2, 119, 189, 0.2)",
                  transform: "translateX(8px) scale(1.05)",
                },
              }}
            >
              Job Setup
            </Button>
          </Fade>

          <Fade direction="left" delay={400}>
            <Button
              onClick={() => setActiveTab("InterviewResults")}
              sx={{
                ...buttonStyles,
                backgroundColor: activeTab === "InterviewResults" ? theme.secondary : "rgba(255, 255, 255, 0.9)",
                color: activeTab === "InterviewResults" ? "#fff" : theme.secondary,
                mb: 2,
                "&:hover": {
                  backgroundColor: activeTab === "InterviewResults" ? theme.primary : "rgba(2, 119, 189, 0.2)",
                  transform: "translateX(8px) scale(1.05)",
                },
              }}
            >
              Interview Results
            </Button>
          </Fade>

          {/* Logout Button - Below Interview Results */}
          <Fade direction="left" delay={600}>
            <Button
              onClick={handleLogout}
              sx={{
                ...buttonStyles,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "#d32f2f",
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.2)",
                  transform: "translateX(8px) scale(1.05)",
                },
              }}
            >
              Logout
            </Button>
          </Fade>
        </Box>
      </Box>

      {/* Main Content Area - Centered */}
      <Box
        sx={{
          flexGrow: 1,
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Fade>
          <Box sx={{ width: "100%", maxWidth: "600px" }}>
            {activeTab === "JobSetup" && (
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    color: theme.primary,
                    mb: 2,
                    textAlign: "center",
                    textShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  Job Setup
                </Typography>
                <Box
                  sx={{
                    mb: 4,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    p: 2,
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <WorkIcon sx={{ color: theme.secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Choose a job title"
                        secondary="Select the role candidates will apply for."
                        primaryTypographyProps={{ fontFamily: "Open Sans, sans-serif", fontWeight: 600, color: theme.neutral }}
                        secondaryTypographyProps={{ fontFamily: "Open Sans, sans-serif", color: theme.neutral }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon sx={{ color: theme.secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Provide a job description"
                        secondary="Detail what candidates will see during the interview."
                        primaryTypographyProps={{ fontFamily: "Open Sans, sans-serif", fontWeight: 600, color: theme.neutral }}
                        secondaryTypographyProps={{ fontFamily: "Open Sans, sans-serif", color: theme.neutral }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <NumbersIcon sx={{ color: theme.secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Set the number of questions"
                        secondary="Define the maximum questions for the interview."
                        primaryTypographyProps={{ fontFamily: "Open Sans, sans-serif", fontWeight: 600, color: theme.neutral }}
                        secondaryTypographyProps={{ fontFamily: "Open Sans, sans-serif", color: theme.neutral }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CodeIcon sx={{ color: theme.secondary }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Enter a unique job code"
                        secondary="Share this code with candidates for access."
                        primaryTypographyProps={{ fontFamily: "Open Sans, sans-serif", fontWeight: 600, color: theme.neutral }}
                        secondaryTypographyProps={{ fontFamily: "Open Sans, sans-serif", color: theme.neutral }}
                      />
                    </ListItem>
                  </List>
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: theme.neutral }}>Job Name</InputLabel>
                  <Select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    label="Job Name"
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "#e8f0fe",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.secondary },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.primary },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.primary },
                    }}
                  >
                    <MenuItem value="">Select a Job</MenuItem>
                    {jobOptions.map((job, index) => (
                      <MenuItem key={index} value={job}>{job}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Job Description"
                  multiline
                  rows={4}
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  variant="outlined"
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#e8f0fe",
                      "& fieldset": { borderColor: theme.secondary },
                      "&:hover fieldset": { borderColor: theme.primary },
                      "&.Mui-focused fieldset": { borderColor: theme.primary },
                    },
                    "& .MuiInputLabel-root": { color: theme.neutral },
                    "& .MuiInputLabel-root.Mui-focused": { color: theme.primary },
                  }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: theme.neutral }}>Number of Questions</InputLabel>
                  <Select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    label="Number of Questions"
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "#e8f0fe",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.secondary },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.primary },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.primary },
                    }}
                  >
                    <MenuItem value="">Select Number</MenuItem>
                    {questionOptions.map((num, index) => (
                      <MenuItem key={index} value={num}>{num}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Modified Job Code Section */}
                <Typography variant="body2" sx={{ mb: 1, color: theme.neutral }}>
                  Enter a unique job code or click "Generate" to create one.
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      label="Job Code"
                      value={uniqueCode}
                      onChange={(e) => setUniqueCode(e.target.value)}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "#e8f0fe",
                          "& fieldset": { borderColor: theme.secondary },
                          "&:hover fieldset": { borderColor: theme.primary },
                          "&.Mui-focused fieldset": { borderColor: theme.primary },
                        },
                        "& .MuiInputLabel-root": { color: theme.neutral },
                        "& .MuiInputLabel-root.Mui-focused": { color: theme.primary },
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      variant="contained"
                      onClick={handleGenerateCode}
                      sx={{
                        backgroundColor: theme.secondary,
                        color: "#fff",
                        padding: "10px 20px",
                        fontSize: "14px",
                        borderRadius: "8px",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: theme.primary,
                        },
                        width: "100%",
                      }}
                    >
                      Generate
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
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
                  >
                    Save
                  </Button>
                </Box>

                {alertMessage && (
                  <MuiFade in={!!alertMessage}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#d32f2f",
                        mt: 2,
                        textAlign: "center",
                        fontFamily: "Open Sans, sans-serif",
                        fontSize: "14px",
                      }}
                    >
                      {alertMessage}
                    </Typography>
                  </MuiFade>
                )}
              </Box>
            )}

            {activeTab === "InterviewResults" && (
              <Fade>
                <Box sx={{ width: "100%" }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 700,
                      color: theme.primary,
                      mb: 4,
                      textAlign: "center",
                    }}
                  >
                    Interview Results
                  </Typography>
                  <ApplicantList csrfToken={csrfToken} />
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default RecruiterDashboard;