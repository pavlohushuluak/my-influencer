import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Search,
  Download,
  Trash2,
  SortAsc,
  SortDesc,
  ZoomIn,
  Folder,
  Plus,
  RefreshCcw,
  Edit,
  Brain,
  ChevronDown,
  Star,
  Share,
  MoreVertical,
  Calendar,
  FileImage,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  RotateCcw,
  Zap,
  ArrowLeft,
  RotateCw,
  Upload
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DialogContentZoom } from '@/components/ui/zoomdialog';
import { DialogZoom } from '@/components/ui/zoomdialog';
import { CreditConfirmationModal } from '@/components/CreditConfirmationModal';
import LoraVaultSelector from '@/components/LoraVaultSelector';
import config from '@/config/config';

// Interface for file data from getfilenames API
interface FileData {
  Key: string;
  Size: string;
  LastModified: string;
  ETag: string;
  StorageClass: string;
}

// Interface for folder data from getfoldernames API
interface FolderData {
  Key: string;
}

// Interface for LoRA training file
interface LoraFile {
  id: string;
  key: string;
  filename: string;
  size: string;
  lastModified: string;
  url: string;
  type: 'image' | 'model' | 'config' | 'other';
  status: 'training' | 'completed' | 'error';
}

// Interface for LoRA status from database
interface LoraStatus {
  lora_id: string;
  user_uuid: string;
  model_id: string;
  description: string;
  lastjobid: string;
  status: string;
}

// Interface for generated image data from vault
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

interface LoraManagementProps {
  influencerId: string;
  influencerName: string;
  onClose: () => void;
}

