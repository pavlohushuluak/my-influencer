import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Loader2, User, Sparkles, Palette, Settings, ArrowRight, Check, ZoomIn, RefreshCcw, Globe } from 'lucide-react';
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

const steps = [
  {
    id: 1,
    title: 'Sex Selection',
    description: 'Choose the sex of your influencer',
    icon: User
  },
  {
    id: 2,
    title: 'Facial Features',
    description: 'Select facial features template',
    icon: Sparkles
  },
  {
    id: 3,
    title: 'Age Selection',
    description: 'Choose age range',
    icon: Palette
  },
  {
    id: 4,
    title: 'Lifestyle Selection',
    description: 'Choose lifestyle',
    icon: Settings
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
    title: 'Eye Shape',
    description: 'Select eye shape',
    icon: Settings
  },
  {
    id: 12,
    title: 'Lip Style',
    description: 'Choose lip style',
    icon: Settings
  },
  {
    id: 13,
    title: 'Nose Style',
    description: 'Select nose style',
    icon: Settings
  },
  {
    id: 14,
    title: 'Eyebrow Style',
    description: 'Choose eyebrow style',
    icon: Settings
  },
  {
    id: 15,
    title: 'Skin Tone',
    description: 'Select skin tone',
    icon: Settings
  },
  {
    id: 16,
    title: 'Body Type',
    description: 'Choose body type',
    icon: Settings
  },
  {
    id: 17,
    title: 'Bust Size',
    description: 'Select bust size (Female only)',
    icon: Settings
  },
  {
    id: 18,
    title: 'Origin Details',
    description: 'Enter birth and residence origin',
    icon: Settings
  },
  {
    id: 19,
    title: 'Name',
    description: 'Enter first and last name',
    icon: Settings
  },
  {
    id: 20,
    title: 'Confirm Creation',
    description: 'Review and create your influencer',
    icon: Settings
  }
];

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
  const [selectedFacialTemplate, setSelectedFacialTemplate] = useState<FacialTemplateDetail | null>(null);
  const [showFacialTemplateDetails, setShowFacialTemplateDetails] = useState(false);
  const [showFacialTemplateConfirm, setShowFacialTemplateConfirm] = useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
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

  const [nameWizardResponse, setNameWizardResponse] = useState<any>(null);
  const [isLoadingNameWizard, setIsLoadingNameWizard] = useState(false);

  console.log(influencerData);
  // Fetch sex options from API
  useEffect(() => {
    const fetchSexOptions = async () => {
      try {
        setIsLoadingSexOptions(true);
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=sex', {
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
  useEffect(() => {
    const fetchFacialFeaturesOptions = async () => {
      try {
        setIsLoadingFacialFeatures(true);
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=facial_features', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setFacialFeaturesOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching facial features options:', error);
      } finally {
        setIsLoadingFacialFeatures(false);
      }
    };

    fetchFacialFeaturesOptions();
  }, []);

  // Fetch age options from API
  useEffect(() => {
    const fetchAgeOptions = async () => {
      try {
        setIsLoadingAge(true);
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=age', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=lifestyle', {
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
  useEffect(() => {
    const fetchCulturalBackgroundOptions = async () => {
      try {
        setIsLoadingCulturalBackground(true);
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=cultural_background', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setCulturalBackgroundOptions(responseData.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching cultural background options:', error);
      } finally {
        setIsLoadingCulturalBackground(false);
      }
    };

    fetchCulturalBackgroundOptions();
  }, []);

  // Fetch hair length options from API
  useEffect(() => {
    const fetchHairLengthOptions = async () => {
      try {
        setIsLoadingHairLength(true);
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=hair_length', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=hair_style', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=hair_color', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=face_shape', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=eye_color', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=eye_shape', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=lip_style', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=nose_style', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=eyebrow_style', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=skin_tone', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=body_type', {
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
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=bust', {
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
        setNameWizardResponse(data);
      } else {
        console.error('Failed to fetch name suggestions');
        toast.error('Failed to get name suggestions', {
          position: 'bottom-center'
        });
      }
    } catch (error) {
      console.error('Error fetching name suggestions:', error);
      toast.error('Error getting name suggestions', {
        position: 'bottom-center'
      });
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

    // Show success toast for selection
    if (typeof value === 'string' && value !== '' && field !== 'origin_birth' && field !== 'origin_residence') {
      toast.success(`${value} selected`, {
        position: 'bottom-center'
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
        body: JSON.stringify(influencerData)
      });

      if (response.ok) {
        const newInfluencer = await response.json();
        toast.success('Influencer created successfully!', {
          position: 'bottom-center'
        });
        navigate('/influencers/edit', { state: { influencerData: newInfluencer[0] } });
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">
                  Choose Your Influencer's Sex
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  As a first step, please select the desired sex of your influencer.
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              {isLoadingSexOptions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading sex options...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
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
                  Facial Features Selection
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                  To ease your start, we provide you with a list of well curated Facial templates, that help you to get started.
                  You can select out of the portfolio or start from Scratch.
                  All setting can be modified.
                </p>
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
                    {currentItems.map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          (option.label === "Default" && influencerData.facial_features === 'Default') || influencerData.facial_features === option.label
                            ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                        )}
                        onClick={() => {
                          if (option.label === "Default") {
                            // Set all facial feature fields to "Default"
                            setInfluencerData(prev => ({
                              ...prev,
                              facial_features: 'Default',
                              face_shape: 'Default',
                              hair_style: 'Default',
                              hair_color: 'Default',
                              hair_length: 'Default',
                              eye_color: 'Default',
                              nose_style: 'Default',
                              lip_style: 'Default',
                              eye_shape: 'Default',
                              eyebrow_style: 'Default',
                              cultural_background: 'Default'
                            }));
                            toast.success('Start from Scratch selected', {
                              id: 'start-from-scratch',
                              position: 'bottom-center'
                            });
                          } else {
                            applyFacialTemplate(option.label);
                          }
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                                alt={option.label === "Default" ? "Start from Scratch" : option.label}
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {(option.label === "Default" && influencerData.facial_features === 'Default') || influencerData.facial_features === option.label ? (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              ) : null}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {option.label === "Default" ? "Start from Scratch" : option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.label === "Default"
                                  ? "Create a completely custom facial template with your own specifications and preferences"
                                  : option.description
                                }
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

      case 3:
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

            <div className="mx-auto">
              {isLoadingAge ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading age options...</p>
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
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={-1}>All</option>
                      </select>
                      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, ageOptions.length)} of {ageOptions.length} age options
                    </div>
                  </div>

                  {/* Age Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">
                  Lifestyle Selection
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the lifestyle that best represents your influencer's daily routine, interests, and way of living.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingLifestyle ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading lifestyle options...</p>
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
                      Showing {startIndex + 1}-{Math.min(endIndex, lifestyleOptions.length)} of {lifestyleOptions.length} lifestyle options
                    </div>
                  </div>

                  {/* Lifestyle Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {lifestyleOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.lifestyle === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('lifestyle', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'lifestyle-selection',
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.lifestyle === option.label && (
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
                  {Math.ceil(lifestyleOptions.length / (itemsPerPage === -1 ? lifestyleOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, lifestyleOptions.length)} of {lifestyleOptions.length} lifestyle options
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
                          {Array.from({ length: Math.min(5, Math.ceil(lifestyleOptions.length / (itemsPerPage === -1 ? lifestyleOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(lifestyleOptions.length / (itemsPerPage === -1 ? lifestyleOptions.length : itemsPerPage));
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
                          disabled={currentPage === Math.ceil(lifestyleOptions.length / (itemsPerPage === -1 ? lifestyleOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(lifestyleOptions.length / (itemsPerPage === -1 ? lifestyleOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(lifestyleOptions.length / (itemsPerPage === -1 ? lifestyleOptions.length : itemsPerPage))}
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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
                  Eye Shape
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the eye shape that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingEyeShape ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading eye shape options...</p>
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
                      Showing {startIndex + 1}-{Math.min(endIndex, eyeShapeOptions.length)} of {eyeShapeOptions.length} eye shape options
                    </div>
                  </div>

                  {/* Eye Shape Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {eyeShapeOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.eye_shape === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('eye_shape', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'eye-shape-selection',
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.eye_shape === option.label && (
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
                  {Math.ceil(eyeShapeOptions.length / (itemsPerPage === -1 ? eyeShapeOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, eyeShapeOptions.length)} of {eyeShapeOptions.length} eye shape options
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
                          {Array.from({ length: Math.min(5, Math.ceil(eyeShapeOptions.length / (itemsPerPage === -1 ? eyeShapeOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(eyeShapeOptions.length / (itemsPerPage === -1 ? eyeShapeOptions.length : itemsPerPage));
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
                          disabled={currentPage === Math.ceil(eyeShapeOptions.length / (itemsPerPage === -1 ? eyeShapeOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(eyeShapeOptions.length / (itemsPerPage === -1 ? eyeShapeOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(eyeShapeOptions.length / (itemsPerPage === -1 ? eyeShapeOptions.length : itemsPerPage))}
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
                  Lip Style
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the lip style that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingLipStyle ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading lip style options...</p>
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
                      Showing {startIndex + 1}-{Math.min(endIndex, lipStyleOptions.length)} of {lipStyleOptions.length} lip style options
                    </div>
                  </div>

                  {/* Lip Style Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {lipStyleOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.lip_style === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('lip_style', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'lip-style-selection',
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.lip_style === option.label && (
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
                  {Math.ceil(lipStyleOptions.length / (itemsPerPage === -1 ? lipStyleOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, lipStyleOptions.length)} of {lipStyleOptions.length} lip style options
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
                          {Array.from({ length: Math.min(5, Math.ceil(lipStyleOptions.length / (itemsPerPage === -1 ? lipStyleOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(lipStyleOptions.length / (itemsPerPage === -1 ? lipStyleOptions.length : itemsPerPage));
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
                          disabled={currentPage === Math.ceil(lipStyleOptions.length / (itemsPerPage === -1 ? lipStyleOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(lipStyleOptions.length / (itemsPerPage === -1 ? lipStyleOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(lipStyleOptions.length / (itemsPerPage === -1 ? lipStyleOptions.length : itemsPerPage))}
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
                  Nose Style
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the nose style that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingNoseStyle ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading nose style options...</p>
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
                      Showing {startIndex + 1}-{Math.min(endIndex, noseStyleOptions.length)} of {noseStyleOptions.length} nose style options
                    </div>
                  </div>

                  {/* Nose Style Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {noseStyleOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.nose_style === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('nose_style', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'nose-style-selection',
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.nose_style === option.label && (
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
                  {Math.ceil(noseStyleOptions.length / (itemsPerPage === -1 ? noseStyleOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, noseStyleOptions.length)} of {noseStyleOptions.length} nose style options
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
                          {Array.from({ length: Math.min(5, Math.ceil(noseStyleOptions.length / (itemsPerPage === -1 ? noseStyleOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(noseStyleOptions.length / (itemsPerPage === -1 ? noseStyleOptions.length : itemsPerPage));
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
                          disabled={currentPage === Math.ceil(noseStyleOptions.length / (itemsPerPage === -1 ? noseStyleOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(noseStyleOptions.length / (itemsPerPage === -1 ? noseStyleOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(noseStyleOptions.length / (itemsPerPage === -1 ? noseStyleOptions.length : itemsPerPage))}
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
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">
                  Eyebrow Style
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the eyebrow style that best represents your influencer's appearance.
                </p>
              </div>
            </div>

            <div className="mx-auto">
              {isLoadingEyebrowStyle ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading eyebrow style options...</p>
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
                      Showing {startIndex + 1}-{Math.min(endIndex, eyebrowStyleOptions.length)} of {eyebrowStyleOptions.length} eyebrow style options
                    </div>
                  </div>

                  {/* Eyebrow Style Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {eyebrowStyleOptions.slice(startIndex, endIndex).map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.eyebrow_style === option.label
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('eyebrow_style', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'eyebrow-style-selection',
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.eyebrow_style === option.label && (
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
                  {Math.ceil(eyebrowStyleOptions.length / (itemsPerPage === -1 ? eyebrowStyleOptions.length : itemsPerPage)) > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, eyebrowStyleOptions.length)} of {eyebrowStyleOptions.length} eyebrow style options
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
                          {Array.from({ length: Math.min(5, Math.ceil(eyebrowStyleOptions.length / (itemsPerPage === -1 ? eyebrowStyleOptions.length : itemsPerPage))) }, (_, i) => {
                            let pageNum;
                            const totalPages = Math.ceil(eyebrowStyleOptions.length / (itemsPerPage === -1 ? eyebrowStyleOptions.length : itemsPerPage));
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
                          disabled={currentPage === Math.ceil(eyebrowStyleOptions.length / (itemsPerPage === -1 ? eyebrowStyleOptions.length : itemsPerPage))}
                          className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(Math.ceil(eyebrowStyleOptions.length / (itemsPerPage === -1 ? eyebrowStyleOptions.length : itemsPerPage)))}
                          disabled={currentPage === Math.ceil(eyebrowStyleOptions.length / (itemsPerPage === -1 ? eyebrowStyleOptions.length : itemsPerPage))}
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

      case 15:
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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

      case 16:
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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

      case 17:
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
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
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

      case 18:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Origin & Residence
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Tell us about your influencer's background and current location.
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Where was your influencer born?
                        </label>
                        <input
                          type="text"
                          value={influencerData.origin_birth}
                          onChange={(e) => handleOptionSelect('origin_birth', e.target.value)}
                          placeholder="e.g., New York, USA"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Where is its current residence?
                        </label>
                        <input
                          type="text"
                          value={influencerData.origin_residence}
                          onChange={(e) => handleOptionSelect('origin_residence', e.target.value)}
                          placeholder="e.g., Los Angeles, USA"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 19:
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

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-green-200 dark:border-green-700">
                        <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-auto max-h-96">
                          {JSON.stringify(nameWizardResponse, null, 2)}
                        </pre>
                      </div>

                      <div className="text-center text-sm text-green-600 dark:text-green-300">
                        💡 You can use these suggestions as inspiration or continue with your own names above.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 20:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  That's it!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Shall we create your influencer now?<br />
                  You can add more details on Influencer → Edit page.
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Name Input Fields */}
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
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600"
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
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600"
                        />
                      </div>
                    </div>

                    {/* Review Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sex:</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1">
                            {influencerData.sex}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Facial Features:</span>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1">
                            {influencerData.facial_features || 'Not selected'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Age:</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1">
                            {influencerData.age || 'Not selected'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lifestyle:</span>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1">
                            {influencerData.lifestyle || 'Not selected'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cultural Background:</span>
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-1">
                            {influencerData.cultural_background || 'Not selected'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-lg">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hair Style:</span>
                          <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 px-3 py-1">
                            {influencerData.hair_style || 'Not selected'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-lg">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Eye Color:</span>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-1">
                            {influencerData.eye_color || 'Not selected'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Skin Tone:</span>
                          <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 px-3 py-1">
                            {influencerData.skin_tone || 'Not selected'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return influencerData.sex !== '';
      case 2:
        return influencerData.facial_features !== '';
      case 3:
        return influencerData.age !== '';
      case 4:
        return influencerData.lifestyle !== '';
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
        return influencerData.eye_shape !== '';
      case 12:
        return influencerData.lip_style !== '';
      case 13:
        return influencerData.nose_style !== '';
      case 14:
        return influencerData.eyebrow_style !== '';
      case 15:
        return influencerData.skin_tone !== '';
      case 16:
        return influencerData.body_type !== '';
      case 17:
        return influencerData.sex === 'Female' ? influencerData.bust_size !== '' : true;
      case 18:
        return influencerData.origin_birth !== '' && influencerData.origin_residence !== '';
      case 19:
        return influencerData.name_first !== '' && influencerData.name_last !== '';
      case 20:
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
          {
            currentStep === 1 && (
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
                This wizard will guide you step by step through the creation of a basic influencer with your desired details.
                <br />
                <span className="font-medium text-gray-700 dark:text-gray-300">You can modify everything later in the influencer dataset.</span>
              </p>
            )
          }
        </CardHeader>

        <CardContent className="space-y-2">

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-base font-medium border-2 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              {currentStep < steps.length ? (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 