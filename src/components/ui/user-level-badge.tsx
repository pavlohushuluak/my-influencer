import { Badge } from '@/components/ui/badge';
import { Star, Zap, Crown, Sparkles, Gem, Shield, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserLevelBadgeProps {
  level: 'free' | 'starter' | 'professional' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const levelConfig = {
  free: {
    name: 'Free',
    icon: Star,
    className: 'cursor-pointer bg-gradient-to-r from-slate-400 to-slate-600 hover:from-slate-500 hover:to-slate-700 text-white border border-slate-300/20 shadow-lg shadow-slate-400/25',
    iconClassName: 'text-white drop-shadow-sm'
  },
  starter: {
    name: 'Starter',
    icon: Sparkles,
    className: 'cursor-pointer bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white border border-emerald-300/30 shadow-lg shadow-emerald-500/30',
    iconClassName: 'text-white drop-shadow-sm'
  },
  professional: {
    name: 'Professional',
    icon: Zap,
    className: 'cursor-pointer bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white border border-violet-300/30 shadow-lg shadow-purple-500/40',
    iconClassName: 'text-white drop-shadow-sm'
  },
  enterprise: {
    name: 'Enterprise',
    icon: Crown,
    className: 'cursor-pointer bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white border border-amber-300/30 shadow-lg shadow-orange-500/40',
    iconClassName: 'text-white drop-shadow-sm'
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
    sm: 'text-xs px-2.5 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
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
        'font-semibold transition-all duration-300 ease-in-out',
        'backdrop-blur-sm',
        'hover:scale-105 hover:shadow-xl',
        'active:scale-95',
        'cursor-default',
        'relative overflow-hidden cursor-pointer',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(iconSizes[size], config.iconClassName, 'transition-transform duration-300 group-hover:scale-110')} />
      )}
      <span className="relative z-10 font-medium tracking-wide">
        {config.name}
      </span>
    </Badge>
  );
}