export default function LoraManagement({ influencerId, influencerName, onClose }: LoraManagementProps) {
  const userData = useSelector((state: RootState) => state.user);

  // State management
  const [files, setFiles] = useState<LoraFile[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFile, setSelectedFile] = useState<LoraFile | null>(null);
  const [showFullSizeModal, setShowFullSizeModal] = useState(false);
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [movingFiles, setMovingFiles] = useState<Set<string>>(new Set());
  const [isInTrash, setIsInTrash] = useState(false);
  const [trashFiles, setTrashFiles] = useState<LoraFile[]>([]);
  const [isStartingTraining, setIsStartingTraining] = useState(false);

  // LoRA status state
  const [loraStatus, setLoraStatus] = useState<LoraStatus | null>(null);
  const [isLoadingLoraStatus, setIsLoadingLoraStatus] = useState(true);

  // Credit checking state for LoRA training
  const [showGemWarning, setShowGemWarning] = useState(false);
  const [showRestartGemWarning, setShowRestartGemWarning] = useState(false);
  const [gemCostData, setGemCostData] = useState<{
    id: number;
    item: string;
    description: string;
    gems: number;
  } | null>(null);
  const [restartGemCostData, setRestartGemCostData] = useState<{
    id: number;
    item: string;
    description: string;
    gems: number;
  } | null>(null);
  const [isCheckingGems, setIsCheckingGems] = useState(false);

  // Upload state
  const [uploadModal, setUploadModal] = useState<{ open: boolean }>({ open: false });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOverUpload, setDragOverUpload] = useState(false);

  // Vault selector state
  const [showVaultSelector, setShowVaultSelector] = useState(false);

  // Create image state
  const [showCreateImageModal, setShowCreateImageModal] = useState(false);
  const [selectedImageForCreation, setSelectedImageForCreation] = useState<LoraFile | null>(null);
  const [isCreatingImage, setIsCreatingImage] = useState(false);

  // Fetch LoRA status from database
  const fetchLoraStatus = useCallback(async () => {
    try {
      setIsLoadingLoraStatus(true);

      const response = await fetch(`${config.supabase_server_url}/loras?user_uuid=eq.${userData.id}&model_id=eq.${influencerId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch LoRA status');
      }

      const loraData: LoraStatus[] = await response.json();

      // Set the first (and should be only) LoRA record for this model
      if (loraData && loraData.length > 0) {
        setLoraStatus(loraData[0]);
      } else {
        setLoraStatus(null);
      }
    } catch (error) {
      console.error('Error fetching LoRA status:', error);
      setLoraStatus(null);
    } finally {
      setIsLoadingLoraStatus(false);
    }
  }, [userData.id, influencerId]);

  // Fetch files from LoRA training folder
  const fetchLoraFiles = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get files from the loratraining folder
      const filesResponse = await fetch(`${config.backend_url}/getfilenames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `models/${influencerId}/loratraining`
        })
      });

      if (!filesResponse.ok) {
        throw new Error('Failed to fetch LoRA files');
      }

      const filesData: FileData[] = await filesResponse.json();

      // Transform files data to LoraFile format
      const transformedFiles: LoraFile[] = filesData
        .filter((file: FileData) => file.Key && typeof file.Key === 'string') // Filter out files with invalid keys
        .map((file: FileData) => {
          const filename = file.Key.split('/').pop() || '';
          const fileExtension = filename.split('.').pop()?.toLowerCase() || '';

          // Determine file type
          let type: LoraFile['type'] = 'other';
          if (['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)) {
            type = 'image';
          } else if (['safetensors', 'ckpt', 'pt'].includes(fileExtension)) {
            type = 'model';
          } else if (['json', 'yaml', 'yml'].includes(fileExtension)) {
            type = 'config';
          }

          // Determine status based on filename patterns
          let status: LoraFile['status'] = 'completed';
          if (filename.includes('training') || filename.includes('temp')) {
            status = 'training';
          } else if (filename.includes('error') || filename.includes('failed')) {
            status = 'error';
          }

          return {
            id: file.Key,
            key: file.Key,
            filename: filename,
            size: file.Size || '0',
            lastModified: file.LastModified || new Date().toISOString(),
            url: `${config.data_url}/${userData.id}/models/${influencerId}/loratraining/${filename}`,
            type,
            status
          };
        });

      setFiles(transformedFiles);

      // Get folders from the loratraining folder
      const foldersResponse = await fetch(`${config.backend_url}/getfoldernames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `models/${influencerId}/loratraining`
        })
      });

      if (foldersResponse.ok) {
        const foldersData: FolderData[] = await foldersResponse.json();
        setFolders(foldersData);

        console.log(foldersData);

        // If no folders exist, create Trash folder
        if (foldersData.length === 0 || foldersData[0].Key !== 'Trash') {
          await createTrashFolder();
        }
      } else {
        // If getfoldernames fails, create Trash folder
        await createTrashFolder();
      }

    } catch (error) {
      console.error('Error fetching AI consistency training files:', error);
      toast.error('Failed to load AI consistency training files');
    } finally {
      setIsLoading(false);
    }
  }, [userData.id, influencerId]);

  // Create Trash folder
  const createTrashFolder = async () => {
    try {
      const response = await fetch(`${config.backend_url}/createfolder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `models/${influencerId}/loratraining/Trash`
        })
      });

      if (response.ok) {
        // Refresh folders
        const foldersResponse = await fetch(`${config.backend_url}/getfoldernames`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            folder: `models/${influencerId}/loratraining`
          })
        });

        if (foldersResponse.ok) {
          const foldersData: FolderData[] = await foldersResponse.json();
          setFolders(foldersData);
        }
      }
    } catch (error) {
      console.error('Error creating Trash folder:', error);
    }
  };

  // Download file
  const handleDownload = async (file: LoraFile) => {
    try {
      setDownloadingFiles(prev => new Set(prev).add(file.id));

      console.log(file.key);
      const result = file.key.match(/(models\/[^\s]+)/);

      console.log(result[0]);

      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: result[0]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      toast.success('Download completed successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  // Move file to Trash
  const handleMoveToTrash = async (file: LoraFile) => {
    try {
      setMovingFiles(prev => new Set(prev).add(file.id));
      console.log(file);

      // Copy file to Trash folder
      const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `models/${influencerId}/loratraining/${file.filename}`,
          destinationfilename: `models/${influencerId}/loratraining/Trash/${file.filename}`
        })
      });

      if (!copyResponse.ok) {
        throw new Error('Failed to copy file to Trash');
      }

      // Delete file from original location
      const deleteResponse = await fetch(`${config.backend_url}/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `models/${influencerId}/loratraining/${file.filename}`
        })
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete original file');
      }

      // Remove from current list
      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success('File moved to Trash');
    } catch (error) {
      console.error('Move to trash error:', error);
      toast.error('Failed to move file to Trash');
    } finally {
      setMovingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  // Restore file from Trash
  const handleRestoreFromTrash = async (file: LoraFile) => {
    try {
      setMovingFiles(prev => new Set(prev).add(file.id));

      // Copy file back to main folder
      const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `models/${influencerId}/loratraining/Trash/${file.filename}`,
          destinationfilename: `models/${influencerId}/loratraining/${file.filename}`
        })
      });

      if (!copyResponse.ok) {
        throw new Error('Failed to restore file');
      }

      // Delete file from Trash
      const deleteResponse = await fetch(`${config.backend_url}/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `models/${influencerId}/loratraining/Trash/${file.filename}`
        })
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete file from Trash');
      }

      // Remove from trash list and add to main files
      setTrashFiles(prev => prev.filter(f => f.id !== file.id));
      const restoredFile = { ...file, key: `models/${influencerId}/loratraining/${file.filename}` };
      setFiles(prev => [...prev, restoredFile]);
      toast.success('File restored from Trash');
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore file');
    } finally {
      setMovingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  // Fetch trash files
  const fetchTrashFiles = async () => {
    try {
      const filesResponse = await fetch(`${config.backend_url}/getfilenames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `models/${influencerId}/loratraining/Trash`
        })
      });

      if (!filesResponse.ok) {
        throw new Error('Failed to fetch trash files');
      }

      const filesData: FileData[] = await filesResponse.json();

      const transformedFiles: LoraFile[] = filesData
        .filter((file: FileData) => file.Key && typeof file.Key === 'string') // Filter out files with invalid keys
        .map((file: FileData) => {
          const filename = file.Key.split('/').pop() || '';
          const fileExtension = filename.split('.').pop()?.toLowerCase() || '';

          let type: LoraFile['type'] = 'other';
          if (['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)) {
            type = 'image';
          } else if (['safetensors', 'ckpt', 'pt'].includes(fileExtension)) {
            type = 'model';
          } else if (['json', 'yaml', 'yml'].includes(fileExtension)) {
            type = 'config';
          }

          let status: LoraFile['status'] = 'completed';
          if (filename.includes('training') || filename.includes('temp')) {
            status = 'training';
          } else if (filename.includes('error') || filename.includes('failed')) {
            status = 'error';
          }

          return {
            id: file.Key,
            key: file.Key,
            filename: filename,
            size: file.Size || '0',
            lastModified: file.LastModified || new Date().toISOString(),
            url: `${config.data_url}/${userData.id}/models/${influencerId}/loratraining/Trash/${filename}`,
            type,
            status
          };
        });

      setTrashFiles(transformedFiles);
    } catch (error) {
      console.error('Error fetching trash files:', error);
      toast.error('Failed to load trash files');
    }
  };

  // Handle trash folder double click
  const handleTrashFolderClick = async () => {
    if (!isInTrash) {
      try {
        setIsInTrash(true);
        await fetchTrashFiles();
      } catch (error) {
        console.error('Error switching to trash view:', error);
        setIsInTrash(false); // Revert the state if there's an error
        toast.error('Failed to load trash folder');
      }
    }
  };

  // Handle back from trash
  const handleBackFromTrash = () => {
    setIsInTrash(false);
    setTrashFiles([]);
  };

  // Start LoRA training
  const handleStartLoraTraining = async (isFast: boolean = false) => {
    try {
      setIsStartingTraining(true);

      const response = await fetch(`${config.backend_url}/startloratraining`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          influencer_id: influencerId,
          fast_training: isFast
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start AI consistency training');
      }

      toast.success(`AI consistency ${isFast ? 'fast ' : ''}training started successfully`);

      // Refresh files to show new training files
      await fetchLoraFiles();
    } catch (error) {
      console.error('Training error:', error);
      toast.error('Failed to start AI consistency training');
    } finally {
      setIsStartingTraining(false);
    }
  };

  // View full size image
  const handleViewFullSize = (file: LoraFile) => {
    if (file.type === 'image') {
      setFullSizeImage(file.url);
      setShowFullSizeModal(true);
    }
  };

  // Filter and sort files
  const currentFiles = isInTrash ? trashFiles : files;
  const filteredFiles = currentFiles.filter(file => {
    const matchesSearch = searchTerm === '' ||
      file.filename.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'newest':
        comparison = new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        break;
      case 'oldest':
        comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        break;
      case 'name':
        comparison = a.filename.localeCompare(b.filename);
        break;
      case 'size':
        comparison = parseInt(a.size) - parseInt(b.size);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'desc' ? comparison : -comparison;
  });

  // Get file type icon
  const getFileTypeIcon = (type: LoraFile['type']) => {
    switch (type) {
      case 'image':
        return <FileImage className="w-4 h-4" />;
      case 'model':
        return <Brain className="w-4 h-4" />;
      case 'config':
        return <Edit className="w-4 h-4" />;
      default:
        return <FileImage className="w-4 h-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle file upload
  // Function to handle vault image selection and copy to LoRA training
  const handleVaultImageSelect = async (image: GeneratedImageData) => {
    try {
      setIsUploading(true);

      // Determine the source path based on user_filename
      const sourcePath = image.user_filename === "" || image.user_filename === null ? "output" : `vault/${image.user_filename}`;

      // Use copyfile API to copy the image from vault to LoRA training folder
      const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `${sourcePath}/${image.system_filename}`,
          destinationfilename: `models/${influencerId}/loratraining/${image.system_filename}`
        })
      });

      if (!copyResponse.ok) {
        throw new Error('Failed to copy image from library');
      }

      toast.success('Image copied to AI consistency training folder successfully');
      setShowVaultSelector(false);

      // Refresh the files list
      fetchLoraFiles();
    } catch (error) {
      console.error('Error copying image from library:', error);
      toast.error('Failed to copy image from library');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadFile = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!uploadFileName.trim()) {
      toast.error('Please enter a filename');
      return;
    }

    setIsUploading(true);

    try {
      // Check if file already exists
      const fileExists = files.some(file => file.filename === uploadFileName);
      if (fileExists) {
        toast.error('A file with this name already exists');
        setIsUploading(false);
        return;
      }

      // Upload file
      const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=models/${influencerId}/loratraining/${uploadFileName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: uploadedFile
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Refresh files list
      await fetchLoraFiles();

      // Reset form
      setUploadedFile(null);
      setUploadFileName('');
      setUploadModal({ open: false });

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Function to check gem cost for restart LoRA training
  const checkRestartLoraGemCost = async () => {
    try {
      setIsCheckingGems(true);
      const response = await fetch('https://api.nymia.ai/v1/getgems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          item: 'nymia_lora'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gem cost: ${response.status}`);
      }

      const gemData = await response.json();
      return gemData;
    } catch (error) {
      console.error('Error checking gem cost:', error);
      toast.error('Failed to check gem cost. Please try again.');
      return null;
    } finally {
      setIsCheckingGems(false);
    }
  };

  // Function to proceed with restart LoRA training after credit confirmation
  const proceedWithRestartLoraTraining = async () => {
    try {
      setShowRestartGemWarning(false);
      await executeRestartLoraTraining();
    } catch (error) {
      console.error('Error in proceedWithRestartLoraTraining:', error);
      toast.error('Failed to restart AI consistency training. Please try again.');
      setIsStartingTraining(false);
    }
  };

  // Separated restart LoRA training execution function
  const executeRestartLoraTraining = async () => {
    try {
      setIsStartingTraining(true);

      // Get userid from database
      const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const useridData = await useridResponse.json();

      if (!useridData || useridData.length === 0) {
        throw new Error('User not found');
      }

      // Get influencer data to get the latest image number
      const influencerResponse = await fetch(`${config.supabase_server_url}/influencer?user_id=eq.${userData.id}&id=eq.${influencerId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const influencerData = await influencerResponse.json();

      if (!influencerData || influencerData.length === 0) {
        throw new Error('Influencer not found');
      }

      // Calculate latest image number
      let latestImageNum = influencerData[0].image_num - 1;
      if (latestImageNum === -1) {
        latestImageNum = 0;
      }

      await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=restartloratraining`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          task: "restartloratraining",
          fromsingleimage: true,
          modelid: influencerId,
          inputimage: `/models/${influencerId}/profilepic/profilepic${latestImageNum}.png`
        })
      });

      toast.success('AI consistency training restarted successfully');

      // Refresh files to show new training files
      await fetchLoraFiles();
    } catch (error) {
      console.error('Restart training error:', error);
      toast.error('Failed to restart AI consistency training.');
    } finally {
      setIsStartingTraining(false);
    }
  };

  // Main restart LoRA training function with credit checking
  const handleRestartLoraTraining = async () => {
    // Check gem cost before proceeding
    const gemData = await checkRestartLoraGemCost();
    if (gemData) {
      setRestartGemCostData(gemData);

      // Check if user has enough credits
      if (userData.credits < gemData.gems) {
        setShowRestartGemWarning(true);
        return;
      } else {
        // Show confirmation for gem cost
        setShowRestartGemWarning(true);
        return;
      }
    }

    // If no gem checking needed or failed, show error and don't proceed
    toast.error('Unable to verify credit cost. Please try again.');
    return;
  };

  // Function to check gem cost for fast LoRA training
  const checkFastLoraGemCost = async () => {
    try {
      setIsCheckingGems(true);
      const response = await fetch('https://api.nymia.ai/v1/getgems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          item: 'fast_lora'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gem cost: ${response.status}`);
      }

      const gemData = await response.json();
      return gemData;
    } catch (error) {
      console.error('Error checking gem cost:', error);
      toast.error('Failed to check gem cost. Please try again.');
      return null;
    } finally {
      setIsCheckingGems(false);
    }
  };

  // Function to proceed with fast LoRA training after credit confirmation
  const proceedWithFastLoraTraining = async () => {
    try {
      setShowGemWarning(false);
      await executeFastLoraTraining();
    } catch (error) {
      console.error('Error in proceedWithFastLoraTraining:', error);
      toast.error('Failed to start fast AI consistency training. Please try again.');
      setIsStartingTraining(false);
    }
  };

  // Separated fast LoRA training execution function
  const executeFastLoraTraining = async () => {
    try {
      setIsStartingTraining(true);

      // Get userid from database
      const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const useridData = await useridResponse.json();

      if (!useridData || useridData.length === 0) {
        throw new Error('User not found');
      }

      // Get influencer data to get the latest image number
      const influencerResponse = await fetch(`${config.supabase_server_url}/influencer?user_id=eq.${userData.id}&id=eq.${influencerId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const influencerData = await influencerResponse.json();

      if (!influencerData || influencerData.length === 0) {
        throw new Error('Influencer not found');
      }

      // Calculate latest image number
      let latestImageNum = influencerData[0].image_num - 1;
      if (latestImageNum === -1) {
        latestImageNum = 0;
      }

      await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=startfastloratraining`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          task: "startfastloratraining",
          fromsingleimage: true,
          modelid: influencerId,
          inputimage: `/models/${influencerId}/profilepic/profilepic${latestImageNum}.png`
        })
      });

      toast.success('Fast AI consistency training started successfully');

      // Refresh files to show new training files
      await fetchLoraFiles();
    } catch (error) {
      console.error('Fast training error:', error);
      toast.error('Failed to start fast AI consistency training.');
    } finally {
      setIsStartingTraining(false);
    }
  };

  // Main fast LoRA training function with credit checking
  const handleStartFastLoraTraining = async () => {
    // Check gem cost before proceeding
    const gemData = await checkFastLoraGemCost();
    if (gemData) {
      setGemCostData(gemData);

      // Check if user has enough credits
      if (userData.credits < gemData.gems) {
        setShowGemWarning(true);
        return;
      } else {
        // Show confirmation for gem cost
        setShowGemWarning(true);
        return;
      }
    }

    // If no gem checking needed or failed, show error and don't proceed
    toast.error('Unable to verify credit cost. Please try again.');
    return;
  };

  useEffect(() => {
    fetchLoraStatus();
  }, [fetchLoraStatus]);

  useEffect(() => {
    fetchLoraFiles();
  }, [fetchLoraFiles]);

  // Helper functions for LoRA status
  const getLoraStatusBadge = () => {
    if (isLoadingLoraStatus) {
      return (
        <Badge variant="secondary" className="animate-pulse">
          <RefreshCcw className="w-3 h-3 mr-1 animate-spin" />
          Loading...
        </Badge>
      );
    }

    if (!loraStatus) {
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-600">
          <Clock className="w-3 h-3 mr-1" />
          Not Started
        </Badge>
      );
    }

    if (loraStatus.status === 'lora_provisioned') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ready
        </Badge>
      );
    }

    // Any other status
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        {loraStatus.status || 'Processing'}
      </Badge>
    );
  };

  const getTrainingButtonState = () => {
    if (isLoadingLoraStatus) {
      return {
        text: 'Loading...',
        disabled: true,
        onClick: () => { },
        variant: 'outline' as const
      };
    }

    if (!loraStatus) {
      return {
        text: 'Start AI consistency Training',
        disabled: isStartingTraining,
        onClick: handleRestartLoraTraining,
        variant: 'default' as const
      };
    }

    if (loraStatus.status === 'lora_provisioned') {
      return {
        text: 'Restart AI consistency Training',
        disabled: isStartingTraining,
        onClick: handleRestartLoraTraining,
        variant: 'default' as const
      };
    }

    // Any other status - disable training
    return {
      text: 'Training in Progress',
      disabled: true,
      onClick: () => { },
      variant: 'outline' as const
    };
  };

  const canStartFastTraining = () => {
    if (isLoadingLoraStatus) return false;
    if (!loraStatus) return true; // Can start if no status exists
    return loraStatus.status === 'lora_provisioned';
  };

  // Handle create image from LoRA training image
  const handleCreateImage = async (file: LoraFile) => {
    if (file.type !== 'image') {
      toast.error('Only image files can be used to create new images');
      return;
    }

    setSelectedImageForCreation(file);
    setShowCreateImageModal(true);
  };

  // Execute create image task
  const executeCreateImage = async () => {
    if (!selectedImageForCreation) return;

    try {
      setIsCreatingImage(true);

      // Get user ID from database
      const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}&select=userid`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!useridResponse.ok) {
        throw new Error('Failed to get user ID');
      }

      const useridData = await useridResponse.json();
      if (!useridData || useridData.length === 0) {
        throw new Error('User ID not found');
      }

      // Create the createloraimages task
      const createTaskResponse = await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createloraimages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          task: "createloraimages",
          fromsingleimage: false,
          modelid: influencerId,
          inputimage: `/models/${influencerId}/loratraining/${selectedImageForCreation.filename}`,
        })
      });

      if (!createTaskResponse.ok) {
        throw new Error('Failed to create image generation task');
      }

      const taskData = await createTaskResponse.json();
      console.log('Create image task created:', taskData);

      toast.success('Image generation task started successfully!');
      setShowCreateImageModal(false);
      setSelectedImageForCreation(null);

    } catch (error) {
      console.error('Error creating image:', error);
      toast.error('Failed to start image generation task');
    } finally {
      setIsCreatingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-ai-purple-500" />
          <p className="text-muted-foreground">Loading AI consistency training files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getLoraStatusBadge()}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="min-w-[140px] sm:min-w-[160px] justify-between h-10 sm:h-11 px-3 sm:px-4 text-sm font-medium border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="hidden sm:inline">
                  {sortBy === 'newest' && 'Newest First'}
                  {sortBy === 'oldest' && 'Oldest First'}
                  {sortBy === 'name' && 'Sort by Name'}
                  {sortBy === 'size' && 'Sort by Size'}
                  {sortBy === 'type' && 'Sort by Type'}
                </span>
                <span className="sm:hidden">
                {sortBy === 'newest' && 'Newest'}
                {sortBy === 'oldest' && 'Oldest'}
                {sortBy === 'name' && 'Name'}
                {sortBy === 'size' && 'Size'}
                {sortBy === 'type' && 'Type'}
                </span>
                <ChevronDown className="w-4 h-4 opacity-60 transition-transform duration-200 group-hover:opacity-100" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 border-2 shadow-xl" align="end">
              <div className="grid">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === 'newest' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500' 
                      : ''
                    }`}
                >
                  <Calendar className="w-4 h-4 mr-3 opacity-60" />
                  Newest First
                </button>
                <button
                  onClick={() => setSortBy('oldest')}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === 'oldest' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500' 
                      : ''
                    }`}
                >
                  <Calendar className="w-4 h-4 mr-3 opacity-60" />
                  Oldest First
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === 'name' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500' 
                      : ''
                    }`}
                >
                  <FileImage className="w-4 h-4 mr-3 opacity-60" />
                  Sort by Name
                </button>
                <button
                  onClick={() => setSortBy('size')}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === 'size' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500' 
                      : ''
                    }`}
                >
                  <FileImage className="w-4 h-4 mr-3 opacity-60" />
                  Sort by Size
                </button>
                <button
                  onClick={() => setSortBy('type')}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === 'type' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500' 
                      : ''
                    }`}
                >
                  <FileImage className="w-4 h-4 mr-3 opacity-60" />
                  Sort by Type
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="h-10 sm:h-11 px-3 sm:px-4 border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            {sortOrder === 'desc' ? (
              <SortDesc className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <SortAsc className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            )}
          </Button>
        </div>
      </div>

      {/* Trash Folder and Training Buttons */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Trash Folder */}
        <Card
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${isInTrash
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
            : 'border-border/50 hover:border-red-300'
            }`}
          onDoubleClick={handleTrashFolderClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg transition-colors ${isInTrash
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                <Trash2 className={`w-6 h-6 ${isInTrash
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
                  }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${isInTrash
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-foreground'
                  }`}>
                  Trash Folder
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isInTrash ? 'Currently viewing trash' : 'Double-click to view'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={getTrainingButtonState().onClick}
            disabled={getTrainingButtonState().disabled || isCheckingGems}
            variant={getTrainingButtonState().variant}
            size="lg"
            className={`relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
              getTrainingButtonState().variant === 'default'
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white border-0"
                : "border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/20 dark:hover:border-orange-500"
            } min-w-[200px] sm:min-w-[220px] h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base font-semibold`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isStartingTraining || isCheckingGems ? (
              <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />
            ) : (
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 transition-transform duration-300 group-hover:rotate-180" />
            )}
            <span className="relative z-10">
            {isCheckingGems ? 'Checking Cost...' : getTrainingButtonState().text}
            </span>
          </Button>

          <Button
            onClick={canStartFastTraining() ? handleStartFastLoraTraining : () => { }}
            disabled={isStartingTraining || isCheckingGems || !canStartFastTraining()}
            variant="outline"
            size="lg"
            className="relative overflow-hidden border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/20 dark:hover:border-orange-500 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl min-w-[200px] sm:min-w-[240px] h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base font-semibold"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isStartingTraining || isCheckingGems ? (
              <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 transition-transform duration-300 group-hover:scale-110" />
            )}
            <span className="relative z-10">
              {isCheckingGems ? 'Checking Cost...' : 'Fast Training'}
            </span>
          </Button>
        </div>
      </div>

      {/* Back from Trash Button */}
      {isInTrash && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackFromTrash}
            size="lg"
            className="relative overflow-hidden border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/0 via-gray-500/5 to-gray-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="relative z-10">Back to Main Files</span>
          </Button>
        </div>
      )}

      {/* Files Grid */}
      {sortedFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Brain className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No AI consistency training files found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search'
                  : isInTrash
                    ? 'No files in trash'
                    : 'AI consistency training files will appear here once training begins'
                }
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {/* Upload Card - Only show when not in trash */}
          {!isInTrash && (
            <Card
              className={`group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-purple-500/30 backdrop-blur-sm bg-gradient-to-br from-purple-50/20 to-pink-50/20 dark:from-purple-950/5 dark:to-pink-950/5 cursor-pointer ${dragOverUpload ? 'ring-4 ring-purple-500 ring-opacity-70 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 scale-105 shadow-lg' : ''}`}
              onClick={() => setUploadModal({ open: true })}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                setDragOverUpload(true);
              }}
              onDragLeave={() => setDragOverUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverUpload(false);
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  const file = files[0];
                  setUploadedFile(file);
                  setUploadFileName(file.name);
                  setUploadModal({ open: true });
                }
              }}
            >
              <CardContent className="p-6 h-full">
                <div className="flex flex-col justify-between h-full space-y-4">
                  {/* Upload Area */}
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                    <div className={`flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40 transition-all duration-200 ${dragOverUpload ? 'scale-105' : ''}`}>
                      <Upload className={`w-8 h-8 mb-2 transition-colors ${dragOverUpload ? 'text-purple-500 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      <p className={`text-sm font-medium transition-colors ${dragOverUpload ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {dragOverUpload ? 'Drop file here!' : 'Click to upload'}
                      </p>
                      <p className={`text-xs transition-colors ${dragOverUpload ? 'text-purple-500 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        or drag & drop
                      </p>
                    </div>
                  </div>

                  {/* Upload Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-purple-500 transition-colors">
                        Upload File
                      </h3>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileImage className="w-3 h-3" />
                        Add new content
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadModal({ open: true });
                        }}
                        className="relative overflow-hidden border-2 border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <Upload className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowVaultSelector(true);
                        }}
                        className="relative overflow-hidden border-2 border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:border-purple-500 dark:hover:bg-purple-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex-1 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <Folder className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                        <span className="relative z-10">Library</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {sortedFiles.map((file) => (
            <Card key={file.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
              <CardContent className="p-6 h-full">
                <div className="flex flex-col justify-between h-full space-y-4">
                  {/* File Preview */}
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleViewFullSize(file)}
                      />
                    ) : (
                      <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                        {getFileTypeIcon(file.type)}
                        <p className="text-sm text-muted-foreground mt-2">{file.type}</p>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors truncate">
                        {file.filename}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(file.lastModified)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileImage className="w-3 h-3" />
                        {formatFileSize(file.size)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(file)}
                        disabled={downloadingFiles.has(file.id)}
                        className="relative overflow-hidden border-2 border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:border-green-500 dark:hover:bg-green-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex-1 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {downloadingFiles.has(file.id) ? (
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        )}
                      </Button>
                      {file.type === 'image' && !isInTrash && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateImage(file)}
                          className="relative overflow-hidden border-2 border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </Button>
                      )}
                      {isInTrash ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreFromTrash(file)}
                          disabled={movingFiles.has(file.id)}
                          className="relative overflow-hidden border-2 border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:border-green-500 dark:hover:bg-green-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          {movingFiles.has(file.id) ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCw className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveToTrash(file)}
                          disabled={movingFiles.has(file.id)}
                          className="relative overflow-hidden border-2 border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          {movingFiles.has(file.id) ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Size Image Modal */}
      <Dialog open={showFullSizeModal} onOpenChange={setShowFullSizeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogZoom>
            <DialogContentZoom>
              {fullSizeImage && (
                <div className="relative w-full h-full">
                  <img
                    src={fullSizeImage}
                    alt="Full size preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </DialogContentZoom>
          </DialogZoom>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={uploadModal.open} onOpenChange={(open) => setUploadModal({ open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-500" />
              Upload File to AI consistency training
            </DialogTitle>
            <DialogDescription>
              Upload a file to the AI consistency training folder for {influencerName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">File Upload</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const file = files[0];
                    setUploadedFile(file);
                    setUploadFileName(file.name);
                  }
                }}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      {uploadedFile.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(uploadedFile)}
                          alt={uploadedFile.name}
                          className="w-full h-full object-cover rounded-md shadow-sm"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-md flex items-center justify-center">
                          <FileImage className="w-8 h-8 text-purple-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadFileName('');
                      }}
                      className="mt-2"
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to select a file or drag and drop
                    </p>
                    <Input
                      type="file"
                      accept="image/*,video/*,.safetensors,.ckpt,.pt,.json,.yaml,.yml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          setUploadFileName(file.name);
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="mt-2"
                    >
                      Select File
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Filename Input */}
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="Enter filename"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadModal({ open: false });
                  setUploadedFile(null);
                  setUploadFileName('');
                }}
                className="flex-1"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadFile}
                disabled={!uploadedFile || !uploadFileName.trim() || isUploading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload File'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restart LoRA Training Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showRestartGemWarning}
        onClose={() => setShowRestartGemWarning(false)}
        onConfirm={proceedWithRestartLoraTraining}
        gemCostData={restartGemCostData}
        userCredits={userData.credits}
        isProcessing={isStartingTraining}
        processingText="Restarting Training..."
        title="Restart AI consistency Training Cost"
        confirmButtonText={restartGemCostData ? `Confirm & Use ${restartGemCostData.gems} Credits` : 'Confirm'}
      />

      {/* Fast LoRA Training Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showGemWarning}
        onClose={() => setShowGemWarning(false)}
        onConfirm={proceedWithFastLoraTraining}
        gemCostData={gemCostData}
        userCredits={userData.credits}
        isProcessing={isStartingTraining}
        processingText="Starting Fast Training..."
        title="Fast AI consistency Training Cost"
        confirmButtonText={gemCostData ? `Confirm & Use ${gemCostData.gems} Credits` : 'Confirm'}
      />

      {/* Create Image Confirmation Modal */}
      <Dialog open={showCreateImageModal} onOpenChange={setShowCreateImageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Create Image from AI consistency training
            </DialogTitle>
            <DialogDescription>
              This will create new images using the selected training image as input. The generated images will be added to your library.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedImageForCreation && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <img
                  src={selectedImageForCreation.url}
                  alt={selectedImageForCreation.filename}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-sm">{selectedImageForCreation.filename}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedImageForCreation.size)}</p>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>• The selected image will be used as input for image generation</p>
              <p>• Generated images will be saved to your library</p>
              <p>• This process may take some time to complete</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCreateImageModal(false)}
              disabled={isCreatingImage}
              size="lg"
              className="relative overflow-hidden border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex-1 h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/0 via-gray-500/5 to-gray-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Cancel</span>
            </Button>
            <Button
              onClick={executeCreateImage}
              disabled={isCreatingImage}
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white border-0 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex-1 h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isCreatingImage ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2 sm:mr-3"></div>
                  <span className="relative z-10">Creating...</span>
                </>
              ) : (
                <span className="relative z-10">Create Images</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lora Vault Selector Modal */}
      {showVaultSelector && (
        <LoraVaultSelector
          open={showVaultSelector}
          onOpenChange={setShowVaultSelector}
          onImageUpload={handleVaultImageSelect}
          title="Select Image from Library"
          description="Browse your library and select an image to copy to AI consistency training folder. Only completed images are shown."
        />
      )}
    </div>
  );
} 