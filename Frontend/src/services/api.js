// import axios from 'axios';

// // const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';
// const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000';


// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor for authentication
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Research API endpoints
// export const researchAPI = {
//   search: async (query, tools = ['search', 'wiki', 'save']) => {
//     const response = await api.post('/api/research', { query, tools });
//     return response.data;
//   },
  
//   getHistory: async () => {
//     const response = await api.get('/api/research/history');
//     return response.data;
//   },
  
//   saveResult: async (data) => {
//     const response = await api.post('/api/research/save', data);
//     return response.data;
//   }
// };

// // Grading API endpoints
// export const gradingAPI = {
//   analyzeCode: async (code, language = 'python', assignment_id = null) => {
//     const response = await api.post('/api/grading/analyze', {
//       code,
//       language,
//       assignment_id
//     });
//     return response.data;
//   },
  
//   getGradingHistory: async () => {
//     const response = await api.get('/api/grading/history');
//     return response.data;
//   },
  
//   submitFeedback: async (gradingId, feedback) => {
//     const response = await api.post(`/api/grading/${gradingId}/feedback`, { feedback });
//     return response.data;
//   }
// };

// // Chat API endpoints
// export const chatAPI = {
//   sendMessage: async (message, context = {}) => {
//     const response = await api.post('/api/chat/message', { message, context });
//     return response.data;
//   },
  
//   getChatHistory: async (sessionId) => {
//     const response = await api.get(`/api/chat/history/${sessionId}`);
//     return response.data;
//   }
// };

// export default api;


import axios from 'axios';

// IMPORTANT: Use VITE_ prefix for Vite environment variables, not REACT_APP_
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://academic-research-agent-api.onrender.com'  // Your actual Render URL
  : import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🏗️ Environment:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for production (Render can be slow to wake up)
});

// Request interceptor - simplified (no auth needed for now)
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('📥 API Error:', error.response?.status, error.response?.data || error.message);
    
    // Handle specific errors
    if (error.response?.status === 404) {
      console.error('❌ Endpoint not found:', error.config.url);
    } else if (error.response?.status >= 500) {
      console.error('❌ Server error - backend may be sleeping or crashed');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('❌ Cannot connect to backend - check if server is running');
    }
    
    return Promise.reject(error);
  }
);

// Research API endpoints
export const researchAPI = {
  search: async (query, tools = ['search', 'wiki', 'save']) => {
    try {
      console.log('🔍 Starting research for:', query);
      const response = await api.post('/api/research', { query, tools });
      console.log('✅ Research completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Research failed:', error);
      throw error;
    }
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
    try {
      console.log(`🔧 Analyzing ${language} code...`);
      const response = await api.post('/api/grading/analyze', {
        code,
        language,
        assignment_id
      });
      console.log('✅ Code analysis completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Code analysis failed:', error);
      throw error;
    }
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

// Chat API endpoints (for future use)
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