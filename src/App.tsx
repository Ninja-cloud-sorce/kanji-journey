import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * AuthenticatedApp handles route protection:
 * - Shows a loading screen while session is resolving (prevents flicker)
 * - Redirects to /auth if not authenticated
 * - Redirects to / if already authenticated and on /auth
 */
function AuthenticatedApp() {
  const auth = useAuth();

  // Loading state while checking session — prevents layout flash
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          auth.isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Auth onSignIn={auth.signIn} onSignUp={auth.signUp} />
          )
        }
      />
      <Route
        path="/"
        element={
          auth.isAuthenticated ? (
            <Index
              profile={auth.profile}
              signOut={auth.signOut}
              updateProfile={auth.updateProfile}
            />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthenticatedApp />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
