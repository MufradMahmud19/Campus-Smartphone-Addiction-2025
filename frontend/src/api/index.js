import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Adjust the URL based on your backend configuration

export const submitAnswer = async (questionIndex, answer) => {
  try {
    const response = await axios.post(`${API_URL}/answers`, {
      questionIndex,
      answer,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
};

export const getChatResponse = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, {
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw error;
  }
};

// ADD BELOW — starts/updates the user's in-progress session timestamp
export const startSession = async (usercode) => {
  try {
    const res = await axios.post(`${API_URL}/users/${encodeURIComponent(usercode)}/session/start`);
    return res.data; // { usercode, session_start_time }
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
};

// Returns: { text, feedback_id, session_no }
export const answerFeedback = async ({
  usercode,
  survey_id = "sas-sv-10",
  question_id,
  question_text,
  answer,
  max_new_tokens = 220,
  temperature = 0.2
}) => {
  try {
    const res = await axios.post(`${API_URL}/v1/survey/answer_feedback`, {
      usercode,
      survey_id,
      question_id,
      question_text,
      answer,
      max_new_tokens,
      temperature
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching answer feedback:", error);
    throw error;
  }
};

// Returns: { text }
export const chatLLM = async ({
  usercode,
  messages,
  max_new_tokens = 256,
  temperature = 0.2,
  top_p = 0.9
}) => {
  // messages must be [{ role: "system"|"user"|"assistant", content: "..." }, ...]
  const res = await axios.post(`${API_URL}/v1/chat`, {
    usercode,
    messages,
    max_new_tokens,
    temperature,
    top_p
  });
  return res.data; // { text }
};

// --- Final overall feedback (LLM) ---
export async function finalSurveyFeedback({ usercode, survey_id, all_answers, summary_of_user = "" }) {
  const url = `${API_URL}/v1/survey/final_feedback`;
  const body = {
    usercode,
    survey_id,
    all_answers,          // [{ question_id, question, answer }]
    summary_of_user,      // optional; pass "" if not available
    max_new_tokens: 380,
    temperature: 0.2
  };
  const { data } = await axios.post(url, body);
  // expected: { text, feedback_id, session_no }
  return data;
}

// --- Submit survey (persist + increment session, re-tag chats/feedback) ---
export async function submitSurvey({ usercode, answersMap }) {
  // Backend expects answers keyed by question_id
  // payload shape used previously in your app
  const url = `${API_URL}/submit_survey`;
  const body = {
    usercode,
    answers: answersMap,
    completed_at: new Date().toISOString()
  };
  const { data } = await axios.post(url, body);
  return data;
}
