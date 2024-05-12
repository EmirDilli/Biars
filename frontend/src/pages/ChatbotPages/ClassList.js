import React from 'react';

const ClassList = ({ classes, onSelect, selectedClass }) => {
  return (
    <div className="classList">
      {classes.map((cls, index) => (
        <div
          key={index}
          onClick={() => onSelect(cls)}
          className={`classItem ${cls === selectedClass ? 'selected' : ''}`}
        >
          {cls}
        </div>
      ))}
    </div>
  );
};

export default ClassList;



