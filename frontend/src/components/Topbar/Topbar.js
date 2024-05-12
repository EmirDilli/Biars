import React, { useState } from "react";
import { Chat, Notifications, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "./topbar.css";

export default function TopBar({ username, profilePicture }) {
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  function openWorkspace() {
    navigate("/workspace");
  }

  function openMain() {
    console.log("hay");
    navigate("/main");
  }

  function handleProfileClick() {
    setShowLogoutPopup(true);
  }

  function handleLogout() {
    // Perform logout logic here...
    console.log("Logout clicked");
    // After logout, you might want to redirect to the login page
    // navigate("/login");
  }

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <span className="logo" onClick={openMain}>
          BAIRS
        </span>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for user, class or event"
            className="searchInput"
          />
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarIcons">
          <div className="topbarIconItem" onClick={openWorkspace}>
            <Chat />
          </div>
          <div className="topbarIconItem">
            <Notifications />
          </div>
        </div>
        <div className="topbarProfile" onClick={handleProfileClick}>
          <span className="topbarLink">{username}</span>
          <img src={profilePicture} alt="Profile" className="topbarImg" />
        </div>
      </div>
      {showLogoutPopup && (
        <div className="logoutPopup">
          <div className="logoutContent">
            <p>Are you sure you want to logout?</p>
            <div className="logoutButtons">
              <button onClick={handleLogout}>Logout</button>
              <button onClick={() => setShowLogoutPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
