import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Video, Sparkles, Palette, Camera, Play, ArrowRight } from 'lucide-react';
import ContentCreateImage from '@/components/ContentCreateImage';
import ContentCreateVideo from '@/components/ContentCreateVideo';

export default function ContentCreate() {
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState<'image' | 'video' | null>(null);

  // Get influencer data from navigation state
  const influencerData = location.state?.influencerData;

  const handleOptionSelect = (option: 'image' | 'video') => {
    setSelectedOption(option);
  };

  const handleBackToSelection = () => {
    setSelectedOption(null);
  };

  // If an option is selected, show the corresponding component
  if (selectedOption === 'image') {
    return (
      <div>
        <div className="p-6">
          <div className="mb-6">
            <Button
              onClick={handleBackToSelection}
              variant="ghost"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              ← Back to Content Creation Options
            </Button>
          </div>
          <ContentCreateImage influencerData={influencerData} />
        </div>
      </div>
    );
  }

  if (selectedOption === 'video') {
    return (
      <div>
        <div className="p-6">
          <div className="mb-6">
            <Button
              onClick={handleBackToSelection}
              variant="ghost"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              ← Back to Content Creation Options
            </Button>
          </div>
          <ContentCreateVideo influencerData={influencerData} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Create Content
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Choose your content creation method and bring your AI influencer to life with stunning visuals
          </p>
        </div>

        {/* Content Creation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Image Creation Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
                onClick={() => handleOptionSelect('image')}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-purple-500 transition-colors duration-300" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Create Content Image
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Generate stunning AI-powered images with advanced customization options, scene settings, and character consistency
              </p>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <div className="space-y-4">
                {/* Features List */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Advanced AI image generation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Scene and pose customization</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Character consistency training</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Multiple format options</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect('image');
                  }}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Creating Images
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Video Creation Card */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
                onClick={() => handleOptionSelect('video')}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Create Content Video
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Create engaging video content with AI-powered motion, dynamic scenes, and professional editing capabilities
              </p>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <div className="space-y-4">
                {/* Features List */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>AI video generation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Motion and animation control</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Dynamic scene transitions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Professional editing tools</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect('video');
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Creating Videos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-100/50 to-blue-100/50 dark:from-slate-800/50 dark:to-slate-700/50 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mb-4 shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Professional Content Creation
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Whether you're creating static images or dynamic videos, our AI-powered tools provide you with 
                  professional-grade content creation capabilities. Choose the option that best fits your creative vision.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 