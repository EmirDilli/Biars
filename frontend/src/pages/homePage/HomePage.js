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
    const type = localStorage.getItem("type");

    event.stopPropagation();
    setSelectedClass(classData);

    if (type === 3) {
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
    } else {
      if (action === "Grades")
        navigate(`/class/${classData.classSemester.class.code}/grading`);
    }
  };

  const handleCloseModal = () => {
    setSelectedClass(null);
  };
  const openWeekly = (classData) => {
    const type = localStorage.getItem("type");
    if (type == 3)
      navigate(
        `/class/${classData.classSemester.class.code}/${classData.sectionNumber}/weekly`
      );
    if (type == 1) {
      navigate(
        `/class/${classData.classSemester.class.code}/${classData.sectionNumber}/instWeekly`
      );
    }
  };
  function uploadQuestion(e, classData) {
    e.stopPropagation();
    navigate(`/class/${classData.classSemester.class.code}/assessment`);
  }
  function createAssessment(e, classData) {
    e.stopPropagation();
    navigate(`/class/${classData.classSemester.class.code}/question`);
  }
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
                  {classData.classSemester.class.code}-{classData.sectionNumber}{" "}
                  {classData.classSemester.class.name}
                </div>
                <div className="buttons-container">
                  <div className="buttons-container">
                    <div className="button-row">
                      <button
                        onClick={(e) =>
                          handleActionClick(e, classData, "Grades")
                        }
                      >
                        Grades
                      </button>
                      <button
                        onClick={(e) =>
                          handleActionClick(
                            e,
                            classData,
                            localStorage.getItem("type") === "3"
                              ? "Attendance"
                              : "Analysis"
                          )
                        }
                      >
                        {localStorage.getItem("type") === "3"
                          ? "Attendance"
                          : "Analysis"}
                      </button>
                    </div>
                    {localStorage.getItem("type") == 1 && (
                      <div className="button-row">
                        <button onClick={(e) => uploadQuestion(e, classData)}>
                          Upload Question
                        </button>
                        <button onClick={(e) => createAssessment(e, classData)}>
                          Create Assessment
                        </button>
                      </div>
                    )}
                  </div>
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
                  <div className="grade-date">
                    {formatDate(grade.assignment.date)}
                  </div>
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
const formatDate = (dateString) => {
  // Create a new Date object from the dateString
  const date = new Date(dateString);

  // Define options for formatting the date
  const options = { day: "2-digit", month: "2-digit", year: "2-digit" };

  // Format the date using Intl.DateTimeFormat
  const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(date);

  return formattedDate;
};
