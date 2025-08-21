import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Loader2, User, Sparkles, Palette, Settings, ArrowRight, Check, ZoomIn, RefreshCcw, Globe, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import config from '@/config/config';

interface InfluencerWizardProps {
  onComplete: () => void;
}

interface InfluencerData {
  user_id: string;
  influencer_type: string;
  image_url: string;
  name_first: string;
  name_last: string;
  visual_only: boolean;
  sex: string;
  cultural_background: string;
  hair_length: string;
  hair_color: string;
  hair_style: string;
  eye_color: string;
  lip_style: string;
  nose_style: string;
  eyebrow_style: string;
  face_shape: string;
  eye_shape: string;
  facial_features: string;
  bust_size: string;
  skin_tone: string;
  body_type: string;
  color_palette: string[];
  clothing_style_everyday: string;
  clothing_style_occasional: string;
  clothing_style_home: string;
  clothing_style_sports: string;
  clothing_style_sexy_dress: string;
  home_environment: string;
  age: string;
  lifestyle: string;
  origin_birth: string;
  origin_residence: string;
  content_focus: string[];
  content_focus_areas: string[];
  job_area: string;
  job_title: string;
  job_vibe: string;
  hobbies: string[];
  social_circle: string;
  strengths: string[];
  weaknesses: string[];
  speech_style: string[];
  humor: string[];
  core_values: string[];
  current_goals: string[];
  background_elements: string[];
  prompt: string;
  notes: string;
  image_num: number;
}

interface Option {
  label: string;
  image: string;
  description?: string;
  ethnics_stereotype?: string;
  sex?: string;
  license?: string;
}

interface SexOption {
  value: string;
  label: string;
  description: string;
  image: string;
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

interface NameSuggestion {
  rank: number;
  full_name: string;
  first_name: string;
  last_name: string;
  nick_name: string;
  social_handle: string;
  reasoning: string;
  cultural_authenticity: number;
  social_media_appeal: number;
  brand_potential: number;
  personality_match: number;
}

interface NameWizardResponse {
  influencer_profile_summary: {
    cultural_background: string;
    age_lifestyle: string;
    personality_archetype: string;
    content_focus: string;
    key_traits: string[];
  };
  name_suggestions: NameSuggestion[];
  generation_metadata: {
    version: string;
    cultural_research_applied: boolean;
    social_media_optimization: boolean;
    personality_integration: boolean;
    dynamic_name_generation: boolean;
  };
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
  condition?: (influencerData: InfluencerData) => boolean;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Sex Selection',
    description: 'Choose the sex of your influencer',
    icon: User
  },
  {
    id: 2,
    title: 'Age Selection',
    description: 'Choose age range',
    icon: Palette
  },
  {
    id: 3,
    title: 'Ethnics Selection',
    description: 'Choose the ethnic background',
    icon: Settings
  },
  {
    id: 4,
    title: 'Facial Features',
    description: 'Select facial features template',
    icon: Sparkles
  },
  {
    id: 5,
    title: 'Cultural Background',
    description: 'Select cultural background',
    icon: Settings
  },
  {
    id: 6,
    title: 'Hair Length',
    description: 'Choose hair length',
    icon: Settings
  },
  {
    id: 7,
    title: 'Hair Style',
    description: 'Select hair style',
    icon: Settings
  },
  {
    id: 8,
    title: 'Hair Color',
    description: 'Choose hair color',
    icon: Settings
  },
  {
    id: 9,
    title: 'Face Shape',
    description: 'Select face shape',
    icon: Settings
  },
  {
    id: 10,
    title: 'Eye Color',
    description: 'Choose eye color',
    icon: Settings
  },
  {
    id: 11,
    title: 'Skin Tone',
    description: 'Select skin tone',
    icon: Settings
  },
  {
    id: 12,
    title: 'Body Type',
    description: 'Choose body type',
    icon: Settings
  },
  {
    id: 13,
    title: 'Bust Size',
    description: 'Select bust size (Female only)',
    icon: Settings,
    condition: (influencerData: InfluencerData) => influencerData.sex === 'Female'
  },
  {
    id: 14,
    title: 'Origin & Residence',
    description: 'Set birth origin and current residence',
    icon: Globe
  },
  {
    id: 15,
    title: 'Name',
    description: 'Enter first and last name',
    icon: User
  },
  {
    id: 16,
    title: 'Review & Create',
    description: 'Review all selections and create influencer',
    icon: Settings
  }
];

// Helper function to get active steps based on conditions
const getActiveSteps = (influencerData: InfluencerData) => {
  return steps.filter(step => !step.condition || step.condition(influencerData));
};

