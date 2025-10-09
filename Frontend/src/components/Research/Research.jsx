import React, { useState } from 'react';
import ResearchForm from './ResearchForm';
import ResearchResults from './ResearchResults';
import { useResearch } from '../../hooks/useResearch';

const Research = () => {
  const [query, setQuery] = useState('');
  const { loading, results, performResearch } = useResearch();

  const handleResearch = async (searchQuery) => {
    await performResearch(searchQuery);
  };

  return (
    <div className="space-y-6">
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

