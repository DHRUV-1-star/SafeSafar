import React, { useState, useEffect, useCallback } from 'react';
import { RouteSegment, Landmark, IncidentReport, TrustedContact, ActiveSOSState, UserProfile } from './types';
import { INITIAL_USER_POS, MOCK_ROUTES, MOCK_LANDMARKS, MOCK_INCIDENTS, MOCK_TRUSTED_CONTACTS } from './data/mockData';
import { calculateRouteLighting, StreetLamp } from './services/overpass';
import { Navbar } from './components/Navbar';
import { MapComponent } from './components/MapComponent';
import { RouteSelector } from './components/RouteSelector';
import { RouteSearchBar } from './components/RouteSearchBar';
import { LiveNavigation } from './components/LiveNavigation';
import { FakeCallModal } from './components/FakeCallModal';
import { DuressModal } from './components/DuressModal';
import { DecoyScreen } from './components/DecoyScreen';
import { SOSModal } from './components/SOSModal';
import { WalkMeHomeModal } from './components/WalkMeHomeModal';
import { CommunityReportModal } from './components/CommunityReportModal';
import { SafeHavensDrawer } from './components/SafeHavensDrawer';
import { GuardianDashboard, CommuterProfile } from './components/GuardianDashboard';
import { CivicHeatmapDashboard } from './components/CivicHeatmapDashboard';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { DatabaseSetupModal } from './components/DatabaseSetupModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Sparkles, Smartphone, Flame, Menu, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { Sidebar, SidebarFeature } from './components/Sidebar';
import { AiCompanionPage } from './components/AiCompanionPage';
import { playSilentConfirmPing, stopSiren } from './utils/audio';
import { fetchRealRoutes, searchLocationSuggestions, generateRouteLandmarks, LocationSuggestion } from './services/geocodingService';
import {
  getCurrentUser,
  fetchUserGuardians,
  saveGuardianToDatabase,
  updateGuardianInDatabase,
  deleteGuardianFromDatabase,
  logoutUser,
  updateUserProfile,
  AuthUser,
  fetchLandmarks,
  fetchIncidents,
  saveIncidentToDatabase,
} from './services/databaseService';

