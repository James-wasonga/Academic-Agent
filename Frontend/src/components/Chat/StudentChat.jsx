import React from 'react';
import { MessageCircle, CheckCircle, Clock } from 'lucide-react';

const StudentChat = () => {
  const stats = [
    { title: 'Common Questions', count: '47', icon: MessageCircle },
    { title: 'Resolved Today', count: '23', icon: CheckCircle },
    { title: 'Avg Response Time', count: '< 1min', icon: Clock }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
        24/7 Student Q&A Assistant
      </h2>
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <p className="text-purple-800 text-sm">
          <strong>Coming Soon:</strong> AI-powered chat assistant to answer student questions instantly, 
          provide coding help, and offer personalized learning recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <stat.icon className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentChat;