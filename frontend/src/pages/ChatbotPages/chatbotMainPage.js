import React, { useState, useEffect } from 'react';
import ClassList from './ClassList.js';
import { useNavigate } from 'react-router-dom';
import "./ClassListPage.css"

const ChatbotMainPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();  // Hook for programmatically navigating


  useEffect(() => {
    const fetchClasses = async () => {
      try {
        //console.log("fetched");
        
        //const response = await fetch('http://localhost:3000/api/v1/chatbot/getClasses');  // Adjust the URL/port as necessary
        const userId = localStorage.getItem("userId");
        const response = await fetch('http://localhost:3000/api/v1/chatbot/getClasses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId }) 
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  const handleClassSelect = (cls) => {
    if (selectedClass === cls) {
      setSelectedClass(null);  // Unselect if the same class is clicked again
    } else {
      setSelectedClass(cls);  // Otherwise, set the new selection
    }
  };
  

  const handleStartChatbot1 = () => {
    if(!selectedClass){
      alert('Please select a class.');
      return;
    }
    navigate('/chatbot1', {state: selectedClass});
  };

  const handleAddSourceClick = () => {
    navigate('/drag-drop');  // Navigate to DragDropPage when button is clicked
  };

  const handleRemoveSourceClick = () => {
    navigate('/remove-source');
  }
  const handleShowChunks = () => {
    if(!selectedClass){
      alert('Please select a class.');
      return;
    }
    navigate('/show-chunks', {state: selectedClass});
  }
  return (
    <div className="classListPage">
      <h1>Chatbots</h1>
      <div className="mainContainer">
        <div className="classListContainer">
          <ClassList classes={classes} onSelect={handleClassSelect} selectedClass={selectedClass} />
          <p className="classListDescription">Select the course that you want from above</p>
          <div className="buttonGroup">
            <button onClick={handleStartChatbot1} className="actionButton">Start Chatbot 1</button>
            <button onClick={handleShowChunks} className="actionButton">Show Chunks</button>
          </div>
        </div>
        <div className="centeredContent">
          <img src="/openai.jpeg" alt="Powered by Logo" className="poweredByImage" />
          <p className="poweredByText">Powered by OpenAI</p>
        </div>
        <div className="rightSideContainer">
          <button onClick={handleAddSourceClick}>Add Source</button>
          <button onClick={handleRemoveSourceClick}>Remove Sources</button>
        </div>
      </div>
    </div>
  );
  
  
};

export default ChatbotMainPage;