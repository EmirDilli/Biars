import React, { useEffect } from "react";

const Success = ({ message, onClose }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 3000); // 3 seconds

    return () => {
      clearTimeout(timeout);
    };
  }, [onClose]);

  return (
    <div style={{ backgroundColor: "lightgreen", padding: "10px" }}>
      {message}
    </div>
  );
};

export default Success;
