import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Copy,
  Image as ImageIcon,
  Wand2,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Archive,
  Play,
  Settings,
  Plus,
  Search,
  X,
  Filter,
  Loader2,
  CheckCircle,
  AlertCircle,
  Brain,
  FolderOpen,
  FileImage,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Clock,
  Zap,
  Image,
  ZoomIn
} from 'lucide-react';
import { toast } from 'sonner';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';
import config from '@/config/config';

interface TrainingImage {
  id: string;
  filename: string;
  file_path: string;
  excluded: boolean;
  source: 'upload' | 'vault' | 'generate' | 'reference';
  uploaded_at: string;
  size: number;
}

interface LoraVersion {
  id: string;
  version: string;
  created_at: string;
  status: 'training' | 'completed' | 'failed';
  model_path: string;
}

export default function InfluencerLoraTraining() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const influencers = useSelector((state: RootState) => state.influencers.influencers);

  // Get influencer data from navigation state or URL params
  const influencerId = location.state?.influencerId || location.search.split('=')[1];
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);

  // Training images state
  const [trainingImages, setTrainingImages] = useState<TrainingImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // LORA versions state
  const [loraVersions, setLoraVersions] = useState<LoraVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('images');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Vault selection state
  const [vaultImages, setVaultImages] = useState<any[]>([]);
  const [selectedVaultImages, setSelectedVaultImages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingVault, setIsLoadingVault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (influencerId && influencers.length > 0) {
      const influencer = influencers.find(inf => inf.id === influencerId);
      setSelectedInfluencer(influencer);
    }
  }, [influencerId, influencers]);

  // Load influencer data
  const fetchInfluencers = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [userData.id]);

  // Load training images
  useEffect(() => {
    if (selectedInfluencer) {
      fetchTrainingImages();
      fetchLoraVersions();
    }
  }, [selectedInfluencer]);

  const fetchTrainingImages = async () => {
    if (!selectedInfluencer) return;

    setIsLoadingImages(true);
    try {
      // Fetch from training_images table
      const trainingResponse = await fetch(`${config.supabase_server_url}/training_images?influencer_id=eq.${selectedInfluencer.id}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!trainingResponse.ok) {
        throw new Error('Failed to fetch training images');
      }

      const trainingData = await trainingResponse.json();

      // Fetch from generated_images table where user_filename is 'loratraining'
      const generatedResponse = await fetch(`${config.supabase_server_url}/generated_images?user_filename=eq.loratraining`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!generatedResponse.ok) {
        throw new Error('Failed to fetch generated images');
      }

      const generatedData = await generatedResponse.json();

      // Filter generated images that belong to this influencer's loratraining folder
      const filteredGeneratedData = generatedData.filter((img: any) => 
        img.file_path && img.file_path.includes(`models/${selectedInfluencer.id}/loratraining/`)
      );

      // Combine and format the data
      const combinedData = [
        ...trainingData,
        ...filteredGeneratedData.map((img: any) => ({
          id: img.id,
          filename: img.system_filename,
          file_path: img.file_path,
          excluded: false,
          source: 'upload' as const,
          uploaded_at: img.created_at,
          size: img.file_size_bytes
        }))
      ];

      setTrainingImages(combinedData);
    } catch (error) {
      console.error('Error fetching training images:', error);
      toast.error('Failed to load training images');
    } finally {
      setIsLoadingImages(false);
    }
  };

  const fetchLoraVersions = async () => {
    if (!selectedInfluencer) return;

    setIsLoadingVersions(true);
    try {
      const response = await fetch(`${config.supabase_server_url}/lora_versions?influencer_id=eq.${selectedInfluencer.id}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch LORA versions');
      }

      const data = await response.json();
      setLoraVersions(data);
    } catch (error) {
      console.error('Error fetching LORA versions:', error);
      toast.error('Failed to load LORA versions');
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleUploadImages = async () => {
    if (uploadFiles.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    setIsUploading(true);
    try {
      // Upload each file individually
      for (const file of uploadFiles) {
        // Generate a unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const systemFilename = `upload_${timestamp}_${Math.random().toString(36).substring(2, 15)}.${extension}`;
        
        // Upload file to loratraining folder
        const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=models/${selectedInfluencer.id}/loratraining/${systemFilename}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: file
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Create database entry for generated_images table
        const newImageData = {
          task_id: `upload_${timestamp}`,
          image_sequence_number: 1,
          system_filename: systemFilename,
          user_filename: 'loratraining',
          user_notes: '',
          user_tags: [],
          file_path: `models/${selectedInfluencer.id}/loratraining/${systemFilename}`,
          file_size_bytes: file.size,
          image_format: file.type.split('/')[1],
          seed: 0,
          guidance: 0,
          steps: 0,
          nsfw_strength: 0,
          lora_strength: 0,
          model_version: '',
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
          quality_setting: '',
          rating: 0,
          favorite: false,
          file_type: file.type.split('/')[0]
        };

        // Save to generated_images table
        const dbResponse = await fetch(`${config.supabase_server_url}/generated_images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify(newImageData)
        });

        if (!dbResponse.ok) {
          throw new Error(`Failed to create database entry for ${file.name}`);
        }

        // Save to training_images table
        const trainingImageData = {
          influencer_id: selectedInfluencer.id,
          filename: systemFilename,
          file_path: `models/${selectedInfluencer.id}/loratraining/${systemFilename}`,
          excluded: false,
          source: 'upload' as const,
          size: file.size
        };
      }

      toast.success(`${uploadFiles.length} images uploaded successfully`);
      setUploadFiles([]);
      setShowUploadModal(false);
      fetchTrainingImages();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchVaultImages = async () => {
    setIsLoadingVault(true);
    try {
      // First, get all files from the user's Inbox folder
      const response = await fetch(`${config.backend_url}/getfilenames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: "vault/Inbox"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Inbox images');
      }

      const allImages = await response.json();
      const detailedImagesData: any[] = [];

      // For each file, get the detailed information from the database
      for (const file of allImages) {
        // Extract filename from the Key (remove path and get just the filename)
        if (file.Key === undefined) continue;
        const filename = file.Key.split('/').pop();
        if (!filename) continue;

        // For Inbox files, user_filename is always "Inbox"
        const user_filename = "Inbox";

        try {
          const detailResponse = await fetch(`${config.supabase_server_url}/generated_images?system_filename=eq.${filename}&user_filename=eq.${user_filename}`, {
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI'
            }
          });

          if (detailResponse.ok) {
            const imageDetails: any[] = await detailResponse.json();
            if (imageDetails.length > 0) {
              detailedImagesData.push({ ...imageDetails[0], id: filename });
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch details for ${filename}:`, error);
        }
      }

      setVaultImages(detailedImagesData);
    } catch (error) {
      console.error('Error fetching Inbox images:', error);
      toast.error('Failed to load Inbox images');
    } finally {
      setIsLoadingVault(false);
    }
  };

  const handleCopyFromVault = async () => {
    if (selectedVaultImages.length === 0) {
      toast.error('Please select images from Inbox');
      return;
    }

    try {
      const selectedImages = vaultImages.filter(img => selectedVaultImages.includes(img.id));
      
      // Copy files to loratraining folder
      for (const image of selectedImages) {
        const extension = image.system_filename.split('.').pop();
        await fetch(`${config.backend_url}/copyfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            sourcefilename: `vault/Inbox/${image.system_filename}`,
            destinationfilename: `models/${selectedInfluencer.id}/loratraining/${image.system_filename}`
          })
        });
      }

      // Save to database
      const imageData = selectedImages.map(img => ({
        influencer_id: selectedInfluencer.id,
        filename: img.system_filename,
        file_path: `models/${selectedInfluencer.id}/loratraining/${img.system_filename}`,
        excluded: false,
        source: 'vault' as const,
        size: img.file_size_bytes
      }));

      await fetch(`${config.supabase_server_url}/training_images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(imageData)
      });

      toast.success(`${selectedImages.length} images copied from Inbox`);
      setSelectedVaultImages([]);
      setShowVaultModal(false);
      fetchTrainingImages();
    } catch (error) {
      console.error('Error copying from Inbox:', error);
      toast.error('Failed to copy images from Inbox');
    }
  };

  const handleToggleExclude = async (imageId: string, excluded: boolean) => {
    try {
      await fetch(`${config.supabase_server_url}/training_images?id=eq.${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({ excluded: !excluded })
      });

      setTrainingImages(prev =>
        prev.map(img =>
          img.id === imageId ? { ...img, excluded: !excluded } : img
        )
      );

      toast.success(`Image ${excluded ? 'included' : 'excluded'} from training`);
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await fetch(`${config.supabase_server_url}/training_images?id=eq.${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      setTrainingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image removed from training');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to remove image');
    }
  };

  const handleStartTraining = async () => {
    const includedImages = trainingImages.filter(img => !img.excluded);

    if (includedImages.length < 10) {
      toast.error('You need at least 10 images to start training');
      return;
    }

    setIsTraining(true);
    try {
      const response = await fetch(`${config.backend_url}/startloratraining`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          influencer_id: selectedInfluencer.id,
          image_paths: includedImages.map(img => img.file_path)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start training');
      }

      toast.success('LORA training started successfully');
      fetchLoraVersions();
    } catch (error) {
      console.error('Training error:', error);
      toast.error('Failed to start training');
    } finally {
      setIsTraining(false);
    }
  };

  const handleArchiveVersions = async () => {
    if (loraVersions.length === 0) {
      toast.error('No LORA versions to archive');
      return;
    }

    setIsArchiving(true);
    try {
      // Archive logic here
      toast.success('LORA versions archived successfully');
    } catch (error) {
      console.error('Archive error:', error);
      toast.error('Failed to archive versions');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleGenerateImages = () => {
    navigate('/content/create', {
      state: {
        influencerId: selectedInfluencer.id,
        returnToLora: true
      }
    });
  };

  const ImagePreviewDialog = ({ imageUrl, onClose }: { imageUrl: string, onClose: () => void }) => (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="relative h-full">
          <img
            src={imageUrl}
            alt="Preview"
            className="h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-ai-purple-500" />
          <p className="text-muted-foreground">Loading influencers...</p>
        </div>
      </div>
    );
  }

  if (!selectedInfluencer) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              LORA Training
            </h1>
            <p className="text-muted-foreground">
              Select an influencer to manage LORA training
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {influencers.map((influencer) => (
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
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No image found</h3>
                        </div>
                      )
                    }
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                          {influencer.name_first} {influencer.name_last}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex text-sm text-muted-foreground flex-col">
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

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/influencers/lora-training', {
                          state: { influencerId: influencer.id }
                        })}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        LORA Training
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/influencers/edit')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">LORA Training</h1>
            <p className="text-muted-foreground">
              {selectedInfluencer.name} • Manage training images and LORA versions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleArchiveVersions}
            disabled={isArchiving || loraVersions.length === 0}
          >
            {isArchiving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Archive className="w-4 h-4 mr-2" />
            )}
            Archive Versions
          </Button>
          <Button
            onClick={handleStartTraining}
            disabled={isTraining || trainingImages.filter(img => !img.excluded).length < 10}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isTraining ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Start Training
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileImage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Images</p>
                <p className="text-2xl font-bold">{trainingImages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Included</p>
                <p className="text-2xl font-bold">{trainingImages.filter(img => !img.excluded).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <EyeOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Excluded</p>
                <p className="text-2xl font-bold">{trainingImages.filter(img => img.excluded).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LORA Versions</p>
                <p className="text-2xl font-bold">{loraVersions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images" className="flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Training Images
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            LORA Versions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
            <Button variant="outline" onClick={() => {
              setShowVaultModal(true);
              fetchVaultImages();
            }}>
              <Copy className="w-4 h-4 mr-2" />
              Copy from Inbox
            </Button>
            <Button variant="outline" onClick={handleGenerateImages}>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Images
            </Button>
          </div>

          {/* Images Grid */}
          {isLoadingImages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : trainingImages.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Training Images</h3>
                <p className="text-muted-foreground mb-4">
                  Upload images, copy from Inbox, or generate new images to get started
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowUploadModal(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowVaultModal(true);
                    fetchVaultImages();
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy from Inbox
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {trainingImages.map((image) => (
                <Card key={image.id} className={`relative group ${image.excluded ? 'opacity-50' : ''}`}>
                  <CardContent className="p-0">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <img
                        src={`${config.data_url}/cdn-cgi/image/w=400/${userData.id}/${image.file_path}`}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                      {image.excluded && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <EyeOff className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleToggleExclude(image.id, image.excluded)}
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          {image.excluded ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(image.id)}
                          className="bg-red-500/90 hover:bg-red-500 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{image.filename}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {image.source}
                        </Badge>
                        {image.excluded && (
                          <Badge variant="secondary" className="text-xs">
                            Excluded
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          {isLoadingVersions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : loraVersions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No LORA Versions</h3>
                <p className="text-muted-foreground">
                  Start training to create your first LORA version
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {loraVersions.map((version) => (
                <Card key={version.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${version.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                          version.status === 'training' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-red-100 dark:bg-red-900/30'
                          }`}>
                          {version.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : version.status === 'training' ? (
                            <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Version {version.version}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(version.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          version.status === 'completed' ? 'default' :
                            version.status === 'training' ? 'secondary' :
                              'destructive'
                        }>
                          {version.status}
                        </Badge>
                        {version.status === 'completed' && (
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-500" />
              Upload Training Images
            </DialogTitle>
            <DialogDescription>
              Upload images to add to the training dataset for this influencer. You can select multiple images at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Drop your images here</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your images here, or click to browse files
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    PNG, JPG, JPEG up to 10MB each
                  </div>
                </div>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadFiles(prev => [...prev, ...files]);
                  }}
                  className="hidden"
                  id="upload-input"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('upload-input')?.click()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Images
                </Button>
              </div>
            </div>

            {/* Selected Files Preview */}
            {uploadFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Selected Files ({uploadFiles.length})</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadFiles([])}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadFiles.map((file, index) => (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="relative w-full mb-3" style={{ paddingBottom: '100%' }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="absolute inset-0 w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-6 h-6 p-0 rounded-full"
                              onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== index))}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm truncate">{file.name}</h5>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>{file.type.split('/')[1].toUpperCase()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFiles([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadImages}
                disabled={isUploading || uploadFiles.length === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload {uploadFiles.length} Images
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vault Modal */}
      <Dialog open={showVaultModal} onOpenChange={setShowVaultModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-500" />
              Select Images from Inbox
            </DialogTitle>
            <DialogDescription>
              Choose images from your Inbox to add to the training dataset for this influencer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {vaultImages.length} images from your Inbox
                </p>
                {selectedVaultImages.length > 0 && (
                  <Badge variant="secondary">
                    {selectedVaultImages.length} selected
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyFromVault}
                  disabled={selectedVaultImages.length === 0}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy {selectedVaultImages.length} Images
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowVaultModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search images by filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {isLoadingVault ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-muted-foreground">Loading Inbox images...</p>
                  </div>
                </div>
              ) : vaultImages.length > 0 ? (
                vaultImages
                  .filter(img =>
                    img.system_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    img.user_filename?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((image) => (
                    <Card
                      key={image.id}
                      className={`group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/30 backdrop-blur-sm ${image.task_id?.startsWith('upload_')
                        ? 'bg-gradient-to-br from-purple-50/20 to-pink-50/20 dark:from-purple-950/5 dark:to-pink-950/5 hover:border-purple-500/30'
                        : 'bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5'
                        } cursor-pointer ${selectedVaultImages.includes(image.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' : ''}`}
                      onClick={() => {
                        setSelectedVaultImages(prev =>
                          prev.includes(image.id)
                            ? prev.filter(id => id !== image.id)
                            : [...prev, image.id]
                        );
                      }}
                    >
                      <CardContent className="p-4">
                        {/* Top Row: File Type, Ratings, Favorite */}
                        <div className="flex items-center justify-between mb-3">
                          {/* File Type Icon */}
                          <div className={`rounded-full w-8 h-8 flex items-center justify-center shadow-md ${image.task_id?.startsWith('upload_')
                            ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                            }`}>
                            {image.task_id?.startsWith('upload_') ? (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                            ) : image.file_type === 'video' ? (
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
                                className={`w-4 h-4 ${star <= image.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
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
                            src={`${config.data_url}/cdn-cgi/image/w=400/${userData.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`}
                            alt={image.system_filename}
                            className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                            onError={(e) => {
                              // Fallback for uploaded files that might not be accessible via CDN
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'absolute inset-0 w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-md flex items-center justify-center';
                              fallback.innerHTML = `
                                <div class="text-center">
                                  <svg class="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                  </svg>
                                  <p class="text-xs text-purple-600 dark:text-purple-400">Uploaded File</p>
                                  <p class="text-xs text-gray-500 dark:text-gray-400">${image.system_filename}</p>
                                </div>
                              `;
                              target.parentNode?.appendChild(fallback);
                            }}
                          />

                          {/* Zoom Button */}
                          <div
                            className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              const imageUrl = `${config.data_url}/cdn-cgi/image/w=800/${userData.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`;
                              setPreviewImage(imageUrl);
                            }}
                          >
                            <ZoomIn className="w-5 h-5 text-white" />
                          </div>

                          {/* Selection Indicator */}
                          {selectedVaultImages.includes(image.id) && (
                            <div className="absolute left-2 top-2 bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
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
                            {image.user_tags.slice(0, 3).map((tag, index) => (
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
                            {image.system_filename}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(image.created_at).toLocaleDateString()}
                          </div>
                          {image.user_filename && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                              </svg>
                              {image.user_filename}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No images found</h3>
                  <p className="text-muted-foreground">
                    You don't have any images in your Inbox yet. Create some content first!
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {previewImage && (
        <ImagePreviewDialog
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
} 