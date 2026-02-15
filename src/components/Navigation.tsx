import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Map, 
  BookOpen, 
  MessageCircle, 
  TrendingUp, 
  Settings, 
  Moon, 
  Sun, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '@/hooks/useTheme';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignOut: () => Promise<{ error: any }>;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'practice', label: 'Practice', icon: BookOpen },
  { id: 'assistant', label: 'Study Assistant', icon: MessageCircle },
  { id: 'progress', label: 'Progress & Streaks', icon: TrendingUp },
  { id: 'settings', label: 'Exam Settings', icon: Settings },
];

export function Navigation({ currentPage, onNavigate, onSignOut }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await onSignOut();
    // Redirect happens automatically via auth state listener
  };

  return (
    <div className="relative z-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 safe-top">
        <div className="glass-card-subtle mx-4 mt-4 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 touch-target focus-calm rounded-lg"
          >
            <Logo size="small" />
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">N5</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">学</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-20 left-4 right-4 z-50 glass-card p-2"
            >
              <nav className="space-y-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl touch-target calm-transition focus-calm ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-secondary/50 text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </nav>

              <div className="border-t border-border mt-2 pt-2">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl touch-target calm-transition hover:bg-secondary/50 text-foreground focus-calm"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {/* Logout - now functional */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl touch-target calm-transition hover:bg-destructive/10 text-destructive focus-calm"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
