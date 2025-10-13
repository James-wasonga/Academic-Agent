import React, { useState } from 'react';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import Research from './components/Research/Research';
import Grading from './components/Grading/Grading';
import StudentChat from './components/Chat/StudentChat';
import { AppProvider } from './context/AppContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './App.css';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('research');
  const [showDashboard, setShowDashboard] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'research':
        return <Research />;
      case 'grading':
        return <Grading />;
      case 'chat':
        return <StudentChat />;
      default:
        return <Research />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard - Always visible on desktop, toggleable on mobile */}
        <div className={`dashboard-container ${showDashboard ? 'show-mobile' : ''}`}>
          <Dashboard />
        </div>

        {/* Mobile Dashboard Toggle Button - Only visible on mobile */}
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="dashboard-toggle-btn mb-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            {showDashboard ? 'Hide' : 'Show'} Dashboard Stats
          </span>
          {showDashboard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {renderActiveTab()}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;