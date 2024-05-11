import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chart from "chart.js/auto"; // Import chart.js/auto
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./analysis.css";
const ReportPage = () => {
  const { className } = useParams();
  const [startSemester, setStartSemester] = useState("");
  const [endSemester, setEndSemester] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [stats, setStats] = useState([]);
  const token = localStorage.getItem("token");
  useEffect(() => {
    // Fetch semesters when component mounts or className changes
    const fetchSemesters = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/v1/class/${className}/semesters`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setSemesters(data);
      } catch (error) {
        console.error("Error fetching semesters:", error);
      }
    };

    if (className) {
      fetchSemesters();
    }
  }, [className]); // Depend on className to re-fetch when it changes

  const handleGenerateReport = async () => {
    try {
      console.log(stats);
      const response = await axios.get(
        `http://localhost:3000/api/v1/class/${className}/report`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            start: startSemester,
            end: endSemester,
            stats: stats,
          },
        }
      );

      const pdfGenerator = new PDFGenerator(className);
      pdfGenerator.generateReport(response.data); // Pass the data to generate PDF
    } catch (error) {
      console.error("Error fetching or generating report:", error);
    }
  };

  const toggleStat = (stat) => {
    if (stats.includes(stat)) {
      setStats(stats.filter((s) => s !== stat));
    } else {
      setStats([...stats, stat]);
    }
  };

  return (
    <div>
      <h1>Generate Report for {className}</h1>
      <div>
        <label>
          Start Semester:
          <select
            value={startSemester}
            onChange={(e) => setStartSemester(e.target.value)}
          >
            <option value="">Select Start Semester</option>
            {semesters.map((semester, index) => (
              <option key={index} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </label>
        <label>
          End Semester:
          <select
            value={endSemester}
            onChange={(e) => setEndSemester(e.target.value)}
          >
            <option value="">Select End Semester</option>
            {semesters.map((semester, index) => (
              <option key={index} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </label>
        <div>
          <label>
            <input
              type="checkbox"
              checked={stats.includes("averages")}
              onChange={() => toggleStat("averages")}
            />{" "}
            Averages
          </label>
          <label>
            <input
              type="checkbox"
              checked={stats.includes("topicAnalysis")}
              onChange={() => toggleStat("topicAnalysis")}
            />{" "}
            Topic Analysis
          </label>
          <label>
            <input
              type="checkbox"
              checked={stats.includes("attendanceAnalysis")}
              onChange={() => toggleStat("attendanceAnalysis")}
            />{" "}
            Attendance Analysis
          </label>
          <label>
            <input
              type="checkbox"
              checked={stats.includes("statistics")}
              onChange={() => toggleStat("statistics")}
            />{" "}
            Statistics
          </label>
        </div>
        <button onClick={handleGenerateReport}>Generate Report</button>
      </div>
    </div>
  );
};

class PDFGenerator {
  constructor(className) {
    this.doc = new jsPDF();
    this.className = className;
  }

  async generateReport(data) {
    this.doc.setFont('Helvetica');
    this.doc.setFontSize(12);
    
    // Initialize the PDF with a title
    this.doc.text(`Class Report: ${this.className}`, 10, 10);

    if (data.averages) {
      const chartData = {
        labels: Object.keys(data.averages),
        data: Object.values(data.averages),
      };
      await this.addChartToPDF(chartData, "Term Average", "line", "rgb(75, 192, 192)");
    }

    if (data.attendance) {
      const labels = data.attendance.ranges.map((range, index, array) =>
        index < array.length - 1 ? `${range}-${array[index + 1]}` : `${range}+`
      );
      const chartData = {
        labels: labels,
        data: data.attendance.avgGrades,
      };
      await this.addChartToPDF(chartData, "Average Grade by Absenteeism", "bar", "rgba(255, 99, 132, 0.5)");
    }

    if (data.statistics) {
      const statsData = [
        ["Mean Exam Score", data.statistics.meanExamScore?.toFixed(2)],
        ["Std Dev Exam Score", data.statistics.stdDevExamScore?.toFixed(2)],
        ["Mean Final Score", data.statistics.meanFinalScore?.toFixed(2)],
        ["Std Dev Final Score", data.statistics.stdDevFinalScore?.toFixed(2)],
        ["Mean Homework/Quiz/Project Score", data.statistics.meanHomeworkQuizProjectScore?.toFixed(2)],
        ["Mean Absent Count", data.statistics.meanAbsentCount?.toFixed(2)],
      ];
      const statsHeaders = ["Statistic", "Value"];
      this.addTableToPDF("Statistics", statsHeaders, statsData);
    }

    if (data.questionAnalysis) {
      const questionAnalysisData = Object.entries(data.questionAnalysis).map(
        ([topic, scores]) => [
          topic,
          scores.exam >= 0 ? (scores.exam * 100).toFixed(2) + "%" : "N/A",
          scores.homework >= 0 ? (scores.homework * 100).toFixed(2) + "%" : "N/A",
          scores.quiz >= 0 ? (scores.quiz * 100).toFixed(2) + "%" : "N/A",
          scores.project >= 0 ? (scores.project * 100).toFixed(2) + "%" : "N/A",
          scores.total >= 0 ? (scores.total * 100).toFixed(2) + "%" : "N/A",
        ]
      );
      const qaHeaders = ["Topic", "Exams", "Homeworks", "Quizzes", "Projects", "Total"];
      this.addTableToPDF("Question Analysis", qaHeaders, questionAnalysisData);
    }

    this.doc.save(`Report_for_${this.className}.pdf`);
  }

  async addChartToPDF(chartData, label, type, borderColor) {
    return new Promise((resolve, reject) => {
      const chartCanvas = document.createElement("canvas");
      chartCanvas.width = 800;  // Increased width for better aspect ratio
      chartCanvas.height = 400; // Increased height for better aspect ratio
      chartCanvas.style.display = "none"; // Ensure canvas is not visible
  
      document.body.appendChild(chartCanvas);
      const ctx = chartCanvas.getContext('2d');
  
      // Dynamically determine the max and min for y-axis based on data
      let minY = Math.min(...chartData.data) * 0.9;
      let maxY = Math.max(...chartData.data) * 1.1;
  
      const chart = new Chart(ctx, {
          type: type,
          data: {
            labels: chartData.labels,
            datasets: [{
              label: label,
              data: chartData.data,
              fill: type !== 'line',
              borderColor: borderColor,
              backgroundColor: type === 'bar' ? 'rgba(255, 99, 132, 0.5)' : borderColor,
              borderWidth: 1,
              tension: 0.1
            }],
          },
          options: {
            scales: {
              y: {
                beginAtZero: false,
                min: minY,
                max: maxY
              },
              x: {
                ticks: {
                  autoSkip: false,
                  maxRotation: 90,
                  minRotation: 90
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            },
            responsive: true,
            maintainAspectRatio: false // Set to false to maintain the custom aspect ratio
          }
      });
  
      setTimeout(() => {
        this.doc.addPage(); // Add a new page for each chart
        this.doc.text(label, 10, 10);
        this.doc.addImage(chart.toBase64Image(), 'PNG', 15, 20, 180, 90);
        chart.destroy();
        document.body.removeChild(chartCanvas);
        resolve();
      }, 150); // Short delay to ensure the chart renders fully on the canvas
    });
  }
  

  addTableToPDF(title, headers, body) {
    this.doc.addPage();
    this.doc.text(title, 10, 10);
    this.doc.autoTable({
      startY: 20,
      head: [headers],
      body: body,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133] }
    });
  }
}




class HTMLReportGenerator {
  constructor(className) {
    this.className = className;
    this.newWindow = window.open("", "_blank"); // Open a new tab
    if (this.newWindow) {
      this.newWindow.document.title = `Report for ${className}`;
      this.newWindow.document.body.innerHTML = `<h1>Report for ${className}</h1>`; // Set up initial HTML structure
    } else {
      console.error("Failed to open a new window.");
    }
  }

  generateReport(data) {
    if (!this.newWindow) return;

    if (data.averages) {
      this.addChart(
        {
          labels: Object.keys(data.averages),
          data: Object.values(data.averages),
        },
        "Term Average",
        "line",
        "rgb(75, 192, 192)"
      );
    }

    if (data.attendance) {
      const labels = data.attendance.ranges.map((range, index, array) =>
        index < array.length - 1 ? `${range}-${array[index + 1]}` : `${range}+`
      );

      this.addChart(
        { labels: labels, data: data.attendance.avgGrades },
        "Average Grade by Absenteeism",
        "bar",
        "rgba(255, 99, 132, 0.5)"
      );
    }

    if (data.statistics) {
      this.addTable(
        "Statistics",
        ["Statistic", "Value"],
        [
          ["Mean Exam Score", data.statistics.meanExamScore?.toFixed(2)],
          ["Std Dev Exam Score", data.statistics.stdDevExamScore?.toFixed(2)],
          ["Mean Final Score", data.statistics.meanFinalScore?.toFixed(2)],
          ["Std Dev Final Score", data.statistics.stdDevFinalScore?.toFixed(2)],
          [
            "Mean Homework/Quiz/Project Score",
            data.statistics.meanHomeworkQuizProjectScore?.toFixed(2),
          ],
          ["Mean Absent Count", data.statistics.meanAbsentCount?.toFixed(2)],
        ]
      );
    }

    if (data.questionAnalysis) {
      this.addTable(
        "Question Analysis",
        ["Topic", "Exams", "Homeworks", "Quizzes", "Projects", "Total"],
        Object.entries(data.questionAnalysis).map(([topic, scores]) => [
          topic,
          scores.exam >= 0 ? `${(scores.exam * 100).toFixed(2)}%` : "N/A",
          scores.homework >= 0
            ? `${(scores.homework * 100).toFixed(2)}%`
            : "N/A",
          scores.quiz >= 0 ? `${(scores.quiz * 100).toFixed(2)}%` : "N/A",
          scores.project >= 0 ? `${(scores.project * 100).toFixed(2)}%` : "N/A",
          scores.total >= 0 ? `${(scores.total * 100).toFixed(2)}%` : "N/A",
        ])
      );
    }
  }

  addChart(chartData, label, type, color) {
    const canvas = this.newWindow.document.createElement("canvas");
    this.newWindow.document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: type,
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: label,
            data: chartData.data,
            fill: false,
            borderColor: color,
            backgroundColor: color,
            tension: 0.1,
          },
        ],
      },
    });
  }

  addTable(title, headers, body) {
    const table = this.newWindow.document.createElement("table");
    const thead = table.createTHead();
    const tbody = table.createTBody();
    const headerRow = thead.insertRow();

    headers.forEach((header) => {
      const th = this.newWindow.document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });

    body.forEach((rowData) => {
      const row = tbody.insertRow();
      rowData.forEach((cellData) => {
        const cell = row.insertCell();
        cell.textContent = cellData;
      });
    });

    this.newWindow.document.body.appendChild(
      this.newWindow.document.createElement("hr")
    ); // Add a separator
    const h2 = this.newWindow.document.createElement("h2");
    h2.textContent = title;
    this.newWindow.document.body.appendChild(h2);
    this.newWindow.document.body.appendChild(table);
  }
}
export default ReportPage;
