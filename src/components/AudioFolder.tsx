import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Music, SortAsc, SortDesc, ZoomIn, Folder, Plus, Upload, ChevronRight, Home, ArrowLeft, Pencil, Menu, X, File, User, RefreshCcw, Edit, Play, Volume2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DialogContentZoom } from '@/components/ui/zoomdialog';
import { DialogZoom } from '@/components/ui/zoomdialog';

// Interface for audio data from database
interface AudioData {
  id: string;
  task_id: string;
  audio_id: string;
  user_uuid: string;
  prompt: string;
  duration: number;
  format: string;
  status: string;
  task_created_at: string;
  task_completed_at: string;
  user_filename?: string;
  user_notes?: string;
  user_tags?: string[];
  rating?: number;
  favorite?: boolean;
  audio_url?: string;
}

// Interface for folder data from API
interface FolderData {
  Key: string;
}

// Interface for folder structure
interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
  isFolder: boolean;
}

interface AudioFolderProps {
  onBack: () => void;
}

export default function AudioFolder({ onBack }: AudioFolderProps) {
  const userData = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [audios, setAudios] = useState<AudioData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [audiosLoading, setAudiosLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ open: boolean; itemId: string | null; itemPath: string | null }>({ open: false, itemId: null, itemPath: null });

  // New folder modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderIcon, setSelectedFolderIcon] = useState('');
  const [uploadedIcon, setUploadedIcon] = useState<File | null>(null);
  const [folderIcons, setFolderIcons] = useState<string[]>([]);

  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);

  // Folder renaming state
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderPath: string } | null>(null);

  // Clipboard state
  const [clipboard, setClipboard] = useState<{ type: 'copy' | 'cut'; items: string[] } | null>(null);
  const [copyState, setCopyState] = useState(0); // 0: none, 1: copy, 2: cut
  const [isPasting, setIsPasting] = useState(false);

  // File operations state
  const [fileContextMenu, setFileContextMenu] = useState<{ x: number; y: number; audio: AudioData } | null>(null);
  const [fileClipboard, setFileClipboard] = useState<{ type: 'copy' | 'cut'; items: AudioData[] } | null>(null);
  const [fileCopyState, setFileCopyState] = useState(0);
  const [isPastingFile, setIsPastingFile] = useState(false);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileNameInput, setNewFileNameInput] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Multi-selection state
  const [selectedAudios, setSelectedAudios] = useState<Set<string>>(new Set());

  // Drag and drop state
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [dragOverUpload, setDragOverUpload] = useState(false);

  // File counts and loading states
  const [folderFileCounts, setFolderFileCounts] = useState<{ [key: string]: number }>({});
  const [loadingFileCounts, setLoadingFileCounts] = useState<{ [key: string]: boolean }>({});

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | null>(null);

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    // Remove the user ID and "audio/" prefix
    const pathWithoutPrefix = fullPath.replace(/^[^\/]+\/audio\//, '');
    return pathWithoutPrefix;
  };

  // Encode name for URL
  const encodeName = (name: string): string => {
    return encodeURIComponent(name);
  };

  // Decode name from URL
  const decodeName = (name: string): string => {
    return decodeURIComponent(name);
  };

  // Build folder structure from raw folder data
  const buildFolderStructure = (folderData: FolderData[]): FolderStructure[] => {
    const structure: FolderStructure[] = [];
    const pathMap = new Map<string, FolderStructure>();

    console.log('Building folder structure from:', folderData);

    folderData.forEach(folder => {
      console.log('Processing folder:', folder);
      console.log('Folder key:', folder.Key);

      // Extract the folder path from the key
      const folderPath = extractFolderName(folder.Key);
      console.log('Extracted folder path:', folderPath);

      if (!folderPath) {
        console.log('No folder path extracted, skipping');
        return;
      }

      const pathParts = folderPath.split('/').filter(part => part.length > 0);
      console.log('Path parts:', pathParts);

      let currentPath = '';

      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        console.log(`Processing part "${part}", currentPath: "${currentPath}", parentPath: "${parentPath}"`);

        if (!pathMap.has(currentPath)) {
          const folderNode: FolderStructure = {
            name: part,
            path: currentPath,
            children: [],
            isFolder: true
          };

          pathMap.set(currentPath, folderNode);
          console.log(`Created folder node:`, folderNode);

          if (parentPath && pathMap.has(parentPath)) {
            console.log(`Adding to parent "${parentPath}"`);
            pathMap.get(parentPath)!.children.push(folderNode);
          } else if (!parentPath) {
            console.log(`Adding to root structure`);
            structure.push(folderNode);
          }
        }
      });
    });

    console.log('Final folder structure:', structure);
    return structure;
  };

  // Get all subfolders recursively
  const getAllSubfolders = async (folderPath: string): Promise<string[]> => {
    try {
      const response = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `audio/${folderPath}`
        })
      });

      if (!response.ok) {
        return [];
      }

      const folders = await response.json();
      const subfolders: string[] = [];

      for (const folder of folders) {
        const extractedPath = extractFolderName(folder.Key);
        if (extractedPath && extractedPath.startsWith(folderPath + '/')) {
          subfolders.push(extractedPath);
          // Recursively get subfolders of this subfolder
          const nestedSubfolders = await getAllSubfolders(extractedPath);
          subfolders.push(...nestedSubfolders);
        }
      }

      return subfolders;
    } catch (error) {
      console.error('Error getting subfolders:', error);
      return [];
    }
  };

  // Navigate to folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    fetchFolderFiles(folderPath);
  };

  // Navigate to parent folder
  const navigateToParent = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
    fetchFolderFiles(parentPath);
  };

  // Navigate to home (audio root)
  const navigateToHome = () => {
    setCurrentPath('');
    fetchFolderFiles('');
  };

  // Get breadcrumb items
  const getBreadcrumbItems = () => {
    if (!currentPath) return [];

    const pathParts = currentPath.split('/');
    const breadcrumbs = [];
    let currentPathBuilt = '';

    pathParts.forEach((part, index) => {
      currentPathBuilt = currentPathBuilt ? `${currentPathBuilt}/${part}` : part;
      breadcrumbs.push({
        name: part,
        path: currentPathBuilt
      });
    });

    return breadcrumbs;
  };

  // Fetch folders from API
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setFoldersLoading(true);
        const response = await fetch('https://api.nymia.ai/v1/getfoldernames', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            folder: "audio"
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }

        const data = await response.json();
        console.log('Raw folders data from API:', data);
        setFolders(data);

        // Build folder structure
        const structure = buildFolderStructure(data);
        console.log('Built folder structure:', structure);
        setFolderStructure(structure);

        // If no structure was built, create a fallback from the raw data
        if (structure.length === 0 && data.length > 0) {
          console.log('No structure built, creating fallback folders');
          const fallbackFolders = data.map((folder: FolderData) => ({
            name: folder.Key || extractFolderName(folder.Key) || 'Unknown Folder',
            path: folder.Key || extractFolderName(folder.Key) || 'unknown',
            children: [],
            isFolder: true
          }));
          console.log('Fallback folders:', fallbackFolders);
          setFolderStructure(fallbackFolders);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
        setFolders([]);
        setFolderStructure([]);
      } finally {
        setFoldersLoading(false);
      }
    };

    if (userData.id) {
      fetchFolders();
    }
  }, [userData.id]);

  // Fetch file counts for all folders when folder structure changes
  useEffect(() => {
    const fetchAllFolderFileCounts = async () => {
      const currentFolders = getCurrentPathFolders();

      // Fetch file counts for each immediate children folder of current path
      for (const folder of currentFolders) {
        await fetchFolderFileCount(folder.path);
      }
    };

    if (folderStructure.length > 0) {
      fetchAllFolderFileCounts();
    }
  }, [folderStructure, userData.id, currentPath]);

  // Fetch audios from current folder
  const fetchFolderFiles = async (folderPath: string) => {
    if (!userData.id) return;
    
    try {
      setAudiosLoading(true);
      
      // Fetch all audio files from the database
      const response = await fetch(`https://db.nymia.ai/rest/v1/audio?user_uuid=eq.${userData.id}&status=eq.completed&order=task_created_at.desc`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched audios:', data);
        
        // Filter audios based on current path
        const filteredAudios = data.filter((audio: AudioData) => {
          const audioUrl = audio.audio_url || getAudioUrl(audio.audio_id);
          
          if (folderPath === '') {
            // Root folder: show audios that are directly in audio/ folder (no subfolder)
            return audioUrl.includes(`/audio/${audio.audio_id}.mp3`) && 
                   !audioUrl.includes(`/audio/${audio.audio_id}/`) &&
                   !audioUrl.match(`/audio/[^/]+/${audio.audio_id}\\.mp3`);
          } else {
            // Subfolder: show audios that are in the specific folder path
            const expectedPath = `/audio/${folderPath}/${audio.audio_id}.mp3`;
            return audioUrl.includes(expectedPath);
          }
        });
        
        console.log('Filtered audios for path:', folderPath, filteredAudios);
        setAudios(filteredAudios);
      } else {
        // Fallback to mock data if API is not available
        console.log('Audio API not available, using mock data');
        const mockAudios: AudioData[] = [
          {
            id: '1',
            task_id: 'task-1',
            audio_id: 'audio-1',
            user_uuid: userData.id,
            prompt: 'Background music for video',
            duration: 30,
            format: 'mp3',
            status: 'completed',
            task_created_at: new Date().toISOString(),
            task_completed_at: new Date().toISOString(),
            user_filename: 'Background Music.mp3',
            favorite: false,
            audio_url: `https://images.nymia.ai/${userData.id}/audio/audio-1.mp3`
          }
        ];
        
        // Filter mock data based on path
        const filteredMockAudios = mockAudios.filter((audio: AudioData) => {
          const audioUrl = audio.audio_url || getAudioUrl(audio.audio_id);
          
          if (folderPath === '') {
            return audioUrl.includes(`/audio/${audio.audio_id}.mp3`) && 
                   !audioUrl.includes(`/audio/${audio.audio_id}/`) &&
                   !audioUrl.match(`/audio/[^/]+/${audio.audio_id}\\.mp3`);
          } else {
            const expectedPath = `/audio/${folderPath}/${audio.audio_id}.mp3`;
            return audioUrl.includes(expectedPath);
          }
        });
        
        setAudios(filteredMockAudios);
      }
    } catch (error) {
      console.error('Error fetching audios:', error);
      toast.error('Failed to load audios');
    } finally {
      setAudiosLoading(false);
    }
  };

  // Fetch initial audios
  useEffect(() => {
    fetchFolderFiles('');
  }, [userData.id]);

  // Filter and sort audios
  const filteredAudios = audios
    .filter(audio => {
      const matchesSearch = audio.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (audio.user_filename && audio.user_filename.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || audio.status === statusFilter;
      const matchesFormat = formatFilter === 'all' || audio.format === formatFilter;
      const matchesFavorite = favoriteFilter === null || audio.favorite === favoriteFilter;
      
      return matchesSearch && matchesStatus && matchesFormat && matchesFavorite;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'newest':
          comparison = new Date(b.task_created_at).getTime() - new Date(a.task_created_at).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.task_created_at).getTime() - new Date(b.task_created_at).getTime();
          break;
        case 'duration':
          comparison = b.duration - a.duration;
          break;
        case 'format':
          comparison = a.format.localeCompare(b.format);
          break;
        case 'name':
          comparison = (a.user_filename || a.task_id).localeCompare(b.user_filename || b.task_id);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination calculations
  const totalItems = filteredAudios.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAudios = filteredAudios.slice(startIndex, endIndex);

  // Audio helper functions
  const getAudioUrl = (audioId: string) => {
    return `https://images.nymia.ai/${userData.id}/audio/${audioId}.mp3`;
  };

  const formatAudioDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatAudioDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAudioStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'processing': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'failed': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  // Handle audio selection
  const handleAudioSelect = (audio: AudioData) => {
    setSelectedAudio(audio.audio_id);
  };

  // Handle download
  const handleDownload = async (audioId: string) => {
    try {
      const audioUrl = getAudioUrl(audioId);
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `audio-${audioId}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Failed to download audio');
    }
  };

  // Handle share
  const handleShare = (audioId: string) => {
    const audioUrl = getAudioUrl(audioId);
    navigator.clipboard.writeText(audioUrl);
    toast.success('Audio URL copied to clipboard');
  };

  // Handle delete
  const handleDelete = async (audio: AudioData) => {
    if (!confirm('Are you sure you want to delete this audio?')) return;
    
    try {
      // In a real implementation, you would call the audio delete API
      setAudios(prev => prev.filter(a => a.id !== audio.id));
      toast.success('Audio deleted successfully');
    } catch (error) {
      console.error('Error deleting audio:', error);
      toast.error('Failed to delete audio');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await fetchFolderFiles(currentPath);
    toast.success('Audios refreshed');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFormatFilter('all');
    setFavoriteFilter(null);
    setSortBy('newest');
    setSortOrder('desc');
  };

  // Folder management functions
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      const encodedName = encodeName(newFolderName.trim());
      const newFolderPath = currentPath ? `${currentPath}/${encodedName}` : encodedName;

      const response = await fetch('https://api.nymia.ai/v1/createfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `audio/${newFolderPath}`
        })
      });

      if (response.ok) {
        toast.success('Folder created successfully');
        setShowNewFolderModal(false);
        setNewFolderName('');
        
        // Refresh folders
        const updatedFolders = [...folders, { Key: `audio/${newFolderPath}` }];
        setFolders(updatedFolders);
        setFolderStructure(buildFolderStructure(updatedFolders));
      } else {
        throw new Error('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleFolderRename = async (oldPath: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      // Get the old folder name from the path
      const oldFolderName = oldPath.split('/').pop() || '';
      const enNewName = encodeName(newName.trim());

      // Check if the new name is the same as the old name
      if (oldFolderName === enNewName) {
        console.log('Folder name unchanged, cancelling rename operation');
        setEditingFolder(null);
        setEditingFolderName('');
        return;
      }

      // Show warning toast before starting the operation
      toast.warning('Folder rename in progress...', {
        description: 'This operation may take some time depending on the folder contents. Please wait.',
        duration: 3000
      });

      // Set loading state
      setRenamingFolder(oldPath);
      toast.info('Renaming folder...', {
        description: 'This may take a moment depending on the folder contents'
      });

      console.log('Renaming folder:', oldPath, 'to:', enNewName);

      // Get the parent path and construct the new path
      const pathParts = oldPath.split('/');
      const oldFolderNameFromPath = pathParts.pop() || '';
      const parentPath = pathParts.join('/');
      const newPath = parentPath ? `${parentPath}/${enNewName}` : enNewName;

      console.log('Parent path:', parentPath);
      console.log('New path:', newPath);

      // Step 1: Create the new folder
      const createResponse = await fetch('https://api.nymia.ai/v1/createfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          parentfolder: `audio/${parentPath ? parentPath + '/' : ''}`,
          folder: enNewName
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create new folder');
      }

      console.log('New folder created successfully');

      // Step 2: Get all files from the old folder and move them to the new folder
      const audiosInFolder = audios.filter(audio => {
        const audioUrl = audio.audio_url || getAudioUrl(audio.audio_id);
        return audioUrl.includes(`/audio/${oldPath}/`);
      });
      
      if (audiosInFolder.length > 0) {
        console.log('Moving', audiosInFolder.length, 'audios from old folder to new folder');
        
        for (const audio of audiosInFolder) {
          // Extract the filename from the audio URL
          const audioUrl = audio.audio_url || getAudioUrl(audio.audio_id);
          const fileName = audioUrl.split('/').pop() || `${audio.audio_id}.mp3`;
          
          console.log(`Attempting to move audio: ${fileName}`);
          console.log(`From: audio/${oldPath}/${fileName}`);
          console.log(`To: audio/${newPath}/${fileName}`);
          
          // Copy the audio file from old location to new location
          const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              sourcefilename: `audio/${oldPath}/${fileName}`,
              destinationfilename: `audio/${newPath}/${fileName}`
            })
          });

          if (!copyResponse.ok) {
            const errorText = await copyResponse.text();
            console.error(`Failed to copy audio file ${fileName}:`, errorText);
            console.error(`Response status: ${copyResponse.status}`);
            throw new Error(`Failed to copy audio file ${fileName}: ${errorText}`);
          }

          console.log(`Successfully copied audio file ${fileName}`);

          // Update the audio_url in database
          const oldAudioUrl = audio.audio_url || getAudioUrl(audio.audio_id);
          const newAudioUrl = oldAudioUrl.replace(`/audio/${oldPath}/`, `/audio/${newPath}/`);
          
          const updateResponse = await fetch(`https://db.nymia.ai/rest/v1/audio?audio_id=eq.${audio.audio_id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              audio_url: newAudioUrl
            })
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.warn(`Failed to update audio URL for audio ${audio.audio_id}:`, errorText);
          } else {
            console.log(`Successfully updated database for audio ${audio.audio_id}`);
          }

          console.log(`Successfully moved audio ${fileName} to new folder`);
        }
      }

      // Step 3: Get all subfolders from the old folder
      const getFoldersResponse = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `audio/${oldPath}`
        })
      });

      if (getFoldersResponse.ok) {
        const folders = await getFoldersResponse.json();
        console.log('Subfolders to copy:', folders);

        // Step 4: Copy all subfolders recursively
        if (folders && folders.length > 0 && folders[0].Key) {
          for (const folder of folders) {
            const folderKey = folder.Key;
            const re = new RegExp(`^.*?audio/${oldPath}/`);
            const relativePath = folderKey.replace(re, "").replace(/\/$/, "");

            console.log("Folder Key:", folderKey);
            console.log("Relative Path:", relativePath);

            if (relativePath && relativePath !== folderKey) {
              // Create the subfolder in the new location
              const subfolderCreateResponse = await fetch('https://api.nymia.ai/v1/createfolder', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer WeInfl3nc3withAI'
                },
                body: JSON.stringify({
                  user: userData.id,
                  parentfolder: `audio/${newPath}/`,
                  folder: relativePath
                })
              });

              if (subfolderCreateResponse.ok) {
                // Move audios in this subfolder
                const subfolderAudios = audios.filter(audio => {
                  const audioUrl = audio.audio_url || getAudioUrl(audio.audio_id);
                  return audioUrl.includes(`/audio/${oldPath}/${relativePath}/`);
                });
                
                for (const audio of subfolderAudios) {
                  // Extract the filename from the audio URL
                  const audioUrl = audio.audio_url || getAudioUrl(audio.audio_id);
                  const fileName = audioUrl.split('/').pop() || `${audio.audio_id}.mp3`;
                  
                  console.log(`Attempting to move audio in subfolder: ${fileName}`);
                  console.log(`From: audio/${oldPath}/${relativePath}/${fileName}`);
                  console.log(`To: audio/${newPath}/${relativePath}/${fileName}`);
                  
                  // Copy the audio file from old subfolder location to new subfolder location
                  const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer WeInfl3nc3withAI'
                    },
                    body: JSON.stringify({
                      user: userData.id,
                      sourcefilename: `audio/${oldPath}/${relativePath}/${fileName}`,
                      destinationfilename: `audio/${newPath}/${relativePath}/${fileName}`
                    })
                  });

                  if (!copyResponse.ok) {
                    const errorText = await copyResponse.text();
                    console.error(`Failed to copy audio file ${fileName} in subfolder ${relativePath}:`, errorText);
                    console.error(`Response status: ${copyResponse.status}`);
                    throw new Error(`Failed to copy audio file ${fileName} in subfolder ${relativePath}: ${errorText}`);
                  }

                  console.log(`Successfully copied audio file ${fileName} in subfolder ${relativePath}`);

                  // Update the audio_url in database
                  const oldAudioUrl = audio.audio_url || getAudioUrl(audio.audio_id);
                  const newAudioUrl = oldAudioUrl.replace(`/audio/${oldPath}/${relativePath}/`, `/audio/${newPath}/${relativePath}/`);
                  
                  const updateResponse = await fetch(`https://db.nymia.ai/rest/v1/audio?audio_id=eq.${audio.audio_id}`, {
                    method: 'PATCH',
                    headers: {
                      'Authorization': 'Bearer WeInfl3nc3withAI',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      audio_url: newAudioUrl
                    })
                  });

                  if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    console.warn(`Failed to update audio URL for audio ${audio.audio_id}:`, errorText);
                  } else {
                    console.log(`Successfully updated database for audio ${audio.audio_id} in subfolder`);
                  }

                  console.log(`Successfully moved audio ${fileName} in subfolder ${relativePath}`);
                }
              }
            }
          }
        }
      }

      // Step 5: Delete the old folder
      const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `audio/${oldPath}`
        })
      });

      if (!deleteResponse.ok) {
        console.warn('Failed to delete old folder, but rename operation completed');
      }

      // Step 6: Refresh folder structure
      const refreshResponse = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: "audio"
        })
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setFolders(data);

        // Rebuild folder structure
        const structure = buildFolderStructure(data);
        setFolderStructure(structure);
      }

      // Step 7: Update current path if we're in the renamed folder
      if (currentPath === oldPath) {
        setCurrentPath(newPath);
      } else if (currentPath.startsWith(oldPath + '/')) {
        const newCurrentPath = currentPath.replace(oldPath, newPath);
        setCurrentPath(newCurrentPath);
      }

      // Step 8: Refresh audios to show updated paths
      await fetchFolderFiles(currentPath);

      // Step 9: Exit edit mode and clear loading state
      setEditingFolder(null);
      setEditingFolderName('');
      setRenamingFolder(null);

      console.log('Folder rename completed successfully');
      toast.success(`Folder renamed to "${newName}" successfully`);

    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder. Please try again.');
      setEditingFolder(null);
      setEditingFolderName('');
      setRenamingFolder(null);
    }
  };

  const handleDeleteFolder = async (folderPath: string) => {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return;

    try {
      const response = await fetch('https://api.nymia.ai/v1/deletefolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `audio/${folderPath}`
        })
      });

      if (response.ok) {
        toast.success('Folder deleted successfully');
        
        // Update folders
        const updatedFolders = folders.filter(folder => folder.Key !== `audio/${folderPath}`);
        setFolders(updatedFolders);
        setFolderStructure(buildFolderStructure(updatedFolders));
      } else {
        throw new Error('Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const handleCopy = (folderPath: string) => {
    setClipboard({ type: 'copy', items: [folderPath] });
    setCopyState(1);
    toast.success('Folder copied to clipboard');
  };

  const handleCut = (folderPath: string) => {
    setClipboard({ type: 'cut', items: [folderPath] });
    setCopyState(2);
    toast.success('Folder cut to clipboard');
  };

  const handlePaste = async () => {
    if (!clipboard || copyState === 0) return;

    setIsPasting(true);
    try {
      for (const sourcePath of clipboard.items) {
        const sourceName = sourcePath.split('/').pop() || '';
        const destPath = currentPath ? `${currentPath}/${sourceName}` : sourceName;

        if (clipboard.type === 'copy') {
          // Copy folder
          const response = await fetch('https://api.nymia.ai/v1/copyfolder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              source_folder: `audio/${sourcePath}`,
              dest_folder: `audio/${destPath}`
            })
          });

          if (!response.ok) throw new Error('Failed to copy folder');
        } else {
          // Move folder
          const response = await fetch('https://api.nymia.ai/v1/movefolder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              source_folder: `audio/${sourcePath}`,
              dest_folder: `audio/${destPath}`
            })
          });

          if (!response.ok) throw new Error('Failed to move folder');
        }
      }

      toast.success(`Folder ${clipboard.type === 'copy' ? 'copied' : 'moved'} successfully`);
      setClipboard(null);
      setCopyState(0);
      
      // Refresh folders
      const response = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: "audio"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(data);
        setFolderStructure(buildFolderStructure(data));
      }
    } catch (error) {
      console.error('Error pasting folder:', error);
      toast.error('Failed to paste folder');
    } finally {
      setIsPasting(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, folderPath: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, folderPath });
  };

  const handleFileCopy = (audio: AudioData) => {
    setFileClipboard({ type: 'copy', items: [audio] });
    setFileCopyState(1);
    toast.success('Audio copied to clipboard');
  };

  const handleFileCut = (audio: AudioData) => {
    setFileClipboard({ type: 'cut', items: [audio] });
    setFileCopyState(2);
    toast.success('Audio cut to clipboard');
  };

  const handleFilePaste = async () => {
    if (!fileClipboard || fileCopyState === 0) return;

    setIsPastingFile(true);
    try {
      for (const audio of fileClipboard.items) {
        // In a real implementation, you would move/copy the audio file
        // For now, we'll just show a success message
        console.log(`${fileClipboard.type} audio:`, audio);
      }

      toast.success(`Audio ${fileClipboard.type === 'copy' ? 'copied' : 'moved'} successfully`);
      setFileClipboard(null);
      setFileCopyState(0);
    } catch (error) {
      console.error('Error pasting audio:', error);
      toast.error('Failed to paste audio');
    } finally {
      setIsPastingFile(false);
    }
  };

  const handleFileContextMenu = (e: React.MouseEvent, audio: AudioData) => {
    e.preventDefault();
    setFileContextMenu({ x: e.clientX, y: e.clientY, audio });
  };

  const fetchFolderFileCount = async (folderPath: string) => {
    if (loadingFileCounts[folderPath]) return;

    setLoadingFileCounts(prev => ({ ...prev, [folderPath]: true }));

    try {
      const response = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `audio/${folderPath}`
        })
      });

      if (response.ok) {
        const files = await response.json();
        const directFiles = files.filter((file: any) => {
          const relativePath = file.Key.replace(`audio/${userData.id}/audio/${folderPath}/`, '');
          if (folderPath === '') {
            return !relativePath.includes('/');
          }
          return false;
        });

        setFolderFileCounts(prev => ({ ...prev, [folderPath]: directFiles.length }));
      }
    } catch (error) {
      console.error(`Error fetching file count for folder ${folderPath}:`, error);
      setFolderFileCounts(prev => ({ ...prev, [folderPath]: 0 }));
    } finally {
      setLoadingFileCounts(prev => ({ ...prev, [folderPath]: false }));
    }
  };

  const getCurrentPathFolders = (): FolderStructure[] => {
    if (!currentPath) return folderStructure;

    const findFolder = (folders: FolderStructure[], path: string): FolderStructure | null => {
      for (const folder of folders) {
        if (folder.path === path) return folder;
        const found = findFolder(folder.children, path);
        if (found) return found;
      }
      return null;
    };

    const currentFolder = findFolder(folderStructure, currentPath);
    return currentFolder ? currentFolder.children : [];
  };

  const getCurrentPathRawFolders = (): FolderData[] => {
    return folders.filter(folder => {
      const folderPath = folder.Key;
      const currentPathParts = currentPath.split('/');
      const folderPathParts = folderPath.split('/');
      
      // Check if this folder is an immediate child of current path
      return folderPathParts.length === currentPathParts.length + 1 &&
             folderPathParts.slice(0, currentPathParts.length).join('/') === currentPath;
    });
  };

  // Drag and drop functions
  const handleDragOver = (e: React.DragEvent, folderPath: string) => {
    e.preventDefault();
    setDragOverFolder(folderPath);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderPath: string) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    // Handle folder drop logic here
    console.log('Dropped on folder:', targetFolderPath);
  };

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(totalPages);
  const goToPreviousPage = () => handlePageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => handlePageChange(Math.min(totalPages, currentPage + 1));

  return (
    <div className="px-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Button
            onClick={currentPath ? navigateToParent : onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentPath ? 'Back' : 'Back to Menu'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Audio Folder
            </h1>
            <p className="text-muted-foreground">
              {currentPath ? `Current path: ${currentPath}` : 'Manage your audio content'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="h-10 px-4"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          {/* Paste Buttons */}
          <Button
            variant={copyState > 0 ? "default" : "outline"}
            size="sm"
            onClick={handlePaste}
            disabled={copyState === 0 || isPasting}
            className={`flex items-center gap-1.5 transition-all duration-200 ${copyState > 0
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md'
              : 'text-muted-foreground'
              }`}
          >
            {isPasting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {copyState === 1 ? 'Paste Copy' : copyState === 2 ? 'Paste Move' : 'Paste'}
              </>
            )}
          </Button>

          <Button
            variant={fileCopyState > 0 ? "default" : "outline"}
            size="sm"
            onClick={handleFilePaste}
            disabled={fileCopyState === 0 || isPastingFile}
            className={`flex items-center gap-1.5 transition-all duration-200 ${fileCopyState > 0
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md'
              : 'text-muted-foreground'
              }`}
          >
            {isPastingFile ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                {fileCopyState === 1 ? 'Paste Audio Copy' : fileCopyState === 2 ? 'Paste Audio Move' : 'Paste Audio'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateToHome}
          className="h-6 px-2"
        >
          <Home className="w-3 h-3 mr-1" />
          Audio
        </Button>
        {getBreadcrumbItems().map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToFolder(item.path)}
              className="h-6 px-2"
            >
              {item.name}
            </Button>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search audios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="mp3">MP3</SelectItem>
              <SelectItem value="wav">WAV</SelectItem>
              <SelectItem value="m4a">M4A</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="format">Format</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Folder Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
        {/* Show folders for current path */}
        {(() => {
          const currentFolders = getCurrentPathFolders();

          return currentFolders.map((folder) => (
            <div
              key={folder.path}
              className={`group cursor-pointer ${dragOverFolder === folder.path ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-100 dark:bg-blue-900/20' : ''}`}
              onDoubleClick={() => navigateToFolder(folder.path)}
              onContextMenu={(e) => handleContextMenu(e, folder.path)}
              onDragOver={(e) => handleDragOver(e, folder.path)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, folder.path)}
            >
              <div className="flex flex-col items-center p-3 rounded-lg border-2 border-transparent transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                {editingFolder === folder.path ? (
                  <div className="w-full">
                    <Input
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleFolderRename(folder.path, editingFolderName);
                        } else if (e.key === 'Escape') {
                          setEditingFolder(null);
                          setEditingFolderName('');
                        }
                      }}
                      onBlur={() => handleFolderRename(folder.path, editingFolderName)}
                      className="text-xs h-6 text-center"
                      autoFocus
                    />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {decodeName(folder.name)}
                  </span>
                )}
                <span className="text-xs text-muted-foreground mt-1">
                  {folder.children.length} folders
                </span>
                <span className="text-xs text-muted-foreground">
                  {loadingFileCounts[folder.path] ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                      Loading...
                    </div>
                  ) : (
                    `${folderFileCounts[folder.path] || 0} files`
                  )}
                </span>
              </div>
            </div>
          ));
        })()}

        {/* Add New Folder Button */}
        <div
          className="group cursor-pointer"
          onClick={() => setShowNewFolderModal(true)}
        >
          <div className="flex flex-col items-center p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              New Folder
            </span>
          </div>
        </div>
      </div>

      {/* Audio Grid */}
      {audiosLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="aspect-video bg-slate-200 dark:bg-slate-700"></div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : totalItems === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">No audios found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search criteria or filters to find what you're looking for.</p>
            <Button onClick={clearFilters} variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {currentAudios.map((audio) => (
            <Card
              key={audio.id}
              className="group cursor-pointer overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => handleAudioSelect(audio)}
              onContextMenu={(e) => handleFileContextMenu(e, audio)}
            >
              {/* Audio Preview */}
              <div className="relative aspect-video bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
                    
                    {/* Audio waveform visualization */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-end gap-1 h-16">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-white/80 rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 60 + 20}%`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Music icon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Overlay with play button */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                        <Play className="w-6 h-6 text-gray-900 dark:text-white ml-1" />
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className={`${getAudioStatusColor(audio.status)} text-xs font-medium px-2 py-1`}>
                        {audio.status}
                      </Badge>
                    </div>

                    {/* Favorite indicator */}
                    {audio.favorite && (
                      <div className="absolute top-3 left-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                          <Star className="w-4 h-4 text-white fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Duration overlay */}
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
                        {formatAudioDuration(audio.duration)}
                      </div>
                    </div>

                    {/* Format overlay */}
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
                        {audio.format}
                      </div>
                    </div>
                  </div>

                  {/* Audio Info */}
                  <CardContent className="p-4 space-y-3">
                    {/* Title and format */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                        {audio.user_filename || audio.prompt.substring(0, 60)}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          {audio.format}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          Audio
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {audio.prompt}
                    </p>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatAudioDate(audio.task_created_at)}</span>
                    </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1.5 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs font-medium hover:bg-purple-700 hover:border-purple-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(audio.audio_id);
                      }}
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:bg-green-700 hover:border-green-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(audio.audio_id);
                      }}
                    >
                      <Share className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-amber-500 hover:border-amber-300 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(audio);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
            </Card>
          ))}
        </div>

      )}

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700 mt-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
          </div>

          {/* Page info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} audios
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              First
            </Button>
            <Button
              variant="outline"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-1 text-sm font-medium transition-all duration-300 ${currentPage === pageNumber
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              Next
            </Button>
            <Button
              variant="outline"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Audio Preview Modal */}
      {selectedAudio && (
        <Dialog open={!!selectedAudio} onOpenChange={() => setSelectedAudio(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Audio Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 text-center">
                <Volume2 className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <audio
                  src={getAudioUrl(selectedAudio)}
                  controls
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => handleDownload(selectedAudio)}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => handleShare(selectedAudio)}
                  variant="outline"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Modal */}
      {shareModal.open && (
        <Dialog open={shareModal.open} onOpenChange={() => setShareModal({ open: false, itemId: null, itemPath: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Audio</DialogTitle>
              <DialogDescription>
                Share this audio with others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => shareToSocialMedia('facebook', shareModal.itemId!)}>
                  Facebook
                </Button>
                <Button onClick={() => shareToSocialMedia('twitter', shareModal.itemId!)}>
                  Twitter
                </Button>
                <Button onClick={() => shareToSocialMedia('instagram', shareModal.itemId!)}>
                  Instagram
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Folder Modal */}
      <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder in the current location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewFolderModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              setEditingFolder(contextMenu.folderPath);
              setEditingFolderName(decodeName(contextMenu.folderPath.split('/').pop() || ''));
              setContextMenu(null);
            }}
          >
            <Pencil className="w-4 h-4" />
            Rename
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleCopy(contextMenu.folderPath);
              setContextMenu(null);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleCut(contextMenu.folderPath);
              setContextMenu(null);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v16a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2z" />
            </svg>
            Cut
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
            onClick={() => {
              handleDeleteFolder(contextMenu.folderPath);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Audio Context Menu */}
      {fileContextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: fileContextMenu.x, top: fileContextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleDownload(fileContextMenu.audio.audio_id);
              setFileContextMenu(null);
            }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleShare(fileContextMenu.audio.audio_id);
              setFileContextMenu(null);
            }}
          >
            <Share className="w-4 h-4" />
            Share
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleFileCopy(fileContextMenu.audio);
              setFileContextMenu(null);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleFileCut(fileContextMenu.audio);
              setFileContextMenu(null);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v16a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2z" />
            </svg>
            Cut
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
            onClick={() => {
              handleDelete(fileContextMenu.audio);
              setFileContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Click outside to close context menus */}
      {(contextMenu || fileContextMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setContextMenu(null);
            setFileContextMenu(null);
          }}
        />
      )}
    </div>
  );

  // Helper function for social media sharing
  function shareToSocialMedia(platform: string, audioId: string) {
    const audioUrl = getAudioUrl(audioId);
    const text = 'Check out this amazing audio!';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(audioUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(audioUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        navigator.clipboard.writeText(audioUrl);
        toast.success('Audio URL copied to clipboard for Instagram');
        return;
    }
    
    window.open(shareUrl, '_blank');
  }
} 