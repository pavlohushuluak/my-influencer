
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
  Upload,
  Palette,
  Sun,
  Moon,
  Droplet,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VaultSelector from '@/components/VaultSelector';

// Pintura imports
import '@pqina/pintura/pintura.css';
import { PinturaEditor } from '@pqina/react-pintura';
import { colorStringToColorArray, getEditorDefaults } from '@pqina/pintura';
import xSvg from '@/assets/social/x.svg';
import tiktokSvg from '@/assets/social/tiktok.svg';
import facebookSvg from '@/assets/social/facebook.svg';
import instagramSvg from '@/assets/social/instagram.svg';
import { Input } from '@/components/ui/input';
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
}

interface EditHistory {
  id: string;
  timestamp: Date;
  description: string;
  imageData: string;
}

// Utility functions for encoding/decoding filenames
function encodeFilename(name: string) {
  return name.replace(/ /g, '_space_');
}
function decodeFilename(name: string) {
  return name.replace(/_space_/g, ' ');
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
  const [showFilenameDialog, setShowFilenameDialog] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  // New for extension lock
  const [filenameBase, setFilenameBase] = useState('');
  const [filenameExt, setFilenameExt] = useState('');

  // Vault selector state
  const [showVaultSelector, setShowVaultSelector] = useState(false);

  console.log('ContentEdit: showVaultSelector', showVaultSelector);

  // Theme options
  const THEME_MODES = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'custom', label: 'Custom', icon: Palette },
  ];
  const LIGHT_BG = [1, 1, 1];
  const DARK_BG = [0, 0, 0];
  const COLOR_LABELS = [
    { key: 'red', label: 'Red', color: 'bg-red-500', idx: 0 },
    { key: 'green', label: 'Green', color: 'bg-green-500', idx: 1 },
    { key: 'blue', label: 'Blue', color: 'bg-blue-500', idx: 2 },
  ];

  const [themeMode, setThemeMode] = useState('dark');
  const [customRGB, setCustomRGB] = useState([1, 1, 1]); // default all on
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Editor size controls
  const [editorWidth, setEditorWidth] = useState('100%');
  const [editorHeight, setEditorHeight] = useState('85vh');
  const [showSizeControls, setShowSizeControls] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Preset sizes for quick selection
  const PRESET_SIZES = [
    { name: 'Full Screen', width: '100%', height: '85vh' },
    { name: 'Large', width: '90%', height: '75vh' },
    { name: 'Medium', width: '80%', height: '65vh' },
    { name: 'Small', width: '70%', height: '55vh' },
  ];

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: editorContainerRef.current?.offsetWidth || 0,
      height: editorContainerRef.current?.offsetHeight || 0
    });
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    // Calculate new dimensions based on resize direction
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;

    // Handle different resize directions
    if (e.target && (e.target as Element).closest('[data-resize-direction]')) {
      const direction = (e.target as Element).closest('[data-resize-direction]')?.getAttribute('data-resize-direction');

      switch (direction) {
        case 'nw':
        case 'ne':
        case 'sw':
        case 'se':
          newWidth = Math.max(400, resizeStart.width + deltaX);
          newHeight = Math.max(300, resizeStart.height + deltaY);
          break;
        case 'n':
        case 's':
          newHeight = Math.max(300, resizeStart.height + deltaY);
          break;
        case 'e':
        case 'w':
          newWidth = Math.max(400, resizeStart.width + deltaX);
          break;
        default:
          newWidth = Math.max(400, resizeStart.width + deltaX);
          newHeight = Math.max(300, resizeStart.height + deltaY);
      }
    } else {
      // Default behavior for corner resizing
      newWidth = Math.max(400, resizeStart.width + deltaX);
      newHeight = Math.max(300, resizeStart.height + deltaY);
    }

    setEditorWidth(`${newWidth}px`);
    setEditorHeight(`${newHeight}px`);
  }, [isResizing, resizeStart]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Compute the current theme array
  const theme = themeMode === 'light'
    ? LIGHT_BG
    : themeMode === 'dark'
      ? DARK_BG
      : customRGB;

  // Handle theme mode change
  const handleThemeMode = (mode: string) => {
    setThemeMode(mode);
    setShowCustomModal(mode === 'custom');
  };

  // Handle color toggle
  const handleColorToggle = (idx: number) => {
    setCustomRGB(prev => {
      const newArr = [...prev];
      newArr[idx] = newArr[idx] === 1 ? 0 : 1;
      return newArr;
    });
  };

  // Modal close on outside click
  const modalRef = useRef<HTMLDivElement>(null);
  const sizeControlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCustomModal) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowCustomModal(false);
        setThemeMode('custom'); // keep custom selected
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCustomModal]);

  // Size controls close on outside click
  useEffect(() => {
    if (!showSizeControls) return;
    const handleClick = (e: MouseEvent) => {
      if (sizeControlsRef.current && !sizeControlsRef.current.contains(e.target as Node)) {
        setShowSizeControls(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSizeControls]);

  // Get editor defaults with upload configuration
  const getEditorDefaultsWithUpload = useCallback(() => {
    return getEditorDefaults({
      // Image writer configuration
      imageWriter: {
        store: {
          url: `${config.backend_url}/uploadfile`,
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
    let loadingToast: any;
    try {
      setIsLoadingImage(true);
      loadingToast = toast.loading('Loading image...', {
        description: 'Preparing image for editing',
        duration: Infinity
      });

      // Download the image file
      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: 'output/' + imageData.system_filename
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
      const fallbackUrl = `${config.data_url}/cdn-cgi/image/w=1200/${userData.id}/output/${imageData.system_filename}`;
      setImageSrc(fallbackUrl);
      setHasImage(true);
      addToHistory('Original image loaded (fallback)', fallbackUrl);
    } finally {
      setIsLoadingImage(false);
      if (loadingToast) toast.dismiss(loadingToast);
    }
  }

  // Handle vault image selection
  const handleVaultImageSelect = (image: any) => {
    try {
      // Convert the vault image data to ImageData format
      const imageData: ImageData = {
        id: image.id,
        system_filename: image.system_filename,
        user_filename: image.user_filename,
        file_path: image.file_path,
        user_notes: image.user_notes || '',
        user_tags: image.user_tags || [],
        rating: image.rating || 0,
        favorite: image.favorite || false,
        created_at: image.created_at,
        file_size_bytes: image.file_size_bytes,
        image_format: image.image_format,
        file_type: image.file_type
      };

      setSelectedImage(imageData);
      setShowImageSelection(false);
      setShowVaultSelector(false); // Close the modal

      // Fetch the image from vault
      fetchImage(imageData);

      toast.success(`Selected image from vault: ${image.system_filename}`);
    } catch (error) {
      console.error('Error selecting image from vault:', error);
      toast.error('Failed to select image from vault. Please try again.');
    }
  };

  useEffect(() => {
    const imageData = location.state?.imageData;
    // Only run if both imageData and userData.id are available, and not already loaded
    if (imageData && userData?.id && (!selectedImage || selectedImage.id !== imageData.id)) {
      setSelectedImage(imageData);
      fetchImage(imageData);
    }
  }, [location.state, userData?.id]);

  // Get image data from navigation state
  useEffect(() => {
    const imageData = location.state?.imageData;
    console.log('ContentEdit: Received image data:', imageData);
    if (imageData) {
      setSelectedImage(imageData);
    } else {
      console.log('ContentEdit: No image data received');
    }
  }, [location.state]);

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

  // When Upload to Vault is clicked, open the dialog
  const handleUploadToVaultClick = useCallback(() => {
    if (!selectedImage) return;
    // Split filename into base and extension
    const orig = selectedImage.system_filename;
    const lastDot = orig.lastIndexOf('.');
    let base = orig;
    let ext = '';
    if (lastDot > 0) {
      base = orig.substring(0, lastDot);
      ext = orig.substring(lastDot);
    }
    setFilenameBase(base);
    setFilenameExt(ext);
    setCustomFilename(orig); // for backward compatibility, but not used for input now
    setShowFilenameDialog(true);
  }, [selectedImage]);

  // Update uploadToVault to accept a filename
  const uploadToVault = useCallback(async (filenameOverride?: string) => {
    if (!selectedImage || !editedImageUrl) {
      toast.error('Please edit an image first');
      return;
    }
    const filenameToUse = filenameOverride || selectedImage.system_filename;

    try {
      setIsUploading(true);

      // Show loading toast
      const loadingToast = toast.loading('Preparing upload...', {
        description: 'Processing edited image',
      });

      // Fetch the edited image as a blob
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();

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

      let finalFilename = filenameToUse;
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
          if (existingFilenames.includes(filenameToUse)) {
            hasConflict = true;
            setConflictFilename(filenameToUse);
            setPendingUploadData({ blob, filename: filenameToUse });
            setShowOverwriteDialog(true);
            toast.dismiss(loadingToast);
            setIsUploading(false);
            return;
          }

          // Generate unique filename
          const baseName = filenameToUse.substring(0, filenameToUse.lastIndexOf('.'));
          const extension = filenameToUse.substring(filenameToUse.lastIndexOf('.'));

          let counter = 1;
          let testFilename = filenameToUse;

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
        description: `Saving as "${decodeFilename(finalFilename)}"`
      });

      // Create a file from the blob with the unique filename
      const file = new File([blob], finalFilename, { type: 'image/jpeg' });

      // Upload file to API
      const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=output/${finalFilename}`, {
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
        user_uuid: userData.id,
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

      const dbResponse = await fetch(`${config.supabase_server_url}/generated_images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(newImageData)
      });

      if (!dbResponse.ok) {
        const errorText = await dbResponse.text();
        console.error('Database response error:', dbResponse.status, errorText);
        console.error('Sent data:', newImageData);
        throw new Error(`Failed to create database entry: ${dbResponse.status} ${errorText}`);
      }

      toast.dismiss(loadingToast);
      toast.success(`Image uploaded to Vault successfully as "${decodeFilename(finalFilename)}"!`);
    } catch (error) {
      console.error('Error uploading to vault:', error);
      toast.error('Failed to upload to vault. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage, editedImageUrl, userData?.id]);

  // Confirm filename and proceed with upload
  const handleConfirmFilename = useCallback(() => {
    setShowFilenameDialog(false);
    // Always combine base and ext, then encode
    const combined = filenameBase + filenameExt;
    uploadToVault(encodeFilename(combined));
  }, [filenameBase, filenameExt, uploadToVault]);

  const handleOverwriteConfirm = useCallback(async () => {
    if (!pendingUploadData) return;

    try {
      setIsUploading(true);
      setShowOverwriteDialog(false);

      const loadingToast = toast.loading('Overwriting file...', {
        description: `Replacing "${decodeFilename(conflictFilename)}"`
      });

      // Delete old file first
      const deleteResponse = await fetch(`${config.backend_url}/deletefile`, {
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
      const dbDeleteResponse = await fetch(`${config.supabase_server_url}/generated_images?system_filename=eq.${conflictFilename}&user_filename=eq.`, {
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
      const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=output/${conflictFilename}`, {
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
        user_uuid: userData.id,
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

      const dbResponse = await fetch(`${config.supabase_server_url}/generated_images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(newImageData)
      });

      if (!dbResponse.ok) {
        const errorText = await dbResponse.text();
        console.error('Database response error (overwrite):', dbResponse.status, errorText);
        console.error('Sent data (overwrite):', newImageData);
        throw new Error(`Failed to create database entry: ${dbResponse.status} ${errorText}`);
      }

      toast.dismiss(loadingToast);
      toast.success(`File "${decodeFilename(conflictFilename)}" overwritten successfully!`);
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
        description: 'Generating unique filename'
      });

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
        description: `Saving as "${decodeFilename(finalFilename)}"`
      });

      // Create a file from the blob with the unique filename
      const file = new File([pendingUploadData.blob], finalFilename, { type: 'image/jpeg' });

      // Upload file to API
      const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=output/${finalFilename}`, {
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
        user_uuid: userData.id,
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

      const dbResponse = await fetch(`${config.supabase_server_url}/generated_images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(newImageData)
      });

      if (!dbResponse.ok) {
        const errorText = await dbResponse.text();
        console.error('Database response error (create new):', dbResponse.status, errorText);
        console.error('Sent data (create new):', newImageData);
        throw new Error(`Failed to create database entry: ${dbResponse.status} ${errorText}`);
      }

      toast.dismiss(loadingToast);
      toast.success(`New file created successfully as "${decodeFilename(finalFilename)}"!`);
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
        // Clear the file input so the same file can be uploaded again
        if (fileInputRef.current) fileInputRef.current.value = '';
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
            navigate('/create/edit'); // Navigate back to the selection screen
  }, [navigate]);

  const [socialStickerUrls, setSocialStickerUrls] = useState<string[]>([]);

  useEffect(() => {
    // Helper to fetch and convert SVG to data URL
    const fetchSvgAsDataUrl = async (svgPath: string) => {
      const response = await fetch(svgPath);
      const svgText = await response.text();
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgText);
    };
    (async () => {
      const urls = await Promise.all([
        fetchSvgAsDataUrl(xSvg),
        fetchSvgAsDataUrl(tiktokSvg),
        fetchSvgAsDataUrl(facebookSvg),
        fetchSvgAsDataUrl(instagramSvg),
      ]);
      setSocialStickerUrls(urls);
    })();
  }, []);

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
        {/* Vault Selector Modal */}
        {showVaultSelector && (
          <VaultSelector
            open={showVaultSelector}
            onOpenChange={setShowVaultSelector}
            onImageSelect={handleVaultImageSelect}
            title="Select Image from Vault"
            description="Browse your vault and select an image to edit. Only completed images are shown."
          />
        )}

        {/* Image Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
          {/* Select from Vault */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Select from Vault</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                Choose an existing image from your content vault
              </p>
              <Button
                className="w-full"
                onClick={() => setShowVaultSelector(true)}
                disabled={isLoadingImage}
              >
                {isLoadingImage ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Loading...
                  </>
                ) : (
                  'Browse Vault'
                )}
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
              {selectedImage ? `Editing: ${decodeFilename(selectedImage.system_filename)}` : 'Upload an image to edit'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 z-20">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-6 relative">
              {/* Theme Segmented Control */}
              <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 rounded-full shadow px-2 py-1 border border-blue-100 mr-2">
                {THEME_MODES.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleThemeMode(opt.key)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium text-xs transition-all
                    ${themeMode === opt.key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
                    style={{ outline: themeMode === opt.key ? '2px solid #2563eb' : 'none' }}
                    title={opt.label}
                  >
                    <opt.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Editor Size Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSizeControls(!showSizeControls)}
                  className="bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-4 h-4 border-2 border-current rounded" />
                  <span className="hidden sm:inline ml-2">Size</span>
                </Button>

                {/* Size Controls Dropdown */}
                {showSizeControls && (
                  <div ref={sizeControlsRef} className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[280px] z-50">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Editor Size</h4>

                      {/* Preset Sizes */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick Presets</label>
                        <div className="grid grid-cols-2 gap-2">
                          {PRESET_SIZES.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => {
                                setEditorWidth(preset.width);
                                setEditorHeight(preset.height);
                                setShowSizeControls(false);
                              }}
                              className={`px-3 py-2 text-xs rounded border transition-all ${editorWidth === preset.width && editorHeight === preset.height
                                ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Size Inputs */}
                      <div className="space-y-3">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Custom Size (px)</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Width (px)</label>
                            <Input
                              type="number"
                              value={editorWidth.replace('px', '')}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value && !isNaN(Number(value))) {
                                  setEditorWidth(`${value}px`);
                                }
                              }}
                              placeholder="800"
                              className="text-xs h-8"
                              min="400"
                              max="2000"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Height (px)</label>
                            <Input
                              type="number"
                              value={editorHeight.replace('px', '')}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value && !isNaN(Number(value))) {
                                  setEditorHeight(`${value}px`);
                                }
                              }}
                              placeholder="600"
                              className="text-xs h-8"
                              min="300"
                              max="1500"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Enter values between 400-2000px for width and 300-1500px for height
                        </div>
                      </div>

                      {/* Current Size Display */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Current: {editorWidth} × {editorHeight}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom theme modal */}
              {showCustomModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
                  <div ref={modalRef} className="bg-white dark:bg-gray-900 border border-blue-200 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center relative animate-fade-in">
                    <button onClick={() => setShowCustomModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                    <div className="mb-3 text-base text-gray-700 dark:text-gray-200 font-semibold">Custom Color Theme</div>
                    <div className="flex gap-4 mb-3">
                      {COLOR_LABELS.map((color, idx) => (
                        <button
                          key={color.key}
                          onClick={() => handleColorToggle(color.idx)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all
                          ${color.color} ${customRGB[color.idx] ? 'border-amber-500 scale-110 shadow-lg' : 'border-gray-300 opacity-50'}`}
                          title={`Toggle ${color.label}`}
                        >
                          <Droplet className="w-6 h-6 text-white" />
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">Toggle colors to create your custom background</div>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={handleUploadToVaultClick}
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
              </div>
            ) : isLoadingImage ? (
              <div className="border rounded-lg bg-muted flex flex-col items-center justify-center" style={{ height: editorHeight }}>
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm md:text-base text-gray-500 text-center px-4">Preparing image for editing</p>
              </div>
            ) : (
              <div
                className={`border rounded-lg bg-muted relative transition-all duration-200 ${isResizing ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''
                  }`}
                style={{ width: editorWidth, height: editorHeight }}
                ref={editorContainerRef}
              >
                {/* Resize indicator */}
                {isResizing && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-10">
                    {editorWidth} × {editorHeight}
                  </div>
                )}

                {/* Resize handles - Only right, bottom, and right-bottom corner */}
                <div
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-16 cursor-ew-resize bg-gradient-to-b from-blue-400/60 to-blue-600/60 hover:from-blue-400/80 hover:to-blue-600/80 transition-all duration-200 rounded-l z-10 group"
                  onMouseDown={(e) => handleResizeStart(e, 'e')}
                  data-resize-direction="e"
                  title="Resize width"
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 cursor-ns-resize bg-gradient-to-r from-blue-400/60 to-blue-600/60 hover:from-blue-400/80 hover:to-blue-600/80 transition-all duration-200 rounded-t z-10 group"
                  onMouseDown={(e) => handleResizeStart(e, 's')}
                  data-resize-direction="s"
                  title="Resize height"
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1 w-8 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div
                  className="absolute bottom-0 right-0 w-6 h-6 cursor-nw-resize bg-gradient-to-br from-blue-500/70 to-blue-700/70 hover:from-blue-500/90 hover:to-blue-700/90 transition-all duration-200 rounded-tl z-10 group shadow-lg"
                  onMouseDown={(e) => handleResizeStart(e, 'se')}
                  data-resize-direction="se"
                  title="Resize both width and height"
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/90 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-2 border-white/60 rounded-full" />
                </div>

                <PinturaEditor
                  ref={editorRef}
                  {...editorDefaults}
                  src={imageSrc}
                  onProcess={handleEditorProcess}
                  utils={['crop', 'sticker', 'finetune', 'filter', 'annotate', 'frame', 'fill', 'redact', 'resize']}
                  stickers={[
                    ['social', [...socialStickerUrls,]],
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
                  imageBackgroundColor={theme}
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

      {/* Filename Dialog */}
      <Dialog open={showFilenameDialog} onOpenChange={setShowFilenameDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Filename</DialogTitle>
            <DialogDescription>
              You can use your own filename for this image. Please edit below if you wish.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center">
              <Input
                value={decodeFilename(filenameBase)}
                onChange={e => setFilenameBase(e.target.value)}
                placeholder="Enter filename..."
                className="w-full rounded-r-none"
              />
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-l-0 border-input rounded-r-md text-gray-600 dark:text-gray-400 text-sm font-mono select-none">
                {filenameExt}
              </span>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowFilenameDialog(false)}>Cancel</Button>
              <Button onClick={handleConfirmFilename} className="bg-blue-600 hover:bg-blue-700 text-white">Upload</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
