"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Typography,
  TextField,
  Box,
  Grid,
  Paper,
  Snackbar,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import MicIcon from "@mui/icons-material/Mic";
import SyncIcon from "@mui/icons-material/Sync";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import staticAvatar from "./avatar-static.jpg";
import speakingAvatar from "./avatar-speaking.gif";

// Updated theme with original background image
const theme = {
  primary: "#0277bd",
  secondary: "#42a5f5",
  accent: "#29b6f6",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#d32f2f",
  backgroundImage: "url(https://www.transparenttextures.com/patterns/geometry.png)",
  cardBg: "rgba(255, 255, 255, 0.9)",
  textPrimary: "#1e293b",
  textSecondary: "#5a6a82",
};

// Styled components (unchanged)
const GradientButton = styled(Button)(({ color = theme.primary, hoverColor = theme.accent }) => ({
  background: `linear-gradient(45deg, ${color} 0%, ${hoverColor} 100%)`,
  color: "white",
  fontWeight: 700,
  padding: "12px 30px",
  borderRadius: "12px",
  textTransform: "none",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: `linear-gradient(45deg, ${hoverColor} 0%, ${color} 100%)`,
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
    transform: "translateY(-2px)",
  },
  "&.Mui-disabled": {
    background: "#bdbdbd",
    color: "#ffffff80",
  },
}));

const GlassCard = styled(Paper)({
  background: theme.cardBg,
  backdropFilter: "blur(12px)",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 6px 25px rgba(0, 0, 0, 0.15)" },
});

