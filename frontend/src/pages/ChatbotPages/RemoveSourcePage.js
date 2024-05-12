import React, { useState, useEffect } from 'react';
import ClassList from './ClassList.js';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import './RemoveSourcePage.css';

const RemoveSourcePage = () => {
  const [classes, setClasses] = useState(["Class 1", "Class 2", "Class 3"]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [options, setOptions] = useState([]);
  const navigate = useNavigate();  
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


  const handleClassSelect = async (cls) => {
    if (selectedClass === cls) {
      setSelectedClass(null);  // Unselect if the same class is clicked again
    } else {
      setSelectedClass(cls);  // Otherwise, set the new selection
      const url = `http://localhost:3000/api/v1/chatbot/getSources`;
      const response = await fetch(url, {
      method: 'POST', // Set the method to POST
      headers: {
        'Content-Type': 'application/json', // Specify the content type
      },
      body: JSON.stringify({ class: cls }) // Send cls as JSON in the request body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse the JSON from the response
    //console.log(data);
    let optionsArr = data.map((item, index) => {
      return {value: "item" + index, label: item};
    });
    
    setOptions(optionsArr);
    }
  };


  const handleChange = (selectedOptions) => {
    setSelectedItems(selectedOptions || []);
  };

  const handleDelete = async () => {

    let selectedClassItem = selectedClass;
    let selectedItemsArr = selectedItems.map((item) => item.label);
    const url = `http://localhost:3000/api/v1/chatbot/deleteSources`;
    const response = await fetch(url, {
    method: 'POST', // Set the method to POST
    headers: {
      'Content-Type': 'application/json', // Specify the content type
    },
    body: JSON.stringify({ class: selectedClassItem , sourceNames: selectedItemsArr}) // Send cls as JSON in the request body
  });

  const data = await response.status;
    

    
    
    console.log('Delete items:', selectedItems.map(item => item.value));
    navigate("/chatbotMain");
  };

  return (
    <div className="removeSourcePage">
      <ClassList classes={classes} onSelect={handleClassSelect} selectedClass={selectedClass} />
      <div className="dropdownContainer">
        <Select
          isMulti
          options={options}
          onChange={handleChange}
          className="dropdownMenu"
          value={selectedItems}
        />
        <button onClick={handleDelete} className="deleteButton">Delete</button>
      </div>
    </div>
  );
  
  
};

export default RemoveSourcePage;
