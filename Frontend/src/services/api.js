import axios from 'axios';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Research API endpoints
export const researchAPI = {
  search: async (query, tools = ['search', 'wiki', 'save']) => {
    const response = await api.post('/api/research', { query, tools });
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/api/research/history');
    return response.data;
  },
  
  saveResult: async (data) => {
    const response = await api.post('/api/research/save', data);
    return response.data;
  }
};

// Grading API endpoints
export const gradingAPI = {
  analyzeCode: async (code, language = 'python', assignment_id = null) => {
    const response = await api.post('/api/grading/analyze', {
      code,
      language,
      assignment_id
    });
    return response.data;
  },
  
  getGradingHistory: async () => {
    const response = await api.get('/api/grading/history');
    return response.data;
  },
  
  submitFeedback: async (gradingId, feedback) => {
    const response = await api.post(`/api/grading/${gradingId}/feedback`, { feedback });
    return response.data;
  }
};

// Chat API endpoints
export const chatAPI = {
  sendMessage: async (message, context = {}) => {
    const response = await api.post('/api/chat/message', { message, context });
    return response.data;
  },
  
  getChatHistory: async (sessionId) => {
    const response = await api.get(`/api/chat/history/${sessionId}`);
    return response.data;
  }
};

export default api;