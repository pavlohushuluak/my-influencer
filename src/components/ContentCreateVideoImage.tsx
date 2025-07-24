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
import { Video, Play, Settings, Sparkles, Loader2, Camera, Search, X, Filter, Plus, RotateCcw, Download, Trash2, Calendar, Share, Pencil, Edit3, BookOpen, Save, FolderOpen, Upload, Edit, AlertTriangle, Eye, User, Monitor, ZoomIn, SortAsc, SortDesc, Wand2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
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
  { value: 'Kling 2.1', label: 'Kling 2.1' },
  { value: 'WAN 2.1', label: 'WAN 2.1' }
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
    engine: 'Kling 2.1',
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  // Fetch options from API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch framing options
        const framingResponse = await fetch('https://api.nymia.ai/v1/getoptions?type=framing', {
          headers: { 'Authorization': 'Bearer WeInfl3nc3withAI' }
        });
        if (framingResponse.ok) {
          const framingData = await framingResponse.json();
          setFramingOptions(framingData);
        }

        // Fetch clothes options
        const clothesResponse = await fetch('https://api.nymia.ai/v1/getoptions?type=clothes', {
          headers: { 'Authorization': 'Bearer WeInfl3nc3withAI' }
        });
        if (clothesResponse.ok) {
          const clothesData = await clothesResponse.json();
          setClothesOptions(clothesData);
        }

        // Fetch rotation options
        const rotationResponse = await fetch('https://api.nymia.ai/v1/getoptions?type=rotation', {
          headers: { 'Authorization': 'Bearer WeInfl3nc3withAI' }
        });
        if (rotationResponse.ok) {
          const rotationData = await rotationResponse.json();
          setRotationOptions(rotationData);
        }

        // Fetch lighting options
        const lightingResponse = await fetch('https://api.nymia.ai/v1/getoptions?type=lighting', {
          headers: { 'Authorization': 'Bearer WeInfl3nc3withAI' }
        });
        if (lightingResponse.ok) {
          const lightingData = await lightingResponse.json();
          setLightingOptions(lightingData);
        }

        // Fetch pose options
        const poseResponse = await fetch('https://api.nymia.ai/v1/getoptions?type=pose', {
          headers: { 'Authorization': 'Bearer WeInfl3nc3withAI' }
        });
        if (poseResponse.ok) {
          const poseData = await poseResponse.json();
          setPoseOptions(poseData);
        }

        // Fetch scene settings options
        const sceneSettingsResponse = await fetch('https://api.nymia.ai/v1/getoptions?type=scene_settings', {
          headers: { 'Authorization': 'Bearer WeInfl3nc3withAI' }
        });
        if (sceneSettingsResponse.ok) {
          const sceneSettingsData = await sceneSettingsResponse.json();
          setSceneSettingsOptions(sceneSettingsData);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  const validateForm = () => {
    if (!formData.prompt.trim()) {
      toast.error('Please enter a prompt');
      return false;
    }
    if (!modelData?.image_url) {
      toast.error('Please select a start image for the video');
      return false;
    }
    if (!formData.engine) {
      toast.error('Please select a video engine');
      return false;
    }
    if (!formData.duration || parseInt(formData.duration) < 1) {
      toast.error('Please select a valid video duration');
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      // Prepare the video generation payload
      const videoGenerationData = {
        user_uuid: userData.id,
        model: formData.engine === 'Kling 2.1' ? 'kwaivgi/kling-v2.1' : 'wan-v2.1',
        mode: "standard",
        prompt: formData.prompt,
        duration: parseInt(formData.duration),
        start_image: modelData?.image_url ? modelData.image_url.split('/').pop() || '' : '',
        start_image_url: modelData?.image_url || '',
        negative_prompt: formData.negative_prompt || '',
        status: "new"
      };

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
      engine: 'Kling 2.1',
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
              onClick={() => {/* handleSavePreset */}}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Preset
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-2">
          <Button
            onClick={handleGenerate}
            disabled={!validateForm() || isGenerating}
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
            onClick={() => {/* handleSavePreset */}}
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
                      <SelectItem value="Kling 2.1">Kling 2.1</SelectItem>
                      <SelectItem value="WAN 2.1">WAN 2.1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Video History</DialogTitle>
              <DialogDescription>
                Your video generation history will appear here.
              </DialogDescription>
            </DialogHeader>
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
    </div>
  );
}

export default ContentCreateVideoImage; 