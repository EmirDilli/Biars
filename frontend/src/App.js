import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/homePage/HomePage";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Workspace from "./pages/Workspace/Chat";
import Assessment from "./pages/AssessmentPage/AssessmentPage";
import Event from "./pages/EventPage/EventPage";
import AbsenteeisChart from "./pages/AnalysisPage/AbsenteeimChart";
import AveragesChart from "./pages/AnalysisPage/AvaragesChart";
import ClassList from "./pages/AnalysisPage/ClassList";
import QuestionAnalysis from "./pages/AnalysisPage/QuestionAnalysis";
import ReportPage from "./pages/AnalysisPage/ReportPage";
import StaticsTable from "./pages/AnalysisPage/StaticsTable";
import Admin from "./pages/AdminMainPage/AdminPage";
import ClassSections from "./pages/ClassPage/Grading";
import WeeklySchedule from "./pages/ClassPage/MainPage";

import Schedule from "./pages/SchedulePage/SchedulePage";

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [type, setType] = useState(-1);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // If token exists, decode it
      const decodedToken = jwtDecode(token);
      // Check if the token is expired
      const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
      if (decodedToken.exp < currentTime) {
        // Token is expired, set authenticated to false
        setAuthenticated(false);
        // Optionally, you can remove the expired token from localStorage
        localStorage.removeItem("token");
      } else {
        // Token is still valid, set authenticated to true
        setAuthenticated(true);
      }
    } else {
      // No token found, set authenticated to false
      setAuthenticated(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    // While loading, you can show a loading spinner or any other loading indicator
    return <div>Loading...</div>;
  }
  return (
    <Routes>
      <Route
        path="/admin"
        element={<Admin setAuthenticated={setAuthenticated} />}
      />
      <Route
        path="/login"
        element={<LoginPage setAuthenticated={setAuthenticated} />}
      />
      <Route
        path="/main"
        element={authenticated ? <HomePage /> : <Navigate to="/login" />}
      />
      <Route
        path="/workspace"
        element={authenticated ? <Workspace /> : <Navigate to="/login" />}
      />
      <Route
        path="/schedule"
        element={authenticated ? <Schedule /> : <Navigate to="/login" />}
      />
      <Route
        path="/assessment"
        element={authenticated ? <Assessment /> : <Navigate to="/login" />}
      />
      <Route
        path="/event"
        element={authenticated ? <Event /> : <Navigate to="/login" />}
      />
      <Route path="analysis/" element={<ClassList />} />
      <Route
        path="analysis/class/:className/averages"
        element={<AveragesChart />}
      />
      <Route
        path="analysis/class/:className/absenteeism"
        element={<AbsenteeisChart />}
      />
      <Route
        path="analysis/class/:className/statistics"
        element={<StaticsTable />}
      />
      <Route
        path="analysis/class/:className/question_analysis"
        element={<QuestionAnalysis />}
      />
      <Route path="analysis/class/:className/report" element={<ReportPage />} />
      <Route path="class/:className/grading" element={<ClassSections />} />
      <Route path="weekly" element={<WeeklySchedule />} />
    </Routes>
  );
}

export default App;
