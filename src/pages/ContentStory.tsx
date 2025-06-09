
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Play, Edit, Trash2, Image, Clock } from 'lucide-react';

export default function ContentStory() {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const mockStories = [
    {
      id: '1',
      title: 'Morning Routine Series',
      description: 'A 5-part story about daily wellness routines',
      status: 'published',
      episodes: 5,
      platform: 'instagram',
      lastUpdated: '2024-01-15',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Fashion Week Behind Scenes',
      description: 'Exclusive backstage content from fashion week',
      status: 'draft',
      episodes: 3,
      platform: 'tiktok',
      lastUpdated: '2024-01-14',
      thumbnail: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop'
    },
    {
      id: '3',
      title: 'Fitness Journey',
      description: 'Weekly progress updates and workout tips',
      status: 'scheduled',
      episodes: 8,
      platform: 'fanvue',
      lastUpdated: '2024-01-13',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'scheduled': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'draft': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Story Content
          </h1>
          <p className="text-muted-foreground">
            Create and manage episodic content series
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-ai-gradient hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Story
        </Button>
      </div>

      {isCreating ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="story-title">Story Title</Label>
                <Input id="story-title" placeholder="Enter story title..." />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="fanvue">FanVue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe your story series..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-ai-gradient hover:opacity-90">
                Create Story
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockStories.map((story) => (
            <Card key={story.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(story.status)}>
                    {story.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Image className="w-3 h-3" />
                    {story.episodes} episodes
                  </div>
                </div>
                <CardTitle className="text-lg">{story.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={story.thumbnail} 
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {story.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>Platform: {story.platform}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {story.lastUpdated}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Play className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Story Episodes Section */}
      {selectedStory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Story Episodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="group">
                  <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm font-medium">Episode {i + 1}</p>
                  <p className="text-xs text-muted-foreground">2 min read</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
