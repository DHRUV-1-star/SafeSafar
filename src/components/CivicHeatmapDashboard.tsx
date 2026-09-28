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
      <div className="bg-[#111827]/90 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Surat Municipal Corporation (SMC) & Police Safety Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-white">Civic Infrastructure & Safety Heatmap Analytics</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Crowdsourced community hazard reports converted into actionable municipal repairs, streetlight installations, and targeted Pink Police patrol routes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-emerald-400">89.4% Trust Index</div>
            <div className="text-[10px] text-gray-400">Time-decay weighted</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> Unlit Stretches Flagged
          </span>
          <div className="text-2xl font-black text-white mt-2">14 Spots</div>
          <span className="text-[10px] text-emerald-400">8 scheduled for LED retrofits</span>
        </div>

        <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-400" /> Verified Citizen Auditors
          </span>
          <div className="text-2xl font-black text-white mt-2">1,240+</div>
          <span className="text-[10px] text-purple-300">SVNIT & Surat colleges active</span>
        </div>

        <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Safe Trip Completion
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-2">99.2%</div>
          <span className="text-[10px] text-gray-400">Across 3,800 simulated commutes</span>
        </div>

        <div className="bg-[#111827]/80 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" /> Avg SOS Response Time
          </span>
          <div className="text-2xl font-black text-white mt-2">1.8 min</div>
          <span className="text-[10px] text-emerald-400">Direct dispatch to nearest patrol</span>
        </div>
      </div>

      {/* Actionable Civic Intervention Table */}
      <div className="bg-[#111827]/90 border border-white/10 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Priority Municipal Intervention Queue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3">Location / Area</th>
                <th className="pb-3">Hazard Category</th>
                <th className="pb-3">Confirmations</th>
                <th className="pb-3">Civic Action Status</th>
                <th className="pb-3 text-right">Municipal Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 font-semibold text-white">Canal Road Flyover Underpass</td>
                <td className="py-3 text-yellow-400">Pitch Black / 3 Broken Poles</td>
                <td className="py-3 text-gray-300">7 Peer Verified</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                    SMC Work Order Issued
                  </span>
                </td>
                <td className="py-3 text-right text-gray-400 font-mono">Ticket #SMC-2026-881</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 font-semibold text-white">SVNIT East Service Bypass</td>
                <td className="py-3 text-orange-400">Deserted Pedestrian Pathway</td>
                <td className="py-3 text-gray-300">4 Peer Verified</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px]">
                    Pink Patrol Route Adjusted
                  </span>
                </td>
                <td className="py-3 text-right text-gray-400 font-mono">Police Beat #14</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 font-semibold text-white">Kargil Chowk High-Mast Junction</td>
                <td className="py-3 text-emerald-400">100% Illumination & Camera Check</td>
                <td className="py-3 text-gray-300">12 Peer Verified</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px]">
                    Designated Safe Haven
                  </span>
                </td>
                <td className="py-3 text-right text-emerald-400 font-mono">Verified Active ✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
