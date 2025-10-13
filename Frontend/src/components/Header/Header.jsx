import React from 'react';
import { GraduationCap, Zap } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="header-content flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">AcaWise</h1>
            </div>
            <span className="header-badge px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
              AI Research & Grading Assistant
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">AcademicAgent</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;