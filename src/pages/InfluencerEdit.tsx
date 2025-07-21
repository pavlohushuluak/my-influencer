import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import { DialogZoom, DialogContentZoom } from '@/components/ui/zoomdialog';
import { updateInfluencer, setInfluencers, setLoading, setError, addInfluencer } from '@/store/slices/influencersSlice';
import { setUser } from '@/store/slices/userSlice';
import { X, Plus, Save, Crown, Image, Settings, User, ChevronRight, MoreHorizontal, Loader2, ZoomIn, Pencil, Trash2, Brain } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';

interface GeneratedImageData {
  id: string;
  task_id: string;
  image_sequence_number: number;
  system_filename: string;
  user_filename: string | null;
  user_notes: string | null;
  user_tags: string[] | null;
  file_path: string;
  file_size_bytes: number;
  image_format: string;
  seed: number;
  guidance: number;
  steps: number;
  nsfw_strength: number;
  lora_strength: number;
  model_version: string;
  t5xxl_prompt: string;
  clip_l_prompt: string;
  negative_prompt: string;
  generation_status: string;
  generation_started_at: string;
  generation_completed_at: string;
  generation_time_seconds: number;
  error_message: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
  actual_seed_used: number;
  prompt_file_used: string;
  quality_setting: string;
  rating: number;
  favorite: boolean;
  file_type: string;
  image_num: number;
}

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
    'facial_features',
    'bust',
    'color_palette',
    'clothing_style_home',
    'clothing_style_sports',
    'clothing_style_sexy_dress',
    'home_environment',
    'content_focus',
    'content_focus_areas',
    'job_area',
    'job_title',
    'job_vibe',
    'hobbies',
    'social_circle',
    'strengths',
    'weaknesses',
    'speech_style',
    'humor',
    'core_values',
    'current_goals',
    'background_elements'
  ],
  starter: [
    'facial_features',
    'bust',
    'color_palette',
    'clothing_style_home',
    'clothing_style_sports',
    'clothing_style_sexy_dress',
    'home_environment',
    'content_focus',
    'content_focus_areas',
    'job_area',
    'job_title',
    'job_vibe',
    'hobbies',
    'social_circle',
    'strengths',
    'weaknesses',
    'speech_style',
    'humor',
    'core_values',
    'current_goals',
    'background_elements'
  ],
  professional: [
    'strengths',
    'weaknesses',
    'speech_style',
    'humor',
    'core_values',
    'current_goals',
    'background_elements'
  ],
  enterprise: []
};

interface Option {
  label: string;
  image: string;
  description?: string;
}

interface FacialTemplateDetail {
  template_id: string;
  template_name: string;
  category: string;
  description: string;
  base_prompt: string;
  implied_face_shape: string;
  implied_nose_style: string;
  implied_lip_style: string;
  implied_eye_color: string;
  implied_eye_shape: string;
  implied_eyebrow_style: string;
  implied_skin_tone: string;
  weight_without_lora: number;
  weight_with_lora: number;
  is_active: boolean;
  created_at: string;
  implied_hair_color: string;
  implied_hair_length: string;
  implied_hair_style: string;
  sortid: number;
  implied_cultural_background: string;
  id: number;
  prompt_mapping_ref_id: number;
}

const INFLUENCER_TYPES = ['Lifestyle', 'Educational'];

