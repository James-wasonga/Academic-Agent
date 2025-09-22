import React from 'react';
import { Save, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ResearchResults = ({ results }) => {
  if (!results) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-2xl font-bold text-gray-900">Research Results</h3>
        <div className="flex space-x-3">
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

      {/* Topic Section */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-xl font-semibold text-gray-800 mb-1">
          📌 Topic: <span className="font-bold">{results.topic}</span>
        </h4>
      </div>

      {/* Research Summary - Render as Markdown */}
      <div className="prose max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:text-indigo-700">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {results.summary}
        </ReactMarkdown>
      </div>

      {/* Sources Section */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">📚 Sources</h4>
        <p className="text-gray-700 text-sm">{results.sources}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
        <span>Tools used: {results.tool_used.join(', ')}</span>
        <span>Generated: {new Date(results.timestamp).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ResearchResults;
