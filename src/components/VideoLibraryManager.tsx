import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  FolderPlus, 
  RefreshCw, 
  Star, 
  Copy, 
  Scissors, 
  Trash2, 
  MoreVertical,
  Settings,
  Video,
  Clock,
  Monitor,
  Play,
  Download,
  Share2,
  Eye,
  Edit,
  Save,
  X,
  ChevronRight,
  Home,
  Grid3X3,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Wand2,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  Info,
  BookOpen,
  Calendar,
  Heart,
  Upload
} from 'lucide-react';
import config from '@/config/config';

// Interface for video preset data from API
interface VideoPresetData {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  description?: string;
  
  // Video generation settings
  prompt: string;
  negative_prompt?: string;
  video_model: string;
  resolution: string;
  video_length: number;
  seed?: number;
  influencer_image?: string;
  preset_image?: string; // Preset image URL (selected image for the preset)
  
  // Metadata
  rating?: number;
  favorite?: boolean;
  
  // Computed properties
  createdDate?: string;
  createdTime?: string;
  imageUrl?: string | null;
}

export default function VideoLibraryManager({ onClose, onApplyPreset }: {
  onClose: () => void;
  onApplyPreset?: (preset: VideoPresetData) => void;
}) {
  const LIBRARY_USER_ID = '21df831a-4ed7-4b40-abd0-bf568b132134';
  const userData = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [presets, setPresets] = useState<VideoPresetData[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPreset, setSelectedPreset] = useState<VideoPresetData | null>(null);
  const [detailedPresetModal, setDetailedPresetModal] = useState<{ open: boolean; preset: VideoPresetData | null }>({ open: false, preset: null });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch video presets
  const fetchPresets = async () => {
    try {
      setPresetsLoading(true);

      const response = await fetch(`${config.supabase_server_url}/video_presets?user_id=eq.${LIBRARY_USER_ID}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video presets');
      }

      const data: VideoPresetData[] = await response.json();

      // Transform the data to add computed properties
      const transformedPresets = data.map(preset => {
        const createdDate = new Date(preset.created_at);

        return {
          ...preset,
          createdDate: createdDate.toLocaleDateString(),
          createdTime: createdDate.toLocaleTimeString(),
          imageUrl: preset.preset_image || preset.influencer_image || null
        };
      });

      setPresets(transformedPresets);
    } catch (error) {
      console.error('Error fetching video presets:', error);
      toast.error('Failed to fetch video presets');
    } finally {
      setPresetsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPresets();
  }, [LIBRARY_USER_ID]);

  // Filter presets based on search
  const filteredPresets = presets.filter(preset => {
    const matchesSearch = searchTerm === '' || 
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.video_model.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Sort presets
  const sortedPresets = [...filteredPresets].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'newest':
      case 'oldest':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      case 'model':
        comparison = a.video_model.localeCompare(b.video_model);
        break;
      case 'resolution':
        comparison = a.resolution.localeCompare(b.resolution);
        break;
      case 'duration':
        comparison = a.video_length - b.video_length;
        break;
      default:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Handle preset application
  const handleApplyPreset = (preset: VideoPresetData) => {
    if (onApplyPreset) {
      onApplyPreset(preset);
      onClose();
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPresets();
      toast.success('Video presets refreshed successfully');
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh video presets');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get model display name
  const getModelDisplayName = (model: string) => {
    switch (model) {
      case 'kling-v2.1': return 'Kling 2.1';
      case 'kling-v2.1-master': return 'Kling 2.1 Master';
      case 'seedance-1-lite': return 'Seedance 1 Lite';
      case 'seedance-1-pro': return 'Seedance 1 Pro';
      case 'wan-2.1-i2v-480p': return 'WAN 2.1 480p';
      case 'wan-2.1-i2v-720p': return 'WAN 2.1 720p';
      default: return model;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Video Library
            </div>
            <div className="flex items-center gap-2 mr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search and Sort Controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search video presets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="model">Model</SelectItem>
                <SelectItem value="resolution">Resolution</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Presets Grid/List */}
        <div className="flex-1 overflow-y-auto">
          {presetsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading video presets...</p>
              </div>
            </div>
          ) : sortedPresets.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No video presets found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  No video presets available in the library
                </p>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
              "space-y-4"
            }>
              {sortedPresets.map((preset) => (
                <Card
                  key={preset.id}
                  className={`group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden relative`}
                  onClick={() => setDetailedPresetModal({ open: true, preset })}
                >
                  {/* Top Row: Ratings and Favorite */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                    {/* Professional Mark */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= (preset.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>

                    {/* Favorite Heart */}
                    <div>
                      {preset.favorite ? (
                        <div className="bg-red-500 rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-7 h-7 flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Preview */}
                  <div
                    className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 cursor-pointer"
                    onClick={() => setDetailedPresetModal({ open: true, preset })}
                  >
                    {preset.preset_image ? (
                      <img
                        src={preset.preset_image}
                        alt="Preset image"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Eye className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                    </div>

                    {/* Model Badge */}
                    <div className="absolute top-2 left-2 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium">
                      {getModelDisplayName(preset.video_model)}
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {preset.video_length}s
                    </div>
                  </div>

                  {/* Preset Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {preset.name}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {preset.createdDate}
                        </p>
                      </div>
                    </div>

                    {/* Preset Details */}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {preset.resolution}
                      </Badge>
                      {preset.seed && (
                        <Badge variant="outline" className="text-xs">
                          Seed: {preset.seed}
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyPreset(preset);
                        }}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Use
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Preset Modal */}
        <Dialog open={detailedPresetModal.open} onOpenChange={(open) => setDetailedPresetModal({ open, preset: null })}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                Video Preset Details
              </DialogTitle>
              <DialogDescription>
                Review and apply this video generation preset
              </DialogDescription>
            </DialogHeader>
            
            {detailedPresetModal.preset && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                      <p className="text-lg font-semibold">{detailedPresetModal.preset.name}</p>
                    </div>
                    
                    {detailedPresetModal.preset.description && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p className="text-sm">{detailedPresetModal.preset.description}</p>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Prompt</Label>
                      <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {detailedPresetModal.preset.prompt}
                      </p>
                    </div>

                    {detailedPresetModal.preset.negative_prompt && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Negative Prompt</Label>
                        <p className="text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-700 dark:text-red-300">
                          {detailedPresetModal.preset.negative_prompt}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                        <Badge variant="outline" className="mt-1">
                          {getModelDisplayName(detailedPresetModal.preset.video_model)}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Resolution</Label>
                        <Badge variant="outline" className="mt-1">
                          {detailedPresetModal.preset.resolution}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                        <Badge variant="outline" className="mt-1">
                          {detailedPresetModal.preset.video_length}s
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                        <p className="text-sm mt-1">{detailedPresetModal.preset.createdDate}</p>
                      </div>
                    </div>

                    {detailedPresetModal.preset.seed && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Seed</Label>
                        <p className="text-sm">{detailedPresetModal.preset.seed}</p>
                      </div>
                    )}

                    {detailedPresetModal.preset.influencer_image && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Influencer Image</Label>
                        <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border">
                          <img
                            src={detailedPresetModal.preset.influencer_image}
                            alt="Influencer image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleApplyPreset(detailedPresetModal.preset!)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Apply Preset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDetailedPresetModal({ open: false, preset: null })}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
} 