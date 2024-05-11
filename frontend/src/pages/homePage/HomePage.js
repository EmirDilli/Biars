import React, { useState, useEffect } from "react";
import Topbar from "../../components/Topbar/Topbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./homePage.css";

export default function HomePageStudent() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalContent, setModalContent] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/user/${userId}/classes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const classesWithGrades = response.data.data.map((cls) => ({
          ...cls,
          grades: [
            { assignment: "Homework 1", score: "10/20", date: "01-05-2023" },
            { assignment: "Quiz 1", score: "15/20", date: "05-08-2023" },
            { assignment: "Midterm", score: "18/20", date: "05-15-2023" },
          ],
        }));
        setClasses(classesWithGrades);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    }

    fetchData();
  }, [userId, token]);

  const handleActionClick = (event, classData, action) => {
    event.stopPropagation();
    setSelectedClass(classData);
    setModalContent(action);
  };

  const handleCloseModal = () => {
    setSelectedClass(null);
  };
  const openWeekly = (classData) => {
    navigate(
      `/class/${classData.classSemester.class.code}/${classData.sectionNumber}/weekly`
    );
  };

  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />
        <div className="dashboard">
          <div className="grid-container">
            {classes.map((classData) => (
              <div
                className="class-box"
                key={classData.id}
                onClick={() => openWeekly(classData)}
              >
                <div className="class-info">
                  {classData.classSemester.class.code} -{" "}
                  {classData.classSemester.class.name}
                </div>
                <div className="buttons-container">
                  <button
                    onClick={(e) => handleActionClick(e, classData, "Grades")}
                  >
                    Grades
                  </button>
                  <button
                    onClick={(e) =>
                      handleActionClick(e, classData, "Attendance")
                    }
                  >
                    Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for displaying grades or attendance */}
      {selectedClass && (
        <div className="modal-grades">
          <div className="modal-content-grades">
            <span className="close-grades" onClick={handleCloseModal}>
              &times;
            </span>
            <h2>
              {modalContent} for {selectedClass.classSemester.class.name}
            </h2>
            {modalContent === "Grades" &&
              selectedClass.grades.map((grade, index) => (
                <div className="grade-box" key={index}>
                  <div className="grade-date">{grade.date}</div>
                  <div className="grade-score">
                    {grade.assignment}: {grade.score}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
