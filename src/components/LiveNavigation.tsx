import React, { useState, useEffect } from 'react';
import { RouteSegment, Landmark } from '../types';
import { Navigation, Volume2, VolumeX, AlertOctagon, CheckCircle2, MapPin, Shield, Zap, X } from 'lucide-react';
import { speakInstruction } from '../utils/speech';
import confetti from 'canvas-confetti';
import { playSafeArrivalChime } from '../utils/audio';

interface LiveNavigationProps {
  route: RouteSegment;
  landmarks: Landmark[];
  onEndTrip: () => void;
  onSimulateDeviation: () => void;
  onSafeArrival: () => void;
  currentCoordIndex: number;
  onStepNextCoord: () => void;
}

export const LiveNavigation: React.FC<LiveNavigationProps> = ({
  route,
  landmarks,
  onEndTrip,
  onSimulateDeviation,
  onSafeArrival,
  currentCoordIndex,
  onStepNextCoord,
}) => {
  const [speechMuted, setSpeechMuted] = useState<boolean>(false);
  const totalSteps = route.coordinates.length;
  const progressPct = Math.min(100, Math.round(((currentCoordIndex + 1) / totalSteps) * 100));

  // Instructions for each waypoint on the Dumas Road / Ring Road corridor
  const instructions = [
    { text: 'Head northeast on Dumas Rd past SVNIT main gate.', landmark: 'SVNIT Security Post' },
    { text: 'Continue along Dumas Road. Street lighting is 96% optimal.', landmark: 'CCTV Corridor' },
    { text: 'Approaching Kargil Chowk. Keep right on high-mast illuminated avenue.', landmark: 'Kargil Chowk Police Patrol' },
    { text: 'In 300 meters, Umra Pink Police Booth will be on your right.', landmark: 'Umra Pink Police Booth' },
    { text: 'Passing Police Commissionerate zone. Highly safe perimeter.', landmark: 'Police HQ' },
    { text: 'Approaching Athwagate junction safe corridor.', landmark: 'Athwa Pink Booth' },
    { text: 'Arriving safely at Ring Road Hub destination.', landmark: 'Safe Haven Hub' },
  ];

  const currentInstruction = instructions[Math.min(currentCoordIndex, instructions.length - 1)];

  // Speak guidance whenever instruction changes
  useEffect(() => {
    if (!speechMuted && currentInstruction) {
      speakInstruction(`SafeSafar guidance: ${currentInstruction.text}`);
    }
  }, [currentCoordIndex, speechMuted]);

  // Handle Arrival
  const handleArrivalClick = () => {
    playSafeArrivalChime();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    onSafeArrival();
  };

  return (
    <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 animate-pulse">
            <Navigation className="w-4 h-4 fill-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Active Safe Navigation</span>
            <h3 className="text-sm font-bold text-white">{route.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeechMuted(!speechMuted)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
            title={speechMuted ? 'Unmute Voice Guidance' : 'Mute Voice Guidance'}
          >
            {speechMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onEndTrip}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
            title="End Navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Turn Direction Instruction */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
            <MapPin className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-white leading-snug">{currentInstruction?.text}</h4>
            <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Safe Landmark Ahead: {currentInstruction?.landmark}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
          <span>Waypoint {currentCoordIndex + 1} of {totalSteps}</span>
          <span className="font-mono text-white">{progressPct}% completed</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Trip Simulation Controls */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
        <button
          onClick={onStepNextCoord}
          disabled={currentCoordIndex >= totalSteps - 1}
          className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Next Step Along Route</span>
        </button>

        <button
          onClick={onSimulateDeviation}
          className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulate Off-Route</span>
        </button>

        <button
          onClick={handleArrivalClick}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Simulate Safe Arrival</span>
        </button>
      </div>
    </div>
  );
};