export const App: React.FC = () => {
  // Authentication & Safety Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('safesafar_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      } catch {
        // fallback
      }
    }
    // Default commuter user so visitors on Vercel immediately see full app with Sidebar & features
    const defaultUser: UserProfile = {
      id: 'user-commuter',
      name: 'Dharmik Gohil',
      phone: '+91 98251 44321',
      email: 'dharmik@safesafar.app',
      role: 'commuter',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Dharmik%20Gohil&backgroundColor=24504F,2F5F5E',
      normalPin: '1234',
      duressPin: '9999',
      secretSafeWord: 'reach soon',
      guardianPairingCode: 'SAF-8492',
      emergencyContactCount: 3,
      batteryStatus: 95,
    };
    return defaultUser;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDatabaseSetupOpen, setIsDatabaseSetupOpen] = useState<boolean>(false);

  // Sidebar active feature & Mobile Drawer
  const [activeFeature, setActiveFeature] = useState<SidebarFeature>('safe-route');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Navigation & View Views
  const [currentView, setCurrentView] = useState<'mobile' | 'guardian' | 'civic'>('mobile');


  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // Mapbox token: read from .env at build time only (pk.* public token, safe for client)
  const mapboxApiKey = (import.meta.env.VITE_MAPBOX_TOKEN as string) || '';

  // Core Data & Real Routing State
  const [routes, setRoutes] = useState<RouteSegment[]>(MOCK_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<RouteSegment>(MOCK_ROUTES[0]);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);

  // Dynamic User Guardians (Loaded from Database / Local Storage for active user, defaults to empty)
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(() => {
    const saved = localStorage.getItem('safesafar_guardians') || localStorage.getItem('safesafar_trusted_contacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: TrustedContact) => c && c.id && !c.id.startsWith('tc-'));
        }
      } catch (e) {
        console.error('Error loading saved guardians', e);
      }
    }
    return [];
  });

  // Initialize and load user & user-specific guardians from database
  useEffect(() => {
    const initDatabaseAndUser = async () => {
      const activeUser = await getCurrentUser();
      if (activeUser) {
        const userProfile: UserProfile = {
          id: activeUser.id,
          name: activeUser.name,
          phone: activeUser.phone || '+91 98790 12345',
          email: activeUser.email,
          role: activeUser.role,
          avatar:
            activeUser.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              activeUser.name
            )}&backgroundColor=7c3aed,4f46e5`,
          normalPin: '1234',
          duressPin: '9999',
          secretSafeWord: 'reach soon',
          guardianPairingCode: '782914',
          emergencyContactCount: 0,
        };
        setCurrentUser(userProfile);
        localStorage.setItem('safesafar_user', JSON.stringify(userProfile));

        // Load guardians from database specifically for this user
        const dbGuardians = await fetchUserGuardians(activeUser.id);
        if (dbGuardians && dbGuardians.length > 0) {
          setTrustedContacts(dbGuardians.filter((c: TrustedContact) => c && c.id && !c.id.startsWith('tc-')));
        }
      }

      // Load global public data (Landmarks and Incidents)
      const dbLandmarks = await fetchLandmarks();
      const dbIncidents = await fetchIncidents();
      setLandmarks(dbLandmarks);
      setIncidents(dbIncidents);
    };
    initDatabaseAndUser();
  }, []);

  // Commuter Profile (persisted in localStorage)
  const [commuterProfile, setCommuterProfile] = useState<CommuterProfile>(() => {
    const saved = localStorage.getItem('safesafar_commuter_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading commuter profile', e);
      }
    }
    return {
      name: 'Dharmik Gohil',
      hub: 'Active Walk Me Home Companion • Surat Hub',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };
  });

  // Real Locations & Coordinates State
  const [startCoords, setStartCoords] = useState<[number, number]>([21.1663, 72.7832]);
  const [destCoords, setDestCoords] = useState<[number, number]>([21.1960, 72.8190]);
  const [startLocationName, setStartLocationName] = useState<string>('SVNIT Campus, Dumas Road, Surat');
  const [destinationName, setDestinationName] = useState<string>('Ring Road Hub, Surat');
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);

  // OSM Street Lamps & Dynamic Lighting State
  const [streetLamps, setStreetLamps] = useState<StreetLamp[]>([]);

  const handleStreetLampsUpdated = useCallback((lamps: StreetLamp[]) => {
    setStreetLamps(lamps);
  }, []);

  // Dynamically calculate and replace mock lighting values with real Overpass + landmark + road-prior calculation
  useEffect(() => {
    setRoutes((prevRoutes) =>
      prevRoutes.map((route) => {
        const calculation = calculateRouteLighting(route, streetLamps, landmarks);
        const baseWarnings = route.warnings.filter(
          (w) => !w.toLowerCase().includes('lighting data')
        );
        const newWarnings = [...baseWarnings];
        if (calculation.warning) {
          newWarnings.push(calculation.warning);
        }

        // Dynamic composite safety score adjusted by real lighting calculation
        const lightingDelta = (calculation.lightingPercent - route.lightingPercent) * 0.25;
        const adjustedSafetyScore = Math.max(
          10,
          Math.min(99, Math.round(route.safetyScore + lightingDelta))
        );

        return {
          ...route,
          lightingPercent: calculation.lightingPercent,
          confidence: calculation.confidence,
          safetyScore: adjustedSafetyScore,
          warnings: newWarnings,
        };
      })
    );
  }, [streetLamps, landmarks]);

  // Keep selectedRoute synchronized with dynamic updates
  useEffect(() => {
    const updated = routes.find((r) => r.id === selectedRoute.id);
    if (
      updated &&
      (updated.lightingPercent !== selectedRoute.lightingPercent ||
        updated.confidence !== selectedRoute.confidence ||
        updated.safetyScore !== selectedRoute.safetyScore)
    ) {
      setSelectedRoute(updated);
    }
  }, [routes, selectedRoute.id]);

  const handleUpdateTrustedContacts = (contacts: TrustedContact[]) => {
    setTrustedContacts(contacts);
    localStorage.setItem('safesafar_guardians', JSON.stringify(contacts));
    localStorage.setItem('safesafar_trusted_contacts', JSON.stringify(contacts));
  };

  // User State & Telemetry
  const [userLocation, setUserLocation] = useState<[number, number]>(INITIAL_USER_POS);
  const [batteryLevel] = useState<number>(88);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const handleSelectStartLocation = (suggestion: LocationSuggestion) => {
    setStartLocationName(suggestion.displayName);
    setStartCoords([suggestion.lat, suggestion.lng]);
    setUserLocation([suggestion.lat, suggestion.lng]);
  };

  const handleSelectDestination = (suggestion: LocationSuggestion) => {
    setDestinationName(suggestion.displayName);
    setDestCoords([suggestion.lat, suggestion.lng]);
  };

  const handleSwapLocations = () => {
    const tempName = startLocationName;
    const tempCoords = startCoords;
    setStartLocationName(destinationName);
    setStartCoords(destCoords);
    setDestinationName(tempName);
    setDestCoords(tempCoords);
    showToast('🔄 Swapped Starting Point & Destination!');
  };

  const handleFetchRealRoutes = async () => {
    setIsLoadingRoutes(true);

    let activeStartCoords = startCoords;
    let activeDestCoords = destCoords;
    let activeStartName = startLocationName;
    let activeDestName = destinationName;

    // 1. Auto-resolve typed start location if user didn't pick from dropdown
    if (startLocationName.trim().length >= 2) {
      try {
        const startMatches = await searchLocationSuggestions(startLocationName.trim());
        if (startMatches && startMatches.length > 0) {
          activeStartCoords = [startMatches[0].lat, startMatches[0].lng];
          activeStartName = startMatches[0].displayName;
          setStartCoords(activeStartCoords);
          setStartLocationName(activeStartName);
          setUserLocation(activeStartCoords);
        }
      } catch (e) {
        console.warn('Auto-resolve start error:', e);
      }
    }

    // 2. Auto-resolve typed destination location if user didn't pick from dropdown
    if (destinationName.trim().length >= 2) {
      try {
        const destMatches = await searchLocationSuggestions(destinationName.trim());
        if (destMatches && destMatches.length > 0) {
          activeDestCoords = [destMatches[0].lat, destMatches[0].lng];
          activeDestName = destMatches[0].displayName;
          setDestCoords(activeDestCoords);
          setDestinationName(activeDestName);
        }
      } catch (e) {
        console.warn('Auto-resolve dest error:', e);
      }
    }

    const startShort = activeStartName.split(',')[0].trim();
    const destShort = activeDestName.split(',')[0].trim();

    showToast(`🌐 Calculating real safe routes from "${startShort}" to "${destShort}"...`);

    try {
      const newRoutes = await fetchRealRoutes(activeStartCoords, activeDestCoords, activeStartName, activeDestName);
      if (newRoutes && newRoutes.length > 0) {
        setRoutes(newRoutes);
        setSelectedRoute(newRoutes[0]);

        // Generate dynamic emergency havens & police posts along the actual travel route
        const dynamicLandmarks = generateRouteLandmarks(newRoutes[0].coordinates, activeStartName, activeDestName);
        if (dynamicLandmarks.length > 0) {
          setLandmarks(dynamicLandmarks);
        }

        showToast(`📍 Found 3 rated routes! Safest highway corridor recommended.`);
      }
    } catch (err) {
      console.error(err);
      showToast('⚠️ Could not fetch real route. Displaying estimated safe corridor.');
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  // Active Trip & Navigation
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navStepIndex, setNavStepIndex] = useState<number>(0);

  // Map Filter Layers
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showSafeLandmarks, setShowSafeLandmarks] = useState<boolean>(true);

  // Modals & Tools
  const [isFakeCallOpen, setIsFakeCallOpen] = useState<boolean>(false);
  const [isDuressModalOpen, setIsDuressModalOpen] = useState<boolean>(false);
  const [isDecoyOpen, setIsDecoyOpen] = useState<boolean>(false);
  const [isWalkMeHomeOpen, setIsWalkMeHomeOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSafeHavensOpen, setIsSafeHavensOpen] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);

  // Toast / System Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };



  // User Authentication Handlers
  const handleAuthSuccess = async (authUser: AuthUser) => {
    const profile: UserProfile = {
      id: authUser.id,
      name: authUser.name,
      phone: authUser.phone || '+91 98790 12345',
      email: authUser.email,
      role: authUser.role,
      avatar:
        authUser.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          authUser.name
        )}&backgroundColor=7c3aed,4f46e5`,
      normalPin: '1234',
      duressPin: '9999',
      secretSafeWord: 'reach soon',
      guardianPairingCode: '782914',
      emergencyContactCount: 0,
    };
    setCurrentUser(profile);
    localStorage.setItem('safesafar_user', JSON.stringify(profile));

    // Fetch this user's existing guardians from the database
    const dbGuardians = await fetchUserGuardians(authUser.id);
    setTrustedContacts(dbGuardians);

    if (authUser.role === 'guardian') {
      setCurrentView('guardian');
    } else if (authUser.role === 'civic') {
      setCurrentView('civic');
    } else {
      setCurrentView('mobile');
    }

    showToast(`✓ Welcome, ${authUser.name}! Existing guardians loaded from database.`);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setTrustedContacts([]);
    localStorage.removeItem('safesafar_user');
    showToast('Signed out from SafeSafar. Switched to guest mode.');
  };

  const handleUpdateUser = async (updated: UserProfile) => {
    setCurrentUser(updated);
    localStorage.setItem('safesafar_user', JSON.stringify(updated));
    await updateUserProfile(updated.id, { name: updated.name, phone: updated.phone });
    showToast('✓ Profile updated in database!');
  };

  // Guardian Database CRUD Handlers
  const handleAddGuardian = async (contactData: Omit<TrustedContact, 'id'>) => {
    const userId = currentUser?.id || 'guest-user';
    const savedContact = await saveGuardianToDatabase(userId, contactData);
    setTrustedContacts((prev) => [savedContact, ...prev.filter((c) => c.id !== savedContact.id)]);
    showToast(`✓ Guardian "${savedContact.name}" saved to database!`);
  };

  const handleUpdateGuardian = async (id: string, updatedFields: Partial<TrustedContact>) => {
    const userId = currentUser?.id || 'guest-user';
    const updatedList = await updateGuardianInDatabase(userId, id, updatedFields);
    setTrustedContacts(updatedList);
    showToast('✓ Guardian details updated in database!');
  };

  const handleDeleteGuardian = async (id: string) => {
    const target = trustedContacts.find((c) => c.id === id);
    const userId = currentUser?.id || 'guest-user';
    const updatedList = await deleteGuardianFromDatabase(userId, id);
    setTrustedContacts(updatedList);
    showToast(`✓ Guardian "${target?.name || ''}" removed from database.`);
  };

  const handleLoadSampleContacts = async () => {
    const userId = currentUser?.id || 'guest-user';
    for (const c of MOCK_TRUSTED_CONTACTS) {
      await saveGuardianToDatabase(userId, c);
    }
    const refreshed = await fetchUserGuardians(userId);
    setTrustedContacts(refreshed);
    showToast('Sample guardians added to database.');
  };

  const handleUpdateCommuterProfile = async (profile: CommuterProfile) => {
    setCommuterProfile(profile);
    if (currentUser) {
      await updateUserProfile(currentUser.id, { name: profile.name, hub: profile.hub });
    }
    localStorage.setItem('safesafar_commuter_profile', JSON.stringify(profile));
    showToast('✓ Commuter profile updated in database.');
  };

  // SOS State
  const [sosState, setSosState] = useState<ActiveSOSState>({
    isActive: false,
    isSilent: false,
    triggerSource: 'button',
    startTime: 0,
    lat: INITIAL_USER_POS[0],
    lng: INITIAL_USER_POS[1],
    address: 'SVNIT Campus, Dumas Road, Surat',
    batteryLevel: 88,
    audioRecordingActive: false,
    broadcastSentToContacts: false,
    policeNotified: false,
    duressActive: false,
  });

  // Handle Route Step
  const handleStepNextCoord = () => {
    if (navStepIndex < selectedRoute.coordinates.length - 1) {
      const nextIdx = navStepIndex + 1;
      setNavStepIndex(nextIdx);
      setUserLocation(selectedRoute.coordinates[nextIdx]);
      showToast(`📍 Advancing along ${selectedRoute.name} corridor`);
    }
  };

  // Simulate Off-Route Deviation
  const handleSimulateDeviation = () => {
    setUserLocation([21.1735, 72.7845]);
    setIsWalkMeHomeOpen(true);
    showToast('⚠️ Route deviation detected! Prompting 30s Safe Check-In.');
  };

  // Safe Arrival
  const handleSafeArrival = () => {
    setIsNavigating(false);
    setNavStepIndex(0);
    showToast('🎉 Safe Arrival Confirmed! Notification SMS sent to your Trusted Circle.');
  };

  // Trigger Emergency SOS
  const triggerSOS = (source: ActiveSOSState['triggerSource'] = 'button', silent: boolean = false, duress: boolean = false) => {
    setSosState({
      isActive: true,
      isSilent: silent,
      triggerSource: source,
      startTime: Date.now(),
      lat: userLocation[0],
      lng: userLocation[1],
      address: 'Near Piplod / Dumas Rd, Surat',
      batteryLevel,
      audioRecordingActive: true,
      broadcastSentToContacts: true,
      policeNotified: true,
      duressActive: duress,
    });
    setIsSOSOpen(true);
    showToast(duress ? '🔒 Covert Duress Distress Dispatched!' : '🚨 Live Emergency SOS Broadcast Initiated!');
  };

  // Completely Disarm and Turn Off SOS
  const handleDisarmSOS = () => {
    stopSiren();
    setSosState((prev) => ({
      ...prev,
      isActive: false,
      duressActive: false,
      audioRecordingActive: false,
      broadcastSentToContacts: false,
      policeNotified: false,
    }));
    setIsSOSOpen(false);
    setIsDuressModalOpen(false);
    showToast('✓ SOS Emergency Stand-Down: Security disarmed safely.');
  };

  // Covert Fake Call SOS Conversion (Flagship Innovation)
  const handleCovertSOSFromCall = (details: { trigger: string; simulatedAudio: boolean }) => {
    setSosState({
      isActive: true,
      isSilent: true,
      triggerSource: 'fake_call',
      startTime: Date.now(),
      lat: userLocation[0],
      lng: userLocation[1],
      address: 'Piplod - Dumas Rd corridor, Surat',
      batteryLevel,
      audioRecordingActive: true,
      broadcastSentToContacts: true,
      policeNotified: true,
      duressActive: true,
    });
    showToast(`🛡️ Covert SOS Dispatched via "${details.trigger}". Disguise call active.`);
  };

  // Duress Passkey (9999) Trigger
  const handleDuressPinEntered = () => {
    setIsDuressModalOpen(false);
    setIsSOSOpen(false);
    triggerSOS('duress_passkey', true, true);
    setIsDecoyOpen(true);
    showToast('🔒 Duress PIN 9999 verified: Distress sent secretly. Decoy Calculator opened.');
  };

  // Disarm SOS with normal 1234
  const handleDisarmPinEntered = () => {
    handleDisarmSOS();
  };

  // Shake Gesture simulation
  const handleSimulateShake = () => {
    playSilentConfirmPing();
    triggerSOS('shake', false, false);
  };

  // Add Community Report
  const handleAddCommunityReport = async (newReport: any) => {
    const reportItem = {
      ...newReport,
      timestamp: 'Just now',
      confirmations: 1,
      requiredConfirmations: 3,
      verified: false,
      decayHoursLeft: 48,
    };
    const saved = await saveIncidentToDatabase(reportItem);
    setIncidents([saved, ...incidents]);
    showToast('✓ Community safety condition posted! Pending trust peer audit.');
  };

  // Dedicated Login Success for AuthPage
  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('safesafar_user', JSON.stringify(user));

    // Load existing guardians from the database for this specific user
    const dbGuardians = await fetchUserGuardians(user.id);
    setTrustedContacts(dbGuardians);

    if (user.role === 'guardian') {
      setCurrentView('guardian');
    } else if (user.role === 'civic') {
      setCurrentView('civic');
    } else {
      setCurrentView('mobile');
    }

    showToast(`✓ Welcome back, ${user.name}! Existing guardians loaded from database.`);
  };

  // If user is unauthenticated, show the dedicated SafeSafar Auth Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F7F8F2] text-[#30433F] font-sans">
        <AuthPage onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[10000] bg-[#F1D9D9] border border-[#2F5F5E]/40 text-[#30433F] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
            <Sparkles className="w-5 h-5 text-[#7CA982] shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Helper to render full-page content based on sidebar feature
  const renderFeaturePage = () => {
    switch (activeFeature) {
      case 'safe-route':
        return (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top Innovation Banner & Sub-Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EAF1E9] border border-[#D4E2D5] rounded-2xl p-3.5 px-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7CA982] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#7CA982]"></span>
                </span>
                <span className="text-xs font-bold text-[#30433F]">Safe Route Intelligence: Surat Pilot Corridor</span>
                <span className="text-[10px] text-[#2F5F5E] font-mono hidden md:inline">SVNIT ➔ Ring Road Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSafeLandmarks(!showSafeLandmarks)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${showSafeLandmarks ? 'bg-[#F8E9EA] border-[#D58A93]/45 text-[#B96570]' : 'bg-white border-[#D4E2D5] text-[#73807B]'}`}>Pink & Police Posts</button>
                <button onClick={() => setShowHeatmap(!showHeatmap)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${showHeatmap ? 'bg-[#F5EEDB] border-[#D9C58B] text-[#8A7131]' : 'bg-white border-[#D4E2D5] text-[#73807B]'}`}><Flame className="w-3 h-3 inline mr-1" />Dark Spot Heatmap</button>
                <button onClick={() => setDeviceFrameMode(!deviceFrameMode)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${deviceFrameMode ? 'bg-[#356B62] border-[#356B62] text-white' : 'bg-white border-[#D4E2D5] text-[#687873] hover:text-[#30433F]'}`}><Smartphone className="w-3.5 h-3.5" /><span>{deviceFrameMode ? 'Frame: Phone' : 'Frame: Full'}</span></button>
                <button onClick={handleSimulateShake} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F8E9EA] hover:bg-[#F5DEE0] border border-[#E7B9BE] text-[#B96570] transition-all">Shake SOS</button>
              </div>
            </div>
            <RouteSearchBar startLocation={startLocationName} destination={destinationName} onSelectStartLocation={handleSelectStartLocation} onSelectDestination={handleSelectDestination} onStartLocationInputChange={setStartLocationName} onDestinationInputChange={setDestinationName} onSwapLocations={handleSwapLocations} onSearchRoutes={handleFetchRealRoutes} isLoadingRoutes={isLoadingRoutes} />
            {/* Map Container + Below Map Information */}
            <div className="space-y-6 relative z-10">
              {/* Map Box: Full width at top */}
              <div className={deviceFrameMode ? "max-w-[460px] mx-auto bg-[#202D2D]/95 p-4 rounded-[48px] border-[5px] border-[#C9C4BC] shadow-2xl relative z-10 overflow-hidden" : "w-full relative z-10"}>
                <div className={deviceFrameMode ? "h-[380px] sm:h-[420px] w-full relative z-0 isolate rounded-3xl overflow-hidden shadow-lg border border-[#2F5F5E]/15" : "h-[420px] sm:h-[480px] w-full relative z-0 isolate rounded-3xl overflow-hidden shadow-lg border border-[#2F5F5E]/15"}>
                  <MapComponent routes={routes} selectedRoute={selectedRoute} onSelectRoute={setSelectedRoute} landmarks={landmarks} incidents={incidents} userLocation={userLocation} isNavigating={isNavigating} navProgressIndex={navStepIndex} showHeatmap={showHeatmap} showSafeLandmarks={showSafeLandmarks} mapboxApiKey={mapboxApiKey} startLocationName={startLocationName} destinationName={destinationName} onStreetLampsUpdated={handleStreetLampsUpdated} onLandmarkClick={(lm) => { showToast(`Safe Landmark: ${lm.name} (${lm.openHours})`); }} />
                  {sosState.isActive && (<div className="absolute top-4 left-4 z-10 bg-[#D95C5C]/90 text-[#30433F] px-3 py-1.5 rounded-full text-xs font-black tracking-wide shadow-xl flex items-center gap-2 animate-bounce pointer-events-none"><span className="w-2 h-2 rounded-full bg-white animate-ping"></span><span>SOS TELEMETRY TRANSMITTING LIVE</span></div>)}
                  {isOfflineMode && (<div className="absolute top-4 right-14 z-10 bg-yellow-600/90 text-black font-bold px-3 py-1.5 rounded-full text-[11px] shadow-xl pointer-events-none">OFFLINE / 2G MESH ACTIVE</div>)}
                </div>
                {isNavigating && (<LiveNavigation route={selectedRoute} landmarks={landmarks} onEndTrip={() => setIsNavigating(false)} onSimulateDeviation={handleSimulateDeviation} onSafeArrival={handleSafeArrival} currentCoordIndex={navStepIndex} onStepNextCoord={handleStepNextCoord} />)}
              </div>

              {/* BELOW MAP INFORMATION GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: RouteSelector (Smart Route Intelligence, Compare Routes, Explainable Safety Engine, Start Nav & Walk Me Home) */}
                <div className="lg:col-span-8 space-y-6">
                  <RouteSelector
                    routes={routes}
                    selectedRoute={selectedRoute}
                    onSelectRoute={setSelectedRoute}
                    onStartTrip={() => {
                      setIsNavigating(true);
                      setNavStepIndex(0);
                      setUserLocation(selectedRoute.coordinates[0]);
                      showToast(`SafeSafar guidance started for ${selectedRoute.name}`);
                    }}
                    onOpenWalkMeHome={() => setIsWalkMeHomeOpen(true)}
                  />
                </div>

                {/* Right Column: Covert Safety Arsenal & Quick Action Cards */}
                <div className="lg:col-span-4 space-y-5">
                  <div className="bg-[#FFFFFF]/90 border border-[#2F5F5E]/15 rounded-3xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#7CA982] uppercase tracking-wider">Covert Safety Arsenal</span>
                      <span className="text-[10px] bg-[#2F5F5E]/10 text-[#2F5F5E] px-2 py-0.5 rounded-md border border-[#2F5F5E]/20">Novel Innovations</span>
                    </div>
                    <p className="text-xs text-[#7A8582] mb-4">
                      Covert mechanisms built specifically for situations where visible action would escalate danger:
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => setIsFakeCallOpen(true)}
                        className="p-3.5 rounded-2xl bg-[#234A45]/10 hover:bg-[#234A45]/20 border border-[#2F5F5E]/30 text-left transition-all group flex items-start gap-3"
                      >
                        <span className="text-xl shrink-0">📞</span>
                        <div>
                          <span className="text-xs font-bold text-[#202D2D] block group-hover:text-[#24504F]">Fake Call to SOS</span>
                          <span className="text-[11px] text-[#7A8582] leading-tight block mt-0.5">Trigger secret alert using voice keyword "reach soon"</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setIsDuressModalOpen(true)}
                        className="p-3.5 rounded-2xl bg-[#806B2B]/10 hover:bg-[#806B2B]/20 border border-[#F9C950]/30 text-left transition-all group flex items-start gap-3"
                      >
                        <span className="text-xl shrink-0">🔢</span>
                        <div>
                          <span className="text-xs font-bold text-[#202D2D] block group-hover:text-[#8A7131]">Duress PIN (9999)</span>
                          <span className="text-[11px] text-[#7A8582] leading-tight block mt-0.5">Deceives attacker with Decoy Calculator while alerting police</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Quick Action Bar */}
                  <div className="bg-[#FAF9F6] border border-[#E2DDD6] rounded-3xl p-5 shadow-sm space-y-3">
                    <p className="text-xs font-bold text-[#202D2D] uppercase tracking-wider">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setIsWalkMeHomeOpen(true)} className="py-2.5 px-3 rounded-xl bg-[#24504F] text-white text-xs font-bold hover:bg-[#1E403F] transition-all text-center">🚶‍♀️ Walk Me Home</button>
                      <button onClick={() => setIsReportModalOpen(true)} className="py-2.5 px-3 rounded-xl bg-[#EEF0EC] text-[#202D2D] text-xs font-bold hover:bg-[#E2E6DF] transition-all text-center">📢 Report Spot</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'walk-me-home':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#24504F] to-[#7CA982] flex items-center justify-center mx-auto shadow-xl">
                <span className="text-4xl">🚶‍♀️</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#202D2D] mb-2">Walk Me Home</h2>
                <p className="text-[#7A8582] text-sm">Start a live guardian session. Your trusted contacts will track your journey in real time and get alerted if you deviate from your route or miss a check-in.</p>
              </div>
              <button
                onClick={() => setIsWalkMeHomeOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#24504F] to-[#2F5F5E] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all"
              >
                🛡️ Start Walk Me Home Session
              </button>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[['📍','Live Tracking'],['⏱️','Check-Ins'],['🔔','Auto Alerts']].map(([icon,label])=>(<div key={label} className="bg-[#EEF3EE] rounded-2xl p-3"><div className="text-xl mb-1">{icon}</div><p className="text-[11px] font-semibold text-[#30433F]">{label}</p></div>))}
              </div>
            </div>
          </div>
        );

      case 'sos-center':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-lg w-full space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C85D67] to-[#E57373] flex items-center justify-center mx-auto shadow-xl mb-4">
                  <span className="text-4xl">🚨</span>
                </div>
                <h2 className="text-2xl font-black text-[#202D2D] mb-2">SOS Center</h2>
                <p className="text-[#7A8582] text-sm">Emergency tools designed for high-risk situations. Choose the method that fits your situation.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => triggerSOS('button', false, false)} className="p-5 rounded-2xl bg-[#C85D67] hover:bg-[#B85060] text-white text-left transition-all shadow-lg">
                  <div className="text-2xl mb-2">🔴</div>
                  <p className="font-bold text-sm">Emergency SOS</p>
                  <p className="text-[11px] opacity-80 mt-0.5">Broadcasts to all contacts + police immediately</p>
                </button>
                <button onClick={() => setIsFakeCallOpen(true)} className="p-5 rounded-2xl bg-[#24504F] hover:bg-[#1E403F] text-white text-left transition-all shadow-lg">
                  <div className="text-2xl mb-2">📞</div>
                  <p className="font-bold text-sm">Fake Call SOS</p>
                  <p className="text-[11px] opacity-80 mt-0.5">Covert distress via fake incoming call</p>
                </button>
                <button onClick={() => setIsDuressModalOpen(true)} className="p-5 rounded-2xl bg-[#806B2B]/80 hover:bg-[#806B2B] text-white text-left transition-all shadow-lg">
                  <div className="text-2xl mb-2">🔢</div>
                  <p className="font-bold text-sm">Duress PIN</p>
                  <p className="text-[11px] opacity-80 mt-0.5">9999 → secret alert + calculator decoy</p>
                </button>
                <button onClick={handleSimulateShake} className="p-5 rounded-2xl bg-[#4A6B8A] hover:bg-[#3D5A78] text-white text-left transition-all shadow-lg">
                  <div className="text-2xl mb-2">📳</div>
                  <p className="font-bold text-sm">Shake SOS</p>
                  <p className="text-[11px] opacity-80 mt-0.5">Rapid shake gesture triggers silent alert</p>
                </button>
              </div>
            </div>
          </div>
        );

      case 'community':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F9C950] to-[#E6A817] flex items-center justify-center mx-auto shadow-xl">
                <span className="text-4xl">📢</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#202D2D] mb-2">Community Reports</h2>
                <p className="text-[#7A8582] text-sm">Report hazards, dark spots, and suspicious activity. Help other women commuters stay safe by sharing what you observe.</p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F9C950] to-[#E6A817] text-[#202D2D] font-bold text-sm shadow-lg hover:opacity-90 transition-all"
              >
                📍 Post a Safety Report
              </button>
              <div className="text-left bg-[#FFFBF0] border border-[#F9C950]/40 rounded-2xl p-4">
                <p className="text-[11px] font-bold text-[#8A7131] uppercase tracking-wider mb-2">Recent Reports</p>
                {incidents.slice(0, 3).map((inc) => (
                  <div key={inc.id} className="flex items-start gap-2 py-2 border-b border-[#F9C950]/20 last:border-0">
                    <span className="text-lg">{inc.type === 'poor_lighting' ? '🌑' : inc.type === 'harassment' ? '⚠️' : inc.type === 'well_lit' ? '💡' : '📍'}</span>
                    <div><p className="text-[12px] font-semibold text-[#202D2D]">{inc.title}</p><p className="text-[10px] text-[#9A8A6A]">{inc.decayHoursLeft}h remaining · {inc.confirmations} confirmations</p></div>
                  </div>
                ))}
                {incidents.length === 0 && <p className="text-[12px] text-[#9A8A6A]">No community reports yet. Be the first to report!</p>}
              </div>
            </div>
          </div>
        );

      case 'trusted-circle':
        return (
          <div className="flex-1 overflow-y-auto p-8">
            <GuardianDashboard
              userLocation={userLocation}
              sosState={sosState}
              activeRoute={selectedRoute}
              batteryLevel={batteryLevel}
              trustedContacts={trustedContacts}
              onTriggerRemoteSOS={() => triggerSOS('button', false, false)}
              onClearSOS={handleDisarmSOS}
              onAddContact={handleAddGuardian}
              onUpdateContact={handleUpdateGuardian}
              onDeleteContact={handleDeleteGuardian}
              onLoadSampleContacts={handleLoadSampleContacts}
              commuterProfile={commuterProfile}
              onUpdateCommuterProfile={handleUpdateCommuterProfile}
              onShowToast={showToast}
            />
          </div>
        );

      case 'safe-havens':
        return (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#202D2D] mb-1">Safe Havens</h2>
                <p className="text-[#7A8582] text-sm">Verified safe locations nearby — police booths, pink booths, hospitals, and 24/7 pharmacies.</p>
              </div>
              {landmarks.length === 0 ? (
                <div className="text-center py-16 text-[#9AACA8]">
                  <div className="text-5xl mb-4">📍</div>
                  <p className="font-semibold">No landmarks loaded yet.</p>
                  <p className="text-sm mt-1">Search a route first to load nearby safe havens.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {landmarks.map((lm) => {
                    const icon = lm.type === 'police' ? '🚔' : lm.type === 'pink_booth' ? '🩷' : lm.type === 'hospital' ? '🏥' : lm.type === 'pharmacy' ? '💊' : '🛡️';
                    const color = lm.type === 'police' ? 'border-[#4A6B8A]/30 bg-[#EEF3F8]' : lm.type === 'pink_booth' ? 'border-[#D58A93]/30 bg-[#FDF0F1]' : lm.type === 'hospital' ? 'border-[#7CA982]/30 bg-[#EEF6EE]' : 'border-[#E6A817]/30 bg-[#FFFBF0]';
                    return (
                      <div key={lm.id} className={`rounded-2xl border p-4 ${color} flex items-start gap-3`}>
                        <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-[13px] text-[#202D2D] truncate">{lm.name}</p>
                          <p className="text-[11px] text-[#7A8582] mt-0.5 truncate">{lm.address}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[11px] text-[#7CA982] font-semibold">✓ {lm.openHours}</span>
                            <span className="text-[11px] text-[#9AACA8]">{lm.distanceMeters}m away</span>
                          </div>
                          {lm.phone && (
                            <p className="text-[11px] text-[#4A6B8A] mt-1 font-medium">📞 {lm.phone}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'heatmap':
        return (
          <div className="flex-1 overflow-y-auto p-8">
            <CivicHeatmapDashboard incidents={incidents} />
          </div>
        );

      case 'ai-companion':
        return <AiCompanionPage />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F2] text-[#30433F] flex flex-col md:flex-row font-sans selection:bg-[#2F5F5E]/30 selection:text-[#30433F]">
      {/* Mobile Top Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#FAF9F6] border-b border-[#E2DDD6] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-[#EEF0EC] text-[#202D2D] hover:bg-[#E2E6DF]"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/safesafar-logo.png" alt="SafeSafar" className="w-7 h-7 rounded-lg object-cover" />
          <span className="font-black text-sm text-[#202D2D]">SafeSafar</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerSOS('button', false, false)}
            className="px-3 py-1.5 rounded-xl bg-[#C85D67] text-white text-xs font-bold shadow-sm"
          >
            🚨 SOS
          </button>
        </div>
      </div>

      {/* Decoy Screen Mode (Complete Disguise) */}
      {isDecoyOpen && (
        <DecoyScreen
          onExitDecoy={() => setIsDecoyOpen(false)}
          duressSOSDispatched={sosState.duressActive}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeFeature={activeFeature}
        onSelectFeature={setActiveFeature}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content: full-page feature area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden pt-14 md:pt-0">
        {renderFeaturePage()}
      </div>

      {/* Floating System Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[10000] bg-[#F1D9D9] border border-[#2F5F5E]/40 text-[#30433F] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-5 h-5 text-[#7CA982] shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ALL MODALS & OVERLAYS */}


      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
        onTriggerCovertSOS={handleCovertSOSFromCall}
      />

      <DuressModal
        isOpen={isDuressModalOpen}
        onClose={() => setIsDuressModalOpen(false)}
        onDuressTriggered={handleDuressPinEntered}
        onDisarmed={handleDisarmPinEntered}
        normalPin={currentUser?.normalPin || '1234'}
        duressPin={currentUser?.duressPin || '9999'}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          trustedContacts={trustedContacts}
          onUpdateTrustedContacts={handleUpdateTrustedContacts}
          onLogout={handleLogout}
        />
      )}


      <SOSModal
        isOpen={isSOSOpen}
        onClose={handleDisarmSOS}
        onDisarm={handleDisarmSOS}
        sosState={sosState}
        trustedContacts={trustedContacts}
        onDisarmClick={() => {
          setIsSOSOpen(false);
          setIsDuressModalOpen(true);
        }}
        isOfflineMode={isOfflineMode}
      />

      <WalkMeHomeModal
        isOpen={isWalkMeHomeOpen}
        onClose={() => setIsWalkMeHomeOpen(false)}
        trustedContacts={trustedContacts}
        onTriggerSOS={() => triggerSOS('route_deviation', false, false)}
        batteryLevel={batteryLevel}
      />

      <CommunityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleAddCommunityReport}
        userLocation={userLocation}
      />

      <SafeHavensDrawer
        isOpen={isSafeHavensOpen}
        onClose={() => setIsSafeHavensOpen(false)}
        landmarks={landmarks}
        onSelectLandmark={(lm) => {
          setUserLocation([lm.lat, lm.lng]);
          showToast(`📍 Set focus to safe landmark: ${lm.name}`);
        }}
      />

      {/* User Authentication & Database Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onOpenDatabaseSetup={() => {
          setIsAuthModalOpen(false);
          setIsDatabaseSetupOpen(true);
        }}
      />

      <DatabaseSetupModal
        isOpen={isDatabaseSetupOpen}
        onClose={() => setIsDatabaseSetupOpen(false)}
      />
    </div>
  );
};

export default App;
