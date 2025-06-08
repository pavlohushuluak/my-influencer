
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Layers, Play, Pause, Settings, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ContentBatch() {
  const [batchSize, setBatchSize] = useState('5');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const mockBatchJobs = [
    {
      id: '1',
      name: 'Summer Fashion Collection',
      status: 'completed',
      items: 12,
      completed: 12,
      created: '2024-06-03',
      influencer: 'Sophia Chen',
      platform: 'instagram'
    },
    {
      id: '2',
      name: 'Fitness Routine Series',
      status: 'processing',
      items: 8,
      completed: 5,
      created: '2024-06-04',
      influencer: 'Alex Kim',
      platform: 'tiktok'
    },
    {
      id: '3',
      name: 'Lifestyle Content Pack',
      status: 'queued',
      items: 15,
      completed: 0,
      created: '2024-06-05',
      influencer: 'Maya Rodriguez',
      platform: 'fanvue'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'queued': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'processing': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'queued': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const handleStartBatch = () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate batch processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Batch Content
        </h1>
        <p className="text-muted-foreground">
          Generate multiple pieces of content efficiently in batches
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Batch Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="influencer">Select Influencer</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an influencer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sophia">Sophia Chen - Fashion</SelectItem>
                  <SelectItem value="maya">Maya Rodriguez - Lifestyle</SelectItem>
                  <SelectItem value="alex">Alex Kim - Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-name">Batch Name</Label>
              <Input id="batch-name" placeholder="Enter batch name..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-size">Batch Size</Label>
              <Select value={batchSize} onValueChange={setBatchSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 items</SelectItem>
                  <SelectItem value="10">10 items</SelectItem>
                  <SelectItem value="15">15 items</SelectItem>
                  <SelectItem value="20">20 items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Content Types</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="images" defaultChecked />
                  <Label htmlFor="images">Images</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="videos" />
                  <Label htmlFor="videos">Videos</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="instagram" defaultChecked />
                  <Label htmlFor="instagram">Instagram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tiktok" />
                  <Label htmlFor="tiktok">TikTok</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="fanvue" />
                  <Label htmlFor="fanvue">FanVue</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompts">Batch Prompts</Label>
              <Textarea
                id="prompts"
                placeholder="Enter prompts separated by line breaks..."
                className="min-h-[120px]"
              />
            </div>

            <Button 
              onClick={handleStartBatch}
              disabled={isProcessing}
              className="w-full bg-ai-gradient hover:opacity-90"
            >
              {isProcessing ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Batch Generation
                </>
              )}
            </Button>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Batch Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockBatchJobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{job.name}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Influencer: {job.influencer}</span>
                    <span>Platform: {job.platform}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Progress: {job.completed}/{job.items} items</span>
                    <span>Created: {job.created}</span>
                  </div>
                  
                  {job.status === 'processing' && (
                    <Progress 
                      value={(job.completed / job.items) * 100} 
                      className="w-full h-2"
                    />
                  )}
                </div>

                {job.status === 'completed' && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      Download All
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Batch Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Batch Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Fashion Week', items: 10, type: 'Fashion content for Instagram' },
              { name: 'Fitness Challenge', items: 7, type: 'Daily workout videos for TikTok' },
              { name: 'Lifestyle Series', items: 15, type: 'Mixed content for all platforms' }
            ].map((template, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <h3 className="font-semibold mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{template.type}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{template.items} items</Badge>
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
