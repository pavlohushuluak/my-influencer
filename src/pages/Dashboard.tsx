import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, MoreHorizontal, Filter, Image } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StoryContentCard } from '@/components/Dashboard/StoryContentCard';
import { ScheduleCard } from '@/components/Dashboard/ScheduleCard';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const loading = useSelector((state: RootState) => state.influencers.loading);
  const error = useSelector((state: RootState) => state.influencers.error);
  const [showAllInfluencers, setShowAllInfluencers] = useState(false);
  const [showAllStoryContent, setShowAllStoryContent] = useState(false);
  const displayedInfluencers = showAllInfluencers ? influencers : influencers.slice(0, 4);

  // Mock data for story content
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
    }
  ];

  const displayedStoryContent = showAllStoryContent ? mockStoryContent : mockStoryContent.slice(0, 2);

  const userData = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const checkSubscription = async () => {
      let credits = userData.credits;
      const subscription = userData.subscription;
      if (subscription === 'enterprise' && credits > 300) {
        credits = 300;
      }
      else if (subscription === 'professional' && credits > 200) {
        credits = 200;
      }
      else if (subscription === 'starter' && credits > 100) {
        credits = 100;
      }
      if (userData.billing_date <= Date.now() && userData.subscription !== 'free') {
        try {
          const response = await axios.patch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, JSON.stringify({
            subscription: 'free',
            billing_date: 0,
            free_purchase: true,
            credits: credits
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer WeInfl3nc3withAI`,
            },
          });
          return response.data;
        } catch (error) {
          console.error('Subscription update failed:', error);
          throw error;
        }
      }
      else if (userData.billing_date > Date.now() && userData.subscription !== 'free' && userData.billed_date + 1 * 30 * 24 * 60 * 60 * 1000 >= Date.now()) {
        try {
          const response = await axios.patch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, JSON.stringify({
            billed_date: userData.billed_date + 1 * 30 * 24 * 60 * 60 * 1000,
            credits: credits
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer WeInfl3nc3withAI`,
            },
          });
          return response.data;
        } catch (error) {
          console.error('Subscription update failed:', error);
          throw error;
        }
      }
    };

    checkSubscription();
  }, [userData.billing_date, userData.id]);

  // console.log('User Data:', userData);
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch(`https://db.nymia.ai/rest/v1/influencer?user_id=eq.${userData.id}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch influencers');
        }

        const data = await response.json();
        dispatch(setInfluencers(data));
      } catch (error) {
        dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchInfluencers();
  }, [dispatch]);

  const handleCreateNew = () => {
    navigate('/influencers/create');
  };

  const handleEditInfluencer = (id: string) => {
    navigate('/influencers/edit', { state: { influencerData: influencers.find(inf => inf.id === id) } });
  };

  const handleEditStoryContent = (id: string) => {
    console.log('Edit story content:', id);
    // Navigate to edit page or open modal
  };

  const handleFilterStoryContent = () => {
    console.log('Filter story content');
    // Open filter modal or dropdown
  };

  const handleUseInfluencer = (id: string) => {
    const selectedInfluencer = influencers.find(inf => inf.id === id);
    if (selectedInfluencer) {
      navigate('/content/create', {
        state: {
          influencerData: selectedInfluencer,
          mode: 'create'
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to your AI influencer management dashboard
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Create New Influencer
        </Button>
      </div>

      {/* My Influencers Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">My Influencers</CardTitle>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700" onClick={() => setShowAllInfluencers(!showAllInfluencers)}>
              <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllInfluencers ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedInfluencers.map((influencer) => (
              <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                <CardContent className="p-6 h-full">
                  <div className="flex flex-col justify-between h-full space-y-4">
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                      {
                        influencer.image_url ? (
                          <img
                            src={influencer.image_url}
                            alt={`${influencer.name_first} ${influencer.name_last}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No image found</h3>
                          </div>
                        )
                      }
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                          {influencer.name_first} {influencer.name_last}
                        </h3>
                      </div>

                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex text-sm text-muted-foreground flex-col">
                          <span className="font-medium mr-2">Age/Lifestyle:</span>
                          {influencer.age_lifestyle || 'No age/lifestyle selected'}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="font-medium mr-2">Type:</span>
                          {influencer.influencer_type || 'No type selected'}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditInfluencer(influencer.id)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUseInfluencer(influencer.id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Story Content Container */}
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
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700" onClick={() => setShowAllStoryContent(!showAllStoryContent)}>
                <MoreHorizontal className="w-4 h-4 mr-2" />
                {showAllStoryContent ? 'Show Less' : 'Show More'}
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

      {/* Schedule Container */}
      <ScheduleCard />
    </div>
  );
}
