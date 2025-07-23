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
                    <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-slate-800 dark:via-purple-900/20 dark:to-pink-900/20 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
                        onClick={() => handleOptionSelect('image')}>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <CardHeader className="relative z-10 pb-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                                    <Image className="w-10 h-10 text-white" />
                                </div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                                    Create Image
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-purple-500 transition-all duration-300 group-hover:translate-x-1" />
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                Generate stunning AI-powered images with advanced customization options, scene settings, and character consistency
                            </p>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-0">
                            <div className="space-y-6">
                                {/* Features List */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                                        <span className="font-medium">Advanced AI image generation</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                                        <span className="font-medium">Scene and pose customization</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                                        <span className="font-medium">Character consistency training</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                                        <span className="font-medium">Multiple format options</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video Creation Card */}
                    <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-800 dark:via-blue-900/20 dark:to-indigo-900/20 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
                        onClick={() => handleOptionSelect('video')}>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <CardHeader className="relative z-10 pb-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                                    <Video className="w-10 h-10 text-white" />
                                </div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                                    Create Video
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-all duration-300 group-hover:translate-x-1" />
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                Create engaging video content with AI-powered motion, dynamic scenes, and professional editing capabilities
                            </p>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-0">
                            <div className="space-y-6">
                                {/* Features List */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                                        <span className="font-medium">AI video generation</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                                        <span className="font-medium">Motion and animation control</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                                        <span className="font-medium">Dynamic scene transitions</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                                        <span className="font-medium">Professional editing tools</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 