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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#202D2D]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-3xl p-6 text-[#202D2D] shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2F5F5E]/15 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E57373]/20 border border-[#E57373]/30 flex items-center justify-center text-[#E57373]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#202D2D]">Nearest Safe Havens</h3>
              <p className="text-xs text-[#7A8582]">Verified Police, Pink Booths & 24/7 Emergency Outposts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7A8582] hover:text-[#202D2D] rounded-full bg-[#2F5F5E]/5"
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

            let typeBadge = 'bg-[#2F5F5E]/10 text-[#7CA982] border-[#2F5F5E]/30';
            let label = 'Police Booth';

            if (isPink) {
              typeBadge = 'bg-[#E57373]/10 text-[#E57373] border-[#E57373]/30';
              label = 'Women Pink Booth';
            } else if (isHospital) {
              typeBadge = 'bg-[#7CA982]/10 text-[#7CA982] border-[#7CA982]/30';
              label = '24/7 Emergency Hospital';
            } else if (lm.type === 'pharmacy') {
              typeBadge = 'bg-[#F9C950]/10 text-[#F9C950] border-[#F9C950]/30';
              label = '24/7 Medstore Safe Haven';
            }

            return (
              <div
                key={lm.id}
                className="bg-[#F4F1EC]/90 border border-[#2F5F5E]/10 hover:border-[#2F5F5E]/20 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${typeBadge} mb-1.5`}>
                      {label}
                    </span>
                    <h4 className="font-bold text-[#202D2D] text-sm">{lm.name}</h4>
                    <p className="text-xs text-[#7A8582] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#8A9491]" />
                      {lm.address}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-semibold text-[#7CA982] bg-[#2F5F5E]/10 px-2 py-1 rounded-lg">
                    {lm.distanceMeters}m away
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2F5F5E]/10 text-xs text-[#7A8582]">
                  <span className="flex items-center gap-1 text-[#7CA982]">
                    <Clock className="w-3.5 h-3.5" />
                    {lm.openHours}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lm.phone.split('/')[0].trim()}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#24504F]/30 hover:bg-[#24504F]/50 text-[#2F5F5E] font-semibold"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>

                    <button
                      onClick={() => {
                        onSelectLandmark(lm);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2F5F5E]/8 hover:bg-[#2F5F5E]/12 text-[#202D2D] font-semibold"
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
