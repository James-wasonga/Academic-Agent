import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  stats: {
    researchQueries: 0,
    assignmentsGraded: 0,
    studentQuestions: 0,
    totalGradePoints: 0,
    gradedAssignments: []
  },
  history: {
    research: [],
    grading: [],
    chat: []
  }
};

// Action types
const actionTypes = {
  ADD_RESEARCH_QUERY: 'ADD_RESEARCH_QUERY',
  ADD_GRADING_RESULT: 'ADD_GRADING_RESULT',
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  LOAD_DATA: 'LOAD_DATA',
  RESET_STATS: 'RESET_STATS'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_RESEARCH_QUERY:
      const newResearchState = {
        ...state,
        stats: {
          ...state.stats,
          researchQueries: state.stats.researchQueries + 1
        },
        history: {
          ...state.history,
          research: [action.payload, ...state.history.research]
        }
      };
      // Save to localStorage
      localStorage.setItem('appStats', JSON.stringify(newResearchState));
      return newResearchState;

    case actionTypes.ADD_GRADING_RESULT:
      const newGradingState = {
        ...state,
        stats: {
          ...state.stats,
          assignmentsGraded: state.stats.assignmentsGraded + 1,
          totalGradePoints: state.stats.totalGradePoints + action.payload.score,
          gradedAssignments: [...state.stats.gradedAssignments, action.payload.score]
        },
        history: {
          ...state.history,
          grading: [action.payload, ...state.history.grading]
        }
      };
      localStorage.setItem('appStats', JSON.stringify(newGradingState));
      return newGradingState;

    case actionTypes.ADD_CHAT_MESSAGE:
      const newChatState = {
        ...state,
        stats: {
          ...state.stats,
          studentQuestions: state.stats.studentQuestions + 1
        },
        history: {
          ...state.history,
          chat: [action.payload, ...state.history.chat]
        }
      };
      localStorage.setItem('appStats', JSON.stringify(newChatState));
      return newChatState;

    case actionTypes.LOAD_DATA:
      return action.payload;

    case actionTypes.RESET_STATS:
      localStorage.removeItem('appStats');
      return initialState;

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('appStats');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: actionTypes.LOAD_DATA, payload: parsedData });
      } catch (error) {
        console.error('Error loading saved stats:', error);
      }
    }
  }, []);

  // Helper functions
  const addResearchQuery = (queryData) => {
    dispatch({ type: actionTypes.ADD_RESEARCH_QUERY, payload: queryData });
  };

  const addGradingResult = (gradingData) => {
    dispatch({ type: actionTypes.ADD_GRADING_RESULT, payload: gradingData });
  };

  const addChatMessage = (messageData) => {
    dispatch({ type: actionTypes.ADD_CHAT_MESSAGE, payload: messageData });
  };

  const resetStats = () => {
    dispatch({ type: actionTypes.RESET_STATS });
  };

  // Calculate average grade improvement
  const getAverageGrade = () => {
    const { gradedAssignments } = state.stats;
    if (gradedAssignments.length === 0) return 0;
    const average = gradedAssignments.reduce((sum, grade) => sum + grade, 0) / gradedAssignments.length;
    return Math.round(average);
  };

  const contextValue = {
    stats: state.stats,
    history: state.history,
    addResearchQuery,
    addGradingResult,
    addChatMessage,
    resetStats,
    getAverageGrade
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export { actionTypes };