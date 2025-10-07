import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const GradingResults = ({ gradingResults }) => {
  const [expandedFeedback, setExpandedFeedback] = useState({});

  if (!gradingResults) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-500';
    if (score >= 60) return 'text-yellow-600 bg-yellow-500';
    return 'text-red-600 bg-red-500';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
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

  const getFeedbackPriority = (type) => {
    switch (type) {
      case 'error':
        return 'High Priority';
      case 'warning':
        return 'Medium Priority';
      default:
        return 'Good Practice';
    }
  };

  const toggleFeedback = (index) => {
    setExpandedFeedback(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Score Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Grade Overview</h3>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(gradingResults.score).split(' ')[0]}`}>
                {gradingResults.score}%
              </div>
              <div className="text-sm text-gray-500">
                Grade: <span className="font-semibold">{getScoreGrade(gradingResults.score)}</span>
              </div>
            </div>
            <div className="text-gray-400 text-2xl font-light">/ 100</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className={`h-4 rounded-full transition-all duration-1000 ${getScoreColor(gradingResults.score).split(' ')[1]}`}
            style={{ width: `${gradingResults.score}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Detailed Feedback with Line Numbers */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Feedback</h3>
          <div className="text-sm text-gray-500">
            {gradingResults.feedback.length} issue{gradingResults.feedback.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        <div className="space-y-3">
          {gradingResults.feedback.map((item, index) => (
            <div key={index} className={`rounded-lg border ${getFeedbackBgColor(item.type)} overflow-hidden`}>
              <div 
                className="flex items-start space-x-3 p-3 cursor-pointer"
                onClick={() => toggleFeedback(index)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getFeedbackIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{item.message}</p>
                    {expandedFeedback[index] ? 
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : 
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    }
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1">
                    {item.line && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Line {item.line}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${
                      item.type === 'error' ? 'text-red-600' :
                      item.type === 'warning' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getFeedbackPriority(item.type)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedFeedback[index] && (
                <div className="border-t border-gray-200 px-3 py-3 bg-white bg-opacity-50">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Issue Type:</strong> {item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                    {item.line && (
                      <p><strong>Location:</strong> Line {item.line}</p>
                    )}
                    <p><strong>Recommendation:</strong> {
                      item.type === 'error' ? 'This should be fixed before submission as it may prevent code execution.' :
                      item.type === 'warning' ? 'Consider addressing this to improve code quality and maintainability.' :
                      'This represents good coding practice. Keep it up!'
                    }</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {gradingResults.feedback.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No issues found in your code!</p>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions & Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" /> 
            Suggestions for Improvement
          </h3>
          {gradingResults.suggestions.length > 0 ? (
            <ul className="space-y-3">
              {gradingResults.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-3 p-2 rounded-lg bg-orange-50">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 leading-relaxed">{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm italic">No suggestions - your code looks great!</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Code Strengths
          </h3>
          {gradingResults.strengths.length > 0 ? (
            <ul className="space-y-3">
              {gradingResults.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-3 p-2 rounded-lg bg-green-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm italic">Keep working to build code strengths!</p>
          )}
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {gradingResults.feedback.filter(f => f.type === 'error').length}
            </div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {gradingResults.feedback.filter(f => f.type === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {gradingResults.strengths.length}
            </div>
            <div className="text-sm text-gray-600">Strengths</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {gradingResults.suggestions.length}
            </div>
            <div className="text-sm text-gray-600">Suggestions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingResults;