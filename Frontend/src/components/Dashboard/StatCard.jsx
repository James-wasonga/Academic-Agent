import React from 'react';

const StatCard = ({ icon: Icon, title, value, color = "blue" }) => {
  const colorClasses = {
    blue: 'text-blue-600 text-blue-500',
    green: 'text-green-600 text-green-500',
    purple: 'text-purple-600 text-purple-500',
    orange: 'text-orange-600 text-orange-500'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${colorClasses[color].split(' ')[0]}`}>
            {value}
          </p>
        </div>
        <Icon className={`w-8 h-8 ${colorClasses[color].split(' ')[1]}`} />
      </div>
    </div>
  );
};

export default StatCard;