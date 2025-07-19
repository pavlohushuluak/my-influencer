import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Loader2, User, Sparkles, Palette, Settings, ArrowRight, Check, ZoomIn, RefreshCcw, Globe, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
}

interface Option {
  label: string;
  image: string;
  description?: string;
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
  const [showStep3Modal, setShowStep3Modal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const userData = useSelector((state: RootState) => state.user);

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
    notes: ''
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

  // console.log(influencerData);

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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_sex', {
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

  // Fetch facial features options from API
  const fetchFacialFeaturesOptions = async (ethnic?: string) => {
    try {
      setIsLoadingFacialFeatures(true);

      // Fetch templates from ethnic-specific API
      const templatesResponse = await fetch(`https://db.nymia.ai/rest/v1/facial_templates_global?ethnics_stereotype=eq.${ethnic}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      // Fetch images from original API
      const imagesResponse = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_facial_features', {
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
    fetchFacialFeaturesOptions(ethnic);
  }, [ethnic]);

  // Fetch age options from API
  useEffect(() => {
    const fetchAgeOptions = async () => {
      try {
        setIsLoadingAge(true);
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_age', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_lifestyle', {
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
      const templatesResponse = await fetch(`https://db.nymia.ai/rest/v1/prompt_mappings?category=eq.cultural_background&ethnics_stereotype=eq.${ethnic}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const imageResponse = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_cultural_background', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_hair_length', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_hair_style', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_hair_color', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_face_shape', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_eye_color', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_eye_shape', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_lip_style', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_nose_style', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_eyebrow_style', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_skin_tone', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_body_type', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setBodyTypeOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
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
  }, []);

  // Fetch bust size options from API
  useEffect(() => {
    const fetchBustSizeOptions = async () => {
      try {
        setIsLoadingBustSize(true);
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_bust', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=wizard_ethnics_stereotype', {
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
      const response = await fetch('https://api.nymia.ai/v1/namewizard', {
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
  const handleFinalNameSelect = (fullName: string) => {
    // Parse the full name to extract first and last name
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' '); // Handle multi-word last names

      setInfluencerData(prev => ({
        ...prev,
        name_first: firstName,
        name_last: lastName
      }));

      toast.success(`Name set to ${fullName}`, {
        position: 'bottom-center'
      });
    } else {
      // If it's a single name, treat it as first name
      setInfluencerData(prev => ({
        ...prev,
        name_first: fullName,
        name_last: ''
      }));

      toast.success(`Name set to ${fullName}`, {
        position: 'bottom-center'
      });
    }

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

  // Pagination helper functions
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(facialFeaturesOptions.length / itemsPerPage);
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === -1 ? facialFeaturesOptions.length : startIndex + itemsPerPage;
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

    // Special handling for origin_residence - automatically set origin_birth to the same value
    if (field === 'origin_residence' && typeof value === 'string') {
      setInfluencerData(prev => ({ ...prev, origin_birth: value }));
    }

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
      // Special handling for step 3 - show modal instead of proceeding
      if (currentStep === 3) {
        setShowStep3Modal(true);
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
        fetchFacialFeaturesOptions(selectedEthnic);
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

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Create the influencer in the database
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

        // Navigate to edit page with the created influencer data
        navigate('/influencers/edit', {
          state: {
            influencerData: createdInfluencerData
          }
        });
        onComplete();
      } else {
        throw new Error('Failed to create influencer');
      }
    } catch (error) {
      console.error('Error creating influencer:', error);
      toast.error('Failed to create influencer. Please try again.', {
        position: 'bottom-center'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Preview functionality
  const handlePreview = async () => {
    setIsPreviewLoading(true);

    try {
      // Simulate preview generation
      toast.info('Generating preview...', {
        description: 'Creating a preview of your influencer with current settings'
      });

      // Create the JSON data structure
      const requestData = {
        task: "generate_preview",
        number_of_images: 1,
        quality: 'Quality',
        nsfw_strength: -1,
        lora: "",
        noAI: false,
        prompt: "",
        negative_prompt: "",
        lora_strength: 0,
        seed: -1,
        guidance: 7,
        model: {
          id: "preview", // Temporary ID for preview
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

      const useridResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const useridData = await useridResponse.json();

      // Send the request to create task
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
      const taskId = result.id;

      // Poll for the generated images
      let attempts = 0;
      const maxAttempts = 120; // 120 seconds max

      const pollForImages = async () => {
        try {
          const imagesResponse = await fetch('https://api.nymia.ai/v1/get-images-by-task', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({ task_id: taskId })
          });

          // if (!imagesResponse.ok) {
          //   throw new Error('Failed to fetch images');
          // }

          const imagesData = await imagesResponse.json();

          if (imagesData.success && imagesData.images && imagesData.images.length > 0) {
            // Check if any image is completed
            const completedImage = imagesData.images.find((img: any) => img.status === 'completed');

            if (completedImage) {
              // Show the generated image
              const imageUrl = `https://images.nymia.ai/cdn-cgi/image/w=800/${completedImage.file_path}`;
              setPreviewImageUrl(imageUrl);

              // Store the generated image data
              setGeneratedImageData({
                image_id: completedImage.image_id,
                system_filename: completedImage.system_filename
              });

              setShowPreviewModal(true);
              toast.success('Preview generated successfully!', {
                description: 'Your influencer preview is ready to view'
              });
              setIsPreviewLoading(false);
              return;
            }
          }

          // If no completed images yet, continue polling
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollForImages, 1000); // Poll every second
          } else {
            toast.error('Preview generation timeout', {
              description: 'The preview is taking longer than expected. Please try again.'
            });
            setIsPreviewLoading(false);
          }
        } catch (error) {
          console.error('Error polling for images:', error);
          toast.error('Failed to fetch preview image');
          setIsPreviewLoading(false);
        }
      };

      // Start polling
      pollForImages();

    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview');
      setIsPreviewLoading(false);
    }
  };

  const handleClosePreview = async () => {
    setShowPreviewModal(false);
    setPreviewImageUrl(null);
    setGeneratedImageData(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">
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
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="relative">
                            <img
                              src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                              alt={option.label}
                              className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                            />
                            {influencerData.sex === option.value && (
                              <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.age === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {ethnic === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  {/* Items per page control */}
                  <div className="flex justify-between items-center">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                  </div>

                  {/* Facial Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="relative">
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                  alt={option.label}
                                  className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                                />
                                {influencerData.facial_features === option.label ? (
                                  <div className="absolute top-2 right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-5 h-5 text-white" />
                                  </div>
                                ) : null}
                              </div>
                              <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.cultural_background === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.hair_length === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.hair_style === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.hair_color === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.face_shape === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.eye_color === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.skin_tone === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                <h2 className="text-2xl font-bold">
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
                      Showing {startIndex + 1}-{Math.min(endIndex, bodyTypeOptions.length)} of {bodyTypeOptions.length} body type options
                    </div>
                  </div>

                  {/* Body Type Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.body_type === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                  {Math.ceil(bodyTypeOptions.length / (itemsPerPage === -1 ? bodyTypeOptions.length : itemsPerPage)) > 1 && (
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
                  )}
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
                <h2 className="text-2xl font-bold">
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
                      Showing {startIndex + 1}-{Math.min(endIndex, bustSizeOptions.length)} of {bustSizeOptions.length} bust size options
                    </div>
                  </div>

                  {/* Bust Size Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                          toast.success(`${option.label} selected`, {
                            id: 'bust-size-selection',
                            position: 'bottom-center'
                          });
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.bust_size === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
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
                  Current Residence
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Tell us where your influencer currently lives. This will also be set as their birth place and can be edited later in the Influencer Dataset.
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Where does your influencer currently live?
                      </label>
                      <input
                        type="text"
                        value={influencerData.origin_residence}
                        onChange={(e) => handleOptionSelect('origin_residence', e.target.value)}
                        placeholder="e.g., Los Angeles, USA"
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        💡 This will also be set as their birth place. You can edit both separately later in the Influencer Dataset.
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
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Preview Your Influencer
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  See how your influencer will look before creating the final version.<br />
                  You can add more details on Influencer → Edit page after creation.
                </p>
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Ready to see your influencer?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Click the button below to generate a preview of your influencer based on all the selections you've made.
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
                          Click Here to Render a Preview
                          <Sparkles className="w-6 h-6" />
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      💡 This will create a temporary preview that will be deleted after you close it.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                        <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
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
        return influencerData.facial_features !== '';
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
        return influencerData.origin_residence !== '';
      case 15:
        return influencerData.name_first !== '' && influencerData.name_last !== '';
      case 16:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="justify-center items-center flex">
      <Card className="w-full border-0">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Create Your Influencer
          </CardTitle>
          {/* Navigation Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Back Button - Left */}
            <div className="w-full md:w-auto">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-base font-medium border-2 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 w-full md:w-auto"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
            </div>

            {/* Title - Center (hidden on mobile) */}
            <div className="hidden md:block">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {
                  influencerData.sex !== 'Female' && currentStep > 17 ?
                    `Step ${currentStep - 1} of ${getActiveSteps(influencerData).length}`
                    :
                    `Step ${currentStep} of ${getActiveSteps(influencerData).length}`
                }
              </h3>
            </div>

            {/* Next/Create Button - Right */}
            <div className="w-full md:w-auto">
              {currentStep <= 15 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full md:w-auto"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full md:w-auto"
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
        </CardHeader>

        <div className="flex justify-center items-center text-center my-8">
          {
            currentStep === 1 && (
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
                This wizard will guide you step by step through the creation of a basic influencer with your desired details.
                <br />
                <span className="font-medium text-gray-700 dark:text-gray-300">You can modify everything later in the influencer dataset.</span>
              </p>
            )
          }
        </div>

        <CardContent className="space-y-2">

          {/* Step Content */}
          {renderStepContent()}

          {/* Mobile: Back and Next buttons under Create Influencer */}
          <div className="md:hidden flex justify-between items-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-base font-medium border-2 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </Button>

            {currentStep < getActiveSteps(influencerData).length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
        </CardContent>
      </Card>

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

          {selectedNameSuggestion && (() => {
            const nameOptions = parseNameWithNickname(selectedNameSuggestion.full_name);
            return (
              <div className="space-y-4">
                {/* Full Name with Nickname Option */}
                <Card
                  className="border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 cursor-pointer transition-all duration-300"
                  onClick={() => handleFinalNameSelect(nameOptions.fullNameWithNickname)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {nameOptions.fullNameWithNickname}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Full name with nickname
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Full Name without Nickname Option */}
                <Card
                  className="border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all duration-300"
                  onClick={() => handleFinalNameSelect(nameOptions.fullNameWithoutNickname)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {nameOptions.fullNameWithoutNickname}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Full name without nickname
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Nickname Only Option (if available) */}
                {nameOptions.nicknameOnly && (
                  <Card
                    className="border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer transition-all duration-300"
                    onClick={() => handleFinalNameSelect(nameOptions.nicknameOnly)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                          {nameOptions.nicknameOnly}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Nickname with last name
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}

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

      {/* Step 3 Modal - Choose Creation Method */}
      <Dialog open={showStep3Modal} onOpenChange={setShowStep3Modal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative h-full">
            {previewImageUrl ? (
              <div className="space-y-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl font-bold">
                        Influencer Preview
                      </DialogTitle>
                      <DialogDescription className="text-purple-100">
                        Here's how your influencer will look based on your selections
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">AI Generated</span>
                    </div>
                  </div>
                </div>

                {/* Image Display */}
                <div className="flex justify-center items-center p-8 bg-gray-50 dark:bg-gray-900">
                  <div className="relative">
                    <img
                      src={previewImageUrl}
                      alt="Influencer Preview"
                      className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-white dark:border-gray-700"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      Preview Generated
                    </div>
                  </div>
                </div>

                {/* Influencer Details */}
                <div className="bg-white dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span className="font-medium">{influencerData.name_first} {influencerData.name_last}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sex:</span>
                          <span className="font-medium">{influencerData.sex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Age:</span>
                          <span className="font-medium">{influencerData.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Origin:</span>
                          <span className="font-medium">{influencerData.origin_residence}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Physical Features</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Hair:</span>
                          <span className="font-medium">{influencerData.hair_color} {influencerData.hair_length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Eyes:</span>
                          <span className="font-medium">{influencerData.eye_color}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Skin Tone:</span>
                          <span className="font-medium">{influencerData.skin_tone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Body Type:</span>
                          <span className="font-medium">{influencerData.body_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Background</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cultural:</span>
                          <span className="font-medium">{influencerData.cultural_background}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Facial Features:</span>
                          <span className="font-medium">{influencerData.facial_features}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Face Shape:</span>
                          <span className="font-medium">{influencerData.face_shape}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium">{influencerData.influencer_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={handleClosePreview}
                      className="px-6 py-3 text-base font-medium"
                    >
                      Close Preview
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-8 py-3 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Create Final Influencer</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-16">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Generating preview...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few moments</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 