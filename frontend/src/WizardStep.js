import React, { useState } from "react";
import LLMChatBox from "./components/LLMChatBox";

export function WizardStep({ question, value, onChange, conversation, onSendChat, showChat, onSubmit, onBack, onNext, isLastStep, isSubmitted }) {
  return (
    <div style={{ 
      padding: 20, 
      backgroundColor: "white", 
      border: "1px solid #ddd", 
      borderRadius: 15, 
      maxWidth: 500,
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      margin: "0 auto"
    }}>
      <div style={{ fontSize: 20, marginBottom: 20, fontWeight: "bold", color: "#333" }}>{question}</div>
      
      {/* Question section - always visible */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "#666" }}>
          <span>1 - Strongly Disagree</span>
          <span>6 - Strongly Agree</span>
        </div>
        <input
          type="range"
          min={1}
          max={6}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ 
            width: "100%",
            height: "8px",
            borderRadius: "4px",
            background: "#ddd",
            outline: "none"
          }}
        />
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 16 }}>
          Answer: <b style={{ color: "#4CAF50" }}>{value}</b>
        </div>
        
        {/* Submit button - only show if not submitted */}
        {!isSubmitted && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button 
              onClick={onSubmit}
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
                transition: "all 0.3s ease",
                fontWeight: "bold"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
              }}
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>
      
      {/* Chat section - only show if submitted */}
      {isSubmitted && (
        <div style={{ marginTop: 20 }}>
          <LLMChatBox conversation={conversation} onSend={onSendChat} />
        </div>
      )}
      
      {/* Navigation buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button 
          onClick={onBack}
          style={{
            padding: "10px 15px",
            fontSize: "18px",
            backgroundColor: "#f0f0f0",
            color: "#333",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontWeight: "bold"
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#e0e0e0";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#f0f0f0";
          }}
        >
          ←
        </button>
        
        {!isLastStep && (
          <button 
            onClick={onNext}
            style={{
              padding: "10px 15px",
              fontSize: "18px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontWeight: "bold"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}