import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Image, Video, SortAsc, SortDesc, ZoomIn, Folder, Plus, Upload, ChevronRight, Home, ArrowLeft, Pencil, Menu, X, File, User, RefreshCcw, Edit, BookOpen, Wand2, Eye, Monitor, Camera } from 'lucide-react';
import { toast } from 'sonner';

// Interface for preset data from API
interface PresetData {
  id: number;
  created_at: string;
  user_id: string;
  jsonjob: {
    lora: boolean;
    noAI: boolean;
    seed: number;
    task: string;
    model: any;
    scene: {
      pose: string;
      clothes: string;
      framing: string;
      rotation: string;
      scene_setting: string;
      lighting_preset: string;
    };
    engine: string;
    format: string;
    prompt: string;
    quality: string;
    guidance: number;
    lora_strength: number;
    nsfw_strength: number;
    usePromptOnly: boolean;
    negative_prompt: string;
    number_of_images: number;
  };
  name: string;
  image_name: string;
  route: string;
  // Computed properties added during transformation
  hasModel?: boolean;
  hasScene?: boolean;
  sceneCount?: number;
  createdDate?: string;
  createdTime?: string;
  imageUrl?: string | null;
}

export default function PresetsManager({ onClose }: { onClose: () => void }) {
  const userData = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [presets, setPresets] = useState<PresetData[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPreset, setSelectedPreset] = useState<PresetData | null>(null);
  const [detailedPresetModal, setDetailedPresetModal] = useState<{ open: boolean; preset: PresetData | null }>({ open: false, preset: null });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch presets
  const fetchPresets = async () => {
    if (!userData?.id) return;

    setPresetsLoading(true);
    try {
      console.log('🔍 Fetching presets for user:', userData.id);
      
      const response = await fetch(`https://db.nymia.ai/rest/v1/presets?user_id=eq.${userData.id}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const presetsData = await response.json();
        console.log('✅ Presets fetched successfully:', presetsData);
        
        // Transform the data to include additional computed fields
        const transformedPresets = presetsData.map((preset: PresetData) => ({
          ...preset,
          // Add computed fields for easier display
          hasModel: !!preset.jsonjob?.model,
          hasScene: !!preset.jsonjob?.scene,
          sceneCount: preset.jsonjob?.scene ? Object.keys(preset.jsonjob.scene).filter(key => preset.jsonjob.scene[key]).length : 0,
          createdDate: new Date(preset.created_at).toLocaleDateString(),
          createdTime: new Date(preset.created_at).toLocaleTimeString(),
          // Generate image URL if image_name exists
          imageUrl: preset.image_name ? `https://storage.nymia.ai/generated_images/${preset.image_name}` : null
        }));
        
        setPresets(transformedPresets);
        console.log('📊 Transformed presets:', transformedPresets);
      } else {
        console.error('❌ Failed to fetch presets:', response.status, response.statusText);
        toast.error('Failed to load presets');
      }
    } catch (error) {
      console.error('❌ Error fetching presets:', error);
      toast.error('Failed to load presets');
    } finally {
      setPresetsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPresets();
  }, [userData?.id]);

  // Filter presets based on search
  const filteredPresets = presets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sort presets
  const sortedPresets = [...filteredPresets].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return sortOrder === 'desc' 
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return sortOrder === 'desc' 
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Handle preset operations
  const handlePresetDelete = async (preset: PresetData) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/presets?id=eq.${preset.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (response.ok) {
        setPresets(prev => prev.filter(p => p.id !== preset.id));
        toast.success(`Deleted preset: ${preset.name}`);
      } else {
        throw new Error('Failed to delete preset');
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Failed to delete preset');
    }
  };

  // Apply preset
  const handleApplyPreset = (preset: PresetData) => {
    try {
      // Navigate to ContentCreate with preset data
      navigate('/content/create', { 
        state: { 
          presetData: preset.jsonjob,
          isPreset: true,
          presetName: preset.name
        } 
      });
      onClose();
      toast.success(`Applied preset: ${preset.name}`);
    } catch (error) {
      console.error('Error applying preset:', error);
      toast.error('Failed to apply preset');
    }
  };

  // View preset details
  const handleViewPresetDetails = (preset: PresetData) => {
    setDetailedPresetModal({ open: true, preset });
  };

  if (presetsLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              My Presets
            </h1>
            <p className="text-muted-foreground">
              Organize and manage your content generation presets
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading presets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-6">
        <div>
          <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            My Presets
          </h1>
          <p className="text-muted-foreground">
            Organize and manage your content generation presets
          </p>
        </div>
      </div>

      {/* Professional Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search presets by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsRefreshing(true);
            fetchPresets().finally(() => setIsRefreshing(false));
          }}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedPresets.map((preset) => (
          <Card 
            key={preset.id} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative"
          >
            <CardContent className="p-4">
              {/* Preset Image */}
              <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {preset.imageUrl ? (
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`${preset.imageUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
                  <Image className="w-12 h-12 text-muted-foreground" />
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyPreset(preset);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Wand2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPresetDetails(preset);
                    }}
                    className="bg-white/90 hover:bg-white text-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Preset Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1 truncate">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created {preset.createdDate} at {preset.createdTime}
                  </p>
                </div>

                {/* Preset Details */}
                <div className="space-y-2">
                  {preset.hasModel && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">
                        {preset.jsonjob.model?.name_first} {preset.jsonjob.model?.name_last}
                      </span>
                    </div>
                  )}
                  
                  {preset.sceneCount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Camera className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">
                        {preset.sceneCount} scene settings
                      </span>
                    </div>
                  )}

                  {preset.jsonjob?.format && (
                    <div className="flex items-center gap-2 text-sm">
                      <Monitor className="w-4 h-4 text-purple-500" />
                      <span className="text-muted-foreground">
                        {preset.jsonjob.format}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyPreset(preset);
                    }}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    Apply
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPresetDetails(preset);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePresetDelete(preset);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedPresets.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Presets Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first preset to get started'}
          </p>
          {searchTerm ? (
            <Button
              onClick={() => setSearchTerm('')}
              variant="outline"
            >
              Clear Search
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Preset
            </Button>
          )}
        </div>
      )}

      {/* Detailed Preset Modal */}
      <Dialog open={detailedPresetModal.open} onOpenChange={(open) => setDetailedPresetModal({ open, preset: null })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {detailedPresetModal.preset && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  {detailedPresetModal.preset.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(detailedPresetModal.preset.created_at).toLocaleDateString()}
                </p>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preset Image */}
                {detailedPresetModal.preset.imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={detailedPresetModal.preset.imageUrl}
                      alt={detailedPresetModal.preset.name}
                      className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {/* Preset Details */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="font-semibold">Name:</span>
                        <span>{detailedPresetModal.preset.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Format:</span>
                        <span>{detailedPresetModal.preset.jsonjob.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Quality:</span>
                        <span>{detailedPresetModal.preset.jsonjob.quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Guidance:</span>
                        <span>{detailedPresetModal.preset.jsonjob.guidance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Seed:</span>
                        <span>{detailedPresetModal.preset.jsonjob.seed}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Model Information */}
                  {detailedPresetModal.preset.jsonjob.model && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="font-semibold">Name:</span>
                          <span>{detailedPresetModal.preset.jsonjob.model.name_first} {detailedPresetModal.preset.jsonjob.model.name_last}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Age:</span>
                          <span>{detailedPresetModal.preset.jsonjob.model.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">Type:</span>
                          <span>{detailedPresetModal.preset.jsonjob.model.influencer_type}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Scene Settings */}
                  {detailedPresetModal.preset.jsonjob.scene && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        {Object.entries(detailedPresetModal.preset.jsonjob.scene).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex justify-between">
                              <span className="font-semibold capitalize">{key.replace('_', ' ')}:</span>
                              <span>{value}</span>
                            </div>
                          )
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => handleApplyPreset(detailedPresetModal.preset!)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Apply Preset
                </Button>
                <Button
                  onClick={() => handlePresetDelete(detailedPresetModal.preset!)}
                  variant="outline"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 