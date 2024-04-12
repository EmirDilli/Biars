import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/homePageStudent/HomePage";
import React, { useState, useEffect } from "react";

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is already authenticated (e.g., by checking the presence of a token in localStorage)
    const token = localStorage.getItem("token");
    if (token) {
      // If token exists, consider the user as authenticated
      setAuthenticated(true);
    }
    // Once the check is complete, set loading to false
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
        element={
          authenticated ? (
            <Navigate to="/main" />
          ) : (
            <LoginPage setAuthenticated={setAuthenticated} />
          )
        }
      />
      <Route
        path="/main"
        element={authenticated ? <HomePage /> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
