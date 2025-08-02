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
  ImageIcon,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

// Interface for video preset data from API
interface VideoPresetData {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  description?: string;
  route: string;
  video_name: string;
  rating?: number;
  favorite?: boolean;
  
  // Video generation settings
  prompt: string;
  negative_prompt?: string;
  model: string;
  resolution: string;
  video_length: number;
  seed?: number;
  start_image?: string;
  start_image_url?: string;
  
  // Additional video settings
  fps: number;
  motion_strength: number;
  camera_movement: string;
  transition_type: string;
  guidance: number;
  nsfw_strength: number;
  lora_strength: number;
  quality: string;
  mode: string;
  use_prompt_only: boolean;
  
  // Model data (influencer or custom model)
  model_data?: any;
  
  // Scene specifications
  scene_framing?: string;
  scene_rotation?: string;
  scene_lighting_preset?: string;
  scene_setting?: string;
  scene_pose?: string;
  scene_clothes?: string;
  
  // Model description (detailed model specifications)
  model_appearance?: string;
  model_cultural_background?: string;
  model_body_type?: string;
  model_facial_features?: string;
  model_hair_color?: string;
  model_hair_length?: string;
  model_hair_style?: string;
  model_skin?: string;
  model_lips?: string;
  model_eyes?: string;
  model_nose?: string;
  model_makeup?: string;
  model_bust?: string;
  model_clothing?: string;
  model_sex?: string;
  model_eyebrow_style?: string;
  model_face_shape?: string;
  model_color_palette?: string;
  model_age?: string;
  model_lifestyle?: string;
  
  // Additional settings
  lora: boolean;
  no_ai: boolean;
  regenerated_from?: string;
  
  // Metadata
  tags?: string[];
  category?: string;
  is_public: boolean;
  
  // Computed properties
  hasModel?: boolean;
  hasScene?: boolean;
  sceneCount?: number;
  hasModelDescription?: boolean;
  hasPrompt?: boolean;
  createdDate?: string;
  createdTime?: string;
  videoUrl?: string | null;
}

// Interface for folder structure
interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
  isFolder: boolean;
}

// Interface for folder data from API
interface FolderData {
  Key: string;
}

