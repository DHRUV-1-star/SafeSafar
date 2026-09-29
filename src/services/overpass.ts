import { RouteSegment, Landmark } from '../types';

export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface StreetLamp {
  id: number | string;
  lat: number;
  lng: number;
  tags?: Record<string, string>;
}

export interface RouteLightingCalculation {
  lightingPercent: number;
  confidence: 'high' | 'medium' | 'low';
  warning?: string;
}

// In-memory cache to avoid redundant Overpass API requests
const cache = new Map<string, { timestamp: number; data: StreetLamp[] }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Fetches verified street lamp and lighting nodes from OpenStreetMap via Overpass API
 */
export async function fetchStreetLamps(bbox: BoundingBox): Promise<StreetLamp[]> {
  const cacheKey = `${bbox.south.toFixed(3)},${bbox.west.toFixed(3)},${bbox.north.toFixed(3)},${bbox.east.toFixed(3)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Construct Overpass QL query for street lamps and lit nodes within the bounding box
  const query = `[out:json][timeout:10];
(
  node["highway"="street_lamp"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
  node["lit"="yes"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
);
out body 150;`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Overpass] Request failed with status: ${response.status}`);
      return [];
    }

    const json = await response.json();
    if (!json || !Array.isArray(json.elements)) {
      return [];
    }

    const lamps: StreetLamp[] = json.elements
      .filter((el: any) => typeof el.lat === 'number' && typeof el.lon === 'number')
      .map((el: any) => ({
        id: el.id,
        lat: el.lat,
        lng: el.lon,
        tags: el.tags,
      }));

    cache.set(cacheKey, { timestamp: Date.now(), data: lamps });
    return lamps;
  } catch (error) {
    // Overpass can time out or fail on strict networks; gracefully return empty list
    console.debug('[Overpass] Notice: Unable to load street lamps from Overpass API', error);
    return [];
  }
}

/**
 * Calculates lighting coverage percentage and confidence level for a route based on
 * OSM street lamps, verified landmarks, and route category.
 */
export function calculateRouteLighting(
  route: RouteSegment,
  lamps: StreetLamp[],
  landmarks: Landmark[]
): RouteLightingCalculation {
  if (!route.coordinates || route.coordinates.length === 0) {
    return {
      lightingPercent: route.lightingPercent || 75,
      confidence: 'medium',
    };
  }

  // Haversine distance in meters between two lat/lng points
  const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find lamps within 45 meters of any route coordinate
  let lampsNearRoute = 0;
  for (const lamp of lamps) {
    for (const [lat, lng] of route.coordinates) {
      if (distanceMeters(lat, lng, lamp.lat, lamp.lng) <= 45) {
        lampsNearRoute++;
        break;
      }
    }
  }

  // Find well-lit 24/7 landmarks (police, pink booths, hospitals) within 80m of route
  let wellLitLandmarksNearRoute = 0;
  for (const lm of landmarks) {
    for (const [lat, lng] of route.coordinates) {
      if (distanceMeters(lat, lng, lm.lat, lm.lng) <= 80) {
        wellLitLandmarksNearRoute++;
        break;
      }
    }
  }

  const routeLengthKm = route.distanceKm || 1;
  const expectedLamps = Math.max(3, Math.round(routeLengthKm * 8)); // ~8 lamps per km on urban road

  if (lamps.length === 0) {
    // Overpass data not loaded or empty for this area; use baseline with safe landmarks boost
    const landmarkBonus = Math.min(10, wellLitLandmarksNearRoute * 3);
    const calculatedLighting = Math.min(95, Math.max(50, route.lightingPercent + landmarkBonus));
    const confidence: 'high' | 'medium' | 'low' =
      wellLitLandmarksNearRoute >= 2 ? 'medium' : 'low';

    return {
      lightingPercent: calculatedLighting,
      confidence,
      warning:
        confidence === 'low'
          ? 'Sparse OSM street lighting data for this corridor'
          : undefined,
    };
  }

  // We have real OSM street lamps
  const coverageRatio = Math.min(1.2, (lampsNearRoute + wellLitLandmarksNearRoute * 2) / expectedLamps);
  const baseScore = Math.round(coverageRatio * 70 + 25);
  const clampedPercent = Math.min(98, Math.max(35, baseScore));

  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (lampsNearRoute >= expectedLamps * 0.7) {
    confidence = 'high';
  } else if (lampsNearRoute >= 2) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    lightingPercent: clampedPercent,
    confidence,
    warning:
      confidence === 'low'
        ? 'Limited lighting data for this stretch (OSM street lamps & amenities sparse)'
        : undefined,
  };
}
