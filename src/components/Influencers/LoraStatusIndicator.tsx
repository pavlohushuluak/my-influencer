import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LoraStatusIndicatorProps {
  status: number;
  className?: string;
  showText?: boolean;
}

export function LoraStatusIndicator({ status, className, showText = false }: LoraStatusIndicatorProps) {
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return {
          icon: XCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          shadowColor: 'shadow-gray-200',
          text: 'No AI model',
          description: 'AI model has not been created yet. This influencer is ready for AI Consistency.',
          detailedDescription: 'The AI model for this influencer has not been generated. This is the initial state for new influencers.',
          image: '/ccnok.png'
        };
      case 1:
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
          borderColor: 'border-blue-200',
          shadowColor: 'shadow-blue-200',
          text: 'Creating',
          description: 'AI model is currently being generated. Please wait for completion.',
          detailedDescription: 'The AI is currently training a personalized AI model for this influencer. This process typically takes 5-15 minutes depending on complexity.',
          image: '/ccnok.png'
        };
      case 2:
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
          borderColor: 'border-green-200',
          shadowColor: 'shadow-green-200',
          text: 'Ready',
          description: 'AI model has been successfully created and is ready for use.',
          detailedDescription: 'The personalized AI model has been successfully generated and optimized. This influencer can now be used for high-quality AI image generation.',
          image: '/ccok.png'
        };
      case 9:
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
          borderColor: 'border-red-200',
          shadowColor: 'shadow-red-200',
          text: 'Error',
          description: 'AI generation failed. Click to retry the generation process.',
          detailedDescription: 'The AI model generation encountered an error during processing. This may be due to insufficient data quality or system issues. Retry recommended.',
          image: '/ccnok.png'
        };
      default:
        return {
          icon: XCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          shadowColor: 'shadow-gray-200',
          text: 'Unknown',
          description: 'Unknown AI status. Please refresh or contact support.',
          detailedDescription: 'The AI status could not be determined. This may indicate a system error or data corruption.',
          image: '/ccnok.png'
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  const IconComponent = statusInfo.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            'relative inline-flex items-center justify-center w-16 h-16 transition-all duration-200 hover:scale-110 cursor-pointer group',
            className
          )}>
            <img 
              src={statusInfo.image} 
              alt={statusInfo.text}
              className="w-18 h-12 transition-all duration-200 group-hover:scale-110"
            />
            
            {/* Animated pulse effect for creating status */}
            {status === 1 && (
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping" />
            )}
            
            {/* Success animation for ready status */}
            {status === 2 && (
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-pulse" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 bg-white border border-gray-200 shadow-xl rounded-lg"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconComponent className={cn('w-4 h-4', statusInfo.color)} />
              <span className="font-semibold text-gray-900">{statusInfo.text}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {statusInfo.detailedDescription}
            </p>
            {status === 9 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-red-600 font-medium">
                  💡 Tip: Try regenerating the AI model
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 