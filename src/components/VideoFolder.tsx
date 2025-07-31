import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Video, SortAsc, SortDesc, ZoomIn, Folder, Plus, ChevronRight, Home, ArrowLeft, Pencil, Menu, X, File, User, RefreshCcw, Edit, Play } from 'lucide-react';
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
  video_url?: string;
  video_path?: string;
  video_name?: string;
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
  const [totalVideosCount, setTotalVideosCount] = useState(0);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
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
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [isMultiCopyActive, setIsMultiCopyActive] = useState<boolean>(false);
  const [isMultiDownloading, setIsMultiDownloading] = useState<boolean>(false);
  const [isMultiPasting, setIsMultiPasting] = useState<boolean>(false);
  const [multiSelectContextMenu, setMultiSelectContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Drag and drop state
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const [draggedVideo, setDraggedVideo] = useState<VideoData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File counts and loading states
  const [folderFileCounts, setFolderFileCounts] = useState<{ [key: string]: number }>({});
  const [loadingFileCounts, setLoadingFileCounts] = useState<{ [key: string]: boolean }>({});

  // Filter state
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [lipSyncFilter, setLipSyncFilter] = useState<string>('all');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | null>(null);

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    // Remove the user ID and "video/" prefix
    const pathWithoutPrefix = fullPath.replace(/^[^\/]+\/video\//, '');
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
          folder: `video/${folderPath}`
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
    setCurrentPage(1); // Reset to first page when changing folders
    fetchFolderFiles(folderPath);
  };

  // Navigate to parent folder
  const navigateToParent = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
    setCurrentPage(1); // Reset to first page when changing folders
    fetchFolderFiles(parentPath);
  };

  // Navigate to home (video root)
  const navigateToHome = () => {
    setCurrentPath('');
    setCurrentPage(1); // Reset to first page when changing folders
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
            folder: "video"
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

  // Fetch videos from current folder
  const fetchFolderFiles = async (folderPath: string) => {
    if (!userData.id) return;
    
    try {
      setVideosLoading(true);

      // Build the query for counting videos in the current path
      let countQuery = `https://db.nymia.ai/rest/v1/video?user_uuid=eq.${userData.id}&status=eq.completed&select=count`;
      
      if (folderPath === '') {
        // Root folder: count videos where video_path is empty, null, or undefined
        countQuery += `&or=(video_path.is.null,video_path.eq."")`;
      } else {
        // Subfolder: count videos that are in the specific folder path
        countQuery += `&video_path=eq.${encodeURIComponent(folderPath)}`;
      }

      console.log('Count query:', countQuery);
      
      const response = await fetch(countQuery, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const count = data[0]?.count || 0;
        console.log('Total videos count for path:', folderPath, count);
        setTotalVideosCount(count);
        
        // Set current path for future queries
        setCurrentPath(folderPath);
      }
    } catch (error) {
      console.error('Error fetching video count:', error);
      toast.error('Failed to load video count');
    } finally {
      setVideosLoading(false);
    }
  };

  // Function to fetch videos with search, sort, and pagination
  const fetchVideosWithFilters = useCallback(async () => {
    if (!userData.id) return;

    try {
      setVideosLoading(true);

      // Build the base query
      let query = `https://db.nymia.ai/rest/v1/video?user_uuid=eq.${userData.id}&status=eq.completed`;
      
      // Add path filter
      if (currentPath === '') {
        // Root folder: show videos where video_path is empty, null, or undefined
        query += `&or=(video_path.is.null,video_path.eq."")`;
          } else {
        // Subfolder: show videos that are in the specific folder path
        query += `&video_path=eq.${encodeURIComponent(currentPath)}`;
      }

      // Add search filter if search term exists
      if (searchTerm.trim()) {
        query += `&or=(prompt.ilike.*${encodeURIComponent(searchTerm)}*,model.ilike.*${encodeURIComponent(searchTerm)}*,user_filename.ilike.*${encodeURIComponent(searchTerm)}*)`;
      }

      // Add model filter
      if (modelFilter !== 'all') {
        query += `&model=eq.${encodeURIComponent(modelFilter)}`;
      }

      // Add lip sync filter
      if (lipSyncFilter !== 'all') {
        if (lipSyncFilter === 'lip_sync') {
          query += `&lip_flag=eq.true`;
        } else if (lipSyncFilter === 'regular') {
          query += `&lip_flag=eq.false`;
        }
      }

      // Add favorite filter
      if (favoriteFilter !== null) {
        query += `&favorite=eq.${favoriteFilter}`;
      }

      // Add sorting
      let orderBy = '';
      switch (sortBy) {
        case 'newest':
          orderBy = 'task_created_at.desc';
          break;
        case 'oldest':
          orderBy = 'task_created_at.asc';
          break;
        case 'duration':
          orderBy = sortOrder === 'asc' ? 'duration.asc' : 'duration.desc';
          break;
        case 'model':
          orderBy = sortOrder === 'asc' ? 'model.asc' : 'model.desc';
          break;
        case 'name':
          orderBy = sortOrder === 'asc' ? 'user_filename.asc' : 'user_filename.desc';
          break;
        default:
          orderBy = 'task_created_at.desc';
      }
      query += `&order=${orderBy}`;

      // Add pagination
      const offset = (currentPage - 1) * itemsPerPage;
      query += `&limit=${itemsPerPage}&offset=${offset}`;

      console.log('Fetch videos query:', query);
      
      const response = await fetch(query, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched videos with filters:', data);
        console.log('Video IDs:', data.map(v => ({ id: v.id, task_id: v.task_id, video_id: v.video_id })));
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos with filters:', error);
      toast.error('Failed to load videos');
    } finally {
      setVideosLoading(false);
    }
  }, [userData.id, currentPath, searchTerm, modelFilter, lipSyncFilter, favoriteFilter, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Fetch initial video count
  useEffect(() => {
    fetchFolderFiles('');
  }, [userData.id]);

  // Fetch videos when search, sort, or pagination changes
  useEffect(() => {
    if (currentPath !== undefined && totalVideosCount > 0) {
      fetchVideosWithFilters();
    }
  }, [fetchVideosWithFilters, totalVideosCount]);

  // Keyboard shortcuts for copy, cut, paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields or interacting with cards
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || 
          e.target instanceof HTMLButtonElement || (e.target as Element)?.closest('[role="button"]')) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
            e.preventDefault();
            if (selectedVideos.size > 0) {
              handleMultiCopy();
            } else if (fileCopyState > 0) {
              handleFilePaste();
            }
            break;
          case 'x':
            e.preventDefault();
            if (selectedVideos.size > 0) {
              handleMultiCut();
            } else if (fileCopyState > 0) {
              handleFilePaste();
            }
            break;
          case 'v':
            e.preventDefault();
            // Paste videos
            if (fileClipboard && fileCopyState > 0) {
              handleFilePaste();
            }
            break;

          case 'd':
            e.preventDefault();
            if (selectedVideos.size > 0 && !isMultiDownloading) {
              handleMultiDownload();
            }
            break;
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            if (selectedVideos.size > 0) {
              handleMultiDelete();
            }
            break;
        }
      } else {
        // Non-Ctrl/Cmd shortcuts
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            setContextMenu(null);
            setFileContextMenu(null);
            clearSelection();
            setIsMultiSelectMode(false);
            break;
          case 'v':
            e.preventDefault();
            if (selectedVideos.size > 0 && !isMultiPasting) {
              handleMultiPaste();
            }
            break;
          case 'd':
            e.preventDefault();
            if (selectedVideos.size > 0 && !isMultiDownloading) {
              handleMultiDownload();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideos, videos, fileClipboard, fileCopyState, isMultiPasting, isMultiDownloading, isMultiSelectMode]);

  // Pagination calculations
  const totalPages = Math.ceil(totalVideosCount / itemsPerPage);
  const currentVideos = videos; // videos now contains only the current page data

  // Multi-selection helper functions
  const toggleVideoSelection = (videoId: string) => {
    console.log('toggleVideoSelection called with videoId:', videoId);
    console.log('Current videos:', videos.map(v => ({ id: v.id, task_id: v.task_id, video_id: v.video_id })));
    console.log('Current selectedVideos set:', Array.from(selectedVideos));
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
        console.log('Removed videoId:', videoId);
      } else {
        newSet.add(videoId);
        console.log('Added videoId:', videoId);
      }
      console.log('New selection set:', Array.from(newSet));
      return newSet;
    });
  };



  const clearSelection = () => {
    setSelectedVideos(new Set());
  };

  const getSelectedVideos = () => {
    return videos.filter(video => selectedVideos.has(video.video_id));
  };

  // Multi-operation functions
  const handleMultiCopy = () => {
    const selected = getSelectedVideos();
    if (selected.length === 0) return;

    // Store multiple videos for copy operation
    localStorage.setItem('multiCopiedVideos', JSON.stringify(selected));
    setFileCopyState(1); // Copy mode
    setFileClipboard({ type: 'copy', items: selected });
    setIsMultiCopyActive(true);
    toast.success(`Copied ${selected.length} video${selected.length > 1 ? 's' : ''}`);
  };

  const handleMultiCut = () => {
    const selected = getSelectedVideos();
    if (selected.length === 0) return;

    // Store multiple videos for cut operation
    localStorage.setItem('multiCopiedVideos', JSON.stringify(selected));
    setFileCopyState(2); // Cut mode
    setFileClipboard({ type: 'cut', items: selected });
    setIsMultiCopyActive(true);
    toast.success(`Cut ${selected.length} video${selected.length > 1 ? 's' : ''}`);
  };

  const handleMultiPaste = async () => {
    const multiCopiedVideos = localStorage.getItem('multiCopiedVideos');
    if (!multiCopiedVideos) return;

    setIsMultiPasting(true);
    const processingToast = toast.loading('Processing files...', {
      description: `Processing ${JSON.parse(multiCopiedVideos).length} video(s)`,
      duration: Infinity
    });

    try {
      const videos = JSON.parse(multiCopiedVideos) as VideoData[];
      const operationType = fileCopyState === 1 ? 'copy' : 'cut';

      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        
        // Update toast progress
        toast.loading(`${operationType === 'copy' ? 'Copying' : 'Moving'} video ${i + 1}/${videos.length}...`, {
          id: processingToast,
          description: `Processing "${video.user_filename || video.video_id}"`
        });

        const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
        const sourcePath = video.video_path ? `video/${video.video_path}/${fileName}.mp4` : `video/${fileName}.mp4`;
        const destinationPath = currentPath ? `video/${currentPath}/${fileName}.mp4` : `video/${fileName}.mp4`;

        console.log(`Starting ${operationType} operation for video: ${fileName}`);
        console.log(`From: ${sourcePath}`);
        console.log(`To: ${destinationPath}`);

        // Copy the video file
        const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            sourcefilename: sourcePath,
            destinationfilename: destinationPath
          })
        });

        if (!copyResponse.ok) {
          const errorText = await copyResponse.text();
          console.error(`Failed to copy video file ${fileName}.mp4:`, errorText);
          throw new Error(`Failed to copy video file ${fileName}.mp4: ${errorText}`);
        }

        console.log(`Successfully copied video file ${fileName}.mp4`);

        if (operationType === 'copy') {
          // For copy operation, create a new database entry
          const newVideoData = {
            ...video,
            video_path: currentPath || '',
            video_url: `https://images.nymia.ai/${userData.id}/video/${currentPath ? currentPath + '/' : ''}${fileName}.mp4`,
            task_created_at: new Date().toISOString()
          };
          delete newVideoData.video_id; // Remove ID so database generates new one
          delete newVideoData.id; // Remove ID so database generates new one

          const createVideoResponse = await fetch(`https://db.nymia.ai/rest/v1/video`, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newVideoData)
          });

          if (!createVideoResponse.ok) {
            const errorText = await createVideoResponse.text();
            console.warn(`Failed to create new video record for ${fileName}:`, errorText);
          } else {
            console.log(`Successfully created new video record for ${fileName}`);
          }
        } else {
          // For cut operation, update the existing database entry
          const updateResponse = await fetch(`https://db.nymia.ai/rest/v1/video?video_id=eq.${video.video_id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              video_path: currentPath || '',
              video_url: `https://images.nymia.ai/${userData.id}/video/${currentPath ? currentPath + '/' : ''}${fileName}.mp4`
            })
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.warn(`Failed to update video path for video ${video.video_id}:`, errorText);
          } else {
            console.log(`Successfully updated video path for video ${video.video_id}`);
          }

          // Delete the original file for cut operation
          const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              filename: sourcePath
            })
          });

          if (!deleteResponse.ok) {
            console.warn(`Failed to delete original file for video ${video.video_id}, but cut operation completed`);
          } else {
            console.log(`Successfully deleted original file for video ${video.video_id}`);
          }
        }
      }

      toast.success(`${videos.length} video(s) ${operationType === 'copy' ? 'copied' : 'moved'} successfully!`, {
        id: processingToast,
        description: `Files are now in ${currentPath || 'root folder'}`,
        duration: 4000
      });
      
      // Clear the multi-copy state
      localStorage.removeItem('multiCopiedVideos');
      setFileCopyState(0);
      setFileClipboard(null);
      setIsMultiCopyActive(false);
      clearSelection();
      
      // Refresh the current folder to show updated content
      await fetchFolderFiles(currentPath);
      await fetchVideosWithFilters();
    } catch (error) {
      console.error('Error pasting videos:', error);
      toast.error('Failed to paste videos', {
        id: processingToast,
        description: error instanceof Error ? error.message : 'An error occurred during the operation',
        duration: 5000
      });
    } finally {
      setIsMultiPasting(false);
    }
  };

  const handleMultiDownload = async () => {
    const selected = getSelectedVideos();
    if (selected.length === 0) return;

    try {
      setIsMultiDownloading(true);

      // Show initial toast
      toast.info('Starting multi-download operation...', {
        description: `Processing ${selected.length} video${selected.length > 1 ? 's' : ''}`,
        duration: 2000
      });

      for (const video of selected) {
        await handleDownload(video);
      }

      toast.success(`Successfully downloaded ${selected.length} video${selected.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Multi-download error:', error);
      toast.error('Failed to download some videos');
    } finally {
      setIsMultiDownloading(false);
    }
  };

  const handleMultiDelete = async () => {
    const selected = getSelectedVideos();
    if (selected.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selected.length} video${selected.length > 1 ? 's' : ''}?`)) {
      try {
        for (const video of selected) {
          await handleDelete(video);
        }
        clearSelection();
        toast.success(`Deleted ${selected.length} video${selected.length > 1 ? 's' : ''}`);
      } catch (error) {
        console.error('Multi-delete error:', error);
        toast.error('Failed to delete some videos');
      }
    }
  };

  // Helper functions for file operations
  const checkFileExists = async (fileName: string): Promise<boolean> => {
    try {
      const folderPath = currentPath ? `video/${currentPath}` : 'video';
      const response = await fetch(`https://api.nymia.ai/v1/getfilenames`, {
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
        const files = await response.json();
        return files.some((file: any) => file.Key === `${fileName}.mp4`);
      }
      return false;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  const checkFileExistsInDatabase = async (fileName: string): Promise<boolean> => {
    try {
      const videoPath = currentPath || '';
      const response = await fetch(`https://db.nymia.ai/rest/v1/video?user_uuid=eq.${userData.id}&video_name=eq.${encodeURIComponent(fileName)}&video_path=eq.${encodeURIComponent(videoPath)}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const videos = await response.json();
        return videos.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Error checking file existence in database:', error);
      return false;
    }
  };

  // Helper function for paste operations
  const handleFilePasteOperation = async (video: VideoData) => {
    const operationType = fileCopyState === 1 ? 'copying' : 'moving';
    const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
    const sourcePath = video.video_path ? `video/${video.video_path}` : 'video';
    const destinationPath = currentPath ? `video/${currentPath}` : 'video';

    // Check if file already exists in destination
    const fileExists = await checkFileExists(fileName);
    const fileExistsInDb = await checkFileExistsInDatabase(fileName);

    if (fileExists || fileExistsInDb) {
      toast.warning(`Video "${fileName}" already exists in this location. Skipping paste operation.`, {
        description: 'Please rename the existing video or choose a different location.',
        duration: 5000
      });
      return;
    }

    console.log("Source Video:", `${sourcePath}/${fileName}.mp4`);
    console.log("Destination:", `${destinationPath}/${fileName}.mp4`);

    // Copy the file
    const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify({
        user: userData.id,
        sourcefilename: `${sourcePath}/${fileName}.mp4`,
        destinationfilename: `${destinationPath}/${fileName}.mp4`
      })
    });

    if (!copyResponse.ok) {
      throw new Error(`Failed to copy file for video ${video.video_id}`);
    }

    // Create new video data for the copy
    const newVideoData = {
      ...video,
      video_path: currentPath || '',
      video_name: fileName,
      task_created_at: new Date().toISOString()
    };

    // Remove the id field for new database entry
    delete newVideoData.id;

    // Create new database entry
    const dbResponse = await fetch(`https://db.nymia.ai/rest/v1/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify(newVideoData)
    });

    if (!dbResponse.ok) {
      throw new Error(`Failed to create database entry for video ${video.video_id}`);
    }

    if (fileCopyState === 2) {
      // Remove from current location if it's a cut operation
      const deleteFileResponse = await fetch(`https://api.nymia.ai/v1/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `${sourcePath}/${fileName}.mp4`
        })
      });

      if (!deleteFileResponse.ok) {
        console.warn(`Failed to delete original file for video ${video.video_id}, but copy operation completed`);
      }

      // Delete the original database entry
      const deleteDbResponse = await fetch(`https://db.nymia.ai/rest/v1/video?video_id=eq.${video.video_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (!deleteDbResponse.ok) {
        console.warn(`Failed to delete original database entry for video ${video.video_id}, but copy operation completed`);
      }
    }
  };

  // Video helper functions
  const getVideoUrl = (video: VideoData) => {
    // Use video_name if available, otherwise use video_id
    if(video.video_url){
      return video.video_url;
    }
    const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
    return `https://images.nymia.ai/${userData.id}/video/${video.video_path ? video.video_path + '/' : ''}${fileName}.mp4`;
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
    setSelectedVideo(video);
  };

  // Handle download
  const handleDownload = async (video: VideoData) => {
    const videoId = video.video_id;
    
    // Prevent multiple downloads of the same video
    if (downloadingVideos.has(videoId)) {
      return;
    }

    try {
      // Set downloading state
      setDownloadingVideos(prev => new Set(prev).add(videoId));
      setDownloadProgress(prev => ({ ...prev, [videoId]: 0 }));

      // Show initial toast
      toast.info('Preparing download...', {
        description: `Starting download for "${video.user_filename || video.video_id}"`,
        duration: 2000
      });

      const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
      const path = currentPath === "" ? "video" : `video/${currentPath}`;
      
      // Update progress to 25%
      setDownloadProgress(prev => ({ ...prev, [videoId]: 25 }));
      
      const response = await fetch('https://api.nymia.ai/v1/downloadfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `${path}/${fileName}.mp4`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Update progress to 50%
      setDownloadProgress(prev => ({ ...prev, [videoId]: 50 }));

      // Show downloading toast
      toast.info('Downloading video...', {
        description: `Processing "${video.user_filename || video.video_id}"`,
        duration: 2000
      });

      const blob = await response.blob();

      // Update progress to 75%
      setDownloadProgress(prev => ({ ...prev, [videoId]: 75 }));

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.mp4`;

      // Update progress to 90%
      setDownloadProgress(prev => ({ ...prev, [videoId]: 90 }));

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Update progress to 100%
      setDownloadProgress(prev => ({ ...prev, [videoId]: 100 }));

      // Show success toast
      toast.success('Download completed!', {
        description: `"${video.user_filename || video.video_id}" has been downloaded successfully`,
        duration: 3000
      });

      // Clear download state after a short delay
      setTimeout(() => {
        setDownloadingVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[videoId];
          return newProgress;
        });
      }, 1000);

    } catch (error) {
      console.error('Error downloading video:', error);
      
      // Show error toast
      toast.error('Download failed', {
        description: `Failed to download "${video.user_filename || video.video_id}". Please try again.`,
        duration: 5000
      });

      // Clear download state
      setDownloadingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[videoId];
        return newProgress;
      });
    }
  };

  // Handle share
  const handleShare = (video: VideoData) => {
    const videoUrl = getVideoUrl(video);
    navigator.clipboard.writeText(videoUrl);
    toast.success('Video URL copied to clipboard');
  };

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; video: VideoData | null }>({ open: false, video: null });

  // Handle delete
  const handleDelete = async (video: VideoData) => {
    setDeleteModal({ open: true, video });
  };

  const confirmDelete = async () => {
    if (!deleteModal.video) return;
    
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/video?video_id=eq.${deleteModal.video.video_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      await fetch('https://api.nymia.ai/v1/deletefile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `video/${deleteModal.video.video_path || ''}/${deleteModal.video.video_name || deleteModal.video.video_id}.mp4`
        })
      });

      if (response.ok) {
        // Refresh current folder content
        await fetchFolderFiles(currentPath);
        toast.success('Video deleted successfully');
        setDeleteModal({ open: false, video: null });
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
    setModelFilter('all');
    setLipSyncFilter('all');
    setFavoriteFilter(null);
    setSortBy('newest');
    setSortOrder('desc');
    setCurrentPage(1); // Reset to first page when clearing filters
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
          folder: `video/${newFolderPath}`
        })
      });

      if (response.ok) {
        toast.success('Folder created successfully');
        setShowNewFolderModal(false);
        setNewFolderName('');
        
        // Refresh folders
        const updatedFolders = [...folders, { Key: `${newFolderPath}` }];
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
          parentfolder: `video/${parentPath ? parentPath + '/' : ''}`,
          folder: enNewName
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create new folder');
      }

      console.log('New folder created successfully');

      // Step 2: Get all files from the old folder and move them to the new folder
      const allVideosResponse = await fetch(`https://db.nymia.ai/rest/v1/video?user_uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      const allVideos = await allVideosResponse.json();
      console.log(allVideos);
      const videosInFolder = allVideos.filter(video => video.video_path === oldPath || (oldPath === "" && video.video_path === ""));
      console.log(videosInFolder);
      
      if (videosInFolder.length > 0) {
        console.log('Moving', videosInFolder.length, 'videos from old folder to new folder');
        
        for (const video of videosInFolder) {
          const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
          
          console.log(`Attempting to move video: ${fileName}.mp4`);
          console.log(`From: video/${oldPath}/${fileName}.mp4`);
          console.log(`To: video/${newPath}/${fileName}.mp4`);
          
          // Copy the video file from old location to new location
          const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              sourcefilename: `video/${oldPath}/${fileName}.mp4`,
              destinationfilename: `video/${newPath}/${fileName}.mp4`
            })
          });

          if (!copyResponse.ok) {
            const errorText = await copyResponse.text();
            console.error(`Failed to copy video file ${fileName}.mp4:`, errorText);
            console.error(`Response status: ${copyResponse.status}`);
            throw new Error(`Failed to copy video file ${fileName}.mp4: ${errorText}`);
          }

          console.log(`Successfully copied video file ${fileName}.mp4`);

          // Update the video_path in database
          const updateResponse = await fetch(`https://db.nymia.ai/rest/v1/video?video_id=eq.${video.video_id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              video_path: newPath
            })
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.warn(`Failed to update video path for video ${video.video_id}:`, errorText);
          } else {
            console.log(`Successfully updated database for video ${video.video_id}`);
          }

          console.log(`Successfully moved video ${fileName}.mp4 to new folder`);
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
          folder: `video/${oldPath}`
        })
      });

      if (getFoldersResponse.ok) {
        const folders = await getFoldersResponse.json();
        console.log('Subfolders to copy:', folders);

        // Step 4: Copy all subfolders recursively
        if (folders && folders.length > 0 && folders[0].Key) {
          for (const folder of folders) {
            const folderKey = folder.Key;
            const re = new RegExp(`^.*?video/${oldPath}/`);
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
                  parentfolder: `video/${newPath}/`,
                  folder: relativePath
                })
              });

              if (subfolderCreateResponse.ok) {
                // Move videos in this subfolder
                const subfolderVideos = allVideos.filter(video => video.video_path === `${oldPath}/${relativePath}`);
                
                for (const video of subfolderVideos) {
                  const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
                  
                  console.log(`Attempting to move video in subfolder: ${fileName}.mp4`);
                  console.log(`From: video/${oldPath}/${relativePath}/${fileName}.mp4`);
                  console.log(`To: video/${newPath}/${relativePath}/${fileName}.mp4`);
                  
                  // Copy the video file from old subfolder location to new subfolder location
                  const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer WeInfl3nc3withAI'
                    },
                    body: JSON.stringify({
                      user: userData.id,
                      sourcefilename: `video/${oldPath}/${relativePath}/${fileName}.mp4`,
                      destinationfilename: `video/${newPath}/${relativePath}/${fileName}.mp4`
                    })
                  });

                  if (!copyResponse.ok) {
                    const errorText = await copyResponse.text();
                    console.error(`Failed to copy video file ${fileName}.mp4 in subfolder ${relativePath}:`, errorText);
                    console.error(`Response status: ${copyResponse.status}`);
                    throw new Error(`Failed to copy video file ${fileName}.mp4 in subfolder ${relativePath}: ${errorText}`);
                  }

                  console.log(`Successfully copied video file ${fileName}.mp4 in subfolder ${relativePath}`);

                  // Update the video_path in database
                  const updateResponse = await fetch(`https://db.nymia.ai/rest/v1/video?video_id=eq.${video.video_id}`, {
                    method: 'PATCH',
                    headers: {
                      'Authorization': 'Bearer WeInfl3nc3withAI',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      video_path: `${newPath}/${relativePath}`
                    })
                  });

                  if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    console.warn(`Failed to update video path for video ${video.video_id}:`, errorText);
                  } else {
                    console.log(`Successfully updated database for video ${video.video_id} in subfolder`);
                  }

                  console.log(`Successfully moved video ${fileName}.mp4 in subfolder ${relativePath}`);
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
          folder: `video/${oldPath}`
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
          folder: "video"
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

      // Step 8: Refresh videos to show updated paths
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

  // Delete folder modal state
  const [deleteFolderModal, setDeleteFolderModal] = useState<{ open: boolean; folderPath: string | null; folderName: string | null }>({ open: false, folderPath: null, folderName: null });

  const handleDeleteFolder = async (folderPath: string) => {
    const folderName = decodeName(folderPath.split('/').pop() || '');
    setDeleteFolderModal({ open: true, folderPath, folderName });
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderModal.folderPath) return;

    try {
      const response = await fetch('https://api.nymia.ai/v1/deletefolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `video/${deleteFolderModal.folderPath}`
        })
      });

      if (response.ok) {
        toast.success('Folder deleted successfully');
        
        // Refresh folders from API
        const refreshResponse = await fetch('https://api.nymia.ai/v1/getfoldernames', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            folder: "video"
          })
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setFolders(data);
          setFolderStructure(buildFolderStructure(data));
        }
        
        // Refresh current folder content
        await fetchFolderFiles(currentPath);
        
        // Close modal
        setDeleteFolderModal({ open: false, folderPath: null, folderName: null });
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

        console.log(`Starting ${clipboard.type} operation for folder: ${sourcePath} to ${destPath}`);

        // Step 1: Create the destination folder
        const createResponse = await fetch('https://api.nymia.ai/v1/createfolder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            parentfolder: `video/${currentPath ? currentPath + '/' : ''}`,
            folder: sourceName
          })
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create destination folder');
        }

        console.log('Destination folder created successfully');

        // Step 2: Get all videos from the source folder and copy them
        const allVideosResponse = await fetch(`https://db.nymia.ai/rest/v1/video?user_uuid=eq.${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        });

        const allVideos = await allVideosResponse.json();
        const videosInSourceFolder = allVideos.filter(video => video.video_path === sourcePath);
        
        if (videosInSourceFolder.length > 0) {
          console.log(`Copying ${videosInSourceFolder.length} videos from source folder`);
          
          for (const video of videosInSourceFolder) {
            const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
            
            console.log(`Copying video: ${fileName}.mp4`);
            console.log(`From: video/${sourcePath}/${fileName}.mp4`);
            console.log(`To: video/${destPath}/${fileName}.mp4`);
            
            // Copy the video file
            const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              },
              body: JSON.stringify({
                user: userData.id,
                sourcefilename: `video/${sourcePath}/${fileName}.mp4`,
                destinationfilename: `video/${destPath}/${fileName}.mp4`
              })
            });

            if (!copyResponse.ok) {
              const errorText = await copyResponse.text();
              console.error(`Failed to copy video file ${fileName}.mp4:`, errorText);
              throw new Error(`Failed to copy video file ${fileName}.mp4: ${errorText}`);
            }

            console.log(`Successfully copied video file ${fileName}.mp4`);

            if (clipboard.type === 'copy') {
              // For copy operation, create a new database entry
              const newVideoData = {
                ...video,
                video_path: destPath,
                video_url: `https://images.nymia.ai/${userData.id}/video/${destPath}/${fileName}.mp4`,
                task_created_at: new Date().toISOString()
              };
              delete newVideoData.video_id; // Remove ID so database generates new one
              delete newVideoData.id; // Remove ID so database generates new one

              const createVideoResponse = await fetch(`https://db.nymia.ai/rest/v1/video`, {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer WeInfl3nc3withAI',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(newVideoData)
              });

              if (!createVideoResponse.ok) {
                const errorText = await createVideoResponse.text();
                console.warn(`Failed to create new video record for ${fileName}:`, errorText);
              } else {
                console.log(`Successfully created new video record for ${fileName}`);
              }
            } else {
              // For cut operation, update the existing database entry
              const updateResponse = await fetch(`https://db.nymia.ai/rest/v1/video?video_id=eq.${video.video_id}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': 'Bearer WeInfl3nc3withAI',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  video_path: destPath,
                  video_url: `https://images.nymia.ai/${userData.id}/video/${destPath}/${fileName}.mp4`
                })
              });

              if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.warn(`Failed to update video path for video ${video.video_id}:`, errorText);
              } else {
                console.log(`Successfully updated video path for video ${video.video_id}`);
              }
            }
          }
        }

        // Step 3: Handle subfolders recursively
        const getFoldersResponse = await fetch('https://api.nymia.ai/v1/getfoldernames', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            folder: `video/${sourcePath}`
          })
        });

        if (getFoldersResponse.ok) {
          const folders = await getFoldersResponse.json();
          console.log('Subfolders to copy:', folders);

          if (folders && folders.length > 0 && folders[0].Key) {
            for (const folder of folders) {
              const folderKey = folder.Key;
              const re = new RegExp(`^.*?video/${sourcePath}/`);
              const relativePath = folderKey.replace(re, "").replace(/\/$/, "");

              console.log("Processing subfolder:", relativePath);

              if (relativePath && relativePath !== folderKey) {
                // Create the subfolder in the destination
                const subfolderCreateResponse = await fetch('https://api.nymia.ai/v1/createfolder', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer WeInfl3nc3withAI'
                  },
                  body: JSON.stringify({
                    user: userData.id,
                    parentfolder: `video/${destPath}/`,
                    folder: relativePath
                  })
                });

                if (subfolderCreateResponse.ok) {
                  // Copy videos in this subfolder
                  const subfolderVideos = allVideos.filter(video => video.video_path === `${sourcePath}/${relativePath}`);
                  
                  for (const video of subfolderVideos) {
                    const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
                    
                    console.log(`Copying video in subfolder: ${fileName}.mp4`);
                    console.log(`From: video/${sourcePath}/${relativePath}/${fileName}.mp4`);
                    console.log(`To: video/${destPath}/${relativePath}/${fileName}.mp4`);
                    
                    // Copy the video file
                    const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WeInfl3nc3withAI'
                      },
                      body: JSON.stringify({
                        user: userData.id,
                        sourcefilename: `video/${sourcePath}/${relativePath}/${fileName}.mp4`,
                        destinationfilename: `video/${destPath}/${relativePath}/${fileName}.mp4`
                      })
                    });

                    if (!copyResponse.ok) {
                      const errorText = await copyResponse.text();
                      console.error(`Failed to copy video file ${fileName}.mp4 in subfolder ${relativePath}:`, errorText);
                      throw new Error(`Failed to copy video file ${fileName}.mp4 in subfolder ${relativePath}: ${errorText}`);
                    }

                    console.log(`Successfully copied video file ${fileName}.mp4 in subfolder ${relativePath}`);

                    if (clipboard.type === 'copy') {
                      // For copy operation, create a new database entry
                      const newVideoData = {
                        ...video,
                        video_path: `${destPath}/${relativePath}`,
                        video_url: `https://images.nymia.ai/${userData.id}/video/${destPath}/${relativePath}/${fileName}.mp4`,
                        task_created_at: new Date().toISOString()
                      };
                      delete newVideoData.video_id;
                      delete newVideoData.id;

                      const createVideoResponse = await fetch(`https://db.nymia.ai/rest/v1/video`, {
                        method: 'POST',
                        headers: {
                          'Authorization': 'Bearer WeInfl3nc3withAI',
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newVideoData)
                      });

                      if (!createVideoResponse.ok) {
                        const errorText = await createVideoResponse.text();
                        console.warn(`Failed to create new video record for ${fileName} in subfolder:`, errorText);
                      } else {
                        console.log(`Successfully created new video record for ${fileName} in subfolder`);
                      }
                    } else {
                      // For cut operation, update the existing database entry
                      const updateResponse = await fetch(`https://db.nymia.ai/rest/v1/video?video_id=eq.${video.video_id}`, {
                        method: 'PATCH',
                        headers: {
                          'Authorization': 'Bearer WeInfl3nc3withAI',
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          video_path: `${destPath}/${relativePath}`,
                          video_url: `https://images.nymia.ai/${userData.id}/video/${destPath}/${relativePath}/${fileName}.mp4`
                        })
                      });

                      if (!updateResponse.ok) {
                        const errorText = await updateResponse.text();
                        console.warn(`Failed to update video path for video ${video.video_id} in subfolder:`, errorText);
                      } else {
                        console.log(`Successfully updated video path for video ${video.video_id} in subfolder`);
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Step 4: For cut operation, delete the source folder
        if (clipboard.type === 'cut') {
          console.log(`Deleting source folder: video/${sourcePath}`);
          const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefolder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              folder: `video/${sourcePath}`
            })
          });

          if (!deleteResponse.ok) {
            console.warn('Failed to delete source folder, but cut operation completed');
          } else {
            console.log('Successfully deleted source folder');
          }
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
          folder: "video"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(data);
        setFolderStructure(buildFolderStructure(data));
      }

      // Refresh current folder content
      await fetchFolderFiles(currentPath);

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
    setIsMultiCopyActive(false);
    toast.success('Video copied to clipboard');
  };

  const handleFileCut = (video: VideoData) => {
    setFileClipboard({ type: 'cut', items: [video] });
    setFileCopyState(2);
    setIsMultiCopyActive(false);
    toast.success('Video cut to clipboard');
  };

  const handleFilePaste = async () => {
    if (!fileClipboard || fileCopyState === 0) return;

    setIsPastingFile(true);
    const processingToast = toast.loading('Processing files...', {
      description: `${fileClipboard.type === 'copy' ? 'Copying' : 'Moving'} ${fileClipboard.items.length} video(s)`,
      duration: Infinity
    });

    try {
      for (let i = 0; i < fileClipboard.items.length; i++) {
        const video = fileClipboard.items[i];
        
        // Update toast progress
        toast.loading(`${fileClipboard.type === 'copy' ? 'Copying' : 'Moving'} video ${i + 1}/${fileClipboard.items.length}...`, {
          id: processingToast,
          description: `Processing "${video.user_filename || video.video_id}"`
        });

          const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
          const sourcePath = video.video_path ? `video/${video.video_path}/${fileName}.mp4` : `video/${fileName}.mp4`;
        const destinationPath = currentPath ? `video/${currentPath}/${fileName}.mp4` : `video/${fileName}.mp4`;

        console.log(`Starting ${fileClipboard.type} operation for video: ${fileName}`);
        console.log(`From: ${sourcePath}`);
        console.log(`To: ${destinationPath}`);

        // Copy the video file
          const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              sourcefilename: sourcePath,
              destinationfilename: destinationPath
            })
          });

          if (!copyResponse.ok) {
          const errorText = await copyResponse.text();
          console.error(`Failed to copy video file ${fileName}.mp4:`, errorText);
          throw new Error(`Failed to copy video file ${fileName}.mp4: ${errorText}`);
          }

        console.log(`Successfully copied video file ${fileName}.mp4`);

        if (fileClipboard.type === 'copy') {
          // For copy operation, create a new database entry
          const newVideoData = {
            ...video,
            video_path: currentPath || '',
            video_url: `https://images.nymia.ai/${userData.id}/video/${currentPath ? currentPath + '/' : ''}${fileName}.mp4`,
            task_created_at: new Date().toISOString()
          };
          delete newVideoData.video_id; // Remove ID so database generates new one
          delete newVideoData.id; // Remove ID so database generates new one

          const createVideoResponse = await fetch(`https://db.nymia.ai/rest/v1/video`, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newVideoData)
          });

          if (!createVideoResponse.ok) {
            const errorText = await createVideoResponse.text();
            console.warn(`Failed to create new video record for ${fileName}:`, errorText);
          } else {
            console.log(`Successfully created new video record for ${fileName}`);
          }
        } else {
          // For cut operation, update the existing database entry
          const updateResponse = await fetch(`https://db.nymia.ai/rest/v1/video?video_id=eq.${video.video_id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              video_path: currentPath || '',
              video_url: `https://images.nymia.ai/${userData.id}/video/${currentPath ? currentPath + '/' : ''}${fileName}.mp4`
            })
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.warn(`Failed to update video path for video ${video.video_id}:`, errorText);
          } else {
            console.log(`Successfully updated video path for video ${video.video_id}`);
          }

          // Delete the original file for cut operation
          const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              filename: sourcePath
            })
          });

          if (!deleteResponse.ok) {
            console.warn(`Failed to delete original file for video ${video.video_id}, but cut operation completed`);
          } else {
            console.log(`Successfully deleted original file for video ${video.video_id}`);
          }
        }
      }

      toast.success(`${fileClipboard.items.length} video(s) ${fileClipboard.type === 'copy' ? 'copied' : 'moved'} successfully!`, {
        id: processingToast,
        description: `Files are now in ${currentPath || 'root folder'}`,
        duration: 4000
      });
      
      setFileClipboard(null);
      setFileCopyState(0);
      
      // Refresh the current folder to show updated content
      await fetchFolderFiles(currentPath);
      await fetchVideosWithFilters();
    } catch (error) {
      console.error('Error pasting video:', error);
      toast.error('Failed to paste video', {
        id: processingToast,
        description: error instanceof Error ? error.message : 'An error occurred during the operation',
        duration: 5000
      });
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
      const response = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `video/${folderPath}`
        })
      });

      if (response.ok) {
        const files = await response.json();
        
        // Ensure files is an array
        if (!Array.isArray(files)) {
          console.warn(`Invalid response format for folder ${folderPath}:`, files);
          setFolderFileCounts(prev => ({ ...prev, [folderPath]: 0 }));
          return;
        }
        
        const directFiles = files.filter((file: any) => {
          // Check if file.Key exists before calling replace
          if (!file || !file.Key) {
            return false;
          }
          
          const relativePath = file.Key.replace(`video/${userData.id}/video/${folderPath}/`, '');
          if (folderPath === '') {
            return !relativePath.includes('/');
          }
          return false;
        });

        setFolderFileCounts(prev => ({ ...prev, [folderPath]: directFiles.length }));
      }
    } catch (error) {
      console.error(`Error fetching file count for folder ${folderPath}:`, error);
      console.error('Error details:', {
        folderPath,
        userDataId: userData.id,
        error: error instanceof Error ? error.message : error
      });
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
  const handleDragStart = (e: React.DragEvent, video: VideoData) => {
    setDraggedVideo(video);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', video.video_name || video.video_id);

    // Show toast when drag starts
    toast.info('Drag started', {
      description: `Moving "${video.video_name || video.video_id}" - drop on a folder to move it`,
      duration: 3000
    });
  };

  const handleDragEnd = () => {
    setDraggedVideo(null);
    setIsDragging(false);
    setDragOverFolder(null);
  };

  const handleDragOver = (e: React.DragEvent, folderPath: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderPath);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderPath: string) => {
    e.preventDefault();
    setDragOverFolder(null);

    // Handle clipboard paste if we have files in clipboard
    if (fileClipboard && fileCopyState > 0) {
      const originalPath = currentPath;
      setCurrentPath(targetFolderPath);
      
      try {
        await handleFilePaste();
        toast.success(`Files ${fileClipboard.type === 'copy' ? 'copied' : 'moved'} to ${targetFolderPath}`);
      } catch (error) {
        console.error('Error dropping files:', error);
        toast.error('Failed to drop files');
      } finally {
        setCurrentPath(originalPath);
      }
      return;
    }

    // Handle direct video drag and drop
    if (!draggedVideo) return;

    // Don't allow dropping into the same folder
    if (draggedVideo.video_path === targetFolderPath) {
      toast.error('Video is already in this folder');
      return;
    }

    // Show moving process toast
    const movingToast = toast.loading('Moving video...', {
      description: `Moving "${draggedVideo.user_filename || draggedVideo.video_id}" to ${targetFolderPath || 'root'}`,
      duration: Infinity
    });

    try {
      const fileName = draggedVideo.video_name && draggedVideo.video_name.trim() !== '' ? draggedVideo.video_name : draggedVideo.video_id;
      const sourcePath = draggedVideo.video_path || '';
      const targetPath = targetFolderPath || '';

      // Construct source and destination paths
      const sourceFilePath = sourcePath ? `video/${sourcePath}/${fileName}.mp4` : `video/${fileName}.mp4`;
      const targetFilePath = targetPath ? `video/${targetPath}/${fileName}.mp4` : `video/${fileName}.mp4`;

      // Update toast to show progress
      toast.loading('Updating database...', {
        id: movingToast,
        description: `Updating video location in database`
      });

      // Update the video's video_path in the database
      const response = await fetch(`https://db.nymia.ai/rest/v1/video?video_id=eq.${draggedVideo.video_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          video_path: targetPath
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update database');
      }

      // Copy the file to the target folder
      toast.loading('Copying file...', {
        id: movingToast,
        description: `Copying "${fileName}.mp4" to new location`
      });

      const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: sourceFilePath,
          destinationfilename: targetFilePath
        })
      });

      if (!copyResponse.ok) {
        throw new Error('Failed to copy file');
      }

      // Delete the file from the source folder
      toast.loading('Cleaning up...', {
        id: movingToast,
        description: `Removing file from original location`
      });

      const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: sourceFilePath
        })
      });

      if (!deleteResponse.ok) {
        console.warn('Failed to delete original file, but move operation completed');
      }

      // Refresh the files list
      toast.loading('Refreshing view...', {
        id: movingToast,
        description: `Updating file list`
      });

      await fetchFolderFiles(currentPath);

      // Show success message
      toast.success(`Video moved successfully!`, {
        id: movingToast,
        description: `"${draggedVideo.user_filename || fileName}.mp4" has been moved to ${targetFolderPath || 'root'}`,
        duration: 4000
      });

    } catch (error) {
      console.error('Error moving video:', error);
      toast.error('Failed to move video', {
        id: movingToast,
        description: error instanceof Error ? error.message : 'An error occurred during the move operation. Please try again.',
        duration: 5000
      });
    }
  };

  // Download state
  const [downloadingVideos, setDownloadingVideos] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});



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
              Video Folder
            </h1>
            <p className="text-muted-foreground">
              {currentPath ? `Current path: ${currentPath}` : 'Manage your video content'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Multi-select Mode Toggle */}
              <Button
            variant={isMultiSelectMode ? "default" : "outline"}
                size="sm"
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              if (!isMultiSelectMode) {
                clearSelection();
              }
            }}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="hidden sm:inline">Multi-select</span>
              </Button>
          
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
              placeholder="Search by title, prompt, model, or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs text-muted-foreground mt-1">
                              Found {videos.length} video{videos.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="model-filter" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Model:
            </Label>
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger id="model-filter" className="w-40 h-9">
                <SelectValue placeholder="All Models" />
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
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="type-filter" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Type:
            </Label>
            <Select value={lipSyncFilter} onValueChange={setLipSyncFilter}>
              <SelectTrigger id="type-filter" className="w-32 h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lip_sync">Lip Sync</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="sort-by" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Sort:
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by" className="w-32 h-9">
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
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-9 px-3"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-3"
          >
            <Filter className="w-4 h-4 mr-1" />
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

      {/* Multi-selection toolbar */}
      {isMultiSelectMode && (
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm mb-4 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedVideos.size > 0 
                ? `${selectedVideos.size} video${selectedVideos.size > 1 ? 's' : ''} selected`
                : 'Multi-select mode - Click videos to select'
              }
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMultiCopy}
              disabled={selectedVideos.size === 0 || isMultiCopyActive}
              className="h-8 text-xs bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMultiCut}
              disabled={selectedVideos.size === 0 || isMultiCopyActive}
              className="h-8 text-xs bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v16a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2z" />
              </svg>
              Cut
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMultiPaste}
              disabled={fileCopyState === 0 || isMultiPasting}
              className="h-8 text-xs bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
            >
              {isMultiPasting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Paste
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMultiDownload}
              disabled={selectedVideos.size === 0 || isMultiDownloading}
              className="h-8 text-xs bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
            >
              {isMultiDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleMultiDelete}
              disabled={selectedVideos.size === 0}
              className="h-8 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={selectedVideos.size === 0}
              className="h-8 text-xs bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Video Grid with Upload Card */}
      {videosLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {/* Loading skeleton cards */}
          {[...Array(7)].map((_, i) => (
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
              ) : totalVideosCount === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {/* Empty state message */}
          <div className="col-span-full text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">No videos found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search criteria or filters to find what you're looking for.</p>
              <Button onClick={clearFilters} variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {/* Video Cards */}
          {currentVideos.map((video) => (
            <Card
              key={`${video.id}-${video.task_id}-${video.video_id}`}
              className={`group cursor-pointer overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                selectedVideos.has(video.video_id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
              } ${isDragging && draggedVideo?.video_id === video.video_id ? 'opacity-50 scale-95' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, video)}
              onDragEnd={handleDragEnd}
              onClick={(e) => {
                console.log('Video card clicked:', video.video_id);
                console.log('Video data:', { id: video.id, task_id: video.task_id, video_id: video.video_id });
                console.log('isMultiSelectMode:', isMultiSelectMode);
                console.log('e.ctrlKey:', e.ctrlKey, 'e.metaKey:', e.metaKey);
                
                // Handle multi-selection with Ctrl/Cmd key or multi-select mode
                if (e.ctrlKey || e.metaKey || isMultiSelectMode) {
                  e.preventDefault();
                  console.log('Calling toggleVideoSelection for:', video.video_id);
                  toggleVideoSelection(video.video_id);
                    } else {
                  console.log('Calling handleVideoSelect for:', video.video_id);
                  handleVideoSelect(video);
                }
              }}
              onContextMenu={(e) => handleFileContextMenu(e, video)}
            >
              {/* Video Preview */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                {/* Selection indicator */}
                {selectedVideos.has(video.video_id) && (
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <video
                  src={getVideoUrl(video)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  preload="metadata"
                />
                
                {/* Overlay with play button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                    <Play className="w-6 h-6 text-gray-900 dark:text-white ml-1" />
                  </div>
                </div>

                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <Badge className={`${getVideoStatusColor(video.status)} text-xs font-medium px-2 py-1`}>
                    {video.status}
                  </Badge>
                </div>

                {/* Favorite indicator */}
                {video.favorite && (
                  <div className="absolute top-3 left-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                )}

                {/* Duration overlay */}
                <div className="absolute bottom-3 right-3">
                  <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
                    {formatVideoDuration(video.duration)}
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <CardContent className="p-4 space-y-3">
                {/* Title and model */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                    {video.user_filename || video.prompt.substring(0, 60)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {getVideoModelDisplayName(video.model)}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {video.lip_flag ? 'Lip Sync' : 'Regular'}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {video.prompt}
                </p>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatVideoDate(video.task_created_at)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs font-medium hover:bg-blue-700 hover:border-blue-500 transition-colors relative overflow-hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(video);
                    }}
                    disabled={downloadingVideos.has(video.video_id)}
                  >
                    {downloadingVideos.has(video.video_id) ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1.5"></div>
                        <span className="hidden sm:inline">
                          {downloadProgress[video.video_id] === 100 ? 'Complete!' : `Downloading ${downloadProgress[video.video_id] || 0}%`}
                        </span>
                        <span className="sm:hidden">
                          {downloadProgress[video.video_id] === 100 ? 'Done!' : `${downloadProgress[video.video_id] || 0}%`}
                        </span>
                        {/* Progress bar overlay */}
                        {downloadProgress[video.video_id] && downloadProgress[video.video_id] < 100 && (
                          <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300" 
                               style={{ width: `${downloadProgress[video.video_id]}%` }} />
                        )}
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1.5" />
                        <span className="hidden sm:inline">Download</span>
                        <span className="sm:hidden">DL</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 hover:bg-green-50 hover:bg-green-700 hover:border-green-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(video);
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
                      handleDelete(video);
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
              {totalVideosCount > 0 && (
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
                            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalVideosCount)} of {totalVideosCount} videos
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                  disabled={downloadingVideos.has(selectedVideo.video_id)}
                >
                  {downloadingVideos.has(selectedVideo.video_id) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span>
                        {downloadProgress[selectedVideo.video_id] === 100 ? 'Complete!' : `Downloading ${downloadProgress[selectedVideo.video_id] || 0}%`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      <span>Download</span>
                    </>
                  )}
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
                <Button onClick={() => shareToSocialMedia('facebook', selectedVideo!)}>
                  Facebook
                </Button>
                <Button onClick={() => shareToSocialMedia('twitter', selectedVideo!)}>
                  Twitter
                </Button>
                <Button onClick={() => shareToSocialMedia('instagram', selectedVideo!)}>
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

      {/* Delete Video Modal */}
      <Dialog open={deleteModal.open} onOpenChange={(open) => !open && setDeleteModal({ open: false, video: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {deleteModal.video && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {deleteModal.video.user_filename || deleteModal.video.prompt.substring(0, 50)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getVideoModelDisplayName(deleteModal.video.model)} • {formatVideoDuration(deleteModal.video.duration)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Created: {formatVideoDate(deleteModal.video.task_created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteModal({ open: false, video: null })}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Modal */}
      <Dialog open={deleteFolderModal.open} onOpenChange={(open) => !open && setDeleteFolderModal({ open: false, folderPath: null, folderName: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Folder className="w-4 h-4 text-white" />
              </div>
              Delete Folder
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. The folder and all its contents will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {deleteFolderModal.folderName && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {deleteFolderModal.folderName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Folder and all contents
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      This will permanently delete all videos and subfolders
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDeleteFolderModal({ open: false, folderPath: null, folderName: null })}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteFolder}
                className="bg-red-600 hover:bg-red-700 px-6"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Folder
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
              handleDownload(fileContextMenu.video);
              setFileContextMenu(null);
            }}
            disabled={downloadingVideos.has(fileContextMenu.video.video_id)}
          >
            {downloadingVideos.has(fileContextMenu.video.video_id) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>
                  {downloadProgress[fileContextMenu.video.video_id] === 100 ? 'Complete!' : `Downloading ${downloadProgress[fileContextMenu.video.video_id] || 0}%`}
                </span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download</span>
              </>
            )}
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              handleShare(fileContextMenu.video);
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

      {/* Hidden file input */}

    </div>
  );

  // Helper function for social media sharing
  const shareToSocialMedia = (platform: string, video: VideoData) => {
    const videoUrl = getVideoUrl(video);
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
  };
}