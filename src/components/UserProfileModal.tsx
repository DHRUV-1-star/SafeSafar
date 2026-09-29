import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  KeyRound, 
  Copy, 
  Check, 
  LogOut, 
  Users, 
  Building2, 
  Smartphone
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onSwitchRole,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [normalPin, setNormalPin] = useState(currentUser.normalPin);
  const [duressPin, setDuressPin] = useState(currentUser.duressPin);
  const [isEditingPins, setIsEditingPins] = useState(false);
  const [pinSavedToast, setPinSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleCopyPairingCode = () => {
    navigator.clipboard.writeText(currentUser.guardianPairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSavePins = () => {
    onUpdateUser({
      ...currentUser,
      normalPin,
      duressPin,
    });
    setIsEditingPins(false);
    setPinSavedToast(true);
    setTimeout(() => setPinSavedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0F1422] border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/50 overflow-hidden text-gray-100 my-auto">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    currentUser.role === 'commuter'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : currentUser.role === 'guardian'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">{currentUser.phone}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Guardian Pairing Sync Box */}
          <div className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Live Guardian Sync Code
              </span>
              <span className="text-[10px] text-gray-400">Share with family</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-3 py-2">
              <span className="text-base font-mono font-bold tracking-widest text-white">
                {currentUser.guardianPairingCode}
              </span>
              <button
                type="button"
                onClick={handleCopyPairingCode}
                className="flex items-center gap-1 px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-xs font-semibold rounded-lg transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Guardians enter this code in their dashboard to track your live breadcrumbs during trips.
            </p>
          </div>

          {/* Safety PIN Configuration */}
          <div className="bg-gray-900/60 border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                Safety Disarm & Duress PINs
              </span>
              {!isEditingPins ? (
                <button
                  type="button"
                  onClick={() => setIsEditingPins(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Edit PINs
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSavePins}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  Save Changes
                </button>
              )}
            </div>

            {pinSavedToast && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Security PINs updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 font-semibold block">Safe Disarm PIN</span>
                {isEditingPins ? (
                  <input
                    type="password"
                    maxLength={4}
                    value={normalPin}
                    onChange={(e) => setNormalPin(e.target.value)}
                    className="w-full bg-gray-950 border border-white/20 rounded-lg px-2 py-1 text-center font-mono text-emerald-400 text-sm mt-1 focus:outline-none"
                  />
                ) : (
                  <span className="text-sm font-mono font-bold text-emerald-400 tracking-widest block mt-0.5">
                    •••• ({currentUser.normalPin})
                  </span>
                )}
                <span className="text-[9px] text-gray-400 block mt-1">Disarms false alerts</span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/20">
                <span className="text-[10px] text-rose-400 font-semibold block">Duress Panic PIN</span>
                {isEditingPins ? (
                  <input
                    type="password"
                    maxLength={4}
                    value={duressPin}
                    onChange={(e) => setDuressPin(e.target.value)}
                    className="w-full bg-gray-950 border border-rose-500/40 rounded-lg px-2 py-1 text-center font-mono text-rose-400 text-sm mt-1 focus:outline-none"
                  />
                ) : (
                  <span className="text-sm font-mono font-bold text-rose-400 tracking-widest block mt-0.5">
                    •••• ({currentUser.duressPin})
                  </span>
                )}
                <span className="text-[9px] text-rose-300/70 block mt-1">Triggers Decoy Calculator</span>
              </div>
            </div>
          </div>

          {/* Quick Persona Switcher */}
          <div className="bg-gray-900/60 border border-white/10 p-3 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Switch Persona for Evaluation:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onSwitchRole('commuter');
                  onClose();
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  currentUser.role === 'commuter'
                    ? 'bg-purple-600/30 border-purple-500 text-white'
                    : 'bg-black/30 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Commuter</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSwitchRole('guardian');
                  onClose();
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  currentUser.role === 'guardian'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white'
                    : 'bg-black/30 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Guardian</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSwitchRole('civic');
                  onClose();
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  currentUser.role === 'civic'
                    ? 'bg-emerald-600/30 border-emerald-500 text-white'
                    : 'bg-black/30 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Civic</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
