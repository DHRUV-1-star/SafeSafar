import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, Volume2, Grid, ShieldAlert, CheckCircle2, Delete, ChevronDown } from 'lucide-react';
import { startPhoneRingtone, stopPhoneRingtone, playSilentConfirmPing, playKeypadTone } from '../utils/audio';
import { VoiceTriggerDetector, speakInstruction } from '../utils/speech';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerCovertSOS: (details: { trigger: string; simulatedAudio: boolean }) => void;
  callerName?: string;
  callerNumber?: string;
}

interface DialpadKey {
  digit: string;
  sub: string;
}

const DIALPAD_KEYS: DialpadKey[] = [
  { digit: '1', sub: '' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*', sub: '' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: '' },
];

export const FakeCallModal: React.FC<FakeCallModalProps> = ({
  isOpen,
  onClose,
  onTriggerCovertSOS,
  callerName = 'Papa',
  callerNumber = '+91 87808 88428',
}) => {
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(false);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [dialedInput, setDialedInput] = useState<string>('');
  const [covertSOSDispatched, setCovertSOSDispatched] = useState<boolean>(false);
  const [voiceHeardKeyword, setVoiceHeardKeyword] = useState<string>('');
  const voiceDetectorRef = useRef<VoiceTriggerDetector | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCallState('incoming');
      setCallDuration(0);
      setIsMuted(false);
      setIsSpeaker(false);
      setShowKeypad(false);
      setDialedInput('');
      setCovertSOSDispatched(false);
      setVoiceHeardKeyword('');
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

  // Handle dialpad digit tap
  const handleKeyPress = (digit: string) => {
    playKeypadTone(digit);
    const nextInput = dialedInput + digit;
    setDialedInput(nextInput);

    // Check if user entered stealth trigger sequence #911
    if (nextInput.includes('#911')) {
      triggerSilentSOS('Stealth Keypad Trigger (#911)');
    }
  };

  const handleDeleteDigit = () => {
    setDialedInput((prev) => prev.slice(0, -1));
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Phone Screen Container */}
      <div className="relative w-full max-w-sm h-[680px] bg-gradient-to-b from-[#FFFFFF] via-[#FAF9F6] to-black rounded-[42px] border-4 border-[#C9C4BC] shadow-2xl flex flex-col justify-between p-6 text-[#202D2D] overflow-hidden select-none">
        
        {/* Dynamic Island / Status Bar */}
        <div className="flex justify-between items-center text-xs text-[#7A8582] px-4 pt-1">
          <span>9:41</span>
          <div className="w-24 h-4 bg-black rounded-full border border-[#E7E3DD] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#7CA982] animate-pulse"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-gray-400 rounded-sm p-0.5">
              <div className="w-full h-full bg-[#7CA982]"></div>
            </div>
          </div>
        </div>

        {/* Call In Progress or Keypad View */}
        {showKeypad && callState === 'connected' ? (
          /* IN-CALL DIALPAD VIEW */
          <div className="flex flex-col items-center flex-1 justify-between my-2 animate-in fade-in zoom-in-95 duration-150">
            {/* Top Dialpad Header */}
            <div className="flex flex-col items-center mt-1">
              <div className="flex items-center gap-1.5 text-xs text-[#7A8582]">
                <span>{callerName}</span>
                <span>•</span>
                <span className="font-mono text-[#7CA982]">{formatDuration(callDuration)}</span>
              </div>
              
              {/* Dialed string display */}
              <div className="h-10 flex items-center justify-center mt-2 px-4 w-full">
                <span className="text-2xl font-mono tracking-widest text-[#202D2D] truncate">
                  {dialedInput || <span className="text-[#B7B1A8] text-lg font-sans">Enter #911 for SOS</span>}
                </span>
              </div>
            </div>

            {/* 3x4 Dialpad Grid */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-3.5 w-full max-w-[260px] my-auto">
              {DIALPAD_KEYS.map(({ digit, sub }) => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#2F5F5E]/8 hover:bg-[#2F5F5E]/12 active:bg-white/30 text-[#202D2D] transition-all shadow-md active:scale-95 mx-auto"
                >
                  <span className="text-2xl font-normal leading-none">{digit}</span>
                  {sub && (
                    <span className="text-[9px] font-semibold tracking-wider text-[#7A8582] mt-0.5 leading-none">
                      {sub}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Dialpad Bottom Actions */}
            <div className="flex items-center justify-between w-full max-w-[260px] px-2 pt-2">
              <button
                onClick={() => setShowKeypad(false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E7E3DD]/90 hover:bg-[#D9D4CC] text-[#65716F] text-xs font-medium transition-all"
                title="Hide Keypad"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Hide</span>
              </button>

              <button
                onClick={handleDecline}
                className="w-14 h-14 rounded-full bg-[#D95C5C] hover:bg-[#B94747] flex items-center justify-center text-[#202D2D] shadow-lg shadow-[#D95C5C]/40 active:scale-95 transition-transform"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {dialedInput.length > 0 ? (
                <button
                  onClick={handleDeleteDigit}
                  className="p-2.5 rounded-full bg-[#E7E3DD]/90 hover:bg-[#D9D4CC] text-[#65716F] transition-all active:scale-90"
                  title="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-9" />
              )}
            </div>
          </div>
        ) : (
          /* STANDARD CALL VIEW (Incoming / Connected) */
          <>
            {/* Top Caller Info */}
            <div className="flex flex-col items-center mt-6 text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#24504F] to-[#7CA982] flex items-center justify-center text-3xl font-semibold shadow-xl border-2 border-[#2F5F5E]/20">
                  👨‍👧
                </div>
                {covertSOSDispatched && (
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7CA982] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-[#24504F] border-2 border-black items-center justify-center text-[10px]">
                      ✓
                    </span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#202D2D]">{callerName}</h2>
              <p className="text-sm text-[#7A8582] mt-1">{callerNumber}</p>
              <div className="mt-2 text-sm font-medium">
                {callState === 'incoming' && (
                  <span className="text-[#7CA982] animate-pulse">Incoming Call...</span>
                )}
                {callState === 'connected' && (
                  <span className="text-[#65716F] tracking-wider font-mono">{formatDuration(callDuration)}</span>
                )}
                {callState === 'ended' && <span className="text-[#E57373]">Call Ended</span>}
              </div>
            </div>

            {/* Center: In-Call Actions or Incoming prompt */}
            {callState === 'connected' ? (
              <div className="flex flex-col items-center gap-6 my-auto">
                {/* Native In-Call Control Grid */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
                  <button
                    onClick={handleMuteClick}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${
                      isMuted ? 'bg-white text-black' : 'bg-[#E7E3DD]/90 hover:bg-[#D9D4CC] text-[#202D2D]'
                    }`}
                  >
                    <Mic className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Mute</span>
                  </button>

                  <button
                    onClick={() => setIsSpeaker(!isSpeaker)}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${
                      isSpeaker ? 'bg-white text-black' : 'bg-[#E7E3DD]/90 hover:bg-[#D9D4CC] text-[#202D2D]'
                    }`}
                  >
                    <Volume2 className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Speaker</span>
                  </button>

                  <button
                    onClick={() => setShowKeypad(true)}
                    className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#E7E3DD]/90 hover:bg-[#D9D4CC] text-[#202D2D] transition-all active:scale-95"
                    title="Open In-Call Keypad"
                  >
                    <Grid className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Keypad</span>
                  </button>
                </div>

                {/* Secret Covert SOS Status Indicator (Discreet) */}
                {covertSOSDispatched ? (
                  <div className="w-full bg-[#1E3D3C]/60 border border-[#2F5F5E]/30 rounded-2xl p-3 text-left animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#2F5F5E]">
                      <CheckCircle2 className="w-4 h-4 text-[#7CA982]" />
                      <span>Covert SOS Active & Transmitting</span>
                    </div>
                    <p className="text-[11px] text-[#65716F] mt-1">
                      Live GPS, battery level & 30s background audio silently sent to Trusted Circle and Police Helpline 112. Disguise holds safely.
                    </p>
                    <div className="text-[10px] text-[#7CA982] font-mono mt-1">
                      Trigger: {voiceHeardKeyword}
                    </div>
                  </div>
                ) : (
                  <div className="text-center px-4">
                    <p className="text-xs text-[#7A8582] italic">
                      "Speak secret trigger <span className="text-[#2F5F5E] font-semibold">'reach soon'</span>, <span className="text-[#2F5F5E] font-semibold">'traffic'</span>, tap <span className="text-[#2F5F5E] font-semibold">Keypad (#911)</span>, or double-tap <span className="text-[#2F5F5E] font-semibold">Mute</span> to covertly alert your circle without alerting anyone nearby."
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto text-center px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2F5F5E]/10 border border-[#2F5F5E]/20 text-[#2F5F5E] text-xs mb-3">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Covert Fake Call Shield</span>
                </div>
                <p className="text-xs text-[#7A8582] leading-relaxed">
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
                      className="w-18 h-18 rounded-full bg-[#D95C5C] hover:bg-[#B94747] flex items-center justify-center text-[#202D2D] shadow-lg shadow-[#D95C5C]/40 active:scale-95 transition-transform"
                    >
                      <PhoneOff className="w-8 h-8" />
                    </button>
                    <span className="text-xs text-[#7A8582] mt-2 font-medium">Decline</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleAnswer}
                      className="w-18 h-18 rounded-full bg-[#2F5F5E] hover:bg-[#2F5F5E] flex items-center justify-center text-[#202D2D] shadow-lg shadow-[#2F5F5E]/40 active:scale-95 transition-transform animate-bounce"
                    >
                      <Phone className="w-8 h-8" />
                    </button>
                    <span className="text-xs text-[#7A8582] mt-2 font-medium">Accept</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <button
                    onClick={handleDecline}
                    className="w-18 h-18 rounded-full bg-[#D95C5C] hover:bg-[#B94747] flex items-center justify-center text-[#202D2D] shadow-lg shadow-[#D95C5C]/40 active:scale-95 transition-transform"
                  >
                    <PhoneOff className="w-8 h-8" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Home Indicator bar */}
        <div className="w-32 h-1 bg-gray-500/50 rounded-full mx-auto mt-2"></div>
      </div>
    </div>
  );
};
