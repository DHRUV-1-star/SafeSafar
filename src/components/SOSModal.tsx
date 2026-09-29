import React, { useState, useEffect } from 'react';
import { AlertTriangle, PhoneCall, Volume2, VolumeX, Shield, CheckCircle2, MessageSquare, Radio, X, Power } from 'lucide-react';
import { ActiveSOSState, TrustedContact } from '../types';
import { startSiren, stopSiren } from '../utils/audio';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisarm: () => void;
  sosState: ActiveSOSState;
  trustedContacts: TrustedContact[];
  onDisarmClick: () => void;
  isOfflineMode: boolean;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  onDisarm,
  sosState,
  trustedContacts,
  onDisarmClick,
  isOfflineMode,
}) => {
  const [abortCountdown, setAbortCountdown] = useState<number>(3);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [sirenAudible, setSirenAudible] = useState<boolean>(false);
  const [smsSentNotice, setSmsSentNotice] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsCountingDown(true);
      setAbortCountdown(3);
      setSirenAudible(!sosState.isSilent);
    } else {
      stopSiren();
    }
    return () => {
      stopSiren();
    };
  }, [isOpen, sosState.isSilent]);

  // Abort Countdown
  useEffect(() => {
    if (!isOpen || !isCountingDown) return;

    if (abortCountdown > 0) {
      const timer = setTimeout(() => {
        setAbortCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCountingDown(false);
      setSmsSentNotice(true);
      if (sirenAudible) {
        startSiren();
      }
    }
  }, [isOpen, isCountingDown, abortCountdown, sirenAudible]);

  const toggleSiren = () => {
    if (sirenAudible) {
      stopSiren();
      setSirenAudible(false);
    } else {
      startSiren();
      setSirenAudible(true);
    }
  };

  const handleTurnOffSOS = () => {
    stopSiren();
    onDisarm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#160d14] border-2 border-red-500/50 rounded-3xl p-6 text-white shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Close & Disarm X button */}
        <button
          onClick={handleTurnOffSOS}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
          title="Turn Off SOS / Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glowing emergency backdrop halo */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Abort Stage */}
        {isCountingDown ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-30"></span>
              <div className="w-24 h-24 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-4xl font-bold font-mono text-red-400">
                {abortCountdown}
              </div>
            </div>

            <h3 className="text-2xl font-black text-red-500 tracking-wide uppercase">Emergency SOS Triggered</h3>
            <p className="text-sm text-gray-300 mt-2 max-w-xs">
              Sending real-time live distress beacon with GPS coordinates to your Trusted Circle in {abortCountdown}s...
            </p>

            <button
              onClick={handleTurnOffSOS}
              className="mt-8 px-8 py-3.5 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-300 font-semibold text-sm border border-red-500/50 active:scale-95 transition-transform flex items-center gap-2"
            >
              <Power className="w-4 h-4" />
              <span>Cancel / Stand Down SOS</span>
            </button>
          </div>
        ) : (
          /* Active SOS Active Dispatch Screen */
          <div className="w-full flex flex-col items-center">
            {/* Header */}
            <div className="flex items-center justify-between w-full pb-3 border-b border-white/10 pr-8">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  {sosState.duressActive ? 'Covert Duress Distress Active' : 'Live Distress Beacon Active'}
                </span>
              </div>

              <div className="text-[11px] font-mono text-gray-400">
                Battery: {sosState.batteryLevel}% • {isOfflineMode ? '2G SMS Relay' : '5G Cloud'}
              </div>
            </div>

            {/* Pulsing Siren / Distress Orb */}
            <div className="my-5 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-red-400 animate-sos-strobe">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <p className="text-xs text-red-300 mt-2 font-medium">
                Trigger: {sosState.triggerSource.replace('_', ' ').toUpperCase()}
              </p>
            </div>

            {/* Live Broadcast Status to Contacts */}
            <div className="w-full bg-gray-900/80 border border-white/10 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Broadcasting Live Telemetry
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">LAT: 21.1663 | LNG: 72.7832</span>
              </div>

              <div className="space-y-2 mt-2">
                {trustedContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between text-xs bg-black/40 px-3 py-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <img src={contact.avatar} alt={contact.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <div className="font-medium text-white">{contact.name}</div>
                        <div className="text-[10px] text-gray-400">{contact.phone}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Dispatched
                    </span>
                  </div>
                ))}
              </div>

              {/* 2G SMS Payload Preview */}
              {isOfflineMode && (
                <div className="mt-3 p-2 bg-yellow-950/40 border border-yellow-500/20 rounded-xl text-[11px] text-yellow-300">
                  <div className="font-semibold flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-yellow-400" />
                    <span>SMS / Bluetooth-Mesh Fallback Payload</span>
                  </div>
                  <p className="font-mono text-[10px] text-gray-300 mt-1">
                    "SOS! SafeSafar Alert: Lat 21.1663, Long 72.7832, SVNIT Dumas Rd. Battery: 88%. Audio recording logged. Track: https://safesafar.app/t/x9a"
                  </p>
                </div>
              )}
            </div>

            {/* Quick Emergency Helplines */}
            <div className="grid grid-cols-3 gap-2 w-full mb-4">
              <a
                href="tel:112"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-center transition-all"
              >
                <PhoneCall className="w-4 h-4 text-red-400 mb-1" />
                <span className="text-xs font-bold">112</span>
                <span className="text-[9px] text-gray-400">Police / SOS</span>
              </a>

              <a
                href="tel:1091"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-center transition-all"
              >
                <Shield className="w-4 h-4 text-purple-400 mb-1" />
                <span className="text-xs font-bold">1091</span>
                <span className="text-[9px] text-gray-400">Women Helpline</span>
              </a>

              <button
                onClick={toggleSiren}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                  sirenAudible
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                    : 'bg-gray-800/40 border-white/10 text-gray-300'
                }`}
              >
                {sirenAudible ? <Volume2 className="w-4 h-4 mb-1 text-amber-400 animate-bounce" /> : <VolumeX className="w-4 h-4 mb-1" />}
                <span className="text-xs font-bold">{sirenAudible ? 'Siren On' : 'Silent SOS'}</span>
                <span className="text-[9px] text-gray-400">{sirenAudible ? 'Tap to Mute' : 'Tap to Sound'}</span>
              </button>
            </div>

            {/* Turn Off / Disarm Controls */}
            <div className="w-full space-y-2">
              <button
                onClick={handleTurnOffSOS}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Power className="w-4 h-4" />
                <span>Turn Off SOS / Stand Down Alert</span>
              </button>

              <button
                onClick={onDisarmClick}
                className="w-full py-2.5 rounded-2xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-medium text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Disarm with Security PIN (1234 / 9999)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
