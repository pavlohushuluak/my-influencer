import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DialogZoom, DialogContentZoom } from '@/components/ui/zoomdialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Download,
  Sparkles,
  Zap,
  Image,
  Settings,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Maximize2,
  RotateCcw,
  Folder,
  Plus,
  Eye,
  Star,
  Palette,
  Crop,
  Scale,
  Wand2,
  RefreshCw,
  Trash2,
  Share2,
  Heart,
  X,
  ExternalLink
} from 'lucide-react';
import VaultSelector from '@/components/VaultSelector';
import config from '@/config/config';
import { toast } from 'sonner';
import { CreditConfirmationModal } from '@/components/CreditConfirmationModal';

interface UpscaleResult {
  id: string;
  taskId: string;
  originalUrl: string;
  enhancedUrl: string;
  upscaledUrl?: string;
  task: string;
  parameters: any;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
}

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
}

const UPSCALE_OPTIONS = [
  { value: '2', label: '2x Upscale', description: 'Double the resolution' },
  { value: '4', label: '4x Upscale', description: 'Quadruple the resolution' },
  { value: '8', label: '8x Upscale', description: '8x the resolution' }
];

const ESRGAN_OPTIONS = [
  { value: '2', label: '2x ESRGAN', description: 'Enhanced 2x upscaling' },
  { value: '4', label: '4x ESRGAN', description: 'Enhanced 4x upscaling' }
];

const ASPECT_RATIOS = [
  { value: '21:9', label: 'Ultrawide 21:9', description: 'Cinematic ultrawide' },
  { value: '16:9', label: 'Widescreen 16:9', description: 'Standard widescreen' },
  { value: '4:3', label: 'Classic 4:3', description: 'Traditional format' },
  { value: '3:2', label: 'Photo 3:2', description: 'Photography standard' },
  { value: '1:1', label: 'Square 1:1', description: 'Perfect square' },
  { value: '2:3', label: 'Portrait 2:3', description: 'Portrait photo' },
  { value: '3:4', label: 'Portrait 3:4', description: 'Tall portrait' },
  { value: '9:16', label: 'Mobile 9:16', description: 'Mobile portrait' },
  { value: '9:21', label: 'Ultrawide Portrait 9:21', description: 'Tall ultrawide' }
];

