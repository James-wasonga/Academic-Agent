import { useState, useCallback } from 'react';
import { gradingAPI } from '../services/api';

export const useGrading = () => {
  const [loading, setLoading] = useState(false);
  const [gradingResults, setGradingResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const gradeCode = useCallback(async (code, language = 'python', assignmentId = null) => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting code analysis for:', language);
      const result = await gradingAPI.analyzeCode(code, language, assignmentId);
      console.log('Grading completed:', result);
      
      setGradingResults(result);
      setHistory(prev => [result, ...prev]);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to grade code';
      setError(errorMessage);
      console.error('Grading error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitFeedback = useCallback(async (gradingId, feedback) => {
    try {
      await gradingAPI.submitFeedback(gradingId, feedback);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    }
  }, []);

  const clearResults = useCallback(() => {
    setGradingResults(null);
    setError(null);
  }, []);

  return {
    loading,
    gradingResults,
    history,
    error,
    gradeCode,
    submitFeedback,
    clearResults
  };
};

// import { useState, useCallback } from 'react';
// // import { gradingAPI } from '../services/api';

// export const useGrading = () => {
//   const [loading, setLoading] = useState(false);
//   const [gradingResults, setGradingResults] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [error, setError] = useState(null);

//   const gradeCode = useCallback(async (code, language = 'python', assignmentId = null) => {
//     if (!code.trim()) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Mock implementation - replace with actual API call
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       const mockGrading = {
//         score: 78,
//         feedback: [
//           { type: 'error', message: 'Missing error handling in line 15', line: 15 },
//           { type: 'warning', message: 'Consider using more descriptive variable names', line: 8 },
//           { type: 'success', message: 'Good use of functions and modularity', line: null }
//         ],
//         suggestions: [
//           "Add try-catch blocks for error handling",
//           "Use more descriptive variable names (e.g., 'userData' instead of 'data')",
//           "Consider adding comments for complex logic"
//         ],
//         strengths: [
//           "Clean code structure",
//           "Proper function organization",
//           "Good use of modern syntax"
//         ],
//         timestamp: new Date().toLocaleString(),
//         language: language,
//         id: `grading_${Date.now()}`
//       };
      
//       setGradingResults(mockGrading);
//       setHistory(prev => [mockGrading, ...prev]);
//       return mockGrading;
//     } catch (err) {
//       setError(err.message || 'Failed to grade code');
//       console.error('Grading error:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const submitFeedback = useCallback(async (gradingId, feedback) => {
//     try {
//       // Implementation for submitting feedback
//       console.log('Submitting feedback:', gradingId, feedback);
//     } catch (err) {
//       setError(err.message || 'Failed to submit feedback');
//     }
//   }, []);

//   const clearResults = useCallback(() => {
//     setGradingResults(null);
//     setError(null);
//   }, []);

//   return {
//     loading,
//     gradingResults,
//     history,
//     error,
//     gradeCode,
//     submitFeedback,
//     clearResults
//   };
// };