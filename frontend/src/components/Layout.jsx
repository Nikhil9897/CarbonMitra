import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Activity, 
  Target, 
  Trophy, 
  BarChart3, 
  User, 
  Award, 
  Map, 
  Building2, 
  Lock, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';
import AIChatbot from './AIChatbot';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      setLoggingOut(false);
      navigate('/', { replace: true });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bgEco text-textEco flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-borderEco px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-emerald-50 text-slate-700 transition"
            aria-label="Toggle Menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img 
              src="https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png" 
              alt="CarbonMitra Logo" 
              className="h-8 w-auto object-contain" 
            />
            <span className="font-extrabold text-xl bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent tracking-tight">
              CarbonMitra
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Profile Summary */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="font-bold text-sm text-slate-800">{user?.username}</span>
            <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-black">
              {user?.role?.replace('ROLE_', '').replace('_', ' ')}
            </span>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed md:sticky top-[57px] left-0 z-35
          w-64 h-[calc(100vh-57px)]
          bg-white border-r border-borderEco
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
                      flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md shadow-primary-500/15' 
                        : 'text-slate-600 hover:bg-emerald-50/50 hover:text-primary-700'}
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Footer inside Sidebar for Desktop */}
            <div className="pt-4 border-t border-borderEco text-center">
              <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
                CarbonMitra © 2026<br />Empowering Net Zero
              </p>
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/30 backdrop-blur-sm md:hidden"
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>
        <AIChatbot />
      </div>

      {/* Logout Confirmation Dialog (Modal) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-borderEco rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <LogOut size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Logout</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Are you sure you want to logout?
            </p>
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner during logout processing */}
      {loggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-slate-200 font-mono text-sm tracking-widest uppercase">Processing Logout...</p>
        </div>
      )}
    </div>
  );
};

export default Layout;
