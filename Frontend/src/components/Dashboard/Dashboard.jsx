import React from 'react';
import { BookOpen, Code, MessageCircle, CheckCircle, RotateCcw } from 'lucide-react';
import StatCard from './StatCard';
import { useAppContext } from '../../context/AppContext';
import './Dashboard.css';

const Dashboard = () => {
  const { stats, getAverageGrade, resetStats } = useAppContext();

  const handleResetStats = () => {
    if (window.confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
      resetStats();
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={handleResetStats}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Stats</span>
        </button>
      </div>
      
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={BookOpen} 
          title="Research Queries" 
          value={stats.researchQueries.toString()} 
          color="blue" 
          subtitle="Total research requests"
        />
        <StatCard 
          icon={Code} 
          title="Assignments Graded" 
          value={stats.assignmentsGraded.toString()} 
          color="green" 
          subtitle="Code submissions analyzed"
        />
        <StatCard 
          icon={MessageCircle} 
          title="Student Questions" 
          value={stats.studentQuestions.toString()} 
          color="purple" 
          subtitle="Chat interactions"
        />
        <StatCard 
          icon={CheckCircle} 
          title="Average Grade" 
          value={stats.assignmentsGraded > 0 ? `${getAverageGrade()}%` : "0%"} 
          color="orange" 
          subtitle="Mean assignment score"
        />
      </div>
    </div>
  );
};

export default Dashboard;
// import React from 'react';
// import { BookOpen, Code, MessageCircle, CheckCircle, RotateCcw } from 'lucide-react';
// import StatCard from './StatCard';
// import { useAppContext } from '../../context/AppContext';

// const Dashboard = () => {
//   const { stats, getAverageGrade, resetStats } = useAppContext();

//   const handleResetStats = () => {
//     if (window.confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
//       resetStats();
//     }
//   };

//   return (
//     <div className="mb-6 sm:mb-8 px-2 sm:px-0">
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
//         <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
//         <button
//           onClick={handleResetStats}
//           className="flex items-center justify-center space-x-2 px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
//         >
//           <RotateCcw className="w-4 h-4" />
//           <span>Reset Stats</span>
//         </button>
//       </div>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
//         <StatCard 
//           icon={BookOpen} 
//           title="Research Queries" 
//           value={stats.researchQueries.toString()} 
//           color="blue" 
//           subtitle="Total research requests"
//         />
//         <StatCard 
//           icon={Code} 
//           title="Assignments Graded" 
//           value={stats.assignmentsGraded.toString()} 
//           color="green" 
//           subtitle="Code submissions analyzed"
//         />
//         <StatCard 
//           icon={MessageCircle} 
//           title="Student Questions" 
//           value={stats.studentQuestions.toString()} 
//           color="purple" 
//           subtitle="Chat interactions"
//         />
//         <StatCard 
//           icon={CheckCircle} 
//           title="Average Grade" 
//           value={stats.assignmentsGraded > 0 ? `${getAverageGrade()}%` : "0%"} 
//           color="orange" 
//           subtitle="Mean assignment score"
//         />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;