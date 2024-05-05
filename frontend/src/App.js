import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/homePage/HomePage";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Workspace from "./pages/Workspace/Chat";
import Assessment from "./pages/AssessmentPage/AssessmentPage";

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

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
        path="/assessment"
        element={authenticated ? <Assessment /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
