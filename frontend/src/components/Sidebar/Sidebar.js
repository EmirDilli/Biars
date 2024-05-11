import { RssFeed, Book } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  function openSchedule() {
    navigate("/schedule");
  }
  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <ul className="sidebarList">
          <li className="sidebarListItem">
            <RssFeed className="sidebarIcon" />
            <span className="sidebarListItemText">Feed</span>
          </li>

          <li className="sidebarListItem">
            <RssFeed className="sidebarIcon" />
            <span className="sidebarListItemText">Feed</span>
          </li>

          <li className="sidebarListItem" onClick={openSchedule}>
            <Book className="sidebarIcon" />
            <span className="sidebarListItemText">Schedule</span>
          </li>
        </ul>
        <hr className="sidebarHr" />
      </div>
    </div>
  );
}
