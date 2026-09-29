import React, { useState } from 'react';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [avatar]);

  // Size variations
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-16 h-16 text-lg font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const initials = getInitials(name);

  // Only display image if avatar is provided and hasn't errored
  const hasValidImage = avatar && avatar.trim().length > 0 && !imageError;

  if (hasValidImage) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover border border-purple-500/30 shrink-0 ${className}`}
      />
    );
  }

  // Clean initials fallback with modern gradient
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-600 flex items-center justify-center font-bold text-white tracking-wider border border-white/15 shadow-sm shrink-0 select-none ${className}`}
      aria-label={name}
    >
      <span>{initials}</span>
    </div>
  );
};
