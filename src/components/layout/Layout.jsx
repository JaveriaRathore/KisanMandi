import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { OnboardingPage } from '../../pages/OnboardingPage';
import { BottomNav } from './BottomNav';
import {
  Sprout,
  LogOut,
  Search,
  Check,
  CloudSun,
  Bell
} from 'lucide-react';

export const Layout = () => {
  const { currentUser, clearUser, users, switchUser, isLoading, isFarmer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { unreadCount } = useAlerts();
  const [searchGlobal, setSearchGlobal] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EDF2E8] flex items-center justify-center font-sans">
        <div className="p-8 bg-white rounded-3xl shadow-xl text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-700">Loading Agricultur...</p>
        </div>
      </div>
    );
  }

  // If explicitly logged out and no user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#EDF2E8] p-4 sm:p-8 flex items-center justify-center font-sans">
        <div className="max-w-[480px] w-full bg-white rounded-[32px] shadow-2xl p-6 sm:p-8 border border-slate-200/80">
          <OnboardingPage />
        </div>
      </div>
    );
  }

  // Milestone navigation: farmers get all four tabs; buyers only Prices and Marketplace.
  const navItems = isFarmer
    ? [
        { name: 'Prices', to: '/' },
        { name: 'Marketplace', to: '/marketplace' },
        { name: 'Alerts', to: '/alerts', badge: unreadCount },
        { name: 'My Listings', to: '/my-listings' }
      ]
    : [
        { name: 'Prices', to: '/' },
        { name: 'Marketplace', to: '/marketplace' }
      ];

  const handleLogout = () => {
    clearUser();
    navigate('/onboarding');
  };

  return (
    <div className="min-h-[100dvh] bg-[#EDF2E8] p-0 md:p-4 lg:p-6 flex items-stretch md:items-center justify-center font-sans text-[#1E231F] selection:bg-[#DEF768] selection:text-black">
      {/* Laptop Screen Size Container */}
      <div className="w-full max-w-[448px] md:max-w-[1360px] xl:max-w-[1400px] h-[100dvh] md:h-auto lg:h-[calc(100vh-2.5rem)] lg:min-h-[720px] lg:max-h-[880px] bg-white rounded-none md:rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col md:flex-row overflow-hidden border border-black/[0.04]">
        
        {/* Left Dark Sidebar */}
        <aside className="hidden md:flex md:w-[220px] bg-[#1E231F] text-white flex-col justify-between p-6 shrink-0 border-r border-[#272d28]">
          <div className="space-y-8">
            {/* Logo: agri🌱cultur */}
            <div
              onClick={() => navigate('/')}
              className="flex items-center cursor-pointer select-none px-2 group"
            >
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#DEF768] transition-colors">
                Kisan
              </span>
              <div className="flex items-center justify-center -mt-0.5 text-[#DEF768] mx-0.5">
                <Sprout className="w-5 h-5 text-[#DEF768]" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#DEF768] transition-colors">
                Mandi
              </span>
            </div>

            {/* Navigation Menu (clean typography matching mockup) */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/' || location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.to) ||
                      (item.to === '/marketplace' && location.pathname === '/fields') ||
                      (item.to === '/my-listings' && location.pathname === '/harvesting');

                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={`block w-full text-left px-5 py-2 rounded-2xl text-[13px] transition-all ${
                      isActive
                        ? 'bg-[#DEF768] text-[#161A15] font-bold shadow-sm'
                        : 'text-[#8A918C] hover:text-white hover:bg-white/5 font-medium'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      {item.name}
                      {item.badge > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar: Logout */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#8A918C] hover:text-white transition-colors group"
              title="Logout"
            >
              {/* Circular power / exit icon */}
              <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center group-hover:border-white">
                <div className="w-1.5 h-1.5 border-t border-l border-current transform -rotate-45 -ml-0.5"></div>
              </div>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Top Header Bar */}
          <header className="h-14 sm:h-16 px-6 sm:px-8 flex items-center justify-between gap-4 shrink-0 bg-white">
            {/* Search Input: "Search any of content" */}
            <div className="flex-1 max-w-lg relative">
              <Search className="w-4 h-4 text-[#9AA19C] absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search any of content"
                value={searchGlobal}
                onChange={(e) => setSearchGlobal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchGlobal.trim()) {
                    navigate(`/fields?q=${encodeURIComponent(searchGlobal)}`);
                  }
                }}
                className="w-full pl-6 pr-4 py-2 text-xs text-[#1E231F] bg-transparent border-b border-slate-100 focus:border-[#DEF768] focus:outline-none transition-colors placeholder:text-[#9AA19C]"
              />
            </div>

            {/* Right Controls: Weather Pill, Price Alerts Bell & User Profile Avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Price Alerts shortcut is farmer-only */}
              {isFarmer && <button
                type="button"
                onClick={() => navigate('/alerts')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors relative"
                title="Price Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[15px] h-3.5 px-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>}

              {/* User Profile Avatar */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
                  title="Account & Persona"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1E231F] text-[#DEF768] shadow-sm ring-1 ring-black/10 flex items-center justify-center font-bold text-xs">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

              {/* Profile / Persona Switcher Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 space-y-3">
                  <div className="p-2.5 bg-[#EDF2E8] rounded-xl">
                    <div className="text-xs font-bold text-[#1E231F]">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500">{currentUser.phone}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#DEF768] text-[#1E231F]">
                        {currentUser.role}
                      </span>
                      <span className="text-[10px] text-slate-500">{currentUser.district}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-1.5">
                      Switch Active Persona
                    </span>
                    <div className="space-y-1">
                      {users.map((u) => {
                        const isSelected = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              switchUser(u.id);
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                              isSelected
                                ? 'bg-[#DEF768]/30 text-slate-900 font-bold'
                                : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="truncate">
                              {u.name} ({u.role})
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Switch User / Onboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

          {/* Main Body with customized smooth scroll */}
          <main className="flex-1 px-4 sm:px-8 pb-24 md:pb-8 pt-2 overflow-y-auto">
            <Outlet />
          </main>
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