export default function ContentUpscaler() {
  const userData = useSelector((state: RootState) => state.user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [upscaleResults, setUpscaleResults] = useState<UpscaleResult[]>([]);

  // Image selection modal state
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  
  // Full-size image modal state
  const [showFullSizeModal, setShowFullSizeModal] = useState(false);
  const [fullSizeImage, setFullSizeImage] = useState<{ url: string; title: string; description: string } | null>(null);
  
  // Download loading state
  const [downloadingImages, setDownloadingImages] = useState<Set<string>>(new Set());

  // Task-specific states
  const [upscaleScale, setUpscaleScale] = useState('2');
  const [esrganScale, setEsrganScale] = useState('2');
  const [realismStrength, setRealismStrength] = useState([0.6]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Credit check state for content optimization
  const [showGemWarning, setShowGemWarning] = useState(false);
  const [gemCostData, setGemCostData] = useState<{
    id: number;
    item: string;
    description: string;
    gems: number;
  } | null>(null);
  const [isCheckingGems, setIsCheckingGems] = useState(false);
  const [pendingTask, setPendingTask] = useState<{ task: string; parameters: any } | null>(null);

  const handleFileUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast.success('Image uploaded successfully');
    } else {
      toast.error('Please upload an image file');
    }
  }, []);

  // Function to handle uploaded image as vault image
  const handleUploadedImageAsVault = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      const imageUrl = await uploadImageToVault(file);
      if (imageUrl) {
        // Set the uploaded image URL
        setPreviewUrl(imageUrl);
        setSelectedFile(null); // Clear file since it's now uploaded
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  }, [handleFileUpload]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      // Clear the file input so the same file can be uploaded again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleVaultImageSelect = (image: GeneratedImageData) => {
    // Use the same URL construction logic as VaultSelector
    const imageUrl = `${config.data_url}/cdn-cgi/image/w=800/${userData.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`;
    setPreviewUrl(imageUrl);
    setSelectedFile(null); // Clear file since we're using vault image
    setShowVaultSelector(false);
    toast.success('Image selected from vault');
  };

  const uploadImageToVault = async (file: File): Promise<string | null> => {
    if (!userData.id) {
      toast.error('User not authenticated');
      return null;
    }

    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const filename = `upload_${timestamp}.${fileExtension}`;

      // Upload file using the correct API
      const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=upload/${filename}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      // Return the uploaded image URL
      const imageUrl = `${config.data_url}/${userData.id}/upload/${filename}`;
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  // Function to get the correct item name for credit checking
  const getItemNameForTask = (task: string): string => {
    switch (task) {
      case 'image_upscale':
      case 'image_upscale_esrgan':
        return 'upscaler_standard';
      case 'image_realism':
        return 'image_realism';
      case 'image_reframe':
        return 'image_reframe';
      default:
        return 'upscaler_standard'; // Default fallback
    }
  };

  // Function to check gem cost for the task
  const checkGemCost = async (task: string) => {
    try {
      setIsCheckingGems(true);
      const itemName = getItemNameForTask(task);
      const response = await fetch('https://api.nymia.ai/v1/getgems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({ item: itemName })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gem cost: ${response.status}`);
      }

      const gemData = await response.json();
      return gemData;
    } catch (error) {
      console.error('Error checking gem cost:', error);
      toast.error('Failed to check credit cost. Please try again.');
      return null;
    } finally {
      setIsCheckingGems(false);
    }
  };

  // Function to proceed with image processing after credit confirmation
  const proceedWithImageProcessing = async () => {
    if (!pendingTask) return;
    
    setShowGemWarning(false);
    setIsProcessing(true);

    try {
      const { task, parameters } = pendingTask;
      
      // Show warning for large files
      
      const fileSize = selectedFile?.size || 0;
      const isLargeFile = fileSize > 5 * 1024 * 1024; // 5MB threshold
      
      if (isLargeFile) {
        toast.info('Large file detected. Processing may take longer than usual...', {
          duration: 5000,
        });
      }

      let imageUrl = previewUrl;

      // If we have a file and the previewUrl is a blob URL, upload it first
      if (selectedFile && previewUrl.startsWith('blob:')) {
        const uploadedImageUrl = await uploadImageToVault(selectedFile);
        if (!uploadedImageUrl) {
          setIsProcessing(false);
          return;
        }
        imageUrl = uploadedImageUrl;
        // Update the preview URL to use the uploaded URL
        setPreviewUrl(uploadedImageUrl);
        setSelectedFile(null); // Clear file since it's now uploaded
      }

      // Create the result object
      const result: UpscaleResult = {
        id: Date.now().toString(),
        taskId: '',
        originalUrl: imageUrl,
        enhancedUrl: '',
        task,
        parameters,
        status: 'processing',
        progress: 0,
        createdAt: new Date().toISOString()
      };

      setUpscaleResults(prev => [result, ...prev]);

      // Prepare the request payload based on task type
      let payload: any = {
        reference_image: imageUrl
      };

      // Add task-specific parameters
      switch (task) {
        case 'image_upscale':
          payload = {
            task: 'image_upscale',
            reference_image: imageUrl,
            scaling_factor: parameters.scaling_factor
          };
          break;
        case 'image_upscale_esrgan':
          payload = {
            task: 'image_upscale_esrgan',
            reference_image: imageUrl,
            scaling_factor: parameters.scaling_factor
          };
          break;
        case 'image_realism':
          payload = {
            task: 'image_realism',
            reference_image: imageUrl,
            strength: parameters.strength
          };
          break;
        case 'image_reframe':
          payload = {
            task: 'image_reframe',
            reference_image: imageUrl,
            aspect_ratio: parameters.aspect_ratio
          };
          break;
        default:
          throw new Error('Invalid task type');
      }

      console.log('Sending payload to API:', payload);
      const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });
      const useridData = await useridResponse.json();

      // Send the enhancement request to the correct API endpoint
      const response = await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to process image: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      result.taskId = data.task_id || data.id || data.taskId;

      // Start polling for results
      pollForResult(result);

      toast.success(`${getTaskDisplayName(task)} started successfully`);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  // Main processImage function with credit checking
  const processImage = async (task: string, parameters: any) => {
    if (!previewUrl) {
      toast.error('Please select an image first');
      return;
    }

    if (!userData.id) {
      toast.error('User not authenticated');
      return;
    }

    // Check gem cost before proceeding
    const gemData = await checkGemCost(task);
    if (gemData) {
      setGemCostData(gemData);
      setPendingTask({ task, parameters });
      setShowGemWarning(true);
      return;
    }

    // If credit check fails, don't proceed
    toast.error('Unable to verify credit cost. Please try again.');
    return;
  };

  const pollForResult = async (result: UpscaleResult) => {
    const pollInterval = setInterval(async () => {
      try {
        // Use the correct API endpoint for checking task status
        console.log(`${config.supabase_server_url}/generated_images?task_id=eq.${result.taskId}`);
        const response = await fetch(`${config.supabase_server_url}/generated_images?task_id=eq.${result.taskId}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check task status');
        }

        const data = await response.json();
        console.log('Task status response:', data);

        if (data.length > 0 && data[0].generation_status === 'completed' && data[0].system_filename) {
          const completedImage = data[0];
          const upscaledUrl = `${config.data_url}/cdn-cgi/image/w=800/${userData.id}/${completedImage.user_filename === "" || completedImage.user_filename === null ? "output" : "vault/" + completedImage.user_filename}/${completedImage.system_filename}`;

          // Update the result
          setUpscaleResults(prev => prev.map(r =>
            r.id === result.id
              ? {
                ...r,
                status: 'completed',
                progress: 100,
                upscaledUrl
              }
              : r
          ));

          clearInterval(pollInterval);
          setIsProcessing(false);

          toast.success(`${getTaskDisplayName(result.task)} completed successfully`);
        } else if (data[0].generation_status === 'failed' || data[0].generation_status === 'error') {
          clearInterval(pollInterval);
          setIsProcessing(false);

          setUpscaleResults(prev => prev.map(r =>
            r.id === result.id
              ? { ...r, status: 'failed', progress: 0 }
              : r
          ));

          toast.error(`${getTaskDisplayName(result.task)} failed: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error polling for result:', error);
        clearInterval(pollInterval);
        setIsProcessing(false);

        setUpscaleResults(prev => prev.map(r =>
          r.id === result.id
            ? { ...r, status: 'failed', progress: 0 }
            : r
        ));

        toast.error('Failed to check task status');
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsProcessing(false);
    }, 300000);
  };

  const getTaskDisplayName = (task: string) => {
    switch (task) {
      case 'image_upscale': return 'Image Upscale';
      case 'image_upscale_esrgan': return 'ESRGAN Upscale';
      case 'image_realism': return 'Realism Enhancement';
      case 'image_reframe': return 'Aspect Ratio Reframe';
      default: return task;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleDownload = async (result: UpscaleResult) => {
    if (!result.upscaledUrl || !userData.id) {
      toast.error('No enhanced image available for download');
      return;
    }

    // Set loading state for this specific download
    setDownloadingImages(prev => new Set(prev).add(result.id));

    try {
      // Show warning for large files
      const fileSize = selectedFile?.size || 0;
      const isLargeFile = fileSize > 5 * 1024 * 1024; // 5MB threshold
      
      if (isLargeFile) {
        toast.info('Large file detected. Download may take a while...', {
          duration: 4000,
        });
      }

      // Extract the system_filename from the upscaledUrl
      // URL format: https://images.nymia.ai/cdn-cgi/image/w=800/userId/path/system_filename
      const urlParts = result.upscaledUrl.split('/');
      const systemFilename = urlParts[urlParts.length - 1];
      
      // Determine the path (output or vault/path)
      const path = "output"; // Upscaled images are typically in output folder
      
      // Use the same download API as Vault page
      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `${path}/${systemFilename}`
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
      
      // Generate filename based on task and timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const taskName = result.task.replace('image_', '');
      link.download = `upscaled_${taskName}_${timestamp}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download completed successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image. Please try again.');
    } finally {
      // Clear loading state for this download
      setDownloadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(result.id);
        return newSet;
      });
    }
  };

  const handleDelete = (resultId: string) => {
    setUpscaleResults(prev => prev.filter(r => r.id !== resultId));
  };

  const handleViewFullSize = (result: UpscaleResult) => {
    const imageUrl = result.upscaledUrl || result.enhancedUrl;
    const taskName = getTaskDisplayName(result.task);
    const description = `Enhanced using ${taskName} with ${JSON.stringify(result.parameters)}`;
    
    setFullSizeImage({
      url: imageUrl,
      title: `${taskName} Result`,
      description
    });
    setShowFullSizeModal(true);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Content Optimizer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your images with AI-powered enhancement tools. Upscale, enhance realism, and adjust aspect ratios with professional-grade results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Upload Section */}
          <Card className="h-fit shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Image className="w-5 h-5 text-white" />
                </div>
                Select Image
              </CardTitle>
              <CardDescription className="text-base">
                Upload an image or select from your vault to enhance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Preview */}
              {previewUrl && (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl border-2 border-dashed border-gray-300 shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-xl flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:text-white"
                      onClick={() => {
                        // Cleanup blob URL if it exists
                        if (previewUrl && previewUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(previewUrl);
                        }
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              {!previewUrl && (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 hover:shadow-lg ${isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/50 dark:bg-gray-800/50'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Drop your image here</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    or click to browse files
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      className="bg-white hover:bg-gray-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                      onClick={triggerFileUpload}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white hover:bg-gray-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                      onClick={() => setShowVaultSelector(true)}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Browse Vault
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhancement Options */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Enhancement Options
              </CardTitle>
              <CardDescription className="text-base">
                Choose from various enhancement techniques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upscale" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                  <TabsTrigger value="upscale" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                    <Scale className="w-4 h-4" />
                    Upscale
                  </TabsTrigger>
                  <TabsTrigger value="esrgan" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                    <Zap className="w-4 h-4" />
                    ESRGAN
                  </TabsTrigger>
                  <TabsTrigger value="realism" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                    <Star className="w-4 h-4" />
                    Realism
                  </TabsTrigger>
                  <TabsTrigger value="reframe" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                    <Crop className="w-4 h-4" />
                    Reframe
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upscale" className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Upscale Factor</Label>
                    <Select value={upscaleScale} onValueChange={setUpscaleScale}>
                      <SelectTrigger className="bg-white dark:bg-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UPSCALE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{option.label}</span>
                              <span className="text-xs text-muted-foreground">{option.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => processImage('image_upscale', { scaling_factor: parseInt(upscaleScale) })}
                    disabled={!previewUrl || isProcessing || isCheckingGems}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isProcessing || isCheckingGems ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {isCheckingGems ? 'Checking Cost...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Scale className="w-4 h-4 mr-2" />
                        Upscale Image
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="esrgan" className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">ESRGAN Scale</Label>
                    <Select value={esrganScale} onValueChange={setEsrganScale}>
                      <SelectTrigger className="bg-white dark:bg-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESRGAN_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{option.label}</span>
                              <span className="text-xs text-muted-foreground">{option.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => processImage('image_upscale_esrgan', { scaling_factor: parseInt(esrganScale) })}
                    disabled={!previewUrl || isProcessing || isCheckingGems}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isProcessing || isCheckingGems ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {isCheckingGems ? 'Checking Cost...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        ESRGAN Upscale
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="realism" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">
                      Realism Strength: <span className="text-blue-600 dark:text-blue-400 font-bold">{realismStrength[0]}</span>
                    </Label>
                    <div className="px-2">
                      <Slider
                        value={realismStrength}
                        onValueChange={setRealismStrength}
                        max={1}
                        min={0.1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subtle (0.1)</span>
                      <span>Strong (1.0)</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => processImage('image_realism', { strength: realismStrength[0] })}
                    disabled={!previewUrl || isProcessing || isCheckingGems}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isProcessing || isCheckingGems ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {isCheckingGems ? 'Checking Cost...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Enhance Realism
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="reframe" className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Aspect Ratio</Label>
                    <Select value={selectedAspectRatio} onValueChange={setSelectedAspectRatio}>
                      <SelectTrigger className="bg-white dark:bg-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{ratio.label}</span>
                              <span className="text-xs text-muted-foreground">{ratio.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => processImage('image_reframe', { aspect_ratio: selectedAspectRatio })}
                    disabled={!previewUrl || isProcessing || isCheckingGems}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isProcessing || isCheckingGems ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {isCheckingGems ? 'Checking Cost...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Crop className="w-4 h-4 mr-2" />
                        Reframe Image
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {upscaleResults.length > 0 && (
          <Card className="mt-12 shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                Enhancement Results
              </CardTitle>
              <CardDescription className="text-base">
                View and download your enhanced images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upscaleResults.map((result) => (
                  <Card key={result.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/90 dark:bg-slate-700/90">
                    <div className="relative cursor-pointer group" onClick={() => result.status === 'completed' && handleViewFullSize(result)}>
                      <img
                        src={result.originalUrl}
                        alt="Original"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {result.status === 'processing' && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <div className="text-center text-white">
                            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            <p className="text-sm font-medium">Processing...</p>
                            <Progress value={result.progress} className="w-full mt-2" />
                          </div>
                        </div>
                      )}
                      {result.status === 'completed' && result.upscaledUrl && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <img
                            src={result.upscaledUrl}
                            alt="Enhanced"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-2">
                              <Maximize2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${getStatusColor(result.status)} px-3 py-1`}>
                          {getStatusIcon(result.status)}
                          <span className="ml-1 font-medium">{getTaskDisplayName(result.task)}</span>
                        </Badge>
                        <div className="flex gap-1">
                          {result.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-white hover:bg-gray-50 dark:bg-slate-600 dark:hover:bg-slate-500"
                              onClick={() => handleDownload(result)}
                              disabled={downloadingImages.has(result.id)}
                            >
                              {downloadingImages.has(result.id) ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white hover:bg-gray-50 dark:bg-slate-600 dark:hover:bg-slate-500"
                            onClick={() => handleDelete(result.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {new Date(result.createdAt).toLocaleString()}
                      </p>
                      {result.status === 'completed' && result.upscaledUrl && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0"
                            onClick={() => handleViewFullSize(result)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Full Size
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vault Selector Modal */}
        {showVaultSelector && (
          <VaultSelector
            open={showVaultSelector}
            onOpenChange={setShowVaultSelector}
            onImageSelect={handleVaultImageSelect}
            title="Select Image from Vault"
            description="Browse your vault and select an image to enhance. Only completed images are shown."
          />
        )}

        {/* Full Size Image Modal */}
        {showFullSizeModal && fullSizeImage && (
          <DialogZoom open={showFullSizeModal} onOpenChange={setShowFullSizeModal}>
            <DialogContentZoom className="flex max-h-[90vh] max-w-[90vw] p-0">
              <div>
                <img
                  src={fullSizeImage.url}
                  alt={fullSizeImage.title}
                  className="h-full w-full object-contain"
                />
                {/* Action Button */}
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/30 hover:bg-black/50 border-white/30 text-white backdrop-blur-sm"
                    onClick={() => window.open(fullSizeImage.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
                {/* Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{fullSizeImage.title}</span>
                        <span>•</span>
                        <span className="text-white/70">Enhanced with AI</span>
                      </div>
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-white/70 text-xs mt-1">{fullSizeImage.description}</p>
                  </div>
                </div>
              </div>
            </DialogContentZoom>
          </DialogZoom>
        )}

        {/* Credit Confirmation Modal */}
        <CreditConfirmationModal
          isOpen={showGemWarning}
          onClose={() => setShowGemWarning(false)}
          onConfirm={proceedWithImageProcessing}
          gemCostData={gemCostData}
          userCredits={userData.credits}
          isProcessing={isProcessing}
          processingText="Processing..."
          title="Content Optimization Cost"
          confirmButtonText={gemCostData ? `Confirm & Use ${gemCostData.gems} Credits` : 'Confirm'}
          itemType="optimization"
        />
      </div>
    </div>
  );
} 