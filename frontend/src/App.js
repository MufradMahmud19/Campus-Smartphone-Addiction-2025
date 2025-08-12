import React, { useState, useEffect } from "react";
import axios from "axios";
import { WizardStep } from "./WizardStep";
import SurveyInstructionsPage from "./components/SurveyInstructionsPage";
import HelpModal from "./components/HelpModal";
import AnswerDistributionChart from "./components/AnswerDistributionChart";
import LLMChatBox from "./components/LLMChatBox";

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
          <h3 style={{ color: "#333", marginBottom: "30px" }}>This platform supports an ongoing study.</h3>
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
  const [showHelp, setShowHelp] = useState(false);

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
      <div className="responsive-header" style={{ display: "flex", alignItems: "center", paddingRight: 16 }}>
        <HomeLogo onHome={() => onNext(0)} />
        <div style={{ flex: 1 }} />
        <button
          aria-label="Show help"
          onClick={() => setShowHelp(true)}
          style={{
            background: "#e3f2fd",
            border: "none",
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            color: "#1976d2",
            cursor: "pointer",
            boxShadow: "0 2px 8px #e3f2fd"
          }}
        >
          ?
        </button>
        <HelpModal open={showHelp} onClose={() => setShowHelp(false)}>
          <h2 style={{textAlign: "center", color: "#1976d2", marginBottom: 12}}>About the System</h2>
          <h3 style={{textAlign: "center", marginTop: 0, color: "#333"}}>Smartphone Wizard</h3>
          <p>This system is created to explore the relationship between smartphone use and academic, emotional, and behavioral patterns among students in a post-COVID university environment. This study will help identify patterns of smartphone overuse or potential addiction, offering insights into students’ wellbeing, academic engagement, and digital habits. The results can guide the development of digital wellbeing tools and inform future interventions for smartphone-related behavioral challenges.</p>
          <h4 style={{marginTop: 18, color: "#1976d2"}}>Purpose of the System</h4>
          <p>The system is built to help users reflect on their smartphone usage habits and identify whether their behavior may be linked to signs of problematic use or smartphone addiction.</p>
          <h4 style={{marginTop: 18, color: "#1976d2"}}>How It Works</h4>
          <ul style={{marginLeft: 18, marginBottom: 0}}>
            <li><b>Answer Structured Questions:</b> Users are guided through a wizard-style interface where they respond to a series of smartphone-related behavioral questions.</li>
            <li><b>Instant Feedback Mechanism:</b> After each response, a feedback comment appears to reflect the potential behavioral implications of the selected answer.</li>
            <li><b>Addiction Risk Classification:</b> At the end of the survey, users receive a summary based on their cumulative score that indicates whether they may be at risk of smartphone addiction.</li>
            <li><b>Unique User Code:</b> First-time users receive a unique access code that allows them to retake the survey later. This code helps track behavioral changes without collecting personal identifiers.</li>
            <li><b>Repeat Tracking & Progress Monitoring:</b> Returning users can enter their code to receive comparative feedback based on past submissions which allows reflection on trends and changes over time.</li>
          </ul>
          <h4 style={{marginTop: 18, color: "#1976d2"}}>Who are behind this?</h4>
          <p style={{marginBottom: 0}}><b>Developed by</b><br/>
          ⇒ Mufrad Mahmud<br/>
          ⇒ Nicholas Hettiarachchige Don<br/>
          Master’s students, Center for Ubiquitous Computing, University of Oulu.</p>
          <p style={{marginBottom: 0}}><b>Research Supervisor</b><br/>
          ⇒ Aku Visuri<br/>
          University of Oulu</p>
          <p style={{marginBottom: 0}}><b>Contact (for questions)</b><br/>
          ✉️ mufrad.mahmud@oulu.fi<br/>
          📞 +358 44 2461130</p>
        </HelpModal>
      </div>
      <div className="responsive-card">
        
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>Informed Consent</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "25px", marginBottom: "30px" }}>
          {/* First box - Left aligned */}
          <div style={{
            background: "linear-gradient(135deg, #789fd6ff 0%, #7d6693ff 100%)",
            color: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-start",
            maxWidth: "300px",
            textAlign: "center"  // Center the content inside the div
          }}>
            <strong style={{ fontSize: "16px" }}>Research Consent Form</strong><br />
            <p style={{ margin: "8px 0", textAlign: "justify" }}>This consent form, a copy of which has been given to you, is only part of the process of informed consent. It should give you the basic idea of what the research is about and what your participation will involve. If you would like more detail about something mentioned here, or information not included here, please ask. Please take the time to read this form carefully and to understand any accompanying information.</p>
          </div>


          {/* Second box - Right aligned */}
          <div style={{
            background: "linear-gradient(135deg, #e2d364ff 0%, #6c9858ff 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-end",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>Research Project Title</strong>
            <p style={{ margin: "8px 0", textAlign: "justify" }}>Campus Smartphone Addiction</p>
          </div>

          {/* Third box - Left aligned */}
          <div style={{
            background: "linear-gradient(135deg, #76f1bcff 0%, #fef9d7 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-start",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px"}}>About the Researchers</strong>
            <p style={{ margin: "8px 0", textAlign: "justify" }}>
              Researchers: <br></br>
              ➱ Mufrad Mahmud <br></br>
              ➱ Nicholas Hettiarachchige Don<br></br><br></br>
              Research Supervisor: <br></br>
              ▻ Aku Visuri <br></br><br></br>
              Mufrad Mahmud and Nicholas Hettiarachchige Don are Masters students at the Center for Ubiquitous Computing at the University of Oulu. The supervisor from the university side is Aku Visuri.<br></br>Contact information of Mufrad Mahmud is mufrad.mahmud@oulu.fi and +358 44 2461130.
              </p>
          </div>

          {/* 4th box - Right aligned*/}
          <div style={{
            background: "linear-gradient(135deg, #76b4f1ff 0%, #c7d3f5ff 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-end",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>Experiment Purpose</strong>
            <p style={{ margin: "8px 0", textAlign: "justify" }}>
              The purpose of this experiment is to explore the relationship between smartphone use and academic, emotional, and behavioral patterns among students in a post-COVID university environment. This study will help identify patterns of smartphone overuse or potential addiction, offering insights into students’ wellbeing, academic engagement, and digital habits. The results can guide the development of digital wellbeing tools and inform future interventions for smartphone-related behavioral challenges.
            </p>
          </div>

          {/* 5th box - Left aligned */}
          <div style={{
            background: "linear-gradient(135deg, #84d2deff 0%, #b37890ff 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-start",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>Participant Recruitment and Selection</strong>
            <p style={{ margin: "8px 0", textAlign: "justify" }}>Participants are recruited through an open call aimed at individuals currently enrolled in higher education or engaged in campus life. We welcome participants from all backgrounds who are interested in understanding their smartphone use patterns and whether they may be prone to problematic smartphone use or addiction.</p>
          </div>

          {/* 6th box - Right aligned */}
          <div style={{
            background: "linear-gradient(135deg, #76b4f1ff 0%, #c7d3f5ff 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-end",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>Experiment Procedure & Data Collection</strong>
            <p style={{ margin: "8px 0", textAlign: "justify" }}>
            The study will run over an extended period, with multiple voluntary participation points throughout the academic year. Data will be collected via an online survey platform that includes: <br></br><br></br>
            ➥ Smartphone Addiction Scale (SAS) short version standardized questionnaire. <br></br>
            ➥ Self-reported wellbeing and academic performance indicators. <br></br>
            ➥ Optional interactive components and chatbot feedback. <br></br><br></br>
            You will not be asked to provide personal identifiable information. We collect only basic demographic data such as age, gender, country of origin, field of study, study years to support comparative analysis for now. A unique user code will be generated to allow repeat participation and personalized feedback without identifying you. <br></br><br></br>
            Your responses are stored securely and used solely for academic research purposes. You may withdraw from the study at any time. If you do not wish to continue, you can request for all previously submitted data to be removed.
            </p>
          </div>

          {/* 7th box - Left aligned */}
          <div style={{
            background: "linear-gradient(135deg, #8ec598ff 0%, #a7b1e4ff 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-start",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>Data Archiving/Destruction</strong>
            <p style={{ margin: "8px 0", textAlign: "justify" }}>Data will be kept securely. The investigator will destroy study data after the research. This will be at the end of the research project when results are fully reported and disseminated.</p>
          </div>

          {/* 8th box - Right aligned */}
          <div style={{
            background: "linear-gradient(135deg, #f7c28dff 0%, #cdaab8ff 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-end",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>Confidentiality</strong>
            <p style={{ margin: "8px 0", textAlign: "justify" }}>
              Confidentiality and participant anonymity will be strictly maintained. All information gathered will be used for statistical analysis only and no names or other identifying characteristics will be stated in the final or any other reports.
            </p>
          </div>

          {/* 9th box - Left aligned */}
          <div style={{
            background: "linear-gradient(135deg, rgba(170, 221, 179, 1) 0%, #dadb7bff 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-start",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>Likelihood of Discomfort</strong>
            <p style={{ margin: "8px 0", textAlign: "justify" }}>There is no likelihood of risk associated with participation.</p>
          </div>

          {/* 10th box - Right aligned */}
          <div style={{
            background: "linear-gradient(135deg, #8da1f7ff 0%, #cdaab8ff 100%)",
            color: "#333",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            alignSelf: "flex-end",
            maxWidth: "300px"
          }}>
            <strong style={{ fontSize: "16px" }}>Finding out about Results</strong>
            <p style={{ margin: "8px 0", textAlign: "justify" }}>
              The participants can find out the results of the study just after completing the survey.
            </p>
          </div>

          {/* Agreement box - Centered */}
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
              <h3 style={{ margin: "15px 0", color: "#333" }}>Agreement</h3>
            </div>
            
            <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#555", marginBottom: "25px" }}>
              <p style={{ margin: "8px 0", fontStyle: "italic", textAlign: "justify" }}>By selecting "Accept", you confirm that you have read and understood the information about this study, and voluntarily agree to participate. Your participation is entirely optional, and you may discontinue at any time. You may reach out to the research team at any point for questions or clarifications related to this study.</p>
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
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>What is your country of origin?</label>
          <input 
            name="country" 
            placeholder="Enter your country of origin" 
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
  const [showHelp, setShowHelp] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [showChatBox, setShowChatBox] = useState({}); // Changed to object to track per question
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [chartKey, setChartKey] = useState(0);

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
      setShowChatBox({}); // Reset chat box visibility for all questions
    }
  }, [page]);

  // Fetch chart data when a question is submitted
  useEffect(() => {
    if (page === 4 && !loading && questions.length > 0) {
      const limitedQuestions = questions.slice(0, 10);
      const steps = [];
      limitedQuestions.forEach((q, i) => {
        steps.push({ type: "question", question: q.text, qIndex: i, question_id: q.id, questionNumber: i + 1 });
      });
      
      if (steps.length > 0) {
        const validStep = Math.max(0, Math.min(step, steps.length - 1));
        const current = steps[validStep];
        
          if (current && submittedQuestions.has(current.qIndex) && current.question_id) {
          fetchChartData(current.question_id);
        }
      }
    }
  }, [page, loading, questions, step, submittedQuestions]);

  // Function to fetch chart data for a specific question
  function fetchChartData(questionId) {
    setChartLoading(true);
    setChartError(null);
    
    fetch(`http://localhost:8000/question_answers/${questionId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Defensive: ensure data is an array
        let arr = [];
        if (Array.isArray(data)) {
          // The backend now returns a simple array of integers
          arr = data;
        } else if (data && typeof data === 'object' && 'answer' in data) {
          arr = [data.answer];
        } else {
          arr = [];
        }
        setChartData(arr);
        setChartLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching chart data:", error);
        setChartError(error.message);
        setChartData([]);
        setChartLoading(false);
      });
  }

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
            const res = await axios.post("http://localhost:8000/register", pendingDemographics);
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

  return (
    <div className="responsive-page">
      <div className="responsive-header" style={{ display: "flex", alignItems: "center", paddingRight: 16 }}>
        <HomeLogo onHome={() => setPage(0)} disabled={true} />
        <div style={{ flex: 1 }} />
        <button
          aria-label="Show help"
          onClick={() => setShowHelp(true)}
          style={{
            background: "#e3f2fd",
            border: "none",
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            color: "#1976d2",
            cursor: "pointer",
            boxShadow: "0 2px 8px #e3f2fd"
          }}
        >
          ?
        </button>
        <HelpModal open={showHelp} onClose={() => setShowHelp(false)}>
          <h2 style={{textAlign: "center", color: "#1976d2", marginBottom: 12}}>About the System</h2>
          <h3 style={{textAlign: "center", marginTop: 0, color: "#333"}}>Smartphone Wizard</h3>
          <p>This system is created to explore the relationship between smartphone use and academic, emotional, and behavioral patterns among students in a post-COVID university environment. This study will help identify patterns of smartphone overuse or potential addiction, offering insights into students' wellbeing, academic engagement, and digital habits. The results can guide the development of digital wellbeing tools and inform future interventions for smartphone-related behavioral challenges.</p>
          <h4 style={{marginTop: 18, color: "#1976d2"}}>Purpose of the System</h4>
          <p>The system is built to help users reflect on their smartphone usage habits and identify whether their behavior may be linked to signs of problematic use or smartphone addiction.</p>
          <h4 style={{marginTop: 18, color: "#1976d2"}}>How It Works</h4>
          <ul style={{marginLeft: 18, marginBottom: 0}}>
            <li><b>Answer Structured Questions:</b> Users are guided through a wizard-style interface where they respond to a series of smartphone-related behavioral questions.</li>
            <li><b>Instant Feedback Mechanism:</b> After each response, a feedback comment appears to reflect the potential behavioral implications of the selected answer.</li>
            <li><b>Addiction Risk Classification:</b> At the end of the survey, users receive a summary based on their cumulative score that indicates whether they may be at risk of smartphone addiction.</li>
            <li><b>Unique User Code:</b> First-time users receive a unique access code that allows them to retake the survey later. This code helps track behavioral changes without collecting personal identifiers.</li>
            <li><b>Repeat Tracking & Progress Monitoring:</b> Returning users can enter their code to receive comparative feedback based on past submissions which allows reflection on trends and changes over time.</li>
          </ul>
          <h4 style={{marginTop: 18, color: "#1976d2"}}>Who are behind this?</h4>
          <p style={{marginBottom: 0}}><b>Developed by</b><br/>
          ⇒ Mufrad Mahmud<br/>
          ⇒ Nicholas Hettiarachchige Don<br/>
          Master's students, Center for Ubiquitous Computing, University of Oulu.</p>
          <p style={{marginBottom: 0}}><b>Research Supervisor</b><br/>
          ⇒ Aku Visuri<br/>
          University of Oulu</p>
          <p style={{marginBottom: 0}}><b>Contact (for questions)</b><br/>
          ✉️ mufrad.mahmud@oulu.fi<br/>
          📞 +358 44 2461130</p>
        </HelpModal>
      </div>
      <div className="responsive-card" style={{ padding: 16 }}>
        <div style={{ textAlign: "right", marginTop: "40px"}}>
        {usercode && <div style={{ margin: "16px 0", fontWeight: "bold" }}>Your User Code: {usercode}</div>}
        </div>
        
        {/* Progress Bar with Navigation */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: 15
          }}>
            <button 
              onClick={prevStep}
              disabled={step === 0}
              style={{
                padding: "8px 12px",
                fontSize: "18px",
                backgroundColor: step === 0 ? "#cccccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: step === 0 ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                fontWeight: "bold",
                opacity: step === 0 ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (step !== 0) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              ←
            </button>
            
            <div style={{ flex: 1, margin: "0 20px" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: 8 
              }}>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {currentQuestionNumber}/10
                </span>
                <span style={{ fontSize: "14px", color: "#666" }}>
                  {Math.round((currentQuestionNumber / 10) * 100)}% Complete
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
                  width: `${(currentQuestionNumber / 10) * 100}%`, 
                  height: "100%", 
                  backgroundColor: "#4CAF50", 
                  transition: "width 0.3s ease" 
                }} />
              </div>
            </div>
            
            <button 
              onClick={nextStep}
              disabled={!submittedQuestions.has(current.qIndex) || step === steps.length - 1}
              style={{
                padding: "8px 12px",
                fontSize: "18px",
                backgroundColor: (!submittedQuestions.has(current.qIndex) || step === steps.length - 1) ? "#cccccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: (!submittedQuestions.has(current.qIndex) || step === steps.length - 1) ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                fontWeight: "bold",
                opacity: (!submittedQuestions.has(current.qIndex) || step === steps.length - 1) ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (submittedQuestions.has(current.qIndex) && step !== steps.length - 1) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              →
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div>
          {/* Question Section */}
          <div style={{ marginBottom: "20px" }}>
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
                   // Immediately refresh chart and force re-render keyed by current answer
                   if (current.question_id) {
                     fetchChartData(current.question_id);
                     setChartKey(k => k + 1);
                   }
                }}
                onBack={prevStep}
                onNext={nextStep}
                isLastStep={step === steps.length - 1}
                isSubmitted={submittedQuestions.has(current.qIndex)}
                question_id={current.question_id}
                showNavigation={false} // Hide navigation buttons in WizardStep since we have them in the progress bar
              />
            )}
          </div>

          {/* Graph and Feedback Section (only show after submit) */}
          {current && submittedQuestions.has(current.qIndex) && (
            <div style={{ 
              padding: "16px",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              border: "1px solid #e9ecef",
              marginBottom: "20px"
            }}>
              {/* Graph and Feedback Side by Side */}
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                alignItems: "start"
              }}>
                {/* Graph Section */}
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                    <h3 style={{ margin: 0, color: "#333", fontSize: "18px" }}>Answer Distribution</h3>
                    <button
                      onClick={() => fetchChartData(current.question_id)}
                      disabled={chartLoading}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        backgroundColor: chartLoading ? "#ccc" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: chartLoading ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease"
                      }}
                      title="Refresh chart data"
                    >
                      {chartLoading ? "Loading..." : "🔄"}
                    </button>
                  </div>
                  
                  {chartLoading && (
                    <div style={{ 
                      background: "#f9f9f9", 
                      border: "1px solid #ddd", 
                      borderRadius: 10, 
                      padding: 20, 
                      margin: "20px 0", 
                      minHeight: 250,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{ color: "#666", fontSize: "16px" }}>Loading chart data...</div>
                    </div>
                  )}
                  
                  {chartError && (
                    <div style={{ 
                      background: "#f9f9f9", 
                      border: "1px solid #ddd", 
                      borderRadius: 10, 
                      padding: 20, 
                      margin: "20px 0", 
                      minHeight: 250,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{ color: "#ff4444", fontSize: "16px" }}>
                        Error loading chart: {chartError}
                      </div>
                    </div>
                  )}
                  
                  {!chartLoading && !chartError && (
                    <div key={`${chartKey}-${current.qIndex}-${answers[current.qIndex]}`}>
                      <AnswerDistributionChart 
                        answers={chartData} 
                        userAnswer={answers[current.qIndex]} 
                      />
                    </div>
                  )}
                </div>

                {/* Feedback Section */}
                <div style={{ width: "100%" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#333", fontSize: "18px" }}>Feedback</h3>
                  <div style={{ 
                    padding: "15px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6",
                    marginBottom: "15px"
                  }}>
                    <p style={{ margin: "0", color: "#666" }}>
                      You have answered question {currentQuestionNumber} with a score of {answers[current.qIndex]}/6.
                    </p>
                  </div>
                  
                  {/* Start Chat Button */}
                  <button
                    onClick={() => setShowChatBox(prev => ({ ...prev, [current.qIndex]: true }))}
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      fontSize: "16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      fontWeight: "bold"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0, 123, 255, 0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    Start Chat
                  </button>
                </div>
              </div>

              {/* Chat Section (only show after clicking Start Chat) */}
              {showChatBox[current.qIndex] && (
                <div style={{ marginTop: "16px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#333", fontSize: "18px" }}>Chat with AI</h3>
                  <LLMChatBox 
                    conversation={chats[current.qIndex] || []} 
                    onSend={handleSendChat} 
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Finish Survey Button */}
        {current && step === steps.length - 1 && submittedQuestions.has(current.qIndex) && (
          <div style={{ marginTop: 30, textAlign: "center" }}>
            <button 
              onClick={handleFinishSurvey}
              style={{ 
                padding: "15px 30px", 
                fontSize: "18px", 
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
              Finish Survey
            </button>
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