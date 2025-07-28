import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Influencer } from '@/store/slices/influencersSlice';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { setUser } from '@/store/slices/userSlice';
import { toast } from 'sonner';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';
import { useDebounce } from '@/hooks/useDebounce';
import { DialogZoom, DialogContentZoom } from '@/components/ui/zoomdialog';
import VaultSelector from '@/components/VaultSelector';
import PresetsManager from '@/components/PresetsManager';
import LibraryManager from '@/components/LibraryManager';
import { Video, Play, Settings, Sparkles, Loader2, Camera, Search, X, Filter, Plus, RotateCcw, Download, Trash2, Calendar, Share, Pencil, Edit3, BookOpen, Save, FolderOpen, Upload, Edit, AlertTriangle, Eye, User, Monitor, ZoomIn, SortAsc, SortDesc, Wand2, Image as ImageIcon, ArrowLeft, Share2 } from 'lucide-react';
import HistoryCard from '@/components/HistoryCard';

const VIDEO_OPTIONS = [
  { value: 'generate_video', label: 'Generate Video', description: 'Generate a single video' },
  { value: 'generate_series', label: 'Generate Video Series', description: 'Generate multiple videos in a series' }
];

const SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'name', label: 'Name' },
  { id: 'age_lifestyle', label: 'Age/Lifestyle' },
  { id: 'influencer_type', label: 'Type' }
];

const VIDEO_FORMATS = [
  { value: '16:9', label: 'Landscape 16:9' },
  { value: '9:16', label: 'Portrait 9:16' },
  { value: '1:1', label: 'Square 1:1' },
  { value: '4:3', label: 'Classic 4:3' }
];

const VIDEO_DURATIONS = [
  { value: '5', label: '5 seconds' },
  { value: '10', label: '10 seconds' },
  { value: '15', label: '15 seconds' },
  { value: '30', label: '30 seconds' },
  { value: '60', label: '1 minute' }
];

const VIDEO_ENGINES = [
  { value: 'kling-v2.1', label: 'Kling 2.1' },
  { value: 'wan-v2.1', label: 'WAN 2.1' }
];

const KLING_MODES = [
  { value: 'standard', label: 'Standard (720p)' },
  { value: 'pro', label: 'Pro (1080p)' }
];

const VIDEO_QUALITY_OPTIONS = [
  { value: 'Quality', label: 'High Quality' },
  { value: 'Speed', label: 'Fast Generation' },
  { value: 'Balanced', label: 'Balanced' }
];

interface Option {
  label: string;
  image: string;
  description: string;
}

interface ContentCreateVideoImageProps {
  influencerData?: any;
  onBack?: () => void;
}

