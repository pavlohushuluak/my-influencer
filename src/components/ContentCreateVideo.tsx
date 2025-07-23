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
import { Video, Play, Settings, Sparkles, Loader2, Camera, Search, X, Filter, Plus, RotateCcw, Download, Trash2, Calendar, Share, Pencil, Edit3, BookOpen, Save, FolderOpen, Upload, Edit, AlertTriangle, Eye, User, Monitor, ZoomIn, SortAsc, SortDesc, Wand2, Image as ImageIcon } from 'lucide-react';
import HistoryCard from '@/components/HistoryCard';

interface ContentCreateVideoProps {
  influencerData?: any;
}

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
  { value: 'General', label: 'General' },
  { value: 'Anime', label: 'Anime' },
  { value: 'Realistic', label: 'Realistic' },
  { value: 'Artistic', label: 'Artistic' }
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

export default function ContentCreateVideo({ influencerData }: ContentCreateVideoProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const [activeTab, setActiveTab] = useState('scene');
  const [isGenerating, setIsGenerating] = useState(false);

  // Model data state to store influencer information
  const [modelData, setModelData] = useState<Influencer | null>(null);

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
    engine: 'General',
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
    if (!formData.model) {
      toast.error('Please select a model');
      return false;
    }
    if (formData.numberOfVideos < 1 || formData.numberOfVideos > 10) {
      toast.error('Number of videos must be between 1 and 10');
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      const useridResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
        headers: { 'Authorization': 'Bearer WeInfl3nc3withAI' }
      });
      const useridData = await useridResponse.json();

      const generationData = {
        task: "generatevideo",
        userid: useridData[0].userid,
        modelid: formData.model,
        prompt: formData.prompt,
        negative_prompt: formData.negative_prompt,
        format: formData.format,
        duration: parseInt(formData.duration),
        numberOfVideos: formData.numberOfVideos,
        guidance: formData.guidance,
        seed: formData.seed || Math.floor(Math.random() * 1000000),
        quality: formData.quality,
        engine: formData.engine,
        fps: formData.fps,
        motion_strength: formData.motion_strength,
        camera_movement: formData.camera_movement,
        transition_type: formData.transition_type,
        scene_specs: sceneSpecs,
        model_description: modelDescription,
        lora: formData.lora,
        lora_strength: formData.lora_strength
      };

      const response = await fetch('https://api.nymia.ai/v1/createtask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(generationData)
      });

      if (response.ok) {
        toast.success('Video generation started! Check your history for progress.');
        // Reset form after successful generation
        handleClear();
      } else {
        throw new Error('Failed to start video generation');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('Failed to generate video');
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
      engine: 'General',
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
    <div>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Create Content Video
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Generate stunning AI-powered videos with advanced customization
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowHistory(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                History
              </Button>
              <Button
                onClick={() => setShowPresetModal(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Presets
              </Button>
              <Button
                onClick={() => setShowLibraryModal(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Library
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-500" />
                  Video Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="scene">Scene</TabsTrigger>
                    <TabsTrigger value="model">Model</TabsTrigger>
                    <TabsTrigger value="motion">Motion</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scene" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Video Format</Label>
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
                        <Label>Duration</Label>
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
                    </div>

                    <div className="space-y-2">
                      <Label>Scene Description</Label>
                      <Textarea
                        placeholder="Describe the scene for your video..."
                        value={formData.scene}
                        onChange={(e) => handleInputChange('scene', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Prompt</Label>
                      <Textarea
                        placeholder="Enter your video generation prompt..."
                        value={formData.prompt}
                        onChange={(e) => handleInputChange('prompt', e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Scene Specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Framing</Label>
                        <Button
                          variant="outline"
                          onClick={() => setShowFramingSelector(true)}
                          className="w-full justify-start"
                        >
                          {sceneSpecs.framing || "Select framing"}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Pose</Label>
                        <Button
                          variant="outline"
                          onClick={() => setShowPoseSelector(true)}
                          className="w-full justify-start"
                        >
                          {sceneSpecs.pose || "Select pose"}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Lighting</Label>
                        <Button
                          variant="outline"
                          onClick={() => setShowLightingSelector(true)}
                          className="w-full justify-start"
                        >
                          {sceneSpecs.lighting_preset || "Select lighting"}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Scene Setting</Label>
                        <Button
                          variant="outline"
                          onClick={() => setShowSceneSettingsSelector(true)}
                          className="w-full justify-start"
                        >
                          {sceneSpecs.scene_setting || "Select setting"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="model" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Selected Influencer</Label>
                        {modelData ? (
                          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                              <img
                                src={modelData.image_url}
                                alt={`${modelData.name_first} ${modelData.name_last}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold">{modelData.name_first} {modelData.name_last}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300">{modelData.influencer_type}</p>
                              {modelData.lorastatus === 2 && (
                                <Badge variant="secondary" className="mt-1">
                                  <LoraStatusIndicator status={modelData.lorastatus} />
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500">No influencer selected</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Search Influencers</Label>
                        <div className="flex gap-2">
                          <Popover open={openFilter} onOpenChange={setOpenFilter}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <Search className="mr-2 h-4 w-4" />
                                {selectedSearchField.label}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandList>
                                  {SEARCH_FIELDS.map((field) => (
                                    <CommandItem
                                      key={field.id}
                                      onSelect={() => {
                                        setSelectedSearchField(field);
                                        setOpenFilter(false);
                                      }}
                                    >
                                      {field.label}
                                    </CommandItem>
                                  ))}
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Input
                          placeholder="Search influencers..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                        />
                      </div>

                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {filteredInfluencers.map((influencer) => (
                            <Card
                              key={influencer.id}
                              className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                                modelData?.id === influencer.id ? 'ring-2 ring-blue-500' : ''
                              }`}
                              onClick={() => handleUseInfluencer(influencer)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                                    <img
                                      src={influencer.image_url}
                                      alt={`${influencer.name_first} ${influencer.name_last}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {influencer.name_first} {influencer.name_last}
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                      {influencer.influencer_type}
                                    </p>
                                  </div>
                                  <LoraStatusIndicator status={influencer.lorastatus} />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="motion" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>FPS (Frames Per Second)</Label>
                        <Select value={formData.fps.toString()} onValueChange={(value) => handleInputChange('fps', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">24 FPS</SelectItem>
                            <SelectItem value="30">30 FPS</SelectItem>
                            <SelectItem value="60">60 FPS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Motion Strength</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[formData.motion_strength]}
                            onValueChange={(value) => handleInputChange('motion_strength', value[0])}
                            max={1}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                          <p className="text-xs text-slate-500">{formData.motion_strength}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Camera Movement</Label>
                        <Select value={formData.camera_movement} onValueChange={(value) => handleInputChange('camera_movement', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="static">Static</SelectItem>
                            <SelectItem value="pan_left">Pan Left</SelectItem>
                            <SelectItem value="pan_right">Pan Right</SelectItem>
                            <SelectItem value="zoom_in">Zoom In</SelectItem>
                            <SelectItem value="zoom_out">Zoom Out</SelectItem>
                            <SelectItem value="rotate">Rotate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Transition Type</Label>
                        <Select value={formData.transition_type} onValueChange={(value) => handleInputChange('transition_type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fade">Fade</SelectItem>
                            <SelectItem value="slide">Slide</SelectItem>
                            <SelectItem value="dissolve">Dissolve</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Number of Videos</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.numberOfVideos}
                          onChange={(e) => handleInputChange('numberOfVideos', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Quality</Label>
                        <Select value={formData.quality} onValueChange={(value) => handleInputChange('quality', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VIDEO_QUALITY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Engine</Label>
                        <Select value={formData.engine} onValueChange={(value) => handleInputChange('engine', value)}>
                          <SelectTrigger>
                            <SelectValue />
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

                      <div className="space-y-2">
                        <Label>LoRA Strength</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[formData.lora_strength]}
                            onValueChange={(value) => handleInputChange('lora_strength', value[0])}
                            max={2}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                          <p className="text-xs text-slate-500">{formData.lora_strength}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="lora"
                        checked={formData.lora}
                        onCheckedChange={(checked) => handleInputChange('lora', checked)}
                      />
                      <Label htmlFor="lora">Use LoRA Training</Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Negative Prompt</Label>
                      <Textarea
                        placeholder="Enter negative prompt..."
                        value={formData.negative_prompt}
                        onChange={(e) => handleInputChange('negative_prompt', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Guidance Scale</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="1"
                          max="20"
                          value={formData.guidance}
                          onChange={(e) => handleInputChange('guidance', parseFloat(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Seed</Label>
                        <Input
                          type="number"
                          value={formData.seed}
                          onChange={(e) => handleInputChange('seed', e.target.value)}
                          placeholder="Random"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>NSFW Strength</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[formData.nsfw_strength]}
                          onValueChange={(value) => handleInputChange('nsfw_strength', value[0])}
                          max={1}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-xs text-slate-500">{formData.nsfw_strength}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Actions */}
          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-500" />
                  Generate Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.prompt}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="w-full h-10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <p className="font-medium mb-2">For better results:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Use detailed scene descriptions</li>
                    <li>• Specify camera movements</li>
                    <li>• Include lighting details</li>
                    <li>• Mention desired mood/atmosphere</li>
                    <li>• Set appropriate motion strength</li>
                    <li>• Choose suitable FPS for your content</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        {showFramingSelector && (
          <OptionSelector
            options={framingOptions}
            onSelect={(label) => handleSceneSpecChange('framing', label)}
            onClose={() => setShowFramingSelector(false)}
            title="Select Framing"
          />
        )}

        {showClothesSelector && (
          <OptionSelector
            options={clothesOptions}
            onSelect={(label) => handleSceneSpecChange('clothes', label)}
            onClose={() => setShowClothesSelector(false)}
            title="Select Clothes"
          />
        )}

        {showRotationSelector && (
          <OptionSelector
            options={rotationOptions}
            onSelect={(label) => handleSceneSpecChange('rotation', label)}
            onClose={() => setShowRotationSelector(false)}
            title="Select Rotation"
          />
        )}

        {showLightingSelector && (
          <OptionSelector
            options={lightingOptions}
            onSelect={(label) => handleSceneSpecChange('lighting_preset', label)}
            onClose={() => setShowLightingSelector(false)}
            title="Select Lighting"
          />
        )}

        {showPoseSelector && (
          <OptionSelector
            options={poseOptions}
            onSelect={(label) => handleSceneSpecChange('pose', label)}
            onClose={() => setShowPoseSelector(false)}
            title="Select Pose"
          />
        )}

        {showSceneSettingsSelector && (
          <OptionSelector
            options={sceneSettingsOptions}
            onSelect={(label) => handleSceneSpecChange('scene_setting', label)}
            onClose={() => setShowSceneSettingsSelector(false)}
            title="Select Scene Setting"
          />
        )}

        {/* Modal placeholders - to be implemented */}
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
    </div>
  );
} 