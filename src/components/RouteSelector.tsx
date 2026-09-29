import React from 'react';
import { RouteSegment } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Lightbulb, Users, Clock, Navigation2, CheckCircle2, Info } from 'lucide-react';

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
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-purple-400">Smart Route Intelligence</span>
          <h2 className="text-lg font-bold text-white leading-snug">
            {routes.length > 1 ? 'Compare Distinct Routes for Safety' : 'Optimal Safe Route Found'}
          </h2>
        </div>
        <div className="text-xs text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
          <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{routes.length} {routes.length === 1 ? 'Distinct Real Route' : 'Distinct Real Routes'}</span>
        </div>
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 gap-3.5 mb-5">
        {routes.map((route) => {
          const isSelected = route.id === selectedRoute.id;
          const isSafest = route.category === 'safest';
          const isFastest = route.category === 'fastest';

          let badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
          let scoreBg = 'from-emerald-500 to-teal-600';
          let icon = <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />;

          if (route.category === 'balanced') {
            badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            scoreBg = 'from-amber-500 to-orange-600';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
          } else if (route.category === 'fastest') {
            badgeColor = 'bg-red-500/15 text-red-400 border-red-500/30';
            scoreBg = 'from-red-500 to-rose-600';
            icon = <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />;
          }

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                isSelected
                  ? 'bg-gradient-to-b from-gray-800/95 to-gray-900 border-purple-500 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/30'
                  : 'bg-gray-900/60 border-white/10 hover:border-white/25 hover:bg-gray-900/80'
              }`}
            >
              {/* Header Row: Category Badge + Special Tag & Safety Score */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold capitalize ${badgeColor}`}>
                      {icon}
                      <span>{route.category}</span>
                    </div>

                    {isSafest && (
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm tracking-wide">
                        ★ RECOMMENDED
                      </span>
                    )}

                    {isFastest && (
                      <span className="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm tracking-wide">
                        ⚠️ HIGH RISK AT NIGHT
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm leading-snug mt-0.5">{route.name}</h3>
                </div>

                <div className="text-right shrink-0">
                  <div className={`px-2.5 py-1 rounded-xl bg-gradient-to-br ${scoreBg} text-white font-black text-sm shadow-md inline-block`}>
                    {route.safetyScore}<span className="text-[10px] font-normal opacity-90">/100</span>
                  </div>
                  <div className="text-[10px] font-medium text-gray-400 leading-tight mt-1">Safety Index</div>
                </div>
              </div>

              {/* Duration & Distance Row */}
              <div className="flex items-center gap-2 text-xs text-gray-300 mb-3 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {route.durationMin} mins
                </span>
                <span className="text-gray-600">•</span>
                <span>{route.distanceKm} km</span>
              </div>

              {/* Telemetry Breakdown */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                {/* Lighting Bar */}
                <div>
                  <div className="flex justify-between items-center text-gray-400 gap-2 mb-1">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0" /> Lighting
                    </span>
                    <span className="font-bold text-white shrink-0">{route.lightingPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800/90 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${route.lightingPercent}%`,
                        backgroundColor: route.lightingPercent > 80 ? '#10B981' : route.lightingPercent > 50 ? '#F59E0B' : '#EF4444',
                      }}
                    />
                  </div>
                </div>

                {/* Crowd Context */}
                <div className="flex justify-between items-center gap-2 text-gray-400 pt-0.5">
                  <span className="flex items-center gap-1.5 shrink-0">
                    <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Crowd Context
                  </span>
                  <span className={`font-bold text-xs text-right truncate shrink-0 ${route.crowdContext.verifiedSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                    {route.crowdContext.level} {route.crowdContext.verifiedSafe ? '✓ Verified' : '⚠️ Deserted'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Explainability Breakdown */}
      <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
          <span className="text-xs font-bold text-gray-200">Why this score? (Explainable Safety Engine)</span>
          <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
            Dynamic Multi-Factor Weight
          </span>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-3">{selectedRoute.crowdContext.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 block mb-0.5">Lighting Coverage</span>
            <span className="text-sm font-black text-emerald-400">{selectedRoute.lightingPercent}%</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 block mb-0.5">Pink / Police Booths</span>
            <span className="text-sm font-black text-blue-400">{selectedRoute.safeLandmarksCount} havens</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 block mb-0.5">Reported Incidents</span>
            <span className={`text-sm font-black ${selectedRoute.incidentsReported === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {selectedRoute.incidentsReported} past
            </span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-gray-400 block mb-0.5">Time-of-Day Risk</span>
            <span className="text-xs font-bold text-purple-300">Night Factor</span>
          </div>
        </div>

        {/* Highlights & Warnings */}
        <div className="space-y-1.5">
          {selectedRoute.highlights.map((hl, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-400 leading-snug">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{hl}</span>
            </div>
          ))}
          {selectedRoute.warnings.map((wn, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-amber-400 leading-snug">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{wn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onStartTrip}
          className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Navigation2 className="w-4 h-4 fill-white shrink-0" />
          <span>Start Navigation ({selectedRoute.durationMin}m)</span>
        </button>

        <button
          onClick={onOpenWalkMeHome}
          className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Users className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Walk Me Home</span>
        </button>
      </div>
    </div>
  );
};
