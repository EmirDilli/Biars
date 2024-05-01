import React, { useEffect, useState } from "react";
import Topbar from "../../components/Topbar/Topbar";
import io from "socket.io-client";

import "./chat.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
let socket;
function Workspace() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState(channels);
  const [searchQuery, setSearchQuery] = useState("");
  const [directMessages, setDirectMessages] = useState([]);
  const [searchQueryDM, setSearchQueryDM] = useState("");
  const [filteredDMs, setFilteredDMs] = useState(directMessages);
  const [selectedDm, setSelectedDm] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [receiverUser, setReceiverUser] = useState(null);
  const [inputMessage, setInputMessage] = useState(""); // State for storing input field text
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/workspace/getWorkspaces",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setWorkspaces(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    socket = io("http://localhost:3003"); // Assuming your server is on port 3003

    // Listen for messages after joining a room
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleWorkspaceSelection = (workspace) => {
    setSelectedWorkspace(workspace);
    setSidebarOpen(false);
    async function getWorkspaceInfo() {
      const response = await axios.get(
        `http://localhost:3000/api/v1/workspace/${workspace._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setChannels(response.data.data.channels);
      setDirectMessages(response.data.data.dms);
      setFilteredChannels(response.data.data.channels); // Also set filtered channels
      setFilteredDMs(response.data.data.dms);
    }
    getWorkspaceInfo();
  };

  const handleChannelSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilteredChannels(
      channels.filter((channel) =>
        channel.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleDmSearch = (e) => {
    const query = e.target.value;
    setSearchQueryDM(query);
    setFilteredDMs(
      directMessages.filter((dm) =>
        dm.user.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleDmClick = (dmId, userId) => {
    async function getDm() {
      const dm = await axios.get(
        `http://localhost:3000/api/v1/workspace/dm/${dmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSelectedDm(dm.data.data);
      setReceiverUser(dm.data.data.user);
      socket.emit("joinRoom", { roomId: dmId });
    }
    getDm();
  };
  function handleChangeChatInput(event) {
    setInputMessage(event.target.value);
  }
  function handleKeyPress(event) {
    if (event.key === "Enter" && inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1, // Simple id assignment, might need unique id generation in production
        text: inputMessage,
        timestamp: new Date(),
        senderId: userId,
      };
      socket.emit("sendMessage", {
        roomName: `dm_${selectedDm._id}`,
        inputMessage,
      });

      setMessages([...messages, inputMessage]);
      setInputMessage("");
      event.preventDefault();
    }
  }

  const handleOpenModal = () => {};
  const handleCreateChannel = () => {};
  const handleInviteUsers = () => {};

  return (
    <div className="chat">
      <Topbar />
      <div className="contents-workspace"></div>
      <div className="sidebar-container">
        <div className="workspace-list-container">
          <h2 className="workspace-header">Workspaces</h2>
          {workspaces.map((workspace) => (
            <div
              key={workspace._id}
              className="workspace-item"
              onClick={() => handleWorkspaceSelection(workspace)}
            >
              {workspace.name}
            </div>
          ))}
        </div>
        <div className="fixed-button-container">
          <button
            className="open-modal-button"
            onClick={() => handleOpenModal("initial")}
          >
            Join/Create Workspace
          </button>
        </div>
      </div>
      <div className="chat-container">
        {selectedChannel || selectedDm ? (
          <>
            <div className="chat-header">
              <img
                className="chat-receiver-image"
                src="assets/logo.png"
                alt="Chat Receiver"
              />
              <div className="receiver-name">
                {selectedDm ? selectedDm.user.name : "Channel Name"}
              </div>
            </div>
            <div className="messageList">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.senderId === receiverUser ? "received" : "sent"
                  }`}
                >
                  <div className="message-content">{message.text}</div>
                  <div className="message-info">
                    <span className="message-date">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="input-chat">
              <input
                type="text"
                value={inputMessage}
                onChange={handleChangeChatInput}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
              />
            </div>
          </>
        ) : (
          <div style={{ marginTop: "100px", textAlign: "center" }}>
            Select DM or Channel...
          </div>
        )}
      </div>
      <div className={`main-content`}>
        {selectedWorkspace ? (
          <>
            <div className="selected-workspace">
              <h2>{selectedWorkspace.name}</h2>
            </div>
            <div className="horizontal-layout">
              <div className="workspace-section channels-section">
                <div className="section-header-with-search">
                  <h3>Channels</h3>
                  <input
                    type="text"
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={handleChannelSearch}
                    className="search-input"
                  />
                </div>
                <ChannelsList channels={filteredChannels} />
                <button
                  className="section-footer-button"
                  onClick={handleCreateChannel}
                >
                  Create Channel
                </button>
              </div>
              <div className="workspace-section direct-messages-section">
                <div className="section-header-with-search">
                  <h3>DM</h3>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQueryDM}
                    onChange={handleDmSearch}
                    className="search-input"
                  />
                </div>
                <DirectMessagesList
                  directMessages={filteredDMs}
                  onDmClick={handleDmClick}
                />
                <button
                  className="section-footer-button"
                  onClick={handleInviteUsers}
                >
                  Send DM
                </button>
              </div>
            </div>
          </>
        ) : (
          <div>Select a workspace to see its channels and direct messages.</div>
        )}
      </div>
    </div>
  );
}

function ChannelsList({ channels }) {
  return (
    <div className="channels-section">
      {channels.map((channel) => (
        <div key={channel._id} className="channel-item">
          {channel.name}
        </div>
      ))}
    </div>
  );
}

function DirectMessagesList({ directMessages, onDmClick }) {
  return (
    <div className="direct-messages-section">
      {directMessages.map((dm, index) => (
        <div
          key={index}
          className="dm-item"
          onClick={() => onDmClick(dm._id, dm.user._id)}
        >
          {dm.user.name}
        </div>
      ))}
    </div>
  );
}

export default Workspace;
