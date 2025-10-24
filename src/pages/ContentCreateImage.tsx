import { CreditConfirmationModal } from "@/components/CreditConfirmationModal";
import HistoryCard from "@/components/HistoryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import VaultSelector from "@/components/VaultSelector";
import config from "@/config/config";
import { useDebounce } from "@/hooks/useDebounce";
import { cleanImageUrl, cn } from "@/lib/utils";
import {
  Influencer,
  setError,
  setInfluencers,
  setLoading,
} from "@/store/slices/influencersSlice";
import { RootState } from "@/store/store";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  BookOpen,
  Brain,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Edit,
  Edit3,
  Eye,
  Filter,
  Folder,
  FolderOpen,
  Heart,
  History,
  ImageIcon,
  Info,
  Loader2,
  Monitor,
  Palette,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Share,
  Shirt,
  Sparkles,
  Star,
  Sun,
  Target,
  Trash2,
  Upload,
  User,
  Users,
  Wand2,
  X,
  Zap,
  ZoomIn,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "name", label: "Name" },
  { id: "age_lifestyle", label: "Age/Lifestyle" },
  { id: "influencer_type", label: "Type" },
];

interface ComponentPickerItem {
  id: string;
  label: string;
  description: string;
  image: string;
  category: string;
}

interface ImageSettings {
  format: string;
  images: number;
  promptAdherence: number;
  engine: string;
  nsfwStrength: number;
  seed: string;
}

interface LoraSettings {
  influencerConsistency: boolean;
  influencerStrength: number;
  optionalLora1: string;
  optionalLora1Strength: number;
  optionalLora2: string;
  optionalLora2Strength: number;
}

interface ComponentPickerState {
  scene: ComponentPickerItem | null;
  pose: ComponentPickerItem | null;
  outfit: ComponentPickerItem | null;
  framing: ComponentPickerItem | null;
  lighting: ComponentPickerItem | null;
  rotation: ComponentPickerItem | null;
  makeup: ComponentPickerItem | null;
  accessory: ComponentPickerItem | null;
}

