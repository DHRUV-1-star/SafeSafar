import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PhoneCall, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  Shield, 
  CheckCircle2, 
  MessageSquare, 
  RefreshCw, 
  Clock, 
  AlertOctagon, 
  Check, 
  ExternalLink
} from 'lucide-react';
import { ActiveSOSState, TrustedContact } from '../types';
import { 
  startSiren, 
  stopSiren, 
  startPhoneRingtone, 
  stopPhoneRingtone, 
  playCallConnectedPing, 
  playEscalationBeep 
} from '../utils/audio';
import { UserAvatar } from './UserAvatar';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  sosState: ActiveSOSState;
  trustedContacts: TrustedContact[];
  onDisarmClick: () => void;
  isOfflineMode: boolean;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  sosState,
  trustedContacts,
  onDisarmClick,
  isOfflineMode,
}) => {
  // Abort Countdown Stage
  const [abortCountdown, setAbortCountdown] = useState<number>(3);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [sirenAudible, setSirenAudible] = useState<boolean>(false);

  // Fallback contacts if user contacts array is empty
  const sortedContacts: TrustedContact[] = useMemo(() => {
    if (!trustedContacts || trustedContacts.length === 0) {
      return [
        {
          id: 'tc-fallback-1',
          name: 'Sushila Patel',
          relation: 'Mother',
          phone: '+91 98790 12345',
          isEmergencyAlert: true,
          isPrimary: true,
          avatar: '',
          batteryStatus: 88,
        },
        {
          id: 'tc-fallback-2',
          name: 'Rajesh Patel',
          relation: 'Father',
          phone: '+91 87808 88428',
          isEmergencyAlert: true,
          isPrimary: false,
          avatar: '',
          batteryStatus: 72,
        },
        {
          id: 'tc-fallback-3',
          name: 'Ananya Sharma',
          relation: 'Roommate',
          phone: '+91 94281 99887',
          isEmergencyAlert: true,
          isPrimary: false,
          avatar: '',
          batteryStatus: 94,
        },
      ];
    }
    // Sort: Primary contact first, followed by others in order
    const primary = trustedContacts.filter((c) => c.isPrimary);
    const others = trustedContacts.filter((c) => !c.isPrimary);
    if (primary.length === 0) {
      return trustedContacts.map((c, idx) => (idx === 0 ? { ...c, isPrimary: true } : c));
    }
    return [...primary, ...others];
  }, [trustedContacts]);

  // Escalation Call Engine States
  const [currentCallIndex, setCurrentCallIndex] = useState<number>(0);
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'unanswered' | 'all_exhausted'>('calling');
  const [ringCountdown, setRingCountdown] = useState<number>(16);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [contactCallHistory, setContactCallHistory] = useState<Record<string, 'pending' | 'calling' | 'answered' | 'unanswered'>>({});

  // Reset & Initialize on Open
  useEffect(() => {
    if (isOpen) {
      setIsCountingDown(true);
      setAbortCountdown(3);
      setSirenAudible(!sosState.isSilent);
      setCurrentCallIndex(0);
      setCallStatus('calling');
      setRingCountdown(16);
      setCallDuration(0);
      setContactCallHistory({});
    } else {
      stopSiren();
      stopPhoneRingtone();
    }
    return () => {
      stopSiren();
      stopPhoneRingtone();
    };
  }, [isOpen, sosState.isSilent]);

  // Abort Countdown Timer
  useEffect(() => {
    if (!isOpen || !isCountingDown) return;

    if (abortCountdown > 0) {
      const timer = setTimeout(() => {
        setAbortCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCountingDown(false);
      if (sirenAudible) {
        startSiren();
      }
    }
  }, [isOpen, isCountingDown, abortCountdown, sirenAudible]);

  // Escalation Handlers
  const handleContactDidNotAnswer = useCallback(() => {
    stopPhoneRingtone();
    playEscalationBeep();

    const contact = sortedContacts[currentCallIndex];
    if (contact) {
      setContactCallHistory((prev) => ({
        ...prev,
        [contact.id]: 'unanswered',
      }));
    }

    if (currentCallIndex + 1 < sortedContacts.length) {
      // ESCALATE to next contact
      const nextIndex = currentCallIndex + 1;
      setCurrentCallIndex(nextIndex);
      setCallStatus('calling');
      setRingCountdown(16);
    } else {
      // All contacts exhausted
      setCallStatus('all_exhausted');
    }
  }, [currentCallIndex, sortedContacts]);

  // Ringing countdown & Auto-escalation timer
  useEffect(() => {
    if (!isOpen || isCountingDown) return;

    if (callStatus === 'calling') {
      if (!sosState.isSilent) {
        startPhoneRingtone();
      }

      const timer = setInterval(() => {
        setRingCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleContactDidNotAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        stopPhoneRingtone();
      };
    } else {
      stopPhoneRingtone();
    }
  }, [isOpen, isCountingDown, callStatus, currentCallIndex, sosState.isSilent, sortedContacts, handleContactDidNotAnswer]);

  // Connected Call Duration Timer
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus]);

  const handleContactAnswered = () => {
    stopPhoneRingtone();
    playCallConnectedPing();

    const contact = sortedContacts[currentCallIndex];
    if (contact) {
      setContactCallHistory((prev) => ({
        ...prev,
        [contact.id]: 'answered',
      }));
    }

    // STOP ESCALATION
    setCallStatus('connected');
    setCallDuration(0);
  };

  const handleEndCall = () => {
    stopPhoneRingtone();
    const contact = sortedContacts[currentCallIndex];
    if (contact) {
      setContactCallHistory((prev) => ({
        ...prev,
        [contact.id]: 'unanswered',
      }));
    }
    // If more contacts remain, advance; otherwise set exhausted
    if (currentCallIndex + 1 < sortedContacts.length) {
      setCurrentCallIndex(currentCallIndex + 1);
      setCallStatus('calling');
      setRingCountdown(16);
    } else {
      setCallStatus('all_exhausted');
    }
  };

  const handleRestartEscalation = () => {
    setCurrentCallIndex(0);
    setCallStatus('calling');
    setRingCountdown(16);
    setCallDuration(0);
    setContactCallHistory({});
  };

  const toggleSiren = () => {
    if (sirenAudible) {
      stopSiren();
      setSirenAudible(false);
    } else {
      startSiren();
      setSirenAudible(true);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const currentTargetContact = sortedContacts[currentCallIndex] || sortedContacts[0];
  const isPrimaryTarget = currentCallIndex === 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-lg p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#150d14] border-2 border-red-500/50 rounded-3xl p-5 sm:p-6 text-white shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Emergency Glow Highlights */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* ========================================================= */}
        {/* STAGE 1: ABORT / CANCEL COUNTDOWN (3s Window)             */}
        {/* ========================================================= */}
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
              Broadcasting distress alert to all contacts and starting call escalation in {abortCountdown}s...
            </p>

            <button
              onClick={onClose}
              className="mt-8 px-8 py-3.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm border border-white/20 active:scale-95 transition-transform"
            >
              Cancel / False Alarm
            </button>
          </div>
        ) : (
          /* ========================================================= */
          /* STAGE 2: ACTIVE SOS & AUTOMATED CALL ESCALATION           */
          /* ========================================================= */
          <div className="w-full flex flex-col space-y-4 overflow-y-auto pr-1">
            
            {/* Header: Status Bar */}
            <div className="flex items-center justify-between w-full pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  {sosState.duressActive ? 'Covert Duress Distress Active' : 'Live Distress Beacon Active'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSiren}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                    sirenAudible
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                  title={sirenAudible ? 'Mute Siren' : 'Enable Siren'}
                >
                  {sirenAudible ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Siren On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Muted</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] font-mono text-gray-400">
                  {sosState.batteryLevel}% • {isOfflineMode ? '2G SMS' : '5G Cloud'}
                </span>
              </div>
            </div>

            {/* Step 1: Alert / Message Sent to ALL Trusted Contacts */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Alert & Live GPS Beacon Sent to ALL ({sortedContacts.length}) Contacts</span>
                </div>
                <span className="text-[10px] text-emerald-300 font-mono">BROADCASTED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {sortedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <UserAvatar name={contact.name} avatar={contact.avatar} size="xs" />
                      <div className="truncate">
                        <div className="font-semibold text-white truncate">{contact.name}</div>
                        <div className="text-[9px] text-gray-400">{contact.relation}{contact.isPrimary ? ' (Primary)' : ''}</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-emerald-400 shrink-0 font-medium">✓ Sent</span>
                  </div>
                ))}
              </div>

              {isOfflineMode && (
                <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center gap-1.5 text-[10px] text-yellow-300">
                  <MessageSquare className="w-3 h-3 text-yellow-400 shrink-0" />
                  <span>2G Mesh SMS Relay Dispatched with GPS (21.1663, 72.7832)</span>
                </div>
              )}
            </div>

            {/* Step 2: Live Sequential Call Escalation Card */}
            <div className="bg-[#1D121B] border-2 border-purple-500/40 rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-xl">
              
              {/* Card Header & Escalation Level */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    {callStatus === 'connected' ? (
                      'Call Connected • Escalation Halted'
                    ) : callStatus === 'all_exhausted' ? (
                      'All Contacts Unreachable • Emergency Helplines'
                    ) : isPrimaryTarget ? (
                      'Call Stage 1: Calling Primary Contact'
                    ) : (
                      `Call Stage ${currentCallIndex + 1}: Escalated Contact`
                    )}
                  </span>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                  Contact {currentCallIndex + 1} of {sortedContacts.length}
                </span>
              </div>

              {/* ACTIVE CALLING STATE */}
              {callStatus === 'calling' && (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                    <div className="p-1 rounded-full ring-4 ring-purple-500/40 relative">
                      <UserAvatar name={currentTargetContact.name} avatar={currentTargetContact.avatar} size="xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg animate-bounce">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <h4 className="text-lg font-bold text-white">{currentTargetContact.name}</h4>
                      {isPrimaryTarget && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 font-mono mt-0.5">
                      {currentTargetContact.relation} • {currentTargetContact.phone}
                    </p>
                  </div>

                  {/* Ring Countdown Progress */}
                  <div className="w-full bg-black/40 rounded-xl p-3 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                        Ringing... Auto-escalating if unanswered:
                      </span>
                      <span className="font-mono font-bold text-amber-400 text-sm">{ringCountdown}s</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-amber-400 h-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(ringCountdown / 16) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Escalation Control Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
                    <button
                      type="button"
                      onClick={handleContactAnswered}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Answers (Stop Escalation)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleContactDidNotAnswer}
                      className="py-3 px-4 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>Doesn't Answer (Call Next)</span>
                    </button>
                  </div>

                  {/* Real Phone Dialer Link */}
                  <a
                    href={`tel:${currentTargetContact.phone.replace(/\s+/g, '')}`}
                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors underline decoration-dotted"
                  >
                    <span>Dial via native mobile phone app</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* CONNECTED CALL STATE */}
              {callStatus === 'connected' && (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <div className="p-1 rounded-full ring-4 ring-emerald-500/60">
                      <UserAvatar name={currentTargetContact.name} avatar={currentTargetContact.avatar} size="xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white">{currentTargetContact.name}</h4>
                    <p className="text-xs text-emerald-400 font-medium">
                      Connected • {currentTargetContact.relation} ({currentTargetContact.phone})
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl w-full">
                    <div className="text-xs text-gray-300 font-medium">
                      🛡️ <span className="font-bold text-emerald-300">Escalation Halted:</span> You are currently in direct contact with your trusted circle.
                    </div>
                    <div className="font-mono text-xl font-bold text-emerald-400 mt-1">
                      ⏱ {formatDuration(callDuration)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Active Call</span>
                  </button>
                </div>
              )}

              {/* ALL CONTACTS EXHAUSTED STATE */}
              {callStatus === 'all_exhausted' && (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-red-400">
                    <AlertOctagon className="w-8 h-8 text-red-400 animate-pulse" />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-red-400">All Trusted Contacts Unreachable</h4>
                    <p className="text-xs text-gray-300 mt-1 max-w-xs">
                      None of your {sortedContacts.length} trusted contacts answered. Escalating automatically to emergency response authorities.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
                    <a
                      href="tel:112"
                      className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call 112 (Police)</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleRestartEscalation}
                      className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restart Cycle</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Visual Escalation Flow Chart */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 text-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
                SOS Escalation Pipeline
              </span>

              <div className="space-y-2">
                {/* Broadcast to All Contacts */}
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="font-medium text-white">Alert broadcast to ALL contacts</span>
                  <span className="text-[10px] text-emerald-400 font-mono ml-auto">Delivered</span>
                </div>

                {/* Contacts in Sequential Flow */}
                {sortedContacts.map((contact, idx) => {
                  const isCurrent = currentCallIndex === idx && callStatus === 'calling';
                  const isAnswered = contactCallHistory[contact.id] === 'answered';
                  const isUnanswered = contactCallHistory[contact.id] === 'unanswered';
                  const isPending = !isCurrent && !isAnswered && !isUnanswered;

                  return (
                    <div key={contact.id} className="flex items-center gap-2.5 pl-2 border-l border-white/10 ml-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isAnswered
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isCurrent
                            ? 'bg-purple-600 text-white animate-pulse'
                            : isUnanswered
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {isAnswered ? '✓' : isUnanswered ? '✕' : idx + 1}
                      </span>

                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`font-medium ${isCurrent ? 'text-purple-300 font-bold' : isAnswered ? 'text-emerald-300' : 'text-gray-300'}`}>
                          {contact.name}
                        </span>
                        <span className="text-[10px] text-gray-500">({contact.relation}{contact.isPrimary ? ' - Primary' : ''})</span>
                      </div>

                      <span className="text-[10px] font-mono ml-auto shrink-0">
                        {isAnswered && <span className="text-emerald-400">Answered (Escalation Halted)</span>}
                        {isCurrent && <span className="text-purple-400 font-bold">Calling now...</span>}
                        {isUnanswered && <span className="text-rose-400">No Answer (Escalated)</span>}
                        {isPending && <span className="text-gray-500">Standby</span>}
                      </span>
                    </div>
                  );
                })}

                {/* Final Tier: Emergency Authorities */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-white/10 ml-2.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      callStatus === 'all_exhausted'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    🚨
                  </span>
                  <span className="font-medium text-gray-300">Emergency Services (112 Police Dispatch)</span>
                  <span className="text-[10px] font-mono ml-auto text-gray-500">
                    {callStatus === 'all_exhausted' ? 'Active Target' : 'Fallback'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Emergency Helplines */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <a
                href="tel:112"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all"
              >
                <PhoneCall className="w-4 h-4 text-red-400 shrink-0" />
                <span>Call 112 (Police Dispatch)</span>
              </a>

              <a
                href="tel:1091"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all"
              >
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Call 1091 (Women Helpline)</span>
              </a>
            </div>

            {/* Disarm SOS Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onDisarmClick}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-semibold text-xs border border-white/10 shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Disarm SOS with Security PIN</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
