import React, { useState } from "react";

function LLMChatBox({ conversation, onSend }) {
  const [message, setMessage] = useState("");
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, marginTop: 8 }}>
      <div style={{ minHeight: 40 }}>
        {conversation.map((msg, i) => (
          <div key={i} style={{ margin: "4px 0" }}>
            <b>{msg.role}:</b> {msg.text}
          </div>
        ))}
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (message.trim()) {
            onSend(message);
            setMessage("");
          }
        }}
        style={{ display: "flex", marginTop: 8 }}
      >
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message…"
          style={{ flex: 1, marginRight: 8 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default LLMChatBox;