
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Image,
  Save,
  Download,
  ArrowLeft,
  Settings,
  Sparkles,
  FileImage,
  History,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Palette,
  Sun,
  Target,
  Droplets,
  Zap,
  Eye,
  Layers,
  Sliders,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  StarOff,
  FileVideo,
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
  Moon,
  Heart,
  HeartOff,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

// Pintura imports
import '@pqina/pintura/pintura.css';
import { PinturaEditor } from '@pqina/react-pintura';
import { getEditorDefaults } from '@pqina/pintura';

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
  category: string;
  preview: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  aspectRatio: string;
  preview: string;
  decorations?: any[];
}

export default function ContentEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);
  const editorRef = useRef(null);

  // Get editor defaults with upload configuration
  const getEditorDefaultsWithUpload = useCallback(() => {
    return getEditorDefaults({
      imageWriter: {
        store: {
          // Where to post the files to
          url: 'https://api.nymia.ai/v1/uploadfile',

          // Headers for authentication
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },

          // Which fields to post
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

  // State management
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [showImageSelection, setShowImageSelection] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentDecorations, setCurrentDecorations] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History management
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Presets and templates
  const [presets] = useState<Preset[]>([
    {
      id: '1',
      name: 'Vintage',
      description: 'Warm vintage look with faded colors',
      category: 'Artistic',
      preview: '/presets/vintage.jpg'
    },
    {
      id: '2',
      name: 'Black & White',
      description: 'Classic monochrome conversion',
      category: 'Classic',
      preview: '/presets/bw.jpg'
    },
    {
      id: '3',
      name: 'HDR',
      description: 'High dynamic range look',
      category: 'Enhanced',
      preview: '/presets/hdr.jpg'
    },
    {
      id: '4',
      name: 'Portrait',
      description: 'Optimized for portrait photography',
      category: 'Portrait',
      preview: '/presets/portrait.jpg'
    },
    {
      id: '5',
      name: 'Landscape',
      description: 'Enhanced landscape colors',
      category: 'Nature',
      preview: '/presets/landscape.jpg'
    },
    {
      id: '6',
      name: 'Dramatic',
      description: 'High contrast dramatic look',
      category: 'Artistic',
      preview: '/presets/dramatic.jpg'
    }
  ]);

  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'Instagram Post',
      description: 'Square format optimized for Instagram',
      category: 'Social Media',
      aspectRatio: '1:1',
      preview: '/templates/instagram.jpg',
      decorations: [
        {
          x: 64,
          y: 64,
          fontSize: 48,
          fontWeight: 'bold',
          text: 'Instagram Post',
          color: [255, 255, 255],
          isSelected: true,
          disableStyle: ['fontSize', 'fontWeight', 'lineHeight'],
          disableRemove: true,
          disableMove: true,
          disableFlip: true,
          disableRotate: true,
          disableTextLayout: true,
          disableReorder: true,
        },
        {
          x: 0,
          y: 280,
          width: '100%',
          height: 2,
          backgroundColor: [255, 255, 255],
        }
      ]
    },
    {
      id: '2',
      name: 'YouTube Thumbnail',
      description: '16:9 format with bold colors',
      category: 'Video',
      aspectRatio: '16:9',
      preview: '/templates/youtube.jpg',
      decorations: [
        {
          x: 64,
          y: 64,
          fontSize: 64,
          fontWeight: 'bold',
          text: 'YouTube Title',
          color: [255, 0, 0],
          isSelected: true,
          disableStyle: ['fontSize', 'fontWeight', 'lineHeight'],
          disableRemove: true,
          disableMove: true,
          disableFlip: true,
          disableRotate: true,
          disableTextLayout: true,
          disableReorder: true,
        },
        {
          top: 344,
          left: 64,
          right: 64,
          height: 200,
          fontSize: 32,
          fontStyle: 'italic',
          text: 'Your video description goes here. Make it engaging and clickable!',
          color: [255, 255, 255],
          disableStyle: ['fontSize', 'fontWeight', 'lineHeight'],
          disableRemove: true,
          disableMove: true,
          disableFlip: true,
          disableRotate: true,
          disableTextLayout: true,
          disableReorder: true,
        }
      ]
    },
    {
      id: '3',
      name: 'LinkedIn Banner',
      description: 'Professional banner format',
      category: 'Professional',
      aspectRatio: '4:1',
      preview: '/templates/linkedin.jpg',
      decorations: [
        {
          x: 64,
          y: 64,
          fontSize: 56,
          fontWeight: 'bold',
          text: 'Professional Title',
          color: [0, 0, 0],
          isSelected: true,
          disableStyle: ['fontSize', 'fontWeight', 'lineHeight'],
          disableRemove: true,
          disableMove: true,
          disableFlip: true,
          disableRotate: true,
          disableTextLayout: true,
          disableReorder: true,
        },
        {
          x: 0,
          y: 200,
          width: '100%',
          height: 3,
          backgroundColor: [0, 0, 0],
        }
      ]
    },
    {
      id: '4',
      name: 'Facebook Cover',
      description: 'Wide format for Facebook',
      category: 'Social Media',
      aspectRatio: '2.7:1',
      preview: '/templates/facebook.jpg',
      decorations: [
        {
          x: 64,
          y: 64,
          fontSize: 48,
          fontWeight: 'bold',
          text: 'Facebook Cover',
          color: [255, 255, 255],
          isSelected: true,
          disableStyle: ['fontSize', 'fontWeight', 'lineHeight'],
          disableRemove: true,
          disableMove: true,
          disableFlip: true,
          disableRotate: true,
          disableTextLayout: true,
          disableReorder: true,
        }
      ]
    },
    {
      id: '5',
      name: 'Twitter Post',
      description: 'Square format for Twitter',
      category: 'Social Media',
      aspectRatio: '1:1',
      preview: '/templates/twitter.jpg',
      decorations: [
        {
          x: 64,
          y: 64,
          fontSize: 40,
          fontWeight: 'bold',
          text: 'Tweet Title',
          color: [29, 161, 242],
          isSelected: true,
          disableStyle: ['fontSize', 'fontWeight', 'lineHeight'],
          disableRemove: true,
          disableMove: true,
          disableFlip: true,
          disableRotate: true,
          disableTextLayout: true,
          disableReorder: true,
        }
      ]
    },
    {
      id: '6',
      name: 'Pinterest Pin',
      description: 'Tall format for Pinterest',
      category: 'Social Media',
      aspectRatio: '2:3',
      preview: '/templates/pinterest.jpg',
      decorations: [
        {
          x: 64,
          y: 64,
          fontSize: 44,
          fontWeight: 'bold',
          text: 'Pinterest Pin',
          color: [189, 8, 28],
          isSelected: true,
          disableStyle: ['fontSize', 'fontWeight', 'lineHeight'],
          disableRemove: true,
          disableMove: true,
          disableFlip: true,
          disableRotate: true,
          disableTextLayout: true,
          disableReorder: true,
        },
        {
          top: 400,
          left: 64,
          right: 64,
          height: 300,
          fontSize: 28,
          fontStyle: 'italic',
          text: 'Your Pinterest description with engaging content and hashtags.',
          color: [255, 255, 255],
          disableStyle: ['fontSize', 'fontWeight', 'lineHeight'],
          disableRemove: true,
          disableMove: true,
          disableFlip: true,
          disableRotate: true,
          disableTextLayout: true,
          disableReorder: true,
        }
      ]
    }
  ]);

  // Get image data from navigation state
  useEffect(() => {
    const imageData = location.state?.imageData;
    console.log('ContentEdit: Received image data:', imageData);
    if (imageData) {
      setSelectedImage(imageData);
      const imageUrl = `https://images.nymia.ai/cdn-cgi/image/w=1200/${imageData.file_path}`;
      console.log('ContentEdit: Loading image from path:', imageUrl);
      setImageSrc(imageUrl);
      setHasImage(true);
      addToHistory('Original image loaded', imageUrl);
    } else {
      console.log('ContentEdit: No image data received');
    }
  }, [location.state]);

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

  const handleEditorProcess = useCallback((imageState: any) => {
    try {
      // Download the edited image
      downloadFile(imageState.dest);

      // Also save to state for preview
      const editedURL = URL.createObjectURL(imageState.dest);
      setEditedImageUrl(editedURL);
      addToHistory('Image edited with Pintura', editedURL);
      toast.success('Image edited, uploaded, and downloaded successfully');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    }
  }, [downloadFile, addToHistory, userData?.id]);

  const applyPreset = useCallback((preset: Preset) => {
    // In a real implementation, you would apply preset settings to Pintura
    toast.success(`Applied ${preset.name} preset`);
    setShowPresets(false);
  }, []);

  const applyTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setCurrentDecorations(template.decorations || []);
    toast.success(`Applied ${template.name} template`);
    setShowTemplates(false);
  }, []);

  const clearTemplate = useCallback(() => {
    setSelectedTemplate(null);
    setCurrentDecorations([]);
    toast.success('Template cleared');
  }, []);

  const saveImage = useCallback(async (asNew: boolean = false) => {
    if (!selectedImage || !editedImageUrl) return;

    try {
      setIsEditing(true);

      const response = await fetch(editedImageUrl);
      const blob = await response.blob();

      const filename = asNew ? newFilename : selectedImage.system_filename;
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('user', userData.id);
      formData.append('filename', `edited/${filename}`);

      // Upload edited image
      const uploadResponse = await fetch(`https://api.nymia.ai/v1/uploadfile`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: formData
      });

      if (uploadResponse.ok) {
        toast.success(asNew ? 'Image saved as new file' : 'Image updated successfully');
        setShowSaveDialog(false);
      } else {
        throw new Error('Failed to save image');
      }
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image');
    } finally {
      setIsEditing(false);
    }
  }, [selectedImage, editedImageUrl, newFilename, userData.id]);

  const downloadImage = useCallback(() => {
    if (!editedImageUrl) return;

    // Create a hidden link and set the URL
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = editedImageUrl;
    link.download = selectedImage?.system_filename || 'edited-image.jpg';

    // We need to add the link to the DOM for "click()" to work
    document.body.appendChild(link);
    link.click();

    // To make this work on Firefox we need to wait a short moment before clean up
    setTimeout(() => {
      link.parentNode?.removeChild(link);
    }, 0);
  }, [selectedImage, editedImageUrl]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setImageSrc(history[newIndex].imageData);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setImageSrc(history[newIndex].imageData);
    }
  }, [history, historyIndex]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
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
          file_type: file.type
        };
        
        setSelectedImage(uploadedImage);
        setImageSrc(result);
        setHasImage(true);
        setShowImageSelection(false);
        addToHistory('Image uploaded', result);
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  }, [addToHistory]);

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
            file_type: file.type
          };
          
          setSelectedImage(uploadedImage);
          setImageSrc(result);
          setHasImage(true);
          setShowImageSelection(false);
          addToHistory('Image uploaded via drag & drop', result);
          toast.success('Image uploaded successfully');
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  }, [addToHistory]);

  const handleSelectFromVault = useCallback(() => {
    setShowImageSelection(false);
    navigate('/content/vault');
  }, [navigate]);

  const handleUploadNew = useCallback(() => {
    setShowImageSelection(false);
    // Show the upload area instead of immediately triggering file input
  }, []);

  const handleBackToSelection = useCallback(() => {
    setShowImageSelection(true);
    setSelectedImage(null); // Clear selected image
    setImageSrc(null);
    setEditedImageUrl(null);
    setHasImage(false);
    setHistory([]);
    setHistoryIndex(-1);
    navigate('/content/edit'); // Navigate back to the selection screen
  }, [navigate]);

  if (!selectedImage && showImageSelection) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Edit Content
            </h1>
            <p className="text-muted-foreground">
              Choose how you want to get started
            </p>
          </div>
        </div>

        {/* Image Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Select from Vault */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleSelectFromVault}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select from Vault</h3>
              <p className="text-muted-foreground mb-4">
                Choose an existing image from your content vault
              </p>
              <Button className="w-full">
                Browse Vault
              </Button>
            </CardContent>
          </Card>

          {/* Upload New Image */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleUploadNew}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload New Image</h3>
              <p className="text-muted-foreground mb-4">
                Upload a new image from your device
              </p>
              <Button className="w-full">
                Upload Image
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedImage && !showImageSelection) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToSelection}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Selection
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
                Edit Content
              </h1>
              <p className="text-muted-foreground">
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
              className="border-2 border-dashed border-gray-300 rounded-lg h-[600px] bg-muted flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={triggerFileUpload}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Image className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload an image to edit</h3>
              <p className="text-gray-500 mb-4">Drag and drop an image here, or click to browse</p>
              <Button onClick={triggerFileUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToSelection}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Edit Content
            </h1>
            <p className="text-muted-foreground">
              {selectedImage ? `Editing: ${selectedImage.system_filename}` : 'Upload an image to edit'}
            </p>
          </div>
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
            disabled={!editedImageUrl}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button
            onClick={() => setShowSaveDialog(true)}
            disabled={isEditing || !editedImageUrl}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Pintura Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Professional Image Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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
              
              {!hasImage ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg h-[600px] bg-muted flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={triggerFileUpload}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Image className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload an image to edit</h3>
                  <p className="text-gray-500 mb-4">Drag and drop an image here, or click to browse</p>
                  <Button onClick={triggerFileUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg h-[600px] bg-muted">
                  <PinturaEditor
                    ref={editorRef}
                    {...editorDefaults}
                    src={imageSrc}
                    onProcess={handleEditorProcess}
                    util={selectedTemplate ? 'decorate' : undefined}
                    imageDecoration={currentDecorations}
                  />
                </div>
              )}
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
                  onClick={() => setEditorVisible(true)}
                  className="h-20 flex-col"
                >
                  <Edit className="w-6 h-6 mb-2" />
                  Edit Image
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowPresets(true)}
                  className="h-20 flex-col"
                >
                  <Sparkles className="w-6 h-6 mb-2" />
                  Apply Preset
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(true)}
                  className="h-20 flex-col"
                >
                  <FileImage className="w-6 h-6 mb-2" />
                  Apply Template
                </Button>

                <Button
                  variant="outline"
                  onClick={downloadImage}
                  disabled={!editedImageUrl}
                  className="h-20 flex-col"
                >
                  <Download className="w-6 h-6 mb-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Edited Image Preview */}
          {editedImageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Edited Image Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-muted">
                  <img
                    src={editedImageUrl}
                    alt="Edited"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={downloadImage}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Edited
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(true)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save to Server
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Info */}
          <Card>
            <CardHeader>
              <CardTitle>Image Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Filename:</span>
                <span className="text-sm font-medium">{selectedImage?.system_filename || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Size:</span>
                <span className="text-sm font-medium">
                  {selectedImage ? ((selectedImage.file_size_bytes / 1024 / 1024).toFixed(2)) : 'N/A'} MB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Format:</span>
                <span className="text-sm font-medium">{selectedImage?.image_format?.toUpperCase() || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm font-medium">
                  {selectedImage?.created_at ? new Date(selectedImage.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Edit Status */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">History:</span>
                <Badge variant="secondary">{history.length} steps</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current:</span>
                <Badge variant="outline">{historyIndex + 1} of {history.length}</Badge>
              </div>
              {editedImageUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="default" className="bg-green-500">Edited</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Control */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Active Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Template:</span>
                  <span className="text-sm font-medium">{selectedTemplate.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <Badge variant="outline" className="text-xs">{selectedTemplate.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aspect Ratio:</span>
                  <Badge variant="secondary" className="text-xs">{selectedTemplate.aspectRatio}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearTemplate}
                  className="w-full mt-2"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Presets Dialog */}
      <Dialog open={showPresets} onOpenChange={setShowPresets}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Professional Presets</DialogTitle>
            <DialogDescription>
              Apply professional presets to enhance your image
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <Card
                key={preset.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => applyPreset(preset)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="w-full h-24 bg-muted rounded-lg mb-2 flex items-center justify-center">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground">{preset.description}</p>
                    <Badge variant="outline" className="text-xs">{preset.category}</Badge>
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
            <DialogTitle>Format Templates</DialogTitle>
            <DialogDescription>
              Apply format templates with predefined decorations for different platforms
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => applyTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="w-full h-24 bg-muted rounded-lg mb-2 flex items-center justify-center">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{template.category}</Badge>
                      <Badge variant="secondary" className="text-xs">{template.aspectRatio}</Badge>
                    </div>
                    {template.decorations && template.decorations.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Includes {template.decorations.length} decoration{template.decorations.length > 1 ? 's' : ''}
                      </div>
                    )}
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
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${index === historyIndex
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-border hover:border-purple-300'
                  }`}
                onClick={() => {
                  setHistoryIndex(index);
                  setImageSrc(item.imageData);
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
              <input
                type="checkbox"
                id="save-as-new"
                checked={saveAsNew}
                onChange={(e) => setSaveAsNew(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="save-as-new">Save as new file</label>
            </div>

            {saveAsNew && (
              <div>
                <label htmlFor="new-filename" className="text-sm font-medium">New filename</label>
                <input
                  id="new-filename"
                  type="text"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  placeholder="Enter new filename..."
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
