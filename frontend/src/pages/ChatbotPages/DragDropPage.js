

import React, { useState, useEffect } from 'react';

import ClassList from './ClassList.js';
import DragDropArea from './DragDropArea.js';
import ApprovalButtons from './ApprovalButtons.js';
import { useNavigate } from 'react-router-dom';
import "./DragDropPage.css" 

const DragDropPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [file, setFile] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();  
  const [selectedOption, setSelectedOption] = useState('normal'); 

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        //console.log("fetched");
        const userId = localStorage.getItem("userId");
        const response = await fetch('http://localhost:3000/api/v1/chatbot/getClasses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId }) 
        });
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };
  const handleClassSelect = (cls) => {
    if (selectedClass === cls) {
      setSelectedClass(null);  // Unselect if the same class is clicked again
    } else {
      setSelectedClass(cls);  // Otherwise, set the new selection
    }
  };

  const handleFileDrop = (file) => {
    setFile(file);
    //console.log('File dropped:', file);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value); // Update state with input value
  };

  const handleApprove = async () => {
    if (!file || !selectedClass || !inputValue || !selectedOption) {
      alert('Please select a class and drop a file before approving.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sourceName', inputValue);
    formData.append('courseName', selectedClass);
    formData.append("topic", selectedOption);
  
    try {
      const response = await fetch('http://localhost:3000/api/v1/chatbot/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        //console.log("Upload successful");
        const result = await response.text(); // or response.json() if server responds with JSON
        //console.log(result);
        navigate('/success'); // Navigate to a success page or handle accordingly
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    //console.log("Approved", selectedClass, file);
    navigate('/chatbotMain');
  };

  const handleReject = () => {
    //console.log("Rejected", selectedClass, file);
    navigate('/chatbotMain');  // Navigate back to the main page on reject
  };

  return (
    <div className="dragDropPage">
      <h1>Add Source to Class Chatbot</h1>
      <div className="mainContainer">
        <ClassList classes={classes} onSelect={handleClassSelect} selectedClass={selectedClass} />
        <div className="rightContainer">
        <div className="inputBarContainer">
            <input
              type="text"
              placeholder="Enter the name of the source."
              className="userInput"
              onChange={handleInputChange} // Handle input change
            />
          </div>
          <DragDropArea onFileDrop={handleFileDrop} />
          <div className="optionsContainer">
            <div>
              <input 
                type="radio" 
                id="topicBased" 
                name="classification" 
                value="topicBased" 
                onChange={handleOptionChange} 
                checked={selectedOption === 'topicBased'}
              />
              <label htmlFor="topicBased">Topic based</label>
            </div>
            <div>
              <input 
                type="radio" 
                id="normal" 
                name="classification" 
                value="normal" 
                onChange={handleOptionChange} 
                checked={selectedOption === 'normal'}
              />
              <label htmlFor="normal">Normal</label>
            </div>
          </div>
          <ApprovalButtons onApprove={handleApprove} onReject={handleReject} />
        </div>
      </div>
    </div>
  );
  
};

export default DragDropPage;

