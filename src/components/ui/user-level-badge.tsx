
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserLevelBadgeProps {
  level: 'free' | 'pro' | 'elite';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const levelConfig = {
  free: {
    name: 'Free',
    icon: Star,
    className: 'bg-gray-500 hover:bg-gray-600 text-white',
    iconClassName: 'text-white'
  },
  pro: {
    name: 'Pro',
    icon: Zap,
    className: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    iconClassName: 'text-primary-foreground'
  },
  elite: {
    name: 'Elite',
    icon: Crown,
    className: 'bg-amber-500 hover:bg-amber-600 text-white',
    iconClassName: 'text-white'
  }
};

export function UserLevelBadge({ 
  level, 
  size = 'md', 
  showIcon = true, 
  className 
}: UserLevelBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge 
      className={cn(
        config.className,
        sizeClasses[size],
        'font-semibold shadow-sm',
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(iconSizes[size], config.iconClassName, 'mr-1')} />
      )}
      {config.name}
    </Badge>
  );
}
