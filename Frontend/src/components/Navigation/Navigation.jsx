// import React from 'react';
// import { Search, Code, MessageCircle } from 'lucide-react';
// import './Navigation.css';

// const Navigation = ({ activeTab, setActiveTab }) => {
//   const tabs = [
//     { id: 'research', label: 'Research Assistant', icon: Search },
//     { id: 'grading', label: 'Code Grading', icon: Code },
//     { id: 'chat', label: 'Student Q&A', icon: MessageCircle }
//   ];

//   return (
//     <div className="bg-white shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="nav-tabs flex space-x-8">
//           {tabs.map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
//                 activeTab === tab.id
//                   ? 'border-indigo-500 text-indigo-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               <tab.icon className="w-4 h-4" />
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navigation;

import React, { useEffect, useState } from 'react';
import { Search, Code, MessageCircle, History, Shield } from 'lucide-react'; // 🆕 ADDED: History icon
import './Navigation.css';

const Navigation = ({ activeTab, setActiveTab }) => {
  // 🆕 NEW: State to track history count for badge
  const [historyCount, setHistoryCount] = useState(0);

  // 🆕 NEW: Load history count on mount and when activeTab changes
  useEffect(() => {
    const loadHistoryCount = () => {
      try {
        const history = localStorage.getItem('researchHistory');
        if (history) {
          const parsed = JSON.parse(history);
          setHistoryCount(parsed.length);
        } else {
          setHistoryCount(0);
        }
      } catch (error) {
        console.error('Error loading history count:', error);
        setHistoryCount(0);
      }
    };

    loadHistoryCount();

    // 🆕 NEW: Listen for storage changes (when research is saved)
    const handleStorageChange = () => {
      loadHistoryCount();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check every time component renders (for same-tab updates)
    const interval = setInterval(loadHistoryCount, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [activeTab]);

  // 🆕 UPDATED: Added 'history' tab with History icon
  const tabs = [
    { id: 'research', label: 'Research Assistant', icon: Search },
    { id: 'grading', label: 'Code Grading', icon: Code },
    { id: 'chat', label: 'Student Q&A', icon: MessageCircle },
    { id: 'history', label: 'Research History', icon: History, showBadge: true }, // 🆕 NEW TAB
    { id: 'admin', label: 'Admin', icon: Shield} //NEW
  ];

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="nav-tabs flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              
              {/* 🆕 NEW: Badge showing history count */}
              {tab.showBadge && historyCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {historyCount > 99 ? '99+' : historyCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navigation;