import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import config from '@/config/config';
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
import { Image, Wand2, Settings, Image as ImageIcon, Sparkles, Loader2, Camera, Search, X, Filter, Plus, RotateCcw, Download, Trash2, Calendar, Share, Pencil, Edit3, BookOpen, Save, FolderOpen, Upload, Edit, AlertTriangle, Eye, User, Monitor, ZoomIn, SortAsc, SortDesc, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import HistoryCard from '@/components/HistoryCard';
import { CreditConfirmationModal } from '@/components/CreditConfirmationModal';

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

interface ContentCreateImageProps {
  influencerData?: any;
}

function ContentCreateImage({ influencerData }: ContentCreateImageProps) {
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

  // Gem cost checking state
  const [showGemWarning, setShowGemWarning] = useState(false);
  const [gemCostData, setGemCostData] = useState<{
    id: number;
    item: string;
    description: string;
    gems: number;
    originalGemsPerImage?: number;
  } | null>(null);
  const [isCheckingGems, setIsCheckingGems] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    model: '',
    scene: '',
    task: 'generate_image',
    lora: false,
    noAI: true,
    prompt: '',
    format: 'Portrait 4:5',
    numberOfImages: 1,
    seed: '',
    guidance: 3.5,
    negative_prompt: '',
    nsfw_strength: 0,
    lora_strength: 1.0,
    quality: 'Quality',
    engine: 'General',
    usePromptOnly: false,
    regenerated_from: ''
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
  const [generatedTaskIds, setGeneratedTaskIds] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [isLoadingGeneratedImages, setIsLoadingGeneratedImages] = useState(false);
  const [fullSizeImageModal, setFullSizeImageModal] = useState<{ isOpen: boolean; imageUrl: string; imageName: string }>({
    isOpen: false,
    imageUrl: '',
    imageName: ''
  });

  // Vault-style image card state
  const [detailedImageModal, setDetailedImageModal] = useState<{ open: boolean; image: any | null }>({ open: false, image: null });
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState<string>('');
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [fileContextMenu, setFileContextMenu] = useState<{ x: number; y: number; image: any } | null>(null);
  const [regeneratingImages, setRegeneratingImages] = useState<Set<string>>(new Set());

  // Share modal state
  const [shareModal, setShareModal] = useState<{ open: boolean; itemId: string | null; itemPath: string | null }>({ open: false, itemId: null, itemPath: null });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Status bar edit popup state
  const [statusEditPopup, setStatusEditPopup] = useState<{
    isOpen: boolean;
    field: string;
    currentValue: any;
    fieldType: 'number' | 'boolean' | 'select' | 'text' | 'slider';
    options?: { label: string; value: any }[];
    position: { x: number; y: number };
  }>({
    isOpen: false,
    field: '',
    currentValue: null,
    fieldType: 'text',
    options: [],
    position: { x: 0, y: 0 }
  });

  // Defensive: ensure formatOptions is always an array
  const safeFormatOptions = Array.isArray(formatOptions) ? formatOptions : [];

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

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch(`${config.supabase_server_url}/influencer?user_id=eq.${userData.id}`, {
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

  const getCodeforEngine = (engine: string) => {
    switch (engine) {
      case 'Nymia General':
        return 'nymia_image';
      case 'PPV':
        return 'ppv_engine_v1';
      case 'WAN 2.2 Image':
        return 'wan_2_2_image';
      case 'Google Imagen4':
        return 'imagen4';
      case 'Bytedance Seedream V3':
        return 'seedream-v3';
      // case 'Runway Gen4':
      //   return 'runway_gen4';
      // case 'DEV01':
      //   return 'dev01';
      // case 'DEV02':
      //   return 'dev02';
      // case 'DEV03':
      //   return 'dev03';
      // case 'DEV04':
      //   return 'dev04';
      default:
        return 'nymia_image';
    }
  }

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
        colorPalette: influencerData.color_palette ? influencerData.color_palette.join(', ') : '',
        age: influencerData.age || '',
        lifestyle: influencerData.lifestyle || ''
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
        model: fullDescription,
        prompt: influencerData.prompt || '' // Automatically populate prompt with influencer's prompt
      }));

      toast.success(`Using ${influencerData.name_first} ${influencerData.name_last} for content generation`);
    }
  }, [influencerData]);

  // Fetch makeup options from API
  useEffect(() => {
    const fetchMakeupOptions = async () => {
      try {
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=makeup`, {
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
        const response = await fetch(`${config.backend_url}/promptoptions?fieldtype=framing`, {
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
        const response = await fetch(`${config.backend_url}/promptoptions?fieldtype=outfits`, {
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
        const response = await fetch(`${config.backend_url}/promptoptions?fieldtype=rotation`, {
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
        const response = await fetch(`${config.backend_url}/promptoptions?fieldtype=light`, {
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
        const response = await fetch(`${config.backend_url}/promptoptions?fieldtype=pose`, {
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
        const response = await fetch(`${config.backend_url}/promptoptions?fieldtype=scene`, {
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
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=format`, {
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

  // Fetch engine options from API
  useEffect(() => {
    const fetchEngineOptions = async () => {
      try {
        const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=engine`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          if (data && data.fieldoptions && Array.isArray(data.fieldoptions)) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description
            }));
            setEngineOptions(options);
          }
        } else {
          console.error('Failed to fetch engine options:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching engine options:', error);
      }
    };
    fetchEngineOptions();
  }, []);

  // Generate QR code when share modal opens
  useEffect(() => {
    if (shareModal.open && shareModal.itemId && shareModal.itemPath) {
      const directLink = `${config.data_url}/${userData.id}/${shareModal.itemPath}/${shareModal.itemId}`;
      generateQRCode(directLink);
    }
  }, [shareModal.open, shareModal.itemId, shareModal.itemPath, userData.id]);

  const handleDownload = async (image: any) => {
    try {
      toast.info('Downloading image...', {
        description: 'This may take a moment'
      });

      const filename = image.file_path.split('/').pop();
      console.log(filename);

      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: 'output/' + filename
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.system_filename || `generated-image-${Date.now()}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image. Please try again.');
    }
  };

  const handleDelete = async (image: any) => {
    try {
      toast.info('Deleting image...', {
        description: 'This may take a moment'
      });

      const filename = image.file_path.split('/').pop();

      await fetch(`${config.backend_url}/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: 'output/' + filename
        })
      });

      await fetch(`${config.supabase_server_url}/generated_images?id=eq.${image.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      setGeneratedImages(prev => prev.filter(img => img.id !== image.id));
      toast.success(`Image "${filename}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image. Please try again.');
    }
  };

  const handleViewFullSize = (image: any) => {
          const imageUrl = `${config.data_url}/cdn-cgi/image/w=800/${image.file_path}`;
    const imageName = image.system_filename || 'Generated Image';
    setFullSizeImageModal({
      isOpen: true,
      imageUrl,
      imageName
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };

      // If usePromptOnly is being enabled, reset all form data to initial state
      // if (field === 'usePromptOnly' && value === true) {
      //   return {
      //     model: '',
      //     scene: '',
      //     task: 'generate_image',
      //     lora: false,
      //     noAI: true,
      //     prompt: prev.prompt, // Keep the current prompt
      //     format: 'Portrait 4:5',
      //     numberOfImages: 1,
      //     seed: '',
      //     guidance: 3.5,
      //     negative_prompt: '',
      //     nsfw_strength: 0,
      //     lora_strength: 1.0,
      //     quality: 'Quality',
      //     engine: 'General',
      //     usePromptOnly: true
      //   };
      // }

      return newFormData;
    });

    // If usePromptOnly is being enabled, also reset scene specifications
    if (field === 'usePromptOnly' && value === true) {
      setSceneSpecs({
        framing: '',
        rotation: '',
        lighting_preset: '',
        scene_setting: '',
        pose: '',
        clothes: ''
      });

      // Reset model description makeup to default
      setModelDescription(prev => ({
        ...prev,
        makeup: 'Natural / No-Makeup Look'
      }));
    }
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
      appearance: `${influencer.name_first} ${influencer.name_last}, ${influencer.age || ''}`,
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
      colorPalette: influencer.color_palette ? influencer.color_palette.join(', ') : '',
      age: influencer.age || '',
      lifestyle: influencer.lifestyle || ''
    });

    // Generate the model description automatically
    const parts = [];

    if (influencer.name_first && influencer.name_last) {
      parts.push(`${influencer.name_first} ${influencer.name_last}`);
    }
    if (influencer.age) parts.push(influencer.age);
    if (influencer.lifestyle) parts.push(influencer.lifestyle);
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

    // Check if influencer has LoRA status 2 (Ready) and automatically enable model consistency
    const shouldEnableModelConsistency = influencer.lorastatus === 2;

    setFormData(prev => ({
      ...prev,
      model: fullDescription,
      prompt: influencer.prompt || '', // Automatically populate prompt with influencer's prompt
      lora: shouldEnableModelConsistency // Enable model consistency if LoRA is ready
    }));

    // Show toast message about model consistency if enabled
    if (shouldEnableModelConsistency) {
      toast.success(`Using ${influencer.name_first} ${influencer.name_last} for content generation - Model Consistency enabled (LoRA ready)`);
    } else {
      toast.success(`Using ${influencer.name_first} ${influencer.name_last} for content generation`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  // Function to check gem cost for the selected engine
  const checkGemCost = async (engineName: string) => {
    try {
      setIsCheckingGems(true);
      const response = await fetch('https://api.nymia.ai/v1/getgems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          item: engineName
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gem cost: ${response.status}`);
      }

      const gemData = await response.json();
      return gemData;
    } catch (error) {
      console.error('Error checking gem cost:', error);
      toast.error('Failed to check gem cost. Proceeding without verification.');
      return null;
    } finally {
      setIsCheckingGems(false);
    }
  };

  // Function to proceed with generation after gem confirmation
  const proceedWithGeneration = async () => {
    try {
      setShowGemWarning(false);
      console.log('Starting generation after credit confirmation...');
      await executeGeneration();
    } catch (error) {
      console.error('Error in proceedWithGeneration:', error);
      toast.error('Failed to start generation. Please try again.');
      setIsGenerating(false);
    }
  };

  // Main generation function that includes gem checking
  const handleGenerate = async () => {
    if (!formData.model && !formData.prompt) {
      toast.error('Please provide either a model description or a prompt');
      return;
    }

    // Check gem cost before proceeding
    if (formData.engine) {
      const engineName = getCodeforEngine(formData.engine);
      const gemData = await checkGemCost(engineName);
      if (gemData) {
        // Calculate total required credits: gems per image * number of images
        const totalRequiredCredits = gemData.gems * formData.numberOfImages;
        
        // Update gem data with calculated total
        const updatedGemData = {
          ...gemData,
          gems: totalRequiredCredits,
          originalGemsPerImage: gemData.gems // Store original per-image cost
        };
        
        setGemCostData(updatedGemData);
        
        // Check if user has enough credits
        if (userData.credits < totalRequiredCredits) {
          setShowGemWarning(true);
          return;
        } else {
          // Show confirmation for gem cost
          setShowGemWarning(true);
          return;
        }
      }
    }

    // If no gem checking needed or failed, show error and don't proceed
    toast.error('Unable to verify credit cost. Please try again.');
    return;
  };

  // Separated generation execution function
  const executeGeneration = async () => {
    console.log('executeGeneration called');
    console.log('Form data:', formData);
    console.log('Model data:', modelData);
    
    if (!formData.model && !formData.prompt) {
      console.log('Validation failed: no model or prompt');
      toast.error('Please provide either a model description or a prompt');
      return;
    }

    if (!modelData || !modelData.id) {
      console.log('Validation failed: no model data');
      toast.error('Please select an influencer before generating');
      return;
    }

    console.log('Starting generation process...');
    setIsGenerating(true);

    const response = await fetch(`${config.supabase_server_url}/influencer?id=eq.${modelData.id}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer WeInfl3nc3withAI'
      }
    });

    const data = await response.json();

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
        format: safeFormatOptions.find(opt => opt.label === formData.format)?.label || formData.format,
        engine: formData.engine,
        usePromptOnly: formData.usePromptOnly,
        regenerated_from: formData.regenerated_from || '12345678-1111-2222-3333-caffebabe0123',
        model: data[0] ? {
          id: data[0].id,
          influencer_type: data[0].influencer_type,
          sex: data[0].sex,
          cultural_background: data[0].cultural_background,
          hair_length: data[0].hair_length,
          hair_color: data[0].hair_color,
          hair_style: data[0].hair_style,
          eye_color: data[0].eye_color,
          lip_style: data[0].lip_style,
          nose_style: data[0].nose_style,
          face_shape: data[0].face_shape,
          facial_features: data[0].facial_features,
          skin_tone: data[0].skin_tone,
          bust: data[0].bust_size,
          body_type: data[0].body_type,
          color_palette: data[0].color_palette || [],
          clothing_style_everyday: data[0].clothing_style_everyday,
          eyebrow_style: data[0].eyebrow_style,
          makeup_style: modelDescription.makeup,
          name_first: data[0].name_first,
          name_last: data[0].name_last,
          visual_only: data[0].visual_only,
          age: data[0].age,
          lifestyle: data[0].lifestyle
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

      const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const useridData = await useridResponse.json();

      console.log(requestData);
      const response = await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`, {
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

      // Add new task ID to the list
      setGeneratedTaskIds(prev => [...prev, result.id]);
      console.log('Generation completed successfully, task ID:', result.id);
      toast.success('Content generation started successfully');

      // Update guide_step if it's currently 3
      if (userData.guide_step === 3) {
        try {
          const guideStepResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              guide_step: 4
            })
          });

          if (guideStepResponse.ok) {
            dispatch(setUser({ guide_step: 4 }));
            toast.success('Content generation started! Progress updated to Phase 4.');
          }
        } catch (error) {
          console.error('Failed to update guide_step:', error);
        }
      }

      setActiveTab('scene');

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
                        src={`${config.data_url}/wizard/mappings400/${option.image}`}
                        alt={option.label}
                        className="absolute inset-0 w-full h-full object-cover rounded-md"
                      />
                      <div
                        className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                        onClick={(e) => handleImageClick(e, `${config.data_url}/wizard/mappings800/${option.image}`)}
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

  const handleClear = () => {
    setFormData({
      model: '',
      scene: '',
      task: 'generate_image',
      lora: false,
      noAI: true,
      prompt: '',
      format: 'Portrait 4:5',
      numberOfImages: 1,
      seed: '',
      guidance: 3.5,
      negative_prompt: '',
      nsfw_strength: 0,
      lora_strength: 1.0,
      quality: 'Quality',
      engine: 'General',
      usePromptOnly: false,
      regenerated_from: ''
    });
    setModelData(null);
    setSceneSpecs({
      framing: '',
      rotation: '',
      lighting_preset: '',
      scene_setting: '',
      pose: '',
      clothes: ''
    });
  }

  useEffect(() => {
    const fetchGeneratedImages = async () => {
      console.log(generatedTaskIds);
      if (!generatedImages || generatedTaskIds.length === 0) return;

      setIsLoadingGeneratedImages(true);
      try {
        // Fetch images for all task IDs
        const allImages: any[] = [];

        for (const taskId of generatedTaskIds) {
          const response = await fetch(`${config.supabase_server_url}/generated_images?task_id=eq.${taskId}`, {
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI'
            }
          });

          if (response.ok) {
            const data = await response.json();
            allImages.push(...data);
          }
        }

        setGeneratedImages(allImages);
        console.log(generatedImages);
      } catch (error) {
        console.error('Error fetching generated images:', error);
      } finally {
        setIsLoadingGeneratedImages(false);
      }
    }

    fetchGeneratedImages();

    const interval = setInterval(fetchGeneratedImages, 30000);
    return () => clearInterval(interval);
  }, [generatedTaskIds]);

  // Handle regeneration data from Vault.tsx
  useEffect(() => {
    const regenerationData = location.state?.jsonjobData;
    const isRegeneration = location.state?.isRegeneration;
    const originalImage = location.state?.originalImage;

    if (isRegeneration && regenerationData) {
      console.log('🔄 REGENERATION PROCESS STARTED');
      console.log('📍 Location State:', location.state);
      console.log('📊 Regeneration Data:', regenerationData);
      console.log('🖼️ Original Image:', originalImage);

      // Step 1: Populate form data from the JSON job
      console.log('📝 Step 1: Populating form data from JSON job');

      if (regenerationData.task) {
        console.log('✅ Setting task type:', regenerationData.task);
        setFormData(prev => ({
          ...prev,
          task: regenerationData.task
        }));
      }

      if (regenerationData.prompt) {
        console.log('✅ Setting prompt:', regenerationData.prompt);
        setFormData(prev => ({
          ...prev,
          prompt: regenerationData.prompt
        }));
      }

      if (regenerationData.negative_prompt) {
        console.log('✅ Setting negative prompt:', regenerationData.negative_prompt);
        setFormData(prev => ({
          ...prev,
          negative_prompt: regenerationData.negative_prompt
        }));
      }

      if (regenerationData.number_of_images) {
        console.log('✅ Setting number of images:', regenerationData.number_of_images);
        setFormData(prev => ({
          ...prev,
          numberOfImages: regenerationData.number_of_images
        }));
      }

      if (regenerationData.guidance) {
        console.log('✅ Setting guidance:', regenerationData.guidance);
        setFormData(prev => ({
          ...prev,
          guidance: regenerationData.guidance
        }));
      }

      if (regenerationData.seed) {
        console.log('✅ Setting seed:', regenerationData.seed);
        setFormData(prev => ({
          ...prev,
          seed: regenerationData.seed.toString()
        }));
      }

      if (regenerationData.nsfw_strength) {
        console.log('✅ Setting NSFW strength:', regenerationData.nsfw_strength);
        setFormData(prev => ({
          ...prev,
          nsfw_strength: regenerationData.nsfw_strength
        }));
      }

      if (regenerationData.lora_strength) {
        console.log('✅ Setting LORA strength:', regenerationData.lora_strength);
        setFormData(prev => ({
          ...prev,
          lora_strength: regenerationData.lora_strength
        }));
      }

      if (regenerationData.quality) {
        console.log('✅ Setting quality:', regenerationData.quality);
        setFormData(prev => ({
          ...prev,
          quality: regenerationData.quality
        }));
      }

      if (regenerationData.format) {
        console.log('✅ Setting format:', regenerationData.format);
        setFormData(prev => ({
          ...prev,
          format: regenerationData.format
        }));
      }

      if (regenerationData.engine) {
        console.log('✅ Setting engine:', regenerationData.engine);
        setFormData(prev => ({
          ...prev,
          engine: regenerationData.engine
        }));
      }

      if (regenerationData.lora !== undefined) {
        console.log('✅ Setting LORA:', regenerationData.lora);
        setFormData(prev => ({
          ...prev,
          lora: regenerationData.lora
        }));
      }

      if (regenerationData.noAI !== undefined) {
        console.log('✅ Setting noAI:', regenerationData.noAI);
        setFormData(prev => ({
          ...prev,
          noAI: regenerationData.noAI
        }));
      }

      if (regenerationData.usePromptOnly !== undefined) {
        console.log('✅ Setting usePromptOnly:', regenerationData.usePromptOnly);
        setFormData(prev => ({
          ...prev,
          usePromptOnly: regenerationData.usePromptOnly
        }));
      }

      if (regenerationData.regenerated_from !== undefined) {
        console.log('✅ Setting regenerated_from:', regenerationData.regenerated_from);
        setFormData(prev => ({
          ...prev,
          regenerated_from: regenerationData.regenerated_from
        }));
      }

      // Step 2: Populate scene specifications
      console.log(' Step 2: Populating scene specifications');
      if (regenerationData.scene) {
        console.log('📽️ Scene data:', regenerationData.scene);
        const sceneData = {
          framing: regenerationData.scene.framing || '',
          rotation: regenerationData.scene.rotation || '',
          lighting_preset: regenerationData.scene.lighting_preset || '',
          scene_setting: regenerationData.scene.scene_setting || '',
          pose: regenerationData.scene.pose || '',
          clothes: regenerationData.scene.clothes || ''
        };
        console.log('✅ Setting scene specs:', sceneData);
        setSceneSpecs(sceneData);
      }

      // Step 3: Handle model/influencer data professionally
      console.log('👤 Step 3: Processing model/influencer data');
      if (regenerationData.model) {
        console.log('🎭 Model data from JSON job:', regenerationData.model);

        // Check if we have a model ID to fetch from database
        if (regenerationData.model.id) {
          console.log('🔍 Fetching influencer data from database with ID:', regenerationData.model.id);

          // Fetch the influencer data from the database
          const fetchInfluencerData = async () => {
            try {
              const response = await fetch(`${config.supabase_server_url}/influencer?id=eq.${regenerationData.model.id}`, {
                headers: {
                  'Authorization': 'Bearer WeInfl3nc3withAI'
                }
              });

              if (!response.ok) {
                throw new Error('Failed to fetch influencer data');
              }

              const influencerData = await response.json();
              console.log('📊 Fetched influencer data from database:', influencerData);

              if (influencerData && influencerData.length > 0) {
                const influencer = influencerData[0];
                console.log('✅ Found influencer in database:', influencer);

                // Set the model data with the complete influencer information
                setModelData(influencer);

                // Populate model description with complete data
                const modelDesc = {
                  appearance: `${influencer.name_first || ''} ${influencer.name_last || ''}, ${influencer.age_lifestyle || ''}`,
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
                  makeup: 'Natural / No-Makeup Look',
                  clothing: `${influencer.clothing_style_everyday || ''} ${influencer.clothing_style_occasional || ''}`.trim(),
                  sex: influencer.sex || '',
                  bust: influencer.bust_size || '',
                  eyebrowStyle: influencer.eyebrow_style || '',
                  faceShape: influencer.face_shape || '',
                  colorPalette: influencer.color_palette ? influencer.color_palette.join(', ') : '',
                  age: influencer.age || '',
                  lifestyle: influencer.lifestyle || ''
                };

                console.log('📝 Setting model description:', modelDesc);
                setModelDescription(modelDesc);

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
                if (modelDesc.makeup) parts.push(`Makeup: ${modelDesc.makeup}`);
                if (influencer.clothing_style_everyday || influencer.clothing_style_occasional) {
                  parts.push(`Clothing: ${influencer.clothing_style_everyday || ''} ${influencer.clothing_style_occasional || ''}`.trim());
                }

                const fullDescription = parts.join(', ');
                console.log('📄 Generated full description:', fullDescription);
                setFormData(prev => ({
                  ...prev,
                  model: fullDescription
                }));

                toast.success(`Regeneration data loaded for ${influencer.name_first} ${influencer.name_last}`);
              } else {
                console.warn('⚠️ No influencer found in database, using JSON job data');
                // Fallback to JSON job data
                setModelData(regenerationData.model);
                setModelDescription({
                  appearance: `${regenerationData.model.name_first || ''} ${regenerationData.model.name_last || ''}, ${regenerationData.model.age || ''}`,
                  culturalBackground: regenerationData.model.cultural_background || '',
                  bodyType: regenerationData.model.body_type || '',
                  facialFeatures: regenerationData.model.facial_features || '',
                  hairColor: regenerationData.model.hair_color || '',
                  hairLength: regenerationData.model.hair_length || '',
                  hairStyle: regenerationData.model.hair_style || '',
                  skin: regenerationData.model.skin_tone || '',
                  lips: regenerationData.model.lip_style || '',
                  eyes: regenerationData.model.eye_color || '',
                  nose: regenerationData.model.nose_style || '',
                  makeup: regenerationData.model.makeup_style || 'Natural / No-Makeup Look',
                  clothing: `${regenerationData.model.clothing_style_everyday || ''} ${regenerationData.model.clothing_style_occasional || ''}`.trim(),
                  sex: regenerationData.model.sex || '',
                  bust: regenerationData.model.bust || '',
                  eyebrowStyle: regenerationData.model.eyebrow_style || '',
                  faceShape: regenerationData.model.face_shape || '',
                  colorPalette: regenerationData.model.color_palette ? regenerationData.model.color_palette.join(', ') : '',
                  age: regenerationData.model.age || '',
                  lifestyle: regenerationData.model.lifestyle || ''
                });
              }
            } catch (error) {
              console.error('❌ Error fetching influencer data:', error);
              console.warn('⚠️ Falling back to JSON job model data');
              setModelData(regenerationData.model);
            }
          };

          fetchInfluencerData();
        } else {
          console.log('⚠️ No model ID found, using JSON job model data directly');
          setModelData(regenerationData.model);
        }
      } else {
        console.log('⚠️ No model data found in regeneration data');
      }

      console.log('✅ REGENERATION PROCESS COMPLETED');
    }
  }, [location.state]);

  // Vault-style functions
  const updateFavorite = async (systemFilename: string, favorite: boolean) => {
    try {
      const response = await fetch(`${config.supabase_server_url}/generated_images?system_filename=eq.${systemFilename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({ favorite })
      });

      if (response.ok) {
        setGeneratedImages(prev =>
          prev.map(img =>
            img.system_filename === systemFilename
              ? { ...img, favorite }
              : img
          )
        );
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const updateRating = async (systemFilename: string, rating: number) => {
    try {
      const response = await fetch(`${config.supabase_server_url}/generated_images?system_filename=eq.${systemFilename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        setGeneratedImages(prev =>
          prev.map(img =>
            img.system_filename === systemFilename
              ? { ...img, rating }
              : img
          )
        );
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const updateUserNotes = async (systemFilename: string, userNotes: string) => {
    try {
      const response = await fetch(`${config.supabase_server_url}/generated_images?system_filename=eq.${systemFilename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({ user_notes: userNotes })
      });

      if (response.ok) {
        setGeneratedImages(prev =>
          prev.map(img =>
            img.system_filename === systemFilename
              ? { ...img, user_notes: userNotes }
              : img
          )
        );
      }
    } catch (error) {
      console.error('Error updating user notes:', error);
    }
  };

  const updateUserTags = async (systemFilename: string, userTags: string[]) => {
    try {
      const response = await fetch(`${config.supabase_server_url}/generated_images?system_filename=eq.${systemFilename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({ user_tags: userTags })
      });

      if (response.ok) {
        setGeneratedImages(prev =>
          prev.map(img =>
            img.system_filename === systemFilename
              ? { ...img, user_tags: userTags }
              : img
          )
        );
      }
    } catch (error) {
      console.error('Error updating user tags:', error);
    }
  };

  const handleFileContextMenu = (e: React.MouseEvent, image: any) => {
    e.preventDefault();
    setFileContextMenu({ x: e.clientX, y: e.clientY, image });
  };

  const handleFileRename = async (oldFilename: string, newName: string) => {
    try {
      const response = await fetch(`${config.supabase_server_url}/generated_images?system_filename=eq.${oldFilename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({ user_filename: newName })
      });

      if (response.ok) {
        setGeneratedImages(prev =>
          prev.map(img =>
            img.system_filename === oldFilename
              ? { ...img, user_filename: newName }
              : img
          )
        );
        setEditingFile(null);
        setEditingFileName('');
        setRenamingFile(null);
      }
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  const handleFileDelete = async (image: any) => {
    try {
      toast.info('Deleting image...', {
        description: 'This may take a moment'
      });

      const filename = image.file_path.split('/').pop();

      await fetch(`${config.backend_url}/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: 'output/' + filename
        })
      });

      await fetch(`${config.supabase_server_url}/generated_images?id=eq.${image.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      setGeneratedImages(prev => prev.filter(img => img.id !== image.id));
      toast.success(`Image "${filename}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image. Please try again.');
    }
  };

  const handleShare = (systemFilename: string) => {
    setShareModal({ open: true, itemId: systemFilename, itemPath: 'output' });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generateQRCode = async (url: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const shareToSocialMedia = (platform: string, itemId: string) => {
    const imageUrl = `${config.data_url}/cdn-cgi/image/w=800/${userData.id}/output/${itemId}`;
    const shareText = `Check out this amazing content!`;

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(imageUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imageUrl)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(shareText)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleEdit = (image: any) => {
            navigate('/create/edit', {
      state: {
        imageData: image
      }
    });
  };

  const handleRegenerate = async (image: any) => {
    // Only allow regeneration for non-uploaded and non-edited images
    if (image.model_version === 'edited' || image.quality_setting === 'edited' || image.task_id?.startsWith('upload_')) {
      toast.error('Cannot regenerate uploaded or edited images');
      return;
    }

    setRegeneratingImages(prev => new Set(prev).add(image.system_filename));

    try {
      toast.info('Regenerating image...', {
        description: 'Fetching original task data and creating new generation'
      });

      // Step 1: Get the task_id from the generated image
      const imageResponse = await fetch(`${config.supabase_server_url}/generated_images?file_path=eq.${image.file_path}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image data');
      }

      const imageData = await imageResponse.json();
      if (!imageData || imageData.length === 0) {
        throw new Error('Image data not found');
      }

      const taskId = imageData[0].task_id;

      // Step 2: Get the original task data
      const taskResponse = await fetch(`${config.supabase_server_url}/tasks?id=eq.${taskId}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!taskResponse.ok) {
        throw new Error('Failed to fetch task data');
      }

      const taskData = await taskResponse.json();
      if (!taskData || taskData.length === 0) {
        throw new Error('Task data not found');
      }

      const originalTask = taskData[0];
      console.log("OriginalTask:", originalTask.jsonjob);

      // Step 3: Parse the JSON job data
      const jsonjob = JSON.parse(originalTask.jsonjob);
      console.log("Parsed JSON job:", jsonjob);
      if (jsonjob.seed === -1) {
        jsonjob.seed = null;
      }

      // Step 4: Set the regenerated_from field to the original image ID
      jsonjob.regenerated_from = image.id || '12345678-1111-2222-3333-caffebabe0123';

      // Step 5: Navigate to ContentCreate with the JSON job data
      navigate('/content/create', {
        state: {
          jsonjobData: jsonjob,
          isRegeneration: true,
          originalImage: image
        }
      });

      toast.success('Redirecting to ContentCreate for regeneration');

    } catch (error) {
      console.error('Regeneration error:', error);
      toast.error('Failed to regenerate image', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setRegeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(image.system_filename);
        return newSet;
      });
    }
  };

  const decodeName = (name: string): string => {
    return decodeURIComponent(name.replace(/\+/g, ' '));
  };

  // Engine options and modal state
  const [engineOptions, setEngineOptions] = useState<Option[]>([]);
  const [showEngineSelector, setShowEngineSelector] = useState(false);

  // Vault selector state
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  const [selectedVaultImage, setSelectedVaultImage] = useState<any>(null);

  const handleVaultImageSelect = (image: any) => {
    setSelectedVaultImage(image);
    // You can use the selected image data here
    // For example, you could set it as a reference image or use it in some way
    toast.success(`Selected image from vault: ${image.system_filename}`);
  };

  const handleVaultImageSelectForPreset = (image: any) => {
    setSelectedPresetImage(image);
    setPresetImageSource('vault');
    setShowVaultSelectorForPreset(false);
    toast.success(`Selected image from vault for preset: ${image.system_filename}`);
  };

  // Add new state for preset functionality
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [presets, setPresets] = useState<any[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);
  const [presetSearchTerm, setPresetSearchTerm] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [showPresetDetails, setShowPresetDetails] = useState(false);

  // Save as Preset functionality
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [selectedPresetImage, setSelectedPresetImage] = useState<any>(null);
  const [presetImageSource, setPresetImageSource] = useState<'vault' | 'upload' | 'recent'>('vault');
  const [showVaultSelectorForPreset, setShowVaultSelectorForPreset] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  // File conflict resolution state
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [conflictFilename, setConflictFilename] = useState('');
  const [finalFilename, setFinalFilename] = useState('');
  const [pendingPresetData, setPendingPresetData] = useState<any>(null);

  // Upload functionality for preset images
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Recent renders functionality
  const [showRecentRendersModal, setShowRecentRendersModal] = useState(false);

  const handlePresetImageSelect = (image: any, source: 'vault' | 'upload' | 'recent') => {
    setSelectedPresetImage(image);
    setPresetImageSource(source);
    setShowImageSelector(false);
    toast.success(`Selected image from ${source}`);
  };

  // Helper function to generate unique filename
  const generateUniqueFilename = (originalFilename: string, existingFilenames: string[]): string => {
    const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
    const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));

    let counter = 1;
    let testFilename = `${baseName}(${counter})${extension}`;

    while (existingFilenames.includes(testFilename)) {
      counter++;
      testFilename = `${baseName}(${counter})${extension}`;
    }

    return testFilename;
  };

  // Helper function to check for file conflicts
  const checkFileConflict = async (filename: string): Promise<{ hasConflict: boolean; existingFilenames: string[] }> => {
    try {
      const getFilesResponse = await fetch(`${config.backend_url}/getfilenames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: 'presets'
        })
      });

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        console.log('Files in presets folder:', files);

        if (files && files.length > 0 && files[0].Key) {
          // Extract existing filenames from the presets folder
          const existingFilenames = files.map((file: any) => {
            const fileKey = file.Key;
            const re = new RegExp(`^.*?presets/`);
            const fileName = fileKey.replace(re, "");
            console.log("Existing File Name:", fileName);
            return fileName;
          });

          return {
            hasConflict: existingFilenames.includes(filename),
            existingFilenames
          };
        }
      }

      return { hasConflict: false, existingFilenames: [] };
    } catch (error) {
      console.error('Error checking file conflict:', error);
      return { hasConflict: false, existingFilenames: [] };
    }
  };

  // Handle overwrite confirmation
  const handleOverwriteConfirm = async () => {
    setShowOverwriteDialog(false);
    if (pendingPresetData) {
      await savePresetWithFilename(conflictFilename, true, pendingPresetData);
    }
  };

  // Handle new filename confirmation
  const handleNewFilenameConfirm = async () => {
    setShowOverwriteDialog(false);
    if (pendingPresetData) {
      await savePresetWithFilename(finalFilename, false, pendingPresetData);
    }
  };

  const savePresetWithFilename = async (filename: string, isOverwrite: boolean = false, data?: any) => {
    // Use passed data or fall back to pendingPresetData state
    const presetDataToUse = data || pendingPresetData;

    if (!presetDataToUse) {
      console.error('No data available for saving preset');
      return;
    }

    try {
      const { presetData, isUpload } = presetDataToUse;
      console.log('Saving preset with data:', presetData);

      if (isUpload && uploadedFile) {
        // Create a new file with the unique filename
        const file = new File([uploadedFile], filename, { type: uploadedFile.type });

        console.log('Uploading file:', filename, 'Size:', file.size, 'Type:', file.type);

        const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=presets/${filename}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: file
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Upload failed:', uploadResponse.status, errorText);
          throw new Error(`Failed to upload file: ${uploadResponse.status} ${errorText}`);
        }

        console.log('File upload successful');
      } else {
        const oldPath = selectedPresetImage.user_filename === "" ? "output" : `vault/${selectedPresetImage.user_filename}`;
        const copyRequest = {
          user: userData.id,
          sourcefilename: `${oldPath}/${selectedPresetImage.system_filename}`,
          destinationfilename: `presets/${filename}`
        };

        console.log('Copying file:', copyRequest);

        const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify(copyRequest)
        });

        if (!copyResponse.ok) {
          const errorText = await copyResponse.text();
          console.error('Copy failed:', copyResponse.status, errorText);
          throw new Error(`Failed to copy file: ${copyResponse.status} ${errorText}`);
        }

        console.log('File copy successful');
      }

      // Update preset data with the final filename
      presetData.image_name = filename;

      // Validate preset data before saving
      if (!presetData.user_id) {
        throw new Error('User ID is required');
      }
      if (!presetData.name || presetData.name.trim() === '') {
        throw new Error('Preset name is required');
      }
      if (!presetData.jsonjob) {
        throw new Error('Preset configuration is required');
      }

      // Ensure all required fields are present
      const requiredFields = ['user_id', 'name', 'jsonjob', 'image_name'];
      const missingFields = requiredFields.filter(field => !presetData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure jsonjob has all required fields
      const requiredJsonJobFields = ['task', 'lora', 'noAI', 'prompt', 'negative_prompt', 'nsfw_strength', 'lora_strength', 'quality', 'seed', 'guidance', 'number_of_images', 'format', 'engine', 'usePromptOnly'];
      const missingJsonJobFields = requiredJsonJobFields.filter(field => presetData.jsonjob[field] === undefined);
      if (missingJsonJobFields.length > 0) {
        console.warn('Missing jsonjob fields:', missingJsonJobFields);
        // Set default values for missing fields
        missingJsonJobFields.forEach(field => {
          if (field === 'seed') presetData.jsonjob[field] = -1;
          else if (field === 'guidance') presetData.jsonjob[field] = 3.5;
          else if (field === 'number_of_images') presetData.jsonjob[field] = 1;
          else if (field === 'nsfw_strength') presetData.jsonjob[field] = 0;
          else if (field === 'lora_strength') presetData.jsonjob[field] = 1.0;
          else if (field === 'lora') presetData.jsonjob[field] = false;
          else if (field === 'noAI') presetData.jsonjob[field] = true;
          else if (field === 'usePromptOnly') presetData.jsonjob[field] = false;
          else presetData.jsonjob[field] = '';
        });
      }

      console.log('Saving preset to database:', JSON.stringify(presetData, null, 2));
      console.log('Database URL:', `${config.supabase_server_url}/presets`);
      console.log('User ID:', userData.id);

      // Save to database with retry mechanism
      let response;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          response = await fetch(`${config.supabase_server_url}/presets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify(presetData)
          });

          console.log(`Database response status (attempt ${retryCount + 1}):`, response.status);
          console.log('Database response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Database save failed:', response.status, errorText);

            // If it's a server error (5xx), retry
            if (response.status >= 500 && retryCount < maxRetries - 1) {
              retryCount++;
              console.log(`Retrying database save (attempt ${retryCount + 1}/${maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
              continue;
            }

            throw new Error(`Failed to save preset to database: ${response.status} ${errorText}`);
          }

          break; // Success, exit retry loop
        } catch (error) {
          if (retryCount < maxRetries - 1) {
            retryCount++;
            console.log(`Retrying database save due to error (attempt ${retryCount + 1}/${maxRetries}):`, error);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          }
          throw error; // Re-throw if all retries failed
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Database save failed:', response.status, errorText);
        throw new Error(`Failed to save preset to database: ${response.status} ${errorText}`);
      }

      // Check if response has content before parsing JSON
      const responseText = await response.text();
      console.log('Database response text:', responseText);

      let savedPreset;
      try {
        // If response is empty, consider it a success (some APIs return empty responses on success)
        if (!responseText || responseText.trim() === '') {
          console.log('Empty response from database - considering success');
          savedPreset = { success: true, id: Date.now() }; // Generate a temporary ID
        } else {
          savedPreset = JSON.parse(responseText);
          console.log('Preset saved successfully:', savedPreset);
        }
      } catch (parseError) {
        console.error('Failed to parse database response:', parseError);
        console.log('Raw response text:', responseText);
        // If the response is empty or invalid JSON, but the status was OK, 
        // we can still consider it a success
        if (response.ok) {
          console.log('Database operation succeeded despite invalid JSON response');
          savedPreset = { success: true, id: Date.now() }; // Generate a temporary ID
        } else {
          throw new Error(`Invalid response from database: ${responseText}`);
        }
      }

      // Show appropriate success message
      if (isOverwrite) {
        toast.success(`Preset "${presetName}" saved successfully! (Overwrote existing file)`);
      } else if (filename !== (presetImageSource === 'upload' && uploadedFile ? uploadedFile.name : selectedPresetImage.system_filename)) {
        toast.success(`Preset "${presetName}" saved successfully! (Saved as "${decodeName(filename)}")`);
      } else {
        toast.success(`Preset "${presetName}" saved successfully!`);
      }

      // Reset form
      setPresetName('');
      setSelectedPresetImage(null);
      setPresetImageSource(null);
      setShowSavePresetModal(false);

      // Reset upload state if it was an upload
      if (presetImageSource === 'upload') {
        if (uploadedImageUrl) {
          URL.revokeObjectURL(uploadedImageUrl);
        }
        setUploadedFile(null);
        setUploadedImageUrl(null);
      }

    } catch (error) {
      console.error('Error saving preset:', error);
      toast.error(`Failed to save preset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPendingPresetData(null);
      setConflictFilename('');
      setFinalFilename('');
      setIsSavingPreset(false);
    }
  };

  const resetPresetForm = () => {
    setPresetName('');
    setPresetDescription('');
    setSelectedPresetImage(null);
    setPresetImageSource(null);
    setShowSavePresetModal(false);
  };

  // Upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);

    // Set default filename
    const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const systemFilename = `${filename}_${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;

    // Create a temporary image object that looks like a vault image
    const uploadedImage = {
      id: `upload_${Date.now()}`,
      task_id: `upload_${Date.now()}`,
      user_filename: '',
      system_filename: systemFilename,
      created_at: new Date().toISOString(),
      user_notes: '',
      user_tags: [],
      file_path: `vault/${systemFilename}`,
      file_size_bytes: file.size,
      image_format: file.name.split('.').pop() || 'jpg',
      seed: 0,
      guidance: 0,
      steps: 0,
      nsfw_strength: 0,
      lora_strength: 0,
      model_version: 'uploaded',
      t5xxl_prompt: '',
      clip_l_prompt: '',
      negative_prompt: '',
      actual_seed_used: 0,
      actual_guidance_used: 0,
      actual_steps_used: 0,
      quality_setting: 'uploaded',
      rating: 0,
      favorite: false,
      file_type: 'image',
      // Add preview URL for display
      preview_url: imageUrl
    };

    // Select the uploaded image for preset
    setSelectedPresetImage(uploadedImage);
    setPresetImageSource('upload');

    toast.success('Image uploaded successfully');
  };

  // Recent renders handlers
  const handleRecentRendersSelect = (image: any) => {
    setSelectedPresetImage(image);
    setPresetImageSource('recent');
    setShowRecentRendersModal(false);
    toast.success(`Selected recent render: ${decodeName(image.system_filename)}`);
  };

  const handleSavePresetToDatabase = async () => {
    if (!presetName.trim() || !selectedPresetImage) {
      toast.error('Please provide a preset name and select an image');
      return;
    }

    console.log('Starting preset save process...');
    console.log('Preset name:', presetName);
    console.log('Selected image:', selectedPresetImage);
    console.log('Image source:', presetImageSource);

    setIsSavingPreset(true);

    try {
      // Determine the filename to use
      const originalFilename = presetImageSource === 'upload' && uploadedFile
        ? uploadedFile.name
        : selectedPresetImage.system_filename;

      console.log('Original filename:', originalFilename);

      // Check for file conflicts
      const { hasConflict, existingFilenames } = await checkFileConflict(originalFilename);
      console.log('File conflict check:', { hasConflict, existingFilenames });

      if (hasConflict) {
        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(originalFilename, existingFilenames);
        console.log('Generated unique filename:', uniqueFilename);

        // Store conflict info and show dialog
        setConflictFilename(originalFilename);
        setFinalFilename(uniqueFilename);
        setShowOverwriteDialog(true);

        // Prepare preset data for later use
        const jsonjob = {
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
          format: safeFormatOptions.find(opt => opt.label === formData.format)?.label || formData.format,
          engine: formData.engine,
          usePromptOnly: formData.usePromptOnly,
          regenerated_from: formData.regenerated_from || '12345678-1111-2222-3333-caffebabe0123',
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
            bust: modelData.bust_size,
            body_type: modelData.body_type,
            color_palette: modelData.color_palette || [],
            clothing_style_everyday: modelData.clothing_style_everyday,
            eyebrow_style: modelData.eyebrow_style,
            makeup_style: modelDescription.makeup,
            name_first: modelData.name_first,
            name_last: modelData.name_last,
            visual_only: modelData.visual_only,
            age: modelData.age,
            lifestyle: modelData.lifestyle
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

        const presetData = {
          user_id: userData.id,
          jsonjob: jsonjob,
          name: presetName.trim(),
          description: presetDescription.trim(),
          image_name: originalFilename,
          route: '',
          rating: 0,
          favorite: false,
          created_at: new Date().toISOString()
        };

        console.log('Prepared preset data for conflict resolution:', presetData);

        setPendingPresetData({
          presetData,
          isUpload: presetImageSource === 'upload'
        });

        console.log('Set pendingPresetData for conflict resolution');

        return; // Wait for user decision
      }

      // No conflict, proceed with original filename
      const jsonjob = {
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
        format: safeFormatOptions.find(opt => opt.label === formData.format)?.label || formData.format,
        engine: formData.engine,
        usePromptOnly: formData.usePromptOnly,
        regenerated_from: formData.regenerated_from || '12345678-1111-2222-3333-caffebabe0123',
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
          bust: modelData.bust_size,
          body_type: modelData.body_type,
          color_palette: modelData.color_palette || [],
          clothing_style_everyday: modelData.clothing_style_everyday,
          eyebrow_style: modelData.eyebrow_style,
          makeup_style: modelDescription.makeup,
          name_first: modelData.name_first,
          name_last: modelData.name_last,
          visual_only: modelData.visual_only,
          age: modelData.age,
          lifestyle: modelData.lifestyle
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

      const presetData = {
        user_id: userData.id,
        jsonjob: jsonjob,
        name: presetName.trim(),
        description: presetDescription.trim(),
        image_name: originalFilename,
        route: '',
        rating: 0,
        favorite: false,
        created_at: new Date().toISOString()
      };

      console.log('Prepared preset data for direct save:', presetData);

      // Set pending data for potential conflict resolution
      setPendingPresetData({
        presetData,
        isUpload: presetImageSource === 'upload'
      });

      console.log('Set pendingPresetData for direct save');

      // Save with original filename - pass data directly instead of relying on state
      await savePresetWithFilename(originalFilename, false, {
        presetData,
        isUpload: presetImageSource === 'upload'
      });

    } catch (error) {
      console.error('Error in handleSavePresetToDatabase:', error);
      toast.error(`Failed to save preset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingPreset(false);
    }
  };

  // Save as Preset functions
  const handleSavePreset = () => {
    setShowSavePresetModal(true);
  };

  // Fetch presets from database
  const fetchPresets = async () => {
    if (!userData?.id) return;

    setIsLoadingPresets(true);
    try {
      console.log('Fetching presets for user:', userData.id);

      const response = await fetch(`${config.supabase_server_url}/presets?user_id=eq.${userData.id}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const presetsData = await response.json();
        console.log('Presets fetched successfully:', presetsData);

        // Transform the data to include additional computed fields
        const transformedPresets = presetsData.map((preset: any) => ({
          ...preset,
          // Add computed fields for easier display
          hasModel: !!preset.jsonjob?.model,
          hasScene: !!preset.jsonjob?.scene,
          sceneCount: preset.jsonjob?.scene ? Object.keys(preset.jsonjob.scene).filter(key => preset.jsonjob.scene[key]).length : 0,
          createdDate: new Date(preset.created_at).toLocaleDateString(),
          createdTime: new Date(preset.created_at).toLocaleTimeString(),
          // Generate image URL if image_name exists
          imageUrl: preset.image_name ? `https://storage.nymia.ai/generated_images/${preset.image_name}` : null
        }));

        setPresets(transformedPresets);
        console.log('Transformed presets:', transformedPresets);
      } else {
        console.error('Failed to fetch presets:', response.status, response.statusText);
        toast.error('Failed to load presets');
      }
    } catch (error) {
      console.error('Error fetching presets:', error);
      toast.error('Failed to load presets');
    } finally {
      setIsLoadingPresets(false);
    }
  };

  // Load presets when modal opens
  const handleOpenPresetModal = () => {
    setShowPresetsManager(true);
    fetchPresets();
  };

  // Apply preset to current form
  const handleApplyPreset = (preset: any) => {
    console.log(preset);

    try {
      console.log(preset);
      const jsonjob = preset.jsonjob;

      // Apply form data
      if (jsonjob.task) setFormData(prev => ({ ...prev, task: jsonjob.task }));
      if (jsonjob.lora) setFormData(prev => ({ ...prev, lora: jsonjob.lora }));
      if (jsonjob.noAI) setFormData(prev => ({ ...prev, noAI: jsonjob.noAI }));
      if (jsonjob.prompt) {
        setFormData(prev => {
          const currentPrompt = prev.prompt || '';
          const presetPrompt = jsonjob.prompt || '';
          
          // Merge the prompts: current prompt + preset prompt
          const mergedPrompt = currentPrompt.trim() 
            ? `${currentPrompt.trim()}, ${presetPrompt.trim()}`
            : presetPrompt.trim();

          console.log("mergedPrompt", mergedPrompt);
          console.log("currentPrompt", currentPrompt);
          console.log("presetPrompt", presetPrompt);
          
          return { ...prev, prompt: mergedPrompt };
        });
      }
      if (jsonjob.negative_prompt) setFormData(prev => ({ ...prev, negative_prompt: jsonjob.negative_prompt }));
      if (jsonjob.nsfw_strength) setFormData(prev => ({ ...prev, nsfw_strength: jsonjob.nsfw_strength }));
      if (jsonjob.lora_strength) setFormData(prev => ({ ...prev, lora_strength: jsonjob.lora_strength }));
      if (jsonjob.quality) setFormData(prev => ({ ...prev, quality: typeof jsonjob.quality === 'string' ? jsonjob.quality : (Array.isArray(jsonjob.quality) ? jsonjob.quality[0] : 'Quality') }));
      if (jsonjob.seed) setFormData(prev => ({ ...prev, seed: jsonjob.seed.toString() }));
      if (jsonjob.guidance) setFormData(prev => ({ ...prev, guidance: jsonjob.guidance }));
      if (jsonjob.number_of_images) setFormData(prev => ({ ...prev, numberOfImages: jsonjob.number_of_images }));
      if (jsonjob.format) setFormData(prev => ({ ...prev, format: jsonjob.format }));
      if (jsonjob.engine) setFormData(prev => ({ ...prev, engine: jsonjob.engine }));
      if (jsonjob.usePromptOnly) setFormData(prev => ({ ...prev, usePromptOnly: jsonjob.usePromptOnly }));
      if (jsonjob.regenerated_from) setFormData(prev => ({ ...prev, regenerated_from: jsonjob.regenerated_from }));

      // Apply scene specs
      if (jsonjob.scene) {
        if (jsonjob.scene.framing) setSceneSpecs(prev => ({ ...prev, framing: jsonjob.scene.framing }));
        if (jsonjob.scene.rotation) setSceneSpecs(prev => ({ ...prev, rotation: jsonjob.scene.rotation }));
        if (jsonjob.scene.lighting_preset) setSceneSpecs(prev => ({ ...prev, lighting_preset: jsonjob.scene.lighting_preset }));
        if (jsonjob.scene.scene_setting) setSceneSpecs(prev => ({ ...prev, scene_setting: jsonjob.scene.scene_setting }));
        if (jsonjob.scene.pose) setSceneSpecs(prev => ({ ...prev, pose: jsonjob.scene.pose }));
        if (jsonjob.scene.clothes) setSceneSpecs(prev => ({ ...prev, clothes: jsonjob.scene.clothes }));
      }

      // Apply model data if available - DISABLED to prevent changing influencer information
      // if (jsonjob.model) {
      //   setModelData(jsonjob.model);
      // }

      setShowPresetsManager(false);
      toast.success(`Applied preset: ${preset.name}`);
    } catch (error) {
      console.error('Error applying preset:', error);
      toast.error('Failed to apply preset');
    }
  };

  // Delete preset
  const handleDeletePreset = async (preset: any) => {
    try {
      const response = await fetch(`${config.supabase_server_url}/presets?id=eq.${preset.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (response.ok) {
        setPresets(prev => prev.filter(p => p.id !== preset.id));
        toast.success(`Deleted preset: ${preset.name}`);
      } else {
        throw new Error('Failed to delete preset');
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Failed to delete preset');
    }
  };

  // View preset details
  const handleViewPresetDetails = (preset: any) => {
    setSelectedPreset(preset);
    setShowPresetDetails(true);
  };

  // Filtered presets based on search
  const filteredPresets = presets.filter(preset =>
    preset.name.toLowerCase().includes(presetSearchTerm.toLowerCase())
  );

  // Preset modal state
  const [showPresetsManager, setShowPresetsManager] = useState(false);

  // Mode toggle state
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Handle mode toggle
  const handleModeToggle = () => {
    if (isAdvancedMode) {
      // Switching to Easy mode - reset scene specifications
      setSceneSpecs({
        framing: '',
        rotation: '',
        lighting_preset: '',
        scene_setting: '',
        pose: '',
        clothes: ''
      });
    }
    setIsAdvancedMode(!isAdvancedMode);
  };

  // Status bar edit handlers
  const handleStatusBarEdit = (field: string, currentValue: any, fieldType: 'number' | 'boolean' | 'select' | 'text' | 'slider', event: React.MouseEvent, options?: { label: string; value: any }[]) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setStatusEditPopup({
      isOpen: true,
      field,
      currentValue,
      fieldType,
      options,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8
      }
    });
  };

  // Editable popup states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [showEditPopup, setShowEditPopup] = useState(false);

  return (
    <div className="px-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Create Image
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
              onClick={handleOpenPresetModal}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 text-amber-700 dark:text-amber-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Presets
            </Button>

            <Button
              onClick={handleSavePreset}
              variant="outline"
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save as Preset
            </Button>

            <Button
              onClick={handleModeToggle}
              variant="outline"
              size="sm"
              className={`h-10 px-4 font-medium shadow-sm hover:shadow-md transition-all duration-200 ${isAdvancedMode
                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-800/30 dark:hover:to-cyan-800/30 text-blue-700 dark:text-blue-300'
                : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 text-purple-700 dark:text-purple-300'
                }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              {isAdvancedMode ? 'Easy Mode' : 'Advanced Mode'}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-2">
          <Button
            onClick={handleGenerate}
            disabled={!validateForm() || isGenerating || isCheckingGems}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
            size="lg"
          >
            {isCheckingGems ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking Cost...
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Image
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
            onClick={() => setShowPresetsManager(true)}
            variant="outline"
            className="w-full h-10 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-800/30 dark:hover:to-orange-800/30 text-amber-700 dark:text-amber-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            My Presets
          </Button>

          <Button
            onClick={handleSavePreset}
            variant="outline"
            className="h-10 px-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-800/30 dark:hover:to-green-800/30 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Preset
          </Button>

          <Button
            onClick={handleModeToggle}
            variant="outline"
            size="sm"
            className={`h-10 px-4 font-medium shadow-sm hover:shadow-md transition-all duration-200 ${isAdvancedMode
              ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 text-purple-700 dark:text-purple-300'
              : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-800/30 dark:hover:to-cyan-800/30 text-blue-700 dark:text-blue-300'
              }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isAdvancedMode ? 'Advanced Mode' : 'Easy Mode'}
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 rounded-xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Format
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
              onClick={(e) => handleStatusBarEdit('format', formData.format, 'select', e, safeFormatOptions.map(opt => ({ label: opt.label, value: opt.label })))}
            >
              <div className="flex items-center gap-1">
                {safeFormatOptions.find(opt => opt.label === formData.format)?.label || formData.format}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Images
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
              onClick={(e) => handleStatusBarEdit('numberOfImages', formData.numberOfImages, 'slider', e)}
            >
              <div className="flex items-center gap-1">
                {formData.numberOfImages}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Guidance
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
              onClick={(e) => handleStatusBarEdit('guidance', formData.guidance, 'slider', e)}
            >
              <div className="flex items-center gap-1">
                {formData.guidance}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              ENGINE
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
              onClick={(e) => handleStatusBarEdit('engine', formData.engine, 'select', e, engineOptions.map(opt => ({ label: opt.label, value: opt.label })))}
            >
              <div className="flex items-center gap-1">
                {formData.engine || 'Select Engine'}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              CONSISTENCY
            </span>
            <Badge
              variant={formData.lora ? "default" : "secondary"}
              className={`w-fit cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-purple-300 dark:group-hover:border-purple-600 ${formData.lora ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
              onClick={(e) => handleStatusBarEdit('lora', formData.lora, 'boolean', e)}
            >
              <div className="flex items-center gap-1">
                {formData.lora ? "Enabled" : "Disabled"}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              LORA Strength
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
              onClick={(e) => handleStatusBarEdit('lora_strength', formData.lora_strength, 'slider', e)}
            >
              <div className="flex items-center gap-1">
                {formData.lora_strength}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              NSFW Strength
            </span>
            <Badge
              variant="secondary"
              className="w-fit bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
              onClick={(e) => handleStatusBarEdit('nsfw_strength', formData.nsfw_strength || 0, 'slider', e)}
            >
              <div className="flex items-center gap-1">
                {formData.nsfw_strength || 0}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>

          <div className="flex flex-col space-y-2 group">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              PROMPT ONLY
            </span>
            <Badge
              variant={formData.usePromptOnly ? "default" : "secondary"}
              className={`w-fit cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 group-hover:border-green-300 dark:group-hover:border-green-600 ${formData.usePromptOnly ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
              onClick={(e) => handleStatusBarEdit('usePromptOnly', formData.usePromptOnly, 'boolean', e)}
            >
              <div className="flex items-center gap-1">
                {formData.usePromptOnly ? "Enabled" : "Disabled"}
                <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:hidden">
        {/* Influencer Info */}
        <Card>
          <CardHeader className='flex flex-col items-center'>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              {modelData ? `${modelData.name_first} ${modelData.name_last}` : "Influencer"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modelData ? (
              <>
                <div className="grid gap-4 items-start">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={modelData.image_url}
                        alt={`${modelData.name_first} ${modelData.name_last}`}
                        className="w-full h-full object-cover"
                      />
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

      {/* Main Layout - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-6">
        <div className="space-y-6">
          {isAdvancedMode ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scene">Scene</TabsTrigger>
                <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
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
                  <CardContent className="space-y-6">
                    {/* First Row: Task Type, Number of Images, Guidance */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

                      <div className="space-y-6">
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

                      <div className="space-y-6">
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

                    {/* Second Row: Format and Makeup Style */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                            {safeFormatOptions.map((option) => (
                              <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div
                          onClick={() => setShowFormatSelector(true)}
                          className="flex items-center justify-center w-full cursor-pointer"
                        >
                          {formData.format && safeFormatOptions.find(option => option.label === formData.format)?.image ? (
                            <Card className="relative w-full max-w-[250px]">
                              <CardContent className="p-4">
                                <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={`${config.data_url}/wizard/mappings400/${safeFormatOptions.find(option => option.label === formData.format)?.image}`}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInputChange('format', '');
                                    }}
                                  >
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </Button>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{safeFormatOptions.find(option => option.label === formData.format)?.label}</p>
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
                            options={safeFormatOptions}
                            onSelect={(label) => handleInputChange('format', label)}
                            onClose={() => setShowFormatSelector(false)}
                            title="Select Format Style"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Makeup Style</Label>
                        <Select
                          value={modelDescription.makeup}
                          onValueChange={(value) => handleModelDescriptionChange('makeup', value)}
                        >
                          <SelectTrigger>
                            <div className='pl-10'>
                              {makeupOptions.find(opt => opt.label === modelDescription.makeup)?.label}
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {makeupOptions.map((option) => (
                              <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div
                          onClick={() => setShowMakeupSelector(true)}
                          className="flex items-center justify-center w-full cursor-pointer"
                        >
                          {modelDescription.makeup && makeupOptions.find(option => option.label === modelDescription.makeup)?.image ? (
                            <Card className="relative w-full max-w-[250px]">
                              <CardContent className="p-4">
                                <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={`${config.data_url}/wizard/mappings400/${makeupOptions.find(option => option.label === modelDescription.makeup)?.image}`}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleModelDescriptionChange('makeup', '');
                                    }}
                                  >
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </Button>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{makeupOptions.find(option => option.label === modelDescription.makeup)?.label}</p>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="relative w-full border max-w-[250px]">
                              <CardContent className="p-4">
                                <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    Select makeup style
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
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
                      <div className="space-y-2">
                        <Label>Engine</Label>
                        <Select
                          value={formData.engine}
                          onValueChange={(value) => handleInputChange('engine', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select engine" />
                          </SelectTrigger>
                          <SelectContent>
                            {engineOptions.map((option) => (
                              <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div
                          onClick={() => setShowEngineSelector(true)}
                          className="flex items-center justify-center w-full cursor-pointer"
                        >
                          {formData.engine && engineOptions.find(option => option.label === formData.engine)?.image ? (
                            <Card className="relative w-full max-w-[250px]">
                              <CardContent className="p-4">
                                <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                  <img
                                    src={`${config.data_url}/wizard/mappings400/${engineOptions.find(option => option.label === formData.engine)?.image}`}
                                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInputChange('engine', '');
                                    }}
                                  >
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </Button>
                                </div>
                                <p className="text-sm text-center font-medium mt-2">{engineOptions.find(option => option.label === formData.engine)?.label}</p>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="relative w-full border max-w-[250px]">
                              <CardContent className="p-4">
                                <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    Select engine
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                        {showEngineSelector && (
                          <OptionSelector
                            options={engineOptions}
                            onSelect={(label) => handleInputChange('engine', label)}
                            onClose={() => setShowEngineSelector(false)}
                            title="Select Engine"
                          />
                        )}
                      </div>
                    </div>
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
                      <Badge variant={isAdvancedMode ? "default" : "secondary"} className={`ml-2 ${isAdvancedMode
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        }`}>
                        {isAdvancedMode ? 'Advanced' : 'Easy'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {isAdvancedMode
                        ? "Combine your image generation instructions by selecting from the presets and by describing in the Prompt input below what you want to see."
                        : "Easy mode: Choose from the Presets above or use your own Prompt to describe the scene your influencer is in."
                      }
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Text Input - First Option */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        Prompt
                      </Label>
                      <div className="relative">
                        <Textarea
                          value={formData.prompt}
                          onChange={(e) => handleInputChange('prompt', e.target.value)}
                          placeholder="Describe what you want to see... (e.g., 'Model is sitting at the beach and enjoys the sun' or 'white shirt and blue jeans')"
                          rows={3}
                          className="pl-10 pr-4 border-2 focus:border-green-500/50 focus:ring-green-500/20 transition-all duration-200"
                        />
                        <div className="absolute left-3 top-3 text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>

                      {/* Use Prompt Only Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Use Prompt Only</Label>
                          <p className="text-sm text-muted-foreground">
                            System will follow the prompt and ignore all other selections.
                          </p>
                        </div>
                        <Switch
                          checked={formData.usePromptOnly}
                          onCheckedChange={(checked) => handleInputChange('usePromptOnly', checked)}
                        />
                      </div>

                      {/* Scene Specifications - Only show in Advanced Mode */}
                      {isAdvancedMode && (
                        <>
                          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-3 md:grid-cols-2 gap-4">
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
                                className="flex items-center justify-center w-full cursor-pointer"
                              >
                                {sceneSpecs.framing && framingOptions.find(option => option.label === sceneSpecs.framing)?.image ? (
                                  <Card className="relative w-full max-w-[250px]">
                                    <CardContent className="p-4">
                                      <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                        <img
                                          src={`${config.data_url}/wizard/mappings400/${framingOptions.find(option => option.label === sceneSpecs.framing)?.image}`}
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
                                className="flex items-center justify-center w-full cursor-pointer"
                              >
                                {sceneSpecs.rotation && rotationOptions.find(option => option.label === sceneSpecs.rotation)?.image ? (
                                  <Card className="relative w-full max-w-[250px]">
                                    <CardContent className="p-4">
                                      <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                        <img
                                          src={`${config.data_url}/wizard/mappings400/${rotationOptions.find(option => option.label === sceneSpecs.rotation)?.image}`}
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
                                className="flex items-center justify-center w-full cursor-pointer"
                              >
                                {sceneSpecs.lighting_preset && lightingOptions.find(option => option.label === sceneSpecs.lighting_preset)?.image ? (
                                  <Card className="relative w-full max-w-[250px]">
                                    <CardContent className="p-4">
                                      <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                        <img
                                          src={`${config.data_url}/wizard/mappings400/${lightingOptions.find(option => option.label === sceneSpecs.lighting_preset)?.image}`}
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
                                className="flex items-center justify-center w-full cursor-pointer"
                              >
                                {sceneSpecs.scene_setting && sceneSettingsOptions.find(option => option.label === sceneSpecs.scene_setting)?.image ? (
                                  <Card className="relative w-full max-w-[250px]">
                                    <CardContent className="p-4">
                                      <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                        <img
                                          src={`${config.data_url}/wizard/mappings400/${sceneSettingsOptions.find(option => option.label === sceneSpecs.scene_setting)?.image}`}
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
                                className="flex items-center justify-center w-full cursor-pointer"
                              >
                                {sceneSpecs.pose && poseOptions.find(option => option.label === sceneSpecs.pose)?.image ? (
                                  <Card className="relative w-full max-w-[250px]">
                                    <CardContent className="p-4">
                                      <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                        <img
                                          src={`${config.data_url}/wizard/mappings400/${poseOptions.find(option => option.label === sceneSpecs.pose)?.image}`}
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
                                className="flex items-center justify-center w-full cursor-pointer"
                              >
                                {sceneSpecs.clothes && clothesOptions.find(option => option.label === sceneSpecs.clothes)?.image ? (
                                  <Card className="relative w-full max-w-[250px]">
                                    <CardContent className="p-4">
                                      <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                                        <img
                                          src={`${config.data_url}/wizard/mappings400/${clothesOptions.find(option => option.label === sceneSpecs.clothes)?.image}`}
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
                        </>
                      )}
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
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-md">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                        </div>
                        Negative Prompt
                      </Label>
                      <div className="relative">
                        <Textarea
                          value={formData.negative_prompt || ''}
                          onChange={(e) => handleInputChange('negative_prompt', e.target.value)}
                          placeholder="Describe things you don't want to see. Optional, we take care of the essentials for you anyway."
                          rows={3}
                          className="pl-10 pr-4 border-2 focus:border-red-500/50 focus:ring-red-500/20 transition-all duration-200"
                        />
                        <div className="absolute left-3 top-3 text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-6">
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

                      <div className="space-y-6">
                        <Label>LORA Strength</Label>
                        <Slider
                          value={[formData.lora_strength || 1.0]}
                          onValueChange={([value]) => handleInputChange('lora_strength', value)}
                          max={1.5}
                          min={-0.5}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Weak (-0.5)</span>
                          <span>Strong (+1.5)</span>
                        </div>
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

                      <div className="space-y-2">
                        <Label>Seed (Optional)</Label>
                        <Input
                          value={formData.seed}
                          onChange={(e) => handleInputChange('seed', e.target.value)}
                          placeholder="Enter seed value for reproducible results"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-md">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          Regenerated from
                        </Label>
                        <div className="relative">
                          <Input
                            value={formData.regenerated_from || '12345678-1111-2222-3333-caffebabe0123'}
                            disabled
                            className="pl-10 pr-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                            placeholder="No regeneration source"
                          />
                          <div className="absolute left-3 top-3 text-muted-foreground">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Shows the source image ID if this is a regenerated image. Used for maintaining consistency.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            // Easy Mode - Show only Scene content without tabs
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    Scene Specifications
                    <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      Easy
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Easy mode: Choose from the Presets above or use your own Prompt to describe the scene your influencer is in.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Text Input - First Option */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      Prompt
                    </Label>
                    <div className="relative">
                      <Textarea
                        value={formData.prompt}
                        onChange={(e) => handleInputChange('prompt', e.target.value)}
                        placeholder="Describe what you want to see... (e.g., 'Model is sitting at the beach and enjoys the sun' or 'white shirt and blue jeans')"
                        rows={isAdvancedMode ? 3 : 7}
                        className="pl-10 pr-4 border-2 focus:border-green-500/50 focus:ring-green-500/20 transition-all duration-200"
                      />
                      <div className="absolute left-3 top-3 text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>

                    {/* Use Prompt Only Toggle */}
                    {
                      isAdvancedMode && (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Use Prompt Only</Label>
                            <p className="text-sm text-muted-foreground">
                              System will follow the prompt and ignore all other selections.
                            </p>
                          </div>
                          <Switch
                            checked={formData.usePromptOnly}
                            onCheckedChange={(checked) => handleInputChange('usePromptOnly', checked)}
                          />
                        </div>
                      )
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <div className="space-y-3 hidden lg:block">
          {/* Influencer Info */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                {modelData ? `${modelData.name_first} ${modelData.name_last}` : "Influencer"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {modelData ? (
                <>
                  <div className="grid gap-4 items-start">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={modelData.image_url}
                          alt={`${modelData.name_first} ${modelData.name_last}`}
                          className="w-full h-full object-cover"
                        />
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
          <Button
            variant="outline"
            className="w-full mt-4 mb-8 font-semibold text-md bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-lg hover:from-blue-800 hover:to-purple-800"
            onClick={() => setShowHistory(v => !v)}
          >
            {showHistory ? 'Hide history' : 'Show history'}
          </Button>
        </div>
      </div>
      {activeTab === 'scene' && isAdvancedMode && (
        <Card className='hidden lg:block'>
          <CardContent className='pt-2'>
            <div className="hidden lg:grid grid-cols-3 xl:grid-cols-6 gap-4">
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
                  className="flex items-center justify-center w-full cursor-pointer"
                >
                  {sceneSpecs.framing && framingOptions.find(option => option.label === sceneSpecs.framing)?.image ? (
                    <Card className="relative w-full max-w-[200px]">
                      <CardContent className="p-4">
                        <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                          <img
                            src={`${config.data_url}/wizard/mappings400/${framingOptions.find(option => option.label === sceneSpecs.framing)?.image}`}
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
                    <Card className="relative w-full border max-w-[200px]">
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
                  className="flex items-center justify-center w-full cursor-pointer"
                >
                  {sceneSpecs.rotation && rotationOptions.find(option => option.label === sceneSpecs.rotation)?.image ? (
                    <Card className="relative w-full max-w-[200px]">
                      <CardContent className="p-4">
                        <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                          <img
                            src={`${config.data_url}/wizard/mappings400/${rotationOptions.find(option => option.label === sceneSpecs.rotation)?.image}`}
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
                    <Card className="relative w-full border max-w-[200px]">
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
                  className="flex items-center justify-center w-full cursor-pointer"
                >
                  {sceneSpecs.lighting_preset && lightingOptions.find(option => option.label === sceneSpecs.lighting_preset)?.image ? (
                    <Card className="relative w-full max-w-[200px]">
                      <CardContent className="p-4">
                        <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                          <img
                            src={`${config.data_url}/wizard/mappings400/${lightingOptions.find(option => option.label === sceneSpecs.lighting_preset)?.image}`}
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
                    <Card className="relative w-full border max-w-[200px]">
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
                  className="flex items-center justify-center w-full cursor-pointer"
                >
                  {sceneSpecs.scene_setting && sceneSettingsOptions.find(option => option.label === sceneSpecs.scene_setting)?.image ? (
                    <Card className="relative w-full max-w-[200px]">
                      <CardContent className="p-4">
                        <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                          <img
                            src={`${config.data_url}/wizard/mappings400/${sceneSettingsOptions.find(option => option.label === sceneSpecs.scene_setting)?.image}`}
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
                    <Card className="relative w-full border max-w-[200px]">
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
                  className="flex items-center justify-center w-full cursor-pointer"
                >
                  {sceneSpecs.pose && poseOptions.find(option => option.label === sceneSpecs.pose)?.image ? (
                    <Card className="relative w-full max-w-[200px]">
                      <CardContent className="p-4">
                        <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                          <img
                            src={`${config.data_url}/wizard/mappings400/${poseOptions.find(option => option.label === sceneSpecs.pose)?.image}`}
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
                    <Card className="relative w-full border max-w-[200px]">
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
                  className="flex items-center justify-center w-full cursor-pointer"
                >
                  {sceneSpecs.clothes && clothesOptions.find(option => option.label === sceneSpecs.clothes)?.image ? (
                    <Card className="relative w-full max-w-[200px]">
                      <CardContent className="p-4">
                        <div className="relative w-full group text-center" style={{ paddingBottom: '100%' }}>
                          <img
                            src={`${config.data_url}/wizard/mappings400/${clothesOptions.find(option => option.label === sceneSpecs.clothes)?.image}`}
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
                    <Card className="relative w-full border max-w-[200px]">
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
      )}

      {/* Generated Image Results Card */}
      {generatedTaskIds.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Image className="w-5 h-5 text-white" />
                </div>
                Generated Images
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your generated images will appear here once the task is completed.
              </p>
            </CardHeader>
            <CardContent>
              {
                generatedImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {generatedImages
                      .filter(image => image.file_path && image.system_filename === image.file_path.split('/').pop())
                      .map((image, index) => (
                        <Card
                          key={image.id}
                          className={`group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/50 backdrop-blur-sm bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5 hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-blue-950/10 dark:hover:to-purple-950/10 ${renamingFile === image.system_filename ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                          onContextMenu={(e) => renamingFile !== image.system_filename && handleFileContextMenu(e, image)}
                        >
                          <CardContent className="p-4">
                            {/* Top Row: File Type, Ratings, Favorite */}
                            <div className="flex items-center justify-between mb-3">
                              {/* File Type Icon */}
                              <div className="rounded-full w-8 h-8 flex items-center justify-center shadow-md bg-gradient-to-br from-blue-500 to-purple-600">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                  <circle cx="8.5" cy="8.5" r="1.5" opacity="0.8" />
                                </svg>
                              </div>

                              {/* Rating Stars */}
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform ${star <= (image.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    viewBox="0 0 24 24"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateRating(image.system_filename, star);
                                    }}
                                  >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>

                              {/* Favorite Heart */}
                              <div>
                                {image.favorite ? (
                                  <div
                                    className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateFavorite(image.system_filename, false);
                                    }}
                                  >
                                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div
                                    className="bg-black/50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateFavorite(image.system_filename, true);
                                    }}
                                  >
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
                                src={`${config.data_url}/cdn-cgi/image/w=400/${image.file_path}`}
                                alt={image.system_filename}
                                className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                                onClick={() => setDetailedImageModal({ open: true, image })}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              {/* Zoom Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md flex items-end justify-end p-2">
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black shadow-lg hover:shadow-xl transition-all duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFullSizeImageModal({
                                        isOpen: true,
                                        imageUrl: `${config.data_url}/cdn-cgi/image/w=1200/${image.file_path}`,
                                        imageName: decodeName(image.system_filename)
                                      });
                                    }}
                                  >
                                    <ZoomIn className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* User Notes */}
                            {editingNotes === image.system_filename ? (
                              <div className="mb-3 space-y-2">
                                <Input
                                  value={notesInput}
                                  onChange={(e) => setNotesInput(e.target.value)}
                                  placeholder="Add notes..."
                                  className="text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateUserNotes(image.system_filename, notesInput);
                                      setEditingNotes(null);
                                      setNotesInput('');
                                    } else if (e.key === 'Escape') {
                                      setEditingNotes(null);
                                      setNotesInput('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs"
                                    onClick={() => {
                                      updateUserNotes(image.system_filename, notesInput);
                                      setEditingNotes(null);
                                      setNotesInput('');
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs"
                                    onClick={() => {
                                      setEditingNotes(null);
                                      setNotesInput('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="mb-3">
                                {image.user_notes ? (
                                  <p
                                    className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                    onClick={() => {
                                      setEditingNotes(image.system_filename);
                                      setNotesInput(image.user_notes || '');
                                    }}
                                  >
                                    {image.user_notes}
                                  </p>
                                ) : (
                                  <div
                                    className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                    onClick={() => {
                                      setEditingNotes(image.system_filename);
                                      setNotesInput('');
                                    }}
                                  >
                                    Add notes
                                  </div>
                                )}
                              </div>
                            )}

                            {/* User Tags */}
                            {image.user_tags && image.user_tags.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-1">
                                {image.user_tags.map((tag: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs flex items-center gap-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                                  >
                                    {tag.trim()}
                                    <button
                                      className="ml-1 hover:text-red-500 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedTags = image.user_tags?.filter((_: string, i: number) => i !== index) || [];
                                        updateUserTags(image.system_filename, updatedTags);
                                      }}
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Editable User Tags */}
                            <div className="mb-3">
                              {editingTags === image.system_filename ? (
                                <div className="space-y-2">
                                  <Input
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    placeholder="Add tags (comma separated)..."
                                    className="text-sm"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const newTags = tagsInput.trim() ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                                        const existingTags = image.user_tags || [];
                                        const combinedTags = [...existingTags, ...newTags];
                                        const uniqueTags = [...new Set(combinedTags)];
                                        updateUserTags(image.system_filename, uniqueTags);
                                        setEditingTags(null);
                                        setTagsInput('');
                                      } else if (e.key === 'Escape') {
                                        setEditingTags(null);
                                        setTagsInput('');
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs"
                                      onClick={() => {
                                        const newTags = tagsInput.trim() ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                                        const existingTags = image.user_tags || [];
                                        const combinedTags = [...existingTags, ...newTags];
                                        const uniqueTags = [...new Set(combinedTags)];
                                        updateUserTags(image.system_filename, uniqueTags);
                                        setEditingTags(null);
                                        setTagsInput('');
                                      }}
                                    >
                                      Add
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs"
                                      onClick={() => {
                                        setEditingTags(null);
                                        setTagsInput('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                  onClick={() => {
                                    setEditingTags(image.system_filename);
                                    setTagsInput('');
                                  }}
                                >
                                  Add tags
                                </div>
                              )}
                            </div>

                            {/* Filename and Date */}
                            <div className="space-y-2">
                              {editingFile === image.system_filename && renamingFile !== image.system_filename ? (
                                <div className="w-full">
                                  <div className="relative">
                                    <Input
                                      value={editingFileName}
                                      onChange={(e) => setEditingFileName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleFileRename(image.system_filename, editingFileName);
                                        } else if (e.key === 'Escape') {
                                          setEditingFile(null);
                                          setEditingFileName('');
                                        }
                                      }}
                                      onBlur={() => handleFileRename(image.system_filename, editingFileName)}
                                      className="text-sm h-8"
                                      autoFocus
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                                    {decodeName(image.system_filename)}
                                  </h3>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(image.created_at).toLocaleDateString()}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1.5 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-8 text-xs font-medium hover:bg-purple-700 hover:border-purple-500 transition-colors"
                                onClick={() => handleDownload(image)}
                              >
                                <Download className="w-3 h-3 mr-1.5" />
                                <span className="hidden sm:inline">Download</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:bg-green-700 hover:border-green-500 transition-colors"
                                onClick={() => handleShare(image.system_filename)}
                              >
                                <Share className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-amber-500 hover:border-amber-300 transition-colors"
                                onClick={() => handleFileDelete(image)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex gap-1.5 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-8 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 hover:from-blue-600 hover:to-purple-700 hover:border-blue-600 transition-all duration-200 shadow-sm"
                                onClick={() => handleEdit(image)}
                                title="Edit this image with professional tools"
                              >
                                <Edit3 className="w-3 h-3 mr-1.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                            </div>

                            {/* Regenerate Button - Only for non-uploaded and non-edited images */}
                            {!(image.model_version === 'edited' || image.quality_setting === 'edited') && !image.task_id?.startsWith('upload_') && (
                              <div className="mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full h-8 text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                  onClick={() => handleRegenerate(image)}
                                  disabled={regeneratingImages.has(image.system_filename)}
                                >
                                  {regeneratingImages.has(image.system_filename) ? (
                                    <div className="flex items-center gap-2">
                                      <RotateCcw className="w-3 h-3 animate-spin" />
                                      <span>Regenerating...</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Regenerate</span>
                                    </div>
                                  )}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No generated images found yet.</p>
                    <p className="text-sm">Images will appear here once generation is complete.</p>
                  </div>
                )
              }
            </CardContent>
          </Card>
        </div>
      )}

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
                            <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                              {influencer.name_first} {influencer.name_last}
                            </h3>
                          </div>

                          <div className="flex flex-col gap-1 mb-3">
                            <div className="flex text-sm text-muted-foreground flex-col">
                              {influencer.notes ? (
                                <span className="font-medium mr-2">Notes:</span>
                              ) : (
                                <span className="font-medium mr-2">Details:</span>
                              )}
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

      {/* Vault Selector Modal */}
      <VaultSelector
        open={showVaultSelector}
        onOpenChange={setShowVaultSelector}
        onImageSelect={handleVaultImageSelect}
        title="Select Image from Vault"
        description="Browse your vault and select an image to use as reference"
      />

      {/* Vault Selector for Presets */}
      <VaultSelector
        open={showVaultSelectorForPreset}
        onOpenChange={setShowVaultSelectorForPreset}
        onImageSelect={handleVaultImageSelectForPreset}
        title="Select Image for Preset"
        description="Browse your vault and select an image to represent your preset"
      />

      {/* My Presets Modal - REMOVED - Now using PresetsManager component */}

      {/* Library Modal */}
      {showLibraryModal && (
        <LibraryManager
          onClose={() => setShowLibraryModal(false)}
          onApplyPreset={(library) => {
            try {
              const jsonjob = library.jsonjob;

              // Apply form data
              if (jsonjob.task) setFormData(prev => ({ ...prev, task: jsonjob.task }));
              if (jsonjob.lora !== undefined) setFormData(prev => ({ ...prev, lora: jsonjob.lora }));
              if (jsonjob.noAI !== undefined) setFormData(prev => ({ ...prev, noAI: jsonjob.noAI }));
              if (jsonjob.prompt) {
                setFormData(prev => {
                  const currentPrompt = prev.prompt || '';
                  const presetPrompt = jsonjob.prompt || '';
                  
                  // Merge the prompts: current prompt + preset prompt
                  const mergedPrompt = currentPrompt.trim() 
                    ? `${currentPrompt.trim()}, ${presetPrompt.trim()}`
                    : presetPrompt.trim();
                  
                  return { ...prev, prompt: mergedPrompt };
                });
              }
              if (jsonjob.negative_prompt) setFormData(prev => ({ ...prev, negative_prompt: jsonjob.negative_prompt }));
              if (jsonjob.nsfw_strength !== undefined) setFormData(prev => ({ ...prev, nsfw_strength: jsonjob.nsfw_strength }));
              if (jsonjob.lora_strength !== undefined) setFormData(prev => ({ ...prev, lora_strength: jsonjob.lora_strength }));
              if (jsonjob.quality) setFormData(prev => ({ ...prev, quality: typeof jsonjob.quality === 'string' ? jsonjob.quality : (Array.isArray(jsonjob.quality) ? jsonjob.quality[0] : 'Quality') }));
              if (jsonjob.seed !== undefined) setFormData(prev => ({ ...prev, seed: jsonjob.seed.toString() }));
              if (jsonjob.guidance !== undefined) setFormData(prev => ({ ...prev, guidance: jsonjob.guidance }));
              if (jsonjob.number_of_images !== undefined) setFormData(prev => ({ ...prev, numberOfImages: jsonjob.number_of_images }));
              if (jsonjob.format) setFormData(prev => ({ ...prev, format: jsonjob.format }));
              if (jsonjob.engine) setFormData(prev => ({ ...prev, engine: jsonjob.engine }));
              // if (jsonjob.usePromptOnly !== undefined) setFormData(prev => ({ ...prev, usePromptOnly: jsonjob.usePromptOnly }));

              // Apply scene specs
              if (jsonjob.scene) {
                if (jsonjob.scene.framing) setSceneSpecs(prev => ({ ...prev, framing: jsonjob.scene.framing }));
                if (jsonjob.scene.rotation) setSceneSpecs(prev => ({ ...prev, rotation: jsonjob.scene.rotation }));
                if (jsonjob.scene.lighting_preset) setSceneSpecs(prev => ({ ...prev, lighting_preset: jsonjob.scene.lighting_preset }));
                if (jsonjob.scene.scene_setting) setSceneSpecs(prev => ({ ...prev, scene_setting: jsonjob.scene.scene_setting }));
                if (jsonjob.scene.pose) setSceneSpecs(prev => ({ ...prev, pose: jsonjob.scene.pose }));
                if (jsonjob.scene.clothes) setSceneSpecs(prev => ({ ...prev, clothes: jsonjob.scene.clothes }));
              }

              // Apply model data if available - DISABLED to prevent changing influencer information
              // if (jsonjob.model) {
              //   setModelData(jsonjob.model);
              // }

              setShowLibraryModal(false);
              toast.success(`Applied library item: ${library.name}`);
            } catch (error) {
              console.error('Error applying library item:', error);
              toast.error('Failed to apply library item');
            }
          }}
        />
      )}

      {/* Save as Preset Modal */}
      <Dialog open={showSavePresetModal} onOpenChange={setShowSavePresetModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                <Save className="w-5 h-5 text-white" />
              </div>
              Save as Preset
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Save your current settings as a reusable preset with an image
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preset Name Input */}
            <div className="space-y-2">
              <Label htmlFor="preset-name" className="text-sm font-medium">
                Preset Name
              </Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter a descriptive name for your preset..."
                className="w-full"
              />
            </div>

            {/* Preset Description Input */}
            <div className="space-y-2">
              <Label htmlFor="preset-description" className="text-sm font-medium flex items-center gap-2">
                <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Preset Description
              </Label>
              <Textarea
                id="preset-description"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Describe your preset's purpose, style, or any special notes..."
                className="w-full min-h-[80px] resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                maxLength={500}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Add context to help you remember what this preset is for</span>
                <span>{presetDescription.length}/500</span>
              </div>
            </div>

            {/* Image Selection Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Preset Image</Label>

              {/* Selected Image Display */}
              {selectedPresetImage && (
                <div className="relative">
                  <Card className={`justify-center flex group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-yellow-500/30 backdrop-blur-sm ${selectedPresetImage.task_id?.startsWith('upload_')
                    ? 'bg-gradient-to-br from-purple-50/20 to-pink-50/20 dark:from-purple-950/5 dark:to-pink-950/5 hover:border-purple-500/30'
                    : 'bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5'
                    }`}>
                    <CardContent className="p-4">
                      {/* Top Row: File Type, Ratings, Favorite */}
                      <div className="flex items-center justify-between mb-3">
                        {/* File Type Icon */}
                        <div className={`rounded-full w-8 h-8 flex items-center justify-center shadow-md ${selectedPresetImage.task_id?.startsWith('upload_')
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                          {selectedPresetImage.task_id?.startsWith('upload_') ? (
                            <Upload className="w-4 h-4 text-white" />
                          ) : selectedPresetImage.file_type === 'video' ? (
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
                              className={`w-4 h-4 ${star <= (selectedPresetImage.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>

                        {/* Favorite Heart */}
                        <div>
                          {selectedPresetImage.favorite ? (
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
                        {/* Uploaded/Edited Image Indicator */}
                        {(selectedPresetImage.model_version === 'edited' || selectedPresetImage.quality_setting === 'edited') && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium shadow-lg">
                              <Edit className="w-3 h-3 mr-1" />
                              Edited
                            </Badge>
                          </div>
                        )}

                        {/* Source Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <Badge variant="secondary" className="bg-black/70 text-white text-xs font-medium shadow-lg">
                            {presetImageSource}
                          </Badge>
                        </div>

                        <img
                          src={selectedPresetImage.preview_url || `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/${selectedPresetImage.user_filename === "" ? "output" : "vault/" + selectedPresetImage.user_filename}/${selectedPresetImage.system_filename}`}
                          alt="Selected preset image"
                          className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                          onError={(e) => {
                            // Fallback for uploaded files that might not be accessible via CDN
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'absolute inset-0 w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-md flex items-center justify-center';
                            fallback.innerHTML = `
                              <div class="text-center">
                                <Upload class="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <p class="text-xs text-purple-600 dark:text-purple-400">Uploaded File</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${selectedPresetImage.system_filename}</p>
                              </div>
                            `;
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </div>

                      {/* User Notes */}
                      {selectedPresetImage.user_notes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{selectedPresetImage.user_notes}</p>
                        </div>
                      )}

                      {/* User Tags */}
                      {selectedPresetImage.user_tags && selectedPresetImage.user_tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {selectedPresetImage.user_tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                          {selectedPresetImage.user_tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{selectedPresetImage.user_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Filename and Date */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                          {decodeName(selectedPresetImage.system_filename)}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(selectedPresetImage.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-1.5 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs font-medium"
                          onClick={() => setSelectedPresetImage(null)}
                        >
                          <X className="w-3 h-3 mr-1.5" />
                          Remove Image
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Image Source Selection */}
              {!selectedPresetImage && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-300 hover:border-emerald-500"
                    onClick={() => setShowVaultSelectorForPreset(true)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">From Vault</h3>
                      <p className="text-sm text-muted-foreground">
                        Select from your saved images
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-300 hover:border-emerald-500"
                    onClick={() => {
                      // Trigger file selection directly
                      document.getElementById('file-upload-direct')?.click();
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Upload Image</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a new image
                      </p>
                      <input
                        type="file"
                        id="file-upload-direct"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </CardContent>
                  </Card>

                  <Card
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-300 hover:border-emerald-500"
                    onClick={() => setShowRecentRendersModal(true)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Image className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Recent Renders</h3>
                      <p className="text-sm text-muted-foreground">
                        Select from recent generations
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={resetPresetForm}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePresetToDatabase}
                disabled={!presetName.trim() || !selectedPresetImage || isSavingPreset}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                {isSavingPreset ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preset
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Selector Modal */}
      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Image className="w-5 h-5 text-white" />
              </div>
              Select Image for Preset
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Choose an image to represent your preset
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Source Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button
                variant={presetImageSource === 'vault' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPresetImageSource('vault')}
                className="flex-1"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Vault
              </Button>
              <Button
                variant={presetImageSource === 'recent' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPresetImageSource('recent')}
                className="flex-1"
              >
                <Image className="w-4 h-4 mr-2" />
                Recent Renders
              </Button>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {presetImageSource === 'vault' && (
                // Vault images would be fetched here
                <div className="text-center py-8 col-span-full">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Vault images would be displayed here</p>
                </div>
              )}

              {presetImageSource === 'recent' && generatedImages.length > 0 && (
                generatedImages.map((image) => (
                  <Card
                    key={image.id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handlePresetImageSelect(image, 'recent')}
                  >
                    <CardContent className="p-4">
                      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                        <img
                          src={`${config.data_url}/cdn-cgi/image/w=400/${image.file_path}`}
                          alt={image.system_filename}
                          className="absolute inset-0 w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <p className="text-sm font-medium mt-2 truncate">
                        {decodeName(image.system_filename)}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}

              {presetImageSource === 'recent' && generatedImages.length === 0 && (
                <div className="text-center py-8 col-span-full">
                  <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent renders available</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Renders Modal */}
      <Dialog open={showRecentRendersModal} onOpenChange={setShowRecentRendersModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Image className="w-5 h-5 text-white" />
              </div>
              Select Recent Render
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Choose from your recent generated images
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Recent Renders Grid */}
            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {generatedImages
                  .filter(image => image.file_path && image.system_filename === image.file_path.split('/').pop())
                  .map((image, index) => (
                    <Card
                      key={image.id}
                      className={`group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/50 backdrop-blur-sm bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5 hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-blue-950/10 dark:hover:to-purple-950/10 cursor-pointer`}
                      onClick={() => handleRecentRendersSelect(image)}
                    >
                      <CardContent className="p-4">
                        {/* Top Row: File Type, Ratings, Favorite */}
                        <div className="flex items-center justify-between mb-3">
                          {/* File Type Icon */}
                          <div className="rounded-full w-8 h-8 flex items-center justify-center shadow-md bg-gradient-to-br from-blue-500 to-purple-600">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                              <circle cx="8.5" cy="8.5" r="1.5" opacity="0.8" />
                            </svg>
                          </div>

                          {/* Rating Stars */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= (image.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
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
                            src={`${config.data_url}/cdn-cgi/image/w=400/${image.file_path}`}
                            alt={image.system_filename}
                            className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          {/* Zoom Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md flex items-end justify-end p-2">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black shadow-lg hover:shadow-xl transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFullSizeImageModal({
                                    isOpen: true,
                                    imageUrl: `${config.data_url}/cdn-cgi/image/w=1200/${image.file_path}`,
                                    imageName: decodeName(image.system_filename)
                                  });
                                }}
                              >
                                <ZoomIn className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                              </Button>
                            </div>
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
                            {image.user_tags.slice(0, 3).map((tag: string, index: number) => (
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
                            {decodeName(image.system_filename)}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(image.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recent renders available</h3>
                <p className="text-muted-foreground mb-4">
                  Generate some images first to see them here
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* File Conflict Overwrite Dialog */}
      <Dialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              File Already Exists
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              A file with the same name already exists in the presets folder.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Conflict detected
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    File: <span className="font-mono">{decodeName(conflictFilename)}</span>
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Suggested: <span className="font-mono">{decodeName(finalFilename)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleOverwriteConfirm}
                className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Overwrite
              </Button>
              <Button
                onClick={handleNewFilenameConfirm}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Use New Name
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preset Details Modal */}
      <Dialog open={showPresetDetails} onOpenChange={setShowPresetDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              Preset Details
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              View detailed information about this preset
            </p>
          </DialogHeader>

          {selectedPreset && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{selectedPreset.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(selectedPreset.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApplyPreset(selectedPreset)}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Apply Preset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeletePreset(selectedPreset)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Preset Image */}
              {selectedPreset.image_name && (
                <div className="relative w-full max-w-md mx-auto" style={{ paddingBottom: '75%' }}>
                  <img
                    src={`${config.data_url}/cdn-cgi/image/w=600/${userData.id}/presets/${selectedPreset.image_name}`}
                    alt={selectedPreset.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'absolute inset-0 w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg flex items-center justify-center';
                      fallback.innerHTML = `
                        <div class="text-center">
                          <BookOpen class="w-12 h-12 text-amber-500 mx-auto mb-3" />
                          <p class="text-sm text-amber-600 dark:text-amber-400">Preset Image</p>
                        </div>
                      `;
                      target.parentNode?.appendChild(fallback);
                    }}
                  />
                </div>
              )}

              {/* Preset Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Basic Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedPreset.jsonjob?.task && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Task:</span>
                        <span className="text-sm font-medium capitalize">{selectedPreset.jsonjob.task}</span>
                      </div>
                    )}
                    {selectedPreset.jsonjob?.engine && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Engine:</span>
                        <span className="text-sm font-medium">{selectedPreset.jsonjob.engine}</span>
                      </div>
                    )}
                    {selectedPreset.jsonjob?.quality && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quality:</span>
                        <span className="text-sm font-medium">{selectedPreset.jsonjob.quality}</span>
                      </div>
                    )}
                    {selectedPreset.jsonjob?.format && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Format:</span>
                        <span className="text-sm font-medium">{selectedPreset.jsonjob.format}</span>
                      </div>
                    )}
                    {selectedPreset.jsonjob?.number_of_images && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Images:</span>
                        <span className="text-sm font-medium">{selectedPreset.jsonjob.number_of_images}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Model Information */}
                {selectedPreset.jsonjob?.model && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Model Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="text-sm font-medium">
                          {selectedPreset.jsonjob.model.name_first} {selectedPreset.jsonjob.model.name_last}
                        </span>
                      </div>
                      {selectedPreset.jsonjob.model.influencer_type && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Type:</span>
                          <span className="text-sm font-medium capitalize">{selectedPreset.jsonjob.model.influencer_type}</span>
                        </div>
                      )}
                      {selectedPreset.jsonjob.model.age && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Age:</span>
                          <span className="text-sm font-medium">{selectedPreset.jsonjob.model.age}</span>
                        </div>
                      )}
                      {selectedPreset.jsonjob.model.cultural_background && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Background:</span>
                          <span className="text-sm font-medium capitalize">{selectedPreset.jsonjob.model.cultural_background}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Scene Settings */}
                {selectedPreset.jsonjob?.scene && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Scene Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedPreset.jsonjob.scene.framing && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Framing:</span>
                          <span className="text-sm font-medium capitalize">{selectedPreset.jsonjob.scene.framing}</span>
                        </div>
                      )}
                      {selectedPreset.jsonjob.scene.lighting_preset && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Lighting:</span>
                          <span className="text-sm font-medium capitalize">{selectedPreset.jsonjob.scene.lighting_preset}</span>
                        </div>
                      )}
                      {selectedPreset.jsonjob.scene.scene_setting && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Setting:</span>
                          <span className="text-sm font-medium capitalize">{selectedPreset.jsonjob.scene.scene_setting}</span>
                        </div>
                      )}
                      {selectedPreset.jsonjob.scene.pose && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Pose:</span>
                          <span className="text-sm font-medium capitalize">{selectedPreset.jsonjob.scene.pose}</span>
                        </div>
                      )}
                      {selectedPreset.jsonjob.scene.clothes && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Clothes:</span>
                          <span className="text-sm font-medium capitalize">{selectedPreset.jsonjob.scene.clothes}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Generation Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Generation Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedPreset.jsonjob?.guidance && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Guidance:</span>
                        <span className="text-sm font-medium">{selectedPreset.jsonjob.guidance}</span>
                      </div>
                    )}
                    {selectedPreset.jsonjob?.seed && selectedPreset.jsonjob.seed !== -1 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Seed:</span>
                        <span className="text-sm font-medium">{selectedPreset.jsonjob.seed}</span>
                      </div>
                    )}
                    {selectedPreset.jsonjob?.nsfw_strength && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">NSFW Strength:</span>
                        <span className="text-sm font-medium">{selectedPreset.jsonjob.nsfw_strength}</span>
                      </div>
                    )}
                    {selectedPreset.jsonjob?.lora_strength && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">LoRA Strength:</span>
                        <span className="text-sm font-medium">{selectedPreset.jsonjob.lora_strength}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Prompts */}
              {(selectedPreset.jsonjob?.prompt || selectedPreset.jsonjob?.negative_prompt) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pencil className="w-4 h-4" />
                      Prompts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPreset.jsonjob.prompt && (
                      <div>
                        <Label className="text-sm font-medium">Positive Prompt</Label>
                        <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                          {selectedPreset.jsonjob.prompt}
                        </p>
                      </div>
                    )}
                    {selectedPreset.jsonjob.negative_prompt && (
                      <div>
                        <Label className="text-sm font-medium">Negative Prompt</Label>
                        <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                          {selectedPreset.jsonjob.negative_prompt}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PresetsManager Modal */}
      {showPresetsManager && (
        <PresetsManager
          onClose={() => setShowPresetsManager(false)}
          onApplyPreset={(preset) => {
            try {
              const jsonjob = preset.jsonjob;

              // Apply form data
              if (jsonjob.task) setFormData(prev => ({ ...prev, task: jsonjob.task }));
              if (jsonjob.lora !== undefined) setFormData(prev => ({ ...prev, lora: jsonjob.lora }));
              if (jsonjob.noAI !== undefined) setFormData(prev => ({ ...prev, noAI: jsonjob.noAI }));
              if (jsonjob.prompt) {
                setFormData(prev => {
                  const currentPrompt = prev.prompt || '';
                  const presetPrompt = jsonjob.prompt || '';
                  
                  // Merge the prompts: current prompt + preset prompt
                  const mergedPrompt = currentPrompt.trim() 
                    ? `${currentPrompt.trim()}, ${presetPrompt.trim()}`
                    : presetPrompt.trim();
                  
                  return { ...prev, prompt: mergedPrompt };
                });
              }
              if (jsonjob.negative_prompt) setFormData(prev => ({ ...prev, negative_prompt: jsonjob.negative_prompt }));
              if (jsonjob.nsfw_strength !== undefined) setFormData(prev => ({ ...prev, nsfw_strength: jsonjob.nsfw_strength }));
              if (jsonjob.lora_strength !== undefined) setFormData(prev => ({ ...prev, lora_strength: jsonjob.lora_strength }));
              if (jsonjob.quality) setFormData(prev => ({ ...prev, quality: jsonjob.quality }));
              if (jsonjob.seed !== undefined) setFormData(prev => ({ ...prev, seed: jsonjob.seed.toString() }));
              if (jsonjob.guidance !== undefined) setFormData(prev => ({ ...prev, guidance: jsonjob.guidance }));
              if (jsonjob.number_of_images !== undefined) setFormData(prev => ({ ...prev, numberOfImages: jsonjob.number_of_images }));
              if (jsonjob.format) setFormData(prev => ({ ...prev, format: jsonjob.format }));
              if (jsonjob.engine) setFormData(prev => ({ ...prev, engine: jsonjob.engine }));
              // if (jsonjob.usePromptOnly !== undefined) setFormData(prev => ({ ...prev, usePromptOnly: jsonjob.usePromptOnly }));

              // Apply scene specifications
              if (jsonjob.scene) {
                setSceneSpecs({
                  framing: jsonjob.scene.framing || '',
                  rotation: jsonjob.scene.rotation || '',
                  lighting_preset: jsonjob.scene.lighting_preset || '',
                  scene_setting: jsonjob.scene.scene_setting || '',
                  pose: jsonjob.scene.pose || '',
                  clothes: jsonjob.scene.clothes || ''
                });
              }

              // Apply model data if available - DISABLED to prevent changing influencer information
              // if (jsonjob.model && jsonjob.model.id) {
              //   // Find the influencer with the matching ID
              //   const selectedInfluencer = influencers.find(inf => inf.id === jsonjob.model.id);

              //   if (selectedInfluencer) {
              //     // Set the model data to the found influencer
              //     setModelData(selectedInfluencer);

              //     // Update model description with influencer data
              //     setModelDescription({
              //       appearance: `${selectedInfluencer.name_first} ${selectedInfluencer.name_last}, ${selectedInfluencer.age || ''}`,
              //       culturalBackground: selectedInfluencer.cultural_background || '',
              //       bodyType: selectedInfluencer.body_type || '',
              //       facialFeatures: selectedInfluencer.facial_features || '',
              //       hairColor: selectedInfluencer.hair_color || '',
              //       hairLength: selectedInfluencer.hair_length || '',
              //       hairStyle: selectedInfluencer.hair_style || '',
              //       skin: selectedInfluencer.skin_tone || '',
              //       lips: selectedInfluencer.lip_style || '',
              //       eyes: selectedInfluencer.eye_color || '',
              //       nose: selectedInfluencer.nose_style || '',
              //       makeup: jsonjob.model.makeup_style || 'Natural / No-Makeup Look',
              //       clothing: `${selectedInfluencer.clothing_style_everyday || ''} ${selectedInfluencer.clothing_style_occasional || ''}`.trim(),
              //       sex: selectedInfluencer.sex || '',
              //       bust: selectedInfluencer.bust_size || '',
              //       eyebrowStyle: selectedInfluencer.eyebrow_style || '',
              //       faceShape: selectedInfluencer.face_shape || '',
              //       colorPalette: selectedInfluencer.color_palette ? selectedInfluencer.color_palette.join(', ') : '',
              //       age: selectedInfluencer.age || '',
              //       lifestyle: selectedInfluencer.lifestyle || ''
              //     });

              //     // Generate the model description automatically
              //     const parts = [];
              //     if (selectedInfluencer.name_first && selectedInfluencer.name_last) {
              //       parts.push(`${selectedInfluencer.name_first} ${selectedInfluencer.name_last}`);
              //     }
              //     if (selectedInfluencer.age) parts.push(selectedInfluencer.age);
              //     if (selectedInfluencer.lifestyle) parts.push(selectedInfluencer.lifestyle);
              //     if (selectedInfluencer.cultural_background) parts.push(`Cultural background: ${selectedInfluencer.cultural_background}`);
              //     if (selectedInfluencer.body_type) parts.push(`Body type: ${selectedInfluencer.body_type}`);
              //     if (selectedInfluencer.facial_features) parts.push(`Facial features: ${selectedInfluencer.facial_features}`);
              //     if (selectedInfluencer.hair_color && selectedInfluencer.hair_length && selectedInfluencer.hair_style) {
              //       parts.push(`${selectedInfluencer.hair_length} ${selectedInfluencer.hair_color} hair, ${selectedInfluencer.hair_style} style`);
              //     }
              //     if (selectedInfluencer.skin_tone) parts.push(`Skin: ${selectedInfluencer.skin_tone}`);
              //     if (selectedInfluencer.lip_style) parts.push(`Lips: ${selectedInfluencer.lip_style}`);
              //     if (selectedInfluencer.eye_color) parts.push(`Eyes: ${selectedInfluencer.eye_color}`);
              //     if (selectedInfluencer.nose_style) parts.push(`Nose: ${selectedInfluencer.nose_style}`);
              //     if (jsonjob.model.makeup_style) parts.push(`Makeup: ${jsonjob.model.makeup_style}`);
              //     if (selectedInfluencer.clothing_style_everyday || selectedInfluencer.clothing_style_occasional) {
              //       parts.push(`Clothing: ${selectedInfluencer.clothing_style_everyday || ''} ${selectedInfluencer.clothing_style_occasional || ''}`.trim());
              //     }

              //     const fullDescription = parts.join(', ');
              //     setFormData(prev => ({
              //       ...prev,
              //       model: fullDescription,
              //       prompt: selectedInfluencer.prompt || jsonjob.prompt || ''
              //     }));
              //   } else {
              //     // If influencer not found, use the model data from preset
              //     setModelData(jsonjob.model);
              //     // Update model description with makeup style
              //     if (jsonjob.model.makeup_style) {
              //       setModelDescription(prev => ({
              //         ...prev,
              //         makeup: jsonjob.model.makeup_style
              //       }));
              //     }
              //   }
              // } else if (jsonjob.model) {
              //   // If no model.id but model data exists, use it directly
              //   setModelData(jsonjob.model);
              //   // Update model description with makeup style
              //   if (jsonjob.model.makeup_style) {
              //     setModelDescription(prev => ({
              //       ...prev,
              //       makeup: jsonjob.model.makeup_style
              //     }));
              //   }
              // }

              toast.success(`Preset "${preset.name}" applied successfully`);
              setShowPresetsManager(false);
            } catch (error) {
              console.error('Error applying preset:', error);
              toast.error('Failed to apply preset');
            }
          }}
        />
      )}

      {/* Status Bar Edit Popup */}
      {statusEditPopup.isOpen && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-5 min-w-[320px] max-w-[360px] backdrop-blur-sm"
          style={{
            left: `${statusEditPopup.position.x}px`,
            top: `${statusEditPopup.position.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-500" />
                Edit {statusEditPopup.field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusEditPopup(prev => ({ ...prev, isOpen: false }))}
                className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {statusEditPopup.fieldType === 'boolean' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</Label>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {statusEditPopup.currentValue ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Switch
                    checked={statusEditPopup.currentValue}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        [statusEditPopup.field]: checked
                      }));
                      setStatusEditPopup(prev => ({ ...prev, isOpen: false }));
                    }}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500 data-[state=unchecked]:bg-slate-200 data-[state=unchecked]:dark:bg-slate-700"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {statusEditPopup.currentValue ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            )}

            {statusEditPopup.fieldType === 'slider' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {statusEditPopup.field === 'numberOfImages' && 'Number of Images'}
                    {statusEditPopup.field === 'guidance' && 'Guidance Scale'}
                    {statusEditPopup.field === 'lora_strength' && 'LORA Strength'}
                    {statusEditPopup.field === 'nsfw_strength' && 'NSFW Strength'}
                  </Label>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {statusEditPopup.currentValue}
                  </div>
                </div>

                <div className="space-y-3">
                  <Slider
                    value={[statusEditPopup.currentValue]}
                    onValueChange={([value]) => {
                      setStatusEditPopup(prev => ({ ...prev, currentValue: value }));
                    }}
                    onValueCommit={([value]) => {
                      setFormData(prev => ({
                        ...prev,
                        [statusEditPopup.field]: value
                      }));
                      setStatusEditPopup(prev => ({ ...prev, isOpen: false }));
                    }}
                    max={
                      statusEditPopup.field === 'numberOfImages' ? 20 :
                        statusEditPopup.field === 'guidance' ? 8.0 :
                          statusEditPopup.field === 'lora_strength' ? 1.5 :
                            statusEditPopup.field === 'nsfw_strength' ? 1 : 10
                    }
                    min={
                      statusEditPopup.field === 'numberOfImages' ? 1 :
                        statusEditPopup.field === 'guidance' ? 1.0 :
                          statusEditPopup.field === 'lora_strength' ? -0.5 :
                            statusEditPopup.field === 'nsfw_strength' ? -1 : 0
                    }
                    step={
                      statusEditPopup.field === 'guidance' ? 0.1 :
                        statusEditPopup.field === 'lora_strength' ? 0.1 :
                          statusEditPopup.field === 'nsfw_strength' ? 0.1 : 1
                    }
                    className="w-full"
                  />

                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    {statusEditPopup.field === 'numberOfImages' && (
                      <>
                        <span className="font-medium">1</span>
                        <span className="font-medium">20</span>
                      </>
                    )}
                    {statusEditPopup.field === 'guidance' && (
                      <>
                        <span className="font-medium">1.0</span>
                        <span className="font-medium">8.0</span>
                      </>
                    )}
                    {statusEditPopup.field === 'lora_strength' && (
                      <>
                        <span className="font-medium">Weak (-0.5)</span>
                        <span className="font-medium">Strong (+1.5)</span>
                      </>
                    )}
                    {statusEditPopup.field === 'nsfw_strength' && (
                      <>
                        <span className="font-medium">SFW (-1)</span>
                        <span className="font-medium">NSFW (+1)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {statusEditPopup.fieldType === 'number' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Value</Label>
                <Input
                  type="number"
                  value={statusEditPopup.currentValue}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      setStatusEditPopup(prev => ({ ...prev, currentValue: value }));
                    }
                  }}
                  className="w-full h-8 text-sm"
                  step={statusEditPopup.field === 'guidance' ? 0.1 : 1}
                  min={statusEditPopup.field === 'numberOfImages' ? 1 : statusEditPopup.field === 'guidance' ? 1.0 : 0}
                  max={statusEditPopup.field === 'numberOfImages' ? 20 : statusEditPopup.field === 'guidance' ? 8.0 : 10}
                />
                {statusEditPopup.field === 'guidance' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Range: 1.0 - 8.0 (Recommended: 3.5)
                  </p>
                )}
                {statusEditPopup.field === 'numberOfImages' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Range: 1 - 20 images
                  </p>
                )}
                {statusEditPopup.field === 'lora_strength' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Range: 0.0 - 2.0 (Recommended: 1.0)
                  </p>
                )}
              </div>
            )}

            {statusEditPopup.fieldType === 'text' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Value</Label>
                <Input
                  type="text"
                  value={statusEditPopup.currentValue}
                  onChange={(e) => setStatusEditPopup(prev => ({ ...prev, currentValue: e.target.value }))}
                  className="w-full h-8 text-sm"
                  placeholder={`Enter ${statusEditPopup.field.toLowerCase()}`}
                />
              </div>
            )}

            {statusEditPopup.fieldType === 'select' && statusEditPopup.options && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Option</Label>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {statusEditPopup.currentValue}
                  </div>
                </div>
                <Select
                  value={statusEditPopup.currentValue}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      [statusEditPopup.field]: value
                    }));
                    setStatusEditPopup(prev => ({ ...prev, isOpen: false }));
                  }}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusEditPopup.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zoom Modal for Generated Images */}
      <DialogZoom open={fullSizeImageModal.isOpen} onOpenChange={() => setFullSizeImageModal({ isOpen: false, imageUrl: '', imageName: '' })}>
        <DialogContentZoom className="max-w-90vw] max-h-[900overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={fullSizeImageModal.imageUrl}
              alt={fullSizeImageModal.imageName}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </DialogContentZoom>
      </DialogZoom>

      {/* Share Modal */}
      <Dialog open={shareModal.open} onOpenChange={() => setShareModal({ open: false, itemId: null, itemPath: null })}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Share Content</h3>
              <p className="text-sm text-muted-foreground">Choose how you'd like to share this content</p>
            </div>

            {shareModal.itemId && (
              <>
                {/* Copy Link Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Direct Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${config.data_url}/${userData.id}/${shareModal.itemPath}/${shareModal.itemId}`}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${config.data_url}/${userData.id}/${shareModal.itemPath}/${shareModal.itemId}`)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">QR Code</Label>
                  <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg border">
                    {qrCodeDataUrl ? (
                      <>
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code" 
                          className="w-32 h-32 border border-gray-200 rounded-lg"
                        />
                        <div className="text-xs text-gray-600 text-center">
                          Scan to access content directly
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = qrCodeDataUrl;
                            link.download = 'qr-code.png';
                            link.click();
                          }}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download QR Code
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center w-32 h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Share on Social Media</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMedia('twitter', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMedia('facebook', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMedia('linkedin', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMedia('pinterest', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                      </svg>
                      Pinterest
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showHistory && <HistoryCard userId={userData.id} />}

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showGemWarning}
        onClose={() => setShowGemWarning(false)}
        onConfirm={proceedWithGeneration}
        gemCostData={gemCostData}
        userCredits={userData.credits}
        isProcessing={isGenerating}
        processingText="Generating..."
        numberOfItems={formData.numberOfImages}
        itemType="image"
      />
    </div>
  );
}

export default ContentCreateImage;
