import React from 'react';
import "./ApprovalButtons.css"

const ApprovalButtons = ({ onApprove, onReject }) => {
  return (
    <div className="approvalButtons">
      <button onClick={onApprove}>Approve</button>
      <button onClick={onReject}>Reject</button>
    </div>
  );
};

export default ApprovalButtons;

