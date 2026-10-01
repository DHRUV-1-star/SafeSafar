import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RouteSegment, Landmark, IncidentReport } from '../types';
import { fetchStreetLamps, BoundingBox, StreetLamp } from '../services/overpass';

interface MapComponentProps {
  routes: RouteSegment[];
  selectedRoute: RouteSegment;
  onSelectRoute: (route: RouteSegment) => void;
  landmarks: Landmark[];
  incidents: IncidentReport[];
  userLocation: [number, number];
  isNavigating: boolean;
  navProgressIndex: number;
  showHeatmap: boolean;
  showSafeLandmarks: boolean;
  onLandmarkClick?: (lm: Landmark) => void;
  mapboxApiKey?: string;
  startLocationName?: string;
  destinationName?: string;
  onStreetLampsUpdated?: (lamps: StreetLamp[]) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  routes,
  selectedRoute,
  onSelectRoute,
  landmarks,
  incidents,
  userLocation,
  isNavigating,
  showHeatmap,
  showSafeLandmarks,
  onLandmarkClick,
  mapboxApiKey,
  startLocationName = 'SVNIT Campus, Dumas Road',
  destinationName = 'Ring Road Hub, Surat',
  onStreetLampsUpdated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const landmarkLayersRef = useRef<L.LayerGroup | null>(null);
  const incidentLayersRef = useRef<L.LayerGroup | null>(null);
  const streetLampLayersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const debounceTimerRef = useRef<any>(null);

