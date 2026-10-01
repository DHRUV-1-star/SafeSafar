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
    <div className="bg-[#FFFFFF]/95 backdrop-blur-xl border border-[#2F5F5E]/15 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2F5F5E]/15 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#7CA982]/20 border border-[#7CA982] flex items-center justify-center text-[#7CA982] animate-pulse">
            <Navigation className="w-4 h-4 fill-[#7CA982]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7CA982]">Active Safe Navigation</span>
            <h3 className="text-sm font-bold text-[#202D2D]">{route.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeechMuted(!speechMuted)}
            className="p-2 rounded-xl bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 text-[#65716F]"
            title={speechMuted ? 'Unmute Voice Guidance' : 'Mute Voice Guidance'}
          >
            {speechMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#7CA982]" />}
          </button>

          <button
            onClick={onEndTrip}
            className="p-2 rounded-xl bg-[#E57373]/10 hover:bg-[#E57373]/20 text-[#E57373]"
            title="End Navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Turn Direction Instruction */}
      <div className="bg-gradient-to-r from-[#F4F1EC] via-[#E7E3DD] to-[#F4F1EC] border border-[#2F5F5E]/15 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#24504F]/30 border border-[#2F5F5E] flex items-center justify-center text-[#2F5F5E] shrink-0 mt-0.5">
            <MapPin className="w-5 h-5 text-[#7CA982]" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-[#202D2D] leading-snug">{currentInstruction?.text}</h4>
            <div className="flex items-center gap-2 mt-2 text-xs text-[#7CA982]">
              <Shield className="w-3.5 h-3.5" />
              <span>Safe Landmark Ahead: {currentInstruction?.landmark}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs text-[#7A8582] mb-1">
          <span>Waypoint {currentCoordIndex + 1} of {totalSteps}</span>
          <span className="font-mono text-[#202D2D]">{progressPct}% completed</span>
        </div>
        <div className="w-full h-2 bg-[#E7E3DD] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7CA982] to-[#7CA982] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Trip Simulation Controls */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2F5F5E]/10">
        <button
          onClick={onStepNextCoord}
          disabled={currentCoordIndex >= totalSteps - 1}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#24504F] hover:bg-[#2F5F5E] disabled:opacity-40 text-[#202D2D] font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Next Step Along Route</span>
        </button>

        <button
          onClick={onSimulateDeviation}
          className="py-2.5 px-3 rounded-xl bg-[#F9C950]/10 hover:bg-[#F9C950]/20 border border-[#F9C950]/30 text-[#B08D28] font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-[#F9C950]" />
          <span>Simulate Off-Route</span>
        </button>

        <button
          onClick={handleArrivalClick}
          className="py-2.5 px-4 rounded-xl bg-[#2F5F5E] hover:bg-[#7CA982] text-[#202D2D] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#2F5F5E]/30"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Simulate Safe Arrival</span>
        </button>
      </div>
    </div>
  );
};
