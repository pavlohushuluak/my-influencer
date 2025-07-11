
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  Image, 
  Save, 
  Undo, 
  Redo, 
  Crop, 
  Filter, 
  Type, 
  Palette,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
  Settings,
  Layers,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  History,
  FileImage,
  FileVideo,
  Sparkles,
  Wand2,
  Camera,
  Brush,
  Eraser,
  Move,
  Square,
  Circle,
  Type as TypeIcon,
  Image as ImageIcon,
  Palette as PaletteIcon,
  Sliders,
  Target,
  Droplets,
  Sun,
  Moon,
  Zap,
  Heart,
  HeartOff
} from 'lucide-react';
import { toast } from 'sonner';

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
}

interface EditHistory {
  id: string;
  timestamp: Date;
  description: string;
  imageData: string;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  settings: EditSettings;
  isDefault?: boolean;
}

interface EditSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
  noise: number;
  vignette: number;
  temperature: number;
  tint: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  exposure: number;
  gamma: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  settings: EditSettings;
  preview: string;
}

export default function ContentEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);
  
  // State management
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState('adjust');
  const [isEditing, setIsEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  
  // Edit settings
  const [settings, setSettings] = useState<EditSettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sharpen: 0,
    noise: 0,
    vignette: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    exposure: 0,
    gamma: 1
  });

  // History management
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Canvas and editing refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Presets and templates
  const [presets, setPresets] = useState<Preset[]>([
    {
      id: '1',
      name: 'Vintage',
      description: 'Warm vintage look with faded colors',
      settings: { ...settings, temperature: 15, saturation: -20, contrast: 10, vignette: 30 }
    },
    {
      id: '2',
      name: 'Black & White',
      description: 'Classic monochrome conversion',
      settings: { ...settings, saturation: -100, contrast: 20, highlights: 10, shadows: -10 }
    },
    {
      id: '3',
      name: 'HDR',
      description: 'High dynamic range look',
      settings: { ...settings, highlights: -20, shadows: 20, contrast: 15, saturation: 10 }
    },
    {
      id: '4',
      name: 'Portrait',
      description: 'Optimized for portrait photography',
      settings: { ...settings, temperature: 5, saturation: 5, highlights: -10, shadows: 5, blur: 2 }
    },
    {
      id: '5',
      name: 'Landscape',
      description: 'Enhanced landscape colors',
      settings: { ...settings, saturation: 15, temperature: 10, contrast: 10, highlights: 5 }
    }
  ]);

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Instagram Post',
      description: 'Square format optimized for Instagram',
      category: 'Social Media',
      settings: { ...settings },
      preview: '/templates/instagram.jpg'
    },
    {
      id: '2',
      name: 'YouTube Thumbnail',
      description: '16:9 format with bold colors',
      category: 'Video',
      settings: { ...settings, saturation: 20, contrast: 15 },
      preview: '/templates/youtube.jpg'
    },
    {
      id: '3',
      name: 'LinkedIn Banner',
      description: 'Professional banner format',
      category: 'Professional',
      settings: { ...settings, temperature: 5, saturation: -5 },
      preview: '/templates/linkedin.jpg'
    }
  ]);

  // Get image data from navigation state
  useEffect(() => {
    const imageData = location.state?.imageData;
    console.log('ContentEdit: Received image data:', imageData);
    if (imageData) {
      setSelectedImage(imageData);
      console.log('ContentEdit: Loading image from path:', imageData.file_path);
      loadImage(`https://images.nymia.ai/cdn-cgi/image/w=800/${imageData.file_path}`);
    } else {
      console.log('ContentEdit: No image data received');
    }
  }, [location.state]);

  const loadImage = useCallback(async (imagePath: string) => {
    try {
      
      const img = document.createElement("img");
      console.log('ContentEdit: Loading image from path:', imagePath);
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('ContentEdit: Image loaded successfully');
        setOriginalImage(imagePath);
        setCurrentImage(imagePath);
        
        // Set canvas size based on image
        const maxWidth = 800;
        const maxHeight = 600;
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        const newCanvasSize = {
          width: img.width * ratio,
          height: img.height * ratio
        };
        setCanvasSize(newCanvasSize);
        
        // Draw image on canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = newCanvasSize.width;
            canvas.height = newCanvasSize.height;
            ctx.drawImage(img, 0, 0, newCanvasSize.width, newCanvasSize.height);
            console.log('ContentEdit: Image drawn on canvas');
          }
        }
        
        // Initialize history
        addToHistory('Original image loaded', imagePath);
      };
      
      img.onerror = (error) => {
        console.error('ContentEdit: Error loading image:', error);
        toast.error('Failed to load image');
      };
      
      img.src = imagePath;
    } catch (error) {
      console.error('Error loading image:', error);
      toast.error('Failed to load image');
    }
  }, [selectedImage, userData.id]);

  // Draw image on canvas when currentImage changes
  useEffect(() => {
    if (currentImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = document.createElement("img");
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        
        img.src = currentImage;
      }
    }
  }, [currentImage]);

  const addToHistory = useCallback((description: string, imageData: string) => {
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
    setCanUndo(newHistoryArray.length > 1);
    setCanRedo(false);
  }, [history, historyIndex]);

  const applySettings = useCallback(() => {
    if (!currentImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = document.createElement("img");
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply filters using CSS filters
      const filterString = `
        brightness(${100 + settings.brightness}%)
        contrast(${100 + settings.contrast}%)
        saturate(${100 + settings.saturation}%)
        hue-rotate(${settings.hue}deg)
        blur(${settings.blur}px)
        sepia(${settings.temperature > 0 ? settings.temperature / 100 : 0})
      `;
      
      // Create a temporary canvas for processing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      // Draw image with filters
      tempCtx.filter = filterString;
      tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Copy to main canvas
      ctx.drawImage(tempCanvas, 0, 0);
      
      // Convert to data URL for history
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCurrentImage(dataUrl);
      addToHistory('Applied adjustments', dataUrl);
    };
    
    img.src = currentImage;
  }, [currentImage, settings, addToHistory]);

  const handleSettingChange = useCallback((key: keyof EditSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      sharpen: 0,
      noise: 0,
      vignette: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      exposure: 0,
      gamma: 1
    });
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setSettings(preset.settings);
    toast.success(`Applied ${preset.name} preset`);
  }, []);

  const applyTemplate = useCallback((template: Template) => {
    setSettings(template.settings);
    setCanvasSize({ width: 800, height: 600 }); // Adjust based on template
    toast.success(`Applied ${template.name} template`);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentImage(history[newIndex].imageData);
      setCanUndo(newIndex > 0);
      setCanRedo(true);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentImage(history[newIndex].imageData);
      setCanUndo(true);
      setCanRedo(newIndex < history.length - 1);
    }
  }, [history, historyIndex]);

  const saveImage = useCallback(async (asNew: boolean = false) => {
    if (!selectedImage || !currentImage) return;

    try {
      setIsEditing(true);
      
      // Convert canvas to blob
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const filename = asNew ? newFilename : selectedImage.system_filename;
        const formData = new FormData();
        formData.append('file', blob, filename);
        formData.append('user', userData.id);
        formData.append('filename', `edited/${filename}`);

        // Upload edited image
        const response = await fetch(`https://api.nymia.ai/v1/uploadfile`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: formData
        });

        if (response.ok) {
          toast.success(asNew ? 'Image saved as new file' : 'Image updated successfully');
          setShowSaveDialog(false);
        } else {
          throw new Error('Failed to save image');
        }
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image');
    } finally {
      setIsEditing(false);
    }
  }, [selectedImage, currentImage, newFilename, userData.id]);

  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = selectedImage?.system_filename || 'edited-image.jpg';
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.9);
    link.click();
  }, [selectedImage]);

  const rotateImage = useCallback((direction: 'left' | 'right') => {
    if (!currentImage) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = document.createElement("img");
    img.onload = () => {
      const angle = direction === 'left' ? -90 : 90;
      const radians = (angle * Math.PI) / 180;
      
      // Swap dimensions for 90-degree rotation
      const newWidth = Math.abs(canvas.width * Math.cos(radians)) + Math.abs(canvas.height * Math.sin(radians));
      const newHeight = Math.abs(canvas.width * Math.sin(radians)) + Math.abs(canvas.height * Math.cos(radians));
      
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;
      
      tempCtx.translate(newWidth / 2, newHeight / 2);
      tempCtx.rotate(radians);
      tempCtx.drawImage(img, -canvas.width / 2, -canvas.height / 2);
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(tempCanvas, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCurrentImage(dataUrl);
      addToHistory(`Rotated ${direction}`, dataUrl);
    };
    
    img.src = currentImage;
  }, [currentImage, addToHistory]);

  const flipImage = useCallback((direction: 'horizontal' | 'vertical') => {
    if (!currentImage) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = document.createElement("img");
    img.onload = () => {
      ctx.save();
      
      if (direction === 'horizontal') {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      } else {
        ctx.scale(1, -1);
        ctx.translate(0, -canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCurrentImage(dataUrl);
      addToHistory(`Flipped ${direction}`, dataUrl);
    };
    
    img.src = currentImage;
  }, [currentImage, addToHistory]);

  // Apply settings when they change
  useEffect(() => {
    if (currentImage) {
      applySettings();
    }
  }, [settings, applySettings]);

  if (!selectedImage) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Image Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select an image from the Vault to edit
          </p>
          <Button onClick={() => navigate('/content/vault')}>
            Go to Vault
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Edit Content
          </h1>
          <p className="text-muted-foreground">
            Editing: {selectedImage.system_filename}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(true)}
            disabled={history.length === 0}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresets(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Presets
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(true)}
          >
            <FileImage className="w-4 h-4 mr-2" />
            Templates
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadImage}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button
            onClick={() => setShowSaveDialog(true)}
            disabled={isEditing}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Canvas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Image Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden border rounded-lg bg-muted">
                <div
                  className="relative"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transformOrigin: 'center',
                    transition: 'transform 0.1s ease-out'
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    className="block mx-auto"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => rotateImage('left')}
                  className="h-20 flex-col"
                >
                  <RotateCcw className="w-6 h-6 mb-2" />
                  Rotate Left
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => rotateImage('right')}
                  className="h-20 flex-col"
                >
                  <RotateCw className="w-6 h-6 mb-2" />
                  Rotate Right
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => flipImage('horizontal')}
                  className="h-20 flex-col"
                >
                  <FlipHorizontal className="w-6 h-6 mb-2" />
                  Flip H
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => flipImage('vertical')}
                  className="h-20 flex-col"
                >
                  <FlipVertical className="w-6 h-6 mb-2" />
                  Flip V
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetSettings}
                  className="h-20 flex-col"
                >
                  <RotateCcw className="w-6 h-6 mb-2" />
                  Reset
                </Button>
                
                <Button
                  variant="outline"
                  onClick={undo}
                  disabled={!canUndo}
                  className="h-20 flex-col"
                >
                  <Undo className="w-6 h-6 mb-2" />
                  Undo
                </Button>
                
                <Button
                  variant="outline"
                  onClick={redo}
                  disabled={!canRedo}
                  className="h-20 flex-col"
                >
                  <Redo className="w-6 h-6 mb-2" />
                  Redo
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setEditMode('crop')}
                  className="h-20 flex-col"
                >
                  <Crop className="w-6 h-6 mb-2" />
                  Crop
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Edit Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={editMode} onValueChange={setEditMode}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="adjust">Adjust</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                </TabsList>

                <TabsContent value="adjust" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Brightness
                      </Label>
                      <Slider
                        value={[settings.brightness]}
                        onValueChange={([value]) => handleSettingChange('brightness', value)}
                        min={-100}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Contrast
                      </Label>
                      <Slider
                        value={[settings.contrast]}
                        onValueChange={([value]) => handleSettingChange('contrast', value)}
                        min={-100}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Droplets className="w-4 h-4" />
                        Saturation
                      </Label>
                      <Slider
                        value={[settings.saturation]}
                        onValueChange={([value]) => handleSettingChange('saturation', value)}
                        min={-100}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Hue
                      </Label>
                      <Slider
                        value={[settings.hue]}
                        onValueChange={([value]) => handleSettingChange('hue', value)}
                        min={-180}
                        max={180}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Temperature
                      </Label>
                      <Slider
                        value={[settings.temperature]}
                        onValueChange={([value]) => handleSettingChange('temperature', value)}
                        min={-50}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Blur
                      </Label>
                      <Slider
                        value={[settings.blur]}
                        onValueChange={([value]) => handleSettingChange('blur', value)}
                        min={0}
                        max={20}
                        step={0.5}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Sharpen
                      </Label>
                      <Slider
                        value={[settings.sharpen]}
                        onValueChange={([value]) => handleSettingChange('sharpen', value)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Vignette
                      </Label>
                      <Slider
                        value={[settings.vignette]}
                        onValueChange={([value]) => handleSettingChange('vignette', value)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Sliders className="w-4 h-4" />
                        Noise
                      </Label>
                      <Slider
                        value={[settings.noise]}
                        onValueChange={([value]) => handleSettingChange('noise', value)}
                        min={0}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Image Info */}
          <Card>
            <CardHeader>
              <CardTitle>Image Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Filename:</span>
                <span className="text-sm font-medium">{selectedImage.system_filename}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Size:</span>
                <span className="text-sm font-medium">
                  {(selectedImage.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Format:</span>
                <span className="text-sm font-medium">{selectedImage.image_format.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm font-medium">
                  {new Date(selectedImage.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Presets Dialog */}
      <Dialog open={showPresets} onOpenChange={setShowPresets}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Presets</DialogTitle>
            <DialogDescription>
              Apply professional presets to your image
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <Card
                key={preset.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => {
                  applyPreset(preset);
                  setShowPresets(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground">{preset.description}</p>
                    {preset.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
            <DialogDescription>
              Apply format templates for different platforms
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => {
                  applyTemplate(template);
                  setShowTemplates(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit History</DialogTitle>
            <DialogDescription>
              View and restore previous versions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {history.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  index === historyIndex
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-border hover:border-purple-300'
                }`}
                onClick={() => {
                  setHistoryIndex(index);
                  setCurrentImage(item.imageData);
                  setCanUndo(index > 0);
                  setCanRedo(index < history.length - 1);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={item.imageData}
                      alt={item.description}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {index === historyIndex && (
                  <Check className="w-4 h-4 text-purple-500" />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Image</DialogTitle>
            <DialogDescription>
              Choose how to save your edited image
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={saveAsNew}
                onCheckedChange={setSaveAsNew}
              />
              <Label>Save as new file</Label>
            </div>
            
            {saveAsNew && (
              <div>
                <Label htmlFor="new-filename">New filename</Label>
                <Input
                  id="new-filename"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  placeholder="Enter new filename..."
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={() => saveImage(saveAsNew)}
                disabled={isEditing}
                className="flex-1"
              >
                {isEditing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
