// import React, { useState } from 'react';
// import Header from './components/Header/Header';
// import Navigation from './components/Navigation/Navigation';
// import Dashboard from './components/Dashboard/Dashboard';
// import Research from './components/Research/Research';
// import Grading from './components/Grading/Grading';
// import StudentChat from './components/Chat/StudentChat';
// import { AppProvider } from './context/AppContext';
// import { ChevronDown, ChevronUp } from 'lucide-react';
// import ResearchHistory from './components/Research/ResearchHistory';
// import './App.css';

// const AppContent = () => {
//   const [activeTab, setActiveTab] = useState('research');
//   const [showDashboard, setShowDashboard] = useState(false);

//   const renderActiveTab = () => {
//     switch (activeTab) {
//       case 'research':
//         return <Research />;
//       case 'history':  // 🆕 NEW CASE
//         return <ResearchHistory />;  
//       case 'grading':
//         return <Grading />;
//       case 'chat':
//         return <StudentChat />;
//       default:
//         return <Research />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       <Header />
//       <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Dashboard - Always visible on desktop, toggleable on mobile */}
//         <div className={`dashboard-container ${showDashboard ? 'show-mobile' : ''}`}>
//           <Dashboard />
//         </div>

//         {/* Mobile Dashboard Toggle Button - Only visible on mobile */}
//         <button
//           onClick={() => setShowDashboard(!showDashboard)}
//           className="dashboard-toggle-btn mb-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
//         >
//           <span className="text-sm font-medium text-gray-700">
//             {showDashboard ? 'Hide' : 'Show'} Dashboard Stats
//           </span>
//           {showDashboard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//         </button>
        
//         {renderActiveTab()}
//       </main>
//     </div>
//   );
// };

// const App = () => {
//   return (
//     <AppProvider>
//       <AppContent />
//     </AppProvider>
//   );
// };

// export default App;


import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import Research from './components/Research/Research';
import Grading from './components/Grading/Grading';
import StudentChat from './components/Chat/StudentChat';
import ResearchHistory from './components/Research/ResearchHistory';
import RatingModal from './components/RatingModal/RatingModal';
import AdminRatings from './components/admin/AdminRatings';
import { AppProvider } from './context/AppContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './App.css';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('research');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const lastActivityTime = useRef(Date.now());
  const inactivityTimer = useRef(null);

  // 🆕 Detect if user is on mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768;
  };

  // Check if should show rating based on conditions
  const shouldShowRatingModal = () => {
    const lastRating = localStorage.getItem('appRatings');
    const lastSkip = localStorage.getItem('lastRatingSkip');
    
    let shouldShow = true;

    // Don't show if rated in last 7 days
    if (lastRating) {
      try {
        const ratings = JSON.parse(lastRating);
        if (ratings.length > 0) {
          const lastRatingDate = new Date(ratings[ratings.length - 1].timestamp);
          const daysSinceRating = (Date.now() - lastRatingDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceRating < 7) {
            shouldShow = false;
          }
        }
      } catch (error) {
        console.error('Error checking last rating:', error);
      }
    }

    // Don't show if skipped in last 24 hours
    if (lastSkip && shouldShow) {
      try {
        const skipData = JSON.parse(lastSkip);
        const skipDate = new Date(skipData.timestamp);
        const hoursSinceSkip = (Date.now() - skipDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceSkip < 24) {
          shouldShow = false;
        }
      } catch (error) {
        console.error('Error checking last skip:', error);
      }
    }

    return shouldShow && hasInteracted;
  };

  // Track user interaction
  useEffect(() => {
    const trackInteraction = () => {
      setHasInteracted(true);
      lastActivityTime.current = Date.now();
    };

    window.addEventListener('click', trackInteraction);
    window.addEventListener('keydown', trackInteraction);
    window.addEventListener('touchstart', trackInteraction); // 🆕 Mobile touch
    window.addEventListener('scroll', trackInteraction);

    return () => {
      window.removeEventListener('click', trackInteraction);
      window.removeEventListener('keydown', trackInteraction);
      window.removeEventListener('touchstart', trackInteraction);
      window.removeEventListener('scroll', trackInteraction);
    };
  }, []);

  // 🆕 MOBILE: Detect when user is inactive (might be leaving)
  useEffect(() => {
    if (!isMobile()) return; // Only for mobile

    const checkInactivity = () => {
      const inactiveDuration = Date.now() - lastActivityTime.current;
      
      // If inactive for 3 seconds and has interacted
      if (inactiveDuration > 3000 && hasInteracted) {
        if (shouldShowRatingModal()) {
          setShowRatingModal(true);
        }
      }
    };

    // Check every 4 seconds
    inactivityTimer.current = setInterval(checkInactivity, 4000);

    return () => {
      if (inactivityTimer.current) {
        clearInterval(inactivityTimer.current);
      }
    };
  }, [hasInteracted]);

  // Desktop: beforeunload (browser close)
  useEffect(() => {
    if (isMobile()) return; // Skip on mobile (doesn't work well)

    const handleBeforeUnload = (e) => {
      if (shouldShowRatingModal()) {
        e.preventDefault();
        e.returnValue = '';
        setShowRatingModal(true);
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasInteracted]);

  // 🆕 BOTH Desktop & Mobile: Tab switching / App switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      // When user leaves the tab/app
      if (document.hidden) {
        if (shouldShowRatingModal()) {
          // On mobile, show immediately
          // On desktop, also show
          setShowRatingModal(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasInteracted]);

  // 🆕 MOBILE: Detect when user navigates back (back button)
  useEffect(() => {
    if (!isMobile()) return;

    const handlePopState = () => {
      if (shouldShowRatingModal()) {
        // Prevent back navigation temporarily
        window.history.pushState(null, '', window.location.href);
        setShowRatingModal(true);
      }
    };

    // Add a state to history stack
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasInteracted]);

  // 🆕 MOBILE: Detect orientation change (user rotating device to leave)
  useEffect(() => {
    if (!isMobile()) return;

    let orientationChangeCount = 0;

    const handleOrientationChange = () => {
      orientationChangeCount++;
      
      // After 2 orientation changes, might be leaving
      if (orientationChangeCount >= 2 && shouldShowRatingModal()) {
        setShowRatingModal(true);
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [hasInteracted]);

  // 🆕 MOBILE: Detect page blur (losing focus)
  useEffect(() => {
    const handleBlur = () => {
      // Wait a bit to see if user is really leaving
      setTimeout(() => {
        if (document.hidden && shouldShowRatingModal()) {
          setShowRatingModal(true);
        }
      }, 2000);
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [hasInteracted]);

  const handleRatingSubmit = (ratingData) => {
    console.log('Rating submitted:', ratingData);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'research':
        return <Research />;
      case 'history':
        return <ResearchHistory />;
      case 'grading':
        return <Grading />;
      case 'chat':
        return <StudentChat />;
      case 'admin':
        return <AdminRatings />;
      default:
        return <Research />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`dashboard-container ${showDashboard ? 'show-mobile' : ''}`}>
          <Dashboard />
        </div>

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

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
      />
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