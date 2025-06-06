
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { addContentItem, addToQueue } from '@/store/slices/contentSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Image, Video, Wand2, Settings, Play, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContentCreate() {
  const dispatch = useDispatch();
  const { influencers } = useSelector((state: RootState) => state.influencers);
  const { generationQueue } = useSelector((state: RootState) => state.content);
  const [selectedInfluencer, setSelectedInfluencer] = useState('');
  const [contentType, setContentType] = useState('image');
  const [platform, setPlatform] = useState('instagram');
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleGenerate = () => {
    if (!selectedInfluencer || !prompt || !title) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    const newContent = {
      id: Date.now().toString(),
      influencerId: selectedInfluencer,
      type: contentType as 'image' | 'video',
      url: '',
      title,
      platform: platform as 'instagram' | 'tiktok' | 'fanvue' | 'general',
      status: 'generating' as const,
      createdAt: new Date().toISOString(),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      inVault: false
    };

    // Add to queue
    dispatch(addToQueue(newContent));

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsGenerating(false);
          
          // Complete the generation
          const completedContent = {
            ...newContent,
            status: 'completed' as const,
            url: contentType === 'image' 
              ? 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=800&fit=crop'
              : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop'
          };
          
          dispatch(addContentItem(completedContent));
          
          // Reset form
          setTitle('');
          setPrompt('');
          setTags('');
          setGenerationProgress(0);
          
          return 0;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const selectedInfluencerData = influencers.find(inf => inf.id === selectedInfluencer);
  const queuePosition = generationQueue.findIndex(item => item.status === 'generating') + 1;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Create Content
        </h1>
        <p className="text-muted-foreground">
          Generate new images and videos with your AI influencers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Content Title *</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="influencer">Select Influencer *</Label>
              <Select value={selectedInfluencer} onValueChange={setSelectedInfluencer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an influencer" />
                </SelectTrigger>
                <SelectContent>
                  {influencers.map((influencer) => (
                    <SelectItem key={influencer.id} value={influencer.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        {influencer.name} - {influencer.influencer_type || influencer.tags[0]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedInfluencerData && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedInfluencerData.name} • {selectedInfluencerData.influencer_type}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Content Type *</Label>
              <div className="flex gap-2">
                <Button
                  variant={contentType === 'image' ? 'default' : 'outline'}
                  onClick={() => setContentType('image')}
                  className="flex-1"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Image
                </Button>
                <Button
                  variant={contentType === 'video' ? 'default' : 'outline'}
                  onClick={() => setContentType('video')}
                  className="flex-1"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Target Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="fanvue">FanVue</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="fashion, lifestyle, summer (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Content Prompt *</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the content you want to generate in detail..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="text-xs text-muted-foreground">
                {prompt.length}/500 characters
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm font-medium">Generating Content...</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
                <div className="text-xs text-muted-foreground">
                  Progress: {Math.round(generationProgress)}% • Queue position: {queuePosition}
                </div>
              </div>
            )}

            <Button 
              onClick={handleGenerate}
              disabled={!selectedInfluencer || !prompt || !title || isGenerating}
              className="w-full bg-ai-gradient hover:opacity-90"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview & Queue Panel */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="w-16 h-16 bg-ai-gradient rounded-full animate-pulse"></div>
                  <div className="text-center">
                    <p className="font-medium">Generating your content...</p>
                    <p className="text-sm text-muted-foreground">This may take a few minutes</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 space-y-4 border-2 border-dashed border-muted rounded-lg">
                  {contentType === 'image' ? (
                    <Image className="w-12 h-12 text-muted-foreground" />
                  ) : (
                    <Video className="w-12 h-12 text-muted-foreground" />
                  )}
                  <div className="text-center">
                    <p className="text-muted-foreground">Your generated content will appear here</p>
                    {selectedInfluencer && title && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Ready to generate: "{title}" with {selectedInfluencerData?.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generation Queue */}
          {generationQueue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Generation Queue ({generationQueue.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {generationQueue.slice(0, 3).map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type} • {item.platform}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {index === 0 ? 'Processing' : `Queue #${index + 1}`}
                    </Badge>
                  </div>
                ))}
                {generationQueue.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{generationQueue.length - 3} more in queue
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Generations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group relative">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Generated Image {item}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Completed 2 minutes ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
