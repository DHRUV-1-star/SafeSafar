import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, Volume2, Grid, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { startPhoneRingtone, stopPhoneRingtone, playSilentConfirmPing } from '../utils/audio';
import { VoiceTriggerDetector, speakInstruction } from '../utils/speech';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerCovertSOS: (details: { trigger: string; simulatedAudio: boolean }) => void;
  callerName?: string;
  callerNumber?: string;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({
  isOpen,
  onClose,
  onTriggerCovertSOS,
  callerName = 'Papa (Rajesh Gohil)',
  callerNumber = '+91 87808 88428',
}) => {
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(false);
  const [covertSOSDispatched, setCovertSOSDispatched] = useState<boolean>(false);
  const [voiceHeardKeyword, setVoiceHeardKeyword] = useState<string>('');
  const [showStealthGuide, setShowStealthGuide] = useState<boolean>(false);
  const voiceDetectorRef = useRef<VoiceTriggerDetector | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCallState('incoming');
      setCallDuration(0);
      setCovertSOSDispatched(false);
      setVoiceHeardKeyword('');
      setShowStealthGuide(false);
      startPhoneRingtone();
    } else {
      stopPhoneRingtone();
      if (voiceDetectorRef.current) {
        voiceDetectorRef.current.stop();
      }
    }

    return () => {
      stopPhoneRingtone();
      if (voiceDetectorRef.current) {
        voiceDetectorRef.current.stop();
      }
    };
  }, [isOpen]);

  // Duration counter when connected
  useEffect(() => {
    let timer: number;
    if (callState === 'connected') {
      timer = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Handle answering call
  const handleAnswer = () => {
    stopPhoneRingtone();
    setCallState('connected');

    // Simulate caller voice
    setTimeout(() => {
      speakInstruction('Beta, where are you? Reach soon, I will come to the main road gate.');
    }, 800);

    // Initialize voice trigger detector
    voiceDetectorRef.current = new VoiceTriggerDetector((keyword) => {
      triggerSilentSOS(`Voice phrase detected: "${keyword}"`);
    });
    voiceDetectorRef.current.start();
  };

  const handleDecline = () => {
    stopPhoneRingtone();
    if (voiceDetectorRef.current) {
      voiceDetectorRef.current.stop();
    }
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const triggerSilentSOS = (reason: string) => {
    if (covertSOSDispatched) return;
    setCovertSOSDispatched(true);
    setVoiceHeardKeyword(reason);
    playSilentConfirmPing();
    onTriggerCovertSOS({ trigger: reason, simulatedAudio: true });
  };

  // Stealth double-click trigger on Mute button
  const muteClickCount = useRef(0);
  const handleMuteClick = () => {
    setIsMuted(!isMuted);
    muteClickCount.current += 1;
    if (muteClickCount.current >= 2) {
      triggerSilentSOS('Covert double-tap on Mute button');
      muteClickCount.current = 0;
    }
    setTimeout(() => {
      muteClickCount.current = 0;
    }, 1500);
  };

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Phone Screen Container */}
      <div className="relative w-full max-w-sm h-[680px] bg-gradient-to-b from-[#111827] via-[#0B0F19] to-black rounded-[42px] border-4 border-[#374151] shadow-2xl flex flex-col justify-between p-6 text-white overflow-hidden select-none">
        
        {/* Dynamic Island / Speaker cutout */}
        <div className="flex justify-between items-center text-xs text-gray-400 px-4 pt-1">
          <span>9:41</span>
          <div className="w-24 h-4 bg-black rounded-full border border-gray-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-gray-400 rounded-sm p-0.5">
              <div className="w-full h-full bg-emerald-400"></div>
            </div>
          </div>
        </div>

        {/* Top Caller Info */}
        <div className="flex flex-col items-center mt-6 text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-3xl font-semibold shadow-xl border-2 border-white/20">
              👨‍👧
            </div>
            {covertSOSDispatched && (
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-purple-600 border-2 border-black items-center justify-center text-[10px]">
                  ✓
                </span>
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{callerName}</h2>
          <p className="text-sm text-gray-400 mt-1">{callerNumber}</p>
          <div className="mt-2 text-sm font-medium">
            {callState === 'incoming' && (
              <span className="text-emerald-400 animate-pulse">Incoming Call...</span>
            )}
            {callState === 'connected' && (
              <span className="text-gray-300 tracking-wider font-mono">{formatDuration(callDuration)}</span>
            )}
            {callState === 'ended' && <span className="text-red-400">Call Ended</span>}
          </div>
        </div>

        {/* Center: In-Call Dialpad & Actions or Incoming prompt */}
        {callState === 'connected' ? (
          <div className="flex flex-col items-center gap-6 my-auto">
            {/* Native In-Call Control Grid */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
              <button
                onClick={handleMuteClick}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${
                  isMuted ? 'bg-white text-black' : 'bg-gray-800/80 hover:bg-gray-700 text-white'
                }`}
              >
                <Mic className="w-6 h-6" />
                <span className="text-[10px] mt-1">Mute</span>
              </button>

              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${
                  isSpeaker ? 'bg-white text-black' : 'bg-gray-800/80 hover:bg-gray-700 text-white'
                }`}
              >
                <Volume2 className="w-6 h-6" />
                <span className="text-[10px] mt-1">Speaker</span>
              </button>

              <button
                onClick={() => triggerSilentSOS('Stealth Keypad Trigger (#911)')}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white"
              >
                <Grid className="w-6 h-6" />
                <span className="text-[10px] mt-1">Keypad</span>
              </button>
            </div>

            {/* Secret Covert SOS Status Indicator (Discreet) */}
            {covertSOSDispatched ? (
              <div className="w-full bg-purple-950/60 border border-purple-500/30 rounded-2xl p-3 text-left animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>Covert SOS Active & Transmitting</span>
                </div>
                <p className="text-[11px] text-gray-300 mt-1">
                  Live GPS, battery level & 30s background audio silently sent to Trusted Circle and Police Helpline 112. Disguise holds safely.
                </p>
                <div className="text-[10px] text-purple-400 font-mono mt-1">
                  Trigger: {voiceHeardKeyword}
                </div>
              </div>
            ) : (
              <div className="text-center px-4">
                <p className="text-xs text-gray-400 italic">
                  "Speak secret trigger <span className="text-purple-300 font-semibold">'reach soon'</span>, <span className="text-purple-300 font-semibold">'traffic'</span> or double-tap <span className="text-purple-300 font-semibold">Mute</span> to covertly alert your circle without alerting anyone nearby."
                </p>
                <button
                  onClick={() => triggerSilentSOS('Manual Discreet Stealth Button')}
                  className="mt-2 text-[11px] text-purple-400/80 hover:text-purple-300 underline underline-offset-2"
                >
                  [Demo: Silent Trigger Now]
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="my-auto text-center px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Covert Fake Call Shield</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Looks and sounds identical to a real incoming call. Anyone standing next to you will believe you are talking to family.
            </p>
          </div>
        )}

        {/* Bottom Actions: Incoming Swipe or Red Hangup */}
        <div className="pb-4">
          {callState === 'incoming' ? (
            <div className="flex justify-around items-center px-6">
              <div className="flex flex-col items-center">
                <button
                  onClick={handleDecline}
                  className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/40 active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-8 h-8" />
                </button>
                <span className="text-xs text-gray-400 mt-2 font-medium">Decline</span>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={handleAnswer}
                  className="w-18 h-18 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/40 active:scale-95 transition-transform animate-bounce"
                >
                  <Phone className="w-8 h-8" />
                </button>
                <span className="text-xs text-gray-400 mt-2 font-medium">Accept</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <button
                onClick={handleDecline}
                className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg shadow-red-600/40 active:scale-95 transition-transform"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
            </div>
          )}
        </div>

        {/* Home Indicator bar */}
        <div className="w-32 h-1 bg-gray-500/50 rounded-full mx-auto mt-2"></div>
      </div>
    </div>
  );
};
