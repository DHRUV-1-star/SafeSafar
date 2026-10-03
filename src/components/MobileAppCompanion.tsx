import React, { useState } from 'react';
import { 
  Shield, 
  MapPin, 
  Search, 
  Bell, 
  Navigation, 
  Crosshair, 
  ShieldAlert, 
  PhoneCall, 
  Lock, 
  Home, 
  Users, 
  User, 
  Volume2, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  X,
  Footprints,
  Car,
  Bike,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building2
} from 'lucide-react';
import { RouteSegment, Landmark, UserProfile, ActiveSOSState } from '../types';
import illustrationImg from '../assets/safesafar_illustration.jpg';

interface MobileAppCompanionProps {
  onClose?: () => void;
  currentUser: UserProfile | null;
  selectedRoute: RouteSegment;
  routes: RouteSegment[];
  landmarks: Landmark[];
  onTriggerSOS: () => void;
  onTriggerFakeCall: () => void;
  onOpenDuressModal: () => void;
  onOpenSafeHavens: () => void;
  onOpenReportModal: () => void;
  onOpenWalkMeHome: () => void;
  onStartNavigation: () => void;
  isNavigating: boolean;
  onEndNavigation: () => void;
  sosState: ActiveSOSState;
  isDarkMode: boolean;
}

export type MobileScreenId = 'onboarding' | 'home' | 'route_map' | 'route_details' | 'live_nav' | 'sos';

