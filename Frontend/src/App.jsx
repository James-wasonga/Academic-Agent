import React, { useState } from 'react';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import Research from './components/Research/Research';
import Grading from './components/Grading/Grading';
import StudentChat from './components/Chat/StudentChat';
import { AppProvider } from './context/AppContext';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('research');

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
        <Dashboard />
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

