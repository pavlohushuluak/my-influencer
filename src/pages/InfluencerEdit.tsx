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
import { DialogZoom, DialogContentZoom, DialogHeaderZoom, DialogTitleZoom, DialogDescriptionZoom } from '@/components/ui/zoomdialog';
import { updateInfluencer, setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { X, Plus, Save, Crown, Lock, Image, Settings, User, ChevronRight, MoreHorizontal, Loader2, ZoomIn } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'sonner';

const JOB_AREAS = ['Creative', 'Corporate', 'Tech', 'Healthcare', 'Education', 'Entertainment'];
const SPEECH_STYLES = ['Friendly', 'Professional', 'Casual', 'Formal', 'Energetic', 'Calm'];
const HUMOR_STYLES = ['Witty', 'Sarcastic', 'Dry', 'Playful', 'Absurd'];

// Subscription level features
const SUBSCRIPTION_FEATURES = {
  starter: {
    name: 'Starter',
    price: '$19.95/month',
    features: [
      'Basic influencer information',
      'Limited appearance customization',
      'Basic style options'
    ]
  },
  professional: {
    name: 'Professional',
    price: '$49.95/month',
    features: [
      'All Starter features',
      'Advanced appearance customization',
      'Detailed personality traits',
      'Style & environment options',
      'Content focus customization'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: '$99.95/month',
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

  const [sexOptions, setSexOptions] = useState<Option[]>([]);
  const [contentFocusOptions, setContentFocusOptions] = useState<Option[]>([]);
  const [hobbyOptions, setHobbyOptions] = useState<Option[]>([]);
  const [personaOptions, setPersonaOptions] = useState<Option[]>([]);
  const [speechOptions, setSpeechOptions] = useState<Option[]>([]);
  const [strengthOptions, setStrengthOptions] = useState<Option[]>([]);
  const [weaknessOptions, setWeaknessOptions] = useState<Option[]>([]);

  // Add state for selectors
  const [showSexSelector, setShowSexSelector] = useState(false);
  const [showContentFocusSelector, setShowContentFocusSelector] = useState(false);
  const [showHobbySelector, setShowHobbySelector] = useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [showSpeechSelector, setShowSpeechSelector] = useState(false);
  const [showStrengthSelector, setShowStrengthSelector] = useState(false);
  const [showWeaknessSelector, setShowWeaknessSelector] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [humorOptions, setHumorOptions] = useState<Option[]>([]);
  const [goalsOptions, setGoalsOptions] = useState<Option[]>([]);
  const [coreValuesOptions, setCoreValuesOptions] = useState<Option[]>([]);

  // Add state for selectors
  const [showHumorSelector, setShowHumorSelector] = useState(false);
  const [showGoalsSelector, setShowGoalsSelector] = useState(false);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showJobAreaSelector, setShowJobAreaSelector] = useState(false);
  const [showCoreValuesSelector, setShowCoreValuesSelector] = useState(false);
  const [showContentFocusAreasSelector, setShowContentFocusAreasSelector] = useState(false);

  const [jobAreaOptions, setJobAreaOptions] = useState<Option[]>([]);
  const [contentFocusAreasOptions, setContentFocusAreasOptions] = useState<Option[]>([]);

  const isFeatureLocked = (feature: string) => {
    return FEATURE_RESTRICTIONS[subscriptionLevel].includes(feature);
  };

  const handleInputChange = (field: string, value: string) => {
    // if (isFeatureLocked(field)) {
    //   setLockedFeature(field);
    //   setShowUpgradeModal(true);
    //   return;
    // }

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

  const handleAddTag = (field: string, value: string) => {
    setInfluencerData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof influencerData] as string[] || []), value]
    }));
  };

  const handleRemoveTag = (field: string, tag: string) => {
    setInfluencerData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof influencerData] as string[]).filter(t => t !== tag)
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
          home_environment: setHomeEnvironmentOptions,
          // Add new endpoints
          sex: setSexOptions,
          cfocus: setContentFocusOptions,
          hobby: setHobbyOptions,
          persona: setPersonaOptions,
          speech: setSpeechOptions,
          strength: setStrengthOptions,
          weak: setWeaknessOptions,
          humor: setHumorOptions,
          goals: setGoalsOptions,
          bground: setBackgroundOptions,
          jobarea: setJobAreaOptions,
          niche: setContentFocusAreasOptions,
          cvalues: setCoreValuesOptions,
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

  // console.log('Cultural background options:', culturalBackgroundOptions);
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

  const ImagePreviewDialog = ({ imageUrl, onClose }: { imageUrl: string, onClose: () => void }) => (
    <DialogZoom open={true} onOpenChange={onClose}>
      <DialogContentZoom className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="relative h-full">
          <img
            src={imageUrl}
            alt="Preview"
            className="h-full object-contain"
          />
        </div>
      </DialogContentZoom>
    </DialogZoom>
  );

  const OptionSelector = ({ options, onSelect, onClose, title }: {
    options: Option[],
    onSelect: (label: string) => void,
    onClose: () => void,
    title: string
  }) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
      e.stopPropagation();
      setPreviewImage(imageUrl);
    };

    const handleSelect = (label: string) => {
      onSelect(label);
      onClose();
    };

    return (
      <>
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {options.map((option, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => handleSelect(option.label)}
                >
                  <CardContent className="p-4">
                    <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                      <img
                        src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                        alt={option.label}
                        className="absolute inset-0 w-full h-full object-cover rounded-md"
                      />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                        onClick={(e) => handleImageClick(e, `https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                      >
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        {previewImage && (
          <ImagePreviewDialog
            imageUrl={previewImage}
            onClose={() => setPreviewImage(null)}
          />
        )}
      </>
    );
  };

  const OptionMultiSelector = ({ options, onSelect, onClose, title, selectedValues, maxSelections }: {
    options: Option[],
    onSelect: (label: string) => void,
    onClose: () => void,
    title: string,
    selectedValues: string[],
    maxSelections: number
  }) => {
    const [localSelected, setLocalSelected] = useState<string[]>(selectedValues);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleSelect = (label: string) => {
      if (localSelected.includes(label)) {
        setLocalSelected(prev => prev.filter(item => item !== label));
      } else {
        if (localSelected.length < maxSelections) {
          setLocalSelected(prev => [...prev, label]);
        } else {
          toast.error('Maximum Selection Reached', {
            description: `You can only select up to ${maxSelections} options`,
            duration: 3000,
          });
        }
      }
    };

    const handleClose = () => {
      onSelect(localSelected.join(','));
      onClose();
    };

    const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
      e.stopPropagation();
      setPreviewImage(imageUrl);
    };

    return (
      <>
        <Dialog open={true} onOpenChange={handleClose}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                Select up to {maxSelections} options
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {options.map((option, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${localSelected.includes(option.label)
                    ? 'ring-2 ring-ai-purple-500'
                    : 'opacity-50 hover:opacity-100'
                    }`}
                  onClick={() => handleSelect(option.label)}
                >
                  <CardContent className="p-4">
                    <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                      <img
                        src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                        alt={option.label}
                        className="absolute inset-0 w-full h-full object-cover rounded-md"
                      />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                        onClick={(e) => handleImageClick(e, `https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                      >
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>
        {previewImage && (
          <ImagePreviewDialog
            imageUrl={previewImage}
            onClose={() => setPreviewImage(null)}
          />
        )}
      </>
    );
  };

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
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
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
          <TabsList className="grid w-full grid-cols-1 h-full md:grid-cols-2 lg:grid-cols-4">
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
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                      <div className="flex flex-col gap-2">
                        <Select
                          value={influencerData.sex}
                          onValueChange={(value) => handleInputChange('sex', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                          <SelectContent>
                            {sexOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div
                          onClick={() => setShowSexSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            sexOptions.find(option => option.label === influencerData.sex)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${sexOptions.find(option => option.label === influencerData.sex)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{sexOptions.find(option => option.label === influencerData.sex)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Age & Lifestyle</Label>
                      <div className="flex flex-col gap-2">
                        <Select
                          value={influencerData.age_lifestyle}
                          onValueChange={(value) => handleInputChange('age_lifestyle', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select age & lifestyle" />
                          </SelectTrigger>
                          <SelectContent>
                            {personaOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div
                          onClick={() => setShowPersonaSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            personaOptions.find(option => option.label === influencerData.age_lifestyle)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${personaOptions.find(option => option.label === influencerData.age_lifestyle)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{personaOptions.find(option => option.label === influencerData.age_lifestyle)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cultural Background</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowCulturalBackgroundSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            culturalBackgroundOptions.find(option => option.label === influencerData.cultural_background)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${culturalBackgroundOptions.find(option => option.label === influencerData.cultural_background)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{culturalBackgroundOptions.find(option => option.label === influencerData.cultural_background)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Hair Length</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowHairLengthSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            hairLengthOptions.find(option => option.label === influencerData.hair_length)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${hairLengthOptions.find(option => option.label === influencerData.hair_length)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{hairLengthOptions.find(option => option.label === influencerData.hair_length)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Hair Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowHairStyleSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            hairStyleOptions.find(option => option.label === influencerData.hair_style)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${hairStyleOptions.find(option => option.label === influencerData.hair_style)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{hairStyleOptions.find(option => option.label === influencerData.hair_style)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Hair Color</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowHairColorSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            hairColorOptions.find(option => option.label === influencerData.hair_color)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${hairColorOptions.find(option => option.label === influencerData.hair_color)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{hairColorOptions.find(option => option.label === influencerData.hair_color)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Face Shape</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowFaceShapeSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            faceShapeOptions.find(option => option.label === influencerData.face_shape)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${faceShapeOptions.find(option => option.label === influencerData.face_shape)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{faceShapeOptions.find(option => option.label === influencerData.face_shape)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Eye Color</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowEyeColorSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            eyeColorOptions.find(option => option.label === influencerData.eye_color)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${eyeColorOptions.find(option => option.label === influencerData.eye_color)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{eyeColorOptions.find(option => option.label === influencerData.eye_color)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Lip Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowLipSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            lipOptions.find(option => option.label === influencerData.lip_style)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${lipOptions.find(option => option.label === influencerData.lip_style)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{lipOptions.find(option => option.label === influencerData.lip_style)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nose Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowNoseSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            noseOptions.find(option => option.label === influencerData.nose_style)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${noseOptions.find(option => option.label === influencerData.nose_style)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{noseOptions.find(option => option.label === influencerData.nose_style)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Eyebrow Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowEyebrowSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            eyebrowOptions.find(option => option.label === influencerData.eyebrow_style)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${eyebrowOptions.find(option => option.label === influencerData.eyebrow_style)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{eyebrowOptions.find(option => option.label === influencerData.eyebrow_style)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Skin Tone</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowSkinToneSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            skinToneOptions.find(option => option.label === influencerData.skin_tone)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${skinToneOptions.find(option => option.label === influencerData.skin_tone)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{skinToneOptions.find(option => option.label === influencerData.skin_tone)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Body Type</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowBodyTypeSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            bodyTypeOptions.find(option => option.label === influencerData.body_type)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${bodyTypeOptions.find(option => option.label === influencerData.body_type)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{bodyTypeOptions.find(option => option.label === influencerData.body_type)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Facial Features</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowFacialFeaturesSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            facialFeaturesOptions.find(option => option.label === influencerData.facial_features)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${facialFeaturesOptions.find(option => option.label === influencerData.facial_features)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{facialFeaturesOptions.find(option => option.label === influencerData.facial_features)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Makeup Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowMakeupSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            makeupOptions.find(option => option.label === influencerData.makeup_style)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>

                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${makeupOptions.find(option => option.label === influencerData.makeup_style)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{makeupOptions.find(option => option.label === influencerData.makeup_style)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Everyday Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowClothingEverydaySelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            clothingEverydayOptions.find(option => option.label === influencerData.clothing_style_everyday)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${clothingEverydayOptions.find(option => option.label === influencerData.clothing_style_everyday)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{clothingEverydayOptions.find(option => option.label === influencerData.clothing_style_everyday)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Occasional Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowClothingOccasionalSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            clothingOccasionalOptions.find(option => option.label === influencerData.clothing_style_occasional)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${clothingOccasionalOptions.find(option => option.label === influencerData.clothing_style_occasional)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{clothingOccasionalOptions.find(option => option.label === influencerData.clothing_style_occasional)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Home Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowClothingHomewearSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            clothingHomewearOptions.find(option => option.label === influencerData.clothing_style_home)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${clothingHomewearOptions.find(option => option.label === influencerData.clothing_style_home)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{clothingHomewearOptions.find(option => option.label === influencerData.clothing_style_home)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label>Sports Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowClothingSportsSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            clothingSportsOptions.find(option => option.label === influencerData.clothing_style_sports)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${clothingSportsOptions.find(option => option.label === influencerData.clothing_style_sports)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{clothingSportsOptions.find(option => option.label === influencerData.clothing_style_sports)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sexy Dresses Style</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowClothingSexySelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            clothingSexyOptions.find(option => option.label === influencerData.clothing_style_sexy_dress)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${clothingSexyOptions.find(option => option.label === influencerData.clothing_style_sexy_dress)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{clothingSexyOptions.find(option => option.label === influencerData.clothing_style_sexy_dress)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Home Environment</Label>
                      <div className="flex flex-col gap-2">
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
                        <div
                          onClick={() => setShowHomeEnvironmentSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {
                            homeEnvironmentOptions.find(option => option.label === influencerData.home_environment)?.image ? (
                              <Card className="relative w-full max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${homeEnvironmentOptions.find(option => option.label === influencerData.home_environment)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{homeEnvironmentOptions.find(option => option.label === influencerData.home_environment)?.label}</p>
                                </CardContent>
                              </Card>
                            )
                              :
                              <Card className="relative w-full border max-w-[250px]">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    Select option
                                  </div>
                                </CardContent>
                              </Card>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color Palette (Max 3)</Label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {influencerData.color_palette.map((palette, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {palette}
                            <button
                              onClick={() => handleRemoveTag('color_palette', palette)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {colorPaletteOptions.map((option, index) => (
                          <Card
                            key={index}
                            className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${influencerData.color_palette.includes(option.label)
                              ? 'ring-2 ring-ai-purple-500'
                              : 'opacity-50 hover:opacity-100'
                              }`}
                            onClick={() => {
                              if (influencerData.color_palette.includes(option.label)) {
                                handleRemoveTag('color_palette', option.label);
                              } else {
                                if (influencerData.color_palette.length < 3) {
                                  setInfluencerData(prev => ({
                                    ...prev,
                                    color_palette: [...prev.color_palette, option.label]
                                  }));
                                } else {
                                  toast.error('Maximum Selection Reached', {
                                    description: 'You can only select up to 3 color palettes',
                                    duration: 3000,
                                  });
                                }
                              }
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                  alt={option.label}
                                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                                <div
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`);
                                  }}
                                >
                                  <ZoomIn className="w-8 h-8 text-white" />
                                </div>
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
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
                    <Label>Content Focus (Max 4)</Label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {influencerData.content_focus.map((focus, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {focus}
                            <button
                              onClick={() => handleRemoveTag('content_focus', focus)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {influencerData.content_focus.map((focus, index) => {
                          const option = contentFocusOptions.find(opt => opt.label === focus);
                          if (!option) return null;
                          return (
                            <Card key={index} className="relative">
                              <CardContent className="p-4">
                                <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                    alt={option.label}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                  />
                                  <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                    onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                  >
                                    <ZoomIn className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <Button onClick={() => setShowContentFocusSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Select Content Focus
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Content Focus Areas (Max 5)</Label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {influencerData.content_focus_areas.map((area, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {area}
                            <button
                              onClick={() => handleRemoveTag('content_focus_areas', area)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {influencerData.content_focus_areas.map((area, index) => {
                          const option = contentFocusAreasOptions.find(opt => opt.label === area);
                          if (!option) return null;
                          return (
                            <Card key={index} className="relative max-w-[250px]">
                              <CardContent className="p-4">
                                <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                    alt={option.label}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                  />
                                  <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                    onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                  >
                                    <ZoomIn className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <Button onClick={() => setShowContentFocusAreasSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Select Content Focus Areas
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Area</Label>
                    <div className="space-y-4">
                      {influencerData.job_area && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          <Card className="relative max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${jobAreaOptions.find(opt => opt.label === influencerData.job_area)?.image}`}
                                  alt={influencerData.job_area}
                                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                                <div
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                  onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${jobAreaOptions.find(opt => opt.label === influencerData.job_area)?.image}`)}
                                >
                                  <ZoomIn className="w-8 h-8 text-white" />
                                </div>
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{influencerData.job_area}</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                      <Button onClick={() => setShowJobAreaSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Select Job Area
                      </Button>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Job Title</Label>
                          <Input
                            value={influencerData.job_title || ''}
                            onChange={(e) => handleInputChange('job_title', e.target.value)}
                            placeholder="Enter job title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Job Vibe</Label>
                          <Input
                            value={influencerData.job_vibe || ''}
                            onChange={(e) => handleInputChange('job_vibe', e.target.value)}
                            placeholder="Enter job vibe"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hobbies (Max 5)</Label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {influencerData.hobbies.map((hobby, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {hobby}
                            <button
                              onClick={() => handleRemoveTag('hobbies', hobby)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {influencerData.hobbies.map((hobby, index) => {
                          const option = hobbyOptions.find(opt => opt.label === hobby);
                          if (!option) return null;
                          return (
                            <Card key={index} className="relative max-w-[250px]">
                              <CardContent className="p-4">
                                <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                    alt={option.label}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                  />
                                  <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                    onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                  >
                                    <ZoomIn className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <Button onClick={() => setShowHobbySelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Select Hobbies
                      </Button>
                      <div className="space-y-2">
                        <Label>Social Circle</Label>
                        <Input
                          value={influencerData.social_circle || ''}
                          onChange={(e) => handleInputChange('social_circle', e.target.value)}
                          placeholder="Enter social circle"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Strengths (Max 3)</Label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {influencerData.strengths.map((strength, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {strength}
                            <button
                              onClick={() => handleRemoveTag('strengths', strength)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {influencerData.strengths.map((strength, index) => {
                          const option = strengthOptions.find(opt => opt.label === strength);
                          if (!option) return null;
                          return (
                            <Card key={index} className="relative">
                              <CardContent className="p-4">
                                <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                    alt={option.label}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                  />
                                  <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                    onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                  >
                                    <ZoomIn className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <Button onClick={() => setShowStrengthSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Select Strengths
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Weaknesses (Max 2)</Label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {influencerData.weaknesses.map((weakness, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {weakness}
                            <button
                              onClick={() => handleRemoveTag('weaknesses', weakness)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {influencerData.weaknesses.map((weakness, index) => {
                          const option = weaknessOptions.find(opt => opt.label === weakness);
                          if (!option) return null;
                          return (
                            <Card key={index} className="relative">
                              <CardContent className="p-4">
                                <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                    alt={option.label}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                  />
                                  <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                    onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                  >
                                    <ZoomIn className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <Button onClick={() => setShowWeaknessSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Select Weaknesses
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Speech Style (Max 4)</Label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {influencerData.speech_style.map((style, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {style}
                            <button
                              onClick={() => handleRemoveTag('speech_style', style)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {influencerData.speech_style.map((style, index) => {
                          const option = speechOptions.find(opt => opt.label === style);
                          if (!option) return null;
                          return (
                            <Card key={index} className="relative">
                              <CardContent className="p-4">
                                <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                    alt={option.label}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                  />
                                  <div
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                    onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                  >
                                    <ZoomIn className="w-8 h-8 text-white" />
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <Button onClick={() => setShowSpeechSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Select Speech Style
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label>Humor Style (Max 4)</Label>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {influencerData.humor.map((style, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {style}
                              <button
                                onClick={() => handleRemoveTag('humor', style)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {influencerData.humor.map((style, index) => {
                            const option = humorOptions.find(opt => opt.label === style);
                            if (!option) return null;
                            return (
                              <Card key={index} className="relative">
                                <CardContent className="p-4">
                                  <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                      alt={option.label}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                    <div
                                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-8 h-8 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        <Button onClick={() => setShowHumorSelector(true)}>
                          <Image className="w-4 h-4 mr-2" />
                          Select Humor Style
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Core Values Style (Max 5)</Label>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {influencerData.core_values.map((style, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {style}
                              <button
                                onClick={() => handleRemoveTag('core_values', style)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {influencerData.core_values.map((style, index) => {
                            const option = coreValuesOptions.find(opt => opt.label === style);
                            if (!option) return null;
                            return (
                              <Card key={index} className="relative">
                                <CardContent className="p-4">
                                  <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                      alt={option.label}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                    <div
                                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-8 h-8 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        <Button onClick={() => setShowCoreValuesSelector(true)}>
                          <Image className="w-4 h-4 mr-2" />
                          Select Core Values Style
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Current Goals (Max 3)</Label>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {influencerData.current_goals.map((goal, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {goal}
                              <button
                                onClick={() => handleRemoveTag('current_goals', goal)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {influencerData.current_goals.map((goal, index) => {
                            const option = goalsOptions.find(opt => opt.label === goal);
                            if (!option) return null;
                            return (
                              <Card key={index} className="relative">
                                <CardContent className="p-4">
                                  <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                      alt={option.label}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                    <div
                                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-8 h-8 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        <Button onClick={() => setShowGoalsSelector(true)}>
                          <Image className="w-4 h-4 mr-2" />
                          Select Current Goals
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Elements (Max 4)</Label>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {influencerData.background_elements.map((element, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {element}
                              <button
                                onClick={() => handleRemoveTag('background_elements', element)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {influencerData.background_elements.map((element, index) => {
                            const option = backgroundOptions.find(opt => opt.label === element);
                            if (!option) return null;
                            return (
                              <Card key={index} className="relative">
                                <CardContent className="p-4">
                                  <div className="relative w-full group" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                      alt={option.label}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                    <div
                                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-8 h-8 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        <Button onClick={() => setShowBackgroundSelector(true)}>
                          <Image className="w-4 h-4 mr-2" />
                          Select Background Elements
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      )
      }

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

      {
        showBackgroundSelector && (
          <OptionSelector
            options={backgroundOptions}
            onSelect={(label) => handleInputChange('cultural_background', label)}
            onClose={() => setShowBackgroundSelector(false)}
            title="Select Cultural Background"
          />
        )
      }

      {
        showHairLengthSelector && (
          <OptionSelector
            options={hairLengthOptions}
            onSelect={(label) => handleInputChange('hair_length', label)}
            onClose={() => setShowHairLengthSelector(false)}
            title="Select Hair Length"
          />
        )
      }

      {
        showEyeColorSelector && (
          <OptionSelector
            options={eyeColorOptions}
            onSelect={(label) => handleInputChange('eye_color', label)}
            onClose={() => setShowEyeColorSelector(false)}
            title="Select Eye Color"
          />
        )
      }

      {
        showHairColorSelector && (
          <OptionSelector
            options={hairColorOptions}
            onSelect={(label) => handleInputChange('hair_color', label)}
            onClose={() => setShowHairColorSelector(false)}
            title="Select Hair Color"
          />
        )
      }

      {
        showHairStyleSelector && (
          <OptionSelector
            options={hairStyleOptions}
            onSelect={(label) => handleInputChange('hair_style', label)}
            onClose={() => setShowHairStyleSelector(false)}
            title="Select Hair Style"
          />
        )
      }

      {
        showLipSelector && (
          <OptionSelector
            options={lipOptions}
            onSelect={(label) => handleInputChange('lip_style', label)}
            onClose={() => setShowLipSelector(false)}
            title="Select Lip Style"
          />
        )
      }

      {
        showNoseSelector && (
          <OptionSelector
            options={noseOptions}
            onSelect={(label) => handleInputChange('nose_style', label)}
            onClose={() => setShowNoseSelector(false)}
            title="Select Nose Style"
          />
        )
      }

      {
        showFaceShapeSelector && (
          <OptionSelector
            options={faceShapeOptions}
            onSelect={(label) => handleInputChange('face_shape', label)}
            onClose={() => setShowFaceShapeSelector(false)}
            title="Select Face Shape"
          />
        )
      }

      {
        showSkinToneSelector && (
          <OptionSelector
            options={skinToneOptions}
            onSelect={(label) => handleInputChange('skin_tone', label)}
            onClose={() => setShowSkinToneSelector(false)}
            title="Select Skin Tone"
          />
        )
      }

      {
        showBodyTypeSelector && (
          <OptionSelector
            options={bodyTypeOptions}
            onSelect={(label) => handleInputChange('body_type', label)}
            onClose={() => setShowBodyTypeSelector(false)}
            title="Select Body Type"
          />
        )
      }

      {
        showColorPaletteSelector && (
          <OptionSelector
            options={colorPaletteOptions}
            onSelect={(label) => handleAddTag('color_palette', label)}
            onClose={() => setShowColorPaletteSelector(false)}
            title="Select Color Palette"
          />
        )
      }

      {
        showClothingEverydaySelector && (
          <OptionSelector
            options={clothingEverydayOptions}
            onSelect={(label) => handleInputChange('clothing_style_everyday', label)}
            onClose={() => setShowClothingEverydaySelector(false)}
            title="Select Everyday Style"
          />
        )
      }

      {
        showClothingOccasionalSelector && (
          <OptionSelector
            options={clothingOccasionalOptions}
            onSelect={(label) => handleInputChange('clothing_style_occasional', label)}
            onClose={() => setShowClothingOccasionalSelector(false)}
            title="Select Occasional Style"
          />
        )
      }

      {
        showClothingHomewearSelector && (
          <OptionSelector
            options={clothingHomewearOptions}
            onSelect={(label) => handleInputChange('clothing_style_home', label)}
            onClose={() => setShowClothingHomewearSelector(false)}
            title="Select Home Style"
          />
        )
      }

      {
        showClothingSportsSelector && (
          <OptionSelector
            options={clothingSportsOptions}
            onSelect={(label) => handleInputChange('clothing_style_sports', label)}
            onClose={() => setShowClothingSportsSelector(false)}
            title="Select Sports Style"
          />
        )
      }

      {
        showHomeEnvironmentSelector && (
          <OptionSelector
            options={homeEnvironmentOptions}
            onSelect={(label) => handleInputChange('home_environment', label)}
            onClose={() => setShowHomeEnvironmentSelector(false)}
            title="Select Home Environment"
          />
        )
      }

      {
        showClothingSexySelector && (
          <OptionSelector
            options={clothingSexyOptions}
            onSelect={(label) => handleInputChange('clothing_style_sexy_dress', label)}
            onClose={() => setShowClothingSexySelector(false)}
            title="Select Sexy Dresses Style"
          />
        )
      }

      {
        showFacialFeaturesSelector && (
          <OptionSelector
            options={facialFeaturesOptions}
            onSelect={(label) => handleInputChange('facial_features', label)}
            onClose={() => setShowFacialFeaturesSelector(false)}
            title="Select Facial Features"
          />
        )
      }

      {
        showHairColorSelector && (
          <OptionSelector
            options={hairColorOptions}
            onSelect={(label) => handleInputChange('hair_color', label)}
            onClose={() => setShowHairColorSelector(false)}
            title="Select Hair Color"
          />
        )
      }

      {
        showEyeColorSelector && (
          <OptionSelector
            options={eyeColorOptions}
            onSelect={(label) => handleInputChange('eye_color', label)}
            onClose={() => setShowEyeColorSelector(false)}
            title="Select Eye Color"
          />
        )
      }

      {
        showCulturalBackgroundSelector && (
          <OptionSelector
            options={culturalBackgroundOptions}
            onSelect={(label) => handleInputChange('cultural_background', label)}
            onClose={() => setShowCulturalBackgroundSelector(false)}
            title="Select Cultural Background"
          />
        )
      }

      {
        showEyebrowSelector && (
          <OptionSelector
            options={eyebrowOptions}
            onSelect={(label) => handleInputChange('eyebrow_style', label)}
            onClose={() => setShowEyebrowSelector(false)}
            title="Select Eyebrow Style"
          />
        )
      }

      {
        showMakeupSelector && (
          <OptionSelector
            options={makeupOptions}
            onSelect={(label) => handleInputChange('makeup_style', label)}
            onClose={() => setShowMakeupSelector(false)}
            title="Select Makeup Style"
          />
        )
      }

      {
        showSexSelector && (
          <OptionSelector
            options={sexOptions}
            onSelect={(label) => handleInputChange('sex', label)}
            onClose={() => setShowSexSelector(false)}
            title="Select Sex"
          />
        )
      }

      {
        showContentFocusSelector && (
          <OptionMultiSelector
            options={contentFocusOptions}
            onSelect={(selected) => {
              const newValues = selected.split(',').filter(Boolean);
              setInfluencerData(prev => ({
                ...prev,
                content_focus: newValues
              }));
            }}
            onClose={() => setShowContentFocusSelector(false)}
            title="Select Content Focus"
            selectedValues={influencerData.content_focus}
            maxSelections={4}
          />
        )
      }

      {
        showHobbySelector && (
          <OptionMultiSelector
            options={hobbyOptions}
            onSelect={(selected) => {
              const newValues = selected.split(',').filter(Boolean);
              setInfluencerData(prev => ({
                ...prev,
                hobbies: newValues
              }));
            }}
            onClose={() => setShowHobbySelector(false)}
            title="Select Hobbies"
            selectedValues={influencerData.hobbies}
            maxSelections={5}
          />
        )
      }

      {
        showPersonaSelector && (
          <OptionSelector
            options={personaOptions}
            onSelect={(label) => handleInputChange('age_lifestyle', label)}
            onClose={() => setShowPersonaSelector(false)}
            title="Select Age & Lifestyle"
          />
        )
      }

      {
        showSpeechSelector && (
          <OptionMultiSelector
            options={speechOptions}
            onSelect={(selected) => {
              const newValues = selected.split(',').filter(Boolean);
              setInfluencerData(prev => ({
                ...prev,
                speech_style: newValues
              }));
            }}
            onClose={() => setShowSpeechSelector(false)}
            title="Select Speech Style"
            selectedValues={influencerData.speech_style}
            maxSelections={4}
          />
        )
      }

      {
        showStrengthSelector && (
          <OptionMultiSelector
            options={strengthOptions}
            onSelect={(selected) => {
              const newValues = selected.split(',').filter(Boolean);
              setInfluencerData(prev => ({
                ...prev,
                strengths: newValues
              }));
            }}
            onClose={() => setShowStrengthSelector(false)}
            title="Select Strengths"
            selectedValues={influencerData.strengths}
            maxSelections={3}
          />
        )
      }

      {
        showWeaknessSelector && (
          <OptionMultiSelector
            options={weaknessOptions}
            onSelect={(selected) => {
              const newValues = selected.split(',').filter(Boolean);
              setInfluencerData(prev => ({
                ...prev,
                weaknesses: newValues
              }));
            }}
            onClose={() => setShowWeaknessSelector(false)}
            title="Select Weaknesses"
            selectedValues={influencerData.weaknesses}
            maxSelections={2}
          />
        )
      }

      {showHumorSelector && (
        <OptionMultiSelector
          options={humorOptions}
          onSelect={(selected) => {
            const newValues = selected.split(',').filter(Boolean);
            setInfluencerData(prev => ({
              ...prev,
              humor: newValues
            }));
          }}
          onClose={() => setShowHumorSelector(false)}
          title="Select Humor Style"
          selectedValues={influencerData.humor}
          maxSelections={4}
        />
      )}

      {showCoreValuesSelector && (
        <OptionMultiSelector
          options={coreValuesOptions}
          onSelect={(selected) => {
            const newValues = selected.split(',').filter(Boolean);
            setInfluencerData(prev => ({
              ...prev,
              core_values: newValues
            }));
          }}
          onClose={() => setShowCoreValuesSelector(false)}
          title="Select Core Values Style"
          selectedValues={influencerData.core_values}
          maxSelections={5}
        />
      )}

      {showGoalsSelector && (
        <OptionMultiSelector
          options={goalsOptions}
          onSelect={(selected) => {
            const newValues = selected.split(',').filter(Boolean);
            setInfluencerData(prev => ({
              ...prev,
              current_goals: newValues
            }));
          }}
          onClose={() => setShowGoalsSelector(false)}
          title="Select Current Goals"
          selectedValues={influencerData.current_goals}
          maxSelections={3}
        />
      )}

      {showBackgroundSelector && (
        <OptionMultiSelector
          options={backgroundOptions}
          onSelect={(selected) => {
            const newValues = selected.split(',').filter(Boolean);
            setInfluencerData(prev => ({
              ...prev,
              background_elements: newValues
            }));
          }}
          onClose={() => setShowBackgroundSelector(false)}
          title="Select Background Elements"
          selectedValues={influencerData.background_elements}
          maxSelections={4}
        />
      )}

      {showJobAreaSelector && (
        <OptionSelector
          options={jobAreaOptions}
          onSelect={(label) => {
            setInfluencerData(prev => ({
              ...prev,
              job_area: label
            }));
            setShowJobAreaSelector(false);
          }}
          onClose={() => setShowJobAreaSelector(false)}
          title="Select Job Area"
        />
      )}

      {showContentFocusAreasSelector && (
        <OptionMultiSelector
          options={contentFocusAreasOptions}
          onSelect={(selected) => {
            const newValues = selected.split(',').filter(Boolean);
            setInfluencerData(prev => ({
              ...prev,
              content_focus_areas: newValues
            }));
          }}
          onClose={() => setShowContentFocusAreasSelector(false)}
          title="Select Content Focus Areas"
          selectedValues={influencerData.content_focus_areas}
          maxSelections={5}
        />
      )}
      {previewImage && (
        <ImagePreviewDialog
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
