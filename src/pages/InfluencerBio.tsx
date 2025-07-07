import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { Check, Copy as CopyIcon, ChevronDown, ChevronUp, Instagram, Twitter, MessageCircle, Heart, Star, ArrowLeft, FileText, Download, Share2, AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setBio } from '@/store/slices/bioSlice';

// PDF Generation
const generatePDF = async (influencer: any, bio: any, platforms: any) => {
  try {
    // Dynamic import for PDF library
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Helper function to clean text of emojis and special characters
    const cleanText = (text: string) => {
      return text
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emojis
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport symbols
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
        .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
        .replace(/[^\x00-\x7F]/g, '') // Non-ASCII characters
        .replace(/\s+/g, ' ') // Multiple spaces to single
        .trim();
    };
    
    // Set up fonts and styling
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`${influencer.name_first} ${influencer.name_last} - Bio Profile`, 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    
    let yPosition = 50;
    
    // Summary section
    doc.setFontSize(16);
    doc.text('Profile Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Name: ${cleanText(bio.influencer_profile_summary.name)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Age & Lifestyle: ${cleanText(bio.influencer_profile_summary.age_lifestyle)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Cultural Background: ${cleanText(bio.influencer_profile_summary.cultural_background)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Personality: ${cleanText(bio.influencer_profile_summary.personality_archetype)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Primary Niche: ${cleanText(bio.influencer_profile_summary.primary_niche)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Target Audience: ${cleanText(bio.influencer_profile_summary.target_audience)}`, 20, yPosition);
    yPosition += 15;
    
    // Platform profiles
    doc.setFontSize(16);
    doc.text('Platform Profiles', 20, yPosition);
    yPosition += 10;
    
    Object.entries(platforms).forEach(([platformKey, platform]: [string, any]) => {
      const config = platformConfig[platformKey as keyof typeof platformConfig];
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.text(`${config?.name} Profile`, 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(10);
      doc.setTextColor(52, 73, 94);
      
      // Headline with proper text wrapping
      const headlineText = `Headline: ${cleanText(platform.headline)}`;
      const headlineLines = doc.splitTextToSize(headlineText, 170);
      headlineLines.forEach((line: string) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 2;
      
      // Bio with proper text wrapping
      const bioText = `Bio: ${cleanText(platform.bio)}`;
      const bioLines = doc.splitTextToSize(bioText, 170);
      bioLines.forEach((line: string) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 2;
      
      // Score and reasoning
      doc.text(`Optimization Score: ${platform.optimization_score}/10`, 20, yPosition);
      yPosition += 6;
      
      const reasoningText = `Reasoning: ${cleanText(platform.reasoning)}`;
      const reasoningLines = doc.splitTextToSize(reasoningText, 170);
      reasoningLines.forEach((line: string) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 8;
    });
    
    // Background story
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Character Background', 20, yPosition);
    yPosition += 10;
    
    Object.entries(bio.background_story || {}).forEach(([key, value]: [string, any]) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.text(key.replace(/_/g, ' ').toUpperCase(), 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(10);
      doc.setTextColor(52, 73, 94);
      const text = typeof value === 'string' ? cleanText(value) : Array.isArray(value) ? cleanText(value.join(', ')) : cleanText(JSON.stringify(value));
      const lines = doc.splitTextToSize(text, 170);
      lines.forEach((line: string) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });
      yPosition += 5;
    });
    
    // Chat guidance
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Chat Guidance', 20, yPosition);
    yPosition += 10;
    
    const chatter = bio.chatter_guidance || {};
    doc.setFontSize(10);
    
    const communicationText = `Communication Style: ${cleanText(chatter.communication_style)}`;
    const communicationLines = doc.splitTextToSize(communicationText, 170);
    communicationLines.forEach((line: string) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 2;
    
    const engagementText = `Engagement Hooks: ${cleanText(chatter.engagement_hooks)}`;
    const engagementLines = doc.splitTextToSize(engagementText, 170);
    engagementLines.forEach((line: string) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 2;
    
    const intimacyText = `Intimacy Building: ${cleanText(chatter.intimacy_building)}`;
    const intimacyLines = doc.splitTextToSize(intimacyText, 170);
    intimacyLines.forEach((line: string) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 2;
    
    const boundariesText = `Boundaries: ${cleanText(chatter.boundaries)}`;
    const boundariesLines = doc.splitTextToSize(boundariesText, 170);
    boundariesLines.forEach((line: string) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    
    // Save the PDF
    const fileName = `${influencer.name_first}_${influencer.name_last}_Bio_Profile.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Excel Generation
const generateExcel = async (influencer: any, bio: any, platforms: any) => {
  try {
    // Dynamic import for Excel library
    const XLSX = await import('xlsx');
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Profile Summary'],
      ['Name', bio.influencer_profile_summary.name],
      ['Age & Lifestyle', bio.influencer_profile_summary.age_lifestyle],
      ['Cultural Background', bio.influencer_profile_summary.cultural_background],
      ['Personality Archetype', bio.influencer_profile_summary.personality_archetype],
      ['Primary Niche', bio.influencer_profile_summary.primary_niche],
      ['Target Audience', bio.influencer_profile_summary.target_audience],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    // Platform profiles sheet
    const platformData = [
      ['Platform', 'Headline', 'Bio', 'Optimization Score', 'Reasoning']
    ];
    
    Object.entries(platforms).forEach(([platformKey, platform]: [string, any]) => {
      const config = platformConfig[platformKey as keyof typeof platformConfig];
      platformData.push([
        config?.name || platformKey,
        platform.headline,
        platform.bio,
        `${platform.optimization_score}/10`,
        platform.reasoning
      ]);
    });
    
    const platformSheet = XLSX.utils.aoa_to_sheet(platformData);
    XLSX.utils.book_append_sheet(wb, platformSheet, 'Platform Profiles');
    
    // Background story sheet
    const backgroundData = [
      ['Background Story']
    ];
    
    Object.entries(bio.background_story || {}).forEach(([key, value]: [string, any]) => {
      backgroundData.push([key.replace(/_/g, ' ').toUpperCase()]);
      const text = typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
      backgroundData.push([text]);
      backgroundData.push([]); // Empty row for spacing
    });
    
    const backgroundSheet = XLSX.utils.aoa_to_sheet(backgroundData);
    XLSX.utils.book_append_sheet(wb, backgroundSheet, 'Background Story');
    
    // Chat guidance sheet
    const chatter = bio.chatter_guidance || {};
    const chatterData = [
      ['Chat Guidance'],
      ['Communication Style', chatter.communication_style],
      ['Engagement Hooks', chatter.engagement_hooks],
      ['Intimacy Building', chatter.intimacy_building],
      ['Boundaries', chatter.boundaries],
    ];
    
    const chatterSheet = XLSX.utils.aoa_to_sheet(chatterData);
    XLSX.utils.book_append_sheet(wb, chatterSheet, 'Chat Guidance');
    
    // Save the Excel file
    const fileName = `${influencer.name_first}_${influencer.name_last}_Bio_Profile.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return true;
  } catch (error) {
    console.error('Excel generation error:', error);
    throw new Error('Failed to generate Excel file');
  }
};

// Share functionality
const shareProfile = async (influencer: any, bio: any) => {
  try {
    const currentUrl = window.location.href;
    await navigator.clipboard.writeText(currentUrl);
    return 'clipboard';
  } catch (error) {
    console.error('Copy link error:', error);
    throw new Error('Failed to copy link');
  }
};

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

function CopyButton({ text, label, variant = "ghost" }: { text: string; label: string; variant?: "ghost" | "outline" | "default" }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Button
      size="sm"
      variant={variant}
      onClick={handleCopy}
      className="h-8 px-3 text-xs"
    >
      {copied ? <Check className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </Button>
  );
}

function ExportButton({ onClick, icon, label, variant = "outline" }: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  variant?: "outline" | "default" 
}) {
  return (
    <Button variant={variant} onClick={onClick} className="flex items-center gap-2">
      {icon}
      {label}
    </Button>
  );
}

function ComparisonView({ platforms, platformConfig }: { platforms: any; platformConfig: any }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'fanvue', 'tiktok']);
  
  const availablePlatforms = Object.keys(platforms).filter(platform => 
    platforms[platform] && Object.keys(platforms[platform]).length > 0
  );
  
  const togglePlatform = (platformKey: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformKey) 
        ? prev.filter(p => p !== platformKey)
        : [...prev, platformKey]
    );
  };
  
  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">📊</span>
          </div>
          Platform Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Platform Selector */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Select Platforms to Compare:</h4>
          <div className="flex flex-wrap gap-2">
            {availablePlatforms.map((platformKey) => {
              const config = platformConfig[platformKey];
              const Icon = config?.icon || MessageCircle;
              const isSelected = selectedPlatforms.includes(platformKey);
              
              return (
                <Button
                  key={platformKey}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePlatform(platformKey)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-3 h-3" />
                  {config?.name || platformKey}
                  {isSelected && <Check className="w-3 h-3" />}
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedPlatforms.map((platformKey) => {
            const platform = platforms[platformKey];
            const config = platformConfig[platformKey];
            if (!platform || !config) return null;
            
            return (
              <div key={platformKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                    <config.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">{config.name}</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Headline</div>
                    <div className="text-sm font-medium line-clamp-2 bg-gray-50 dark:bg-gray-900 rounded p-2">
                      {platform.headline}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Bio</div>
                    <div className="text-sm line-clamp-3 bg-gray-50 dark:bg-gray-900 rounded p-2">
                      {platform.bio}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Score</span>
                    <Badge variant="secondary" className="text-xs">
                      {platform.optimization_score}/10
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {selectedPlatforms.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📊</div>
            <p>Select platforms above to compare their profiles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ErrorDisplay({ missingFields, onComplete, onRetry }: { 
  missingFields: string[]; 
  onComplete: () => void; 
  onRetry: () => void; 
}) {
  return (
    <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 dark:text-red-200">
        <div className="font-semibold mb-2">⚠️ Cannot Generate Complete Profile</div>
        <div className="text-sm mb-3">Missing required information:</div>
        <ul className="list-disc list-inside text-sm space-y-1 mb-4">
          {missingFields.map((field, index) => (
            <li key={index}>• {field}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button size="sm" onClick={onComplete} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-3 h-3 mr-1" />
            Complete Profile
          </Button>
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default function InfluencerBio() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const influencerId = searchParams.get('id');
  const influencer = useSelector((state: RootState) =>
    state.influencers.influencers.find((inf) => inf.id === influencerId)
  );
  const bio = useSelector((state: RootState) => state.bio[influencerId]);
  const [platformTab, setPlatformTab] = useState('instagram');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showComparison, setShowComparison] = useState(false);
  const [copyAllFeedback, setCopyAllFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localInfluencer, setLocalInfluencer] = useState<any>(null);
  const [localBio, setLocalBio] = useState<any>(null);
  const dispatch = useDispatch();

  // Fetch influencer and bio data from database if not in Redux store
  React.useEffect(() => {
    const fetchData = async () => {
      if (!influencerId) return;
      
      setLoading(true);
      try {
        console.log('Fetching data for influencer:', influencerId);
        console.log('Current influencer from Redux:', influencer);
        console.log('Current bio from Redux:', bio);
        
        // If influencer not in Redux, fetch from database
        if (!influencer) {
          console.log('Influencer not in Redux, fetching from database...');
          const response = await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${influencerId}`, {
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Database response:', data);
            if (data && data.length > 0) {
              const fetchedInfluencer = data[0];
              console.log('Fetched influencer:', fetchedInfluencer);
              setLocalInfluencer(fetchedInfluencer);
              
              // If bio exists in database, set it
              if (fetchedInfluencer.bio && Object.keys(fetchedInfluencer.bio).length > 0) {
                console.log('Bio found in database:', fetchedInfluencer.bio);
                setLocalBio(fetchedInfluencer.bio);
                dispatch(setBio({ influencerId, bio: fetchedInfluencer.bio }));
              } else {
                console.log('No bio found in database');
              }
            }
          } else {
            console.error('Failed to fetch influencer from database');
          }
        } else {
          console.log('Influencer found in Redux, checking for bio...');
          // Influencer exists in Redux, check for bio
          if (influencer.bio && Object.keys(influencer.bio).length > 0 && !bio) {
            console.log('Bio found in influencer data:', influencer.bio);
            setLocalBio(influencer.bio);
            dispatch(setBio({ influencerId, bio: influencer.bio }));
          } else {
            console.log('No bio found in influencer data');
          }
        }
      } catch (error) {
        console.error('Error fetching influencer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [influencerId, influencer, bio, dispatch]);

  // Use local state if Redux data is not available
  const currentInfluencer = influencer || localInfluencer;
  const currentBio = bio || localBio;

  console.log('Rendering with:', {
    influencerId,
    influencer,
    localInfluencer,
    currentInfluencer,
    bio,
    localBio,
    currentBio,
    loading
  });

  if (!influencerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid URL</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">No influencer ID provided.</p>
            <Button onClick={() => navigate(-1)} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentInfluencer || !currentBio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            {loading ? (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Bio...</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Please wait while we load the bio data.</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📄</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bio Not Found</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">No bio data found for this influencer.</p>
                <Button onClick={() => navigate(-1)} className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const summary = currentBio.influencer_profile_summary;
  const platforms = {
    instagram: currentBio.platform_profiles.instagram,
    fanvue: currentBio.platform_profiles.fanvue,
    tiktok: currentBio.platform_profiles.tiktok,
    x: currentBio.platform_profiles.x,
    threads: currentBio.platform_profiles.threads,
  };
  const background = currentBio.background_story || {};
  const chatter = currentBio.chatter_guidance || {};

  // Check for missing data
  const missingFields = [];
  if (!summary.cultural_background) missingFields.push('Cultural background');
  if (!summary.personality_archetype) missingFields.push('Personality traits');
  if (!summary.primary_niche) missingFields.push('Content focus areas');

  const handleCopyAllPlatforms = async () => {
    const allData = Object.entries(platforms).map(([key, platform]) => {
      const config = platformConfig[key as keyof typeof platformConfig];
      return `${config?.name}:\nHeadline: ${platform.headline}\nBio: ${platform.bio}\nScore: ${platform.optimization_score}/10\n`;
    }).join('\n');
    
    await navigator.clipboard.writeText(allData);
    setCopyAllFeedback(true);
    setTimeout(() => setCopyAllFeedback(false), 3000);
  };

  const handleExportPDF = async () => {
    try {
      await generatePDF(currentInfluencer, currentBio, platforms);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF report.');
      console.error(error);
    }
  };

  const handleExportExcel = async () => {
    try {
      await generateExcel(currentInfluencer, currentBio, platforms);
      toast.success('Excel report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate Excel report.');
      console.error(error);
    }
  };

  const handleShareLink = async () => {
    try {
      const result = await shareProfile(currentInfluencer, currentBio);
      if (result === 'clipboard') {
        toast.success('Profile link copied to clipboard!');
      } else {
        toast.error('Failed to share profile.');
      }
    } catch (error) {
      toast.error('Failed to share profile.');
      console.error(error);
    }
  };

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
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800">
              <img
                src={currentInfluencer.image_url}
                alt={currentInfluencer.name_first}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="fallback absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                {currentInfluencer.name_first.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {summary.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-2">{summary.age_lifestyle}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  {summary.cultural_background}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                  {summary.personality_archetype}
                </Badge>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex flex-wrap gap-3 mb-6">
            <CopyButton 
              text={Object.entries(platforms).map(([key, platform]) => 
                `${platformConfig[key as keyof typeof platformConfig]?.name}:\nHeadline: ${platform.headline}\nBio: ${platform.bio}\nScore: ${platform.optimization_score}/10`
              ).join('\n\n')}
              label="Copy All Platform Data"
              variant="default"
            />
            <ExportButton 
              onClick={handleExportPDF}
              icon={<FileText className="w-4 h-4" />}
              label="Export PDF Report"
            />
            <ExportButton 
              onClick={handleExportExcel}
              icon={<Download className="w-4 h-4" />}
              label="Export Excel"
            />
            <ExportButton 
              onClick={handleShareLink}
              icon={<Share2 className="w-4 h-4" />}
              label="Copy Link"
            />
            <Button 
              variant="outline" 
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center gap-2"
            >
              📊 Comparison View
            </Button>
          </div>

          {/* Error Display */}
          {missingFields.length > 0 && (
            <div className="mb-6">
              <ErrorDisplay 
                missingFields={missingFields}
                onComplete={() => console.log('Complete profile')}
                onRetry={() => console.log('Retry generation')}
              />
            </div>
          )}
        </div>

        {/* Comparison View */}
        {showComparison && (
          <div className="mb-8">
            <ComparisonView platforms={platforms} platformConfig={platformConfig} />
          </div>
        )}

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