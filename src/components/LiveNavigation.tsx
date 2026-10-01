import React, { useState, useEffect, useMemo } from 'react';
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

/**
 * Calculate compass heading (bearing in degrees) from coordinate A to coordinate B
 */
function calculateHeading(coord1: [number, number], coord2: [number, number]): string {
  const lat1 = (coord1[0] * Math.PI) / 180;
  const lat2 = (coord2[0] * Math.PI) / 180;
  const dLng = ((coord2[1] - coord1[1]) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  const deg = (bearing + 360) % 360;

  if (deg >= 337.5 || deg < 22.5) return 'north';
  if (deg >= 22.5 && deg < 67.5) return 'northeast';
  if (deg >= 67.5 && deg < 112.5) return 'east';
  if (deg >= 112.5 && deg < 157.5) return 'southeast';
  if (deg >= 157.5 && deg < 202.5) return 'south';
  if (deg >= 202.5 && deg < 247.5) return 'southwest';
  if (deg >= 247.5 && deg < 292.5) return 'west';
  return 'northwest';
}

/**
 * Calculate distance in meters between 2 coordinates (Haversine formula)
 */
function getDistanceMeters(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (coord1[0] * Math.PI) / 180;
  const phi2 = (coord2[0] * Math.PI) / 180;
  const deltaPhi = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const deltaLambda = ((coord2[1] - coord1[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
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

  // Extract real origin & destination names
  const { origName, destName } = useMemo(() => {
    let orig = route.originName?.split(',')[0].trim();
    let dest = route.destinationName?.split(',')[0].trim();

    if (!orig || !dest) {
      if (route.name.includes(' to ')) {
        const parts = route.name.split(' to ');
        orig = parts[0]?.trim();
        dest = parts[1]?.split('(')[0]?.trim();
      }
    }

    return {
      origName: orig || 'Starting Point',
      destName: dest || 'Destination',
    };
  }, [route]);

  // Compute dynamic turn-by-turn instruction based on real map coordinates & OSRM steps
  const currentInstruction = useMemo(() => {
    const currCoord = route.coordinates[currentCoordIndex];
    const nextCoord = route.coordinates[Math.min(currentCoordIndex + 1, totalSteps - 1)];

    // Compass heading
    const heading = currCoord && nextCoord ? calculateHeading(currCoord, nextCoord) : 'ahead';

    // Remaining distance calculation
    const remainingRatio = Math.max(0, 1 - currentCoordIndex / Math.max(1, totalSteps - 1));
    const distRemainingKm = (route.distanceKm * remainingRatio).toFixed(1);

    // Find closest safe landmark from the actual landmarks list
    let nearestLandmarkStr = '';
    if (currCoord && landmarks.length > 0) {
      let minDistance = Infinity;
      let closest: Landmark | null = null;
      landmarks.forEach((lm) => {
        const d = getDistanceMeters(currCoord, [lm.lat, lm.lng]);
        if (d < minDistance) {
          minDistance = d;
          closest = lm;
        }
      });

      if (closest && minDistance < 1500) {
        nearestLandmarkStr = `${(closest as Landmark).name} (~${Math.round(minDistance)}m)`;
      }
    }

    // 1. Starting Waypoint
    if (currentCoordIndex === 0) {
      return {
        text: `Departing from ${origName}. Head ${heading} toward ${destName}.`,
        landmark: nearestLandmarkStr || `Safe Departure Point • ${origName}`,
      };
    }

    // 2. Final Arrival Waypoint
    if (currentCoordIndex >= totalSteps - 1 || progressPct >= 100) {
      return {
        text: `Arriving at ${destName}. Safe arrival confirmed.`,
        landmark: `Safe Haven Hub • ${destName}`,
      };
    }

    // 3. Real OSRM Navigation Steps if available
    if (route.navigationSteps && route.navigationSteps.length > 0) {
      const stepIdx = Math.min(
        Math.floor((currentCoordIndex / totalSteps) * route.navigationSteps.length),
        route.navigationSteps.length - 1
      );
      const activeStep = route.navigationSteps[stepIdx];

      return {
        text: `${activeStep.instruction} (${distRemainingKm} km remaining to ${destName})`,
        landmark: nearestLandmarkStr || activeStep.landmark || `Illuminated Safe Corridor on ${activeStep.roadName}`,
      };
    }

    // 4. Dynamic Real Corridor Guidance
    return {
      text: `Continue ${heading} along illuminated corridor toward ${destName} (${distRemainingKm} km remaining).`,
      landmark: nearestLandmarkStr || `Illuminated Highway Corridor • Active 24/7 Monitoring`,
    };
  }, [route, currentCoordIndex, totalSteps, origName, destName, progressPct, landmarks]);

  // Speak guidance whenever instruction changes
  useEffect(() => {
    if (!speechMuted && currentInstruction?.text) {
      speakInstruction(`SafeSafar guidance: ${currentInstruction.text}`);
    }
  }, [currentCoordIndex, speechMuted, currentInstruction]);

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

        <div className="flex items-center gap-2 shrink-0">
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
