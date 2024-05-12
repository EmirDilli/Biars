

import React, { useState } from 'react';
import "./DragDropPage.css";

const DragDropArea = ({ onFileDrop }) => {
    const [drag, setDrag] = useState(false);
    const [fileDropped, setFileDropped] = useState(false); // New state to track file drop

    const handleDragOver = (e) => {
        e.preventDefault(); // Prevent default behavior
        setDrag(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDrag(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDrag(false);
        setFileDropped(true); // Set fileDropped to true when file is dropped
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileDrop(e.dataTransfer.files[0]); // Assuming only one file is needed
            e.dataTransfer.clearData();
        }
    };

    return (
        <div 
            className={`dragDropArea ${drag ? 'drag-over' : ''} ${fileDropped ? 'file-dropped' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            Drag and drop the source to below
        </div>
    );
};

export default DragDropArea;