export default function VideoPresetsManager({ onClose, onApplyPreset }: {
  onClose: () => void;
  onApplyPreset?: (preset: VideoPresetData) => void;
}) {
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
  
  // Folder management state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);

  // New folder modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    const pathWithoutPrefix = fullPath.replace(/^[^\/]+\/videopresets\//, '');
    return pathWithoutPrefix;
  };

  const encodeName = (name: string): string => {
    return name.replace(/\s/g, '_space_');
  };

  const decodeName = (name: string): string => {
    return name.replace(/_space_/g, ' ');
  };

  // Build folder structure from raw folder data
  const buildFolderStructure = (folderData: FolderData[]): FolderStructure[] => {
    const structure: FolderStructure[] = [];
    const pathMap = new Map<string, FolderStructure>();

    folderData.forEach(folder => {
      const folderPath = extractFolderName(folder.Key);

      if (!folderPath) {
        return;
      }

      const pathParts = folderPath.split('/').filter(part => part.length > 0);
      let currentPath = '';

      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(currentPath)) {
          const newFolder: FolderStructure = {
            name: decodeName(part),
            path: currentPath,
            children: [],
            isFolder: true
          };

          pathMap.set(currentPath, newFolder);

          if (parentPath === '') {
            structure.push(newFolder);
          } else {
            const parent = pathMap.get(parentPath);
            if (parent) {
              parent.children.push(newFolder);
            }
          }
        }
      });
    });

    return structure;
  };

  // Navigation functions
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const navigateToParent = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
  };

  const navigateToHome = () => {
    setCurrentPath('');
  };

  const getBreadcrumbItems = () => {
    const items = [];
    if (currentPath) {
      const pathParts = currentPath.split('/');
      let currentFullPath = '';
      
      pathParts.forEach((part, index) => {
        currentFullPath = currentFullPath ? `${currentFullPath}/${part}` : part;
        items.push({
          name: decodeName(part),
          path: currentFullPath
        });
      });
    }
    return items;
  };

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const response = await fetch(`https://api.nymia.ai/v1/getfoldernames?user=${userData.id}&folder=videopresets`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (response.ok) {
        const folderData: FolderData[] = await response.json();
        setFolders(folderData);
        setFolderStructure(buildFolderStructure(folderData));
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  // Fetch video presets
  const fetchPresets = async () => {
    try {
      setPresetsLoading(true);

      const response = await fetch(`https://db.nymia.ai/rest/v1/video_presets?user_id=eq.${userData.id}`, {
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
        
        // Check if preset has model data (influencer or custom model)
        const hasModel = preset.model_data && Object.keys(preset.model_data).length > 0;
        
        // Check if preset has scene specifications
        const hasScene = !!(preset.scene_framing || preset.scene_rotation || preset.scene_lighting_preset || 
                        preset.scene_setting || preset.scene_pose || preset.scene_clothes);
        const sceneCount = [preset.scene_framing, preset.scene_rotation, preset.scene_lighting_preset, 
                           preset.scene_setting, preset.scene_pose, preset.scene_clothes]
                          .filter(Boolean).length;
        
        // Check if preset has model description
        const hasModelDescription = !!(preset.model_appearance || preset.model_cultural_background || 
                                   preset.model_body_type || preset.model_facial_features || 
                                   preset.model_hair_color || preset.model_hair_length || 
                                   preset.model_hair_style || preset.model_skin || 
                                   preset.model_lips || preset.model_eyes || 
                                   preset.model_nose || preset.model_makeup || 
                                   preset.model_bust || preset.model_clothing || 
                                   preset.model_sex || preset.model_eyebrow_style || 
                                   preset.model_face_shape || preset.model_color_palette || 
                                   preset.model_age || preset.model_lifestyle);
        
        // Check if preset has prompt
        const hasPrompt = preset.prompt && preset.prompt.trim().length > 0;

        const videoUrl = preset.video_name ?
          `https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/videopresets/${preset.route ? preset.route + '/' : ''}${preset.video_name}` :
          null;

        return {
          ...preset,
          hasModel,
          hasScene,
          sceneCount,
          hasModelDescription,
          hasPrompt,
          createdDate: createdDate.toLocaleDateString(),
          createdTime: createdDate.toLocaleTimeString(),
          videoUrl
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
    fetchFolders();
    fetchPresets();
  }, [userData.id]);

  // Filter presets based on current path and search
  const filteredPresets = presets.filter(preset => {
    const matchesPath = currentPath === '' ? 
      (!preset.route || preset.route === '') : 
      preset.route === currentPath;
    
    const matchesSearch = searchTerm === '' || 
      preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preset.model.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesPath && matchesSearch;
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
        comparison = a.model.localeCompare(b.model);
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

  // Handle preset deletion
  const handlePresetDelete = async (preset: VideoPresetData) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/video_presets?id=eq.${preset.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (response.ok) {
        setPresets(prev => prev.filter(p => p.id !== preset.id));
        toast.success('Video preset deleted successfully');
      } else {
        throw new Error('Failed to delete video preset');
      }
    } catch (error) {
      console.error('Error deleting video preset:', error);
      toast.error('Failed to delete video preset');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchFolders(), fetchPresets()]);
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

  // Get quality display name
  const getQualityDisplayName = (quality: string) => {
    switch (quality) {
      case 'Quality': return 'High Quality';
      case 'Speed': return 'Fast Generation';
      case 'Balanced': return 'Balanced';
      default: return quality;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Video Presets Manager
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage and organize your video generation presets
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewFolderModal(true)}
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Folders */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Folders</h3>
              </div>
              
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToHome}
                  className="p-1 h-auto text-blue-600 hover:text-blue-700"
                >
                  <Home className="w-4 h-4" />
                </Button>
                {getBreadcrumbItems().map((item, index) => (
                  <React.Fragment key={item.path}>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToFolder(item.path)}
                      className="p-1 h-auto text-blue-600 hover:text-blue-700"
                    >
                      {item.name}
                    </Button>
                  </React.Fragment>
                ))}
              </div>

              {/* Folder List */}
              <div className="space-y-2">
                {folderStructure.map((folder) => (
                  <div
                    key={folder.path}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigateToFolder(folder.path)}
                  >
                    <div className="flex items-center gap-2">
                      <FolderPlus className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {folder.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search video presets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
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
            <div className="flex-1 overflow-y-auto p-4">
              {presetsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading video presets...</p>
                  </div>
                </div>
              ) : sortedPresets.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No video presets found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Create your first video preset to get started
                    </p>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : 
                  "space-y-4"
                }>
                  {sortedPresets.map((preset) => (
                    <Card
                      key={preset.id}
                      className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => setDetailedPresetModal({ open: true, preset })}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Video Preview */}
                          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            {preset.videoUrl ? (
                              <video
                                src={preset.videoUrl}
                                className="w-full h-full object-cover"
                                preload="metadata"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Video className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                              <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            </div>
                          </div>

                          {/* Preset Info */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                              {preset.name}
                            </h4>
                            
                            {preset.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {preset.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{preset.createdDate}</span>
                              <div className="flex items-center gap-1">
                                {preset.favorite && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                                {preset.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {preset.rating}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Preset Details */}
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                {getModelDisplayName(preset.model)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {preset.resolution}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {preset.video_length}s
                              </Badge>
                            </div>

                            {/* Prompt Preview */}
                            {preset.prompt && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                "{preset.prompt.substring(0, 60)}..."
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
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
                          {getModelDisplayName(detailedPresetModal.preset.model)}
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
                        <Label className="text-sm font-medium text-muted-foreground">Quality</Label>
                        <Badge variant="outline" className="mt-1">
                          {getQualityDisplayName(detailedPresetModal.preset.quality)}
                        </Badge>
                      </div>
                    </div>

                    {detailedPresetModal.preset.seed && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Seed</Label>
                        <p className="text-sm">{detailedPresetModal.preset.seed}</p>
                      </div>
                    )}

                    {detailedPresetModal.preset.start_image_url && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Start Image</Label>
                        <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border">
                          <img
                            src={detailedPresetModal.preset.start_image_url}
                            alt="Start image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Advanced Settings
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">FPS:</span> {detailedPresetModal.preset.fps}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Motion Strength:</span> {detailedPresetModal.preset.motion_strength}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Camera Movement:</span> {detailedPresetModal.preset.camera_movement}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guidance:</span> {detailedPresetModal.preset.guidance}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mode:</span> {detailedPresetModal.preset.mode}
                    </div>
                    <div>
                      <span className="text-muted-foreground">LoRA:</span> {detailedPresetModal.preset.lora ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">No AI:</span> {detailedPresetModal.preset.no_ai ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Use Prompt Only:</span> {detailedPresetModal.preset.use_prompt_only ? 'Yes' : 'No'}
                    </div>
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
                    onClick={() => handlePresetDelete(detailedPresetModal.preset!)}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
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
      </div>
    </div>
  );
} 