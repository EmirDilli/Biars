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

const QuestionAnalysis = () => {
  const { className } = useParams();
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/class/${className}/question_analysis`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setAnalysisData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching question analysis data:", err);
        setError("Failed to load data, please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [className]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Question Analysis for {className}</h1>
      <table>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Exams</th>
            <th>Homeworks</th>
            <th>Quizzes</th>
            <th>Projects</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(analysisData).map(([topic, scores]) => (
            <tr key={topic}>
              <td>{topic}</td>
              <td>
                {scores.exam >= 0
                  ? (scores.exam * 100).toFixed(2) + "%"
                  : "N/A"}
              </td>
              <td>
                {scores.homework >= 0
                  ? (scores.homework * 100).toFixed(2) + "%"
                  : "N/A"}
              </td>
              <td>
                {scores.quiz >= 0
                  ? (scores.quiz * 100).toFixed(2) + "%"
                  : "N/A"}
              </td>
              <td>
                {scores.project >= 0
                  ? (scores.project * 100).toFixed(2) + "%"
                  : "N/A"}
              </td>
              <td>
                {scores.total >= 0
                  ? (scores.total * 100).toFixed(2) + "%"
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default QuestionAnalysis;
