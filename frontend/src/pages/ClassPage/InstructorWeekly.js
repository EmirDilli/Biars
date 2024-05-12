import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./weekly.css";
import { Assignment, Add } from "@mui/icons-material";
import Topbar from "../../components/Topbar/Topbar";

const ContentItem = ({ item }) => {
  const navigate = useNavigate();

  const handleAssignmentClick = () => {
    const path = `/class/${item.value.split('/')[item.value.split('/').length - 3]}/${item.value.split('/')[item.value.split('/').length - 1]}/submissions`;
    navigate(path);
  };

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

  console.log(item.linkType);
  if (item.type === "link" && item.linkType !== "assignment") {
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

  if (item.type === "link" && item.linkType === "assignment") {
    return (
      <div
        style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}
      >
        {getIcon(item.linkType)}
        <li
          onClick={handleAssignmentClick}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#0645AD",
            textDecoration: "none",
            marginLeft: "8px",
          }}
        >
          {item.description}
        </li>
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
        console.log(weeks);
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
      <Topbar />
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
          classCode={className}
          sectionNumber={sectionNumber}
        />
      )}
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  weekId,
  classCode,
  sectionNumber,
}) => {
  const [contentType, setContentType] = useState("text");
  const [textValue, setTextValue] = useState("");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const token = localStorage.getItem("token");

  if (!isOpen) return null;

  const handleSingleFileChange = (event) => {
    if (event.target.files[0]) {
      setFile({
        fileData: event.target.files[0],
        fileName: event.target.files[0].name,
      });
    }
  };

  const handleMultipleFileChange = (event) => {
    setFiles(
      Array.from(event.target.files).map((file) => ({
        fileData: file,
        fileName: file.name,
      }))
    );
  };

  const handleFileNameChange = (index, newName) => {
    if (contentType === "assignment") {
      const updatedFiles = files.map((f, idx) =>
        idx === index ? { ...f, fileName: newName } : f
      );
      setFiles(updatedFiles);
    } else if (contentType === "file" && index === 0) {
      setFile({ ...file, fileName: newName });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("weekId", weekId);
    formData.append("type", contentType);

    if (contentType === "text") {
      formData.append("text", textValue);
    } else if (contentType === "file" && file) {
      formData.append("files", file.fileData, file.fileName);
      formData.append("name", file.fileName);
    } else if (contentType === "assignment") {
      files.forEach((file) => {
        formData.append("files", file.fileData, file.fileName);
      });
      formData.append("name", assignmentName);
    }

    try {
      const response = await axios({
        method: "post",
        url: `http://localhost:3000/api/v1/class/${classCode}/${sectionNumber}/addWeekly`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      console.log("Success:", response.data);
      onSubmit(); // Optionally pass any necessary data
      onClose();
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="modal-close" onClick={onClose}>
          &times;
        </span>
        <form onSubmit={handleSubmit}>
          <label className="modal-label">
            Content Type:
            <select
              className="modal-select"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="file">File</option>
              <option value="assignment">Assignment</option>
            </select>
          </label>
          {contentType === "text" && (
            <label className="modal-label">
              Text:
              <textarea
                className="modal-textarea"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
            </label>
          )}
          {contentType === "file" && (
            <>
              <input type="file" onChange={handleSingleFileChange} />
              {file && (
                <>
                  <input
                    className="modal-input"
                    type="text"
                    value={file.fileName}
                    onChange={(e) => handleFileNameChange(0, e.target.value)}
                  />
                </>
              )}
            </>
          )}
          {contentType === "assignment" && (
            <>
              <input type="file" multiple onChange={handleMultipleFileChange} />
              {files.map((file, index) => (
                <div key={index} style={{ marginTop: "10px" }}>
                  <input
                    className="modal-input"
                    type="text"
                    value={file.fileName}
                    onChange={(e) =>
                      handleFileNameChange(index, e.target.value)
                    }
                  />
                </div>
              ))}
              <label className="modal-label">
                Assignment Name:
                <input
                  className="modal-input"
                  type="text"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                />
              </label>
              <label className="modal-label">
                Assignment Description:
                <textarea
                  className="modal-textarea"
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                />
              </label>
            </>
          )}
          <button className="modal-button" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
export default WeeklySchedule;
