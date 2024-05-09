import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
} from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import "./analysis.css";
import Chart from "chart.js/auto";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ClassList = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axios
      .get("/api/classes")
      .then((response) => setClasses(response.data))
      .catch((error) => console.error("Error fetching classes:", error));
  }, []);

  return (
    <div>
      {classes.map((c, index) => (
        <div key={index} className="class-box">
          <h3>{c.className}</h3>
          <div className="class-options">
            <Link to={`/class/${c.code}/averages`}>Show Averages</Link> |
            <Link to={`/class/${c.code}/absenteeism`}>Show Absenteeism</Link> |
            <Link to={`/class/${c.code}/statistics`}>Show Summary</Link> |
            <Link to={`/class/${c.code}/question_analysis`}>
              Question Analysis
            </Link>{" "}
            |<Link to={`/class/${c.code}/report`}>Report Generation</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassList;
