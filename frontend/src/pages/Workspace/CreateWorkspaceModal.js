import React, { useEffect, useState } from "react";
import "./toggleSwitch.css"; // Ensure this is correctly importing your CSS
import "../../components/Error/Error";
import Error from "../../components/Success/Success";
import axios from "axios";

export default function CreateWorkspaceModal({
  isOpen,
  setIsOpen,
  isCreateModalOpen,
  setCreateModalOpen,
}) {
  const token = localStorage.getItem("token");
  const [userInput, setUserInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [users, setUsers] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    async function fetch() {
      const response = await axios.get("http://localhost:3000/api/v1/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.data);
    }
    fetch();
  }, []);
  function toggleUserSelection(user) {
    if (selectedUsers.includes(user._id)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user._id]);
    }
  }

  function fetchUsers(query) {
    return users.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  function handleCloseModal() {
    setIsOpen(false);
    setIsPublic(false);
    setSelectedUsers([]);
    setSuggestions([]);
    setUserInput("");
    setWorkspaceName("");
    setCreateModalOpen(false);
  }
  function handleSearchChange(event) {
    const value = event.target.value;
    setUserInput(value);
    if (value.length > 0) {
      const filteredUsers = fetchUsers(value);
      setSuggestions(filteredUsers);
    } else {
      setSuggestions([]);
    }
  }
  function handleCreateWorkspace() {
    async function save() {
      const response = await axios.post(
        "http://localhost:3000/api/v1/workspace/createWorkspace",
        {
          workspace: {
            name: workspaceName,
            isPublic: isPublic,
            invited_users: selectedUsers,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCreateModalOpen(false);
      setIsOpen(false);

      alert("sucess");
    }
    save();
  }
  const handleShowSuccess = () => {
    setShowSuccess(true);
  };

  const handleShowError = () => {
    setShowError(true);
  };
  if (!isCreateModalOpen) return null;

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
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          width: "400px",
          maxWidth: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>Create Workspace</h2>
        <input
          type="text"
          value={workspaceName}
          onChange={(e) =>
            setWorkspaceName(e.target.value.trim() !== "" ? e.target.value : "")
          }
          placeholder="Workspace Name"
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        {showError && (
          <Error
            message="Workspace name cannot be empty"
            onClose={() => setShowError(false)}
          />
        )}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <label style={{ marginRight: "10px" }}>
            {!isPublic ? "Public Workspace" : "Private Workspace"}
          </label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="public"
              name="public"
              checked={isPublic}
              onChange={() => setIsPublic(!isPublic)}
            />
            <label
              htmlFor="public"
              className="toggle-switch-label"
              style={{ position: "relative" }}
            ></label>
          </div>
        </div>
        {/* Selected Users Display */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            marginBottom: "10px",
            alignItems: "center",
            overflowY: "auto", // Add overflow property here
            maxHeight: "100px",
          }}
        >
          {selectedUsers.map((userId) => {
            const user = users.find((u) => u._id === userId);
            return (
              <div
                key={userId}
                style={{
                  margin: "2px",
                  overflowY: "auto",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {user.name}
                <button
                  onClick={() => toggleUserSelection(user)}
                  style={{
                    marginLeft: "5px",
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        <input
          type="text"
          placeholder="Search to invite users"
          value={userInput}
          onChange={handleSearchChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              width: "100%",
              padding: 0,
              overflowY: "auto",
              maxHeight: "150px",
            }}
          >
            {suggestions.map((user) => (
              <li
                key={user._id}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => toggleUserSelection(user)}
              >
                {selectedUsers.includes(user._id) ? (
                  <span style={{ marginRight: "5px" }}>✓</span>
                ) : (
                  <span style={{ marginRight: "5px" }}>&nbsp;</span>
                )}
                {user.name}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={() => {
            handleCreateWorkspace();
          }}
          style={{
            display: "block",
            margin: "0 auto",
            padding: "10px 20px",
            marginTop: "5px",
            backgroundColor: "#4CAF50",
          }}
        >
          Create
        </button>
        <button
          onClick={handleCloseModal}
          style={{
            display: "block",
            margin: "0 auto",
            padding: "10px 20px",
            marginTop: "5px",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
