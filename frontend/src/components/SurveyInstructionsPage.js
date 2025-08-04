import React from "react";

const likertIcons = [
  "😡", // 1
  "🙁", // 2
  "😕", // 3
  "🙂", // 4
  "😊", // 5
  "😍"  // 6
];

export default function SurveyInstructionsPage({ onContinue, onBack }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #B5D9FF 0%, #EAF6FF 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
    }}>
      <div className="survey-instructions-card" style={{
        width: "100%",
        maxWidth: 650,
        margin: "40px auto",
        padding: "6vw 5vw 4vw 5vw",
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        fontSize: "clamp(1rem, 2vw, 1.25rem)",
        lineHeight: 1.7,
        color: "#1a237e",
        position: "relative",
        boxSizing: "border-box"
      }}>
        <h2 style={{
          textAlign: "center",
          marginBottom: 28,
          color: "#1976d2",
          fontWeight: 800,
          letterSpacing: 1.2,
          fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
          textShadow: "0 2px 8px #e3f2fd"
        }}>
          📋 Survey Instructions
        </h2>
        <p style={{marginBottom: 18}}>We will go through some survey questions related to your day-to-day life. Please answer based on your own thoughts and experiences.</p>
        <div style={{marginBottom: 18}}>
          <span style={{fontWeight: 600}}>The answers will range from <span style={{color: '#1976d2'}}>1</span> to <span style={{color: '#1976d2'}}>6</span>:</span>
          <ul style={{marginLeft: 0, marginBottom: 8, marginTop: 10, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6}}>
            {["Strongly Disagree", "Disagree", "Weakly Disagree", "Weakly Agree", "Agree", "Strongly Agree"].map((label, i) => (
              <li key={i} style={{display: "flex", alignItems: "center", fontSize: "clamp(1rem, 2vw, 1.15rem)"}}>
                <span style={{fontSize: "clamp(1.3rem, 3vw, 1.7rem)", marginRight: 12}}>{likertIcons[i]}</span>
                <span style={{fontWeight: 500, width: 30, display: "inline-block", color: '#1976d2'}}>{i+1}</span>
                <span style={{marginLeft: 8}}>{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{marginBottom: 18}}>
          <span style={{fontWeight: 600}}>AI Assistant:</span>
          <span> For each question, after answering, you can interact with an <span style={{color: '#43a047', fontWeight: 600}}>AI assistant 🤖</span> if you have any queries or need clarification about the question.</span>
        </div>
        <div style={{marginBottom: 32}}>
          <span style={{fontWeight: 600}}>Purpose of the Study:</span>
          <span> This study aims to estimate whether you may be prone to smartphone addiction based on your responses.</span>
        </div>
        <div style={{display: "flex", justifyContent: "space-between", marginTop: 30, flexWrap: "wrap", gap: 12}}>
          <button onClick={onBack} style={{padding: "12px 32px", fontSize: "clamp(1rem, 2vw, 1.1rem)", borderRadius: 8, border: "none", background: "#bbb", color: "#fff", cursor: "pointer", fontWeight: 600, boxShadow: "0 2px 8px #e3f2fd", flex: 1, minWidth: 120, maxWidth: 200}}>Back</button>
          <button onClick={onContinue} style={{padding: "12px 32px", fontSize: "clamp(1rem, 2vw, 1.1rem)", borderRadius: 8, border: "none", background: "#1976d2", color: "#fff", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 8px #e3f2fd", flex: 1, minWidth: 120, maxWidth: 200}}>Continue</button>
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .survey-instructions-card {
            padding: 7vw 2vw 5vw 2vw !important;
            border-radius: 12px !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}