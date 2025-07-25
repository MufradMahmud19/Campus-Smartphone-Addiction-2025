import React, { useState, useEffect } from "react";
import axios from "axios";
import { WizardStep } from "./WizardStep";

// Home logo component
function HomeLogo({ onHome }) {
  return (
    <img
      src="your-logo-url.png"
      alt="Home"
      style={{ width: 40, cursor: "pointer", position: "absolute", top: 16, left: 16 }}
      onClick={onHome}
    />
  );
}

function FrontPage({ onNext }) {
  return (
    <div style={{ textAlign: "center", padding: 40, position: "relative" }}>
      <HomeLogo onHome={() => onNext(0)} />
      <h1>Welcome to Smartphone Wizard!</h1>
      <blockquote style={{ fontSize: 22, fontStyle: "italic" }}>
        "The smartphone is a window to the world, but don’t let it close the door to yourself."
      </blockquote>
      <img src="your-image-url.jpg" alt="Motivational" style={{ width: 300, margin: 20 }} />
      <button onClick={() => onNext(1)}>Get Started</button>
    </div>
  );
}

function DescriptionPage({ onNext, onBack, usercode }) {
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 40, position: "relative" }}>
      <HomeLogo onHome={() => onNext(0)} />
      <h2>About This Website</h2>
      <p>
        It's completely anonymous! You do not need to worry about your identity.<br />
        We help you reflect on your smartphone habits and provide insights.<br />
        Your answers are stored securely and only used for research purposes.<br />
        <b>No personal data is ever shared.</b>
      </p>
      {usercode && <div style={{ margin: "16px 0", fontWeight: "bold" }}>Your User Code: {usercode}</div>}
      <button onClick={onBack}>Back</button>
      <button onClick={() => onNext(2)} style={{ marginLeft: 8 }}>Next</button>
    </div>
  );
}

function UserCheckPage({ onFirstTime, onReturning, onBack, usercode, setUsercode }) {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  function handleValidate() {
    setChecking(true);
    axios.post("http://localhost:8000/validate_usercode", { usercode: inputCode })
      .then(res => {
        if (res.data.valid) {
          setUsercode(inputCode);
          onReturning(inputCode);
        } else {
          setError("Invalid code. Please try again.");
        }
        setChecking(false);
      })
      .catch(() => {
        setError("Server error. Try again.");
        setChecking(false);
      });
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 40, position: "relative" }}>
      <HomeLogo onHome={() => onReturning(0)} />
      <h2>Is it your first time here?</h2>
      <button onClick={onFirstTime}>No</button>
      <button onClick={() => {}}>Yes</button>
      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Enter your user code"
          value={inputCode}
          onChange={e => setInputCode(e.target.value)}
          style={{ width: "80%" }}
        />
        <button onClick={handleValidate} disabled={checking}>Validate</button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>
      {usercode && <div style={{ margin: "16px 0", fontWeight: "bold" }}>Your User Code: {usercode}</div>}
      <button onClick={onBack} style={{ marginTop: 16 }}>Back</button>
    </div>
  );
}

function DemographicsPage({ onSubmit, onBack, usercode }) {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    country: "",
    education: "",
    field: "",
    yearsOfStudy: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit() {
    axios.post("http://localhost:8000/register_user", form)
      .then(res => {
        onSubmit(res.data.usercode);
      });
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 40, position: "relative" }}>
      <HomeLogo onHome={() => onSubmit(null, true)} />
      <h2>Tell us about yourself</h2>
      <input name="age" placeholder="Age" value={form.age} onChange={handleChange} /><br />
      <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} /><br />
      <input name="country" placeholder="Country of origin" value={form.country} onChange={handleChange} /><br />
      <input name="education" placeholder="Highest education level" value={form.education} onChange={handleChange} /><br />
      <input name="field" placeholder="Field of study" value={form.field} onChange={handleChange} /><br />
      <input name="yearsOfStudy" placeholder="Years of study" value={form.yearsOfStudy} onChange={handleChange} /><br />
      <button onClick={onBack}>Back</button>
      <button onClick={handleSubmit} style={{ marginLeft: 8 }}>Continue</button>
      {usercode && <div style={{ margin: "16px 0", fontWeight: "bold" }}>Your User Code: {usercode}</div>}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(0); // 0:front, 1:desc, 2:usercheck, 3:demo, 4:wizard
  const [usercode, setUsercode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/questions")
      .then(res => {
        setQuestions(res.data);
        setAnswers(Array(res.data.length).fill(5));
        setChats(res.data.map((q) => [{ role: "AI", text: `Any questions about ${q.text.toLowerCase()}?` }]));
        setLoading(false);
      });
  }, []);

  // Onboarding pages
  if (page === 0) return <FrontPage onNext={setPage} />;
  if (page === 1) return <DescriptionPage onNext={setPage} onBack={() => setPage(0)} usercode={usercode} />;
  if (page === 2) return (
    <UserCheckPage
      onFirstTime={() => setPage(3)}
      onReturning={code => { setUsercode(code); setPage(4); }}
      onBack={() => setPage(1)}
      usercode={usercode}
      setUsercode={setUsercode}
    />
  );
  if (page === 3) return (
    <DemographicsPage
      onSubmit={(code, goHome) => {
        if (goHome) setPage(0);
        else { setUsercode(code); setPage(4); }
      }}
      onBack={() => setPage(2)}
      usercode={usercode}
    />
  );

  // Wizard logic
  if (loading) return <div>Loading questions...</div>;

  const steps = [];
  questions.forEach((q, i) => {
    steps.push({ type: "question", question: q.text, qIndex: i, question_id: q.id });
    steps.push({ type: "chat", qIndex: i, question_id: q.id });
  });

  const current = steps[step];
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 16, position: "relative" }}>
      <HomeLogo onHome={() => setPage(0)} />
      {usercode && <div style={{ margin: "16px 0", fontWeight: "bold" }}>Your User Code: {usercode}</div>}
      {current.type === "question" ? (
        <WizardStep
          question={current.question}
          value={answers[current.qIndex]}
          onChange={handleAnswerChange}
          conversation={[]} // No chat in question step
          onSendChat={() => {}} // No-op
          showChat={false}
        />
      ) : (
        <WizardStep
          question={questions[current.qIndex].text}
          value={answers[current.qIndex]}
          onChange={() => {}} // No slider in chat step
          conversation={chats[current.qIndex] || []}
          onSendChat={handleSendChat}
          showChat={true}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button onClick={prevStep} disabled={step === 0}>
          Back
        </button>
        <span>Step {step + 1} of {steps.length}</span>
        <button onClick={nextStep} disabled={step === steps.length - 1}>
          Next
        </button>
      </div>
      {step === steps.length - 1 && (
        <div style={{ marginTop: 20 }}>
          <b>All answers:</b>
          <pre>{JSON.stringify(answers, null, 2)}</pre>
        </div>
      )}
    </div>
  );

  // --- handlers ---
  function handleSendChat(message) {
    const qIdx = steps[step].qIndex;
    setChats(current =>
      current.map((c, i) =>
        i === qIdx
          ? [...c, { role: "User", text: message }, { role: "AI", text: "Placeholder LLM response." }]
          : c
      )
    );
  }

  function handleAnswerChange(val) {
    const qIdx = steps[step].qIndex;
    setAnswers(current =>
      current.map((a, i) => (i === qIdx ? val : a))
    );
  }

  function nextStep() {
    setStep(s => Math.min(s + 1, steps.length - 1));
  }

  function prevStep() {
    setStep(s => Math.max(s - 1, 0));
  }
}