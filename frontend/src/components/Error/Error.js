import React, { useEffect } from "react";

const Error = ({ message, onClose }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 3000); // Close the error message after 3 seconds

    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div
      style={{
        backgroundColor: "#FFCDD2", // Reddish background color
        color: "#D32F2F", // Text color
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "5px",
      }}
    >
      {message}
    </div>
  );
};

export default Error;
