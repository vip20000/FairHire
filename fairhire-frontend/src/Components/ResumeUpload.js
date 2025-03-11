import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { Fade } from "react-awesome-reveal";
import UploadIcon from "@mui/icons-material/Upload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"; // AI-inspired icon
import { keyframes } from "@mui/system"; // For animations
import axios from "axios";

// Animation for the AI processing effect
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const theme = {
  primary: "#0277bd",
  secondary: "#0288d1",
  neutral: "#333",
  backgroundImage: "url(https://www.transparenttextures.com/patterns/geometry.png)",
};

const ResumeUpload = () => {
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const processFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
      setResume(null);
      setSnackbarOpen(true);
      return;
    }
    setResume(file);
    setError("");
    setMessage("");
    setCandidateDetails(null);
  };

  const handleUpload = async () => {
    if (!resume) {
      setError("Please select a resume file.");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/resume/upload_resume/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.status === "success") {
        setMessage(response.data.message);
        setCandidateDetails(response.data.candidate_details);
        setError("");
        setSnackbarOpen(true);
      } else {
        setError(response.data.message);
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError("Unable to upload the resume. Please try again later.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!candidateDetails) return;

    try {
      const response = await axios.get("http://127.0.0.1:8000/resume/candidate_skills/", {
        params: { candidate_id: candidateDetails.id },
      });

      if (response.data.status === "success") {
        navigate("/job-details", {
          state: { candidateId: candidateDetails.id, skills: response.data.skills },
        });
      } else {
        setError(response.data.message);
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError("Error fetching candidate skills.");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

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
      <Typography
        variant="h3"
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          fontFamily: "Poppins, sans-serif",
          fontWeight: 700,
          color: theme.primary,
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        FairHire
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "700px", zIndex: 10 }}>
        <Fade cascade>
          <Paper
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: "16px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(5px)",
              borderLeft: `4px solid ${theme.secondary}`,
              width: "100%",
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
              Resume Upload
            </Typography>

            <List sx={{ mb: 4 }}>
              {[
                "Upload your resume (PDF, DOCX, or TXT) or drag and drop it here.",
                "Our AI will analyze and extract your details accurately.",
                "Submit to proceed to the next step.",
              ].map((step, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon sx={{ color: theme.secondary }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={step}
                    primaryTypographyProps={{ fontFamily: "Open Sans, sans-serif", fontSize: "18px", color: theme.neutral }}
                  />
                </ListItem>
              ))}
            </List>

            <Box
              sx={{
                textAlign: "center",
                mb: 4,
                border: `2px dashed ${dragOver ? theme.primary : theme.secondary}`,
                borderRadius: "12px",
                p: 3,
                backgroundColor: dragOver ? "rgba(2, 119, 189, 0.1)" : "rgba(255, 255, 255, 0.5)",
                transition: "all 0.3s ease",
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                style={{ display: "none" }}
                id="resume-upload"
              />
              <label htmlFor="resume-upload">
                <Button
                  variant="outlined"
                  component="span"
                  sx={{
                    borderColor: theme.secondary,
                    color: theme.secondary,
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontFamily: "Open Sans, sans-serif",
                    borderRadius: "8px",
                    textTransform: "none",
                    transition: "all 0.3s",
                    "&:hover": { borderColor: theme.primary, color: theme.primary, backgroundColor: "rgba(2, 119, 189, 0.1)" },
                  }}
                >
                  Choose Resume
                  <UploadIcon sx={{ ml: 1.5, fontSize: "24px" }} />
                </Button>
              </label>
              <Typography variant="body1" sx={{ mt: 2, color: theme.neutral, fontFamily: "Open Sans, sans-serif", fontSize: "16px" }}>
                {resume ? `Selected File: ${resume.name}` : "Or drag and drop here"}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={loading}
                sx={{
                  backgroundColor: theme.secondary,
                  color: "#fff",
                  padding: "12px 40px",
                  fontSize: "18px",
                  fontFamily: "Open Sans, sans-serif",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  textTransform: "none",
                  "&:hover": { backgroundColor: theme.primary, transform: "scale(1.02)", transition: "all 0.3s" },
                  "&:disabled": { backgroundColor: "#94a3b8" },
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AutoFixHighIcon sx={{ fontSize: "24px", mr: 1, animation: `${rotate} 2s linear infinite` }} />
                    <Typography sx={{ color: "#fff", animation: `${pulse} 1.5s infinite` }}>
                      AI Processing...
                    </Typography>
                  </Box>
                ) : (
                  "Submit Resume"
                )}
              </Button>
            </Box>

            {candidateDetails && (
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.primary, mb: 2, fontFamily: "Poppins, sans-serif", fontSize: "22px", textAlign: "center" }}
                >
                  Profile Summary
                </Typography>
                <Box sx={{ backgroundColor: "#f8fafc", p: 2, borderRadius: "8px", mb: 3, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontSize: "18px", color: theme.neutral }}>Name:</Typography>
                    <Typography sx={{ fontSize: "18px", color: theme.secondary }}>{candidateDetails.name}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontSize: "18px", color: theme.neutral }}>Email:</Typography>
                    <Typography sx={{ fontSize: "18px", color: theme.secondary }}>{candidateDetails.email}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "18px", color: theme.neutral }}>Phone:</Typography>
                    <Typography sx={{ fontSize: "18px", color: theme.secondary }}>{candidateDetails.phone}</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: theme.secondary,
                      color: "#fff",
                      padding: "10px 30px",
                      fontSize: "18px",
                      fontFamily: "Open Sans, sans-serif",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                      textTransform: "none",
                      "&:hover": { backgroundColor: theme.primary, transform: "scale(1.02)", transition: "all 0.3s" },
                    }}
                    onClick={handleNext}
                  >
                    Proceed to Job Selection
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Fade>
      </Box>

      {/* Snackbar moved outside the centered Box container */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }} // Positioned at bottom-left
        sx={{ zIndex: 1300 }} // Ensure it appears above other elements
      >
        {error ? (
          <Box
            sx={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              p: 2,
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              fontFamily: "Open Sans, sans-serif",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              m: 2, // Margin to keep it away from the edges
            }}
          >
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              background: "linear-gradient(45deg, #0288d1, #0277bd)",
              color: "#fff",
              p: 2,
              borderRadius: "12px",
              boxShadow: "0 6px 20px rgba(2, 119, 189, 0.5)",
              fontFamily: "Poppins, sans-serif",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              animation: `${pulse} 0.5s infinite`,
              border: "1px solid rgba(255, 255, 255, 0.3)",
              m: 2, // Margin to keep it away from the edges
            }}
          >
            <CheckCircleOutlineIcon sx={{ mr: 1, fontSize: "24px" }} />
            <Typography>
              <strong>Success!</strong> {message} - AI Extraction Complete!
            </Typography>
          </Box>
        )}
      </Snackbar>
    </Box>
  );
};

export default ResumeUpload;