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
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Video, SortAsc, SortDesc, ZoomIn, Folder, Plus, Upload, ChevronRight, Home, ArrowLeft, Pencil, Menu, X, File, User, RefreshCcw, Edit, Play } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DialogContentZoom } from '@/components/ui/zoomdialog';
import { DialogZoom } from '@/components/ui/zoomdialog';

// Interface for video data from database
interface VideoData {
  id: string;
  task_id: string;
  video_id: string;
  user_uuid: string;
  model: string;
  mode: string;
  prompt: string;
  duration: number;
  start_image: string;
  start_image_url: string;
  negative_prompt: string;
  status: string;
  task_created_at: string;
  task_completed_at: string;
  lip_flag: boolean;
  user_filename?: string;
  user_notes?: string;
  user_tags?: string[];
  rating?: number;
  favorite?: boolean;
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

interface VideoFolderProps {
  onBack: () => void;
}

export default function VideoFolder({ onBack }: VideoFolderProps) {
  const userData = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ open: boolean; itemId: string | null; itemPath: string | null }>({ open: false, itemId: null, itemPath: null });

  // New folder modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderIcon, setSelectedFolderIcon] = useState('');
  const [uploadedIcon, setUploadedIcon] = useState<File | null>(null);
  const [folderIcons, setFolderIcons] = useState<string[]>([]);

  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string>('video');
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
  const [fileContextMenu, setFileContextMenu] = useState<{ x: number; y: number; video: VideoData } | null>(null);
  const [fileClipboard, setFileClipboard] = useState<{ type: 'copy' | 'cut'; items: VideoData[] } | null>(null);
  const [fileCopyState, setFileCopyState] = useState(0);
  const [isPastingFile, setIsPastingFile] = useState(false);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newFileNameInput, setNewFileNameInput] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Multi-selection state
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());

  // Drag and drop state
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [dragOverUpload, setDragOverUpload] = useState(false);

  // File counts and loading states
  const [folderFileCounts, setFolderFileCounts] = useState<{ [key: string]: number }>({});
  const [loadingFileCounts, setLoadingFileCounts] = useState<{ [key: string]: boolean }>({});

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | null>(null);

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    const parts = fullPath.split('/');
    return parts[parts.length - 1] || fullPath;
  };

  // Encode name for URL
  const encodeName = (name: string): string => {
    return encodeURIComponent(name);
  };

  // Decode name from URL
  const decodeName = (name: string): string => {
    return decodeURIComponent(name);
  };

  // Build folder structure from flat list
  const buildFolderStructure = (folderData: FolderData[]): FolderStructure[] => {
    const folderMap = new Map<string, FolderStructure>();
    const rootFolders: FolderStructure[] = [];

    // Filter for video folder and its subfolders
    const videoFolders = folderData.filter(folder => 
      folder.Key.startsWith('video/') || folder.Key === 'video'
    );

    videoFolders.forEach(folder => {
      const parts = folder.Key.split('/');
      let currentPath = '';
      
      parts.forEach((part, index) => {
        if (part === '') return;
        
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!folderMap.has(currentPath)) {
          const folderStructure: FolderStructure = {
            name: part,
            path: currentPath,
            children: [],
            isFolder: true
          };
          
          folderMap.set(currentPath, folderStructure);
          
          if (parentPath === '') {
            rootFolders.push(folderStructure);
          } else {
            const parent = folderMap.get(parentPath);
            if (parent) {
              parent.children.push(folderStructure);
            }
          }
        }
      });
    });

    return rootFolders;
  };

  // Navigate to folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    fetchFolderFiles(folderPath);
  };

  // Navigate to parent folder
  const navigateToParent = () => {
    const parts = currentPath.split('/');
    parts.pop();
    const parentPath = parts.join('/') || 'video';
    setCurrentPath(parentPath);
    fetchFolderFiles(parentPath);
  };

  // Navigate to home (video root)
  const navigateToHome = () => {
    setCurrentPath('video');
    fetchFolderFiles('video');
  };

  // Get breadcrumb items
  const getBreadcrumbItems = () => {
    const parts = currentPath.split('/');
    const items = [];
    
    for (let i = 0; i < parts.length; i++) {
      const path = parts.slice(0, i + 1).join('/');
      const name = parts[i];
      items.push({ name, path });
    }
    
    return items;
  };

  // Fetch folders
  useEffect(() => {
    const fetchFolders = async () => {
      if (!userData.id) return;
      
      try {
        setFoldersLoading(true);
        const response = await fetch(`https://db.nymia.ai/rest/v1/folders?user_uuid=eq.${userData.id}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched folders:', data);
          setFolders(data);
          setFolderStructure(buildFolderStructure(data));
        } else {
          throw new Error('Failed to fetch folders');
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
        toast.error('Failed to load folders');
      } finally {
        setFoldersLoading(false);
      }
    };

    fetchFolders();
  }, [userData.id]);

  // Fetch videos from current folder
  const fetchFolderFiles = async (folderPath: string) => {
    if (!userData.id) return;
    
    try {
      setVideosLoading(true);
      const response = await fetch(`https://db.nymia.ai/rest/v1/video?user_uuid=eq.${userData.id}&status=eq.completed&order=task_created_at.desc`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched videos:', data);
        setVideos(data);
      } else {
        throw new Error('Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setVideosLoading(false);
    }
  };

  // Fetch initial videos
  useEffect(() => {
    fetchFolderFiles('video');
  }, [userData.id]);

  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => {
      const matchesSearch = video.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (video.user_filename && video.user_filename.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || video.status === statusFilter;
      const matchesModel = modelFilter === 'all' || video.model === modelFilter;
      const matchesFavorite = favoriteFilter === null || video.favorite === favoriteFilter;
      
      return matchesSearch && matchesStatus && matchesModel && matchesFavorite;
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
        case 'model':
          comparison = a.model.localeCompare(b.model);
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
  const totalItems = filteredVideos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

  // Video helper functions
  const getVideoUrl = (videoId: string) => {
    return `https://images.nymia.ai/${userData.id}/video/${videoId}.mp4`;
  };

  const formatVideoDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatVideoDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVideoStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'processing': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'failed': return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getVideoModelDisplayName = (model: string) => {
    switch (model) {
      case 'kling-v2.1': return 'Kling 2.1';
      case 'kling-v2.1-master': return 'Kling 2.1 Master';
      case 'seedance-1-lite': return 'Seedance 1 Lite';
      case 'seedance-1-pro': return 'Seedance 1 Pro';
      case 'wan-2.1-i2v-480p': return 'WAN 2.1 480p';
      case 'wan-2.1-i2v-720p': return 'WAN 2.1 720p';
      default: return model;
    }
  };

  // Handle video selection
  const handleVideoSelect = (video: VideoData) => {
    setSelectedVideo(video.video_id);
  };

  // Handle download
  const handleDownload = async (videoId: string) => {
    try {
      const videoUrl = getVideoUrl(videoId);
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `video-${videoId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('Failed to download video');
    }
  };

  // Handle share
  const handleShare = (videoId: string) => {
    const videoUrl = getVideoUrl(videoId);
    navigator.clipboard.writeText(videoUrl);
    toast.success('Video URL copied to clipboard');
  };

  // Handle delete
  const handleDelete = async (video: VideoData) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/video?id=eq.${video.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setVideos(prev => prev.filter(v => v.id !== video.id));
        toast.success('Video deleted successfully');
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await fetchFolderFiles(currentPath);
    toast.success('Videos refreshed');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setModelFilter('all');
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
          folder: newFolderPath
        })
      });

      if (response.ok) {
        toast.success('Folder created successfully');
        setShowNewFolderModal(false);
        setNewFolderName('');
        
        // Refresh folders
        const updatedFolders = [...folders, { Key: newFolderPath }];
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
      const encodedNewName = encodeName(newName.trim());
      const newPath = oldPath.split('/').slice(0, -1).join('/') + '/' + encodedNewName;

      const response = await fetch('https://api.nymia.ai/v1/renamefolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          old_folder: oldPath,
          new_folder: newPath
        })
      });

      if (response.ok) {
        toast.success('Folder renamed successfully');
        setEditingFolder(null);
        setEditingFolderName('');
        
        // Update folders
        const updatedFolders = folders.map(folder => 
          folder.Key === oldPath ? { ...folder, Key: newPath } : folder
        );
        setFolders(updatedFolders);
        setFolderStructure(buildFolderStructure(updatedFolders));
      } else {
        throw new Error('Failed to rename folder');
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
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
          folder: folderPath
        })
      });

      if (response.ok) {
        toast.success('Folder deleted successfully');
        
        // Update folders
        const updatedFolders = folders.filter(folder => folder.Key !== folderPath);
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
              source_folder: sourcePath,
              dest_folder: destPath
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
              source_folder: sourcePath,
              dest_folder: destPath
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
          folder: "vault"
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

  const handleFileCopy = (video: VideoData) => {
    setFileClipboard({ type: 'copy', items: [video] });
    setFileCopyState(1);
    toast.success('Video copied to clipboard');
  };

  const handleFileCut = (video: VideoData) => {
    setFileClipboard({ type: 'cut', items: [video] });
    setFileCopyState(2);
    toast.success('Video cut to clipboard');
  };

  const handleFilePaste = async () => {
    if (!fileClipboard || fileCopyState === 0) return;

    setIsPastingFile(true);
    try {
      for (const video of fileClipboard.items) {
        // In a real implementation, you would move/copy the video file
        // For now, we'll just show a success message
        console.log(`${fileClipboard.type} video:`, video);
      }

      toast.success(`Video ${fileClipboard.type === 'copy' ? 'copied' : 'moved'} successfully`);
      setFileClipboard(null);
      setFileCopyState(0);
    } catch (error) {
      console.error('Error pasting video:', error);
      toast.error('Failed to paste video');
    } finally {
      setIsPastingFile(false);
    }
  };

  const handleFileContextMenu = (e: React.MouseEvent, video: VideoData) => {
    e.preventDefault();
    setFileContextMenu({ x: e.clientX, y: e.clientY, video });
  };

  const fetchFolderFileCount = async (folderPath: string) => {
    if (loadingFileCounts[folderPath]) return;

    setLoadingFileCounts(prev => ({ ...prev, [folderPath]: true }));
    try {
      // In a real implementation, you would fetch the actual file count
      // For now, we'll use a mock count
      const mockCount = Math.floor(Math.random() * 10);
      setFolderFileCounts(prev => ({ ...prev, [folderPath]: mockCount }));
    } catch (error) {
      console.error('Error fetching folder file count:', error);
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
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Video Folder
            </h1>
            <p className="text-muted-foreground">
              Manage your video content
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
                <Video className="w-4 h-4" />
                {fileCopyState === 1 ? 'Paste Video Copy' : fileCopyState === 2 ? 'Paste Video Move' : 'Paste Video'}
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
          Video
        </Button>
        {getBreadcrumbItems().slice(1).map((item, index) => (
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
              placeholder="Search videos..."
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

          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="kling-v2.1">Kling 2.1</SelectItem>
              <SelectItem value="kling-v2.1-master">Kling 2.1 Master</SelectItem>
              <SelectItem value="seedance-1-lite">Seedance 1 Lite</SelectItem>
              <SelectItem value="seedance-1-pro">Seedance 1 Pro</SelectItem>
              <SelectItem value="wan-2.1-i2v-480p">WAN 2.1 480p</SelectItem>
              <SelectItem value="wan-2.1-i2v-720p">WAN 2.1 720p</SelectItem>
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
              <SelectItem value="model">Model</SelectItem>
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

      {/* Video Grid */}
      {videosLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : totalItems === 0 ? (
        <div className="text-center py-12">
          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No videos found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentVideos.map((video) => (
            <Card
              key={video.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => handleVideoSelect(video)}
              onContextMenu={(e) => handleFileContextMenu(e, video)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Video Preview */}
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                    <video
                      src={getVideoUrl(video.video_id)}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className={getVideoStatusColor(video.status)}>
                        {video.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm line-clamp-2">
                        {video.user_filename || video.prompt.substring(0, 50)}
                      </h4>
                      {video.favorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {video.prompt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getVideoModelDisplayName(video.model)}</span>
                      <span>{formatVideoDuration(video.duration)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatVideoDate(video.task_created_at)}</span>
                      <span>{video.lip_flag ? 'Lip Sync' : 'Regular'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(video.video_id);
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(video.video_id);
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Share className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(video);
                      }}
                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
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
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} videos
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

      {/* Video Preview Modal */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Video Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <video
                src={getVideoUrl(selectedVideo)}
                controls
                className="w-full rounded-lg"
                autoPlay
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => handleDownload(selectedVideo)}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => handleShare(selectedVideo)}
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
              <DialogTitle>Share Video</DialogTitle>
              <DialogDescription>
                Share this video with others
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

      {/* Video Context Menu */}
      {fileContextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: fileContextMenu.x, top: fileContextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleDownload(fileContextMenu.video.video_id);
              setFileContextMenu(null);
            }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleShare(fileContextMenu.video.video_id);
              setFileContextMenu(null);
            }}
          >
            <Share className="w-4 h-4" />
            Share
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleFileCopy(fileContextMenu.video);
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
              handleFileCut(fileContextMenu.video);
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
              handleDelete(fileContextMenu.video);
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
  function shareToSocialMedia(platform: string, videoId: string) {
    const videoUrl = getVideoUrl(videoId);
    const text = 'Check out this amazing video!';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        navigator.clipboard.writeText(videoUrl);
        toast.success('Video URL copied to clipboard for Instagram');
        return;
    }
    
    window.open(shareUrl, '_blank');
  }
} 