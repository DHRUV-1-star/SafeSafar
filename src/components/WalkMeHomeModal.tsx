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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#202D2D]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-3xl p-6 text-[#202D2D] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7A8582] hover:text-[#202D2D] rounded-full bg-[#2F5F5E]/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#24504F] to-[#C85D67] flex items-center justify-center text-[#202D2D] shadow-lg shadow-[#24504F]/30">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#202D2D]">Walk Me Home Companion</h3>
            <p className="text-xs text-[#2F5F5E]">Continuous Guardian & Anomaly Watch</p>
          </div>
        </div>

        {/* Check-In Alert Overlay if active */}
        {activeCheckInPrompt ? (
          <div className="bg-[#6B5A24]/60 border-2 border-[#F9C950] rounded-2xl p-5 mb-5 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-[#F9C950] font-bold mb-1 text-sm">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>Routine Safety Check-In</span>
            </div>
            <p className="text-xs text-[#65716F] mb-3">
              Route check or stop detected. Confirm you are okay before the automatic SOS countdown expires.
            </p>

            <div className="text-4xl font-extrabold font-mono text-[#F9C950] my-2">
              00:{countdown.toString().padStart(2, '0')}
            </div>

            <button
              onClick={handleConfirmSafe}
              className="w-full mt-3 py-3 rounded-xl bg-[#2F5F5E] hover:bg-[#7CA982] text-[#202D2D] font-bold text-sm shadow-lg shadow-[#2F5F5E]/30"
            >
              ✓ Yes, I Am Safe
            </button>
          </div>
        ) : null}

        {/* Live Shared With Circle */}
        <div className="bg-[#F4F1EC]/90 border border-[#2F5F5E]/10 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center text-xs text-[#7A8582] mb-3">
            <span className="font-semibold text-[#202D2D]">Active Trusted Circle</span>
            <span className="text-[11px] text-[#7CA982] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7CA982] animate-ping"></span> Live Synced
            </span>
          </div>

          <div className="space-y-2.5">
            {trustedContacts.length === 0 ? (
              <div className="p-3 text-center bg-[#202D2D]/40 rounded-xl text-[#7A8582] text-xs border border-[#2F5F5E]/10">
                No guardians configured. Add guardians in Guardian Dashboard to enable live companion tracking.
              </div>
            ) : (
              trustedContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between text-xs bg-black/30 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <img src={contact.avatar} alt={contact.name} className="w-8 h-8 rounded-full object-cover border border-[#2F5F5E]/40" />
                    <div>
                      <div className="font-medium text-[#202D2D]">{contact.name}</div>
                      <div className="text-[10px] text-[#7A8582]">{contact.relation} • {contact.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#7CA982] font-medium">Tracking</span>
                    <div className="text-[9px] text-[#8A9491]">{contact.lastActive || 'Active'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Smart Safety Guard Features */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
          <div className="bg-[#2F5F5E]/5 rounded-2xl p-3 border border-[#2F5F5E]/10">
            <div className="flex items-center gap-1.5 text-[#2F5F5E] font-semibold mb-1">
              <Clock className="w-3.5 h-3.5 text-[#7CA982]" />
              <span>Interval Check-Ins</span>
            </div>
            <p className="text-[10px] text-[#7A8582] mb-2">Prompt me every {checkInMinutes} mins</p>
            <button
              onClick={handleTestCheckIn}
              className="text-[10px] text-[#2F5F5E] hover:text-[#F1D9D9] underline font-medium"
            >
              [Test Prompt Now]
            </button>
          </div>

          <div className="bg-[#2F5F5E]/5 rounded-2xl p-3 border border-[#2F5F5E]/10">
            <div className="flex items-center gap-1.5 text-[#2F5F5E] font-semibold mb-1">
              <BatteryCharging className="w-3.5 h-3.5 text-[#7CA982]" />
              <span>Battery Guard</span>
            </div>
            <p className="text-[10px] text-[#7A8582]">Current Battery: {batteryLevel}%</p>
            <span className="text-[9px] text-[#7A8582]">Auto-alerts circle if &lt;15%</span>
          </div>
        </div>

        {/* Departure Notification Confirmation */}
        <div className="p-3 bg-[#1E3D3C]/30 border border-[#2F5F5E]/20 rounded-2xl text-[11px] text-[#65716F] flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-[#7CA982] shrink-0" />
          <span>Automatic SMS alert will be broadcasted once you arrive safely at your destination.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[#24504F] hover:bg-[#2F5F5E] text-[#202D2D] font-semibold text-sm transition-all"
        >
          Keep Guardian Mode Active
        </button>
      </div>
    </div>
  );
};
