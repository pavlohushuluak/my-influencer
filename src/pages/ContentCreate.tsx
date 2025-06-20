import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Wand2, Settings, Image as ImageIcon, Sparkles, Loader2, Play, Eye, Palette, Camera, Zap, Search, X, Filter, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Influencer } from '@/store/slices/influencersSlice';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';

const TASK_OPTIONS = [
  { value: 'create', label: 'Create', description: 'Generate new content from scratch' },
  { value: 'analyze', label: 'Analyze', description: 'Analyze existing content for optimization' },
  { value: 'optimize', label: 'Optimize', description: 'Improve and enhance existing content' }
];

const FORMAT_OPTIONS = [
  { value: 'square', label: 'Square (1:1)', description: 'Perfect for Instagram posts' },
  { value: 'portrait', label: 'Portrait (3:4)', description: 'Great for stories and mobile' },
  { value: 'landscape', label: 'Landscape (16:9)', description: 'Ideal for desktop and videos' },
  { value: 'ultrawide', label: 'Ultrawide (21:9)', description: 'Cinematic and dramatic' }
];

const FRAMING_VARIANTS = [
  'Close-up', 'Medium shot', 'Full body', 'Wide shot', 'Extreme close-up',
  'Head and shoulders', 'Three-quarter shot', 'Low angle', 'High angle', 'Dutch angle'
];

const ROTATION_OPTIONS = [
  'Front view', 'Side view', 'Back view', 'Three-quarter view',
  'Profile left', 'Profile right', 'Over-the-shoulder', 'Bird\'s eye', 'Worm\'s eye'
];

const LIGHTING_SITUATIONS = [
  'Natural daylight', 'Golden hour', 'Blue hour', 'Studio lighting',
  'Soft lighting', 'Dramatic lighting', 'Rim lighting', 'Backlighting',
  'Low key', 'High key', 'Split lighting', 'Butterfly lighting'
];

const SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'name', label: 'Name' },
  { id: 'age_lifestyle', label: 'Age/Lifestyle' },
  { id: 'influencer_type', label: 'Type' }
];

