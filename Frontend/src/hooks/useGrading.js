import { useState, useCallback } from 'react';
import { gradingAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';

export const useGrading = () => {
  const [loading, setLoading] = useState(false);
  const [gradingResults, setGradingResults] = useState(null);
  const [error, setError] = useState(null);
  
  const { addGradingResult, history } = useAppContext();

  const gradeCode = useCallback(async (code, language = 'python', assignmentId = null) => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting code analysis for:', language);
      const result = await gradingAPI.analyzeCode(code, language, assignmentId);
      console.log('Grading completed:', result);
      
      // Add to global state/statistics
      const gradingData = {
        ...result,
        code: code.substring(0, 200), // Store first 200 chars for reference
        language: language,
        assignmentId: assignmentId,
        timestamp: new Date().toISOString(),
        id: `grading_${Date.now()}`
      };
      
      addGradingResult(gradingData);
      setGradingResults(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to grade code';
      setError(errorMessage);
      console.error('Grading error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addGradingResult]);

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
    history: history.grading,
    error,
    gradeCode,
    submitFeedback,
    clearResults
  };
};
