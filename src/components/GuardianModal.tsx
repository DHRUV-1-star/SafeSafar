import React, { useState, useEffect } from 'react';
import { TrustedContact } from '../types';
import { X, User, Phone, Mail, Heart, Shield, Check, UserPlus } from 'lucide-react';

interface GuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guardian: Omit<TrustedContact, 'id'>, existingId?: string) => void;
  editingGuardian?: TrustedContact | null;
}

const COMMON_RELATIONS = [
  'Mother',
  'Father',
  'Sister',
  'Brother',
  'Spouse',
  'Best Friend',
  'Roommate',
  'Guardian',
  'Colleague',
  'Emergency Contact',
];

export const GuardianModal: React.FC<GuardianModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGuardian,
}) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Parent');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isEmergencyAlert, setIsEmergencyAlert] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingGuardian) {
      setName(editingGuardian.name);
      setRelation(editingGuardian.relation);
      setPhone(editingGuardian.phone);
      setEmail(editingGuardian.email || '');
      setIsEmergencyAlert(editingGuardian.isEmergencyAlert);
    } else {
      setName('');
      setRelation('Mother');
      setPhone('');
      setEmail('');
      setIsEmergencyAlert(true);
    }
    setError(null);
  }, [editingGuardian, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter the guardian’s full name');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a valid phone number');
      return;
    }

    const cleanName = name.trim();
    // Build personalized avatar
    const avatar =
      editingGuardian?.avatar && !editingGuardian.avatar.includes('dicebear')
        ? editingGuardian.avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=7c3aed,4f46e5,db2777`;

    onSave(
      {
        name: cleanName,
        relation: relation.trim() || 'Guardian',
        phone: phone.trim(),
        email: email.trim() || undefined,
        isEmergencyAlert,
        avatar,
        batteryStatus: editingGuardian?.batteryStatus ?? Math.floor(Math.random() * 20) + 80,
        lastActive: 'Active now',
      },
      editingGuardian?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#111827] border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            {editingGuardian ? <Shield className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {editingGuardian ? 'Edit Guardian Details' : 'Add Emergency Guardian'}
            </h3>
            <p className="text-xs text-gray-400">
              Only guardians you add will have access to your live safety tracking and SOS alerts.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Guardian's Full Name <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patel, Priya Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Relationship <span className="text-pink-400">*</span>
            </label>
            <div className="relative mb-2">
              <Heart className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. Mother, Father, Friend"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            {/* Quick Relation Chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_RELATIONS.slice(0, 6).map((rel) => (
                <button
                  type="button"
                  key={rel}
                  onClick={() => setRelation(rel)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    relation.toLowerCase() === rel.toLowerCase()
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/10'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-gray-500 text-[10px]">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guardian@mail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency SOS notification toggle */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
              <input
                type="checkbox"
                checked={isEmergencyAlert}
                onChange={(e) => setIsEmergencyAlert(e.target.checked)}
                className="mt-0.5 rounded border-white/20 text-purple-600 focus:ring-purple-500 bg-gray-900"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Send Instant SOS & Duress Broadcast
                </span>
                <span className="text-[11px] text-gray-400 leading-tight block">
                  Automatically alert this guardian via SMS & live location link when emergency is triggered.
                </span>
              </div>
            </label>
          </div>

          {/* Live Preview Card */}
          {name.trim() && (
            <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-xs border border-white/10">
                  {name.trim().slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{name.trim()}</div>
                  <div className="text-[10px] text-purple-300">
                    {relation || 'Guardian'} • {phone || 'No phone entered'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Ready to sync
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingGuardian ? 'Update Guardian' : 'Save Guardian'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
