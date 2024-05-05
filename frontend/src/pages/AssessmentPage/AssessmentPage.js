import React, { useState } from "react";
import axios from "axios";
import "./assessmentPage.css"; // Importing the CSS file for styling
import TopBar from "../../components/Topbar/Topbar"; // Assuming TopBar is in the same directory

const AssessmentPage = () => {
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null);

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
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
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

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/assessment/uploadAssessment",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
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
      <div className="upload-assessment-container">
        <div
          className="drag-drop-box"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {file ? (
            <>
              <img src={getFileTypeIcon(file.name)} alt="file icon" />
              <span>{file.name}</span>
            </>
          ) : (
            "Drag and drop your file here"
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
