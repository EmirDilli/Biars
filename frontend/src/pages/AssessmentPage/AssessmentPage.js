import React, { useState } from "react";
import axios from "axios";
import "./assessmentPage.css"; // Importing the CSS file for styling
import TopBar from "../../components/Topbar/Topbar"; // Assuming TopBar is in the same directory

const AssessmentPage = () => {
  const token = localStorage.getItem("token");
  const [files, setFiles] = useState([]);

  // Function to determine the image source based on the file extension
  const getFileTypeIcon = (fileName) => {
    const extension = fileName
      .substring(fileName.lastIndexOf(".") + 1)
      .toLowerCase();
    switch (extension) {
      case "docx":
        return "assets/docx-icon.png"; // Replace 'icons/docx-icon.png' with your actual path
      case "pdf":
        return "assets/pdf-icon.png"; // Replace 'icons/pdf-icon.png' with your actual path
      case "png":
        return "assets/png-icon.png"; // Replace 'icons/png-icon.png' with your actual path
      case "jpeg":
      case "jpg":
        return "assets/jpeg-icon.png"; // Replace 'icons/jpeg-icon.png' with your actual path
      default:
        return "assets/file-icon.png"; // Generic file icon for other file types
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length) {
      setFiles([...files, ...Array.from(droppedFiles)]);
    }
  };

  const handleFileChange = (event) => {
    setFiles([...files, ...Array.from(event.target.files)]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (files.length === 0) {
      alert("No files selected!");
      return;
    }
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Bearer your_bearer_token_here", // Replace with your actual bearer token
      },
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/assessment/uploadAssessment",
        formData,
        config
      );
      console.log("Files uploaded successfully:", response.data);
      alert("Files uploaded successfully!");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files: " + error.message);
    }
  };

  return (
    <div className="assessment-page-container">
      <TopBar />
      <div className="upload-assessment-container">
        <div
          className="drag-drop-box"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {files.length > 0 ? (
            <div className="files-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <img src={getFileTypeIcon(file.name)} alt="file icon" />
                  <span>{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="remove-btn"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          ) : (
            "Drag and drop your files here or click to select files"
          )}
        </div>
        <button
          className="file-select-button"
          onClick={() => document.getElementById("fileInput").click()}
        >
          Select Files
        </button>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          accept=".docx,.pdf,.png,.jpeg"
          multiple
          style={{ display: "none" }}
        />
        <button onClick={handleSubmit} disabled={files.length === 0}>
          Upload Files
        </button>
      </div>
    </div>
  );
};
export default AssessmentPage;
