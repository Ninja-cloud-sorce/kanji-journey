import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import { Dashboard } from "@/components/Dashboard";
import { Library } from "@/components/Library";
import { Practice } from "@/components/Practice";
import { Progress } from "@/components/Progress";
import { Profile } from "@/components/Profile";
import { Settings } from "@/components/Settings";
import { LessonDetail } from "@/components/LessonDetail";
import { ExamSimulator } from "@/components/ExamSimulator";
import { ReadingSession } from "@/components/ReadingSession";
import { WritingSession } from "@/components/WritingSession";
import { FlashcardSession } from "@/components/FlashcardSession";
import { VocabularyQuiz } from "@/components/VocabularyQuiz";
import { GrammarRitual } from "@/components/GrammarRitual";

function LessonDetailWrapper() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  return <LessonDetail lessonId={lessonId || null} onBack={() => navigate("/library")} />;
}

function ExamSimulatorWrapper() {
  const { profile } = useAuth();
  if (!profile) return null;
  return <ExamSimulator profile={profile} />;
}

function SessionWrapper() {
  const { sessionType } = useParams<{ sessionType: string }>();
  const navigate = useNavigate();
  const handleExit = () => navigate("/practice");

  if (sessionType === "reading") return <ReadingSession onBack={handleExit} />;
  if (sessionType === "writing") return <WritingSession onBack={handleExit} />;
  if (sessionType === "quiz") return <FlashcardSession onExit={handleExit} />;
  if (sessionType === "vocab") return <VocabularyQuiz onBack={handleExit} />;
  if (sessionType === "grammar") return <GrammarRitual onExit={handleExit} />;
  return <Navigate to="/dashboard" replace />;
}

function AuthenticatedApp() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Simple loading state
  if (auth.isLoading) {
    return (
      <div className="viewport-center bg-[#FFF5F7]">
        <div className="w-12 h-12 border-[2px] border-pink-100 border-t-accent rounded-full animate-spin shadow-xl shadow-pink-200/50" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Auth onSignIn={auth.signIn} onSignUp={auth.signUp} />
          )
        }
      />
      
      {/* Protected Routes nested under Index Layout */}
      <Route
        path="/"
        element={
          auth.isAuthenticated ? (
            <Index />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="library" element={<Library onLessonSelect={(id) => navigate(`/library/${id}`)} />} />
        <Route path="library/:lessonId" element={<LessonDetailWrapper />} />
        <Route path="practice" element={<Practice />} />
        <Route path="practice/exam" element={<ExamSimulatorWrapper />} />
        <Route path="progress" element={<Progress />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="session/:sessionType" element={<SessionWrapper />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes default stale time
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthenticatedApp />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
