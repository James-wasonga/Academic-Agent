import { useState, useCallback } from 'react';
import { researchAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';

export const useResearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const { addResearchQuery, history } = useAppContext();

  const performResearch = useCallback(async (query, tools = ['search', 'wiki', 'save']) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting research for:', query);
      const result = await researchAPI.search(query, tools);
      console.log('Research completed:', result);
      
      // Add to global state/statistics
      const queryData = {
        ...result,
        query: query,
        timestamp: new Date().toISOString(),
        id: `research_${Date.now()}`
      };
      
      addResearchQuery(queryData);
      setResults(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to perform research';
      setError(errorMessage);
      console.error('Research error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addResearchQuery]);

  const saveResults = useCallback(async (data) => {
    try {
      await researchAPI.saveResult(data);
    } catch (err) {
      setError(err.message || 'Failed to save results');
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    loading,
    results,
    history: history.research,
    error,
    performResearch,
    saveResults,
    clearResults
  };
};
