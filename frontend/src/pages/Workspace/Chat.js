import React, { useEffect, useState } from "react";
import Topbar from "../../components/Topbar/Topbar";
import CreateJoinWorkspaceModal from "./CreateJoinWorkspaceModal";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import { Info } from "@mui/icons-material";
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
  const [senderUser, setSenderUser] = useState(null);
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
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] =
    useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

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
        const userData = await axios.get(
          `http://localhost:3000/api/v1/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setWorkspaces(response.data.data);
        setSenderUser(userData.data.data);
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

  useEffect(() => {
    // Scroll to the bottom of the message list when messages change
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    const messageList = document.querySelector(".message-list");
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  };

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
      setFilteredChannels(response.data.data.channels);
      // Also set filtered channels
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

  const handleDmClick = (dmId) => {
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
      setSelectedChannel(null);
      setSelectedDm(dm.data.data);
      setReceiverUser(dm.data.data.user);
      setMessages(dm.data.data.messages);

      socket.emit("joinRoom", { roomId: dmId });
    }
    getDm();
  };
  function handleChangeChatInput(event) {
    setInputMessage(event.target.value);
  }
  function handleSendDm(event) {
    async function saveMessage() {
      if (event.key === "Enter" && inputMessage.trim()) {
        const newMessage = {
          text: inputMessage,
          date: new Date(),
          sender_id: userId,
          receiver_id: receiverUser._id,
        };
        socket.emit("sendMessage", {
          roomName: ` ${selectedDm._id}`,
          message: newMessage,
        });

        const result = await axios.post(
          "http://localhost:3000/api/v1/workspace/dm/saveMessage",
          { dm_id: selectedDm._id, message: newMessage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages([...messages, result.data.data]);
        setInputMessage("");
        event.preventDefault();
      }
    }
    saveMessage();
  }

  const handleSendChannel = (event) => {
    async function saveMessage() {
      if (event.key === "Enter" && inputMessage.trim() !== "") {
        const newMessage = {
          text: inputMessage,
          date: new Date(),
          sender_id: {
            _id: senderUser._id,
            name: senderUser.name,
          },
          receiver_id: null,
        };
        socket.emit("sendMessage", {
          roomName: ` ${selectedChannel._id}`,
          message: newMessage,
        });

        const result = await axios.post(
          "http://localhost:3000/api/v1/workspace/channel/saveMessage",
          { channel_id: selectedChannel._id, message: newMessage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        newMessage._id = result.data.data._id;
        setMessages([...messages, newMessage]);
        setInputMessage(""); // Clear input after sending
        event.preventDefault();
      }
    }
    saveMessage();
  };
  const handleChannelClick = (channel_id) => {
    async function fetchChannel() {
      const response = await axios.get(
        `http://localhost:3000/api/v1/workspace/channel/${channel_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSelectedChannel(response.data.data);
      setSelectedDm(null);
      setMessages(response.data.data.messages);
    }
    fetchChannel();
  };

  const handleOpenModal = () => {
    setIsCreateWorkspaceModalOpen(true);
  };

  const handleJoinWorkspace = () => {
    console.log("Join Workspace logic here");
    // Add your join logic here or navigate to the join page
  };

  const handleCreateWorkspace = () => {
    handleOpenCreateModal();
    // Add your create logic here or navigate to the create page
  };

  const handleOpenCreateModal = () => {
    setIsCreateWorkspaceModalOpen(false); // Close the main modal
    setCreateModalOpen(true); // Open the create modal
  };
  const handleCloseCreateModal = () => setCreateModalOpen(false);
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
            onClick={() => handleOpenModal(true)}
          >
            Join/Create Workspace
          </button>
          <CreateJoinWorkspaceModal
            isOpen={isCreateWorkspaceModalOpen}
            setIsOpen={setIsCreateWorkspaceModalOpen}
            onCreate={handleCreateWorkspace}
            onJoin={handleJoinWorkspace}
          />
          <CreateWorkspaceModal
            isOpen={isCreateWorkspaceModalOpen}
            setIsOpen={setIsCreateWorkspaceModalOpen}
            isCreateModalOpen={isCreateModalOpen}
            setCreateModalOpen={setCreateModalOpen}
          />
        </div>
      </div>
      <div className="chat-container">
        {selectedDm && (
          <>
            <div className="chat-header">
              <img
                className="chat-receiver-image"
                src="assets/logo.png"
                alt="Chat Receiver"
              />
              <div className="receiver-name">
                {selectedDm ? selectedDm.user.name : "Dm Name"}
              </div>
            </div>
            <div className="message-list">
              {messages.map((message) => {
                return (
                  <div
                    key={message._id}
                    className={`message ${
                      message.sender_id === receiverUser._id
                        ? "received"
                        : "sent"
                    }`}
                  >
                    <div className="message-content">{message.text}</div>
                    <div className="message-info">
                      <span className="message-date">
                        {new Date(message.date).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="input-chat">
              <input
                type="text"
                value={inputMessage}
                onChange={handleChangeChatInput}
                onKeyPress={handleSendDm}
                placeholder="Type a message..."
              />
            </div>
          </>
        )}
        {selectedChannel && (
          <>
            <div className="chat-header-channel">
              <h1>{selectedChannel.name}</h1>
              <button className="info-button-channel">
                <Info />
              </button>
            </div>
            <div className="message-list">
              {messages.map((message) => (
                <div key={message._id} className="message-container">
                  <div
                    className={`user-info-channel ${
                      message.sender_id._id === senderUser._id
                        ? "sent-info"
                        : "received-info"
                    }`}
                  >
                    <img
                      className="user-image-channel"
                      src={"assets/logo.png"} // Fallback to default image if none provided
                      alt={message.sender_id.name}
                    />
                    <span className="user-name-channel">
                      {message.sender_id.name}
                    </span>
                  </div>
                  <div
                    className={`message-channel ${
                      message.sender_id._id === senderUser._id
                        ? "sent"
                        : "received"
                    }`}
                  >
                    {message.text}
                    <span className="message-date-channel">
                      {new Date(message.date).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="input-container-channel">
              <input
                type="text"
                value={inputMessage}
                onChange={handleChangeChatInput}
                onKeyPress={handleSendChannel}
                placeholder="Type a message..."
              />
            </div>
          </>
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
                <ChannelsList
                  channels={filteredChannels}
                  onChannelClick={handleChannelClick}
                />
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

function ChannelsList({ channels, onChannelClick }) {
  return (
    <div className="channels-section">
      {channels.map((channel, index) => (
        <div
          key={index}
          className="channel-item"
          onClick={() => onChannelClick(channel._id)}
        >
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
