import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Image,
  Download,
  ArrowLeft,
  FileImage,
  Upload,
  Palette,
  Sun,
  Moon,
  Droplet,
  X,
  Wand2,
  Brush,
  Type,
  Settings,
  Play,
  Layers,
  Eye,
  EyeOff,
  Search,
  Filter,
  Plus,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import VaultSelector from '@/components/VaultSelector';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';
import { useDebounce } from '@/hooks/useDebounce';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { Influencer } from '@/store/slices/influencersSlice';

// Pintura imports
import '@pqina/pintura/pintura.css';
import { PinturaEditor } from '@pqina/react-pintura';
import { colorStringToColorArray, getEditorDefaults } from '@pqina/pintura';
import xSvg from '@/assets/social/x.svg';
import tiktokSvg from '@/assets/social/tiktok.svg';
import facebookSvg from '@/assets/social/facebook.svg';
import instagramSvg from '@/assets/social/instagram.svg';
import { config } from '@/config/config';

interface ImageData {
  id: string;
  system_filename: string;
  user_filename: string | null;
  file_path: string;
  user_notes?: string;
  user_tags?: string[];
  rating?: number;
  favorite?: boolean;
  created_at: string;
  file_size_bytes: number;
  image_format: string;
  file_type: string;
  originalUrl?: string;
}

interface EditHistory {
  id: string;
  timestamp: Date;
  description: string;
  imageData: string;
}

// Utility functions for encoding/decoding filenames
function encodeFilename(name: string) {
  return name.replace(/ /g, '_space_');
}
function decodeFilename(name: string) {
  return name.replace(/_space_/g, ' ');
}

