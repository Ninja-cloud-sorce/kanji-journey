import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { Roadmap } from '@/components/Roadmap';
import { Quiz } from '@/components/Quiz';
import { Progress } from '@/components/Progress';
import { Settings } from '@/components/Settings';
import { ChatAssistant } from '@/components/ChatAssistant';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface IndexProps {
  profile: Profile | null;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const Index = ({ profile, signOut, updateProfile }: IndexProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // If profile hasn't loaded yet, show a minimal loading state
  // to prevent rendering dashboard with no data
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} profile={profile} />;
      case 'roadmap':
        return <Roadmap onNavigate={setCurrentPage} />;
      case 'practice':
        return <Quiz onNavigate={setCurrentPage} />;
      case 'progress':
        return <Progress onNavigate={setCurrentPage} profile={profile} />;
      case 'settings':
        return <Settings onNavigate={setCurrentPage} profile={profile} updateProfile={updateProfile} />;
      case 'assistant':
        return <Dashboard onNavigate={setCurrentPage} profile={profile} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} onSignOut={signOut} />
      {renderPage()}
      <ChatAssistant />
    </div>
  );
};

export default Index;
