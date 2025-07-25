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