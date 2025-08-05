import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Mic, Sparkles, ArrowRight, Camera, Upload, BookOpen, Save, FolderOpen } from 'lucide-react';
import ContentCreateVideoImage from '@/components/ContentCreateVideoImage';
import ContentCreateLipSyncVideo from '@/components/ContentCreateLipSyncVideo';

interface ContentCreateVideoProps {
  influencerData?: any;
}

function ContentCreateVideo({ influencerData }: ContentCreateVideoProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<'image' | 'lipsync' | null>(null);

  // Check if we should auto-select an option based on location state
  React.useEffect(() => {
    if (location.state?.autoSelect && !selectedOption) {
      setSelectedOption(location.state.autoSelect);
    }
  }, [location.state?.autoSelect, selectedOption]);

  const handleOptionSelect = (option: 'image' | 'lipsync') => {
    setSelectedOption(option);
  };

  const handleBack = () => {
    setSelectedOption(null);
  };

  // If an option is selected, render the corresponding component
  if (selectedOption === 'image') {
    return <ContentCreateVideoImage influencerData={influencerData} onBack={handleBack} />;
  }

  if (selectedOption === 'lipsync') {
    return <ContentCreateLipSyncVideo influencerData={influencerData} onBack={handleBack} />;
  }

  return (
    <div className="px-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-20 mb-12">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Create Video
            </h1>
            <p className="text-muted-foreground">
              Generate stunning AI-powered videos with advanced customization options
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mt-10">
        {/* Create Influencer Video Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-800 dark:via-blue-900/20 dark:to-indigo-900/20 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
              onClick={() => handleOptionSelect('image')}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                <Video className="w-10 h-10 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-all duration-300 group-hover:translate-x-1" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              Create Influencer Video
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              Generate stunning AI-powered videos with advanced customization options, scene settings, and character consistency
            </p>
          </CardHeader>
          <CardContent className="relative z-10 pt-0">
            <div className="space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Advanced AI video generation</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Motion control and camera movements</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Multiple video formats and durations</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Professional quality settings</span>
          </div>
          </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button 
                  className="w-full h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect('image');
                  }}
                >
                  <Video className="w-6 h-6 mr-3" />
                  Start Creating Videos
                </Button>
              </div>
          </div>
          </CardContent>
        </Card>

        {/* Create LipSync Video Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-slate-800 dark:via-purple-900/20 dark:to-pink-900/20 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
              onClick={() => handleOptionSelect('lipsync')}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                <Mic className="w-10 h-10 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-purple-500 transition-all duration-300 group-hover:translate-x-1" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
              Create LipSync Video
              </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              Create engaging lip-sync videos with custom audio, voice selection, and synchronized mouth movements
            </p>
            </CardHeader>
          <CardContent className="relative z-10 pt-0">
            <div className="space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Upload custom audio files</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Predefined ElevenLabs voices</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Individual voice per influencer</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Perfect lip synchronization</span>
                </div>
        </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect('lipsync');
                  }}
                >
                  <Mic className="w-6 h-6 mr-3" />
                  Start Creating LipSync
                </Button>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
} 

export default ContentCreateVideo;