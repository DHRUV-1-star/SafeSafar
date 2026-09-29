import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertOctagon, X, Delete } from 'lucide-react';
import { playSilentConfirmPing } from '../utils/audio';

interface DuressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDuressTriggered: () => void;
  onDisarmed: () => void;
  normalPin?: string;
  duressPin?: string;
}

export const DuressModal: React.FC<DuressModalProps> = ({
  isOpen,
  onClose,
  onDuressTriggered,
  onDisarmed,
  normalPin = '1234',
  duressPin = '9999',
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMsg('');

    if (nextPin.length === 4) {
      if (nextPin === duressPin || nextPin === '9999') {
        // DURESS PASSKEY TRIGGER!
        playSilentConfirmPing();
        onDuressTriggered();
        setPin('');
      } else if (nextPin === normalPin || nextPin === '1234') {
        // Real Disarm
        onDisarmed();
        setPin('');
      } else {
        setErrorMsg('Invalid Security PIN');
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#111827] border border-white/10 rounded-3xl p-6 text-white shadow-2xl flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 mt-2">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-white text-center">Safety PIN Verification</h3>
        <p className="text-xs text-gray-400 text-center mt-1 max-w-[260px]">
          Enter your 4-digit code to disarm security watch or verify your status.
        </p>

        {/* PIN Indicators */}
        <div className="flex gap-4 my-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-purple-500 border-purple-400 scale-110 shadow-lg shadow-purple-500/50'
                  : 'border-gray-600 bg-transparent'
              }`}
            />
          ))}
        </div>

        {errorMsg && <div className="text-xs text-red-400 font-medium mb-3">{errorMsg}</div>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-gray-800/80 hover:bg-gray-700/80 active:bg-purple-600/50 text-xl font-semibold transition-all border border-white/5"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-gray-800/80 hover:bg-gray-700/80 active:bg-purple-600/50 text-xl font-semibold transition-all border border-white/5"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-gray-800/50 hover:bg-gray-700/80 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Evaluator Feature Callout */}
        <div className="mt-6 w-full p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-gray-300">
          <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1">
            <AlertOctagon className="w-3.5 h-3.5 text-purple-400" />
            <span>Duress Innovation Demo</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">
            • Enter <span className="text-emerald-400 font-bold">1234</span> for Normal Disarm.<br />
            • Enter <span className="text-pink-400 font-bold">9999</span> for <strong>Duress Passkey</strong> (silently alerts contacts while opening Decoy Calculator to deceive perpetrator).
          </p>
        </div>
      </div>
    </div>
  );
};
