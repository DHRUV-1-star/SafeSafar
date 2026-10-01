import React from 'react';
import { IncidentReport } from '../types';
import { BarChart3, AlertOctagon, Lightbulb, ShieldCheck, CheckCircle2, TrendingUp, Users, Building2 } from 'lucide-react';

interface CivicHeatmapDashboardProps {
  incidents: IncidentReport[];
}

export const CivicHeatmapDashboard: React.FC<CivicHeatmapDashboardProps> = ({ incidents }) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#FFFFFF]/90 border border-[#2F5F5E]/15 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7CA982] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Surat Municipal Corporation (SMC) & Police Safety Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-[#202D2D]">Civic Infrastructure & Safety Heatmap Analytics</h2>
          <p className="text-xs text-[#7A8582] mt-1 max-w-xl">
            Crowdsourced community hazard reports converted into actionable municipal repairs, streetlight installations, and targeted Pink Police patrol routes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#7CA982]/10 border border-[#7CA982]/20 px-3.5 py-2 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-[#7CA982]" />
          <div>
            <div className="text-xs font-bold text-[#7CA982]">89.4% Trust Index</div>
            <div className="text-[10px] text-[#7A8582]">Time-decay weighted</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF]/80 border border-[#2F5F5E]/15 rounded-2xl p-4">
          <span className="text-xs text-[#7A8582] flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> Unlit Stretches Flagged
          </span>
          <div className="text-2xl font-black text-[#202D2D] mt-2">14 Spots</div>
          <span className="text-[10px] text-[#7CA982]">8 scheduled for LED retrofits</span>
        </div>

        <div className="bg-[#FFFFFF]/80 border border-[#2F5F5E]/15 rounded-2xl p-4">
          <span className="text-xs text-[#7A8582] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#7CA982]" /> Verified Citizen Auditors
          </span>
          <div className="text-2xl font-black text-[#202D2D] mt-2">1,240+</div>
          <span className="text-[10px] text-[#2F5F5E]">SVNIT & Surat colleges active</span>
        </div>

        <div className="bg-[#FFFFFF]/80 border border-[#2F5F5E]/15 rounded-2xl p-4">
          <span className="text-xs text-[#7A8582] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#7CA982]" /> Safe Trip Completion
          </span>
          <div className="text-2xl font-black text-[#7CA982] mt-2">99.2%</div>
          <span className="text-[10px] text-[#7A8582]">Across 3,800 simulated commutes</span>
        </div>

        <div className="bg-[#FFFFFF]/80 border border-[#2F5F5E]/15 rounded-2xl p-4">
          <span className="text-xs text-[#7A8582] flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-[#E57373]" /> Avg SOS Response Time
          </span>
          <div className="text-2xl font-black text-[#202D2D] mt-2">1.8 min</div>
          <span className="text-[10px] text-[#7CA982]">Direct dispatch to nearest patrol</span>
        </div>
      </div>

      {/* Actionable Civic Intervention Table */}
      <div className="bg-[#FFFFFF]/90 border border-[#2F5F5E]/15 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-[#202D2D] mb-4">Priority Municipal Intervention Queue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2F5F5E]/15 text-[#7A8582] uppercase tracking-wider text-[10px]">
                <th className="pb-3">Location / Area</th>
                <th className="pb-3">Hazard Category</th>
                <th className="pb-3">Confirmations</th>
                <th className="pb-3">Civic Action Status</th>
                <th className="pb-3 text-right">Municipal Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-[#2F5F5E]/5 transition-colors">
                <td className="py-3 font-semibold text-[#202D2D]">Canal Road Flyover Underpass</td>
                <td className="py-3 text-yellow-400">Pitch Black / 3 Broken Poles</td>
                <td className="py-3 text-[#65716F]">7 Peer Verified</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#F9C950]/10 text-[#B08D28] border border-[#F9C950]/20 text-[10px]">
                    SMC Work Order Issued
                  </span>
                </td>
                <td className="py-3 text-right text-[#7A8582] font-mono">Ticket #SMC-2026-881</td>
              </tr>
              <tr className="hover:bg-[#2F5F5E]/5 transition-colors">
                <td className="py-3 font-semibold text-[#202D2D]">SVNIT East Service Bypass</td>
                <td className="py-3 text-[#B08D28]">Deserted Pedestrian Pathway</td>
                <td className="py-3 text-[#65716F]">4 Peer Verified</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#2F5F5E]/10 text-[#2F5F5E] border border-[#2F5F5E]/20 text-[10px]">
                    Pink Patrol Route Adjusted
                  </span>
                </td>
                <td className="py-3 text-right text-[#7A8582] font-mono">Police Beat #14</td>
              </tr>
              <tr className="hover:bg-[#2F5F5E]/5 transition-colors">
                <td className="py-3 font-semibold text-[#202D2D]">Kargil Chowk High-Mast Junction</td>
                <td className="py-3 text-[#7CA982]">100% Illumination & Camera Check</td>
                <td className="py-3 text-[#65716F]">12 Peer Verified</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#7CA982]/10 text-[#2F5F5E] border border-[#7CA982]/20 text-[10px]">
                    Designated Safe Haven
                  </span>
                </td>
                <td className="py-3 text-right text-[#7CA982] font-mono">Verified Active ✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
