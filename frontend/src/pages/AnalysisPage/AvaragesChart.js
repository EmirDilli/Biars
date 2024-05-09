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

const AveragesChart = () => {
  const token = localStorage.getItem("token");
  const { className } = useParams();
  const [chartData, setChartData] = useState({});
  const [semesters, setSemesters] = useState([]);
  const [startSemester, setStartSemester] = useState("");
  const [endSemester, setEndSemester] = useState("");

  useEffect(() => {
    const endpoint = `http://localhost:3000/api/v1/class/${className}/averages`;

    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        const averages = response.data;
        const semesterOptions = Object.keys(averages).map((key) => ({
          value: key.substring(key.indexOf("(") + 1, key.indexOf(")")),
          label: key,
        }));
        setSemesters(semesterOptions);
        setChartData({
          labels: Object.keys(averages),
          datasets: [
            {
              label: "Term Average",
              data: Object.values(averages),
              fill: false,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        });
      })
      .catch((error) => console.error("Error fetching averages:", error));
  }, [className]);

  useEffect(() => {
    if (startSemester && endSemester) {
      axios
        .get(
          `http://localhost:3000/api/v1/class/${className}/averages?start=${startSemester}&end=${endSemester}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          const averages = response.data;

          setChartData({
            labels: Object.keys(averages),
            datasets: [
              {
                label: "Term Average",
                data: Object.values(averages),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
              },
            ],
          });
        })
        .catch((error) => console.error("Error fetching averages:", error));
    }
  }, [startSemester, endSemester, className]);

  return (
    <div className="graph-container">
      <h2>Averages for {className}</h2>
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
      {chartData.labels ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AveragesChart;
