import {
  Event,
  Book,
  SmartToy,
  Analytics,
  Assessment,
  Upload,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const type = localStorage.getItem("type");
  const openCalendar = () => {
    navigate("/event");
  };

  const openChatbot = () => {
    navigate("/chatbot");
  };

  const openSchedule = () => {
    navigate("/schedule");
  };

  const uploadQuestion = () => {
    navigate("/schedule");
  };

  const createAssessment = () => {
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
          {type == 1 && (
            <li className="sidebarListItem" onClick={uploadQuestion}>
              <Analytics className="sidebarIcon" />
              <span className="sidebarListItemText">Upload Question</span>
            </li>
          )}
          {type == 1 && (
            <li className="sidebarListItem" onClick={createAssessment}>
              <Assessment className="sidebarIcon" />
              <span className="sidebarListItemText">Create Assessment</span>
            </li>
          )}
        </ul>
        <hr className="sidebarHr" />
      </div>
    </div>
  );
};

export default Sidebar;