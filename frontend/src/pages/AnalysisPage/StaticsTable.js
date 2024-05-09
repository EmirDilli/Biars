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

const StatisticsTable = () => {
  const { className } = useParams();
  const [statistics, setStatistics] = useState({});
  const [semesters, setSemesters] = useState([]);
  const [startSemester, setStartSemester] = useState("");
  const [endSemester, setEndSemester] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/v1/class/${className}/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        const { statistics, earliestSemester, latestSemester } = response.data;
        setStatistics(statistics);
        if (earliestSemester && latestSemester) {
          setSemesters(generateSemesterRange(earliestSemester, latestSemester));
        }
      })
      .catch((error) => console.error("Error fetching statistics:", error));
  }, [className]);

  useEffect(() => {
    if (startSemester && endSemester) {
      axios
        .get(
          `http://localhost:3000/api/v1/class/${className}/statistics?start=${startSemester}&end=${endSemester}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          const { statistics, earliestSemester, latestSemester } =
            response.data;
          setStatistics(statistics);
        })
        .catch((error) => console.error("Error fetching statistics:", error));
    }
  }, [startSemester, endSemester, className]);

  const generateSemesterRange = (start, end) => {
    let range = [];
    let [startYear, startTerm] = [parseInt(start.substring(0, 4)), start[4]];
    let [endYear, endTerm] = [parseInt(end.substring(0, 4)), end[4]];

    for (let year = startYear; year <= endYear; year++) {
      if (year === startYear && startTerm === "F") {
        range.push(`${year}F`);
      }
      if (year > startYear) {
        range.push(`${year}F`);
      }
      if (year < endYear) {
        range.push(`${year}S`);
      }
      if (year === endYear && endTerm === "S") {
        range.push(`${year}S`);
      }
    }

    return range.map((sem) => ({
      value: sem,
      label: `${sem.substring(0, 4)} ${
        sem.substring(4) === "F" ? "Fall" : "Spring"
      }`,
    }));
  };

  return (
    <div>
      <h2>Statistics for {className}</h2>
      <div>
        <select
          value={startSemester}
          onChange={(e) => setStartSemester(e.target.value)}
        >
          <option value="">Select Start Semester</option>
          {semesters.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={endSemester}
          onChange={(e) => setEndSemester(e.target.value)}
        >
          <option value="">Select End Semester</option>
          {semesters.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <table>
        <tbody>
          <tr>
            <th>Mean Exam Score</th>
            <td>{statistics.meanExamScore?.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Standard Deviation Exam Score</th>
            <td>{statistics.stdDevExamScore?.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Mean Final Score</th>
            <td>{statistics.meanFinalScore?.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Standard Deviation Final Score</th>
            <td>{statistics.stdDevFinalScore?.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Mean Homework/Quiz/Project Score</th>
            <td>{statistics.meanHomeworkQuizProjectScore?.toFixed(2)}</td>
          </tr>
          <tr>
            <th>Mean Absent Count</th>
            <td>{statistics.meanAbsentCount?.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatisticsTable;
