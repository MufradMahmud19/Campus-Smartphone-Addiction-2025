import React, { useState } from "react";

function LLMChatBox({ conversation, onSend, onError, isLoading = false }) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      try {
        await onSend(message);
        setMessage("");
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    }
  };

  return (
    <div style={{ 
      border: "1px solid #eee", 
      borderRadius: 8, 
      padding: 16, 
      marginTop: 8,
      backgroundColor: "#fafafa"
    }}>
      <div style={{ 
        minHeight: 120, 
        maxHeight: 300, 
        overflowY: "auto",
        marginBottom: 12,
        padding: 8,
        backgroundColor: "white",
        borderRadius: 4,
        border: "1px solid #ddd"
      }}>
        {conversation.length === 0 ? (
          <div style={{ color: "#666", fontStyle: "italic" }}>
            Start a conversation with the AI assistant...
          </div>
        ) : (
          conversation.map((msg, i) => (
            <div key={i} style={{ 
              margin: "8px 0", 
              padding: "8px 12px",
              backgroundColor: msg.role === "user" ? "#e3f2fd" : "#f5f5f5",
              borderRadius: 8,
              borderLeft: `4px solid ${msg.role === "user" ? "#2196f3" : "#4caf50"}`
            }}>
              <div style={{ 
                fontWeight: "bold", 
                color: msg.role === "user" ? "#1976d2" : "#2e7d32",
                marginBottom: 4
              }}>
                {msg.role === "user" ? "You" : "AI Assistant"}
              </div>
              <div style={{ lineHeight: 1.4 }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ 
            margin: "8px 0", 
            padding: "8px 12px",
            backgroundColor: "#fff3e0",
            borderRadius: 8,
            borderLeft: "4px solid #ff9800"
          }}>
            <div style={{ fontWeight: "bold", color: "#e65100", marginBottom: 4 }}>
              AI Assistant
            </div>
            <div style={{ color: "#666" }}>
              Thinking...
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{ 
            flex: 1, 
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 4,
            fontSize: "14px"
          }}
        />
        <button 
          type="submit" 
          disabled={!message.trim() || isLoading}
          style={{
            padding: "8px 16px",
            backgroundColor: isLoading ? "#ccc" : "#2196f3",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "14px"
          }}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default LLMChatBox;