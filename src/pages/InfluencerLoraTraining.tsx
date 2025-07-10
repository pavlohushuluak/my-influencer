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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';

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

  // Load influencer data
  useEffect(() => {
    if (influencerId && influencers.length > 0) {
      const influencer = influencers.find(inf => inf.id === influencerId);
      setSelectedInfluencer(influencer);
    }
  }, [influencerId, influencers]);

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
      const response = await fetch(`https://db.nymia.ai/rest/v1/training_images?influencer_id=eq.${selectedInfluencer.id}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch training images');
      }

      const data = await response.json();
      setTrainingImages(data);
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
      const response = await fetch(`https://db.nymia.ai/rest/v1/lora_versions?influencer_id=eq.${selectedInfluencer.id}`, {
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
      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('user', userData.id);
      formData.append('folder', `models/${selectedInfluencer.id}/loratraining`);

      const response = await fetch('https://api.nymia.ai/v1/uploadfiles', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Save to database
      const imageData = uploadFiles.map((file, index) => ({
        influencer_id: selectedInfluencer.id,
        filename: file.name,
        file_path: `models/${selectedInfluencer.id}/loratraining/${file.name}`,
        excluded: false,
        source: 'upload' as const,
        size: file.size
      }));

      await fetch('https://db.nymia.ai/rest/v1/training_images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(imageData)
      });

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
      const response = await fetch(`https://db.nymia.ai/rest/v1/generated_images?user_id=eq.${userData.id}&limit=100`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vault images');
      }

      const data = await response.json();
      setVaultImages(data);
    } catch (error) {
      console.error('Error fetching vault images:', error);
      toast.error('Failed to load vault images');
    } finally {
      setIsLoadingVault(false);
    }
  };

  const handleCopyFromVault = async () => {
    if (selectedVaultImages.length === 0) {
      toast.error('Please select images from vault');
      return;
    }

    try {
      const selectedImages = vaultImages.filter(img => selectedVaultImages.includes(img.id));
      
      const imageData = selectedImages.map(img => ({
        influencer_id: selectedInfluencer.id,
        filename: img.system_filename,
        file_path: img.file_path,
        excluded: false,
        source: 'vault' as const,
        size: img.file_size_bytes
      }));

      await fetch('https://db.nymia.ai/rest/v1/training_images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(imageData)
      });

      toast.success(`${selectedImages.length} images copied from vault`);
      setSelectedVaultImages([]);
      setShowVaultModal(false);
      fetchTrainingImages();
    } catch (error) {
      console.error('Error copying from vault:', error);
      toast.error('Failed to copy images from vault');
    }
  };

  const handleToggleExclude = async (imageId: string, excluded: boolean) => {
    try {
      await fetch(`https://db.nymia.ai/rest/v1/training_images?id=eq.${imageId}`, {
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
      await fetch(`https://db.nymia.ai/rest/v1/training_images?id=eq.${imageId}`, {
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
      const response = await fetch('https://api.nymia.ai/v1/startloratraining', {
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
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
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
              Copy from Vault
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
                  Upload images, copy from vault, or generate new images to get started
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
                    Copy from Vault
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
                        src={`https://images.nymia.ai/cdn-cgi/image/w=400/${image.file_path}`}
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
                        <div className={`p-2 rounded-lg ${
                          version.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Training Images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop images here or click to select
              </p>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setUploadFiles(files);
                }}
                className="hidden"
                id="upload-input"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('upload-input')?.click()}
              >
                Select Images
              </Button>
            </div>
            {uploadFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Files:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="truncate">{file.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleUploadImages}
                disabled={isUploading || uploadFiles.length === 0}
                className="flex-1"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload {uploadFiles.length} Images
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFiles([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vault Modal */}
      <Dialog open={showVaultModal} onOpenChange={setShowVaultModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Images from Vault</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleCopyFromVault}
                disabled={selectedVaultImages.length === 0}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy {selectedVaultImages.length} Images
              </Button>
            </div>
            
            {isLoadingVault ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vaultImages
                    .filter(img => 
                      img.system_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      img.user_filename?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((image) => (
                      <Card
                        key={image.id}
                        className={`cursor-pointer transition-all ${
                          selectedVaultImages.includes(image.id)
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'hover:ring-2 hover:ring-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedVaultImages(prev =>
                            prev.includes(image.id)
                              ? prev.filter(id => id !== image.id)
                              : [...prev, image.id]
                          );
                        }}
                      >
                        <CardContent className="p-0">
                          <div className="aspect-square relative overflow-hidden rounded-t-lg">
                            <img
                              src={`https://images.nymia.ai/cdn-cgi/image/w=200/${image.file_path}`}
                              alt={image.system_filename}
                              className="w-full h-full object-cover"
                            />
                            {selectedVaultImages.includes(image.id) && (
                              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-blue-600 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">
                              {image.user_filename || image.system_filename}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 