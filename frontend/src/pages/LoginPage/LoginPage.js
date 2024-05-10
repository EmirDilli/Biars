import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./loginPage.css";

export default function LoginPage({ setAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/auth/login",
        {
          username,
          password,
        }
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.data.user.bearerToken);
        localStorage.setItem("userId", response.data.data.user._id);
        localStorage.setItem("type", response.data.data.user.type);

        setAuthenticated(true);

        if (response.data.data.user.type == 0) navigate("/admin");
        else navigate("/main");
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src="assets/logo.png" alt="Your Logo" className="logo" />{" "}
        {/* Insert your logo */}
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="username"
              name="username"
              placeholder="username /email"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
        </form>
        {error && <p className="error">{error}</p>}
        <div className="change-password">
          <p>
            Forgot your password? <a href="#">Change Password</a>
          </p>{" "}
          {/* Add your change password link */}
        </div>
      </div>
    </div>
  );
}
