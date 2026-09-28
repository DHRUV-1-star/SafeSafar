import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

interface DecoyScreenProps {
  onExitDecoy: () => void;
  duressSOSDispatched: boolean;
}

export const DecoyScreen: React.FC<DecoyScreenProps> = ({ onExitDecoy, duressSOSDispatched }) => {
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');

  const handleNum = (num: string) => {
    if (calcDisplay === '0') {
      setCalcDisplay(num);
    } else {
      setCalcDisplay(calcDisplay + num);
    }
  };

  const handleOp = (op: string) => {
    setEquation(`${calcDisplay} ${op} `);
    setCalcDisplay('0');
  };

  const handleClear = () => {
    setCalcDisplay('0');
    setEquation('');
  };

  const handleEqual = () => {
    try {
      const full = `${equation}${calcDisplay}`.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const res = Function(`'use strict'; return (${full})`)();
      setCalcDisplay(String(res));
      setEquation('');
    } catch {
      setCalcDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#121212] text-white flex flex-col justify-between p-6 select-none animate-in fade-in duration-150">
      {/* Decoy Header */}
      <div className="flex justify-between items-center pt-2">
        <div className="text-xs text-gray-500 font-mono">Standard Calculator</div>
        
        {/* Stealth exit trigger: tapping top right 3 times or explicit return */}
        <button
          onClick={onExitDecoy}
          className="text-xs text-gray-500/50 hover:text-gray-400 p-1 flex items-center gap-1"
          title="Return to SafeSafar"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Decoy</span>
        </button>
      </div>

      {/* Hidden Covert Status Banner (Very Subtle for the user's peace of mind) */}
      {duressSOSDispatched && (
        <div className="bg-purple-950/40 border border-purple-500/20 px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] text-purple-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
            Duress Distress Transmitting in Background
          </span>
          <span className="text-[10px] text-purple-400">GPS Live ✓</span>
        </div>
      )}

      {/* Calculator Display */}
      <div className="flex flex-col items-end justify-end px-4 py-6">
        <span className="text-sm text-gray-400 h-6 font-mono">{equation}</span>
        <span className="text-6xl font-light tracking-tight font-mono overflow-hidden text-right w-full">
          {calcDisplay}
        </span>
      </div>

      {/* Calculator Keypad */}
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto w-full pb-8">
        <button onClick={handleClear} className="h-16 rounded-full bg-gray-600 hover:bg-gray-500 text-xl font-medium">AC</button>
        <button onClick={() => setCalcDisplay((prev) => (Number(prev) * -1).toString())} className="h-16 rounded-full bg-gray-600 hover:bg-gray-500 text-xl font-medium">±</button>
        <button onClick={() => handleOp('%')} className="h-16 rounded-full bg-gray-600 hover:bg-gray-500 text-xl font-medium">%</button>
        <button onClick={() => handleOp('÷')} className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-2xl font-medium">÷</button>

        <button onClick={() => handleNum('7')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl">7</button>
        <button onClick={() => handleNum('8')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl">8</button>
        <button onClick={() => handleNum('9')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl">9</button>
        <button onClick={() => handleOp('×')} className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-2xl font-medium">×</button>

        <button onClick={() => handleNum('4')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl">4</button>
        <button onClick={() => handleNum('5')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl">5</button>
        <button onClick={() => handleNum('6')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl">6</button>
        <button onClick={() => handleOp('-')} className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-2xl font-medium">−</button>

        <button onClick={() => handleNum('1')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl">1</button>
        <button onClick={() => handleNum('2')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl">2</button>
        <button onClick={() => handleNum('3')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl">3</button>
        <button onClick={() => handleOp('+')} className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-2xl font-medium">+</button>

        <button onClick={() => handleNum('0')} className="col-span-2 h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl text-left pl-8">0</button>
        <button onClick={() => handleNum('.')} className="h-16 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-2xl font-medium">.</button>
        <button onClick={handleEqual} className="h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-2xl font-medium">=</button>
      </div>

      <div className="w-32 h-1 bg-gray-700/40 rounded-full mx-auto"></div>
    </div>
  );
};
