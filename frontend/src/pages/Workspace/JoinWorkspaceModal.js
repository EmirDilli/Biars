import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SearchWorkspacePopup({
  isOpen,
  setIsOpen,
  isJoinModalOpen,
  setJoinModalOpen,
}) {
  const token = localStorage.getItem("token");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    async function fetch() {
      const response = await axios.get(
        `http://localhost:3000/api/v1/workspaces/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setWorkspaces(response.data.data);
    }
    fetch();
  }, []);

  function onClose() {
    setIsOpen(false);
    setJoinModalOpen(false);
  }

  const handleWorkspaceClick = (workspace) => {
    setSelectedWorkspace(workspace);
  };

  // Filter workspaces based on search term
  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function joinWorkspace(workspace) {}

  if (!isJoinModalOpen) return null;
  const renderWorkspaces = () => {
    return filteredWorkspaces.map((workspace) => (
      <div
        key={workspace._id}
        onClick={() => handleWorkspaceClick(workspace)}
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
          marginBottom: "10px",
          cursor: "pointer",
          backgroundColor:
            selectedWorkspace?._id === workspace._id
              ? "#f0f0f0"
              : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "90%",
        }}
      >
        <span
          style={{
            marginRight: "10px",
            whiteSpace: "nowrap", // Prevent text from wrapping
            overflow: "hidden", // Hide overflowing text
            textOverflow: "ellipsis", // Show ellipsis for overflowed text
          }}
        >
          {workspace.name}
        </span>
        {selectedWorkspace?._id === workspace._id && (
          <button
            onClick={() => {
              joinWorkspace(workspace);
            }}
            style={{
              padding: "8px 12px",
              fontSize: "14px",
              width: "fit-content",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Join
          </button>
        )}
      </div>
    ));
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          width: "300px",
        }}
      >
        <h2 style={{ textAlign: "center", marginTop: "20px" }}>
          Search Workspaces
        </h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for workspaces"
          style={{
            padding: "8px",
            marginBottom: "10px",
            width: "100%",
            boxSizing: "border-box", // Adjust width including padding
          }}
        />
        {renderWorkspaces()}
        <button
          onClick={onClose}
          style={{
            display: "block",
            margin: "0 auto",
            padding: "10px 20px",
            fontSize: "16px",
            color: "white",
            border: "none",
            cursor: "pointer",

            borderRadius: "5px",
            marginTop: "20px",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
