import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Check, Copy as CopyIcon, ChevronDown, ChevronUp, Instagram, Twitter, MessageCircle, Heart, Star, ArrowLeft } from 'lucide-react';

const limit = [
  {
    name: 'Instagram',
    limit: {
      headline: 30,
      bio: 150,
    }
  },
  {
    name: 'Fanvue',
    limit: {
      headline: 50,
      bio: 1000,
    }
  },
  {
    name: 'TikTok',
    limit: {
      headline: 30,
      bio: 80,
    }
  },
  {
    name: 'X (Twitter)',
    limit: {
      headline: 50,
      bio: 160,
    }
  },
  {
    name: 'Threads',
    limit: {
      headline: 30,
      bio: 500,
    }
  }
];

// Platform configuration with official colors and icons
const platformConfig = {
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    bgColor: 'bg-gradient-to-br from-pink-500 to-red-500',
    icon: Instagram,
    description: 'Visual storytelling platform'
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    bgColor: 'bg-gradient-to-br from-gray-900 to-black',
    icon: MessageCircle,
    description: 'Short-form video content'
  },
  x: {
    name: 'X (Twitter)',
    color: '#1DA1F2',
    bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
    icon: Twitter,
    description: 'Real-time conversations'
  },
  threads: {
    name: 'Threads',
    color: '#000000',
    bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900',
    icon: MessageCircle,
    description: 'Text-based social platform'
  },
  fanvue: {
    name: 'Fanvue',
    color: '#FF6B35',
    bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
    icon: Heart,
    description: 'Creator monetization platform'
  }
};

const backgroundIcons: Record<string, string> = {
  childhood_formative_years: '👶',
  teenage_development: '🎓',
  current_life_situation: '🏠',
  personality_drivers: '💭',
  relationship_patterns: '💕',
  intimate_preferences: '🌹',
  conversation_topics: '💬',
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = (value / max) * 100;
  let bgColor = 'bg-green-500';
  if (percent > 95) bgColor = 'bg-red-500';
  else if (percent > 80) bgColor = 'bg-yellow-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{value}/{max} characters</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-2 ${bgColor} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleCopy}
      className="h-8 px-2 text-xs"
    >
      {copied ? <Check className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </Button>
  );
}

export default function InfluencerBio() {
  const location = useLocation();
  const navigate = useNavigate();
  const influencerId = location.state?.influencerId;
  const influencer = useSelector((state: RootState) =>
    state.influencers.influencers.find((inf) => inf.id === influencerId)
  );
  const bio = useSelector((state: RootState) => state.bio[influencerId]);
  const [platformTab, setPlatformTab] = useState('instagram');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!influencer || !bio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bio Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">No bio data found for this influencer.</p>
            <Button onClick={() => navigate(-1)} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const summary = bio.influencer_profile_summary;
  const platforms = {
    instagram: bio.platform_profiles.instagram,
    fanvue: bio.platform_profiles.fanvue,
    tiktok: bio.platform_profiles.tiktok,
    x: bio.platform_profiles.x,
    threads: bio.platform_profiles.threads,
  };
  const background = bio.background_story || {};
  const chatter = bio.chatter_guidance || {};

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
              <img
                src={influencer.image_url}
                alt={influencer.name_first}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {summary.name}
              </h1>
              <p className="text-lg text-muted-foreground">{summary.age_lifestyle}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <div className="sticky top-8 space-y-6">
              {/* Quick Stats */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Personality</span>
                    <Badge variant="secondary">{summary.personality_archetype}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Niche</span>
                    <Badge variant="outline">{summary.primary_niche}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Target</span>
                    <Badge variant="outline">{summary.target_audience}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('platforms')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    📱 Platform Profiles
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('background')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    📖 Character Background
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => document.getElementById('guidance')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    💬 Chat Guidance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Platform Profiles Section */}
            <div id="platforms">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📱</span>
                    </div>
                    Platform Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={platformTab} onValueChange={setPlatformTab} className="w-full">
                    <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 w-full mb-6">
                      {Object.keys(platforms).map((platform) => {
                        const config = platformConfig[platform as keyof typeof platformConfig];
                        const Icon = config?.icon || MessageCircle;
                        return (
                          <TabsTrigger
                            key={platform}
                            value={platform}
                            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                          >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{config?.name || platform}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                    {Object.entries(platforms).map(([platform, profile]: any) => {
                      const config = platformConfig[platform as keyof typeof platformConfig];
                      return (
                        <TabsContent key={platform} value={platform} className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className={`w-12 h-12 ${config?.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                              <config.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{config?.name} Profile</h3>
                              <p className="text-sm text-muted-foreground">{config?.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Headline */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold flex items-center gap-2">
                                  📝 Headline
                                </h4>
                                <CopyButton text={profile.headline} label="Copy" />
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
                                <p className="text-base font-medium leading-relaxed">{profile.headline}</p>
                              </div>
                              <ProgressBar value={profile.character_count?.headline || 0} max={limit.find(l => l.name === config?.name)?.limit.headline || 0} color={config?.color || '#000'} />
                            </div>

                            {/* Bio */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold flex items-center gap-2">
                                  📄 Bio
                                </h4>
                                <CopyButton text={profile.bio} label="Copy" />
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border max-h-32 overflow-y-auto">
                                <p className="text-sm leading-relaxed whitespace-pre-line">{profile.bio}</p>
                              </div>
                              <ProgressBar value={profile.character_count?.bio || 0} max={limit.find(l => l.name === config?.name)?.limit.bio || 0} color={config?.color || '#000'} />
                            </div>
                          </div>

                          {/* Score and Reasoning */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-green-600" />
                                <span className="font-semibold">Optimization Score</span>
                              </div>
                              <div className="text-2xl font-bold text-green-600">{profile.optimization_score}/10</div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold">Reasoning</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{profile.reasoning}</p>
                            </div>
                          </div>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Character Background Section */}
            <div id="background">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📖</span>
                    </div>
                    Character Background
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(background).map(([key, value]: any) => (
                      <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div
                          className="flex items-center gap-3 p-4 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
                        >
                          <span className="text-2xl">{backgroundIcons[key] || '📖'}</span>
                          <span className="font-semibold text-base capitalize flex-1">
                            {key.replace(/_/g, ' ')}
                          </span>
                          {typeof value === 'string' && (
                            expanded[key] ?
                              <ChevronUp className="w-5 h-5 text-muted-foreground" /> :
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        {typeof value === 'string' && expanded[key] && (
                          <div className="px-4 pb-4 text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                            {value}
                          </div>
                        )}
                        {Array.isArray(value) && (
                          <div className="px-4 pb-4">
                            <ul className="list-disc list-inside text-base text-muted-foreground space-y-1">
                              {value.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Guidance Section */}
            <div id="guidance">
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💬</span>
                    </div>
                    Chat Guidance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          🗣️ Communication Style
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{chatter.communication_style}</p>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          💝 Building Intimacy
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{chatter.intimacy_building}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          🎣 Engagement Hooks
                        </h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {(chatter.engagement_hooks || '').split(/\n|•/).filter(Boolean).map((item: string, idx: number) => (
                            <li key={idx}>{item.trim()}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          🚫 Boundaries
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{chatter.boundaries}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 