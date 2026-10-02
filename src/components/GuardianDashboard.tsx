import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setTempCommuterName(commuterProfile.name);
    setTempCommuterHub(commuterProfile.hub);
  }, [commuterProfile.name, commuterProfile.hub]);

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
        <div className="bg-[#4E2528]/80 border-2 border-[#E57373] rounded-3xl p-5 text-[#202D2D] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-sos-strobe">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D95C5C] flex items-center justify-center text-[#202D2D] shrink-0 shadow-lg">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-[#7C3538] px-2.5 py-0.5 rounded-full">
                {sosState.duressActive ? 'Covert Duress Code Transmitted' : 'Emergency SOS Alert'}
              </span>
              <h2 className="text-xl font-black mt-1">Distress Signal Detected from {commuterProfile.name}</h2>
              <p className="text-xs text-[#F1D9D9] mt-0.5">
                Triggered via: <strong className="uppercase">{sosState.triggerSource.replace('_', ' ')}</strong> • GPS Telemetry Broadcasting to{' '}
                {trustedContacts.length > 0
                  ? `${trustedContacts.length} Guardian(s)`
                  : 'Emergency Response Network'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onShowToast("Initiating call to Surat Police (112)...");
                window.location.href = 'tel:112';
              }}
              className="px-5 py-3 rounded-2xl bg-white text-[#D95C5C] font-bold text-sm hover:bg-[#F4F1EC] shadow-lg flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Surat Police (112)</span>
            </button>
            <button
              onClick={onClearSOS}
              className="px-4 py-3 rounded-2xl bg-[#6B3033]/60 hover:bg-[#7C3538] text-[#202D2D] font-semibold text-xs border border-[#E57373]/40"
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
          <div className="bg-[#FFFFFF]/90 border border-[#2F5F5E]/15 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2F5F5E]/15 gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={commuterProfile.avatar}
                    alt={commuterProfile.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-[#2F5F5E] shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#7CA982] border-2 border-[#FFFFFF]"></span>
                </div>
                {isEditingCommuter ? (
                  <form onSubmit={handleSaveCommuter} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempCommuterName}
                      onChange={(e) => setTempCommuterName(e.target.value)}
                      placeholder="Commuter Name"
                      className="px-2.5 py-1 text-sm bg-[#2F5F5E]/8 border border-[#2F5F5E] rounded-lg text-[#202D2D] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={tempCommuterHub}
                      onChange={(e) => setTempCommuterHub(e.target.value)}
                      placeholder="Hub / Corridor"
                      className="px-2 py-1 text-xs bg-[#2F5F5E]/8 border border-[#2F5F5E]/20 rounded-lg text-[#65716F] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg bg-[#2F5F5E] hover:bg-[#7CA982] text-[#202D2D]"
                      title="Save Name"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCommuter(false)}
                      className="p-1.5 rounded-lg bg-[#2F5F5E]/8 hover:bg-[#2F5F5E]/12 text-[#65716F]"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#202D2D] text-base">{commuterProfile.name}</h3>
                      <button
                        onClick={() => {
                          setTempCommuterName(commuterProfile.name);
                          setTempCommuterHub(commuterProfile.hub);
                          setIsEditingCommuter(true);
                        }}
                        className="text-[#7A8582] hover:text-[#2F5F5E] p-1 rounded transition-colors"
                        title="Edit Commuter Profile"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-[#2F5F5E]">{commuterProfile.hub}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-[#7CA982]/10 border border-[#7CA982]/20 text-[#7CA982] font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Live GPS
                </span>
                <span className="px-3 py-1.5 rounded-full bg-[#2F5F5E]/5 border border-[#2F5F5E]/15 text-[#65716F] font-mono">
                  {batteryLevel}% Bat
                </span>
              </div>
            </div>

            {/* Current Route Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="bg-[#2F5F5E]/5 rounded-2xl p-3 border border-[#2F5F5E]/10">
                <span className="text-[10px] text-[#7A8582] block">Current Route</span>
                <span className="text-xs font-bold text-[#202D2D] line-clamp-1">{activeRoute.name}</span>
                <span className="text-[10px] text-[#7CA982]">Score: {activeRoute.safetyScore}/100</span>
              </div>

              <div className="bg-[#2F5F5E]/5 rounded-2xl p-3 border border-[#2F5F5E]/10">
                <span className="text-[10px] text-[#7A8582] block">Lighting Level</span>
                <span className="text-sm font-bold text-[#7CA982]">{activeRoute.lightingPercent}%</span>
                <span className="text-[10px] text-[#7A8582]">Well illuminated</span>
              </div>

              <div className="bg-[#2F5F5E]/5 rounded-2xl p-3 border border-[#2F5F5E]/10">
                <span className="text-[10px] text-[#7A8582] block">Estimated Arrival</span>
                <span className="text-sm font-bold text-[#2F5F5E]">{activeRoute.durationMin} mins</span>
                <span className="text-[10px] text-[#7A8582]">On Schedule</span>
              </div>

              <div className="bg-[#2F5F5E]/5 rounded-2xl p-3 border border-[#2F5F5E]/10">
                <span className="text-[10px] text-[#7A8582] block">Safe Havens on Path</span>
                <span className="text-sm font-bold text-[#7CA982]">{activeRoute.safeLandmarksCount} Verified</span>
                <span className="text-[10px] text-[#7A8582]">Pink & Police Posts</span>
              </div>
            </div>

            {/* Realtime Breadcrumbs Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A8582] mb-3">Live Journey Breadcrumbs</h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-xs bg-black/30 p-3 rounded-2xl border border-[#2F5F5E]/10">
                  <div className="w-2 h-2 rounded-full bg-[#7CA982] animate-ping shrink-0" />
                  <div className="flex-1">
                    <span className="text-[#202D2D] font-medium">Currently near Piplod / Kargil Chowk</span>
                    <p className="text-[10px] text-[#7A8582]">
                      Lat: {userLocation[0].toFixed(4)}, Long: {userLocation[1].toFixed(4)} • Walking at 4.2 km/h
                    </p>
                  </div>
                  <span className="text-[10px] text-[#7CA982] font-mono">Just now</span>
                </div>

                <div className="flex items-center gap-3 text-xs bg-[#202D2D]/20 p-3 rounded-2xl border border-[#2F5F5E]/10 opacity-80">
                  <div className="w-2 h-2 rounded-full bg-[#2F5F5E] shrink-0" />
                  <div className="flex-1">
                    <span className="text-[#65716F]">Passed SVNIT Security Checkpoint</span>
                    <p className="text-[10px] text-[#7A8582]">Continuous streetlights active</p>
                  </div>
                  <span className="text-[10px] text-[#7A8582] font-mono">3m ago</span>
                </div>

                <div className="flex items-center gap-3 text-xs bg-[#202D2D]/20 p-3 rounded-2xl border border-[#2F5F5E]/10 opacity-60">
                  <div className="w-2 h-2 rounded-full bg-[#2F5F5E] shrink-0" />
                  <div className="flex-1">
                    <span className="text-[#7A8582]">Trip initiated from SVNIT Campus</span>
                  </div>
                  <span className="text-[10px] text-[#7A8582] font-mono">8m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Circle Members & Quick Remote Actions */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF]/90 border border-[#2F5F5E]/15 rounded-3xl p-6 shadow-xl">
            {/* Header with Add Guardian CTA */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#202D2D] flex items-center gap-2">
                  <span>Guardian Safety Circle</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#2F5F5E]/20 text-[#2F5F5E] border border-[#2F5F5E]/30">
                    {trustedContacts.length}
                  </span>
                </h4>
                <p className="text-[11px] text-[#7A8582]">Live companion sync & SOS responders</p>
              </div>

              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 rounded-xl bg-[#24504F] hover:bg-[#2F5F5E] text-[#202D2D] font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#24504F]/20 transition-all hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Guardian</span>
              </button>
            </div>

            {/* Empty State: Only entered guardians appear */}
            {trustedContacts.length === 0 ? (
              <div className="p-5 rounded-2xl bg-black/30 border border-dashed border-[#2F5F5E]/30 text-center space-y-3 my-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#2F5F5E]/10 border border-[#2F5F5E]/20 flex items-center justify-center text-[#7CA982]">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#202D2D]">No Guardians Configured</h5>
                  <p className="text-xs text-[#7A8582] mt-1 max-w-xs mx-auto">
                    Enter your guardian’s details. Only the guardians you enter here will appear and receive live alerts.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleOpenAdd}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#24504F] to-[#2F5F5E] hover:from-[#2F5F5E] hover:to-[#7CA982] text-[#202D2D] font-bold text-xs shadow-lg shadow-[#24504F]/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enter Guardian Details</span>
                  </button>
                  {onLoadSampleContacts && (
                    <button
                      onClick={onLoadSampleContacts}
                      className="text-[11px] text-[#7CA982] hover:text-[#2F5F5E] underline"
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
                    className="p-3.5 rounded-2xl bg-[#2F5F5E]/5 border border-[#2F5F5E]/10 hover:border-[#2F5F5E]/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#2F5F5E]/30 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#202D2D] flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.isEmergencyAlert && (
                              <span
                                className="w-2 h-2 rounded-full bg-[#7CA982]"
                                title="Emergency SOS alerts enabled"
                              />
                            )}
                          </div>
                          <div className="text-[11px] text-[#2F5F5E] font-medium">
                            {c.relation}
                          </div>
                          <div className="text-[10px] text-[#7A8582] flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-[#8A9491]" />
                            <span>{c.phone}</span>
                            {c.email && (
                              <>
                                <span className="text-[#B7B1A8]">•</span>
                                <span className="truncate max-w-[120px]">{c.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] text-[#7CA982] bg-[#7CA982]/10 px-2 py-0.5 rounded-full border border-[#7CA982]/20 font-mono">
                          {c.batteryStatus || 92}% Bat
                        </span>
                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`tel:${c.phone}`}
                            className="p-1.5 rounded-lg bg-[#2F5F5E]/20 hover:bg-[#2F5F5E]/40 text-[#2F5F5E] transition-colors"
                            title={`Call ${c.name}`}
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/10 text-[#65716F] hover:text-[#202D2D] transition-colors"
                            title="Edit details"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-1.5 rounded-lg bg-[#D95C5C]/10 hover:bg-[#D95C5C]/30 text-[#E57373] transition-colors"
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
            <div className="mt-6 pt-5 border-t border-[#2F5F5E]/15 space-y-2">
              <h5 className="text-xs font-semibold text-[#7A8582] uppercase tracking-wider mb-2">
                Guardian Remote Triggers
              </h5>
              
              <button
                onClick={handleSendTestBroadcast}
                className="w-full py-2.5 rounded-xl bg-[#24504F]/20 hover:bg-[#24504F]/30 border border-[#2F5F5E]/30 text-[#F1D9D9] font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-3.5 h-3.5 text-[#7CA982]" />
                <span>Test Live Telemetry Ping to Guardians</span>
              </button>

              <button
                onClick={onTriggerRemoteSOS}
                className="w-full py-2.5 rounded-xl bg-[#D95C5C]/20 hover:bg-[#D95C5C]/30 border border-[#E57373]/40 text-[#E57373] font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#E57373]" />
                <span>Trigger Remote Distress Check</span>
              </button>

              <button
                onClick={() => {
                  onShowToast("Initiating call to Women Police Helpline (1091)...");
                  window.location.href = 'tel:1091';
                }}
                className="w-full py-2.5 rounded-xl bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 border border-[#2F5F5E]/15 text-[#65716F] font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-[#7CA982]" />
                <span>Dial Women Police Helpline 1091</span>
              </button>
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
