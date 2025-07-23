import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface InstructionVideoProps {
  imageUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  title?: string;
  description?: string;
  guideLink?: string;
  theme?: 'purple' | 'green' | 'blue' | 'orange';
  className?: string;
}

const InstructionVideo: React.FC<InstructionVideoProps> = ({
  imageUrl = "/videoexample.png",
  videoUrl,
  youtubeUrl,
  title = "Watch the instruction",
  description = "Step-by-step guide",
  guideLink = "#",
  theme = "purple",
  className = ""
}) => {
  // Default YouTube videos for each theme (safe, popular videos with additional parameters)
  const defaultVideos = {
    purple: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&showinfo=0", // Rick Astley - Never Gonna Give You Up
    green: "https://www.youtube.com/embed/jNQXAC9IVRw?rel=0&modestbranding=1&showinfo=0", // Me at the zoo (first YouTube video)
    blue: "https://www.youtube.com/embed/9bZkp7q19f0?rel=0&modestbranding=1&showinfo=0", // PSY - GANGNAM STYLE
    orange: "https://www.youtube.com/embed/kJQP7kiw5Fk?rel=0&modestbranding=1&showinfo=0" // Luis Fonsi - Despacito
  };

  // Fallback videos (very reliable, simple videos)
  const fallbackVideos = {
    purple: "https://www.youtube.com/embed/jNQXAC9IVRw?rel=0&modestbranding=1&showinfo=0", // Me at the zoo
    green: "https://www.youtube.com/embed/jNQXAC9IVRw?rel=0&modestbranding=1&showinfo=0", // Me at the zoo
    blue: "https://www.youtube.com/embed/jNQXAC9IVRw?rel=0&modestbranding=1&showinfo=0", // Me at the zoo
    orange: "https://www.youtube.com/embed/jNQXAC9IVRw?rel=0&modestbranding=1&showinfo=0" // Me at the zoo
  };

  // Helper function to convert YouTube URL to embed URL
  const convertToEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // If already an embed URL, add parameters if missing
    if (url.includes('youtube.com/embed/')) {
      if (!url.includes('?')) {
        return `${url}?rel=0&modestbranding=1&showinfo=0`;
      }
      return url;
    }
    
    // Extract video ID from various YouTube URL formats
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?rel=0&modestbranding=1&showinfo=0`;
    }
    
    return url; // Return original if no match found
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Use provided youtubeUrl, default, or fallback based on theme
  const finalYoutubeUrl = convertToEmbedUrl(youtubeUrl || (useFallback ? fallbackVideos[theme] : defaultVideos[theme]));

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

  const handlePlayClick = () => {
    if (finalYoutubeUrl || videoUrl) {
      setIsLoading(true);
      setVideoError(false);
      
      // Add a small delay to show loading state
      setTimeout(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleBackClick = () => {
    setIsPlaying(false);
  };

  const handleGuideClick = () => {
    setShowGuideModal(true);
  };

  // Get guide content based on theme
  const getGuideContent = () => {
    switch (theme) {
      case 'purple':
        return {
          title: "Phase 1: Create Your Influencer",
          description: "Learn how to create and customize your AI influencer from scratch.",
          steps: [
            "Start by clicking 'Create New Influencer' to begin the creation process",
            "Fill in basic information like name, age, and personality traits",
            "Upload or select a profile picture that represents your influencer",
            "Customize appearance, lifestyle, and background details",
            "Add content focus areas and personal interests",
            "Review and save your influencer profile"
          ],
          tips: [
            "Be specific with personality traits for better AI generation",
            "Choose a high-quality profile picture for best results",
            "Include diverse interests for more varied content creation"
          ]
        };
      case 'green':
        return {
          title: "Phase 2: Train Character Consistency",
          description: "Improve your influencer's character consistency through LORA training.",
          steps: [
            "Select an influencer from your created list",
            "Upload training images or copy from your Inbox",
            "Ensure you have at least 10 high-quality images",
            "Review and exclude any unsuitable images",
            "Start the LORA training process",
            "Monitor training progress and wait for completion"
          ],
          tips: [
            "Use diverse, high-quality images for better training results",
            "Include different angles and expressions for consistency",
            "Avoid images with multiple people or complex backgrounds"
          ]
        };
      case 'blue':
        return {
          title: "Phase 3: Create Social Media Content",
          description: "Generate engaging social media content with your trained influencer.",
          steps: [
            "Select your trained influencer from the dashboard",
            "Choose your target social media platform",
            "Define your content type and style preferences",
            "Write a detailed prompt describing your desired content",
            "Generate multiple variations to choose from",
            "Download and use your generated content"
          ],
          tips: [
            "Be specific in your prompts for better results",
            "Experiment with different content styles and formats",
            "Use trending topics and hashtags for better engagement"
          ]
        };
      case 'orange':
        return {
          title: "Phase 4: Monetization Strategies",
          description: "Learn how to monetize your AI influencer and maximize revenue.",
          steps: [
            "Set up your influencer's monetization profile",
            "Choose revenue streams (sponsorships, affiliate marketing, etc.)",
            "Create PPV (Pay-Per-View) content sets",
            "Develop a content calendar and posting schedule",
            "Engage with your audience and build relationships",
            "Track performance metrics and optimize strategies"
          ],
          tips: [
            "Focus on authentic content that resonates with your audience",
            "Diversify revenue streams for stable income",
            "Consistently engage with followers to build trust"
          ]
        };
      default:
        return {
          title: "Guide",
          description: "Learn how to use this feature effectively.",
          steps: [],
          tips: []
        };
    }
  };

  const guideContent = getGuideContent();

  return (
    <>
      <div className={`flex flex-col justify-center p-6 rounded-xl bg-gradient-to-br from-gray-200 via-gray-400 to-gray-200 dark:from-gray-800 dark:via-gray-600 dark:to-gray-650 border-2 border-slate-200/60 dark:border-slate-700/60 shadow-lg backdrop-blur-sm ${className}`}>
        <div className="text-center flex flex-col justify-center items-center h-full">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-6 h-6 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg mr-3 ring-2 ring-white/50 dark:ring-gray-800/50`}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className={`text-lg font-bold bg-gradient-to-r ${config.textGradient} bg-clip-text text-transparent`}>
              {title}
            </h3>
          </div>
          
          <div className={`relative ${isPlaying ? 'w-full h-96' : 'aspect-video'} bg-gradient-to-br ${config.bgGradient} dark:${config.darkBgGradient} rounded-2xl overflow-hidden shadow-xl border-2 ${config.borderColor} bg-opacity-60 backdrop-blur-md mb-4 transition-all duration-300 ${isPlaying ? 'scale-105' : ''}`}>
            {isLoading ? (
              <div className="relative w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Loading Video...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Please wait while we prepare your video.
                  </p>
                </div>
              </div>
            ) : isPlaying && finalYoutubeUrl && !videoError ? (
              <div className="relative w-full h-full">
                <iframe
                  src={finalYoutubeUrl}
                  title={title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  onError={() => setVideoError(true)}
                  onLoad={() => setVideoError(false)}
                />
                <Button
                  onClick={handleBackClick}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full w-8 h-8 p-0 z-10"
                  size="sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ) : isPlaying && videoError ? (
              <div className="relative w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Video Unavailable
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    The video could not be loaded. Please try again later.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => {
                        setVideoError(false);
                        setUseFallback(true);
                        setIsPlaying(false);
                        handlePlayClick();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Try Alternative Video
                    </Button>
                    <Button
                      onClick={() => {
                        setVideoError(false);
                        setUseFallback(false);
                        setIsPlaying(false);
                      }}
                      variant="outline"
                    >
                      Go Back
                    </Button>
                  </div>
                </div>
              </div>
            ) : isPlaying && videoUrl ? (
              <div className="relative w-full h-full">
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                />
                <Button
                  onClick={handleBackClick}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full w-8 h-8 p-0 z-10"
                  size="sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ) : (
              <div className="relative w-full h-full cursor-pointer" onClick={handlePlayClick}>
                <img
                  src={imageUrl}
                  alt="Instruction video"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl border-2 border-white/50 hover:scale-110 transition-transform duration-300 cursor-pointer ring-2 ring-white/20">
                    <div className={`w-0 h-0 border-l-[12px] ${config.playButtonColor} border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1`}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Button 
              variant="link" 
              className={`${config.linkColor} font-medium text-sm hover:scale-105 transition-transform duration-200`}
              onClick={handleGuideClick}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Click here to read the guide
            </Button>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      <Dialog open={showGuideModal} onOpenChange={setShowGuideModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={`text-2xl font-bold bg-gradient-to-r ${config.textGradient} bg-clip-text text-transparent`}>
              {guideContent.title}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
              {guideContent.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Steps Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Step-by-Step Process
              </h3>
              <div className="space-y-3">
                {guideContent.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-6 h-6 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5`}>
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            {guideContent.tips.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Pro Tips
                </h3>
                <div className="space-y-2">
                  {guideContent.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      <p className="text-gray-700 dark:text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Resources */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Additional Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Watch Tutorial Video
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  View Examples
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Get Help
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  Documentation
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstructionVideo; 