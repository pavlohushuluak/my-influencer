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
      console.error('Error fetching LoRA files:', error);
      toast.error('Failed to load LoRA files');
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
      
      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: file.key
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
        throw new Error('Failed to start LoRA training');
      }

      toast.success(`LoRA ${isFast ? 'fast ' : ''}training started successfully`);
      
      // Refresh files to show new training files
      await fetchLoraFiles();
    } catch (error) {
      console.error('Training error:', error);
      toast.error('Failed to start LoRA training');
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
      toast.error('Failed to restart LoRA training. Please try again.');
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

      toast.success('LoRA training restarted successfully');
      
      // Refresh files to show new training files
      await fetchLoraFiles();
    } catch (error) {
      console.error('Restart training error:', error);
      toast.error('Failed to restart LoRA training');
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
      toast.error('Failed to start fast LoRA training. Please try again.');
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

      toast.success('Fast LoRA training started successfully');
      
      // Refresh files to show new training files
      await fetchLoraFiles();
    } catch (error) {
      console.error('Fast training error:', error);
      toast.error('Failed to start fast LoRA training');
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
        onClick: () => {},
        variant: 'outline' as const
      };
    }

    if (!loraStatus) {
      return {
        text: 'Start LoRA Training',
        disabled: isStartingTraining,
        onClick: handleRestartLoraTraining,
        variant: 'default' as const
      };
    }

    if (loraStatus.status === 'lora_provisioned') {
      return {
        text: 'Restart LoRA Training',
        disabled: isStartingTraining,
        onClick: handleRestartLoraTraining,
        variant: 'default' as const
      };
    }

    // Any other status - disable training
    return {
      text: 'Training in Progress',
      disabled: true,
      onClick: () => {},
      variant: 'outline' as const
    };
  };

  const canStartFastTraining = () => {
    if (isLoadingLoraStatus) return false;
    if (!loraStatus) return true; // Can start if no status exists
    return loraStatus.status === 'lora_provisioned';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-ai-purple-500" />
          <p className="text-muted-foreground">Loading LoRA files...</p>
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
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[120px] justify-between">
                {sortBy === 'newest' && 'Newest'}
                {sortBy === 'oldest' && 'Oldest'}
                {sortBy === 'name' && 'Name'}
                {sortBy === 'size' && 'Size'}
                {sortBy === 'type' && 'Type'}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0" align="end">
              <div className="grid">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    sortBy === 'newest' ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy('oldest')}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    sortBy === 'oldest' ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  Oldest
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    sortBy === 'name' ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy('size')}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    sortBy === 'size' ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  Size
                </button>
                <button
                  onClick={() => setSortBy('type')}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    sortBy === 'type' ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  Type
                </button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Trash Folder and Training Buttons */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Trash Folder */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            isInTrash 
              ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
              : 'border-border/50 hover:border-red-300'
          }`}
          onDoubleClick={handleTrashFolderClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg transition-colors ${
                isInTrash 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <Trash2 className={`w-6 h-6 ${
                  isInTrash 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isInTrash 
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
        <div className="flex gap-3">
          <Button
            onClick={getTrainingButtonState().onClick}
            disabled={getTrainingButtonState().disabled || isCheckingGems}
            variant={getTrainingButtonState().variant}
            className={getTrainingButtonState().variant === 'default' 
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              : "border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/20"
            }
          >
            {isStartingTraining || isCheckingGems ? (
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            {isCheckingGems ? 'Checking Cost...' : getTrainingButtonState().text}
          </Button>
          
          <Button
            onClick={canStartFastTraining() ? handleStartFastLoraTraining : () => {}}
            disabled={isStartingTraining || isCheckingGems || !canStartFastTraining()}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/20"
          >
            {isStartingTraining || isCheckingGems ? (
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isCheckingGems ? 'Checking Cost...' : 'Start Fast LoRA Training'}
          </Button>
        </div>
      </div>

      {/* Back from Trash Button */}
      {isInTrash && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackFromTrash}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main Files
          </Button>
        </div>
      )}

      {/* Files Grid */}
      {sortedFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Brain className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No LoRA files found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search'
                  : isInTrash 
                    ? 'No files in trash'
                    : 'LoRA training files will appear here once training begins'
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
                        onClick={() => setUploadModal({ open: true })}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
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
                        className="flex-1"
                      >
                        {downloadingFiles.has(file.id) ? (
                          <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download
                      </Button>
                      {isInTrash ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreFromTrash(file)}
                          disabled={movingFiles.has(file.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950/20"
                        >
                          {movingFiles.has(file.id) ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCw className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveToTrash(file)}
                          disabled={movingFiles.has(file.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                        >
                          {movingFiles.has(file.id) ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
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
              Upload File to LoRA Training
            </DialogTitle>
            <DialogDescription>
              Upload a file to the LoRA training folder for {influencerName}.
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
        title="Restart LoRA Training Cost"
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
        title="Fast LoRA Training Cost"
        confirmButtonText={gemCostData ? `Confirm & Use ${gemCostData.gems} Credits` : 'Confirm'}
      />
    </div>
  );
} 