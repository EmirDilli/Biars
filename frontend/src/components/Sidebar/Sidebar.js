import { Event, Book, SmartToy } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const openCalendar = () => {
    navigate("/event");
  };

  const openChatbot = () => {
    navigate("/chatbot");
  };

  const openSchedule = () => {
    navigate("/schedule");
  };

  return (
    <div className="sidebar" style={{ marginTop: "75px" }}>
      <div className="sidebarWrapper">
        <ul className="sidebarList">
          <li className="sidebarListItem" onClick={openCalendar}>
            <Event className="sidebarIcon" />
            <span className="sidebarListItemText">Calendar</span>
          </li>

          <li className="sidebarListItem" onClick={openChatbot}>
            <SmartToy className="sidebarIcon" />
            <span className="sidebarListItemText">Chatbot</span>
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
};

export default Sidebar;
