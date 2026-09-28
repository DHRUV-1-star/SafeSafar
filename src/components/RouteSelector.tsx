import React from 'react';
import { RouteSegment } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Lightbulb, Users, Clock, Navigation2, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface RouteSelectorProps {
  routes: RouteSegment[];
  selectedRoute: RouteSegment;
  onSelectRoute: (route: RouteSegment) => void;
  onStartTrip: () => void;
  onOpenWalkMeHome: () => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  selectedRoute,
  onSelectRoute,
  onStartTrip,
  onOpenWalkMeHome,
}) => {
  return (
    <div className="bg-[#111827]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-purple-400">Smart Route Optimization</span>
          <h2 className="text-lg font-bold text-white">Compare Routes for Safety</h2>
        </div>
        <div className="text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-purple-400" />
          <span>Surat Pilot Corridors</span>
        </div>
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {routes.map((route) => {
          const isSelected = route.id === selectedRoute.id;
          const isSafest = route.category === 'safest';
          const isFastest = route.category === 'fastest';

          let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          let scoreBg = 'from-emerald-500 to-teal-600';
          let icon = <ShieldCheck className="w-4 h-4 text-emerald-400" />;

          if (route.category === 'balanced') {
            badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            scoreBg = 'from-amber-500 to-orange-600';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          } else if (route.category === 'fastest') {
            badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';
            scoreBg = 'from-red-500 to-rose-600';
            icon = <ShieldAlert className="w-4 h-4 text-red-400" />;
          }

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`relative cursor-pointer rounded-2xl p-4 transition-all border ${
                isSelected
                  ? 'bg-gradient-to-b from-gray-800/90 to-gray-900 border-purple-500 shadow-lg shadow-purple-500/10 scale-[1.02]'
                  : 'bg-gray-900/50 border-white/5 hover:border-white/20'
              }`}
            >
              {isSafest && (
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                  ★ RECOMMENDED
                </div>
              )}

              {isFastest && (
                <div className="absolute -top-2.5 right-3 bg-red-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                  ⚠️ HIGH RISK AT NIGHT
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-semibold ${badgeColor} mb-1.5`}>
                    {icon}
                    <span className="capitalize">{route.category}</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm leading-tight">{route.name}</h3>
                </div>

                <div className="text-right">
                  <div className={`px-2.5 py-1 rounded-xl bg-gradient-to-br ${scoreBg} text-white font-black text-sm shadow-md`}>
                    {route.safetyScore}<span className="text-[10px] font-normal opacity-80">/100</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Safety Index</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 text-xs text-gray-300">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {route.durationMin} mins
                </span>
                <span>•</span>
                <span>{route.distanceKm} km</span>
              </div>

              {/* Mini telemetry bars */}
              <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-yellow-400" /> Lighting
                  </span>
                  <span className="font-medium text-white">{route.lightingPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${route.lightingPercent}%`,
                      backgroundColor: route.lightingPercent > 80 ? '#10B981' : route.lightingPercent > 50 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-gray-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" /> Crowd Context
                  </span>
                  <span className={`font-medium ${route.crowdContext.verifiedSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                    {route.crowdContext.level} {route.crowdContext.verifiedSafe ? '✓ Verified' : '⚠️ Deserted'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Explainability Breakdown (Page 3 & 10 Explainability requirement) */}
      <div className="bg-gray-900/70 border border-white/5 rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-300">Why this score? (Explainable Safety Engine)</span>
          <span className="text-[11px] text-purple-400 font-mono">Dynamic Multi-Factor Weight</span>
        </div>

        <p className="text-xs text-gray-300 mb-3">{selectedRoute.crowdContext.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 block">Lighting Coverage</span>
            <span className="text-sm font-bold text-emerald-400">{selectedRoute.lightingPercent}%</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 block">Pink / Police Booths</span>
            <span className="text-sm font-bold text-blue-400">{selectedRoute.safeLandmarksCount} safe havens</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 block">Reported Incidents</span>
            <span className={`text-sm font-bold ${selectedRoute.incidentsReported === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {selectedRoute.incidentsReported} past issues
            </span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 block">Time-of-Day Risk</span>
            <span className="text-sm font-bold text-purple-300">Night Factor Active</span>
          </div>
        </div>

        {/* Highlights & Warnings */}
        <div className="space-y-1">
          {selectedRoute.highlights.map((hl, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{hl}</span>
            </div>
          ))}
          {selectedRoute.warnings.map((wn, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{wn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onStartTrip}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Navigation2 className="w-4 h-4 fill-white" />
          <span>Start Navigation ({selectedRoute.durationMin}m)</span>
        </button>

        <button
          onClick={onOpenWalkMeHome}
          className="py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4 text-purple-400" />
          <span>Walk Me Home Mode</span>
        </button>
      </div>
    </div>
  );
};
