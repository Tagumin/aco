import React from 'react';

const Notification = ({ notification }) => {
  if (!notification) return null;
  const icon = notification.type === "success" ? "✅" : "⚠️";
  return (
    <div className={`notification ${notification.type}`}>
      <span style={{ fontSize: "16px", display: "inline-flex", alignItems: "center" }}>{icon}</span>
      <span>{notification.message}</span>
    </div>
  );
};

export default Notification;