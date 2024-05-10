import React, { useState } from "react";
import axios from "axios";
import "./adminPage.css";

function AdminPanel() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDatesEntered, setIsDatesEntered] = useState(false);
  const token = localStorage.getItem("token");
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleEnterDates = () => {
    if (!startDate || !endDate) {
      alert("Enter dates");
      return;
    }

    async function save() {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/v1/semester/createSemester",
          {
            start: startDate,
            end: endDate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setIsDatesEntered(true);
        console.log("Semester created successfully:", response.data);
      } catch (error) {
        alert("Error creating semester");
      }
    }
    save();
  };

  const handleStartSemester = async () => {
    try {
      const response = await axios.post("/createSemester", {
        start: startDate,
        end: endDate,
      });
      alert(response.data.message);
      setIsDatesEntered(false);
    } catch (error) {
      console.error("Error starting semester:", error);
      alert("Failed to start semester. Please try again.");
    }
  };

  const handleEnterUsersClick = () => alert("Entering Users CSV file...");
  const handleEnterClassesClick = () => alert("Entering Classes CSV file...");

  return (
    <div className="admin-container">
      <h1>Welcome to Admin Panel</h1>
      {!isDatesEntered && (
        <div className="admin-box">
          <h2>Enter Semester Dates</h2>
          <label htmlFor="start-date">Start Date:</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={handleStartDateChange}
          />
          <label htmlFor="end-date">End Date:</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={handleEndDateChange}
          />
          <button onClick={handleEnterDates}>Create Semester</button>
        </div>
      )}
      {isDatesEntered && (
        <div className="admin-box">
          <h2>Enter CSV Files</h2>
          <button onClick={handleEnterUsersClick}>Enter Users (CSV)</button>
          <button onClick={handleEnterClassesClick}>Enter Classes (CSV)</button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
