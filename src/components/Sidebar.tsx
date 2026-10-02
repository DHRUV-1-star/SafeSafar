import React from 'react';
import {
  Map,
  FootprintsIcon,
  Siren,
  Megaphone,
  Users,
  Flame,
  Sparkles,
  LogOut,
  ChevronRight,
  MapPin,
  Settings,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';
import { UserAvatar } from './UserAvatar';

export type SidebarFeature =
  | 'safe-route'
  | 'walk-me-home'
  | 'sos-center'
  | 'community'
  | 'trusted-circle'
  | 'safe-havens'
  | 'heatmap'
  | 'ai-companion';

interface SidebarProps {
  activeFeature: SidebarFeature;
  onSelectFeature: (feature: SidebarFeature) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenProfile: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS: { id: SidebarFeature; label: string; icon: React.ReactNode }[] = [
  { id: 'safe-route', label: 'Safe Route', icon: <Map className="w-4 h-4" /> },
  { id: 'walk-me-home', label: 'Walk Me Home', icon: <FootprintsIcon className="w-4 h-4" /> },
  { id: 'sos-center', label: 'SOS Center', icon: <Siren className="w-4 h-4" /> },
  { id: 'community', label: 'Community', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'trusted-circle', label: 'Trusted Circle', icon: <Users className="w-4 h-4" /> },
  { id: 'safe-havens', label: 'Safe Havens', icon: <MapPin className="w-4 h-4" /> },
  { id: 'heatmap', label: 'Heatmap', icon: <Flame className="w-4 h-4" /> },
  { id: 'ai-companion', label: 'AI Companion', icon: <Sparkles className="w-4 h-4" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeFeature,
  onSelectFeature,
  currentUser,
  onLogout,
  onOpenProfile,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const innerNav = (
    <aside
      className="w-64 min-h-screen bg-[#FAF9F6] border-r border-[#E2DDD6] flex flex-col shrink-0 h-full"
      style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#E2DDD6] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/safesafar-logo.png"
            alt="SafeSafar Logo"
            className="w-9 h-9 rounded-xl object-cover shadow-sm"
          />
          <span className="text-[15px] font-black tracking-tight text-[#202D2D]">SafeSafar</span>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-lg text-[#7A8A87] hover:bg-[#EEF0EC]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeFeature === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectFeature(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-[#24504F] text-white shadow-sm'
                  : 'text-[#4A5E5B] hover:bg-[#EEF0EC] hover:text-[#202D2D]'
              }`}
            >
              <span className={isActive ? 'text-white/90' : 'text-[#7A8A87] group-hover:text-[#30433F]'}>
                {item.icon}
              </span>
              <span className="text-[13px] font-semibold flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer — clickable to open profile */}
      <div className="px-4 py-4 border-t border-[#E2DDD6]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AACA8] mb-2 px-1">
          Signed In
        </p>

        {/* Profile button — opens UserProfileModal */}
        <button
          onClick={() => {
            onOpenProfile();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#EEF0EC] transition-all duration-150 group text-left mb-1"
        >
          <UserAvatar user={currentUser} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-[#202D2D] truncate group-hover:text-[#24504F]">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-[#9AACA8] truncate capitalize">{currentUser.role}</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-[#9AACA8] group-hover:text-[#24504F] shrink-0 transition-colors" />
        </button>

        {/* Sign out */}
        <button
          onClick={() => {
            onLogout();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-[#C85D67] hover:bg-[#F8E9EA] transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        {innerNav}
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-[999] flex md:hidden">
          <div
            className="fixed inset-0 bg-[#202D2D]/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {innerNav}
          </div>
        </div>
      )}
    </>
  );
};