const SpeakingIcon = styled(VolumeUpIcon)({
  fontSize: "50px",
  color: theme.primary,
  animation: "pulse 1.5s ease-in-out infinite",
  "@keyframes pulse": { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(1.1)" }, "100%": { transform: "scale(1)" } },
});

const ListeningIcon = styled(MicIcon)({
  fontSize: "50px",
  color: theme.success,
  animation: "pulse 1.5s ease-in-out infinite",
  "@keyframes pulse": { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(1.1)" }, "100%": { transform: "scale(1)" } },
});

const FrameSendingIcon = styled(SyncIcon)({
  fontSize: "24px",
  color: theme.warning,
  animation: "rotate 1.5s linear infinite",
  "@keyframes rotate": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
});

const StartInterview = () => {
  const location = useLocation();
  const { candidateId, jobCode } = location.state || {};

  const [skills, setSkills] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [displayedQuestion, setDisplayedQuestion] = useState("Please wait for the first question...");
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "warning" });
  const [isTtsActive, setIsTtsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const speechRef = useRef(new SpeechSynthesisUtterance());
  const recognitionRef = useRef(null);
  const proctoringIntervalRef = useRef(null);
  const timerRef = useRef(null);

  const playSmoothTone = () => {
    const tone = new Audio("https://www.soundjay.com/buttons/beep-07a.mp3");
    tone.play().catch((err) => console.warn("Audio playback failed:", err));
  };

  const getAnswerConfidence = (answer) => {
    const length = answer.trim().length;
    if (length < 50) return { label: "Weak", color: theme.error, value: 25, message: "Elaborate more for a stronger response." };
    if (length < 150) return { label: "Good", color: theme.warning, value: 50, message: "Solid answer—add more details!" };
    return { label: "Great", color: theme.success, value: 75, message: "Well-articulated response!" };
  };

  // Existing useEffect hooks and functions remain unchanged
  useEffect(() => {
    if (!candidateId) return;
    fetch(`http://127.0.0.1:8000/resume/candidate_skills/?candidate_id=${candidateId}`)
      .then((response) => response.json())
      .then((data) => setSkills(data.skills || []))
      .catch((error) => console.error("Failed to fetch skills:", error));
  }, [candidateId]);

  useEffect(() => {
    if (!jobCode) return;
    fetch(`http://127.0.0.1:8000/recruiter/job-summary/?job_code=${jobCode}`)
      .then((response) => response.json())
      .then((data) => data.status === "success" && setJobDetails(data.data))
      .catch((error) => console.error("Failed to fetch job details:", error));
  }, [jobCode]);

  useEffect(() => {
    if (!candidateId) return;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        setIsCameraReady(true);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      })
      .catch((err) => {
        console.error("Error accessing media:", err);
        setIsCameraReady(false);
      });
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [candidateId]);

  useEffect(() => {
    if (interviewStarted && isCameraReady && candidateId) {
      proctoringIntervalRef.current = setInterval(() => captureAndSendFrame(), 3000);
      return () => clearInterval(proctoringIntervalRef.current);
    }
  }, [interviewStarted, isCameraReady, candidateId]);

  useEffect(() => {
    if (interviewStarted && !isTtsActive && !isCallEnded) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? (sendAnswer(), 120) : prev - 1));
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [interviewStarted, isTtsActive, isCallEnded]);

  const captureAndSendFrame = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg");
      formData.append("candidate_id", candidateId);
      try {
        const response = await fetch("http://127.0.0.1:8000/proctoring/frame/", { method: "POST", body: formData });
        const data = await response.json();
        if (data.proctoring_flag) {
          const reasons = data.reason || {};
          const messages = [];
          if (reasons.multiple_persons_detected) messages.push("Multiple persons detected");
          if (reasons.no_person_detected) messages.push("No person detected");
          if (reasons.device_detected) messages.push("Device detected");
          if (messages.length) setNotification({ open: true, message: `Warning: ${messages.join(", ")}.`, severity: "warning" });
        }
      } catch (error) {
        console.error("Proctoring error:", error);
      }
    }, "image/jpeg");
  };

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  useEffect(() => {
    if (!candidateId || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join("");
      setCandidateAnswer(transcript);
    };
    recognitionRef.current.onstart = () => playSmoothTone();
    recognitionRef.current.onend = () => {
      if (isRecording && interviewStarted && !isCallEnded) {
        playSmoothTone();
        recognitionRef.current.start();
      }
    };
  }, [candidateId, interviewStarted, isCallEnded]);

  const startInterview = useCallback(() => {
    if (!jobDetails || skills.length === 0) return;
    const ws = new WebSocket("ws://localhost:8765");
    ws.onopen = () => {
      ws.send(JSON.stringify({ candidate_id: candidateId, job_name: jobDetails.job_name, num_questions: jobDetails.num_questions, skills }));
      setInterviewStarted(true);
      setSocket(ws);
    };
    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.status === "Interview Completed") handleEndCall();
      else if (response.question) {
        const cleanedQuestion = response.question.split("\n\n")[0];
        setDisplayedQuestion("");
        setTimeLeft(120);
        setIsTtsActive(true);
        setIsSpeaking(true);
        speechRef.current.text = cleanedQuestion;
        let index = 0;
        const interval = setInterval(() => {
          if (index < cleanedQuestion.length) setDisplayedQuestion(cleanedQuestion.slice(0, ++index));
          else clearInterval(interval);
        }, 50);
        speechRef.current.onend = () => {
          setIsSpeaking(false);
          setIsTtsActive(false);
          setDisplayedQuestion(cleanedQuestion);
          if (recognitionRef.current && !isRecording) {
            recognitionRef.current.start();
            setIsRecording(true);
          }
        };
        window.speechSynthesis.speak(speechRef.current);
      }
    };
    ws.onerror = () => setNotification({ open: true, message: "Connection error.", severity: "error" });
    ws.onclose = () => setInterviewStarted(false);
  }, [candidateId, jobDetails, skills]);

  const sendAnswer = () => {
    if (socket && candidateAnswer.trim()) {
      socket.send(JSON.stringify({ candidate_id: candidateId, answer: candidateAnswer }));
      setCandidateAnswer("");
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      setDisplayedQuestion("Waiting for the next question...");
      setTimeLeft(120);
    }
  };

  const handleEndCall = async () => {
    setIsCallEnded(true);
    stream?.getTracks().forEach((track) => track.stop());
    socket?.close();
    recognitionRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
    await fetch("http://127.0.0.1:8000/proctoring/end/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ candidate_id: candidateId }),
    });
  };

  if (isCallEnded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundImage: theme.backgroundImage }}>
        <GlassCard sx={{ p: 6, maxWidth: 600, textAlign: "center", animation: "fadeIn 0.5s ease-in" }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: theme.success, mb: 3 }} />
          <Typography variant="h4" sx={{ color: theme.primary, mb: 2, fontWeight: 700 }}>
            Interview Completed
          </Typography>
          <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 4 }}>
            Thank you for participating! Your responses are being reviewed.
          </Typography>
          <GradientButton color={theme.success} hoverColor="#66bb6a">
            Go to Home Page
          </GradientButton>
        </GlassCard>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundImage: theme.backgroundImage, position: "relative", p: 2 }}>
      <Box sx={{ position: "absolute", top: 20, left: 20 }}>
        <Typography variant="h3" sx={{ color: theme.primary, fontWeight: 900, letterSpacing: "-1px" }}>
          FairHire
        </Typography>
      </Box>

      <Grid container sx={{ minHeight: "100vh", pt: 10 }}>
        {/* Left Column (Camera) */}
        <Grid item xs={12} md={6} sx={{ p: { xs: 4, md: 6 } }}>
          <GlassCard sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.primary}20` }}>
              <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600 }}>
                Live Camera Feed
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, p: 3, position: "relative" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", borderRadius: "12px", border: interviewStarted ? `3px solid ${theme.error}` : "none" }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} width="640" height="480" />
              {interviewStarted && (
                <Box sx={{ position: "absolute", top: 15, right: 15, bgcolor: `${theme.error}80`, color: "white", borderRadius: "20px", px: 2, py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Recording</Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FrameSendingIcon />
                <Typography variant="body2" sx={{ color: theme.warning, fontWeight: 600 }}>AI Proctoring Active</Typography>
              </Box>
              <GradientButton onClick={handleEndCall} color={theme.error} hoverColor="#e53935">
                End Interview
              </GradientButton>
            </Box>
          </GlassCard>
        </Grid>

        {/* Right Column (Interview Content) */}
        <Grid item xs={12} md={6} sx={{ p: { xs: 4, md: 6 } }}>
          <GlassCard sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {!interviewStarted ? (
              <Box sx={{ flexGrow: 1, p: 5, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <GlassCard sx={{ p: 4, bgcolor: "rgba(255, 255, 255, 0.95)" }}>
                  <Typography variant="h5" sx={{ color: theme.primary, mb: 3, fontWeight: 700 }}>
                    Welcome to Your AI Interview
                  </Typography>
                  {jobDetails && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ color: theme.textPrimary, fontWeight: 600 }}>Position</Typography>
                      <Box sx={{ p: 2, borderRadius: "8px", bgcolor: theme.primary, color: "white", mt: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{jobDetails.job_name}</Typography>
                      </Box>
                    </Box>
                  )}
                  {skills.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ color: theme.textPrimary, fontWeight: 600 }}>Your Skills</Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                        {skills.map((skill, index) => (
                          <Chip key={index} label={skill} sx={{ bgcolor: theme.secondary, color: "white", fontWeight: 600 }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: theme.textPrimary, fontWeight: 600, mb: 1 }}>Guidelines</Typography>
                    <Typography variant="body2" sx={{ color: theme.textSecondary, lineHeight: 1.6 }}>
                      <ul style={{ paddingLeft: "20px", margin: 0 }}>
                        <li>Speak clearly into your microphone.</li>
                        <li>Begin after the question is read.</li>
                        <li>Stay alone; proctoring is active.</li>
                        <li>Avoid switching tabs.</li>
                        <li>Answer within 2 minutes.</li>
                      </ul>
                    </Typography>
                  </Box>
                </GlassCard>
                <GradientButton onClick={startInterview} sx={{ mt: 4 }}>
                  Start Interview
                </GradientButton>
              </Box>
            ) : (
              <Box sx={{ p: 5, flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 600 }}>Current Question</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: timeLeft < 30 ? `${theme.error}20` : `${theme.primary}20`, borderRadius: "20px", px: 2, py: 1 }}>
                    <AccessTimeIcon sx={{ color: timeLeft < 30 ? theme.error : theme.primary }} />
                    <Typography sx={{ color: timeLeft < 30 ? theme.error : theme.primary, fontWeight: 600 }}>
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </Typography>
                  </Box>
                </Box>
                {displayedQuestion === "Waiting for the next question..." ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 100 }}>
                    <CircularProgress sx={{ color: theme.primary }} />
                  </Box>
                ) : (
                  <GlassCard sx={{ p: 3, mb: 3, borderLeft: `4px solid ${theme.primary}` }}>
                    <Typography variant="h6" sx={{ color: theme.textPrimary, fontWeight: 500 }}>{displayedQuestion}</Typography>
                  </GlassCard>
                )}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                  <img
                    src={isSpeaking ? speakingAvatar : staticAvatar}
                    alt={isSpeaking ? "Speaking" : "Idle"}
                    style={{ width: 200, height: 200, borderRadius: "50%", boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)" }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                    {isTtsActive && <SpeakingIcon />}
                    {!isTtsActive && isRecording && <ListeningIcon />}
                    <Typography variant="body1" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                      {isTtsActive ? "Please wait, question is being spoken." : isRecording ? "Please speak your answer now." : "Please wait for the next question."}
                    </Typography>
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  placeholder="Your answer will appear here as you speak..."
                  multiline
                  rows={4}
                  sx={{
                    "& .MuiInputBase-root": { bgcolor: "white", borderRadius: "12px" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.primary },
                  }}
                />
                {candidateAnswer && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: getAnswerConfidence(candidateAnswer).color, fontWeight: 600, mb: 1 }}>
                      Answer Strength: {getAnswerConfidence(candidateAnswer).label}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getAnswerConfidence(candidateAnswer).value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "rgba(0, 0, 0, 0.1)",
                        "& .MuiLinearProgress-bar": { bgcolor: getAnswerConfidence(candidateAnswer).color },
                      }}
                    />
                    <Typography variant="body2" sx={{ color: theme.textSecondary, fontStyle: "italic", mt: 1 }}>
                      {getAnswerConfidence(candidateAnswer).message}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                  <GradientButton onClick={sendAnswer} disabled={!candidateAnswer.trim()}>
                    Submit Answer
                  </GradientButton>
                </Box>
              </Box>
            )}
          </GlassCard>
        </Grid>
      </Grid>

      <Snackbar open={notification.open} autoHideDuration={5000} onClose={handleCloseNotification} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert
          severity={notification.severity}
          sx={{ bgcolor: notification.severity === "warning" ? theme.warning : theme.success, color: "white", borderRadius: "8px" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StartInterview;