import React, { useState } from 'react';
import { RouteSegment, Landmark, IncidentReport, TrustedContact, ActiveSOSState } from './types';
import { INITIAL_USER_POS, MOCK_ROUTES, MOCK_LANDMARKS, MOCK_INCIDENTS, MOCK_TRUSTED_CONTACTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { MapComponent } from './components/MapComponent';
import { RouteSelector } from './components/RouteSelector';
import { LiveNavigation } from './components/LiveNavigation';
import { FakeCallModal } from './components/FakeCallModal';
import { DuressModal } from './components/DuressModal';
import { DecoyScreen } from './components/DecoyScreen';
import { SOSModal } from './components/SOSModal';
import { WalkMeHomeModal } from './components/WalkMeHomeModal';
import { CommunityReportModal } from './components/CommunityReportModal';
import { SafeHavensDrawer } from './components/SafeHavensDrawer';
import { GuardianDashboard } from './components/GuardianDashboard';
import { CivicHeatmapDashboard } from './components/CivicHeatmapDashboard';
import { Sparkles, Smartphone, Flame } from 'lucide-react';
import { playSilentConfirmPing } from './utils/audio';

export const App: React.FC = () => {
  // Navigation & View Views
  const [currentView, setCurrentView] = useState<'mobile' | 'guardian' | 'civic'>('mobile');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // Core Data
  const [routes] = useState<RouteSegment[]>(MOCK_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<RouteSegment>(MOCK_ROUTES[0]);
  const [landmarks] = useState<Landmark[]>(MOCK_LANDMARKS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(MOCK_INCIDENTS);
  const [trustedContacts] = useState<TrustedContact[]>(MOCK_TRUSTED_CONTACTS);

  // User State & Telemetry
  const [userLocation, setUserLocation] = useState<[number, number]>(INITIAL_USER_POS);
  const [batteryLevel] = useState<number>(88);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

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
    setIsDuressModalOpen(false);
    setIsSOSOpen(false);
    setSosState((prev) => ({ ...prev, isActive: false, duressActive: false }));
    showToast('✓ SafeSafar security guard disarmed safely.');
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
        batteryLevel={batteryLevel}
      />

      {/* Floating System Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161f33] border border-purple-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
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

            {/* Layout: Interactive Leaflet Map + Controls */}
            <div className={deviceFrameMode ? "max-w-[460px] mx-auto bg-black/95 p-4 rounded-[48px] border-[5px] border-[#374151] shadow-2xl space-y-4" : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"}>
              {/* Map Visualizer (Left/Top) */}
              <div className={deviceFrameMode ? "flex flex-col gap-4 w-full" : "lg:col-span-7 xl:col-span-8 flex flex-col gap-4"}>
                <div className={deviceFrameMode ? "h-[340px] w-full relative" : "h-[460px] sm:h-[520px] w-full relative"}>
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
                    onLandmarkClick={(lm) => {
                      showToast(`Safe Landmark: ${lm.name} (${lm.openHours})`);
                    }}
                  />

                  {/* Active SOS Watermark on Map */}
                  {sosState.isActive && (
                    <div className="absolute top-4 left-4 z-[400] bg-red-600/90 text-white px-3 py-1.5 rounded-full text-xs font-black tracking-wide shadow-xl flex items-center gap-2 animate-bounce">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      <span>SOS TELEMETRY TRANSMITTING LIVE</span>
                    </div>
                  )}

                  {/* 2G Fallback Watermark */}
                  {isOfflineMode && (
                    <div className="absolute top-4 right-14 z-[400] bg-yellow-600/90 text-black font-bold px-3 py-1.5 rounded-full text-[11px] shadow-xl">
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
            onClearSOS={() => {
              setSosState((prev) => ({ ...prev, isActive: false, duressActive: false }));
              showToast('SOS Cleared by Guardian');
            }}
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
      />

      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        sosState={sosState}
        trustedContacts={trustedContacts}
        onDisarmClick={() => setIsDuressModalOpen(true)}
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
