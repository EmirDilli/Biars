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
  const [gradesFinal, setGradesFinal] = useState([]);

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
        console.log(response.data);
        setClasses(response.data.data);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    }

    fetchData();
  }, [userId, token]);

  const handleActionClick = (event, classData, action) => {
    event.stopPropagation();
    setSelectedClass(classData);

    axios
      .get(
        `http://localhost:3000/api/v1/class/${classData.classSemester.class.code}/getGrades`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        const gradesArr = [];
        for (let i = 0; i < response.data.grades.length; i++) {
          if (response.data.grades[i].questionsGrades.length !== 0) {
            gradesArr.push({
              assignment: response.data.assessments.assessments[i].assessment,
              score: response.data.grades[i].total,
            });
          }
        }
        setGradesFinal(gradesArr);
        console.log(gradesArr);
        console.log(gradesFinal);
      })
      .catch((error) => {
        console.error("Error fetching grades:", error);
        // Handle error if necessary
      });
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

      {selectedClass && (
        <div className="modal-grades">
          <div className="modal-content-grades">
            <h2>
              {modalContent} for {selectedClass.classSemester.class.name}
            </h2>
            {modalContent === "Grades" &&
              gradesFinal &&
              gradesFinal.length > 0 &&
              gradesFinal.map((grade, index) => (
                <div className="grade-box" key={index}>
                  <div className="grade-date">{grade.assignment.date}</div>
                  <div className="grade-score">
                    {grade.assignment.name}: {grade.score}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
