

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showActionButton, setShowActionButton] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalInput, setModalInput] = useState("");

  let location = useLocation();
  let courseName = location.state;
  
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchData = async () => {
      const url = `http://localhost:3000/api/v1/chatbot/getPastChat`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, courseName }) 
        });

        const msgArray = await response.json();
        //console.log(msgArray);
        const msgObjects = msgArray.map(msg => ({
          text: msg.text,
          sender: msg.sentBy === 0 ? 'User' : 'AI'
        }));

        setMessages(msgObjects || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessages([]);
      }
    };

    fetchData();
  }, [userId, courseName]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const messageArea = document.querySelector('.messageArea');
        if (messageArea && messageArea.contains(range.commonAncestorContainer)) {
          const rect = range.getBoundingClientRect();
          if (selection.toString().length > 0) {
            setShowActionButton(true);
            setSelectedText(selection.toString());
            setButtonPosition({ x: rect.right, y: rect.bottom });
          } else {
            setShowActionButton(false);
          }
        } else {
          setShowActionButton(false);
        }
      } else {
        setShowActionButton(false);
      }
    };

    document.addEventListener("mouseup", handleSelectionChange);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("mouseup", handleSelectionChange);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      let query = input.trim();
      setInput('');
      setMessages([...messages, { text: "User: \n" + input, sender: 'User' }]);
      const url = `http://localhost:3000/api/v1/chatbot/sendQuery`;
      const response = await fetch(url, {
      method: 'POST', // Set the method to POST
      headers: {
        'Content-Type': 'application/json', // Specify the content type
      },
      body: JSON.stringify({ query: query, userId: userId, courseName: courseName }) // Send cls as JSON in the request body
    });

    let aiMsg = await response.json();

      
      
      setTimeout(() => {
        setMessages(messages => [...messages, { text: `AI: \n ${aiMsg}`, sender: 'AI' }]);
      }, 500);
    }
  };

  const handleDeletePastChat = async () => {
    let url = `http://localhost:3000/api/v1/chatbot/deletePastChat`;
    let response = await fetch(url, {
      method: 'POST', // Set the method to POST
      headers: {
        'Content-Type': 'application/json', // Specify the content type
      },
      body: JSON.stringify({userId: userId, courseName: courseName })
    });
    let stat = await response.status;
    setMessages([]);

  }

/*   const handleActionOnText = () => {
    console.log("Perform action on selected text:", selectedText);
    setShowActionButton(false);
    window.getSelection().removeAllRanges(); // Optionally clear selection
  }; */

  const handleActionOnText = () => {
    setModalInput(selectedText);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveModal = () => {
    //console.log("Saved text:", modalInput);
    setShowModal(false);
  };

  const handleModalInputChange = (e) => {
    setModalInput(e.target.value);
  };

  return (
    <div className="chatPage">
      <div className="chatHeader">
        Class Chatbot
        <button onClick={handleDeletePastChat}>Delete Chat</button>
      </div>
      <div className="messageArea">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      {showActionButton && (
        <button
          className="actionButtonHighlight"
          onClick={handleActionOnText}
          style={{ position: 'absolute', left: `${buttonPosition.x}px`, top: `${buttonPosition.y}px` }}
        >
          Do Something With Text
        </button>
      )}
      {showModal && (
        <div className="modal" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 100 }}>
          <h2>Edit Text</h2>
          <textarea
            value={modalInput}
            onChange={handleModalInputChange}
            style={{ width: '100%', height: '100px' }} // Adjust height as needed
          />
          <div>
            <button onClick={handleSaveModal}>Save</button>
            <button onClick={handleCloseModal}>Cancel</button>
          </div>
        </div>
      )}
      <div className="inputArea">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter prompt..."
          onKeyPress={(e) => e.key === 'Enter' ? handleSendMessage() : null}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
