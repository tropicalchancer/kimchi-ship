import { User } from 'lucide-react';

interface UserAvatarProps {
  user: {
    avatar_url: string | null;
    full_name: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
};

const UserAvatar = ({ user, size = 'sm', className = '' }: UserAvatarProps) => {
  const getInitials = (name: string | null) => {
    if (!name) return 'A';
    return name[0].toUpperCase();
  };

  return (
    <div 
      className={`
        rounded-full bg-blue-500 text-white flex items-center justify-center 
        ${sizeClasses[size]} 
        ${className}
      `}
    >
      {user.avatar_url ? (
        <img 
          src={user.avatar_url} 
          alt={user.full_name || 'User avatar'} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          {size === 'sm' ? (
            getInitials(user.full_name)
          ) : (
            <User className="w-1/2 h-1/2" />
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;