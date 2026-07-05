import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIChatbot from './AIChatbot';
import { 
  LayoutDashboard, 
  Activity, 
  Target, 
  Trophy, 
  BarChart3, 
  Users, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Building2,
  Lock,
  Award,
  Map
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Log Activity', path: '/log-activity', icon: Activity },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Certificate', path: '/certificate', icon: Award },
    { name: 'Route Planner', path: '/route-planner', icon: Map },
  ];

  if (user?.role === 'ROLE_ORGANIZATION_ADMIN') {
    navigationItems.push({ name: 'Org Portal', path: '/organization-dashboard', icon: Building2 });
  }

  if (user?.role === 'ROLE_ADMIN') {
    navigationItems.push({ name: 'Admin Portal', path: '/admin-dashboard', icon: Lock });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-dark-950 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-100 dark:border-dark-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img 
              src="https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png" 
              alt="CarbonMitra Logo" 
              className="h-8 w-auto object-contain" 
            />
            <span className="font-extrabold text-xl bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
              CarbonMitra
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 dark:text-slate-400 transition"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile Summary */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{user?.username}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
              {user?.role?.replace('ROLE_', '').replace('_', ' ')}
            </span>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:sticky top-[57px] left-0 z-30
          w-64 h-[calc(100vh-57px)]
          bg-white dark:bg-dark-900 border-r border-slate-100 dark:border-dark-800
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="p-4 space-y-1.5 h-full flex flex-col justify-between">
            <div className="space-y-1.5">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition
                      ${isActive 
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10' 
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-dark-800/50'}
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Footer inside Sidebar for Desktop */}
            <div className="pt-4 border-t border-slate-100 dark:border-dark-800 text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-600">
                CarbonMitra © 2026<br />Empowering Net Zero
              </p>
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm md:hidden"
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
        <AIChatbot />
      </div>
    </div>
  );
};

export default Layout;
