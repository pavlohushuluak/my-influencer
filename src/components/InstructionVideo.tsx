import React from 'react';
import { Button } from '@/components/ui/button';

interface InstructionVideoProps {
  imageUrl?: string;
  videoUrl?: string;
  title?: string;
  description?: string;
  duration?: string;
  guideLink?: string;
  theme?: 'purple' | 'green' | 'blue' | 'orange';
  className?: string;
}

const InstructionVideo: React.FC<InstructionVideoProps> = ({
  imageUrl = "/videoexample.png",
  videoUrl,
  title = "Watch the instruction",
  description = "Step-by-step guide",
  duration = "5:32",
  guideLink = "#",
  theme = "purple",
  className = ""
}) => {
  const themeConfig = {
    purple: {
      gradient: "from-purple-500 to-blue-600",
      textGradient: "from-purple-600 to-blue-600",
      bgGradient: "from-purple-50 via-blue-50 to-indigo-50",
      darkBgGradient: "from-purple-950/20 via-blue-950/20 to-indigo-950/20",
      borderColor: "border-purple-200/50 dark:border-purple-800/50",
      playButtonColor: "border-l-purple-600",
      durationColor: "text-purple-600",
      linkColor: "text-purple-600 hover:text-purple-700",
      dots: ["bg-green-500", "bg-blue-500", "bg-purple-500"]
    },
    green: {
      gradient: "from-green-500 to-emerald-600",
      textGradient: "from-green-600 to-emerald-600",
      bgGradient: "from-green-50 via-emerald-50 to-teal-50",
      darkBgGradient: "from-green-950/20 via-emerald-950/20 to-teal-950/20",
      borderColor: "border-green-200/50 dark:border-green-800/50",
      playButtonColor: "border-l-green-600",
      durationColor: "text-green-600",
      linkColor: "text-green-600 hover:text-green-700",
      dots: ["bg-green-500", "bg-emerald-500", "bg-teal-500"]
    },
    blue: {
      gradient: "from-blue-500 to-indigo-600",
      textGradient: "from-blue-600 to-indigo-600",
      bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
      darkBgGradient: "from-blue-950/20 via-indigo-950/20 to-purple-950/20",
      borderColor: "border-blue-200/50 dark:border-blue-800/50",
      playButtonColor: "border-l-blue-600",
      durationColor: "text-blue-600",
      linkColor: "text-blue-600 hover:text-blue-700",
      dots: ["bg-blue-500", "bg-indigo-500", "bg-purple-500"]
    },
    orange: {
      gradient: "from-orange-500 to-amber-600",
      textGradient: "from-orange-600 to-amber-600",
      bgGradient: "from-orange-50 via-amber-50 to-yellow-50",
      darkBgGradient: "from-orange-950/20 via-amber-950/20 to-yellow-950/20",
      borderColor: "border-orange-200/50 dark:border-orange-800/50",
      playButtonColor: "border-l-orange-600",
      durationColor: "text-orange-600",
      linkColor: "text-orange-600 hover:text-orange-700",
      dots: ["bg-orange-500", "bg-amber-500", "bg-yellow-500"]
    }
  };

  const config = themeConfig[theme];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className={`w-6 h-6 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg mr-3`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className={`text-xl font-bold bg-gradient-to-r ${config.textGradient} bg-clip-text text-transparent`}>
            {title}
          </h3>
        </div>
        <div className={`relative aspect-video bg-gradient-to-br ${config.bgGradient} dark:${config.darkBgGradient} rounded-2xl overflow-hidden shadow-xl border ${config.borderColor}`}>
          {videoUrl ? (
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              poster={imageUrl}
            />
          ) : (
            <img
              src={imageUrl}
              alt="Instruction video"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-2 border-white/50 hover:scale-110 transition-transform duration-300 cursor-pointer">
              <div className={`w-0 h-0 border-l-[16px] ${config.playButtonColor} border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1`}></div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center space-y-3">
        <Button variant="link" className={`${config.linkColor} font-medium text-base`}>
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          Click here to read the guide
        </Button>
      </div>
    </div>
  );
};

export default InstructionVideo; 