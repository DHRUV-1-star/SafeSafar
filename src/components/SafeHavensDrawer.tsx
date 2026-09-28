import React from 'react';
import { Landmark } from '../types';
import { Shield, Phone, MapPin, Hospital, Clock, X, ArrowUpRight } from 'lucide-react';

interface SafeHavensDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  landmarks: Landmark[];
  onSelectLandmark: (lm: Landmark) => void;
}

export const SafeHavensDrawer: React.FC<SafeHavensDrawerProps> = ({
  isOpen,
  onClose,
  landmarks,
  onSelectLandmark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-3xl p-6 text-white shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Nearest Safe Havens</h3>
              <p className="text-xs text-gray-400">Verified Police, Pink Booths & 24/7 Emergency Outposts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Safe Havens */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {landmarks.map((lm) => {
            const isPink = lm.type === 'pink_booth';
            const isPolice = lm.type === 'police';
            const isHospital = lm.type === 'hospital';

            let typeBadge = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            let label = 'Police Booth';

            if (isPink) {
              typeBadge = 'bg-pink-500/10 text-pink-400 border-pink-500/30';
              label = 'Women Pink Booth';
            } else if (isHospital) {
              typeBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              label = '24/7 Emergency Hospital';
            } else if (lm.type === 'pharmacy') {
              typeBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
              label = '24/7 Medstore Safe Haven';
            }

            return (
              <div
                key={lm.id}
                className="bg-gray-900/60 border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${typeBadge} mb-1.5`}>
                      {label}
                    </span>
                    <h4 className="font-bold text-white text-sm">{lm.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      {lm.address}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-semibold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">
                    {lm.distanceMeters}m away
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-gray-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3.5 h-3.5" />
                    {lm.openHours}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lm.phone.split('/')[0].trim()}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-semibold"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>

                    <button
                      onClick={() => {
                        onSelectLandmark(lm);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
                    >
                      <span>Locate</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
