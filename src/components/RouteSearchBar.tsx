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
    <div className="bg-white/95 backdrop-blur-xl border border-[#D3E5DE] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A5E] animate-pulse"></span>
          <h2 className="text-sm font-bold text-[#243A35] uppercase tracking-wider">India Dynamic Safe Route Finder</h2>
        </div>
        <span className="text-[11px] text-[#55A184] font-mono bg-[#2D6A5E]/10 border border-[#C7DFD4] px-2.5 py-0.5 rounded-full">
          Live Geocoding Active
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        {/* Origin & Destination Inputs Wrapper */}
        <div className="flex-1 w-full flex flex-col gap-2.5">
          {/* Start Location Input */}
          <div ref={startContainerRef} className="relative w-full">
            <div className="flex items-center bg-[#F3F8F5]/95 border border-[#D3E5DE] hover:border-[#72A892]/50 focus-within:border-[#72A892] rounded-2xl px-3.5 py-2.5 transition-all">
              <MapPin className="w-4 h-4 text-[#55A184] shrink-0 mr-2.5" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-[#55A184] uppercase tracking-wide">
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
                  placeholder="Type any landmark or city in India (e.g. SVNIT Surat, Connaught Place Delhi, Marine Drive Mumbai)..."
                  className="w-full bg-transparent text-xs font-semibold text-[#243A35] focus:outline-none placeholder:text-[#899894] truncate"
                />
              </div>

              {isSearchingStart ? (
                <Loader2 className="w-4 h-4 text-[#55A184] animate-spin shrink-0 ml-2" />
              ) : (
                <button
                  type="button"
                  onClick={handleUseCurrentGPS}
                  className="p-1 rounded-lg bg-[#72A892]/10 hover:bg-[#72A892]/20 text-[#55A184] text-[10px] font-semibold flex items-center gap-1 shrink-0 ml-2 border border-[#72A892]/20"
                  title="Use Current Device GPS Location"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span className="hidden md:inline">GPS</span>
                </button>
              )}
            </div>

            {/* Live Autocomplete Dropdown Panel for Start */}
            {showStartDropdown && startSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#FFFFFF] border-2 border-[#72A892]/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-30 overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#2D6A5E]/10">
                {startSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onSelectStartLocation(sug);
                      setShowStartDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-[#72A892]/20 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[#55A184] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#243A35] block truncate">{sug.displayName.split(',')[0]}</span>
                      <span className="text-[10px] text-[#61746E] block truncate leading-tight mt-0.5">{sug.displayName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Input */}
          <div ref={destContainerRef} className="relative w-full">
            <div className="flex items-center bg-[#F3F8F5]/95 border border-[#D3E5DE] hover:border-[#D97883]/45 focus-within:border-[#72A892] rounded-2xl px-3.5 py-2.5 transition-all">
              <Navigation className="w-4 h-4 text-[#B85F6B] shrink-0 mr-2.5" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-[#61746E] uppercase tracking-wide">
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
                  placeholder="Type any destination in India (e.g. Ring Road Surat, Airport Jaipur, MG Road Bengaluru)..."
                  className="w-full bg-transparent text-xs font-semibold text-[#243A35] focus:outline-none placeholder:text-[#899894] truncate"
                />
              </div>

              {isSearchingDest && <Loader2 className="w-4 h-4 text-[#55A184] animate-spin shrink-0 ml-2" />}
            </div>

            {/* Live Autocomplete Dropdown Panel for Destination */}
            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#FFFFFF] border-2 border-[#D97883]/45 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-30 overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#2D6A5E]/10">
                {destSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onSelectDestination(sug);
                      setShowDestDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-[#F9E9EB] transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 text-[#B85F6B] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#243A35] block truncate">{sug.displayName.split(',')[0]}</span>
                      <span className="text-[10px] text-[#61746E] block truncate leading-tight mt-0.5">{sug.displayName}</span>
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
            className="flex-1 sm:flex-none p-3 rounded-2xl bg-[#EFF7F3] hover:bg-[#E5F3EC] border border-[#D3E5DE] text-[#61746E] hover:text-[#243A35] transition-all flex items-center justify-center gap-1.5"
            title="Swap Starting Point & Destination"
          >
            <ArrowUpDown className="w-4 h-4 text-[#55A184]" />
            <span className="text-xs font-semibold sm:hidden">Swap</span>
          </button>

          <button
            type="button"
            onClick={onSearchRoutes}
            disabled={isLoadingRoutes}
            className="flex-1 sm:flex-none p-3 px-5 rounded-2xl bg-[#2D6A5E] hover:bg-[#214F48] disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-[#2D6A5E]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
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
