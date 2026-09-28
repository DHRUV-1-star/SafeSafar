import React, { useState } from 'react';
import { IncidentReport } from '../types';
import { Lightbulb, AlertTriangle, UserX, EyeOff, ShieldCheck, MapPin, X, CheckCircle2 } from 'lucide-react';

interface CommunityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newReport: Omit<IncidentReport, 'id' | 'timestamp' | 'confirmations' | 'requiredConfirmations' | 'verified' | 'decayHoursLeft'>) => void;
  userLocation: [number, number];
}

export const CommunityReportModal: React.FC<CommunityReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  userLocation,
}) => {
  const [reportType, setReportType] = useState<IncidentReport['type']>('poor_lighting');
  const [severity, setSeverity] = useState<IncidentReport['severity']>('high');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmitReport({
      type: reportType,
      severity: reportType === 'well_lit' ? 'safe' : severity,
      lat: userLocation[0] + (Math.random() * 0.002 - 0.001),
      lng: userLocation[1] + (Math.random() * 0.002 - 0.001),
      title,
      description,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setDescription('');
      onClose();
    }, 1200);
  };

  const types = [
    { id: 'poor_lighting', label: 'Dark / Poor Lighting', icon: <Lightbulb className="w-4 h-4 text-yellow-400" /> },
    { id: 'harassment', label: 'Harassment / Stalking', icon: <AlertTriangle className="w-4 h-4 text-red-400" /> },
    { id: 'deserted', label: 'Isolated / Deserted Spot', icon: <EyeOff className="w-4 h-4 text-orange-400" /> },
    { id: 'suspicious', label: 'Suspicious Loitering', icon: <UserX className="w-4 h-4 text-amber-400" /> },
    { id: 'well_lit', label: 'Verified Safe / Well Lit', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#111827] border border-white/10 rounded-3xl p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Report Submitted!</h3>
            <p className="text-xs text-gray-300 mt-2 max-w-xs mx-auto">
              Sent to SafeSafar Community Trust Engine. Awaiting 2 additional peer verifications before permanently adjusting safety scores.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Report Safety Condition</h3>
                <p className="text-xs text-gray-400">Help sister commuters navigate safely</p>
              </div>
            </div>

            {/* Select Report Type */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-300 block mb-2">Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {types.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setReportType(t.id as IncidentReport['type'])}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      reportType === t.id
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-gray-800/40 border-white/5 hover:border-white/10 text-gray-300'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-300 block mb-1">Spot / Landmark Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken streetlight near Canal crossing"
                required
                className="w-full bg-gray-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-300 block mb-1">Details & Context</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lighting, crowd behavior, or safe shopkeepers nearby..."
                rows={3}
                className="w-full bg-gray-800/80 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Anti-gaming trust note (Page 8) */}
            <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl text-[11px] text-gray-300 mb-5">
              <span className="font-semibold text-purple-300">Trust-Based Verification: </span>
              SafeSafar filters out spam and false reports through peer confirmation and time-based score decay (48h half-life).
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
            >
              Post Safety Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
