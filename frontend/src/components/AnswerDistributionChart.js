import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AnswerDistributionChart({ answers, userAnswer }) {
  // answers: array of integers (all answers for this question from other users)
  // userAnswer: the current user's answer (integer)
  
  // Handle empty data case
  if (!answers || answers.length === 0) {
    return (
      <div style={{ background: "#f9f9f9", border: "1px solid #ddd", borderRadius: 10, padding: 16, margin: "16px 0", minHeight: 220 }}>
        <div style={{ fontWeight: "bold", marginBottom: 10 }}>How does your answer compare to others?</div>
        <div style={{ 
          height: 150, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "#666",
          fontSize: "16px"
        }}>
          No data available yet. Be the first to answer this question!
        </div>
        <div style={{ fontSize: 13, color: "#666", marginTop: 10 }}>
          <span style={{ 
            display: "inline-block",
            width: "12px", 
            height: "12px", 
            borderRadius: "50%", 
            backgroundColor: "#4CAF50", 
            border: "2px solid white",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
            marginRight: "6px",
            verticalAlign: "middle"
          }}></span> = Your answer
        </div>
      </div>
    );
  }

  const counts = [1, 2, 3, 4, 5, 6].map(val => answers.filter(a => a === val).length);
  const normalizedUserAnswer = Number.isFinite(Number(userAnswer)) ? Math.max(1, Math.min(6, Number(userAnswer))) : 3;
  const totalResponses = answers.length;
  const userAnswerCount = counts[normalizedUserAnswer - 1] ?? 0;
  const userAnswerPercentage = totalResponses > 0 ? Math.round((userAnswerCount / totalResponses) * 100) : 0;

  const data = {
    labels: ["1", "2", "3", "4", "5", "6"],
    datasets: [
      {
        label: "All Answers",
        data: counts,
        backgroundColor: "#90caf9",
        borderWidth: 1,
        borderColor: "#64b5f6",
        hoverBackgroundColor: "#64b5f6",
        maxBarThickness: 22,
        categoryPercentage: 0.5,
        barPercentage: 0.8,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const count = context.parsed.y;
            const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
            return `Count: ${count} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: "#eee" }
      },
      x: {
        grid: { display: false }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30
      }
    }
  };

  return (
    <div style={{ background: "#f9f9f9", border: "1px solid #ddd", borderRadius: 10, padding: 16, margin: "16px 0", minHeight: 220 }}>
      <div style={{ fontWeight: "bold", marginBottom: 10 }}>How does your answer compare to others?</div>
      
      {/* Statistics */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: "8px",
        marginBottom: 15, 
        fontSize: "14px", 
        color: "#666"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>Total responses: <strong>{totalResponses}</strong></div>
          <div>Your answer: <strong style={{ color: "#4CAF50" }}>{normalizedUserAnswer}/6</strong></div>
        </div>
        <div>People who chose {normalizedUserAnswer}: <strong>{userAnswerCount}</strong> ({userAnswerPercentage}%)</div>
      </div>
      
      <div style={{ height: 150, position: "relative" }}>
        <Bar data={data} options={options} />
        
        {/* User answer indicator - positioned above the correct bar */}
        <div style={{
          position: "absolute",
          top: 5,
          left: `${(normalizedUserAnswer - 0.4) * (100 / 6)}%`,
          transform: "translateX(-50%)",
          zIndex: 10,
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: "#4CAF50",
          border: "2px solid white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }} />
      </div>
      
      <div style={{ fontSize: 13, color: "#666", marginTop: 10 }}>
        <span style={{ 
          display: "inline-block",
          width: "12px", 
          height: "12px", 
          borderRadius: "50%", 
          backgroundColor: "#4CAF50", 
          border: "2px solid white",
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          marginRight: "6px",
          verticalAlign: "middle"
        }}></span> = Your answer
      </div>
    </div>
  );
}
