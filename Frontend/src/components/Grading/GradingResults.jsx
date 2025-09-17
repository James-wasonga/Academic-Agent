import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const GradingResults = ({ gradingResults }) => {
  if (!gradingResults) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-500';
    if (score >= 60) return 'text-yellow-600 bg-yellow-500';
    return 'text-red-600 bg-red-500';
  };

  const getFeedbackIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />;
    }
  };

  const getFeedbackBgColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Score Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Grade Overview</h3>
          <div className="flex items-center space-x-2">
            <div className={`text-3xl font-bold ${getScoreColor(gradingResults.score).split(' ')[0]}`}>
              {gradingResults.score}%
            </div>
            <div className="text-gray-500">/ 100</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getScoreColor(gradingResults.score).split(' ')[1]}`}
            style={{ width: `${gradingResults.score}%` }}
          ></div>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Feedback</h3>
        
        <div className="space-y-3">
          {gradingResults.feedback.map((item, index) => (
            <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${getFeedbackBgColor(item.type)}`}>
              {getFeedbackIcon(item.type)}
              <div>
                <p className="text-sm font-medium text-gray-900">{item.message}</p>
                {item.line && <p className="text-xs text-gray-500 mt-1">Line {item.line}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions & Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
            Suggestions for Improvement
          </h3>
          <ul className="space-y-2">
            {gradingResults.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Code Strengths
          </h3>
          <ul className="space-y-2">
            {gradingResults.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GradingResults;