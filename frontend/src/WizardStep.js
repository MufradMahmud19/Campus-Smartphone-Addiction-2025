import React, { useState, useEffect } from "react";

export function WizardStep({ question, value, onChange, conversation, onSendChat, showChat, onSubmit, onBack, onNext, isLastStep, isSubmitted, question_id, showNavigation = true, disablePrev = false, disableNext = false }) {
  const scaleLabels = {
    1: "Strongly disagree",
    2: "Disagree",
    3: "Weakly disagree",
    4: "Weakly agree",
    5: "Agree",
    6: "Strongly agree",
  };

  return (
    <div style={{ 
      padding: 20, 
      backgroundColor: "#fff", 
      border: "2px solid #111", 
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
          aria-valuetext={scaleLabels[value]}
          style={{ 
            width: "100%",
            height: "8px",
            borderRadius: "4px",
            background: "#ddd",
            outline: "none"
          }}
        />
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 16 }}>
          Answer:{" "}
          <b style={{ color: "#1d587dff" }}>
            {value} - {scaleLabels[value] || ""}
          </b>
        </div>
        {/* Submit button - only show if not submitted */}
        {!isSubmitted && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button 
              onClick={onSubmit}
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                backgroundColor: "#004a77",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 15px #004a77",
                transition: "all 0.3s ease",
                fontWeight: "bold"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px #004a77";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px #004a77";
              }}
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>
      {/* Navigation buttons - only show if showNavigation is true */}
      {showNavigation && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button
            onClick={onBack}
            disabled={disablePrev}
            style={{
              padding: "10px 15px",
              fontSize: "18px",
              backgroundColor: disablePrev ? "#cccccc" : "#f0f0f0",
              color: "#333",
              border: "none",
              borderRadius: "8px",
              cursor: disablePrev ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              fontWeight: "bold",
              opacity: disablePrev ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!disablePrev) e.target.style.backgroundColor = "#e0e0e0";
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
              disabled={disableNext || isLastStep}
              style={{
                padding: "10px 15px",
                fontSize: "18px",
                backgroundColor: (disableNext || isLastStep) ? "#cccccc" : "#4e4cafff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: (disableNext || isLastStep) ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                fontWeight: "bold",
                opacity: (disableNext || isLastStep) ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!(disableNext || isLastStep)) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 15px #4e4cafff";
                }
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
      )}
    </div>
  );
}