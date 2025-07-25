import React, { useState } from "react";
import LLMChatBox from "./components/LLMChatBox";

export function WizardStep({ question, value, onChange, conversation, onSendChat, showChat }) {
  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, maxWidth: 400 }}>
      <div style={{ fontSize: 20, marginBottom: 16 }}>{question}</div>
      {!showChat && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="range"
            min={1}
            max={10}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ textAlign: "center", marginTop: 8 }}>
            Answer: <b>{value}</b>
          </div>
        </div>
      )}
      {showChat && (
        <LLMChatBox conversation={conversation} onSend={onSendChat} />
      )}
    </div>
  );
}