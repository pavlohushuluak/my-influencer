import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import config from '@/config/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VaultSelector from '@/components/VaultSelector';
import { toast } from 'sonner';
import { 
  Upload, 
  Users, 
  Image as ImageIcon, 
  Folder, 
  Wand2, 
  X, 
  RotateCcw,
  Download,
  Sparkles
} from 'lucide-react';

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
  created_at: string;
  imageUrl?: string;
}

export default function FaceSwap() {
  const userData = useSelector((state: RootState) => state.user);
  
  // Source Image State
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [sourceImageFromVault, setSourceImageFromVault] = useState<GeneratedImageData | null>(null);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);
  
  // Target Face State
  const [targetImage, setTargetImage] = useState<File | null>(null);
  const [targetImageUrl, setTargetImageUrl] = useState<string | null>(null);
  const [targetImageFromVault, setTargetImageFromVault] = useState<GeneratedImageData | null>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);
  
  // Vault Selector State
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  const [vaultSelectorMode, setVaultSelectorMode] = useState<'source' | 'target'>('source');
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Results State
  const [faceSwapResults, setFaceSwapResults] = useState<FaceSwapResult[]>([]);
  
  // Drag and Drop States
  const [dragOverSource, setDragOverSource] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState(false);

  // Face Swap Result Interface
  interface FaceSwapResult {
    id: string;
    sourceUrl: string;
    targetUrl: string;
    resultUrl: string;
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    createdAt: Date;
  }

  // Handle file upload for source image
  const handleSourceFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSourceImage(file);
        setSourceImageUrl(URL.createObjectURL(file));
        setSourceImageFromVault(null);
        toast.success('Source image uploaded successfully');
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  // Handle file upload for target image
  const handleTargetFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setTargetImage(file);
        setTargetImageUrl(URL.createObjectURL(file));
        setTargetImageFromVault(null);
        toast.success('Target face uploaded successfully');
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  // Handle drag and drop for source
  const handleSourceDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOverSource(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSourceImage(file);
        setSourceImageUrl(URL.createObjectURL(file));
        setSourceImageFromVault(null);
        toast.success('Source image uploaded successfully');
      } else {
        toast.error('Please drop a valid image file');
      }
    }
  };

  // Handle drag and drop for target
  const handleTargetDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOverTarget(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setTargetImage(file);
        setTargetImageUrl(URL.createObjectURL(file));
        setTargetImageFromVault(null);
        toast.success('Target face uploaded successfully');
      } else {
        toast.error('Please drop a valid image file');
      }
    }
  };

  // Handle vault image selection
  const handleVaultImageSelect = (image: GeneratedImageData) => {
    if (vaultSelectorMode === 'source') {
      setSourceImageFromVault(image);
      setSourceImage(null);
      setSourceImageUrl(null);
      toast.success('Source image selected from vault');
    } else {
      setTargetImageFromVault(image);
      setTargetImage(null);
      setTargetImageUrl(null);
      toast.success('Target face selected from vault');
    }
    setShowVaultSelector(false);
  };

  // Open vault selector
  const openVaultSelector = (mode: 'source' | 'target') => {
    setVaultSelectorMode(mode);
    setShowVaultSelector(true);
  };

  // Clear source image
  const clearSourceImage = () => {
    setSourceImage(null);
    setSourceImageUrl(null);
    setSourceImageFromVault(null);
    if (sourceFileInputRef.current) {
      sourceFileInputRef.current.value = '';
    }
  };

  // Clear target image
  const clearTargetImage = () => {
    setTargetImage(null);
    setTargetImageUrl(null);
    setTargetImageFromVault(null);
    if (targetFileInputRef.current) {
      targetFileInputRef.current.value = '';
    }
  };

  // Get display URL for source image
  const getSourceDisplayUrl = () => {
    if (sourceImageUrl) return sourceImageUrl;
    if (sourceImageFromVault) {
      const folder = sourceImageFromVault.user_filename === "" || sourceImageFromVault.user_filename === null ? "output" : `vault/${sourceImageFromVault.user_filename}`;
      return `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/${folder}/${sourceImageFromVault.system_filename}`;
    }
    return null;
  };

  // Get display URL for target image
  const getTargetDisplayUrl = () => {
    if (targetImageUrl) return targetImageUrl;
    if (targetImageFromVault) {
      const folder = targetImageFromVault.user_filename === "" || targetImageFromVault.user_filename === null ? "output" : `vault/${targetImageFromVault.user_filename}`;
      return `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/${folder}/${targetImageFromVault.system_filename}`;
    }
    return null;
  };

  // Poll for face swap results
  const pollForFaceSwapResult = async (taskId: string, result: FaceSwapResult) => {
    const pollInterval = setInterval(async () => {
      try {
        const imagesResponse = await fetch(`${config.supabase_server_url}/generated_images?task_id=eq.${taskId}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        const imagesData = await imagesResponse.json();

        if (imagesData.length > 0 && imagesData[0].generation_status === 'completed' && imagesData[0].system_filename) {
          const completedImage = imagesData[0];
          const resultUrl = `${config.data_url}/cdn-cgi/image/w=800/${userData.id}/${completedImage.user_filename === "" || completedImage.user_filename === null ? "output" : "vault/" + completedImage.user_filename}/${completedImage.system_filename}`;
          
          // Update the result
          setFaceSwapResults(prev => prev.map(r => 
            r.id === taskId 
              ? { 
                  ...r, 
                  status: 'completed', 
                  progress: 100,
                  resultUrl
                }
              : r
          ));

          clearInterval(pollInterval);
          setIsProcessing(false);
          toast.success('Face swap completed successfully!');
        } else if (imagesData.length > 0 && imagesData[0].generation_status === 'failed') {
          // Handle failure
          setFaceSwapResults(prev => prev.map(r => 
            r.id === taskId 
              ? { 
                  ...r, 
                  status: 'failed', 
                  progress: 0
                }
              : r
          ));

          clearInterval(pollInterval);
          setIsProcessing(false);
          toast.error('Face swap failed. Please try again.');
        } else {
          // Update progress (simulate based on time elapsed)
          const elapsed = Date.now() - result.createdAt.getTime();
          const estimatedProgress = Math.min((elapsed / 30000) * 100, 95); // Assume 30 seconds total
          
          setFaceSwapResults(prev => prev.map(r => 
            r.id === taskId 
              ? { ...r, progress: estimatedProgress }
              : r
          ));
        }
      } catch (error) {
        console.error('Error polling for face swap result:', error);
        clearInterval(pollInterval);
        setIsProcessing(false);
        toast.error('Failed to check face swap status');
      }
    }, 1000); // Poll every 1 second
  };

  // Handle face swap processing
  const handleFaceSwap = async () => {
    if (!getSourceDisplayUrl() || !getTargetDisplayUrl()) {
      toast.error('Please select both source image and target face');
      return;
    }

    setIsProcessing(true);
    try {
      // Get userid for API request
      const useridResponse = await fetch(`${config.supabase_server_url}/users?user_uuid=eq.${userData.id}&select=userid`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const useridData = await useridResponse.json();
      if (!useridData || useridData.length === 0) {
        throw new Error('User ID not found');
      }

      // Prepare request data
      const requestData = {
        task: "faceswap",
        reference_image: getSourceDisplayUrl()!,
        face_image: getTargetDisplayUrl()!
      };

      // Create face swap task
      const response = await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=faceswap`, {
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
      const taskId = result.id;

      // Add new face swap job to results
      const newResult: FaceSwapResult = {
        id: taskId,
        sourceUrl: getSourceDisplayUrl()!,
        targetUrl: getTargetDisplayUrl()!,
        resultUrl: '',
        status: 'processing',
        progress: 0,
        createdAt: new Date()
      };

      setFaceSwapResults(prev => [newResult, ...prev]);

      // Start polling for results
      pollForFaceSwapResult(taskId, newResult);

      toast.success('Face swap initiated successfully!');
    } catch (error) {
      console.error('Error processing face swap:', error);
      toast.error('Failed to process face swap');
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            Face Swap Studio
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Seamlessly swap faces between images with our advanced AI technology. Upload your source image and target face to create stunning results.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Source Image Upload */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold text-purple-700 dark:text-purple-300">
                <ImageIcon className="w-6 h-6" />
                Source Image
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The main image where the face will be replaced
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer hover:border-purple-400 ${
                  dragOverSource 
                    ? 'border-purple-500 bg-purple-100/50 dark:bg-purple-900/30 scale-105' 
                    : 'border-purple-300 dark:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-900/20'
                }`}
                onClick={() => sourceFileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSource(true);
                }}
                onDragLeave={() => setDragOverSource(false)}
                onDrop={handleSourceDrop}
              >
                
                {getSourceDisplayUrl() ? (
                  <div className="relative group">
                    <img
                      src={getSourceDisplayUrl()!}
                      alt="Source"
                      className="w-full h-full object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        // Fallback for files that might not be accessible via CDN
                        const target = e.target as HTMLImageElement;
                        if (sourceImageFromVault && !target.src.includes('gpustack-images')) {
                          // Try original storage URL as fallback
                          const folder = sourceImageFromVault.user_filename === "" || sourceImageFromVault.user_filename === null ? "output" : `vault/${sourceImageFromVault.user_filename}`;
                          target.src = `https://storage.googleapis.com/gpustack-images/${userData.id}/${folder}/${sourceImageFromVault.system_filename}`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSourceImage();
                        }}
                        className="bg-white/90 hover:bg-white text-black"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Drop your source image here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={sourceFileInputRef}
                  onChange={handleSourceFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => openVaultSelector('source')}
                  className="flex-1 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  Import from Vault
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Target Face Upload */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold text-blue-700 dark:text-blue-300">
                <Users className="w-6 h-6" />
                Target Face
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The face that will be swapped into the source image
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer hover:border-blue-400 ${
                  dragOverTarget 
                    ? 'border-blue-500 bg-blue-100/50 dark:bg-blue-900/30 scale-105' 
                    : 'border-blue-300 dark:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/20'
                }`}
                onClick={() => targetFileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverTarget(true);
                }}
                onDragLeave={() => setDragOverTarget(false)}
                onDrop={handleTargetDrop}
              >
                
                {getTargetDisplayUrl() ? (
                  <div className="relative group">
                    <img
                      src={getTargetDisplayUrl()!}
                      alt="Target"
                      className="w-full h-full object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        // Fallback for files that might not be accessible via CDN
                        const target = e.target as HTMLImageElement;
                        if (targetImageFromVault && !target.src.includes('gpustack-images')) {
                          // Try original storage URL as fallback
                          const folder = targetImageFromVault.user_filename === "" || targetImageFromVault.user_filename === null ? "output" : `vault/${targetImageFromVault.user_filename}`;
                          target.src = `https://storage.googleapis.com/gpustack-images/${userData.id}/${folder}/${targetImageFromVault.system_filename}`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearTargetImage();
                        }}
                        className="bg-white/90 hover:bg-white text-black"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Drop your target face here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={targetFileInputRef}
                  onChange={handleTargetFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => openVaultSelector('target')}
                  className="flex-1 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  Import from Vault
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleFaceSwap}
            disabled={!getSourceDisplayUrl() || !getTargetDisplayUrl() || isProcessing}
            size="lg"
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing Face Swap...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Create Face Swap
              </>
            )}
          </Button>
          
          {(!getSourceDisplayUrl() || !getTargetDisplayUrl()) && (
            <p className="text-sm text-muted-foreground mt-3">
              Please upload both source image and target face to proceed
            </p>
          )}
        </div>

        {/* Results Section */}
        {faceSwapResults.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Face Swap Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faceSwapResults.map((result) => (
                <Card key={result.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      {result.status === 'completed' && result.resultUrl ? (
                        <img
                          src={result.resultUrl}
                          alt="Face swap result"
                          className="w-full h-full object-cover"
                        />
                      ) : result.status === 'failed' ? (
                        <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center">
                          <div className="text-center">
                            <X className="w-12 h-12 text-red-500 mx-auto mb-2" />
                            <p className="text-red-600 dark:text-red-400 font-medium">Failed</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">Processing</p>
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${result.progress}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{Math.round(result.progress)}%</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge 
                          variant={result.status === 'completed' ? 'default' : result.status === 'failed' ? 'destructive' : 'secondary'}
                          className="shadow-lg"
                        >
                          {result.status === 'completed' ? 'Completed' : result.status === 'failed' ? 'Failed' : 'Processing'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Preview Section */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Created: {result.createdAt.toLocaleTimeString()}
                        </span>
                        {result.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = result.resultUrl;
                              link.download = `faceswap_${result.id}.jpg`;
                              link.click();
                            }}
                            className="hover:bg-purple-50 dark:hover:bg-purple-900/30"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                      
                      {/* Source and Target Preview */}
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Source</p>
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                            <img
                              src={result.sourceUrl}
                              alt="Source"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Wand2 className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</p>
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                            <img
                              src={result.targetUrl}
                              alt="Target"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vault Selector Modal */}
      <VaultSelector
        open={showVaultSelector}
        onOpenChange={setShowVaultSelector}
        onImageSelect={handleVaultImageSelect}
        title={`Select ${vaultSelectorMode === 'source' ? 'Source Image' : 'Target Face'} from Vault`}
        description={`Choose an image from your vault to use as the ${vaultSelectorMode === 'source' ? 'source image' : 'target face'}`}
      />
    </div>
  );
} 