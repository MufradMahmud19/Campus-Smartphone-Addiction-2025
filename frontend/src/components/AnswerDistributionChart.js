import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AnswerDistributionChart({ answers, userAnswer }) {
  // answers: array of integers (all answers for this question)
  // userAnswer: the current user's answer (integer)
  const counts = [1, 2, 3, 4, 5, 6].map(val => answers.filter(a => a === val).length);
  const userIndex = userAnswer - 1;

  const data = {
    labels: ["1", "2", "3", "4", "5", "6"],
    datasets: [
      {
        label: "All Answers",
        data: counts,
        backgroundColor: counts.map((_, i) => i === userIndex ? "#4CAF50" : "#90caf9"),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Count: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ background: "#f9f9f9", border: "1px solid #ddd", borderRadius: 10, padding: 20, margin: "20px 0", minHeight: 250 }}>
      <div style={{ fontWeight: "bold", marginBottom: 10 }}>How does your answer compare to others?</div>
      <div style={{ height: 180 }}>
        <Bar data={data} options={options} />
      </div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 10 }}>
        <span style={{ color: "#4CAF50", fontWeight: "bold" }}>Green</span> = Your answer
      </div>
    </div>
  );
}
