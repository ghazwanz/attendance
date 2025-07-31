import React from "react";

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed",
      top: 24,
      right: 24,
      zIndex: 9999,
      background: "#f87171",
      color: "#fff",
      padding: "16px 32px 16px 16px",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      display: "flex",
      alignItems: "center",
      minWidth: 280,
      fontWeight: 500,
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: 20,
          marginLeft: 16,
          cursor: "pointer",
          fontWeight: "bold",
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default ErrorNotification;
