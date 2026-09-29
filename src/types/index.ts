export type RouteCategory = 'safest' | 'balanced' | 'fastest';

export interface RouteSegment {
  id: string;
  name: string;
  category: RouteCategory;
  safetyScore: number; // 0 - 100
  distanceKm: number;
  durationMin: number;
  color: string;
  lightingPercent: number; // e.g. 92%
  crowdContext: {
    level: 'High' | 'Moderate' | 'Low' | 'Deserted';
    verifiedSafe: boolean; // Safe-crowd verification (market/transit vs deserted/hostile)
    description: string;
  };
  safeLandmarksCount: number; // Police booths, pink booths, 24/7 hospitals
  incidentsReported: number; // past harassment/crime reports
  coordinates: [number, number][]; // Leaflet lat, lng
  highlights: string[];
  warnings: string[];
}

export interface Landmark {
  id: string;
  name: string;
  type: 'police' | 'pink_booth' | 'hospital' | 'pharmacy' | 'safe_haven';
  lat: number;
  lng: number;
  address: string;
  phone: string;
  openHours: string;
  verified: boolean;
  distanceMeters: number;
}

export interface IncidentReport {
  id: string;
  type: 'poor_lighting' | 'harassment' | 'deserted' | 'suspicious' | 'blocked_path' | 'well_lit';
  severity: 'low' | 'medium' | 'high' | 'safe';
  lat: number;
  lng: number;
  title: string;
  description: string;
  timestamp: string;
  confirmations: number;
  requiredConfirmations: number;
  verified: boolean;
  decayHoursLeft: number;
}

export interface TrustedContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isEmergencyAlert: boolean;
  avatar: string;
  batteryStatus?: number;
  lastActive?: string;
  email?: string;
}

export interface ActiveSOSState {
  isActive: boolean;
  isSilent: boolean;
  triggerSource: 'button' | 'fake_call' | 'duress_passkey' | 'shake' | 'voice' | 'route_deviation';
  startTime: number;
  lat: number;
  lng: number;
  address: string;
  batteryLevel: number;
  audioRecordingActive: boolean;
  broadcastSentToContacts: boolean;
  policeNotified: boolean;
  duressActive: boolean;
}
