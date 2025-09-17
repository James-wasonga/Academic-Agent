import React from 'react';
import { Search } from 'lucide-react';

const ResearchForm = ({ query, setQuery, onSubmit, loading }) => {
  const quickTopics = [
    'Data Structures and Algorithms',
    'Web Development Best Practices', 
    'Database Design Principles',
    'Software Testing Methodologies'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading && query.trim()) {
      onSubmit(query);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2 text-indigo-600" />
        Research Assistant
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Research Topic or Question
          </label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Machine Learning algorithms for natural language processing"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Research</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Quick Topics:</p>
          <div className="flex flex-wrap gap-2">
            {quickTopics.map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => setQuery(topic)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ResearchForm;