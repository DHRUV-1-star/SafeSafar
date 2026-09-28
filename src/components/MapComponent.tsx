import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteSegment, Landmark, IncidentReport } from '../types';

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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const landmarkLayersRef = useRef<L.LayerGroup | null>(null);
  const incidentLayersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

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

    // Custom User Marker Icon
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; width: 24px; height: 24px; background: rgba(147, 51, 234, 0.4); border-radius: 50%; animation: pulse-ring 2s infinite;"></div>
          <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: #9333ea; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(147,51,234,0.8);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    userMarkerRef.current = L.marker(userLocation, { icon: userIcon }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Dynamic Tile Layer Switcher (Mapbox vs CartoDB Free)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const key = mapboxApiKey?.trim();
    if (key && key.startsWith('pk.')) {
      // High-resolution Mapbox Navigation Night Tiles
      tileLayerRef.current = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/256/{z}/{x}/{y}@2x?access_token=${key}`,
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

  // Render Routes
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayersRef.current) return;
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
        `<div style="font-weight: 600; font-size: 12px; color: #111;">
          ${route.name} <br/>
          <span style="color: ${route.color};">Safety Score: ${route.safetyScore}/100</span> (${route.durationMin} min)
        </div>`,
        { sticky: true }
      );

      group.addLayer(mainPolyline);
    });

    // Destination Marker
    const destCoords = selectedRoute.coordinates[selectedRoute.coordinates.length - 1];
    if (destCoords) {
      const destIcon = L.divIcon({
        className: 'dest-marker',
        html: `
          <div style="background: #111827; border: 2px solid #ec4899; color: #ec4899; border-radius: 20px; padding: 4px 8px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
            <span>📍 Ring Road Hub</span>
          </div>
        `,
        iconSize: [110, 28],
        iconAnchor: [55, 30],
      });
      group.addLayer(L.marker(destCoords, { icon: destIcon }));
    }
  }, [routes, selectedRoute, onSelectRoute]);

  // Render Landmarks
  useEffect(() => {
    if (!mapInstanceRef.current || !landmarkLayersRef.current) return;
    const group = landmarkLayersRef.current;
    group.clearLayers();

    if (!showSafeLandmarks) return;

    landmarks.forEach((lm) => {
      let iconSymbol = '🏛️';
      let badgeBg = '#1e3a8a';

      if (lm.type === 'pink_booth') {
        iconSymbol = '🛡️ Pink';
        badgeBg = 'rgba(236, 72, 153, 0.9)';
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
          <div style="background: ${badgeBg}; color: #fff; border: 1.5px solid rgba(255,255,255,0.8); border-radius: 9999px; padding: 3px 8px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; box-shadow: 0 4px 10px rgba(0,0,0,0.4); cursor: pointer;">
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
          <h4 style="margin: 0 0 4px 0; color: #fff; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <span>${iconSymbol}</span> ${lm.name}
          </h4>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af;">${lm.address}</p>
          <div style="display: flex; gap: 6px; font-size: 11px; margin-top: 6px;">
            <span style="background: rgba(16,185,129,0.2); color: #34d399; padding: 2px 6px; border-radius: 4px;">${lm.openHours}</span>
            <span style="background: rgba(59,130,246,0.2); color: #60a5fa; padding: 2px 6px; border-radius: 4px;">Tel: ${lm.phone}</span>
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
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 6',
    });
    deadZonePolygon.bindTooltip('⚠️ Known Mobile Dead Zone & High Night-Risk Stretch', { sticky: true });
    group.addLayer(deadZonePolygon);

    if (!showHeatmap) return;

    incidents.forEach((inc) => {
      const isSafe = inc.severity === 'safe';
      const color = isSafe ? '#10b981' : inc.severity === 'high' ? '#ef4444' : '#f59e0b';
      const label = inc.type === 'poor_lighting' ? '💡 Dark' : inc.type === 'harassment' ? '⚠️ Risk' : isSafe ? '✨ Verified Safe' : '⚠️ Alert';

      const incIcon = L.divIcon({
        className: 'incident-marker',
        html: `
          <div style="background: #111827; border: 2px solid ${color}; color: ${color}; border-radius: 8px; padding: 2px 6px; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
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
            <span style="font-size: 10px; color: #9ca3af;">${inc.timestamp}</span>
          </div>
          <p style="font-size: 12px; margin: 0 0 6px 0; color: #d1d5db;">${inc.description}</p>
          <div style="font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
            <span>Verified by ${inc.confirmations} users</span>
            <span style="color: #60a5fa;">Trust Confirmed ✓</span>
          </div>
        </div>
      `);

      group.addLayer(marker);
    });
  }, [incidents, showHeatmap]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />
    </div>
  );
};
