import { useState, useCallback } from 'react';
import { researchAPI } from '../services/api';

export const useResearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const performResearch = useCallback(async (query, tools = ['search', 'wiki', 'save']) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting research for:', query);
      const result = await researchAPI.search(query, tools);
      console.log('Research completed:', result);
      
      setResults(result);
      setHistory(prev => [result, ...prev]);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to perform research';
      setError(errorMessage);
      console.error('Research error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    history,
    error,
    performResearch,
    saveResults,
    clearResults
  };
};



// import { useState, useCallback } from 'react';
// // import { researchAPI } from '../services/api';

// export const useResearch = () => {
//   const [loading, setLoading] = useState(false);
//   const [results, setResults] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [error, setError] = useState(null);

//   const performResearch = useCallback(async (query, tools = ['search', 'wiki', 'save']) => {
//     if (!query.trim()) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Mock implementation - replace with actual API call
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       const mockResult = {
//         topic: query,
//         summary: `Comprehensive research analysis on "${query}". This research provides in-depth insights covering theoretical foundations, practical applications, and current trends in the field.`,
//         sources: "Multiple academic sources including research papers, educational materials, and expert analysis",
//         tool_used: tools,
//         timestamp: new Date().toLocaleString(),
//         id: `research_${Date.now()}`
//       };
      
//       setResults(mockResult);
//       setHistory(prev => [mockResult, ...prev]);
//       return mockResult;
//     } catch (err) {
//       setError(err.message || 'Failed to perform research');
//       console.error('Research error:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const saveResults = useCallback(async (data) => {
//     try {
//       // Implementation for saving results
//       console.log('Saving results:', data);
//     } catch (err) {
//       setError(err.message || 'Failed to save results');
//     }
//   }, []);

//   const clearResults = useCallback(() => {
//     setResults(null);
//     setError(null);
//   }, []);

//   return {
//     loading,
//     results,
//     history,
//     error,
//     performResearch,
//     saveResults,
//     clearResults
//   };
// };