export default function ContentCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const [activeTab, setActiveTab] = useState('basic');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get influencer data from navigation state
  const influencerData = location.state?.influencerData;

  // Search state for influencer selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState(SEARCH_FIELDS[0]);
  const [openFilter, setOpenFilter] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Form state
  const [formData, setFormData] = useState({
    model: '',
    scene: '',
    task: 'create',
    lora: false,
    noAI: false,
    prompt: '',
    format: 'square',
    numberOfImages: 1,
    seed: '',
    guidance: 3.5
  });

  // Scene specifications
  const [sceneSpecs, setSceneSpecs] = useState({
    framing: '',
    rotation: '',
    lighting: '',
    nsfw: false,
    additionalText: ''
  });

  // Model description sections
  const [modelDescription, setModelDescription] = useState({
    appearance: '',
    ethnicBackground: '',
    bodyType: '',
    facialFeatures: '',
    hairColor: '',
    hairLength: '',
    hairStyle: '',
    skin: '',
    lips: '',
    eyes: '',
    nose: '',
    makeup: '',
    clothing: ''
  });

  // Filtered influencers for search
  const filteredInfluencers = influencers.filter(influencer => {
    if (!debouncedSearchTerm) return true;

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    switch (selectedSearchField.id) {
      case 'name':
        return `${influencer.name_first} ${influencer.name_last}`.toLowerCase().includes(searchLower);
      case 'age_lifestyle':
        return influencer.age_lifestyle.toLowerCase().includes(searchLower);
      case 'influencer_type':
        return influencer.influencer_type.toLowerCase().includes(searchLower);
      default:
        return (
          `${influencer.name_first} ${influencer.name_last}`.toLowerCase().includes(searchLower) ||
          influencer.age_lifestyle.toLowerCase().includes(searchLower) ||
          influencer.influencer_type.toLowerCase().includes(searchLower)
        );
    }
  });

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch(`https://db.nymia.ai/rest/v1/influencer?user_id=eq.${userData.id}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch influencers');
        }

        const data = await response.json();
        dispatch(setInfluencers(data));
      } catch (error) {
        dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchInfluencers();
  }, [userData.id, dispatch]);

  useEffect(() => {
    if (influencerData) {
      // Auto-populate model description from influencer data
      setModelDescription({
        appearance: `${influencerData.name_first} ${influencerData.name_last}, ${influencerData.age_lifestyle || ''}`,
        ethnicBackground: influencerData.cultural_background || '',
        bodyType: influencerData.body_type || '',
        facialFeatures: influencerData.facial_features || '',
        hairColor: influencerData.hair_color || '',
        hairLength: influencerData.hair_length || '',
        hairStyle: influencerData.hair_style || '',
        skin: influencerData.skin_tone || '',
        lips: influencerData.lip_style || '',
        eyes: influencerData.eye_color || '',
        nose: influencerData.nose_style || '',
        makeup: '',
        clothing: `${influencerData.clothing_style_everyday || ''} ${influencerData.clothing_style_occasional || ''}`.trim()
      });
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
    // Populate model description from selected influencer
    setModelDescription({
      appearance: `${influencer.name_first} ${influencer.name_last}, ${influencer.age_lifestyle || ''}`,
      ethnicBackground: influencer.cultural_background || '',
      bodyType: influencer.body_type || '',
      facialFeatures: influencer.facial_features || '',
      hairColor: influencer.hair_color || '',
      hairLength: influencer.hair_length || '',
      hairStyle: influencer.hair_style || '',
      skin: influencer.skin_tone || '',
      lips: influencer.lip_style || '',
      eyes: influencer.eye_color || '',
      nose: influencer.nose_style || '',
      makeup: '',
      clothing: `${influencer.clothing_style_everyday || ''} ${influencer.clothing_style_occasional || ''}`.trim()
    });

    // Generate the model description automatically
    const parts = [];
    
    if (influencer.name_first && influencer.name_last) {
      parts.push(`${influencer.name_first} ${influencer.name_last}`);
    }
    if (influencer.age_lifestyle) parts.push(influencer.age_lifestyle);
    if (influencer.cultural_background) parts.push(`Ethnic background: ${influencer.cultural_background}`);
    if (influencer.body_type) parts.push(`Body type: ${influencer.body_type}`);
    if (influencer.facial_features) parts.push(`Facial features: ${influencer.facial_features}`);
    if (influencer.hair_color && influencer.hair_length && influencer.hair_style) {
      parts.push(`${influencer.hair_length} ${influencer.hair_color} hair, ${influencer.hair_style} style`);
    }
    if (influencer.skin_tone) parts.push(`Skin: ${influencer.skin_tone}`);
    if (influencer.lip_style) parts.push(`Lips: ${influencer.lip_style}`);
    if (influencer.eye_color) parts.push(`Eyes: ${influencer.eye_color}`);
    if (influencer.nose_style) parts.push(`Nose: ${influencer.nose_style}`);
    if (influencer.clothing_style_everyday || influencer.clothing_style_occasional) {
      parts.push(`Clothing: ${influencer.clothing_style_everyday || ''} ${influencer.clothing_style_occasional || ''}`.trim());
    }

    const fullDescription = parts.join(', ');
    setFormData(prev => ({
      ...prev,
      model: fullDescription
    }));

    toast.success(`Using ${influencer.name_first} ${influencer.name_last} for content generation`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  const generateModelDescription = () => {
    const parts = [];

    if (modelDescription.appearance) parts.push(modelDescription.appearance);
    if (modelDescription.ethnicBackground) parts.push(`Ethnic background: ${modelDescription.ethnicBackground}`);
    if (modelDescription.bodyType) parts.push(`Body type: ${modelDescription.bodyType}`);
    if (modelDescription.facialFeatures) parts.push(`Facial features: ${modelDescription.facialFeatures}`);
    if (modelDescription.hairColor && modelDescription.hairLength && modelDescription.hairStyle) {
      parts.push(`${modelDescription.hairLength} ${modelDescription.hairColor} hair, ${modelDescription.hairStyle} style`);
    }
    if (modelDescription.skin) parts.push(`Skin: ${modelDescription.skin}`);
    if (modelDescription.lips) parts.push(`Lips: ${modelDescription.lips}`);
    if (modelDescription.eyes) parts.push(`Eyes: ${modelDescription.eyes}`);
    if (modelDescription.nose) parts.push(`Nose: ${modelDescription.nose}`);
    if (modelDescription.makeup) parts.push(`Makeup: ${modelDescription.makeup}`);
    if (modelDescription.clothing) parts.push(`Clothing: ${modelDescription.clothing}`);

    const fullDescription = parts.join(', ');
    setFormData(prev => ({
      ...prev,
      model: fullDescription
    }));

    toast.success('Model description generated successfully');
  };

  const generateSceneDescription = () => {
    const parts = [];

    if (sceneSpecs.framing) parts.push(`Framing: ${sceneSpecs.framing}`);
    if (sceneSpecs.rotation) parts.push(`Rotation: ${sceneSpecs.rotation}`);
    if (sceneSpecs.lighting) parts.push(`Lighting: ${sceneSpecs.lighting}`);
    if (sceneSpecs.nsfw) parts.push('NSFW content');
    if (sceneSpecs.additionalText) parts.push(sceneSpecs.additionalText);

    const fullDescription = parts.join(', ');
    setFormData(prev => ({
      ...prev,
      scene: fullDescription
    }));

    toast.success('Scene description generated successfully');
  };

  const generatePrompt = () => {
    let prompt = '';

    if (formData.lora) {
      prompt += 'AIMod3l ';
    }

    if (formData.model) {
      prompt += `${formData.model}, `;
    }

    if (formData.scene) {
      prompt += `${formData.scene}, `;
    }

    if (formData.prompt) {
      prompt += formData.prompt;
    }

    // Clean up the prompt
    prompt = prompt.replace(/,\s*$/, '').trim();

    setFormData(prev => ({
      ...prev,
      prompt: prompt
    }));

    toast.success('Prompt generated successfully');
  };

  const handleGenerate = async () => {
    if (!formData.model && !formData.prompt) {
      toast.error('Please provide either a model description or a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Content generation started successfully');

      // Here you would make the actual API call to your content generation service
      console.log('Generation request:', {
        ...formData,
        sceneSpecs,
        modelDescription
      });

    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to start content generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const validateForm = () => {
    if (!formData.model && !formData.prompt) {
      return false;
    }
    if (formData.numberOfImages < 1 || formData.numberOfImages > 20) {
      return false;
    }
    if (formData.guidance < 1.0 || formData.guidance > 8.0) {
      return false;
    }
    return true;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Create Content
            </h1>
            <p className="text-muted-foreground">
              {influencerData ? `Creating content for ${influencerData.name_first} ${influencerData.name_last}` : 'Generate new content'}
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!validateForm() || isGenerating}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
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
              Generate Content
            </>
          )}
        </Button>
      </div>

      {/* Generation Summary - Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Influencer Info */}
        {influencerData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Influencer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                <img
                  src={influencerData.image_url}
                  alt={`${influencerData.name_first} ${influencerData.name_last}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {influencerData.name_first} {influencerData.name_last}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {influencerData.age_lifestyle} • {influencerData.influencer_type}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generation Summary */}
        <Card className={influencerData ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Eye className="w-5 h-5 text-white" />
              </div>
              Generation Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Review your content generation settings and specifications
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Settings Overview */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wide">
                Configuration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Task Type
                  </span>
                  <Badge variant="secondary" className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {TASK_OPTIONS.find(opt => opt.value === formData.task)?.label}
                  </Badge>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Format
                  </span>
                  <Badge variant="secondary" className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {FORMAT_OPTIONS.find(opt => opt.value === formData.format)?.label}
                  </Badge>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Images
                  </span>
                  <Badge variant="secondary" className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {formData.numberOfImages}
                  </Badge>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Guidance
                  </span>
                  <Badge variant="secondary" className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {formData.guidance}
                  </Badge>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    LORA Model
                  </span>
                  <Badge variant={formData.lora ? "default" : "secondary"} className={`w-fit ${formData.lora ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {formData.lora ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    No AI Filter
                  </span>
                  <Badge variant={formData.noAI ? "default" : "secondary"} className={`w-fit ${formData.noAI ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {formData.noAI ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content Descriptions */}
            {(formData.model || formData.scene || formData.prompt) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Content Specifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.model && (
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Model Description
                        </Label>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {formData.model}
                      </p>
                    </div>
                  )}

                  {formData.scene && (
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                          <Camera className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        </div>
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Scene Description
                        </Label>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {formData.scene}
                      </p>
                    </div>
                  )}

                  {formData.prompt && (
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Custom Prompt
                        </Label>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {formData.prompt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs - Bottom Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="scene">Scene</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basic Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select
                    value={formData.task}
                    onValueChange={(value) => handleInputChange('task', value)}
                  >
                    <SelectTrigger>
                      <div className='pl-10'>
                        {TASK_OPTIONS.find(opt => opt.value === formData.task)?.label}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => handleInputChange('format', value)}
                  >
                    <SelectTrigger>
                      <div className='pl-10'>
                        {FORMAT_OPTIONS.find(opt => opt.value === formData.format)?.label}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Images: {formData.numberOfImages}</Label>
                  <Slider
                    value={[formData.numberOfImages]}
                    onValueChange={([value]) => handleInputChange('numberOfImages', value)}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Guidance: {formData.guidance}</Label>
                  <Slider
                    value={[formData.guidance]}
                    onValueChange={([value]) => handleInputChange('guidance', value)}
                    max={8.0}
                    min={1.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>LORA Model</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable LORA model (adds "AIMod3l" trigger)
                    </p>
                  </div>
                  <Switch
                    checked={formData.lora}
                    onCheckedChange={(checked) => handleInputChange('lora', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>No AI Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Pass user input unfiltered (no AI processing)
                    </p>
                  </div>
                  <Switch
                    checked={formData.noAI}
                    onCheckedChange={(checked) => handleInputChange('noAI', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Seed (Optional)</Label>
                <Input
                  value={formData.seed}
                  onChange={(e) => handleInputChange('seed', e.target.value)}
                  placeholder="Enter seed value for reproducible results"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Tab */}
        <TabsContent value="model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                Model Description
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {formData.model ? 'Selected influencer model configuration' : 'Select an influencer to use for content generation'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Show Influencer Selection or Manual Configuration */}
              {!formData.model ? (
                // Show only influencer selection when no model is selected
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Select Influencer</h3>
                    <Badge variant="secondary" className="text-xs">
                      {filteredInfluencers.length} available
                    </Badge>
                  </div>

                  {/* Search Section */}
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Search influencers..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={handleSearchClear}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <Popover open={openFilter} onOpenChange={setOpenFilter}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Filter className="h-4 w-4" />
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

                  {/* Influencers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredInfluencers.map((influencer) => (
                      <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                              <img
                                src={influencer.image_url}
                                alt={`${influencer.name_first} ${influencer.name_last}`}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                                  {influencer.name_first} {influencer.name_last}
                                </h3>
                              </div>

                              <div className="flex flex-col gap-1 mb-3">
                                <div className="flex text-sm text-muted-foreground flex-col">
                                  <span className="font-medium mr-2">Age/Lifestyle:</span>
                                  {influencer.age_lifestyle}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <span className="font-medium mr-2">Type:</span>
                                  {influencer.influencer_type}
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUseInfluencer(influencer)}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Use
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                // Show manual configuration when model is selected
                <div className="space-y-6">

                  {/* Select Another Influencer Button */}
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, model: '' }));
                        setModelDescription({
                          appearance: '',
                          ethnicBackground: '',
                          bodyType: '',
                          facialFeatures: '',
                          hairColor: '',
                          hairLength: '',
                          hairStyle: '',
                          skin: '',
                          lips: '',
                          eyes: '',
                          nose: '',
                          makeup: '',
                          clothing: ''
                        });
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Select Another Influencer
                    </Button>
                  </div>

                  <Separator />

                  {/* Manual Model Description */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Manual Configuration</h3>
                      <Button
                        onClick={generateModelDescription}
                        variant="outline"
                        size="sm"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Description
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Appearance</Label>
                        <Input
                          value={modelDescription.appearance}
                          onChange={(e) => handleModelDescriptionChange('appearance', e.target.value)}
                          placeholder="General appearance description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Ethnic Background</Label>
                        <Input
                          value={modelDescription.ethnicBackground}
                          onChange={(e) => handleModelDescriptionChange('ethnicBackground', e.target.value)}
                          placeholder="Ethnic background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Body Type</Label>
                        <Input
                          value={modelDescription.bodyType}
                          onChange={(e) => handleModelDescriptionChange('bodyType', e.target.value)}
                          placeholder="Body type description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Facial Features</Label>
                        <Input
                          value={modelDescription.facialFeatures}
                          onChange={(e) => handleModelDescriptionChange('facialFeatures', e.target.value)}
                          placeholder="Distinctive facial features"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Hair Color</Label>
                        <Input
                          value={modelDescription.hairColor}
                          onChange={(e) => handleModelDescriptionChange('hairColor', e.target.value)}
                          placeholder="Hair color"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Hair Length</Label>
                        <Input
                          value={modelDescription.hairLength}
                          onChange={(e) => handleModelDescriptionChange('hairLength', e.target.value)}
                          placeholder="Hair length"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Hair Style</Label>
                        <Input
                          value={modelDescription.hairStyle}
                          onChange={(e) => handleModelDescriptionChange('hairStyle', e.target.value)}
                          placeholder="Hair style"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Skin</Label>
                        <Input
                          value={modelDescription.skin}
                          onChange={(e) => handleModelDescriptionChange('skin', e.target.value)}
                          placeholder="Skin description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Lips</Label>
                        <Input
                          value={modelDescription.lips}
                          onChange={(e) => handleModelDescriptionChange('lips', e.target.value)}
                          placeholder="Lip description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Eyes</Label>
                        <Input
                          value={modelDescription.eyes}
                          onChange={(e) => handleModelDescriptionChange('eyes', e.target.value)}
                          placeholder="Eye description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Nose</Label>
                        <Input
                          value={modelDescription.nose}
                          onChange={(e) => handleModelDescriptionChange('nose', e.target.value)}
                          placeholder="Nose description"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Makeup</Label>
                        <Input
                          value={modelDescription.makeup}
                          onChange={(e) => handleModelDescriptionChange('makeup', e.target.value)}
                          placeholder="Makeup style"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Clothing</Label>
                        <Input
                          value={modelDescription.clothing}
                          onChange={(e) => handleModelDescriptionChange('clothing', e.target.value)}
                          placeholder="Clothing description"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scene Tab */}
        <TabsContent value="scene" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Scene Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Framing Variant</Label>
                  <Select
                    value={sceneSpecs.framing}
                    onValueChange={(value) => handleSceneSpecChange('framing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select framing" />
                    </SelectTrigger>
                    <SelectContent>
                      {FRAMING_VARIANTS.map((variant) => (
                        <SelectItem key={variant} value={variant}>
                          {variant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rotation</Label>
                  <Select
                    value={sceneSpecs.rotation}
                    onValueChange={(value) => handleSceneSpecChange('rotation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rotation" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROTATION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lighting Situation</Label>
                  <Select
                    value={sceneSpecs.lighting}
                    onValueChange={(value) => handleSceneSpecChange('lighting', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lighting" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIGHTING_SITUATIONS.map((lighting) => (
                        <SelectItem key={lighting} value={lighting}>
                          {lighting}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Additional Text</Label>
                  <Input
                    value={sceneSpecs.additionalText}
                    onChange={(e) => handleSceneSpecChange('additionalText', e.target.value)}
                    placeholder="Additional scene details"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>NSFW Content</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark content as not safe for work
                  </p>
                </div>
                <Switch
                  checked={sceneSpecs.nsfw}
                  onCheckedChange={(checked) => handleSceneSpecChange('nsfw', checked)}
                />
              </div>

              <Button
                onClick={generateSceneDescription}
                variant="outline"
                className="w-full"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Scene Description
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Custom Prompt</Label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                  placeholder="Enter your custom prompt here..."
                  rows={6}
                />
              </div>

              <Button
                onClick={generatePrompt}
                variant="outline"
                className="w-full"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Custom Prompt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
