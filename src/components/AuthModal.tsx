import React, { useState } from 'react';
import { 
  Shield, 
  X, 
  Smartphone, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Users, 
  Building2, 
  ArrowRight, 
  PhoneCall, 
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onEmergencyBypass: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onEmergencyBypass,
}) => {
  // Selected Role & Form Mode
  const [selectedRole, setSelectedRole] = useState<UserRole>('commuter');
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');

  // Form Fields
  const [phone, setPhone] = useState('9825144321');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  
  // Safety Setup Fields for Registration
  const [normalPin, setNormalPin] = useState('1234');
  const [duressPin, setDuressPin] = useState('9999');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [guardianPairingInput, setGuardianPairingInput] = useState('');
  const [orgDepartment, setOrgDepartment] = useState('Surat Municipal Corporation (SMC)');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;

  // Demo Quick Login Trigger
  const handleQuickLogin = (userRole: UserRole) => {
    const mockUser = MOCK_USERS.find((u) => u.role === userRole) || MOCK_USERS[0];
    onLoginSuccess(mockUser);
    onClose();
  };

  // Submit Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'signin') {
      // Find matching mock user or construct session
      const existing = MOCK_USERS.find(
        (u) => (loginMethod === 'phone' ? u.phone.includes(phone) : u.email === email)
      );

      const authenticatedUser: UserProfile = existing || {
        id: `user-${Date.now()}`,
        name: phone ? `User (${phone.slice(-4)})` : 'SafeSafar User',
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        email: email || undefined,
        role: selectedRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        normalPin: '1234',
        duressPin: '9999',
        guardianPairingCode: `SAF-${Math.floor(1000 + Math.random() * 9000)}`,
        emergencyContactCount: 2,
        batteryStatus: 90,
      };

      onLoginSuccess(authenticatedUser);
      onClose();
    } else {
      // Register Mode
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: fullName || 'New SafeSafar Member',
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        email: email || undefined,
        role: selectedRole,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        normalPin: normalPin || '1234',
        duressPin: duressPin || '9999',
        guardianPairingCode: guardianPairingInput || `SAF-${Math.floor(1000 + Math.random() * 9000)}`,
        emergencyContactCount: emergencyContactPhone ? 1 : 0,
        organization: selectedRole === 'civic' ? orgDepartment : undefined,
        batteryStatus: 95,
      };

      onLoginSuccess(newUser);
      onClose();
    }
  };

  const handleSendOtp = () => {
    if (!phone) return;
    setOtpSent(true);
    setOtpCode('2026'); // demo prefilled code for easy evaluation
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F1422] border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/50 overflow-hidden text-gray-100 my-auto">
        
        {/* Top Emergency SOS Fast-Lane Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 px-4 py-2.5 flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wide">
            <span className="animate-pulse flex h-2 w-2 rounded-full bg-white"></span>
            <span>IN IMMEDIATE DANGER?</span>
            <span className="hidden sm:inline font-normal text-white/90">Skip login to access distress lines</span>
          </div>
          <button
            onClick={() => {
              onEmergencyBypass();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-red-700 hover:bg-red-50 text-[11px] font-extrabold rounded-full shadow transition-transform active:scale-95"
          >
            <PhoneCall className="w-3 h-3 text-red-600" />
            <span>Emergency Bypass</span>
          </button>
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/40">
              <Shield className="w-6 h-6 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  SafeSafar Security
                </h2>
                <span className="text-[10px] font-bold bg-pink-500/10 border border-pink-500/30 text-pink-400 px-2 py-0.5 rounded-full">
                  IEEE WIE ILS 2026
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Track 3: SheLeads • Women Safe Route Navigator & Emergency Hub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Tester Accounts Banner */}
        <div className="bg-purple-950/30 border-b border-purple-500/20 p-3 sm:px-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Hackathon Jury & Quick-Demo Logins:</span>
            </div>
            <span className="text-[10px] text-gray-400">1-Click Switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('commuter')}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 border border-purple-500/30 text-left transition-all text-xs"
            >
              <div>
                <p className="font-bold text-white flex items-center gap-1">
                  <span>🎓 Diya Patel</span>
                </p>
                <p className="text-[10px] text-purple-300">SVNIT Student (Commuter)</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('guardian')}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-indigo-900/40 hover:bg-indigo-800/50 border border-indigo-500/30 text-left transition-all text-xs"
            >
              <div>
                <p className="font-bold text-white flex items-center gap-1">
                  <span>👨‍👩‍👧 Rajesh Gohil</span>
                </p>
                <p className="text-[10px] text-indigo-300">Guardian / Family Circle</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('civic')}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-900/30 hover:bg-emerald-800/40 border border-emerald-500/30 text-left transition-all text-xs"
            >
              <div>
                <p className="font-bold text-white flex items-center gap-1">
                  <span>🏛️ Er. Dharmik</span>
                </p>
                <p className="text-[10px] text-emerald-300">SMC & Pink Police Desk</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">
              1. Select Your Safety Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('commuter')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  selectedRole === 'commuter'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-gray-900/50 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1 text-purple-400" />
                <span className="text-xs font-bold">Commuter</span>
                <span className="text-[10px] text-gray-400 hidden sm:inline">Woman Traveler</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('guardian')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  selectedRole === 'guardian'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-gray-900/50 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Users className="w-5 h-5 mb-1 text-indigo-400" />
                <span className="text-xs font-bold">Guardian</span>
                <span className="text-[10px] text-gray-400 hidden sm:inline">Family / Roommate</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('civic')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  selectedRole === 'civic'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-gray-900/50 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Building2 className="w-5 h-5 mb-1 text-emerald-400" />
                <span className="text-xs font-bold">Civic / Police</span>
                <span className="text-[10px] text-gray-400 hidden sm:inline">SMC & Beat Patrol</span>
              </button>
            </div>
          </div>

          {/* Mode Switch (Sign In vs Register) */}
          <div className="flex bg-gray-900/80 border border-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'signin' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In to SafeSafar
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'register' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Safety Profile
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* Register: Full Name */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Diya Patel"
                    className="w-full bg-gray-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Auth Method Switcher for Sign In */}
            {authMode === 'signin' && (
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>Login Method:</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`font-semibold ${loginMethod === 'phone' ? 'text-purple-400 underline' : 'hover:text-white'}`}
                  >
                    Phone + OTP (Recommended)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`font-semibold ${loginMethod === 'email' ? 'text-purple-400 underline' : 'hover:text-white'}`}
                  >
                    Email / Password
                  </button>
                </div>
              </div>
            )}

            {/* Phone Input */}
            {(authMode === 'register' || loginMethod === 'phone') && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Mobile Number (India)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">🇮🇳 +91</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98251 44321"
                      className="w-full bg-gray-900/90 border border-white/10 rounded-xl pl-16 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono tracking-wider"
                    />
                  </div>
                  {authMode === 'signin' && loginMethod === 'phone' && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-3.5 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-xs font-semibold rounded-xl shrink-0 transition-colors"
                    >
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* OTP Verification Field */}
            {authMode === 'signin' && loginMethod === 'phone' && otpSent && (
              <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-300">Enter 4-Digit Verification Code</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Demo Code: 2026
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="2026"
                  className="w-full text-center bg-gray-900/90 border border-purple-500/50 rounded-xl py-2 text-lg font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Email & Password Input */}
            {(authMode === 'register' || loginMethod === 'email') && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="diya.patel@svnit.ac.in"
                      className="w-full bg-gray-900/90 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-gray-900/90 border border-white/10 rounded-xl pl-9 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* SAFETY SPECIFIC SETUP ON REGISTRATION */}
            {authMode === 'register' && (
              <div className="bg-gray-900/80 border border-purple-500/20 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>Personal Safety Security Setup</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Normal Disarm PIN */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1 flex items-center justify-between">
                      <span>Normal Safe PIN</span>
                      <span className="text-gray-500">Default: 1234</span>
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={normalPin}
                      onChange={(e) => setNormalPin(e.target.value)}
                      placeholder="1234"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-1.5 text-center text-sm font-mono tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">Safely disarms false alarm SOS</p>
                  </div>

                  {/* Duress Alarm PIN */}
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-300 mb-1 flex items-center justify-between">
                      <span>Duress Panic PIN</span>
                      <span className="text-rose-400 font-bold">Default: 9999</span>
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={duressPin}
                      onChange={(e) => setDuressPin(e.target.value)}
                      placeholder="9999"
                      className="w-full bg-gray-950 border border-rose-500/30 rounded-xl px-3 py-1.5 text-center text-sm font-mono tracking-widest text-rose-400 focus:outline-none focus:border-rose-500"
                    />
                    <p className="text-[10px] text-rose-300/80 mt-0.5">Dispatches police & opens Decoy Calculator</p>
                  </div>
                </div>

                {/* Additional Role Specific Field */}
                {selectedRole === 'commuter' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Primary Emergency Contact Phone (Papa / Mom / Roommate)
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="+91 87808 88428"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                {selectedRole === 'guardian' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-300 mb-1">
                      Traveler's 6-Digit Pairing Code (to sync live breadcrumbs)
                    </label>
                    <input
                      type="text"
                      value={guardianPairingInput}
                      onChange={(e) => setGuardianPairingInput(e.target.value.toUpperCase())}
                      placeholder="e.g. SAF-8492"
                      className="w-full bg-gray-950 border border-indigo-500/30 rounded-xl px-3 py-1.5 text-xs font-mono text-indigo-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {selectedRole === 'civic' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-300 mb-1">
                      Municipal / Police Agency Department
                    </label>
                    <input
                      type="text"
                      value={orgDepartment}
                      onChange={(e) => setOrgDepartment(e.target.value)}
                      placeholder="Surat Municipal Corporation (SMC) Streetlight Cell"
                      className="w-full bg-gray-950 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>
                {authMode === 'signin' ? `Enter SafeSafar as ${selectedRole.toUpperCase()}` : 'Complete Safety Registration'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy & Zero-Knowledge Assurance */}
          <div className="pt-3 border-t border-white/5 flex items-start gap-2.5 text-[11px] text-gray-400">
            <Fingerprint className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-gray-300">Zero-Tracking Privacy Guarantee:</strong> SafeSafar does not log or sell continuous route telemetry. GPS breadcrumbs are only relayed during active <em className="text-purple-300">Walk Me Home</em> or <em className="text-rose-300">SOS distress beacons</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
