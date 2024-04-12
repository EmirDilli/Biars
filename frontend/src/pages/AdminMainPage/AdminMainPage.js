import React from "react";
// Assume you have an AdminPage.css file for styles

export const AdminMainPage = () => {
  // Example state for controlling the display of the alert box
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertContent, setAlertContent] = React.useState("");
  const [alertType, setAlertType] = React.useState("success"); // or 'error'

  return (
    <div>
      <div className="navbar">
        <a href="#home">Home</a>
        <a href="#user-management">User Management</a>
        <a href="#site-settings">Site Settings</a>
        <a href="#logout">Logout</a>
      </div>

      {showAlert && <div className={`alert ${alertType}`}>{alertContent}</div>}

      <div className="main">
        <h2>Welcome to the Admin Dashboard</h2>
        {/* Main content like forms, data tables go here */}
      </div>
    </div>
  );
};
