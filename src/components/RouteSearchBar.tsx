import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ArrowUpDown, Search, Loader2, LocateFixed } from 'lucide-react';
import { searchLocationSuggestions, LocationSuggestion } from '../services/geocodingService';

interface RouteSearchBarProps {
  startLocation: string;
  destination: string;
  onSelectStartLocation: (suggestion: LocationSuggestion) => void;
  onSelectDestination: (suggestion: LocationSuggestion) => void;
  onStartLocationInputChange: (val: string) => void;
  onDestinationInputChange: (val: string) => void;
  onSwapLocations: () => void;
  onSearchRoutes: () => void;
  isLoadingRoutes: boolean;
}

export const RouteSearchBar: React.FC<RouteSearchBarProps> = ({
  startLocation,
  destination,
  onSelectStartLocation,
  onSelectDestination,
  onStartLocationInputChange,
  onDestinationInputChange,
  onSwapLocations,
  onSearchRoutes,
  isLoadingRoutes,
}) => {
  // Start location autocomplete state
  const [startSuggestions, setStartSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState<boolean>(false);
  const [showStartDropdown, setShowStartDropdown] = useState<boolean>(false);

  // Destination autocomplete state
  const [destSuggestions, setDestSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingDest, setIsSearchingDest] = useState<boolean>(false);
  const [showDestDropdown, setShowDestDropdown] = useState<boolean>(false);

  const startContainerRef = useRef<HTMLDivElement>(null);
  const destContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search for Start Location
  useEffect(() => {
    if (!startLocation || startLocation.length < 2) {
      setStartSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingStart(true);
      const results = await searchLocationSuggestions(startLocation);
      setStartSuggestions(results);
      setIsSearchingStart(false);
      setShowStartDropdown(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [startLocation]);

  // Debounced search for Destination Location
  useEffect(() => {
    if (!destination || destination.length < 2) {
      setDestSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDest(true);
      const results = await searchLocationSuggestions(destination);
      setDestSuggestions(results);
      setIsSearchingDest(false);
      setShowDestDropdown(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [destination]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (startContainerRef.current && !startContainerRef.current.contains(e.target as Node)) {
        setShowStartDropdown(false);
      }
      if (destContainerRef.current && !destContainerRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use browser Geolocation API for Current GPS
  const handleUseCurrentGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const sug: LocationSuggestion = {
            displayName: 'My Current GPS Location, India',
            shortName: 'My Current GPS Location',
            subtitle: 'Device Geolocation',
            placeType: 'locality',
            typeLabel: '📍 Current GPS',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          onSelectStartLocation(sug);
        },
        (err) => {
          console.warn('GPS location access denied:', err);
        }
      );
    }
  };

  return (
    <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">India Dynamic Safe Route Finder</h2>
        </div>
        <span className="text-[11px] text-purple-400 font-mono bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
          Live Geocoding Active
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        {/* Origin & Destination Inputs Wrapper */}
        <div className="flex-1 w-full flex flex-col gap-2.5">
          {/* Start Location Input */}
          <div ref={startContainerRef} className="relative w-full">
            <div className="flex items-center bg-gray-900/90 border border-white/10 hover:border-emerald-500/50 focus-within:border-emerald-500 rounded-2xl px-3.5 py-2.5 transition-all">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mr-2.5" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                  Starting Point (Origin in India)
                </label>
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => onStartLocationInputChange(e.target.value)}
                  onFocus={() => setShowStartDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (startSuggestions.length > 0) {
                        onSelectStartLocation(startSuggestions[0]);
                        setShowStartDropdown(false);
                      }
                      onSearchRoutes();
                    }
                  }}
                  placeholder="Search any village, town, or city in India (e.g. Bhadrod, Mahuva, SVNIT Surat, Jaipur)..."
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none placeholder:text-gray-500 truncate"
                />
              </div>

              {isSearchingStart ? (
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0 ml-2" />
              ) : (
                <button
                  type="button"
                  onClick={handleUseCurrentGPS}
                  className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 shrink-0 ml-2 border border-emerald-500/20"
                  title="Use Current Device GPS Location"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span className="hidden md:inline">GPS</span>
                </button>
              )}
            </div>

            {/* Live Autocomplete Dropdown Panel for Start */}
            {showStartDropdown && startSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#162035] border-2 border-emerald-500/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-30 overflow-hidden max-h-64 overflow-y-auto divide-y divide-white/10">
                {startSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onSelectStartLocation(sug);
                      setShowStartDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-emerald-500/20 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="mt-0.5 shrink-0">
                      <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white block truncate">{sug.shortName || sug.displayName.split(',')[0]}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 font-medium shrink-0 border border-emerald-500/20">
                          {sug.typeLabel || '📍 Place'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-300 block truncate leading-tight mt-0.5">{sug.subtitle || sug.displayName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div ref={destContainerRef} className="relative w-full">
            <div className="flex items-center bg-gray-900/90 border border-white/10 hover:border-pink-500/50 focus-within:border-pink-500 rounded-2xl px-3.5 py-2.5 transition-all">
              <Navigation className="w-4 h-4 text-pink-400 shrink-0 mr-2.5" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-pink-400 uppercase tracking-wide">
                  Destination Point (India)
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => onDestinationInputChange(e.target.value)}
                  onFocus={() => setShowDestDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (destSuggestions.length > 0) {
                        onSelectDestination(destSuggestions[0]);
                        setShowDestDropdown(false);
                      }
                      onSearchRoutes();
                    }
                  }}
                  placeholder="Type any village, town, or city in India (e.g. Bhadrod, Mahuva, Ring Road Surat)..."
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none placeholder:text-gray-500 truncate"
                />
              </div>

              {isSearchingDest && <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0 ml-2" />}
            </div>

            {/* Live Autocomplete Dropdown Panel for Destination */}
            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#162035] border-2 border-pink-500/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-30 overflow-hidden max-h-64 overflow-y-auto divide-y divide-white/10">
                {destSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onSelectDestination(sug);
                      setShowDestDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-pink-500/20 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="mt-0.5 shrink-0">
                      <Navigation className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white block truncate">{sug.shortName || sug.displayName.split(',')[0]}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-pink-300 font-medium shrink-0 border border-pink-500/20">
                          {sug.typeLabel || '📍 Place'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-300 block truncate leading-tight mt-0.5">{sug.subtitle || sug.displayName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls: Swap & Find Route */}
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={onSwapLocations}
            className="flex-1 sm:flex-none p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
            title="Swap Starting Point & Destination"
          >
            <ArrowUpDown className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold sm:hidden">Swap</span>
          </button>

          <button
            type="button"
            onClick={onSearchRoutes}
            disabled={isLoadingRoutes}
            className="flex-1 sm:flex-none p-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLoadingRoutes ? (
              <Loader2 className="w-4 h-4 animate-spin fill-white shrink-0" />
            ) : (
              <Search className="w-4 h-4 fill-white shrink-0" />
            )}
            <span>{isLoadingRoutes ? 'Calculating...' : 'Find Safe Routes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
