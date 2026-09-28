import React from 'react';
import { ActiveSOSState, TrustedContact, RouteSegment } from '../types';
import { Shield, Radio, BatteryCharging, MapPin, Clock, Phone, AlertTriangle, CheckCircle2, User, ChevronRight } from 'lucide-react';

interface GuardianDashboardProps {
  userLocation: [number, number];
  sosState: ActiveSOSState;
  activeRoute: RouteSegment;
  batteryLevel: number;
  trustedContacts: TrustedContact[];
  onTriggerRemoteSOS: () => void;
  onClearSOS: () => void;
}

export const GuardianDashboard: React.FC<GuardianDashboardProps> = ({
  userLocation,
  sosState,
  activeRoute,
  batteryLevel,
  trustedContacts,
  onTriggerRemoteSOS,
  onClearSOS,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Alert if SOS */}
      {sosState.isActive && (
        <div className="bg-red-950/80 border-2 border-red-500 rounded-3xl p-5 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-sos-strobe">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-red-800 px-2.5 py-0.5 rounded-full">
                {sosState.duressActive ? 'Covert Duress Code Transmitted' : 'Emergency SOS Alert'}
              </span>
              <h2 className="text-xl font-black mt-1">Distress Signal Detected from Dharmik</h2>
              <p className="text-xs text-red-200 mt-0.5">
                Triggered via: <strong className="uppercase">{sosState.triggerSource.replace('_', ' ')}</strong> • GPS Telemetry Broadcasting Live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:112"
              className="px-5 py-3 rounded-2xl bg-white text-red-600 font-bold text-sm hover:bg-gray-100 shadow-lg flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Surat Police (112)</span>
            </a>
            <button
              onClick={onClearSOS}
              className="px-4 py-3 rounded-2xl bg-red-900/60 hover:bg-red-800 text-white font-semibold text-xs border border-red-400/40"
            >
              Acknowledge & Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Status & Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827]/90 border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Commuter"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#111827]"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Dharmik Gohil</h3>
                  <p className="text-xs text-purple-300">Active Walk Me Home Companion • Surat Hub</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Live GPS
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-mono">
                  {batteryLevel}% Bat
                </span>
              </div>
            </div>

            {/* Current Route Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Current Route</span>
                <span className="text-xs font-bold text-white line-clamp-1">{activeRoute.name}</span>
                <span className="text-[10px] text-emerald-400">Score: {activeRoute.safetyScore}/100</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Lighting Level</span>
                <span className="text-sm font-bold text-emerald-400">{activeRoute.lightingPercent}%</span>
                <span className="text-[10px] text-gray-400">Well illuminated</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Estimated Arrival</span>
                <span className="text-sm font-bold text-purple-300">{activeRoute.durationMin} mins</span>
                <span className="text-[10px] text-gray-400">On Schedule</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Safe Havens on Path</span>
                <span className="text-sm font-bold text-blue-400">{activeRoute.safeLandmarksCount} Verified</span>
                <span className="text-[10px] text-gray-400">Pink & Police Posts</span>
              </div>
            </div>

            {/* Realtime Breadcrumbs Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Live Journey Breadcrumbs</h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-xs bg-black/30 p-3 rounded-2xl border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div className="flex-1">
                    <span className="text-white font-medium">Currently near Piplod / Kargil Chowk</span>
                    <p className="text-[10px] text-gray-400">Lat: {userLocation[0].toFixed(4)}, Long: {userLocation[1].toFixed(4)} • Walking at 4.2 km/h</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Just now</span>
                </div>

                <div className="flex items-center gap-3 text-xs bg-black/20 p-3 rounded-2xl border border-white/5 opacity-80">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-300">Passed SVNIT Security Checkpoint</span>
                    <p className="text-[10px] text-gray-400">Continuous streetlights active</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">3m ago</span>
                </div>

                <div className="flex items-center gap-3 text-xs bg-black/20 p-3 rounded-2xl border border-white/5 opacity-60">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-400">Trip initiated from SVNIT Campus</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">8m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Circle Members & Quick Remote Actions */}
        <div className="space-y-6">
          <div className="bg-[#111827]/90 border border-white/10 rounded-3xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-3">Guardian Safety Circle</h4>
            <div className="space-y-3">
              {trustedContacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-purple-300">{c.relation} • {c.phone}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {c.batteryStatus}% Bat
                  </span>
                </div>
              ))}
            </div>

            {/* Remote Emergency Actions */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Guardian Remote Triggers</h5>
              <button
                onClick={onTriggerRemoteSOS}
                className="w-full py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Trigger Remote Distress Check</span>
              </button>

              <a
                href="tel:1091"
                className="w-full py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Dial Women Police Helpline 1091</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
