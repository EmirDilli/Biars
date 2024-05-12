import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import TopBar from "../../components/Topbar/Topbar";
import "./uploadAssessment.css";

const AssessmentPage = () => {
  const { className, sectionNumber, assignment } = useParams();
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null);
  const [existingFileURL, setExistingFileURL] = useState(null);
  const [fileURLs, setFileURLs] = useState([]);
  const [changesMade, setChangesMade] = useState(false);

  useEffect(() => {
    async function fetch() {
      const response = await axios.get(
        `http://localhost:3000/api/v1/assessment/${className}/${sectionNumber}/${assignment}/getAssignment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      // Check for existing submissions
      if (response.data.filterSubmission) {
        setExistingFileURL(response.data.filterSubmission);
        console.log(existingFileURL);
        setChangesMade(true); // Consider existing submission as an initial state that can be saved
      }
      setFileURLs(response.data.filteredUrls);
    }
    fetch();
  }, [className, sectionNumber, assignment, token]);

  const getFileTypeIcon = (url) => {
    const extension = url.split(".").pop().toLowerCase();
    return `/assets/${extension}-icon.png`;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExistingFileURL(null);
      setChangesMade(true);
    }
  };

  const handleRemoveFile = (event) => {
    event.stopPropagation(); // Prevent triggering the input click
    setFile(null);
    setExistingFileURL(null);
    setChangesMade(true);
  };

  const handleSave = async () => {
    if (!file && !existingFileURL) {
      alert("No file selected!");
      return;
    }
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }

    try {
      await axios.post(
        `http://localhost:3000/api/v1/assessment/${className}/${sectionNumber}/${assignment}/uploadAssessment`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Changes saved successfully!");
      setExistingFileURL(file ? file.name : null); // Update existing file state
      setFile(null);
      setChangesMade(false);
    } catch (error) {
      alert("Error saving changes: " + error.message);
    }
  };

  return (
    <div className="assessment-page-container">
      <TopBar />
      <h1
        className="assessment-title"
        style={{ fontSize: "24px", textAlign: "center" }}
      >
        {decodeURIComponent(assignment)}
      </h1>
      <div className="file-links-container">
        {fileURLs.map((url, index) => (
          <div key={index} className="file-link">
            <img src={getFileTypeIcon(url)} alt="File icon" />
            <a
              href={"https://cs319.fra1.digitaloceanspaces.com/" + url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {url.split("/").pop()}
            </a>
          </div>
        ))}
      </div>
      <div className="upload-assessment-container">
        <div
          className="drag-drop-box"
          onClick={() => document.getElementById("fileInput").click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileChange(e);
          }}
        >
          {existingFileURL || file ? (
            <div className="file-item">
              <img
                src={getFileTypeIcon(existingFileURL || file.name)}
                alt="File icon"
              />
              <span>
                {existingFileURL ? existingFileURL.split("/").pop() : file.name}
              </span>
              <button onClick={handleRemoveFile} className="remove-btn">
                Remove
              </button>
            </div>
          ) : (
            <p>Drag and drop your file here or click to select files</p>
          )}
        </div>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          accept=".docx,.pdf,.png,.jpeg"
          style={{ display: "none" }}
        />
        <button onClick={handleSave} disabled={!changesMade}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AssessmentPage;