export default function InfluencerEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const displayedInfluencers = influencers;
  const [isLoading, setIsLoading] = useState(true);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditView, setShowEditView] = useState(!!location.state?.influencerData);

  const userData = useSelector((state: RootState) => state.user);
  const [subscriptionLevel, setSubscriptionLevel] = useState<'free' | 'starter' | 'professional' | 'enterprise'>('free');

  useEffect(() => {
    setSubscriptionLevel(userData.subscription as 'free' | 'starter' | 'professional' | 'enterprise');
  }, [userData.subscription]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);
  const [backgroundOptions, setBackgroundOptions] = useState<Option[]>([]);
  const [hairLengthOptions, setHairLengthOptions] = useState<Option[]>([]);
  const [showHairLengthSelector, setShowHairLengthSelector] = useState(false);
  const [influencerData, setInfluencerData] = useState(location.state?.influencerData || {
    id: '',
    visual_only: false,
    eyebrow_style: '',
    influencer_type: '',
    name_first: '',
    name_last: '',
    sex: '',
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
    background_elements: [],
    prompt: '',
    notes: '',
    age: '',
    lifestyle: '',
    eye_shape: '',
    bust_size: '',
    image_url: '',
    image_num: 0
  });

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
  const [bustOptions, setBustOptions] = useState<Option[]>([]);
  const [colorPaletteOptions, setColorPaletteOptions] = useState<Option[]>([]);
  const [clothingEverydayOptions, setClothingEverydayOptions] = useState<Option[]>([]);
  const [clothingOccasionalOptions, setClothingOccasionalOptions] = useState<Option[]>([]);
  const [clothingHomewearOptions, setClothingHomewearOptions] = useState<Option[]>([]);
  const [clothingSportsOptions, setClothingSportsOptions] = useState<Option[]>([]);
  const [clothingSexyOptions, setClothingSexyOptions] = useState<Option[]>([]);
  const [homeEnvironmentOptions, setHomeEnvironmentOptions] = useState<Option[]>([]);
  const [eyeShapeOptions, setEyeShapeOptions] = useState<Option[]>([]);
  const [ageOptions, setAgeOptions] = useState<Option[]>([]);
  const [lifestyleOptions, setLifestyleOptions] = useState<Option[]>([]);

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
  const [showBustSelector, setShowBustSelector] = useState(false);
  const [showColorPaletteSelector, setShowColorPaletteSelector] = useState(false);
  const [showClothingEverydaySelector, setShowClothingEverydaySelector] = useState(false);
  const [showClothingOccasionalSelector, setShowClothingOccasionalSelector] = useState(false);
  const [showClothingHomewearSelector, setShowClothingHomewearSelector] = useState(false);
  const [showClothingSportsSelector, setShowClothingSportsSelector] = useState(false);
  const [showClothingSexySelector, setShowClothingSexySelector] = useState(false);
  const [showHomeEnvironmentSelector, setShowHomeEnvironmentSelector] = useState(false);
  const [showEyeShapeSelector, setShowEyeShapeSelector] = useState(false);
  const [showAgeSelector, setShowAgeSelector] = useState(false);
  const [showLifestyleSelector, setShowLifestyleSelector] = useState(false);

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
  const [previewImages, setPreviewImages] = useState<Array<{ imageUrl: string; negativePrompt: string; isRecommended?: boolean; isLoading?: boolean; taskId?: string }>>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatedImageData, setGeneratedImageData] = useState<{ image_id: string; system_filename: string } | null>(null);

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

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Add state for image selection modal
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [detailedImages, setDetailedImages] = useState<GeneratedImageData[]>([]);
  const [loadingVaultImages, setLoadingVaultImages] = useState(false);
  const [profileImageId, setProfileImageId] = useState<string | null>(null);

  // Add state for color pickers
  const [showHairColorPicker, setShowHairColorPicker] = useState(false);
  const [showEyeColorPicker, setShowEyeColorPicker] = useState(false);
  const [selectedHairColor, setSelectedHairColor] = useState<string>('');
  const [selectedEyeColor, setSelectedEyeColor] = useState<string>('');

  // Add state for enhanced facial features functionality
  const [selectedFacialTemplate, setSelectedFacialTemplate] = useState<FacialTemplateDetail | null>(null);
  const [showFacialTemplateDetails, setShowFacialTemplateDetails] = useState(false);
  const [showFacialTemplateConfirm, setShowFacialTemplateConfirm] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

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

  const validateFields = () => {
    const errors: { [key: string]: string } = {};
    const requiredFields = [
      'name_first',
      'name_last',
      'influencer_type'
    ];
    requiredFields.forEach(field => {
      if (!influencerData[field as keyof typeof influencerData]) {
        errors[field] = 'This field is required';
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to fetch vault images
  const fetchVaultImages = async () => {
    try {
      setLoadingVaultImages(true);

      // Step 1: Get files from vault/Inbox folder only
      const allImages: any[] = [];

      // Get images from vault/Inbox folder
      const inboxResponse = await fetch(`https://api.nymia.ai/v1/getfilenames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: "vault/Inbox"
        })
      });

      if (inboxResponse.ok) {
        const inboxData = await inboxResponse.json();
        const inboxImages = inboxData.map((item: any) => ({
          ...item,
          user_filename: "Inbox",
          folder: "vault/Inbox"
        }));
        allImages.push(...inboxImages);
      }

      // Step 2: Get detailed information for each file from database
      const detailedImagesData: GeneratedImageData[] = [];

      for (const file of allImages) {
        // Extract filename from the Key (remove path and get just the filename)
        if (file.Key === undefined) continue;
        const filename = file.Key.split('/').pop();
        if (!filename) continue;

        // For Inbox files, user_filename is always "Inbox"
        const user_filename = "Inbox";

        try {
          const detailResponse = await fetch(`https://db.nymia.ai/rest/v1/generated_images?system_filename=eq.${filename}&user_filename=eq.${user_filename}`, {
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI'
            }
          });

          if (detailResponse.ok) {
            const imageDetails: GeneratedImageData[] = await detailResponse.json();
            if (imageDetails.length > 0) {
              detailedImagesData.push({ ...imageDetails[0], id: filename });
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch details for ${filename}:`, error);
        }
      }

      setDetailedImages(detailedImagesData);
    } catch (error) {
      console.error('Error fetching Inbox images:', error);
      toast.error('Failed to fetch Inbox images');
    } finally {
      setLoadingVaultImages(false);
    }
  };

  // Function to handle image selection
  const handleImageSelect = (imageUrl: string) => {
    setInfluencerData(prev => ({
      ...prev,
      image_url: imageUrl
    }));
    setShowImageSelector(false);
    toast.success('Image selected successfully');
  };

  // Function to open image selector
  const openImageSelector = () => {
    setShowImageSelector(true);
    fetchVaultImages();
  };

  const handleSave = async () => {
    if (!validateFields()) {
      return;
    }

    setIsSaving(true);

    if (profileImageId) {
      const extension = profileImageId.split('.').pop();
      await fetch('https://api.nymia.ai/v1/copyfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `vault/Inbox/${profileImageId}`,
          destinationfilename: `models/${influencerData.id}/profilepic/profilepic${influencerData.image_num}.${extension}`
        })
      });

      influencerData.image_url = `https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/models/${influencerData.id}/profilepic/profilepic${influencerData.image_num}.png`;
      influencerData.image_num = influencerData.image_num + 1;
    }

    try {
      if (location.state?.create) {
        const response = await fetch('https://db.nymia.ai/rest/v1/influencer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({ ...influencerData, new: true })
        });

        const responseId = await fetch(`https://db.nymia.ai/rest/v1/influencer?user_id=eq.${userData.id}&new=eq.true`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        const data = await responseId.json();

        dispatch(addInfluencer(influencerData));

        await fetch('https://api.nymia.ai/v1/createfolder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            parentfolder: `models/${data[0].id}/`,
            folder: "lora"
          })
        });

        await fetch('https://api.nymia.ai/v1/createfolder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            parentfolder: `models/${data[0].id}/`,
            folder: "loratraining"
          })
        });

        await fetch('https://api.nymia.ai/v1/createfolder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            parentfolder: `models/${data[0].id}/`,
            folder: "profilepic"
          })
        });

        await fetch('https://api.nymia.ai/v1/createfolder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            parentfolder: `models/${data[0].id}/`,
            folder: "reference"
          })
        });

        await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${data[0].id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            new: false
          })
        });

        if (response.ok) {
          // Update guide_step if it's currently 1
          if (userData.guide_step === 1) {
            try {
              const guideStepResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer WeInfl3nc3withAI'
                },
                body: JSON.stringify({
                  guide_step: 2
                })
              });

              if (guideStepResponse.ok) {
                dispatch(setUser({ guide_step: 2 }));
                toast.success('Influencer created successfully! Moving to next step...');
                navigate('/start');
                return;
              }
            } catch (error) {
              console.error('Failed to update guide_step:', error);
            }
          }

          setShowEditView(false);
          setActiveTab('basic');
          toast.success('Influencer created successfully');
        } else {
          toast.error('Failed to create influencer');
        }
      }
      else {
        const response = await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${influencerData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify(influencerData)
        });
        dispatch(updateInfluencer(influencerData));
        if (response.ok) {
          setShowEditView(false);
          setActiveTab('basic');
          toast.success('Influencer updated successfully');
          if (userData.guide_step === 1) {
            try {
              const guideStepResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer WeInfl3nc3withAI'
                },
                body: JSON.stringify({
                  guide_step: 2
                })
              });

              if (guideStepResponse.ok) {
                dispatch(setUser({ guide_step: 2 }));
                toast.success('Influencer created successfully! Moving to next step...');
                navigate('/start');
                return;
              }
            } catch (error) {
              console.error('Failed to update guide_step:', error);
            }
          }
        } else {
          toast.error('Failed to update influencer');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOnlySave = async () => {
    if (!validateFields()) {
      return;
    }

    setIsUpdating(true);

    if (profileImageId) {
      const extension = profileImageId.substring(profileImageId.lastIndexOf('.') + 1);
      await fetch('https://api.nymia.ai/v1/copyfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `vault/Inbox/${profileImageId}`,
          destinationfilename: `models/${influencerData.id}/profilepic/profilepic${influencerData.image_num}.${extension}`
        })
      });

      influencerData.image_url = `https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/models/${influencerData.id}/profilepic/profilepic${influencerData.image_num}.png`;
      influencerData.image_num = influencerData.image_num + 1;
    }

    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${influencerData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(influencerData)
      });
      dispatch(updateInfluencer(influencerData));
      if (response.ok) {
        toast.success('Influencer updated successfully');
      } else {
        toast.error('Failed to update influencer');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsUpdating(false);
    }
  }

  const handlePreview = async () => {
    if (!validateFields()) {
      return;
    }

    setIsPreviewLoading(true);
    
    // Initialize preview images with loading states
    const initialPreviewImages = [
      { imageUrl: '', negativePrompt: '2', isRecommended: false, isLoading: true, taskId: '' },
      { imageUrl: '', negativePrompt: '1', isRecommended: true, isLoading: true, taskId: '' },
      { imageUrl: '', negativePrompt: '3', isRecommended: false, isLoading: true, taskId: '' }
    ];
    
    setPreviewImages(initialPreviewImages);
    setShowPreviewModal(true);

    try {
      const useridResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const useridData = await useridResponse.json();

      // Create base request data
      const baseRequestData = {
        task: "generate_preview",
        number_of_images: 1,
        quality: 'Quality',
        nsfw_strength: -1,
        lora: "",
        noAI: false,
        prompt: "",
        lora_strength: 0,
        seed: -1,
        guidance: 7,
        model: influencerData ? {
          id: influencerData.id,
          influencer_type: influencerData.influencer_type,
          sex: influencerData.sex,
          cultural_background: influencerData.cultural_background,
          hair_length: influencerData.hair_length,
          hair_color: influencerData.hair_color,
          hair_style: influencerData.hair_style,
          eye_color: influencerData.eye_color,
          lip_style: influencerData.lip_style,
          nose_style: influencerData.nose_style,
          face_shape: influencerData.face_shape,
          facial_features: influencerData.facial_features,
          skin_tone: influencerData.skin_tone,
          bust: influencerData.bust_size,
          body_type: influencerData.body_type,
          color_palette: influencerData.color_palette || [],
          clothing_style_everyday: influencerData.clothing_style_everyday,
          eyebrow_style: influencerData.eyebrow_style,
          makeup_style: influencerData.makeup,
          name_first: influencerData.name_first,
          name_last: influencerData.name_last,
          visual_only: influencerData.visual_only,
          age: influencerData.age,
          lifestyle: influencerData.lifestyle
        } : null,
        scene: {
          framing: "",
          rotation: "",
          lighting_preset: "",
          scene_setting: "",
          pose: "",
          clothes: ""
        }
      };

      // Send 3 requests with different negative prompts
      const requests = [
        { negative_prompt: "1", order: 0, displayIndex: 1 }, // First displayed (recommended)
        { negative_prompt: "2", order: 1, displayIndex: 0 }, // Second displayed
        { negative_prompt: "3", order: 2, displayIndex: 2 }  // Third displayed
      ];

      const taskPromises = requests.map(async (request) => {
        const requestData = {
          ...baseRequestData,
          negative_prompt: request.negative_prompt
        };

        const response = await fetch(`https://api.nymia.ai/v1/createtask?userid=${useridData[0].userid}&type=createimage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result.id, ": ", request.negative_prompt);
        return { 
          taskId: result.id, 
          order: request.order, 
          displayIndex: request.displayIndex,
          negativePrompt: request.negative_prompt 
        };
      });

      const taskResults = await Promise.all(taskPromises);

      // Poll for images individually and update as they complete
      const pollForImages = async () => {
        try {
          let allCompleted = true;

          for (const taskResult of taskResults) {
            const imagesResponse = await fetch(`https://db.nymia.ai/rest/v1/generated_images?task_id=eq.${taskResult.taskId}`, {
              headers: {
                'Authorization': 'Bearer WeInfl3nc3withAI'
              }
            });

            const imagesData = await imagesResponse.json();

            if (imagesData.length > 0 && imagesData[0].generation_status === 'completed' && imagesData[0].file_path) {
              const completedImage = imagesData[0];
              const imageUrl = `https://images.nymia.ai/cdn-cgi/image/w=800/${completedImage.file_path}`;
              
              // Update the specific image in the array
              setPreviewImages(prev => prev.map((img, index) => 
                index === taskResult.displayIndex 
                  ? { 
                      ...img, 
                      imageUrl, 
                      isLoading: false,
                      taskId: taskResult.taskId 
                    }
                  : img
              ));
            } else {
              allCompleted = false;
            }
          }

          if (allCompleted) {
            setIsPreviewLoading(false);
            toast.success('All preview images generated successfully!', {
              description: 'Your influencer preview variations are ready to view'
            });
            return;
          }

          // Continue polling if not all images are ready
          setTimeout(pollForImages, 2000); // Poll every 2 seconds
        } catch (error) {
          console.error('Error polling for images:', error);
          toast.error('Failed to fetch preview images');
          setIsPreviewLoading(false);
        }
      };

      // Start polling
      pollForImages();

    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview images');
      setIsPreviewLoading(false);
    }
  };

  const handleUseAsProfilePicture = async () => {
    if (!generatedImageData) {
      toast.error('No generated image available');
      return;
    }

    console.log(generatedImageData);

    try {
      console.log(influencerData.image_num);
      const num = influencerData.image_num === null || influencerData.image_num === undefined ? 0 : influencerData.image_num;
      const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `output/${generatedImageData.system_filename}`,
          destinationfilename: `models/${influencerData.id}/profilepic/profilepic${num}.png`
        })
      });

      if (!copyResponse.ok) {
        throw new Error('Failed to copy image to profile picture');
      }

      // Update the influencer data with the new profile picture URL
      const newImageUrl = `https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/models/${influencerData.id}/profilepic/profilepic${influencerData.image_num}.png`;

      setInfluencerData(prev => ({
        ...prev,
        image_url: newImageUrl,
        image_num: num + 1
      }));

      await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${influencerData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          image_num: influencerData.image_num + 1
        })
      });

      // Close the preview modal
      setPreviewImage(null);
      setGeneratedImageData(null);

      toast.success('Profile picture updated successfully!', {
        description: 'The generated image has been set as your influencer\'s profile picture'
      });

    } catch (error) {
      console.error('Error setting profile picture:', error);
      toast.error('Failed to set profile picture');
    }
  };

  const handleEditInfluencer = (id: string) => {
    const influencer = influencers.find(inf => inf.id === id);
    if (influencer) {
      setInfluencerData({
        id: influencer.id,
        visual_only: influencer.visual_only,
        eyebrow_style: influencer.eyebrow_style || 'Default',
        influencer_type: influencer.influencer_type || 'Lifestyle',
        name_first: influencer.name_first || '',
        name_last: influencer.name_last || '',
        sex: influencer.sex || 'Female',
        age: influencer.age || '',
        lifestyle: influencer.lifestyle || '',
        eye_shape: influencer.eye_shape || 'Default',
        bust_size: influencer.bust_size || 'Default',
        origin_birth: influencer.origin_birth || '',
        origin_residence: influencer.origin_residence || '',
        cultural_background: influencer.cultural_background || 'Default',
        hair_length: influencer.hair_length || 'Default',
        hair_color: influencer.hair_color || 'Default',
        hair_style: influencer.hair_style || 'Default',
        eye_color: influencer.eye_color || 'Default',
        lip_style: influencer.lip_style || 'Default',
        nose_style: influencer.nose_style || 'Default',
        face_shape: influencer.face_shape || 'Default',
        facial_features: influencer.facial_features || 'Default',
        skin_tone: influencer.skin_tone || 'Default',
        body_type: influencer.body_type || 'Default',
        color_palette: influencer.color_palette || [],
        clothing_style_everyday: influencer.clothing_style_everyday || 'Default',
        clothing_style_occasional: influencer.clothing_style_occasional || 'Default',
        clothing_style_home: influencer.clothing_style_home || 'Default',
        clothing_style_sports: influencer.clothing_style_sports || 'Default',
        clothing_style_sexy_dress: influencer.clothing_style_sexy_dress || 'Default',
        home_environment: influencer.home_environment || 'Default',
        content_focus: influencer.content_focus.length === 0 ? ['Default'] : influencer.content_focus,
        content_focus_areas: influencer.content_focus_areas.length === 0 ? ['Default'] : influencer.content_focus_areas,
        job_area: influencer.job_area || 'Default',
        job_title: influencer.job_title || '',
        job_vibe: influencer.job_vibe || '',
        hobbies: influencer.hobbies.length === 0 ? ['Default'] : influencer.hobbies,
        social_circle: influencer.social_circle || '',
        strengths: influencer.strengths.length === 0 ? ['Default'] : influencer.strengths,
        weaknesses: influencer.weaknesses.length === 0 ? ['Default'] : influencer.weaknesses,
        speech_style: influencer.speech_style.length === 0 ? ['Default'] : influencer.speech_style,
        humor: influencer.humor.length === 0 ? ['Default'] : influencer.humor,
        core_values: influencer.core_values.length === 0 ? ['Default'] : influencer.core_values,
        current_goals: influencer.current_goals.length === 0 ? ['Default'] : influencer.current_goals,
        background_elements: influencer.background_elements.length === 0 ? ['Default'] : influencer.background_elements,
        prompt: influencer.prompt || '',
        notes: influencer.notes || '',
        image_url: influencer.image_url || ''
      });
      setShowEditView(true);
    }
  };

  const handleCreateNew = () => {
    navigate('/influencers/create');
  };

  const handleUseTemplate = () => {
    navigate('/influencers/templates');
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
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setCulturalBackgroundOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
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
          facial_features: setFacialFeaturesOptions,
          skin: setSkinToneOptions,
          bodytype: setBodyTypeOptions,
          bust: setBustOptions,
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
          eye_shape: setEyeShapeOptions,
          age: setAgeOptions,
          lifestyle: setLifestyleOptions,
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
                image: item.image,
                description: item.description
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

  const fetchInfluencers = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [userData.id]);

  const ImagePreviewDialog = ({ imageUrl, onClose }: { imageUrl: string, onClose: () => void }) => (
    <DialogZoom open={true} onOpenChange={onClose}>
      <DialogContentZoom className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="relative h-full">
          <img
            src={imageUrl}
            alt="Preview"
            className="h-full object-contain"
          />
          {/* Use as Profile Picture Button - only show for generated images */}
          {generatedImageData && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/30 shadow-2xl">
                <Button
                  onClick={handleUseAsProfilePicture}
                  className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-semibold">Use as Profile Picture</span>
                  </div>
                </Button>
              </div>
            </div>
          )}
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
      // Special handling for facial features - show template details instead of selecting
      if (title === "Select Facial Features") {
        fetchFacialTemplateDetails(label);
        onClose();
      } else {
        onSelect(label);
        onClose();
      }
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
                        className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                        onClick={(e) => handleImageClick(e, `https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                      >
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                    {option.label && (
                      <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">
                        {option.description}
                      </p>
                    )}
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

  const OptionMultiSelector = ({ options, onSelect, onClose, title, selectedValues, maxSelections, field }: {
    options: Option[],
    onSelect: (label: string) => void,
    onClose: () => void,
    title: string,
    selectedValues: string[],
    maxSelections: number,
    field: string
  }) => {
    if (isFeatureLocked(field)) {
      setLockedFeature(field);
      setShowUpgradeModal(true);
      onClose();
      return;
    }

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
                        className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                        onClick={(e) => handleImageClick(e, `https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                      >
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">
                        {option.description}
                      </p>
                    )}
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

  // Function to handle color selection
  const handleColorSelect = (type: 'hair' | 'eye', color: string) => {
    if (type === 'hair') {
      setSelectedHairColor(color);
      setInfluencerData(prev => ({
        ...prev,
        hair_color: color
      }));
      setShowHairColorPicker(false);
      toast.success('Hair color updated');
    } else {
      setSelectedEyeColor(color);
      setInfluencerData(prev => ({
        ...prev,
        eye_color: color
      }));
      setShowEyeColorPicker(false);
      toast.success('Eye color updated');
    }
  };

  // Color Picker Component
  const ColorPickerModal = ({
    isOpen,
    onClose,
    type,
    currentColor,
    onColorSelect
  }: {
    isOpen: boolean;
    onClose: () => void;
    type: 'hair' | 'eye';
    currentColor: string;
    onColorSelect: (type: 'hair' | 'eye', color: string) => void;
  }) => {
    const [color, setColor] = useState(currentColor || '#000000');

    const handleSave = () => {
      onColorSelect(type, color);
    };

    if (!isOpen) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color }}
              />
              Select {type === 'hair' ? 'Hair' : 'Eye'} Color
            </DialogTitle>
            <DialogDescription>
              Choose a custom color for the {type === 'hair' ? 'hair' : 'eye'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <HexColorPicker
                color={color}
                onChange={setColor}
                className="w-full max-w-xs"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label>Color Code</Label>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                />
              </div>
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-300 mt-6"
                style={{ backgroundColor: color }}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Save Color
              </Button>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Function to fetch facial template details
  const fetchFacialTemplateDetails = async (templateName: string) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/facial_templates_global?template_name=eq.${templateName}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch facial template details');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setSelectedFacialTemplate(data[0]);
        setShowFacialTemplateDetails(true);
      } else {
        toast.error('Template details not found');
      }
    } catch (error) {
      console.error('Error fetching facial template details:', error);
      toast.error('Failed to fetch template details');
    } finally {
    }
  };

  // Function to apply facial template
  const applyFacialTemplate = async () => {
    if (!selectedFacialTemplate) return;

    try {
      setIsApplyingTemplate(true);

      // Update influencer data with template values
      setInfluencerData(prev => ({
        ...prev,
        facial_features: selectedFacialTemplate.template_name,
        face_shape: selectedFacialTemplate.implied_face_shape,
        nose_style: selectedFacialTemplate.implied_nose_style,
        lip_style: selectedFacialTemplate.implied_lip_style,
        eye_color: selectedFacialTemplate.implied_eye_color,
        eye_shape: selectedFacialTemplate.implied_eye_shape,
        eyebrow_style: selectedFacialTemplate.implied_eyebrow_style,
        skin_tone: selectedFacialTemplate.implied_skin_tone,
        hair_color: selectedFacialTemplate.implied_hair_color,
        hair_length: selectedFacialTemplate.implied_hair_length,
        hair_style: selectedFacialTemplate.implied_hair_style,
        cultural_background: selectedFacialTemplate.implied_cultural_background
      }));

      toast.success('Facial template applied successfully');
      setShowFacialTemplateConfirm(false);
      setShowFacialTemplateDetails(false);
      setSelectedFacialTemplate(null);
    } catch (error) {
      console.error('Error applying facial template:', error);
      toast.error('Failed to apply template');
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  // Function to get image for implied hair style
  const getImpliedHairStyleImage = (impliedHairStyle: string) => {
    const hairStyleOption = hairStyleOptions.find(option => option.label === impliedHairStyle);
    return hairStyleOption?.image || '';
  };

  const getImpliedHairColorImage = (impliedHairColor: string) => {
    const hairColorOption = hairColorOptions.find(option => option.label === impliedHairColor);
    return hairColorOption?.image || '';
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {displayedInfluencers.map((influencer) => (
            <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
              <CardContent className="p-6 h-full">
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                    {/* LoraStatusIndicator positioned at top right */}
                    <div className="absolute right-[-15px] top-[-15px] z-10">
                      <LoraStatusIndicator
                        status={influencer.lorastatus || 0}
                        className="flex-shrink-0"
                      />
                    </div>
                    {
                      influencer.image_url ? (
                        <img
                          src={influencer.image_url}
                          alt={`${influencer.name_first} ${influencer.name_last}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No image found</h3>
                        </div>
                      )
                    }
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                          {influencer.name_first} {influencer.name_last}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex text-sm text-muted-foreground flex-col">
                        {influencer.notes ? (
                          <span className="text-sm text-muted-foreground">
                            {influencer.notes.length > 50
                              ? `${influencer.notes.substring(0, 50)}...`
                              : influencer.notes
                            }
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {influencer.lifestyle || 'No lifestyle'} • {influencer.origin_residence || 'No residence'}
                          </span>
                        )}
                      </div>
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
            {
              location.state?.create ? 'Create Influencer' : 'Edit Influencer'
            }
          </h1>
          <p className="text-muted-foreground">
            Customize your influencer's appearance and personality
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2">
          <Button onClick={() => {
            setShowEditView(false);
            setActiveTab('basic');
          }} variant="outline">
            Back to List
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
            disabled={isOptionsLoading || isSaving}
          >
            {isOptionsLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {
                  location.state?.create ? 'Create Influencer' : 'Save Changes'
                }
              </>
            )}
          </Button>
          {
            location.state?.create ?
              null
              :
              <Button
                onClick={handleOnlySave}
                className="bg-gradient-to-r from-amber-600 to-purple-600"
                disabled={isOptionsLoading || isUpdating}
              >
                {isOptionsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Update Changes
                  </>
                )}
              </Button>
          }
          <Button
            onClick={handlePreview}
            className="bg-gradient-to-r from-green-600 to-blue-600"
            disabled={isOptionsLoading || isPreviewLoading}
          >
            {isPreviewLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Image className="w-4 h-4 mr-2" />
                Preview Image
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
          <TabsList className={`grid w-full grid-cols-1 h-full md:grid-cols-2 ${influencerData.visual_only === true ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="style">Style & Environment</TabsTrigger>
            {
              influencerData.visual_only === false && <TabsTrigger value="personality">Personality</TabsTrigger>
            }
          </TabsList>

          <ScrollArea>
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* First Row: 4 columns on desktop, 2 rows on mobile */}
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                    {/* Column 1: Profile Image (hidden on mobile, shown in second row) */}
                    <div className="hidden xl:block space-y-2">
                      <Label>Profile Image</Label>
                      <div className="flex flex-col gap-2">
                        <Select
                          value={influencerData.image_url ? 'selected' : ''}
                          onValueChange={() => openImageSelector()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select profile image" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="selected" onClick={openImageSelector}>
                              {influencerData.image_url ? 'Change Image' : 'Select Image'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div
                          onClick={openImageSelector}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {influencerData.image_url ? (
                            <Card className="relative w-full max-w-[250px] group hover:shadow-lg transition-all duration-200">
                              <CardContent className="p-4">
                                <div className="relative w-full text-center" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={influencerData.image_url}
                                    alt={`${influencerData.name_first} ${influencerData.name_last} Profile`}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                                    onError={(e) => {
                                      // Fallback to placeholder if image fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md';
                                        fallback.innerHTML = `
                                          <div class="text-center">
                                            <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <p class="text-sm text-gray-500">Image not available</p>
                                          </div>
                                        `;
                                        parent.appendChild(fallback);
                                      }
                                    }}
                                    onLoad={(e) => {
                                      // Add success indicator
                                      const target = e.target as HTMLImageElement;
                                      target.style.border = '2px solid #10b981';
                                    }}
                                  />
                                  {/* Overlay on hover */}
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <div className="bg-white bg-opacity-90 rounded-full p-2">
                                        <Image className="w-4 h-4 text-gray-700" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2 text-gray-700">Profile Image</p>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="relative w-full border max-w-[250px] group hover:shadow-lg transition-all duration-200 hover:border-ai-purple-300">
                              <CardContent className="p-4">
                                <div className="relative w-full text-center" style={{ paddingBottom: '100%' }}>
                                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-ai-purple-400 transition-all duration-200">
                                    <div className="text-center">
                                      <Image className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-ai-purple-500 transition-colors duration-200" />
                                      <p className="text-sm text-gray-500 group-hover:text-ai-purple-600 transition-colors duration-200">Select image</p>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2 text-gray-600">Select Image</p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Columns 2+3: Input fields (spans 2 columns on desktop, full width on mobile) */}
                    <div className="xl:col-span-2 space-y-4">
                      {/* First Name and Last Name on one row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name <span className="text-red-500">*</span></Label>
                          <Input
                            value={influencerData.name_first}
                            onChange={(e) => handleInputChange('name_first', e.target.value)}
                            placeholder="Enter first name"
                          />
                          {validationErrors.name_first && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors.name_first}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name <span className="text-red-500">*</span></Label>
                          <Input
                            value={influencerData.name_last}
                            onChange={(e) => handleInputChange('name_last', e.target.value)}
                            placeholder="Enter last name"
                          />
                          {validationErrors.name_last && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors.name_last}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Influencer Type <span className="text-red-500">*</span></Label>
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
                        {validationErrors.influencer_type && (
                          <p className="text-sm text-red-500 mt-1">{validationErrors.influencer_type}</p>
                        )}
                      </div>

                      {/* Birth Origin and Current Residence on one row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {
                          influencerData.visual_only === false && <div className="space-y-2">
                            <Label>Birth Origin</Label>
                            <Input
                              value={influencerData.origin_birth}
                              onChange={(e) => handleInputChange('origin_birth', e.target.value)}
                              placeholder="e.g., New York, USA"
                            />
                          </div>
                        }
                        {
                          influencerData.visual_only === false && <div className="space-y-2">
                            <Label>Current Residence</Label>
                            <Input
                              value={influencerData.origin_residence}
                              onChange={(e) => handleInputChange('origin_residence', e.target.value)}
                              placeholder="e.g., Los Angeles, USA"
                            />
                          </div>
                        }
                      </div>

                      {/* Notes field - spans 2 columns */}
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={influencerData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Add any additional notes or comments about this influencer..."
                          className="min-h-[50px] resize-none"
                        />
                      </div>
                    </div>

                    {/* Column 4: Facial Features (hidden on mobile, shown in second row) */}
                    <div className="hidden xl:block space-y-2">
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
                          {renderOptionCard(
                            facialFeaturesOptions.find(option => option.label === influencerData.facial_features),
                            "Select facial features",
                            false,
                            "facial_features",
                            handleInputChange,
                            'Default'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Mobile-only layout for Profile Image and Facial Features */}
                  <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Profile Image */}
                    <div className="space-y-2">
                      <Label>Profile Image</Label>
                      <div className="flex flex-col gap-2">
                        <Select
                          value={influencerData.image_url ? 'selected' : ''}
                          onValueChange={() => openImageSelector()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select profile image" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="selected" onClick={openImageSelector}>
                              {influencerData.image_url ? 'Change Image' : 'Select Image'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div
                          onClick={openImageSelector}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {influencerData.image_url ? (
                            <Card className="relative w-full max-w-[250px] group hover:shadow-lg transition-all duration-200">
                              <CardContent className="p-4">
                                <div className="relative w-full text-center" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={influencerData.image_url}
                                    alt={`${influencerData.name_first} ${influencerData.name_last} Profile`}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                                    onError={(e) => {
                                      // Fallback to placeholder if image fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md';
                                        fallback.innerHTML = `
                                          <div class="text-center">
                                            <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <p class="text-sm text-gray-500">Image not available</p>
                                          </div>
                                        `;
                                        parent.appendChild(fallback);
                                      }
                                    }}
                                    onLoad={(e) => {
                                      // Add success indicator
                                      const target = e.target as HTMLImageElement;
                                      target.style.border = '2px solid #10b981';
                                    }}
                                  />
                                  {/* Overlay on hover */}
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <div className="bg-white bg-opacity-90 rounded-full p-2">
                                        <Image className="w-4 h-4 text-gray-700" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2 text-gray-700">Profile Image</p>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="relative w-full border max-w-[250px] group hover:shadow-lg transition-all duration-200 hover:border-ai-purple-300">
                              <CardContent className="p-4">
                                <div className="relative w-full text-center" style={{ paddingBottom: '100%' }}>
                                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-ai-purple-400 transition-all duration-200">
                                    <div className="text-center">
                                      <Image className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-ai-purple-500 transition-colors duration-200" />
                                      <p className="text-sm text-gray-500 group-hover:text-ai-purple-600 transition-colors duration-200">Select image</p>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-center font-medium mt-2 text-gray-600">Select Image</p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Facial Features */}
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
                          {renderOptionCard(
                            facialFeaturesOptions.find(option => option.label === influencerData.facial_features),
                            "Select facial features",
                            false,
                            "facial_features",
                            handleInputChange,
                            ''
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Third Row: Sex, Age, Lifestyle, Cultural Background */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
                          {renderOptionCard(
                            sexOptions.find(option => option.label === influencerData.sex),
                            "Select sex",
                            false,
                            "sex",
                            handleInputChange,
                            'Female'
                          )}
                        </div>
                      </div>
                    </div>
                    {
                      influencerData.visual_only === false && <div className="space-y-2">
                        <Label>Age</Label>
                        <div className="flex flex-col gap-2">
                          <Select
                            value={influencerData.age}
                            onValueChange={(value) => handleInputChange('age', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select age" />
                            </SelectTrigger>
                            <SelectContent>
                              {ageOptions.map((option, index) => (
                                <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div
                            onClick={() => setShowAgeSelector(true)}
                            className='flex items-center justify-center cursor-pointer w-full'
                          >
                            {renderOptionCard(
                              ageOptions.find(option => option.label === influencerData.age),
                              "Select age",
                              false,
                              "age",
                              handleInputChange,
                              'Default'
                            )}
                          </div>
                        </div>
                      </div>
                    }
                    {
                      influencerData.visual_only === false && <div className="space-y-2">
                        <Label>Lifestyle</Label>
                        <div className="flex flex-col gap-2">
                          <Select
                            value={influencerData.lifestyle}
                            onValueChange={(value) => handleInputChange('lifestyle', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select lifestyle" />
                            </SelectTrigger>
                            <SelectContent>
                              {lifestyleOptions.map((option, index) => (
                                <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div
                            onClick={() => setShowLifestyleSelector(true)}
                            className='flex items-center justify-center cursor-pointer w-full'
                          >
                            {renderOptionCard(
                              lifestyleOptions.find(option => option.label === influencerData.lifestyle),
                              "Select lifestyle",
                              false,
                              "lifestyle",
                              handleInputChange,
                              'Default'
                            )}
                          </div>
                        </div>
                      </div>
                    }
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
                          {renderOptionCard(
                            culturalBackgroundOptions.find(option => option.label === influencerData.cultural_background),
                            "Select cultural background",
                            false,
                            "cultural_background",
                            handleInputChange,
                            'Default'
                          )}
                        </div>
                      </div>
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
                          {renderOptionCard(
                            hairLengthOptions.find(option => option.label === influencerData.hair_length),
                            "Select hair length",
                            false,
                            "hair_length",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            hairStyleOptions.find(option => option.label === influencerData.hair_style),
                            "Select hair style",
                            false,
                            "hair_style",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            hairColorOptions.find(option => option.label === influencerData.hair_color),
                            "Select hair color",
                            false,
                            "hair_color",
                            handleInputChange,
                            'Default'
                          )}
                        </div>

                        {/* Color Picker Button */}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedHairColor(influencerData.hair_color || '#000000');
                            setShowHairColorPicker(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: influencerData.hair_color || '#000000' }}
                          />
                          Custom Hair Color
                        </Button>
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
                          {renderOptionCard(
                            faceShapeOptions.find(option => option.label === influencerData.face_shape),
                            "Select face shape",
                            false,
                            "face_shape",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            eyeColorOptions.find(option => option.label === influencerData.eye_color),
                            "Select eye color",
                            false,
                            "eye_color",
                            handleInputChange,
                            'Default'
                          )}
                        </div>

                        {/* Color Picker Button */}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedEyeColor(influencerData.eye_color || '#000000');
                            setShowEyeColorPicker(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: influencerData.eye_color || '#000000' }}
                          />
                          Custom Eye Color
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Eye Shape</Label>
                      <div className="flex flex-col gap-2">
                        <Select
                          value={influencerData.eye_shape}
                          onValueChange={(value) => handleInputChange('eye_shape', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select eye shape" />
                          </SelectTrigger>
                          <SelectContent>
                            {eyeShapeOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div
                          onClick={() => setShowEyeShapeSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {renderOptionCard(
                            eyeShapeOptions.find(option => option.label === influencerData.eye_shape),
                            "Select eye shape",
                            false,
                            "eye_shape",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            lipOptions.find(option => option.label === influencerData.lip_style),
                            "Select lip style",
                            false,
                            "lip_style",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            noseOptions.find(option => option.label === influencerData.nose_style),
                            "Select nose style",
                            false,
                            "nose_style",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            eyebrowOptions.find(option => option.label === influencerData.eyebrow_style),
                            "Select eyebrow style",
                            false,
                            "eyebrow_style",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            skinToneOptions.find(option => option.label === influencerData.skin_tone),
                            "Select skin tone",
                            false,
                            "skin_tone",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            bodyTypeOptions.find(option => option.label === influencerData.body_type),
                            "Select body type",
                            false,
                            "body_type",
                            handleInputChange,
                            'Default'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Bust Size</Label>
                      <div className="flex flex-col gap-2">
                        <Select
                          value={influencerData.bust_size}
                          onValueChange={(value) => handleInputChange('bust_size', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bust size" />
                          </SelectTrigger>
                          <SelectContent>
                            {bustOptions.map((option, index) => (
                              <SelectItem key={index} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div
                          onClick={() => setShowBustSelector(true)}
                          className='flex items-center justify-center cursor-pointer w-full'
                        >
                          {renderOptionCard(
                            bustOptions.find(option => option.label === influencerData.bust_size),
                            "Select bust size",
                            false,
                            "bust_size",
                            handleInputChange,
                            'Default'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-6" />

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      Content Generation Prompt
                    </Label>
                    <div className="relative">
                      <Textarea
                        value={influencerData.prompt || ''}
                        onChange={(e) => handleInputChange('prompt', e.target.value)}
                        placeholder="Describe the type of content this influencer typically creates... (e.g., 'Fashion influencer sharing daily outfit inspiration and style tips' or 'Tech reviewer creating detailed product reviews and tutorials')"
                        rows={4}
                        className="pl-10 pr-4 border-2 focus:border-green-500/50 focus:ring-green-500/20 transition-all duration-200"
                      />
                      <div className="absolute left-3 top-3 text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This prompt will be automatically used when creating content for this influencer. It helps define their content style and personality.
                    </p>
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
                          {renderOptionCard(
                            clothingEverydayOptions.find(option => option.label === influencerData.clothing_style_everyday),
                            "Select everyday style",
                            false,
                            "clothing_style_everyday",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            clothingOccasionalOptions.find(option => option.label === influencerData.clothing_style_occasional),
                            "Select occasional style",
                            false,
                            "clothing_style_occasional",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            clothingHomewearOptions.find(option => option.label === influencerData.clothing_style_home),
                            "Select home style",
                            false,
                            "clothing_style_home",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            clothingSportsOptions.find(option => option.label === influencerData.clothing_style_sports),
                            "Select sports style",
                            false,
                            "clothing_style_sports",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            clothingSexyOptions.find(option => option.label === influencerData.clothing_style_sexy_dress),
                            "Select sexy dresses style",
                            false,
                            "clothing_style_sexy_dress",
                            handleInputChange,
                            'Default'
                          )}
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
                          {renderOptionCard(
                            homeEnvironmentOptions.find(option => option.label === influencerData.home_environment),
                            "Select home environment",
                            false,
                            "home_environment",
                            handleInputChange,
                            'Default'
                          )}
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
                                  className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`);
                                  }}
                                >
                                  <ZoomIn className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                              {option.description && (
                                <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">
                                  {option.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {
              influencerData.visual_only === false &&
              <TabsContent value="personality">
                <Card>
                  <CardHeader>
                    <CardTitle>Personality & Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Button onClick={() => setShowContentFocusSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Content Focus (Max 4)
                      </Button>
                      <div className="space-y-2">
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
                                      className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2">
                      <Button onClick={() => setShowContentFocusAreasSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Content Focus Areas (Max 5)
                      </Button>
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
                                      className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2">
                      <Button onClick={() => setShowJobAreaSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Job Area
                      </Button>
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
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInputChange('job_area', '');
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-white" />
                                  </Button>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{influencerData.job_area}</p>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                        <div className="space-y-2">
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

                    <Separator className="my-6" />

                    <div className="space-y-2">
                      <Button onClick={() => setShowHobbySelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Hobbies (Max 5)
                      </Button>
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
                                      className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        <div className="space-y-2">
                          <Input
                            value={influencerData.social_circle || ''}
                            onChange={(e) => handleInputChange('social_circle', e.target.value)}
                            placeholder="Enter social circle"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2">
                      <Button onClick={() => setShowStrengthSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Strengths (Max 3)
                      </Button>
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
                                      className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2">
                      <Button onClick={() => setShowWeaknessSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Weaknesses (Max 2)
                      </Button>
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
                                      className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2">
                      <Button onClick={() => setShowSpeechSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Speech Style (Max 4)
                      </Button>
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
                                      className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2">
                      <Button onClick={() => setShowHumorSelector(true)}>
                        <Image className="w-4 h-4 mr-2" />
                        Humor Style (Max 4)
                      </Button>
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
                                      className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                      onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                    >
                                      <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Button onClick={() => setShowCoreValuesSelector(true)}>
                          <Image className="w-4 h-4 mr-2" />
                          Core Values Style (Max 5)
                        </Button>
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
                                        className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                        onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                      >
                                        <ZoomIn className="w-5 h-5 text-white" />
                                      </div>
                                    </div>
                                    <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-2">
                        <Button onClick={() => setShowGoalsSelector(true)}>
                          <Image className="w-4 h-4 mr-2" />
                          Current Goals (Max 3)
                        </Button>
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
                                        className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                        onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                      >
                                        <ZoomIn className="w-5 h-5 text-white" />
                                      </div>
                                    </div>
                                    <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-2">
                        <Button onClick={() => setShowBackgroundSelector(true)}>
                          <Image className="w-4 h-4 mr-2" />
                          Background Elements (Max 4)
                        </Button>
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
                                        className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                                        onClick={() => setPreviewImage(`https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                                      >
                                        <ZoomIn className="w-5 h-5 text-white" />
                                      </div>
                                    </div>
                                    <p className="text-sm text-center font-medium mt-2">{option.label}</p>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            }
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
                      navigate('/pricing');
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
        showBustSelector && (
          <OptionSelector
            options={bustOptions}
            onSelect={(label) => handleInputChange('bust_size', label)}
            onClose={() => setShowBustSelector(false)}
            title="Select Bust Size"
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
            field="content_focus"
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
            field="hobbies"
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
            field="speech_style"
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
            field="strengths"
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
            field="weaknesses"
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
          field="humor"
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
          field="core_values"
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
          field="current_goals"
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
          field="background_elements"
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
          field="content_focus_areas"
        />
      )}
      {/* Professional Preview Images Dialog */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-500" />
              Generating Preview Images
            </DialogTitle>
            <DialogDescription>
              Creating 3 preview variations of your influencer. Images will appear as they complete.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewImages.map((preview, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/30 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="relative">
                    {preview.isRecommended && !preview.isLoading && (
                      <Badge className="absolute top-2 left-2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold">
                        Recommended
                      </Badge>
                    )}
                    
                    {preview.isLoading ? (
                      <div className="w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-sm text-muted-foreground">Generating...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={preview.imageUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="mt-4 text-center">
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setPreviewImage(preview.imageUrl);
                                setGeneratedImageData({
                                  image_id: preview.imageUrl.split('/').pop() || '',
                                  system_filename: preview.imageUrl.split('/').pop() || ''
                                });
                              }}
                            >
                              View Full Size
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={async () => {
                                try {
                                  // Use the taskId from the preview data to get the correct image
                                  if (!preview.taskId) {
                                    throw new Error('No task ID found for the selected image');
                                  }
                                  
                                  // Find the generated image data using the taskId
                                  const imageResponse = await fetch(`https://db.nymia.ai/rest/v1/generated_images?task_id=eq.${preview.taskId}`, {
                                    method: 'GET',
                                    headers: {
                                      'Authorization': 'Bearer WeInfl3nc3withAI'
                                    }
                                  });
                                  
                                  const imageData = await imageResponse.json();
                                  
                                  if (imageData.length > 0) {
                                    const generatedImage = imageData[0];
                                    console.log(generatedImage);
                                    const num = influencerData.image_num === null || influencerData.image_num === undefined || isNaN(influencerData.image_num) ? 0 : influencerData.image_num;
                                    
                                    // Copy the generated image to the profile picture location
                                    const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': 'Bearer WeInfl3nc3withAI'
                                      },
                                      body: JSON.stringify({
                                        user: userData.id,
                                        sourcefilename: `output/${generatedImage.system_filename}`,
                                        destinationfilename: `models/${influencerData.id}/profilepic/profilepic${num}.png`
                                      })
                                    });

                                    if (!copyResponse.ok) {
                                      throw new Error('Failed to copy image to profile picture');
                                    }

                                    // Update the influencer data with the new profile picture URL
                                    const newImageUrl = `https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/models/${influencerData.id}/profilepic/profilepic${num}.png`;

                                    setInfluencerData(prev => ({
                                      ...prev,
                                      image_url: newImageUrl,
                                      image_num: num + 1
                                    }));

                                    // Update the database
                                    await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${influencerData.id}`, {
                                      method: 'PATCH',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': 'Bearer WeInfl3nc3withAI'
                                      },
                                      body: JSON.stringify({
                                        image_num: num + 1
                                      })
                                    });

                                    setShowPreviewModal(false);
                                    setPreviewImages([]);

                                    toast.success('Profile picture updated successfully!', {
                                      description: 'The selected image has been set as your influencer\'s profile picture'
                                    });
                                  } else {
                                    throw new Error('Image data not found');
                                  }
                                } catch (error) {
                                  console.error('Error setting profile picture:', error);
                                  toast.error('Failed to set profile picture');
                                }
                              }}
                            >
                              Use as Profile Picture
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isPreviewLoading && (
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Generating preview images... This may take a few moments.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {previewImage && (
        <ImagePreviewDialog
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* Image Selection Modal */}
      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-500" />
              Select Profile Image
            </DialogTitle>
            <DialogDescription>
              Choose an image from your Inbox to use as the profile picture for this influencer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {detailedImages.length} images from your Inbox
                </p>
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {loadingVaultImages ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-muted-foreground">Loading Inbox images...</p>
                  </div>
                </div>
              ) : detailedImages.length > 0 ? (
                detailedImages.map((image) => (
                  <Card
                    key={image.id}
                    className={`group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/30 backdrop-blur-sm ${image.task_id?.startsWith('upload_')
                      ? 'bg-gradient-to-br from-purple-50/20 to-pink-50/20 dark:from-purple-950/5 dark:to-pink-950/5 hover:border-purple-500/30'
                      : 'bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5'
                      } cursor-pointer`}
                    onClick={() => {
                      setProfileImageId(image.id);
                      const imageUrl = `https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`;
                      handleImageSelect(imageUrl);
                    }}
                  >
                    <CardContent className="p-4">
                      {/* Top Row: File Type, Ratings, Favorite */}
                      <div className="flex items-center justify-between mb-3">
                        {/* File Type Icon */}
                        <div className={`rounded-full w-8 h-8 flex items-center justify-center shadow-md ${image.task_id?.startsWith('upload_')
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                          {image.task_id?.startsWith('upload_') ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                          ) : image.file_type === 'video' ? (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15V7l8 5-8 5z" opacity="0.3" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                              <circle cx="8.5" cy="8.5" r="1.5" opacity="0.8" />
                            </svg>
                          )}
                        </div>

                        {/* Rating Stars */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= image.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>

                        {/* Favorite Heart */}
                        <div>
                          {image.favorite ? (
                            <div className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image */}
                      <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                        <img
                          src={`https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`}
                          alt={image.system_filename}
                          className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                          onError={(e) => {
                            // Fallback for uploaded files that might not be accessible via CDN
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'absolute inset-0 w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-md flex items-center justify-center';
                            fallback.innerHTML = `
                              <div class="text-center">
                                <svg class="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                <p class="text-xs text-purple-600 dark:text-purple-400">Uploaded File</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${image.system_filename}</p>
                              </div>
                            `;
                            target.parentNode?.appendChild(fallback);
                          }}
                        />

                        {/* Zoom Button */}
                        <div
                          className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            const imageUrl = `https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`;
                            setPreviewImage(imageUrl);
                          }}
                        >
                          <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* User Notes */}
                      {image.user_notes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {image.user_notes}
                          </p>
                        </div>
                      )}

                      {/* User Tags */}
                      {image.user_tags && image.user_tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {image.user_tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.trim()}
                            </Badge>
                          ))}
                          {image.user_tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{image.user_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Filename and Date */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                          {image.system_filename}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(image.created_at).toLocaleDateString()}
                        </div>
                        {image.user_filename && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                            {image.user_filename}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No images found</h3>
                  <p className="text-muted-foreground">
                    You don't have any images in your vault yet. Create some content first!
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showHairColorPicker && (
        <ColorPickerModal
          isOpen={showHairColorPicker}
          onClose={() => setShowHairColorPicker(false)}
          type="hair"
          currentColor={selectedHairColor}
          onColorSelect={handleColorSelect}
        />
      )}

      {showEyeColorPicker && (
        <ColorPickerModal
          isOpen={showEyeColorPicker}
          onClose={() => setShowEyeColorPicker(false)}
          type="eye"
          currentColor={selectedEyeColor}
          onColorSelect={handleColorSelect}
        />
      )}

      {
        showEyeShapeSelector && (
          <OptionSelector
            options={eyeShapeOptions}
            onSelect={(label) => handleInputChange('eye_shape', label)}
            onClose={() => setShowEyeShapeSelector(false)}
            title="Select Eye Shape"
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
        showAgeSelector && (
          <OptionSelector
            options={ageOptions}
            onSelect={(label) => handleInputChange('age', label)}
            onClose={() => setShowAgeSelector(false)}
            title="Select Age"
          />
        )
      }

      {
        showLifestyleSelector && (
          <OptionSelector
            options={lifestyleOptions}
            onSelect={(label) => handleInputChange('lifestyle', label)}
            onClose={() => setShowLifestyleSelector(false)}
            title="Select Lifestyle"
          />
        )
      }

      {/* Facial Template Details Modal */}
      {showFacialTemplateDetails && selectedFacialTemplate && (
        <Dialog open={showFacialTemplateDetails} onOpenChange={setShowFacialTemplateDetails}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 py-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {selectedFacialTemplate.template_name}
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-1">
                    {selectedFacialTemplate.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-8">
              {/* Implied Features Grid */}
              <div className="space-y-6">
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Template Features
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    These features will be automatically applied when you set this template
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Face Shape */}
                  <Card className="group border-2 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-950/10 dark:to-indigo-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {faceShapeOptions.find(option => option.label === selectedFacialTemplate.implied_face_shape)?.image ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${faceShapeOptions.find(option => option.label === selectedFacialTemplate.implied_face_shape)?.image}`}
                                alt={selectedFacialTemplate.implied_face_shape}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-blue-600 dark:text-blue-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Face Shape
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_face_shape}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hair Style */}
                  <Card className="group border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/10 dark:to-pink-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {getImpliedHairStyleImage(selectedFacialTemplate.implied_hair_style) ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${getImpliedHairStyleImage(selectedFacialTemplate.implied_hair_style)}`}
                                alt={selectedFacialTemplate.implied_hair_style}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-purple-600 dark:text-purple-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Hair Style
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_hair_style}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hair Color */}
                  <Card className="group border-2 border-red-500/20 hover:border-red-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-red-50/30 to-pink-50/30 dark:from-red-950/10 dark:to-pink-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {getImpliedHairColorImage(selectedFacialTemplate.implied_hair_color) ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${getImpliedHairColorImage(selectedFacialTemplate.implied_hair_color)}`}
                                alt={selectedFacialTemplate.implied_hair_color}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-purple-600 dark:text-purple-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Hair Color
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_hair_color}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hair Length */}
                  <Card className="group border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-950/10 dark:to-emerald-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {hairLengthOptions.find(option => option.label === selectedFacialTemplate.implied_hair_length)?.image ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${hairLengthOptions.find(option => option.label === selectedFacialTemplate.implied_hair_length)?.image}`}
                                alt={selectedFacialTemplate.implied_hair_length}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-green-600 dark:text-green-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Hair Length
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_hair_length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Eye Color */}
                  <Card className="group border-2 border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {eyeColorOptions.find(option => option.label === selectedFacialTemplate.implied_eye_color)?.image ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${eyeColorOptions.find(option => option.label === selectedFacialTemplate.implied_eye_color)?.image}`}
                                alt={selectedFacialTemplate.implied_eye_color}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-amber-600 dark:text-amber-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Eye Color
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_eye_color}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Eye Shape */}
                  <Card className="group border-2 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-cyan-50/30 to-blue-50/30 dark:from-cyan-950/10 dark:to-blue-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {eyeShapeOptions.find(option => option.label === selectedFacialTemplate.implied_eye_shape)?.image ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${eyeShapeOptions.find(option => option.label === selectedFacialTemplate.implied_eye_shape)?.image}`}
                                alt={selectedFacialTemplate.implied_eye_shape}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-cyan-600 dark:text-cyan-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Eye Shape
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_eye_shape}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Nose Style */}
                  <Card className="group border-2 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-orange-50/30 to-red-50/30 dark:from-orange-950/10 dark:to-red-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {noseOptions.find(option => option.label === selectedFacialTemplate.implied_nose_style)?.image ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${noseOptions.find(option => option.label === selectedFacialTemplate.implied_nose_style)?.image}`}
                                alt={selectedFacialTemplate.implied_nose_style}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-orange-600 dark:text-orange-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Nose Style
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_nose_style}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lip Style */}
                  <Card className="group border-2 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-pink-50/30 to-rose-50/30 dark:from-pink-950/10 dark:to-rose-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {lipOptions.find(option => option.label === selectedFacialTemplate.implied_lip_style)?.image ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${lipOptions.find(option => option.label === selectedFacialTemplate.implied_lip_style)?.image}`}
                                alt={selectedFacialTemplate.implied_lip_style}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-pink-600 dark:text-pink-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Lip Style
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_lip_style}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Eyebrow Style */}
                  <Card className="group border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-yellow-50/30 to-amber-50/30 dark:from-yellow-950/10 dark:to-amber-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {eyebrowOptions.find(option => option.label === selectedFacialTemplate.implied_eyebrow_style)?.image ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${eyebrowOptions.find(option => option.label === selectedFacialTemplate.implied_eyebrow_style)?.image}`}
                                alt={selectedFacialTemplate.implied_eyebrow_style}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-yellow-600 dark:text-yellow-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Eyebrow Style
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_eyebrow_style}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skin Tone */}
                  <Card className="group border-2 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/10 dark:to-purple-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {skinToneOptions.find(option => option.label === selectedFacialTemplate.implied_skin_tone)?.image ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${skinToneOptions.find(option => option.label === selectedFacialTemplate.implied_skin_tone)?.image}`}
                                alt={selectedFacialTemplate.implied_skin_tone}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-indigo-600 dark:text-indigo-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Skin Tone
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_skin_tone}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cultural Background */}
                  <Card className="group border-2 border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-teal-50/30 to-cyan-50/30 dark:from-teal-950/10 dark:to-cyan-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl overflow-hidden shadow-lg">
                            {culturalBackgroundOptions.find(option => option.label === selectedFacialTemplate.implied_cultural_background)?.image ? (
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${culturalBackgroundOptions.find(option => option.label === selectedFacialTemplate.implied_cultural_background)?.image}`}
                                alt={selectedFacialTemplate.implied_cultural_background}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="text-sm text-teal-600 dark:text-teal-400">No Image</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Cultural Background
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {selectedFacialTemplate.implied_cultural_background}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFacialTemplateDetails(false);
                    setSelectedFacialTemplate(null);
                    setShowFacialFeaturesSelector(true);
                  }}
                  className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="w-5 h-5 mr-3 rotate-180" />
                  Back to Features
                </Button>
                <Button
                  onClick={() => {
                    setShowFacialTemplateDetails(false);
                    setShowFacialTemplateConfirm(true);
                  }}
                  className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Set Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Facial Template Confirmation Modal */}
      {showFacialTemplateConfirm && selectedFacialTemplate && (
        <Dialog open={showFacialTemplateConfirm} onOpenChange={setShowFacialTemplateConfirm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Confirm Template Application</span>
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Are you sure you want to apply the <strong>{selectedFacialTemplate.template_name}</strong> template?
                This will update all the following features:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Current vs New Values */}
              <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 border border-amber-200/50 dark:border-amber-800/50">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Features to be Updated
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Face Shape:</span>
                      <span className="font-medium">{influencerData.face_shape} → {selectedFacialTemplate.implied_face_shape}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Hair Style:</span>
                      <span className="font-medium">{influencerData.hair_style} → {selectedFacialTemplate.implied_hair_style}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Hair Color:</span>
                      <span className="font-medium">{influencerData.hair_color} → {selectedFacialTemplate.implied_hair_color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Hair Length:</span>
                      <span className="font-medium">{influencerData.hair_length} → {selectedFacialTemplate.implied_hair_length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Eye Color:</span>
                      <span className="font-medium">{influencerData.eye_color} → {selectedFacialTemplate.implied_eye_color}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Nose Style:</span>
                      <span className="font-medium">{influencerData.nose_style} → {selectedFacialTemplate.implied_nose_style}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Lip Style:</span>
                      <span className="font-medium">{influencerData.lip_style} → {selectedFacialTemplate.implied_lip_style}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Eye Shape:</span>
                      <span className="font-medium">{influencerData.eye_shape} → {selectedFacialTemplate.implied_eye_shape}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Eyebrow Style:</span>
                      <span className="font-medium">{influencerData.eyebrow_style} → {selectedFacialTemplate.implied_eyebrow_style}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Cultural Background:</span>
                      <span className="font-medium">{influencerData.cultural_background} → {selectedFacialTemplate.implied_cultural_background}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg p-4 border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">Warning</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This action will overwrite all current facial features with the template values.
                      This change cannot be undone automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFacialTemplateConfirm(false);
                    setSelectedFacialTemplate(null);
                  }}
                  className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={applyFacialTemplate}
                  disabled={isApplyingTemplate}
                  className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplyingTemplate ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Applying Template...
                    </>
                  ) : (
                    <>
                      <Settings className="w-5 h-5 mr-3" />
                      Apply Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Helper function to render option cards with descriptions
const renderOptionCard = (option: Option | undefined, placeholder: string = "Select option", showDescription: boolean = false, item: string = '', handleInputChange: (field: string, value: string) => void, refreshData: string = '') => {
  if (!option?.image) {
    return (
      <Card className="relative w-full border max-w-[250px]">
        <CardContent className="p-4">
          <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
            {placeholder}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative w-full max-w-[250px]">
      <CardContent className="p-4">
        <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
          <img
            src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              handleInputChange(item, refreshData);
            }}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </Button>
        </div>
        <p className="text-sm text-center font-medium mt-2">{option.label}</p>
        {showDescription && option.description && (
          <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">
            {option.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
