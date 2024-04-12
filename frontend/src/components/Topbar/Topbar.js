import {
  CalendarToday,
  Chat,
  Notifications,
  Search,
} from "@mui/icons-material";
import "./topbar.css";
import React from "react";

export default function TopBar({ username, profilePicture }) {
  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <span className="logo">BAIRS</span>
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
          <div className="topbarIconItem">
            <Chat />
          </div>
          <div className="topbarIconItem">
            <Notifications />
          </div>
        </div>
        <div>
          <span className="topbarLink">emir şahin dilli</span>
        </div>
        <div className="topbarLinks">
          <img src="assets/logo.png" alt="Profile" className="topbarImg" />
        </div>
      </div>
    </div>
  );
}
