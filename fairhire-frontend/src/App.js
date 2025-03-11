import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Components/Home';
import ResumeUpload from './Components/ResumeUpload';
import JobDetailsPage from './Components/JobDetailsPage';
import StartInterview from './Components/StartInterview';
import RecruiterLogin from './Components/RecruiterLogin';
import RecruiterDashboard from './Components/RecruiterDashboard'; // ✅ Import the missing component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<ResumeUpload />} />
        <Route path="/job-details" element={<JobDetailsPage />} />
        <Route path="/start-interview" element={<StartInterview />} />
        <Route path="/recruiter-login" element={<RecruiterLogin />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} /> {/* ✅ Added this */}
      </Routes>
    </Router>
  );
};

export default App;
