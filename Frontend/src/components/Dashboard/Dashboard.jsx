import React from 'react';
import { BookOpen, Code, MessageCircle, CheckCircle } from 'lucide-react';
import StatCard from './StatCard';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard icon={BookOpen} title="Research Queries" value="247" color="blue" />
      <StatCard icon={Code} title="Assignments Graded" value="89" color="green" />
      <StatCard icon={MessageCircle} title="Student Questions" value="156" color="purple" />
      <StatCard icon={CheckCircle} title="Avg Grade Improvement" value="23%" color="orange" />
    </div>
  );
};

export default Dashboard;