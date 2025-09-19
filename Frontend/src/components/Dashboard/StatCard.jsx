import React, { useState } from 'react';

const StatCard = ({ icon: Icon, title, value, color = "blue", subtitle }) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    blue: {
      text: 'text-blue-600',
      icon: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    green: {
      text: 'text-green-600',
      icon: 'text-green-500',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    purple: {
      text: 'text-purple-600',
      icon: 'text-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    orange: {
      text: 'text-orange-600',
      icon: 'text-orange-500',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    }
  };

  const classes = colorClasses[color];

  return (
    <div 
      className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform ${
        isHovered ? 'scale-105' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${classes.text} mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${classes.bg} ${classes.border} border`}>
          <Icon className={`w-6 h-6 ${classes.icon}`} />
        </div>
      </div>
      
      {/* Progress indicator for visual appeal */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className={`h-1 rounded-full ${classes.bg.replace('bg-', 'bg-').replace('-50', '-300')} transition-all duration-500`}
            style={{ width: isHovered ? '100%' : '60%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;