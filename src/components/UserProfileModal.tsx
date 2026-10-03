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
        <div className="fixed top-6 right-6 z-[60] bg-[#161f30] border border-[#2F5F5E]/30 text-[#202D2D] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-[#7CA982] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-2xl bg-[#F4F1EC] border border-[#2F5F5E]/15 rounded-3xl shadow-2xl overflow-hidden text-[#202D2D] my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Sticky Header */}
        <div className="px-6 py-4 border-b border-[#2F5F5E]/15 bg-[#F4F1EC]/95 backdrop-blur sticky top-0 z-20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#202D2D] tracking-tight">Account & Safety Profile</h2>
            <p className="text-xs text-[#7A8582]">Manage your profile, trusted contacts, and safety settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A8582] hover:text-[#202D2D] hover:bg-[#2F5F5E]/5 transition-colors"
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
          <div className="bg-[#FFFFFF] border border-[#2F5F5E]/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
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
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#7CA982] border-2 border-[#FFFFFF] flex items-center justify-center z-10" title="Verified SafeSafar Member">
                  <Check className="w-3 h-3 text-[#202D2D]" />
                </span>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-[#202D2D]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold text-[#202D2D]">{currentUser.name}</h3>
                  <span className="text-[10px] font-semibold bg-[#7CA982]/10 border border-[#7CA982]/30 text-[#7CA982] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-[#65716F] font-mono flex items-center justify-center sm:justify-start gap-1.5">
                  <Phone className="w-3 h-3 text-[#7A8582]" />
                  {currentUser.phone}
                </p>
                {currentUser.email && (
                  <p className="text-xs text-[#7A8582] flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="w-3 h-3 text-[#7A8582]" />
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
              className="px-3.5 py-1.5 bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 border border-[#2F5F5E]/15 text-xs font-semibold text-[#465552] rounded-xl transition-colors flex items-center gap-1.5 self-center sm:self-start"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#7CA982]" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: TRUSTED CONTACTS                               */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#202D2D] flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#7CA982]" />
                  Trusted Contacts
                </h4>
                <p className="text-xs text-[#7A8582]">
                  People who can be notified during your journeys or emergencies.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddContact}
                className="px-3 py-1.5 bg-[#24504F] hover:bg-[#2F5F5E] text-[#202D2D] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            {/* Contacts List */}
            <div className="space-y-2">
              {trustedContacts.length === 0 ? (
                <div className="bg-[#FFFFFF]/50 border border-dashed border-[#2F5F5E]/15 rounded-2xl p-6 text-center text-xs text-[#7A8582] space-y-2">
                  <p>No trusted contacts added yet.</p>
                  <button
                    type="button"
                    onClick={handleOpenAddContact}
                    className="text-[#7CA982] hover:text-[#2F5F5E] font-semibold underline"
                  >
                    + Add your first trusted contact
                  </button>
                </div>
              ) : (
                trustedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-[#FFFFFF] border border-[#2F5F5E]/10 hover:border-[#2F5F5E]/15 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#24504F]/10 border border-[#2F5F5E]/20 flex items-center justify-center text-[#2F5F5E] font-bold text-sm shrink-0">
                        {contact.relation === 'Mother' ? '👩' : contact.relation === 'Father' ? '👨' : '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#202D2D]">{contact.name}</span>
                          <span className="text-[10px] text-[#7A8582] font-medium bg-black/30 px-2 py-0.5 rounded-md">
                            {contact.relation}
                          </span>
                          {contact.isPrimary && (
                            <span className="text-[10px] font-bold text-[#7CA982] bg-[#7CA982]/10 border border-[#7CA982]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              Primary contact
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7A8582] font-mono mt-0.5">{contact.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!contact.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleMakePrimary(contact.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#7A8582] hover:text-[#7CA982] hover:bg-[#7CA982]/10 rounded-lg transition-colors"
                          title="Set as primary contact"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditContact(contact)}
                        className="p-1.5 text-[#7A8582] hover:text-[#202D2D] rounded-lg hover:bg-[#2F5F5E]/5 transition-colors"
                        title="Edit contact"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(contact.id, contact.name)}
                        className="p-1.5 text-[#7A8582] hover:text-[#E57373] rounded-lg hover:bg-[#E57373]/10 transition-colors"
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
          <div className="bg-[#FFFFFF] border border-[#2F5F5E]/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#202D2D] flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#7CA982]" />
                  Walk Me Home
                </h4>
                <p className="text-xs text-[#7A8582]">
                  Settings for automated check-ins and live companion alerts.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* Default Contact */}
              <div className="flex items-center justify-between py-1 border-b border-[#2F5F5E]/10">
                <div>
                  <p className="font-semibold text-[#202D2D]">Default Trusted Contact</p>
                  <p className="text-[11px] text-[#7A8582]">Receives trip alerts automatically on departure</p>
                </div>
                <select
                  value={walkSettings.defaultContactId}
                  onChange={(e) => setWalkSettings({ ...walkSettings, defaultContactId: e.target.value })}
                  className="bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-lg px-2.5 py-1 text-xs text-[#202D2D] focus:outline-none focus:border-[#2F5F5E]"
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
              <div className="flex items-center justify-between py-1 border-b border-[#2F5F5E]/10">
                <div>
                  <p className="font-semibold text-[#202D2D]">Safety Check-in Interval</p>
                  <p className="text-[11px] text-[#7A8582]">Prompts you with "Are you safe?" during travels</p>
                </div>
                <div className="flex bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-lg p-0.5">
                  {[5, 10, 15].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setWalkSettings({ ...walkSettings, checkInIntervalMinutes: mins })}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        walkSettings.checkInIntervalMinutes === mins
                          ? 'bg-[#24504F] text-[#202D2D]'
                          : 'text-[#7A8582] hover:text-[#202D2D]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Automatic Safe Arrival */}
              <div className="flex items-center justify-between py-1 border-b border-[#2F5F5E]/10">
                <div>
                  <p className="font-semibold text-[#202D2D]">Automatic Safe Arrival Notification</p>
                  <p className="text-[11px] text-[#7A8582]">Sends safe arrival SMS when you enter destination boundary</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWalkSettings({ ...walkSettings, autoSafeArrival: !walkSettings.autoSafeArrival })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    walkSettings.autoSafeArrival ? 'bg-[#7CA982] justify-end' : 'bg-[#D9D4CC] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>

              {/* Route Deviation Alerts */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="font-semibold text-[#202D2D]">Route Deviation Alerts</p>
                  <p className="text-[11px] text-[#7A8582]">Triggers countdown check-in if you wander into unverified alleys</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWalkSettings({ ...walkSettings, routeDeviationAlerts: !walkSettings.routeDeviationAlerts })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    walkSettings.routeDeviationAlerts ? 'bg-[#7CA982] justify-end' : 'bg-[#D9D4CC] justify-start'
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
          <div className="bg-[#FFFFFF] border border-[#2F5F5E]/10 rounded-2xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#202D2D] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#7CA982]" />
                Safety & Security
              </h4>
              <p className="text-xs text-[#7A8582]">
                Manage emergency passkeys and covert distress triggers.
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {/* Duress PIN */}
              <button
                type="button"
                onClick={() => handleOpenPinModal('duress')}
                className="w-full bg-[#FAF9F6]/60 hover:bg-[#FAF9F6] border border-[#2F5F5E]/10 p-3 rounded-xl flex items-center justify-between text-left transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#202D2D]">Duress Panic PIN</span>
                    <span className="text-[10px] text-[#E57373] bg-[#E57373]/10 border border-[#E57373]/20 px-2 py-0.5 rounded-full font-mono">
                      {currentUser.duressPin === '9999' ? 'Default (9999)' : 'Custom ••••'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A8582]">
                    Silently dispatches police and opens the Decoy Calculator screen
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A9491] shrink-0" />
              </button>

              {/* Safe Disarm PIN */}
              <button
                type="button"
                onClick={() => handleOpenPinModal('disarm')}
                className="w-full bg-[#FAF9F6]/60 hover:bg-[#FAF9F6] border border-[#2F5F5E]/10 p-3 rounded-xl flex items-center justify-between text-left transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#202D2D]">Safe Disarm PIN</span>
                    <span className="text-[10px] text-[#7CA982] bg-[#7CA982]/10 border border-[#7CA982]/20 px-2 py-0.5 rounded-full font-mono">
                      {currentUser.normalPin === '1234' ? 'Default (1234)' : 'Custom ••••'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A8582]">
                    Disarms active SOS alarms safely without sending distress alerts
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8A9491] shrink-0" />
              </button>

              {/* Fake Call Settings info row */}
              <div className="bg-[#FAF9F6]/60 border border-[#2F5F5E]/10 p-3 rounded-xl flex items-center justify-between text-left">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#202D2D]">Fake Call Speech Triggers</span>
                    <span className="text-[10px] text-[#2F5F5E] bg-[#2F5F5E]/10 px-2 py-0.5 rounded-full">
                      Keywords Active
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A8582]">
                    Secret phrases (&ldquo;reach soon&rdquo;, &ldquo;traffic&rdquo;, &ldquo;red&rdquo;) trigger covert SOS during realistic calls
                  </p>
                </div>
                <span className="text-[10px] text-[#7CA982] font-semibold">Enabled</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 5: PRIVACY & LOCATION                             */}
          {/* ========================================================= */}
          <div className="bg-[#FFFFFF] border border-[#2F5F5E]/10 rounded-2xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#202D2D] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#7CA982]" />
                Privacy & Location
              </h4>
              <p className="text-xs text-[#7A8582]">
                Control when and how your journey telemetry is shared.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#2F5F5E]/10">
                <div>
                  <p className="font-semibold text-[#202D2D]">Location Sharing</p>
                  <p className="text-[11px] text-[#7A8582]">Control when SafeSafar accesses device GPS</p>
                </div>
                <select
                  value={privacySettings.locationSharing}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, locationSharing: e.target.value })}
                  className="bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-lg px-2.5 py-1 text-xs text-[#202D2D] focus:outline-none focus:border-[#2F5F5E]"
                >
                  <option value="while_traveling">While Navigating</option>
                  <option value="sos_only">Emergency SOS Only</option>
                  <option value="always">Always Allowed</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#2F5F5E]/10">
                <div>
                  <p className="font-semibold text-[#202D2D]">Live Trip Visibility</p>
                  <p className="text-[11px] text-[#7A8582]">Allow trusted contacts to view your live breadcrumbs during active trips</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacySettings({ ...privacySettings, liveTripVisibility: !privacySettings.liveTripVisibility })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    privacySettings.liveTripVisibility ? 'bg-[#7CA982] justify-end' : 'bg-[#D9D4CC] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="font-semibold text-[#202D2D]">Data & Privacy</p>
                  <p className="text-[11px] text-[#7A8582]">Zero persistent route history. Encrypted breadcrumbs fade after 48 hours</p>
                </div>
                <span className="text-[10px] text-[#7CA982] font-semibold bg-[#7CA982]/10 px-2 py-0.5 rounded-full">
                  Protected
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 6: NOTIFICATIONS                                  */}
          {/* ========================================================= */}
          <div className="bg-[#FFFFFF] border border-[#2F5F5E]/10 rounded-2xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-[#202D2D] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#7CA982]" />
                Notifications
              </h4>
              <p className="text-xs text-[#7A8582]">
                Manage automated safety updates and incident alerts.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#2F5F5E]/10">
                <div>
                  <p className="font-semibold text-[#202D2D]">SOS Alerts</p>
                  <p className="text-[11px] text-[#7A8582]">Receive high-priority emergency notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, sosAlerts: !notifications.sosAlerts })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    notifications.sosAlerts ? 'bg-[#7CA982] justify-end' : 'bg-[#D9D4CC] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#2F5F5E]/10">
                <div>
                  <p className="font-semibold text-[#202D2D]">Trip Updates</p>
                  <p className="text-[11px] text-[#7A8582]">Departure, arrival, and route status notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, tripUpdates: !notifications.tripUpdates })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    notifications.tripUpdates ? 'bg-[#7CA982] justify-end' : 'bg-[#D9D4CC] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="font-semibold text-[#202D2D]">Community Alerts</p>
                  <p className="text-[11px] text-[#7A8582]">Real-time reports on darkness pockets and street lighting updates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, communityAlerts: !notifications.communityAlerts })}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    notifications.communityAlerts ? 'bg-[#7CA982] justify-end' : 'bg-[#D9D4CC] justify-start'
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
          <div className="pt-2 border-t border-[#2F5F5E]/15 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A8582]">
              <div>
                <p className="font-bold text-[#65716F]">About SafeSafar</p>
                <p className="text-[11px] text-[#8A9491]">Version 1.0.0</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <button type="button" onClick={() => showToast('Help & Support: support@safesafar.org')} className="hover:text-[#202D2D] transition-colors">
                  Help & Support
                </button>
                <span>•</span>
                <button type="button" onClick={() => showToast('End-to-End Encrypted Telemetry Policy')} className="hover:text-[#202D2D] transition-colors">
                  Privacy Policy
                </button>
                <span>•</span>
                <button type="button" onClick={() => showToast('SafeSafar Terms of Safe Transit')} className="hover:text-[#202D2D] transition-colors">
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
                className="px-4 py-2 rounded-xl bg-[#E57373]/10 hover:bg-[#E57373]/20 border border-[#E57373]/20 text-[#E57373] text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#2F5F5E]/5 hover:bg-[#2F5F5E]/8 border border-[#2F5F5E]/15 text-[#202D2D] text-xs font-semibold transition-colors"
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#202D2D]/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202D2D]">Edit Profile Details</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-[#7A8582] hover:text-[#202D2D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Profile Photo Section */}
              <div className="p-4 bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-2xl flex flex-col items-center justify-center gap-3">
                <span className="text-[11px] font-semibold text-[#7A8582] uppercase tracking-wider">Profile Photo</span>
                <div className="relative group">
                  <div className="p-1 rounded-full ring-2 ring-[#2F5F5E]/30">
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
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#24504F] hover:bg-[#2F5F5E] text-[#202D2D] shadow-lg transition-transform active:scale-95"
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
                    className="px-3 py-1.5 rounded-xl bg-[#2F5F5E]/8 hover:bg-[#2F5F5E]/10 border border-[#2F5F5E]/15 text-[#202D2D] font-semibold text-[11px] transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3 h-3 text-[#7CA982]" />
                    <span>Change Photo</span>
                  </button>

                  {((tempAvatar !== null && tempAvatar !== '') || (tempAvatar === null && currentUser.avatar)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempAvatar('');
                        setAvatarError(null);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#E57373]/10 hover:bg-[#E57373]/20 border border-[#E57373]/20 text-[#E57373] font-semibold text-[11px] transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {avatarError ? (
                  <p className="text-[11px] text-[#E57373] text-center font-medium">{avatarError}</p>
                ) : (
                  <p className="text-[10px] text-[#8A9491] text-center">
                    Supports JPG, PNG, WEBP (Max 3MB). Circular preview updates instantly.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#65716F] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl px-3 py-2 text-sm text-[#202D2D] focus:outline-none focus:border-[#2F5F5E]"
                />
              </div>

              <div>
                <label className="block text-[#65716F] font-semibold mb-1">Phone Number</label>
                <div className="flex bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl overflow-hidden focus-within:border-[#2F5F5E]">
                  <span className="px-3 py-2 text-xs font-bold text-[#7A8582] border-r border-[#2F5F5E]/15">+91</span>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-transparent px-3 py-2 text-sm text-[#202D2D] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#65716F] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl px-3 py-2 text-sm text-[#202D2D] focus:outline-none focus:border-[#2F5F5E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#2F5F5E]/5 text-[#65716F] text-xs font-semibold hover:bg-[#2F5F5E]/8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#24504F] text-[#202D2D] text-xs font-semibold hover:bg-[#2F5F5E]"
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#202D2D]/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202D2D]">
                {editingContact ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
              </h3>
              <button onClick={() => setIsAddContactOpen(false)} className="text-[#7A8582] hover:text-[#202D2D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#65716F] font-semibold mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sushila Patel"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl px-3 py-2 text-sm text-[#202D2D] focus:outline-none focus:border-[#2F5F5E]"
                />
              </div>

              <div>
                <label className="block text-[#65716F] font-semibold mb-1">Phone Number</label>
                <div className="flex bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl overflow-hidden focus-within:border-[#2F5F5E]">
                  <span className="px-3 py-2 text-xs font-bold text-[#7A8582] border-r border-[#2F5F5E]/15">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="98790 12345"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-transparent px-3 py-2 text-sm text-[#202D2D] font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#65716F] font-semibold mb-1">Relationship</label>
                <select
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl px-3 py-2 text-sm text-[#202D2D] focus:outline-none focus:border-[#2F5F5E]"
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
                  className="rounded border-[#2F5F5E]/20 bg-[#FAF9F6] text-[#24504F] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="make-primary" className="text-[#65716F] text-xs font-medium cursor-pointer">
                  Make primary emergency contact
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#2F5F5E]/5 text-[#65716F] text-xs font-semibold hover:bg-[#2F5F5E]/8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#24504F] text-[#202D2D] text-xs font-semibold hover:bg-[#2F5F5E]"
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#202D2D]/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#2F5F5E]/15 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#202D2D]">
                  {pinModalMode === 'duress' ? 'Change Duress Panic PIN' : 'Change Safe Disarm PIN'}
                </h3>
                <p className="text-xs text-[#7A8582]">
                  {pinModalMode === 'duress'
                    ? 'This PIN secretly alerts police & triggers the Decoy Calculator'
                    : 'This PIN securely cancels active SOS distress alarms'}
                </p>
              </div>
              <button onClick={() => setPinModalMode(null)} className="text-[#7A8582] hover:text-[#202D2D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinError && (
              <div className="bg-[#E57373]/10 border border-[#E57373]/20 text-[#E57373] text-xs px-3 py-2 rounded-xl">
                {pinError}
              </div>
            )}

            <form onSubmit={handleSavePinChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#65716F] font-semibold mb-1">Current PIN</label>
                <div className="relative">
                  <input
                    type={showCurrentPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl px-3 py-2 text-sm text-[#202D2D] font-mono tracking-widest focus:outline-none focus:border-[#2F5F5E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-3 top-2.5 text-[#7A8582] hover:text-[#202D2D]"
                  >
                    {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#65716F] font-semibold mb-1">New 4-Digit PIN</label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl px-3 py-2 text-sm text-[#202D2D] font-mono tracking-widest focus:outline-none focus:border-[#2F5F5E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-2.5 text-[#7A8582] hover:text-[#202D2D]"
                  >
                    {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#65716F] font-semibold mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-[#FAF9F6] border border-[#2F5F5E]/15 rounded-xl px-3 py-2 text-sm text-[#202D2D] font-mono tracking-widest focus:outline-none focus:border-[#2F5F5E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPinModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-[#2F5F5E]/5 text-[#65716F] text-xs font-semibold hover:bg-[#2F5F5E]/8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#24504F] text-[#202D2D] text-xs font-semibold hover:bg-[#2F5F5E]"
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
