
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { InfluencerCard } from '@/components/Dashboard/InfluencerCard';
import { StoryContentCard } from '../components/Dashboard/StoryContentCard';
import { ScheduleCard } from '@/components/Dashboard/ScheduleCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Filter } from 'lucide-react';

export default function Dashboard() {
  const { influencers } = useSelector((state: RootState) => state.influencers);
  const { contentLibrary } = useSelector((state: RootState) => state.content);
  const { credits } = useSelector((state: RootState) => state.user);

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
    }
  ];

  // Mock data for story content
  const mockStoryContent = [
    {
      id: '1',
      title: 'Summer Beach Vibes',
      caption: 'Experience the perfect summer day with stunning beach photography and lifestyle content that captures the essence of relaxation.',
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', , '/placeholder.svg'],
      totalImages: 12
    },
    {
      id: '2',
      title: 'Urban Street Style',
      caption: 'Modern city fashion meets contemporary design in this curated collection of urban lifestyle photography.',
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      totalImages: 8
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* My Influencers Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">My Influencers</CardTitle>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
              <MoreHorizontal className="w-4 h-4 mr-2" />
              More
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfluencerCard isCreateCard={true} />
            {mockInfluencers.map((influencer) => (
              <InfluencerCard
                key={influencer.id}
                id={influencer.id}
                name={influencer.name}
                age={influencer.age}
                lifecycle={influencer.lifecycle}
                type={influencer.type}
                imageUrl={influencer.imageUrl}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        {/* Story Content Container */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Story Content</CardTitle>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>All Content</DropdownMenuItem>
                    <DropdownMenuItem>Published</DropdownMenuItem>
                    <DropdownMenuItem>Draft</DropdownMenuItem>
                    <DropdownMenuItem>Scheduled</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  More
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockStoryContent.map((content) => (
                <StoryContentCard
                  key={content.id}
                  id={content.id}
                  title={content.title}
                  caption={content.caption}
                  images={content.images}
                  totalImages={content.totalImages}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Container */}
      <div className="space-y-6">
        <ScheduleCard />
      </div>
    </div>
  );
}
