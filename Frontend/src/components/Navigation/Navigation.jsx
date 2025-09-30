import React from 'react';
import { Search, Code, MessageCircle } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'research', label: 'Research Assistant', icon: Search },
    { id: 'grading', label: 'Code Grading', icon: Code },
    { id: 'chat', label: 'Student Q&A', icon: MessageCircle }
  ];

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navigation;

// import React from 'react';
// import { Search, Code, MessageCircle } from 'lucide-react';

// const Navigation = ({ activeTab, setActiveTab }) => {
//   const tabs = [
//     { id: 'research', label: 'Research Assistant', shortLabel: 'Research', icon: Search },
//     { id: 'grading', label: 'Code Grading', shortLabel: 'Grading', icon: Code },
//     { id: 'chat', label: 'Student Q&A', shortLabel: 'Q&A', icon: MessageCircle }
//   ];

//   return (
//     <div className="bg-white shadow-sm">
//       <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
//         <div className="flex space-x-2 sm:space-x-8 overflow-x-auto">
//           {tabs.map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-3 sm:py-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap min-w-0 flex-shrink-0 ${
//                 activeTab === tab.id
//                   ? 'border-indigo-500 text-indigo-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               <tab.icon className="w-4 h-4 flex-shrink-0" />
//               <span className="sm:hidden">{tab.shortLabel}</span>
//               <span className="hidden sm:inline">{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navigation;