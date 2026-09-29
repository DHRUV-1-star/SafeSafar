import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  BarChart3, 
  Wifi, 
  WifiOff, 
  PhoneCall, 
  KeyRound, 
  AlertTriangle, 
  PlusCircle, 
  Compass, 
  LogIn, 
  ChevronDown, 
  User as UserIcon, 
  Lock, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { UserProfile } from '../types';
import { UserAvatar } from './UserAvatar';

interface NavbarProps {
  currentView: 'mobile' | 'guardian' | 'civic';
  onSelectView: (view: 'mobile' | 'guardian' | 'civic') => void;
  isOfflineMode: boolean;
  onToggleOffline: () => void;
  onTriggerFakeCall: () => void;
  onOpenDuressModal: () => void;
  onOpenDecoy: () => void;
  onOpenReportModal: () => void;
  onOpenSafeHavens: () => void;
  onOpenMapApiKeyModal: () => void;
  hasCustomMapKey: boolean;
  onTriggerSOS: () => void;
  batteryLevel: number;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  isOfflineMode,
  onToggleOffline,
  onTriggerFakeCall,
  onOpenDuressModal,
  onOpenReportModal,
  onOpenSafeHavens,
  onOpenMapApiKeyModal,
  hasCustomMapKey,
  onTriggerSOS,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
  onLogout,
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileDropdownOpen]);

  const handleDropdownAction = (action?: () => void) => {
    setIsProfileDropdownOpen(false);
    if (action) {
      action();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/10 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* ========================================================= */}
        {/* 1. LEFT: SAFESAFAR BRANDING                               */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Shield className="w-4 h-4 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white leading-tight">
                SafeSafar
              </span>
              <span className="text-[10px] font-bold bg-pink-500/10 border border-pink-500/30 text-pink-400 px-2 py-0.5 rounded-full hidden sm:inline">
                IEEE WIE ILS 2026
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">SheLeads Safe Route Navigator</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CENTER: MAIN NAVIGATION & UTILITY CONTROLS             */}
        {/* ========================================================= */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Main View Switcher */}
          <div className="flex items-center bg-gray-900/90 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => onSelectView('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'mobile'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>

            <button
              onClick={() => onSelectView('guardian')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'guardian'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Guardian Dashboard</span>
            </button>

            <button
              onClick={() => onSelectView('civic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'civic'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Civic Heatmap</span>
            </button>
          </div>

          {/* Quick Utility Tools */}
          <div className="flex items-center gap-1.5">
            {/* Safe Havens Radar */}
            <button
              onClick={onOpenSafeHavens}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium transition-colors"
              title="Locate nearest Pink Booths & Police Outposts"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Safe Havens</span>
            </button>

            {/* Report Hazard Spot */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium transition-colors"
              title="Report dark spots or unlit streets"
            >
              <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Report Spot</span>
            </button>

            {/* Fake Call Trigger */}
            <button
              onClick={onTriggerFakeCall}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-colors"
              title="Simulate realistic incoming phone call with covert SOS trigger"
            >
              <PhoneCall className="w-3.5 h-3.5 text-purple-400" />
              <span>Fake Call</span>
            </button>

            {/* Duress PIN Pad */}
            <button
              onClick={onOpenDuressModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium transition-colors"
              title="Test Duress Passkey & Decoy Calculator"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Duress PIN</span>
            </button>

            {/* 2G / Offline Toggle */}
            <button
              onClick={onToggleOffline}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                isOfflineMode
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
              }`}
              title="Simulate 2G SMS Fallback Mode"
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-yellow-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden xl:inline">{isOfflineMode ? '2G Fallback' : '5G Online'}</span>
            </button>

            {/* Map API Key Settings */}
            <button
              onClick={onOpenMapApiKeyModal}
              className={`p-1.5 rounded-xl border text-xs font-medium transition-colors ${
                hasCustomMapKey
                  ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
              title="Configure Mapbox / Map API Key"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT: ACCOUNT & EMERGENCY CONTROLS                    */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* User Account / Profile Control */}
          {currentUser ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group focus:outline-none focus:ring-1 focus:ring-purple-500"
                title="Account menu"
              >
                <UserAvatar name={currentUser.name} avatar={currentUser.avatar} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                    <span>{currentUser.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-400 group-hover:text-white transition-transform duration-150 ${isProfileDropdownOpen ? 'rotate-180 text-purple-400' : ''}`} />
                  </p>
                  <p className="text-[10px] text-gray-400">Account</p>
                </div>
                <ChevronDown className="sm:hidden w-3 h-3 text-gray-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#111726] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-gray-200">
                  
                  {/* Dropdown User Info Header */}
                  <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-3">
                    <UserAvatar name={currentUser.name} avatar={currentUser.avatar} size="md" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono truncate">{currentUser.phone}</p>
                      {currentUser.email && (
                        <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-1 space-y-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onOpenProfileModal)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onOpenProfileModal)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left font-medium"
                    >
                      <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Safety & Security</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onOpenProfileModal)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left font-medium"
                    >
                      <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Trusted Contacts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onOpenProfileModal)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-left font-medium"
                    >
                      <Settings className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Divider & Sign Out */}
                  <div className="pt-1 mt-1 border-t border-white/10 p-1">
                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onLogout)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left text-xs font-semibold"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Immediate SOS Emergency Panic Button */}
          <button
            onClick={onTriggerSOS}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black tracking-wider shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            title="Trigger Emergency SOS distress beacon"
          >
            <AlertTriangle className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>SOS</span>
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* MOBILE / TABLET UTILITY BAR (RESPONSIVE SECONDARY ROW)    */}
      {/* ========================================================= */}
      <div className="lg:hidden flex items-center justify-between pt-2 mt-2 border-t border-white/5 overflow-x-auto gap-2 no-scrollbar text-xs">
        {/* Mobile View Switcher */}
        <div className="flex items-center bg-gray-900/90 border border-white/10 p-0.5 rounded-lg shrink-0">
          <button
            onClick={() => onSelectView('mobile')}
            className={`px-2 py-1 rounded text-[11px] font-semibold ${
              currentView === 'mobile' ? 'bg-purple-600 text-white' : 'text-gray-400'
            }`}
          >
            App
          </button>
          <button
            onClick={() => onSelectView('guardian')}
            className={`px-2 py-1 rounded text-[11px] font-semibold ${
              currentView === 'guardian' ? 'bg-purple-600 text-white' : 'text-gray-400'
            }`}
          >
            Guardian
          </button>
          <button
            onClick={() => onSelectView('civic')}
            className={`px-2 py-1 rounded text-[11px] font-semibold ${
              currentView === 'civic' ? 'bg-purple-600 text-white' : 'text-gray-400'
            }`}
          >
            Civic
          </button>
        </div>

        {/* Mobile Utility Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenSafeHavens}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[11px] font-medium flex items-center gap-1"
          >
            <Compass className="w-3 h-3 text-blue-400" />
            <span>Havens</span>
          </button>
          <button
            onClick={onTriggerFakeCall}
            className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-semibold flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call</span>
          </button>
          <button
            onClick={onOpenDuressModal}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[11px] font-medium flex items-center gap-1"
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            <span>PIN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
