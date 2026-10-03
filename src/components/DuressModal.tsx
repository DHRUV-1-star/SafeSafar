import React, { useState } from 'react';
import { Lock, X, Delete } from 'lucide-react';
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
      if (nextPin === duressPin) {
        // DURESS PASSKEY TRIGGER!
        playSilentConfirmPing();
        onDuressTriggered();
        setPin('');
      } else if (nextPin === normalPin) {
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#202D2D]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-3xl p-6 text-[#202D2D] shadow-2xl flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7A8582] hover:text-[#202D2D] rounded-full bg-[#2F5F5E]/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[#2F5F5E]/10 border border-[#2F5F5E]/30 flex items-center justify-center text-[#7CA982] mb-3 mt-2">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-[#202D2D] text-center">Safety PIN Verification</h3>
        <p className="text-xs text-[#7A8582] text-center mt-1 max-w-[260px]">
          Enter your 4-digit code to disarm security watch or verify your status.
        </p>

        {/* PIN Indicators */}
        <div className="flex gap-4 my-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-[#2F5F5E] border-[#7CA982] scale-110 shadow-lg shadow-[#2F5F5E]/50'
                  : 'border-[#B7B1A8] bg-transparent'
              }`}
            />
          ))}
        </div>

        {errorMsg && <div className="text-xs text-[#E57373] font-medium mb-3">{errorMsg}</div>}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-[#E7E3DD]/90 hover:bg-[#D9D4CC]/90 active:bg-[#24504F]/50 text-xl font-semibold transition-all border border-[#2F5F5E]/10"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#E7E3DD]/90 hover:bg-[#D9D4CC]/90 active:bg-[#24504F]/50 text-xl font-semibold transition-all border border-[#2F5F5E]/10"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-[#E7E3DD]/75 hover:bg-[#D9D4CC]/90 flex items-center justify-center text-[#7A8582] hover:text-[#202D2D] transition-all border border-[#2F5F5E]/10"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
