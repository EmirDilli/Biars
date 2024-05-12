import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./submission.css";

const getIcon = (fileName) => {
  const fileType = fileName.split(".").pop();
  switch (fileType) {
    case "pdf":
      return (
        <img src={"/assets/pdf-icon.png"} alt="PDF" className="file-icon" />
      );
    case "docx":
      return (
        <img src={"/assets/docx-icon.png"} alt="DOCX" className="file-icon" />
      );
    default:
      return null;
  }
};

const Submissions = () => {
  const { className, sectionNumber, assignment } = useParams();
  const token = localStorage.getItem("token");
  const [names, setNames] = useState([]);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("");
  async function fetch() {
    const response = await axios.get(
      `http://localhost:3000/api/v1/assessment/${className}/${sectionNumber}/${assignment}/getAllAssignments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    setNames(response.data);
  }

  fetch();

  const sections = names
    .map((name) => {
      const parts = name.split("-");
      return parts[3];
    })
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => parseInt(a) - parseInt(b));

  const filteredNames = names.filter((name) => {
    const nameLower = name.toLowerCase();
    return (
      nameLower.includes(search.toLowerCase()) &&
      (!section || name.includes(`-${section}-`))
    );
  });

  return (
    <div className="submissions-container">
      <h1>{`${className} ${assignment} Submissions`}</h1>
      <input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <select
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="section-select"
      >
        <option value="">All Sections</option>
        {sections.map((sec) => (
          <option key={sec} value={sec}>
            {sec}
          </option>
        ))}
      </select>
      <ul>
        {filteredNames.map((name, index) => (
          <li key={index} className="name-item">
            <a
              href={`https://cs319.fra1.digitaloceanspaces.com/${name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getIcon(name)} {name.split("/")[name.split("/").length - 1]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Submissions;