export function InfluencerWizard({ onComplete }: InfluencerWizardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sexOptions, setSexOptions] = useState<SexOption[]>([]);
  const [isLoadingSexOptions, setIsLoadingSexOptions] = useState(true);
  const [facialFeaturesOptions, setFacialFeaturesOptions] = useState<Option[]>([]);
  const [isLoadingFacialFeatures, setIsLoadingFacialFeatures] = useState(true);
  const [ageOptions, setAgeOptions] = useState<Option[]>([]);
  const [isLoadingAge, setIsLoadingAge] = useState(true);
  const [lifestyleOptions, setLifestyleOptions] = useState<Option[]>([]);
  const [isLoadingLifestyle, setIsLoadingLifestyle] = useState(true);
  const [culturalBackgroundOptions, setCulturalBackgroundOptions] = useState<Option[]>([]);
  const [isLoadingCulturalBackground, setIsLoadingCulturalBackground] = useState(true);
  const [hairLengthOptions, setHairLengthOptions] = useState<Option[]>([]);
  const [isLoadingHairLength, setIsLoadingHairLength] = useState(true);
  const [hairStyleOptions, setHairStyleOptions] = useState<Option[]>([]);
  const [isLoadingHairStyle, setIsLoadingHairStyle] = useState(true);
  const [hairColorOptions, setHairColorOptions] = useState<Option[]>([]);
  const [isLoadingHairColor, setIsLoadingHairColor] = useState(true);
  const [faceShapeOptions, setFaceShapeOptions] = useState<Option[]>([]);
  const [isLoadingFaceShape, setIsLoadingFaceShape] = useState(true);
  const [eyeColorOptions, setEyeColorOptions] = useState<Option[]>([]);
  const [isLoadingEyeColor, setIsLoadingEyeColor] = useState(true);
  const [eyeShapeOptions, setEyeShapeOptions] = useState<Option[]>([]);
  const [isLoadingEyeShape, setIsLoadingEyeShape] = useState(true);
  const [lipStyleOptions, setLipStyleOptions] = useState<Option[]>([]);
  const [isLoadingLipStyle, setIsLoadingLipStyle] = useState(true);
  const [noseStyleOptions, setNoseStyleOptions] = useState<Option[]>([]);
  const [isLoadingNoseStyle, setIsLoadingNoseStyle] = useState(true);
  const [eyebrowStyleOptions, setEyebrowStyleOptions] = useState<Option[]>([]);
  const [isLoadingEyebrowStyle, setIsLoadingEyebrowStyle] = useState(true);
  const [skinToneOptions, setSkinToneOptions] = useState<Option[]>([]);
  const [isLoadingSkinTone, setIsLoadingSkinTone] = useState(true);
  const [bodyTypeOptions, setBodyTypeOptions] = useState<Option[]>([]);
  const [isLoadingBodyType, setIsLoadingBodyType] = useState(true);
  const [bustSizeOptions, setBustSizeOptions] = useState<Option[]>([]);
  const [isLoadingBustSize, setIsLoadingBustSize] = useState(true);
  const [ethnicsOptions, setEthnicsOptions] = useState<Option[]>([]);
  const [isLoadingEthnics, setIsLoadingEthnics] = useState(true);
  const [selectedFacialTemplate, setSelectedFacialTemplate] = useState<FacialTemplateDetail | null>(null);
  const [showFacialTemplateDetails, setShowFacialTemplateDetails] = useState(false);
  const [showFacialTemplateConfirm, setShowFacialTemplateConfirm] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [hasAutoRendered, setHasAutoRendered] = useState(false);
  const [showStep3Modal, setShowStep3Modal] = useState(false);
  const [showStep4Modal, setShowStep4Modal] = useState(false);
  const [showFacialTemplateChoiceModal, setShowFacialTemplateChoiceModal] = useState(false);
  const [showPreviewImages, setShowPreviewImages] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);
  const [showMagnifyModal, setShowMagnifyModal] = useState(false);
  const [magnifyImageUrl, setMagnifyImageUrl] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const userData = useSelector((state: RootState) => state.user);

  // Credit checking states
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [creditCostData, setCreditCostData] = useState<any>(null);

  // Check credit cost for influencer wizard generation
  const checkCreditCost = async (itemType: string) => {
    try {
      setIsCheckingCredits(true);
      const response = await fetch('https://api.nymia.ai/v1/getgems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user_id: userData.id,
          item: itemType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to check credit cost');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking credit cost:', error);
      toast.error('Failed to check credit cost. Please try again.');
      return null;
    } finally {
      setIsCheckingCredits(false);
    }
  };

  const [influencerData, setInfluencerData] = useState<InfluencerData>({
    user_id: userData.id,
    influencer_type: 'Lifestyle',
    image_url: '',
    name_first: '',
    name_last: '',
    visual_only: false,
    sex: '',
    cultural_background: '',
    hair_length: '',
    hair_color: '',
    hair_style: '',
    eye_color: '',
    lip_style: '',
    nose_style: '',
    eyebrow_style: '',
    face_shape: '',
    eye_shape: '',
    facial_features: '',
    bust_size: '',
    skin_tone: '',
    body_type: '',
    color_palette: [],
    clothing_style_everyday: '',
    clothing_style_occasional: '',
    clothing_style_home: '',
    clothing_style_sports: '',
    clothing_style_sexy_dress: '',
    home_environment: '',
    age: '',
    lifestyle: '',
    origin_birth: '',
    origin_residence: '',
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
    image_num: 0
  });

  const [nameWizardResponse, setNameWizardResponse] = useState<NameWizardResponse | null>(null);
  const [isLoadingNameWizard, setIsLoadingNameWizard] = useState(false);
  const [showNameSelectionModal, setShowNameSelectionModal] = useState(false);
  const [selectedNameSuggestion, setSelectedNameSuggestion] = useState<NameSuggestion | null>(null);

  // Preview functionality state
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewInfluencerId, setPreviewInfluencerId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatedImageData, setGeneratedImageData] = useState<{ image_id: string; system_filename: string } | null>(null);
  const [ethnic, setEthnic] = useState<string | null>(null);
  const [profileImageId, setProfileImageId] = useState<string | null>(null);

  // Enhanced preview functionality state
  const [previewImages, setPreviewImages] = useState<Array<{
    imageUrl: string;
    negativePrompt: string;
    isRecommended?: boolean;
    isLoading?: boolean;
    taskId?: string
  }>>([]);

  // Profile picture selection state
  const [selectedProfilePictureUrl, setSelectedProfilePictureUrl] = useState<string | null>(null);

  // Preview history state
  const [previewHistory, setPreviewHistory] = useState<Array<{
    id: string;
    imageUrl: string;
    negativePrompt: string;
    isRecommended: boolean;
    taskId: string;
    created_at: string;
  }>>([]);

  // Selected previous image state
  const [selectedPreviousImage, setSelectedPreviousImage] = useState<string | null>(null);

  // Previously generated images state
  const [previouslyGeneratedImages, setPreviouslyGeneratedImages] = useState<Array<{
    id: string;
    system_filename: string;
    file_path: string;
    created_at: string;
    task_id?: string;
    user_filename?: string;
    imageUrl?: string;
    isRecommended?: boolean;
  }>>([]);
  const [isLoadingPreviousImages, setIsLoadingPreviousImages] = useState(false);

  // console.log(influencerData);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Show toast when entering a step with existing value
  useEffect(() => {
    // Remove the automatic page reset - let users stay on their current page
    // setCurrentPage(1);

    const getStepValue = () => {
      switch (currentStep) {
        case 1: return influencerData.sex;
        case 2: return influencerData.age;
        case 3: return ethnic;
        case 4: return influencerData.facial_features;
        case 5: return influencerData.cultural_background;
        case 6: return influencerData.hair_length;
        case 7: return influencerData.hair_style;
        case 8: return influencerData.hair_color;
        case 9: return influencerData.face_shape;
        case 10: return influencerData.eye_color;
        case 11: return influencerData.skin_tone;
        case 12: return influencerData.body_type;
        case 13: return influencerData.bust_size;
        default: return '';
      }
    };

    const stepValue = getStepValue();
    if (stepValue && stepValue !== '') {
      const stepName = steps[currentStep - 1]?.title || 'this step';
      toast.success(`${stepValue} selected for ${stepName}.`, {
        position: 'bottom-center',
        duration: 4000
      });
    }
  }, [currentStep, influencerData]);

  // Fetch sex options from API
  useEffect(() => {
    const fetchSexOptions = async () => {
      try {
        setIsLoadingSexOptions(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_sex`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setSexOptions(responseData.fieldoptions.map((item: any) => ({
              value: item.label,
              label: item.label,
              image: item.image,
              description: item.description
            })));
          } else {
            console.error('Invalid response format or no fieldoptions found');
            // Fallback to default options
            setSexOptions([
              {
                value: 'Female',
                label: 'Female',
                description: 'Create a female influencer persona',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
              },
              {
                value: 'Male',
                label: 'Male',
                description: 'Create a male influencer persona',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setIsLoadingSexOptions(false);
      }
    };

    fetchSexOptions();
  }, []);

  // Auto-start preview when reaching step 15 (only once and only if no images exist)
  // Auto-start preview when reaching step 15 (only once and only if no images exist)
  useEffect(() => {
    if (currentStep === 15 && !isPreviewLoading && !hasAutoRendered && previewHistory.length === 0 && previewImages.length === 0) {
      // Small delay to ensure the step content is rendered
      const timer = setTimeout(() => {
        executePreview(); // Direct call to executePreview to bypass credit check
        setHasAutoRendered(true);
      }, 500);

      return () => clearTimeout(timer);
    }

    // Don't reset the flag when coming back from step 16 to prevent re-rendering
    if (currentStep < 15) {
      setHasAutoRendered(false);
    }
  }, [currentStep, isPreviewLoading, hasAutoRendered, previewHistory.length, previewImages.length]);

  // Fetch facial features options from API
  const fetchFacialFeaturesOptions = async (ethnic?: string) => {
    try {
      setIsLoadingFacialFeatures(true);

      // Build query parameters for ethnic and sex filtering
      const queryParams = new URLSearchParams();
      if (ethnic) {
        queryParams.append('ethnics_stereotype', `eq.${ethnic}`);
      }
      if (influencerData.sex) {
        queryParams.append('sex', `eq.${influencerData.sex.toLowerCase()}`);
      }

      // Fetch templates from ethnic-specific API with sex filtering
      const templatesResponse = await fetch(`${config.supabase_server_url}/facial_templates_global?${queryParams.toString()}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      // Fetch images from original API
      const imagesResponse = await fetch(`${config.backend_url}/fieldoptions?fieldtype=facial_features`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (templatesResponse.ok && imagesResponse.ok) {
        const templatesData = await templatesResponse.json();
        const imagesData = await imagesResponse.json();

        if (Array.isArray(templatesData) && imagesData && imagesData.fieldoptions && Array.isArray(imagesData.fieldoptions)) {
          // Match templates with images by label === template_name
          const matchedOptions = templatesData.map((template: any) => {
            const matchingImage = imagesData.fieldoptions.find((imageItem: any) =>
              imageItem.label === template.template_name
            );

            return {
              label: template.template_name || template.label,
              image: matchingImage ? matchingImage.image : template.image || template.template_image,
              description: template.description || template.base_prompt
            };
          });

          // console.log(matchedOptions);

          setFacialFeaturesOptions(matchedOptions);
        }
      }
    } catch (error) {
      console.error('Error fetching facial features options:', error);
    } finally {
      setIsLoadingFacialFeatures(false);
    }
  };

  useEffect(() => {
    fetchFacialFeaturesOptions(ethnic || undefined);
  }, [ethnic, influencerData.sex]);

  // Fetch age options from API
  useEffect(() => {
    const fetchAgeOptions = async () => {
      try {
        setIsLoadingAge(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_age`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setAgeOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching age options:', error);
      } finally {
        setIsLoadingAge(false);
      }
    };

    fetchAgeOptions();
  }, []);

  // Fetch lifestyle options from API
  useEffect(() => {
    const fetchLifestyleOptions = async () => {
      try {
        setIsLoadingLifestyle(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_lifestyle`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setLifestyleOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching lifestyle options:', error);
      } finally {
        setIsLoadingLifestyle(false);
      }
    };

    fetchLifestyleOptions();
  }, []);

  // Fetch cultural background options from API
  const fetchCulturalBackgroundOptions = async (ethnic: string) => {
    try {
      setIsLoadingCulturalBackground(true);
      const templatesResponse = await fetch(`${config.supabase_server_url}/prompt_mappings?category=eq.cultural_background&ethnics_stereotype=eq.${ethnic}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const imageResponse = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_cultural_background`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });
      if (imageResponse.ok && templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        const imagesData = await imageResponse.json();

        // console.log(templatesData);
        // console.log(imagesData);

        if (Array.isArray(templatesData) && imagesData && imagesData.fieldoptions && Array.isArray(imagesData.fieldoptions)) {
          // Match templates with images by label === template_name
          const matchedOptions = templatesData.map((template: any) => {
            const matchingImage = imagesData.fieldoptions.find((imageItem: any) =>
              imageItem.label === template.property
            );

            return {
              label: template.property || template.label,
              image: matchingImage ? matchingImage.image : template.image || template.template_image,
              description: template.description || template.base_prompt
            };
          });

          // console.log(matchedOptions);

          setCulturalBackgroundOptions(matchedOptions);
        }
      }
    } catch (error) {
      console.error('Error fetching cultural background options:', error);
    } finally {
      setIsLoadingCulturalBackground(false);
    }
  };

  useEffect(() => {
    fetchCulturalBackgroundOptions(ethnic || 'Default');
  }, [ethnic]);

  // Fetch hair length options from API
  useEffect(() => {
    const fetchHairLengthOptions = async () => {
      try {
        setIsLoadingHairLength(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_hair_length`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setHairLengthOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching hair length options:', error);
      } finally {
        setIsLoadingHairLength(false);
      }
    };

    fetchHairLengthOptions();
  }, []);

  // Fetch hair style options from API
  useEffect(() => {
    const fetchHairStyleOptions = async () => {
      try {
        setIsLoadingHairStyle(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_hair_style`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setHairStyleOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching hair style options:', error);
      } finally {
        setIsLoadingHairStyle(false);
      }
    };

    fetchHairStyleOptions();
  }, []);

  // Fetch hair color options from API
  useEffect(() => {
    const fetchHairColorOptions = async () => {
      try {
        setIsLoadingHairColor(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_hair_color`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setHairColorOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching hair color options:', error);
      } finally {
        setIsLoadingHairColor(false);
      }
    };

    fetchHairColorOptions();
  }, []);

  // Fetch face shape options from API
  useEffect(() => {
    const fetchFaceShapeOptions = async () => {
      try {
        setIsLoadingFaceShape(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_face_shape`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setFaceShapeOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching face shape options:', error);
      } finally {
        setIsLoadingFaceShape(false);
      }
    };

    fetchFaceShapeOptions();
  }, []);

  // Fetch eye color options from API
  useEffect(() => {
    const fetchEyeColorOptions = async () => {
      try {
        setIsLoadingEyeColor(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_eye_color`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setEyeColorOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching eye color options:', error);
      } finally {
        setIsLoadingEyeColor(false);
      }
    };

    fetchEyeColorOptions();
  }, []);

  // Fetch eye shape options from API
  useEffect(() => {
    const fetchEyeShapeOptions = async () => {
      try {
        setIsLoadingEyeShape(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_eye_shape`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setEyeShapeOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching eye shape options:', error);
      } finally {
        setIsLoadingEyeShape(false);
      }
    };

    fetchEyeShapeOptions();
  }, []);

  // Fetch lip style options from API
  useEffect(() => {
    const fetchLipStyleOptions = async () => {
      try {
        setIsLoadingLipStyle(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_lip_style`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setLipStyleOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching lip style options:', error);
      } finally {
        setIsLoadingLipStyle(false);
      }
    };

    fetchLipStyleOptions();
  }, []);

  // Fetch nose style options from API
  useEffect(() => {
    const fetchNoseStyleOptions = async () => {
      try {
        setIsLoadingNoseStyle(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_nose_style`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setNoseStyleOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching nose style options:', error);
      } finally {
        setIsLoadingNoseStyle(false);
      }
    };

    fetchNoseStyleOptions();
  }, []);

  // Fetch eyebrow style options from API
  useEffect(() => {
    const fetchEyebrowStyleOptions = async () => {
      try {
        setIsLoadingEyebrowStyle(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_eyebrow_style`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setEyebrowStyleOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching eyebrow style options:', error);
      } finally {
        setIsLoadingEyebrowStyle(false);
      }
    };

    fetchEyebrowStyleOptions();
  }, []);

  // Fetch skin tone options from API
  useEffect(() => {
    const fetchSkinToneOptions = async () => {
      try {
        setIsLoadingSkinTone(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_skin_tone`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setSkinToneOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching skin tone options:', error);
      } finally {
        setIsLoadingSkinTone(false);
      }
    };

    fetchSkinToneOptions();
  }, []);

  // Fetch body type options from API
  useEffect(() => {
    const fetchBodyTypeOptions = async () => {
      try {
        setIsLoadingBodyType(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_body_type`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            // Filter based on selected sex from Step 1
            const filteredOptions = responseData.fieldoptions.filter((item: any) => {
              return !item.sex || item.sex === influencerData.sex;
            });
            
            setBodyTypeOptions(filteredOptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description,
              ethnics_stereotype: item.ethnics_stereotype,
              sex: item.sex,
              license: item.license
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching body type options:', error);
      } finally {
        setIsLoadingBodyType(false);
      }
    };

    fetchBodyTypeOptions();
  }, [influencerData.sex]);

  // Fetch bust size options from API
  useEffect(() => {
    const fetchBustSizeOptions = async () => {
      try {
        setIsLoadingBustSize(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_bust`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setBustSizeOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching bust size options:', error);
      } finally {
        setIsLoadingBustSize(false);
      }
    };

    fetchBustSizeOptions();
  }, []);

  // Fetch ethnics options from API
  useEffect(() => {
    const fetchEthnicsOptions = async () => {
      try {
        setIsLoadingEthnics(true);
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=wizard_ethnics_stereotype`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          console.log(responseData);

          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setEthnicsOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching ethnics options:', error);
      } finally {
        setIsLoadingEthnics(false);
      }
    };

    fetchEthnicsOptions();
  }, []);

  // Function to call name wizard API
  const fetchNameSuggestions = async () => {
    try {
      setIsLoadingNameWizard(true);
      const response = await fetch(`${config.backend_url}/namewizard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(influencerData)
      });

      if (response.ok) {
        const data = await response.json();
        // console.log(data);
        if (Array.isArray(data) && data.length > 0) {
          const output = data[0].output;
          if (typeof output === 'string') {
            try {
              const parsedResponse = JSON.parse(output);
              if (
                parsedResponse &&
                parsedResponse.name_suggestions &&
                Array.isArray(parsedResponse.name_suggestions)
              ) {
                setNameWizardResponse(parsedResponse);
              } else {
                toast.error('API response missing name suggestions.', {
                  position: 'bottom-center'
                });
                setNameWizardResponse(null);
              }
            } catch (parseError) {
              console.error('Error parsing name wizard response:', parseError);
              toast.error('Error parsing name suggestions (invalid JSON in output).', {
                position: 'bottom-center'
              });
              setNameWizardResponse(null);
            }
          } else {
            toast.error('API response missing output string.', {
              position: 'bottom-center'
            });
            setNameWizardResponse(null);
          }
        } else {
          toast.error('API response is not a valid array.', {
            position: 'bottom-center'
          });
          setNameWizardResponse(null);
        }
      } else {
        console.error('Failed to fetch name suggestions');
        toast.error('Failed to get name suggestions', {
          position: 'bottom-center'
        });
        setNameWizardResponse(null);
      }
    } catch (error) {
      console.error('Error fetching name suggestions:', error);
      toast.error('Error getting name suggestions', {
        position: 'bottom-center'
      });
      setNameWizardResponse(null);
    } finally {
      setIsLoadingNameWizard(false);
    }
  };

  // Function to fetch facial template details
  const fetchFacialTemplateDetails = async (templateName: string) => {
    try {
      const response = await fetch(`${config.supabase_server_url}/facial_templates_global?template_name=eq.${templateName}`, {
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
        return data[0];
      } else {
        toast.error('Template details not found', {
          position: 'bottom-center'
        });
        return null;
      }
    } catch (error) {
      console.error('Error fetching facial template details:', error);
      toast.error('Failed to fetch template details', {
        position: 'bottom-center'
      });
      return null;
    }
  };

  // Function to apply facial template
  const applyFacialTemplate = async (templateName: string) => {
    try {
      setIsApplyingTemplate(true);
      toast.loading(`Applying ${templateName} template...`, {
        id: 'template-application',
        position: 'bottom-center'
      });

      const template = facialFeaturesOptions.find(opt => opt.label === templateName);
      if (!template) {
        toast.error('Template not found', {
          position: 'bottom-center'
        });
        return;
      }

      // Fetch template details
      const details = await fetchFacialTemplateDetails(templateName);
      if (details) {
        // Apply template settings
        setInfluencerData(prev => ({
          ...prev,
          facial_features: templateName,
          face_shape: details.implied_face_shape || 'Default',
          nose_style: details.implied_nose_style || 'Default',
          lip_style: details.implied_lip_style || 'Default',
          eye_color: details.implied_eye_color || 'Default',
          eye_shape: details.implied_eye_shape || 'Default',
          eyebrow_style: details.implied_eyebrow_style || 'Default',
          skin_tone: details.implied_skin_tone || 'Default',
          hair_color: details.implied_hair_color || 'Default',
          hair_length: details.implied_hair_length || 'Default',
          hair_style: details.implied_hair_style || 'Default',
          cultural_background: details.implied_cultural_background || 'Default'
        }));

        toast.success(`${templateName} template applied successfully`, {
          id: 'template-application',
          position: 'bottom-center'
        });
      } else {
        // If no details found, just set the template name
        setInfluencerData(prev => ({
          ...prev,
          facial_features: templateName
        }));

        toast.success(`${templateName} selected`, {
          id: 'template-application',
          position: 'bottom-center'
        });
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template', {
        id: 'template-application',
        position: 'bottom-center'
      });
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  // Function to handle name selection from suggestion
  const handleNameSuggestionSelect = (suggestion: NameSuggestion) => {
    setSelectedNameSuggestion(suggestion);
    setShowNameSelectionModal(true);
  };

  // Function to handle final name selection from modal
  const handleFinalNameSelect = (nameOption: { firstName: string; lastName: string }) => {
    setInfluencerData(prev => ({
      ...prev,
      name_first: nameOption.firstName,
      name_last: nameOption.lastName
    }));

    toast.success(`Name set to ${nameOption.firstName} ${nameOption.lastName}`, {
      position: 'bottom-center'
    });

    console.log('Name selected:', nameOption);

    setShowNameSelectionModal(false);
    setSelectedNameSuggestion(null);
  };

  // Function to parse name with nickname and extract options
  const parseNameWithNickname = (fullName: string) => {
    // Handle names like "Isabella 'Bella' Cruz" or "Sofia 'Sofi' Vargas"
    const nicknameMatch = fullName.match(/^(\w+)\s+'([^']+)'\s+(.+)$/);

    if (nicknameMatch) {
      const [, firstName, nickname, lastName] = nicknameMatch;
      return {
        fullNameWithNickname: fullName,
        fullNameWithoutNickname: `${firstName} ${lastName}`,
        nicknameOnly: `${nickname} ${lastName}`
      };
    }

    // Handle names without nickname
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      return {
        fullNameWithNickname: fullName,
        fullNameWithoutNickname: `${firstName} ${lastName}`,
        nicknameOnly: null
      };
    }

    return {
      fullNameWithNickname: fullName,
      fullNameWithoutNickname: fullName,
      nicknameOnly: null
    };
  };

  // Pagination helper functions - use 16 items per page for step 4 (facial features), otherwise use itemsPerPage
  const effectiveItemsPerPage = currentStep === 4 ? 16 : itemsPerPage;
  const totalPages = effectiveItemsPerPage === -1 ? 1 : Math.ceil(facialFeaturesOptions.length / effectiveItemsPerPage);
  const startIndex = effectiveItemsPerPage === -1 ? 0 : (currentPage - 1) * effectiveItemsPerPage;
  const endIndex = effectiveItemsPerPage === -1 ? facialFeaturesOptions.length : startIndex + effectiveItemsPerPage;
  const currentItems = facialFeaturesOptions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleOptionSelect = (field: string, value: string | boolean) => {
    setInfluencerData(prev => ({ ...prev, [field]: value }));



    // Show success toast for selection (excluding origin and name fields)
    if (typeof value === 'string' && value !== '' && field !== 'origin_birth' && field !== 'origin_residence' && field !== 'name_first' && field !== 'name_last') {
      const stepName = steps[currentStep - 1]?.title || 'this step';
      toast.success(`${value} selected for ${stepName}.`, {
        position: 'bottom-center',
        duration: 3000
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      // Special handling for step 3 - show facial template choice modal
      if (currentStep === 3) {
        setShowFacialTemplateChoiceModal(true);
        return;
      }

      // Special handling for step 4 - show modal for template vs step-by-step choice
      if (currentStep === 4 && influencerData.facial_features === '') {
        console.log('Showing Step 4 Modal - facial_features:', influencerData.facial_features);
        setShowStep4Modal(true);
        return;
      }

      let nextStep = currentStep + 1;

      // Special navigation logic for step 4 (Facial Features)
      if (currentStep === 4) {
        nextStep = 12; // Skip to Body Type (step 12)
      }
      // Skip step 13 (Bust Size) if sex is not Female
      else if (nextStep === 13 && influencerData.sex !== 'Female') {
        nextStep = 14;
      }

      setCurrentStep(nextStep);
      // Reset pagination to first page when moving to next step
      setCurrentPage(1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      let prevStep = currentStep - 1;

      // Special navigation logic for step 12 (Body Type)
      if (currentStep === 12) {
        if (influencerData.facial_features === '') {
          // If "Default" was selected on step 4, go to step 11 (Skin Tone)
          prevStep = 11;
        } else {
          // If a template was selected on step 4, go back to step 4 (Facial Features)
          prevStep = 4;
        }
      }
      // Special navigation logic for step 5 (Cultural Background) - go back to step 3
      else if (currentStep === 5) {
        prevStep = 3;
      }
      // Skip step 13 (Bust Size) if sex is not Female when going back
      else if (prevStep === 13 && influencerData.sex !== 'Female') {
        prevStep = 12;
      }

      setCurrentStep(prevStep);
      setCurrentPage(1);
    }
  };

  const handleStep3ModalOption = (option: 'templates' | 'step-by-step') => {
    setShowStep3Modal(false);

    if (option === 'templates') {
      // Fetch facial features data based on selected ethnic background
      const selectedEthnic = influencerData.cultural_background;
      if (selectedEthnic && selectedEthnic !== 'Default') {
        fetchFacialFeaturesOptions(selectedEthnic || undefined);
      } else {
        // If no ethnic selected, use default fetch
        fetchFacialFeaturesOptions();
      }
      // Go to step 4 (Facial Features) for template selection
      setCurrentStep(4);
    } else {
      // Go to step 5 (Cultural Background) for step-by-step creation
      setCurrentStep(5);
      influencerData.facial_features = '';
    }

    // Reset pagination to first page when moving to next step
    setCurrentPage(1);
  };

  const handleStep4ModalOption = (option: 'templates' | 'step-by-step') => {
    setShowStep4Modal(false);

    if (option === 'templates') {
      // Continue with facial features template selection - stay on step 4
      // Facial features are already loaded from step 3
      // We stay on step 4 to show the facial features templates
    } else {
      // Skip to step 5 (Cultural Background) for step-by-step creation
      setCurrentStep(5);
      setInfluencerData(prev => ({ ...prev, facial_features: '' }));
    }

    // Reset pagination to first page when moving to next step
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    // Directly execute the submission without credit check
    executeSubmit();
  };

  // Execute submit after credit confirmation
  const executeSubmit = async () => {
    setIsLoading(true);
    console.log(profileImageId);

    try {
      // Create the influencer in the database
      const response = await fetch(`${config.supabase_server_url}/influencer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({ ...influencerData, new: true })
      });

      console.log('Initial response:', response);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Add a small delay to ensure the database has been updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      const responseId = await fetch(`${config.supabase_server_url}/influencer?user_id=eq.${userData.id}&new=eq.true`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      console.log('ResponseId fetch:', responseId);
      console.log('Fetch URL:', `${config.supabase_server_url}/influencer?user_id=eq.${userData.id}&new=eq.true`);
      
      if (!responseId.ok) {
        const errorText = await responseId.text();
        console.error('ResponseId error:', errorText);
        throw new Error(`Failed to fetch created influencer: ${responseId.status}, ${errorText}`);
      }

      let data = await responseId.json();
      console.log('Created influencer data:', data);
      console.log('Data length:', data.length);
      console.log('User ID used:', userData.id);

      if (!data || data.length === 0) {
        // Try to fetch without the new=true filter as fallback
        const fallbackResponse = await fetch(`${config.supabase_server_url}/influencer?user_id=eq.${userData.id}&order=created_at.desc&limit=1`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('Fallback data:', fallbackData);
          if (fallbackData && fallbackData.length > 0) {
            // Use the most recent influencer
            data = fallbackData;
            console.log('Using fallback data:', data);
          }
        }
        
        if (!data || data.length === 0) {
          throw new Error('No influencer data returned after creation - check database and user_id');
        }
      }
      const num = data[0].image_num === null || data[0].image_num === undefined || isNaN(data[0].image_num) ? 0 : data[0].image_num;

      if (selectedProfilePictureUrl) {
        const extension = selectedProfilePictureUrl.split('.').pop() || 'png';
        await fetch(`${config.backend_url}/copyfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            sourcefilename: `output/${selectedProfilePictureUrl}`,
            destinationfilename: `models/${data[0].id}/profilepic/profilepic${num}.${extension}`
          })
        });

        influencerData.image_url = `${config.data_url}/${userData.id}/models/${data[0].id}/profilepic/profilepic${num}.${extension}`;
        influencerData.image_num = num + 1;
      }

      await fetch(`${config.backend_url}/createfolder`, {
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

      await fetch(`${config.backend_url}/createfolder`, {
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

      await fetch(`${config.backend_url}/createfolder`, {
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

      await fetch(`${config.backend_url}/createfolder`, {
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

      console.log(JSON.stringify({
        new: false,
        image_num: num + 1
      }));

      await fetch(`${config.supabase_server_url}/influencer?id=eq.${data[0].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          new: false
        })
      });

      await fetch(`${config.supabase_server_url}/influencer?id=eq.${data[0].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          image_num: num + 1
        })
      });

      if (response.ok) {
        toast.success('Influencer created successfully!', {
          position: 'bottom-right'
        });

        // Create the influencer data object to pass to edit page
        const createdInfluencerData = {
          id: data[0].id,
          image_url: influencerData.image_url || '',
          visual_only: influencerData.visual_only,
          eyebrow_style: influencerData.eyebrow_style,
          influencer_type: influencerData.influencer_type || 'Lifestyle',
          name_first: influencerData.name_first || '',
          name_last: influencerData.name_last || '',
          sex: influencerData.sex || 'Female',
          age: influencerData.age || '',
          lifestyle: influencerData.lifestyle || '',
          age_lifestyle: `${influencerData.age || ''} ${influencerData.lifestyle || ''}`.trim() || 'Default',
          eye_shape: influencerData.eye_shape,
          bust_size: influencerData.bust_size,
          origin_birth: influencerData.origin_birth,
          origin_residence: influencerData.origin_residence,
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
          body_type: influencerData.body_type,
          color_palette: influencerData.color_palette || [],
          clothing_style_everyday: influencerData.clothing_style_everyday,
          clothing_style_occasional: influencerData.clothing_style_occasional,
          clothing_style_home: influencerData.clothing_style_home,
          clothing_style_sports: influencerData.clothing_style_sports,
          clothing_style_sexy_dress: influencerData.clothing_style_sexy_dress,
          home_environment: influencerData.home_environment,
          content_focus: influencerData.content_focus.length === 0 ? [] : influencerData.content_focus,
          content_focus_areas: influencerData.content_focus_areas.length === 0 ? [] : influencerData.content_focus_areas,
          job_area: influencerData.job_area,
          job_title: influencerData.job_title,
          job_vibe: influencerData.job_vibe,
          hobbies: influencerData.hobbies.length === 0 ? [] : influencerData.hobbies,
          social_circle: influencerData.social_circle,
          strengths: influencerData.strengths.length === 0 ? [] : influencerData.strengths,
          weaknesses: influencerData.weaknesses.length === 0 ? [] : influencerData.weaknesses,
          speech_style: influencerData.speech_style.length === 0 ? [] : influencerData.speech_style,
          humor: influencerData.humor.length === 0 ? [] : influencerData.humor,
          core_values: influencerData.core_values.length === 0 ? [] : influencerData.core_values,
          current_goals: influencerData.current_goals.length === 0 ? [] : influencerData.current_goals,
          background_elements: influencerData.background_elements.length === 0 ? [] : influencerData.background_elements,
          prompt: influencerData.prompt || '',
          notes: influencerData.notes || '',
          image_num: 0,
        };

        // Autostart image generation
        try {
          const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            }
          });
          const useridData = await useridResponse.json();

          // Start image generation automatically
          const imageGenerationResponse = await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              ...influencerData,
              negative_prompt: "1"
            })
          });

          if (imageGenerationResponse.ok) {
            toast.success('Influencer created and image generation started!', {
              description: 'You will be redirected to step 2'
            });
          }
        } catch (error) {
          console.error('Error starting image generation:', error);
          toast.warning('Influencer created but image generation failed. You can generate images later.', {
            position: 'bottom-center'
          });
        }

        // Store the newly created influencer ID and flag for auto-jump to Phase 2
        localStorage.setItem('newly_created_influencer_id', data[0].id.toString());
        localStorage.setItem('coming_from_wizard', 'true');
        
        // Keep guide_step as 1 initially, let Start page handle the jump to Phase 2
        // This ensures proper phase transition logic
        window.location.href = '/start';
        onComplete();
      } else {
        console.error('Image generation failed or response not ok');
        toast.warning('Influencer created but image generation failed. You can generate images later.', {
          position: 'bottom-center'
        });
        // Store the newly created influencer ID and flag for auto-jump to Phase 2
        localStorage.setItem('newly_created_influencer_id', data[0].id.toString());
        localStorage.setItem('coming_from_wizard', 'true');
        
        // Keep guide_step as 1 initially, let Start page handle the jump to Phase 2
        window.location.href = '/start';
        onComplete();
      }
    } catch (error) {
      console.error('Error creating influencer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create influencer: ${errorMessage}`, {
        position: 'bottom-center',
        duration: 6000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Preview functionality
  const validateFields = () => {
    // Basic validation for preview generation
    if (!influencerData.sex || influencerData.sex === '') {
      toast.error('Please select a gender first');
      return false;
    }
    if (!influencerData.age || influencerData.age === '') {
      toast.error('Please select an age first');
      return false;
    }
    if (!influencerData.cultural_background || influencerData.cultural_background === '') {
      toast.error('Please select a cultural background first');
      return false;
    }
    return true;
  };

  console.log(previewHistory);
  console.log(selectedPreviousImage);

  const handlePreview = async () => {
    if (!validateFields()) { return; }
    
    // Check credit cost first
    const creditData = await checkCreditCost('nymia_image');
    if (!creditData) return;

    // Calculate total required credits for 3 preview images
    const totalRequiredCredits = creditData.gems * 3;
    
    setCreditCostData({
      ...creditData,
      gems: totalRequiredCredits,
      originalGemsPerImage: creditData.gems
    });

    // Check if user has enough credits
    if (userData.credits < totalRequiredCredits) {
      setShowCreditWarning(true);
      return;
    } else {
      // Show confirmation for credit cost
      setShowCreditWarning(true);
      return;
    }
  };

  // Execute preview generation after credit confirmation
  const executePreview = async () => {
    setIsPreviewLoading(true);

    // Initialize preview images with loading states
    const initialPreviewImages = [
      { imageUrl: '', negativePrompt: '2', isRecommended: false, isLoading: true, taskId: '' },
      { imageUrl: '', negativePrompt: '1', isRecommended: true, isLoading: true, taskId: '' },
      { imageUrl: '', negativePrompt: '3', isRecommended: false, isLoading: true, taskId: '' }
    ];
    setPreviewImages(initialPreviewImages);
    // Don't show modal, keep images on the page

    try {
      const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });
      const useridData = await useridResponse.json();

      // Create the base request data
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
        model: {
          id: "preview",
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
          makeup_style: "Default",
          name_first: influencerData.name_first,
          name_last: influencerData.name_last,
          visual_only: influencerData.visual_only,
          age: influencerData.age,
          lifestyle: influencerData.lifestyle
        },
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
        { negative_prompt: "1", order: 0, displayIndex: 1 }, // Second displayed (recommended)
        { negative_prompt: "2", order: 1, displayIndex: 0 }, // First displayed
        { negative_prompt: "3", order: 2, displayIndex: 2 }  // Third displayed
      ];

      const taskPromises = requests.map(async (request) => {
        const requestData = { ...baseRequestData, negative_prompt: request.negative_prompt };
        const response = await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify(requestData)
        });
        const result = await response.json();
        return { taskId: result.id, order: request.order, displayIndex: request.displayIndex, negativePrompt: request.negative_prompt };
      });

      const taskResults = await Promise.all(taskPromises);

      // Poll for images
      const pollForImages = async () => {
        try {
          let allCompleted = true;
          for (const taskResult of taskResults) {
            const imagesResponse = await fetch(`${config.supabase_server_url}/generated_images?task_id=eq.${taskResult.taskId}`, {
              headers: {
                'Authorization': 'Bearer WeInfl3nc3withAI'
              }
            });
            const imagesData = await imagesResponse.json();

            if (imagesData.length > 0 && imagesData[0].generation_status === 'completed' && imagesData[0].file_path) {
              const completedImage = imagesData[0];
              const imageUrl = `${config.data_url}/${completedImage.file_path}`;

              setPreviewImages(prev => prev.map((img, index) =>
                index === taskResult.displayIndex ? { ...img, imageUrl, isLoading: false, taskId: taskResult.taskId } : img
              ));
              setPreviewHistory(prev => prev.map((img, index) =>
                index === taskResult.displayIndex ? { ...img, imageUrl, taskId: taskResult.taskId } : img
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
            
            // Save all completed images to history permanently
            const completedImages = previewImages.filter(img => img.imageUrl && !img.isLoading).map(img => ({
              id: `preview_${img.taskId || Date.now()}`,
              imageUrl: img.imageUrl,
              negativePrompt: img.negativePrompt,
              isRecommended: img.isRecommended || false,
              taskId: img.taskId || '',
              created_at: new Date().toISOString()
            }));

            // Add new images to the beginning of the history
            setPreviewHistory(prev => [...completedImages, ...prev]);
            
            return;
          }

          setTimeout(pollForImages, 2000);
        } catch (error) {
          console.error('Error polling for images:', error);
          toast.error('Failed to fetch preview images');
          setIsPreviewLoading(false);
        }
      };

      pollForImages();
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview');
      setIsPreviewLoading(false);
    }
  };

  const handleClosePreview = async () => {
    setShowPreviewImages(false);
    setSelectedPreviewIndex(null);
    setPreviewImageUrl(null);
    setGeneratedImageData(null);
  };

  // Function to select a preview history image
  const handleSelectPreviewHistoryImage = (image: any) => {
    setSelectedPreviousImage(image.imageUrl);
    setInfluencerData(prev => ({
      ...prev,
      image_url: image.imageUrl
    }));
    setSelectedProfilePictureUrl(image.id);
    toast.success('Profile image selected successfully!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Select Your Influencer's Gender
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  As a first step, please select the desired sex of your influencer.
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              {isLoadingSexOptions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading sex options...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                  {sexOptions.map((option) => (
                    <Card
                      key={option.label}
                      className={cn(
                        "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                        influencerData.sex === option.value
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-xl scale-105"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                      )}
                      onClick={() => handleOptionSelect('sex', option.value)}
                      onDoubleClick={() => {
                        handleOptionSelect('sex', option.value);
                        setTimeout(() => handleNext(), 100);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="relative">
                            <img
                              src={`${config.data_url}/wizard/mappings250/${option.image}`}
                              alt={option.label}
                              className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMagnifyImageUrl(`${config.data_url}/wizard/mappings800/${option.image}`);
                                setShowMagnifyModal(true);
                              }}
                              className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                              <ZoomIn className="w-4 h-4 text-white" />
                            </button>
                            {influencerData.sex === option.value && (
                              <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {option.label}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Age Selection
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the age range that best represents your influencer. This will help define their personality, interests, and content style.
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-4xl">
              {isLoadingAge ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading age options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Age Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ageOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.age === option.label
                            ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('age', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'age-selection',
                            position: 'bottom-center'
                          });
                        }}
                        
                        onDoubleClick={() => {
                          handleOptionSelect('age', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings250/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings800/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.age === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(ageOptions.length / (itemsPerPage === -1 ? ageOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, ageOptions.length)} of {ageOptions.length} age options
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil(ageOptions.length / (itemsPerPage === -1 ? ageOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(ageOptions.length / (itemsPerPage === -1 ? ageOptions.length : itemsPerPage));
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-green-600 text-white border-green-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(ageOptions.length / (itemsPerPage === -1 ? ageOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(ageOptions.length / (itemsPerPage === -1 ? ageOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(ageOptions.length / (itemsPerPage === -1 ? ageOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Ethnics Selection
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the ethnic background that best represents your influencer's cultural heritage and appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-6xl">
              {isLoadingEthnics ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading ethnics options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Ethnics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ethnicsOptions.map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          ethnic === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          setEthnic(option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'ethnics-selection',
                            position: 'bottom-center'
                          });
                        }}
                        
                        onDoubleClick={() => {
                          setEthnic(option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings250/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings800/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {ethnic === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Facial Features Templates
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                  {ethnic && ethnic !== 'Default'
                    ? `Curated facial templates specifically designed for ${ethnic} ethnic background. Choose a template that best matches your vision.`
                    : 'Curated facial templates to help you get started quickly. Choose a template that best matches your vision.'
                  }
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-3xl mx-auto">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Navigation Tip:</strong> After selecting a template, you'll skip to Body Type (step 12) to complete the basic setup faster.
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingFacialFeatures ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading facial features...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Show items count without dropdown selector */}
                  <div className="flex justify-end items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing 16 templates per page
                    </div>
                  </div>

                  {/* Facial Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {facialFeaturesOptions
                      .filter(option => option.label !== "Default")
                      .slice(startIndex, endIndex)
                      .map((option) => (
                        <Card
                          key={option.label}
                          className={cn(
                            "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                            influencerData.facial_features === option.label
                              ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-xl scale-105"
                              : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                          )}
                          onClick={() => {
                            applyFacialTemplate(option.label);
                          }}
                          onDoubleClick={() => {
                            applyFacialTemplate(option.label);
                            setTimeout(() => handleNext(), 100);
                          }}
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="relative">
                                <img
                                  src={`${config.data_url}/wizard/mappings250/${option.image}`}
                                  alt={option.label}
                                  className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMagnifyImageUrl(`${config.data_url}/wizard/mappings800/${option.image}`);
                                    setShowMagnifyModal(true);
                                  }}
                                  className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <ZoomIn className="w-4 h-4 text-white" />
                                </button>
                                {influencerData.facial_features === option.label ? (
                                  <div className="absolute top-2 right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-5 h-5 text-white" />
                                  </div>
                                ) : null}
                              </div>
                              <div className="text-center space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {option.label}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, facialFeaturesOptions.length)} of {facialFeaturesOptions.length} templates
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-purple-600 text-white border-purple-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Cultural Background
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Select the cultural background that best represents your influencer's heritage and upbringing.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingCulturalBackground ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading cultural background options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Items per page control */}
                  <div className="flex justify-between items-center">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, culturalBackgroundOptions.length)} of {culturalBackgroundOptions.length} cultural background options
                    </div>
                  </div>

                  {/* Cultural Background Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {culturalBackgroundOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.cultural_background === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('cultural_background', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'cultural-background-selection',
                            position: 'bottom-center'
                          });
                        }}
                        onDoubleClick={() => {
                          handleOptionSelect('cultural_background', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings400/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings400/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.cultural_background === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(culturalBackgroundOptions.length / (itemsPerPage === -1 ? culturalBackgroundOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, culturalBackgroundOptions.length)} of {culturalBackgroundOptions.length} cultural background options
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil(culturalBackgroundOptions.length / (itemsPerPage === -1 ? culturalBackgroundOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(culturalBackgroundOptions.length / (itemsPerPage === -1 ? culturalBackgroundOptions.length : itemsPerPage));
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-orange-600 text-white border-orange-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(culturalBackgroundOptions.length / (itemsPerPage === -1 ? culturalBackgroundOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(culturalBackgroundOptions.length / (itemsPerPage === -1 ? culturalBackgroundOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(culturalBackgroundOptions.length / (itemsPerPage === -1 ? culturalBackgroundOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Hair Length
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the hair length that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingHairLength ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading hair length options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Items per page control */}
                  <div className="flex justify-between items-center">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, hairLengthOptions.length)} of {hairLengthOptions.length} hair length options
                    </div>
                  </div>

                  {/* Hair Length Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {hairLengthOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.hair_length === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('hair_length', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'hair-length-selection',
                            position: 'bottom-center'
                          });
                        }}
                        onDoubleClick={() => {
                          handleOptionSelect('hair_length', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings250/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings800/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.hair_length === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(hairLengthOptions.length / (itemsPerPage === -1 ? hairLengthOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, hairLengthOptions.length)} of {hairLengthOptions.length} hair length options
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil(hairLengthOptions.length / (itemsPerPage === -1 ? hairLengthOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(hairLengthOptions.length / (itemsPerPage === -1 ? hairLengthOptions.length : itemsPerPage));
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-orange-600 text-white border-orange-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(hairLengthOptions.length / (itemsPerPage === -1 ? hairLengthOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(hairLengthOptions.length / (itemsPerPage === -1 ? hairLengthOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(hairLengthOptions.length / (itemsPerPage === -1 ? hairLengthOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Hair Style
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the hair style that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingHairStyle ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading hair style options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Items per page control */}
                  <div className="flex justify-between items-center">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, hairStyleOptions.length)} of {hairStyleOptions.length} hair style options
                    </div>
                  </div>

                  {/* Hair Style Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {hairStyleOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.hair_style === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('hair_style', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'hair-style-selection',
                            position: 'bottom-center'
                          });
                        }}
                        onDoubleClick={() => {
                          handleOptionSelect('hair_style', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings250/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings800/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.hair_style === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(hairStyleOptions.length / (itemsPerPage === -1 ? hairStyleOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, hairStyleOptions.length)} of {hairStyleOptions.length} hair style options
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil(hairStyleOptions.length / (itemsPerPage === -1 ? hairStyleOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(hairStyleOptions.length / (itemsPerPage === -1 ? hairStyleOptions.length : itemsPerPage));
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-orange-600 text-white border-orange-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(hairStyleOptions.length / (itemsPerPage === -1 ? hairStyleOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(hairStyleOptions.length / (itemsPerPage === -1 ? hairStyleOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(hairStyleOptions.length / (itemsPerPage === -1 ? hairStyleOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Hair Color
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the hair color that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingHairColor ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading hair color options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Items per page control */}
                  <div className="flex justify-between items-center">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, hairColorOptions.length)} of {hairColorOptions.length} hair color options
                    </div>
                  </div>

                  {/* Hair Color Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {hairColorOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.hair_color === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('hair_color', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'hair-color-selection',
                            position: 'bottom-center'
                          });
                        }}
                        onDoubleClick={() => {
                          handleOptionSelect('hair_color', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings250/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings800/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.hair_color === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(hairColorOptions.length / (itemsPerPage === -1 ? hairColorOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, hairColorOptions.length)} of {hairColorOptions.length} hair color options
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil(hairColorOptions.length / (itemsPerPage === -1 ? hairColorOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(hairColorOptions.length / (itemsPerPage === -1 ? hairColorOptions.length : itemsPerPage));
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-orange-600 text-white border-orange-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(hairColorOptions.length / (itemsPerPage === -1 ? hairColorOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(hairColorOptions.length / (itemsPerPage === -1 ? hairColorOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(hairColorOptions.length / (itemsPerPage === -1 ? hairColorOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Face Shape
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the face shape that best represents your influencer's facial structure.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingFaceShape ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading face shape options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Items per page control */}
                  <div className="flex justify-between items-center">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, faceShapeOptions.length)} of {faceShapeOptions.length} face shape options
                    </div>
                  </div>

                  {/* Face Shape Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {faceShapeOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.face_shape === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('face_shape', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'face-shape-selection',
                            position: 'bottom-center'
                          });
                        }}
                        onDoubleClick={() => {
                          handleOptionSelect('face_shape', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings400/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings400/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.face_shape === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(faceShapeOptions.length / (itemsPerPage === -1 ? faceShapeOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, faceShapeOptions.length)} of {faceShapeOptions.length} face shape options
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil(faceShapeOptions.length / (itemsPerPage === -1 ? faceShapeOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(faceShapeOptions.length / (itemsPerPage === -1 ? faceShapeOptions.length : itemsPerPage));
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-orange-600 text-white border-orange-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(faceShapeOptions.length / (itemsPerPage === -1 ? faceShapeOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(faceShapeOptions.length / (itemsPerPage === -1 ? faceShapeOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(faceShapeOptions.length / (itemsPerPage === -1 ? faceShapeOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Eye Color
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the eye color that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingEyeColor ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading eye color options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Items per page control */}
                  <div className="flex justify-between items-center">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, eyeColorOptions.length)} of {eyeColorOptions.length} eye color options
                    </div>
                  </div>

                  {/* Eye Color Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {eyeColorOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.eye_color === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('eye_color', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'eye-color-selection',
                            position: 'bottom-center'
                          });
                        }}
                        onDoubleClick={() => {
                          handleOptionSelect('eye_color', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings400/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings400/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.eye_color === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(eyeColorOptions.length / (itemsPerPage === -1 ? eyeColorOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, eyeColorOptions.length)} of {eyeColorOptions.length} eye color options
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil(eyeColorOptions.length / (itemsPerPage === -1 ? eyeColorOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(eyeColorOptions.length / (itemsPerPage === -1 ? eyeColorOptions.length : itemsPerPage));
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-orange-600 text-white border-orange-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(eyeColorOptions.length / (itemsPerPage === -1 ? eyeColorOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(eyeColorOptions.length / (itemsPerPage === -1 ? eyeColorOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(eyeColorOptions.length / (itemsPerPage === -1 ? eyeColorOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Skin Tone
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the skin tone that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingSkinTone ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading skin tone options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Items per page control */}
                  <div className="flex justify-between items-center">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, skinToneOptions.length)} of {skinToneOptions.length} skin tone options
                    </div>
                  </div>

                  {/* Skin Tone Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {skinToneOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.skin_tone === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('skin_tone', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'skin-tone-selection',
                            position: 'bottom-center'
                          });
                        }}
                        onDoubleClick={() => {
                          handleOptionSelect('skin_tone', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings400/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings400/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.skin_tone === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(skinToneOptions.length / (itemsPerPage === -1 ? skinToneOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, skinToneOptions.length)} of {skinToneOptions.length} skin tone options
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil(skinToneOptions.length / (itemsPerPage === -1 ? skinToneOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(skinToneOptions.length / (itemsPerPage === -1 ? skinToneOptions.length : itemsPerPage));
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-orange-600 text-white border-orange-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(skinToneOptions.length / (itemsPerPage === -1 ? skinToneOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(skinToneOptions.length / (itemsPerPage === -1 ? skinToneOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(skinToneOptions.length / (itemsPerPage === -1 ? skinToneOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 12:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Body Type
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the body type that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingBodyType ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading body type options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Items per page control */}
                  {/* <div className="flex justify-between items-center"> */}
                  {/* Items per page selector */}
                  {/* <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, bodyTypeOptions.length)} of {bodyTypeOptions.length} body type options
                    </div>
                  </div> */}

                  {/* Body Type Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bodyTypeOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.body_type === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('body_type', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'body-type-selection',
                            position: 'bottom-center'
                          });
                        }}
                        onDoubleClick={() => {
                          handleOptionSelect('body_type', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings400/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings400/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.body_type === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {/* {Math.ceil(bodyTypeOptions.length / (itemsPerPage === -1 ? bodyTypeOptions.length : itemsPerPage)) > 1 && ( */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, bodyTypeOptions.length)} of {bodyTypeOptions.length} body type options
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                      >
                        Previous
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, Math.ceil(bodyTypeOptions.length / (itemsPerPage === -1 ? bodyTypeOptions.length : itemsPerPage))) }, (_, i) => {
                          let pageNum;
                          const totalPages = Math.ceil(bodyTypeOptions.length / (itemsPerPage === -1 ? bodyTypeOptions.length : itemsPerPage));
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                ? "bg-orange-600 text-white border-orange-600"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === Math.ceil(bodyTypeOptions.length / (itemsPerPage === -1 ? bodyTypeOptions.length : itemsPerPage))}
                        className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(Math.ceil(bodyTypeOptions.length / (itemsPerPage === -1 ? bodyTypeOptions.length : itemsPerPage)))}
                        disabled={currentPage === Math.ceil(bodyTypeOptions.length / (itemsPerPage === -1 ? bodyTypeOptions.length : itemsPerPage))}
                        className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                  {/* )} */}
                </div>
              )}
            </div>
          </div>
        );

      case 13:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="font-bold">
                  Bust Size
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Select the bust size that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingBustSize ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading bust size options...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Bust Size Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bustSizeOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.bust_size === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('bust_size', option.label);
                        }}
                        onDoubleClick={() => {
                          handleOptionSelect('bust_size', option.label);
                          setTimeout(() => handleNext(), 100);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings400/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(`${config.data_url}/wizard/mappings400/${option.image}`);
                                  setShowMagnifyModal(true);
                                }}
                                className="absolute top-2 left-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ZoomIn className="w-4 h-4 text-white" />
                              </button>
                              {influencerData.bust_size === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {Math.ceil(bustSizeOptions.length / (itemsPerPage === -1 ? bustSizeOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, bustSizeOptions.length)} of {bustSizeOptions.length} bust size options
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, Math.ceil(bustSizeOptions.length / (itemsPerPage === -1 ? bustSizeOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(bustSizeOptions.length / (itemsPerPage === -1 ? bustSizeOptions.length : itemsPerPage));
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNum
                                  ? "bg-orange-600 text-white border-orange-600"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(bustSizeOptions.length / (itemsPerPage === -1 ? bustSizeOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(bustSizeOptions.length / (itemsPerPage === -1 ? bustSizeOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(bustSizeOptions.length / (itemsPerPage === -1 ? bustSizeOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 14:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Place of Birth
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Tell us where your influencer was born. This helps create a more authentic and detailed background story.
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Where was your influencer born?
                      </label>
                      <input
                        type="text"
                        value={influencerData.origin_birth}
                        onChange={(e) => handleOptionSelect('origin_birth', e.target.value)}
                        placeholder="e.g., New York, US"
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        💡 This information helps create a more authentic background story for your influencer.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 15:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                <Settings className="w-8 h-8 text-orange-600" />
                Preview Your Influencer
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Generate preview images and select your favorite profile picture from the history.
              </p>
            </div>



            {/* Generate New Preview Images */}
            <div className="max-w-6xl mx-auto">
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Generate New Preview Images
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Create new preview images based on your current selections.
                      </p>
                    </div>

                    <Button
                      onClick={handlePreview}
                      disabled={isPreviewLoading}
                      className="flex items-center gap-2 px-8 py-4 text-lg font-medium bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mx-auto"
                    >
                      {isPreviewLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Generating Preview...
                        </>
                      ) : (
                        <>
                          Generate New Preview
                          <Sparkles className="w-6 h-6" />
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      💡 This will create new preview images and add them to your history.
                    </p>

                    {/* New Generated Images Display */}
                    {previewImages.length > 0 && (
                      <div className="mt-8">
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
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                      <div className="text-center">
                                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Generating...</p>
                                      </div>
                                    </div>
                                  ) : preview.imageUrl ? (
                                    <>
                                      <img
                                        src={preview.imageUrl}
                                        alt={`New Preview ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg shadow-lg aspect-square cursor-pointer"
                                        onClick={() => {
                                          setInfluencerData({ ...influencerData, image_url: preview.imageUrl });
                                          setSelectedProfilePictureUrl(preview.imageUrl.split('/').pop() || '');
                                        }}
                                      />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setMagnifyImageUrl(preview.imageUrl);
                                          setShowMagnifyModal(true);
                                        }}
                                        className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                      >
                                        <ZoomIn className="w-4 h-4 text-white" />
                                      </button>
                                    </>
                                  ) : (
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                      <p className="text-sm text-gray-500 dark:text-gray-400">No image</p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Profile Image Display in Green Circle */}
            <div className="max-w-6xl mx-auto">
              <Card className={cn(
                "border-2 shadow-xl transition-all duration-300",
                influencerData.image_url 
                  ? "border-green-500 dark:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20" 
                  : "border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
              )}>
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <h3 className={cn(
                        "text-xl font-semibold",
                        influencerData.image_url 
                          ? "text-green-700 dark:text-green-300" 
                          : "text-gray-700 dark:text-gray-300"
                      )}>
                        {influencerData.image_url ? "Selected Profile Image" : "Profile Picture"}
                      </h3>
                      <div className="flex justify-center">
                        {influencerData.image_url ? (
                          <div className="relative">
                            <img
                              src={influencerData.image_url}
                              alt="Selected Profile"
                              className="w-48 h-48 object-cover rounded-full shadow-2xl border-4 border-green-500"
                            />
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-full shadow-2xl border-4 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            <User className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      {influencerData.image_url ? (
                        <div className="space-y-3">
                          <p className="text-sm text-green-600 dark:text-green-400">
                            ✅ This image will be used as your influencer's profile picture
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInfluencerData({ ...influencerData, image_url: '' })}
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                          >
                            Change Selection
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Click on a preview image above to select your profile picture
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview History */}
            {previewHistory.length > 0 && (
              <div className="max-w-6xl mx-auto">
                <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Preview History
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Select from your previously generated preview images.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {previewHistory.map((image, index) => (
                          <Card key={image.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/30 backdrop-blur-sm">
                            <CardContent className="p-4">
                              <div className="relative">
                                {image.isRecommended && (
                                  <Badge className="absolute top-2 left-2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold">
                                    Recommended
                                  </Badge>
                                )}
                                <img
                                  src={image.imageUrl}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg shadow-lg aspect-square cursor-pointer"
                                  onClick={() => {
                                    setInfluencerData({ ...influencerData, image_url: image.imageUrl });
                                    setSelectedProfilePictureUrl(image.imageUrl.split('/').pop() || '');
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMagnifyImageUrl(image.imageUrl);
                                    setShowMagnifyModal(true);
                                  }}
                                  className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <ZoomIn className="w-4 h-4 text-white" />
                                </button>
                                <div className="mt-4 text-center">
                                  <div className="flex flex-col gap-2 mt-2">
                                    <Button
                                      onClick={() => handleSelectPreviewHistoryImage(image)}
                                    >
                                      Use as Profile Picture
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );


      case 16:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Name Your Influencer
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Give your influencer a unique and memorable name. We'll also suggest some names based on your selections.
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Name Input Fields */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={influencerData.name_first}
                          onChange={(e) => handleOptionSelect('name_first', e.target.value)}
                          placeholder="Enter first name"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-green-300 dark:hover:border-green-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={influencerData.name_last}
                          onChange={(e) => handleOptionSelect('name_last', e.target.value)}
                          placeholder="Enter last name"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-green-300 dark:hover:border-green-600"
                        />
                      </div>
                    </div>

                    {/* Get Name Suggestions Button */}
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={fetchNameSuggestions}
                        disabled={isLoadingNameWizard}
                        className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {isLoadingNameWizard ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Getting Suggestions...
                          </>
                        ) : (
                          <>
                            Get Name Suggestions
                            <Sparkles className="w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Name Wizard Response */}
              {nameWizardResponse && (
                <Card className="border-2 border-green-200 dark:border-green-700 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
                          AI Name Suggestions
                        </h3>
                        <p className="text-green-600 dark:text-green-300">
                          Based on your influencer's characteristics, here are some name suggestions:
                        </p>
                      </div>

                      {/* Name Suggestion Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {nameWizardResponse.name_suggestions.map((suggestion, index) => (
                          <Card
                            key={suggestion.rank}
                            className="border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800"
                            onClick={() => handleNameSuggestionSelect(suggestion)}
                          >
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                {/* Rank Badge */}
                                <div className="flex justify-between items-start">
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                    #{suggestion.rank}
                                  </Badge>
                                  <div className="text-xs text-gray-500">
                                    {suggestion.cultural_authenticity}/10
                                  </div>
                                </div>

                                {/* Full Name */}
                                <div className="text-center">
                                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    {suggestion.full_name}
                                  </h4>
                                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    {suggestion.social_handle}
                                  </p>
                                </div>

                                {/* Reasoning */}
                                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {suggestion.reasoning}
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div className="text-center">
                                    <div className="font-semibold text-gray-700 dark:text-gray-300">Cultural</div>
                                    <div className="text-green-600 dark:text-green-400">{suggestion.cultural_authenticity}/10</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold text-gray-700 dark:text-gray-300">Social</div>
                                    <div className="text-green-600 dark:text-green-400">{suggestion.social_media_appeal}/10</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold text-gray-700 dark:text-gray-300">Brand</div>
                                    <div className="text-green-600 dark:text-green-400">{suggestion.brand_potential}/10</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold text-gray-700 dark:text-gray-300">Personality</div>
                                    <div className="text-green-600 dark:text-green-400">{suggestion.personality_match}/10</div>
                                  </div>
                                </div>

                                {/* Select Button */}
                                <Button
                                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNameSuggestionSelect(suggestion);
                                  }}
                                >
                                  Select This Name
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="text-center text-sm text-green-600 dark:text-green-300">
                        💡 Click on any suggestion to choose between the full name and nickname.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  const canProceed = () => {
    const activeSteps = getActiveSteps(influencerData);
    const currentActiveStep = activeSteps.find(step => step.id === currentStep);

    if (!currentActiveStep) return false;

    switch (currentStep) {
      case 1:
        return influencerData.sex !== '';
      case 2:
        return influencerData.age !== '';
      case 3:
        return ethnic !== null && ethnic !== '';
      case 4:
        return influencerData.facial_features !== '' || showStep4Modal;
      case 5:
        return influencerData.cultural_background !== '';
      case 6:
        return influencerData.hair_length !== '';
      case 7:
        return influencerData.hair_style !== '';
      case 8:
        return influencerData.hair_color !== '';
      case 9:
        return influencerData.face_shape !== '';
      case 10:
        return influencerData.eye_color !== '';
      case 11:
        return influencerData.skin_tone !== '';
      case 12:
        return influencerData.body_type !== '';
      case 13:
        return influencerData.bust_size !== '';
      case 14:
        return influencerData.origin_birth !== '';
      case 15:
        return selectedProfilePictureUrl !== null;
      case 16:
        return influencerData.name_first !== '' && influencerData.name_last !== '';
      default:
        return false;
    }
  };

  return (
    <>
      <section className="relative min-h-screen bg-slate-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/consistency.png"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Create Your Influencer
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Design your perfect AI influencer with our step-by-step wizard
            </p>
            
            {/* Progress Indicator */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between text-sm text-slate-300 mb-4">
                <span>Step {currentStep} of {getActiveSteps(influencerData).length}</span>
                <span>{Math.round((currentStep / getActiveSteps(influencerData).length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / getActiveSteps(influencerData).length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-slate-700/50">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-base font-medium bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500/50 transition-all duration-300 w-full sm:w-auto"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>

              {currentStep < getActiveSteps(influencerData).length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  Next Step
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Influencer
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Name Selection Modal */}
      <Dialog open={showNameSelectionModal} onOpenChange={setShowNameSelectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Choose Your Name
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Select which version of the name you'd like to use:
            </DialogDescription>
          </DialogHeader>

          {selectedNameSuggestion && (
            <div className="space-y-4">
              {/* Option 1: Firstname Lastname */}
              <Card
                className="border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 cursor-pointer transition-all duration-300"
                onClick={() => handleFinalNameSelect({ 
                  firstName: selectedNameSuggestion.first_name, 
                  lastName: selectedNameSuggestion.last_name 
                })}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {selectedNameSuggestion.first_name} {selectedNameSuggestion.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Firstname Lastname
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Option 2: Nickname Lastname */}
              <Card
                className="border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all duration-300"
                onClick={() => handleFinalNameSelect({ 
                  firstName: selectedNameSuggestion.nick_name, 
                  lastName: selectedNameSuggestion.last_name 
                })}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {selectedNameSuggestion.nick_name} {selectedNameSuggestion.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nickname Lastname
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Option 3: Firstname + Nickname (in first name field) Lastname */}
              <Card
                className="border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer transition-all duration-300"
                onClick={() => handleFinalNameSelect({ 
                  firstName: `${selectedNameSuggestion.first_name} ${selectedNameSuggestion.nick_name}`, 
                  lastName: selectedNameSuggestion.last_name 
                })}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {selectedNameSuggestion.first_name} {selectedNameSuggestion.nick_name} {selectedNameSuggestion.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Firstname + Nickname (in first name field) Lastname
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowNameSelectionModal(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 4 Modal - Choose Facial Features Method */}
      <Dialog open={showStep4Modal} onOpenChange={setShowStep4Modal}>
        <DialogContent className="max-w-2xl bg-slate-800/95 border-slate-700/50">
          <DialogHeader>
            <DialogTitle className="font-bold text-slate-200">
              Facial Features Creation
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-lg">
              How would you like to create your influencer's facial features?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Template Option */}
            <Card
              className="border-2 border-blue-600/50 bg-slate-700/50 hover:border-blue-500 cursor-pointer transition-all duration-300 group"
              onClick={() => handleStep4ModalOption('templates')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-200 mb-2">
                      Use Facial Feature Templates
                    </h3>
                    <p className="text-slate-400 mb-3">
                      Choose from curated facial feature combinations that work well together.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Fast setup • Proven combinations • Still customizable
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step-by-Step Option */}
            <Card
              className="border-2 border-green-600/50 bg-slate-700/50 hover:border-green-500 cursor-pointer transition-all duration-300 group"
              onClick={() => handleStep4ModalOption('step-by-step')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-200 mb-2">
                      Build Features Step-by-Step
                    </h3>
                    <p className="text-slate-400 mb-3">
                      Create each facial feature individually for complete control.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Full control • Detailed options • Custom combinations
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
            <Button
              variant="outline"
              onClick={() => setShowStep4Modal(false)}
              className="px-6 py-2 bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-slate-600/50"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 3 Modal - Choose Creation Method */}
      <Dialog open={showStep3Modal} onOpenChange={setShowStep3Modal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-gray-900 dark:text-gray-100">
              Choose Your Creation Method
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-lg">
              How would you like to proceed with creating your influencer's facial features?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Template Option */}
            <Card
              className="border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all duration-300 group"
              onClick={() => handleStep3ModalOption('templates')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Select from Facial Feature Templates
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Choose from our curated collection of facial feature templates. These templates provide pre-configured combinations of facial characteristics that work well together.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Quick setup • Professional results • Customizable
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step-by-Step Option */}
            <Card
              className="border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 cursor-pointer transition-all duration-300 group"
              onClick={() => handleStep3ModalOption('step-by-step')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Create Facial Features from Scratch
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Build your influencer's facial features from scratch by selecting each characteristic individually. This gives you complete control over every aspect.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Full control • Detailed customization • Complete freedom
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowStep3Modal(false)}
              className="px-6 py-2"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Integrated Preview - replaced modal with in-wizard display */}
      {showPreviewImages && currentStep === 15 && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm">
          <div className="h-full overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="w-full max-w-6xl bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <h2 className="font-bold text-slate-200">Preview Images</h2>
                    <p className="text-slate-400">
                      {previewImages.every(p => !p.isLoading) 
                        ? "Choose your favorite look - single click to select, double click to proceed"
                        : "Creating preview variations of your influencer. Images will appear as they complete."
                      }
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {previewImages.map((preview, index) => (
                      <Card 
                        key={index} 
                        className={cn(
                          "group cursor-pointer transition-all duration-300 border-2",
                          selectedPreviewIndex === index 
                            ? "border-blue-500 bg-blue-50/10 shadow-xl scale-105" 
                            : "border-slate-600/50 hover:border-blue-400"
                        )}
                        onClick={() => setSelectedPreviewIndex(index)}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!preview.isLoading) {
                            setPreviewImageUrl(preview.imageUrl);
                            setGeneratedImageData({
                              image_id: preview.imageUrl.split('/').pop() || '',
                              system_filename: preview.imageUrl.split('/').pop() || ''
                            });
                            setShowPreviewImages(false);
                            setCurrentStep(16); // Go to next step
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="relative aspect-square">
                            {preview.isRecommended && !preview.isLoading && (
                              <Badge className="absolute top-2 left-2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold">
                                Recommended
                              </Badge>
                            )}
                            {selectedPreviewIndex === index && !preview.isLoading && (
                              <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                            {preview.isLoading ? (
                              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                  <p className="text-sm text-slate-400">Generating...</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={preview.imageUrl}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          {!preview.isLoading && (
                            <div className="mt-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMagnifyImageUrl(preview.imageUrl);
                                  setShowMagnifyModal(true);
                                }}
                              >
                                View Full Size
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {!previewImages.every(p => p.isLoading) && (
                    <div className="flex justify-center gap-4 pt-6 border-t border-slate-700/50">
                      <Button
                        variant="outline"
                        onClick={() => setShowPreviewImages(false)}
                        className="px-8 py-2 bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (selectedPreviewIndex !== null) {
                            const preview = previewImages[selectedPreviewIndex];
                            setPreviewImageUrl(preview.imageUrl);
                            setGeneratedImageData({
                              image_id: preview.imageUrl.split('/').pop() || '',
                              system_filename: preview.imageUrl.split('/').pop() || ''
                            });
                            setShowPreviewImages(false);
                            setCurrentStep(16); // Go to next step directly
                          }
                        }}
                        disabled={selectedPreviewIndex === null}
                        className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Continue with Selected
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Magnify Modal for Full Size Image View */}
      <Dialog open={showMagnifyModal} onOpenChange={setShowMagnifyModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2">
          <DialogHeader className="px-4 py-2">
            <DialogTitle>Full Size Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4 max-h-[80vh] overflow-hidden">
            {magnifyImageUrl && (
              <img
                src={magnifyImageUrl}
                alt="Full Size Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{ maxHeight: 'calc(80vh - 8rem)' }}
              />
            )}
          </div>
          <div className="flex justify-center gap-4 p-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowMagnifyModal(false);
                setMagnifyImageUrl(null);
              }}
              className="px-6"
            >
              Close
            </Button>
            {currentStep !== 4 && (
              <Button
                onClick={() => {
                  if (magnifyImageUrl) {
                    const index = previewImages.findIndex(p => p.imageUrl === magnifyImageUrl);
                    if (index !== -1) {
                      setSelectedPreviewIndex(index);
                      setPreviewImageUrl(magnifyImageUrl);
                      setGeneratedImageData({
                        image_id: magnifyImageUrl.split('/').pop() || '',
                        system_filename: magnifyImageUrl.split('/').pop() || ''
                      });
                      setShowMagnifyModal(false);
                      setShowPreviewImages(false);
                      setCurrentStep(16);
                    }
                  }
                }}
                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Use This Image
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keep original modal as fallback */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
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
                          className="w-full h-64 object-cover rounded-lg shadow-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-black/70 hover:bg-black/80 text-white border-white/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPreviewModal(false);
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <Button
                      className="w-full"
                      disabled={preview.isLoading}
                      onClick={async () => {
                        try {
                          if (!preview.taskId) {
                            throw new Error('No task ID found for the selected image');
                          }

                          const imageResponse = await fetch(`${config.supabase_server_url}/generated_images?task_id=eq.${preview.taskId}`, {
                            method: 'GET',
                            headers: {
                              'Authorization': 'Bearer WeInfl3nc3withAI'
                            }
                          });

                          const imageData = await imageResponse.json();

                          if (imageData.length > 0) {
                            const generatedImage = imageData[0];
                            setSelectedProfilePictureUrl(generatedImage.system_filename);
                            
                            setInfluencerData(prev => ({
                              ...prev,
                              image_url: preview.imageUrl
                            }));

                            setShowPreviewModal(false);
                            setPreviewImages([]);

                            toast.success('Profile picture selected successfully!');
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
                </CardContent>
              </Card>
            ))}
          </div>
          {isPreviewLoading && (
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">Generating preview images... This may take a few moments.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Size Image Modal */}
      <Dialog open={!!previewImageUrl} onOpenChange={(open) => !open && setPreviewImageUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Full Size Preview
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {previewImageUrl && (
              <img
                src={previewImageUrl}
                alt="Full Size Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewImageUrl(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Magnify Modal */}
      <Dialog open={showMagnifyModal} onOpenChange={setShowMagnifyModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ZoomIn className="w-5 h-5 text-blue-500" />
              Magnify View
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {magnifyImageUrl && (
              <img
                src={magnifyImageUrl}
                alt="Magnified View"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMagnifyModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Facial Template Choice Modal */}
      <Dialog open={showFacialTemplateChoiceModal} onOpenChange={setShowFacialTemplateChoiceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              Facial Features Customization
            </DialogTitle>
            <DialogDescription>
              Choose how you'd like to customize your influencer's facial features. You can use pre-made templates for quick setup or customize each feature individually.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <Card 
              className="cursor-pointer border-2 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg group"
              onClick={() => {
                setShowFacialTemplateChoiceModal(false);
                setCurrentStep(4); // Go to Facial Features Templates
              }}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Use Facial Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from professionally designed facial feature combinations. Quick and easy setup.
                  </p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  Recommended
                </Badge>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg group"
              onClick={() => {
                setShowFacialTemplateChoiceModal(false);
                setCurrentStep(5); // Skip to individual features (step 5)
              }}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Customize Individual Features</h3>
                  <p className="text-sm text-muted-foreground">
                    Manually select each facial feature for complete control over your influencer's appearance.
                  </p>
                </div>
                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                  Advanced
                </Badge>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowFacialTemplateChoiceModal(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credit Warning Modal */}
      <Dialog open={showCreditWarning} onOpenChange={setShowCreditWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Credit Cost Confirmation</DialogTitle>
            <DialogDescription>
              {userData.credits >= (creditCostData?.gems || 0) ? (
                <>
                  This action will cost <strong>{creditCostData?.gems} credits</strong>.
                  You currently have <strong>{userData.credits} credits</strong>.
                  {creditCostData?.originalGemsPerImage && (
                    <div className="mt-2 text-sm text-gray-600">
                      ({creditCostData.originalGemsPerImage} credits per image)
                    </div>
                  )}
                </>
              ) : (
                <>
                  Insufficient credits! This action requires <strong>{creditCostData?.gems} credits</strong>,
                  but you only have <strong>{userData.credits} credits</strong>.
                  Please purchase more credits to continue.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreditWarning(false)}>
              Cancel
            </Button>
            {userData.credits >= (creditCostData?.gems || 0) ? (
              <>
                {currentStep === 14 ? (
                  <Button 
                    onClick={() => {
                      setShowCreditWarning(false);
                      executeSubmit();
                    }}
                  >
                    Confirm & Create Influencer
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      setShowCreditWarning(false);
                      executePreview();
                    }}
                  >
                    Confirm & Generate Preview
                  </Button>
                )}
              </>
            ) : (
              <Button 
                onClick={() => {
                  setShowCreditWarning(false);
                  toast.info('Please purchase credits to continue');
                }}
              >
                Buy Credits
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 