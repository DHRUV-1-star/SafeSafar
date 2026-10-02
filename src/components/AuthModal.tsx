import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  Database,
  Sparkles,
  Loader2,
  CheckCircle2,
  HeartHandshake,
  Building2,
} from 'lucide-react';
import { registerUser, loginUser, AuthUser } from '../services/databaseService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  onOpenDatabaseSetup: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onOpenDatabaseSetup,
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [role, setRole] = useState<'commuter' | 'guardian' | 'civic'>('commuter');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { user, error: loginError } = await loginUser(loginEmail, loginPassword);
      if (loginError) {
        setError(loginError);
      } else if (user) {
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const { user, error: signupError } = await registerUser(
        signupEmail,
        signupPassword,
        name,
        signupPhone,
        role
      );

      if (signupError) {
        setError(signupError);
      } else if (user) {
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Demo Login Shortcuts
  const handleQuickDemo = async (demoEmail: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { user, error: loginError } = await loginUser(demoEmail, 'password123');
      if (loginError) {
        setError(loginError);
      } else if (user) {
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#202D2D]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#FFFFFF] border border-[#2F5F5E]/30 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2F5F5E] via-[#E57373] to-[#7CA982]" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 flex items-center justify-center text-[#7A8582] hover:text-[#202D2D] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#2F5F5E]/20 border border-[#2F5F5E]/30 flex items-center justify-center text-[#7CA982]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#202D2D]">SafeSafar Account</h3>
            <p className="text-xs text-[#7A8582]">
              Sign in to sync your emergency guardians & telemetry with database
            </p>
          </div>
        </div>

        {/* Database Connection Badge */}
        <div className="mb-4 flex items-center justify-between p-2.5 rounded-2xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#7CA982]" />
            <span className="text-[11px] text-[#65716F]">
              {isConfigured ? (
                <span className="text-[#7CA982] font-medium">Supabase Cloud Database</span>
              ) : (
                <span className="text-[#B08D28] font-medium">Local Database Mode</span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenDatabaseSetup}
            className="text-[10px] text-[#7CA982] hover:text-[#2F5F5E] underline font-medium"
          >
            Setup / Info
          </button>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="flex border-b border-[#2F5F5E]/15 mb-5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${tab === 'login'
                ? 'border-[#2F5F5E] text-[#202D2D]'
                : 'border-transparent text-[#7A8582] hover:text-[#465552]'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${tab === 'signup'
                ? 'border-[#2F5F5E] text-[#202D2D]'
                : 'border-transparent text-[#7A8582] hover:text-[#465552]'
              }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#E57373]/10 border border-[#E57373]/30 text-xs text-[#E57373] font-medium">
            {error}
          </div>
        )}

        {/* ================================================================= */}
        {/* LOGIN FORM                                                        */}
        {/* ================================================================= */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#7A8582]" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="diya.patel@svnit.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#7A8582]" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3 text-[#7A8582] hover:text-[#202D2D]"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#24504F] to-[#2F5F5E] hover:from-[#2F5F5E] hover:to-[#7CA982] text-[#202D2D] font-bold text-xs shadow-lg shadow-[#24504F]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
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

            {/* Quick Demo Logins for Testing */}
            <div className="pt-3 border-t border-[#2F5F5E]/15">
              <span className="text-[11px] text-[#7A8582] block mb-2 font-medium">
                ⚡ Instant Test Demo Accounts:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('diya.patel@svnit.ac.in')}
                  className="p-2 rounded-xl bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 border border-[#2F5F5E]/15 text-center transition-all group"
                >
                  <span className="text-[11px] font-bold text-[#202D2D] block group-hover:text-[#2F5F5E]">
                    Student
                  </span>
                  <span className="text-[9px] text-[#7A8582] block truncate">Diya Patel</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('rajesh.patel@gmail.com')}
                  className="p-2 rounded-xl bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 border border-[#2F5F5E]/15 text-center transition-all group"
                >
                  <span className="text-[11px] font-bold text-[#202D2D] block group-hover:text-[#2F5F5E]">
                    Guardian
                  </span>
                  <span className="text-[9px] text-[#7A8582] block truncate">Rajesh Patel</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('inspector.kavita@suratpolice.gov.in')}
                  className="p-2 rounded-xl bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 border border-[#2F5F5E]/15 text-center transition-all group"
                >
                  <span className="text-[11px] font-bold text-[#202D2D] block group-hover:text-[#2F5F5E]">
                    Civic / Police
                  </span>
                  <span className="text-[9px] text-[#7A8582] block truncate">Insp. Kavita</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* SIGNUP FORM                                                       */}
        {/* ================================================================= */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1">
                Full Name <span className="text-[#E57373]">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[#7A8582]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diya Patel, Aarav Sharma"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1">
                Email Address <span className="text-[#E57373]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#7A8582]" />
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#7A8582]" />
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 98790 12345"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('commuter')}
                  className={`p-2 rounded-xl border text-center transition-all ${role === 'commuter'
                      ? 'bg-[#24504F]/30 border-[#2F5F5E] text-[#F1D9D9]'
                      : 'bg-[#2F5F5E]/5 border-[#2F5F5E]/15 text-[#7A8582]'
                    }`}
                >
                  <User className="w-3.5 h-3.5 mx-auto mb-1" />
                  <span className="text-[11px] font-semibold block">Commuter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('guardian')}
                  className={`p-2 rounded-xl border text-center transition-all ${role === 'guardian'
                      ? 'bg-[#2F5F5E]/30 border-[#7CA982] text-[#F1D9D9]'
                      : 'bg-[#2F5F5E]/5 border-[#2F5F5E]/15 text-[#7A8582]'
                    }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5 mx-auto mb-1" />
                  <span className="text-[11px] font-semibold block">Guardian</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('civic')}
                  className={`p-2 rounded-xl border text-center transition-all ${role === 'civic'
                      ? 'bg-[#2F5F5E]/30 border-[#7CA982] text-[#F1D9D9]'
                      : 'bg-[#2F5F5E]/5 border-[#2F5F5E]/15 text-[#7A8582]'
                    }`}
                >
                  <Building2 className="w-3.5 h-3.5 mx-auto mb-1" />
                  <span className="text-[11px] font-semibold block">Civic / Police</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1">
                  Password <span className="text-[#E57373]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1">
                  Confirm <span className="text-[#E57373]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#24504F] to-[#2F5F5E] hover:from-[#2F5F5E] hover:to-[#7CA982] text-[#202D2D] font-bold text-xs shadow-lg shadow-[#24504F]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Connect DB</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
