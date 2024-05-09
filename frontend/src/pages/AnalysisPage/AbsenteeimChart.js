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

const AbsenteeismChart = () => {
  const { className } = useParams(); // Using useParams hook to get className
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    axios
      .get(`/api/classes/${className}/absent_analysis`)
      .then((response) => {
        const labels = response.data.ranges.map((range, index, array) =>
          index < array.length - 1
            ? `${range}-${array[index + 1]}`
            : `${range}+`
        );
        const data = response.data.avgGrades;
        setChartData({
          labels,
          datasets: [
            {
              label: "Average Grade by Absenteeism",
              data,
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderColor: "rgb(255, 99, 132)",
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) =>
        console.error("Error fetching absenteeism data:", error)
      );
  }, [className]);

  return (
    <div className="graph-container">
      <h2>Average Grade for Absenteeism for {className}</h2>
      {chartData.labels ? (
        <Bar
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

export default AbsenteeismChart;