function ContentCreateVideoImage({ influencerData, onBack }: ContentCreateVideoImageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const [activeTab, setActiveTab] = useState('scene');
  const [isGenerating, setIsGenerating] = useState(false);

  // Model data state to store influencer or selected image information
  const [modelData, setModelData] = useState<any>(null);

  // Video selection state
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [selectedVideoForStart, setSelectedVideoForStart] = useState<any>(null);
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [videoSearchTerm, setVideoSearchTerm] = useState('');
  const [videoFilterStatus, setVideoFilterStatus] = useState<string>('all');
  const [videoSortBy, setVideoSortBy] = useState<string>('newest');

  // Search state for influencer selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState(SEARCH_FIELDS[0]);
  const [openFilter, setOpenFilter] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [showHistory, setShowHistory] = useState(false);

  // Generated videos state
  const [generatedVideos, setGeneratedVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<any>(null);

  // Preset and library states
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);

  // Options states
  const [framingOptions, setFramingOptions] = useState<Option[]>([]);
  const [showFramingSelector, setShowFramingSelector] = useState(false);
  const [clothesOptions, setClothesOptions] = useState<Option[]>([]);
  const [showClothesSelector, setShowClothesSelector] = useState(false);
  const [rotationOptions, setRotationOptions] = useState<Option[]>([]);
  const [showRotationSelector, setShowRotationSelector] = useState(false);
  const [lightingOptions, setLightingOptions] = useState<Option[]>([]);
  const [showLightingSelector, setShowLightingSelector] = useState(false);
  const [poseOptions, setPoseOptions] = useState<Option[]>([]);
  const [showPoseSelector, setShowPoseSelector] = useState(false);
  const [sceneSettingsOptions, setSceneSettingsOptions] = useState<Option[]>([]);
  const [showSceneSettingsSelector, setShowSceneSettingsSelector] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    model: '',
    scene: '',
    task: 'generate_video',
    lora: false,
    noAI: true,
    prompt: '',
    format: '16:9',
    duration: '10',
    numberOfVideos: 1,
    seed: '',
    guidance: 3.5,
    negative_prompt: '',
    nsfw_strength: 0,
    lora_strength: 1.0,
    quality: 'Quality',
    engine: 'kling-v2.1',
    mode: 'standard',
    usePromptOnly: false,
    regenerated_from: '',
    fps: 24,
    motion_strength: 0.8,
    camera_movement: 'static',
    transition_type: 'fade'
  });

  // Scene specifications
  const [sceneSpecs, setSceneSpecs] = useState({
    framing: '',
    rotation: '',
    lighting_preset: '',
    scene_setting: '',
    pose: '',
    clothes: ''
  });

  // Model description sections
  const [modelDescription, setModelDescription] = useState({
    appearance: '',
    culturalBackground: '',
    bodyType: '',
    facialFeatures: '',
    hairColor: '',
    hairLength: '',
    hairStyle: '',
    skin: '',
    lips: '',
    eyes: '',
    nose: '',
    makeup: 'Natural / No-Makeup Look',
    bust: '',
    clothing: '',
    sex: '',
    eyebrowStyle: '',
    faceShape: '',
    colorPalette: '',
    age: '',
    lifestyle: '',
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch videos from Supabase
  useEffect(() => {
    const fetchVideos = async () => {
      if (!userData.id) return;
      
      try {
        setLoadingVideos(true);
        const response = await fetch(`https://db.nymia.ai/rest/v1/video?user_uuid=eq.${userData.id}&status=eq.completed&order=task_created_at.desc`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched videos for selection:', data);
          setVideos(data);
        } else {
          throw new Error('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [userData.id]);

  // Filter videos for regular video history (lip_flag === false or undefined)
  const regularVideos = videos.filter(video => !video.lip_flag);

  useEffect(() => {
    if (influencerData) {
      // Save influencer data to modelData state
      setModelData(influencerData);

      // Auto-populate model description from influencer data
      setModelDescription({
        appearance: `${influencerData.name_first} ${influencerData.name_last}, ${influencerData.age_lifestyle || ''}`,
        culturalBackground: influencerData.cultural_background || '',
        bodyType: influencerData.body_type || '',
        facialFeatures: influencerData.facial_features || '',
        hairColor: influencerData.hair_color || '',
        hairLength: influencerData.hair_length || '',
        hairStyle: influencerData.hair_style || '',
        skin: influencerData.skin_tone || '',
        lips: influencerData.lip_style || '',
        eyes: influencerData.eye_color || '',
        nose: influencerData.nose_style || '',
        makeup: 'Natural / No-Makeup Look',
        clothing: `${influencerData.clothing_style_everyday || ''} ${influencerData.clothing_style_occasional || ''}`.trim(),
        sex: influencerData.sex || '',
        bust: influencerData.bust_size || '',
        eyebrowStyle: '',
        faceShape: influencerData.face_shape || '',
        colorPalette: influencerData.color_palette ? influencerData.color_palette.join(', ') : '',
        age: influencerData.age || '',
        lifestyle: influencerData.lifestyle || ''
      });

      // Set model in form data
      setFormData(prev => ({
        ...prev,
        model: influencerData.id
      }));
    }
  }, [influencerData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Reset mode when engine changes
      if (field === 'engine') {
        newData.mode = value === 'kling-v2.1' ? 'standard' : '';
      }

      return newData;
    });
  };

  const handleSceneSpecChange = (field: string, value: any) => {
    setSceneSpecs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModelDescriptionChange = (field: string, value: string) => {
    setModelDescription(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUseInfluencer = (influencer: Influencer) => {
    setModelData(influencer);
    setFormData(prev => ({
      ...prev,
      model: influencer.id
    }));
    setSearchTerm('');
    setOpenFilter(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  // Filtered influencers for search
  const filteredInfluencers = influencers.filter(influencer => {
    if (!debouncedSearchTerm) return true;

    const searchLower = debouncedSearchTerm.toLowerCase();

    switch (selectedSearchField.id) {
      case 'name':
        return `${influencer.name_first} ${influencer.name_last}`.toLowerCase().includes(searchLower);
      case 'age':
        return influencer.age.toLowerCase().includes(searchLower);
      case 'influencer_type':
        return influencer.influencer_type.toLowerCase().includes(searchLower);
      default:
        return (
          `${influencer.name_first} ${influencer.name_last}`.toLowerCase().includes(searchLower) ||
          influencer.age.toLowerCase().includes(searchLower) ||
          influencer.influencer_type.toLowerCase().includes(searchLower)
        );
    }
  });

  const OptionSelector = ({ options, onSelect, onClose, title }: {
    options: Option[],
    onSelect: (label: string) => void,
    onClose: () => void,
    title: string
  }) => {
    const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
      e.stopPropagation();
      // Handle image preview if needed
    };

    const handleSelect = (label: string) => {
      onSelect(label);
      onClose();
    };

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-500" />
              {title}
            </DialogTitle>
            <DialogDescription>
              Select an option to apply to your video generation
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {options.map((option, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-300 dark:hover:border-purple-600"
                onClick={() => handleSelect(option.label)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl overflow-hidden shadow-md">
                        <img
                          src={option.image}
                          alt={option.label}
                          className="w-full h-full object-cover"
                          onClick={(e) => handleImageClick(e, option.image)}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {option.label}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const isFormValid = () => {
    return (
      formData.prompt.trim() !== '' &&
      modelData?.image_url &&
      formData.engine &&
      (formData.engine !== 'kling-v2.1' || formData.mode) &&
      formData.duration &&
      parseInt(formData.duration) >= 1
    );
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.prompt.trim()) {
      errors.push('Please enter a prompt');
    }
    if (!modelData?.image_url) {
      errors.push('Please select a start image for the video');
    }
    if (!formData.engine) {
      errors.push('Please select a video engine');
    }
    if (formData.engine === 'kling-v2.1' && !formData.mode) {
      errors.push('Please select a mode for Kling 2.1');
    }
    if (!formData.duration || parseInt(formData.duration) < 1) {
      errors.push('Please select a valid video duration');
    }

    setValidationErrors(errors);

    if (errors.length > 0) {
      // Show the first error as a toast
      toast.error(errors[0]);
      return false;
    }

    // Clear validation errors if validation passes
    setValidationErrors([]);
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      // Prepare the video generation payload
      const videoGenerationData = {
        user_uuid: userData.id,
        model: formData.engine,
        mode: formData.mode,
        prompt: formData.prompt,
        duration: parseInt(formData.duration),
        start_image: modelData?.image_url ? modelData.image_url.split('/').pop() || '' : '',
        start_image_url: modelData?.image_url || '',
        negative_prompt: formData.negative_prompt || '',
        status: "new"
      };

      console.log(videoGenerationData);

      const response = await fetch('https://api.nymia.ai/v1/generatevideo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(videoGenerationData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Video generation started! Check your history for progress.');
        console.log('Video generation response:', result);
        // Reset form after successful generation
        handleClear();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start video generation');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setValidationErrors([]);
    setFormData({
      model: '',
      scene: '',
      task: 'generate_video',
      lora: false,
      noAI: true,
      prompt: '',
      format: '16:9',
      duration: '10',
      numberOfVideos: 1,
      seed: '',
      guidance: 3.5,
      negative_prompt: '',
      nsfw_strength: 0,
      lora_strength: 1.0,
      quality: 'Quality',
      engine: 'kling-v2.1',
      mode: 'standard',
      usePromptOnly: false,
      regenerated_from: '',
      fps: 24,
      motion_strength: 0.8,
      camera_movement: 'static',
      transition_type: 'fade'
    });
    setSceneSpecs({
      framing: '',
      rotation: '',
      lighting_preset: '',
      scene_setting: '',
      pose: '',
      clothes: ''
    });
    setModelDescription({
      appearance: '',
      culturalBackground: '',
      bodyType: '',
      facialFeatures: '',
      hairColor: '',
      hairLength: '',
      hairStyle: '',
      skin: '',
      lips: '',
      eyes: '',
      nose: '',
      makeup: 'Natural / No-Makeup Look',
      bust: '',
      clothing: '',
      sex: '',
      eyebrowStyle: '',
      faceShape: '',
      colorPalette: '',
      age: '',
      lifestyle: '',
    });
  };

  // Video helper functions
  const getVideoUrl = (videoId: string) => {
    return `https://images.nymia.ai/${userData.id}/video/${videoId}.mp4`;
  };

  const formatVideoDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatVideoDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVideoStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'processing': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'failed': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getVideoModelDisplayName = (model: string) => {
    switch (model) {
      case 'kling-v2.1': return 'Kling 2.1';
      case 'wan-v2.1': return 'WAN 2.1';
      default: return model;
    }
  };

  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => {
      const matchesStatus = videoFilterStatus === 'all' || video.status === videoFilterStatus;
      const matchesSearch = video.prompt.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
                           video.model.toLowerCase().includes(videoSearchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (videoSortBy) {
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

  const handleVideoSelect = (video: any) => {
    setSelectedVideoForStart(video);
    setShowVideoSelector(false);
    toast.success(`Selected video: ${video.prompt.substring(0, 50)}...`);
  };

  const handleVideoClick = (video: any) => {
    setSelectedVideoForModal(video);
    setShowVideoModal(true);
  };

  const handleDownload = (video: any) => {
    const videoUrl = getVideoUrl(video.video_id);
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `video-${video.video_id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleShare = (video: any) => {
    const videoUrl = getVideoUrl(video.video_id);
    navigator.clipboard.writeText(videoUrl);
    toast.success('Video URL copied to clipboard');
  };

  return (
    <div className="px-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Create Influencer Video
            </h1>
            <p className="text-muted-foreground">
              {modelData ? `Creating content for ${modelData.name_first} ${modelData.name_last}` : 'Generate new content'}
            </p>
          </div>
        </div>

        {/* Professional Preset and Library Buttons */}
        <div className="flex items-center gap-3">
          <div className="items-center gap-2 hidden xl:grid xl:grid-cols-2 2xl:grid-cols-4">
            <Button
              onClick={() => setShowLibraryModal(true)}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Library
            </Button>

            <Button
              onClick={() => setShowPresetModal(true)}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 text-amber-700 dark:text-amber-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Presets
            </Button>

            <Button
              onClick={() => {/* handleSavePreset */ }}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Preset
            </Button>
          </div>
        </div>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Please fix the following issues:
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-2">
          <Button
            onClick={handleGenerate}
            disabled={!isFormValid() || isGenerating}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="bg-gradient-to-r from-red-600 to-orange-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Form
          </Button>
        </div>
      </div>

      {/* Professional Preset and Library Buttons */}
      <div className="flex w-full items-center gap-3 xl:hidden">
        <div className="items-center gap-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
          <Button
            onClick={() => setShowLibraryModal(true)}
            variant="outline"
            className="h-10 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 text-blue-700 dark:text-blue-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Library
          </Button>

          <Button
            onClick={() => setShowPresetModal(true)}
            variant="outline"
            className="w-full h-10 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 text-amber-700 dark:text-amber-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            My Presets
          </Button>

          <Button
            onClick={() => {/* handleSavePreset */ }}
            variant="outline"
            className="h-10 px-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Preset
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 rounded-xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Format
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
            >
              <div className="flex items-center gap-1">
                {formData.format}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Videos
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
            >
              <div className="flex items-center gap-1">
                {formData.numberOfVideos}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Engine
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
            >
              <div className="flex items-center gap-1">
                {formData.engine}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Duration
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
            >
              <div className="flex items-center gap-1">
                {formData.duration}s
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Prompt and Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt Section */}
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500" />
                Video Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Describe what you want to see...
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want to see... (e.g., 'Model is sitting at the beach and enjoys the sun' or 'white shirt and blue jeans')"
                  value={formData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="negative-prompt" className="text-sm font-medium">
                  Negative Prompt
                </Label>
                <Textarea
                  id="negative-prompt"
                  placeholder="Describe what you want to see... (e.g., 'Model is sitting at the beach and enjoys the sun' or 'white shirt and blue jeans')"
                  value={formData.negative_prompt}
                  onChange={(e) => handleInputChange('negative_prompt', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Video Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Video Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Video Model</Label>
                  <Select value={formData.engine} onValueChange={(value) => handleInputChange('engine', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engine" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_ENGINES.map((engine) => (
                        <SelectItem key={engine.value} value={engine.value}>
                          {engine.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.engine === 'kling-v2.1' && (
                  <div className="space-y-2">
                    <Label>Kling Mode</Label>
                    <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {KLING_MODES.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Video Length</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_DURATIONS.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seed</Label>
                  <Select value={formData.seed || "General"} onValueChange={(value) => handleInputChange('seed', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Random">Random</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Influencer Image Selection */}
        <div className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-500" />
                Influencer Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Please select video start image</Label>
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  {modelData?.image_url ? (
                    <img
                      src={modelData.image_url}
                      alt={`${modelData.name_first} ${modelData.name_last}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No image selected</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowVaultModal(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Video Selection */}
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                Start from Existing Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Use an existing video as starting point</Label>
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  {selectedVideoForStart ? (
                    <div className="w-full h-full relative">
                      <video
                        src={getVideoUrl(selectedVideoForStart.video_id)}
                        className="w-full h-full object-cover rounded-lg"
                        muted
                        loop
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-2">
                          <Play className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Video className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No video selected</p>
                      <p className="text-xs text-slate-400">Optional: Start from existing video</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowVideoSelector(true)}
                  className="w-full"
                  variant="outline"
                  disabled={loadingVideos}
                >
                  {loadingVideos ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading videos...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Select Video ({videos.length})
                    </>
                  )}
                </Button>
                {selectedVideoForStart && (
                  <Button
                    onClick={() => setSelectedVideoForStart(null)}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Selection
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
            <CardContent className="space-y-4 pt-6">

              <Button
                onClick={() => setShowHistory(true)}
                variant="outline"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Show history
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showVaultModal && (
        <VaultSelector
          open={showVaultModal}
          onOpenChange={setShowVaultModal}
          onImageSelect={(image) => {
            // Convert GeneratedImageData to a format compatible with our modelData
            const selectedImage = {
              id: image.id,
              image_url: `https://images.nymia.ai/cdn-cgi/image/w=800/${image.file_path}`,
              name_first: image.user_filename || 'Selected',
              name_last: 'Image',
              influencer_type: 'Video Start Image',
              lorastatus: 0
            };
            setModelData(selectedImage);
            setShowVaultModal(false);
          }}
          title="Select Video Start Image"
          description="Choose an image to use as the starting point for your video"
        />
      )}

      {showHistory && (
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-6xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                Video Generation History
              </DialogTitle>
              <DialogDescription>
                Your video generation history. Showing {regularVideos.length} videos.
              </DialogDescription>
            </DialogHeader>

            {/* Search and Filter Controls */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search videos by prompt or model..."
                      value={videoSearchTerm}
                      onChange={(e) => setVideoSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={videoFilterStatus} onValueChange={setVideoFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Videos</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={videoSortBy} onValueChange={setVideoSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="model">Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Video Grid */}
            <ScrollArea className="h-[400px]">
              {loadingVideos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : regularVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularVideos
                    .filter(video => {
                      const matchesStatus = videoFilterStatus === 'all' || video.status === videoFilterStatus;
                      const matchesSearch = video.prompt.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
                        video.model.toLowerCase().includes(videoSearchTerm.toLowerCase());
                      return matchesStatus && matchesSearch;
                    })
                    .sort((a, b) => {
                      switch (videoSortBy) {
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
                    })
                    .map((video) => (
                      <Card
                        key={video.video_id}
                        className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        <CardContent className="p-3">
                          <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 relative overflow-hidden">
                            <video
                              src={getVideoUrl(video.video_id)}
                              className="w-full h-full object-cover"
                              muted
                              loop
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-2">
                                <Play className="w-6 h-6 text-blue-600" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {video.prompt.substring(0, 60)}...
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getVideoStatusColor(video.status)}`}
                              >
                                {video.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{getVideoModelDisplayName(video.model)}</span>
                              <span>{formatVideoDuration(video.duration)}</span>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              {formatVideoDate(video.task_created_at)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No videos found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {videoSearchTerm || videoFilterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first video to get started.'
                    }
                  </p>
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {regularVideos.filter(video => {
                  const matchesStatus = videoFilterStatus === 'all' || video.status === videoFilterStatus;
                  const matchesSearch = video.prompt.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
                    video.model.toLowerCase().includes(videoSearchTerm.toLowerCase());
                  return matchesStatus && matchesSearch;
                }).length} of {regularVideos.length} videos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showPresetModal && (
        <Dialog open={showPresetModal} onOpenChange={setShowPresetModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Video Presets</DialogTitle>
              <DialogDescription>
                Save and load video generation presets.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      {showLibraryModal && (
        <Dialog open={showLibraryModal} onOpenChange={setShowLibraryModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Video Library</DialogTitle>
              <DialogDescription>
                Browse your video library and templates.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Selector Modal */}
      {showVideoSelector && (
        <Dialog open={showVideoSelector} onOpenChange={setShowVideoSelector}>
          <DialogContent className="max-w-6xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                Select Video to Start From
              </DialogTitle>
              <DialogDescription>
                Choose an existing video to use as the starting point for your new video generation.
              </DialogDescription>
            </DialogHeader>

            {/* Search and Filter Controls */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search videos by prompt or model..."
                      value={videoSearchTerm}
                      onChange={(e) => setVideoSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={videoFilterStatus} onValueChange={setVideoFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Videos</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={videoSortBy} onValueChange={setVideoSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="model">Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Video Grid */}
            <ScrollArea className="h-[400px]">
              {loadingVideos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos.map((video) => (
                    <Card
                      key={video.video_id}
                      className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => handleVideoSelect(video)}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 relative overflow-hidden">
                          <video
                            src={getVideoUrl(video.video_id)}
                            className="w-full h-full object-cover"
                            muted
                            loop
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-2">
                              <Play className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {video.prompt.substring(0, 60)}...
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getVideoStatusColor(video.status)}`}
                            >
                              {video.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{getVideoModelDisplayName(video.model)}</span>
                            <span>{formatVideoDuration(video.duration)}</span>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {formatVideoDate(video.task_created_at)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No videos found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {videoSearchTerm || videoFilterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first video to get started.'
                    }
                  </p>
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {filteredVideos.length} of {videos.length} videos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowVideoSelector(false)}
                >
                  Cancel
                </Button>
                {selectedVideoForStart && (
                  <Button
                    onClick={() => setShowVideoSelector(false)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Use Selected Video
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Playback Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" />
              Video Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedVideoForModal && (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={getVideoUrl(selectedVideoForModal.video_id)}
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
                    <p className="text-sm mt-1">{selectedVideoForModal.prompt}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                      <p className="text-sm mt-1">{getVideoModelDisplayName(selectedVideoForModal.model)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Mode</Label>
                      <p className="text-sm mt-1">{selectedVideoForModal.mode || 'Standard'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                      <p className="text-sm mt-1">{formatVideoDuration(selectedVideoForModal.duration)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Resolution</Label>
                      <p className="text-sm mt-1">{selectedVideoForModal.resolution || 'HD'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-sm mt-1">{formatVideoDate(selectedVideoForModal.task_created_at)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getVideoStatusColor(selectedVideoForModal.status)} border`}>
                        {selectedVideoForModal.status}
                      </Badge>
                    </div>
                  </div>

                  {selectedVideoForModal.negative_prompt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Negative Prompt</Label>
                      <p className="text-sm mt-1">{selectedVideoForModal.negative_prompt}</p>
                    </div>
                  )}

                  {selectedVideoForModal.start_image && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Start Image</Label>
                      <p className="text-sm mt-1">{selectedVideoForModal.start_image}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleDownload(selectedVideoForModal)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => handleShare(selectedVideoForModal)}
                  variant="outline"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContentCreateVideoImage; 