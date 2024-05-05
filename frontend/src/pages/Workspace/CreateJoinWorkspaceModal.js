import React, { useState } from "react";

// Simple modal component
export default function Modal({ isOpen, setIsOpen, onCreate, onJoin }) {
  function closeModal() {
    setIsOpen(false);
  }

  if (!isOpen) return null;

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
          width: "300px", // Ensures the modal is centered and contained
        }}
      >
        <h2 style={{ textAlign: "center", marginTop: "20px" }}>
          Join/Create Workspace
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: "20px",
            marginBottom: "20px", // Adds space above the close button
          }}
        >
          <button
            onClick={onJoin}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "5px",
              backgroundColor: "#4CAF50",
              marginLeft: "5px",
              marginRight: "5px",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Join Workspace
          </button>
          <button
            onClick={onCreate}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "5px",
              backgroundColor: "#008CBA",
              marginLeft: "5px",
              marginRight: "5px",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Create Workspace
          </button>
        </div>
        <button
          onClick={closeModal}
          style={{
            display: "block", // Centers the button in the modal
            margin: "0 auto", // Auto margins for horizontal centering
            padding: "10px 20px",
            fontSize: "16px",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
