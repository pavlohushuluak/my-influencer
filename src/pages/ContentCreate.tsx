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
import { ArrowLeft, Wand2, Settings, Image as ImageIcon, Sparkles, Loader2, Play, Eye, Palette, Camera, Zap, Search, X, Filter, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Influencer } from '@/store/slices/influencersSlice';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ZoomIn } from 'lucide-react';

const TASK_OPTIONS = [
  { value: 'generate_image', label: 'Generate Image', description: 'Generate a single image' },
  { value: 'generate_series', label: 'Generate Image Series', description: 'Generate multiple images in a series' }
];

const SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'name', label: 'Name' },
  { id: 'age_lifestyle', label: 'Age/Lifestyle' },
  { id: 'influencer_type', label: 'Type' }
];

interface Option {
  label: string;
  image: string;
  description: string;
}

export default function ContentCreate() {
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const [activeTab, setActiveTab] = useState('scene');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get influencer data from navigation state
  const influencerData = location.state?.influencerData;

  // Model data state to store influencer information
  const [modelData, setModelData] = useState<Influencer | null>(null);

  // Search state for influencer selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState(SEARCH_FIELDS[0]);
  const [openFilter, setOpenFilter] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Form state
  const [formData, setFormData] = useState({
    model: '',
    scene: '',
    task: 'generate_image',
    lora: false,
    noAI: true,
    prompt: '',
    format: 'square',
    numberOfImages: 1,
    seed: '',
    guidance: 3.5,
    negative_prompt: '',
    nsfw_strength: 0,
    lora_strength: 0,
    quality: 'Basic'
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
    makeup: '',
    bust: '',
    clothing: '',
    sex: '',
    eyebrowStyle: '',
    faceShape: '',
    colorPalette: ''
  });

  // Makeup options and modal state
  const [makeupOptions, setMakeupOptions] = useState<Option[]>([]);
  const [showMakeupSelector, setShowMakeupSelector] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Framing options and modal state
  const [framingOptions, setFramingOptions] = useState<Option[]>([]);
  const [showFramingSelector, setShowFramingSelector] = useState(false);

  // Clothes options and modal state
  const [clothesOptions, setClothesOptions] = useState<Option[]>([]);
  const [showClothesSelector, setShowClothesSelector] = useState(false);

  // Rotation options and modal state
  const [rotationOptions, setRotationOptions] = useState<Option[]>([]);
  const [showRotationSelector, setShowRotationSelector] = useState(false);

  // Lighting options and modal state
  const [lightingOptions, setLightingOptions] = useState<Option[]>([]);
  const [showLightingSelector, setShowLightingSelector] = useState(false);

  // Pose options and modal state
  const [poseOptions, setPoseOptions] = useState<Option[]>([]);
  const [showPoseSelector, setShowPoseSelector] = useState(false);

  // Scene settings options and modal state
  const [sceneSettingsOptions, setSceneSettingsOptions] = useState<Option[]>([]);
  const [showSceneSettingsSelector, setShowSceneSettingsSelector] = useState(false);

  // Format options and modal state
  const [formatOptions, setFormatOptions] = useState<Option[]>([]);
  const [showFormatSelector, setShowFormatSelector] = useState(false);

  // Influencer selector dialog state
  const [showInfluencerSelector, setShowInfluencerSelector] = useState(false);

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
        makeup: 'Natural / No-Makeup Look', // No makeup_style property in Influencer interface
        clothing: `${influencerData.clothing_style_everyday || ''} ${influencerData.clothing_style_occasional || ''}`.trim(),
        sex: influencerData.sex || '',
        bust: influencerData.bust_size || '', // No bust property in Influencer interface
        eyebrowStyle: '', // No eyebrow_style property in Influencer interface
        faceShape: influencerData.face_shape || '',
        colorPalette: influencerData.color_palette ? influencerData.color_palette.join(', ') : ''
      });

      // Generate the model description automatically
      const parts = [];

      if (influencerData.name_first && influencerData.name_last) {
        parts.push(`${influencerData.name_first} ${influencerData.name_last}`);
      }
      if (influencerData.age_lifestyle) parts.push(influencerData.age_lifestyle);
      if (influencerData.cultural_background) parts.push(`Cultural background: ${influencerData.cultural_background}`);
      if (influencerData.body_type) parts.push(`Body type: ${influencerData.body_type}`);
      if (influencerData.facial_features) parts.push(`Facial features: ${influencerData.facial_features}`);
      if (influencerData.hair_color && influencerData.hair_length && influencerData.hair_style) {
        parts.push(`${influencerData.hair_length} ${influencerData.hair_color} hair, ${influencerData.hair_style} style`);
      }
      if (influencerData.skin_tone) parts.push(`Skin: ${influencerData.skin_tone}`);
      if (influencerData.lip_style) parts.push(`Lips: ${influencerData.lip_style}`);
      if (influencerData.eye_color) parts.push(`Eyes: ${influencerData.eye_color}`);
      if (influencerData.nose_style) parts.push(`Nose: ${influencerData.nose_style}`);
      if (modelDescription.makeup) parts.push(`Makeup: ${modelDescription.makeup}`);
      if (influencerData.clothing_style_everyday || influencerData.clothing_style_occasional) {
        parts.push(`Clothing: ${influencerData.clothing_style_everyday || ''} ${influencerData.clothing_style_occasional || ''}`.trim());
      }

      const fullDescription = parts.join(', ');
      setFormData(prev => ({
        ...prev,
        model: fullDescription
      }));

      toast.success(`Using ${influencerData.name_first} ${influencerData.name_last} for content generation`);
    }
  }, [influencerData]);

  // Fetch makeup options from API
  useEffect(() => {
    const fetchMakeupOptions = async () => {
      try {
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=makeup', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.fieldoptions && Array.isArray(data.fieldoptions)) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            }));
            setMakeupOptions(options);
          }
        } else {
          console.error('Failed to fetch makeup options:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching makeup options:', error);
      }
    };
    fetchMakeupOptions();
  }, []);

  // Fetch framing options from API
  useEffect(() => {
    const fetchFramingOptions = async () => {
      try {
        const response = await fetch('https://api.nymia.ai/v1/promptoptions?fieldtype=framing', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.fieldoptions && Array.isArray(data.fieldoptions)) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            }));
            setFramingOptions(options);
          }
        } else {
          console.error('Failed to fetch framing options:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching framing options:', error);
      }
    };
    fetchFramingOptions();
  }, []);

  // Fetch clothes options from API
  useEffect(() => {
    const fetchClothesOptions = async () => {
      try {
        const response = await fetch('https://api.nymia.ai/v1/promptoptions?fieldtype=outfits', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.fieldoptions && Array.isArray(data.fieldoptions)) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            }));
            setClothesOptions(options);
          }
        } else {
          console.error('Failed to fetch clothes options:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching clothes options:', error);
      }
    };
    fetchClothesOptions();
  }, []);

  // Fetch rotation options from API
  useEffect(() => {
    const fetchRotationOptions = async () => {
      try {
        const response = await fetch('https://api.nymia.ai/v1/promptoptions?fieldtype=rotation', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.fieldoptions && Array.isArray(data.fieldoptions)) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            }));
            setRotationOptions(options);
          }
        } else {
          console.error('Failed to fetch rotation options:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching rotation options:', error);
      }
    };
    fetchRotationOptions();
  }, []);

  // Fetch lighting options from API
  useEffect(() => {
    const fetchLightingOptions = async () => {
      try {
        const response = await fetch('https://api.nymia.ai/v1/promptoptions?fieldtype=light', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.fieldoptions && Array.isArray(data.fieldoptions)) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            }));
            setLightingOptions(options);
          }
        } else {
          console.error('Failed to fetch lighting options:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching lighting options:', error);
      }
    };
    fetchLightingOptions();
  }, []);

  // Fetch pose options from API
  useEffect(() => {
    const fetchPoseOptions = async () => {
      try {
        const response = await fetch('https://api.nymia.ai/v1/promptoptions?fieldtype=pose', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.fieldoptions && Array.isArray(data.fieldoptions)) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            }));
            setPoseOptions(options);
          }
        } else {
          console.error('Failed to fetch pose options:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching pose options:', error);
      }
    };
    fetchPoseOptions();
  }, []);

  // Fetch scene settings options from API
  useEffect(() => {
    const fetchSceneSettingsOptions = async () => {
      try {
        const response = await fetch('https://api.nymia.ai/v1/promptoptions?fieldtype=scene', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.fieldoptions && Array.isArray(data.fieldoptions)) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            }));
            setSceneSettingsOptions(options);
          }
        } else {
          console.error('Failed to fetch scene settings options:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching scene settings options:', error);
      }
    };
    fetchSceneSettingsOptions();
  }, []);

  // Fetch format options from API
  useEffect(() => {
    const fetchFormatOptions = async () => {
      try {
        const response = await fetch('https://api.nymia.ai/v1/promptoptions?fieldtype=format', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.fieldoptions && Array.isArray(data.fieldoptions)) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            }));
            setFormatOptions(options);
          }
        } else {
          console.error('Failed to fetch format options:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching format options:', error);
      }
    };
    fetchFormatOptions();
  }, []);

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
    // Save selected influencer to modelData state
    setModelData(influencer);

    // Populate model description from selected influencer
    setModelDescription({
      appearance: `${influencer.name_first} ${influencer.name_last}, ${influencer.age_lifestyle || ''}`,
      culturalBackground: influencer.cultural_background || '',
      bodyType: influencer.body_type || '',
      facialFeatures: influencer.facial_features || '',
      hairColor: influencer.hair_color || '',
      hairLength: influencer.hair_length || '',
      hairStyle: influencer.hair_style || '',
      skin: influencer.skin_tone || '',
      lips: influencer.lip_style || '',
      eyes: influencer.eye_color || '',
      nose: influencer.nose_style || '',
      makeup: 'Natural / No-Makeup Look', // No makeup_style property in Influencer interface
      clothing: `${influencer.clothing_style_everyday || ''} ${influencer.clothing_style_occasional || ''}`.trim(),
      sex: influencer.sex || '',
      bust: influencer.bust_size || '', // No bust property in Influencer interface
      eyebrowStyle: '', // No eyebrow_style property in Influencer interface
      faceShape: influencer.face_shape || '',
      colorPalette: influencer.color_palette ? influencer.color_palette.join(', ') : ''
    });

    // Generate the model description automatically
    const parts = [];

    if (influencer.name_first && influencer.name_last) {
      parts.push(`${influencer.name_first} ${influencer.name_last}`);
    }
    if (influencer.age_lifestyle) parts.push(influencer.age_lifestyle);
    if (influencer.cultural_background) parts.push(`Cultural background: ${influencer.cultural_background}`);
    if (influencer.body_type) parts.push(`Body type: ${influencer.body_type}`);
    if (influencer.facial_features) parts.push(`Facial features: ${influencer.facial_features}`);
    if (influencer.hair_color && influencer.hair_length && influencer.hair_style) {
      parts.push(`${influencer.hair_length} ${influencer.hair_color} hair, ${influencer.hair_style} style`);
    }
    if (influencer.skin_tone) parts.push(`Skin: ${influencer.skin_tone}`);
    if (influencer.lip_style) parts.push(`Lips: ${influencer.lip_style}`);
    if (influencer.eye_color) parts.push(`Eyes: ${influencer.eye_color}`);
    if (influencer.nose_style) parts.push(`Nose: ${influencer.nose_style}`);
    if (modelDescription.makeup) parts.push(`Makeup: ${modelDescription.makeup}`);
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

  const handleGenerate = async () => {
    if (!formData.model && !formData.prompt) {
      toast.error('Please provide either a model description or a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // Create the JSON data structure
      const requestData = {
        task: formData.task,
        lora: formData.lora,
        noAI: formData.noAI,
        prompt: formData.prompt,
        negative_prompt: formData.negative_prompt,
        nsfw_strength: formData.nsfw_strength,
        lora_strength: formData.lora_strength,
        quality: formData.quality,
        seed: formData.seed ? parseInt(formData.seed) : -1,
        guidance: formData.guidance,
        number_of_images: formData.numberOfImages,
        format: formData.format,
        model: modelData ? {
          id: modelData.id,
          influencer_type: modelData.influencer_type,
          sex: modelData.sex,
          cultural_background: modelData.cultural_background,
          hair_length: modelData.hair_length,
          hair_color: modelData.hair_color,
          hair_style: modelData.hair_style,
          eye_color: modelData.eye_color,
          lip_style: modelData.lip_style,
          nose_style: modelData.nose_style,
          face_shape: modelData.face_shape,
          facial_features: modelData.facial_features,
          skin_tone: modelData.skin_tone,
          bust: modelData.bust_size, // Default value since not in Influencer type
          body_type: modelData.body_type,
          color_palette: modelData.color_palette || [],
          clothing_style_everyday: modelData.clothing_style_everyday,
          eyebrow_style: modelData.eyebrow_style, // Default value since not in Influencer type
          makeup_style: modelDescription.makeup || "Natural / No-Makeup Look", // Use from modelDescription or default
          name_first: modelData.name_first,
          name_last: modelData.name_last,
          visual_only: true
        } : null,
        scene: {
          framing: sceneSpecs.framing,
          rotation: sceneSpecs.rotation,
          lighting_preset: sceneSpecs.lighting_preset,
          scene_setting: sceneSpecs.scene_setting,
          pose: sceneSpecs.pose,
          clothes: sceneSpecs.clothes
        }
      };

      const useridResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const useridData = await useridResponse.json();

      // Send the request to localhost:2000
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

      toast.success('Content generation started successfully');

      setFormData({
        model: '',
        scene: '',
        task: 'generate_image',
        lora: false,
        noAI: true,
        prompt: '',
        format: 'square',
        numberOfImages: 1,
        seed: '',
        guidance: 3.5,
        negative_prompt: '',
        nsfw_strength: 0,
        lora_strength: 0,
        quality: 'Basic'
      });

      setModelData(null);
      setActiveTab('scene');
      setSceneSpecs({
        framing: '',
        rotation: '',
        lighting_preset: '',
        scene_setting: '',
        pose: '',
        clothes: ''
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

  // OptionSelector for makeup (copied from InfluencerEdit)
  const OptionSelector = ({ options, onSelect, onClose, title }: {
    options: Option[],
    onSelect: (label: string) => void,
    onClose: () => void,
    title: string
  }) => {
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
      e.stopPropagation();
      setLocalPreview(imageUrl);
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
                        className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                        onClick={(e) => handleImageClick(e, `https://images.nymia.ai/cdn-cgi/image/w=800/wizard/${option.image}`)}
                      >
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-center">{option.label}</p>
                      {option.description && (
                        <p className="text-xs text-muted-foreground text-center leading-tight">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        {localPreview && (
          <Dialog open={true} onOpenChange={() => setLocalPreview(null)}>
            <DialogContent className="max-w-2xl">
              <img src={localPreview} alt="Preview" className="w-full h-auto rounded-lg" />
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Create Content
            </h1>
            <p className="text-muted-foreground">
              {modelData ? `Creating content for ${modelData.name_first} ${modelData.name_last}` : 'Generate new content'}
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

      {/* Main Layout - 2 Columns */}
      <div className="grid grid-cols-1 2xl:grid-cols-[500px_1fr] lg:grid-cols-[270px_1fr] gap-6">
        {/* Left Column - Generation Summary and Influencer */}
        <div className="space-y-6">
          {/* Generation Summary */}
          <Card>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 2xl:grid-cols-3 gap-4">
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
                      {formatOptions.find(opt => opt.label === formData.format)?.label || formData.format}
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
                      CONSISTENCY
                    </span>
                    <Badge variant={formData.lora ? "default" : "secondary"} className={`w-fit ${formData.lora ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      {formData.lora ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      AI OPTIMIZE
                    </span>
                    <Badge variant={formData.noAI ? "default" : "secondary"} className={`w-fit ${formData.noAI ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      {formData.noAI ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      SFW/NSFW
                    </span>
                    <Badge variant="secondary" className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {formData.nsfw_strength === 0 ? 'Neutral' : formData.nsfw_strength > 0 ? 'NSFW' : 'SFW'}
                    </Badge>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      LORA STRENGTH
                    </span>
                    <Badge variant="secondary" className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {formData.lora_strength === 0 ? 'Neutral' : formData.lora_strength > 0 ? 'Strong' : 'Weak'}
                    </Badge>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      QUALITY
                    </span>
                    <Badge variant="secondary" className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {formData.quality}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Influencer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                Influencer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modelData ? (
                <>
                  <div className="grid 2xl:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div className="flex flex-col items-center gap-4">
                      <h3 className="font-semibold text-md">
                        {modelData.name_first} {modelData.name_last}
                      </h3>
                      <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={modelData.image_url}
                          alt={`${modelData.name_first} ${modelData.name_last}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className='flex flex-col gap-2 items-center'>
                        <p className="text-sm text-muted-foreground flex flex-col gap-2 items-center">
                          <Badge variant="secondary" className="text-xs mr-2">
                            {modelData.influencer_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs mr-2">
                            {modelData.age_lifestyle}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {/* Makeup Selection */}
                      <div className="space-y-2 flex flex-col items-center">
                        <Label className="text-md font-medium flex flex-col items-center">Makeup Style</Label>
                        <div
                          onClick={() => setShowMakeupSelector(true)}
                          className='flex flex-col items-center justify-center cursor-pointer w-full max-w-[200px]'
                        >
                          {(() => {
                            return modelDescription.makeup && makeupOptions.find(option => option.label === modelDescription.makeup)?.image ? (
                              <Card className="relative w-full">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <img
                                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${makeupOptions.find(option => option.label === modelDescription.makeup)?.image}`}
                                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                  </div>
                                  <p className="text-sm text-center font-medium mt-2">{makeupOptions.find(option => option.label === modelDescription.makeup)?.label}</p>
                                </CardContent>
                              </Card>
                            ) : (
                              <Card className="relative w-full border">
                                <CardContent className="p-4">
                                  <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                      Select makeup style
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })()}
                        </div>
                        {showMakeupSelector && (
                          <OptionSelector
                            options={makeupOptions}
                            onSelect={(label) => handleModelDescriptionChange('makeup', label)}
                            onClose={() => setShowMakeupSelector(false)}
                            title="Select Makeup Style"
                          />
                        )}
                        <div className="w-full max-w-[200px] mt-4">
                          <Select
                            value={modelDescription.makeup}
                            onValueChange={(value) => handleModelDescriptionChange('makeup', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select makeup style" />
                            </SelectTrigger>
                            <SelectContent>
                              {makeupOptions.map((option) => (
                                <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Select Another Influencer Button */}
                  {modelData && (
                    <Button
                      variant="outline"
                      onClick={() => setShowInfluencerSelector(true)}
                      className="w-full gap-2 mt-4"
                    >
                      <Plus className="w-4 h-4" />
                      Select Another Influencer
                    </Button>
                  )}

                  {/* Influencer Selection */}
                  {!modelData && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Select Influencer</h3>
                        <Badge variant="secondary" className="text-xs">
                          {filteredInfluencers.length} available
                        </Badge>
                      </div>

                      {/* Search Section */}
                      <div className="space-y-2">
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

                        <Popover open={openFilter} onOpenChange={setOpenFilter}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2 w-full">
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

                      {/* Influencers List */}
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {filteredInfluencers.map((influencer) => (
                            <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20 cursor-pointer" onClick={() => handleUseInfluencer(influencer)}>
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                      src={influencer.image_url}
                                      alt={`${influencer.name_first} ${influencer.name_last}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm group-hover:text-ai-purple-500 transition-colors truncate">
                                      {influencer.name_first} {influencer.name_last}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {influencer.age_lifestyle}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {influencer.influencer_type}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      Please select influencer below
                    </p>
                  </div>
                </div>
              )}

              {/* Select Influencer Button - shown when no influencer is selected */}
              {!modelData && (
                <Button
                  variant="outline"
                  onClick={() => setShowInfluencerSelector(true)}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Select Influencer
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings Tabs */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scene">Scene</TabsTrigger>
              <TabsTrigger value="basic">Basic</TabsTrigger>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className='grid grid-cols-1 gap-3'>
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

                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select
                        value={formData.format}
                        onValueChange={(value) => handleInputChange('format', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {formatOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div
                        onClick={() => setShowFormatSelector(true)}
                        className='flex items-center justify-center cursor-pointer w-full'
                      >
                        {formData.format && formatOptions.find(option => option.label === formData.format)?.image ? (
                          <Card className="relative w-full max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${formatOptions.find(option => option.label === formData.format)?.image}`}
                                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{formatOptions.find(option => option.label === formData.format)?.label}</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="relative w-full border max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                  Select format style
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      {showFormatSelector && (
                        <OptionSelector
                          options={formatOptions}
                          onSelect={(label) => handleInputChange('format', label)}
                          onClose={() => setShowFormatSelector(false)}
                          title="Select Format Style"
                        />
                      )}
                    </div>
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
                  {/* Show Influencer Selection or Selected Influencer */}
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
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 w-full"
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
                    // Show selected influencer card when model is selected
                    <div className="space-y-6">
                      {/* Selected Influencer Card */}
                      <div className="max-w-md mx-auto">
                        <Card className="group hover:shadow-lg transition-all duration-300 border-border/50">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                                <img
                                  src={modelData?.image_url}
                                  alt={`${modelData?.name_first} ${modelData?.name_last}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {modelData?.name_first} {modelData?.name_last}
                                  </h3>
                                </div>

                                <div className="flex flex-col gap-1 mb-3">
                                  <div className="flex text-sm text-muted-foreground flex-col">
                                    <span className="font-medium mr-2">Age/Lifestyle:</span>
                                    {modelData?.age_lifestyle}
                                  </div>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <span className="font-medium mr-2">Type:</span>
                                    {modelData?.influencer_type}
                                  </div>
                                </div>

                                {/* Makeup Selection */}
                                <div className="space-y-2 mb-3">
                                  <Label className="text-sm font-medium">Makeup Style</Label>
                                  <Select
                                    value={modelDescription.makeup}
                                    onValueChange={(value) => handleModelDescriptionChange('makeup', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select makeup style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {makeupOptions.map((option) => (
                                        <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <div
                                    onClick={() => setShowMakeupSelector(true)}
                                    className='flex items-center justify-center cursor-pointer w-full'
                                  >
                                    {(() => {
                                      return modelDescription.makeup && makeupOptions.find(option => option.label === modelDescription.makeup)?.image ? (
                                        <Card className="relative w-full">
                                          <CardContent className="p-4">
                                            <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                              <img
                                                src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${makeupOptions.find(option => option.label === modelDescription.makeup)?.image}`}
                                                className="absolute inset-0 w-full h-full object-cover rounded-md"
                                              />
                                            </div>
                                            <p className="text-sm text-center font-medium mt-2">{makeupOptions.find(option => option.label === modelDescription.makeup)?.label}</p>
                                          </CardContent>
                                        </Card>
                                      ) : (
                                        <Card className="relative w-full border">
                                          <CardContent className="p-4">
                                            <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                                Select makeup style
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      );
                                    })()}
                                  </div>
                                  {showMakeupSelector && (
                                    <OptionSelector
                                      options={makeupOptions}
                                      onSelect={(label) => handleModelDescriptionChange('makeup', label)}
                                      onClose={() => setShowMakeupSelector(false)}
                                      title="Select Makeup Style"
                                    />
                                  )}
                                </div>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white w-full cursor-not-allowed"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Using
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Select Influencer Button */}
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, model: '' }));
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
                              makeup: '',
                              bust: '',
                              clothing: '',
                              sex: '',
                              eyebrowStyle: '',
                              faceShape: '',
                              colorPalette: ''
                            });
                            setModelData(null);
                          }}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Select Influencer
                        </Button>
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
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    Scene Specifications
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Just select some of the presets below or describe in the text input below what you want to see. This can be just in your words like "Model is sitting at the beach and enjoys the sun" or "white shirt and blue jeans". You may add specific image prompting here, too. Anything entered here overrules settings on the model or in the presets.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Text Input - First Option */}
                  <div className="space-y-2">
                    <Label>Prompt</Label>
                    <Textarea
                      value={formData.prompt}
                      onChange={(e) => handleInputChange('prompt', e.target.value)}
                      placeholder="Describe what you want to see... (e.g., 'Model is sitting at the beach and enjoys the sun' or 'white shirt and blue jeans')"
                      rows={3}
                    />
                  </div>

                  {/* Scene Presets - 2x3 Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Framing</Label>
                      <Select
                        value={sceneSpecs.framing}
                        onValueChange={(value) => handleSceneSpecChange('framing', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select framing" />
                        </SelectTrigger>
                        <SelectContent>
                          {framingOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div
                        onClick={() => setShowFramingSelector(true)}
                        className='flex items-center justify-center cursor-pointer w-full'
                      >
                        {sceneSpecs.framing && framingOptions.find(option => option.label === sceneSpecs.framing)?.image ? (
                          <Card className="relative w-full max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${framingOptions.find(option => option.label === sceneSpecs.framing)?.image}`}
                                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSceneSpecChange('framing', '');
                                  }}
                                >
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{framingOptions.find(option => option.label === sceneSpecs.framing)?.label}</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="relative w-full border max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                  Select framing style
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      {showFramingSelector && (
                        <OptionSelector
                          options={framingOptions}
                          onSelect={(label) => handleSceneSpecChange('framing', label)}
                          onClose={() => setShowFramingSelector(false)}
                          title="Select Framing Style"
                        />
                      )}
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
                          {rotationOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div
                        onClick={() => setShowRotationSelector(true)}
                        className='flex items-center justify-center cursor-pointer w-full'
                      >
                        {sceneSpecs.rotation && rotationOptions.find(option => option.label === sceneSpecs.rotation)?.image ? (
                          <Card className="relative w-full max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${rotationOptions.find(option => option.label === sceneSpecs.rotation)?.image}`}
                                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSceneSpecChange('rotation', '');
                                  }}
                                >
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{rotationOptions.find(option => option.label === sceneSpecs.rotation)?.label}</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="relative w-full border max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                  Select rotation style
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      {showRotationSelector && (
                        <OptionSelector
                          options={rotationOptions}
                          onSelect={(label) => handleSceneSpecChange('rotation', label)}
                          onClose={() => setShowRotationSelector(false)}
                          title="Select Rotation Style"
                        />
                      )}
                    </div>

                    {/* Lighting Preset Block */}
                    <div className="space-y-2">
                      <Label>Lighting Preset</Label>
                      <Select
                        value={sceneSpecs.lighting_preset}
                        onValueChange={(value) => handleSceneSpecChange('lighting_preset', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lighting preset" />
                        </SelectTrigger>
                        <SelectContent>
                          {lightingOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div
                        onClick={() => setShowLightingSelector(true)}
                        className='flex items-center justify-center cursor-pointer w-full'
                      >
                        {sceneSpecs.lighting_preset && lightingOptions.find(option => option.label === sceneSpecs.lighting_preset)?.image ? (
                          <Card className="relative w-full max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${lightingOptions.find(option => option.label === sceneSpecs.lighting_preset)?.image}`}
                                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSceneSpecChange('lighting_preset', '');
                                  }}
                                >
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{lightingOptions.find(option => option.label === sceneSpecs.lighting_preset)?.label}</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="relative w-full border max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                  Select lighting style
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      {showLightingSelector && (
                        <OptionSelector
                          options={lightingOptions}
                          onSelect={(label) => handleSceneSpecChange('lighting_preset', label)}
                          onClose={() => setShowLightingSelector(false)}
                          title="Select Lighting Style"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Scene Setting</Label>
                      <Select
                        value={sceneSpecs.scene_setting}
                        onValueChange={(value) => handleSceneSpecChange('scene_setting', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select scene setting" />
                        </SelectTrigger>
                        <SelectContent>
                          {sceneSettingsOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div
                        onClick={() => setShowSceneSettingsSelector(true)}
                        className='flex items-center justify-center cursor-pointer w-full'
                      >
                        {sceneSpecs.scene_setting && sceneSettingsOptions.find(option => option.label === sceneSpecs.scene_setting)?.image ? (
                          <Card className="relative w-full max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${sceneSettingsOptions.find(option => option.label === sceneSpecs.scene_setting)?.image}`}
                                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSceneSpecChange('scene_setting', '');
                                  }}
                                >
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{sceneSettingsOptions.find(option => option.label === sceneSpecs.scene_setting)?.label}</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="relative w-full border max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                  Select scene setting
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      {showSceneSettingsSelector && (
                        <OptionSelector
                          options={sceneSettingsOptions}
                          onSelect={(label) => handleSceneSpecChange('scene_setting', label)}
                          onClose={() => setShowSceneSettingsSelector(false)}
                          title="Select Scene Setting"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Pose</Label>
                      <Select
                        value={sceneSpecs.pose}
                        onValueChange={(value) => handleSceneSpecChange('pose', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pose" />
                        </SelectTrigger>
                        <SelectContent>
                          {poseOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div
                        onClick={() => setShowPoseSelector(true)}
                        className='flex items-center justify-center cursor-pointer w-full'
                      >
                        {sceneSpecs.pose && poseOptions.find(option => option.label === sceneSpecs.pose)?.image ? (
                          <Card className="relative w-full max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${poseOptions.find(option => option.label === sceneSpecs.pose)?.image}`}
                                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSceneSpecChange('pose', '');
                                  }}
                                >
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{poseOptions.find(option => option.label === sceneSpecs.pose)?.label}</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="relative w-full border max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                  Select pose style
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      {showPoseSelector && (
                        <OptionSelector
                          options={poseOptions}
                          onSelect={(label) => handleSceneSpecChange('pose', label)}
                          onClose={() => setShowPoseSelector(false)}
                          title="Select Pose Style"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Outfits</Label>
                      <Select
                        value={sceneSpecs.clothes}
                        onValueChange={(value) => handleSceneSpecChange('clothes', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select outfits" />
                        </SelectTrigger>
                        <SelectContent>
                          {clothesOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div
                        onClick={() => setShowClothesSelector(true)}
                        className='flex items-center justify-center cursor-pointer w-full'
                      >
                        {sceneSpecs.clothes && clothesOptions.find(option => option.label === sceneSpecs.clothes)?.image ? (
                          <Card className="relative w-full max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <img
                                  src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${clothesOptions.find(option => option.label === sceneSpecs.clothes)?.image}`}
                                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSceneSpecChange('clothes', '');
                                  }}
                                >
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                              <p className="text-sm text-center font-medium mt-2">{clothesOptions.find(option => option.label === sceneSpecs.clothes)?.label}</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="relative w-full border max-w-[250px]">
                            <CardContent className="p-4">
                              <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                  Select outfits style
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      {showClothesSelector && (
                        <OptionSelector
                          options={clothesOptions}
                          onSelect={(label) => handleSceneSpecChange('clothes', label)}
                          onClose={() => setShowClothesSelector(false)}
                          title="Select Outfits Style"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    Advanced Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    This is your place for advanced tweaking of the image generation.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Negative Prompt</Label>
                    <p className="text-sm text-muted-foreground">
                      Describe things you don't want to see. Optional, we take care of the essentials for you anyway.
                    </p>
                    <Textarea
                      value={formData.negative_prompt || ''}
                      onChange={(e) => handleInputChange('negative_prompt', e.target.value)}
                      placeholder="Enter negative prompt here..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>SFW &lt;----&gt; NSFW</Label>
                      <Slider
                        value={[formData.nsfw_strength || 0]}
                        onValueChange={([value]) => handleInputChange('nsfw_strength', value)}
                        max={1}
                        min={-1}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>SFW (-1)</span>
                        <span>NSFW (+1)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>LORA Strength</Label>
                      <Slider
                        value={[formData.lora_strength || 0]}
                        onValueChange={([value]) => handleInputChange('lora_strength', value)}
                        max={1}
                        min={-1}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Weak (-1)</span>
                        <span>Strong (+1)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Image Quality</Label>
                      <Select
                        value={formData.quality || 'Basic'}
                        onValueChange={(value) => handleInputChange('quality', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Quality">Quality</SelectItem>
                          <SelectItem value="Quality Plus">Quality Plus</SelectItem>
                          <SelectItem value="High End">High End</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Model Consistency</Label>
                        <p className="text-sm text-muted-foreground">
                          If you trained your model for Model Consistency here (insert link to model training, to be done...), you can enable this feature here. Otherwise images are generated based on the description only.
                        </p>
                      </div>
                      <Switch
                        checked={formData.lora}
                        onCheckedChange={(checked) => handleInputChange('lora', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>AI Optimization</Label>
                        <p className="text-sm text-muted-foreground">
                          User input is passed directly without AI modification or interpretation.
                        </p>
                      </div>
                      <Switch
                        checked={formData.noAI}
                        onCheckedChange={(checked) => handleInputChange('noAI', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Seed (Optional)</Label>
                      <Input
                        value={formData.seed}
                        onChange={(e) => handleInputChange('seed', e.target.value)}
                        placeholder="Enter seed value for reproducible results"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Influencer Selector Dialog */}
      {showInfluencerSelector && (
        <Dialog open={true} onOpenChange={setShowInfluencerSelector}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Influencer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                            onClick={() => {
                              handleUseInfluencer(influencer);
                              setShowInfluencerSelector(false);
                            }}
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
