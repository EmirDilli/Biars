import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import "./weekly.css";
import { Assignment, Add } from "@mui/icons-material";

const ContentItem = ({ item }) => {
  const getIcon = (type) => {
    switch (type) {
      case "assignment":
        return <Assignment style={{ width: "24px" }} />;
      case "pdf":
        return (
          <img
            src={"/assets/pdf-icon.png"}
            alt="pdf"
            style={{ width: "24px" }}
          />
        );
      case "docx":
        return (
          <img
            src={"/assets/docx-icon.png"}
            alt="docx"
            style={{ width: "24px" }}
          />
        );
      default:
        return null;
    }
  };

  if (item.type === "link") {
    return (
      <div
        style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}
      >
        {getIcon(item.linkType)}
        <a
          href={item.value}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#0645AD",
            textDecoration: "none",
            marginLeft: "8px",
          }}
        >
          {item.description}
        </a>
      </div>
    );
  }

  return <p style={{ margin: "10px 0" }}>{item.value}</p>;
};

const WeekSection = ({ week, onAddContent }) => {
  const format = (date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-GB", {
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="week-section">
      <div className="week-header">
        <h2>
          {format(week.startDate)} - {format(week.endDate)}
        </h2>
        <button
          onClick={() => onAddContent(week.weekId)}
          className="add-content-btn"
          title="Add Content"
        >
          <Add style={{ fontSize: "1rem" }} />
        </button>
      </div>
      {week.content.map((item, index) => (
        <ContentItem key={index} item={item} />
      ))}
    </div>
  );
};

const WeeklySchedule = () => {
  const { className, sectionNumber } = useParams();
  const [weeks, setWeeks] = useState([]);
  const [courseContent, setContent] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentWeekId, setCurrentWeekId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const endpoint = `http://localhost:3000/api/v1/class/${className}/${sectionNumber}/weekly`;
    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setWeeks(response.data.weeks);
        setContent(response.data.content);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [className, sectionNumber]);

  const handleAddContentClick = (weekId) => {
    setCurrentWeekId(weekId);
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

  const handleModalSubmit = ({ weekId, contentType, textValue, file }) => {
    console.log("Submitted data:", { weekId, contentType, textValue, file });
    // Implement the API call to save the new content to the server here
  };

  const weeksWithContent = weeks.map((week) => ({
    ...week,
    content: courseContent.find((c) => c.weekId === week.weekId)?.entries || [],
  }));

  return (
    <div>
      {weeksWithContent.map((week, index) => (
        <WeekSection
          key={index}
          week={week}
          onAddContent={handleAddContentClick}
        />
      ))}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          weekId={currentWeekId}
        />
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose, onSubmit, weekId }) => {
  const [contentType, setContentType] = useState("text");
  const [textValue, setTextValue] = useState("");
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ weekId, contentType, textValue, file });
    onClose(); // Close modal after submission
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <form onSubmit={handleSubmit}>
          <label>
            Content Type:
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="file">File</option>
              <option value="assignment">Assignment</option>
            </select>
          </label>
          {contentType === "text" && (
            <label>
              Text:
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
            </label>
          )}
          {(contentType === "file" || contentType === "assignment") && (
            <label>
              File:
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </label>
          )}
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default WeeklySchedule;
