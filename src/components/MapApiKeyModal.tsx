import React, { useState, useEffect } from 'react';
import { KeyRound, ExternalLink, CheckCircle2, Shield, X, RefreshCw, AlertCircle } from 'lucide-react';

interface MapApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const MapApiKeyModal: React.FC<MapApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setApiKeyInput(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(apiKeyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setApiKeyInput('');
    onSaveKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const isMapbox = apiKeyInput.trim().startsWith('pk.');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-3xl p-6 text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Configure Maps API Key</h3>
            <p className="text-xs text-gray-400">Mapbox GL & OpenRouteService integration</p>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-200">Active Map Provider:</span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
            currentKey
              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {currentKey ? 'Custom Mapbox Tiles Active ✓' : 'Default CartoDB / OSM (Free & Active)'}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              Mapbox Access Token (Starts with <code className="text-purple-300">pk.eyJ...</code>)
            </label>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste your pk.eyJ... token here"
              className="w-full bg-gray-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-purple-500"
            />
            {apiKeyInput && !isMapbox && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Note: Mapbox public tokens typically begin with <code>pk.</code></span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Key Saved & Applied!</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Save & Apply Key</span>
                </>
              )}
            </button>

            {currentKey && (
              <button
                type="button"
                onClick={handleClear}
                className="py-3 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold"
                title="Reset to default free tiles"
              >
                Reset Default
              </button>
            )}
          </div>
        </form>

        {/* Step-by-Step Instructions */}
        <div className="mt-5 pt-4 border-t border-white/10 text-xs text-gray-300 space-y-2.5">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <span>📌 Two Ways to Add Your API Key:</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1.5 text-[11px] text-gray-300">
            <div>
              <strong className="text-purple-300">Method 1 (Instant in UI):</strong>
              <p className="text-gray-400 mt-0.5">
                Paste your token in the box above and click <strong>"Save & Apply Key"</strong>. It saves locally to your browser and takes effect instantly without server restart.
              </p>
            </div>

            <div className="pt-2 border-t border-white/5">
              <strong className="text-purple-300">Method 2 (Environment Variable):</strong>
              <p className="text-gray-400 mt-0.5">
                Add this to your project's <code className="text-gray-200">.env</code> file:
              </p>
              <pre className="bg-gray-900/90 text-emerald-400 p-2 rounded-lg font-mono text-[10px] mt-1 border border-white/5 overflow-x-auto">
                VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
              </pre>
            </div>
          </div>

          {/* Mapbox Link */}
          <div className="pt-1 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Need a free Mapbox account?</span>
            <a
              href="https://account.mapbox.com/auth/signup/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 underline underline-offset-2"
            >
              <span>Get Free Mapbox Token</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
