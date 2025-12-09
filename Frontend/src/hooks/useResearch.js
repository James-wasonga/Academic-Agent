
// Final Complete Version with localStorage persistence

import { useState, useCallback } from 'react';
import { researchAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';

export const useResearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const { addResearchQuery, history } = useAppContext();

  // Save research to localStorage for persistent history
  const saveToLocalStorage = useCallback((queryData) => {
    try {
      // Get existing history from localStorage
      const existingHistory = localStorage.getItem('researchHistory');
      const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Check for duplicates to avoid saving the same research twice
      const isDuplicate = historyArray.some(
        item => item.id === queryData.id || 
        (item.query === queryData.query && 
         Math.abs(new Date(item.timestamp) - new Date(queryData.timestamp)) < 60000)
      );
      
      if (!isDuplicate) {
        // Add new research to the beginning of the array
        historyArray.unshift(queryData);
        
        // Keep only the last 50 items to prevent storage bloat
        const trimmedHistory = historyArray.slice(0, 50);
        
        // Save back to localStorage
        localStorage.setItem('researchHistory', JSON.stringify(trimmedHistory));
        
        console.log('✅ Research saved to history');
        return true;
      } else {
        console.log('ℹ️ Research already exists in history');
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      return false;
    }
  }, []);

  // Get the count of saved research items (useful for badges)
  const getHistoryCount = useCallback(() => {
    try {
      const history = localStorage.getItem('researchHistory');
      if (history) {
        return JSON.parse(history).length;
      }
    } catch (error) {
      console.error('Error reading history count:', error);
    }
    return 0;
  }, []);

  const performResearch = useCallback(async (query, tools = ['search', 'wiki', 'save']) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting research for:', query);
      const result = await researchAPI.search(query, tools);
      console.log('Research completed:', result);
      
      // Create query data object
      const queryData = {
        ...result,
        query: query,
        timestamp: new Date().toISOString(),
        id: `research_${Date.now()}`
      };
      
      // Add to global state/statistics (AppContext)
      addResearchQuery(queryData);
      
      // Also save to localStorage for persistent history
      saveToLocalStorage(queryData);
      
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
  }, [addResearchQuery, saveToLocalStorage]);

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
    clearResults,
    getHistoryCount,      // NEW: Get count of saved research
    saveToLocalStorage    // NEW: Manual save function (if needed)
  };
};