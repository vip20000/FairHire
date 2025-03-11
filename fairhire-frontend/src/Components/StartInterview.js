import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Typography, TextField, Box, Grid, Paper, Snackbar, Alert, Tooltip, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import SyncIcon from '@mui/icons-material/Sync';
import staticAvatar from './avatar-static.jpg';
import speakingAvatar from './avatar-speaking.gif';

// Animated icons with gradient and blinking
const SpeakingIcon = styled(VolumeUpIcon)({
  fontSize: '48px',
  color: '#1976d2',
  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'blink 1.2s infinite',
  '@keyframes blink': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 },
  },
});

const ListeningIcon = styled(MicIcon)({
  fontSize: '48px',
  color: '#4caf50',
  background: 'linear-gradient(45deg, #4caf50, #81c784)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'blink 1s infinite',
  '@keyframes blink': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.4 },
    '100%': { opacity: 1 },
  },
});

const FrameSendingIcon = styled(SyncIcon)({
  fontSize: '24px',
  color: '#ff9800',
  animation: 'rotate 1.5s linear infinite',
  '@keyframes rotate': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

const StartInterview = () => {
  const location = useLocation();
  const candidateId = location.state?.candidateId;
  const jobCode = location.state?.jobCode;

  const [skills, setSkills] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [displayedQuestion, setDisplayedQuestion] = useState("Please wait for the first question...");
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'warning' });
  const [isTtsActive, setIsTtsActive] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 120-second timer

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const speechRef = useRef(new SpeechSynthesisUtterance());
  const recognitionRef = useRef(null);
  const proctoringIntervalRef = useRef(null);
  const timerRef = useRef(null);

  const playSmoothTone = () => {
    const tone = new Audio('https://www.soundjay.com/buttons/beep-07a.mp3');
    tone.play().catch(err => console.warn("Audio playback failed:", err));
  };

  // Answer Confidence Meter Logic
  const getAnswerConfidence = (answer) => {
    const length = answer.trim().length;
    if (length < 50) return { label: 'Weak', color: '#d32f2f', width: '25%', message: 'Try to elaborate more!' };
    if (length < 150) return { label: 'Good', color: '#ff9800', width: '50%', message: 'Nice, add more details!' };
    return { label: 'Great', color: '#4caf50', width: '75%', message: 'Excellent response!' };
  };

  useEffect(() => {
    if (!candidateId) return;

    fetch(`http://127.0.0.1:8000/resume/candidate_skills/?candidate_id=${candidateId}`)
      .then(response => response.json())
      .then(data => setSkills(data.skills || []))
      .catch(error => console.error("Failed to fetch candidate skills:", error));
  }, [candidateId]);

  useEffect(() => {
    if (!jobCode) return;

    fetch(`http://127.0.0.1:8000/recruiter/job-summary/?job_code=${jobCode}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === "success" && data.data) {
          setJobDetails(data.data);
        }
      })
      .catch(error => console.error("Failed to fetch job details:", error));
  }, [jobCode]);

  useEffect(() => {
    if (!candidateId) {
      console.warn("Candidate ID is missing! Cannot proceed with proctoring.");
      return;
    }

    console.log("Requesting camera and microphone access...");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        console.log("Camera and microphone access granted.");
        setStream(mediaStream);
        setIsCameraReady(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error("Error accessing camera/audio:", err);
        setIsCameraReady(false);
      });

    return () => {
      if (stream) {
        console.log("Stopping camera and microphone streams.");
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [candidateId]);

  useEffect(() => {
    if (interviewStarted && isCameraReady && candidateId) {
      console.log("Starting proctoring frame capture every 3 seconds.");
      proctoringIntervalRef.current = setInterval(() => {
        captureAndSendFrame();
      }, 3000);

      return () => {
        console.log("Stopping proctoring frame capture.");
        if (proctoringIntervalRef.current) {
          clearInterval(proctoringIntervalRef.current);
          proctoringIntervalRef.current = null;
        }
      };
    }
  }, [interviewStarted, isCameraReady, candidateId]);

  useEffect(() => {
    if (interviewStarted && !isTtsActive && !isCallEnded) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            sendAnswer(); // Auto-submit if time runs out
            return 120;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timerRef.current);
      };
    }
  }, [interviewStarted, isTtsActive, isCallEnded]);

  const captureAndSendFrame = async () => {
    if (!canvasRef.current || !videoRef.current) {
      console.warn("Canvas or video reference missing. Skipping frame capture.");
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        console.log("Captured frame, sending to proctoring service...");
        const formData = new FormData();
        formData.append('frame', blob, 'frame.jpg');
        formData.append('candidate_id', candidateId);

        try {
          const response = await fetch('http://127.0.0.1:8000/proctoring/frame/', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Frame response:', data);

            if (data.proctoring_flag) {
              const reasons = data.reason || {};
              const violationMessages = [];
              if (reasons.multiple_persons_detected) violationMessages.push("Multiple persons detected");
              if (reasons.no_person_detected) violationMessages.push("No person detected");
              if (reasons.device_detected) violationMessages.push("Device detected");

              if (violationMessages.length > 0) {
                const message = `Warning: ${violationMessages.join(', ')}. You are being monitored by our AI systems.`;
                console.log('Triggering notification:', message);
                setNotification({
                  open: true,
                  message: message,
                  severity: 'warning'
                });
              }
            }
          } else {
            console.error('Error sending frame. Status:', response.status, 'Response:', await response.text());
          }
        } catch (error) {
          console.error('Error in proctoring request:', error);
        }
      }
    }, 'image/jpeg');
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  useEffect(() => {
    if (!candidateId) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setCandidateAnswer(transcript);
      };
      recognitionRef.current.onstart = () => {
        playSmoothTone(); // Smooth tone when recording starts
      };
      recognitionRef.current.onend = () => {
        if (isRecording && interviewStarted && !isCallEnded) {
          playSmoothTone(); // Smooth tone when recording stops
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.warn("SpeechRecognition restart failed:", err);
          }
        }
      };
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
  }, [candidateId, interviewStarted, isCallEnded]);

  const startInterview = useCallback(() => {
    if (!jobDetails || skills.length === 0) {
      console.error("Missing job details or skills. Cannot start interview.");
      return;
    }

    const ws = new WebSocket("ws://localhost:8765");

    ws.onopen = () => {
      console.log("WebSocket connection established.");
      ws.send(JSON.stringify({
        candidate_id: candidateId,
        job_name: jobDetails.job_name,
        num_questions: jobDetails.num_questions,
        skills: skills,
      }));
      setInterviewStarted(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log("Received question:", event.data);
      try {
        const response = JSON.parse(event.data);
        if (response.status === "Interview Completed") {
          handleEndCall();
        } else if (response.question) {
          const cleanedQuestion = response.question.split("\n\n")[0];
          setCurrentQuestion(cleanedQuestion);
          setDisplayedQuestion("");
          setQuestionCount((prev) => prev + 1);
          setTimeLeft(120); // Reset timer for new question

          if ('speechSynthesis' in window) {
            setIsTtsActive(true);
            setIsSpeaking(true);
            speechRef.current.text = cleanedQuestion;

            let index = 0;
            const totalDuration = cleanedQuestion.length * 50;
            const intervalDuration = totalDuration / cleanedQuestion.length;
            const displayInterval = setInterval(() => {
              if (index < cleanedQuestion.length) {
                setDisplayedQuestion(cleanedQuestion.slice(0, index + 1));
                index++;
              } else {
                clearInterval(displayInterval);
              }
            }, intervalDuration);

            speechRef.current.onend = () => {
              setIsSpeaking(false);
              setIsTtsActive(false);
              clearInterval(displayInterval);
              setDisplayedQuestion(cleanedQuestion);
              if (recognitionRef.current && !isRecording) {
                try {
                  recognitionRef.current.start();
                  setIsRecording(true);
                } catch (err) {
                  console.warn("SpeechRecognition start failed:", err);
                }
              }
            };
            window.speechSynthesis.speak(speechRef.current);
          } else {
            console.warn('Speech synthesis not supported in this browser.');
            setDisplayedQuestion(cleanedQuestion);
          }
        } else {
          console.error('Question data is missing or malformed:', response);
          setNotification({
            open: true,
            message: "Error: Unable to process question data.",
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error parsing JSON data:', error, event.data);
        setNotification({
          open: true,
          message: "Error: Invalid response from server.",
          severity: 'error'
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setNotification({
        open: true,
        message: "Error: Unable to connect to the interview server.",
        severity: 'error'
      });
      setInterviewStarted(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
      setInterviewStarted(false);
      setSocket(null);
    };
  }, [candidateId, jobDetails, skills]);

  const sendAnswer = () => {
    if (socket && candidateAnswer.trim()) {
      socket.send(JSON.stringify({ candidate_id: candidateId, answer: candidateAnswer }));
      setCandidateAnswer("");
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
      setDisplayedQuestion("Waiting for the next question...");
      setTimeLeft(120); // Reset timer after submission
    }
  };

  const handleEndCall = async () => {
    setIsCallEnded(true);
    if (stream) stream.getTracks().forEach((track) => track.stop());
    if (socket) socket.close();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const response = await fetch('http://127.0.0.1:8000/proctoring/end/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'candidate_id': candidateId })
      });
      if (response.ok) {
        console.log('Interview end signaled to backend successfully');
      } else {
        console.error('Error signaling interview end. Status:', response.status);
      }
    } catch (error) {
      console.error('Error signaling interview end:', error);
    }
  };

  if (isCallEnded) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundImage: 'url(https://www.transparenttextures.com/patterns/geometry.png)',
        backgroundSize: 'cover',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <Paper sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "50px",
          borderRadius: "16px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
          backdropFilter: "blur(5px)",
          textAlign: "center"
        }}>
          <Typography variant="h4" color="#0277bd" sx={{ fontFamily: "'Montserrat', sans-serif" }}>Interview Completed</Typography>
          <Typography variant="body1" color="#333" sx={{ fontFamily: "'Poppins', sans-serif" }}>Thank you for participating. We will contact you soon.</Typography>
        </Paper>
      </Box>
    );
  }

  const instructions = (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '8px', maxWidth: '350px' }}>
      <Typography variant="body2" sx={{ fontFamily: "'Poppins', sans-serif", color: '#333' }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>Speak clearly into your microphone for best results.</li>
          <li>Begin speaking only after the question is fully read.</li>
          <li>Ensure you are alone; the proctoring system detects multiple persons or devices.</li>
          <li>Do not switch tabs or windows during the interview.</li>
          <li>Sit in a well-lit room with your face clearly visible.</li>
          <li>Avoid background noise for accurate speech recognition.</li>
          <li>Answer within 2 minutes; answers will auto-submit if time runs out.</li>
        </ul>
      </Typography>
    </Box>
  );

  return (
    <Box sx={{
      height: '100vh',
      backgroundImage: 'url(https://www.transparenttextures.com/patterns/geometry.png)',
      backgroundSize: 'cover',
      fontFamily: "'Poppins', sans-serif",
      position: 'relative'
    }}>
      {/* FairHire Branding */}
      <Box sx={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1
      }}>
        <Typography variant="h4" sx={{ color: '#0277bd', fontWeight: 'bold', fontFamily:"'Poppins', sans-serif", fontSize: '3rem' }}>
          FairHire
        </Typography>
      </Box>

      <Grid container sx={{ height: '100%' }}>
        {/* Left Column (Camera) */}
        <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: '3px solid #0277bd' }}>
          <Paper sx={{
            flexGrow: 1,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "0 16px 16px 0",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(5px)",
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Typography variant="h6" sx={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', color: "#0277bd", zIndex: 1, fontFamily: "'Montserrat', sans-serif" }}>
                Your Camera Feed
              </Typography>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '8px' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FrameSendingIcon />
                <Typography variant="body2" sx={{ color: '#ff9800', fontSize: '0.9rem', fontFamily: "'Poppins', sans-serif" }}>
                  Sending frames for malpractice detection
                </Typography>
                <Tooltip title={instructions} placement="top-start">
                  <Typography variant="body2" sx={{ color: '#666', ml: 2, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>
                    Instructions
                  </Typography>
                </Tooltip>
              </Box>
              <Button onClick={handleEndCall} variant="contained" sx={{ backgroundColor: '#d32f2f', color: '#fff', '&:hover': { backgroundColor: '#b71c1c' }, fontFamily: "'Poppins', sans-serif" }}>
                End Call
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column (Chat/Interview Q&A) */}
        <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '3px solid #0277bd' }}>
          <Paper sx={{
            flexGrow: 1,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "16px 0 0 16px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(5px)",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            position: 'relative'
          }}>
            {!interviewStarted ? (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
                <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: '8px', maxWidth: '80%' }}>
                  <Typography variant="h5" sx={{ color: '#0277bd', mb: 2, fontFamily: "'Montserrat', sans-serif" }}>
                    Welcome to Your Interview
                  </Typography>
                  {jobDetails && (
                    <>
                      <Typography variant="body1" sx={{ color: '#333', fontFamily: "'Poppins', sans-serif" }}>
                        <strong>Job:</strong> {jobDetails.job_name}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#333', fontFamily: "'Poppins', sans-serif" }}>
                        <strong>Description:</strong> {jobDetails.job_description?.slice(0, 150)}...
                      </Typography>
                    </>
                  )}
                  {skills.length > 0 && (
                    <Typography variant="body1" sx={{ color: '#333', fontFamily: "'Poppins', sans-serif" }}>
                      <strong>Your Skills:</strong> {skills.join(', ')}
                    </Typography>
                  )}
                </Paper>
                <Button variant="contained" color="primary" onClick={startInterview} sx={{ padding: "10px 20px", fontSize: "16px", fontFamily: "'Poppins', sans-serif" }}>
                  Start Interview
                </Button>
              </Box>
            ) : (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" sx={{ color: "#0277bd", marginBottom: "10px", fontSize: '2rem', fontFamily: "'Montserrat', sans-serif" }}>
                  Question:
                </Typography>
                <Typography variant="h5" sx={{ marginBottom: 1, color: "#333", fontSize: '1.5rem', fontFamily: "'Poppins', sans-serif" }}>
                  {displayedQuestion}
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={(timeLeft / 120) * 100}
                    size={40} // Reduced size from 60 to 40
                    thickness={5}
                    sx={{ color: timeLeft < 30 ? '#d32f2f' : '#0277bd' }}
                  />
                  <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#333', fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem' }}>
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                  {isSpeaking ? (
                    <img src={speakingAvatar} alt="Speaking" style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'contain' }} />
                  ) : (
                    <img src={staticAvatar} alt="Idle" style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'contain', borderRadius: '8px' }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {isTtsActive && <SpeakingIcon />}
                  {!isTtsActive && isRecording && <ListeningIcon />}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    placeholder="Your Answer"
                    multiline
                    rows={4}
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        backgroundColor: "#e8f0fe", 
                        fontSize: '1.25rem',
                        fontFamily: "'Poppins', sans-serif"
                      } 
                    }}
                  />
                  {candidateAnswer && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: '#555', fontFamily: "'Poppins', sans-serif" }}>
                        Answer Strength: {getAnswerConfidence(candidateAnswer).label} - {getAnswerConfidence(candidateAnswer).message}
                      </Typography>
                      <Box sx={{ height: 5, width: '100%', bgcolor: '#e0e0e0', borderRadius: 5 }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: getAnswerConfidence(candidateAnswer).width,
                            bgcolor: getAnswerConfidence(candidateAnswer).color,
                            borderRadius: 5,
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                    <Button onClick={sendAnswer} disabled={!candidateAnswer.trim()} variant="contained" color="primary" sx={{ padding: "10px 20px", fontSize: "16px", fontFamily: "'Poppins', sans-serif" }}>
                      Submit Answer
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ 
            bgcolor: '#fff3e0',
            color: '#e65100',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: '1px solid #ff9800',
            borderRadius: '8px',
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            p: 2,
            fontFamily: "'Poppins', sans-serif",
            '& .MuiAlert-icon': { color: '#ff9800' }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StartInterview;