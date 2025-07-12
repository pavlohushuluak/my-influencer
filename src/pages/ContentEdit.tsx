
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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


export default function ContentEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);
  const editorRef = useRef(null);

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

  // Get editor defaults with upload configuration
  const getEditorDefaultsWithUpload = useCallback(() => {
    return getEditorDefaults({
      // Image writer configuration
      imageWriter: {
        store: {
          url: 'https://api.nymia.ai/v1/uploadfile',
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
    try {
      setIsLoadingImage(true);
      
      // Show loading toast
      const loadingToast = toast.loading('Loading image...', {
        description: 'Preparing image for editing',
        duration: Infinity
      });

      // Download the image file
      const response = await fetch('https://api.nymia.ai/v1/downloadfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: imageData.file_path.substring(imageData.file_path.indexOf('output/'))
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
      const fallbackUrl = `https://images.nymia.ai/cdn-cgi/image/w=1200/${imageData.file_path}`;
      setImageSrc(fallbackUrl);
      setHasImage(true);
      addToHistory('Original image loaded (fallback)', fallbackUrl);
    } finally {
      setIsLoadingImage(false);
    }
  }

  // Get image data from navigation state
  useEffect(() => {
    const imageData = location.state?.imageData;
    console.log('ContentEdit: Received image data:', imageData);
    if (imageData) {
      setSelectedImage(imageData);
      fetchImage(imageData);
    } else {
      console.log('ContentEdit: No image data received');
    }
  }, [location.state, userData?.id]);

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

  const uploadToVault = useCallback(async () => {
    if (!selectedImage || !editedImageUrl) {
      toast.error('Please edit an image first');
      return;
    }

    try {
      setIsUploading(true);

      // Show loading toast
      const loadingToast = toast.loading('Preparing upload...', {
        description: 'Processing edited image',
        duration: Infinity
      });

      // Fetch the edited image as a blob
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();

      // Get existing files to check for duplicates
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
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
          if (existingFilenames.includes(selectedImage.system_filename)) {
            hasConflict = true;
            setConflictFilename(selectedImage.system_filename);
            setPendingUploadData({ blob, filename: selectedImage.system_filename });
            setShowOverwriteDialog(true);
            toast.dismiss(loadingToast);
            setIsUploading(false);
            return;
          }

          // Generate unique filename
          const baseName = selectedImage.system_filename.substring(0, selectedImage.system_filename.lastIndexOf('.'));
          const extension = selectedImage.system_filename.substring(selectedImage.system_filename.lastIndexOf('.'));

          let counter = 1;
          let testFilename = selectedImage.system_filename;

          while (existingFilenames.includes(testFilename)) {
            testFilename = `${baseName}(${counter})${extension}`;
            counter++;
          }

          finalFilename = testFilename;
          console.log('Final filename:', finalFilename);
        }
      }

      // Update loading message
      toast.loading('Uploading to Vault...', {
        id: loadingToast,
        description: `Saving as "${finalFilename}"`
      });

      // Create a file from the blob with the unique filename
      const file = new File([blob], finalFilename, { type: 'image/jpeg' });

      // Upload file to API
      const uploadResponse = await fetch(`https://api.nymia.ai/v1/uploadfile?user=${userData.id}&filename=output/${finalFilename}`, {
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

      const dbResponse = await fetch('https://db.nymia.ai/rest/v1/generated_images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(newImageData)
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to create database entry');
      }

      toast.dismiss(loadingToast);
      toast.success(`Image uploaded to Vault successfully as "${finalFilename}"!`);
    } catch (error) {
      console.error('Error uploading to vault:', error);
      toast.error('Failed to upload to vault. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage, editedImageUrl, userData?.id]);

  const handleOverwriteConfirm = useCallback(async () => {
    if (!pendingUploadData) return;

    try {
      setIsUploading(true);
      setShowOverwriteDialog(false);

      const loadingToast = toast.loading('Overwriting file...', {
        description: `Replacing "${conflictFilename}"`,
        duration: Infinity
      });

      // Delete old file first
      const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefile', {
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
      const dbDeleteResponse = await fetch(`https://db.nymia.ai/rest/v1/generated_images?system_filename=eq.${conflictFilename}&user_filename=eq.`, {
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
      const uploadResponse = await fetch(`https://api.nymia.ai/v1/uploadfile?user=${userData.id}&filename=output/${conflictFilename}`, {
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

      const dbResponse = await fetch('https://db.nymia.ai/rest/v1/generated_images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(newImageData)
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to create database entry');
      }

      toast.dismiss(loadingToast);
      toast.success(`File "${conflictFilename}" overwritten successfully!`);
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
        description: 'Generating unique filename',
        duration: Infinity
      });

      // Get existing files to check for duplicates
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
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
        description: `Saving as "${finalFilename}"`
      });

      // Create a file from the blob with the unique filename
      const file = new File([pendingUploadData.blob], finalFilename, { type: 'image/jpeg' });

      // Upload file to API
      const uploadResponse = await fetch(`https://api.nymia.ai/v1/uploadfile?user=${userData.id}&filename=output/${finalFilename}`, {
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

      const dbResponse = await fetch('https://db.nymia.ai/rest/v1/generated_images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(newImageData)
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to create database entry');
      }

      toast.dismiss(loadingToast);
      toast.success(`New file created successfully as "${finalFilename}"!`);
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
    // Cleanup current blob URLs before clearing state
    if (imageSrc && imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(imageSrc);
    }
    if (editedImageUrl && editedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(editedImageUrl);
    }
    
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
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Edit Content
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Choose how you want to get started
            </p>
          </div>
        </div>

        {/* Image Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
          {/* Select from Vault */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleSelectFromVault}>
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Select from Vault</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                Choose an existing image from your content vault
              </p>
              <Button className="w-full">
                Browse Vault
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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              {selectedImage ? `Editing: ${selectedImage.system_filename}` : 'Upload an image to edit'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={uploadToVault}
            disabled={!selectedImage || !editedImageUrl || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload to Vault</span>
              </>
            )}
          </Button>
          <Button
            onClick={handleDownloadEdited}
            disabled={!selectedImage || !editedImageUrl}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div> {/* End of header div */}

      {/* Main Editor */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Professional Image Editor</CardTitle>
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
                className="border-2 border-dashed border-gray-300 rounded-lg h-[400px] md:h-[600px] bg-muted flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={triggerFileUpload}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Image className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2 text-center">Upload an image to edit</h3>
                <p className="text-sm md:text-base text-gray-500 mb-4 text-center px-4">Drag and drop an image here, or click to browse</p>
                <Button onClick={triggerFileUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            ) : isLoadingImage ? (
              <div className="border rounded-lg h-[400px] md:h-[600px] bg-muted flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm md:text-base text-gray-500 text-center px-4">Preparing image for editing</p>
              </div>
            ) : (
              <div className="border rounded-lg h-[400px] md:h-[600px] bg-muted">
                <PinturaEditor
                  ref={editorRef}
                  {...editorDefaults}
                  src={imageSrc}
                  onProcess={handleEditorProcess}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overwrite Confirmation Dialog */}
      <Dialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>File Already Exists</DialogTitle>
            <DialogDescription>
              A file named "{conflictFilename}" already exists in the Vault. What would you like to do?
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
    </div>
  );
}
