import React, { useState, useEffect } from 'react';
import { TrustedContact } from '../types';
import { ShieldCheck, HeartHandshake, BatteryCharging, Clock, AlertTriangle, CheckCircle2, UserCheck, X } from 'lucide-react';
import { speakInstruction } from '../utils/speech';

interface WalkMeHomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trustedContacts: TrustedContact[];
  onTriggerSOS: (reason: string) => void;
  batteryLevel: number;
}

export const WalkMeHomeModal: React.FC<WalkMeHomeModalProps> = ({
  isOpen,
  onClose,
  trustedContacts,
  onTriggerSOS,
  batteryLevel,
}) => {
  const [activeCheckInPrompt, setActiveCheckInPrompt] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);
  const [virtualCompanionEnabled, setVirtualCompanionEnabled] = useState<boolean>(true);
  const [checkInMinutes, setCheckInMinutes] = useState<number>(10);

  useEffect(() => {
    if (!isOpen) {
      setActiveCheckInPrompt(false);
      return;
    }
  }, [isOpen]);

  // Countdown timer when check-in prompt triggers
  useEffect(() => {
    let timer: number;
    if (activeCheckInPrompt && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (activeCheckInPrompt && countdown === 0) {
      // Countdown expired without response! Auto-escalate to SOS!
      onTriggerSOS('Walk Me Home check-in timed out (No response from user for 30s)');
      setActiveCheckInPrompt(false);
    }
    return () => clearInterval(timer);
  }, [activeCheckInPrompt, countdown, onTriggerSOS]);

  const handleTestCheckIn = () => {
    setCountdown(30);
    setActiveCheckInPrompt(true);
    speakInstruction('SafeSafar check-in: Are you safe? Please tap to confirm.');
  };

  const handleConfirmSafe = () => {
    setActiveCheckInPrompt(false);
    setCountdown(30);
    speakInstruction('Check in confirmed. Have a safe journey.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#111827] border border-white/10 rounded-3xl p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Walk Me Home Companion</h3>
            <p className="text-xs text-purple-300">Continuous Guardian & Anomaly Watch</p>
          </div>
        </div>

        {/* Check-In Alert Overlay if active */}
        {activeCheckInPrompt ? (
          <div className="bg-amber-950/60 border-2 border-amber-500 rounded-2xl p-5 mb-5 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold mb-1 text-sm">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>Routine Safety Check-In</span>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              Route check or stop detected. Confirm you are okay before the automatic SOS countdown expires.
            </p>

            <div className="text-4xl font-extrabold font-mono text-amber-400 my-2">
              00:{countdown.toString().padStart(2, '0')}
            </div>

            <button
              onClick={handleConfirmSafe}
              className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30"
            >
              ✓ Yes, I Am Safe
            </button>
          </div>
        ) : null}

        {/* Live Shared With Circle */}
        <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
            <span className="font-semibold text-white">Active Trusted Circle</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Synced
            </span>
          </div>

          <div className="space-y-2.5">
            {trustedContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between text-xs bg-black/30 p-2.5 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <img src={contact.avatar} alt={contact.name} className="w-8 h-8 rounded-full object-cover border border-purple-500/40" />
                  <div>
                    <div className="font-medium text-white">{contact.name}</div>
                    <div className="text-[10px] text-gray-400">{contact.relation} • {contact.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-medium">Tracking</span>
                  <div className="text-[9px] text-gray-500">{contact.lastActive}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Safety Guard Features */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Interval Check-Ins</span>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">Prompt me every {checkInMinutes} mins</p>
            <button
              onClick={handleTestCheckIn}
              className="text-[10px] text-purple-300 hover:text-purple-200 underline font-medium"
            >
              [Test Prompt Now]
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span>Battery Guard</span>
            </div>
            <p className="text-[10px] text-gray-400">Current Battery: {batteryLevel}%</p>
            <span className="text-[9px] text-gray-400">Auto-alerts circle if &lt;15%</span>
          </div>
        </div>

        {/* Departure Notification Confirmation */}
        <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-2xl text-[11px] text-gray-300 flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Automatic SMS alert will be broadcasted once you arrive safely at your destination.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
        >
          Keep Guardian Mode Active
        </button>
      </div>
    </div>
  );
};
