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
  LogOut,
  Power,
  Database
} from 'lucide-react';
import { ActiveSOSState, UserProfile } from '../types';
import { UserAvatar } from './UserAvatar';

interface NavbarProps {
  currentView: 'mobile' | 'guardian' | 'civic';
  onSelectView: (view: 'mobile' | 'guardian' | 'civic') => void;
  isOfflineMode: boolean;
  onToggleOffline: () => void;
  onTriggerFakeCall: () => void;
  onOpenDuressModal: () => void;
  onOpenDecoy?: () => void;
  onOpenReportModal: () => void;
  onOpenSafeHavens: () => void;
  onTriggerSOS: () => void;
  onDisarmSOS?: () => void;
  sosState?: ActiveSOSState;
  batteryLevel: number;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onLogout?: () => void;
  onOpenDatabaseSetup?: () => void;
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
  onTriggerSOS,
  onDisarmSOS,
  sosState,
  batteryLevel: _batteryLevel,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
  onLogout,
  onOpenDatabaseSetup,
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
    <header className="sticky top-0 z-40 bg-[#F8FBF9]/95 backdrop-blur-xl border-b border-[#2D6A5E]/15 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* ========================================================= */}
        {/* 1. LEFT: SAFESAFAR BRANDING                               */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/safesafar-logo.png"
            alt="SafeSafar Logo"
            className="w-9 h-9 rounded-xl object-cover shadow-md shadow-[#2D6A5E]/20"
          />
          <span className="text-base font-black tracking-tight text-[#202D2D] leading-tight">
            SafeSafar
          </span>
        </div>

        {/* ========================================================= */}
        {/* 2. CENTER: MAIN NAVIGATION & UTILITY CONTROLS             */}
        {/* ========================================================= */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Main View Switcher */}
          <div className="flex items-center bg-[#F3F8F5]/95 border border-[#D3E5DE] p-1 rounded-xl">
            <button
              onClick={() => onSelectView('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentView === 'mobile'
                  ? 'bg-[#2D6A5E] text-white shadow-sm'
                  : 'text-[#73847F] hover:text-[#202D2D]'
                }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>

            <button
              onClick={() => onSelectView('guardian')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentView === 'guardian'
                  ? 'bg-[#2D6A5E] text-white shadow-sm'
                  : 'text-[#73847F] hover:text-[#202D2D]'
                }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Guardian Dashboard</span>
            </button>

            <button
              onClick={() => onSelectView('civic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentView === 'civic'
                  ? 'bg-[#2D6A5E] text-white shadow-sm'
                  : 'text-[#73847F] hover:text-[#202D2D]'
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EFF7F3] hover:bg-[#E5F3EC] border border-[#D3E5DE] text-[#61746E] text-xs font-medium transition-colors"
              title="Locate nearest Pink Booths & Police Outposts"
            >
              <Compass className="w-3.5 h-3.5 text-[#55A184]" />
              <span>Safe Havens</span>
            </button>

            {/* Report Hazard Spot */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EFF7F3] hover:bg-[#E5F3EC] border border-[#D3E5DE] text-[#61746E] text-xs font-medium transition-colors"
              title="Report dark spots or unlit streets"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#55A184]" />
              <span>Report Spot</span>
            </button>

            {/* Fake Call Trigger */}
            <button
              onClick={onTriggerFakeCall}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#E9F6F0] hover:bg-[#DFF0E7] border border-[#B9D8C8] text-[#2D6A5E] text-xs font-semibold transition-colors"
              title="Simulate realistic incoming phone call with covert SOS trigger"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#55A184]" />
              <span>Fake Call</span>
            </button>

            {/* Duress PIN Pad */}
            <button
              onClick={onOpenDuressModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#EFF7F3] hover:bg-[#E5F3EC] border border-[#D3E5DE] text-[#61746E] text-xs font-medium transition-colors"
              title="Test Duress Passkey & Decoy Calculator"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#F9C950]" />
              <span>Duress PIN</span>
            </button>

            {/* 2G / Offline Toggle */}
            <button
              onClick={onToggleOffline}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-xs font-medium transition-colors ${isOfflineMode
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                  : 'bg-[#2D6A5E]/5 border-[#2D6A5E]/15 text-[#61746E] hover:text-[#202D2D]'
                }`}
              title="Simulate 2G SMS Fallback Mode"
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-yellow-400" /> : <Wifi className="w-3.5 h-3.5 text-[#55A184]" />}
              <span className="hidden xl:inline">{isOfflineMode ? '2G Fallback' : '5G Online'}</span>
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
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-[#EFF7F3] hover:bg-[#E5F3EC] border border-[#D3E5DE] hover:border-[#2D6A5E]/20 transition-all text-left group focus:outline-none focus:ring-1 focus:ring-[#2D6A5E]"
                title="Account menu"
              >
                <UserAvatar name={currentUser.name} avatar={currentUser.avatar} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-[#202D2D] leading-tight flex items-center gap-1">
                    <span>{currentUser.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-3 h-3 text-[#73847F] group-hover:text-[#202D2D] transition-transform duration-150 ${isProfileDropdownOpen ? 'rotate-180 text-[#55A184]' : ''}`} />
                  </p>
                  <p className="text-[10px] text-[#73847F]">Account</p>
                </div>
                <ChevronDown className="sm:hidden w-3 h-3 text-[#73847F]" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] border border-[#D3E5DE] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-[#3E544E]">

                  {/* Dropdown User Info Header */}
                  <div className="px-4 py-2.5 border-b border-[#2D6A5E]/15 flex items-center gap-3">
                    <UserAvatar name={currentUser.name} avatar={currentUser.avatar} size="md" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#202D2D] truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-[#73847F] font-mono truncate">{currentUser.phone}</p>
                      {currentUser.email && (
                        <p className="text-[10px] text-[#899894] truncate">{currentUser.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-1 space-y-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onOpenProfileModal)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#61746E] hover:text-[#202D2D] hover:bg-[#2D6A5E]/5 transition-colors text-left font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-[#55A184] shrink-0" />
                      <span>Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onOpenProfileModal)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#61746E] hover:text-[#202D2D] hover:bg-[#2D6A5E]/5 transition-colors text-left font-medium"
                    >
                      <Lock className="w-4 h-4 text-[#55A184] shrink-0" />
                      <span>Safety & Security</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onOpenProfileModal)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#61746E] hover:text-[#202D2D] hover:bg-[#2D6A5E]/5 transition-colors text-left font-medium"
                    >
                      <Users className="w-4 h-4 text-[#55A184] shrink-0" />
                      <span>Trusted Contacts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onOpenProfileModal)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#61746E] hover:text-[#202D2D] hover:bg-[#2D6A5E]/5 transition-colors text-left font-medium"
                    >
                      <Settings className="w-4 h-4 text-[#73847F] shrink-0" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Divider & Sign Out */}
                  <div className="pt-1 mt-1 border-t border-[#2D6A5E]/15 p-1">
                    <button
                      type="button"
                      onClick={() => handleDropdownAction(onLogout)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#D97883] hover:text-[#D97883] hover:bg-[#D97883]/10 transition-colors text-left text-xs font-semibold"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {onOpenDatabaseSetup && (
                <button
                  type="button"
                  onClick={onOpenDatabaseSetup}
                  className="p-1.5 rounded-xl bg-[#EFF7F3] hover:bg-[#E5F3EC] text-[#61746E] hover:text-[#202D2D] border border-[#D3E5DE] transition-colors"
                  title="Database Setup & SQL Schema"
                >
                  <Database className="w-3.5 h-3.5 text-[#55A184]" />
                </button>
              )}
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D6A5E] hover:bg-[#214F48] text-white text-xs font-bold transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Immediate SOS Emergency Panic Button / Turn Off SOS */}
          {sosState?.isActive ? (
            <button
              onClick={onDisarmSOS}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#D97883] hover:bg-[#C96874] text-white text-xs font-black tracking-wide shadow-lg shadow-[#D95C5C]/40 animate-pulse active:scale-95 transition-all"
              title="Click to Turn Off Active SOS"
            >
              <Power className="w-3.5 h-3.5 fill-white" />
              <span>TURN OFF SOS</span>
            </button>
          ) : (
            <button
              onClick={onTriggerSOS}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#D97883] hover:bg-[#C96874] text-white text-xs font-black tracking-wider shadow-lg shadow-[#D95C5C]/30 active:scale-95 transition-all"
              title="Trigger Emergency SOS distress beacon"
            >
              <AlertTriangle className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>SOS</span>
            </button>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* MOBILE / TABLET UTILITY BAR (RESPONSIVE SECONDARY ROW)    */}
      {/* ========================================================= */}
      <div className="lg:hidden flex items-center justify-between pt-2 mt-2 border-t border-[#2D6A5E]/10 overflow-x-auto gap-2 no-scrollbar text-xs">
        {/* Mobile View Switcher */}
        <div className="flex items-center bg-[#F3F8F5]/95 border border-[#D3E5DE] p-0.5 rounded-lg shrink-0">
          <button
            onClick={() => onSelectView('mobile')}
            className={`px-2 py-1 rounded text-[11px] font-semibold ${currentView === 'mobile' ? 'bg-[#2D6A5E] text-white' : 'text-[#73847F]'
              }`}
          >
            App
          </button>
          <button
            onClick={() => onSelectView('guardian')}
            className={`px-2 py-1 rounded text-[11px] font-semibold ${currentView === 'guardian' ? 'bg-[#2D6A5E] text-white' : 'text-[#73847F]'
              }`}
          >
            Guardian
          </button>
          <button
            onClick={() => onSelectView('civic')}
            className={`px-2 py-1 rounded text-[11px] font-semibold ${currentView === 'civic' ? 'bg-[#2D6A5E] text-white' : 'text-[#73847F]'
              }`}
          >
            Civic
          </button>
        </div>

        {/* Mobile Utility Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenSafeHavens}
            className="px-2 py-1 rounded-lg bg-[#2D6A5E]/5 border border-[#D3E5DE] text-[#61746E] text-[11px] font-medium flex items-center gap-1"
          >
            <Compass className="w-3 h-3 text-[#55A184]" />
            <span>Havens</span>
          </button>
          <button
            onClick={onTriggerFakeCall}
            className="px-2 py-1 rounded-lg bg-[#2D6A5E]/10 border border-[#2D6A5E]/30 text-[#2D6A5E] text-[11px] font-semibold flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call</span>
          </button>
          <button
            onClick={onOpenDuressModal}
            className="px-2 py-1 rounded-lg bg-[#2D6A5E]/5 border border-[#D3E5DE] text-[#61746E] text-[11px] font-medium flex items-center gap-1"
          >
            <KeyRound className="w-3 h-3 text-[#F9C950]" />
            <span>PIN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
