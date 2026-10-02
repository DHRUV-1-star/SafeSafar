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
    <div className="bg-white/95 backdrop-blur-xl border border-[#2D6A5E]/15 rounded-3xl p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#55A184]">Smart Route Intelligence</span>
          <h2 className="text-lg font-bold text-[#243A35] leading-snug">
            {routes.length > 1 ? 'Compare Distinct Routes for Safety' : 'Optimal Safe Route Found'}
          </h2>
        </div>
        <div className="text-xs text-[#73847F] bg-[#2D6A5E]/5 border border-[#2D6A5E]/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
          <Info className="w-3.5 h-3.5 text-[#55A184] shrink-0" />
          <span>{routes.length} {routes.length === 1 ? 'Distinct Real Route' : 'Distinct Real Routes'}</span>
        </div>
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {routes.map((route) => {
          const isSelected = route.id === selectedRoute.id;
          const isSafest = route.category === 'safest';
          const isFastest = route.category === 'fastest';

          let badgeColor = 'bg-[#72A892]/15 text-[#55A184] border-[#72A892]/30';
          let scoreBg = 'from-[#2D6A5E] to-[#2D6A5E]';
          let icon = <ShieldCheck className="w-4 h-4 text-[#55A184] shrink-0" />;

          if (route.category === 'balanced') {
            badgeColor = 'bg-[#F9C950]/15 text-[#F9C950] border-[#F9C950]/30';
            scoreBg = 'from-[#C99B3E] to-[#B48836]';
            icon = <AlertTriangle className="w-4 h-4 text-[#F9C950] shrink-0" />;
          } else if (route.category === 'fastest') {
            badgeColor = 'bg-[#D97883]/15 text-[#D97883] border-[#D97883]/30';
            scoreBg = 'from-[#D97883] to-[#C96874]';
            icon = <ShieldAlert className="w-4 h-4 text-[#D97883] shrink-0" />;
          }

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`cursor-pointer rounded-2xl p-3.5 sm:p-4 transition-all border overflow-hidden min-w-0 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#EDF7F2] border-[#55A184] shadow-xl shadow-[#2D6A5E]/10 ring-1 ring-[#2D6A5E]/30'
                  : 'bg-white border-[#D3E5DE] hover:border-[#72A892]/55 hover:bg-[#F8FCFA]'
              }`}
            >
              {/* Header Row: Category Badge + Special Tag & Safety Score */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold capitalize ${badgeColor}`}>
                        {icon}
                        <span>{route.category}</span>
                      </div>

                      {isSafest && (
                        <span className="bg-[#D8ECE2] text-[#2D6A5E] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs tracking-wide">
                          ★ RECOMMENDED
                        </span>
                      )}

                      {isFastest && (
                        <span className="bg-[#F9E9EB] text-[#B85F6B] border border-[#E8BEC4] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs tracking-wide">
                          ⚠️ HIGH RISK AT NIGHT
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-[#243A35] text-xs sm:text-sm leading-snug mt-0.5 break-words">{route.name}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`px-2 py-0.5 rounded-xl bg-gradient-to-br ${scoreBg} text-white font-black text-xs sm:text-sm shadow-sm inline-block`}>
                      {route.safetyScore}<span className="text-[9px] font-normal opacity-90">/100</span>
                    </div>
                    <div className="text-[9px] font-medium text-[#73847F] leading-tight mt-0.5">Safety Index</div>
                  </div>
                </div>

                {/* Duration & Distance Row */}
                <div className="flex items-center gap-2 text-[11px] text-[#61746E] mb-3 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#73847F] shrink-0" />
                    {route.durationMin} mins
                  </span>
                  <span className="text-[#B7B1A8]">•</span>
                  <span>{route.distanceKm} km</span>
                </div>
              </div>

              {/* Telemetry Breakdown */}
              <div className="pt-2.5 border-t border-[#2D6A5E]/15 space-y-2 text-[11px]">
                {/* Lighting Bar */}
                <div>
                  <div className="flex justify-between items-center text-[#73847F] gap-1 mb-1">
                    <span className="flex items-center gap-1 shrink-0 text-[11px]">
                      <Lightbulb className="w-3 h-3 text-yellow-500 shrink-0" /> Lighting
                    </span>
                    <div className="flex items-center gap-1 min-w-0">
                      {route.confidence === 'low' && (
                        <span className="text-[8px] font-bold text-[#A67B22] bg-[#F9C950]/15 border border-[#F9C950]/30 px-1 py-0.2 rounded truncate">
                          Sparse OSM
                        </span>
                      )}
                      <span className="font-bold text-[#243A35] shrink-0 text-[11px]">{route.lightingPercent}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#E7E3DD]/95 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${route.lightingPercent}%`,
                        backgroundColor: route.lightingPercent > 80 ? '#72A892' : route.lightingPercent > 50 ? '#F9C950' : '#D97883',
                      }}
                    />
                  </div>
                </div>

                {/* Crowd Context */}
                <div className="flex items-center justify-between gap-1 text-[#73847F] pt-0.5 min-w-0">
                  <span className="flex items-center gap-1 shrink-0 text-[11px]">
                    <Users className="w-3 h-3 text-[#55A184] shrink-0" /> Crowd
                  </span>
                  <span className={`font-bold text-[11px] text-right truncate min-w-0 ${route.crowdContext.verifiedSafe ? 'text-[#55A184]' : 'text-[#D97883]'}`}>
                    {route.crowdContext.level} {route.crowdContext.verifiedSafe ? '✓ Verified' : '⚠️ Deserted'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Explainability Breakdown */}
      <div className="bg-[#F3F8F5]/90 border border-[#2D6A5E]/15 rounded-2xl p-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
          <span className="text-xs font-bold text-[#3E544E]">Why this score? (Explainable Safety Engine)</span>
          <span className="text-[10px] text-[#55A184] font-mono bg-[#2D6A5E]/10 border border-[#2D6A5E]/20 px-2 py-0.5 rounded-md">
            Dynamic Multi-Factor Weight
          </span>
        </div>

        <p className="text-xs text-[#61746E] leading-relaxed mb-3">{selectedRoute.crowdContext.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="bg-[#2D6A5E]/5 border border-[#2D6A5E]/10 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-[#73847F] block mb-0.5">Lighting Coverage</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-black text-[#55A184]">{selectedRoute.lightingPercent}%</span>
              {selectedRoute.confidence === 'low' && (
                <span className="text-[8px] font-bold text-[#A67B22] bg-[#F9C950]/20 px-1 py-0.2 rounded" title="Limited OSM lighting data">
                  Sparse
                </span>
              )}
            </div>
          </div>
          <div className="bg-[#2D6A5E]/5 border border-[#2D6A5E]/10 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-[#73847F] block mb-0.5">Pink / Police Booths</span>
            <span className="text-sm font-black text-[#55A184]">{selectedRoute.safeLandmarksCount} havens</span>
          </div>
          <div className="bg-[#2D6A5E]/5 border border-[#2D6A5E]/10 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-[#73847F] block mb-0.5">Reported Incidents</span>
            <span className={`text-sm font-black ${selectedRoute.incidentsReported === 0 ? 'text-[#55A184]' : 'text-[#D97883]'}`}>
              {selectedRoute.incidentsReported} past
            </span>
          </div>
          <div className="bg-[#2D6A5E]/5 border border-[#2D6A5E]/10 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-[#73847F] block mb-0.5">Time-of-Day Risk</span>
            <span className="text-xs font-bold text-[#2D6A5E]">Night Factor</span>
          </div>
        </div>

        {/* Low Confidence Lighting Warning Callout */}
        {selectedRoute.confidence === 'low' && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-[#F9C950]/10 border border-[#F9C950]/30 flex items-center gap-2 text-xs text-[#A67B22]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F9C950] shrink-0" />
            <span>Limited lighting data for this stretch (OSM street lamps & amenities sparse)</span>
          </div>
        )}

        {/* Highlights & Warnings */}
        <div className="space-y-1.5">
          {selectedRoute.highlights.map((hl, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-[#55A184] leading-snug">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{hl}</span>
            </div>
          ))}
          {selectedRoute.warnings.map((wn, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-[#F9C950] leading-snug">
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
          className="flex-1 py-3.5 px-5 rounded-2xl bg-[#214F48] hover:bg-[#2D6A5E] text-white font-bold text-sm shadow-lg shadow-[#214F48]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Navigation2 className="w-4 h-4 fill-white shrink-0" />
          <span>Start Navigation ({selectedRoute.durationMin}m)</span>
        </button>

        <button
          onClick={onOpenWalkMeHome}
          className="py-3.5 px-4 rounded-2xl bg-[#2D6A5E]/8 hover:bg-[#2D6A5E]/10 border border-[#2D6A5E]/15 text-[#243A35] font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Users className="w-4 h-4 text-[#55A184] shrink-0" />
          <span>Walk Me Home</span>
        </button>
      </div>
    </div>
  );
};
