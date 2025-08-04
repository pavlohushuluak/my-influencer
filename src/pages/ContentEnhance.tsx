
import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  Plus
} from 'lucide-react';
import VaultSelector from '@/components/VaultSelector';
import config from '@/config/config';

interface UpscaleResult {
  id: string;
  originalUrl: string;
  upscaledUrl: string;
  scale: number;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
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

export default function ContentEnhance() {
  const userData = useSelector((state: RootState) => state.user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [upscaleScale, setUpscaleScale] = useState('2');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [upscaleResults, setUpscaleResults] = useState<UpscaleResult[]>([]);
  
  // Image selection modal state
  const [showImageSelectionModal, setShowImageSelectionModal] = useState(false);
  const [showVaultSelector, setShowVaultSelector] = useState(false);

  const handleFileUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowImageSelectionModal(false);
    }
  }, []);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

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
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleVaultImageSelect = (image: GeneratedImageData) => {
    // Convert vault image to file-like object for processing
    const imageUrl = `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`;
    setPreviewUrl(imageUrl);
    setSelectedFile(null); // We don't have a File object for vault images
    setShowVaultSelector(false);
    setShowImageSelectionModal(false);
  };

  const handleUpscale = () => {
    if (!selectedFile && !previewUrl) return;

    setIsProcessing(true);
    const resultId = Date.now().toString();
    
    // Add new upscale job
    const newResult: UpscaleResult = {
      id: resultId,
      originalUrl: previewUrl!,
      upscaledUrl: '',
      scale: parseInt(upscaleScale),
      status: 'processing',
      progress: 0
    };

    setUpscaleResults(prev => [...prev, newResult]);

    // Simulate processing
    const interval = setInterval(() => {
      setUpscaleResults(prev => 
        prev.map(result => 
          result.id === resultId 
            ? { 
                ...result, 
                progress: Math.min(result.progress + Math.random() * 20, 100),
                status: result.progress >= 100 ? 'completed' : 'processing'
              }
            : result
        )
      );
    }, 500);

    // Complete after 3-5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setUpscaleResults(prev => 
        prev.map(result => 
          result.id === resultId 
            ? { 
                ...result, 
                progress: 100,
                status: 'completed',
                upscaledUrl: previewUrl // In real app, this would be the processed image
              }
            : result
        )
      );
      setIsProcessing(false);
    }, 3000 + Math.random() * 2000);
  };

  const getScaleDescription = (scale: string) => {
    const scaleNum = parseInt(scale);
    const multiplier = scaleNum * scaleNum;
    return `${multiplier}x more pixels`;
  };

  return (
    <div className="px-6 space-y-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <Maximize2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-2">
            AI Image Upscaler
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your images with advanced AI upscaling technology. 
          Increase resolution up to 4x while preserving quality and details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Image className="w-5 h-5 text-blue-600" />
                Select Image
              </CardTitle>
              <CardDescription>
                Choose an image to upscale from your device or vault
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Selection Button */}
              <Button 
                onClick={() => setShowImageSelectionModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Select Image
              </Button>

              {/* Selected Image Info */}
              {previewUrl && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900">
                        {selectedFile ? selectedFile.name : 'Image from Vault'}
                      </p>
                      <p className="text-sm text-green-700">
                        {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Ready for upscaling'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Ready
                    </Badge>
                  </div>
                </div>
              )}

              {/* Upscale Settings */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Upscale Factor</Label>
                  <Select value={upscaleScale} onValueChange={setUpscaleScale}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2x Upscale</SelectItem>
                      <SelectItem value="3">3x Upscale</SelectItem>
                      <SelectItem value="4">4x Upscale</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getScaleDescription(upscaleScale)}
                  </p>
                </div>

                <Button 
                  onClick={handleUpscale}
                  disabled={!previewUrl || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upscale Image
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Preserves fine details</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">No quality loss</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Fast processing</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Multiple formats</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Preview */}
          {previewUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  Image Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upscale Results */}
          {upscaleResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Upscale Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upscaleResults.map((result) => (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {result.scale}x
                          </Badge>
                          {result.status === 'processing' && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm">Processing...</span>
                            </div>
                          )}
                          {result.status === 'completed' && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">Completed</span>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      
                      {result.status === 'processing' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Processing...</span>
                            <span>{Math.round(result.progress)}%</span>
                          </div>
                          <Progress value={result.progress} className="h-2" />
                        </div>
                      )}
                      
                      {result.status === 'completed' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Original</p>
                            <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                              <img 
                                src={result.originalUrl} 
                                alt="Original" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Upscaled ({result.scale}x)</p>
                            <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                              <img 
                                src={result.upscaledUrl} 
                                alt="Upscaled" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!previewUrl && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Maximize2 className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Upscale
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Select an image to get started with AI-powered upscaling. 
                  Your images will be enhanced with advanced neural networks.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Image Selection Modal */}
      <Dialog open={showImageSelectionModal} onOpenChange={setShowImageSelectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-600" />
              Select Image
            </DialogTitle>
            <DialogDescription>
              Choose how you'd like to select an image for upscaling
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Upload Option */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file);
                };
                input.click();
              }}
            >
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Upload New Image</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a file from your device
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-3 text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Vault Option */}
            <div
              className="border-2 border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200"
              onClick={() => {
                setShowVaultSelector(true);
                setShowImageSelectionModal(false);
              }}
            >
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Select from Vault</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose from your existing images
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vault Selector */}
      <VaultSelector
        open={showVaultSelector}
        onOpenChange={setShowVaultSelector}
        onImageSelect={handleVaultImageSelect}
        title="Select Image from Vault"
        description="Browse your vault and select an image to upscale"
      />
    </div>
  );
}
