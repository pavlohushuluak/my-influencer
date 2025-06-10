import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { updateInfluencer, setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { X, Plus, Save, Crown, Lock, Image, Settings, User, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

const JOB_AREAS = ['Creative', 'Corporate', 'Tech', 'Healthcare', 'Education', 'Entertainment'];
const SPEECH_STYLES = ['Friendly', 'Professional', 'Casual', 'Formal', 'Energetic', 'Calm'];
const HUMOR_STYLES = ['Witty', 'Sarcastic', 'Dry', 'Playful', 'Absurd'];

// Subscription level features
const SUBSCRIPTION_FEATURES = {
  free: {
    name: 'Free',
    price: '$0',
    features: [
      'Basic influencer information',
      'Limited appearance customization',
      'Basic style options'
    ]
  },
  professional: {
    name: 'Professional',
    price: '$19.99/month',
    features: [
      'All Free features',
      'Advanced appearance customization',
      'Detailed personality traits',
      'Style & environment options',
      'Content focus customization'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: '$49.99/month',
    features: [
      'All Professional features',
      'Unlimited customization',
      'Priority support',
      'Advanced analytics',
      'API access'
    ]
  }
};

// Feature restrictions by subscription level
const FEATURE_RESTRICTIONS = {
  free: [
    'cultural_background',
    'hair_color',
    'eye_color',
    'skin_tone',
    'color_palette',
    'clothing_style_occasional',
    'clothing_style_sexy_dress',
    'home_environment',
    'content_focus',
    'content_focus_areas',
    'job_vibe',
    'social_circle',
    'speech_style',
    'humor',
    'core_values',
    'current_goals',
    'background_elements'
  ],
  professional: [
    'content_focus_areas',
    'job_vibe',
    'social_circle',
    'background_elements'
  ],
  enterprise: []
};

interface Option {
  label: string;
  image: string;
}

const INFLUENCER_TYPES = ['Lifestyle', 'Educational'];

export default function InfluencerEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const displayedInfluencers = influencers;
  const [showAllInfluencers, setShowAllInfluencers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);

  const [showEditView, setShowEditView] = useState(!!location.state?.influencerData);
  const [subscriptionLevel, setSubscriptionLevel] = useState<'free' | 'professional' | 'enterprise'>('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);
  const [backgroundOptions, setBackgroundOptions] = useState<Option[]>([]);
  const [hairLengthOptions, setHairLengthOptions] = useState<Option[]>([]);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showHairLengthSelector, setShowHairLengthSelector] = useState(false);
  const [influencerData, setInfluencerData] = useState(location.state?.influencerData || {
    influencer_type: '',
    name_first: '',
    name_last: '',
    sex: '',
    age_lifestyle: '',
    origin_birth: '',
    origin_residence: '',
    cultural_background: '',
    hair_length: '',
    hair_color: '',
    hair_style: '',
    eye_color: '',
    lip_style: '',
    nose_style: '',
    face_shape: '',
    facial_features: '',
    skin_tone: '',
    body_type: '',
    color_palette: [],
    clothing_style_everyday: '',
    clothing_style_occasional: '',
    clothing_style_home: '',
    clothing_style_sports: '',
    clothing_style_sexy_dress: '',
    home_environment: '',
    content_focus: [],
    content_focus_areas: [],
    job_area: '',
    job_title: '',
    job_vibe: '',
    hobbies: [],
    social_circle: '',
    strengths: [],
    weaknesses: [],
    speech_style: [],
    humor: [],
    core_values: [],
    current_goals: [],
    background_elements: []
  });

  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const [eyeColorOptions, setEyeColorOptions] = useState<Option[]>([]);
  const [hairColorOptions, setHairColorOptions] = useState<Option[]>([]);
  const [hairStyleOptions, setHairStyleOptions] = useState<Option[]>([]);
  const [lipOptions, setLipOptions] = useState<Option[]>([]);
  const [noseOptions, setNoseOptions] = useState<Option[]>([]);
  const [eyebrowOptions, setEyebrowOptions] = useState<Option[]>([]);
  const [faceShapeOptions, setFaceShapeOptions] = useState<Option[]>([]);
  const [facialFeaturesOptions, setFacialFeaturesOptions] = useState<Option[]>([]);
  const [skinToneOptions, setSkinToneOptions] = useState<Option[]>([]);
  const [bodyTypeOptions, setBodyTypeOptions] = useState<Option[]>([]);
  const [makeupOptions, setMakeupOptions] = useState<Option[]>([]);
  const [colorPaletteOptions, setColorPaletteOptions] = useState<Option[]>([]);
  const [clothingEverydayOptions, setClothingEverydayOptions] = useState<Option[]>([]);
  const [clothingOccasionalOptions, setClothingOccasionalOptions] = useState<Option[]>([]);
  const [clothingHomewearOptions, setClothingHomewearOptions] = useState<Option[]>([]);
  const [clothingSportsOptions, setClothingSportsOptions] = useState<Option[]>([]);
  const [clothingSexyOptions, setClothingSexyOptions] = useState<Option[]>([]);
  const [homeEnvironmentOptions, setHomeEnvironmentOptions] = useState<Option[]>([]);

  // Add state for selectors
  const [showEyeColorSelector, setShowEyeColorSelector] = useState(false);
  const [showHairColorSelector, setShowHairColorSelector] = useState(false);
  const [showHairStyleSelector, setShowHairStyleSelector] = useState(false);
  const [showLipSelector, setShowLipSelector] = useState(false);
  const [showNoseSelector, setShowNoseSelector] = useState(false);
  const [showEyebrowSelector, setShowEyebrowSelector] = useState(false);
  const [showFaceShapeSelector, setShowFaceShapeSelector] = useState(false);
  const [showFacialFeaturesSelector, setShowFacialFeaturesSelector] = useState(false);
  const [showSkinToneSelector, setShowSkinToneSelector] = useState(false);
  const [showBodyTypeSelector, setShowBodyTypeSelector] = useState(false);
  const [showMakeupSelector, setShowMakeupSelector] = useState(false);
  const [showColorPaletteSelector, setShowColorPaletteSelector] = useState(false);
  const [showClothingEverydaySelector, setShowClothingEverydaySelector] = useState(false);
  const [showClothingOccasionalSelector, setShowClothingOccasionalSelector] = useState(false);
  const [showClothingHomewearSelector, setShowClothingHomewearSelector] = useState(false);
  const [showClothingSportsSelector, setShowClothingSportsSelector] = useState(false);
  const [showClothingSexySelector, setShowClothingSexySelector] = useState(false);
  const [showHomeEnvironmentSelector, setShowHomeEnvironmentSelector] = useState(false);

  const [showHairColorPicker, setShowHairColorPicker] = useState(false);
  const [showEyeColorPicker, setShowEyeColorPicker] = useState(false);
  const [showCulturalBackgroundSelector, setShowCulturalBackgroundSelector] = useState(false);
  const [culturalBackgroundOptions, setCulturalBackgroundOptions] = useState<Option[]>([]);

  const isFeatureLocked = (feature: string) => {
    return FEATURE_RESTRICTIONS[subscriptionLevel].includes(feature);
  };

  const handleInputChange = (field: string, value: string) => {
    if (isFeatureLocked(field)) {
      setLockedFeature(field);
      setShowUpgradeModal(true);
      return;
    }

    setInfluencerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: string, value: string[]) => {
    if (isFeatureLocked(field)) {
      setLockedFeature(field);
      setShowUpgradeModal(true);
      return;
    }

    setInfluencerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = (field: string) => {
    if (isFeatureLocked(field)) {
      setLockedFeature(field);
      setShowUpgradeModal(true);
      return;
    }

    if (newTag && !influencerData[field].includes(newTag)) {
      setInfluencerData(prev => ({
        ...prev,
        [field]: [...prev[field], newTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (field: string, tag: string) => {
    setInfluencerData(prev => ({
      ...prev,
      [field]: prev[field].filter(t => t !== tag)
    }));
  };

  const handleSave = () => {
    const updatedInfluencer = {
      ...influencerData,
      name: `${influencerData.name_first} ${influencerData.name_last}`,
      description: `${influencerData.influencer_type} Influencer`,
      personality: influencerData.speech_style.join(', '),
      updated_at: new Date().toISOString().split('T')[0],
      tags: influencerData.content_focus
    };

    dispatch(updateInfluencer(updatedInfluencer));
    navigate('/influencers');
  };

  const handleEditInfluencer = (id: string) => {
    const influencer = influencers.find(inf => inf.id === id);
    if (influencer) {
      setInfluencerData(influencer);
      setShowEditView(true);
    }
  };

  const handleCreateNew = () => {
    setInfluencerData({
      influencer_type: '',
      name_first: '',
      name_last: '',
      sex: '',
      age_lifestyle: '',
      origin_birth: '',
      origin_residence: '',
      cultural_background: '',
      hair_length: '',
      hair_color: '',
      hair_style: '',
      eye_color: '',
      lip_style: '',
      nose_style: '',
      face_shape: '',
      facial_features: '',
      skin_tone: '',
      body_type: '',
      color_palette: [],
      clothing_style_everyday: '',
      clothing_style_occasional: '',
      clothing_style_home: '',
      clothing_style_sports: '',
      clothing_style_sexy_dress: '',
      home_environment: '',
      content_focus: [],
      content_focus_areas: [],
      job_area: '',
      job_title: '',
      job_vibe: '',
      hobbies: [],
      social_circle: '',
      strengths: [],
      weaknesses: [],
      speech_style: [],
      humor: [],
      core_values: [],
      current_goals: [],
      background_elements: []
    });
    setShowEditView(true);
  };

  const handleUseTemplate = () => {
    navigate('/influencers/templates');
  };

  const handleUseInfluencer = (id: string) => {
    const influencer = influencers.find(inf => inf.id === id);
    if (influencer) {
      navigate('/content/create', {
        state: {
          influencerData: influencer,
          mode: 'create'
        }
      });
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      setIsOptionsLoading(true);
      try {
        // Fetch cultural background options first
        const backgroundResponse = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=background', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (backgroundResponse.ok) {
          const responseData = await backgroundResponse.json();
          console.log('Background response:', responseData); // Debug log
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setCulturalBackgroundOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image
            })));
          }
        }

        const endpoints = {
          hairlength: setHairLengthOptions,
          eyecolor: setEyeColorOptions,
          haircolor: setHairColorOptions,
          hairstyle: setHairStyleOptions,
          lips: setLipOptions,
          nose: setNoseOptions,
          eyebrow: setEyebrowOptions,
          faceshape: setFaceShapeOptions,
          facialfeatures: setFacialFeaturesOptions,
          skin: setSkinToneOptions,
          bodytype: setBodyTypeOptions,
          makeup: setMakeupOptions,
          colorpalette: setColorPaletteOptions,
          clothing_everyday: setClothingEverydayOptions,
          clothing_occasional: setClothingOccasionalOptions,
          clothing_homewear: setClothingHomewearOptions,
          clothing_sports: setClothingSportsOptions,
          clothing_sexy: setClothingSexyOptions,
          home_environment: setHomeEnvironmentOptions
        };

        const promises = Object.entries(endpoints).map(async ([fieldtype, setter]) => {
          const response = await fetch(`https://api.nymia.ai/v1/fieldoptions?fieldtype=${fieldtype}`, {
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI'
            }
          });
          if (response.ok) {
            const responseData = await response.json();
            if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
              setter(responseData.fieldoptions.map((item: any) => ({
                label: item.label,
                image: item.image
              })));
            }
          }
        });

        await Promise.all(promises);

      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setIsOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  console.log('Cultural background options:', culturalBackgroundOptions);
  useEffect(() => {
    const fetchInfluencers = async () => {
      setIsLoading(true);
      try {
        dispatch(setLoading(true));
        const response = await fetch('https://db.nymia.ai/rest/v1/virtual_influencer?select=*', {
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
        setIsLoading(false);
      }
    };

    fetchInfluencers();
  }, [dispatch]);

  const OptionSelector = ({ options, onSelect, onClose, title }: {
    options: Option[],
    onSelect: (label: string) => void,
    onClose: () => void,
    title: string
  }) => (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl overflow-scroll max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
          {options.map((option, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => {
                onSelect(option.label);
                onClose();
              }}
            >
              <CardContent className="p-4">
                <div className="relative w-full" style={{ paddingBottom: '125%' }}>
                  <img
                    src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                    alt={option.label}
                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                  />
                </div>
                <p className="text-sm text-center font-medium mt-2">{option.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-ai-purple-500" />
          <p className="text-muted-foreground">Loading influencers...</p>
        </div>
      </div>
    );
  }

  if (!showEditView) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Influencers
            </h1>
            <p className="text-muted-foreground">
              Manage your AI influencers and their content
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUseTemplate} variant="outline">
              <Image className="w-4 h-4 mr-2" />
              Use Template
            </Button>
            <Button onClick={handleCreateNew} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedInfluencers.map((influencer) => (
            <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                    <img
                      src={influencer.image}
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

                    <div className="flex flex-wrap gap-1 mb-4">
                      {influencer.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditInfluencer(influencer.id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Edit Influencer
          </h1>
          <p className="text-muted-foreground">
            Customize your influencer's appearance and personality
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEditView(false)} variant="outline">
            Back to List
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
            disabled={isOptionsLoading}
          >
            {isOptionsLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {isOptionsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-ai-purple-500" />
            <p className="text-muted-foreground">Loading options...</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="style">Style & Environment</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
          </TabsList>

          <ScrollArea>
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={influencerData.name_first}
                        onChange={(e) => handleInputChange('name_first', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={influencerData.name_last}
                        onChange={(e) => handleInputChange('name_last', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Influencer Type</Label>
                      <Select
                        value={influencerData.influencer_type}
                        onValueChange={(value) => handleInputChange('influencer_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {INFLUENCER_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sex</Label>
                      <Select
                        value={influencerData.sex}
                        onValueChange={(value) => handleInputChange('sex', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Woman">Woman</SelectItem>
                          <SelectItem value="Man">Man</SelectItem>
                          <SelectItem value="Non-binary">Non-binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age & Lifestyle</Label>
                      <Input
                        value={influencerData.age_lifestyle}
                        onChange={(e) => handleInputChange('age_lifestyle', e.target.value)}
                        placeholder="e.g., 25, Young Professional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cultural Background</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.cultural_background}
                          onValueChange={(value) => handleInputChange('cultural_background', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select cultural background" />
                          </SelectTrigger>
                          <SelectContent>
                            {culturalBackgroundOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowCulturalBackgroundSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Birth Origin</Label>
                      <Input
                        value={influencerData.origin_birth}
                        onChange={(e) => handleInputChange('origin_birth', e.target.value)}
                        placeholder="e.g., New York, USA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Residence</Label>
                      <Input
                        value={influencerData.origin_residence}
                        onChange={(e) => handleInputChange('origin_residence', e.target.value)}
                        placeholder="e.g., Los Angeles, USA"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Physical Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hair Length</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.hair_length}
                          onValueChange={(value) => handleInputChange('hair_length', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select hair length" />
                          </SelectTrigger>
                          <SelectContent>
                            {hairLengthOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowHairLengthSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Hair Color</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.hair_color}
                          onValueChange={(value) => handleInputChange('hair_color', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select hair color" />
                          </SelectTrigger>
                          <SelectContent>
                            {hairColorOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowHairColorPicker(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        {influencerData.hair_color && influencerData.hair_color.startsWith('#') && (
                          <div
                            className="w-8 h-8 rounded-full border"
                            style={{ backgroundColor: influencerData.hair_color }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hair Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.hair_style}
                          onValueChange={(value) => handleInputChange('hair_style', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select hair style" />
                          </SelectTrigger>
                          <SelectContent>
                            {hairStyleOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowHairStyleSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Eye Color</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.eye_color}
                          onValueChange={(value) => handleInputChange('eye_color', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select eye color" />
                          </SelectTrigger>
                          <SelectContent>
                            {eyeColorOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowEyeColorPicker(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        {influencerData.eye_color && influencerData.eye_color.startsWith('#') && (
                          <div
                            className="w-8 h-8 rounded-full border"
                            style={{ backgroundColor: influencerData.eye_color }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lip Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.lip_style}
                          onValueChange={(value) => handleInputChange('lip_style', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select lip style" />
                          </SelectTrigger>
                          <SelectContent>
                            {lipOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowLipSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nose Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.nose_style}
                          onValueChange={(value) => handleInputChange('nose_style', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select nose style" />
                          </SelectTrigger>
                          <SelectContent>
                            {noseOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowNoseSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Face Shape</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.face_shape}
                          onValueChange={(value) => handleInputChange('face_shape', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select face shape" />
                          </SelectTrigger>
                          <SelectContent>
                            {faceShapeOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowFaceShapeSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Facial Features</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.facial_features}
                          onValueChange={(value) => handleInputChange('facial_features', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select facial features" />
                          </SelectTrigger>
                          <SelectContent>
                            {facialFeaturesOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowFacialFeaturesSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Skin Tone</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.skin_tone}
                          onValueChange={(value) => handleInputChange('skin_tone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select skin tone" />
                          </SelectTrigger>
                          <SelectContent>
                            {skinToneOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowSkinToneSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Body Type</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.body_type}
                          onValueChange={(value) => handleInputChange('body_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select body type" />
                          </SelectTrigger>
                          <SelectContent>
                            {bodyTypeOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowBodyTypeSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Eyebrow Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.eyebrow_style}
                          onValueChange={(value) => handleInputChange('eyebrow_style', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select eyebrow style" />
                          </SelectTrigger>
                          <SelectContent>
                            {eyebrowOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowEyebrowSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Makeup Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.makeup_style}
                          onValueChange={(value) => handleInputChange('makeup_style', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select makeup style" />
                          </SelectTrigger>
                          <SelectContent>
                            {makeupOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowMakeupSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Style & Environment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Color Palette</Label>
                    <div className="flex gap-2">
                      <Select
                        value={newTag}
                        onValueChange={(value) => {
                          setNewTag(value);
                          handleAddTag('color_palette');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color palette" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorPaletteOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowColorPaletteSelector(true)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Everyday Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.clothing_style_everyday}
                          onValueChange={(value) => handleInputChange('clothing_style_everyday', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select everyday style" />
                          </SelectTrigger>
                          <SelectContent>
                            {clothingEverydayOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowClothingEverydaySelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Occasional Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.clothing_style_occasional}
                          onValueChange={(value) => handleInputChange('clothing_style_occasional', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select occasional style" />
                          </SelectTrigger>
                          <SelectContent>
                            {clothingOccasionalOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowClothingOccasionalSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Home Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.clothing_style_home}
                          onValueChange={(value) => handleInputChange('clothing_style_home', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select home style" />
                          </SelectTrigger>
                          <SelectContent>
                            {clothingHomewearOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowClothingHomewearSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label>Sports Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.clothing_style_sports}
                          onValueChange={(value) => handleInputChange('clothing_style_sports', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sports style" />
                          </SelectTrigger>
                          <SelectContent>
                            {clothingSportsOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowClothingSportsSelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sexy Dresses Style</Label>
                      <div className="flex gap-2">
                        <Select
                          value={influencerData.clothing_style_sexy_dress}
                          onValueChange={(value) => handleInputChange('clothing_style_sexy_dress', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sexy dresses style" />
                          </SelectTrigger>
                          <SelectContent>
                            {clothingSexyOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowClothingSexySelector(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Home Environment</Label>
                    <div className="flex gap-2">
                      <Select
                        value={influencerData.home_environment}
                        onValueChange={(value) => handleInputChange('home_environment', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select home environment" />
                        </SelectTrigger>
                        <SelectContent>
                          {homeEnvironmentOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowHomeEnvironmentSelector(true)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personality">
              <Card>
                <CardHeader>
                  <CardTitle>Personality & Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Content Focus</Label>
                    <div className="flex gap-2 flex-wrap">
                      {influencerData.content_focus.map((focus, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {focus}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveTag('content_focus', focus)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add content focus"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag('content_focus')}
                      />
                      <Button onClick={() => handleAddTag('content_focus')}>Add</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Area</Label>
                      <Select
                        value={influencerData.job_area}
                        onValueChange={(value) => handleInputChange('job_area', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select job area" />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_AREAS.map(area => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input
                        value={influencerData.job_title}
                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                        placeholder="Enter job title"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Speech Style</Label>
                    <div className="flex gap-2 flex-wrap">
                      {influencerData.speech_style.map((style, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {style}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveTag('speech_style', style)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={newTag}
                        onValueChange={(value) => {
                          setNewTag(value);
                          handleAddTag('speech_style');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select speech style" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPEECH_STYLES.map(style => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Humor Style</Label>
                    <div className="flex gap-2 flex-wrap">
                      {influencerData.humor.map((style, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {style}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveTag('humor', style)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={newTag}
                        onValueChange={(value) => {
                          setNewTag(value);
                          handleAddTag('humor');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select humor style" />
                        </SelectTrigger>
                        <SelectContent>
                          {HUMOR_STYLES.map(style => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Core Values</Label>
                    <div className="flex gap-2 flex-wrap">
                      {influencerData.core_values.map((value, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {value}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveTag('core_values', value)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add core value"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag('core_values')}
                      />
                      <Button onClick={() => handleAddTag('core_values')}>Add</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Goals</Label>
                    <div className="flex gap-2 flex-wrap">
                      {influencerData.current_goals.map((goal, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {goal}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveTag('current_goals', goal)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add current goal"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag('current_goals')}
                      />
                      <Button onClick={() => handleAddTag('current_goals')}>Add</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      )}

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              This feature requires a higher subscription level. Choose a plan that fits your needs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {Object.entries(SUBSCRIPTION_FEATURES).map(([level, plan]) => (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.price}</p>
                  </div>
                  <Button
                    variant={level === subscriptionLevel ? "outline" : "default"}
                    className={level === subscriptionLevel ? "" : "bg-gradient-to-r from-purple-600 to-blue-600"}
                    onClick={() => {
                      setSubscriptionLevel(level as 'free' | 'professional' | 'enterprise');
                      setShowUpgradeModal(false);
                    }}
                  >
                    {level === subscriptionLevel ? "Current Plan" : "Upgrade"}
                  </Button>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-purple-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {showBackgroundSelector && (
        <OptionSelector
          options={backgroundOptions}
          onSelect={(label) => handleInputChange('cultural_background', label)}
          onClose={() => setShowBackgroundSelector(false)}
          title="Select Cultural Background"
        />
      )}

      {showHairLengthSelector && (
        <OptionSelector
          options={hairLengthOptions}
          onSelect={(label) => handleInputChange('hair_length', label)}
          onClose={() => setShowHairLengthSelector(false)}
          title="Select Hair Length"
        />
      )}

      {showEyeColorSelector && (
        <OptionSelector
          options={eyeColorOptions}
          onSelect={(label) => handleInputChange('eye_color', label)}
          onClose={() => setShowEyeColorSelector(false)}
          title="Select Eye Color"
        />
      )}

      {showHairColorSelector && (
        <OptionSelector
          options={hairColorOptions}
          onSelect={(label) => handleInputChange('hair_color', label)}
          onClose={() => setShowHairColorSelector(false)}
          title="Select Hair Color"
        />
      )}

      {showHairStyleSelector && (
        <OptionSelector
          options={hairStyleOptions}
          onSelect={(label) => handleInputChange('hair_style', label)}
          onClose={() => setShowHairStyleSelector(false)}
          title="Select Hair Style"
        />
      )}

      {showLipSelector && (
        <OptionSelector
          options={lipOptions}
          onSelect={(label) => handleInputChange('lip_style', label)}
          onClose={() => setShowLipSelector(false)}
          title="Select Lip Style"
        />
      )}

      {showNoseSelector && (
        <OptionSelector
          options={noseOptions}
          onSelect={(label) => handleInputChange('nose_style', label)}
          onClose={() => setShowNoseSelector(false)}
          title="Select Nose Style"
        />
      )}

      {showFaceShapeSelector && (
        <OptionSelector
          options={faceShapeOptions}
          onSelect={(label) => handleInputChange('face_shape', label)}
          onClose={() => setShowFaceShapeSelector(false)}
          title="Select Face Shape"
        />
      )}

      {showSkinToneSelector && (
        <OptionSelector
          options={skinToneOptions}
          onSelect={(label) => handleInputChange('skin_tone', label)}
          onClose={() => setShowSkinToneSelector(false)}
          title="Select Skin Tone"
        />
      )}

      {showBodyTypeSelector && (
        <OptionSelector
          options={bodyTypeOptions}
          onSelect={(label) => handleInputChange('body_type', label)}
          onClose={() => setShowBodyTypeSelector(false)}
          title="Select Body Type"
        />
      )}

      {showColorPaletteSelector && (
        <OptionSelector
          options={colorPaletteOptions}
          onSelect={(label) => handleAddTag('color_palette')}
          onClose={() => setShowColorPaletteSelector(false)}
          title="Select Color Palette"
        />
      )}

      {showClothingEverydaySelector && (
        <OptionSelector
          options={clothingEverydayOptions}
          onSelect={(label) => handleInputChange('clothing_style_everyday', label)}
          onClose={() => setShowClothingEverydaySelector(false)}
          title="Select Everyday Style"
        />
      )}

      {showClothingOccasionalSelector && (
        <OptionSelector
          options={clothingOccasionalOptions}
          onSelect={(label) => handleInputChange('clothing_style_occasional', label)}
          onClose={() => setShowClothingOccasionalSelector(false)}
          title="Select Occasional Style"
        />
      )}

      {showClothingHomewearSelector && (
        <OptionSelector
          options={clothingHomewearOptions}
          onSelect={(label) => handleInputChange('clothing_style_home', label)}
          onClose={() => setShowClothingHomewearSelector(false)}
          title="Select Home Style"
        />
      )}

      {showClothingSportsSelector && (
        <OptionSelector
          options={clothingSportsOptions}
          onSelect={(label) => handleInputChange('clothing_style_sports', label)}
          onClose={() => setShowClothingSportsSelector(false)}
          title="Select Sports Style"
        />
      )}

      {showHomeEnvironmentSelector && (
        <OptionSelector
          options={homeEnvironmentOptions}
          onSelect={(label) => handleInputChange('home_environment', label)}
          onClose={() => setShowHomeEnvironmentSelector(false)}
          title="Select Home Environment"
        />
      )}

      {showClothingSexySelector && (
        <OptionSelector
          options={clothingSexyOptions}
          onSelect={(label) => handleInputChange('clothing_style_sexy_dress', label)}
          onClose={() => setShowClothingSexySelector(false)}
          title="Select Sexy Dresses Style"
        />
      )}

      {showFacialFeaturesSelector && (
        <OptionSelector
          options={facialFeaturesOptions}
          onSelect={(label) => handleInputChange('facial_features', label)}
          onClose={() => setShowFacialFeaturesSelector(false)}
          title="Select Facial Features"
        />
      )}

      <Dialog open={showHairColorPicker} onOpenChange={setShowHairColorPicker}>
        <DialogContent className="max-w-4xl overflow-scroll max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Hair Color</DialogTitle>
            <DialogDescription>
              Choose from predefined colors or create a custom color
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Predefined Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
                {hairColorOptions.map((option, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${influencerData.hair_color === option.label ? 'ring-2 ring-ai-purple-500' : ''
                      }`}
                    onClick={() => {
                      handleInputChange('hair_color', option.label);
                      setShowHairColorPicker(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="relative w-full" style={{ paddingBottom: '125%' }}>
                        <img
                          src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                          alt={option.label}
                          className="absolute inset-0 w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-4 mx-auto">
              <h3 className="font-medium">Custom Color</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <HexColorPicker
                      color={influencerData.hair_color?.startsWith('#') ? influencerData.hair_color : '#000000'}
                      onChange={(color) => handleInputChange('hair_color', color)}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border"
                          style={{ backgroundColor: influencerData.hair_color?.startsWith('#') ? influencerData.hair_color : '#000000' }}
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Selected Color</p>
                          <p className="text-sm font-mono text-muted-foreground">
                            {influencerData.hair_color?.startsWith('#') ? influencerData.hair_color : '#000000'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowHairColorPicker(false)}
                      >
                        Apply Color
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEyeColorPicker} onOpenChange={setShowEyeColorPicker}>
        <DialogContent className="max-w-4xl overflow-scroll max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Eye Color</DialogTitle>
            <DialogDescription>
              Choose from predefined colors or create a custom color
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Predefined Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
                {eyeColorOptions.map((option, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${influencerData.eye_color === option.label ? 'ring-2 ring-ai-purple-500' : ''
                      }`}
                    onClick={() => {
                      handleInputChange('eye_color', option.label);
                      setShowEyeColorPicker(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="relative w-full" style={{ paddingBottom: '125%' }}>
                        <img
                          src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                          alt={option.label}
                          className="absolute inset-0 w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-4 mx-auto">
              <h3 className="font-medium">Custom Color</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <HexColorPicker
                      color={influencerData.eye_color?.startsWith('#') ? influencerData.eye_color : '#000000'}
                      onChange={(color) => handleInputChange('eye_color', color)}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border"
                          style={{ backgroundColor: influencerData.eye_color?.startsWith('#') ? influencerData.eye_color : '#000000' }}
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Selected Color</p>
                          <p className="text-sm font-mono text-muted-foreground">
                            {influencerData.eye_color?.startsWith('#') ? influencerData.eye_color : '#000000'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowEyeColorPicker(false)}
                      >
                        Apply Color
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showCulturalBackgroundSelector && (
        <OptionSelector
          options={culturalBackgroundOptions}
          onSelect={(label) => handleInputChange('cultural_background', label)}
          onClose={() => setShowCulturalBackgroundSelector(false)}
          title="Select Cultural Background"
        />
      )}

      {showEyebrowSelector && (
        <OptionSelector
          options={eyebrowOptions}
          onSelect={(label) => handleInputChange('eyebrow_style', label)}
          onClose={() => setShowEyebrowSelector(false)}
          title="Select Eyebrow Style"
        />
      )}

      {showMakeupSelector && (
        <OptionSelector
          options={makeupOptions}
          onSelect={(label) => handleInputChange('makeup_style', label)}
          onClose={() => setShowMakeupSelector(false)}
          title="Select Makeup Style"
        />
      )}
    </div>
  );
}
