import React, { useState } from 'react';
import { 
  MapPin, 
  ArrowLeftRight, 
  Clock, 
  Sun, 
  Moon, 
  Bell, 
  ShieldAlert, 
  ChevronDown, 
  PhoneCall, 
  Lock, 
  User, 
  LogOut, 
  Database,
  Search
} from 'lucide-react';
import { UserProfile, ActiveSOSState } from '../types';

interface TopHeaderProps {
  startLocation: string;
  destination: string;
  onStartLocationChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSwapLocations: () => void;
  onSearchRoutes: () => void;
  isLoadingRoutes: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  onOpenProfile: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenDatabaseSetup: () => void;
  onTriggerSOS: () => void;
  onTriggerFakeCall: () => void;
  onOpenDuressModal: () => void;
  sosState: ActiveSOSState;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  startLocation,
  destination,
  onStartLocationChange,
  onDestinationChange,
  onSwapLocations,
  onSearchRoutes,
  isLoadingRoutes,
  isDarkMode,
  onToggleTheme,
  currentUser,
  onOpenProfile,
  onOpenAuthModal,
  onLogout,
  onOpenDatabaseSetup,
  onTriggerSOS,
  onTriggerFakeCall,
  onOpenDuressModal,
  sosState,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className={`h-16 px-6 border-b flex items-center justify-between gap-4 select-none transition-colors duration-200 shrink-0 ${
      isDarkMode ? 'bg-[#0b121e] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      {/* Center/Left: Route Planning Pill Search Bar */}
      <div className="flex-1 max-w-2xl flex items-center gap-2">
        <div className={`flex-1 flex items-center px-3 py-1.5 rounded-2xl border transition-all ${
          isDarkMode 
            ? 'bg-[#111a2d] border-white/10 focus-within:border-emerald-500/50 shadow-inner' 
            : 'bg-slate-50 border-slate-200 focus-within:border-emerald-500 shadow-inner'
        }`}>
          {/* Origin Input */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-gray-400 leading-none">From</span>
              <input
                type="text"
                value={startLocation}
                onChange={(e) => onStartLocationChange(e.target.value)}
                placeholder="Start location..."
                className="bg-transparent border-none outline-none text-xs font-semibold truncate w-full p-0 mt-0.5 text-inherit placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={onSwapLocations}
            className={`p-1.5 rounded-xl transition-all mx-1 shrink-0 ${
              isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title="Swap Origin and Destination"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Destination Input */}
          <div className="flex items-center gap-2 flex-1 min-w-0 pl-2 border-l border-white/10">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-gray-400 leading-none">To</span>
              <input
                type="text"
                value={destination}
                onChange={(e) => onDestinationChange(e.target.value)}
                placeholder="Destination..."
                className="bg-transparent border-none outline-none text-xs font-semibold truncate w-full p-0 mt-0.5 text-inherit placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Depart Time */}
          <div className={`hidden md:flex items-center gap-1.5 pl-3 border-l text-xs font-medium shrink-0 ${
            isDarkMode ? 'border-white/10 text-gray-300' : 'border-slate-200 text-slate-600'
          }`}>
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-semibold whitespace-nowrap">Depart Now</span>
          </div>

          {/* Search CTA */}
          <button
            onClick={onSearchRoutes}
            disabled={isLoadingRoutes}
            className="ml-2 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 shrink-0 flex items-center gap-1"
          >
            {isLoadingRoutes ? (
              <span className="animate-spin text-xs">⏳</span>
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Covert Toolkit Mini Pills */}
        <button
          onClick={onTriggerFakeCall}
          className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isDarkMode 
              ? 'bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/50' 
              : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
          }`}
          title="Covert Fake Call to SOS"
        >
          <PhoneCall className="w-3.5 h-3.5 text-purple-400" />
          <span>Fake Call</span>
        </button>

        <button
          onClick={onOpenDuressModal}
          className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isDarkMode 
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/50' 
              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
          }`}
          title="Duress PIN (9999)"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Duress PIN</span>
        </button>

        {/* SOS Button */}
        <button
          onClick={onTriggerSOS}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg ${
            sosState.isActive
              ? 'bg-red-600 text-white animate-pulse shadow-red-600/50'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 active:scale-95'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>SOS</span>
        </button>

        {/* Theme Toggle (🌙 / ☀️) */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-all ${
            isDarkMode 
              ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10' 
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Moon className="w-4 h-4 text-cyan-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl border relative transition-all ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {showNotifications && (
            <div className={`absolute right-0 top-12 w-72 rounded-2xl border p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 ${
              isDarkMode ? 'bg-[#0f172a] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="text-xs font-bold">Safety Alerts & Updates</span>
                <span className="text-[10px] text-emerald-400 font-semibold">2 New</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="font-semibold text-emerald-400">🛡️ Safe Corridor Active</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Surat Piplod - Ring Rd high lighting verification updated.</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="font-semibold text-amber-400">💡 OSM Lighting Survey</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">14 street lamps refreshed on Dumas Road corridor.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border transition-all ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <span className="text-xs font-bold hidden sm:inline">
              {currentUser?.name ? currentUser.name.split(' ')[0] : 'Dharmik'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className={`absolute right-0 top-12 w-56 rounded-2xl border p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 ${
              isDarkMode ? 'bg-[#0f172a]/95 backdrop-blur-xl border-white/20 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}>
              <div className={`px-3 py-2.5 rounded-xl border mb-2 ${
                isDarkMode ? 'bg-[#162035] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-xs font-black truncate">{currentUser?.name || 'Dharmik Gohil'}</p>
                <p className="text-[10.5px] text-emerald-400 font-semibold">{currentUser?.email || 'user@safesafar.org'}</p>
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenProfile();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    isDarkMode 
                      ? 'bg-[#121c2e] border-white/10 hover:bg-[#1a2842] hover:border-white/20 text-gray-200' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>Safety Profile & Contacts</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenDatabaseSetup();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    isDarkMode 
                      ? 'bg-[#121c2e] border-white/10 hover:bg-[#1a2842] hover:border-white/20 text-gray-200' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <span>Cloud Sync & Database</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                    isDarkMode 
                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-300 hover:bg-rose-900/50 hover:border-rose-500/50' 
                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
