// pages/index.js (Next.js)
export default function Survey() {
  const submitSurvey = async () => {
    const response = await fetch("http://localhost:8000/submit-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_code: "USER123",  // Replace with dynamic input
        q18_score: 4,
        q30_score: 3
      }),
    });
    const data = await response.json();
    console.log(data.feedback);
  };

  return (
    <button onClick={submitSurvey}>Submit Test Survey</button>
  );
}