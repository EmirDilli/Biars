// src/Card.js
import React from 'react';
import './Card.css'; // Ensure this file is updated

const Card = ({ text, number, sourceName, pageNumber }) => {
  return (
    <div className="card">
      <div className="card-header">
        <strong>{sourceName}</strong> - Page {pageNumber}
      </div>
      <p>{text}</p>
      <div className="usage-count">
        <span>Usage: </span>
        <strong>{number}</strong>
      </div>
    </div>
  );
};

export default Card;



