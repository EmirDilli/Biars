import React, { useState, useEffect } from 'react';
import axios from "axios";
import {
    useParams,
  } from "react-router-dom";

import "./weekly.css";
import {
Assignment
  } from "@mui/icons-material";
  
 
const ContentItem = ({ item }) => {
const getIcon = (type) => {
    switch (type) {
    case 'assignment':
        return <Assignment style={{ width: '24px' }} />
    case 'pdf':
        return <img src={"assets/pdf-icon.png"} alt="pdf" style={{ width: '24px' }} />;
    case 'docx':  
        return <img src={"assets/docx-icon.png"} alt="docx" style={{ width: '24px' }} />;
    default:
        return null;
    }
};

if (item.type === 'link') {
    return (
    <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
        {getIcon(item.linkType)}
        <a href={item.value} target="_blank" rel="noopener noreferrer" style={{ color: '#0645AD', textDecoration: 'none', marginLeft: '8px' }}>
        {item.description}
        </a>
    </div>
    );
}

return (
    <p style={{ margin: '10px 0' }}>
    {item.value}
    </p>
);
};
  

const WeekSection = ({ week }) => {
    const format = (date) => {
  
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-UK', { month: 'long', day: 'numeric' });
    };
    
    return (
        <div className="week-section">
          <h2>{format(week.startDate)} - {format(week.endDate)}</h2>
          {week.content.map((item, index) => <ContentItem key={index} item={item} />)}
        </div>
    );
};
  

const WeeklySchedule = () => {
    const token = localStorage.getItem("token");
    const { className, sectionNumber } = useParams();
    const [weeks, setWeeks] = useState([]);
    const [courseContent, setContent] = useState([]);

    useEffect(() => {
        const endpoint = `http://localhost:3000/api/v1/class/CS 319/1/weekly`;
    
        axios
          .get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log(response.data);
            setWeeks(response.data.weeks);
            setContent(response.data.content);
          })
          .catch((error) => console.error("Error fetching averages:", error));
      }, [className]);


    const weeksWithContent = weeks.map(week => ({
      ...week,
      content: courseContent? courseContent.find(content => content.weekId === week.weekId)?.entries || [] : []
    }));
  
    return (
      <div>
        {weeksWithContent.map((week, index) => (
          <WeekSection key={index} week={week} />
        ))}
      </div>
    );
  };
export default WeeklySchedule;