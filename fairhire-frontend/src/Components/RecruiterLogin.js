import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Fade as MuiFade,
} from "@mui/material";
import { Fade } from "react-awesome-reveal";

const theme = {
  primary: "#0277bd",
  secondary: "#0288d1",
  neutral: "#333",
  backgroundImage: "url(https://www.transparenttextures.com/patterns/geometry.png)",
};

const RecruiterLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/recruiter/csrf-token/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch((err) => console.error("CSRF fetch error:", err));
  }, []);

  const handleLogin = async () => {
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:8000/recruiter/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Login successful!");
        navigate("/recruiter-dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
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
        p: 4,
        position: "relative",
      }}
    >
      {/* FairHire Title in Top-Left */}
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

      {/* Centered Login UI */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "500px",
          zIndex: 10,
        }}
      >
        {/* Login Form */}
        <Fade cascade>
          <Box
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
              Recruiter Login
            </Typography>

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{
                mb: 4,
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

            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              sx={{
                backgroundColor: theme.secondary,
                color: "#fff",
                padding: "12px",
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
              Login
            </Button>

            {error && (
              <MuiFade in={!!error}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "red",
                    mt: 2,
                    textAlign: "center",
                    fontFamily: "Open Sans, sans-serif",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </Typography>
              </MuiFade>
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default RecruiterLogin;
