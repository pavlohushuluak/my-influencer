
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Calendar, 
  Clock, 
  Settings, 
  Filter, 
  Search, 
  Grid, 
  List,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Sparkles,
  Video,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoData {
  video_id: string;
  task_created_at: string;
  model: string;
  mode: string;
  prompt: string;
  duration: number;
  start_image: string;
  start_image_url: string;
  negative_prompt: string;
  fps: string;
  resolution: string;
  aspect_ratio: string;
  camera_fixed: boolean;
  max_area: string;
  fast_mode: string;
  lora_scale: number;
  num_frames: number;
  sample_shift: number;
  sample_guide_scale: number;
  audio: string;
  audio_url: string;
  video: string;
  video_url: string;
  sync_mode: string;
  temperature: number;
  voice_id: string;
  voice_speed: number;
  status: string;
  replicate_id: string;
  logs: string;
  predict_time: number;
  total_time: number;
  replicate_output: string;
  replicate_status: string;
  replicate_get_url: string;
  replicate_cancel_url: string;
  user_uuid: string;
  task_completed_at: string;
  lip_flag: boolean;
  video_path?: string;
  video_name?: string;
}

export default function ContentStory() {
  const userData = useSelector((state: RootState) => state.user);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<{ [key: string]: boolean }>({});

  // Fetch videos from Supabase
  useEffect(() => {
    const fetchVideos = async () => {
      if (!userData.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`https://db.nymia.ai/rest/v1/video?user_uuid=eq.${userData.id}&order=task_created_at.desc`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setVideos(data);
        } else {
          throw new Error('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [userData.id]);

  // Filter and sort videos - only show completed videos
  const filteredVideos = videos
    .filter(video => {
      // Only show completed videos
      if (video.status !== 'completed') return false;
      
      const matchesSearch = video.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.model.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.task_created_at).getTime() - new Date(a.task_created_at).getTime();
        case 'oldest':
          return new Date(a.task_created_at).getTime() - new Date(b.task_created_at).getTime();
        case 'duration':
          return b.duration - a.duration;
        case 'model':
          return a.model.localeCompare(b.model);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'processing': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'failed': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getModelDisplayName = (model: string) => {
    switch (model) {
      case 'kling-v2.1': return 'Kling 2.1';
      case 'wan-v2.1': return 'WAN 2.1';
      default: return model;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVideoUrl = (video: VideoData) => {
    // Use video_name if available, otherwise use video_id
    const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
    return `https://images.nymia.ai/${userData.id}/video/${video.video_path ? video.video_path + '/' : ''}${fileName}.mp4`;
  };

  const handleVideoClick = (video: VideoData) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handlePlayPause = (videoId: string) => {
    setIsPlaying(isPlaying === videoId ? null : videoId);
  };

  const handleMuteToggle = (videoId: string) => {
    setIsMuted(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const handleDownload = (video: VideoData) => {
    const videoUrl = getVideoUrl(video);
    const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${fileName}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleShare = (video: VideoData) => {
    const videoUrl = getVideoUrl(video);
    navigator.clipboard.writeText(videoUrl);
    toast.success('Video URL copied to clipboard');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg">Loading your videos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Video Gallery
          </h1>
          <p className="text-muted-foreground mt-1">
            {videos.filter(v => v.status === 'completed').length} completed videos ready to use
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Completed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="model">Model</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Video className="w-4 h-4" />
              {filteredVideos.length} videos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.video_id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(video.status)} border`}>
                      {video.status}
                    </Badge>
                    {video.lip_flag && (
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        LipSync
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <CardTitle className="text-sm line-clamp-2 text-left">
                  {video.prompt.length > 50 ? `${video.prompt.substring(0, 50)}...` : video.prompt}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                                 {/* Video Preview */}
                 <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                   <video
                     src={getVideoUrl(video)}
                     className="w-full h-full object-cover"
                     muted={isMuted[video.video_id] || false}
                     onPlay={() => setIsPlaying(video.video_id)}
                     onPause={() => setIsPlaying(null)}
                   />
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                     <Button
                       size="sm"
                       variant="secondary"
                       className="bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800"
                       onClick={() => handleVideoClick(video)}
                     >
                       <Play className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>

                {/* Video Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{getModelDisplayName(video.model)}</span>
                    <span>{video.mode}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{video.resolution}</span>
                    <span>{video.fps} FPS</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(video.task_created_at)}
                  </div>
                </div>

                                 {/* Action Buttons */}
                 <div className="flex gap-2 pt-2">
                   <Button
                     size="sm"
                     variant="outline"
                     className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30"
                     onClick={() => handleVideoClick(video)}
                   >
                     <Eye className="w-3 h-3 mr-1" />
                     View
                   </Button>
                   <Button
                     size="sm"
                     variant="outline"
                     className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30"
                     onClick={() => handleDownload(video)}
                   >
                     <Download className="w-3 h-3" />
                   </Button>
                   <Button
                     size="sm"
                     variant="outline"
                     className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-800/30 dark:hover:to-violet-800/30"
                     onClick={() => handleShare(video)}
                   >
                     <Share2 className="w-3 h-3" />
                   </Button>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <Card key={video.video_id} className="group hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-slate-800/80 border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                                     {/* Video Thumbnail */}
                   <div className="relative w-32 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                     <video
                       src={getVideoUrl(video)}
                       className="w-full h-full object-cover"
                       muted={isMuted[video.video_id] || false}
                     />
                     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                       <Button
                         size="sm"
                         variant="secondary"
                         className="bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800"
                         onClick={() => handleVideoClick(video)}
                       >
                         <Play className="w-4 h-4" />
                       </Button>
                     </div>
                   </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                          {video.prompt}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{getModelDisplayName(video.model)}</span>
                          <span>{video.mode}</span>
                          <span>{formatDuration(video.duration)}</span>
                          <span>{video.resolution}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={`${getStatusColor(video.status)} border`}>
                          {video.status}
                        </Badge>
                        {video.lip_flag && (
                          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-sm">
                            <Sparkles className="w-3 h-3 mr-1" />
                            LipSync
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(video.task_created_at)}
                      </div>
                      
                                             <div className="flex gap-2">
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleVideoClick(video)}
                         >
                           <Eye className="w-3 h-3 mr-1" />
                           View
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleDownload(video)}
                         >
                           <Download className="w-3 h-3" />
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleShare(video)}
                         >
                           <Share2 className="w-3 h-3" />
                         </Button>
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredVideos.length === 0 && !loading && (
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 border-0">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                         <p className="text-muted-foreground mb-4">
               {searchTerm 
                 ? 'Try adjusting your search terms'
                 : 'No completed videos found. Videos will appear here once they finish processing.'
               }
             </p>
                         {!searchTerm && (
               <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                 <Sparkles className="w-4 h-4 mr-2" />
                 Create Your First Video
               </Button>
             )}
          </CardContent>
        </Card>
      )}

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" />
              Video Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={getVideoUrl(selectedVideo)}
                  className="w-full h-full"
                  controls
                  autoPlay
                />
              </div>

              {/* Video Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Prompt</Label>
                    <p className="text-sm mt-1">{selectedVideo.prompt}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                      <p className="text-sm mt-1">{getModelDisplayName(selectedVideo.model)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Mode</Label>
                      <p className="text-sm mt-1">{selectedVideo.mode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                      <p className="text-sm mt-1">{formatDuration(selectedVideo.duration)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Resolution</Label>
                      <p className="text-sm mt-1">{selectedVideo.resolution}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-sm mt-1">{formatDate(selectedVideo.task_created_at)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getStatusColor(selectedVideo.status)} border`}>
                        {selectedVideo.status}
                      </Badge>
                      {selectedVideo.lip_flag && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-sm">
                          <Sparkles className="w-3 h-3 mr-1" />
                          LipSync
                        </Badge>
                      )}
                    </div>
                  </div>

                  {selectedVideo.negative_prompt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Negative Prompt</Label>
                      <p className="text-sm mt-1">{selectedVideo.negative_prompt}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleDownload(selectedVideo)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => handleShare(selectedVideo)}
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </Button>
                <Button variant="outline">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
