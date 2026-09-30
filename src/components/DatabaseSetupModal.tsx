import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface DatabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const sqlCode = `-- SafeSafar: PostgreSQL Database Schema
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  role text default 'commuter',
  hub text default 'SVNIT Surat Hub',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.guardians (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  relation text not null,
  phone text not null,
  email text,
  is_emergency_alert boolean default true,
  avatar text,
  battery_status integer default 90,
  last_active text default 'Active now',
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.landmarks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null,
  lat double precision not null,
  lng double precision not null,
  address text,
  phone text,
  open_hours text,
  verified boolean default true,
  distance_meters integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.incidents (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  severity text not null,
  lat double precision not null,
  lng double precision not null,
  title text not null,
  description text,
  timestamp_str text default 'Just now',
  confirmations integer default 1,
  required_confirmations integer default 3,
  verified boolean default false,
  decay_hours_left integer default 48,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
alter table public.guardians enable row level security;
alter table public.landmarks enable row level security;
alter table public.incidents enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own guardians" on public.guardians for select using (auth.uid() = user_id);
create policy "Users can insert own guardians" on public.guardians for insert with check (auth.uid() = user_id);
create policy "Users can update own guardians" on public.guardians for update using (auth.uid() = user_id);
create policy "Users can delete own guardians" on public.guardians for delete using (auth.uid() = user_id);

create policy "Anyone can read landmarks" on public.landmarks for select using (true);
create policy "Anyone can read incidents" on public.incidents for select using (true);
create policy "Anyone can insert incidents" on public.incidents for insert with check (true);
create policy "Anyone can update incidents" on public.incidents for update using (true);`;


  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#111827] border border-purple-500/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Database & Cloud Storage Setup</span>
              {isConfigured ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  ● Cloud Connected
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  ⚡ Local DB Active
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400">
              PostgreSQL database configuration for user authentication and guardian persistence.
            </p>
          </div>
        </div>

        {/* Current Status Callout */}
        <div
          className={`p-4 rounded-2xl border mb-5 ${
            isConfigured
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isConfigured ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              {isConfigured ? (
                <span>
                  <strong>Supabase Cloud Database is connected and active!</strong> All user registrations, logins,
                  and guardian entries are securely saved in PostgreSQL with Row Level Security.
                </span>
              ) : (
                <span>
                  <strong>Currently operating in Local Database Mode.</strong> User accounts and guardian records
                  are saved in persistent local storage per user. To connect your cloud PostgreSQL database, add your
                  Supabase keys to your <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">.env</code> file below.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 Step Setup Guide */}
        <div className="space-y-4 mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
            How to Connect Supabase (Free in 2 Minutes)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[11px]">
                1
              </div>
              <h5 className="font-semibold text-white">Create Free Project</h5>
              <p className="text-gray-400 text-[11px]">
                Sign in to{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-2.5 h-2.5" />
                </a>{' '}
                and create a project.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[11px]">
                2
              </div>
              <h5 className="font-semibold text-white">Run SQL Schema</h5>
              <p className="text-gray-400 text-[11px]">
                Open the Supabase SQL Editor and run the schema script below to create tables & security policies.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[11px]">
                3
              </div>
              <h5 className="font-semibold text-white">Paste Keys in .env</h5>
              <p className="text-gray-400 text-[11px]">
                Copy <code className="text-purple-300">URL</code> and <code className="text-purple-300">anon key</code> into your project's <code className="text-purple-300">.env</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Copyable SQL Schema */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300">SQL Schema Script</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-gray-300 text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
            {sqlCode}
          </pre>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
