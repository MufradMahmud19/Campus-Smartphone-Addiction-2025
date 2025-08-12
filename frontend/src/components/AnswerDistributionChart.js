import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AnswerDistributionChart({ answers, userAnswer }) {
  // answers: array of integers (all answers for this question)
  // userAnswer: the current user's answer (integer)
  
  // Handle empty data case
  if (!answers || answers.length === 0) {
    return (
      <div style={{ background: "#f9f9f9", border: "1px solid #ddd", borderRadius: 10, padding: 20, margin: "20px 0", minHeight: 250 }}>
        <div style={{ fontWeight: "bold", marginBottom: 10 }}>How does your answer compare to others?</div>
        <div style={{ 
          height: 180, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "#666",
          fontSize: "16px"
        }}>
          No data available yet. Be the first to answer this question!
        </div>
        <div style={{ fontSize: 13, color: "#666", marginTop: 10 }}>
          <span style={{ color: "#4CAF50", fontWeight: "bold" }}>Green</span> = Your answer
        </div>
      </div>
    );
  }

  const counts = [1, 2, 3, 4, 5, 6].map(val => answers.filter(a => a === val).length);
  const normalizedUserAnswer = Number.isFinite(Number(userAnswer)) ? Math.max(1, Math.min(6, Number(userAnswer))) : 3;
  const userIndex = normalizedUserAnswer - 1;
  const totalResponses = answers.length;
  const userAnswerCount = counts[userIndex] ?? 0;
  const userAnswerPercentage = totalResponses > 0 ? Math.round((userAnswerCount / totalResponses) * 100) : 0;

  const data = {
    labels: ["1", "2", "3", "4", "5", "6"],
    datasets: [
      {
        label: "All Answers",
        data: counts,
        backgroundColor: counts.map((_, i) => (i === userIndex ? "#4CAF50" : "#90caf9")),
        borderWidth: 1,
        borderColor: counts.map((_, i) => (i === userIndex ? "#2e7d32" : "#64b5f6")),
        hoverBackgroundColor: counts.map((_, i) => (i === userIndex ? "#43a047" : "#64b5f6")),
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
          <div>Your answer: <strong style={{ color: "#4CAF50" }}>{userAnswer}/6</strong></div>
        </div>
        <div>People who chose {userAnswer}: <strong>{userAnswerCount}</strong> ({userAnswerPercentage}%)</div>
      </div>
      
      <div style={{ height: 150 }}>
        <Bar data={data} options={options} />
      </div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 10 }}>
        <span style={{ color: "#4CAF50", fontWeight: "bold" }}>Green</span> = Your answer
      </div>
    </div>
  );
}
