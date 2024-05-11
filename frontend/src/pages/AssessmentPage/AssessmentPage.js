import React, { useState } from "react";
import axios from "axios";
import "./assessmentPage.css";
import TopBar from "../../components/Topbar/Topbar";

const AssessmentPage = () => {
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState("assessment"); // 'assessment' or 'question'

  const getFileTypeIcon = (fileName) => {
    const extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    switch (extension) {
      case "docx": return "assets/docx-icon.png";
      case "pdf": return "assets/pdf-icon.png";
      case "png": return "assets/png-icon.png";
      case "jpeg":
      case "jpg": return "assets/jpeg-icon.png";
      default: return "assets/file-icon.png";
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length) {
      setFile(files[0]);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const uploadURL = uploadType === "assessment" 
      ? "http://localhost:3000/api/v1/assessment/uploadAssessment" 
      : "http://localhost:3000/api/v1/question/uploadQuestion";

    try {
      const response = await axios.post(uploadURL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("File uploaded successfully:", response.data);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file: " + error.message);
    }
  };

  return (
    <div className="assessment-page-container">
      <TopBar />
      <div className="upload-toggle-container">
        <button
          className={`toggle-button ${uploadType === "assessment" ? "active" : ""}`}
          onClick={() => setUploadType("assessment")}
        >
          Upload Assessment
        </button>
        <button
          className={`toggle-button ${uploadType === "question" ? "active" : ""}`}
          onClick={() => setUploadType("question")}
        >
          Upload Question
        </button>
      </div>
      <div className="upload-assessment-container">
        <div className="drag-drop-box" onDragOver={handleDragOver} onDrop={handleDrop}>
          {file ? (
            <>
              <img src={getFileTypeIcon(file.name)} alt="file icon" />
              <span>{file.name}</span>
            </>
          ) : (
            "Drag and drop your file here or click below to select a file"
          )}
        </div>
        <button
          className="file-select-button"
          onClick={() => document.getElementById("fileInput").click()}
        >
          Select File
        </button>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          accept=".docx,.pdf,.png,.jpeg"
          style={{ display: "none" }}
        />
        <button onClick={handleSubmit} disabled={!file}>
          Upload File
        </button>
      </div>
    </div>
  );
};

export default AssessmentPage;