  const [streetLamps, setStreetLamps] = useState<StreetLamp[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Safety cleanup of any existing instance
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Map cleanup error:', e);
      }
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current) {
      try {
        delete (mapContainerRef.current as any)._leaflet_id;
        mapContainerRef.current.innerHTML = '';
      } catch {}
    }

    // Center on Surat / SVNIT
    const map = L.map(mapContainerRef.current, {
      center: userLocation,
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    routeLayersRef.current = L.layerGroup().addTo(map);
    landmarkLayersRef.current = L.layerGroup().addTo(map);
    incidentLayersRef.current = L.layerGroup().addTo(map);
    streetLampLayersRef.current = L.layerGroup().addTo(map);

    // Custom User Marker Icon
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; width: 24px; height: 24px; background: rgba(47, 95, 94, 0.25); border-radius: 50%; animation: pulse-ring 2s infinite;"></div>
          <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: #2D6A5E; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 10px rgba(47,95,94,0.45);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    userMarkerRef.current = L.marker(userLocation, { icon: userIcon }).addTo(map);

    mapInstanceRef.current = map;

    // Trigger fetchStreetLamps on map load and on moveend/zoomend (debounced ~500ms)
    const queryLamps = () => {
      if (!mapInstanceRef.current) return;
      const bounds = mapInstanceRef.current.getBounds();
      const bBox: BoundingBox = {
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      };

      fetchStreetLamps(bBox).then((lamps) => {
        setStreetLamps(lamps);
        if (onStreetLampsUpdated) {
          onStreetLampsUpdated(lamps);
        }
      });
    };

    const debouncedQueryLamps = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        queryLamps();
      }, 500);
    };

    // Initial load fetch
    debouncedQueryLamps();

    map.on('moveend', debouncedQueryLamps);
    map.on('zoomend', debouncedQueryLamps);

    // Observe container size adjustments
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      map.off('moveend', debouncedQueryLamps);
      map.off('zoomend', debouncedQueryLamps);
      resizeObserver.disconnect();
      try {
        if (tileLayerRef.current) {
          map.removeLayer(tileLayerRef.current);
          tileLayerRef.current = null;
        }
        if (routeLayersRef.current) {
          routeLayersRef.current.clearLayers();
          map.removeLayer(routeLayersRef.current);
          routeLayersRef.current = null;
        }
        if (landmarkLayersRef.current) {
          landmarkLayersRef.current.clearLayers();
          map.removeLayer(landmarkLayersRef.current);
          landmarkLayersRef.current = null;
        }
        if (incidentLayersRef.current) {
          incidentLayersRef.current.clearLayers();
          map.removeLayer(incidentLayersRef.current);
          incidentLayersRef.current = null;
        }
        if (streetLampLayersRef.current) {
          streetLampLayersRef.current.clearLayers();
          map.removeLayer(streetLampLayersRef.current);
          streetLampLayersRef.current = null;
        }
        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
          userMarkerRef.current = null;
        }
        map.off();
        map.remove();
      } catch (err) {
        console.warn('Map cleanup error:', err);
      } finally {
        mapInstanceRef.current = null;
        if (mapContainerRef.current) {
          try {
            delete (mapContainerRef.current as any)._leaflet_id;
            mapContainerRef.current.innerHTML = '';
          } catch {}
        }
      }
    };
  }, []);

  // Dynamic Tile Layer Switcher (Mapbox vs CartoDB Free)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch {}
      tileLayerRef.current = null;
    }

    const key = mapboxApiKey?.trim();
    if (key && key.startsWith('pk.')) {
      // High-resolution Mapbox Navigation Night Tiles
      tileLayerRef.current = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/256/{z}/{x}/{y}@2x?access_token=${key}`,
        {
          attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; OpenStreetMap',
          tileSize: 512,
          zoomOffset: -1,
          maxZoom: 20,
        }
      ).addTo(map);
    } else {
      // Free CartoDB Voyager / Dark Matter Tiles (No Key Required)
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);
    }

    return () => {
      if (tileLayerRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(tileLayerRef.current);
        } catch {}
        tileLayerRef.current = null;
      }
    };
  }, [mapboxApiKey]);

  // Update User Marker position
  useEffect(() => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLocation);
      if (isNavigating && mapInstanceRef.current) {
        mapInstanceRef.current.panTo(userLocation, { animate: true, duration: 0.8 });
      }
    }
  }, [userLocation, isNavigating]);

  // Render Routes & Start / Destination Pins
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayersRef.current) return;
    const map = mapInstanceRef.current;
    const group = routeLayersRef.current;
    group.clearLayers();

    routes.forEach((route) => {
      const isSelected = route.id === selectedRoute.id;

      // Glow shadow for selected route
      if (isSelected) {
        const shadowPolyline = L.polyline(route.coordinates, {
          color: route.color,
          weight: 12,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
        });
        group.addLayer(shadowPolyline);
      }

      // Main route polyline
      const mainPolyline = L.polyline(route.coordinates, {
        color: route.color,
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.45,
        dashArray: isSelected ? undefined : '6, 8',
        lineCap: 'round',
        lineJoin: 'round',
      });

      mainPolyline.on('click', () => {
        onSelectRoute(route);
      });

      mainPolyline.bindTooltip(
        `<div style="font-weight: 600; font-size: 12px; color: #243A35;">
          ${route.name} <br/>
          <span style="color: ${route.color};">Safety Score: ${route.safetyScore}/100</span> (${route.durationMin} min)
        </div>`,
        { sticky: true }
      );

      group.addLayer(mainPolyline);
    });

    const shortStartLabel = startLocationName.split(',')[0].trim();
    const shortDestLabel = destinationName.split(',')[0].trim();

    // 1. START LOCATION MARKER (Green Pin)
    const startCoords = selectedRoute.coordinates[0];
    if (startCoords) {
      const startIcon = L.divIcon({
        className: 'start-marker',
        html: `
          <div title="${startLocationName}" style="background: #E5F3EC; border: 2px solid #55A184; color: #2D6A5E; border-radius: 20px; padding: 4px 10px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 4px 14px rgba(48,67,63,0.16); white-space: nowrap; max-width: 220px; overflow: hidden; text-overflow: ellipsis;">
            <span>🟢 START: ${shortStartLabel}</span>
          </div>
        `,
        iconSize: [160, 28],
        iconAnchor: [80, 32],
      });
      group.addLayer(L.marker(startCoords, { icon: startIcon }));
    }

    // 2. DESTINATION MARKER (Pink Pin)
    const destCoords = selectedRoute.coordinates[selectedRoute.coordinates.length - 1];
    if (destCoords) {
      const destIcon = L.divIcon({
        className: 'dest-marker',
        html: `
          <div title="${destinationName}" style="background: #F9E9EB; border: 2px solid #D97883; color: #D97883; border-radius: 20px; padding: 4px 10px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 4px 14px rgba(48,67,63,0.16); white-space: nowrap; max-width: 220px; overflow: hidden; text-overflow: ellipsis;">
            <span>📍 DEST: ${shortDestLabel}</span>
          </div>
        `,
        iconSize: [160, 28],
        iconAnchor: [80, -4],
      });
      group.addLayer(L.marker(destCoords, { icon: destIcon }));
    }

    // Auto-fit map bounds to show full route path clearly
    if (!isNavigating && selectedRoute.coordinates.length > 0) {
      map.fitBounds(selectedRoute.coordinates, { padding: [40, 40] });
    }
  }, [routes, selectedRoute, onSelectRoute, startLocationName, destinationName, isNavigating]);

  // Render Landmarks
  useEffect(() => {
    if (!mapInstanceRef.current || !landmarkLayersRef.current) return;
    const group = landmarkLayersRef.current;
    group.clearLayers();

    if (!showSafeLandmarks) return;

    landmarks.forEach((lm) => {
      let iconSymbol = '🏛️';
      let badgeBg = '#2D6A5E';

      if (lm.type === 'pink_booth') {
        iconSymbol = '🛡️ Pink';
        badgeBg = 'rgba(229, 115, 115, 0.9)';
      } else if (lm.type === 'police') {
        iconSymbol = '👮 Police';
        badgeBg = 'rgba(37, 99, 235, 0.9)';
      } else if (lm.type === 'hospital') {
        iconSymbol = '🏥 24/7 Med';
        badgeBg = 'rgba(16, 185, 129, 0.9)';
      } else if (lm.type === 'pharmacy') {
        iconSymbol = '💊 Safe Haven';
        badgeBg = 'rgba(217, 119, 6, 0.9)';
      }

      const lmIcon = L.divIcon({
        className: 'landmark-marker',
        html: `
          <div style="background: ${badgeBg}; color: #FFFFFF; border: 1.5px solid rgba(255,255,255,0.9); border-radius: 9999px; padding: 3px 8px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; box-shadow: 0 4px 10px rgba(48,67,63,0.12); cursor: pointer;">
            ${iconSymbol}
          </div>
        `,
        iconSize: [85, 24],
        iconAnchor: [42, 12],
      });

      const marker = L.marker([lm.lat, lm.lng], { icon: lmIcon });
      marker.on('click', () => {
        if (onLandmarkClick) onLandmarkClick(lm);
      });

      marker.bindPopup(`
        <div style="padding: 4px;">
          <h4 style="margin: 0 0 4px 0; color: #FFFFFF; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>${iconSymbol}</span> ${lm.name}
          </h4>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #61746E;">${lm.address}</p>
          <div style="display: flex; gap: 6px; font-size: 11px; margin-top: 6px;">
            <span style="background: rgba(142,173,148,0.16); color: #2D6A5E; padding: 2px 6px; border-radius: 4px;">${lm.openHours}</span>
            <span style="background: rgba(111,150,128,0.14); color: #67A98A; padding: 2px 6px; border-radius: 4px;">Tel: ${lm.phone}</span>
          </div>
        </div>
      `);

      group.addLayer(marker);
    });
  }, [landmarks, showSafeLandmarks, onLandmarkClick]);

  // Render Incidents & Dead Zones
  useEffect(() => {
    if (!mapInstanceRef.current || !incidentLayersRef.current) return;
    const group = incidentLayersRef.current;
    group.clearLayers();

    // Dead-zone polygon warning near Canal Underpass (as noted on page 4 & 7)
    const deadZonePolygon = L.polygon([
      [21.1710, 72.7800],
      [21.1795, 72.7870],
      [21.1770, 72.7910],
      [21.1690, 72.7830],
    ], {
      color: '#D97883',
      fillColor: '#D97883',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 6',
    });
    deadZonePolygon.bindTooltip('⚠️ Known Mobile Dead Zone & High Night-Risk Stretch', { sticky: true });
    group.addLayer(deadZonePolygon);

    if (!showHeatmap) return;

    incidents.forEach((inc) => {
      const isSafe = inc.severity === 'safe';
      const color = isSafe ? '#67A98A' : inc.severity === 'high' ? '#D97883' : '#C99B3E';
      const label = inc.type === 'poor_lighting' ? '💡 Dark' : inc.type === 'harassment' ? '⚠️ Risk' : isSafe ? '✨ Verified Safe' : '⚠️ Alert';

      const incIcon = L.divIcon({
        className: 'incident-marker',
        html: `
          <div style="background: #FFFFFF; border: 2px solid ${color}; color: ${color}; border-radius: 8px; padding: 2px 6px; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; box-shadow: 0 2px 8px rgba(48,67,63,0.16);">
            ${label}
          </div>
        `,
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });

      const marker = L.marker([inc.lat, inc.lng], { icon: incIcon });
      marker.bindPopup(`
        <div style="padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 700; color: ${color}; font-size: 12px;">${inc.title}</span>
            <span style="font-size: 10px; color: #61746E;">${inc.timestamp}</span>
          </div>
          <p style="font-size: 12px; margin: 0 0 6px 0; color: #53635E;">${inc.description}</p>
          <div style="font-size: 11px; color: #61746E; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
            <span>Verified by ${inc.confirmations} users</span>
            <span style="color: #67A98A;">Trust Confirmed ✓</span>
          </div>
        </div>
      `);

      group.addLayer(marker);
    });
  }, [incidents, showHeatmap]);

  // Render Street Lamps as small CircleMarker dots, gated behind existing showSafeLandmarks toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !streetLampLayersRef.current) return;
    const group = streetLampLayersRef.current;
    group.clearLayers();

    if (!showSafeLandmarks || streetLamps.length === 0) return;

    streetLamps.forEach((lamp) => {
      const circle = L.circleMarker([lamp.lat, lamp.lng], {
        radius: 3.5,
        color: '#C99B3E',
        fillColor: '#FFF5DA',
        fillOpacity: 0.85,
        weight: 1.5,
      });

      circle.bindPopup(`
        <div style="font-size: 11px; padding: 2px;">
          <strong style="color: #C99B3E; display: flex; align-items: center; gap: 4px;">💡 OSM Street Lamp</strong>
          <div style="color: #61746E; margin-top: 2px;">OSM Node ID: ${lamp.id}</div>
          <div style="color: #67A98A; font-family: monospace;">${lamp.lat.toFixed(5)}, ${lamp.lng.toFixed(5)}</div>
          <div style="margin-top: 4px; font-size: 10px; color: #67A98A; background: rgba(16,185,129,0.15); padding: 2px 4px; border-radius: 4px; display: inline-block;">Verified OSM Light Source</div>
        </div>
      `);

      group.addLayer(circle);
    });
  }, [streetLamps, showSafeLandmarks]);

  return (
    <div className="relative z-0 isolate w-full h-full min-h-[380px] rounded-2xl overflow-hidden shadow-2xl border border-[#2D6A5E]/15">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] relative z-0" />
    </div>
  );
};
