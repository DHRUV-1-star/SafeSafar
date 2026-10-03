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
  AlertCircle,
  Phone,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { loginWithGoogle, registerUser, loginUser, resendVerificationEmail } from '../services/databaseService';
import { supabase } from '../services/supabaseClient';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

// Google SVG Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  // Auth modes
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email Sent Confirmation Step
  const [isEmailSentStep, setIsEmailSentStep] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for email resend
  useEffect(() => {
    if (!isEmailSentStep || resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(timer);
  }, [isEmailSentStep, resendCountdown]);

  // Listen for automatic login when user clicks the confirmation link in email
  useEffect(() => {
    if (!supabase) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED')) {
        const u = session.user;
        const profile: UserProfile = {
          id: u.id,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
          phone: u.user_metadata?.phone || '',
          email: u.email || '',
          role: u.user_metadata?.role || 'commuter',
          avatar: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.user_metadata?.full_name || 'User')}&backgroundColor=7c3aed,4f46e5`,
          normalPin: '1234',
          duressPin: '9999',
          guardianPairingCode: `SAF-${Math.floor(1000 + Math.random() * 9000)}`,
          emergencyContactCount: 0,
          batteryStatus: 92,
          hub: 'SVNIT Surat Hub',
        };
        localStorage.setItem('safesafar_user', JSON.stringify(profile));
        localStorage.setItem('safesafar_db_session', JSON.stringify(profile));
        onLoginSuccess(profile);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onLoginSuccess]);



  // Forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // UX Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Password strength
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

  // Switch modes
  const handleSwitchMode = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    setErrorMsg(null);
    setIsEmailSentStep(false);
    setShowForgotPassword(false);
  };

  // Handle email sign-in
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
      // Check mock users first (demo accounts)
      const existing = MOCK_USERS.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (existing) {
        setIsLoading(false);
        onLoginSuccess(existing);
        return;
      }

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

  // Handle registration — sends verification link via Supabase
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setErrorMsg('Please enter your full name.'); return; }
    if (!email || !email.includes('@')) { setErrorMsg('Please enter a valid email address.'); return; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters long.'); return; }
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { user, requiresEmailConfirmation, error: regError } = await registerUser(
        email.trim(),
        password,
        fullName.trim(),
        phone ? `+91${phone}` : '',
        'commuter'
      );

      if (regError) {
        setErrorMsg(regError);
        return;
      }

      if (requiresEmailConfirmation) {
        setRegisteredEmail(email.trim());
        setResendCountdown(60);
        setIsEmailSentStep(true);
      } else if (user) {
        const profile: UserProfile = {
          id: user.id,
          name: user.name,
          phone: user.phone || '',
          email: user.email,
          role: user.role,
          avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=7c3aed,4f46e5`,
          normalPin: '1234', duressPin: '9999',
          guardianPairingCode: `SAF-${Math.floor(1000 + Math.random() * 9000)}`,
          emergencyContactCount: 0, batteryStatus: 95, hub: user.hub,
        };
        localStorage.setItem('safesafar_user', JSON.stringify(profile));
        localStorage.setItem('safesafar_db_session', JSON.stringify(profile));
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Verification Email Link
  const handleResendEmail = async () => {
    setIsResending(true);
    setErrorMsg(null);
    const { error } = await resendVerificationEmail(registeredEmail);
    if (error) {
      setErrorMsg(error);
    } else {
      setResendCountdown(60);
      setSuccessNotice(`Verification link resent to ${registeredEmail}`);
      setTimeout(() => setSuccessNotice(null), 4000);
    }
    setIsResending(false);
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    const { error } = await loginWithGoogle();
    if (error) {
      setErrorMsg(error);
      setIsGoogleLoading(false);
    }
    // On success, page redirects to Google's OAuth flow
  };

  // Demo login
  const handleDemoLogin = (role: UserRole) => {
    const target = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    onLoginSuccess(target);
  };

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#202D2D] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* LEFT COLUMN: BRAND */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-8 pr-0 lg:pr-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#24504F] to-[#2F5F5E] flex items-center justify-center text-[#202D2D] shadow-md shadow-[#24504F]/30">
                <Shield className="w-5 h-5 fill-white/20" />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#202D2D]">SafeSafar</span>
            </div>

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

          {/* Live Safety Route Card */}
          <div className="hidden sm:block relative bg-[#FFFFFF]/80 border border-[#2F5F5E]/15 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
            <div className="relative h-32 rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#2F5F5E]/10 flex items-center justify-center">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 120" preserveAspectRatio="none">
                <path d="M 40 80 Q 150 110 360 40" stroke="#C9C4BC" strokeWidth="3" fill="none" strokeDasharray="4 4" />
                <path d="M 40 80 Q 200 20 360 40" stroke="#7CA982" strokeWidth="4" fill="none" />
              </svg>
              <div className="absolute left-8 bottom-6 flex items-center gap-1.5 bg-[#F4F1EC] border border-[#2F5F5E]/15 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#65716F] shadow">
                <span className="w-2 h-2 rounded-full bg-[#2F5F5E]"></span>
                <span>Your Location</span>
              </div>
              <div className="absolute right-8 top-6 flex items-center gap-1.5 bg-[#F4F1EC] border border-[#2F5F5E]/15 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#65716F] shadow">
                <span className="w-2 h-2 rounded-full bg-[#7CA982]"></span>
                <span>Destination</span>
              </div>
              <div className="absolute top-3 left-3 bg-[#F4F1EC]/90 border border-[#7CA982]/30 text-[#2F5F5E] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#7CA982] animate-pulse"></span>
                <span>Safest Route • 94 Index</span>
              </div>
            </div>
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

          {/* Benefits */}
          <div className="space-y-3 pt-1">
            {[
              { title: 'Find safer routes', desc: 'Dynamic route safety scoring backed by lighting coverage and verified safe havens.' },
              { title: 'Stay connected with trusted people', desc: 'Share live trips with family circles and get automatic safe arrival notifications.' },
              { title: 'Get help when you need it', desc: 'Discreet covert emergency triggers, voice activation, and rapid police dispatch.' },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#7CA982] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#202D2D]">{b.title}</h4>
                  <p className="text-xs text-[#7A8582]">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: AUTH CARD */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#202D2D]">Welcome to SafeSafar</h2>
              <p className="text-xs sm:text-sm text-[#7A8582] mt-1">Your journey deserves a safer route.</p>
            </div>

            {/* Error / Success banners */}
            {errorMsg && (
              <div className="bg-[#E57373]/10 border border-[#E57373]/20 text-[#E57373] text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successNotice && (
              <div className="bg-[#7CA982]/10 border border-[#7CA982]/20 text-[#2F5F5E] text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7CA982]" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* ============================================================ */}
            {/* ============================================================ */}
            {/* EMAIL SENT CONFIRMATION SCREEN (shown after registration)   */}
            {/* ============================================================ */}
            {isEmailSentStep ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => { setIsEmailSentStep(false); setErrorMsg(null); }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A8582] hover:text-[#202D2D] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to registration</span>
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-3 pt-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-[#7CA982]/20 border-2 border-[#7CA982]/40 flex items-center justify-center animate-pulse">
                      <Mail className="w-8 h-8 text-[#24504F]" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7CA982] text-white flex items-center justify-center border-2 border-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-[#202D2D]">Check Your Email</h3>
                  <p className="text-xs text-[#526460]">
                    We have sent a verification confirmation link to:
                  </p>
                  <div className="px-4 py-2 rounded-xl bg-[#EEF3EE] border border-[#D4E2D5] text-[#24504F] font-bold text-sm tracking-wide break-all">
                    {registeredEmail}
                  </div>
                </div>

                {/* Verification Instructions */}
                <div className="bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl p-4 space-y-2.5 text-xs text-[#30433F]">
                  <p className="font-semibold text-[#202D2D]">To complete your account creation:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#24504F] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                      <span>Open your email inbox (check Spam/Junk folder if not in inbox).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#24504F] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                      <span>Click the button in the email: <strong>"Confirm your email"</strong> or <strong>"Yes, it's me"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#24504F] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                      <span>Your account will be activated and you will automatically be logged into SafeSafar!</span>
                    </li>
                  </ul>
                </div>

                {/* Resend Action */}
                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    disabled={isResending || resendCountdown > 0}
                    onClick={handleResendEmail}
                    className="w-full py-2.5 rounded-xl border border-[#24504F] text-[#24504F] hover:bg-[#EEF3EE] font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isResending ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Sending...</span></>
                    ) : resendCountdown > 0 ? (
                      <span>Resend verification email in {resendCountdown}s</span>
                    ) : (
                      <><Mail className="w-3.5 h-3.5" /><span>Resend Verification Email</span></>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signin')}
                    className="w-full text-center text-xs text-[#7A8582] hover:text-[#202D2D] font-medium"
                  >
                    Already verified? <span className="text-[#2F5F5E] font-semibold underline">Sign In</span>
                  </button>
                </div>
              </div>
            ) : (

              <div className="space-y-5">

                {/* Mode Tabs */}
                <div className="flex bg-[#FAF9F6] border border-[#2F5F5E]/10 p-1 rounded-xl">
                  {(['signin', 'register'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleSwitchMode(mode)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                        authMode === mode
                          ? 'bg-[#24504F] text-white shadow-sm'
                          : 'text-[#7A8582] hover:text-[#202D2D]'
                      }`}
                    >
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>

                {/* ========================================================= */}
                {/* SIGN IN FORM (Email by default)                            */}
                {/* ========================================================= */}
                {authMode === 'signin' ? (
                  <div className="space-y-4">
                    <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-[#65716F] mb-1.5">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                          <input
                            id="signin-email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                            placeholder="your@email.com"
                            className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#202D2D] placeholder-gray-400 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-medium text-[#65716F]">Password</label>
                          <button
                            type="button"
                            onClick={() => { setShowForgotPassword(!showForgotPassword); setErrorMsg(null); }}
                            className="text-[11px] text-[#7CA982] hover:text-[#2F5F5E]"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                          <input
                            id="signin-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                            placeholder="••••••••"
                            className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-10 py-2.5 text-sm text-[#202D2D] placeholder-gray-400 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                            autoComplete="current-password"
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

                      {/* Forgot Password panel */}
                      {showForgotPassword && (
                        <div className="bg-[#FAF9F6] border border-[#2F5F5E]/15 p-3 rounded-xl space-y-2">
                          <p className="text-xs text-[#65716F]">We'll send a reset link to:</p>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="flex-1 bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#202D2D] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setShowForgotPassword(false);
                                setSuccessNotice(`Reset link sent to ${forgotEmail || 'your email'}`);
                                setTimeout(() => setSuccessNotice(null), 4000);
                              }}
                              className="px-3 py-1.5 bg-[#24504F]/20 text-[#2F5F5E] hover:bg-[#24504F]/30 rounded-lg text-xs font-semibold"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-xl bg-[#24504F] hover:bg-[#2F5F5E] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in...</span></>
                        ) : (
                          <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center">
                      <div className="flex-1 border-t border-[#2F5F5E]/15"></div>
                      <span className="px-3 bg-[#FFFFFF] text-[11px] text-[#8A9491] uppercase tracking-wider">or</span>
                      <div className="flex-1 border-t border-[#2F5F5E]/15"></div>
                    </div>

                    {/* Continue with Google */}
                    <button
                      type="button"
                      id="google-signin-btn"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F8F5F2] border border-[#E0DDD8] text-[#3C4043] font-medium text-sm transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-60"
                    >
                      {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#7A8582]" /> : <GoogleIcon />}
                      <span>Continue with Google</span>
                    </button>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* CREATE ACCOUNT FORM                                        */
                  /* ========================================================= */
                  <div className="space-y-4">
                    {/* Google option first for convenience */}
                    <button
                      type="button"
                      id="google-register-btn"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F8F5F2] border border-[#E0DDD8] text-[#3C4043] font-medium text-sm transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-60"
                    >
                      {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#7A8582]" /> : <GoogleIcon />}
                      <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center">
                      <div className="flex-1 border-t border-[#2F5F5E]/15"></div>
                      <span className="px-3 bg-[#FFFFFF] text-[11px] text-[#8A9491] uppercase tracking-wider">or create with email</span>
                      <div className="flex-1 border-t border-[#2F5F5E]/15"></div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-3">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-medium text-[#65716F] mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                          <input
                            id="reg-name"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => { setFullName(e.target.value); setErrorMsg(null); }}
                            placeholder="Your full name"
                            className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-3 py-2 text-sm text-[#202D2D] placeholder-gray-400 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                            autoComplete="name"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-[#65716F] mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                          <input
                            id="reg-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                            placeholder="your@email.com"
                            className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-3 py-2 text-sm text-[#202D2D] placeholder-gray-400 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      {/* Phone (optional) */}
                      <div>
                        <label className="block text-xs font-medium text-[#65716F] mb-1">
                          Phone Number <span className="text-[#9AACA8] font-normal">(optional)</span>
                        </label>
                        <div className="flex items-center bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl overflow-hidden focus-within:border-[#2F5F5E] focus-within:ring-1 focus-within:ring-[#2F5F5E]">
                          <span className="px-3 text-xs font-semibold text-[#7A8582] border-r border-[#2F5F5E]/15 py-2.5">+91</span>
                          <input
                            id="reg-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="10-digit mobile"
                            maxLength={10}
                            className="w-full bg-transparent px-3 py-2 text-sm text-[#202D2D] placeholder-gray-400 focus:outline-none font-mono"
                            autoComplete="tel"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-medium text-[#65716F] mb-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                          <input
                            id="reg-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                            placeholder="Min. 6 characters"
                            className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl pl-9 pr-10 py-2 text-sm text-[#202D2D] placeholder-gray-400 focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                            autoComplete="new-password"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-[#7A8582] hover:text-[#202D2D]">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {password && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-[#2F5F5E]/8 rounded-full overflow-hidden flex gap-1">
                              {[1, 2, 3, 4].map((s) => (
                                <div key={s} className={`h-full flex-1 ${passwordStrength.score >= s ? passwordStrength.color : 'bg-transparent'}`}></div>
                              ))}
                            </div>
                            <span className="text-[10px] text-[#7A8582]">{passwordStrength.label}</span>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-medium text-[#65716F] mb-1">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-[#7A8582]" />
                          <input
                            id="reg-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(null); }}
                            placeholder="Repeat your password"
                            className={`w-full bg-[#FAF9F6] border rounded-xl pl-9 pr-10 py-2 text-sm text-[#202D2D] placeholder-gray-400 focus:outline-none focus:ring-1 ${
                              confirmPassword && confirmPassword !== password
                                ? 'border-[#E57373]/50 focus:border-[#E57373] focus:ring-[#E57373]'
                                : 'border-[#2F5F5E]/15 focus:border-[#2F5F5E] focus:ring-[#2F5F5E]'
                            }`}
                            autoComplete="new-password"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-[#7A8582] hover:text-[#202D2D]">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && confirmPassword !== password && (
                          <p className="text-[11px] text-[#E57373] mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Passwords don't match
                          </p>
                        )}
                      </div>

                      {/* Verification note */}
                      <div className="bg-[#7CA982]/8 border border-[#7CA982]/20 rounded-xl px-3 py-2 flex items-start gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#7CA982] shrink-0 mt-0.5" />
                        <p className="text-[11px] text-[#2F5F5E]">
                          A <strong>verification link</strong> will be sent to your email to activate your account.
                        </p>
                      </div>

                      <button
                        type="submit"
                        id="create-account-btn"
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-xl bg-[#24504F] hover:bg-[#2F5F5E] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                      >
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating account...</span></>
                        ) : (
                          <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Demo shortcuts */}
                <div className="pt-2 border-t border-[#2F5F5E]/10">
                  <div className="flex items-center justify-between text-[11px] text-[#7A8582]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#7CA982]" />
                      Quick demo test logins:
                    </span>
                    <div className="flex gap-2">
                      {(['commuter', 'guardian', 'civic'] as UserRole[]).map((role, i) => (
                        <React.Fragment key={role}>
                          {i > 0 && <span>•</span>}
                          <button
                            type="button"
                            onClick={() => handleDemoLogin(role)}
                            className="text-[#7CA982] hover:text-[#2F5F5E] font-medium capitalize"
                          >
                            {role === 'commuter' ? 'Student' : role.charAt(0).toUpperCase() + role.slice(1)}
                          </button>
                        </React.Fragment>
                      ))}
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
