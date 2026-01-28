import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { Roadmap } from '@/components/Roadmap';
import { Quiz } from '@/components/Quiz';
import { Progress } from '@/components/Progress';
import { Settings } from '@/components/Settings';
import { ChatAssistant } from '@/components/ChatAssistant';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'roadmap':
        return <Roadmap onNavigate={setCurrentPage} />;
      case 'practice':
        return <Quiz onNavigate={setCurrentPage} />;
      case 'progress':
        return <Progress onNavigate={setCurrentPage} />;
      case 'settings':
        return <Settings onNavigate={setCurrentPage} />;
      case 'assistant':
        return <Dashboard onNavigate={setCurrentPage} />; // Opens chat
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
      <ChatAssistant />
    </div>
  );
};

export default Index;