function ContentCreateImageNew() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const userData = useSelector((state: RootState) => state.user);
  const influencers = useSelector(
    (state: RootState) => state.influencers.influencers
  );

  // Core states
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelData, setModelData] = useState<Influencer | null>(null);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [generatedTaskIds, setGeneratedTaskIds] = useState<string[]>([]);
  const [isLoadingGeneratedImages, setIsLoadingGeneratedImages] =
    useState(false);
  const [showInspirationHub, setShowInspirationHub] = useState(false);
  const [showInfluencerDialog, setShowInfluencerDialog] = useState(false);
  const [influencerDialogData, setInfluencerDialogData] = useState<{
    templateName: string;
    influencerName: string;
  } | null>(null);

  // Modal states for generated images
  const [zoomModal, setZoomModal] = useState<{
    open: boolean;
    imageUrl: string;
    imageName: string;
  }>({ open: false, imageUrl: "", imageName: "" });
  const [imageInfoModal, setImageInfoModal] = useState<{
    open: boolean;
    image: any;
  }>({ open: false, image: null });
  const [editingImageData, setEditingImageData] = useState<any>(null);
  const [tempRating, setTempRating] = useState(0);
  const [newTag, setNewTag] = useState("");

  // Modal for failed image details
  const [failedImageModal, setFailedImageModal] = useState<{
    open: boolean;
    taskId: string;
    userNotes: string;
  }>({ open: false, taskId: "", userNotes: "" });

  // Placeholder images for immediate display during generation
  const [placeholderImages, setPlaceholderImages] = useState<any[]>([]);
  const [failedTasks, setFailedTasks] = useState<Set<string>>(new Set());
  const [regeneratingImages, setRegeneratingImages] = useState<Set<string>>(
    new Set()
  );

  // Preset management states
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showPresetBrowserModal, setShowPresetBrowserModal] = useState(false);
  const [presetData, setPresetData] = useState({
    name: "",
    description: "",
    mainFolder: "",
    subFolder: "",
    subSubFolder: "",
    rating: 0,
    favorite: false,
    tags: [] as string[],
    selectedImage: null as string | null,
  });
  const [existingFolders, setExistingFolders] = useState({
    mainFolders: [] as string[],
    subFolders: [] as string[],
    subSubFolders: [] as string[],
  });
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [availablePresets, setAvailablePresets] = useState<any[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any>(null);
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [browseFolderView, setBrowseFolderView] = useState<
    "folders" | "details"
  >("folders");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFolderPresets, setSelectedFolderPresets] = useState<any[]>([]);
  const [currentFolderPath, setCurrentFolderPath] = useState<string[]>([]);
  const [folderHierarchy, setFolderHierarchy] = useState<any>({});

  // Inspiration Hub states
  const [templatePresets, setTemplatePresets] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [selectedTemplateCategory, setSelectedTemplateCategory] =
    useState<string>("all");
  const [selectedTemplateTag, setSelectedTemplateTag] = useState<string>("all");
  const [templateFolderView, setTemplateFolderView] = useState<
    "folders" | "details"
  >("folders");
  const [selectedTemplateFolder, setSelectedTemplateFolder] = useState<
    string | null
  >(null);
  const [selectedTemplateFolderPresets, setSelectedTemplateFolderPresets] =
    useState<any[]>([]);
  const [currentTemplateFolderPath, setCurrentTemplateFolderPath] = useState<
    string[]
  >([]);
  const [featuredTemplateIndex, setFeaturedTemplateIndex] = useState(0);

  // Get location for state data
  const reactLocation = useLocation();

  // Load regeneration data from location.state only
  useEffect(() => {
    const regenerateData = reactLocation.state?.regenerateData;
    if (!regenerateData) return;

    // Set prompt
    if (regenerateData.prompt) {
      setPrompt(regenerateData.prompt);
    }

    // Load influencer
    if (regenerateData.influencer_id && influencers.length > 0) {
      const influencer = influencers.find(
        (inf) => inf.id.toString() === regenerateData.influencer_id
      );
      if (influencer) {
        setModelData(influencer);
      }
    }

    // Load settings
    if (regenerateData.format) {
      setImageSettings((prev) => ({ ...prev, format: regenerateData.format }));
    }
    if (regenerateData.engine) {
      setImageSettings((prev) => ({ ...prev, engine: regenerateData.engine }));
    }
    if (regenerateData.guidance) {
      setImageSettings((prev) => ({
        ...prev,
        promptAdherence: parseFloat(regenerateData.guidance.toString()),
      }));
    }
    if (regenerateData.number_of_images) {
      setImageSettings((prev) => ({
        ...prev,
        images: parseInt(regenerateData.number_of_images.toString()),
      }));
    }
    if (regenerateData.lora_strength) {
      setLoraSettings((prev) => ({
        ...prev,
        influencerStrength: parseFloat(regenerateData.lora_strength.toString()),
      }));
    }

    toast.success("Regeneration loaded");
  }, [reactLocation.state, influencers]);

  // Handle influencer selection from URL query parameter
  useEffect(() => {
    const influencerId = searchParams.get("influencer");
    if (influencerId && influencers.length > 0) {
      const influencer = influencers.find(
        (inf) => inf.id.toString() === influencerId
      );
      if (influencer) {
        setModelData(influencer);
        console.log(
          "Automatically selected influencer from URL:",
          influencer.name_first,
          influencer.name_last
        );
        toast.success(
          `Automatically selected: ${influencer.name_first} ${influencer.name_last}`
        );
      } else {
        // Influencer ID from URL not found in the list
        console.warn(
          `Influencer with ID ${influencerId} not found in the list`
        );
        toast.error(
          `Influencer not found. Please select a different influencer.`
        );
      }
    }
  }, [searchParams, influencers]);

  // Component picker restoration will be handled after options are loaded

  // Separate effect to monitor prompt state changes
  useEffect(() => {
    console.log("Prompt state changed to:", prompt);
  }, [prompt]);

  // File management states
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [fileContextMenu, setFileContextMenu] = useState<{
    x: number;
    y: number;
    image: any;
  } | null>(null);
  const [shareModal, setShareModal] = useState<{
    open: boolean;
    itemId: string | null;
    itemPath: string | null;
  }>({ open: false, itemId: null, itemPath: null });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [fullSizeImageModal, setFullSizeImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageName: string;
  }>({
    isOpen: false,
    imageUrl: "",
    imageName: "",
  });
  const [showHistory, setShowHistory] = useState(false);

  // LoRA Training Modal state
  const [showLoraTrainingModal, setShowLoraTrainingModal] = useState(false);

  // Influencer selection states
  const [showInfluencerSelector, setShowInfluencerSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSearchField, setSelectedSearchField] = useState(
    SEARCH_FIELDS[0]
  );
  const [openFilter, setOpenFilter] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Format labels mapping for display
  const formatLabels: Record<string, string> = {
    "1:1": "Square 1:1",
    "4:5": "Portrait 4:5",
    "3:4": "Portrait 3:4",
    "9:16": "Portrait 9:16",
    "16:9": "Landscape 16:9",
    "5:4": "Landscape 5:4",
    "4:3": "Landscape 4:3",
  };
  // Settings states
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    format: "1:1",
    images: 1,
    promptAdherence: 3.5,
    engine: "Nymia General",
    nsfwStrength: 0,
    seed: "",
  });

  const [loraSettings, setLoraSettings] = useState<LoraSettings>({
    influencerConsistency: true,
    influencerStrength: 0.8,
    optionalLora1: "nymia default",
    optionalLora1Strength: 0.3,
    optionalLora2: "Realism",
    optionalLora2Strength: 1.0,
  });

  const [componentPicker, setComponentPicker] = useState<ComponentPickerState>({
    scene: null,
    pose: null,
    outfit: null,
    framing: null,
    lighting: null,
    rotation: null,
    makeup: null,
    accessory: null,
  });

  // UI states
  const [isComponentPickerOpen, setIsComponentPickerOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isAiConsistencyOpen, setIsAiConsistencyOpen] = useState(false);
  const [isInfluencerOpen, setIsInfluencerOpen] = useState(true);
  const [selectedComponentCategory, setSelectedComponentCategory] = useState<
    string | null
  >(null);
  const [currentFolder, setCurrentFolder] = useState<any | null>(null);
  const [componentSearchTerm, setComponentSearchTerm] = useState<string>("");

  // Individual folder paths for each component category
  const [componentFolderPaths, setComponentFolderPaths] = useState<{}>({
    scene: [],
    pose: [],
    outfit: [],
    framing: [],
    lighting: [],
    rotation: [],
    makeup: [],
    accessory: [],
  });

  // Function to open component picker with category-specific folder restoration
  const openComponentPicker = (categoryKey: string) => {
    setSelectedComponentCategory(categoryKey);

    // Restore saved folder path for this category if it exists
    const savedPath = componentFolderPaths[categoryKey];
    if (savedPath && savedPath.length > 0) {
      // Restore folder navigation state for this category
      // This would restore the folder hierarchy navigation
      console.log(`Restoring folder path for ${categoryKey}:`, savedPath);

      // For now, we'll reset to root since the folder navigation structure
      // needs more complex restoration logic
      setCurrentFolder(null);
    } else {
      // Start fresh for this category
      setCurrentFolder(null);
    }
  };
  const [editingSetting, setEditingSetting] = useState<{
    type: string;
    field: string;
    value: any;
    inputType: string;
    options?: any[];
  } | null>(null);

  // Credit system states
  const [gemCostData, setGemCostData] = useState<{
    id: number;
    item: string;
    description: string;
    gems: number;
    originalGemsPerImage?: number;
  } | null>(null);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);

  // API Options states
  const [sceneOptions, setSceneOptions] = useState<any[]>([]);
  const [poseOptions, setPoseOptions] = useState<any[]>([]);
  const [outfitOptions, setOutfitOptions] = useState<any[]>([]);
  const [framingOptions, setFramingOptions] = useState<any[]>([]);
  const [lightingOptions, setLightingOptions] = useState<any[]>([]);
  const [rotationOptions, setRotationOptions] = useState<any[]>([]);
  const [makeupOptions, setMakeupOptions] = useState<any[]>([]);
  const [accessoriesOptions, setAccessoriesOptions] = useState<any[]>([]);
  const [engineOptions, setEngineOptions] = useState<any[]>([]);
  const [formatOptions, setFormatOptions] = useState<any[]>([]);

  // Categorized options for dropdowns
  const [sceneCategories, setSceneCategories] = useState<any[]>([]);
  const [poseCategories, setPoseCategories] = useState<any[]>([]);
  const [outfitCategories, setOutfitCategories] = useState<any[]>([]);
  const [systemLoraOptions, setSystemLoraOptions] = useState<any[]>([]);

  // Filtered influencers for search
  const filteredInfluencers =
    influencers?.filter((influencer) => {
      if (!debouncedSearchTerm) return true;

      const searchLower = debouncedSearchTerm.toLowerCase();

      switch (selectedSearchField?.id) {
        case "name":
          return `${influencer.name_first} ${influencer.name_last}`
            .toLowerCase()
            .includes(searchLower);
        case "age_lifestyle":
          return influencer.age_lifestyle?.toLowerCase().includes(searchLower);
        case "influencer_type":
          return influencer.influencer_type
            ?.toLowerCase()
            .includes(searchLower);
        case "all":
        default:
          return (
            `${influencer.name_first} ${influencer.name_last}`
              .toLowerCase()
              .includes(searchLower) ||
            influencer.age_lifestyle?.toLowerCase().includes(searchLower) ||
            influencer.influencer_type?.toLowerCase().includes(searchLower)
          );
      }
    }) || [];

  // Handler functions
  const handleUseInfluencer = (influencer: Influencer) => {
    applyInfluencerWithLoraLogic(influencer);
    setShowInfluencerSelector(false);

    // Show appropriate toast message
    if (influencer.lorastatus === 2) {
      toast.success(
        `Using ${influencer.name_first} ${influencer.name_last} for content generation - AI Consistency enabled`
      );
    } else {
      toast.success(
        `Using ${influencer.name_first} ${influencer.name_last} for content generation - AI Training required for consistency`
      );
    }
  };

  // Helper function to apply LoRA status logic when setting modelData
  const applyInfluencerWithLoraLogic = (influencer: Influencer | null) => {
    setModelData(influencer);

    if (influencer) {
      // Check LoRA status and adjust AI Consistency settings accordingly
      if (influencer.lorastatus === 2) {
        // LoRA is trained - enable AI Consistency and set strength to 0.8
        setLoraSettings((prev) => ({
          ...prev,
          influencerConsistency: true,
          influencerStrength: 0.8,
        }));
      } else {
        // LoRA is not trained - disable AI Consistency
        setLoraSettings((prev) => ({
          ...prev,
          influencerConsistency: false,
        }));
      }
    }
  };

  // Handler for AI Consistency Switch - check LoRA status
  const handleInfluencerConsistencyToggle = (checked: boolean) => {
    if (checked && modelData && modelData.lorastatus !== 2) {
      // User wants to enable AI Consistency but LoRA is not trained
      setShowLoraTrainingModal(true);
      return; // Don't change the switch state
    }

    // Safe to toggle
    setLoraSettings((prev) => ({ ...prev, influencerConsistency: checked }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
  };

  // API Loading Effects
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch(
          `${config.supabase_server_url}/influencer?user_id=eq.${userData.id}`,
          {
            headers: {
              Authorization: "Bearer WeInfl3nc3withAI",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch influencers");
        }

        const data = await response.json();
        dispatch(setInfluencers(data));
      } catch (error) {
        console.error("Error fetching influencers:", error);
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (userData.id) {
      fetchInfluencers().catch(console.error);
    }
  }, [userData.id, dispatch]);

  useEffect(() => {
    const fetchSceneOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/folderedfieldoptions?fieldtype=scene`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const text = await response.text();
          if (text.trim()) {
            const data = JSON.parse(text);
            if (data?.fieldoptions && Array.isArray(data.fieldoptions)) {
              setSceneCategories(data.fieldoptions);
              const flatOptions = data.fieldoptions.flatMap(
                (category: any) =>
                  category.data?.map((scene: any) => ({
                    label: scene.label,
                    image: scene.image,
                    description: scene.description,
                  })) || []
              );
              setSceneOptions(flatOptions);
            } else {
              setSceneOptions([]);
              setSceneCategories([]);
            }
          } else {
            setSceneOptions([]);
            setSceneCategories([]);
          }
        } else {
          setSceneOptions([]);
          setSceneCategories([]);
        }
      } catch (error) {
        console.error("Error fetching scene options:", error);
        setSceneOptions([]);
        setSceneCategories([]);
      }
    };

    fetchSceneOptions().catch((error) => {
      console.error("Unhandled scene fetch error:", error);
    });
  }, []);

  useEffect(() => {
    const fetchPoseOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/folderedfieldoptions?fieldtype=pose`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const text = await response.text();
          if (text.trim()) {
            const data = JSON.parse(text);
            if (data?.fieldoptions && Array.isArray(data.fieldoptions)) {
              setPoseCategories(data.fieldoptions);
              const flatOptions = data.fieldoptions.flatMap(
                (category: any) =>
                  category.data?.map((pose: any) => ({
                    label: pose.label,
                    image: pose.image,
                    description: pose.description,
                  })) || []
              );
              setPoseOptions(flatOptions);
            } else {
              setPoseOptions([]);
              setPoseCategories([]);
            }
          } else {
            setPoseOptions([]);
            setPoseCategories([]);
          }
        } else {
          setPoseOptions([]);
          setPoseCategories([]);
        }
      } catch (error) {
        console.error("Error fetching pose options:", error);
        setPoseOptions([]);
        setPoseCategories([]);
      }
    };

    fetchPoseOptions().catch((error) => {
      console.error("Unhandled pose fetch error:", error);
    });
  }, []);

  useEffect(() => {
    const fetchOutfitOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/folderedfieldoptions?fieldtype=outfit`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const text = await response.text();
          if (text.trim()) {
            const data = JSON.parse(text);
            if (data?.fieldoptions && Array.isArray(data.fieldoptions)) {
              setOutfitCategories(data.fieldoptions);
              const flatOptions = data.fieldoptions.flatMap(
                (category: any) =>
                  category.data?.map((outfit: any) => ({
                    label: outfit.label,
                    image: outfit.image,
                    description: outfit.description,
                  })) || []
              );
              setOutfitOptions(flatOptions);
            } else {
              setOutfitOptions([]);
              setOutfitCategories([]);
            }
          } else {
            setOutfitOptions([]);
            setOutfitCategories([]);
          }
        } else {
          setOutfitOptions([]);
          setOutfitCategories([]);
        }
      } catch (error) {
        console.error("Error fetching outfit options:", error);
        setOutfitOptions([]);
        setOutfitCategories([]);
      }
    };

    fetchOutfitOptions().catch((error) => {
      console.error("Unhandled outfit fetch error:", error);
    });
  }, []);

  useEffect(() => {
    const fetchEngineOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/fieldoptions?fieldtype=engine`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.fieldoptions) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description,
            }));
            setEngineOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching engine options:", error);
        setEngineOptions([]);
      }
    };
    fetchEngineOptions().catch(console.error);
  }, []);
  useEffect(() => {
    const fetchFormatOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/fieldoptions?fieldtype=format`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.fieldoptions) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              value: item.value || item.label,
              image: item.image,
              description: item.description,
            }));
            setFormatOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching format options:", error);
        setFormatOptions([]);
      }
    };
    fetchFormatOptions().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchFramingOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/promptoptions?fieldtype=framing`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.fieldoptions) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description,
            }));
            setFramingOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching framing options:", error);
        setFramingOptions([]);
      }
    };
    fetchFramingOptions().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchLightingOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/promptoptions?fieldtype=lighting_preset`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const text = await response.text();
          if (text.trim()) {
            const data = JSON.parse(text);
            if (data?.fieldoptions && Array.isArray(data.fieldoptions)) {
              const options = data.fieldoptions.map((item: any) => ({
                label: item.label,
                image: item.image,
                description: item.description,
              }));
              setLightingOptions(options);
            } else {
              setLightingOptions([]);
            }
          } else {
            setLightingOptions([]);
          }
        } else {
          setLightingOptions([]);
        }
      } catch (error) {
        console.error("Error fetching lighting options:", error);
        setLightingOptions([]);
      }
    };

    fetchLightingOptions().catch((error) => {
      console.error("Unhandled lighting fetch error:", error);
    });
  }, []);

  useEffect(() => {
    const fetchRotationOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/promptoptions?fieldtype=rotation`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.fieldoptions) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description,
            }));
            setRotationOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching rotation options:", error);
        setRotationOptions([]);
      }
    };
    fetchRotationOptions().catch(console.error);
  }, []);

  // Component picker restoration effect (runs after options are loaded)
  useEffect(() => {
    const regenerateData = reactLocation.state?.regenerateData;
    if (!regenerateData?.scene) return;
    if (sceneOptions.length === 0) return; // Wait for options to load

    const newComponentPicker: ComponentPickerState = {
      scene: null,
      pose: null,
      outfit: null,
      framing: null,
      lighting: null,
      rotation: null,
      makeup: null,
      accessory: null,
    };

    const scene = regenerateData.scene;
    if (scene.scene_setting && sceneOptions.length > 0) {
      const match = sceneOptions.find(
        (opt) => opt.label === scene.scene_setting
      );
      if (match) newComponentPicker.scene = match;
    }
    if (scene.pose && poseOptions.length > 0) {
      const match = poseOptions.find((opt) => opt.label === scene.pose);
      if (match) newComponentPicker.pose = match;
    }
    if (scene.clothes && outfitOptions.length > 0) {
      const match = outfitOptions.find((opt) => opt.label === scene.clothes);
      if (match) newComponentPicker.outfit = match;
    }
    if (scene.framing && framingOptions.length > 0) {
      const match = framingOptions.find((opt) => opt.label === scene.framing);
      if (match) newComponentPicker.framing = match;
    }
    if (scene.lighting_preset && lightingOptions.length > 0) {
      const match = lightingOptions.find(
        (opt) => opt.label === scene.lighting_preset
      );
      if (match) newComponentPicker.lighting = match;
    }
    if (scene.rotation && rotationOptions.length > 0) {
      const match = rotationOptions.find((opt) => opt.label === scene.rotation);
      if (match) newComponentPicker.rotation = match;
    }
    if (scene.makeup_style && makeupOptions.length > 0) {
      const match = makeupOptions.find(
        (opt) => opt.label === scene.makeup_style
      );
      if (match) newComponentPicker.makeup = match;
    }
    if (scene.accessories && accessoriesOptions.length > 0) {
      const match = accessoriesOptions.find(
        (opt) => opt.label === scene.accessories
      );
      if (match) newComponentPicker.accessory = match;
    }

    setComponentPicker(newComponentPicker);
  }, [
    reactLocation.state,
    sceneOptions,
    poseOptions,
    outfitOptions,
    framingOptions,
    lightingOptions,
    rotationOptions,
    makeupOptions,
    accessoriesOptions,
  ]);

  useEffect(() => {
    const fetchMakeupOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/fieldoptions?fieldtype=makeup`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.fieldoptions) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description,
            }));
            setMakeupOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching makeup options:", error);
        setMakeupOptions([]);
      }
    };
    fetchMakeupOptions().catch(console.error);
  }, []);

  // Fetch system LoRA options
  useEffect(() => {
    const fetchSystemLoraOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/fieldoptions?fieldtype=system_lora`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.fieldoptions) {
            setSystemLoraOptions(data.fieldoptions);
          }
        }
      } catch (error) {
        console.error("Error fetching system LoRA options:", error);
        setSystemLoraOptions([]);
      }
    };
    fetchSystemLoraOptions().catch(console.error);
  }, []);

  // Set default LORA values after systemLoraOptions are loaded
  useEffect(() => {
    if (systemLoraOptions.length > 0) {
      // Only set defaults if currently 'none' or initial values
      setLoraSettings((prev) => {
        let updates: any = {};

        // Set First Optional Lora to nymia default if available
        if (
          (prev.optionalLora1 === "none" ||
            prev.optionalLora1 === "nymia default") &&
          systemLoraOptions.find((lora) => lora.label === "nymia default")
        ) {
          updates.optionalLora1 = "nymia default";
          updates.optionalLora1Strength = 0.3;
        }

        // Set Second Optional Lora to Realism if available
        if (
          (prev.optionalLora2 === "none" || prev.optionalLora2 === "Realism") &&
          systemLoraOptions.find((lora) => lora.label === "Realism")
        ) {
          updates.optionalLora2 = "Realism";
          updates.optionalLora2Strength = 1.0;
        }

        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [systemLoraOptions]);

  // Fetch accessories options
  useEffect(() => {
    const fetchAccessoriesOptions = async () => {
      try {
        const response = await fetch(
          `${config.backend_url}/fieldoptions?fieldtype=accessories`,
          {
            headers: { Authorization: "Bearer WeInfl3nc3withAI" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.fieldoptions) {
            const options = data.fieldoptions.map((item: any) => ({
              label: item.label,
              image: item.image,
              description: item.description,
            }));
            setAccessoriesOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching accessories options:", error);
        setAccessoriesOptions([]);
      }
    };
    fetchAccessoriesOptions().catch(console.error);
  }, []);

  // Fetch generated images based on task IDs
  useEffect(() => {
    const fetchGeneratedImages = async () => {
      if (!generatedTaskIds || generatedTaskIds.length === 0) return;

      setIsLoadingGeneratedImages(true);
      try {
        const allImages: any[] = [];
        const newFailedTasks = new Set<string>();
        const failedImagesWithNotes: any[] = [];

        for (const taskId of generatedTaskIds) {
          // Fetch ALL images for this task_id (including pending, failed, and completed)
          const response = await fetch(
            `${config.supabase_server_url}/generated_images?task_id=eq.${taskId}&order=image_sequence_number.asc`,
            {
              headers: {
                Authorization: "Bearer WeInfl3nc3withAI",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            
            if (data && data.length > 0) {
              // Add ALL images regardless of status - we'll handle display based on status
              data.forEach((img: any) => {
                allImages.push(img);
                
                // Track failed tasks for placeholder management
                if (img.generation_status === "failed") {
                  newFailedTasks.add(taskId.toString());
                }
              });
            }
          }
        }

        console.log("Fetched images from API:", allImages);
        console.log("Failed tasks:", newFailedTasks);
        console.log("Failed images with notes:", failedImagesWithNotes);

        setFailedTasks(newFailedTasks);

        // Clear placeholders for tasks that have any images in the database
        if (allImages.length > 0) {
          setPlaceholderImages((prev) =>
            prev.filter(
              (placeholder) =>
                !allImages.some((img) => img.task_id === placeholder.task_id)
            )
          );
        }

        // Sort images by task_id, then by image_sequence_number
        const sortedImages = allImages.sort((a, b) => {
          // First sort by task_id (as string for consistency)
          const taskIdA = String(a.task_id);
          const taskIdB = String(b.task_id);

          if (taskIdA !== taskIdB) {
            return taskIdA.localeCompare(taskIdB);
          }

          // If task_id is the same, sort by image_sequence_number
          return (
            (a.image_sequence_number || 0) - (b.image_sequence_number || 0)
          );
        });

        setGeneratedImages(sortedImages);
      } catch (error) {
        console.error("Error fetching generated images:", error);
      } finally {
        setIsLoadingGeneratedImages(false);
      }
    };

    fetchGeneratedImages();
    const interval = setInterval(fetchGeneratedImages, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [generatedTaskIds]);

  // Generate QR code when share modal opens
  useEffect(() => {
    if (shareModal.open && shareModal.itemId && shareModal.itemPath) {
      const directLink = `${config.data_url}/${userData.id}/${shareModal.itemPath}/${shareModal.itemId}`;
      generateQRCode(directLink);
    }
  }, [shareModal.open, shareModal.itemId, shareModal.itemPath, userData.id]);

  // File management functions
  const handleDownload = async (image: any) => {
    try {
      toast.info("Downloading image...", {
        description: "This may take a moment",
      });

      const filename = image.file_path.split("/").pop();
      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          filename: "output/" + filename,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        image.system_filename || `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image. Please try again.");
    }
  };

  const handleFileDelete = async (image: any) => {
    try {
      toast.info("Deleting image...", {
        description: "This may take a moment",
      });

      const filename = image.file_path.split("/").pop();
      await fetch(`${config.backend_url}/deletefile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          filename: "output/" + filename,
        }),
      });

      await fetch(
        `${config.supabase_server_url}/generated_images?id=eq.${image.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      setGeneratedImages((prev) => prev.filter((img) => img.id !== image.id));
      toast.success(`Image "${filename}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image. Please try again.");
    }
  };

  const handleShare = (systemFilename: string) => {
    setShareModal({ open: true, itemId: systemFilename, itemPath: "output" });
  };

  const handleFileContextMenu = (e: React.MouseEvent, image: any) => {
    e.preventDefault();
    setFileContextMenu({ x: e.clientX, y: e.clientY, image });
  };

  const handleEdit = (image: any) => {
    navigate("/create/edit", {
      state: {
        imageData: image,
      },
    });
  };

  const handleRegenerate = async (image: any) => {
    // Only allow regeneration for non-uploaded and non-edited images
    if (
      image.model_version === "edited" ||
      image.quality_setting === "edited" ||
      image.task_id?.startsWith("upload_")
    ) {
      toast.error("Cannot regenerate uploaded or edited images");
      return;
    }

    setRegeneratingImages((prev) => new Set(prev).add(image.system_filename));

    try {
      toast.info("Regenerating image...", {
        description: "Fetching original task data and creating new generation",
      });

      // Convert task_id (VARCHAR) to BIGINT and query tasks table for jsonjob
      const taskIdAsInt = parseInt(image.task_id, 10);
      console.log(
        "Converting task_id to integer:",
        image.task_id,
        "->",
        taskIdAsInt
      );

      if (isNaN(taskIdAsInt)) {
        throw new Error(
          `Invalid task_id: ${image.task_id} cannot be converted to integer`
        );
      }

      const taskResponse = await fetch(
        `${config.supabase_server_url}/tasks?id=eq.${taskIdAsInt}`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      if (!taskResponse.ok) {
        throw new Error("Failed to fetch original task");
      }

      const taskData = await taskResponse.json();
      if (!taskData || taskData.length === 0) {
        throw new Error("Original task not found");
      }

      const originalTask = taskData[0];
      console.log("Task details loaded on-demand for regeneration");
      console.log("OriginalTask jsonjob:", originalTask.jsonjob);

      // Parse the JSON job data
      const jsonjob = JSON.parse(originalTask.jsonjob);
      console.log("Parsed JSON job:", jsonjob);

      // Build URL parameters and reload page for regeneration
      const params = new URLSearchParams();
      params.set("regenerate", "true");
      params.set("regenerated_from", image.system_filename);

      // Core generation parameters
      if (jsonjob.prompt) {
        console.log("Original prompt:", jsonjob.prompt);
        params.set("prompt", encodeURIComponent(jsonjob.prompt));
        console.log("Encoded prompt:", encodeURIComponent(jsonjob.prompt));
      }
      if (jsonjob.negative_prompt)
        params.set("negative_prompt", jsonjob.negative_prompt);
      if (jsonjob.model?.id)
        params.set("influencer_id", jsonjob.model.id.toString());
      if (jsonjob.format) params.set("format", jsonjob.format);
      if (jsonjob.quality) params.set("quality", jsonjob.quality);
      if (jsonjob.engine) params.set("engine", jsonjob.engine);
      if (jsonjob.guidance) params.set("guidance", jsonjob.guidance.toString());
      if (jsonjob.lora_strength)
        params.set("lora_strength", jsonjob.lora_strength.toString());
      if (jsonjob.nsfw_strength)
        params.set("nsfw_strength", jsonjob.nsfw_strength.toString());
      if (jsonjob.number_of_images)
        params.set("number_of_images", jsonjob.number_of_images.toString());

      // Scene components for Component Picker
      if (jsonjob.scene) {
        const scene = jsonjob.scene;
        if (scene.framing) params.set("framing", scene.framing);
        if (scene.rotation) params.set("rotation", scene.rotation);
        if (scene.lighting_preset)
          params.set("lighting_preset", scene.lighting_preset);
        if (scene.scene_setting)
          params.set("scene_setting", scene.scene_setting);
        if (scene.pose) params.set("pose", scene.pose);
        if (scene.clothes) params.set("clothes", scene.clothes);
      }

      console.log("NAVIGATE with params:", params.toString());
      console.log("Prompt being set:", jsonjob.prompt);

      // Use React Router navigation instead of window.location
      navigate(`/create/images?${params.toString()}`, {
        state: {
          regenerateData: {
            prompt: jsonjob.prompt,
            negative_prompt: jsonjob.negative_prompt,
            influencer_id: jsonjob.model?.id?.toString(),
            format: jsonjob.format,
            quality: jsonjob.quality,
            engine: jsonjob.engine,
            guidance: jsonjob.guidance,
            lora_strength: jsonjob.lora_strength,
            nsfw_strength: jsonjob.nsfw_strength,
            number_of_images: jsonjob.number_of_images,
            scene: jsonjob.scene,
          },
          regenerateFrom: image.system_filename,
        },
      });
    } catch (error) {
      console.error("Regeneration error:", error);
      toast.error("Regeneration failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setRegeneratingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(image.system_filename);
        return newSet;
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  // Preset management functions
  const getCurrentSettingsAsJSON = () => {
    return {
      lora: false,
      noAI: true,
      seed: imageSettings.seed || -1,
      task: "generate_image",
      model: modelData
        ? {
            id: modelData.id,
            age: modelData.age,
            sex: modelData.sex,
            body_type: modelData.body_type,
            eye_color: modelData.eye_color,
            lifestyle: modelData.lifestyle,
            lip_style: modelData.lip_style,
            name_last: modelData.name_last,
            skin_tone: modelData.skin_tone,
            face_shape: modelData.face_shape,
            hair_color: modelData.hair_color,
            hair_style: modelData.hair_style,
            name_first: modelData.name_first,
          }
        : null,
      scene: {
        pose: componentPicker.pose?.label || "",
        clothes: componentPicker.outfit?.label || "",
        framing: componentPicker.framing?.label || "",
        rotation: componentPicker.rotation?.label || "",
        scene_setting: componentPicker.scene?.label || "",
        lighting_preset: componentPicker.lighting?.label || "",
        makeup_style: componentPicker.makeup?.label || "",
        accessories: componentPicker.accessory?.label || "",
      },
      engine: imageSettings.engine || "",
      format: imageSettings.format || "Portrait (4:5)",
      prompt: prompt || "",
      quality: "Quality",
      guidance: imageSettings.promptAdherence,
      lora_strength: loraSettings.influencerStrength,
      first_lora: loraSettings.optionalLora1 || "",
      second_lora: loraSettings.optionalLora2 || "",
      nsfw_strength: imageSettings.nsfwStrength,
      usePromptOnly: false,
      negative_prompt: "",
      number_of_images: imageSettings.images,
    };
  };

  const fetchExistingFolders = async () => {
    try {
      const response = await fetch(
        `${config.supabase_server_url}/presets?user_id=eq.${userData.id}&select=mainfolder,subfolder,subsubfolder`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      if (response.ok) {
        const presets = await response.json();
        const mainFolders: string[] = Array.from(
          new Set(presets.map((p: any) => p.mainfolder).filter(Boolean))
        );
        const subFolders: string[] = Array.from(
          new Set(presets.map((p: any) => p.subfolder).filter(Boolean))
        );
        const subSubFolders: string[] = Array.from(
          new Set(presets.map((p: any) => p.subsubfolder).filter(Boolean))
        );

        setExistingFolders({ mainFolders, subFolders, subSubFolders });
      }
    } catch (error) {
      console.error("Error fetching existing folders:", error);
    }
  };

  const handleSavePreset = async () => {
    if (!presetData.name.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    setIsSavingPreset(true);
    try {
      const jsonJob = getCurrentSettingsAsJSON();
      const response = await fetch(`${config.supabase_server_url}/presets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user_id: userData.id,
          name: presetData.name,
          description: presetData.description,
          jsonjob: jsonJob,
          mainfolder: presetData.mainFolder || null,
          subfolder: presetData.subFolder || null,
          subsubfolder: presetData.subSubFolder || null,
          rating: presetData.rating,
          favorite: presetData.favorite,
          tags: presetData.tags,
          image_name: presetData.selectedImage
            ? presetData.selectedImage.split("/").pop()
            : null,
          route: "content-create-image",
        }),
      });

      if (response.ok) {
        toast.success("Preset saved successfully!");
        setShowPresetModal(false);
        setPresetData({
          name: "",
          description: "",
          mainFolder: "",
          subFolder: "",
          subSubFolder: "",
          rating: 0,
          favorite: false,
          tags: [],
          selectedImage: null,
        });
        setEditingPreset(null);
      } else {
        throw new Error("Failed to save preset");
      }
    } catch (error) {
      console.error("Error saving preset:", error);
      toast.error("Failed to save preset. Please try again.");
    } finally {
      setIsSavingPreset(false);
    }
  };

  // Load existing folders when modal opens
  useEffect(() => {
    if (showPresetModal) {
      fetchExistingFolders();
    }
  }, [showPresetModal]);

  // Load available presets when browser modal opens
  useEffect(() => {
    if (showPresetBrowserModal) {
      fetchAvailablePresets();
    }
  }, [showPresetBrowserModal]);

  useEffect(() => {
    if (showInspirationHub) {
      fetchTemplatePresets();
    }
  }, [showInspirationHub]);

  // Fetch all available presets with images
  const fetchAvailablePresets = async () => {
    try {
      setPresetsLoading(true);
      const response = await fetch(
        `${config.supabase_server_url}/presets?user_id=eq.${userData.id}&order=created_at.desc`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      if (response.ok) {
        const presets = await response.json();

        // Add image URLs to presets
        const presetsWithImages = presets.map((preset: any) => ({
          ...preset,
          imageUrl: preset.image_name
            ? `${config.data_url}/${userData.id}/presets/${preset.image_name}`
            : null,
        }));

        setAvailablePresets(presetsWithImages);
      }
    } catch (error) {
      console.error("Error fetching presets:", error);
      toast.error("Failed to load presets");
    } finally {
      setPresetsLoading(false);
    }
  };

  // Load a preset into the current settings
  const loadPreset = async (preset: any) => {
    try {
      const jsonJob = preset.jsonjob;
      console.log("Loading preset:", preset.name, "JSON Job:", jsonJob);

      // Set model data - ensure we have the full influencer object and apply LoRA logic
      if (jsonJob.model && jsonJob.model.id !== "preview") {
        // Find the full influencer data from our loaded influencers
        const influencer = influencers.find(
          (inf) => inf.id === jsonJob.model.id
        );
        if (influencer) {
          applyInfluencerWithLoraLogic(influencer);
          console.log(
            "Set model data to influencer with LoRA logic:",
            influencer.name_first,
            influencer.name_last
          );
        } else {
          // Fallback to stored model data (no LoRA logic for non-user influencers)
          setModelData(jsonJob.model);
          console.log("Set model data to stored data:", jsonJob.model);
        }
      }

      // Set prompt
      if (jsonJob.prompt) {
        setPrompt(jsonJob.prompt);
        console.log("Set prompt:", jsonJob.prompt);
      }

      // Set image settings
      setImageSettings((prev) => ({
        ...prev,
        seed: jsonJob.seed || prev.seed,
        engine: jsonJob.engine || prev.engine,
        format: jsonJob.format || prev.format,
        promptAdherence: jsonJob.guidance || prev.promptAdherence,
        nsfwStrength: jsonJob.nsfw_strength || prev.nsfwStrength,
        images: jsonJob.number_of_images || prev.images,
      }));
      console.log("Set image settings");

      // Set LORA settings
      setLoraSettings((prev) => ({
        ...prev,
        influencerStrength: jsonJob.lora_strength || prev.influencerStrength,
        optionalLora1: jsonJob.first_lora || prev.optionalLora1,
        optionalLora2: jsonJob.second_lora || prev.optionalLora2,
        optionalLora1Strength:
          jsonJob.first_lora_strength || prev.optionalLora1Strength,
        optionalLora2Strength:
          jsonJob.second_lora_strength || prev.optionalLora2Strength,
      }));
      console.log("Set LORA settings");

      // Set component picker (scene settings) - Load options first to match components properly
      if (jsonJob.scene) {
        // For each component category, find matching options
        const newComponentPicker: ComponentPickerState = {
          pose: null,
          outfit: null,
          framing: null,
          rotation: null,
          scene: null,
          lighting: null,
          makeup: null,
          accessory: null,
        };

        // Load and match pose
        if (jsonJob.scene.pose) {
          const poseOptions = getOptionsForCategory("pose");
          const matchedPose = poseOptions.find(
            (option) => option.label === jsonJob.scene.pose
          );
          newComponentPicker.pose = matchedPose || {
            label: jsonJob.scene.pose,
            id: "loaded",
            description: `Loaded from preset: ${jsonJob.scene.pose}`,
            image: "",
            category: "pose",
          };
        }

        // Load and match outfit
        if (jsonJob.scene.clothes) {
          const outfitOptions = getOptionsForCategory("outfit");
          const matchedOutfit = outfitOptions.find(
            (option) => option.label === jsonJob.scene.clothes
          );
          newComponentPicker.outfit = matchedOutfit || {
            label: jsonJob.scene.clothes,
            id: "loaded",
            description: `Loaded from preset: ${jsonJob.scene.clothes}`,
            image: "",
            category: "outfit",
          };
        }

        // Load and match framing
        if (jsonJob.scene.framing) {
          const framingOptions = getOptionsForCategory("framing");
          const matchedFraming = framingOptions.find(
            (option) => option.label === jsonJob.scene.framing
          );
          newComponentPicker.framing = matchedFraming || {
            label: jsonJob.scene.framing,
            id: "loaded",
            description: `Loaded from preset: ${jsonJob.scene.framing}`,
            image: "",
            category: "framing",
          };
        }

        // Load and match rotation
        if (jsonJob.scene.rotation) {
          const rotationOptions = getOptionsForCategory("rotation");
          const matchedRotation = rotationOptions.find(
            (option) => option.label === jsonJob.scene.rotation
          );
          newComponentPicker.rotation = matchedRotation || {
            label: jsonJob.scene.rotation,
            id: "loaded",
            description: `Loaded from preset: ${jsonJob.scene.rotation}`,
            image: "",
            category: "rotation",
          };
        }

        // Load and match scene
        if (jsonJob.scene.scene_setting) {
          const sceneOptions = getOptionsForCategory("scene");
          const matchedScene = sceneOptions.find(
            (option) => option.label === jsonJob.scene.scene_setting
          );
          newComponentPicker.scene = matchedScene || {
            label: jsonJob.scene.scene_setting,
            id: "loaded",
            description: `Loaded from preset: ${jsonJob.scene.scene_setting}`,
            image: "",
            category: "scene",
          };
        }

        // Load and match lighting
        if (jsonJob.scene.lighting_preset) {
          const lightingOptions = getOptionsForCategory("lighting");
          const matchedLighting = lightingOptions.find(
            (option) => option.label === jsonJob.scene.lighting_preset
          );
          newComponentPicker.lighting = matchedLighting || {
            label: jsonJob.scene.lighting_preset,
            id: "loaded",
            description: `Loaded from preset: ${jsonJob.scene.lighting_preset}`,
            image: "",
            category: "lighting",
          };
        }

        setComponentPicker(newComponentPicker);
        console.log("Set component picker:", newComponentPicker);
      }

      setShowPresetBrowserModal(false);
      toast.success(`Preset "${preset.name}" loaded successfully!`);
    } catch (error) {
      console.error("Error loading preset:", error);
      toast.error("Failed to load preset");
    }
  };

  // Fetch template presets from template user
  const fetchTemplatePresets = async () => {
    try {
      setTemplatesLoading(true);
      const templateUserId = "21df831a-4ed7-4b40-abd0-bf568b132134";
      const response = await fetch(
        `${config.supabase_server_url}/presets?user_id=eq.${templateUserId}&order=created_at.desc`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      if (response.ok) {
        const presets = await response.json();

        // Add image URLs to presets
        const presetsWithImages = presets.map((preset: any) => ({
          ...preset,
          imageUrl: preset.image_name
            ? `${config.data_url}/${templateUserId}/presets/${preset.image_name}`
            : null,
        }));

        setTemplatePresets(presetsWithImages);
      }
    } catch (error) {
      console.error("Error fetching template presets:", error);
      toast.error("Failed to load template presets");
    } finally {
      setTemplatesLoading(false);
    }
  };

  // Adopt a template preset (load into current settings)
  const adoptTemplate = async (preset: any) => {
    try {
      const jsonJob = preset.jsonjob;
      console.log("=== ADOPTING TEMPLATE ===");
      console.log("Template Name:", preset.name);
      console.log("Complete JSON Job:", JSON.stringify(jsonJob, null, 2));
      console.log("Scene Object:", JSON.stringify(jsonJob.scene, null, 2));

      // Set model data - check if user has influencer with same name
      if (jsonJob.model && jsonJob.model.id !== "preview") {
        // Try to find influencer by name (not ID, since template user has different IDs)
        const templateInfluencerName = `${jsonJob.model.name_first || ""} ${
          jsonJob.model.name_last || ""
        }`.trim();
        const matchingInfluencer = influencers.find(
          (inf) =>
            `${inf.name_first} ${inf.name_last}`.trim().toLowerCase() ===
            templateInfluencerName.toLowerCase()
        );

        if (matchingInfluencer) {
          applyInfluencerWithLoraLogic(matchingInfluencer);
          console.log(
            "Found matching influencer with LoRA logic:",
            matchingInfluencer.name_first,
            matchingInfluencer.name_last
          );

          // Show appropriate toast message based on LoRA status
          if (matchingInfluencer.lorastatus === 2) {
            toast.success(
              `✅ Using your influencer: ${matchingInfluencer.name_first} ${matchingInfluencer.name_last} - AI Consistency enabled`
            );
          } else {
            toast.success(
              `✅ Using your influencer: ${matchingInfluencer.name_first} ${matchingInfluencer.name_last} - AI Training required for consistency`
            );
          }
        } else {
          // No matching influencer found, show popup
          setModelData(null);
          console.log(
            "No matching influencer found for:",
            templateInfluencerName
          );
          if (templateInfluencerName) {
            setInfluencerDialogData({
              templateName: preset.name,
              influencerName: templateInfluencerName,
            });
            setShowInfluencerDialog(true);
          }
        }
      } else {
        // Template has no influencer
        setModelData(null);
      }

      // Set prompt
      if (jsonJob.prompt) {
        setPrompt(jsonJob.prompt);
        console.log("Set prompt:", jsonJob.prompt);
      }

      // Set image settings
      setImageSettings((prev) => ({
        ...prev,
        seed: jsonJob.seed || prev.seed,
        engine: jsonJob.engine || prev.engine,
        format: jsonJob.format || prev.format,
        promptAdherence: jsonJob.guidance || prev.promptAdherence,
        nsfwStrength: jsonJob.nsfw_strength || prev.nsfwStrength,
        images: jsonJob.number_of_images || prev.images,
      }));
      console.log("Set image settings");

      // Set LORA settings
      setLoraSettings((prev) => ({
        ...prev,
        influencerStrength: jsonJob.lora_strength || prev.influencerStrength,
        optionalLora1: jsonJob.first_lora || prev.optionalLora1,
        optionalLora2: jsonJob.second_lora || prev.optionalLora2,
        optionalLora1Strength:
          jsonJob.first_lora_strength || prev.optionalLora1Strength,
        optionalLora2Strength:
          jsonJob.second_lora_strength || prev.optionalLora2Strength,
      }));
      console.log("Set LORA settings");

      // Set component picker (scene settings) - Use the same logic as loadPreset
      if (jsonJob.scene) {
        const newComponentPicker: ComponentPickerState = {
          pose: null,
          outfit: null,
          framing: null,
          rotation: null,
          scene: null,
          lighting: null,
          makeup: null,
          accessory: null,
        };

        // Helper function to find option (new format only with .label)
        const findOption = (options: any[], value: string) => {
          // Try exact match first
          let match = options.find((opt) => opt.label === value);
          if (match) return match;

          // Try case-insensitive match
          match = options.find(
            (opt) => opt.label?.toLowerCase() === value.toLowerCase()
          );
          if (match) return match;

          // Create fallback option if not found
          return {
            label: value,
            id: "loaded",
          };
        };

        // Load and match pose (new format)
        const poseValue = jsonJob.scene.pose;
        if (poseValue) {
          const poseOptionsData = getOptionsForCategory("pose");
          newComponentPicker.pose = findOption(poseOptionsData, poseValue);
          console.log("Matched pose:", poseValue);
        }

        // Load and match outfit (from scene.clothes)
        const outfitValue = jsonJob.scene.clothes;
        if (outfitValue) {
          const outfitOptionsData = getOptionsForCategory("outfit");
          newComponentPicker.outfit = findOption(
            outfitOptionsData,
            outfitValue
          );
          console.log("Matched outfit:", outfitValue);
        }

        // Load and match other components (correct property mapping)
        const componentMappings = [
          { key: "framing", sceneProp: "framing" },
          { key: "rotation", sceneProp: "rotation" },
          { key: "scene", sceneProp: "scene_setting" },
          { key: "lighting", sceneProp: "lighting_preset" },
          { key: "makeup", sceneProp: "makeup_style" },
          { key: "accessory", sceneProp: "accessories" },
        ];

        componentMappings.forEach(({ key, sceneProp }) => {
          const value = jsonJob.scene[sceneProp];
          console.log(`\n--- Processing ${key} (from scene.${sceneProp}) ---`);
          console.log(`Value from template:`, value);

          if (value) {
            const optionsData = getOptionsForCategory(key);
            console.log(
              `Available options for ${key}:`,
              optionsData.map((opt) => opt.label)
            );
            const foundOption = findOption(optionsData, value);
            (newComponentPicker as any)[key] = foundOption;
            console.log(`✅ Matched ${key}:`, value, "→", foundOption);
          } else {
            console.log(`❌ No value found for ${key} in scene.${sceneProp}`);
          }
        });

        setComponentPicker(newComponentPicker);
        console.log("=== FINAL COMPONENT PICKER ===");
        console.log(
          "New Component Picker:",
          JSON.stringify(newComponentPicker, null, 2)
        );
      }

      setShowInspirationHub(false);
      toast.success(`Template "${preset.name}" adopted successfully!`);
    } catch (error) {
      console.error("Error adopting template:", error);
      toast.error("Failed to adopt template");
    }
  };

  // Edit a preset by opening the save modal with preset data
  const editPreset = (preset: any) => {
    setEditingPreset(preset);
    setPresetData({
      name: preset.name,
      description: preset.description || "",
      mainFolder: preset.mainfolder || "",
      subFolder: preset.subfolder || "",
      subSubFolder: preset.subsubfolder || "",
      rating: preset.rating || 0,
      favorite: preset.favorite || false,
      tags: preset.tags || [],
      selectedImage: preset.imageUrl,
    });
    setShowPresetBrowserModal(false);
    setShowPresetModal(true);
  };

  // Upload image to server
  const uploadImageToServer = async (file: File): Promise<string | null> => {
    if (!userData.id) {
      toast.error("User not authenticated");
      return null;
    }

    try {
      setUploadingImage(true);

      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `preset_${timestamp}.${fileExtension}`;

      // Upload file using the correct API
      const uploadResponse = await fetch(
        `${config.backend_url}/uploadfile?user=${userData.id}&filename=presets/${filename}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: file,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // Return the uploaded image URL
      const imageUrl = `${config.data_url}/${userData.id}/presets/${filename}`;
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Copy image to presets folder
  const copyImageToPresets = async (sourceImage: any, filename: string) => {
    try {
      // Determine the source path based on image location
      let sourcePath = "";
      if (sourceImage.user_filename && sourceImage.user_filename !== "") {
        sourcePath = `vault/${sourceImage.user_filename}/${sourceImage.system_filename}`;
      } else {
        sourcePath = `output/${sourceImage.system_filename}`;
      }

      const response = await fetch(`${config.backend_url}/copyfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: sourcePath,
          destinationfilename: `presets/${filename}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to copy image");
      }

      return `${config.data_url}/${userData.id}/presets/${filename}`;
    } catch (error) {
      console.error("Error copying image:", error);
      throw error;
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    uploadImageToServer(file).then((imageUrl) => {
      if (imageUrl) {
        setPresetData((prev) => ({ ...prev, selectedImage: imageUrl }));
        toast.success("Image uploaded successfully");
      }
    });

    // Clear the file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Trigger file upload
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Update handleSavePreset to handle image copying
  const handleSavePresetWithImage = async () => {
    if (!presetData.name.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    setIsSavingPreset(true);
    try {
      let imageName = null;

      // Handle image copying/uploading
      if (presetData.selectedImage) {
        if (presetData.selectedImage.includes("/presets/")) {
          // Image is already in presets folder
          imageName = presetData.selectedImage.split("/").pop();
        } else if (presetData.selectedImage.startsWith("blob:")) {
          // Image is uploaded file (blob URL) - shouldn't happen with new system
          toast.error("Please re-upload your image");
          return;
        } else {
          // Image needs to be copied from vault or output
          const filename = `preset_${Date.now()}.jpg`;

          // We need the image object to determine the source path
          if (
            generatedImages.length > 0 &&
            presetData.selectedImage.includes("/output/")
          ) {
            // It's from current images
            const imageFilename = presetData.selectedImage.split("/").pop();
            const sourceImage = generatedImages.find(
              (img) => img.system_filename === imageFilename
            );
            if (sourceImage) {
              await copyImageToPresets(sourceImage, filename);
              imageName = filename;
            }
          }
          // If it's from vault, we handle it differently in the VaultSelector callback
        }
      }

      const jsonJob = getCurrentSettingsAsJSON();

      const requestData = {
        user_id: userData.id,
        name: presetData.name,
        description: presetData.description,
        jsonjob: jsonJob,
        mainfolder: presetData.mainFolder || null,
        subfolder: presetData.subFolder || null,
        subsubfolder: presetData.subSubFolder || null,
        rating: presetData.rating,
        favorite: presetData.favorite,
        tags: presetData.tags,
        image_name: imageName,
        route: "content-create-image",
      };

      let response;
      if (editingPreset) {
        // Update existing preset
        response = await fetch(
          `${config.supabase_server_url}/presets?id=eq.${editingPreset.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: JSON.stringify(requestData),
          }
        );
      } else {
        // Create new preset
        response = await fetch(`${config.supabase_server_url}/presets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify(requestData),
        });
      }

      if (response.ok) {
        toast.success(
          editingPreset
            ? "Preset updated successfully!"
            : "Preset saved successfully!"
        );
        setShowPresetModal(false);
        setPresetData({
          name: "",
          description: "",
          mainFolder: "",
          subFolder: "",
          subSubFolder: "",
          rating: 0,
          favorite: false,
          tags: [],
          selectedImage: null,
        });
        setEditingPreset(null);
      } else {
        throw new Error("Failed to save preset");
      }
    } catch (error) {
      console.error("Error saving preset:", error);
      toast.error("Failed to save preset. Please try again.");
    } finally {
      setIsSavingPreset(false);
    }
  };

  const generateQRCode = async (url: string) => {
    try {
      const QRCode = await import("qrcode");
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const componentCategories = [
    { key: "scene", label: "Scene", icon: Monitor },
    { key: "pose", label: "Pose", icon: User },
    { key: "outfit", label: "Outfit", icon: Palette },
    { key: "framing", label: "Framing", icon: Camera },
    { key: "lighting", label: "Lighting", icon: Zap },
    { key: "rotation", label: "Rotation", icon: RotateCcw },
    { key: "makeup", label: "Makeup", icon: Sparkles },
    { key: "accessory", label: "Accessories", icon: Crown },
  ];

  // Check gem cost before generation
  const checkGemCost = async () => {
    try {
      const response = await fetch("https://api.nymia.ai/v1/getgemslookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user_id: userData.id,
          item: "nymia_image",
          lookup: imageSettings.engine,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch credit cost");
      }

      const data = await response.json();
      console.log("Credit cost API response:", data);
      console.log(
        `Credit cost for ${imageSettings.engine}:`,
        data.gems,
        "gems per image"
      );
      return data;
    } catch (error) {
      console.error("Error checking credit cost:", error);
      throw error;
    }
  };

  // Proceed with generation after credit check
  const proceedWithGeneration = async () => {
    setIsGenerating(true);
    try {
      // Get user ID from Redux state
      if (!userData?.id) {
        toast.error("User data not found. Please log in again.");
        return;
      }

      const useridResponse = await fetch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      const useridData = await useridResponse.json();
      if (!useridData[0]?.userid) {
        toast.error("User ID not found in database");
        return;
      }

      // Convert format to the expected string format
      const formatLabels = {
        "1:1": "Square 1:1",
        "4:5": "Portrait 4:5",
        "3:4": "Portrait 3:4",
        "9:16": "Portrait 9:16",
        "16:9": "Landscape 16:9",
        "5:4": "Landscape 5:4",
        "4:3": "Landscape 4:3",
      };

      const requestData = {
        task: "generate_image",
        lora: loraSettings.influencerConsistency,
        noAI: false,
        prompt: prompt,
        negative_prompt: "",
        nsfw_strength: imageSettings.nsfwStrength,
        lora_strength: loraSettings.influencerStrength,
        first_lora: (() => {
          if (loraSettings.optionalLora1 === "none") return "";
          const selectedLora = systemLoraOptions.find(
            (lora) => lora.label === loraSettings.optionalLora1
          );
          return selectedLora?.filename || "";
        })(),
        first_lora_strength: loraSettings.optionalLora1Strength,
        second_lora: (() => {
          if (loraSettings.optionalLora2 === "none") return "";
          const selectedLora = systemLoraOptions.find(
            (lora) => lora.label === loraSettings.optionalLora2
          );
          return selectedLora?.filename || "";
        })(),
        second_lora_strength: loraSettings.optionalLora2Strength,
        quality: "Quality",
        seed: imageSettings.seed ? parseInt(imageSettings.seed) : -1,
        guidance: imageSettings.promptAdherence,
        number_of_images: imageSettings.images,
        format:
          formatLabels[imageSettings.format as keyof typeof formatLabels] ||
          "Portrait 4:5",
        engine: imageSettings.engine,
        usePromptOnly: false,
        model: modelData || {
          id: "preview",
        },
        scene: {
          framing: componentPicker.framing?.label || "",
          rotation: componentPicker.rotation?.label || "",
          lighting_preset: componentPicker.lighting?.label || "",
          scene_setting: componentPicker.scene?.label || "",
          pose: componentPicker.pose?.label || "",
          clothes: componentPicker.outfit?.label || "",
          makeup_style: componentPicker.makeup?.label || "",
          accessories: componentPicker.accessory?.label || "",
        },
      };

      console.log("Generating with data:", requestData);

      console.log("Sending request with data:", requestData);
      const response = await fetch(
        `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newTaskId = result.id;

      // Add task ID for polling
      setGeneratedTaskIds((prev) => [...prev, newTaskId]);

      // Create immediate placeholders for each image
      const numberOfImages = imageSettings.images;
      const newPlaceholders = Array.from(
        { length: numberOfImages },
        (_, index) => ({
          id: `placeholder-${newTaskId}-${index}`,
          task_id: newTaskId,
          placeholder_index: index,
          system_filename: `Generating image ${index + 1}...`,
          file_path: null,
          isPlaceholder: true,
          created_at: new Date().toISOString(),
          rating: 0,
          favorite: false,
        })
      );

      // Add placeholders to the display immediately
      setPlaceholderImages((prev) => [...prev, ...newPlaceholders]);

      console.log("Generation started, task ID:", newTaskId);
      console.log("Added placeholders:", newPlaceholders);
      toast.success("Content generation started successfully");
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Failed to generate images");
    } finally {
      setIsGenerating(false);
    }
  };

  // Modified handleGenerate to check credits first
  const handleGenerate = async () => {
    if (!modelData && !prompt.trim()) {
      toast.error("Please select an influencer or enter a prompt");
      return;
    }

    console.log("🚀 handleGenerate: Starting credit check...");
    setIsCheckingCredits(true);
    console.log("🚀 isCheckingCredits set to TRUE");

    try {
      // Add minimum delay to ensure spinner is visible
      await new Promise((resolve) => setTimeout(resolve, 500));

      const costData = await checkGemCost();
      console.log("🚀 Credit check completed:", costData);
      setGemCostData(costData);
      setShowCreditWarning(true);
    } catch (error) {
      console.error("Error checking credit cost:", error);
      toast.error("Unable to verify credit cost. Please try again.");
    } finally {
      setIsCheckingCredits(false);
      console.log("🚀 isCheckingCredits set to FALSE");
    }
  };

  const handleReset = () => {
    setPrompt("");
    setComponentPicker({
      scene: null,
      pose: null,
      outfit: null,
      framing: null,
      lighting: null,
      rotation: null,
      makeup: null,
      accessory: null,
    });
    setImageSettings({
      format: "4:5",
      images: 4,
      promptAdherence: 3.5,
      engine: "Nymia General",
      nsfwStrength: 0,
      seed: "",
    });

    // Clear all generated content but keep history visible
    setGeneratedImages([]);
    setGeneratedTaskIds([]);
    setPlaceholderImages([]);
    setFailedTasks(new Set());
    // DON'T set setShowHistory(false) - keep history visible
  };

  // Component selection handlers
  const addComponent = (
    category: keyof ComponentPickerState,
    component: ComponentPickerItem
  ) => {
    setComponentPicker((prev) => ({
      ...prev,
      [category]: component,
    }));
  };

  const removeComponent = (category: keyof ComponentPickerState) => {
    setComponentPicker((prev) => ({
      ...prev,
      [category]: null,
    }));
  };

  const getOptionsForCategory = (category: string) => {
    switch (category) {
      case "scene":
        return sceneOptions;
      case "pose":
        return poseOptions;
      case "outfit":
        return outfitOptions;
      case "framing":
        return framingOptions;
      case "lighting":
        return lightingOptions;
      case "rotation":
        return rotationOptions;
      case "makeup":
        return makeupOptions;
      case "accessory":
      case "accessories":
        return accessoriesOptions;
      default:
        return [];
    }
  };

  const getCategoriesForType = (categoryKey: string) => {
    switch (categoryKey) {
      case "scene":
        return sceneCategories;
      case "pose":
        return poseCategories;
      case "outfit":
        return outfitCategories;
      default:
        return [];
    }
  };

  const hasFolderStructure = (categoryKey: string) => {
    return ["scene", "pose", "outfit"].includes(categoryKey);
  };

  // Get the first available image from a folder for preview
  const getFolderPreviewImage = (folder: any) => {
    if (folder.data && folder.data.length > 0) {
      // Find the first item with an image
      const itemWithImage = folder.data.find((item: any) => item.image);
      return itemWithImage ? itemWithImage.image : null;
    }
    return null;
  };

  // Search through all items in all folders for a category
  const searchComponentItems = (categoryKey: string, searchTerm: string) => {
    if (!searchTerm.trim()) return [];

    const categories = getCategoriesForType(categoryKey);
    const allItems: any[] = [];

    // Collect all items from all folders
    categories.forEach((folder) => {
      if (folder.data && folder.data.length > 0) {
        folder.data.forEach((item: any) => {
          allItems.push({
            ...item,
            folderName: folder.property_category,
          });
        });
      }
    });

    // Also include direct options for categories without folder structure
    const directOptions = getOptionsForCategory(categoryKey);
    directOptions.forEach((item) => {
      allItems.push({
        ...item,
        folderName: null,
      });
    });

    // Filter items based on search term
    return allItems.filter(
      (item) =>
        item.label &&
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSettingEdit = (
    field: string,
    currentValue: any,
    inputType: string,
    options?: any[]
  ) => {
    setEditingSetting({
      type: "imageSettings",
      field,
      value: currentValue,
      inputType,
      options,
    });
  };

  const saveSettingEdit = (newValue: any) => {
    if (editingSetting && editingSetting.type === "imageSettings") {
      setImageSettings((prev) => ({
        ...prev,
        [editingSetting.field]: newValue,
      }));
    }
    setEditingSetting(null);
  };

  const getAdherenceLabel = (value: number) => {
    if (value >= 1 && value < 2) return "Very Creative";
    if (value >= 2 && value < 3.5) return "Creative";
    if (value >= 3.5 && value <= 4.5) return "Balanced";
    if (value > 4.5 && value < 6) return "More Adherence";
    if (value >= 6 && value < 7) return "Strong Adherence";
    if (value >= 7 && value <= 8) return "Strict Adherence";
    return "Balanced";
  };

  const getNsfwLabel = (value: number) => {
    if (value < 0) return "Safe and Clean";
    if (value === 0) return "Sexy but Still Safe";
    if (value > 0 && value <= 0.3) return "Slowly Getting Hot";
    if (value > 0.3 && value <= 0.6) return "Getting Spicy";
    if (value > 0.6 && value < 1) return "Very Hot";
    if (value === 1) return "No Limits";
    return "Safe";
  };

  const getCategoriesForField = (category: string) => {
    switch (category) {
      case "scene":
        return sceneCategories;
      case "pose":
        return poseCategories;
      case "outfit":
        return outfitCategories;
      default:
        return [];
    }
  };

  const hasSelectedComponents = Object.values(componentPicker).some(
    (item) => item !== null
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create Images
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Advanced AI image generation with influencer consistency
          </p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Image Settings Bar */}
          <div className="border-b p-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Image Settings
              </h4>
              <div className="grid grid-cols-6 gap-4">
                {/* Format Setting */}
                <div className="flex flex-col space-y-2 group">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Format
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                    onClick={() =>
                      handleSettingEdit(
                        "format",
                        imageSettings.format,
                        "select",
                        formatOptions.map((opt) => ({
                          label: opt.label,
                          value: opt.value,
                        }))
                      )
                    }
                  >
                    <div className="flex items-center gap-1">
                      {formatLabels[imageSettings.format] ||
                        formatOptions.find(
                          (opt) => opt.value === imageSettings.format
                        )?.label ||
                        imageSettings.format}
                      <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </div>
                  </Badge>
                </div>

                {/* Prompt Adherence Setting */}
                <div className="flex flex-col space-y-2 group">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Prompt Adherence
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                    onClick={() =>
                      handleSettingEdit(
                        "promptAdherence",
                        imageSettings.promptAdherence,
                        "slider"
                      )
                    }
                  >
                    <div className="flex items-center gap-1">
                      {imageSettings.promptAdherence} (
                      {getAdherenceLabel(imageSettings.promptAdherence)})
                      <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </div>
                  </Badge>
                </div>

                {/* Images Count Setting */}
                <div className="flex flex-col space-y-2 group">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Images
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                    onClick={() =>
                      handleSettingEdit(
                        "images",
                        imageSettings.images,
                        "slider"
                      )
                    }
                  >
                    <div className="flex items-center gap-1">
                      {imageSettings.images}
                      <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </div>
                  </Badge>
                </div>

                {/* NSFW Strength Setting */}
                <div className="flex flex-col space-y-2 group">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    NSFW
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                    onClick={() =>
                      handleSettingEdit(
                        "nsfwStrength",
                        imageSettings.nsfwStrength,
                        "slider"
                      )
                    }
                  >
                    <div className="flex items-center gap-1">
                      {imageSettings.nsfwStrength} (
                      {getNsfwLabel(imageSettings.nsfwStrength)})
                      <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </div>
                  </Badge>
                </div>

                {/* AI Image Engine Setting */}
                <div className="flex flex-col space-y-2 group">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    AI Image Engine
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                    onClick={() =>
                      handleSettingEdit(
                        "engine",
                        imageSettings.engine,
                        "select",
                        engineOptions.map((opt) => ({
                          label: opt.label,
                          value: opt.label,
                        }))
                      )
                    }
                  >
                    <div className="flex items-center gap-1">
                      {imageSettings.engine}
                      <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </div>
                  </Badge>
                </div>

                {/* Seed Setting */}
                <div className="flex flex-col space-y-2 group">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Seed
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:shadow-lg transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                    onClick={() =>
                      handleSettingEdit("seed", imageSettings.seed, "input")
                    }
                  >
                    <div className="flex items-center gap-1">
                      {imageSettings.seed || "Random"}
                      <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="p-4 border-b border-gray-800">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Prompt</Label>
              <Textarea
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Quick Component Selection */}
          <div className="p-4 border-b border-gray-800">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Component Selection
              </h4>
              <div className="flex flex-wrap gap-2">
                {componentCategories.map((category) => {
                  const Icon = category.icon;
                  const selectedComponent =
                    componentPicker[category.key as keyof ComponentPickerState];
                  return (
                    <Badge
                      key={category.key}
                      variant={selectedComponent ? "default" : "secondary"}
                      className="cursor-pointer px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center"
                      onClick={() => openComponentPicker(category.key)}
                      data-testid={`button-component-${category.key}`}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {selectedComponent
                        ? selectedComponent.label
                        : `Add ${category.label}`}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              {/* Left Group */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-800"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Form
                </Button>

                <Button
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-800"
                  onClick={() => setShowHistory((v) => !v)}
                >
                  <History className="w-4 h-4 mr-2" />
                  {showHistory ? "Hide History" : "Show History"}
                </Button>
              </div>

              {/* Right Group */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowInspirationHub(true)}
                  variant="outline"
                  className="border-purple-500/50 hover:bg-purple-500/10 text-purple-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Inspiration Hub
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isCheckingCredits}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isCheckingCredits ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  {isGenerating
                    ? "Generating..."
                    : isCheckingCredits
                    ? "Checking Credits..."
                    : "Generate Images"}
                </Button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {generatedImages.length > 0 || placeholderImages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {/* Display all images from generated_images table with proper status handling */}
                  {(() => {
                    // Combine database images with active placeholders
                    const activePlaceholders = placeholderImages.filter(
                      (placeholder) => {
                        // Keep placeholders for tasks that don't have any database entries yet
                        return !generatedImages.some(
                          (img) => img.task_id === placeholder.task_id
                        );
                      }
                    );

                    // Return all items: active placeholders first, then all database images
                    return [...activePlaceholders, ...generatedImages];
                  })().map((image, index) => (
                    <div key={image.isPlaceholder ? image.id : image.id}>
                      {image.isPlaceholder ? (
                        // Placeholder card (for tasks not yet in database)
                        image.isFailed ? (
                          // Failed placeholder card
                          <Card className="group transition-all duration-300 border-border/50 backdrop-blur-sm bg-gradient-to-br from-red-50/20 to-orange-50/20 dark:from-red-950/5 dark:to-orange-950/5">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <div className="text-xs text-red-500 font-medium">
                                  Task #{image.task_id}
                                </div>
                              </div>
                              <div className="relative w-full group mb-4 aspect-square">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-900 dark:to-orange-800 rounded-md flex items-center justify-center">
                                  <div className="flex flex-col items-center justify-center space-y-3">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                    <div className="text-xs text-center text-red-600 dark:text-red-400 px-4">
                                      <p className="font-medium">Generation Failed</p>
                                      <p>Please check your parameters</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-400">Failed</div>
                                <div className="text-xs text-red-500">Error</div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                        // Normal Placeholder Card - eigenständig
                        <Card className="group transition-all duration-300 border-border/50 backdrop-blur-sm bg-gradient-to-br from-blue-50/20 to-purple-50/20 dark:from-blue-950/5 dark:to-purple-950/5">
                          <CardContent className="p-4">
                            {/* Top Row: Loading indicator */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="opacity-60">
                                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                              </div>
                              {/* Empty stars and heart placeholders */}
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className="w-4 h-4 text-gray-200 fill-gray-200"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>
                              <div>
                                <svg
                                  className="w-5 h-5 text-gray-200 fill-none stroke-gray-200"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              </div>
                            </div>

                            {/* Placeholder Image Area with Spinner - EXACT same structure as real images */}
                            <div className="relative w-full group mb-4 aspect-square">
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-md flex items-center justify-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                  <div className="text-xs text-center text-gray-500 px-4">
                                    <p className="font-medium">
                                      AI is creating
                                    </p>
                                    <p>your image...</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons - EXACT same structure as real images */}
                            <div className="flex gap-1.5 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50"
                                disabled
                              >
                                <Download className="w-3 h-3 text-gray-400" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50"
                                disabled
                              >
                                <Edit3 className="w-3 h-3 text-gray-400" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50"
                                disabled
                              >
                                <RotateCcw className="w-3 h-3 text-gray-400" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50"
                                disabled
                              >
                                <Share className="w-3 h-3 text-gray-400" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50"
                                disabled
                              >
                                <Trash2 className="w-3 h-3 text-gray-400" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        )
                      ) : (
                        // Database images - handle based on generation_status
                        image.generation_status === "failed" ? (
                          // Failed Database Image Card - clickable to show user_notes
                          <Card
                            className="group transition-all duration-300 border-border/50 backdrop-blur-sm bg-gradient-to-br from-red-50/20 to-orange-50/20 dark:from-red-950/5 dark:to-orange-950/5 cursor-pointer hover:from-red-50/30 hover:to-orange-50/30 dark:hover:from-red-950/10 dark:hover:to-orange-950/10"
                            onClick={() => {
                              setFailedImageModal({
                                open: true,
                                taskId: image.task_id,
                                userNotes: image.user_notes || "No additional information available",
                              });
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <div className="text-xs text-red-500 font-medium">
                                  Task #{image.task_id} - Image #{image.image_sequence_number || 1}
                                </div>
                              </div>
                              <div className="relative w-full group mb-4 aspect-square">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-900 dark:to-orange-800 rounded-md flex items-center justify-center">
                                  <div className="flex flex-col items-center justify-center space-y-3">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                    <div className="text-xs text-center text-red-600 dark:text-red-400 px-4">
                                      <p className="font-medium">Generation Failed</p>
                                      <p>Click to view details</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-400">Failed</div>
                                <div className="text-xs text-blue-500 hover:text-blue-400">
                                  View Details →
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (image.generation_status === "pending" || image.generation_status === "processing") ? (
                          // Pending/Processing Database Image Card
                          <Card className="group transition-all duration-300 border-border/50 backdrop-blur-sm bg-gradient-to-br from-blue-50/20 to-purple-50/20 dark:from-blue-950/5 dark:to-purple-950/5">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                <div className="text-xs text-blue-500 font-medium">
                                  Task #{image.task_id} - Image #{image.image_sequence_number || 1}
                                </div>
                              </div>
                              <div className="relative w-full group mb-4 aspect-square">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-md flex items-center justify-center">
                                  <div className="flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <div className="text-xs text-center text-gray-500 px-4">
                                      <p className="font-medium">AI is creating</p>
                                      <p>your image...</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                  {image.generation_status === "processing" ? "Processing" : "Pending"}
                                </div>
                                <div className="text-xs text-blue-500">Generating...</div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          // Completed Database Image Card with full functionality
                        <Card
                          key={image.id}
                          className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/50 backdrop-blur-sm bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5 hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-blue-950/10 dark:hover:to-purple-950/10 cursor-pointer"
                        >
                          <CardContent className="p-4">
                            {/* Top Row: Task Info, Discrete Info, Clickable Stars, Clickable Heart */}
                            <div className="flex items-center justify-between mb-3">
                              {/* Task and Image Info */}
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-500 font-medium">
                                  Task #{image.task_id} - Image #{image.image_sequence_number || 1}
                                </div>
                                <div
                                  className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Load the most up-to-date data immediately
                                    const currentImage =
                                      generatedImages.find(
                                        (img) => img.id === image.id
                                      ) || image;

                                    setEditingImageData({
                                      user_filename:
                                        currentImage.user_filename || "",
                                      user_notes: currentImage.user_notes || "",
                                      user_tags: Array.isArray(
                                        currentImage.user_tags
                                      )
                                        ? currentImage.user_tags.join(", ")
                                        : currentImage.user_tags || "",
                                      rating: currentImage.rating || 0,
                                      favorite: currentImage.favorite || false,
                                    });
                                    setTempRating(currentImage.rating || 0);

                                    setImageInfoModal({
                                      open: true,
                                      image: currentImage,
                                    });
                                  }}
                                  title="Image Details"
                                >
                                  <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                              </div>
                              {/* Clickable rating stars */}
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 cursor-pointer transition-all duration-150 hover:scale-110 ${
                                      star <= (image.rating || 0)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-white fill-white stroke-gray-300 stroke-1"
                                    }`}
                                    viewBox="0 0 24 24"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const currentRating = image.rating || 0;
                                      const newRating =
                                        star === 1 && currentRating === 1
                                          ? 0
                                          : star;

                                      // Update immediately in local state
                                      setGeneratedImages((prev) =>
                                        prev.map((img) =>
                                          img.id === image.id
                                            ? { ...img, rating: newRating }
                                            : img
                                        )
                                      );

                                      // Save to backend
                                      try {
                                        const response = await fetch(
                                          `${config.supabase_server_url}/generated_images?id=eq.${image.id}`,
                                          {
                                            method: "PATCH",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                              Authorization:
                                                "Bearer WeInfl3nc3withAI",
                                            },
                                            body: JSON.stringify({
                                              user_filename:
                                                image.user_filename || "",
                                              user_notes:
                                                image.user_notes || "",
                                              user_tags: image.user_tags || [],
                                              rating: newRating,
                                              favorite: image.favorite || false,
                                            }),
                                          }
                                        );
                                        if (!response.ok) {
                                          throw new Error(
                                            "Failed to save rating"
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Failed to save rating:",
                                          error
                                        );
                                      }
                                    }}
                                  >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>
                              {/* Clickable favorite heart - old style */}
                              <div
                                className="cursor-pointer transition-all duration-200 hover:scale-110"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const newFavorite = !image.favorite;

                                  // Update immediately in local state
                                  setGeneratedImages((prev) =>
                                    prev.map((img) =>
                                      img.id === image.id
                                        ? { ...img, favorite: newFavorite }
                                        : img
                                    )
                                  );

                                  // Save to backend
                                  try {
                                    const response = await fetch(
                                      `${config.supabase_server_url}/generated_images?id=eq.${image.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization:
                                            "Bearer WeInfl3nc3withAI",
                                        },
                                        body: JSON.stringify({
                                          user_filename:
                                            image.user_filename || "",
                                          user_notes: image.user_notes || "",
                                          user_tags: image.user_tags || [],
                                          rating: image.rating || 0,
                                          favorite: newFavorite,
                                        }),
                                      }
                                    );
                                    if (!response.ok) {
                                      throw new Error(
                                        "Failed to save favorite"
                                      );
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Failed to save favorite:",
                                      error
                                    );
                                  }
                                }}
                                title={
                                  image.favorite
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                                }
                              >
                                <svg
                                  className={`w-5 h-5 transition-colors duration-200 ${
                                    image.favorite
                                      ? "text-red-500 fill-red-500"
                                      : "text-gray-400 fill-none stroke-gray-400"
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill={
                                    image.favorite ? "currentColor" : "none"
                                  }
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              </div>
                            </div>
                            {/* Image */}
                            <div
                              className="relative w-full group mb-4"
                              style={{ paddingBottom: "100%" }}
                            >
                              <img
                                src={`${config.data_url}/${image.file_path}`}
                                alt={image.system_filename}
                                className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                                onClick={() =>
                                  setFullSizeImageModal({
                                    isOpen: true,
                                    imageUrl: `${config.data_url}/${image.file_path}`,
                                    imageName: image.system_filename,
                                  })
                                }
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
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
                                        imageUrl: `${config.data_url}/${image.file_path}`,
                                        imageName: image.system_filename,
                                      });
                                    }}
                                  >
                                    <ZoomIn className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {/* Action Buttons - Single Row */}
                            <div className="flex gap-1.5 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-500 hover:from-purple-600 hover:to-indigo-700 hover:border-purple-600 transition-all duration-200 shadow-sm"
                                onClick={() => handleDownload(image)}
                                title="Download"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 hover:from-blue-600 hover:to-purple-700 hover:border-blue-600 transition-all duration-200 shadow-sm"
                                onClick={() => handleEdit(image)}
                                title="Edit this image with professional tools"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                                onClick={() => handleRegenerate(image)}
                                title="Regenerate"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-teal-500 hover:from-teal-600 hover:to-cyan-700 hover:border-teal-600 transition-all duration-200 shadow-sm"
                                onClick={() =>
                                  handleShare(image.system_filename)
                                }
                                title="Share"
                              >
                                <Share className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-gradient-to-r from-red-600 to-red-800 text-white border-red-600 hover:from-red-700 hover:to-red-900 hover:border-red-700 transition-all duration-200 shadow-sm"
                                onClick={() => handleFileDelete(image)}
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>

                {/* History Card - always available when toggled, regardless of generation state */}
                {showHistory && (
                  <div className="pt-6">
                    <HistoryCard userId={userData.id} />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-8">
                  {/* Show empty state only if no generation is in progress */}
                  {!isGenerating && placeholderImages.length === 0 && (
                    <div
                      className={`flex items-center justify-center text-gray-400 transition-all duration-300 ${
                        showHistory ? "h-32" : "h-64"
                      }`}
                    >
                      <div className="text-center">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No images generated yet</p>
                        <p className="text-sm">
                          Your generated images will appear here once you start
                          generation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* History Card - positioned after the main content block */}
                {showHistory && (
                  <div className="pt-6">
                    <HistoryCard userId={userData.id} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Influencer Section */}
              <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-950/10 dark:to-blue-950/10 shadow-xl">
                <Collapsible
                  open={isInfluencerOpen}
                  onOpenChange={setIsInfluencerOpen}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors">
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {modelData && !isInfluencerOpen ? (
                            <>
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700">
                                <img
                                  src={cleanImageUrl(modelData.image_url) || ""}
                                  alt={`${modelData.name_first} ${modelData.name_last}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span>
                                {modelData.name_first} {modelData.name_last}
                              </span>
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4" />
                              <span>
                                {modelData
                                  ? `${modelData.name_first} ${modelData.name_last}`
                                  : "Influencer"}
                              </span>
                            </>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isInfluencerOpen ? "rotate-180" : ""
                          }`}
                        />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {modelData ? (
                        <>
                          <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                            <img
                              src={cleanImageUrl(modelData.image_url) || ""}
                              alt={`${modelData.name_first} ${modelData.name_last}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {modelData.name_first} {modelData.name_last}
                            </p>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => setShowInfluencerSelector(true)}
                              >
                                Change Influencer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs text-red-400 border-red-400/30 hover:bg-red-400/10"
                                onClick={() => setModelData(null)}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              No influencer selected
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => setShowInfluencerSelector(true)}
                            >
                              Select Influencer
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* AI Consistency */}
              <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-950/10 dark:to-blue-950/10 shadow-xl">
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => setIsAiConsistencyOpen(!isAiConsistencyOpen)}
                >
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      AI Consistency
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isAiConsistencyOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CardTitle>
                </CardHeader>
                {isAiConsistencyOpen && (
                  <CardContent className="space-y-4">
                    {/* Influencer AI Consistency */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">
                        Influencer AI Consistency
                      </Label>
                      <Switch
                        checked={loraSettings.influencerConsistency}
                        onCheckedChange={handleInfluencerConsistencyToggle}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-xs text-muted-foreground">
                          Strength
                        </Label>
                        <span className="text-xs text-gray-500">
                          {loraSettings.influencerStrength}
                        </span>
                      </div>
                      <Slider
                        value={[loraSettings.influencerStrength]}
                        onValueChange={([value]) =>
                          setLoraSettings((prev) => ({
                            ...prev,
                            influencerStrength: value,
                          }))
                        }
                        min={-1}
                        max={2}
                        step={0.1}
                      />
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* First Optional Lora */}
                    <div className="space-y-3">
                      <Label className="text-xs text-gray-400">
                        First Optional Lora
                      </Label>
                      <Select
                        value={loraSettings.optionalLora1}
                        onValueChange={(value) => {
                          setLoraSettings((prev) => ({
                            ...prev,
                            optionalLora1: value,
                          }));
                          // Set default strength when lora is selected
                          if (value !== "none") {
                            const selectedLora = systemLoraOptions.find(
                              (lora) => lora.label === value
                            );
                            if (selectedLora) {
                              setLoraSettings((prev) => ({
                                ...prev,
                                optionalLora1Strength:
                                  selectedLora.default_strength,
                              }));
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select LoRA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {systemLoraOptions.map((lora) => (
                            <SelectItem key={lora.label} value={lora.label}>
                              <div>
                                <div className="font-medium">{lora.label}</div>
                                <div className="text-xs text-gray-400">
                                  {lora.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-xs text-muted-foreground">
                            Strength
                          </Label>
                          <span className="text-xs text-gray-500">
                            {loraSettings.optionalLora1Strength}
                          </span>
                        </div>
                        <Slider
                          value={[loraSettings.optionalLora1Strength]}
                          onValueChange={([value]) =>
                            setLoraSettings((prev) => ({
                              ...prev,
                              optionalLora1Strength: value,
                            }))
                          }
                          min={(() => {
                            const selectedLora = systemLoraOptions.find(
                              (lora) =>
                                lora.label === loraSettings.optionalLora1
                            );
                            return selectedLora
                              ? selectedLora.min_strength
                              : -1;
                          })()}
                          max={(() => {
                            const selectedLora = systemLoraOptions.find(
                              (lora) =>
                                lora.label === loraSettings.optionalLora1
                            );
                            return selectedLora ? selectedLora.max_strength : 2;
                          })()}
                          step={0.05}
                        />
                      </div>
                    </div>

                    {/* Second Optional Lora */}
                    <div className="space-y-3">
                      <Label className="text-xs text-gray-400">
                        Second Optional Lora
                      </Label>
                      <Select
                        value={loraSettings.optionalLora2}
                        onValueChange={(value) => {
                          setLoraSettings((prev) => ({
                            ...prev,
                            optionalLora2: value,
                          }));
                          // Set default strength when lora is selected
                          if (value !== "none") {
                            const selectedLora = systemLoraOptions.find(
                              (lora) => lora.label === value
                            );
                            if (selectedLora) {
                              setLoraSettings((prev) => ({
                                ...prev,
                                optionalLora2Strength:
                                  selectedLora.default_strength,
                              }));
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select LoRA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {systemLoraOptions.map((lora) => (
                            <SelectItem key={lora.label} value={lora.label}>
                              <div>
                                <div className="font-medium">{lora.label}</div>
                                <div className="text-xs text-gray-400">
                                  {lora.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-xs text-muted-foreground">
                            Strength
                          </Label>
                          <span className="text-xs text-gray-500">
                            {loraSettings.optionalLora2Strength}
                          </span>
                        </div>
                        <Slider
                          value={[loraSettings.optionalLora2Strength]}
                          onValueChange={([value]) =>
                            setLoraSettings((prev) => ({
                              ...prev,
                              optionalLora2Strength: value,
                            }))
                          }
                          min={(() => {
                            const selectedLora = systemLoraOptions.find(
                              (lora) =>
                                lora.label === loraSettings.optionalLora2
                            );
                            return selectedLora
                              ? selectedLora.min_strength
                              : -1;
                          })()}
                          max={(() => {
                            const selectedLora = systemLoraOptions.find(
                              (lora) =>
                                lora.label === loraSettings.optionalLora2
                            );
                            return selectedLora ? selectedLora.max_strength : 2;
                          })()}
                          step={0.05}
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Component Picker */}
              <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-950/10 dark:to-blue-950/10 shadow-xl">
                <Collapsible
                  open={isComponentPickerOpen}
                  onOpenChange={setIsComponentPickerOpen}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors">
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Component Picker
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isComponentPickerOpen ? "rotate-180" : ""
                          }`}
                        />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        {componentCategories.map((category) => {
                          const selectedItem =
                            componentPicker[
                              category.key as keyof ComponentPickerState
                            ];
                          const Icon = category.icon;
                          const options = getOptionsForCategory(category.key);

                          return (
                            <div
                              key={category.key}
                              className="group relative border border-gray-600 rounded-lg p-3 cursor-pointer hover:border-purple-500/50 transition-colors"
                              onClick={() =>
                                setSelectedComponentCategory(category.key)
                              }
                            >
                              {selectedItem ? (
                                <>
                                  <div className="aspect-square bg-gray-700 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                                    {selectedItem.image ? (
                                      <img
                                        src={`${config.data_url}/wizard/mappings250/${selectedItem.image}`}
                                        alt={selectedItem.label}
                                        className="w-full h-full object-cover rounded-md"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = "none";
                                          target.nextElementSibling?.classList.remove(
                                            "hidden"
                                          );
                                        }}
                                      />
                                    ) : null}
                                    <Icon
                                      className={`w-6 h-6 text-gray-400 ${
                                        selectedItem.image ? "hidden" : ""
                                      }`}
                                    />
                                  </div>
                                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {selectedItem.label}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {selectedItem.description}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-gray-800/80 hover:bg-red-500/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeComponent(
                                        category.key as keyof ComponentPickerState
                                      );
                                    }}
                                  >
                                    <X className="w-3 h-3 text-red-400" />
                                  </Button>
                                </>
                              ) : (
                                <div className="aspect-square flex flex-col items-center justify-center">
                                  <Icon className="w-6 h-6 text-gray-500 mb-1" />
                                  <p className="text-xs text-gray-500 text-center">
                                    {category.label}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    ({options.length})
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* My Presets */}
              <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-950/10 dark:to-blue-950/10 shadow-xl">
                <Collapsible
                  open={isPresetsOpen}
                  onOpenChange={setIsPresetsOpen}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors">
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          My Presets
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isPresetsOpen ? "rotate-180" : ""
                          }`}
                        />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-400 mb-2 block">
                          Load Preset
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => setShowPresetBrowserModal(true)}
                        >
                          <FolderOpen className="w-3 h-3 mr-2" />
                          Browse Presets
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setShowPresetModal(true)}
                      >
                        <Save className="w-3 h-3 mr-2" />
                        Save Current as Preset
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Inspiration Hub Modal */}
      <Dialog
        open={showInspirationHub}
        onOpenChange={(open) => {
          setShowInspirationHub(open);
          if (!open) {
            setTemplateFolderView("folders");
            setSelectedTemplateFolder(null);
            setSelectedTemplateFolderPresets([]);
            setCurrentTemplateFolderPath([]);
            setTemplateSearchTerm("");
            setSelectedTemplateCategory("all");
            setSelectedTemplateTag("all");
          }
        }}
      >
        <DialogContent className="sm:max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Inspiration Hub
              {templateFolderView === "details" && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                  <ArrowLeft
                    className="w-4 h-4 cursor-pointer hover:text-purple-500"
                    onClick={() => {
                      setTemplateFolderView("folders");
                      setSelectedTemplateFolder(null);
                      setSelectedTemplateFolderPresets([]);
                    }}
                  />
                  <span>{selectedTemplateFolder}</span>
                </div>
              )}
            </DialogTitle>
            <p className="text-muted-foreground">
              Discover and adopt professional templates from our curated
              collection
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {templatesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading templates...</span>
              </div>
            ) : templatePresets.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Templates Found
                </h3>
                <p className="text-muted-foreground">
                  Templates are being prepared for you.
                </p>
              </div>
            ) : templateFolderView === "folders" ? (
              <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
                {/* Featured Templates Carousel */}
                {(() => {
                  const featuredTemplates = templatePresets
                    .filter((preset) => preset.featured || preset.rating >= 4)
                    .slice(0, 6);
                  if (featuredTemplates.length === 0) return null;

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Featured Templates
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setFeaturedTemplateIndex(
                                Math.max(0, featuredTemplateIndex - 5)
                              )
                            }
                            disabled={featuredTemplateIndex === 0}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setFeaturedTemplateIndex(
                                Math.min(
                                  featuredTemplates.length - 5,
                                  featuredTemplateIndex + 5
                                )
                              )
                            }
                            disabled={
                              featuredTemplateIndex >=
                              featuredTemplates.length - 5
                            }
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        {featuredTemplates
                          .slice(
                            featuredTemplateIndex,
                            featuredTemplateIndex + 5
                          )
                          .map((preset) => (
                            <Card
                              key={preset.id}
                              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-950/10 dark:to-blue-950/10"
                            >
                              <div
                                className="relative aspect-[4/5]"
                                onClick={() => adoptTemplate(preset)}
                              >
                                {preset.imageUrl ? (
                                  <img
                                    src={preset.imageUrl}
                                    alt={preset.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTI1IiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                                <Crown className="absolute top-2 right-2 w-5 h-5 text-yellow-400 fill-yellow-400" />
                                {preset.rating > 0 && (
                                  <div className="absolute top-2 left-2 flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= preset.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <h4 className="font-semibold mb-1">
                                  {preset.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {preset.description ||
                                    "Professional template"}
                                </p>
                                <Button
                                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    adoptTemplate(preset);
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Adopt Template
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Search and Filter Bar */}
                <div className="border-b pb-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        value={templateSearchTerm}
                        onChange={(e) => setTemplateSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={selectedTemplateCategory}
                      onValueChange={setSelectedTemplateCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {(() => {
                          const categories = Array.from(
                            new Set(
                              templatePresets
                                .map((p) => p.mainfolder)
                                .filter(Boolean)
                            )
                          );
                          return categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedTemplateTag}
                      onValueChange={setSelectedTemplateTag}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        {(() => {
                          const allTags = templatePresets.flatMap(
                            (p) => p.tags || []
                          );
                          const uniqueTags = Array.from(new Set(allTags));
                          return uniqueTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Hierarchical Folder Navigation */}
                {(() => {
                  // Filter templates based on search and category/tag filters
                  const filteredTemplates = templatePresets.filter((preset) => {
                    const matchesSearch =
                      !templateSearchTerm ||
                      preset.name
                        .toLowerCase()
                        .includes(templateSearchTerm.toLowerCase()) ||
                      (preset.description &&
                        preset.description
                          .toLowerCase()
                          .includes(templateSearchTerm.toLowerCase()));

                    const matchesCategory =
                      selectedTemplateCategory === "all" ||
                      preset.mainfolder === selectedTemplateCategory;
                    const matchesTag =
                      selectedTemplateTag === "all" ||
                      (preset.tags &&
                        preset.tags.includes(selectedTemplateTag));

                    return matchesSearch && matchesCategory && matchesTag;
                  });

                  // Build hierarchical folder structure (same as Browse Presets)
                  const buildTemplateFolderHierarchy = (presets: any[]) => {
                    const hierarchy: any = {};

                    presets.forEach((preset) => {
                      const folders = [];
                      if (preset.mainfolder) folders.push(preset.mainfolder);
                      if (preset.subfolder) folders.push(preset.subfolder);
                      if (preset.subsubfolder)
                        folders.push(preset.subsubfolder);

                      if (folders.length === 0) {
                        folders.push("Uncategorized");
                      }

                      let current = hierarchy;
                      folders.forEach((folder, index) => {
                        if (!current[folder]) {
                          current[folder] = {
                            subfolders: {},
                            presets: [],
                            totalPresets: 0,
                          };
                        }

                        if (index === folders.length - 1) {
                          current[folder].presets.push(preset);
                        }
                        current[folder].totalPresets++;
                        current = current[folder].subfolders;
                      });
                    });

                    return hierarchy;
                  };

                  const fullTemplateHierarchy =
                    buildTemplateFolderHierarchy(filteredTemplates);

                  // Navigate to current path
                  let currentTemplateLevel = fullTemplateHierarchy;
                  currentTemplateFolderPath.forEach((folder) => {
                    if (currentTemplateLevel[folder]) {
                      currentTemplateLevel =
                        currentTemplateLevel[folder].subfolders;
                    }
                  });

                  return (
                    <div className="space-y-4">
                      {/* Back button if we're in a subfolder */}
                      {currentTemplateFolderPath.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentTemplateFolderPath(
                                currentTemplateFolderPath.slice(0, -1)
                              );
                            }}
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to{" "}
                            {currentTemplateFolderPath.length === 1
                              ? "Root"
                              : currentTemplateFolderPath[
                                  currentTemplateFolderPath.length - 2
                                ]}
                          </Button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(currentTemplateLevel).map(
                          ([folderName, folderData]) => {
                            const hasSubfolders =
                              Object.keys(folderData.subfolders).length > 0;
                            const hasPresets = folderData.presets.length > 0;

                            return (
                              <div
                                key={folderName}
                                className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-all cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20 bg-card"
                                onClick={() => {
                                  if (hasSubfolders) {
                                    // Navigate into subfolder
                                    setCurrentTemplateFolderPath([
                                      ...currentTemplateFolderPath,
                                      folderName,
                                    ]);
                                  } else if (hasPresets) {
                                    // Show presets in this folder
                                    setSelectedTemplateFolder(
                                      currentTemplateFolderPath.length > 0
                                        ? `${currentTemplateFolderPath.join(
                                            "/"
                                          )}/${folderName}`
                                        : folderName
                                    );
                                    setSelectedTemplateFolderPresets(
                                      folderData.presets
                                    );
                                    setTemplateFolderView("details");
                                  }
                                }}
                              >
                                <div className="flex items-center justify-center">
                                  {hasSubfolders ? (
                                    <FolderOpen className="w-12 h-12 text-purple-500" />
                                  ) : (
                                    <Folder className="w-12 h-12 text-blue-500" />
                                  )}
                                </div>

                                <div className="text-center">
                                  <h3 className="text-lg font-semibold mb-1">
                                    {folderName}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {folderData.totalPresets} template
                                    {folderData.totalPresets !== 1 ? "s" : ""}
                                    {hasSubfolders && (
                                      <span className="block text-xs">
                                        {
                                          Object.keys(folderData.subfolders)
                                            .length
                                        }{" "}
                                        subfolder
                                        {Object.keys(folderData.subfolders)
                                          .length !== 1
                                          ? "s"
                                          : ""}
                                      </span>
                                    )}
                                  </p>
                                </div>

                                {/* Folder preview - show some images */}
                                <div className="grid grid-cols-3 gap-1">
                                  {folderData.presets
                                    .slice(0, 3)
                                    .map((preset: any, index: number) => (
                                      <div
                                        key={index}
                                        className="aspect-square"
                                      >
                                        {preset.imageUrl ? (
                                          <img
                                            src={preset.imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-sm"
                                            onError={(e) => {
                                              (
                                                e.target as HTMLImageElement
                                              ).src =
                                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjdmN2Y3Ii8+PC9zdmc+";
                                            }}
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-sm flex items-center justify-center">
                                            <ImageIcon className="w-4 h-4 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  {folderData.presets.length < 3 &&
                                    Array.from({
                                      length: 3 - folderData.presets.length,
                                    }).map((_, index) => (
                                      <div
                                        key={`empty-${index}`}
                                        className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-sm"
                                      />
                                    ))}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Template Details View */
              <div className="overflow-y-auto max-h-[70vh] pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedTemplateFolderPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow bg-card"
                    >
                      {/* Template Image in 4:5 format */}
                      <div className="relative aspect-[4/5]">
                        {preset.imageUrl ? (
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        {/* Favorite indicator */}
                        {preset.favorite && (
                          <Heart className="absolute top-2 right-2 w-5 h-5 fill-red-500 text-red-500" />
                        )}
                      </div>

                      {/* Template Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold truncate text-sm">
                            {preset.name}
                          </h4>
                          {preset.rating > 0 && (
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= preset.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {preset.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {preset.description}
                          </p>
                        )}

                        {preset.tags && preset.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {preset.tags
                              .slice(0, 2)
                              .map((tag: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            {preset.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{preset.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            onClick={() => adoptTemplate(preset)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Adopt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Just show a preview or info
                              toast.info("Template preview coming soon!");
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Influencer Selection Dialog */}
      {showInfluencerSelector && (
        <Dialog open={true} onOpenChange={setShowInfluencerSelector}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto p-0">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 bg-white/5 rounded-full -translate-y-10 sm:-translate-y-16 lg:-translate-y-20 translate-x-10 sm:translate-x-16 lg:translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white/5 rounded-full translate-y-8 sm:translate-y-12 lg:translate-y-16 -translate-x-8 sm:-translate-x-12 lg:-translate-x-16"></div>

              <div className="relative z-10 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-white/20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl sm:shadow-2xl">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  Select Influencer
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base lg:text-lg text-purple-100 leading-relaxed max-w-2xl mx-auto">
                  Choose an influencer to generate your content with. Each
                  influencer has unique characteristics and style.
                </DialogDescription>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-4">
              {/* Search Section */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -trangray-y-1/2 text-muted-foreground h-4 w-4" />
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
                        className="absolute right-2 top-1/2 transform -trangray-y-1/2 h-6 w-6 p-0"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredInfluencers?.map((influencer) => (
                  <Card
                    key={influencer.id}
                    className={cn(
                      "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                      modelData?.id === influencer.id
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-xl scale-105"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                    )}
                    data-testid={`card-influencer-${influencer.id}`}
                  >
                    <CardContent className="p-4 sm:p-6 h-full">
                      <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
                        <div
                          className="relative w-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden cursor-pointer"
                          onDoubleClick={() => {
                            handleUseInfluencer(influencer);
                            setShowInfluencerSelector(false);
                          }}
                        >
                          {/* Selection check icon for active influencer */}
                          {modelData?.id === influencer.id && (
                            <div className="absolute left-2 top-2 z-20 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {/* AI Consistency Status Badge positioned at top right */}
                          <div className="absolute right-1 top-0.5 z-10">
                            {(influencer.lorastatus || 0) === 2 ? (
                              <Badge className="bg-green-600/50 text-white text-[10px] px-1.5 py-0.5 font-medium rounded-sm shadow-sm">
                                Trained
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/50 text-white text-[10px] px-1.5 py-0.5 font-medium rounded-sm shadow-sm">
                                Pending
                              </Badge>
                            )}
                          </div>

                          {influencer.image_url ? (
                            <img
                              src={influencer.image_url}
                              alt={`${influencer.name_first} ${influencer.name_last}`}
                              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA3NyEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4=";
                              }}
                            />
                          ) : (
                            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                              <User className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 flex-1">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate text-center">
                            {influencer.name_first} {influencer.name_last}
                          </h4>
                        </div>

                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              handleUseInfluencer(influencer);
                              setShowInfluencerSelector(false);
                            }}
                            className={cn(
                              "w-full transition-all duration-300 group-hover:shadow-lg font-medium",
                              modelData?.id === influencer.id
                                ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                            )}
                            data-testid={`button-use-influencer-${influencer.id}`}
                          >
                            {modelData?.id === influencer.id ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Selected
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Select
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {(filteredInfluencers?.length === 0 || !filteredInfluencers) && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {!influencers || influencers.length === 0
                      ? "No influencers available. Please check if influencers are loaded."
                      : "No influencers found matching your search."}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Component Picker Dialog */}
      {selectedComponentCategory && (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              // Save current folder path for this category before closing
              if (selectedComponentCategory && currentFolder) {
                setComponentFolderPaths((prev) => ({
                  [selectedComponentCategory]: currentFolder.path || [],
                }));
              }
              setSelectedComponentCategory(null);
              setCurrentFolder(null);
              setComponentSearchTerm("");
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                Select{" "}
                {
                  componentCategories.find(
                    (cat) => cat.key === selectedComponentCategory
                  )?.label
                }
              </DialogTitle>
              <DialogDescription>
                Choose from{" "}
                {getOptionsForCategory(selectedComponentCategory).length}{" "}
                available options
              </DialogDescription>
            </DialogHeader>

            {/* Search Bar */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={`Search ${
                      componentCategories
                        .find((cat) => cat.key === selectedComponentCategory)
                        ?.label?.toLowerCase() || "items"
                    }...`}
                    value={componentSearchTerm}
                    onChange={(e) => setComponentSearchTerm(e.target.value)}
                    className="pl-10 h-8"
                  />
                </div>
                {componentSearchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setComponentSearchTerm("")}
                    className="h-8 px-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-1">
              {(() => {
                const category = componentCategories.find(
                  (cat) => cat.key === selectedComponentCategory
                );
                const Icon = category?.icon;
                const hasFolder = hasFolderStructure(
                  selectedComponentCategory!
                );

                // Show search results if there is a search term
                if (componentSearchTerm.trim()) {
                  const searchResults = searchComponentItems(
                    selectedComponentCategory!,
                    componentSearchTerm
                  );
                  return (
                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Found {searchResults.length} result
                          {searchResults.length !== 1 ? "s" : ""} for "
                          {componentSearchTerm}"
                        </p>
                      </div>
                      {searchResults.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                          {searchResults.map((option: any, index: number) => (
                            <div
                              key={`search-${option.label}-${index}`}
                              className="group relative border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 transition-colors bg-gray-800/50"
                              onClick={() => {
                                addComponent(
                                  selectedComponentCategory as keyof ComponentPickerState,
                                  option
                                );
                                setSelectedComponentCategory(null);
                                setCurrentFolder(null);
                                setComponentSearchTerm("");
                              }}
                            >
                              <div className="aspect-square bg-gray-700 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                                {option.image && (
                                  <img
                                    src={`${config.data_url}/wizard/mappings250/${option.image}`}
                                    alt={option.label}
                                    className="w-full h-full object-cover rounded-md"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      target.nextElementSibling?.classList.remove(
                                        "hidden"
                                      );
                                    }}
                                  />
                                )}
                                {Icon && (
                                  <Icon
                                    className={`w-8 h-8 text-gray-400 ${
                                      option.image ? "hidden" : ""
                                    }`}
                                  />
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                                  {option.label}
                                </p>
                                {option.folderName && (
                                  <p className="text-xs text-gray-500">
                                    from {option.folderName}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No items found matching "{componentSearchTerm}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }

                if (hasFolder && !currentFolder) {
                  // Show folder structure for scene, pose, outfit
                  const categories = getCategoriesForType(
                    selectedComponentCategory!
                  );
                  return categories.length > 0 ? (
                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {categories.map((folder, index) => {
                          const previewImage = getFolderPreviewImage(folder);
                          return (
                            <div
                              key={`${folder.property_category}-${index}`}
                              className="group cursor-pointer p-4 border border-gray-600 rounded-lg hover:border-purple-500/50 transition-colors bg-gray-800/50"
                              onClick={() => setCurrentFolder(folder)}
                            >
                              <div className="aspect-square bg-gray-700 rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                                {previewImage ? (
                                  <>
                                    <img
                                      src={`${config.data_url}/wizard/mappings250/${previewImage}`}
                                      alt={folder.property_category}
                                      className="w-full h-full object-cover rounded-md"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        target.nextElementSibling?.classList.remove(
                                          "hidden"
                                        );
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center hidden">
                                      <Folder className="w-8 h-8 text-gray-400" />
                                    </div>
                                    {/* Overlay folder icon */}
                                    <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
                                      <Folder className="w-4 h-4 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <Folder className="w-8 h-8 text-gray-400" />
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                                  {folder.property_category}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {folder.data?.length || 0} items
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-12">
                      <Folder className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-lg">No categories available</p>
                    </div>
                  );
                } else {
                  // Show items (either from folder or direct options)
                  const options = currentFolder
                    ? currentFolder.data
                    : getOptionsForCategory(selectedComponentCategory!);

                  return (
                    <div className="p-4">
                      {currentFolder && (
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentFolder(null)}
                            className="h-8 px-2"
                          >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                          </Button>
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {currentFolder.property_category}
                            </h3>
                            <Badge variant="secondary">
                              {currentFolder.data?.length || 0} items
                            </Badge>
                          </div>
                        </div>
                      )}

                      {options.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                          {options.map((option: any, index: number) => (
                            <div
                              key={`${option.label}-${index}`}
                              className="group relative border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 transition-colors bg-gray-800/50"
                              onClick={() => {
                                addComponent(
                                  selectedComponentCategory as keyof ComponentPickerState,
                                  option
                                );
                                // Save current folder path for this category before closing
                                if (
                                  selectedComponentCategory &&
                                  currentFolder
                                ) {
                                  setComponentFolderPaths((prev) => ({
                                    ...prev,
                                    [selectedComponentCategory]:
                                      currentFolder.path || [],
                                  }));
                                }
                                setSelectedComponentCategory(null);
                                setCurrentFolder(null);
                              }}
                            >
                              <div className="aspect-square bg-gray-700 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                                {option.image && (
                                  <img
                                    src={`${config.data_url}/wizard/mappings250/${option.image}`}
                                    alt={option.label}
                                    className="w-full h-full object-cover rounded-md"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      target.nextElementSibling?.classList.remove(
                                        "hidden"
                                      );
                                    }}
                                  />
                                )}
                                {Icon && (
                                  <Icon
                                    className={`w-8 h-8 text-gray-400 ${
                                      option.image ? "hidden" : ""
                                    }`}
                                  />
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                                  {option.label}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-12">
                          {Icon && (
                            <Icon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                          )}
                          <p className="text-lg">
                            No {category?.label.toLowerCase()} options available
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Check back later for new options
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Settings Edit Modal */}
      {editingSetting && (
        <Dialog
          open={!!editingSetting}
          onOpenChange={() => setEditingSetting(null)}
        >
          <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle>
                {editingSetting.field === "promptAdherence"
                  ? "Set Prompt Adherence"
                  : editingSetting.field === "nsfwStrength"
                  ? "Edit NSFW Factor"
                  : editingSetting.field === "format"
                  ? "Image Aspect Ratio"
                  : editingSetting.field === "images"
                  ? "Number of Images"
                  : editingSetting.field === "engine"
                  ? "Engine Selection"
                  : `Edit ${editingSetting.field}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingSetting.inputType === "select" &&
                editingSetting.options && (
                  <>
                    <Label>
                      {editingSetting.field === "format"
                        ? "Select Aspect Ratio"
                        : editingSetting.field === "engine"
                        ? "Which Engine to choose for image generation?"
                        : `Select ${editingSetting.field}`}
                    </Label>
                    <Select
                      value={editingSetting.value}
                      onValueChange={saveSettingEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {editingSetting.options.map((option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

              {editingSetting.inputType === "slider" && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 mt-1">
                          {editingSetting.field === "promptAdherence"
                            ? "Select between creativity and strict Prompt adherence"
                            : editingSetting.field === "nsfwStrength"
                            ? "How naughty shall it get?"
                            : editingSetting.field === "images"
                            ? "How many images do you want to generate?"
                            : ""}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {editingSetting.value}
                        {editingSetting.field === "promptAdherence" &&
                          ` (${getAdherenceLabel(editingSetting.value)})`}
                        {editingSetting.field === "nsfwStrength" &&
                          ` (${getNsfwLabel(editingSetting.value)})`}
                      </span>
                    </div>
                  </div>
                  {(editingSetting.field === "promptAdherence" ||
                    editingSetting.field === "nsfwStrength") && (
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>
                        {editingSetting.field === "promptAdherence"
                          ? "Maximum Creativity"
                          : "Safe at Work"}
                      </span>
                      <span>
                        {editingSetting.field === "promptAdherence"
                          ? "Strictly follow the Prompt"
                          : "Let's get HOT"}
                      </span>
                    </div>
                  )}
                  <Slider
                    value={[editingSetting.value]}
                    onValueChange={([value]) =>
                      setEditingSetting((prev) =>
                        prev ? { ...prev, value } : null
                      )
                    }
                    min={(() => {
                      switch (editingSetting.field) {
                        case "images":
                          return 1;
                        case "promptAdherence":
                          return 1;
                        case "nsfwStrength":
                          return -1;
                        default:
                          return 0;
                      }
                    })()}
                    max={(() => {
                      switch (editingSetting.field) {
                        case "images":
                          return 8;
                        case "promptAdherence":
                          return 8;
                        case "nsfwStrength":
                          return 1;
                        default:
                          return 10;
                      }
                    })()}
                    step={editingSetting.field === "images" ? 1 : 0.1}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSetting(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveSettingEdit(editingSetting.value)}
                    >
                      Save
                    </Button>
                  </div>
                </>
              )}

              {editingSetting.inputType === "input" && (
                <>
                  <Label>
                    Seed (optional) - same value allows for same result
                  </Label>
                  <Input
                    value={editingSetting.value}
                    onChange={(e) =>
                      setEditingSetting((prev) =>
                        prev ? { ...prev, value: e.target.value } : null
                      )
                    }
                    placeholder="Enter seed or leave empty for random"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSetting(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveSettingEdit(editingSetting.value)}
                    >
                      Save
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Modal */}
      <Dialog
        open={shareModal.open}
        onOpenChange={(open) => setShareModal((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Image</DialogTitle>
            <DialogDescription>
              Share this image with others using the direct link or QR code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="flex justify-center">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />
              </div>
            )}

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
                  onClick={() =>
                    copyToClipboard(
                      `${config.data_url}/${userData.id}/${shareModal.itemPath}/${shareModal.itemId}`
                    )
                  }
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Social Media Share */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Share on Social Media
              </Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setShareModal({ open: false, itemId: null, itemPath: null })
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Size Image Modal */}
      <Dialog
        open={fullSizeImageModal.isOpen}
        onOpenChange={(open) =>
          setFullSizeImageModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <img
              src={fullSizeImageModal.imageUrl}
              alt={fullSizeImageModal.imageName}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute top-4 right-4"
              onClick={() =>
                setFullSizeImageModal({
                  isOpen: false,
                  imageUrl: "",
                  imageName: "",
                })
              }
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zoom Modal for Generated Images */}
      <Dialog
        open={zoomModal.open}
        onOpenChange={(open) => setZoomModal((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative">
            <img
              src={zoomModal.imageUrl}
              alt={zoomModal.imageName}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
            <Button
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
              size="sm"
              onClick={() =>
                setZoomModal({ open: false, imageUrl: "", imageName: "" })
              }
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm font-medium">{zoomModal.imageName}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Modal for Generated Images */}
      <Dialog
        open={imageInfoModal.open}
        onOpenChange={(open) => {
          if (!open) {
            setImageInfoModal({ open: false, image: null });
            setEditingImageData(null);
            setTempRating(0);
            setNewTag("");
          } else if (imageInfoModal.image) {
            // Find the current image data from the generatedImages state (most up-to-date)
            const currentImage =
              generatedImages.find(
                (img) => img.id === imageInfoModal.image.id
              ) || imageInfoModal.image;

            setEditingImageData({
              user_filename: currentImage.user_filename || "",
              user_notes: currentImage.user_notes || "",
              user_tags: Array.isArray(currentImage.user_tags)
                ? currentImage.user_tags.join(", ")
                : currentImage.user_tags || "",
              rating: currentImage.rating || 0,
              favorite: currentImage.favorite || false,
            });
            setTempRating(currentImage.rating || 0);
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          {imageInfoModal.image && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Image Details</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 ${
                      editingImageData?.favorite
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                    onClick={() =>
                      setEditingImageData((prev: any) => ({
                        ...(prev || {}),
                        favorite: !(prev?.favorite || false),
                      }))
                    }
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        editingImageData?.favorite ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {/* Image Preview - Smaller */}
              <div className="flex justify-center">
                <img
                  src={`${config.data_url}/${imageInfoModal.image.file_path}`}
                  alt={imageInfoModal.image.system_filename}
                  className="max-w-[150px] w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  Editable Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="user-filename"
                      className="text-sm font-medium"
                    >
                      User Filename
                    </Label>
                    <Input
                      id="user-filename"
                      value={editingImageData?.user_filename || ""}
                      onChange={(e) =>
                        setEditingImageData((prev: any) => ({
                          ...(prev || {}),
                          user_filename: e.target.value,
                        }))
                      }
                      placeholder="Enter custom filename"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Rating</Label>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            const newRating = tempRating === star ? 0 : star;
                            setTempRating(newRating);
                            setEditingImageData((prev: any) => ({
                              ...(prev || {}),
                              rating: newRating,
                            }));
                          }}
                          className="focus:outline-none transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= tempRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="user-notes" className="text-sm font-medium">
                    Notes
                  </Label>
                  <textarea
                    id="user-notes"
                    value={editingImageData?.user_notes || ""}
                    onChange={(e) =>
                      setEditingImageData((prev: any) => ({
                        ...(prev || {}),
                        user_notes: e.target.value,
                      }))
                    }
                    placeholder="Add your notes..."
                    className="mt-1 w-full min-h-[60px] px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-vertical bg-background text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="mt-2 space-y-2">
                    {/* Tag Input */}
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newTag.trim()) {
                              setEditingImageData((prev: any) => ({
                                ...(prev || {}),
                                user_tags:
                                  prev?.user_tags || ""
                                    ? `${prev.user_tags}, ${newTag.trim()}`
                                    : newTag.trim(),
                              }));
                              setNewTag("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (newTag.trim()) {
                            setEditingImageData((prev: any) => ({
                              ...(prev || {}),
                              user_tags:
                                prev?.user_tags || ""
                                  ? `${prev.user_tags}, ${newTag.trim()}`
                                  : newTag.trim(),
                            }));
                            setNewTag("");
                          }
                        }}
                        className="px-3"
                      >
                        Add
                      </Button>
                    </div>
                    {/* Tag Display */}
                    {editingImageData?.user_tags && (
                      <div className="flex flex-wrap gap-2">
                        {editingImageData.user_tags
                          .split(",")
                          .map((tag: string) => tag.trim())
                          .filter((tag: string) => tag)
                          .map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingImageData?.user_tags) {
                                    const tags = editingImageData.user_tags
                                      .split(",")
                                      .map((t: string) => t.trim())
                                      .filter((t: string) => t !== tag);
                                    setEditingImageData((prev: any) => ({
                                      ...(prev || {}),
                                      user_tags: tags.join(", "),
                                    }));
                                  }
                                }}
                                className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Read-only Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">
                  System Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      System Filename
                    </Label>
                    <p className="text-sm break-all bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">
                      {imageInfoModal.image.system_filename}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Generation Status
                    </Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          imageInfoModal.image.generation_status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {imageInfoModal.image.generation_status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Created
                    </Label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">
                      {new Date(
                        imageInfoModal.image.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Model Version
                    </Label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">
                      {imageInfoModal.image.model_version}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      NSFW Strength
                    </Label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">
                      {imageInfoModal.image.nsfw_strength}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      LoRA Strength
                    </Label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">
                      {imageInfoModal.image.lora_strength}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Optimized Prompt
                  </Label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1 max-h-20 overflow-y-auto">
                    {imageInfoModal.image.t5xxl_prompt || "No prompt available"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setImageInfoModal({ open: false, image: null });
                    setEditingImageData(null);
                    setTempRating(0);
                    setNewTag("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!editingImageData || !imageInfoModal.image) return;

                    try {
                      const updateData = {
                        user_filename: editingImageData.user_filename || "",
                        user_notes: editingImageData.user_notes || "",
                        user_tags: editingImageData.user_tags
                          ? editingImageData.user_tags
                              .split(",")
                              .map((tag: string) => tag.trim())
                              .filter((tag: string) => tag)
                          : [],
                        rating: editingImageData.rating || 0,
                        favorite: editingImageData.favorite || false,
                      };

                      const response = await fetch(
                        `${config.supabase_server_url}/generated_images?id=eq.${imageInfoModal.image.id}`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer WeInfl3nc3withAI",
                          },
                          body: JSON.stringify(updateData),
                        }
                      );

                      if (response.ok) {
                        // Update local state with correct data structure
                        setGeneratedImages((prev) =>
                          prev.map((img) =>
                            img.id === imageInfoModal.image.id
                              ? {
                                  ...img,
                                  user_filename: updateData.user_filename,
                                  user_notes: updateData.user_notes,
                                  user_tags: updateData.user_tags,
                                  rating: updateData.rating,
                                  favorite: updateData.favorite,
                                }
                              : img
                          )
                        );

                        toast.success("Image updated successfully");
                        setImageInfoModal({ open: false, image: null });
                        setEditingImageData(null);
                        setTempRating(0);
                        setNewTag("");
                      } else {
                        toast.error("Failed to update image");
                      }
                    } catch (error) {
                      console.error("Error updating image:", error);
                      toast.error("Failed to update image");
                    }
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preset Save Modal */}
      <Dialog open={showPresetModal} onOpenChange={setShowPresetModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Archive className="w-6 h-6" />
              Save Current Settings as Preset
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Save your current configuration to reuse later. Organize presets
              using folders.
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Two-Column Layout: Form Left, Image Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Preset Information
                </h3>

                {/* Preset Name */}
                <div>
                  <Label className="text-sm font-medium">Preset Name *</Label>
                  <Input
                    value={presetData.name}
                    onChange={(e) =>
                      setPresetData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter preset name"
                    className="mt-1"
                    maxLength={100}
                  />
                </div>

                {/* Rating und Mark as Favorite in einer Zeile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <Label className="text-sm font-medium">Rating</Label>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setPresetData((prev) => ({
                              ...prev,
                              rating: prev.rating === star ? 0 : star,
                            }))
                          }
                          className="focus:outline-none transition-colors"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= presetData.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-6 md:mt-8">
                    <input
                      type="checkbox"
                      id="favorite-preset"
                      checked={presetData.favorite}
                      onChange={(e) =>
                        setPresetData((prev) => ({
                          ...prev,
                          favorite: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300"
                    />
                    <Label
                      htmlFor="favorite-preset"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Mark as favorite
                    </Label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={presetData.description}
                    onChange={(e) =>
                      setPresetData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe this preset configuration..."
                    className="mt-1"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {/* Folder Structure */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Folder Organization
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      value={presetData.mainFolder}
                      onChange={(e) =>
                        setPresetData((prev) => ({
                          ...prev,
                          mainFolder: e.target.value,
                        }))
                      }
                      placeholder="Main Folder (e.g. Portraits)"
                      className="mt-1"
                    />
                    <Input
                      value={presetData.subFolder}
                      onChange={(e) =>
                        setPresetData((prev) => ({
                          ...prev,
                          subFolder: e.target.value,
                        }))
                      }
                      placeholder="Sub Folder (e.g. Casual)"
                      className="mt-1"
                    />
                    <Input
                      value={presetData.subSubFolder}
                      onChange={(e) =>
                        setPresetData((prev) => ({
                          ...prev,
                          subSubFolder: e.target.value,
                        }))
                      }
                      placeholder="Sub-sub Folder (e.g. Indoor)"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {presetData.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setPresetData((prev) => ({
                                ...prev,
                                tags: prev.tags.filter((_, i) => i !== index),
                              }))
                            }
                            className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag (e.g., portrait, landscape, art)"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            const newTag = input.value.trim();
                            if (newTag && !presetData.tags.includes(newTag)) {
                              setPresetData((prev) => ({
                                ...prev,
                                tags: [...prev.tags, newTag],
                              }));
                              input.value = "";
                            }
                          }
                        }}
                        className="flex-1"
                        maxLength={50}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          const input = (
                            e.target as HTMLElement
                          ).parentElement?.querySelector(
                            "input"
                          ) as HTMLInputElement;
                          const newTag = input?.value.trim();
                          if (newTag && !presetData.tags.includes(newTag)) {
                            setPresetData((prev) => ({
                              ...prev,
                              tags: [...prev.tags, newTag],
                            }));
                            input.value = "";
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Press Enter or click + to add tags.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Image with Buttons */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Preset Image</Label>

                {/* Image Display - 300px width */}
                <div className="relative w-[300px] mx-auto">
                  {presetData.selectedImage ? (
                    <img
                      src={presetData.selectedImage}
                      alt="Preset image"
                      className="w-full h-full object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                      }}
                    />
                  ) : (
                    <div className="w-full h-[375px] bg-gray-100 dark:bg-gray-800 rounded-lg border flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          No image selected
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Selection Buttons */}
                <div className="space-y-2 w-[300px] mx-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (generatedImages.length > 0) {
                        const firstImage = generatedImages[0];
                        const imageUrl = `${config.data_url}/${userData.id}/output/${firstImage.system_filename}`;
                        setPresetData((prev) => ({
                          ...prev,
                          selectedImage: imageUrl,
                        }));
                        toast.success("Current image selected for preset");
                      } else {
                        toast.error("No current image available");
                      }
                    }}
                    disabled={generatedImages.length === 0}
                    className="w-full text-sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Use Current Image
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVaultSelector(true)}
                    className="w-full text-sm"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Browse Library
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileUpload}
                    disabled={uploadingImage}
                    className="w-full text-sm"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload Image
                  </Button>

                  {presetData.selectedImage && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setPresetData((prev) => ({
                          ...prev,
                          selectedImage: null,
                        }))
                      }
                      className="w-full text-sm text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove Image
                    </Button>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Optional: Add an image to help identify this preset
                </p>
              </div>
            </div>

            {/* Current Settings Preview - Complete Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Current Settings Preview
              </h3>

              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg space-y-4">
                {/* Basic Settings - Format to Seed - 2x3 Layout (6 Werte) */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Format:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {imageSettings.format}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Engine:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {imageSettings.engine}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Images:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {imageSettings.images}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Adherence:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {imageSettings.promptAdherence}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        NSFW:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {imageSettings.nsfwStrength}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Seed:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {imageSettings.seed || "Random"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Consistency (LORA Settings) - Strength links, LORA 1 rechts */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Consistency
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Strength:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {loraSettings.influencerStrength}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        LORA 1:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {loraSettings.optionalLora1} (
                        {loraSettings.optionalLora1Strength})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Consistency:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {loraSettings.influencerConsistency ? "ON" : "OFF"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        LORA 2:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {loraSettings.optionalLora2} (
                        {loraSettings.optionalLora2Strength})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Component Picker - All 8 Options */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Component Picker
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Camera className="w-3 h-3 text-blue-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Scene:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {componentPicker.scene?.label || "None"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-green-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Pose:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {componentPicker.pose?.label || "None"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Shirt className="w-3 h-3 text-purple-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Outfit:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {componentPicker.outfit?.label || "None"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Monitor className="w-3 h-3 text-teal-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Framing:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {componentPicker.framing?.label || "None"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Sun className="w-3 h-3 text-yellow-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Lighting:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {componentPicker.lighting?.label || "None"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-3 h-3 text-pink-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Rotation:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {componentPicker.rotation?.label || "None"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-rose-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Makeup:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {componentPicker.makeup?.label || "None"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Accessory:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 truncate">
                        {componentPicker.accessory?.label || "None"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowPresetModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePresetWithImage}
              disabled={isSavingPreset || !presetData.name.trim()}
              className="flex-1"
            >
              {isSavingPreset ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4 mr-2" />
                  Save Preset
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preset Browser Modal */}
      <Dialog
        open={showPresetBrowserModal}
        onOpenChange={(open) => {
          setShowPresetBrowserModal(open);
          if (!open) {
            setBrowseFolderView("folders");
            setSelectedFolder(null);
            setSelectedFolderPresets([]);
            setCurrentFolderPath([]);
            setFolderHierarchy({});
          }
        }}
      >
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {browseFolderView === "folders" ? (
                <>
                  <FolderOpen className="w-6 h-6" />
                  Browse Presets - Folders
                  {currentFolderPath.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                      {currentFolderPath.map((folder, index) => (
                        <span key={index}>
                          {index > 0 && <span className="mx-1">/</span>}
                          <button
                            className="hover:text-purple-500 underline"
                            onClick={() => {
                              setCurrentFolderPath(
                                currentFolderPath.slice(0, index + 1)
                              );
                            }}
                          >
                            {folder}
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <ArrowLeft
                    className="w-6 h-6 cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      setBrowseFolderView("folders");
                      setSelectedFolder(null);
                      setSelectedFolderPresets([]);
                    }}
                  />
                  <span>{selectedFolder}</span>
                </>
              )}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {browseFolderView === "folders"
                ? "Select a folder to browse presets"
                : `Browse presets in ${selectedFolder}`}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {presetsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading presets...</span>
              </div>
            ) : availablePresets.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Presets Found</h3>
                <p className="text-gray-500 mb-4">
                  You haven't saved any presets yet.
                </p>
                <Button onClick={() => setShowPresetModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Preset
                </Button>
              </div>
            ) : browseFolderView === "folders" ? (
              /* Hierarchical Folder Navigation View */
              (() => {
                // Build hierarchical folder structure
                const buildFolderHierarchy = (presets: any[]) => {
                  const hierarchy: any = {};

                  presets.forEach((preset) => {
                    const folders = [];
                    if (preset.mainfolder) folders.push(preset.mainfolder);
                    if (preset.subfolder) folders.push(preset.subfolder);
                    if (preset.subsubfolder) folders.push(preset.subsubfolder);

                    if (folders.length === 0) {
                      folders.push("Uncategorized");
                    }

                    let current = hierarchy;
                    folders.forEach((folder, index) => {
                      if (!current[folder]) {
                        current[folder] = {
                          subfolders: {},
                          presets: [],
                          totalPresets: 0,
                        };
                      }

                      if (index === folders.length - 1) {
                        current[folder].presets.push(preset);
                      }
                      current[folder].totalPresets++;
                      current = current[folder].subfolders;
                    });
                  });

                  return hierarchy;
                };

                const fullHierarchy = buildFolderHierarchy(availablePresets);

                // Navigate to current path
                let currentLevel = fullHierarchy;
                currentFolderPath.forEach((folder) => {
                  if (currentLevel[folder]) {
                    currentLevel = currentLevel[folder].subfolders;
                  }
                });

                return (
                  <div className="space-y-4">
                    {/* Back button if we're in a subfolder */}
                    {currentFolderPath.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentFolderPath(
                              currentFolderPath.slice(0, -1)
                            );
                          }}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to{" "}
                          {currentFolderPath.length === 1
                            ? "Root"
                            : currentFolderPath[currentFolderPath.length - 2]}
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(currentLevel).map(
                        ([folderName, folderData]) => {
                          const hasSubfolders =
                            Object.keys(folderData.subfolders).length > 0;
                          const hasPresets = folderData.presets.length > 0;

                          return (
                            <div
                              key={folderName}
                              className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-all cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20 bg-card"
                              onClick={() => {
                                if (hasSubfolders) {
                                  // Navigate into subfolder
                                  setCurrentFolderPath([
                                    ...currentFolderPath,
                                    folderName,
                                  ]);
                                } else if (hasPresets) {
                                  // Show presets in this folder
                                  setSelectedFolder(
                                    currentFolderPath.length > 0
                                      ? `${currentFolderPath.join(
                                          "/"
                                        )}/${folderName}`
                                      : folderName
                                  );
                                  setSelectedFolderPresets(folderData.presets);
                                  setBrowseFolderView("details");
                                }
                              }}
                            >
                              <div className="flex items-center justify-center">
                                {hasSubfolders ? (
                                  <FolderOpen className="w-12 h-12 text-purple-500" />
                                ) : (
                                  <Folder className="w-12 h-12 text-blue-500" />
                                )}
                              </div>

                              <div className="text-center">
                                <h3 className="text-lg font-semibold mb-1">
                                  {folderName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {folderData.totalPresets} preset
                                  {folderData.totalPresets !== 1 ? "s" : ""}
                                  {hasSubfolders && (
                                    <span className="block text-xs">
                                      {
                                        Object.keys(folderData.subfolders)
                                          .length
                                      }{" "}
                                      subfolder
                                      {Object.keys(folderData.subfolders)
                                        .length !== 1
                                        ? "s"
                                        : ""}
                                    </span>
                                  )}
                                </p>
                              </div>

                              {/* Folder preview - show some images */}
                              <div className="grid grid-cols-3 gap-1">
                                {folderData.presets
                                  .slice(0, 3)
                                  .map((preset: any, index: number) => (
                                    <div key={index} className="aspect-square">
                                      {preset.imageUrl ? (
                                        <img
                                          src={preset.imageUrl}
                                          alt="Preview"
                                          className="w-full h-full object-cover rounded-sm"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjdmN2Y3Ii8+PC9zdmc+";
                                          }}
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-sm flex items-center justify-center">
                                          <ImageIcon className="w-4 h-4 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                {folderData.presets.length < 3 &&
                                  Array.from({
                                    length: 3 - folderData.presets.length,
                                  }).map((_, index) => (
                                    <div
                                      key={`empty-${index}`}
                                      className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-sm"
                                    />
                                  ))}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Details View for Selected Folder with 4:5 Images */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedFolderPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow bg-card"
                  >
                    {/* Preset Image in 4:5 format */}
                    <div className="relative aspect-[4/5]">
                      {preset.imageUrl ? (
                        <img
                          src={preset.imageUrl}
                          alt={preset.name}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      {/* Favorite indicator */}
                      {preset.favorite && (
                        <Heart className="absolute top-2 right-2 w-5 h-5 fill-red-500 text-red-500" />
                      )}
                    </div>

                    {/* Preset Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold truncate text-sm">
                          {preset.name}
                        </h4>
                        {preset.rating > 0 && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= preset.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {preset.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {preset.description}
                        </p>
                      )}

                      {/* Tags */}
                      {preset.tags && preset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {preset.tags
                            .slice(0, 2)
                            .map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          {preset.tags.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                              +{preset.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => loadPreset(preset)}
                        className="flex-1 text-xs"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Load
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editPreset(preset)}
                        className="flex-1 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowPresetBrowserModal(false);
                setBrowseFolderView("folders");
                setSelectedFolder(null);
                setSelectedFolderPresets([]);
              }}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowPresetBrowserModal(false);
                setShowPresetModal(true);
              }}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Preset
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vault Selector Modal for Library Browsing */}
      <VaultSelector
        open={showVaultSelector}
        onOpenChange={setShowVaultSelector}
        onImageSelect={async (image) => {
          try {
            const filename = `preset_${Date.now()}.jpg`;
            const copiedImageUrl = await copyImageToPresets(image, filename);
            setPresetData((prev) => ({
              ...prev,
              selectedImage: copiedImageUrl,
            }));
            setShowVaultSelector(false);
            toast.success("Image selected and copied to presets");
          } catch (error) {
            console.error("Error copying image:", error);
            toast.error("Failed to copy image to presets");
          }
        }}
        title="Select Image for Preset"
      />

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image for Preset</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select an image file to use with this preset.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="preset-image-upload"
              />
              <label htmlFor="preset-image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {uploading ? "Uploading..." : "Click to select image"}
                </p>
                <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Warning Modal */}
      <CreditConfirmationModal
        isOpen={showCreditWarning}
        onClose={() => setShowCreditWarning(false)}
        onConfirm={() => {
          console.log(
            "🚀 Continue Generation clicked - calling proceedWithGeneration()"
          );
          setShowCreditWarning(false);
          proceedWithGeneration();
        }}
        gemCostData={(() => {
          const pricePerImage = gemCostData?.gems || 0;
          const totalCost = pricePerImage * imageSettings.images;
          return {
            id: 1,
            item: imageSettings.engine,
            description: `Generate ${imageSettings.images} image${
              imageSettings.images > 1 ? "s" : ""
            }`,
            gems: totalCost,
            originalGemsPerImage: pricePerImage,
          };
        })()}
        userCredits={gemCostData?.user_gems || userData.credits || 0}
        userId={userData.id}
        numberOfItems={imageSettings.images}
        itemType="image"
        confirmButtonText="Continue Generation"
      />

      {/* Influencer Missing Dialog */}
      <Dialog
        open={showInfluencerDialog}
        onOpenChange={setShowInfluencerDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Influencer Not Found
            </DialogTitle>
            <DialogDescription>
              {influencerDialogData && (
                <>
                  Template{" "}
                  <strong>"{influencerDialogData.templateName}"</strong> was
                  created with influencer{" "}
                  <strong>"{influencerDialogData.influencerName}"</strong>.
                  <br />
                  <br />
                  You don't have an influencer with this name in your
                  collection.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInfluencerDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowInfluencerDialog(false);
                if (influencerDialogData) {
                  toast.info(
                    `Continuing without influencer (template used "${influencerDialogData.influencerName}")`
                  );
                }
              }}
              className="flex-1"
            >
              Continue Without
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LoRA Training Required Modal */}
      <Dialog
        open={showLoraTrainingModal}
        onOpenChange={setShowLoraTrainingModal}
      >
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-gray-900 to-purple-900 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI Training Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              To enable{" "}
              <span className="font-semibold text-purple-300">
                Influencer AI Consistency
              </span>
              , you need to complete the AI training process first.
            </p>
            <div className="bg-purple-950/30 p-4 rounded-lg border border-purple-500/20">
              <h4 className="font-medium text-purple-200 mb-2">
                What happens next:
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>
                  • AI training runs automatically in the background (~30
                  minutes)
                </li>
                <li>• You can continue working while training completes</li>
                <li>• Once ready, AI Consistency will be available</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLoraTrainingModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowLoraTrainingModal(false);
                // Navigate to Start page for Phase 2 training
                window.location.href = "/start";
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Start AI Training
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failed Image Details Modal */}
      <Dialog
        open={failedImageModal.open}
        onOpenChange={(open) =>
          setFailedImageModal((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Generation Failed
            </DialogTitle>
            <DialogDescription>
              Task ID: {failedImageModal.taskId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-red-900 dark:text-red-100">
                    Error Details
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                    {failedImageModal.userNotes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    What to do next?
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Check your prompt for any issues</li>
                    <li>• Verify your model selection</li>
                    <li>• Try adjusting the image settings</li>
                    <li>• Contact support if the issue persists</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() =>
                setFailedImageModal((prev) => ({ ...prev, open: false }))
              }
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function saveImageLocally(dataUrl: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export default ContentCreateImageNew;
