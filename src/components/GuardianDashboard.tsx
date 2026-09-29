import React, { useState } from 'react';
import { ActiveSOSState, TrustedContact, RouteSegment } from '../types';
import {
  Shield,
  Radio,
  Phone,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Send,
  UserCheck,
  Check,
  X,
} from 'lucide-react';
import { GuardianModal } from './GuardianModal';

export interface CommuterProfile {
  name: string;
  hub: string;
  avatar: string;
}

interface GuardianDashboardProps {
  userLocation: [number, number];
  sosState: ActiveSOSState;
  activeRoute: RouteSegment;
  batteryLevel: number;
  trustedContacts: TrustedContact[];
  onTriggerRemoteSOS: () => void;
  onClearSOS: () => void;
  onAddContact: (contact: Omit<TrustedContact, 'id'>) => void;
  onUpdateContact: (id: string, contact: Partial<TrustedContact>) => void;
  onDeleteContact: (id: string) => void;
  onLoadSampleContacts?: () => void;
  commuterProfile: CommuterProfile;
  onUpdateCommuterProfile: (profile: CommuterProfile) => void;
  onShowToast: (msg: string) => void;
}

export const GuardianDashboard: React.FC<GuardianDashboardProps> = ({
  userLocation,
  sosState,
  activeRoute,
  batteryLevel,
  trustedContacts,
  onTriggerRemoteSOS,
  onClearSOS,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onLoadSampleContacts,
  commuterProfile,
  onUpdateCommuterProfile,
  onShowToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<TrustedContact | null>(null);

  // Commuter profile edit inline state
  const [isEditingCommuter, setIsEditingCommuter] = useState(false);
  const [tempCommuterName, setTempCommuterName] = useState(commuterProfile.name);
  const [tempCommuterHub, setTempCommuterHub] = useState(commuterProfile.hub);

  const handleOpenAdd = () => {
    setEditingGuardian(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: TrustedContact) => {
    setEditingGuardian(contact);
    setIsModalOpen(true);
  };

  const handleSaveGuardian = (guardianData: Omit<TrustedContact, 'id'>, existingId?: string) => {
    if (existingId) {
      onUpdateContact(existingId, guardianData);
    } else {
      onAddContact(guardianData);
    }
  };

  const handleDelete = (contact: TrustedContact) => {
    if (window.confirm(`Are you sure you want to remove guardian "${contact.name}"?`)) {
      onDeleteContact(contact.id);
    }
  };

  const handleSaveCommuter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempCommuterName.trim()) return;
    onUpdateCommuterProfile({
      ...commuterProfile,
      name: tempCommuterName.trim(),
      hub: tempCommuterHub.trim() || 'Surat Safe Corridor',
    });
    setIsEditingCommuter(false);
    onShowToast(`✓ Commuter profile updated to "${tempCommuterName.trim()}"`);
  };

  const handleSendTestBroadcast = () => {
    if (trustedContacts.length === 0) {
      onShowToast('⚠️ Please add at least one guardian first.');
      return;
    }
    const names = trustedContacts.map((c) => c.name).join(', ');
    onShowToast(`📡 Live telemetry ping dispatched to: ${names}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if SOS */}
      {sosState.isActive && (
        <div className="bg-red-950/80 border-2 border-red-500 rounded-3xl p-5 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-sos-strobe">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-red-800 px-2.5 py-0.5 rounded-full">
                {sosState.duressActive ? 'Covert Duress Code Transmitted' : 'Emergency SOS Alert'}
              </span>
              <h2 className="text-xl font-black mt-1">Distress Signal Detected from {commuterProfile.name}</h2>
              <p className="text-xs text-red-200 mt-0.5">
                Triggered via: <strong className="uppercase">{sosState.triggerSource.replace('_', ' ')}</strong> • GPS Telemetry Broadcasting to{' '}
                {trustedContacts.length > 0
                  ? `${trustedContacts.length} Guardian(s)`
                  : 'Emergency Response Network'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:112"
              className="px-5 py-3 rounded-2xl bg-white text-red-600 font-bold text-sm hover:bg-gray-100 shadow-lg flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Surat Police (112)</span>
            </a>
            <button
              onClick={onClearSOS}
              className="px-4 py-3 rounded-2xl bg-red-900/60 hover:bg-red-800 text-white font-semibold text-xs border border-red-400/40"
            >
              Acknowledge & Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Status & Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827]/90 border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={commuterProfile.avatar}
                    alt={commuterProfile.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#111827]"></span>
                </div>
                {isEditingCommuter ? (
                  <form onSubmit={handleSaveCommuter} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempCommuterName}
                      onChange={(e) => setTempCommuterName(e.target.value)}
                      placeholder="Commuter Name"
                      className="px-2.5 py-1 text-sm bg-white/10 border border-purple-500 rounded-lg text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={tempCommuterHub}
                      onChange={(e) => setTempCommuterHub(e.target.value)}
                      placeholder="Hub / Corridor"
                      className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded-lg text-gray-300 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="Save Name"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCommuter(false)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{commuterProfile.name}</h3>
                      <button
                        onClick={() => {
                          setTempCommuterName(commuterProfile.name);
                          setTempCommuterHub(commuterProfile.hub);
                          setIsEditingCommuter(true);
                        }}
                        className="text-gray-400 hover:text-purple-300 p-1 rounded transition-colors"
                        title="Edit Commuter Profile"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-purple-300">{commuterProfile.hub}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Live GPS
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-mono">
                  {batteryLevel}% Bat
                </span>
              </div>
            </div>

            {/* Current Route Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Current Route</span>
                <span className="text-xs font-bold text-white line-clamp-1">{activeRoute.name}</span>
                <span className="text-[10px] text-emerald-400">Score: {activeRoute.safetyScore}/100</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Lighting Level</span>
                <span className="text-sm font-bold text-emerald-400">{activeRoute.lightingPercent}%</span>
                <span className="text-[10px] text-gray-400">Well illuminated</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Estimated Arrival</span>
                <span className="text-sm font-bold text-purple-300">{activeRoute.durationMin} mins</span>
                <span className="text-[10px] text-gray-400">On Schedule</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Safe Havens on Path</span>
                <span className="text-sm font-bold text-blue-400">{activeRoute.safeLandmarksCount} Verified</span>
                <span className="text-[10px] text-gray-400">Pink & Police Posts</span>
              </div>
            </div>

            {/* Realtime Breadcrumbs Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Live Journey Breadcrumbs</h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-xs bg-black/30 p-3 rounded-2xl border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div className="flex-1">
                    <span className="text-white font-medium">Currently near Piplod / Kargil Chowk</span>
                    <p className="text-[10px] text-gray-400">
                      Lat: {userLocation[0].toFixed(4)}, Long: {userLocation[1].toFixed(4)} • Walking at 4.2 km/h
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Just now</span>
                </div>

                <div className="flex items-center gap-3 text-xs bg-black/20 p-3 rounded-2xl border border-white/5 opacity-80">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-300">Passed SVNIT Security Checkpoint</span>
                    <p className="text-[10px] text-gray-400">Continuous streetlights active</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">3m ago</span>
                </div>

                <div className="flex items-center gap-3 text-xs bg-black/20 p-3 rounded-2xl border border-white/5 opacity-60">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-400">Trip initiated from SVNIT Campus</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">8m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Circle Members & Quick Remote Actions */}
        <div className="space-y-6">
          <div className="bg-[#111827]/90 border border-white/10 rounded-3xl p-6 shadow-xl">
            {/* Header with Add Guardian CTA */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Guardian Safety Circle</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {trustedContacts.length}
                  </span>
                </h4>
                <p className="text-[11px] text-gray-400">Live companion sync & SOS responders</p>
              </div>

              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Guardian</span>
              </button>
            </div>

            {/* Empty State: Only entered guardians appear */}
            {trustedContacts.length === 0 ? (
              <div className="p-5 rounded-2xl bg-black/30 border border-dashed border-purple-500/30 text-center space-y-3 my-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">No Guardians Configured</h5>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Enter your guardian’s details. Only the guardians you enter here will appear and receive live alerts.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleOpenAdd}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enter Guardian Details</span>
                  </button>
                  {onLoadSampleContacts && (
                    <button
                      onClick={onLoadSampleContacts}
                      className="text-[11px] text-purple-400 hover:text-purple-300 underline"
                    >
                      Or load sample demo guardians
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {trustedContacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-10 h-10 rounded-full object-cover border border-purple-500/30 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.isEmergencyAlert && (
                              <span
                                className="w-2 h-2 rounded-full bg-emerald-400"
                                title="Emergency SOS alerts enabled"
                              />
                            )}
                          </div>
                          <div className="text-[11px] text-purple-300 font-medium">
                            {c.relation}
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-gray-500" />
                            <span>{c.phone}</span>
                            {c.email && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="truncate max-w-[120px]">{c.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                          {c.batteryStatus || 92}% Bat
                        </span>
                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`tel:${c.phone}`}
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 transition-colors"
                            title={`Call ${c.name}`}
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                            title="Edit details"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/30 text-red-300 transition-colors"
                            title="Remove guardian"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Remote Emergency Actions */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Guardian Remote Triggers
              </h5>
              
              <button
                onClick={handleSendTestBroadcast}
                className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-3.5 h-3.5 text-purple-400" />
                <span>Test Live Telemetry Ping to Guardians</span>
              </button>

              <button
                onClick={onTriggerRemoteSOS}
                className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Trigger Remote Distress Check</span>
              </button>

              <a
                href="tel:1091"
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Dial Women Police Helpline 1091</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Guardian Add/Edit Modal */}
      <GuardianModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGuardian}
        editingGuardian={editingGuardian}
      />
    </div>
  );
};
