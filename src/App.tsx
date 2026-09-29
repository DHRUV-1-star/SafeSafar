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
import { AuthPage } from './components/AuthPage';
import { UserProfileModal } from './components/UserProfileModal';
import { Sparkles, Smartphone, Flame } from 'lucide-react';
import { playSilentConfirmPing, stopSiren } from './utils/audio';
import { fetchRealRoutes, searchLocationSuggestions, generateRouteLandmarks, LocationSuggestion } from './services/geocodingService';

export const App: React.FC = () => {
  // Authentication & Safety Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('safesafar_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Start unauthenticated to showcase the dedicated Auth Page
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Navigation & View Views
  const [currentView, setCurrentView] = useState<'mobile' | 'guardian' | 'civic'>('mobile');


  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // Mapbox token: read from .env at build time only (pk.* public token, safe for client)
  const mapboxApiKey = (import.meta.env.VITE_MAPBOX_TOKEN as string) || '';

  // Core Data & Real Routing State
  const [routes, setRoutes] = useState<RouteSegment[]>(MOCK_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<RouteSegment>(MOCK_ROUTES[0]);
  const [landmarks, setLandmarks] = useState<Landmark[]>(MOCK_LANDMARKS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(MOCK_INCIDENTS);

  // Dynamic User-Entered Guardians (persisted in localStorage)
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(() => {
    const saved = localStorage.getItem('safesafar_guardians') || localStorage.getItem('safesafar_trusted_contacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading saved guardians', e);
      }
    }
    return MOCK_TRUSTED_CONTACTS;
  });

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
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('safesafar_user', JSON.stringify(user));

    if (user.role === 'guardian') {
      setCurrentView('guardian');
    } else if (user.role === 'civic') {
      setCurrentView('civic');
    } else {
      setCurrentView('mobile');
    }

    showToast(`✓ Welcome back, ${user.name}! Mode: ${user.role.toUpperCase()}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('safesafar_user');
    showToast('Signed out from SafeSafar. Public guest mode active.');
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    localStorage.setItem('safesafar_user', JSON.stringify(updated));
    showToast('✓ Security PINs and profile updated successfully!');
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
  const handleAddCommunityReport = (newReport: any) => {
    const reportItem: IncidentReport = {
      ...newReport,
      id: `inc-${Date.now()}`,
      timestamp: 'Just now',
      confirmations: 1,
      requiredConfirmations: 3,
      verified: false,
      decayHoursLeft: 48,
    };
    setIncidents([reportItem, ...incidents]);
    showToast('✓ Community safety condition posted! Pending trust peer audit.');
  };

  // Guardian Management Handlers (Only user-entered details will appear)
  const handleAddGuardian = (contactData: Omit<TrustedContact, 'id'>) => {
    const newContact: TrustedContact = {
      ...contactData,
      id: `guardian-${Date.now()}`,
      batteryStatus: contactData.batteryStatus ?? Math.floor(Math.random() * 20) + 80,
      lastActive: 'Active now',
      avatar:
        contactData.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contactData.name)}&backgroundColor=7c3aed,4f46e5,db2777`,
    };
    const updated = [...trustedContacts, newContact];
    setTrustedContacts(updated);
    localStorage.setItem('safesafar_guardians', JSON.stringify(updated));
    showToast(`✓ Guardian "${newContact.name}" added successfully!`);
  };

  const handleUpdateGuardian = (id: string, updatedFields: Partial<TrustedContact>) => {
    const updated = trustedContacts.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
    setTrustedContacts(updated);
    localStorage.setItem('safesafar_guardians', JSON.stringify(updated));
    showToast('✓ Guardian details updated!');
  };

  const handleDeleteGuardian = (id: string) => {
    const target = trustedContacts.find((c) => c.id === id);
    const updated = trustedContacts.filter((c) => c.id !== id);
    setTrustedContacts(updated);
    localStorage.setItem('safesafar_guardians', JSON.stringify(updated));
    showToast(`✓ Guardian "${target?.name || ''}" removed.`);
  };

  const handleLoadSampleContacts = () => {
    setTrustedContacts(MOCK_TRUSTED_CONTACTS);
    localStorage.setItem('safesafar_guardians', JSON.stringify(MOCK_TRUSTED_CONTACTS));
    showToast('Demo guardian contacts loaded.');
  };

  const handleUpdateCommuterProfile = (profile: CommuterProfile) => {
    setCommuterProfile(profile);
    localStorage.setItem('safesafar_commuter_profile', JSON.stringify(profile));
  };

  // If user is unauthenticated, show the dedicated SafeSafar Auth Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0E17] text-gray-100 font-sans">
        <AuthPage onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[10000] bg-[#161f33] border border-purple-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E17] text-gray-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-white">
      {/* Decoy Screen Mode (Complete Disguise) */}
      {isDecoyOpen && (
        <DecoyScreen
          onExitDecoy={() => setIsDecoyOpen(false)}
          duressSOSDispatched={sosState.duressActive}
        />
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOfflineMode={isOfflineMode}
        onToggleOffline={() => {
          setIsOfflineMode(!isOfflineMode);
          showToast(!isOfflineMode ? '📶 Switched to 2G / SMS Fallback Mode' : '⚡ 5G Online Mode Restored');
        }}
        onTriggerFakeCall={() => setIsFakeCallOpen(true)}
        onOpenDuressModal={() => setIsDuressModalOpen(true)}
        onOpenDecoy={() => setIsDecoyOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSafeHavens={() => setIsSafeHavensOpen(true)}

        onTriggerSOS={() => triggerSOS('button', false, false)}
        onDisarmSOS={handleDisarmSOS}
        sosState={sosState}
        batteryLevel={batteryLevel}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsProfileModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Floating System Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[10000] bg-[#161f33] border border-purple-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* VIEW 1: Mobile Companion View */}
        {currentView === 'mobile' && (
          <div className="space-y-6">
            {/* Top Innovation Banner & Sub-Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-purple-950/40 via-gray-900 to-indigo-950/40 border border-purple-500/20 rounded-2xl p-3.5 px-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-white">Safe Route Intelligence: Surat Pilot Corridor</span>
                <span className="text-[10px] text-purple-300 font-mono hidden md:inline">SVNIT ➔ Ring Road Hub</span>
              </div>

              {/* Map Layer Toggles & Shake Demo */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSafeLandmarks(!showSafeLandmarks)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    showSafeLandmarks ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  Pink & Police Posts
                </button>

                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    showHeatmap ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Flame className="w-3 h-3 inline mr-1" />
                  Dark Spot Heatmap
                </button>

                <button
                  onClick={() => setDeviceFrameMode(!deviceFrameMode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                    deviceFrameMode ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                  }`}
                  title="Toggle Mobile Device Mockup Frame"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{deviceFrameMode ? 'Frame: Phone' : 'Frame: Full'}</span>
                </button>

                <button
                  onClick={handleSimulateShake}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition-all flex items-center gap-1"
                  title="Simulate rapid phone shake or 3-tap panic gesture"
                >
                  <span>Shake SOS</span>
                </button>
              </div>
            </div>

            {/* Route Search & Location Input Bar */}
            <RouteSearchBar
              startLocation={startLocationName}
              destination={destinationName}
              onSelectStartLocation={handleSelectStartLocation}
              onSelectDestination={handleSelectDestination}
              onStartLocationInputChange={setStartLocationName}
              onDestinationInputChange={setDestinationName}
              onSwapLocations={handleSwapLocations}
              onSearchRoutes={handleFetchRealRoutes}
              isLoadingRoutes={isLoadingRoutes}
            />

            {/* Layout: Interactive Leaflet Map + Controls */}
            <div className={deviceFrameMode ? "max-w-[460px] mx-auto bg-black/95 p-4 rounded-[48px] border-[5px] border-[#374151] shadow-2xl space-y-4 relative z-10" : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10"}>
              {/* Map Visualizer (Left/Top) */}
              <div className={deviceFrameMode ? "flex flex-col gap-4 w-full" : "lg:col-span-7 xl:col-span-8 flex flex-col gap-4"}>
                <div className={deviceFrameMode ? "h-[340px] w-full relative z-0 isolate" : "h-[460px] sm:h-[520px] w-full relative z-0 isolate"}>
                  <MapComponent
                    routes={routes}
                    selectedRoute={selectedRoute}
                    onSelectRoute={setSelectedRoute}
                    landmarks={landmarks}
                    incidents={incidents}
                    userLocation={userLocation}
                    isNavigating={isNavigating}
                    navProgressIndex={navStepIndex}
                    showHeatmap={showHeatmap}
                    showSafeLandmarks={showSafeLandmarks}
                    mapboxApiKey={mapboxApiKey}
                    startLocationName={startLocationName}
                    destinationName={destinationName}
                    onStreetLampsUpdated={handleStreetLampsUpdated}
                    onLandmarkClick={(lm) => {
                      showToast(`Safe Landmark: ${lm.name} (${lm.openHours})`);
                    }}
                  />

                  {/* Active SOS Watermark on Map */}
                  {sosState.isActive && (
                    <div className="absolute top-4 left-4 z-10 bg-red-600/90 text-white px-3 py-1.5 rounded-full text-xs font-black tracking-wide shadow-xl flex items-center gap-2 animate-bounce pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      <span>SOS TELEMETRY TRANSMITTING LIVE</span>
                    </div>
                  )}

                  {/* 2G Fallback Watermark */}
                  {isOfflineMode && (
                    <div className="absolute top-4 right-14 z-10 bg-yellow-600/90 text-black font-bold px-3 py-1.5 rounded-full text-[11px] shadow-xl pointer-events-none">
                      OFFLINE / 2G MESH ACTIVE
                    </div>
                  )}
                </div>

                {/* Turn-by-turn Navigation drawer when navigating */}
                {isNavigating && (
                  <LiveNavigation
                    route={selectedRoute}
                    landmarks={landmarks}
                    onEndTrip={() => setIsNavigating(false)}
                    onSimulateDeviation={handleSimulateDeviation}
                    onSafeArrival={handleSafeArrival}
                    currentCoordIndex={navStepIndex}
                    onStepNextCoord={handleStepNextCoord}
                  />
                )}
              </div>

              {/* Route Selector & Innovation Explainability (Right/Bottom) */}
              <div className={deviceFrameMode ? "w-full space-y-4" : "lg:col-span-5 xl:col-span-4 space-y-4"}>
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

                {/* Quick Covert Toolkit Card */}
                <div className="bg-[#111827]/80 border border-white/10 rounded-3xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Covert Safety Arsenal</span>
                    <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/20">
                      Novel Innovations
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    Covert mechanisms built specifically for situations where visible action would escalate danger:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setIsFakeCallOpen(true)}
                      className="p-3 rounded-2xl bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-left transition-all group"
                    >
                      <span className="text-xs font-bold text-white block group-hover:text-purple-300">
                        📞 Fake Call to SOS
                      </span>
                      <span className="text-[10px] text-gray-400 leading-tight block mt-0.5">
                        Trigger secret alert using voice keyword "reach soon"
                      </span>
                    </button>

                    <button
                      onClick={() => setIsDuressModalOpen(true)}
                      className="p-3 rounded-2xl bg-amber-900/20 hover:bg-amber-900/30 border border-amber-500/30 text-left transition-all group"
                    >
                      <span className="text-xs font-bold text-white block group-hover:text-amber-300">
                        🔢 Duress PIN (9999)
                      </span>
                      <span className="text-[10px] text-gray-400 leading-tight block mt-0.5">
                        Deceives attacker with Decoy Calculator while alerting police
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Guardian Web Live Dashboard */}
        {currentView === 'guardian' && (
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
        )}

        {/* VIEW 3: Civic Safety Analytics & Heatmap */}
        {currentView === 'civic' && (
          <CivicHeatmapDashboard incidents={incidents} />
        )}
      </main>

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
    </div>
  );
};

export default App;
