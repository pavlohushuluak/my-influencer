
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { RecentActivity } from '@/components/Dashboard/RecentActivity';
import { AnalyticsChart } from '@/components/Dashboard/AnalyticsChart';
import { InfluencerCard } from '@/components/Dashboard/InfluencerCard';
import { StoryContentCard } from '@/components/Dashboard/StoryContentCard';
import { ScheduleCard } from '@/components/Dashboard/ScheduleCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Image, Star, Calendar, MoreHorizontal, Filter, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const { influencers } = useSelector((state: RootState) => state.influencers);
  const { contentLibrary } = useSelector((state: RootState) => state.content);
  const { credits } = useSelector((state: RootState) => state.user);

  const [showAllInfluencers, setShowAllInfluencers] = useState(false);
  const [showAllStoryContent, setShowAllStoryContent] = useState(false);

  const totalContent = contentLibrary.length;
  const vaultItems = contentLibrary.filter(item => item.inVault).length;

  // Mock data for influencers
  const mockInfluencers = [
    {
      id: '1',
      name: 'Sophia Chen',
      age: 24,
      lifecycle: 'Active',
      type: 'Fashion',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Maya Rodriguez',
      age: 22,
      lifecycle: 'Growing',
      type: 'Lifestyle',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Alex Kim',
      age: 26,
      lifecycle: 'Established',
      type: 'Fitness',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '4',
      name: 'Emma Wilson',
      age: 25,
      lifecycle: 'Active',
      type: 'Beauty',
      imageUrl: '/placeholder.svg'
    },
    {
      id: '5',
      name: 'James Thompson',
      age: 28,
      lifecycle: 'Established',
      type: 'Tech',
      imageUrl: '/placeholder.svg'
    }
  ];

  // Mock data for story content based on your specification
  const mockStoryContent = [
    {
      id: '1',
      title: 'Sunlit Run - Post-Run Refresh at a Hidden Spot',
      format: 'Exclusive Outdoor Series',
      setting: 'Secluded coastal path near Avon Gorge, late afternoon sun casting golden rays, ocean in the background.',
      seo: "A long run along the Avon Gorge led me to this hidden gem. The sun's kissing my skin as I cool off with ocean...",
      instagramStatus: 'Not scheduled',
      fanvueSchedule: 'May 10, 2025 10:00 PM',
      images: [
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg'
      ],
      totalImages: 12
    },
    {
      id: '2',
      title: 'Urban Coffee Culture - Morning Vibes Downtown',
      format: 'Lifestyle Series',
      setting: 'Trendy downtown café, morning golden hour, bustling city life in the background, cozy interior lighting.',
      seo: 'Starting my day right in the heart of the city. This little café has become my morning sanctuary, perfect lighting and...',
      instagramStatus: 'Scheduled for today 9:00 AM',
      fanvueSchedule: 'May 8, 2025 7:30 AM',
      images: [
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg'
      ],
      totalImages: 12
    },
    {
      id: '3',
      title: 'Sunset Yoga Session - Beach Meditation',
      format: 'Wellness Series',
      setting: 'Private beach location, sunset hour, calm waves, peaceful atmosphere with warm lighting.',
      seo: 'Finding my center as the day comes to an end. Beach yoga hits different when you have the whole shoreline to yourself...',
      instagramStatus: 'Published',
      fanvueSchedule: 'May 12, 2025 6:00 PM',
      images: [
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg'
      ],
      totalImages: 12
    },
    {
      id: '4',
      title: 'Sunset Yoga Session - Beach Meditation',
      format: 'Wellness Series',
      setting: 'Private beach location, sunset hour, calm waves, peaceful atmosphere with warm lighting.',
      seo: 'Finding my center as the day comes to an end. Beach yoga hits different when you have the whole shoreline to yourself...',
      instagramStatus: 'Published',
      fanvueSchedule: 'May 12, 2025 6:00 PM',
      images: [
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg'
      ],
      totalImages: 15
    }
  ];

  const displayedInfluencers = showAllInfluencers ? mockInfluencers : mockInfluencers.slice(0, 3);
  const displayedStoryContent = showAllStoryContent ? mockStoryContent : mockStoryContent.slice(0, 2);

  // Handler functions
  const handleCreateInfluencer = () => {
    console.log('Create new influencer');
    // Navigate to create influencer page or open modal
  };

  const handleEditInfluencer = (id: string) => {
    console.log('Edit influencer:', id);
    // Navigate to edit page or open modal
  };

  const handleUseInfluencer = (id: string) => {
    console.log('Use influencer:', id);
    // Navigate to content generation or open modal
  };

  const handleEditStoryContent = (id: string) => {
    console.log('Edit story content:', id);
    // Navigate to edit page or open modal
  };

  const handleShowAllInfluencers = () => {
    setShowAllInfluencers(true);
    console.log('Show all influencers');
  };

  const handleShowAllStoryContent = () => {
    setShowAllStoryContent(true);
    console.log('Show all story content');
  };

  const handleFilterStoryContent = () => {
    console.log('Filter story content');
    // Open filter modal or dropdown
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* My Influencers Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">My Influencers</CardTitle>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700" onClick={handleShowAllInfluencers}>
              <MoreHorizontal className="w-4 h-4 mr-2" />
              More
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfluencerCard
              isCreateCard={true}
              onCreate={handleCreateInfluencer}
            />
            {displayedInfluencers.map((influencer) => (
              <InfluencerCard
                key={influencer.id}
                id={influencer.id}
                name={influencer.name}
                age={influencer.age}
                lifecycle={influencer.lifecycle}
                type={influencer.type}
                imageUrl={influencer.imageUrl}
                onEdit={handleEditInfluencer}
                onUse={handleUseInfluencer}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        {/* Story Content Container */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Story Content</CardTitle>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={handleFilterStoryContent}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>All Content</DropdownMenuItem>
                      <DropdownMenuItem>Published</DropdownMenuItem>
                      <DropdownMenuItem>Scheduled</DropdownMenuItem>
                      <DropdownMenuItem>Not Scheduled</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700" onClick={handleShowAllStoryContent}>
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    More
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedStoryContent.map((content) => (
                  <StoryContentCard
                    key={content.id}
                    id={content.id}
                    title={content.title}
                    format={content.format}
                    setting={content.setting}
                    seo={content.seo}
                    instagramStatus={content.instagramStatus}
                    fanvueSchedule={content.fanvueSchedule}
                    images={content.images}
                    totalImages={content.totalImages}
                    onEdit={handleEditStoryContent}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Container */}
        <ScheduleCard />
      </div>
    </div>
  );
}
