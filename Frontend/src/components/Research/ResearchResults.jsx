import React from 'react';
import { Save, Download } from 'lucide-react';

const ResearchResults = ({ results }) => {
  if (!results) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Research Results</h3>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Topic: {results.topic}</h4>
          <p className="text-gray-700 leading-relaxed">{results.summary}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Sources</h4>
          <p className="text-gray-600 text-sm">{results.sources}</p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Tools used: {results.tool_used.join(', ')}</span>
          <span>•</span>
          <span>Generated: {results.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

export default ResearchResults;