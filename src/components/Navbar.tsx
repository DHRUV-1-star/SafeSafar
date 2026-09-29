import React from 'react';
import { Shield, Smartphone, Monitor, BarChart3, Wifi, WifiOff, PhoneCall, KeyRound, AlertTriangle, Eye, PlusCircle, Compass, Power } from 'lucide-react';
import { ActiveSOSState } from '../types';

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
  onDisarmSOS?: () => void;
  sosState?: ActiveSOSState;
  batteryLevel: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  isOfflineMode,
  onToggleOffline,
  onTriggerFakeCall,
  onOpenDuressModal,
  onOpenDecoy,
  onOpenReportModal,
  onOpenSafeHavens,
  onOpenMapApiKeyModal,
  hasCustomMapKey,
  onTriggerSOS,
  onDisarmSOS,
  sosState,
  batteryLevel,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Hackathon Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Shield className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                SafeSafar
              </h1>
              <span className="text-[10px] font-bold bg-pink-500/10 border border-pink-500/30 text-pink-400 px-2 py-0.5 rounded-full">
                IEEE WIE ILS 2026
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Track 3: SheLeads • Team Codecraft (SVNIT)</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-gray-900/90 border border-white/10 p-1 rounded-2xl">
          <button
            onClick={() => onSelectView('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'mobile'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>

          <button
            onClick={() => onSelectView('guardian')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'guardian'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Guardian Dashboard</span>
          </button>

          <button
            onClick={() => onSelectView('civic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'civic'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Civic Heatmap</span>
          </button>
        </div>

        {/* Action Controls & Emergency Tools */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Map API Key Settings */}
          <button
            onClick={onOpenMapApiKeyModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              hasCustomMapKey
                ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
            }`}
            title="Configure Mapbox / Maps API Key"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>Map API</span>
            {hasCustomMapKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
          </button>

          {/* 2G / Offline Fallback Mode Toggle */}
          <button
            onClick={onToggleOffline}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isOfflineMode
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
            }`}
            title="Simulate 2G / No-Network condition with SMS Fallback"
          >
            {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-yellow-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isOfflineMode ? '2G / SMS Fallback' : '5G Online'}</span>
          </button>

          {/* Quick Safe Havens Radar */}
          <button
            onClick={onOpenSafeHavens}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all"
            title="Locate nearest Pink Booths & Police Outposts"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Safe Havens</span>
          </button>

          {/* Report Hazard Spot */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Report Spot</span>
          </button>

          {/* Covert Tool 1: Fake Call */}
          <button
            onClick={onTriggerFakeCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all shadow-sm"
            title="Simulate realistic incoming phone call with hidden SOS voice trigger"
          >
            <PhoneCall className="w-3.5 h-3.5 text-purple-400" />
            <span>Fake Call</span>
          </button>

          {/* Covert Tool 2: Duress PIN Pad */}
          <button
            onClick={onOpenDuressModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium transition-all"
            title="Test Duress Passkey (PIN 9999)"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Duress PIN</span>
          </button>

          {/* Covert Tool 3: Instant Decoy */}
          <button
            onClick={onOpenDecoy}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
            title="Instant Calculator Decoy Disguise"
          >
            <Eye className="w-4 h-4 text-gray-400" />
          </button>

          {/* Immediate SOS Emergency Panic Button / Turn Off SOS */}
          {sosState?.isActive ? (
            <button
              onClick={onDisarmSOS}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-emerald-600 hover:from-red-500 hover:to-emerald-500 text-white text-xs font-black tracking-wide shadow-lg shadow-red-600/40 animate-pulse active:scale-95 transition-all"
              title="Click to Turn Off Active SOS"
            >
              <Power className="w-3.5 h-3.5 fill-white" />
              <span>TURN OFF SOS</span>
            </button>
          ) : (
            <button
              onClick={onTriggerSOS}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black tracking-wide shadow-lg shadow-red-600/40 active:scale-95 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 fill-white" />
              <span>SOS</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
