import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
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

type EditorMode = 'professional' | 'ai-powered' | 'ai-synthesis';

export default function Compose() {
  const userData = useSelector((state: RootState) => state.user);
  const editorRef = useRef(null);
  const dispatch = useDispatch();

  // State management
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(Array(5).fill(null));
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('ai-powered');
  const [prompt, setPrompt] = useState('');
  const [synthesisPrompt, setSynthesisPrompt] = useState('');
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

  // AI Editor states
  const [aiEditImage, setAiEditImage] = useState<string | null>(null);
  const [aiEditMask, setAiEditMask] = useState<string | null>(null);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [aiEditStrength, setAiEditStrength] = useState(0.8);
  const [aiEditGuidance, setAiEditGuidance] = useState(7.5);

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
  
  // Handle clicking on an existing image to select it for editing
  const handleImageClick = (image: SelectedImage, index: number) => {
    console.log('Clicking on image:', image);
    console.log('Image URL:', image.url);
    setImageSrc(image.url);
    setHasImage(true);
    setAiEditImage(image.url);
    setProfessionalImage(image.url);
    setCurrentImageIndex(index);
    toast.success(`Selected ${image.name} for editing`);
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
  
  // Handle image naming for uploaded images only
  const handleImageNameConfirm = () => {
    if (!pendingImageData || !pendingImageName.trim()) {
      toast.error('Please enter a name for the image');
      return;
    }
    
    // This should only be called for uploaded images
    if (pendingImageData.type !== 'upload') {
      console.error('Naming modal should only be used for uploaded images');
      return;
    }
    
    // Remove spaces and replace with underscores
    const processedName = pendingImageName.trim().replace(/\s+/g, '_');
    
    const finalImage: SelectedImage = {
      id: pendingImageData.tempId || `compose-${Date.now()}`,
      url: pendingImageData.url,
      name: processedName,
      type: 'upload'
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
  
  // Add image to synthesis prompt
  const addImageToPrompt = (imageName: string) => {
    if (editorMode === 'ai-synthesis') {
      setSynthesisPrompt(prev => prev + ` @${imageName}`);
    } else {
      setPrompt(prev => prev + ` @${imageName}`);
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
          
          // Reset upload state after a short delay
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 1000);
          
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
      
      // For library images, add directly without naming modal
      const finalImage: SelectedImage = {
        id: image.id,
        url: imageUrl,
        name: image.user_filename || image.system_filename,
        type: 'library'
      };
      
      console.log('Final library image:', finalImage);
      
      // Update selected images directly
      const updatedImages = [...selectedImages];
      updatedImages[currentImageIndex!] = finalImage;
      setSelectedImages(updatedImages);
      
      // Close modals
      setShowLibrary(false);
      setShowImageSelector(false);

      toast.success(`Added ${image.user_filename || image.system_filename} from library`);
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

      // For influencer images, add directly without naming modal
      const finalImage: SelectedImage = {
        id: influencer.id,
        url: profileImageUrl,
        name: `${influencer.name_first} ${influencer.name_last}`,
        type: 'influencer'
      };
      
      // Update selected images directly
      const updatedImages = [...selectedImages];
      updatedImages[currentImageIndex!] = finalImage;
      setSelectedImages(updatedImages);
      
      // Close modals
      setShowInfluencers(false);
      setShowImageSelector(false);

      toast.success(`Added ${influencer.name_first} ${influencer.name_last} from influencers`);
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
        case 'ai-synthesis':
          // AI Synthesis generation
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

  // Render AI-Powered Editor
  const renderAIPoweredEditor = () => (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Wand2 className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">AI-Powered Editor</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAiEditMask(null)}
            disabled={!aiEditMask}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Mask
          </Button>
        </div>
      </div>

      {hasImage ? (
        <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="relative aspect-square">
            <img
              src={imageSrc!}
              alt="Selected"
              className="w-full h-full object-cover"
            />
            {aiEditMask && (
              <div className="absolute inset-0 bg-blue-500/30 pointer-events-none" />
            )}
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="ai-prompt">AI Edit Prompt</Label>
              <Textarea
                id="ai-prompt"
                placeholder="Describe the changes you want to make..."
                value={aiEditPrompt}
                onChange={(e) => setAiEditPrompt(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Strength: {aiEditStrength}</Label>
                <Slider
                  value={[aiEditStrength]}
                  onValueChange={([value]) => setAiEditStrength(value)}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Guidance: {aiEditGuidance}</Label>
                <Slider
                  value={[aiEditGuidance]}
                  onValueChange={([value]) => setAiEditGuidance(value)}
                  max={20}
                  min={1}
                  step={0.5}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No image selected</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Select an image from the cards on the right</p>
          </div>
        </div>
      )}
    </div>
  );

  // Render Professional Editor
  const renderProfessionalEditor = () => (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Edit3 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Professional Editor</h3>
      </div>

      {hasImage ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="aspect-square">
            <img
              src={imageSrc!}
              alt="Selected"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(professionalSettings).map(([key, value]) => (
                <div key={key}>
                  <Label className="capitalize">{key}: {value}</Label>
                  <Slider
                    value={[value]}
                    onValueChange={([newValue]) => 
                      setProfessionalSettings(prev => ({ ...prev, [key]: newValue }))
                    }
                    max={100}
                    min={-100}
                    step={1}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No image selected</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Select an image from the cards on the right</p>
          </div>
        </div>
      )}
    </div>
  );

  // Render AI Synthesis Editor
  const renderAISynthesisEditor = () => (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">AI Synthesis Editor</h3>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div>
          <Label htmlFor="synthesis-prompt">Synthesis Prompt</Label>
          <Textarea
            id="synthesis-prompt"
            placeholder="Describe the image you want to generate..."
            value={synthesisPrompt}
            onChange={(e) => setSynthesisPrompt(e.target.value)}
            className="mt-1 min-h-[200px]"
          />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label>Strength: {aiEditStrength}</Label>
            <Slider
              value={[aiEditStrength]}
              onValueChange={([value]) => setAiEditStrength(value)}
              max={1}
              min={0}
              step={0.1}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Guidance: {aiEditGuidance}</Label>
            <Slider
              value={[aiEditGuidance]}
              onValueChange={([value]) => setAiEditGuidance(value)}
              max={20}
              min={1}
              step={0.5}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Image Composer
          </h1>
          <p className="text-muted-foreground mt-1">
            Create stunning compositions with AI-powered editing tools
          </p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Library className="h-4 w-4" />
          <span>Library</span>
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-1 p-6 space-x-6">
        {/* Left side - Editor (80%) */}
        <div className="flex-1">
          {editorMode === 'ai-powered' && renderAIPoweredEditor()}
          {editorMode === 'professional' && renderProfessionalEditor()}
          {editorMode === 'ai-synthesis' && renderAISynthesisEditor()}
        </div>

                 {/* Right side - Image Selection Cards (20%) */}
         <div className="w-80 space-y-4">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold">Image Selection</h3>
             <Badge variant="outline" className="text-xs">
               {selectedImages.filter(img => img !== null).length}/5
             </Badge>
           </div>
                       {selectedImages.map((image, index) => (
              <Card
                key={index}
                className={`group transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                  image 
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
                            className="text-xs px-2 py-1"
                          >
                            {image.type === 'upload' && '📤'}
                            {image.type === 'influencer' && '👤'}
                            {image.type === 'library' && '📁'}
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
                          <div className="flex items-center space-x-2">
                            <span className={currentImageIndex === index ? "text-purple-600 dark:text-purple-400 font-medium" : "text-gray-500 dark:text-gray-400"}>
                              {currentImageIndex === index ? "✓ Editing" : "Click to edit"}
                            </span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs hover:bg-purple-100 dark:hover:bg-purple-900/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addImageToPrompt(image.name);
                                    }}
                                  >
                                    <Type className="h-3 w-3 mr-1" />
                                    Add to Prompt
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add @{image.name} to your prompt</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
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

      {/* Footer */}
      <div className="border-t border-border/50 p-6 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
        <div className="flex space-x-6">
          {/* Prompt Window (60%) */}
          <div className="flex-1">
            <Label htmlFor="prompt" className="text-sm font-medium mb-2 block">
              {editorMode === 'ai-synthesis' ? 'Synthesis Prompt' : 'Text Prompt'}
            </Label>
            <Textarea
              id="prompt"
              placeholder={
                editorMode === 'ai-synthesis' 
                  ? "Describe the image you want to generate..."
                  : "Enter your editing instructions..."
              }
              value={editorMode === 'ai-synthesis' ? synthesisPrompt : prompt}
              onChange={(e) => {
                if (editorMode === 'ai-synthesis') {
                  setSynthesisPrompt(e.target.value);
                } else {
                  setPrompt(e.target.value);
                }
              }}
              className="min-h-[80px]"
            />
          </div>

          {/* Editor Selection and Generate (40%) */}
          <div className="w-80 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Editor Mode</Label>
              <Select value={editorMode} onValueChange={(value: EditorMode) => setEditorMode(value)}>
                <SelectTrigger>
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
                  <SelectItem value="ai-synthesis">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Synthesis Editor</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 overflow-hidden ${
                  isUploading 
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
     </div>
   );
 }
