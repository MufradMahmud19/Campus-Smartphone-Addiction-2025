import React, { useState, useEffect } from "react";
import axios from "axios";
import { WizardStep } from "./WizardStep";
import SurveyInstructionsPage from "./components/SurveyInstructionsPage";

// Add global style for body background and improved card/header separation
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    html, body {
      background: #B5D9FF !important;
      min-height: 100vh;
      margin: 0;
      padding: 0;
    }
    .responsive-page {
      min-height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      background: transparent;
      padding: 0;
    }
    .responsive-header {
      width: 100vw;
      max-width: 650px;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 24px 0 0 24px;
      box-sizing: border-box;
      position: relative;
      z-index: 2;
    }
    .responsive-card {
      width: 100%;
      max-width: 650px;
      margin: 32px auto 40px auto;
      padding: 64px 5vw 4vw 5vw;
      background: #fff;
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.7;
      color: #1a237e;
      position: relative;
      box-sizing: border-box;
      z-index: 1;
      border: 1.5px solid #e3eafc;
    }
    .responsive-card h1, .responsive-card h2 {
      margin-top: 0;
      padding-top: 0;
    }
    .info-box, .consent-box {
      margin: 0 auto 24px auto;
      max-width: 420px;
      width: 100%;
      border-radius: 15px;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
    }
    .info-box {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      color: #333;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    .consent-box {
      background: #fff;
      border: 2px solid #e0e0e0;
      color: #555;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    @media (max-width: 600px) {
      .responsive-card {
        padding: 80px 2vw 5vw 2vw !important;
        border-radius: 12px !important;
        margin: 0 0 24px 0 !important;
      }
      .responsive-header {
        padding: 12px 0 0 12px;
        min-height: 40px;
      }
      .info-box, .consent-box {
        padding: 12px;
        max-width: 98vw;
      }
    }
  `;
  document.head.appendChild(style);
}

// Home logo component
function HomeLogo({ onHome, disabled }) {
  return (
    <img
      src={require('./img/icon_2.png')}
      alt="Home"
      style={{ 
        width: 40, 
        cursor: disabled ? "not-allowed" : "pointer", 
        opacity: disabled ? 0.5 : 1,
        position: "absolute", 
        top: 16, 
        left: 16 
      }}
      onClick={disabled ? undefined : onHome}
      title={disabled ? "You cannot go home while answering the survey." : "Go to homepage"}
    />
  );
}

function FrontPage({ onNext }) {
  return (
    <div className="responsive-page">
      <div className="responsive-header">
        <HomeLogo onHome={() => onNext(0)} />
      </div>
      <div className="responsive-card" style={{ textAlign: "center" }}>
        <h1>Welcome to Smartphone Wizard!</h1>
        <blockquote style={{ fontSize: 22, fontStyle: "italic" }}>
          "The smartphone is a window to the world, but don’t let it close the door to yourself."
        </blockquote>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <img 
            src={require('./img/home.jpg')} 
            alt="Motivational" 
            style={{ 
              width: "100%", 
              maxWidth: 500, 
              height: "auto", 
              margin: "30px 0",
              borderRadius: "15px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
            }} 
          />
          <h3 style={{ color: "#333", marginBottom: "30px" }}>This platform supports ongoing study.</h3>
        </div>
        <div style={{ textAlign: "right", marginTop: "40px" }}>
          <button 
            onClick={() => onNext(1)}
            style={{
              padding: "15px 40px",
              fontSize: "18px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(76, 175, 80, 0.3)",
              transition: "all 0.3s ease",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 8px 25px rgba(76, 175, 80, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.3)";
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

function DescriptionPage({ onNext, onBack, usercode }) {
  const [showConsent, setShowConsent] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const handleProceed = () => {
    if (consentGiven) {
      onNext(2);
    }
  };

  const handleConsent = (accepted) => {
    setConsentGiven(accepted);
    if (accepted) {
      onNext(2);
    } else {
      onNext(0); // Go back to homepage
    }
  };

  return (
    <div className="responsive-page">
      <div className="responsive-header">
        <HomeLogo onHome={() => onNext(0)} />
      </div>
      <div className="responsive-card">
        
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>About This Website</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "25px", marginBottom: "30px" }}>
          {/* First box - Left aligned */}
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-start",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>It's COMPLETELY anonymous!</strong><br />
            You don't need to worry about anything.
          </div>

          {/* Second box - Right aligned */}
          <div style={{
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-end",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>Just be you while answering</strong>
          </div>

          {/* Third box - Left aligned */}
          <div style={{
            background: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-start",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>For getting useful feedbacks</strong>
          </div>

          {/* Consent form box - Centered */}
          <div style={{
            background: "white",
            border: "2px solid #e0e0e0",
            borderRadius: "15px",
            padding: "25px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            marginTop: "20px",
            alignSelf: "center",
            maxWidth: "500px",
            width: "100%"
          }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: "15px 0", color: "#333" }}>Consent Form</h3>
            </div>
            
            <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#555", marginBottom: "25px" }}>
              <p style={{ margin: "8px 0" }}>→ By continuing, you agree to participate in this study on smartphone usage habits.</p>
              <p style={{ margin: "8px 0" }}>→ We help you reflect on your smartphone habits and provide personalized insights.</p>
              <p style={{ margin: "8px 0" }}>→ Your responses will be stored securely and only used for academic research.</p>
              <p style={{ margin: "8px 0" }}>→ No personal data is ever shared with third parties.</p>
              <p style={{ margin: "8px 0" }}>→ We collect minimal demographic information (e.g., age, gender, education) only for research purposes.</p>
              <p style={{ margin: "8px 0", fontWeight: "bold" }}>By proceeding, you consent to these terms.</p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <button 
                onClick={() => handleConsent(false)}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: "#ff6b6b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                  transition: "all 0.3s ease",
                  fontWeight: "bold"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)";
                }}
              >
                Decline
              </button>
              <button 
                onClick={() => handleConsent(true)}
                style={{
                  padding: "12px 24px",
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
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserCheckPage({ onFirstTime, onReturning, onBack, onHome }) {
  return (
    <div className="responsive-page">
      <div className="responsive-header">
        <HomeLogo onHome={onHome} />
      </div>
      <div className="responsive-card">
        
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
  
        <h2 style={{ color: "#333", marginBottom: "30px" }}>Is it your first time here?</h2>
        </div>

        <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginBottom: "30px" }}>
          <button 
            onClick={onFirstTime}
            style={{
              padding: "15px 30px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "10px",
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
            Yes
          </button>
          <button 
            onClick={() => onReturning(null)}
            style={{
              padding: "15px 30px",
              fontSize: "16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(33, 150, 243, 0.3)",
              transition: "all 0.3s ease",
              fontWeight: "bold"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(33, 150, 243, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(33, 150, 243, 0.3)";
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnUserPage({ onReturning, onBack, setUsercode, onHome }) {
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
    <div className="responsive-page">
      <div className="responsive-header">
        <HomeLogo onHome={onHome} />
      </div>
      <div className="responsive-card">
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
                padding: "12px 24px", 
                fontSize: "16px", 
                backgroundColor: checking ? "#cccccc" : "#4CAF50", 
                color: "white", 
                border: "none", 
                borderRadius: "8px",
                cursor: checking ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                boxShadow: checking ? "none" : "0 4px 15px rgba(76, 175, 80, 0.3)",
                transition: "all 0.3s ease",
                fontWeight: "bold"
              }}
              onMouseOver={(e) => {
                if (!checking) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.4)";
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = checking ? "none" : "0 4px 15px rgba(76, 175, 80, 0.3)";
              }}
            >
              {checking ? "Validating..." : "Validate"}
            </button>
          </div>
          {error && <div style={{ color: "red", marginTop: "8px" }}>{error}</div>}
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button 
            onClick={onBack}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
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
            Back
          </button>
        </div>
      </div>
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
    
    // Just pass the form data to the parent component
    // Don't register the user here - that will happen later
    onSubmit(form);
  }

  return (
    <div className="responsive-page">
      <div className="responsive-header">
        <HomeLogo onHome={() => onSubmit(null, true)} />
      </div>
      <div className="responsive-card">
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
            placeholder="e.g., Bachelor's, Master's, PhD" 
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

        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <button 
            onClick={onBack} 
            style={{ 
              padding: "12px 24px", 
              fontSize: "16px",
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
            Back
          </button>
          <button 
            onClick={handleSubmit} 
            style={{ 
              padding: "12px 24px", 
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
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function SurveyCompletionPage({ onReturnHome, usercode }) {
  return (
    <div className="responsive-page">
      <div className="responsive-header">
        <HomeLogo onHome={onReturnHome} />
      </div>
      <div className="responsive-card" style={{ textAlign: "center" }}>
        <h1>Survey Completed!</h1>
        <p style={{ fontSize: 18, marginBottom: 30 }}>
          Thank you for completing the survey. Your responses have been recorded successfully.
        </p>
        
        {/* Survey Score Section */}
        <div style={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
          color: "white", 
          padding: "24px", 
          borderRadius: "16px", 
          margin: "24px auto", 
          maxWidth: "400px",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
        }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "20px" }}>Your Survey Score</h3>
          <div style={{ fontSize: "32px", fontWeight: "bold", margin: "8px 0" }}>
            {/* Placeholder for score - will be calculated later */}
            <span style={{ opacity: 0.7 }}>--</span>
          </div>
          <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
            Score is calculated based on your responses
          </p>
        </div>

        {/* Overall Feedback Box */}
        <div style={{ 
          background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", 
          color: "#333", 
          padding: "24px", 
          borderRadius: "16px", 
          margin: "24px auto", 
          maxWidth: "500px",
          boxShadow: "0 4px 15px rgba(168, 237, 234, 0.3)",
          textAlign: "left",
          minHeight: "100px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "20px", textAlign: "center" }}>Overall Feedback</h3>
          {/* LLM feedback will be inserted here in the future */}
        </div>

        {/* User Code Section */}
        <div style={{ 
          background: "#f8f9fa", 
          border: "2px solid #e9ecef", 
          padding: "20px", 
          borderRadius: "12px", 
          margin: "24px auto", 
          maxWidth: "450px"
        }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#495057" }}>Your User Code</h3>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            color: "#1976d2", 
            margin: "8px 0 16px 0",
            padding: "12px",
            background: "#fff",
            borderRadius: "8px",
            border: "1px solid #dee2e6"
          }}>
            {usercode || "XXXXXXXX"}
          </div>
          <p style={{ margin: "0", fontSize: "14px", color: "#6c757d" }}>
            <strong>Save this code!</strong> Use it again if you want to retake the survey or check your progress.
          </p>
        </div>

        <button 
          onClick={onReturnHome}
          style={{
            padding: "15px 30px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
            transition: "all 0.3s ease",
            fontWeight: "bold",
            marginTop: "16px"
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
          Return to Homepage
        </button>
      </div>
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
  const [submittedQuestions, setSubmittedQuestions] = useState(new Set());
  const [pendingDemographics, setPendingDemographics] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/questions")
      .then(res => {
        setQuestions(res.data);
        setAnswers(Array(Math.min(res.data.length, 10)).fill(3));
        setChats(res.data.slice(0, 10).map((q) => [{ role: "AI", text: `Anything you want to ask about the following question?`}]));
        setLoading(false);
      });
  }, []);

  // Reset step to 0 when entering the wizard
  useEffect(() => {
    if (page === 4) {
      setStep(0);
      setSubmittedQuestions(new Set()); // Reset submitted questions when entering wizard
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
      onHome={() => setPage(0)}
      homeDisabled={false}
    />
  );
  if (page === 2.5) return (
    <ReturnUserPage
      onReturning={code => { setUsercode(code); setPage(3.5); }}
      onBack={() => setPage(2)}
      setUsercode={setUsercode}
      onHome={() => setPage(0)}
      homeDisabled={false}
    />
  );
  if (page === 3) return (
    <DemographicsPage
      onSubmit={(form, goHome) => {
        if (goHome) setPage(0);
        else { setPendingDemographics(form); setPage(3.5); }
      }}
      onBack={() => setPage(2)}
      usercode={usercode}
      homeDisabled={false}
    />
  );
  if (page === 3.5) return (
    <SurveyInstructionsPage
      onContinue={async () => {
        if (pendingDemographics) {
          try {
            console.log("Registering user with data:", pendingDemographics);
            const res = await axios.post("http://localhost:8000/register_user", pendingDemographics);
            console.log("Registration response:", res.data);
            setUsercode(res.data.usercode);
            setPendingDemographics(null);
            setPage(4);
          } catch (error) {
            console.error("Registration error:", error.response?.data || error.message);
            alert(`Error registering user: ${error.response?.data?.detail || error.message || "Please try again."}`);
          }
        } else {
          setPage(4);
        }
      }}
      onBack={() => setPage(2)}
    />
  );

  // Survey completion page
  if (surveyCompleted) {
    return <SurveyCompletionPage onReturnHome={() => { setSurveyCompleted(false); setPage(0); }} usercode={usercode} />;
  }

  // Wizard logic
  if (loading) return <div>Loading questions...</div>;

  // Limit to 10 questions
  const limitedQuestions = questions.slice(0, 10);
  
  const steps = [];
  limitedQuestions.forEach((q, i) => {
    steps.push({ type: "question", question: q.text, qIndex: i, question_id: q.id, questionNumber: i + 1 });
  });

  // Check if we have questions and valid step
  if (steps.length === 0) {
    return <div>No questions available. Please try again later.</div>;
  }

  // Ensure step is within valid range
  const validStep = Math.max(0, Math.min(step, steps.length - 1));
  const current = steps[validStep];
  const currentQuestionNumber = current ? current.questionNumber : 1;
  
  // Update step if it was out of bounds
  if (validStep !== step) {
    setStep(validStep);
  }
  
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
    <div className="responsive-page">
      <div className="responsive-header">
        <HomeLogo onHome={() => setPage(0)} disabled={true} />
      </div>
      <div className="responsive-card" style={{ padding: 16 }}>
        <div style={{ textAlign: "right", marginTop: "40px"}}>
        {usercode && <div style={{ margin: "16px 0", fontWeight: "bold" }}>Your User Code: {usercode}</div>}
        </div>
        <ProgressBar current={currentQuestionNumber} total={10} />
        {current && (
          <WizardStep
            key={`question-${current.qIndex}-${submittedQuestions.has(current.qIndex)}`}
            question={current.question}
            value={answers[current.qIndex]}
            onChange={handleAnswerChange}
            conversation={chats[current.qIndex] || []}
            onSendChat={handleSendChat}
            showChat={false}
            onSubmit={() => {
              // Mark this question as submitted
              setSubmittedQuestions(prev => new Set([...prev, current.qIndex]));
              // Show feedback after submitting
              setChats(current => 
                current.map((c, i) => 
                  i === current.qIndex 
                    ? [{ role: "AI", text: `Thank you for your answer! Your response was ${answers[current.qIndex]}/6. Is there anything you'd like to discuss about this question?` }]
                    : c
                )
              );
            }}
            onBack={prevStep}
            onNext={nextStep}
            isLastStep={step === steps.length - 1}
            isSubmitted={submittedQuestions.has(current.qIndex)}
            question_id={current.question_id}
          />
        )}
        {current && step === steps.length - 1 && submittedQuestions.has(current.qIndex) && (
          <div style={{ marginTop: 20 }}>
            <b>All answers:</b>
            <pre>{JSON.stringify(createAnswersDictionary(), null, 2)}</pre>

            <div style={{ textAlign: "right", marginTop: "40px" }}>
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
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
              }}
            >
              Finish Survey
            </button>
            </div>
          </div>
        )}
      </div>
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
    // If user changes their answer, remove the submitted status
    if (submittedQuestions.has(qIdx)) {
      setSubmittedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(qIdx);
        return newSet;
      });
    }
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