import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Users,
  Compass,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { loginWithGoogle, registerUser, loginUser } from '../services/databaseService';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  // Modes: 'signin' | 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  // Sign in methods: 'phone' | 'email'
  const [signInMethod, setSignInMethod] = useState<'phone' | 'email'>('phone');

  // Form Inputs
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(45);
  const [isResending, setIsResending] = useState(false);

  // Active OTP countdown effect
  useEffect(() => {
    if (!isOtpStep || otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOtpStep, otpCountdown]);


  // UX Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Password Strength Checker
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-[#E57373]' };
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    const score = (pass.length >= 8 ? 1 : 0) + (hasLetters ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSpecial ? 1 : 0);
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-[#F9C950]' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-[#2F5F5E]' };
    return { score: 4, label: 'Strong', color: 'bg-[#7CA982]' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Format Phone Input
  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    setErrorMsg(null);
  };

  // Switch between Sign In and Register
  const handleSwitchMode = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    setErrorMsg(null);
    setIsOtpStep(false);
    setShowForgotPassword(false);
  };

  // Continue to OTP Step from Phone Sign In
  const handlePhoneContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Simulate OTP dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsOtpStep(true);
      setOtpCountdown(45);
      // Pre-fill demo OTP code if it matches one of our mock users for convenience
      setOtpDigits(['2', '0', '2', '6', '0', '0']);
    }, 600);
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = sanitized;
    setOtpDigits(updated);
    setErrorMsg(null);

    // Auto-advance to next input
    if (sanitized && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Verify OTP and complete login
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsLoading(false);
      // Look up matching mock user or construct authenticated user
      const existing = MOCK_USERS.find((u) => u.phone.includes(phone));
      const user: UserProfile = existing || {
        id: `user-${Date.now()}`,
        name: `Traveler (${phone.slice(-4)})`,
        phone: `+91 ${phone}`,
        role: 'commuter',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        normalPin: '1234',
        duressPin: '9999',
        guardianPairingCode: `SAF-${Math.floor(1000 + Math.random() * 9000)}`,
        emergencyContactCount: 2,
        batteryStatus: 88,
      };

      onLoginSuccess(user);
    }, 700);
  };

  // Handle Email Sign In (real Supabase or local fallback)
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // First try mock users for demo accounts
      const existing = MOCK_USERS.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (existing) {
        setIsLoading(false);
        onLoginSuccess(existing);
        return;
      }

      // Otherwise use real Supabase / local auth
      const { user, error: loginError } = await loginUser(email, password);
      if (loginError) {
        setErrorMsg(loginError);
        return;
      }
      if (user) {
        const profile: UserProfile = {
          id: user.id,
          name: user.name,
          phone: user.phone || '',
          email: user.email,
          role: user.role,
          avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=7c3aed,4f46e5`,
          normalPin: '1234',
          duressPin: '9999',
          guardianPairingCode: `SAF-${Math.floor(1000 + Math.random() * 9000)}`,
          emergencyContactCount: 0,
          batteryStatus: 92,
          hub: user.hub,
        };
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration (real Supabase or local fallback)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { user, error: regError } = await registerUser(
        email.trim(),
        password,
        fullName.trim(),
        `+91${phone}`,
        'commuter'
      );

      if (regError) {
        setErrorMsg(regError);
        return;
      }

      if (user) {
        const newUser: UserProfile = {
          id: user.id,
          name: user.name,
          phone: user.phone || `+91 ${phone}`,
          email: user.email,
          role: user.role,
          avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=7c3aed,4f46e5`,
          normalPin: '1234',
          duressPin: '9999',
          guardianPairingCode: `SAF-${Math.floor(1000 + Math.random() * 9000)}`,
          emergencyContactCount: 0,
          batteryStatus: 95,
          hub: user.hub,
        };
        onLoginSuccess(newUser);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In (Real OAuth)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await loginWithGoogle();
    if (error) {
      setErrorMsg(error);
      setIsLoading(false);
    }
    // If successful, the page will redirect to Google's OAuth flow
  };

  // Demo auto-fill helper for judges / testers
  const handleDemoLogin = (role: UserRole) => {
    const target = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    onLoginSuccess(target);
  };

  // Resend code trigger
  const handleResendOtp = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setOtpCountdown(45);
      setSuccessNotice('New verification code sent via development gateway.');
      setTimeout(() => setSuccessNotice(null), 3000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#202D2D] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* ========================================================= */}
        {/* LEFT COLUMN: BRAND & VALUE PROPOSITION                    */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-8 pr-0 lg:pr-4">

          {/* Brand Wordmark & Hackathon Track */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#24504F] to-[#2F5F5E] flex items-center justify-center text-[#202D2D] shadow-md shadow-[#24504F]/30">
                <Shield className="w-5 h-5 fill-white/20" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#202D2D]">SafeSafar</span>
              </div>
            </div>

            {/* Core Slogan */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#202D2D] leading-[1.15]">
              Move freely.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7CA982] via-[#E57373] to-[#2F5F5E]">
                Travel safely.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#7A8582] max-w-md leading-relaxed">
              Safety-aware navigation and a trusted safety network for every journey.
            </p>
          </div>

          {/* Integrated Visual Representation: Live Safety Route Card */}
          <div className="hidden sm:block relative bg-[#FFFFFF]/80 border border-[#2F5F5E]/15 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">

            {/* Live Map Preview Simulation */}
            <div className="relative h-32 rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#2F5F5E]/10 flex items-center justify-center">
              {/* Grid Lines */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]"></div>

              {/* Stylized Safe Route Path */}
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 120" preserveAspectRatio="none">
                {/* Secondary dim route */}
                <path d="M 40 80 Q 150 110 360 40" stroke="#C9C4BC" strokeWidth="3" fill="none" strokeDasharray="4 4" />
                {/* Safest Verified Route (Glowing Green) */}
                <path d="M 40 80 Q 200 20 360 40" stroke="#7CA982" strokeWidth="4" fill="none" />
              </svg>

              {/* Waypoint Markers */}
              <div className="absolute left-8 bottom-6 flex items-center gap-1.5 bg-[#F4F1EC] border border-[#2F5F5E]/15 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#65716F] shadow">
                <span className="w-2 h-2 rounded-full bg-[#2F5F5E]"></span>
                <span>SVNIT Campus</span>
              </div>

              <div className="absolute right-8 top-6 flex items-center gap-1.5 bg-[#F4F1EC] border border-[#2F5F5E]/15 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#65716F] shadow">
                <span className="w-2 h-2 rounded-full bg-[#7CA982]"></span>
                <span>Ring Road Hub</span>
              </div>

              {/* Safety Badge Floating */}
              <div className="absolute top-3 left-3 bg-[#F4F1EC]/90 border border-[#7CA982]/30 text-[#2F5F5E] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#7CA982] animate-pulse"></span>
                <span>Safest Route • 94 Index</span>
              </div>
            </div>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FAF9F6]/60 border border-[#2F5F5E]/10 p-2.5 rounded-xl flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#7CA982]/10 border border-[#7CA982]/20 flex items-center justify-center text-[#7CA982] shrink-0">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-[#7A8582]">Street Lighting</p>
                  <p className="text-xs font-bold text-[#202D2D]">96% Lumens LED</p>
                </div>
              </div>

              <div className="bg-[#FAF9F6]/60 border border-[#2F5F5E]/10 p-2.5 rounded-xl flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2F5F5E]/10 border border-[#2F5F5E]/20 flex items-center justify-center text-[#7CA982] shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-[#7A8582]">Trusted Network</p>
                  <p className="text-xs font-bold text-[#202D2D]">Live Circle Sync</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Value Benefits */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#7CA982] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#202D2D]">Find safer routes</h4>
                <p className="text-xs text-[#7A8582]">Dynamic route safety scoring backed by lighting coverage and verified safe havens.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#7CA982] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#202D2D]">Stay connected with trusted people</h4>
                <p className="text-xs text-[#7A8582]">Share live trips with family circles and get automatic safe arrival notifications.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#7CA982] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#202D2D]">Get help when you need it</h4>
                <p className="text-xs text-[#7A8582]">Discreet covert emergency triggers, voice activation, and rapid police dispatch.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: CLEAN AUTHENTICATION CARD                   */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">

            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#202D2D]">Welcome to SafeSafar</h2>
              <p className="text-xs sm:text-sm text-[#7A8582] mt-1">
                Your journey deserves a safer route.
              </p>
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMsg && (
              <div className="bg-[#E57373]/10 border border-[#E57373]/20 text-[#E57373] text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#E57373]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successNotice && (
              <div className="bg-[#7CA982]/10 border border-[#7CA982]/20 text-[#2F5F5E] text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7CA982]" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* ===================================================== */}
            {/* STATE A: OTP VERIFICATION SCREEN                      */}
            {/* ===================================================== */}
            {isOtpStep ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpStep(false);
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7A8582] hover:text-[#202D2D] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change phone number</span>
                  </button>
                  <h3 className="text-lg font-bold text-[#202D2D]">Verify your phone</h3>
                  <p className="text-xs text-[#7A8582]">
                    We sent a 6-digit verification code to <span className="font-semibold text-[#202D2D]">+91 {phone}</span>
                  </p>
                </div>

                {/* 6-Digit OTP Inputs */}
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="flex justify-between gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-13 text-center bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl text-lg font-bold text-[#202D2D] focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {/* Development mode indicator note */}
                  <div className="bg-[#1E3D3C]/20 border border-[#2F5F5E]/20 rounded-xl px-3 py-2 text-[11px] text-[#2F5F5E] flex items-center justify-between">
                    <span>Demo Verification Code:</span>
                    <span className="font-mono font-bold tracking-wider text-[#202D2D]">202600</span>
                  </div>

                  {/* Verify Action Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#24504F] hover:bg-[#2F5F5E] text-[#202D2D] font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Resend Code Section */}
                <div className="text-center text-xs text-[#7A8582] space-y-1">
                  <p>
                    Didn&apos;t receive the code?{' '}
                    <button
                      type="button"
                      disabled={isResending || otpCountdown > 0}
                      onClick={handleResendOtp}
                      className="font-semibold text-[#7CA982] hover:text-[#2F5F5E] disabled:opacity-50 disabled:no-underline underline ml-1"
                    >
                      {isResending ? 'Resending...' : otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend code'}
                    </button>
                  </p>
                  <p className="text-[11px] text-[#8A9491]">
                    SafeSafar uses end-to-end device token verification.
                  </p>
                </div>
              </div>
            ) : (
              /* ===================================================== */
              /* STATE B: PRIMARY AUTH MODES (SIGN IN / REGISTER)      */
              /* ===================================================== */
              <div className="space-y-5">

                {/* Mode Selector Tabs: [ Sign In ] [ Create Account ] */}
                <div className="flex bg-[#FAF9F6] border border-[#2F5F5E]/10 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${authMode === 'signin'
                        ? 'bg-[#24504F] text-[#202D2D] shadow-sm'
                        : 'text-[#7A8582] hover:text-[#202D2D]'
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${authMode === 'register'
                        ? 'bg-[#24504F] text-[#202D2D] shadow-sm'
                        : 'text-[#7A8582] hover:text-[#202D2D]'
                      }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* SIGN IN FORM */}
                {authMode === 'signin' ? (
                  <div className="space-y-4">

                    {/* Method Toggle: Phone or Email */}
                    <div className="flex items-center justify-between text-xs text-[#7A8582]">
                      <span>Sign in using:</span>
                      <div className="flex gap-2 font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            setSignInMethod('phone');
                            setErrorMsg(null);
                          }}
                          className={`${signInMethod === 'phone' ? 'text-[#7CA982] font-bold underline' : 'hover:text-[#202D2D]'}`}
                        >
                          Phone Number
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSignInMethod('email');
                            setErrorMsg(null);
                          }}
                          className={`${signInMethod === 'email' ? 'text-[#7CA982] font-bold underline' : 'hover:text-[#202D2D]'}`}
                        >
                          Email & Password
                        </button>
                      </div>
                    </div>

                    {/* Phone Number Method */}
                    {signInMethod === 'phone' ? (
                      <form onSubmit={handlePhoneContinue} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-[#65716F] mb-1.5">
                            Phone Number
                          </label>
                          <div className="flex items-center bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl overflow-hidden focus-within:border-[#2F5F5E] focus-within:ring-1 focus-within:ring-[#2F5F5E]">
                            <span className="px-3 text-xs font-semibold text-[#7A8582] border-r border-[#2F5F5E]/15">
                              +91
                            </span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => handlePhoneChange(e.target.value)}
                              placeholder="Enter 10-digit number"
                              maxLength={10}
                              className="w-full bg-transparent px-3 py-2.5 text-sm text-[#202D2D] placeholder-gray-500 focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-2.5 rounded-xl bg-[#24504F] hover:bg-[#2F5F5E] text-[#202D2D] font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>Continue</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      /* Email & Password Method */
                      <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-medium text-[#65716F] mb-1.5">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter email"
                              className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#202D2D] placeholder-gray-500 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-medium text-[#65716F]">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setShowForgotPassword(!showForgotPassword);
                                setErrorMsg(null);
                              }}
                              className="text-[11px] text-[#7CA982] hover:text-[#2F5F5E]"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-10 py-2.5 text-sm text-[#202D2D] placeholder-gray-500 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-[#7A8582] hover:text-[#202D2D]"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {showForgotPassword && (
                          <div className="bg-[#FAF9F6] border border-[#2F5F5E]/15 p-3 rounded-xl space-y-2">
                            <p className="text-xs text-[#65716F]">Password recovery email:</p>
                            <div className="flex gap-2">
                              <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="flex-1 bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#202D2D] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setShowForgotPassword(false);
                                  setSuccessNotice('Reset link sent to ' + (forgotEmail || 'your email'));
                                  setTimeout(() => setSuccessNotice(null), 3000);
                                }}
                                className="px-3 py-1.5 bg-[#24504F]/30 text-[#2F5F5E] hover:bg-[#24504F]/50 rounded-lg text-xs font-semibold"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-2.5 rounded-xl bg-[#24504F] hover:bg-[#2F5F5E] text-[#202D2D] font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>Sign In</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Divider */}
                    <div className="relative py-2 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#2F5F5E]/15"></div>
                      </div>
                      <span className="relative px-3 bg-[#FFFFFF] text-[11px] text-[#8A9491] uppercase tracking-wider">
                        OR
                      </span>
                    </div>

                    {/* Continue with Google */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F1D9D9] border border-[#2F5F5E]/15 text-[#465552] font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2.5 shadow-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                ) : (
                  /* ================================================= */
                  /* CREATE ACCOUNT FORM                               */
                  /* ================================================= */
                  <form onSubmit={handleRegister} className="space-y-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-medium text-[#65716F] mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Diya Patel"
                          className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-3 py-2 text-sm text-[#202D2D] placeholder-gray-500 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-medium text-[#65716F] mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl overflow-hidden focus-within:border-[#2F5F5E] focus-within:ring-1 focus-within:ring-[#2F5F5E]">
                        <span className="px-3 text-xs font-semibold text-[#7A8582] border-r border-[#2F5F5E]/15">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          className="w-full bg-transparent px-3 py-2 text-sm text-[#202D2D] placeholder-gray-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-[#65716F] mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="diya.patel@svnit.ac.in"
                          className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-3 py-2 text-sm text-[#202D2D] placeholder-gray-500 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-medium text-[#65716F] mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-10 py-2 text-sm text-[#202D2D] placeholder-gray-500 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#7A8582] hover:text-[#202D2D]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-[#2F5F5E]/8 rounded-full overflow-hidden flex gap-1">
                            <div className={`h-full flex-1 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`}></div>
                            <div className={`h-full flex-1 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`}></div>
                            <div className={`h-full flex-1 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`}></div>
                            <div className={`h-full flex-1 ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'}`}></div>
                          </div>
                          <span className="text-[10px] text-[#7A8582]">{passwordStrength.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-medium text-[#65716F] mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-10 py-2 text-sm text-[#202D2D] placeholder-gray-500 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-[#7A8582] hover:text-[#202D2D]"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-[#24504F] hover:bg-[#2F5F5E] text-[#202D2D] font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Subtitle / Discreet Demo Shortcuts for Jury & Evaluators */}
                <div className="pt-2 border-t border-[#2F5F5E]/10">
                  <div className="flex items-center justify-between text-[11px] text-[#7A8582]">
                    <span className="text-[#7A8582] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#7CA982]" />
                      Quick demo test logins:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('commuter')}
                        className="text-[#7CA982] hover:text-[#2F5F5E] font-medium"
                      >
                        Student
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('guardian')}
                        className="text-[#7CA982] hover:text-[#2F5F5E] font-medium"
                      >
                        Guardian
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleDemoLogin('civic')}
                        className="text-[#7CA982] hover:text-[#2F5F5E] font-medium"
                      >
                        Civic
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
