import React from "react";

export default function HelpModal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(30, 42, 80, 0.45)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.3s"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        maxWidth: 540,
        width: "90vw",
        maxHeight: "80vh",
        padding: "36px 28px 28px 28px",
        position: "relative",
        overflowY: "auto",
        fontSize: "clamp(1rem, 2vw, 1.15rem)",
        color: "#1a237e",
        border: "2px solid #111"
      }}>
        <button
          onClick={onClose}
          aria-label="Close help"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#f5f5f5",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            fontSize: 22,
            fontWeight: "bold",
            color: "#333",
            cursor: "pointer",
            boxShadow: "0 2px 8px #e3f2fd"
          }}
        >
          ×
        </button>
        <div style={{ paddingRight: 8 }}>{children}</div>
      </div>
    </div>
  );
}