export default function ContentEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);
  const editorRef = useRef(null);
  const dispatch = useDispatch();

  // State management
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showImageSelection, setShowImageSelection] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [conflictFilename, setConflictFilename] = useState('');
  const [pendingUploadData, setPendingUploadData] = useState<{ blob: Blob; filename: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const synthesisFileInputRef = useRef<HTMLInputElement>(null);
  const [showFilenameDialog, setShowFilenameDialog] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  // New for extension lock
  const [filenameBase, setFilenameBase] = useState('');
  const [filenameExt, setFilenameExt] = useState('');

  // Vault selector state
  const [showVaultSelector, setShowVaultSelector] = useState(false);

  // New state for edit mode selection
  const [editMode, setEditMode] = useState<'selection' | 'image-edit' | 'ai-image-edit' | 'ai-synthesis'>('selection');

  // AI Image Edit state
  const [aiEditImage, setAiEditImage] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [showPresetSelector, setShowPresetSelector] = useState(false);

  // AI Image Synthesis state
  const [synthesisImages, setSynthesisImages] = useState<Array<{
    id: string;
    name: string;
    url: string;
    source: 'library' | 'influencer' | 'upload';
  }>>([]);
  const [showSynthesisImageSelector, setShowSynthesisImageSelector] = useState(false);
  const [synthesisImageName, setSynthesisImageName] = useState('');
  const [pendingSynthesisImage, setPendingSynthesisImage] = useState<{
    url: string;
    source: 'library' | 'influencer' | 'upload';
    tempId?: string;
  } | null>(null);
  const [synthesisPrompt, setSynthesisPrompt] = useState('');
  const [isProcessingSynthesis, setIsProcessingSynthesis] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [showAiModeSelector, setShowAiModeSelector] = useState(false);
  const [isProcessingAiEdit, setIsProcessingAiEdit] = useState(false);
  const [showMaskEditor, setShowMaskEditor] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [isErasing, setIsErasing] = useState<boolean>(false); // false = draw mode by default
  const [maskColor, setMaskColor] = useState('#00ff00'); // Default green mask
  const [maskOpacity, setMaskOpacity] = useState(10); // Default 10% opacity
  const [isDrawing, setIsDrawing] = useState(false); // Track if user is currently drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // Search fields for influencer filtering
  const SEARCH_FIELDS = [
    { id: 'all', label: 'All Fields' },
    { id: 'name', label: 'Name' },
    { id: 'age_lifestyle', label: 'Age/Lifestyle' },
    { id: 'influencer_type', label: 'Type' }
  ];

  // Influencer selector state
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const influencersLoading = useSelector((state: RootState) => state.influencers.loading);
  const [showInfluencerSelector, setShowInfluencerSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState(SEARCH_FIELDS[0]);
  const [openFilter, setOpenFilter] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch influencers on component mount
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

    if (userData.id) {
      fetchInfluencers();
    }
  }, [userData.id, dispatch]);

  // Color presets for mask
  const MASK_COLORS = [
    { name: 'White', value: '#ffffff', description: 'Pure white mask' },
    { name: 'Red', value: '#ff0000', description: 'Bright red mask' },
    { name: 'Green', value: '#00ff00', description: 'Bright green mask' },
    { name: 'Blue', value: '#0000ff', description: 'Bright blue mask' },
    { name: 'Yellow', value: '#ffff00', description: 'Bright yellow mask' },
    { name: 'Magenta', value: '#ff00ff', description: 'Bright magenta mask' },
    { name: 'Cyan', value: '#00ffff', description: 'Bright cyan mask' },
    { name: 'Orange', value: '#ff8800', description: 'Vibrant orange mask' },
    { name: 'Purple', value: '#8800ff', description: 'Deep purple mask' },
    { name: 'Teal', value: '#00ff88', description: 'Fresh teal mask' },
    { name: 'Pink', value: '#ff69b4', description: 'Soft pink mask' },
    { name: 'Lime', value: '#32cd32', description: 'Lime green mask' },
    { name: 'Navy', value: '#000080', description: 'Dark navy mask' },
    { name: 'Maroon', value: '#800000', description: 'Deep maroon mask' },
    { name: 'Olive', value: '#808000', description: 'Olive green mask' },
    { name: 'Gray', value: '#808080', description: 'Neutral gray mask' }
  ];

  // AI Image Edit presets
  const AI_EDIT_PRESETS = [
    {
      name: 'Remove Background',
      description: 'Remove the background from the selected area',
      prompt: 'Remove background, transparent background'
    },
    {
      name: 'Change Hair Color',
      description: 'Change the hair color in the selected area',
      prompt: 'Change hair color to blonde, natural looking'
    },
    {
      name: 'Add Glasses',
      description: 'Add stylish glasses to the person',
      prompt: 'Add stylish black rimmed glasses, realistic'
    },
    {
      name: 'Change Eye Color',
      description: 'Change the eye color in the selected area',
      prompt: 'Change eye color to blue, natural looking'
    },
    {
      name: 'Add Jewelry',
      description: 'Add elegant jewelry to the person',
      prompt: 'Add elegant gold necklace, realistic jewelry'
    },
    {
      name: 'Change Clothing',
      description: 'Change the clothing in the selected area',
      prompt: 'Change to red dress, elegant and stylish'
    },
    {
      name: 'Add Makeup',
      description: 'Add natural makeup to the face',
      prompt: 'Add natural makeup, subtle and elegant'
    },
    {
      name: 'Remove Blemishes',
      description: 'Remove skin blemishes and imperfections',
      prompt: 'Remove blemishes, clear skin, natural looking'
    }
  ];

  // AI Image Edit helper functions
  const handleAiImageSelect = (image: any) => {
    try {
      const imageData: ImageData = {
        id: image.id,
        system_filename: image.system_filename,
        user_filename: image.user_filename,
        file_path: image.file_path,
        user_notes: image.user_notes || '',
        user_tags: image.user_tags || [],
        rating: image.rating || 0,
        favorite: image.favorite || false,
        created_at: image.created_at,
        file_size_bytes: image.file_size_bytes,
        image_format: image.image_format,
        file_type: image.file_type
      };

      setSelectedImage(imageData);
      setShowVaultSelector(false);

      // Store the original URL for API calls (same as Image Synthesis)
      const isInfluencerImage = imageData.file_path?.includes('models/') || imageData.id?.startsWith('influencer-');
      const originalUrl = isInfluencerImage
        ? `${config.data_url}/cdn-cgi/image/w=1200/${imageData.file_path}`
        : `${config.data_url}/cdn-cgi/image/w=1200/${userData.id}/output/${imageData.system_filename}`;
      
      // Store the original URL in the selectedImage for later use
      const imageDataWithUrl: ImageData = {
        ...imageData,
        originalUrl: originalUrl
      };
      setSelectedImage(imageDataWithUrl);

      // Load image for AI editing
      fetchImageForAiEdit(imageData);
      toast.success(`Selected image for AI editing: ${image.system_filename}`);
    } catch (error) {
      console.error('Error selecting image for AI editing:', error);
      toast.error('Failed to select image for AI editing. Please try again.');
    }
  };

  const fetchImageForAiEdit = async (imageData: ImageData) => {
    try {
      setIsLoadingImage(true);
      const loadingToast = toast.loading('Loading image for AI editing...');

      // Determine the correct file path based on the image data
      const isInfluencerImage = imageData.file_path?.includes('models/') || imageData.id?.startsWith('influencer-');
      const filename = isInfluencerImage ? imageData.file_path : 'output/' + imageData.system_filename;

      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: filename
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setAiEditImage(imageUrl);
      setIsErasing(false); // Reset to draw mode

      // Initialize mask canvas
      setTimeout(() => {
        initializeMaskCanvas(imageUrl);
      }, 100);

      toast.dismiss(loadingToast);
      toast.success('Image loaded for AI editing!');
    } catch (error) {
      console.error('Error loading image for AI editing:', error);
      toast.error('Failed to load image for AI editing. Please try again.');

      // Fallback to CDN URL
      const isInfluencerImage = imageData.file_path?.includes('models/') || imageData.id?.startsWith('influencer-');
      const fallbackUrl = isInfluencerImage
        ? `${config.data_url}/cdn-cgi/image/w=1200/${imageData.file_path}`
        : `${config.data_url}/cdn-cgi/image/w=1200/${userData.id}/output/${imageData.system_filename}`;

      setAiEditImage(fallbackUrl);
      setIsErasing(false); // Reset to draw mode
      setTimeout(() => {
        initializeMaskCanvas(fallbackUrl);
      }, 100);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const initializeMaskCanvas = (imageUrl: string) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const img = document.createElement('img');
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    img.src = imageUrl;
  };

  const handleRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default context menu

    // Toggle between draw and erase modes on right click
    setIsErasing(!isErasing);
    toast.success(isErasing ? 'Draw mode activated' : 'Erase mode activated');
  };

  const handleMaskDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only draw on left mouse button (button 0)
    if (e.button !== 0) return;

    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Calculate the scale factors between canvas display size and actual canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Convert mouse coordinates to canvas coordinates
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Set drawing mode based on event type
      if (e.type === 'mousedown') {
        setIsDrawing(true);
      }

      // Only draw if we're in drawing mode
      if (isDrawing || e.type === 'mousedown') {
        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';

        if (isErasing) {
          ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        } else {
          // Convert hex color to RGB and apply user-defined opacity (max 50%)
          const hex = maskColor.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const opacity = Math.min(maskOpacity / 100, 0.3); // Cap at 30%
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const handleMaskDrawingEnd = () => {
    setIsDrawing(false);
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const applyPreset = (preset: any) => {
    setTextPrompt(preset.prompt);
    setShowPresetSelector(false);
    toast.success(`Applied preset: ${preset.name}`);
  };

  const applyColor = (color: any) => {
    setMaskColor(color.value);
    setShowColorSelector(false);
    toast.success(`Selected color: ${color.name}`);
  };

  const handleAiModeSelect = (mode: 'ai-image-edit' | 'ai-synthesis') => {
    setEditMode(mode);
    setShowAiModeSelector(false);
    if (mode === 'ai-synthesis') {
      setSynthesisImages([]);
      setSynthesisPrompt('');
    }
  };

  const addSynthesisImage = (imageData: { id: string; name: string; url: string; source: 'library' | 'influencer' | 'upload' }) => {
    if (synthesisImages.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setSynthesisImages(prev => [...prev, imageData]);
    toast.success(`Added ${imageData.name} to synthesis`);
  };

  const handleSynthesisImageSelect = (imageData: { url: string; source: 'library' | 'influencer' | 'upload'; tempId?: string }) => {
    setPendingSynthesisImage(imageData);
    setSynthesisImageName('');
    setShowSynthesisImageSelector(false);
  };

  const confirmSynthesisImageName = () => {
    if (!pendingSynthesisImage || !synthesisImageName.trim()) {
      toast.error('Please enter a name for the image');
      return;
    }
    
    // Remove spaces and replace with underscores
    const processedName = synthesisImageName.trim().replace(/\s+/g, '_');
    
    const imageData = {
      id: pendingSynthesisImage.tempId || `synthesis-${Date.now()}`,
      name: processedName,
      url: pendingSynthesisImage.url,
      source: pendingSynthesisImage.source
    };
    
    addSynthesisImage(imageData);
    setPendingSynthesisImage(null);
    setSynthesisImageName('');
  };

  const removeSynthesisImage = (id: string) => {
    setSynthesisImages(prev => prev.filter(img => img.id !== id));
  };

  const addImageToPrompt = (imageName: string) => {
    setSynthesisPrompt(prev => prev + ` @${imageName}`);
  };

  const processSynthesis = async () => {
    if (synthesisImages.length === 0) {
      toast.error('Please add at least one reference image');
      return;
    }
    if (!synthesisPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsProcessingSynthesis(true);
    const loadingToast = toast.loading('Processing AI Image Synthesis...');

    try {
      // Extract reference tags from prompt (words starting with @)
      const referenceTags = synthesisPrompt.match(/@(\w+)/g)?.map(tag => tag.slice(1)) || [];

      const payload = {
        prompt: synthesisPrompt,
        resolution: "1080p",
        aspect_ratio: "4:3",
        reference_tags: referenceTags,
        reference_images: synthesisImages.map(img => img.url)
      };

      console.log(payload);

      const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });
      const useridData = await useridResponse.json();

      const response = await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to process synthesis');
      }

      const result = await response.json();
      toast.dismiss(loadingToast);
      toast.success('AI Image Synthesis completed!');
      console.log('Synthesis result:', result);

    } catch (error) {
      console.error('Error processing synthesis:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to process synthesis. Please try again.');
    } finally {
      setIsProcessingSynthesis(false);
    }
  };

  const processAiEdit = async () => {
    if (!aiEditImage || !textPrompt.trim()) {
      toast.error('Please select an image and enter a text prompt');
      return;
    }

    setIsProcessingAiEdit(true);
    const loadingToast = toast.loading('Processing AI image edit...');

    try {
      // Get mask data
      const canvas = maskCanvasRef.current;
      if (!canvas) {
        throw new Error('Mask canvas not available');
      }

      const maskDataUrl = canvas.toDataURL('image/png');

      // Create payload for AI processing
      let payload: any;
      
      if (selectedImage?.originalUrl) {
        // For library/influencer images, send URL directly
        payload = {
          image_url: selectedImage.originalUrl,
          mask_data_url: maskDataUrl,
          prompt: textPrompt,
          user: userData.id
        };
      } else {
        // For uploaded images, send file as blob
        const formData = new FormData();
        formData.append('image', await fetch(aiEditImage).then(r => r.blob()));
        formData.append('mask', await fetch(maskDataUrl).then(r => r.blob()));
        formData.append('prompt', textPrompt);
        formData.append('user', userData.id);
        payload = formData;
      }

      const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });
      const useridData = await useridResponse.json();

      // Send to AI processing endpoint
      const headers: any = {
        'Authorization': 'Bearer WeInfl3nc3withAI'
      };
      
      // Set appropriate content type based on payload type
      if (selectedImage?.originalUrl) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`, {
        method: 'POST',
        headers: headers,
        body: selectedImage?.originalUrl ? JSON.stringify(payload) : payload
      });

      if (!response.ok) {
        throw new Error('Failed to process AI edit');
      }

      const result = await response.json();

      // Handle the result (this would depend on your backend implementation)
      toast.dismiss(loadingToast);
      toast.success('AI image edit completed!');

      // You would typically navigate to a results page or show the edited image
      console.log('AI edit result:', result);

    } catch (error) {
      console.error('Error processing AI edit:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to process AI edit. Please try again.');
    } finally {
      setIsProcessingAiEdit(false);
    }
  };

  console.log('ContentEdit: showVaultSelector', showVaultSelector);
  console.log('ContentEdit: showInfluencerSelector', showInfluencerSelector);
  console.log('ContentEdit: influencers count', influencers.length);

  // Theme options
  const THEME_MODES = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'custom', label: 'Custom', icon: Palette },
  ];
  const LIGHT_BG = [1, 1, 1];
  const DARK_BG = [0, 0, 0];
  const COLOR_LABELS = [
    { key: 'red', label: 'Red', color: 'bg-red-500', idx: 0 },
    { key: 'green', label: 'Green', color: 'bg-green-500', idx: 1 },
    { key: 'blue', label: 'Blue', color: 'bg-blue-500', idx: 2 },
  ];

  const [themeMode, setThemeMode] = useState('dark');
  const [customRGB, setCustomRGB] = useState([1, 1, 1]); // default all on
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Editor size controls
  const [editorWidth, setEditorWidth] = useState('100%');
  const [editorHeight, setEditorHeight] = useState('85vh');
  const [showSizeControls, setShowSizeControls] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Preset sizes for quick selection
  const PRESET_SIZES = [
    { name: 'Full Screen', width: '100%', height: '85vh' },
    { name: 'Large', width: '90%', height: '75vh' },
    { name: 'Medium', width: '80%', height: '65vh' },
    { name: 'Small', width: '70%', height: '55vh' },
  ];

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: editorContainerRef.current?.offsetWidth || 0,
      height: editorContainerRef.current?.offsetHeight || 0
    });
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    // Calculate new dimensions based on resize direction
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;

    // Handle different resize directions
    if (e.target && (e.target as Element).closest('[data-resize-direction]')) {
      const direction = (e.target as Element).closest('[data-resize-direction]')?.getAttribute('data-resize-direction');

      switch (direction) {
        case 'nw':
        case 'ne':
        case 'sw':
        case 'se':
          newWidth = Math.max(400, resizeStart.width + deltaX);
          newHeight = Math.max(300, resizeStart.height + deltaY);
          break;
        case 'n':
        case 's':
          newHeight = Math.max(300, resizeStart.height + deltaY);
          break;
        case 'e':
        case 'w':
          newWidth = Math.max(400, resizeStart.width + deltaX);
          break;
        default:
          newWidth = Math.max(400, resizeStart.width + deltaX);
          newHeight = Math.max(300, resizeStart.height + deltaY);
      }
    } else {
      // Default behavior for corner resizing
      newWidth = Math.max(400, resizeStart.width + deltaX);
      newHeight = Math.max(300, resizeStart.height + deltaY);
    }

    setEditorWidth(`${newWidth}px`);
    setEditorHeight(`${newHeight}px`);
  }, [isResizing, resizeStart]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Compute the current theme array
  const theme = themeMode === 'light'
    ? LIGHT_BG
    : themeMode === 'dark'
      ? DARK_BG
      : customRGB;

  // Handle theme mode change
  const handleThemeMode = (mode: string) => {
    setThemeMode(mode);
    setShowCustomModal(mode === 'custom');
  };

  // Handle color toggle
  const handleColorToggle = (idx: number) => {
    setCustomRGB(prev => {
      const newArr = [...prev];
      newArr[idx] = newArr[idx] === 1 ? 0 : 1;
      return newArr;
    });
  };

  // Modal close on outside click
  const modalRef = useRef<HTMLDivElement>(null);
  const sizeControlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCustomModal) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowCustomModal(false);
        setThemeMode('custom'); // keep custom selected
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCustomModal]);

  // Size controls close on outside click
  useEffect(() => {
    if (!showSizeControls) return;
    const handleClick = (e: MouseEvent) => {
      if (sizeControlsRef.current && !sizeControlsRef.current.contains(e.target as Node)) {
        setShowSizeControls(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSizeControls]);

  // Get editor defaults with upload configuration
  const getEditorDefaultsWithUpload = useCallback(() => {
    return getEditorDefaults({
      // Image writer configuration
      imageWriter: {
        store: {
          url: `${config.backend_url}/uploadfile`,
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          dataset: (state: any) => [
            ['file', state.dest, state.dest.name],
            ['user', userData?.id || ''],
            ['filename', `edited/${state.dest.name}`]
          ],
        },
      },
    });
  }, [userData?.id]);

  const editorDefaults = getEditorDefaultsWithUpload();

  // History management
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fetchImage = async (imageData: ImageData) => {
    let loadingToast: any;
    try {
      setIsLoadingImage(true);
      loadingToast = toast.loading('Loading image...', {
        description: 'Preparing image for editing',
        duration: Infinity
      });

      // Determine the correct file path based on the image data
      const isInfluencerImage = imageData.file_path?.includes('models/') || imageData.id?.startsWith('influencer-');
      const filename = isInfluencerImage ? imageData.file_path : 'output/' + imageData.system_filename;

      // Download the image file
      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: filename
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the downloaded blob
      const imageUrl = URL.createObjectURL(blob);

      // Set the image source to the downloaded file
      setImageSrc(imageUrl);
      setHasImage(true);

      // Add to history
      addToHistory('Original image loaded', imageUrl);

      toast.dismiss(loadingToast);
      toast.success('Image loaded successfully!');

    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image. Please try again.');

      // Fallback to CDN URL if download fails
      const isInfluencerImage = imageData.file_path?.includes('models/') || imageData.id?.startsWith('influencer-');
      const fallbackUrl = isInfluencerImage
        ? `${config.data_url}/cdn-cgi/image/w=1200/${imageData.file_path}`
        : `${config.data_url}/cdn-cgi/image/w=1200/${userData.id}/output/${imageData.system_filename}`;

      setImageSrc(fallbackUrl);
      setHasImage(true);
      addToHistory('Original image loaded (fallback)', fallbackUrl);
    } finally {
      setIsLoadingImage(false);
      if (loadingToast) toast.dismiss(loadingToast);
    }
  }

  // Handle vault image selection
  const handleVaultImageSelect = (image: any) => {
    try {
      // Convert the vault image data to ImageData format
      const imageData: ImageData = {
        id: image.id,
        system_filename: image.system_filename,
        user_filename: image.user_filename,
        file_path: image.file_path,
        user_notes: image.user_notes || '',
        user_tags: image.user_tags || [],
        rating: image.rating || 0,
        favorite: image.favorite || false,
        created_at: image.created_at,
        file_size_bytes: image.file_size_bytes,
        image_format: image.image_format,
        file_type: image.file_type
      };

      setSelectedImage(imageData);
      setShowImageSelection(false);
      setShowVaultSelector(false); // Close the modal

      // Fetch the image from vault
      fetchImage(imageData);

      toast.success(`Selected image from library: ${image.system_filename}`);
    } catch (error) {
      console.error('Error selecting image from library:', error);
      toast.error('Failed to select image from library. Please try again.');
    }
  };

  useEffect(() => {
    const imageData = location.state?.imageData;
    // Only run if both imageData and userData.id are available, and not already loaded
    if (imageData && userData?.id && (!selectedImage || selectedImage.id !== imageData.id)) {
      setSelectedImage(imageData);
      fetchImage(imageData);
    }
  }, [location.state, userData?.id]);

  // Get image data from navigation state
  useEffect(() => {
    const imageData = location.state?.imageData;
    console.log('ContentEdit: Received image data:', imageData);
    if (imageData) {
      setSelectedImage(imageData);
    } else {
      console.log('ContentEdit: No image data received');
    }
  }, [location.state]);

  // Cleanup function to revoke object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup object URLs to prevent memory leaks
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
      if (editedImageUrl && editedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editedImageUrl);
      }
    };
  }, [imageSrc, editedImageUrl]);

  const addToHistory = useCallback((description: string, imageData: string) => {
    // Cleanup previous blob URLs in history to prevent memory leaks
    history.forEach((item) => {
      if (item.imageData && item.imageData.startsWith('blob:')) {
        URL.revokeObjectURL(item.imageData);
      }
    });

    const newHistory: EditHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      description,
      imageData
    };

    // Remove any history after current index
    const newHistoryArray = history.slice(0, historyIndex + 1);
    newHistoryArray.push(newHistory);

    setHistory(newHistoryArray);
    setHistoryIndex(newHistoryArray.length - 1);
  }, [history, historyIndex]);

  const downloadFile = useCallback((file: File) => {
    // Create a hidden link and set the URL using createObjectURL
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = URL.createObjectURL(file);
    link.download = file.name;

    // We need to add the link to the DOM for "click()" to work
    document.body.appendChild(link);
    link.click();

    // To make this work on Firefox we need to wait a short moment before clean up
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.parentNode?.removeChild(link);
    }, 0);
  }, []);

  // --- 1. Remove automatic download from handleEditorProcess ---
  const handleEditorProcess = useCallback((imageState: any) => {
    try {
      // Only save to state for preview, do not download automatically
      const editedURL = URL.createObjectURL(imageState.dest);
      setEditedImageUrl(editedURL);
      addToHistory('Image edited with Pintura', editedURL);
      toast.success('Image edited and ready!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    }
  }, [addToHistory, userData?.id]);

  // --- 2. Add Download button next to Upload to Vault ---
  // Download handler for the button
  const handleDownloadEdited = useCallback(async () => {
    if (!editedImageUrl || !selectedImage) return;
    // Fetch the blob and trigger download
    const response = await fetch(editedImageUrl);
    const blob = await response.blob();
    const file = new File([blob], selectedImage.system_filename, { type: 'image/jpeg' });
    // Use the existing downloadFile helper
    downloadFile(file);
  }, [editedImageUrl, selectedImage, downloadFile]);

  // When Upload to Vault is clicked, open the dialog
  const handleUploadToVaultClick = useCallback(() => {
    if (!selectedImage) return;
    // Split filename into base and extension
    const orig = selectedImage.system_filename;
    const lastDot = orig.lastIndexOf('.');
    let base = orig;
    let ext = '';
    if (lastDot > 0) {
      base = orig.substring(0, lastDot);
      ext = orig.substring(lastDot);
    }
    setFilenameBase(base);
    setFilenameExt(ext);
    setCustomFilename(orig); // for backward compatibility, but not used for input now
    setShowFilenameDialog(true);
  }, [selectedImage]);

  // Update uploadToVault to accept a filename
  const uploadToVault = useCallback(async (filenameOverride?: string) => {
    if (!selectedImage || !editedImageUrl) {
      toast.error('Please edit an image first');
      return;
    }
    const filenameToUse = filenameOverride || selectedImage.system_filename;

    try {
      setIsUploading(true);

      // Show loading toast
      const loadingToast = toast.loading('Preparing upload...', {
        description: 'Processing edited image',
      });

      // Fetch the edited image as a blob
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();

      // Get existing files to check for duplicates
      const getFilesResponse = await fetch(`${config.backend_url}/getfilenames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `output`
        })
      });

      let finalFilename = filenameToUse;
      let hasConflict = false;

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        console.log('Files to copy:', files);

        if (files && files.length > 0 && files[0].Key) {
          // Extract existing filenames from the output folder
          const existingFilenames = files.map((file: any) => {
            const fileKey = file.Key;
            const re = new RegExp(`^.*?output/`);
            const fileName = fileKey.replace(re, "");
            console.log("File Name:", fileName);
            return fileName;
          });

          // Check if filename exists
          if (existingFilenames.includes(filenameToUse)) {
            hasConflict = true;
            setConflictFilename(filenameToUse);
            setPendingUploadData({ blob, filename: filenameToUse });
            setShowOverwriteDialog(true);
            toast.dismiss(loadingToast);
            setIsUploading(false);
            return;
          }

          // Generate unique filename
          const baseName = filenameToUse.substring(0, filenameToUse.lastIndexOf('.'));
          const extension = filenameToUse.substring(filenameToUse.lastIndexOf('.'));

          let counter = 1;
          let testFilename = filenameToUse;

          while (existingFilenames.includes(testFilename)) {
            testFilename = `${baseName}(${counter})${extension}`;
            counter++;
          }

          finalFilename = testFilename;
          console.log('Final filename:', finalFilename);
        }
      }

      // Update loading message
      toast.loading('Uploading to Library...', {
        id: loadingToast,
        description: `Saving as "${decodeFilename(finalFilename)}"`
      });

      // Create a file from the blob with the unique filename
      const file = new File([blob], finalFilename, { type: 'image/jpeg' });

      // Upload file to API
      const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=output/${finalFilename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Update loading message
      toast.loading('Creating database entry...', {
        id: loadingToast,
        description: 'Saving metadata to database'
      });

      // Create database entry
      const newImageData = {
        user_uuid: userData.id,
        task_id: `edit_${Date.now()}`,
        image_sequence_number: 1,
        system_filename: finalFilename,
        user_filename: "",
        user_notes: selectedImage.user_notes || '',
        user_tags: selectedImage.user_tags || [],
        file_path: `output/${finalFilename}`,
        file_size_bytes: file.size,
        image_format: selectedImage.image_format || 'jpeg',
        seed: 0,
        guidance: 0,
        steps: 0,
        nsfw_strength: 0,
        lora_strength: 0,
        model_version: 'edited',
        t5xxl_prompt: '',
        clip_l_prompt: '',
        negative_prompt: '',
        generation_status: 'completed',
        generation_started_at: new Date().toISOString(),
        generation_completed_at: new Date().toISOString(),
        generation_time_seconds: 0,
        error_message: '',
        retry_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        actual_seed_used: 0,
        prompt_file_used: '',
        quality_setting: 'edited',
        rating: selectedImage.rating || 0,
        favorite: selectedImage.favorite || false,
        file_type: selectedImage.file_type || 'image/jpeg'
      };

      const dbResponse = await fetch(`${config.supabase_server_url}/generated_images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(newImageData)
      });

      if (!dbResponse.ok) {
        const errorText = await dbResponse.text();
        console.error('Database response error:', dbResponse.status, errorText);
        console.error('Sent data:', newImageData);
        throw new Error(`Failed to create database entry: ${dbResponse.status} ${errorText}`);
      }

      toast.dismiss(loadingToast);
      toast.success(`Image uploaded to library successfully as "${decodeFilename(finalFilename)}"!`);
    } catch (error) {
      console.error('Error uploading to library:', error);
      toast.error('Failed to upload to library. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage, editedImageUrl, userData?.id]);

  // Confirm filename and proceed with upload
  const handleConfirmFilename = useCallback(() => {
    setShowFilenameDialog(false);
    // Always combine base and ext, then encode
    const combined = filenameBase + filenameExt;
    uploadToVault(encodeFilename(combined));
  }, [filenameBase, filenameExt, uploadToVault]);

  const handleOverwriteConfirm = useCallback(async () => {
    if (!pendingUploadData) return;

    try {
      setIsUploading(true);
      setShowOverwriteDialog(false);

      const loadingToast = toast.loading('Overwriting file...', {
        description: `Replacing "${decodeFilename(conflictFilename)}"`
      });

      // Delete old file first
      const deleteResponse = await fetch(`${config.backend_url}/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `output/${conflictFilename}`
        })
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete old file');
      }

      // Delete from database
      const dbDeleteResponse = await fetch(`${config.supabase_server_url}/generated_images?system_filename=eq.${conflictFilename}&user_filename=eq.`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!dbDeleteResponse.ok) {
        console.warn('Failed to delete old database entry, but continuing with upload');
      }

      // Update loading message
      toast.loading('Uploading new file...', {
        id: loadingToast,
        description: 'Saving edited image'
      });

      // Create a file from the blob
      const file = new File([pendingUploadData.blob], conflictFilename, { type: 'image/jpeg' });

      // Upload new file
      const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=output/${conflictFilename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload new file');
      }

      // Update loading message
      toast.loading('Creating database entry...', {
        id: loadingToast,
        description: 'Saving metadata to database'
      });

      // Create new database entry
      const newImageData = {
        user_uuid: userData.id,
        task_id: `edit_${Date.now()}`,
        image_sequence_number: 1,
        system_filename: conflictFilename,
        user_filename: "",
        user_notes: selectedImage?.user_notes || '',
        user_tags: selectedImage?.user_tags || [],
        file_path: `output/${conflictFilename}`,
        file_size_bytes: file.size,
        image_format: selectedImage?.image_format || 'jpeg',
        seed: 0,
        guidance: 0,
        steps: 0,
        nsfw_strength: 0,
        lora_strength: 0,
        model_version: 'edited',
        t5xxl_prompt: '',
        clip_l_prompt: '',
        negative_prompt: '',
        generation_status: 'completed',
        generation_started_at: new Date().toISOString(),
        generation_completed_at: new Date().toISOString(),
        generation_time_seconds: 0,
        error_message: '',
        retry_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        actual_seed_used: 0,
        prompt_file_used: '',
        quality_setting: 'edited',
        rating: selectedImage?.rating || 0,
        favorite: selectedImage?.favorite || false,
        file_type: selectedImage?.file_type || 'image/jpeg'
      };

      const dbResponse = await fetch(`${config.supabase_server_url}/generated_images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(newImageData)
      });

      if (!dbResponse.ok) {
        const errorText = await dbResponse.text();
        console.error('Database response error (overwrite):', dbResponse.status, errorText);
        console.error('Sent data (overwrite):', newImageData);
        throw new Error(`Failed to create database entry: ${dbResponse.status} ${errorText}`);
      }

      toast.dismiss(loadingToast);
      toast.success(`File "${decodeFilename(conflictFilename)}" overwritten successfully!`);
    } catch (error) {
      console.error('Error overwriting file:', error);
      toast.error('Failed to overwrite file. Please try again.');
    } finally {
      setIsUploading(false);
      setPendingUploadData(null);
      setConflictFilename('');
    }
  }, [pendingUploadData, conflictFilename, userData?.id, selectedImage]);

  const handleCreateNew = useCallback(async () => {
    if (!pendingUploadData || !selectedImage) return;

    try {
      setIsUploading(true);
      setShowOverwriteDialog(false);

      const loadingToast = toast.loading('Creating new file...', {
        description: 'Generating unique filename'
      });

      // Get existing files to check for duplicates
      const getFilesResponse = await fetch(`${config.backend_url}/getfilenames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `output`
        })
      });

      let finalFilename = selectedImage.system_filename;

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        console.log('Files to check for new filename:', files);

        if (files && files.length > 0 && files[0].Key) {
          // Extract existing filenames from the output folder
          const existingFilenames = files.map((file: any) => {
            const fileKey = file.Key;
            const re = new RegExp(`^.*?output/`);
            const fileName = fileKey.replace(re, "");
            console.log("Existing File Name:", fileName);
            return fileName;
          });

          // Generate unique filename with numbering
          const baseName = selectedImage.system_filename.substring(0, selectedImage.system_filename.lastIndexOf('.'));
          const extension = selectedImage.system_filename.substring(selectedImage.system_filename.lastIndexOf('.'));

          let counter = 1;
          let testFilename = `${baseName}(${counter})${extension}`;

          while (existingFilenames.includes(testFilename)) {
            counter++;
            testFilename = `${baseName}(${counter})${extension}`;
          }

          finalFilename = testFilename;
          console.log('Final new filename:', finalFilename);
        }
      }

      // Update loading message
      toast.loading('Uploading new file...', {
        id: loadingToast,
        description: `Saving as "${decodeFilename(finalFilename)}"`
      });

      // Create a file from the blob with the unique filename
      const file = new File([pendingUploadData.blob], finalFilename, { type: 'image/jpeg' });

      // Upload file to API
      const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=output/${finalFilename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Update loading message
      toast.loading('Creating database entry...', {
        id: loadingToast,
        description: 'Saving metadata to database'
      });

      // Create database entry
      const newImageData = {
        user_uuid: userData.id,
        task_id: `edit_${Date.now()}`,
        image_sequence_number: 1,
        system_filename: finalFilename,
        user_filename: "",
        user_notes: selectedImage.user_notes || '',
        user_tags: selectedImage.user_tags || [],
        file_path: `output/${finalFilename}`,
        file_size_bytes: file.size,
        image_format: selectedImage.image_format || 'jpeg',
        seed: 0,
        guidance: 0,
        steps: 0,
        nsfw_strength: 0,
        lora_strength: 0,
        model_version: 'edited',
        t5xxl_prompt: '',
        clip_l_prompt: '',
        negative_prompt: '',
        generation_status: 'completed',
        generation_started_at: new Date().toISOString(),
        generation_completed_at: new Date().toISOString(),
        generation_time_seconds: 0,
        error_message: '',
        retry_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        actual_seed_used: 0,
        prompt_file_used: '',
        quality_setting: 'edited',
        rating: selectedImage.rating || 0,
        favorite: selectedImage.favorite || false,
        file_type: selectedImage.file_type || 'image/jpeg'
      };

      const dbResponse = await fetch(`${config.supabase_server_url}/generated_images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(newImageData)
      });

      if (!dbResponse.ok) {
        const errorText = await dbResponse.text();
        console.error('Database response error (create new):', dbResponse.status, errorText);
        console.error('Sent data (create new):', newImageData);
        throw new Error(`Failed to create database entry: ${dbResponse.status} ${errorText}`);
      }

      toast.dismiss(loadingToast);
      toast.success(`New file created successfully as "${decodeFilename(finalFilename)}"!`);
    } catch (error) {
      console.error('Error creating new file:', error);
      toast.error('Failed to create new file. Please try again.');
    } finally {
      setIsUploading(false);
      setPendingUploadData(null);
      setConflictFilename('');
    }
  }, [pendingUploadData, selectedImage, userData?.id]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => {
        toast.error('Error reading file. Please try again.');
      };
      reader.onload = (e) => {
        const result = e.target?.result as string;

        // Create a selectedImage object for uploaded files
        const uploadedImage: ImageData = {
          id: `uploaded-${Date.now()}`,
          system_filename: file.name,
          user_filename: file.name,
          file_path: '',
          created_at: new Date().toISOString(),
          file_size_bytes: file.size,
          image_format: file.type.split('/')[1] || 'jpeg',
          file_type: file.type,
          originalUrl: result // Store the data URL as original URL for uploaded files
        };

                    if (editMode === 'ai-image-edit') {
              // For AI Image Edit mode
              setSelectedImage(uploadedImage);
              setAiEditImage(result);
              setIsErasing(false); // Reset to draw mode
              setTimeout(() => {
                initializeMaskCanvas(result);
              }, 100);
              toast.success('Image uploaded for AI editing');
            } else if (editMode === 'ai-synthesis') {
              // For AI Image Synthesis mode
              handleSynthesisImageSelect({
                url: result,
                source: 'upload',
                tempId: `synthesis-upload-${Date.now()}`
              });
            } else {
              // For regular Image Edit mode
        setSelectedImage(uploadedImage);
        setImageSrc(result);
        setHasImage(true);
        setShowImageSelection(false);
        addToHistory('Image uploaded', result);
        toast.success('Image uploaded successfully');
            }

        // Clear the file input so the same file can be uploaded again
        if (editMode === 'ai-synthesis' && synthesisFileInputRef.current) {
          synthesisFileInputRef.current.value = '';
        } else if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  }, [addToHistory, editMode]);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onerror = () => {
          toast.error('Error reading file. Please try again.');
        };
        reader.onload = (e) => {
          const result = e.target?.result as string;

          // Create a selectedImage object for uploaded files
          const uploadedImage: ImageData = {
            id: `uploaded-${Date.now()}`,
            system_filename: file.name,
            user_filename: file.name,
            file_path: '',
            created_at: new Date().toISOString(),
            file_size_bytes: file.size,
            image_format: file.type.split('/')[1] || 'jpeg',
            file_type: file.type,
            originalUrl: result // Store the data URL as original URL for uploaded files
          };

                      if (editMode === 'ai-image-edit') {
              // For AI Image Edit mode
              setSelectedImage(uploadedImage);
              setAiEditImage(result);
              setIsErasing(false); // Reset to draw mode
              setTimeout(() => {
                initializeMaskCanvas(result);
              }, 100);
              toast.success('Image uploaded for AI editing');
            } else if (editMode === 'ai-synthesis') {
              // For AI Image Synthesis mode
              handleSynthesisImageSelect({
                url: result,
                source: 'upload',
                tempId: `synthesis-upload-${Date.now()}`
              });
            } else {
              // For regular Image Edit mode
          setSelectedImage(uploadedImage);
          setImageSrc(result);
          setHasImage(true);
          setShowImageSelection(false);
          addToHistory('Image uploaded via drag & drop', result);
          toast.success('Image uploaded successfully');
            }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  }, [addToHistory, editMode]);



  const handleUploadNew = useCallback(() => {
    if (editMode === 'ai-image-edit') {
      // For AI Image Edit, use the main file input
      fileInputRef.current?.click();
    } else if (editMode === 'ai-synthesis') {
      // For AI Synthesis, use the synthesis file input
      synthesisFileInputRef.current?.click();
    } else {
    setShowImageSelection(false);
    // Show the upload area instead of immediately triggering file input
    }
  }, [editMode]);

  const handleBackToSelection = useCallback(() => {
    // Cleanup current blob URLs before clearing state
    if (imageSrc && imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(imageSrc);
    }
    if (editedImageUrl && editedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(editedImageUrl);
    }
    if (aiEditImage && aiEditImage.startsWith('blob:')) {
      URL.revokeObjectURL(aiEditImage);
    }

    setShowImageSelection(true);
    setSelectedImage(null); // Clear selected image
    setImageSrc(null);
    setEditedImageUrl(null);
    setAiEditImage(null);
    setMaskImage(null);
    setTextPrompt('');
    setHasImage(false);
    setHistory([]);
    setHistoryIndex(-1);
    setEditMode('selection');
  }, [navigate, imageSrc, editedImageUrl, aiEditImage]);

  const [socialStickerUrls, setSocialStickerUrls] = useState<string[]>([]);

  useEffect(() => {
    // Helper to fetch and convert SVG to data URL
    const fetchSvgAsDataUrl = async (svgPath: string) => {
      const response = await fetch(svgPath);
      const svgText = await response.text();
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgText);
    };
    (async () => {
      const urls = await Promise.all([
        fetchSvgAsDataUrl(xSvg),
        fetchSvgAsDataUrl(tiktokSvg),
        fetchSvgAsDataUrl(facebookSvg),
        fetchSvgAsDataUrl(instagramSvg),
      ]);
      setSocialStickerUrls(urls);
    })();
  }, []);

  // Filtered influencers for search
  const filteredInfluencers = influencers.filter(influencer => {
    if (!debouncedSearchTerm) return true;

    const searchLower = debouncedSearchTerm.toLowerCase();

    switch (selectedSearchField.id) {
      case 'name':
        return `${influencer.name_first} ${influencer.name_last}`.toLowerCase().includes(searchLower);
      case 'age_lifestyle':
        return (influencer.age || '').toLowerCase().includes(searchLower) ||
          (influencer.lifestyle || '').toLowerCase().includes(searchLower);
      case 'influencer_type':
        return (influencer.influencer_type || '').toLowerCase().includes(searchLower);
      default:
    return (
          `${influencer.name_first} ${influencer.name_last}`.toLowerCase().includes(searchLower) ||
          (influencer.age || '').toLowerCase().includes(searchLower) ||
          (influencer.lifestyle || '').toLowerCase().includes(searchLower) ||
          (influencer.influencer_type || '').toLowerCase().includes(searchLower)
        );
    }
  });

  console.log('ContentEdit: filteredInfluencers count', filteredInfluencers.length);

  // Influencer selection functions
  const handleInfluencerSelect = (influencer: Influencer) => {
    try {
      console.log('Selected influencer:', influencer);

      // Get the latest profile picture URL
      let latestImageNum = influencer.image_num - 1;
      if (latestImageNum === -1) {
        latestImageNum = 0;
      }

      const profileImageUrl = `${config.data_url}/${userData.id}/models/${influencer.id}/profilepic/profilepic${latestImageNum}.png`;
      console.log('Profile image URL:', profileImageUrl);

      // Create image data object for the influencer's profile image
      const influencerImageData: ImageData = {
        id: `influencer-${influencer.id}`,
        system_filename: `profilepic${latestImageNum}.png`,
        user_filename: `${influencer.name_first} ${influencer.name_last}`,
        file_path: `models/${influencer.id}/profilepic/profilepic${latestImageNum}.png`,
        user_notes: `Profile image of ${influencer.name_first} ${influencer.name_last}`,
        user_tags: ['influencer', 'profile'],
        rating: 5,
        favorite: true,
        created_at: new Date().toISOString(),
        file_size_bytes: 0,
        image_format: 'png',
        file_type: 'image/png',
        originalUrl: profileImageUrl
      };

      setSelectedImage(influencerImageData);
      setShowInfluencerSelector(false);

      if (editMode === 'ai-image-edit') {
        // For AI Image Edit mode
        setAiEditImage(profileImageUrl);
        setIsErasing(false); // Reset to draw mode
        setTimeout(() => {
          initializeMaskCanvas(profileImageUrl);
        }, 100);
        toast.success(`Selected ${influencer.name_first} ${influencer.name_last} for AI editing`);
      } else {
        // For regular Image Edit mode - fetch the image properly
        setShowImageSelection(false);
        fetchImage(influencerImageData);
        toast.success(`Selected ${influencer.name_first} ${influencer.name_last} for editing`);
      }
    } catch (error) {
      console.error('Error selecting influencer:', error);
      toast.error('Failed to select influencer. Please try again.');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  if (!selectedImage && showImageSelection && editMode === 'selection') {
    return (
      <div>
        <div className="p-6 md:p-8 space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <Image className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Content Editor
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Choose your preferred editing method to transform your images with professional tools
            </p>
          </div>

          {/* Enhanced Edit Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Image Edit Card */}
            <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm" onClick={() => setEditMode('image-edit')}>
              <CardContent className="p-8 md:p-10 text-center relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Image className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Professional Editor</h3>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Advanced image editing with professional tools, filters, and precise controls
                  </p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    Start Professional Editing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Image Edit Card */}
            <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm" onClick={() => setShowAiModeSelector(true)}>
              <CardContent className="p-8 md:p-10 text-center relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Wand2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">AI-Powered Editor</h3>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Revolutionary AI editing with mask selection and intelligent text prompts
                  </p>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    Start AI Editing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Mode Selector Modal - Global Modal */}
            <Dialog open={showAiModeSelector} onOpenChange={setShowAiModeSelector}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-8">
                  <DialogTitle className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg dark:shadow-purple-500/20">
                      <Wand2 className="w-7 h-7 text-white dark:text-slate-900" />
                    </div>
                    <div>
                      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        Choose AI Mode
                      </div>
                      <div className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-1">
                        Select your preferred AI-powered editing experience
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image Editor Option */}
                  <Card
                    className="cursor-pointer hover:shadow-2xl dark:hover:shadow-blue-500/20 transition-all duration-500 border-0 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm group overflow-hidden relative dark:border-slate-700/50 dark:hover:bg-slate-750/90"
                    onClick={() => handleAiModeSelect('ai-image-edit')}
                  >
                    {/* Hover effect overlay - different for dark theme */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 dark:from-blue-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Dark theme glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-400/0 to-purple-400/0 dark:from-blue-400/5 dark:via-transparent dark:to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                    
                    <CardContent className="p-8 text-center relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl dark:shadow-blue-500/30 group-hover:scale-110 group-hover:shadow-2xl dark:group-hover:shadow-blue-500/40 transition-all duration-300">
                        <Brush className="w-10 h-10 text-white dark:text-slate-900" />
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Image Editor
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        Edit existing images with AI-powered mask selection and intelligent text prompts for precise control
                      </p>
                      
                      {/* Feature highlights */}
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />
                          <span>AI-powered mask drawing</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full" />
                          <span>Intelligent text prompts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                          <span>Professional editing tools</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Image Synthesis Option */}
                  <Card
                    className="cursor-pointer hover:shadow-2xl dark:hover:shadow-purple-500/20 transition-all duration-500 border-0 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm group overflow-hidden relative dark:border-slate-700/50 dark:hover:bg-slate-750/90"
                    onClick={() => handleAiModeSelect('ai-synthesis')}
                  >
                    {/* Hover effect overlay - different for dark theme */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 dark:from-purple-400/10 dark:to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Dark theme glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-400/0 to-rose-400/0 dark:from-purple-400/5 dark:via-transparent dark:to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                    
                    <CardContent className="p-8 text-center relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl dark:shadow-purple-500/30 group-hover:scale-110 group-hover:shadow-2xl dark:group-hover:shadow-purple-500/40 transition-all duration-300">
                        <Layers className="w-10 h-10 text-white dark:text-slate-900" />
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Image Synthesis
                      </h3>
                      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        Create new images by combining multiple reference images with advanced AI synthesis technology
                      </p>
                      
                      {/* Feature highlights */}
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full" />
                          <span>Multi-image reference system</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-2 h-2 bg-pink-500 dark:bg-pink-400 rounded-full" />
                          <span>Advanced AI synthesis</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-2 h-2 bg-rose-500 dark:bg-rose-400 rounded-full" />
                          <span>Creative image generation</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Footer with additional info */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Both modes use advanced AI technology to deliver professional results
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Feature highlights */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <Brush className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Professional Tools</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Advanced editing capabilities</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <Wand2 className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">AI Intelligence</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Smart editing with AI</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Easy Export</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Save and share instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Image Edit mode - shows original selection cards
  if (!selectedImage && showImageSelection && editMode === 'image-edit') {
    return (
      <div>
        <div className="p-6 md:p-8 space-y-8">
          {/* Enhanced Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode('selection')}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Selection</span>
              </Button>
          <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Professional Editor
            </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
                  Choose your preferred method to get started
            </p>
          </div>
        </div>
          </div>

        {/* Vault Selector Modal */}
        {showVaultSelector && (
          <VaultSelector
            open={showVaultSelector}
            onOpenChange={setShowVaultSelector}
            onImageSelect={handleVaultImageSelect}
            title="Select Image from Library"
            description="Browse your library and select an image to edit. Only completed images are shown."
          />
        )}

          {/* Influencer Selector Modal - Shared between Image Edit and AI Image Edit modes */}
          <Dialog open={showInfluencerSelector} onOpenChange={setShowInfluencerSelector}>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Select Influencer
                </DialogTitle>
                <DialogDescription>
                  Choose an influencer's profile image to use for editing
                </DialogDescription>
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
                {influencersLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading influencers...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredInfluencers.map((influencer) => (
                      <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-purple-500/20">
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
                              {influencer.image_url ? (
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
                              )}
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg group-hover:text-purple-500 transition-colors">
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
                                onClick={() => handleInfluencerSelect(influencer)}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Use for Editing
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!influencersLoading && filteredInfluencers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No influencers found.</p>
                    <p className="text-sm">Try adjusting your search criteria.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Enhanced Image Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Select from Vault */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-8 md:p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileImage className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Select from Library</h3>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Choose an existing image from your content library
              </p>
              <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setShowVaultSelector(true)}
                disabled={isLoadingImage}
              >
                {isLoadingImage ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Loading...
                  </>
                ) : (
                  'Browse Library'
                )}
              </Button>
                </div>
              </CardContent>
            </Card>

            {/* Select from Influencers */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-8 md:p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Select from Influencers</h3>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Choose an influencer's profile image to edit
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setShowInfluencerSelector(true)}
                    disabled={influencersLoading}
                  >
                    {influencersLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        Browse Influencers
                      </>
                    )}
                  </Button>
                </div>
            </CardContent>
          </Card>

          {/* Upload New Image */}
            <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm" onClick={handleUploadNew}>
              <CardContent className="p-8 md:p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Upload New Image</h3>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Upload a new image from your device
              </p>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Upload Image
              </Button>
                </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedImage && !showImageSelection) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToSelection}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Selection</span>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
                Edit Content
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Upload an image to get started
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg h-[400px] md:h-[600px] bg-muted flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={triggerFileUpload}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Image className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2 text-center">Upload an image to edit</h3>
              <p className="text-sm md:text-base text-gray-500 mb-4 text-center px-4">Drag and drop an image here, or click to browse</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // AI Image Edit mode
  if (editMode === 'ai-image-edit' && !aiEditImage) {
  return (
      <div>
        <div className="p-6 md:p-8 space-y-8">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToSelection}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Selection</span>
          </Button>
          <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  AI-Powered Editor
            </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
                  Select an image to edit with revolutionary AI technology
                </p>
              </div>
            </div>
          </div>

          {/* Hidden file input for AI Image Edit */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Vault Selector Modal */}
          {showVaultSelector && (
            <VaultSelector
              open={showVaultSelector}
              onOpenChange={setShowVaultSelector}
              onImageSelect={handleAiImageSelect}
              title="Select Image for AI Editing"
              description="Browse your library and select an image to edit with AI. Only completed images are shown."
            />
          )}

          {/* Influencer Selector Modal - Shared between Image Edit and AI Image Edit modes */}
          <Dialog open={showInfluencerSelector} onOpenChange={setShowInfluencerSelector}>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Select Influencer
                </DialogTitle>
                <DialogDescription>
                  Choose an influencer's profile image to use for editing
                </DialogDescription>
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
                {influencersLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading influencers...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredInfluencers.map((influencer) => (
                      <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-purple-500/20">
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
                              {influencer.image_url ? (
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
                              )}
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg group-hover:text-purple-500 transition-colors">
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
                                onClick={() => handleInfluencerSelect(influencer)}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Use for Editing
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!influencersLoading && filteredInfluencers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No influencers found.</p>
                    <p className="text-sm">Try adjusting your search criteria.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* AI Image Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {/* Select from Vault */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileImage className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Select from Library</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  Choose an existing image from your content library
                </p>
                <Button
                  className="w-full"
                  onClick={() => setShowVaultSelector(true)}
                  disabled={isLoadingImage}
                >
                  {isLoadingImage ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Loading...
                    </>
                  ) : (
                    'Browse Library'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Select from Influencers */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-pink-600" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Select from Influencers</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  Choose an influencer's profile image for AI editing
                </p>
                <Button
                  className="w-full"
                  onClick={() => setShowInfluencerSelector(true)}
                  disabled={influencersLoading}
                >
                  {influencersLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Browse Influencers
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Upload New Image */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleUploadNew}>
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Upload New Image</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  Upload a new image from your device
                </p>
                <Button className="w-full">
                  Upload Image
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // AI Image Edit Interface
  if (editMode === 'ai-image-edit' && aiEditImage) {
    return (
      <div>
        <div className="p-6 md:p-8 space-y-8">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToSelection}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Selection</span>
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  AI-Powered Editor
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Compact Mask Controls at Top */}
            <div className="lg:col-span-3">
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Mode Controls */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Button
                        variant={isErasing === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsErasing(false)}
                        className={`flex items-center gap-2 text-sm ${isErasing === false
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                      >
                        <Brush className="w-3 h-3" />
                        Draw
                      </Button>
                      <Button
                        variant={isErasing === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsErasing(true)}
                        className={`flex items-center gap-2 text-sm ${isErasing === true
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
                          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                      >
                        <EyeOff className="w-3 h-3" />
                        Erase
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearMask}
                        className="flex items-center gap-2 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                      >
                        <X className="w-3 h-3" />
                        Clear
                      </Button>
                    </div>

                    {/* Brush Size */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Label className="text-sm whitespace-nowrap">Brush: {brushSize}px</Label>
                      <Slider
                        value={[brushSize]}
                        onValueChange={([value]) => setBrushSize(value)}
                        min={5}
                        max={100}
                        step={1}
                        className="w-full md:w-32"
                      />
                    </div>

                    {/* Mask Color */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Label className="text-sm">Color:</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowColorSelector(true)}
                        className="flex items-center gap-2 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: maskColor }}
                        />
                        <span>Select Color</span>
                      </Button>
                    </div>

                    {/* Opacity */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Label className="text-sm">Opacity: {maskOpacity}%</Label>
                      <Slider
                        value={[maskOpacity]}
                        onValueChange={([value]) => setMaskOpacity(Math.min(value, 30))}
                        min={2}
                        max={30}
                        step={1}
                        className="w-full md:w-24"
                      />
                    </div>

                    {/* Status */}
                    <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded w-full md:w-auto text-center md:text-left">
                      {isErasing ? 'Erase' : 'Draw'} mode
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Left Panel - Image and Mask */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Enhanced Image Display */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    Image & Mask Editor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    {aiEditImage && (
                      <>
                        {/* Background Image */}
                        <img
                          src={aiEditImage}
                          alt="Edit image"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                        {/* Mask Canvas */}
                        <canvas
                          ref={maskCanvasRef}
                          className="absolute inset-0 w-full h-full cursor-crosshair"
                          onMouseDown={handleMaskDrawing}
                          onMouseMove={handleMaskDrawing}
                          onMouseUp={handleMaskDrawingEnd}
                          onMouseLeave={handleMaskDrawingEnd}
                          onContextMenu={handleRightClick}
                          style={{ touchAction: 'none' }}
                        />
                        {/* Enhanced Brush Size Indicator */}
                        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm flex items-center gap-2 md:gap-3 shadow-xl border border-white/20">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                            style={{
                              backgroundColor: isErasing ? '#000000' : maskColor,
                              opacity: isErasing ? 1 : maskOpacity / 100
                            }}
                          />
                          <span className="font-semibold">{isErasing ? 'Erase' : 'Draw'}: {brushSize}px ({maskOpacity}%)</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Controls */}
            <div className="space-y-4 md:space-y-6">
              {/* Enhanced Text Prompt */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Type className="w-5 h-5 text-white" />
                    </div>
                    Text Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Describe the changes you want to make:</Label>
                    <Textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="e.g., Change hair color to blonde, Add glasses, Remove background..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPresetSelector(true)}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Choose Preset
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced Process Button */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <Button
                    onClick={processAiEdit}
                    disabled={!textPrompt.trim() || isProcessingAiEdit}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isProcessingAiEdit ? (
                      <>
                        <div className="w-5 h-5 mr-3 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                        Processing AI Edit...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-3" />
                        Process AI Edit
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Preset Selector Modal */}
          <Dialog open={showPresetSelector} onOpenChange={setShowPresetSelector}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-2xl">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  Choose AI Edit Preset
                </DialogTitle>
                <DialogDescription className="text-lg text-slate-600 dark:text-slate-300">
                  Select a preset to automatically fill the text prompt with common editing tasks.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AI_EDIT_PRESETS.map((preset, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group"
                    onClick={() => applyPreset(preset)}
                  >
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-100 group-hover:text-purple-600 transition-colors">{preset.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{preset.description}</p>
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
                        <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                          {preset.prompt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Professional Color Selector Modal */}
          <Dialog open={showColorSelector} onOpenChange={setShowColorSelector}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-2xl">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  Select Mask Color
                </DialogTitle>
                <DialogDescription className="text-lg text-slate-600 dark:text-slate-300">
                  Choose a color for your mask. The selected color will be used for drawing on the image.
                </DialogDescription>
              </DialogHeader>

              {/* Color Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {MASK_COLORS.map((color, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group ${maskColor === color.value ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                    onClick={() => applyColor(color)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center space-y-3">
                        {/* Color Swatch */}
                        <div
                          className="w-16 h-16 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: color.value }}
                        />

                        {/* Color Info */}
                        <div className="text-center">
                          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                            {color.name}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {color.description}
                          </p>
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-500 mt-1">
                            {color.value}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Custom Color Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Custom Color
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-slate-700 dark:text-slate-300">Pick a custom color:</Label>
                    <input
                      type="color"
                      value={maskColor}
                      onChange={(e) => setMaskColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                      title="Custom color picker"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-slate-700 dark:text-slate-300">Current:</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                        style={{ backgroundColor: maskColor }}
                      />
                      <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                        {maskColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    );
  }

  // AI Image Synthesis Interface
  if (editMode === 'ai-synthesis') {
    return (
      <div>
        <div className="p-6 md:p-8 space-y-8">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToSelection}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Selection</span>
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Image Synthesis
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
                  Create stunning images by combining multiple reference images with AI
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Reference Images */}
            <div className="lg:col-span-2 space-y-6">
              {/* Reference Images Section */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    Reference Images ({synthesisImages.length}/5)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {synthesisImages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-10 h-10 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">No Reference Images</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-6">Add up to 5 reference images to create your synthesis</p>
                      <Button onClick={() => setShowSynthesisImageSelector(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {synthesisImages.map((image, index) => (
                          <Card key={image.id} className="relative group hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="relative">
                                <img
                                  src={image.url}
                                  alt={image.name}
                                  className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeSynthesisImage(image.id)}
                                  className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{image.name}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {image.source}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addImageToPrompt(image.name)}
                                    className="text-xs h-6 px-2"
                                  >
                                    Add to Prompt
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                                            {synthesisImages.length < 5 && (
                        <div className="text-center pt-4">
                          <Button 
                            onClick={() => setShowSynthesisImageSelector(true)}
                            variant="outline"
                            className="border-dashed border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another Image ({synthesisImages.length + 1}/5)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Controls */}
            <div className="space-y-6">
              {/* Prompt Section */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Type className="w-5 h-5 text-white" />
                    </div>
                    Synthesis Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Describe your desired image:</Label>
                    <Textarea
                      value={synthesisPrompt}
                      onChange={(e) => setSynthesisPrompt(e.target.value)}
                      placeholder="e.g., a close up portrait of @woman and @man standing in @park, hands in pockets, looking cool. She is wearing her pink sweater and bangles."
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  {/* Quick Add Buttons */}
                  {synthesisImages.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600 dark:text-slate-400">Quick add image references:</Label>
                      <div className="flex flex-wrap gap-2">
                        {synthesisImages.map((image) => (
                          <Button
                            key={image.id}
                            variant="outline"
                            size="sm"
                            onClick={() => addImageToPrompt(image.name)}
                            className="text-xs h-8 px-3"
                          >
                            @{image.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <Button
                    onClick={processSynthesis}
                    disabled={synthesisImages.length === 0 || !synthesisPrompt.trim() || isProcessingSynthesis}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isProcessingSynthesis ? (
                      <>
                        <div className="w-5 h-5 mr-3 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                        Processing Synthesis...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-3" />
                        Generate Synthesis
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Synthesis Image Selector Modal */}
          <Dialog open={showSynthesisImageSelector} onOpenChange={setShowSynthesisImageSelector}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  Select Reference Image for Synthesis
                </DialogTitle>
                <DialogDescription>
                  Choose how you want to add a reference image for synthesis
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Select from Library */}
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => {
                  setShowSynthesisImageSelector(false);
                  setShowVaultSelector(true);
                }}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileImage className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Select from Library</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose an existing image from your content library
                    </p>
                    <Button className="w-full">
                      Browse Library
                    </Button>
                  </CardContent>
                </Card>

                {/* Select from Influencers */}
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => {
                  setShowSynthesisImageSelector(false);
                  setShowInfluencerSelector(true);
                }}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-pink-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Select from Influencers</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose an influencer's profile image for synthesis
                    </p>
                    <Button className="w-full">
                      <User className="w-4 h-4 mr-2" />
                      Browse Influencers
                    </Button>
                  </CardContent>
                </Card>

                {/* Upload New Image */}
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => {
                  setShowSynthesisImageSelector(false);
                  synthesisFileInputRef.current?.click();
                }}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload New Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a new image from your device
                    </p>
                    <Button className="w-full">
                      Upload Image
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>

          {/* Image Naming Modal for Synthesis */}
          <Dialog open={!!pendingSynthesisImage} onOpenChange={() => setPendingSynthesisImage(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-purple-500" />
                  Name Your Reference Image
                </DialogTitle>
                <DialogDescription>
                  Give this image a name that you can reference in your synthesis prompt
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Image Preview */}
                {pendingSynthesisImage && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <img
                      src={pendingSynthesisImage.url}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Source: {pendingSynthesisImage.source}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        This name will be used as @imageName in your prompt
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="image-name">Image Name</Label>
                  <Input
                    id="image-name"
                    value={synthesisImageName}
                    onChange={(e) => setSynthesisImageName(e.target.value)}
                    placeholder="e.g., woman, man, park, background..."
                    className="w-full"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Use a descriptive name that you can reference in your synthesis prompt. Spaces will be automatically replaced with underscores.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setPendingSynthesisImage(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmSynthesisImageName}
                    disabled={!synthesisImageName.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Add to Synthesis
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Hidden file input for Synthesis */}
          <input
            type="file"
            ref={synthesisFileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Vault Selector Modal for Synthesis */}
          {showVaultSelector && (
            <VaultSelector
              open={showVaultSelector}
              onOpenChange={setShowVaultSelector}
              onImageSelect={(image) => {
                handleSynthesisImageSelect({
                  url: `${config.data_url}/cdn-cgi/image/w=1200/${userData.id}/output/${image.system_filename}`,
                  source: 'library',
                  tempId: `synthesis-${Date.now()}`
                });
              }}
              title="Select Reference Image"
              description="Choose an image to use as a reference for synthesis"
            />
          )}

          {/* Influencer Selector Modal for Synthesis */}
          <Dialog open={showInfluencerSelector} onOpenChange={setShowInfluencerSelector}>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Select Influencer for Synthesis
                </DialogTitle>
                <DialogDescription>
                  Choose an influencer's profile image to use as a reference for synthesis
                </DialogDescription>
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
                </div>

                {/* Influencers Grid */}
                {influencersLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading influencers...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredInfluencers.map((influencer) => (
                      <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-purple-500/20">
                        <CardContent className="p-6 h-full">
                          <div className="flex flex-col justify-between h-full space-y-4">
                            <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                              <div className="absolute right-[-15px] top-[-15px] z-10">
                                <LoraStatusIndicator
                                  status={influencer.lorastatus || 0}
                                  className="flex-shrink-0"
                                />
                              </div>
                              {influencer.image_url ? (
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
                              )}
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg group-hover:text-purple-500 transition-colors">
                                  {influencer.name_first} {influencer.name_last}
                                </h3>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (editMode === 'ai-synthesis') {
                                    handleSynthesisImageSelect({
                                      url: influencer.image_url || '',
                                      source: 'influencer',
                                      tempId: `synthesis-influencer-${influencer.id}`
                                    });
                                  } else {
                                    const imageData = {
                                      id: `synthesis-influencer-${influencer.id}`,
                                      name: `${influencer.name_first}_${influencer.name_last}`,
                                      url: influencer.image_url || '',
                                      source: 'influencer' as const
                                    };
                                    addSynthesisImage(imageData);
                                  }
                                  setShowInfluencerSelector(false);
                                }}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Use for Synthesis
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 md:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToSelection}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Selection</span>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Professional Editor
              </h1>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 z-20">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-6 relative">
              {/* Theme Segmented Control */}
              <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 rounded-full shadow px-2 py-1 border border-blue-100 mr-2">
                {THEME_MODES.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleThemeMode(opt.key)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs transition-all
                    ${themeMode === opt.key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
                    style={{ outline: themeMode === opt.key ? '2px solid #2563eb' : 'none' }}
                    title={opt.label}
                  >
                    <opt.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Editor Size Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSizeControls(!showSizeControls)}
                  className="bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-4 h-4 border-2 border-current rounded" />
                  <span className="hidden sm:inline ml-2">Size</span>
                </Button>

                {/* Size Controls Dropdown */}
                {showSizeControls && (
                  <div ref={sizeControlsRef} className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[280px] z-50">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Editor Size</h4>

                      {/* Preset Sizes */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick Presets</label>
                        <div className="grid grid-cols-2 gap-2">
                          {PRESET_SIZES.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => {
                                setEditorWidth(preset.width);
                                setEditorHeight(preset.height);
                                setShowSizeControls(false);
                              }}
                              className={`px-3 py-2 text-xs rounded border transition-all ${editorWidth === preset.width && editorHeight === preset.height
                                ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Size Inputs */}
                      <div className="space-y-3">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Custom Size (px)</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Width (px)</label>
                            <Input
                              type="number"
                              value={editorWidth.replace('px', '')}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value && !isNaN(Number(value))) {
                                  setEditorWidth(`${value}px`);
                                }
                              }}
                              placeholder="800"
                              className="text-xs h-8"
                              min="400"
                              max="2000"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Height (px)</label>
                            <Input
                              type="number"
                              value={editorHeight.replace('px', '')}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value && !isNaN(Number(value))) {
                                  setEditorHeight(`${value}px`);
                                }
                              }}
                              placeholder="600"
                              className="text-xs h-8"
                              min="300"
                              max="1500"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Enter values between 400-2000px for width and 300-1500px for height
                        </div>
                      </div>

                      {/* Current Size Display */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Current: {editorWidth} × {editorHeight}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom theme modal */}
              {showCustomModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
                  <div ref={modalRef} className="bg-white dark:bg-gray-900 border border-blue-200 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center relative animate-fade-in">
                    <button onClick={() => setShowCustomModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                    <div className="mb-3 text-base text-gray-700 dark:text-gray-200 font-semibold">Custom Color Theme</div>
                    <div className="flex gap-4 mb-3">
                      {COLOR_LABELS.map((color, idx) => (
                        <button
                          key={color.key}
                          onClick={() => handleColorToggle(color.idx)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all
                          ${color.color} ${customRGB[color.idx] ? 'border-amber-500 scale-110 shadow-lg' : 'border-gray-300 opacity-50'}`}
                          title={`Toggle ${color.label}`}
                        >
                          <Droplet className="w-6 h-6 text-white" />
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">Toggle colors to create your custom background</div>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={handleUploadToVaultClick}
              disabled={!selectedImage || !editedImageUrl || isUploading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Upload to Library</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleDownloadEdited}
              disabled={!selectedImage || !editedImageUrl}
              variant="outline"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm font-semibold transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </div> {/* End of header div */}

        {/* Enhanced Main Editor */}
      <div className="w-full">
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-white" />
                </div>
                Professional Image Editor
              </CardTitle>
          </CardHeader>
            <CardContent className="p-6">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {!hasImage ? (
              <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl h-[400px] md:h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 cursor-pointer group"
                onClick={triggerFileUpload}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Image className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 text-center">Upload an image to edit</h3>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 text-center px-8 leading-relaxed">Drag and drop an image here, or click to browse your files</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Upload className="w-4 h-4" />
                    <span>Click to upload or drag & drop</span>
                  </div>
              </div>
            ) : isLoadingImage ? (
                <div className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center" style={{ height: editorHeight }}>
                  <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Preparing Image</h3>
                  <p className="text-base text-slate-600 dark:text-slate-300 text-center px-8">Loading and optimizing your image for professional editing</p>
              </div>
            ) : (
              <div
                  className={`border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 relative transition-all duration-300 ${isResizing ? 'ring-4 ring-blue-500/30 shadow-2xl' : 'shadow-lg hover:shadow-xl'
                  }`}
                style={{ width: editorWidth, height: editorHeight }}
                ref={editorContainerRef}
              >
                  {/* Enhanced Resize indicator */}
                {isResizing && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-2 rounded-full z-10 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="font-semibold">{editorWidth} × {editorHeight}</span>
                      </div>
                  </div>
                )}

                  {/* Enhanced Resize handles - Only right, bottom, and right-bottom corner */}
                <div
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-20 cursor-ew-resize bg-gradient-to-b from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 transition-all duration-300 rounded-l-full z-10 group shadow-lg"
                  onMouseDown={(e) => handleResizeStart(e, 'e')}
                  data-resize-direction="e"
                  title="Resize width"
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-2 cursor-ns-resize bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 transition-all duration-300 rounded-t-full z-10 group shadow-lg"
                  onMouseDown={(e) => handleResizeStart(e, 's')}
                  data-resize-direction="s"
                  title="Resize height"
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1 w-12 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div
                    className="absolute bottom-0 right-0 w-8 h-8 cursor-nw-resize bg-gradient-to-br from-blue-500/90 to-purple-600/90 hover:from-blue-500 hover:to-purple-600 transition-all duration-300 rounded-tl-2xl z-10 group shadow-xl"
                  onMouseDown={(e) => handleResizeStart(e, 'se')}
                  data-resize-direction="se"
                  title="Resize both width and height"
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/95 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-2 border-white/80 rounded-full" />
                </div>

                <PinturaEditor
                  ref={editorRef}
                  {...editorDefaults}
                  src={imageSrc}
                  onProcess={handleEditorProcess}
                  utils={['crop', 'sticker', 'finetune', 'filter', 'annotate', 'frame', 'fill', 'redact', 'resize']}
                  stickers={[
                    ['social', [...socialStickerUrls,]],
                    ['emojis', [
                      '😀', '😁', '😆', '😅', '🤣', '🙃', '😉', '😊', '😇', '🥳', '😕', '😮', '😧', '😰', '😭', '😱', '😓', '😫', '👍', '👎'
                    ]],
                    [
                      'hearts',
                      [
                        '💘', '💝', '💖', '💓', '💞', '💕', '💔', '💋', '💯'
                      ]
                    ],
                    ['default', [
                      '🏆', '🏅', '🥇', '🥈', '🥉', '🎉', '🍕', '🖌️', '🌤', '🌥'
                    ]],
                  ]}
                  // Offer different crop options
                  cropSelectPresetOptions={[
                    [undefined, 'Custom'],
                    [1, '1:1'],
                    [2 / 1, '2:1'],
                    [3 / 2, '3:2'],
                    [4 / 3, '4:3'],
                    [5 / 4, '5:4'],
                    [16 / 10, '16:10'],
                    [16 / 9, '16:9'],
                    [1 / 2, '1:2'],
                    [2 / 3, '2:3'],
                    [3 / 4, '3:4'],
                    [4 / 5, '4:5'],
                    [10 / 16, '10:16'],
                    [9 / 16, '9:16'],
                  ]}
                  imageBackgroundColor={theme}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Vault Selector Modal */}
        {showVaultSelector && (
          <VaultSelector
            open={showVaultSelector}
            onOpenChange={setShowVaultSelector}
            onImageSelect={editMode === 'ai-image-edit' ? handleAiImageSelect : handleVaultImageSelect}
            title={editMode === 'ai-image-edit' ? "Select Image for AI Editing" : "Select Image from Library"}
            description={editMode === 'ai-image-edit' ? "Browse your library and select an image to edit with AI. Only completed images are shown." : "Browse your library and select an image to edit. Only completed images are shown."}
          />
        )}

      {/* Overwrite Confirmation Dialog */}
      <Dialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>File Already Exists</DialogTitle>
            <DialogDescription>
              A file named "{conflictFilename}" already exists in the library. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Overwriting will permanently replace the existing file.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleOverwriteConfirm}
                variant="destructive"
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Overwrite File
              </Button>
              <Button
                onClick={handleCreateNew}
                variant="outline"
                className="flex-1"
              >
                <FileImage className="w-4 h-4 mr-2" />
                Create New File
              </Button>
            </div>
            <Button
              onClick={() => {
                setShowOverwriteDialog(false);
                setPendingUploadData(null);
                setConflictFilename('');
                setIsUploading(false);
              }}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filename Dialog */}
      <Dialog open={showFilenameDialog} onOpenChange={setShowFilenameDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Filename</DialogTitle>
            <DialogDescription>
              You can use your own filename for this image. Please edit below if you wish.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center">
              <Input
                value={decodeFilename(filenameBase)}
                onChange={e => setFilenameBase(e.target.value)}
                placeholder="Enter filename..."
                className="w-full rounded-r-none"
              />
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-l-0 border-input rounded-r-md text-gray-600 dark:text-gray-400 text-sm font-mono select-none">
                {filenameExt}
              </span>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowFilenameDialog(false)}>Cancel</Button>
              <Button onClick={handleConfirmFilename} className="bg-blue-600 hover:bg-blue-700 text-white">Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
