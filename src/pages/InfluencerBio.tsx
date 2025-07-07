import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Check, Copy as CopyIcon, ChevronDown, ChevronUp } from 'lucide-react';

const platformIcons: Record<string, string> = {
  instagram: '📸',
  fanvue: '🌟',
  tiktok: '🎵',
  x: '🐦',
  threads: '🧵',
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

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = (value / max) * 100;
  let color = 'bg-green-500';
  if (percent > 95) color = 'bg-red-500';
  else if (percent > 80) color = 'bg-yellow-500';
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className={`h-2 ${color}`} style={{ width: `${percent}%` }} />
    </div>
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
      <div className="p-8 text-center text-lg text-muted-foreground">
        No bio data found. <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const summary = bio.influencer_profile_summary;
  const platforms = bio.platform_profiles || {};
  const background = bio.background_story || {};
  const chatter = bio.chatter_guidance || {};

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* 1. Dashboard Overview Card */}
      <Card className="shadow-lg">
        <CardContent className="p-6 flex flex-col gap-2">
          <div className="text-2xl font-bold flex items-center gap-2">👤 {summary.name}</div>
          <div className="text-base text-muted-foreground">{summary.age_lifestyle}</div>
          <div className="text-base text-muted-foreground">{summary.cultural_background}</div>
          <div className="h-2" />
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-2 text-lg">🎯 {summary.personality_archetype}</div>
            <div className="flex items-center gap-2 text-lg">💄 {summary.primary_niche}</div>
            <div className="flex items-center gap-2 text-lg">🎪 Target: {summary.target_audience}</div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Platform Profiles Section */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="font-bold text-lg mb-4">PLATFORM PROFILES</div>
          <Tabs value={platformTab} onValueChange={setPlatformTab} className="w-full">
            <TabsList className="mb-4 flex flex-wrap gap-2">
              {Object.keys(platforms).map((platform) => (
                <TabsTrigger key={platform} value={platform} className="capitalize">
                  {platformIcons[platform] || ''} {platform}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(platforms).map(([platform, profile]: any) => (
              <TabsContent key={platform} value={platform} className="space-y-4">
                <div className="font-semibold text-base flex items-center gap-2">
                  {platformIcons[platform] || ''} {platform.charAt(0).toUpperCase() + platform.slice(1)} Profile
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    📝 Headline ({profile.character_count?.headline || 0}/30 chars)
                    <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(profile.headline)}><CopyIcon className="w-4 h-4" /></Button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-base font-medium">{profile.headline}</div>
                  <ProgressBar value={profile.character_count?.headline || 0} max={30} />
                  <div className="flex items-center gap-2 mt-2">
                    📄 Bio ({profile.character_count?.bio || 0}/150 chars)
                    <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(profile.bio)}><CopyIcon className="w-4 h-4" /></Button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-base whitespace-pre-line">{profile.bio}</div>
                  <ProgressBar value={profile.character_count?.bio || 0} max={150} />
                  <div className="flex items-center gap-2 mt-2">
                    📊 Score: <span className="font-bold">{profile.optimization_score}/10</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    💡 Why: <span>{profile.reasoning}</span>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 3. Background Story Section */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="font-bold text-lg mb-4">CHARACTER BACKGROUND</div>
          <div className="space-y-2">
            {Object.entries(background).map(([key, value]: any) => (
              <div key={key} className="mb-2">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}>
                  <span className="text-xl">{backgroundIcons[key] || '📖'}</span>
                  <span className="font-semibold text-base capitalize">{key.replace(/_/g, ' ')}</span>
                  {typeof value === 'string' && (
                    expanded[key] ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
                {typeof value === 'string' && expanded[key] && (
                  <div className="ml-8 mt-1 text-base text-muted-foreground whitespace-pre-line">{value}</div>
                )}
                {Array.isArray(value) && (
                  <ul className="ml-8 mt-1 list-disc text-base text-muted-foreground">
                    {value.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Chatter Guidance Panel */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="font-bold text-lg mb-4">CHAT GUIDANCE</div>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">🗣️ Communication Style</span>
              <div className="ml-6 text-base text-muted-foreground">{chatter.communication_style}</div>
            </div>
            <div>
              <span className="font-semibold">🎣 Engagement Hooks</span>
              <ul className="ml-6 list-disc text-base text-muted-foreground">
                {(chatter.engagement_hooks || '').split(/\n|•/).filter(Boolean).map((item: string, idx: number) => <li key={idx}>{item.trim()}</li>)}
              </ul>
            </div>
            <div>
              <span className="font-semibold">💝 Building Intimacy</span>
              <div className="ml-6 text-base text-muted-foreground">{chatter.intimacy_building}</div>
            </div>
            <div>
              <span className="font-semibold">🚫 Boundaries</span>
              <div className="ml-6 text-base text-muted-foreground">{chatter.boundaries}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 