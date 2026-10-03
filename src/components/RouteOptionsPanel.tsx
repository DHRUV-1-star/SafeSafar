import React from 'react';
import { 
  Shield, 
  MapPin, 
  Zap, 
  ArrowRight, 
  Users, 
  Lightbulb, 
  Building2, 
  AlertTriangle,
  Navigation,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';
import { RouteSegment } from '../types';

interface RouteOptionsPanelProps {
  routes: RouteSegment[];
  selectedRoute: RouteSegment;
  onSelectRoute: (route: RouteSegment) => void;
  onStartNavigation: () => void;
  onOpenWalkMeHome: () => void;
  isDarkMode: boolean;
  onOpenAnalysisModal?: () => void;
}

export const RouteOptionsPanel: React.FC<RouteOptionsPanelProps> = ({
  routes,
  selectedRoute,
  onSelectRoute,
  onStartNavigation,
  onOpenWalkMeHome,
  isDarkMode,
}) => {
  return (
    <div className={`w-80 lg:w-96 shrink-0 flex flex-col justify-between p-5 border-l overflow-y-auto select-none transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-[#0b121e] border-white/10 text-white' 
        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black tracking-tight">Route Options</h2>
          <button className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
          }`}>
            <span>Compare Routes</span>
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Route Cards */}
        <div className="space-y-3">
          {routes.map((route, idx) => {
            const isSelected = route.id === selectedRoute.id;
            const isSafest = idx === 0 || route.id === 'safest';
            const isBalanced = idx === 1 || route.id === 'balanced';
            const isFastest = idx === 2 || route.id === 'fastest';

            let themeColor = 'emerald';
            let iconBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            let IconComponent = Shield;
            let badgeTitle = 'Safest Route';
            let durationSubtext = '↑ 3 min longer';

            if (isBalanced) {
              themeColor = 'amber';
              iconBg = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
              IconComponent = MapPin;
              badgeTitle = 'Balanced Route';
              durationSubtext = '↑ 5 min longer';
            } else if (isFastest) {
              themeColor = 'rose';
              iconBg = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
              IconComponent = Zap;
              badgeTitle = 'Fastest Route';
              durationSubtext = '';
            }

            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? isDarkMode
                      ? isSafest 
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        : isBalanced
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                        : 'bg-rose-950/30 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                      : isSafest
                        ? 'bg-emerald-50 border-emerald-500 shadow-md'
                        : isBalanced
                        ? 'bg-amber-50 border-amber-500 shadow-md'
                        : 'bg-rose-50 border-rose-500 shadow-md'
                    : isDarkMode
                      ? 'bg-[#111a2d]/70 border-white/10 hover:border-white/20 hover:bg-[#111a2d]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-black tracking-tight ${
                          isSafest 
                            ? 'text-emerald-400' 
                            : isBalanced 
                            ? 'text-amber-400' 
                            : 'text-rose-400'
                        }`}>
                          {badgeTitle}
                        </span>
                        {isFastest && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Fastest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold mt-0.5 truncate text-inherit">
                        <span>{route.durationMin} min</span>
                        <span className="opacity-40">•</span>
                        <span>{route.distanceKm} km</span>
                        {durationSubtext && (
                          <span className="text-[10px] text-gray-400 font-normal ml-1">
                            {durationSubtext}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Safety Score Radial Ring Badge */}
                  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 shrink-0 ${
                    isSafest 
                      ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                      : isBalanced
                      ? 'border-amber-500/80 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'border-rose-500/80 bg-rose-500/10 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  }`}>
                    <span className="text-xs font-black leading-none">{route.safetyScore}</span>
                    <span className="text-[8px] font-bold opacity-70 leading-none mt-0.5">/100</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why this route is safer? Card */}
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#111a2d]/80 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black tracking-tight">Why this route is safer?</span>
            <span className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-0.5">
              <span>View Detailed Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Metric 1: Lighting */}
            <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
              isDarkMode ? 'bg-[#0b121e]/90 border-white/5' : 'bg-white border-slate-200'
            }`}>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-inherit leading-none">{selectedRoute.lightingPercent}%</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">Well illuminated</p>
              </div>
            </div>

            {/* Metric 2: Crowd Density */}
            <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
              isDarkMode ? 'bg-[#0b121e]/90 border-white/5' : 'bg-white border-slate-200'
            }`}>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-inherit leading-none capitalize">
                  {selectedRoute.crowdContext?.level || 'Moderate'}
                </p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">Crowd density</p>
              </div>
            </div>

            {/* Metric 3: Safe Havens */}
            <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
              isDarkMode ? 'bg-[#0b121e]/90 border-white/5' : 'bg-white border-slate-200'
            }`}>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-inherit leading-none">5 nearby</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">Safe havens</p>
              </div>
            </div>

            {/* Metric 4: Reported Incidents */}
            <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
              isDarkMode ? 'bg-[#0b121e]/90 border-white/5' : 'bg-white border-slate-200'
            }`}>
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-inherit leading-none">0 recent</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">Incidents (6 mo)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action CTAs */}
      <div className="pt-4 space-y-2.5 border-t border-white/10 mt-4">
        <div className="grid grid-cols-5 gap-2">
          {/* Walk Me Home Button */}
          <button
            onClick={onOpenWalkMeHome}
            className={`col-span-2 px-3 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
              isDarkMode 
                ? 'bg-[#111a2d] border-white/15 text-gray-200 hover:text-white hover:bg-[#1a2640]' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Walk Me Home</span>
          </button>

          {/* Start Navigation CTA (Glowing Emerald Button) */}
          <button
            onClick={onStartNavigation}
            className="col-span-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Navigation className="w-4 h-4 fill-slate-950" />
            <span>Start Navigation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
