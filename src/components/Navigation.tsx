import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Library, 
  PenTool, 
  BarChart2, 
  User,
  Settings as SettingsIcon,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'library', label: 'Library', icon: Library, path: '/library' },
  { id: 'practice', label: 'Practice', icon: PenTool, path: '/practice' },
  { id: 'progress', label: 'Progress', icon: BarChart2, path: '/progress' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active item based on route pathname
  const pathname = location.pathname;
  let activeTab = 'dashboard';
  if (pathname.startsWith('/library')) {
    activeTab = 'library';
  } else if (pathname.startsWith('/practice')) {
    activeTab = 'practice';
  } else if (pathname.startsWith('/progress')) {
    activeTab = 'progress';
  } else if (pathname.startsWith('/profile')) {
    activeTab = 'profile';
  } else if (pathname.startsWith('/settings')) {
    activeTab = 'settings';
  }

  return (
    <div className="h-screen w-[280px] bg-[var(--bg-surface)] border-r border-white/10 flex flex-col pt-12 pb-10 flex-shrink-0 relative z-50 backdrop-blur-md">
      {/* Brand Header */}
      <div className="px-9 mb-16 space-y-2 flex flex-col items-start text-left">
        <h1 className="text-4xl font-display font-bold text-white tracking-tight uppercase">学識者</h1>
        <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em] leading-none font-sans">Scholarly Practitioner</p>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex items-center gap-5 px-6 py-4 min-h-[52px] rounded-xl transition-all group relative font-sans",
              "text-white/40 hover:text-white hover:bg-white/5 active:scale-[0.98] transition-[background,transform,box-shadow] duration-200 ease-out",
              activeTab === item.id 
                ? "bg-[#FFD6E0]/10 text-white font-black shadow-[0_0_25px_-5px_rgba(255,214,224,0.3)] ring-1 ring-[#FFD6E0]/20" 
                : "transparent"
            )}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-indicator-bar-pink"
                className="absolute left-1.5 top-1/4 bottom-1/4 w-[2.5px] bg-[#FFD6E0] rounded-full shadow-[0_0_15px_rgba(255,214,224,0.6)]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon size={20} className={cn(activeTab === item.id ? "text-[#FFD6E0] drop-shadow-[0_0_8px_rgba(255,214,224,0.4)]" : "text-white/40 group-hover:text-white transition-colors")} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className={cn(
              "text-xs font-black uppercase tracking-[0.2em] transition-colors font-sans",
              activeTab === item.id ? "text-white" : "text-white/40 group-hover:text-white"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* New Session Button */}
      <div className="px-6 mt-auto">
        <button 
          onClick={() => navigate('/session/quiz')}
          className="bg-white text-black hover:bg-white/90 w-full min-h-[52px] flex items-center justify-center gap-3 rounded-xl transition-all font-black text-xs uppercase tracking-[0.2em] shadow-xl"
        >
           <Plus size={16} strokeWidth={4} /> New Session
        </button>
      </div>
    </div>
  );
}
