import React, { useState } from 'react';
import ResearchForm from './ResearchForm';
import ResearchResults from './ResearchResults';
import { useResearch } from '../../hooks/useResearch';
import Toast from '../Toast/Toast';

const Research = () => {
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const { loading, results, performResearch } = useResearch();

  const handleResearch = async (searchQuery) => {
    try{
    await performResearch(searchQuery);
    // show succes research
    setToast({
      type: 'success',
      message: '🎉Research completed successfully!, Your results are ready'
    });
  } catch(e) {
    // show error
    setToast({
      type: 'error',
      message: `🚨Error: ${e.message}`
    });
  }
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={4000}
        />
      )}

      <ResearchForm 
        query={query}
        setQuery={setQuery}
        onSubmit={handleResearch}
        loading={loading}
      />
      <ResearchResults results={results} />
    </div>
  );
};

export default Research;

