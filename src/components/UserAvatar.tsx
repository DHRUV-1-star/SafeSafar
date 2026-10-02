import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  name?: string;
  avatar?: string;
  user?: { name?: string; avatar?: string };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  user,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const displayName = name || user?.name || 'User';
  const displayAvatar = avatar || user?.avatar;

  useEffect(() => {
    setImageError(false);
  }, [displayAvatar]);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const initials = getInitials(displayName);
  const hasValidImage = displayAvatar && displayAvatar.trim().length > 0 && !imageError;

  if (hasValidImage) {
    return (
      <img
        src={displayAvatar}
        alt={displayName}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover border border-[#2F5F5E]/30 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-[#24504F] via-[#2F5F5E] to-[#C85D67] flex items-center justify-center font-bold text-[#202D2D] tracking-wider border border-[#2F5F5E]/15 shadow-sm shrink-0 select-none ${className}`}
      aria-label={name}
    >
      <span>{initials}</span>
    </div>
  );
};
