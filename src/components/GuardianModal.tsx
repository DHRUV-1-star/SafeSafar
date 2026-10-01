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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#202D2D]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-[#FFFFFF] border border-[#2F5F5E]/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2F5F5E] via-[#E57373] to-[#7CA982]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 flex items-center justify-center text-[#7A8582] hover:text-[#202D2D] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#2F5F5E]/20 border border-[#2F5F5E]/30 flex items-center justify-center text-[#7CA982]">
            {editingGuardian ? <Shield className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#202D2D]">
              {editingGuardian ? 'Edit Guardian Details' : 'Add Emergency Guardian'}
            </h3>
            <p className="text-xs text-[#7A8582]">
              Only guardians you add will have access to your live safety tracking and SOS alerts.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#E57373]/10 border border-[#E57373]/30 text-xs text-[#E57373] font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1.5">
              Guardian's Full Name <span className="text-[#E57373]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-[#7A8582]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patel, Priya Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1.5">
              Relationship <span className="text-[#E57373]">*</span>
            </label>
            <div className="relative mb-2">
              <Heart className="absolute left-3.5 top-3 w-4 h-4 text-[#7A8582]" />
              <input
                type="text"
                required
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. Mother, Father, Friend"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
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
                      ? 'bg-[#24504F]/30 border-[#2F5F5E] text-[#F1D9D9]'
                      : 'bg-[#2F5F5E]/5 border-[#2F5F5E]/15 text-[#7A8582] hover:text-[#465552] hover:bg-[#2F5F5E]/8'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-[#E57373]">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#7A8582]" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#65716F] uppercase tracking-wider mb-1.5">
                Email Address <span className="text-[#8A9491] text-[10px]">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#7A8582]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guardian@mail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#202D2D] placeholder-gray-500 text-sm focus:outline-none focus:border-[#2F5F5E] focus:ring-1 focus:ring-[#2F5F5E]"
                />
              </div>
            </div>
          </div>

          {/* Emergency SOS notification toggle */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 cursor-pointer hover:bg-[#2F5F5E]/8 transition-all">
              <input
                type="checkbox"
                checked={isEmergencyAlert}
                onChange={(e) => setIsEmergencyAlert(e.target.checked)}
                className="mt-0.5 rounded border-[#2F5F5E]/20 text-[#24504F] focus:ring-[#2F5F5E] bg-[#F4F1EC]"
              />
              <div>
                <span className="text-xs font-semibold text-[#202D2D] block">
                  Send Instant SOS & Duress Broadcast
                </span>
                <span className="text-[11px] text-[#7A8582] leading-tight block">
                  Automatically alert this guardian via SMS & live location link when emergency is triggered.
                </span>
              </div>
            </label>
          </div>

          {/* Live Preview Card */}
          {name.trim() && (
            <div className="p-3 rounded-2xl bg-[#202D2D]/40 border border-[#2F5F5E]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#24504F] to-[#C85D67] flex items-center justify-center font-bold text-[#202D2D] text-xs border border-[#2F5F5E]/15">
                  {name.trim().slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#202D2D]">{name.trim()}</div>
                  <div className="text-[10px] text-[#2F5F5E]">
                    {relation || 'Guardian'} • {phone || 'No phone entered'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#7CA982] bg-[#7CA982]/10 px-2 py-0.5 rounded-full border border-[#7CA982]/20">
                Ready to sync
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2F5F5E]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 text-[#65716F] text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#24504F] to-[#2F5F5E] hover:from-[#2F5F5E] hover:to-[#7CA982] text-[#202D2D] text-xs font-bold shadow-lg shadow-[#24504F]/30 flex items-center gap-2 transition-all"
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