export const MobileAppCompanion: React.FC<MobileAppCompanionProps> = ({
  onClose,
  currentUser,
  selectedRoute,
  routes,
  landmarks,
  onTriggerSOS,
  onTriggerFakeCall,
  onOpenDuressModal,
  onOpenSafeHavens,
  onOpenReportModal,
  onOpenWalkMeHome,
  onStartNavigation,
  isNavigating,
  onEndNavigation,
  sosState,
  isDarkMode,
}) => {
  const [activeScreen, setActiveScreen] = useState<MobileScreenId>(
    isNavigating ? 'live_nav' : sosState.isActive ? 'sos' : 'home'
  );
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'sos' | 'guardians' | 'profile'>('home');
  const [travelMode, setTravelMode] = useState<'walk' | 'drive' | '2w'>('walk');

  return (
    <div className="w-[380px] sm:w-[410px] h-[780px] max-h-[92vh] rounded-[48px] bg-black border-[7px] border-[#262e3d] shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative select-none font-sans isolate">
      {/* Phone Notch / Dynamic Island */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3">
        <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b]"></div>
        <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse"></div>
      </div>

      {/* Close Floating Trigger (if inside modal preview) */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-1.5 rounded-full bg-black/60 text-white/80 hover:text-white backdrop-blur-md"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Main Screen Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#070b13] text-white pt-8">
        {/* SCREEN 1: ONBOARDING */}
        {activeScreen === 'onboarding' && (
          <div className="flex-1 flex flex-col justify-between p-6">
            <div className="text-center pt-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto mb-3 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-[#070b13] rounded-[14px] flex items-center justify-center">
                  <Shield className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight">SafeSafar</h2>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">Safer Travel, Brighter Futures</p>
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl my-4 flex-1 max-h-72">
              <img src={illustrationImg} alt="Empowered safe commuter" className="w-full h-full object-cover object-top" />
            </div>

            <div className="space-y-2.5 pb-2">
              <button
                onClick={() => setActiveScreen('home')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveScreen('home')}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold border border-white/10 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: MOBILE HOME HUB */}
        {activeScreen === 'home' && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto p-5 space-y-4">
            {/* Top Greeting Header */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] text-gray-400 font-medium">Good Evening,</span>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                  <span>{currentUser?.name ? currentUser.name.split(' ')[0] : 'Dharmik'}</span>
                  <span>👋</span>
                </h3>
                <p className="text-[10px] text-emerald-400 font-medium">Stay safe, explore freely.</p>
              </div>

              <div className="relative p-2 rounded-2xl bg-white/5 border border-white/10">
                <Bell className="w-4 h-4 text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
            </div>

            {/* Search Input Bar */}
            <div 
              onClick={() => setActiveScreen('route_map')}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#111a2d] border border-white/10 text-gray-400 text-xs font-medium cursor-pointer hover:border-emerald-500/50 transition-colors shadow-inner"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Where do you want to go?</span>
            </div>

            {/* 2 Main Action Cards (Plan Route & Live Tracking) */}
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setActiveScreen('route_map')}
                className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-emerald-900/30 border border-emerald-500/30 cursor-pointer shadow-lg hover:border-emerald-400 transition-all group"
              >
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 border border-emerald-500/30">
                  <Navigation className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-emerald-300">Plan Route</h4>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Find the safest way to your destination</p>
              </div>

              <div 
                onClick={() => {
                  onOpenWalkMeHome();
                }}
                className="p-4 rounded-3xl bg-gradient-to-br from-cyan-950/60 to-blue-900/30 border border-cyan-500/30 cursor-pointer shadow-lg hover:border-cyan-400 transition-all group"
              >
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5 border border-cyan-500/30">
                  <Crosshair className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-cyan-300">Live Tracking</h4>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Share your live location with guardians</p>
              </div>
            </div>

            {/* Quick Actions Grid (6 items) */}
            <div>
              <span className="text-xs font-black tracking-tight text-gray-300 block mb-2.5">Quick Actions</span>
              <div className="grid grid-cols-3 gap-2.5">
                {/* 1. SOS */}
                <button
                  onClick={() => {
                    setActiveScreen('sos');
                    onTriggerSOS();
                  }}
                  className="p-3 rounded-2xl bg-[#131b2e] border border-rose-500/30 text-center hover:bg-rose-950/30 transition-all flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1 border border-rose-500/30">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-400">SOS</span>
                </button>

                {/* 2. Fake Call */}
                <button
                  onClick={onTriggerFakeCall}
                  className="p-3 rounded-2xl bg-[#131b2e] border border-purple-500/30 text-center hover:bg-purple-950/30 transition-all flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1 border border-purple-500/30">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-300">Fake Call</span>
                </button>

                {/* 3. Duress PIN */}
                <button
                  onClick={onOpenDuressModal}
                  className="p-3 rounded-2xl bg-[#131b2e] border border-amber-500/30 text-center hover:bg-amber-950/30 transition-all flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1 border border-amber-500/30">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-400">Duress PIN</span>
                </button>

                {/* 4. Report Spot */}
                <button
                  onClick={onOpenReportModal}
                  className="p-3 rounded-2xl bg-[#131b2e] border border-cyan-500/30 text-center hover:bg-cyan-950/30 transition-all flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1 border border-cyan-500/30">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300">Report Spot</span>
                </button>

                {/* 5. Safe Havens */}
                <button
                  onClick={onOpenSafeHavens}
                  className="p-3 rounded-2xl bg-[#131b2e] border border-emerald-500/30 text-center hover:bg-emerald-950/30 transition-all flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1 border border-emerald-500/30">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">Safe Havens</span>
                </button>

                {/* 6. Walk Me Home */}
                <button
                  onClick={onOpenWalkMeHome}
                  className="p-3 rounded-2xl bg-[#131b2e] border border-teal-500/30 text-center hover:bg-teal-950/30 transition-all flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-1 border border-teal-500/30">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-300">Walk Me Home</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: MOBILE ROUTE MAP & OVERVIEW */}
        {activeScreen === 'route_map' && (
          <div className="flex-1 flex flex-col justify-between p-4 space-y-3">
            {/* Top Back & Inputs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveScreen('home')} className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 flex flex-col bg-[#111a2d] border border-white/10 rounded-2xl p-2 px-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-gray-300 font-semibold truncate">SVNIT Campus, Surat</span>
                  </div>
                  <div className="h-2 w-[1px] bg-white/10 ml-1"></div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span className="text-white font-bold truncate">Miranagar Society, Surat</span>
                  </div>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="flex items-center justify-between gap-1.5 px-1">
                <button className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  🕒 Now
                </button>
                <button 
                  onClick={() => setTravelMode('walk')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 ${
                    travelMode === 'walk' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  <Footprints className="w-3 h-3" /> Walk
                </button>
                <button 
                  onClick={() => setTravelMode('drive')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 ${
                    travelMode === 'drive' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  <Car className="w-3 h-3" /> Drive
                </button>
                <button 
                  onClick={() => setTravelMode('2w')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 ${
                    travelMode === '2w' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  <Bike className="w-3 h-3" /> 2W
                </button>
              </div>
            </div>

            {/* Visual Route Representation Box */}
            <div className="flex-1 rounded-3xl bg-[#111827] border border-white/10 p-4 relative flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-black/60 pointer-events-none"></div>
              
              {/* Route Path visual representation */}
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">🟢 Recommended Safe Route</span>
                  <span className="text-gray-400 font-mono">12 min • 4.3 km</span>
                </div>
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
              </div>

              {/* Safety Badges on Route */}
              <div className="relative z-10 space-y-2">
                <div className="p-3 rounded-2xl bg-[#0b121e]/90 border border-white/15 backdrop-blur-md flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-black text-white">Recommended Route</h5>
                    <p className="text-[10px] text-gray-400">12 min • 4.3 km • 95% well-lit</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500 bg-emerald-500/20 text-emerald-400 font-black text-xs flex flex-col items-center justify-center">
                    <span>78</span>
                    <span className="text-[7px]">/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveScreen('route_details')}
                    className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-gray-200"
                  >
                    Route Details
                  </button>

                  <button
                    onClick={() => {
                      onStartNavigation();
                      setActiveScreen('live_nav');
                    }}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30"
                  >
                    Start Navigation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: ROUTE DETAILS & AI SAFETY BREAKDOWN */}
        {activeScreen === 'route_details' && (
          <div className="flex-1 flex flex-col justify-between p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-2.5">
              <button onClick={() => setActiveScreen('route_map')} className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-black">Route Details</h3>
            </div>

            {/* Score Ring Card */}
            <div className="p-4 rounded-3xl bg-[#111a2d] border border-white/10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-emerald-500/10 text-emerald-400 font-black text-lg flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-2">
                <span>78</span>
                <span className="text-[9px] font-bold opacity-70">/100</span>
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Safest Route</h4>
            </div>

            {/* AI Safety Insight Callout (Matching Reference) */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 leading-relaxed">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <b>AI Safety Insight:</b> This route is 16 points safer because it has better lighting, moderate crowd activity and 5 verified safe havens.
              </span>
            </div>

            {/* Metric Rows */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#111a2d]/80 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-bold text-white">Lighting Coverage</p>
                    <p className="text-[10px] text-gray-400">95% Well illuminated</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>

              <div className="p-3 rounded-2xl bg-[#111a2d]/80 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-bold text-white">Crowd Context</p>
                    <p className="text-[10px] text-gray-400">Moderate active movement</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>

              <div className="p-3 rounded-2xl bg-[#111a2d]/80 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-bold text-white">Safe Havens</p>
                    <p className="text-[10px] text-gray-400">5 nearby police booths & shops</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>

              <div className="p-3 rounded-2xl bg-[#111a2d]/80 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <div>
                    <p className="font-bold text-white">Reported Incidents</p>
                    <p className="text-[10px] text-gray-400">0 in last 6 months</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>

            <button
              onClick={() => {
                onStartNavigation();
                setActiveScreen('live_nav');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30"
            >
              Start Navigation
            </button>
          </div>
        )}

        {/* SCREEN 5: TURN-BY-TURN LIVE NAVIGATION */}
        {activeScreen === 'live_nav' && (
          <div className="flex-1 flex flex-col justify-between p-4 space-y-3 relative overflow-hidden">
            {/* Next Turn Direction Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  ➜
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Turn right in 200 m</h4>
                  <p className="text-[10px] text-emerald-300">Dumas Road Safe Corridor</p>
                </div>
              </div>
              <Volume2 className="w-4 h-4 text-emerald-400" />
            </div>

            {/* 3D Simulated Visual Canvas */}
            <div className="flex-1 rounded-3xl bg-[#090e17] border border-white/10 p-4 relative flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              
              {/* Guidance Beam */}
              <div className="relative z-10 text-center my-auto">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.6)] mx-auto flex items-center justify-center animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
                </div>
                <span className="text-[11px] font-bold text-cyan-300 mt-2 block">Live Telemetry Active (95% Lit)</span>
              </div>

              {/* Floating Live Quick Action Buttons */}
              <div className="relative z-10 grid grid-cols-3 gap-2">
                <button 
                  onClick={onOpenWalkMeHome}
                  className="py-2 rounded-xl bg-black/60 border border-white/15 text-[10px] font-bold text-cyan-300 hover:bg-black/80"
                >
                  📍 Share Live
                </button>

                <button 
                  onClick={onTriggerFakeCall}
                  className="py-2 rounded-xl bg-black/60 border border-white/15 text-[10px] font-bold text-purple-300 hover:bg-black/80"
                >
                  📞 Fake Call
                </button>

                <button 
                  onClick={onOpenDuressModal}
                  className="py-2 rounded-xl bg-black/60 border border-white/15 text-[10px] font-bold text-amber-300 hover:bg-black/80"
                >
                  🔢 Duress PIN
                </button>
              </div>
            </div>

            {/* Bottom Navigation Status Bar */}
            <div className="p-3 rounded-2xl bg-[#111a2d] border border-white/10 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-black text-white">12 min • 4.3 km</h5>
                <p className="text-[10px] text-gray-400">Arrive ~ 8:53 PM</p>
              </div>

              <button
                onClick={() => {
                  onEndNavigation();
                  setActiveScreen('home');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-600/30"
              >
                End
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 6: EMERGENCY SOS RADAR SCREEN */}
        {activeScreen === 'sos' && (
          <div className="flex-1 flex flex-col justify-between p-6 space-y-4 text-center">
            <div className="pt-2">
              <h3 className="text-lg font-black tracking-tight text-rose-500">Emergency SOS</h3>
              <p className="text-xs text-gray-400">Live coordinates broadcasting to guardians</p>
            </div>

            {/* Pulsing Concentric Radar Rings (Matching Reference) */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-56 h-56 rounded-full bg-rose-950/20 border border-rose-500/20 flex items-center justify-center animate-pulse">
                <div className="w-44 h-44 rounded-full bg-rose-950/40 border border-rose-500/40 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-rose-600/80 border-4 border-white shadow-[0_0_40px_rgba(225,29,72,0.8)] flex flex-col items-center justify-center text-white cursor-pointer active:scale-95 transition-transform">
                    <ShieldAlert className="w-8 h-8 mb-1" />
                    <span className="text-base font-black tracking-wider">SOS</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-rose-300 font-semibold">
              Press and hold for 3 seconds to send emergency alert
            </p>

            {/* Emergency Action Buttons */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={onTriggerFakeCall}
                className="p-3 rounded-2xl bg-[#111a2d] border border-purple-500/30 text-purple-300 font-bold"
              >
                <PhoneCall className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px] block">Fake Call</span>
              </button>

              <button
                onClick={onOpenDuressModal}
                className="p-3 rounded-2xl bg-[#111a2d] border border-amber-500/30 text-amber-300 font-bold"
              >
                <Lock className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px] block">Duress PIN</span>
              </button>

              <button
                onClick={onOpenWalkMeHome}
                className="p-3 rounded-2xl bg-[#111a2d] border border-cyan-500/30 text-cyan-300 font-bold"
              >
                <Crosshair className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px] block">Share Live</span>
              </button>
            </div>

            <button
              onClick={() => setActiveScreen('home')}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-300 border border-white/10"
            >
              Configure Emergency Contacts &gt;
            </button>
          </div>
        )}

        {/* BOTTOM MOBILE APP TAB BAR (Matching Reference) */}
        {activeScreen !== 'onboarding' && (
          <div className="h-16 px-4 border-t border-white/10 bg-[#080d17] flex items-center justify-between shrink-0 relative">
            <button
              onClick={() => {
                setActiveTab('home');
                setActiveScreen('home');
              }}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
                activeTab === 'home' && activeScreen === 'home' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('map');
                setActiveScreen('route_map');
              }}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
                activeTab === 'map' && activeScreen === 'route_map' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Map</span>
            </button>

            {/* Center Elevated SOS Floating Button */}
            <div className="relative -top-5">
              <button
                onClick={() => {
                  setActiveScreen('sos');
                  onTriggerSOS();
                }}
                className="w-12 h-12 rounded-full bg-rose-600 border-3 border-black text-white shadow-[0_0_20px_rgba(225,29,72,0.8)] flex flex-col items-center justify-center font-black text-[9px] hover:scale-105 active:scale-95 transition-all"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>SOS</span>
              </button>
            </div>

            <button
              onClick={() => {
                setActiveTab('guardians');
                onOpenWalkMeHome();
              }}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
                activeTab === 'guardians' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Guardians</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
              }}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${
                activeTab === 'profile' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
