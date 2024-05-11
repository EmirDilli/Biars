import React, { useState, useEffect } from "react";
import Topbar from "../../components/Topbar/Topbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./homePage.css";

export default function HomePageStudent() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalContent, setModalContent] = useState("");
  const navigate = useNavigate();

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
        setClasses(response.data.data);
        console.log("Classes fetched successfully");
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    }

    fetchData();
  }, []);

  const handleActionClick = (event, classData, action) => {
    event.stopPropagation(); // Prevent the click from bubbling up to the parent
    setSelectedClass(classData);
    setModalContent(action);
  };

  const openWeekly = (classData) => {
    navigate(
      `/class/${classData.classSemester.class.code}/${classData.sectionNumber}/weekly`
    );
  };

  const handleCloseModal = () => {
    setSelectedClass(null);
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
                onClick={() => openWeekly(classData)} // Correctly passing the function
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
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>
              &times;
            </span>
            <h2>
              {modalContent} for {selectedClass.classSemester.class.name}
            </h2>
            {/* Render grades or attendance information here based on modalContent */}
          </div>
        </div>
      )}
    </>
  );
}
