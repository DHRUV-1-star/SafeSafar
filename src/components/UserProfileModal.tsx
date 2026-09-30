import React, { useState, useRef } from 'react';
import { 
  X, 
  Shield, 
  Phone, 
  Mail, 
  Check, 
  LogOut, 
  Edit3, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Bell, 
  Navigation, 
  Compass, 
  HeartHandshake, 
  ChevronRight,
  Camera
} from 'lucide-react';
import { UserProfile, TrustedContact } from '../types';
import { UserAvatar } from './UserAvatar';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  trustedContacts: TrustedContact[];
  onUpdateTrustedContacts: (contacts: TrustedContact[]) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  trustedContacts,
  onUpdateTrustedContacts,
  onLogout,
}) => {
  // State for sub-modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [pinModalMode, setPinModalMode] = useState<'duress' | 'disarm' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone.replace('+91', '').trim());
  const [editEmail, setEditEmail] = useState(currentUser.email || '');
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add/Edit Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('Mother');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);

  // Walk Me Home Settings State
  const [walkSettings, setWalkSettings] = useState({
    defaultContactId: trustedContacts.find((c) => c.isPrimary)?.id || trustedContacts[0]?.id || '',
    checkInIntervalMinutes: 10,
    autoSafeArrival: true,
    routeDeviationAlerts: true,
  });

  // Privacy & Location Settings State
  const [privacySettings, setPrivacySettings] = useState({
    locationSharing: 'while_traveling', // 'while_traveling' | 'always' | 'sos_only'
    liveTripVisibility: true,
    dataTelemetryEncrypted: true,
  });

  // Notification Toggles State
  const [notifications, setNotifications] = useState({
    sosAlerts: true,
    tripUpdates: true,
    communityAlerts: true,
  });

  // PIN Change Form State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile Photo Upload & Validation
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setAvatarError('Image file size exceeds 3 MB. Please choose a smaller photo.');
      return;
    }

    setAvatarError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTempAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    const formattedPhone = editPhone.startsWith('+91') ? editPhone : `+91 ${editPhone}`;
    onUpdateUser({
      ...currentUser,
      name: editName.trim(),
      phone: formattedPhone,
      email: editEmail.trim() || undefined,
      avatar: tempAvatar !== null ? tempAvatar : currentUser.avatar,
    });
    setIsEditProfileOpen(false);
    showToast('Profile and photo updated successfully.');
  };

  // Open Add Contact
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactName('');
    setContactPhone('');
    setContactRelation('Mother');
    setContactIsPrimary(trustedContacts.length === 0);
    setIsAddContactOpen(true);
  };

  // Open Edit Contact
  const handleOpenEditContact = (contact: TrustedContact) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactPhone(contact.phone.replace('+91', '').trim());
    setContactRelation(contact.relation);
    setContactIsPrimary(!!contact.isPrimary);
    setIsAddContactOpen(true);
  };

  // Save Contact (Add or Update)
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    const formattedPhone = contactPhone.startsWith('+91') ? contactPhone : `+91 ${contactPhone}`;

    if (editingContact) {
      // Update existing
      const updatedList = trustedContacts.map((c) => {
        if (c.id === editingContact.id) {
          return {
            ...c,
            name: contactName.trim(),
            phone: formattedPhone,
            relation: contactRelation,
            isPrimary: contactIsPrimary,
          };
        }
        // If this one is marked primary, unmark others
        if (contactIsPrimary) {
          return { ...c, isPrimary: false };
        }
        return c;
      });
      onUpdateTrustedContacts(updatedList);
      showToast(`Updated contact: ${contactName}`);
    } else {
      // Add new
      const newContact: TrustedContact = {
        id: `tc-${Date.now()}`,
        name: contactName.trim(),
        relation: contactRelation,
        phone: formattedPhone,
        isEmergencyAlert: true,
        isPrimary: contactIsPrimary || trustedContacts.length === 0,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        batteryStatus: 85,
        lastActive: 'Active now',
      };

      const updatedList: TrustedContact[] = contactIsPrimary
        ? [...trustedContacts.map((c) => ({ ...c, isPrimary: false })), newContact]
        : [...trustedContacts, newContact];

      onUpdateTrustedContacts(updatedList);
      showToast(`Added ${contactName} to trusted contacts.`);
    }

    setIsAddContactOpen(false);
  };

  // Delete Contact
  const handleDeleteContact = (id: string, name: string) => {
    const updated = trustedContacts.filter((c) => c.id !== id);
    // If deleted contact was primary and others exist, make first one primary
    if (updated.length > 0 && !updated.some((c) => c.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onUpdateTrustedContacts(updated);
    showToast(`Removed ${name} from trusted contacts.`);
  };

  // Make Primary Contact
  const handleMakePrimary = (id: string) => {
    const updated = trustedContacts.map((c) => ({
      ...c,
      isPrimary: c.id === id,
    }));
    onUpdateTrustedContacts(updated);
    showToast('Primary emergency contact updated.');
  };

  // Open PIN Change Modal
  const handleOpenPinModal = (mode: 'duress' | 'disarm') => {
    setPinModalMode(mode);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinError(null);
  };

  // Save PIN Change
  const handleSavePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    const actualCurrentPin = pinModalMode === 'duress' ? currentUser.duressPin : currentUser.normalPin;

    if (currentPinInput !== actualCurrentPin) {
      setPinError('Current PIN does not match.');
      return;
    }

    if (newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setPinError('New PIN must be exactly 4 numeric digits.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinError('New PINs do not match.');
      return;
    }

    if (pinModalMode === 'duress') {
      onUpdateUser({ ...currentUser, duressPin: newPinInput });
      showToast('Duress Panic PIN updated successfully.');
    } else {
      onUpdateUser({ ...currentUser, normalPin: newPinInput });
      showToast('Safe Disarm PIN updated successfully.');
    }

    setPinModalMode(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[60] bg-[#161f30] border border-purple-500/30 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-2xl bg-[#0F1422] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-gray-100 my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Sticky Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#0F1422]/95 backdrop-blur sticky top-0 z-20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Account & Safety Profile</h2>
            <p className="text-xs text-gray-400">Manage your profile, trusted contacts, and safety settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* ========================================================= */}
          {/* SECTION 1: PROFILE HEADER                                 */}
          {/* ========================================================= */}
          <div className="bg-[#141B2D] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div
                className="relative group cursor-pointer"
                onClick={() => {
                  setEditName(currentUser.name);
                  setEditPhone(currentUser.phone.replace('+91', '').trim());
                  setEditEmail(currentUser.email || '');
                  setTempAvatar(null);
                  setAvatarError(null);
                  setIsEditProfileOpen(true);
                }}
                title="Click to edit profile or change photo"
              >
                <UserAvatar name={currentUser.name} avatar={currentUser.avatar} size="lg" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#141B2D] flex items-center justify-center z-10" title="Verified SafeSafar Member">
                  <Check className="w-3 h-3 text-white" />
                </span>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
                  <span className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-mono flex items-center justify-center sm:justify-start gap-1.5">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {currentUser.phone}
                </p>
                {currentUser.email && (
                  <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {currentUser.email}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone.replace('+91', '').trim());
                setEditEmail(currentUser.email || '');
                setTempAvatar(null);
                setAvatarError(null);
                setIsEditProfileOpen(true);
              }}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 rounded-xl transition-colors flex items-center gap-1.5 self-center sm:self-start"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: TRUSTED CONTACTS                               */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-purple-400" />
                  Trusted Contacts
                </h4>
                <p className="text-xs text-gray-400">
                  People who can be notified during your journeys or emergencies.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddContact}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            {/* Contacts List */}
            <div className="space-y-2">
              {trustedContacts.length === 0 ? (
                <div className="bg-[#141B2D]/50 border border-dashed border-white/10 rounded-2xl p-6 text-center text-xs text-gray-400 space-y-2">
                  <p>No trusted contacts added yet.</p>
                  <button
                    type="button"
                    onClick={handleOpenAddContact}
                    className="text-purple-400 hover:text-purple-300 font-semibold underline"
                  >
                    + Add your first trusted contact
                  </button>
                </div>
              ) : (
                trustedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-[#141B2D] border border-white/5 hover:border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-sm shrink-0">
                        {contact.relation === 'Mother' ? '👩' : contact.relation === 'Father' ? '👨' : '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{contact.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium bg-black/30 px-2 py-0.5 rounded-md">
                            {contact.relation}
                          </span>
                          {contact.isPrimary && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              Primary contact
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{contact.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!contact.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleMakePrimary(contact.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Set as primary contact"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditContact(contact)}
                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        title="Edit contact"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(contact.id, contact.name)}
                        className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Remove contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 3: WALK ME HOME SETTINGS                          */}
          {/* ========================================================= */}
          <div className="bg-[#141B2D] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-purple-400" />
                  Walk Me Home
                </h4>
                <p className="text-xs text-gray-400">
                  Settings for automated check-ins and live companion alerts.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* Default Contact */}
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div>
                  <p className="font-semibold text-white">Default Trusted Contact</p>
                  <p className="text-[11px] text-gray-400">Receives trip alerts automatically on departure</p>
                </div>
                <select
                  value={walkSettings.defaultContactId}
                  onChange={(e) => setWalkSettings({ ...walkSettings, defaultContactId: e.target.value })}
                  className="bg-[#0B0F19] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {trustedContacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.relation})
                    </option>
                  ))}
                  {trustedContacts.length === 0 && <option value="">No contacts available</option>}
                </select>
              </div>

              {/* Check-in Interval */}
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div>
                  <p className="font-semibold text-white">Safety Check-in Interval</p>
                  <p className="text-[11px] text-gray-400">Prompts you with "Are you safe?" during travels</p>
                </div>
                <div className="flex bg-[#0B0F19] border border-white/10 rounded-lg p-0.5">
                  {[5, 10, 15].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setWalkSettings({ ...walkSettings, checkInIntervalMinutes: mins })}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        walkSettings.checkInIntervalMinutes === mins
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Automatic Safe Arrival */}
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div>
                  <p className="font-semibold text-white">Automatic Safe Arrival Notification</p>
                  <p className="text-[11px] text-gray-400">Sends safe arrival SMS when you enter destination boundary</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWalkSettings({ ...walkSettings, autoSafeArrival: !walkSettings.autoSafeArrival })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    walkSettings.autoSafeArrival ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>

              {/* Route Deviation Alerts */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="font-semibold text-white">Route Deviation Alerts</p>
                  <p className="text-[11px] text-gray-400">Triggers countdown check-in if you wander into unverified alleys</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWalkSettings({ ...walkSettings, routeDeviationAlerts: !walkSettings.routeDeviationAlerts })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    walkSettings.routeDeviationAlerts ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 4: SAFETY & SECURITY                              */}
          {/* ========================================================= */}
          <div className="bg-[#141B2D] border border-white/5 rounded-2xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Safety & Security
              </h4>
              <p className="text-xs text-gray-400">
                Manage emergency passkeys and covert distress triggers.
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {/* Duress PIN */}
              <button
                type="button"
                onClick={() => handleOpenPinModal('duress')}
                className="w-full bg-[#0B0F19]/60 hover:bg-[#0B0F19] border border-white/5 p-3 rounded-xl flex items-center justify-between text-left transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Duress Panic PIN</span>
                    <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-mono">
                      Configured ••••
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Silently dispatches police and opens the Decoy Calculator screen
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
              </button>

              {/* Safe Disarm PIN */}
              <button
                type="button"
                onClick={() => handleOpenPinModal('disarm')}
                className="w-full bg-[#0B0F19]/60 hover:bg-[#0B0F19] border border-white/5 p-3 rounded-xl flex items-center justify-between text-left transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Safe Disarm PIN</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                      Configured ••••
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Disarms active SOS alarms safely without sending distress alerts
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
              </button>

              {/* Fake Call Settings info row */}
              <div className="bg-[#0B0F19]/60 border border-white/5 p-3 rounded-xl flex items-center justify-between text-left">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Fake Call Speech Triggers</span>
                    <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      Keywords Active
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Secret phrases (&ldquo;reach soon&rdquo;, &ldquo;traffic&rdquo;, &ldquo;red&rdquo;) trigger covert SOS during realistic calls
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">Enabled</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 5: PRIVACY & LOCATION                             */}
          {/* ========================================================= */}
          <div className="bg-[#141B2D] border border-white/5 rounded-2xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                Privacy & Location
              </h4>
              <p className="text-xs text-gray-400">
                Control when and how your journey telemetry is shared.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div>
                  <p className="font-semibold text-white">Location Sharing</p>
                  <p className="text-[11px] text-gray-400">Control when SafeSafar accesses device GPS</p>
                </div>
                <select
                  value={privacySettings.locationSharing}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, locationSharing: e.target.value })}
                  className="bg-[#0B0F19] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="while_traveling">While Navigating</option>
                  <option value="sos_only">Emergency SOS Only</option>
                  <option value="always">Always Allowed</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div>
                  <p className="font-semibold text-white">Live Trip Visibility</p>
                  <p className="text-[11px] text-gray-400">Allow trusted contacts to view your live breadcrumbs during active trips</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacySettings({ ...privacySettings, liveTripVisibility: !privacySettings.liveTripVisibility })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    privacySettings.liveTripVisibility ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="font-semibold text-white">Data & Privacy</p>
                  <p className="text-[11px] text-gray-400">Zero persistent route history. Encrypted breadcrumbs fade after 48 hours</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Protected
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 6: NOTIFICATIONS                                  */}
          {/* ========================================================= */}
          <div className="bg-[#141B2D] border border-white/5 rounded-2xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                Notifications
              </h4>
              <p className="text-xs text-gray-400">
                Manage automated safety updates and incident alerts.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div>
                  <p className="font-semibold text-white">SOS Alerts</p>
                  <p className="text-[11px] text-gray-400">Receive high-priority emergency notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, sosAlerts: !notifications.sosAlerts })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    notifications.sosAlerts ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div>
                  <p className="font-semibold text-white">Trip Updates</p>
                  <p className="text-[11px] text-gray-400">Departure, arrival, and route status notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, tripUpdates: !notifications.tripUpdates })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    notifications.tripUpdates ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="font-semibold text-white">Community Alerts</p>
                  <p className="text-[11px] text-gray-400">Real-time reports on darkness pockets and street lighting updates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, communityAlerts: !notifications.communityAlerts })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    notifications.communityAlerts ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 7: APP INFORMATION & SIGN OUT                     */}
          {/* ========================================================= */}
          <div className="pt-2 border-t border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
              <div>
                <p className="font-bold text-gray-300">About SafeSafar</p>
                <p className="text-[11px] text-gray-500">Version 1.0.0</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <button type="button" onClick={() => showToast('Help & Support: support@safesafar.org')} className="hover:text-white transition-colors">
                  Help & Support
                </button>
                <span>•</span>
                <button type="button" onClick={() => showToast('End-to-End Encrypted Telemetry Policy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
                <span>•</span>
                <button type="button" onClick={() => showToast('SafeSafar Terms of Safe Transit')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </div>
            </div>

            {/* Distinct Sign Out Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-MODAL 1: EDIT PROFILE                                 */}
      {/* ========================================================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#111726] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit Profile Details</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Profile Photo Section */}
              <div className="p-4 bg-[#0B0F19] border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Profile Photo</span>
                <div className="relative group">
                  <div className="p-1 rounded-full ring-2 ring-purple-500/30">
                    <UserAvatar
                      name={editName || currentUser.name}
                      avatar={tempAvatar !== null ? tempAvatar : currentUser.avatar}
                      size="xl"
                      className="shadow-xl"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-transform active:scale-95"
                    title="Upload Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-[11px] transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3 h-3 text-purple-400" />
                    <span>Change Photo</span>
                  </button>

                  {((tempAvatar !== null && tempAvatar !== '') || (tempAvatar === null && currentUser.avatar)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempAvatar('');
                        setAvatarError(null);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold text-[11px] transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {avatarError ? (
                  <p className="text-[11px] text-red-400 text-center font-medium">{avatarError}</p>
                ) : (
                  <p className="text-[10px] text-gray-500 text-center">
                    Supports JPG, PNG, WEBP (Max 3MB). Circular preview updates instantly.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Phone Number</label>
                <div className="flex bg-[#0B0F19] border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500">
                  <span className="px-3 py-2 text-xs font-bold text-gray-400 border-r border-white/10">+91</span>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-transparent px-3 py-2 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODAL 2: ADD / EDIT TRUSTED CONTACT                   */}
      {/* ========================================================= */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#111726] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingContact ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
              </h3>
              <button onClick={() => setIsAddContactOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sushila Patel"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Phone Number</label>
                <div className="flex bg-[#0B0F19] border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500">
                  <span className="px-3 py-2 text-xs font-bold text-gray-400 border-r border-white/10">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="98790 12345"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-transparent px-3 py-2 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Relationship</label>
                <select
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Friend">Friend</option>
                  <option value="Partner">Partner</option>
                  <option value="Roommate">Roommate</option>
                  <option value="Other">Other Trusted Person</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="make-primary"
                  checked={contactIsPrimary}
                  onChange={(e) => setContactIsPrimary(e.target.checked)}
                  className="rounded border-white/20 bg-[#0B0F19] text-purple-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="make-primary" className="text-gray-300 text-xs font-medium cursor-pointer">
                  Make primary emergency contact
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
                >
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODAL 3: CHANGE SECURITY PIN (DURESS OR DISARM)       */}
      {/* ========================================================= */}
      {pinModalMode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#111726] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {pinModalMode === 'duress' ? 'Change Duress Panic PIN' : 'Change Safe Disarm PIN'}
                </h3>
                <p className="text-xs text-gray-400">
                  {pinModalMode === 'duress'
                    ? 'This PIN secretly alerts police & triggers the Decoy Calculator'
                    : 'This PIN securely cancels active SOS distress alarms'}
                </p>
              </div>
              <button onClick={() => setPinModalMode(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-3 py-2 rounded-xl">
                {pinError}
              </div>
            )}

            <form onSubmit={handleSavePinChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Current PIN</label>
                <div className="relative">
                  <input
                    type={showCurrentPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">New 4-Digit PIN</label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPinModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500"
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
