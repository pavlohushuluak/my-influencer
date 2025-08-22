import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
// Pintura imports
import '@pqina/pintura/pintura.css';
import { PinturaEditor } from '@pqina/react-pintura';
import { colorStringToColorArray, getEditorDefaults } from '@pqina/pintura';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Image,
  Download,
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
  User,
  Library,
  Sparkles,
  Edit3,
  Camera,
  FolderOpen,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import VaultSelector from '@/components/VaultSelector';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';
import { useDebounce } from '@/hooks/useDebounce';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { Influencer } from '@/store/slices/influencersSlice';
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

interface SelectedImage {
  id: string;
  url: string;
  name: string;
  type: 'library' | 'influencer' | 'upload';
}

type EditorMode = 'professional' | 'ai-powered';

export default function Compose() {
  const userData = useSelector((state: RootState) => state.user);
  const editorRef = useRef(null);
  const dispatch = useDispatch();

  // Professional Editor state
  const [showFilenameDialog, setShowFilenameDialog] = useState(false);
  const [filenameBase, setFilenameBase] = useState('');
  const [filenameExt, setFilenameExt] = useState('');
  const [customFilename, setCustomFilename] = useState('');
  const [editorWidth, setEditorWidth] = useState(800);
  const [editorHeight, setEditorHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // State management
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(Array(3).fill(null));
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('ai-powered');
  const [prompt, setPrompt] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Image naming state for synthesis
  const [pendingImageName, setPendingImageName] = useState('');
  const [showImageNameModal, setShowImageNameModal] = useState(false);
  const [pendingImageData, setPendingImageData] = useState<{
    url: string;
    name: string;
    type: 'library' | 'influencer' | 'upload';
    tempId?: string;
  } | null>(null);

  // Modal states
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showInfluencers, setShowInfluencers] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // AI Editor states (same as ContentEdit)
  const [aiEditImage, setAiEditImage] = useState<string | null>(null);
  const [aiEditMask, setAiEditMask] = useState<string | null>(null);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [aiEditStrength, setAiEditStrength] = useState(0.8);
  const [aiEditGuidance, setAiEditGuidance] = useState(7.5);

  // AI-Powered Editor specific states (same as ContentEdit)
  const [textPrompt, setTextPrompt] = useState('');
  const [brushSize, setBrushSize] = useState(40);
  const [isErasing, setIsErasing] = useState<boolean>(false); // false = draw mode by default
  const [maskColor, setMaskColor] = useState('#00ff00'); // Default green mask
  const [maskOpacity, setMaskOpacity] = useState(10); // Default 10% opacity
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessingAiEdit, setIsProcessingAiEdit] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);

  // Canvas ref for mask drawing
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // Professional Editor states
  const [professionalImage, setProfessionalImage] = useState<string | null>(null);
  const [professionalSettings, setProfessionalSettings] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    clarity: 0,
    dehaze: 0,
    vibrance: 0
  });

  // Influencers data
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [influencersLoading, setInfluencersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Utility functions
  const encodeFilename = (name: string) => name.replace(/ /g, '_space_');
  const decodeFilename = (name: string) => name.replace(/_space_/g, ' ');

  // Upload image to vault (same logic as ContentEdit)
  const uploadImageToVault = useCallback(async (blob: Blob, filename: string, prefix: string = 'compose'): Promise<string> => {
    try {
      // Generate a unique filename for the image
      const timestamp = Date.now();
      const finalFilename = `${prefix}_${filename}_${timestamp}.jpg`;

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

      let uniqueFilename = finalFilename;

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        if (files && files.length > 0 && files[0].Key) {
          const existingFilenames = files.map((file: any) => {
            const fileKey = file.Key;
            const re = new RegExp(`^.*?output/`);
            const fileName = fileKey.replace(re, "");
            return fileName;
          });

          // Generate unique filename if needed
          if (existingFilenames.includes(finalFilename)) {
            const baseName = finalFilename.substring(0, finalFilename.lastIndexOf('.'));
            const extension = finalFilename.substring(finalFilename.lastIndexOf('.'));
            let counter = 1;
            let testFilename = finalFilename;

            while (existingFilenames.includes(testFilename)) {
              testFilename = `${baseName}(${counter})${extension}`;
              counter++;
            }
            uniqueFilename = testFilename;
          }
        }
      }

      // Create a file from the blob
      const file = new File([blob], uniqueFilename, { type: 'image/jpeg' });

      // Upload file to API
      const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=output/${uniqueFilename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        console.error('Upload response not ok:', uploadResponse.status, uploadResponse.statusText);
        throw new Error('Failed to upload image');
      }

      // Return the URL of the uploaded image
      const finalUrl = `${config.data_url}/${userData.id}/output/${uniqueFilename}`;
      console.log('Generated vault URL:', finalUrl);
      return finalUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image to vault');
    }
  }, [userData?.id]);

  // Handle image selection (for adding new images)
  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageSelector(true);
  };

  // Fetch image for Professional Editor (same as ContentEdit)
  const fetchImageForProfessionalEditor = async (imageUrl: string, imageName: string) => {
    let loadingToast: any;
    try {
      setIsLoadingImage(true);
      loadingToast = toast.loading('Loading image...', {
        description: 'Preparing image for professional editing',
        duration: Infinity
      });

      // Download the image file
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the downloaded blob
      const blobUrl = URL.createObjectURL(blob);

      // Set the image source to the downloaded file
      setImageSrc(blobUrl);
      setHasImage(true);

      toast.dismiss(loadingToast);
      toast.success('Image loaded successfully!');

    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image. Please try again.');

      // Fallback to original URL if download fails
      setImageSrc(imageUrl);
      setHasImage(true);
    } finally {
      setIsLoadingImage(false);
      if (loadingToast) toast.dismiss(loadingToast);
    }
  };

  // Handle clicking on an existing image to select it for editing
  const handleImageClick = (image: SelectedImage, index: number) => {
    console.log('Clicking on image:', image);
    console.log('Image URL:', image.url);
    setCurrentImageIndex(index);

    // For Professional Editor, fetch the image properly
    if (editorMode === 'professional') {
      fetchImageForProfessionalEditor(image.url, image.name);
      setProfessionalImage(image.url);
    } else if (editorMode === 'ai-powered') {
      // For AI-Powered Editor, set the URL directly and initialize mask canvas
      setImageSrc(image.url);
      setHasImage(true);
      setAiEditImage(image.url);
      setIsErasing(false); // Reset to draw mode
      setTimeout(() => {
        initializeMaskCanvas(image.url);
      }, 100);
      toast.success(`Selected ${image.name} for editing`);
    }
  };

  // Handle removing an image from selection
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages[index] = null;
    setSelectedImages(updatedImages);

    // If this was the currently selected image, clear the editor
    if (currentImageIndex === index) {
      setImageSrc(null);
      setHasImage(false);
      setAiEditImage(null);
      setProfessionalImage(null);
      setCurrentImageIndex(null);
    }

    toast.success('Image removed from composition');
  };

  // Handle image naming for all image types (synthesis requires names for all images)
  const handleImageNameConfirm = () => {
    if (!pendingImageData || !pendingImageName.trim()) {
      toast.error('Please enter a name for the image');
      return;
    }

    // Remove spaces and replace with underscores
    const processedName = pendingImageName.trim().replace(/\s+/g, '_');

    const finalImage: SelectedImage = {
      id: pendingImageData.tempId || `compose-${Date.now()}`,
      url: pendingImageData.url,
      name: processedName,
      type: pendingImageData.type
    };

    // Update selected images (don't set as current image for editing)
    const updatedImages = [...selectedImages];
    updatedImages[currentImageIndex!] = finalImage;
    setSelectedImages(updatedImages);

    // Close modals
    setShowImageNameModal(false);
    setShowImageSelector(false);

    // Reset state
    setPendingImageData(null);
    setPendingImageName('');

    toast.success(`Added ${processedName} to composition`);
  };

  // Add image to prompt
  const addImageToPrompt = (imageName: string) => {
    setPrompt(prev => prev + ` @${imageName}`);
  };

  // Professional Editor functions (same as ContentEdit)
  // Get editor defaults with vault upload configuration
  const getEditorDefaultsWithUpload = useCallback(() => {
    return getEditorDefaults({
      // Image writer configuration
      imageWriter: {
        store: async (file: File) => {
          try {
            // Upload to vault instead of direct backend upload
            const vaultUrl = await uploadImageToVault(file, file.name.split('.')[0], 'professional_edit');
            return vaultUrl;
          } catch (error) {
            console.error('Error uploading to vault:', error);
            throw new Error('Failed to upload image to vault');
          }
        },
      },
    });
  }, [userData?.id, uploadImageToVault]);

  const editorDefaults = getEditorDefaultsWithUpload();

  // Handle editor process
  const handleEditorProcess = useCallback((imageState: any) => {
    try {
      // Only save to state for preview, do not download automatically
      const editedURL = URL.createObjectURL(imageState.dest);
      setEditedImageUrl(editedURL);
      toast.success('Image edited and ready!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    }
  }, []);

  // Download handler for the button
  const handleDownloadEdited = useCallback(async () => {
    if (!editedImageUrl || !imageSrc) return;
    // Fetch the blob and trigger download
    const response = await fetch(editedImageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'edited_image.jpg', { type: 'image/jpeg' });
    // Create download link
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [editedImageUrl, imageSrc]);

  // Upload to vault handler
  const handleUploadToVault = useCallback(async () => {
    if (!editedImageUrl) {
      toast.error('Please edit an image first');
      return;
    }

    try {
      setIsUploading(true);
      const loadingToast = toast.loading('Uploading to vault...', {
        description: 'Processing edited image',
      });

      // Fetch the edited image as a blob
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();

      // Upload to vault
      const vaultUrl = await uploadImageToVault(blob, 'edited_image', 'professional_edit');
      
      toast.dismiss(loadingToast);
      toast.success('Image uploaded to vault successfully!');
      
      console.log('Uploaded to vault:', vaultUrl);
    } catch (error) {
      console.error('Error uploading to vault:', error);
      toast.error('Failed to upload image to vault');
    } finally {
      setIsUploading(false);
    }
  }, [editedImageUrl, uploadImageToVault]);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = editorWidth;
    const startHeight = editorHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (direction === 'e' || direction === 'se') {
        setEditorWidth(Math.max(400, startWidth + deltaX));
      }
      if (direction === 's' || direction === 'se') {
        setEditorHeight(Math.max(300, startHeight + deltaY));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [editorWidth, editorHeight]);

  // Cleanup blob URLs when component unmounts or image changes
  useEffect(() => {
    return () => {
      // Cleanup blob URLs to prevent memory leaks
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
      if (editedImageUrl && editedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editedImageUrl);
      }
    };
  }, [imageSrc, editedImageUrl]);

  // AI-Powered Editor mask drawing functions (same as ContentEdit)
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
          // Convert hex color to RGB and apply user-defined opacity (max 30%)
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

  const processAiEdit = async () => {
    if (!aiEditImage || !textPrompt.trim()) {
      toast.error('Please select an image and enter a text prompt');
      return;
    }

    setIsProcessingAiEdit(true);
    const loadingToast = toast.loading('Processing AI image edit...');

    try {
      // Get mask data and upload to vault
      const canvas = maskCanvasRef.current;
      if (!canvas) {
        throw new Error('Mask canvas not available');
      }

      // Convert mask canvas to blob and upload to vault
      toast.loading('Uploading mask to vault...', {
        id: loadingToast,
        description: 'Preparing mask for AI processing'
      });

      const maskBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });

      const maskVaultUrl = await uploadImageToVault(maskBlob, 'mask', 'ai_edit');

      // Create payload for AI processing
      const payload = {
        image_url: aiEditImage, // This is now always a Vault URL
        mask_data_url: maskVaultUrl,
        prompt: textPrompt,
        user: userData.id
      };

      const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });
      const useridData = await useridResponse.json();

      // Send to AI processing endpoint
      const headers: any = {
        'Authorization': 'Bearer WeInfl3nc3withAI',
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to process AI edit');
      }

      const result = await response.json();

      // Handle the result
      toast.dismiss(loadingToast);
      toast.success('AI image edit completed!');

      console.log('AI edit result:', result);

    } catch (error) {
      console.error('Error processing AI edit:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to process AI edit. Please try again.');
    } finally {
      setIsProcessingAiEdit(false);
    }
  };

  // Fetch influencers data
  const fetchInfluencers = async () => {
    setInfluencersLoading(true);
    try {
      const response = await fetch(`${config.supabase_server_url}/influencer?user_id=eq.${userData.id}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch influencers');
      }

      const data = await response.json();

      // Process influencers to add proper image URLs
      const processedInfluencers = (data || []).map((influencer: Influencer) => {
        // Construct the proper image URL using the same logic as other pages
        let imageNum = influencer.image_num - 1;
        if (imageNum === -1) {
          imageNum = 0;
        }

        const imageUrl = `${config.data_url}/${userData.id}/models/${influencer.id}/profilepic/profilepic${imageNum}.png`;

        return {
          ...influencer,
          image_url: imageUrl
        };
      });

      setInfluencers(processedInfluencers);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      toast.error('Failed to load influencers');

      // Fallback to sample data for demonstration
      const sampleInfluencers: Influencer[] = [
        {
          id: 'sample-1',
          user_id: 'user-1',
          image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
          influencer_type: 'Lifestyle',
          name_first: 'Sarah',
          name_last: 'Johnson',
          visual_only: false,
          sex: 'female',
          age_lifestyle: '25-30',
          origin_birth: 'USA',
          origin_residence: 'Los Angeles',
          cultural_background: 'American',
          hair_length: 'medium',
          hair_color: 'brown',
          hair_style: 'straight',
          eye_color: 'blue',
          lip_style: 'natural',
          nose_style: 'natural',
          eyebrow_style: 'natural',
          face_shape: 'oval',
          facial_features: 'natural',
          bust_size: 'medium',
          skin_tone: 'fair',
          body_type: 'athletic',
          color_palette: ['blue', 'white', 'black'],
          clothing_style_everyday: 'casual',
          clothing_style_occasional: 'elegant',
          clothing_style_home: 'comfortable',
          clothing_style_sports: 'athletic',
          clothing_style_sexy_dress: 'elegant',
          home_environment: 'modern',
          content_focus: ['lifestyle', 'fitness'],
          content_focus_areas: ['health', 'wellness'],
          job_area: 'fitness',
          job_title: 'Fitness Influencer',
          job_vibe: 'energetic',
          hobbies: ['yoga', 'running'],
          social_circle: 'active',
          strengths: ['motivation', 'authenticity'],
          weaknesses: ['perfectionism'],
          speech_style: ['encouraging'],
          humor: ['positive'],
          core_values: ['health', 'authenticity'],
          current_goals: ['help others'],
          background_elements: ['gym', 'nature'],
          prompt: 'A fitness influencer promoting healthy lifestyle',
          notes: 'Sample influencer for demonstration',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          image_num: 1,
          age: '28',
          lifestyle: 'active',
          eye_shape: 'almond',
          lorastatus: 2
        },
        {
          id: 'sample-2',
          user_id: 'user-2',
          image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          influencer_type: 'Fashion',
          name_first: 'Michael',
          name_last: 'Chen',
          visual_only: false,
          sex: 'male',
          age_lifestyle: '30-35',
          origin_birth: 'Canada',
          origin_residence: 'Toronto',
          cultural_background: 'Asian-Canadian',
          hair_length: 'short',
          hair_color: 'black',
          hair_style: 'styled',
          eye_color: 'brown',
          lip_style: 'natural',
          nose_style: 'natural',
          eyebrow_style: 'natural',
          face_shape: 'square',
          facial_features: 'natural',
          bust_size: 'medium',
          skin_tone: 'medium',
          body_type: 'slim',
          color_palette: ['black', 'white', 'gray'],
          clothing_style_everyday: 'smart-casual',
          clothing_style_occasional: 'formal',
          clothing_style_home: 'comfortable',
          clothing_style_sports: 'minimal',
          clothing_style_sexy_dress: 'elegant',
          home_environment: 'minimalist',
          content_focus: ['fashion', 'lifestyle'],
          content_focus_areas: ['style', 'minimalism'],
          job_area: 'fashion',
          job_title: 'Fashion Influencer',
          job_vibe: 'sophisticated',
          hobbies: ['photography', 'travel'],
          social_circle: 'creative',
          strengths: ['style', 'creativity'],
          weaknesses: ['overthinking'],
          speech_style: ['articulate'],
          humor: ['dry'],
          core_values: ['authenticity', 'creativity'],
          current_goals: ['inspire others'],
          background_elements: ['urban', 'studio'],
          prompt: 'A fashion influencer with minimalist style',
          notes: 'Sample influencer for demonstration',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          image_num: 1,
          age: '32',
          lifestyle: 'urban',
          eye_shape: 'round',
          lorastatus: 2
        }
      ];
      setInfluencers(sampleInfluencers);
    } finally {
      setInfluencersLoading(false);
    }
  };

  // Load influencers when modal opens
  useEffect(() => {
    if (showInfluencers && influencers.length === 0) {
      fetchInfluencers();
    }
  }, [showInfluencers]);

  // Handle editor mode changes - ensure proper image loading for each mode
  useEffect(() => {
    const currentImage = currentImageIndex !== null ? selectedImages[currentImageIndex] : null;
    
    console.log('Editor mode changed:', editorMode, 'Current image:', currentImage);
    
    if (currentImage) {
      if (editorMode === 'professional') {
        console.log('Loading image for Professional Editor:', currentImage.url);
        // For Professional Editor, fetch the image properly
        fetchImageForProfessionalEditor(currentImage.url, currentImage.name);
        setProfessionalImage(currentImage.url);
      } else if (editorMode === 'ai-powered') {
        console.log('Loading image for AI-Powered Editor:', currentImage.url);
        // For AI-Powered Editor, set the URL directly
        setImageSrc(currentImage.url);
        setHasImage(true);
        setAiEditImage(currentImage.url);
        setTimeout(() => {
          initializeMaskCanvas(currentImage.url);
        }, 100);
      }
    } else {
      // Clear states when no image is selected
      console.log('No image selected, clearing states');
      setImageSrc(null);
      setHasImage(false);
      setAiEditImage(null);
      setProfessionalImage(null);
    }
  }, [editorMode, currentImageIndex]);

  // Filtered influencers for search
  const filteredInfluencers = influencers.filter(influencer => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      influencer.name_first?.toLowerCase().includes(searchLower) ||
      influencer.name_last?.toLowerCase().includes(searchLower) ||
      influencer.influencer_type?.toLowerCase().includes(searchLower) ||
      influencer.job_title?.toLowerCase().includes(searchLower) ||
      influencer.content_focus?.some(focus => focus.toLowerCase().includes(searchLower)) ||
      influencer.hobbies?.some(hobby => hobby.toLowerCase().includes(searchLower))
    );
  });

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
      // Cleanup blob URLs in selectedImages
      selectedImages.forEach(image => {
        if (image && image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [imageSrc, editedImageUrl, selectedImages]);

  // Handle image upload with professional workflow
  const handleImageUpload = async (file: File) => {
    console.log('handleImageUpload called with file:', file);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        console.error('File too large:', file.size);
        toast.error('File size must be less than 10MB');
        return;
      }

      // Set upload state
      setIsUploading(true);
      setUploadProgress(0);

      // First, create a local preview immediately for better UX
      const reader = new FileReader();
      reader.onerror = () => {
        toast.error('Error reading file. Please try again.');
        setIsUploading(false);
        setUploadProgress(0);
      };

      reader.onload = async (e) => {
        const result = e.target?.result as string;

        // Simulate progress for better UX
        setUploadProgress(30);

        // Now upload to vault first, then show naming modal
        const loadingToast = toast.loading('Uploading to vault...', {
          description: 'Securing your image'
        });

        try {
          setUploadProgress(60);

          // Convert data URL to blob and upload to vault
          const response = await fetch(result);
          const blob = await response.blob();

          setUploadProgress(80);
          const vaultUrl = await uploadImageToVault(blob, file.name.split('.')[0], 'compose_upload');

          console.log('Upload successful, vault URL:', vaultUrl);

          setUploadProgress(100);

          // Set pending image data with vault URL
          setPendingImageData({
            url: vaultUrl,
            name: file.name,
            type: 'upload',
            tempId: `vault-${Date.now()}`
          });
          setPendingImageName(file.name.split('.')[0]); // Use filename without extension
          setShowImageNameModal(true);
          setShowUpload(false);
          setShowImageSelector(false);

          toast.dismiss(loadingToast);
          toast.success('Image uploaded successfully!');

          // Reset upload state immediately
          setIsUploading(false);
          setUploadProgress(0);

        } catch (uploadError) {
          console.error('Vault upload error:', uploadError);
          toast.dismiss(loadingToast);
          toast.error('Failed to upload image to vault. Please try again.');
          setIsUploading(false);
          setUploadProgress(0);
        }

        // Clear the file input
        const fileInput = document.getElementById('compose-file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      toast.error(`Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle library selection
  const handleLibrarySelect = async (image: ImageData) => {
    try {
      // Use CDN URL directly (same as ContentEdit AI Image Edit mode)
      const imageUrl = `${config.data_url}/${userData.id}/output/${image.system_filename}`;

      console.log('Library image URL:', imageUrl);

      // For synthesis, all images need names - show naming modal
      setPendingImageData({
        url: imageUrl,
        name: image.user_filename || image.system_filename,
        type: 'library',
        tempId: image.id
      });
      setPendingImageName(image.user_filename || image.system_filename);
      setShowImageNameModal(true);
      setShowLibrary(false);
      setShowImageSelector(false);

      toast.success('Image selected from library');
    } catch (error) {
      console.error('Error selecting image from library:', error);
      toast.error('Failed to select image from library. Please try again.');
    }
  };

  // Handle influencer selection
  const handleInfluencerSelect = async (influencer: Influencer) => {
    try {
      // Get the latest profile picture URL (same logic as ContentEdit)
      let latestImageNum = influencer.image_num - 1;
      if (latestImageNum === -1) {
        latestImageNum = 0;
      }

      const profileImageUrl = `${config.data_url}/${userData.id}/models/${influencer.id}/profilepic/profilepic${latestImageNum}.png`;
      console.log('Profile image URL:', profileImageUrl);

      // For synthesis, all images need names - show naming modal
      setPendingImageData({
        url: profileImageUrl,
        name: `${influencer.name_first} ${influencer.name_last}`,
        type: 'influencer',
        tempId: influencer.id
      });
      setPendingImageName(`${influencer.name_first} ${influencer.name_last}`);
      setShowImageNameModal(true);
      setShowInfluencers(false);
      setShowImageSelector(false);

      toast.success('Influencer selected');
    } catch (error) {
      console.error('Error selecting influencer:', error);
      toast.error('Failed to select influencer. Please try again.');
    }
  };

  // Handle generate
  const handleGenerate = async () => {
    if (!hasImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would implement the actual generation logic based on editorMode
      switch (editorMode) {
        case 'ai-powered':
          // AI-Powered Editor generation
          break;

        case 'professional':
          // Professional Editor generation
          break;
      }

      toast.success('Generation completed!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Render AI-Powered Editor (same as ContentEdit)
  const renderAIPoweredEditor = () => {
    if (!aiEditImage) {
      return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No image selected</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Select an image from the cards on the right</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
        <div className="space-y-4 sm:space-y-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  AI-Powered Editor
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Compact Mask Controls at Top */}
            <div className="lg:col-span-3">
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    {/* Mode Controls */}
                    <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                      <Button
                        variant={isErasing === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsErasing(false)}
                        className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${isErasing === false
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                      >
                        <Brush className="w-3 h-3" />
                        <span className="hidden 2xl:inline">Draw</span>
                      </Button>
                      <Button
                        variant={isErasing === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsErasing(true)}
                        className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${isErasing === true
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
                          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                      >
                        <EyeOff className="w-3 h-3" />
                        <span className="hidden 2xl:inline">Erase</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearMask}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                      >
                        <X className="w-3 h-3" />
                        <span className="hidden 2xl:inline">Clear</span>
                      </Button>
                    </div>

                    {/* Brush Size */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <Label className="text-xs sm:text-sm whitespace-nowrap">Brush: {brushSize}px</Label>
                      <Slider
                        value={[brushSize]}
                        onValueChange={([value]) => setBrushSize(value)}
                        min={5}
                        max={100}
                        step={1}
                        className="w-full sm:w-32"
                      />
                    </div>

                    {/* Mask Color */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Label className="text-xs sm:text-sm">Color:</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowColorSelector(true)}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                      >
                        <div
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: maskColor }}
                        />
                        <span className="hidden sm:inline">Select Color</span>
                      </Button>
                    </div>

                    {/* Opacity */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Label className="text-xs sm:text-sm">Opacity: {maskOpacity}%</Label>
                      <Slider
                        value={[maskOpacity]}
                        onValueChange={([value]) => setMaskOpacity(Math.min(value, 30))}
                        min={2}
                        max={30}
                        step={1}
                        className="w-full sm:w-24"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Left Panel - Image and Mask */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
              {/* Enhanced Image Display */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    Image & Mask Editor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
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
                        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm flex items-center gap-1 sm:gap-2 md:gap-3 shadow-xl border border-white/20">
                          <div
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-lg"
                            style={{
                              backgroundColor: isErasing ? '#000000' : maskColor,
                              opacity: isErasing ? 1 : maskOpacity / 100
                            }}
                          />
                          <span className="font-semibold hidden sm:inline">{isErasing ? 'Erase' : 'Draw'}: {brushSize}px ({maskOpacity}%)</span>
                          <span className="font-semibold sm:hidden">{brushSize}px</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Controls */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Enhanced Text Prompt */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Type className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    Text Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Describe the changes you want to make:</Label>
                    <Textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="e.g., Change hair color to blonde, Add glasses, Remove background..."
                      className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPresetSelector(true)}
                    className="w-full text-sm sm:text-base"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Choose Preset
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced Process Button */}
              <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-3 sm:p-6">
                  <Button
                    onClick={processAiEdit}
                    disabled={!textPrompt.trim() || isProcessingAiEdit}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold py-3 sm:py-4 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isProcessingAiEdit ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                        <span className="text-sm sm:text-base">Processing AI Edit...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                        <span className="text-sm sm:text-base">Process AI Edit</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Professional Editor (same as ContentEdit)
  const renderProfessionalEditor = () => (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Professional Editor</h3>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDownloadEdited}
              disabled={!hasImage || !editedImageUrl}
              variant="outline"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm font-semibold transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              onClick={handleUploadToVault}
              disabled={!hasImage || !editedImageUrl || isUploading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Upload to Vault</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Main Editor */}
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
            {!hasImage ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl h-[400px] md:h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 cursor-pointer group">
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
                className={`border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 relative transition-all duration-300 ${isResizing ? 'ring-4 ring-blue-500/30 shadow-2xl' : 'shadow-lg hover:shadow-xl'}`}
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
                    ['social', []],
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
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );



  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Image Composer
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Create stunning compositions with AI-powered editing tools
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Editor Mode Selector */}
          <div className="flex-1 sm:flex-none">
            <Select value={editorMode} onValueChange={(value: EditorMode) => setEditorMode(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="h-4 w-4" />
                    <span>Professional Editor</span>
                  </div>
                </SelectItem>
                <SelectItem value="ai-powered">
                  <div className="flex items-center space-x-2">
                    <Wand2 className="h-4 w-4" />
                    <span>AI Powered Editor</span>
                  </div>
                </SelectItem>

              </SelectContent>
            </Select>
          </div>
          
          {/* Library Button */}
          <Button variant="outline" className="flex items-center space-x-2 flex-shrink-0">
            <FolderOpen className="h-4 w-4" />
            <span>Library</span>
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row flex-1 py-4 space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Left side - Editor */}
        <div className="flex-1 min-w-0">
          {editorMode === 'ai-powered' && renderAIPoweredEditor()}
          {editorMode === 'professional' && renderProfessionalEditor()}

        </div>

        {/* Right side - Image Selection Cards */}
        <div className="w-full lg:w-40 xl:w-60 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Image Selection</h3>
            <Badge variant="outline" className="text-xs">
              {selectedImages.filter(img => img !== null).length}/3
            </Badge>
          </div>

          {/* Mobile: Grid layout for image cards */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
            {selectedImages.map((image, index) => (
              <Card
                key={index}
                className={`group transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${image
                    ? `ring-2 ${currentImageIndex === index ? 'ring-purple-500 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20' : 'ring-gray-300 dark:ring-gray-600 hover:ring-purple-400 dark:hover:ring-purple-500'} cursor-pointer`
                    : 'border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer'
                  }`}
                onClick={() => image ? handleImageClick(image, index) : handleImageSelect(index)}
              >
                <CardContent className="p-4">
                  {image ? (
                    <div className="space-y-3">
                      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2">
                              <Edit3 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </div>
                          </div>
                        </div>

                        {/* Type indicator and delete button */}
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                          <Badge
                            variant={image.type === 'upload' ? 'default' : image.type === 'influencer' ? 'secondary' : 'outline'}
                            className="text-xs px-2 py-1 flex items-center gap-1"
                          >
                            {image.type === 'upload' && <Upload className="h-3 w-3" />}
                            {image.type === 'influencer' && <User className="h-3 w-3" />}
                            {image.type === 'library' && <FolderOpen className="h-3 w-3" />}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                            {image.name}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{image.type}</span>
                          <span className={currentImageIndex === index ? "text-purple-600 dark:text-purple-400 font-medium" : "text-gray-500 dark:text-gray-400"}>
                            {currentImageIndex === index ? "✓ Editing" : "Click to edit"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 group-hover:text-purple-500 transition-colors duration-300">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors duration-300 mb-2">
                        <Plus className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">Add Image</p>
                      <p className="text-xs text-gray-400">Click to select</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-4 sm:p-6 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Prompt Window */}
          <div className="flex-1">
            <Label htmlFor="prompt" className="text-sm font-medium mb-2 block">
              Text Prompt
            </Label>
            <Textarea
              id="prompt"
              placeholder="Enter your editing instructions..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Generate Button */}
          <div className="w-full lg:w-80">
            <Button
              onClick={handleGenerate}
              disabled={!hasImage || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Image Selector Modal */}
      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Select Image Source
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Choose where to get your image from
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            {/* Library Option */}
            <div
              className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/20 dark:hover:to-blue-950/20"
              onClick={() => {
                setShowImageSelector(false);
                setShowLibrary(true);
              }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Select from Library
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Choose from your existing image collection
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Influencers Option */}
            <div
              className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20"
              onClick={() => {
                setShowImageSelector(false);
                setShowInfluencers(true);
              }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Select from Influencers
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Use influencer profile images
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Option */}
            <div
              className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20"
              onClick={() => {
                setShowImageSelector(false);
                setShowUpload(true);
              }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      Upload New Image
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Upload a new image from your device
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Library Modal */}
      <VaultSelector
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onImageSelect={handleLibrarySelect}
        title="Select from Library"
        description="Choose an image from your library"
      />

      {/* Influencers Modal */}
      <Dialog open={showInfluencers} onOpenChange={setShowInfluencers}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Select from Influencers</DialogTitle>
            <DialogDescription className="text-base">
              Choose an influencer's profile image for editing
            </DialogDescription>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search influencers by name, type, or interests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {influencersLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Loading influencers...</span>
              </div>
            ) : filteredInfluencers.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <User className="h-8 w-8 mr-2" />
                <span>
                  {searchTerm ? 'No influencers found matching your search' : 'No influencers found'}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
                {filteredInfluencers.map((influencer) => (
                  <Card
                    key={influencer.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => handleInfluencerSelect(influencer)}
                  >
                    <CardContent className="p-4">
                      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 overflow-hidden">
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
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.parentElement?.querySelector('.placeholder');
                              if (placeholder) {
                                (placeholder as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="placeholder flex items-center justify-center h-full" style={{ display: influencer.image_url ? 'none' : 'flex' }}>
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold truncate">
                            {influencer.name_first} {influencer.name_last}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {influencer.influencer_type}
                          </p>
                        </div>
                        {influencer.job_title && (
                          <p className="text-xs text-gray-400 truncate">
                            {influencer.job_title}
                          </p>
                        )}
                        {influencer.content_focus && influencer.content_focus.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {influencer.content_focus.slice(0, 2).map((focus, index) => (
                              <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                {focus}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Upload New Image
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Add a new image to your composition
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Upload Area */}
            <div
              className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 overflow-hidden ${isUploading
                  ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-75'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 cursor-pointer'
                }`}
              onClick={() => {
                if (!isUploading) {
                  const fileInput = document.getElementById('compose-file-upload') as HTMLInputElement;
                  if (fileInput) {
                    fileInput.click();
                  }
                }
              }}
              onDragOver={(e) => {
                if (!isUploading) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onDragEnter={(e) => {
                if (!isUploading) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onDrop={(e) => {
                if (!isUploading) {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files[0]) {
                    handleImageUpload(files[0]);
                  }
                }
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 transform rotate-12 scale-150"></div>
              </div>

              {/* Upload Icon */}
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Drop your image here
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse your files
                </p>

                {/* File Info */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>JPG, PNG, GIF</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Max 10MB</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>High Quality</span>
                    </div>
                  </div>
                </div>

                {isUploading ? (
                  <div className="w-full">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Uploading...</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="bg-white dark:bg-gray-800 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-400 dark:hover:border-green-500 transition-all duration-200"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const fileInput = document.getElementById('compose-file-upload') as HTMLInputElement;
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !isUploading) {
                    handleImageUpload(file);
                  }
                }}
                id="compose-file-upload"
              />
            </div>

            {/* Upload Tips */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">💡</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Upload Tips
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use high-resolution images for best results</li>
                    <li>• Supported formats: JPG, PNG, GIF</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Images are automatically saved to your vault</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Name Modal */}
      <Dialog open={showImageNameModal} onOpenChange={setShowImageNameModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Type className="w-5 h-5 text-purple-500" />
              Name Your Image
            </DialogTitle>
            <DialogDescription>
              Give this image a name that you can reference in your prompts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Preview */}
            {pendingImageData && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <img
                  src={pendingImageData.url}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    Source: {pendingImageData.type}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    This name will be used as @imageName in your prompts
                  </p>
                </div>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="image-name">Image Name</Label>
              <Input
                id="image-name"
                value={pendingImageName}
                onChange={(e) => setPendingImageName(e.target.value)}
                placeholder="e.g., woman, man, park, background..."
                className="w-full"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Use a descriptive name that you can reference in your prompts. Spaces will be automatically replaced with underscores.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImageNameModal(false);
                  setPendingImageData(null);
                  setPendingImageName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImageNameConfirm}
                disabled={!pendingImageName.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Add to Composition
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Color Selector Modal */}
      <Dialog open={showColorSelector} onOpenChange={setShowColorSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-500" />
              Select Mask Color
            </DialogTitle>
            <DialogDescription>
              Choose a color for your mask overlay
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              {[
                { name: 'Green', value: '#00ff00' },
                { name: 'Red', value: '#ff0000' },
                { name: 'Blue', value: '#0000ff' },
                { name: 'Yellow', value: '#ffff00' },
                { name: 'Purple', value: '#800080' },
                { name: 'Orange', value: '#ffa500' },
                { name: 'Pink', value: '#ffc0cb' },
                { name: 'Cyan', value: '#00ffff' },
                { name: 'Magenta', value: '#ff00ff' },
                { name: 'Lime', value: '#00ff00' },
                { name: 'Teal', value: '#008080' },
                { name: 'Indigo', value: '#4b0082' }
              ].map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    setMaskColor(color.value);
                    setShowColorSelector(false);
                    toast.success(`Selected color: ${color.name}`);
                  }}
                  className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-lg group ${maskColor === color.value ? 'ring-2 ring-blue-500 shadow-lg' : 'border-gray-300 dark:border-gray-600'}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {maskColor === color.value && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-800">✓</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-color">Custom Color</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-color"
                  type="color"
                  value={maskColor}
                  onChange={(e) => setMaskColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={maskColor}
                  onChange={(e) => setMaskColor(e.target.value)}
                  placeholder="#00ff00"
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: maskColor }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {maskColor}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preset Selector Modal */}
      <Dialog open={showPresetSelector} onOpenChange={setShowPresetSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              Choose Preset
            </DialogTitle>
            <DialogDescription>
              Select a preset prompt for common editing tasks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Change Hair Color', prompt: 'Change hair color to blonde' },
                { name: 'Add Glasses', prompt: 'Add stylish glasses to the person' },
                { name: 'Remove Background', prompt: 'Remove background and make it transparent' },
                { name: 'Change Eye Color', prompt: 'Change eye color to blue' },
                { name: 'Add Beard', prompt: 'Add a well-groomed beard to the person' },
                { name: 'Remove Blemishes', prompt: 'Remove skin blemishes and imperfections' },
                { name: 'Change Clothing', prompt: 'Change clothing to a formal suit' },
                { name: 'Add Makeup', prompt: 'Add natural makeup to enhance features' },
                { name: 'Change Background', prompt: 'Change background to a beach scene' },
                { name: 'Add Jewelry', prompt: 'Add elegant jewelry to the person' },
                { name: 'Remove Wrinkles', prompt: 'Remove wrinkles and smooth skin' },
                { name: 'Change Expression', prompt: 'Change expression to a smile' }
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setTextPrompt(preset.prompt);
                    setShowPresetSelector(false);
                    toast.success(`Applied preset: ${preset.name}`);
                  }}
                  className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {preset.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {preset.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
