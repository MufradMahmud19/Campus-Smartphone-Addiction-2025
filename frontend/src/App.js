import React, { useState, useEffect } from "react";
import axios from "axios";
import { WizardStep } from "./WizardStep";

// Home logo component
function HomeLogo({ onHome }) {
  return (
    <img
      src={require('./img/icon.png')}
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
      <img src={require('./img/home.jpg')} alt="Motivational" style={{ width: 300, margin: 20 }} />
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
      <button onClick={onBack}>Back</button>
      <button onClick={() => onNext(2)} style={{ marginLeft: 8 }}>Next</button>
    </div>
  );
}

function UserCheckPage({ onFirstTime, onReturning, onBack }) {
  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 40, position: "relative" }}>
      <HomeLogo onHome={() => onReturning(0)} />
      <h2>Is it your first time here?</h2>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "20px" }}>
        <button onClick={onFirstTime}>Yes</button>
        <button onClick={() => onReturning(null)}>No</button>
      </div>
      <button onClick={onBack} style={{ marginTop: 16 }}>Back</button>
    </div>
  );
}

function ReturnUserPage({ onReturning, onBack, setUsercode }) {
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
      <h2>Enter your user code</h2>
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            placeholder="Enter your user code"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            style={{ flex: 1, padding: "10px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "4px" }}
          />
          <button 
            onClick={handleValidate} 
            disabled={checking}
            style={{ 
              padding: "8px 16px", 
              fontSize: "14px", 
              backgroundColor: checking ? "#cccccc" : "#4CAF50", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: checking ? "not-allowed" : "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {checking ? "Validating..." : "Validate"}
          </button>
        </div>
        {error && <div style={{ color: "red", marginTop: "8px" }}>{error}</div>}
      </div>
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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  }

  function validateForm() {
    const newErrors = {};
    if (!form.age.trim()) newErrors.age = "Age is required";
    if (!form.gender.trim()) newErrors.gender = "Gender is required";
    if (!form.country.trim()) newErrors.country = "Country is required";
    if (!form.education.trim()) newErrors.education = "Education level is required";
    if (!form.field.trim()) newErrors.field = "Field of education is required";
    if (!form.yearsOfStudy.trim()) newErrors.yearsOfStudy = "Years of study is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    axios.post("http://localhost:8000/register_user", form)
      .then(res => {
        onSubmit(res.data.usercode);
      })
      .catch(error => {
        console.error("Error registering user:", error);
        setIsSubmitting(false);
      });
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 40, position: "relative" }}>
      <HomeLogo onHome={() => onSubmit(null, true)} />
      <h2>Tell us about yourself</h2>
      
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>What is your age?</label>
        <input 
          name="age" 
          placeholder="Enter your age" 
          value={form.age} 
          onChange={handleChange}
          style={{ 
            width: "100%", 
            padding: "10px", 
            fontSize: "16px", 
            border: errors.age ? "1px solid #ff4444" : "1px solid #ddd", 
            borderRadius: "4px" 
          }}
        />
        {errors.age && <div style={{ color: "#ff4444", fontSize: "14px", marginTop: "4px" }}>{errors.age}</div>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>What is your gender?</label>
        <input 
          name="gender" 
          placeholder="Enter your gender" 
          value={form.gender} 
          onChange={handleChange}
          style={{ 
            width: "100%", 
            padding: "10px", 
            fontSize: "16px", 
            border: errors.gender ? "1px solid #ff4444" : "1px solid #ddd", 
            borderRadius: "4px" 
          }}
        />
        {errors.gender && <div style={{ color: "#ff4444", fontSize: "14px", marginTop: "4px" }}>{errors.gender}</div>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>What is your country?</label>
        <input 
          name="country" 
          placeholder="Enter your country" 
          value={form.country} 
          onChange={handleChange}
          style={{ 
            width: "100%", 
            padding: "10px", 
            fontSize: "16px", 
            border: errors.country ? "1px solid #ff4444" : "1px solid #ddd", 
            borderRadius: "4px" }}
        />
        {errors.country && <div style={{ color: "#ff4444", fontSize: "14px", marginTop: "4px" }}>{errors.country}</div>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>What is your highest completed education level?</label>
        <input 
          name="education" 
          placeholder="e.g., High School, Bachelor's, Master's, PhD" 
          value={form.education} 
          onChange={handleChange}
          style={{ 
            width: "100%", 
            padding: "10px", 
            fontSize: "16px", 
            border: errors.education ? "1px solid #ff4444" : "1px solid #ddd", 
            borderRadius: "4px" 
          }}
        />
        {errors.education && <div style={{ color: "#ff4444", fontSize: "14px", marginTop: "4px" }}>{errors.education}</div>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>How many years did you have to study?</label>
        <input 
          name="yearsOfStudy" 
          placeholder="Enter number of years" 
          value={form.yearsOfStudy} 
          onChange={handleChange}
          style={{ 
            width: "100%", 
            padding: "10px", 
            fontSize: "16px", 
            border: errors.yearsOfStudy ? "1px solid #ff4444" : "1px solid #ddd", 
            borderRadius: "4px" 
          }}
        />
        {errors.yearsOfStudy && <div style={{ color: "#ff4444", fontSize: "14px", marginTop: "4px" }}>{errors.yearsOfStudy}</div>}
      </div>

      <div style={{ marginBottom: 30 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>What is your field of education?</label>
        <input 
          name="field" 
          placeholder="e.g., Computer Science, Psychology, Engineering" 
          value={form.field} 
          onChange={handleChange}
          style={{ 
            width: "100%", 
            padding: "10px", 
            fontSize: "16px", 
            border: errors.field ? "1px solid #ff4444" : "1px solid #ddd", 
            borderRadius: "4px" 
          }}
        />
        {errors.field && <div style={{ color: "#ff4444", fontSize: "14px", marginTop: "4px" }}>{errors.field}</div>}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={onBack} style={{ padding: "12px 24px", fontSize: "16px" }} disabled={isSubmitting}>Back</button>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          style={{ 
            padding: "12px 24px", 
            fontSize: "16px", 
            backgroundColor: isSubmitting ? "#cccccc" : "#4CAF50", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: isSubmitting ? "not-allowed" : "pointer"
          }}
        >
          {isSubmitting ? "Submitting..." : "Continue"}
        </button>
      </div>
    </div>
  );
}

function SurveyCompletionPage({ onReturnHome }) {
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 40, textAlign: "center" }}>
      <h1>Survey Completed!</h1>
      <p style={{ fontSize: 18, marginBottom: 30 }}>
        Thank you for completing the survey. Your responses have been recorded successfully.
      </p>
      <button onClick={onReturnHome} style={{ padding: "12px 24px", fontSize: 16 }}>
        Return to Homepage
      </button>
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
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/questions")
      .then(res => {
        setQuestions(res.data);
        setAnswers(Array(Math.min(res.data.length, 12)).fill(3));
        setChats(res.data.slice(0, 12).map((q) => [{ role: "AI", text: `Anything you want to ask about the following question?`}]));
        setLoading(false);
      });
  }, []);

  // Reset step to 0 when entering the wizard
  useEffect(() => {
    if (page === 4) {
      setStep(0);
    }
  }, [page]);

  // Onboarding pages
  if (page === 0) return <FrontPage onNext={setPage} />;
  if (page === 1) return <DescriptionPage onNext={setPage} onBack={() => setPage(0)} usercode={usercode} />;
  if (page === 2) return (
    <UserCheckPage
      onFirstTime={() => setPage(3)}
      onReturning={() => setPage(2.5)}
      onBack={() => setPage(1)}
    />
  );
  if (page === 2.5) return (
    <ReturnUserPage
      onReturning={code => { setUsercode(code); setPage(4); }}
      onBack={() => setPage(2)}
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

  // Survey completion page
  if (surveyCompleted) {
    return <SurveyCompletionPage onReturnHome={() => { setSurveyCompleted(false); setPage(0); }} />;
  }

  // Wizard logic
  if (loading) return <div>Loading questions...</div>;

  // Limit to 12 questions
  const limitedQuestions = questions.slice(0, 12);
  
  const steps = [];
  limitedQuestions.forEach((q, i) => {
    steps.push({ type: "question", question: q.text, qIndex: i, question_id: q.id, questionNumber: i + 1 });
    steps.push({ type: "chat", qIndex: i, question_id: q.id, questionNumber: i + 1 });
  });

  const current = steps[step];
  const currentQuestionNumber = current ? current.questionNumber : 1;
  
  // Progress bar component
  const ProgressBar = ({ current, total }) => {
    const progress = (current / total) * 100;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 8 
        }}>
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>
            {current}/{total}
          </span>
          <span style={{ fontSize: "14px", color: "#666" }}>
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div style={{ 
          width: "100%", 
          height: "12px", 
          backgroundColor: "#f0f0f0", 
          borderRadius: "6px", 
          overflow: "hidden" 
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: "100%", 
            backgroundColor: "#4CAF50", 
            transition: "width 0.3s ease" 
          }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 16, position: "relative" }}>
      <HomeLogo onHome={() => setPage(0)} />
      {usercode && <div style={{ margin: "16px 0", fontWeight: "bold" }}>Your User Code: {usercode}</div>}
      <ProgressBar current={currentQuestionNumber} total={12} />
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
        <button onClick={nextStep} disabled={step === steps.length - 1}>
          Next
        </button>
      </div>
      {step === steps.length - 1 && (
        <div style={{ marginTop: 20 }}>
          <b>All answers:</b>
          <pre>{JSON.stringify(createAnswersDictionary(), null, 2)}</pre>
          <button 
            onClick={handleFinishSurvey}
            style={{ 
              marginTop: 20, 
              padding: "12px 24px", 
              fontSize: 16, 
              backgroundColor: "#4CAF50", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Finish Survey
          </button>
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

  function createAnswersDictionary() {
    const answersDict = {};
    questions.forEach((q, i) => {
      answersDict[q.id] = answers[i];
    });
    return answersDict;
  }

  function handleFinishSurvey() {
    const surveyData = {
      usercode: usercode,
      answers: createAnswersDictionary(),
      completed_at: new Date().toISOString()
    };

    // Send to backend
    axios.post("http://localhost:8000/submit_survey", surveyData)
      .then(response => {
        console.log("Survey submitted successfully:", response.data);
        setSurveyCompleted(true);
      })
      .catch(error => {
        console.error("Error submitting survey:", error);
        // Still show completion page even if backend fails
        setSurveyCompleted(true);
      });
  }
}