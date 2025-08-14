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
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Music, SortAsc, SortDesc, ZoomIn, Folder, Plus, ChevronRight, Home, ArrowLeft, Pencil, Menu, X, File, User, RefreshCcw, Edit, Play, Volume2, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LibraryRetentionNotice } from '@/components/LibraryRetentionNotice';
import { DialogContentZoom } from '@/components/ui/zoomdialog';
import { DialogZoom } from '@/components/ui/zoomdialog';
import config from '@/config/config';

// Interface for audio data from database
interface AudioData {
  audio_id: string;
  user_uuid: string;
  created_at: string;
  elevenlabs_id: string;
  prompt: string;
  filename: string;
  status: string;
  character_cost: number;
  audio_path: string;
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
  const [totalAudiosCount, setTotalAudiosCount] = useState(0);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [audiosLoading, setAudiosLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ open: boolean; itemId: string | null; itemPath: string | null }>({ open: false, itemId: null, itemPath: null });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // New folder modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderIcon, setSelectedFolderIcon] = useState('');
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
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [goToPageInput, setGoToPageInput] = useState('');

  // Multi-selection state
  const [selectedAudios, setSelectedAudios] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [isMultiCopyActive, setIsMultiCopyActive] = useState<boolean>(false);
  const [isMultiDownloading, setIsMultiDownloading] = useState<boolean>(false);
  const [isMultiPasting, setIsMultiPasting] = useState<boolean>(false);
  const [multiSelectContextMenu, setMultiSelectContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Drag and drop state
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [draggedAudio, setDraggedAudio] = useState<AudioData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File counts and loading states
  const [folderFileCounts, setFolderFileCounts] = useState<{ [key: string]: number }>({});
  const [loadingFileCounts, setLoadingFileCounts] = useState<{ [key: string]: boolean }>({});



  // Download state
  const [downloadingAudios, setDownloadingAudios] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    // Check if fullPath is defined and is a string
    if (!fullPath || typeof fullPath !== 'string') {
      console.warn('extractFolderName called with invalid path:', fullPath);
      return '';
    }

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

      // Check if folder.Key exists
      if (!folder.Key) {
        console.log('Folder key is undefined, skipping');
        return;
      }

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
      const response = await fetch(`${config.backend_url}/getfoldernames`, {
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
        // Check if folder.Key exists
        if (!folder.Key) {
          console.log('Folder key is undefined in getAllSubfolders, skipping');
          continue;
        }

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

  // Navigate to home (audio root)
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
        const response = await fetch(`${config.backend_url}/getfoldernames`, {
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
          const fallbackFolders = data
            .filter((folder: FolderData) => folder.Key) // Only process folders with valid Key
            .map((folder: FolderData) => ({
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
      
      // Build the query for counting audios in the current path
      let countQuery = `${config.supabase_server_url}/audio?user_uuid=eq.${userData.id}&status=eq.created&select=count`;
      
      if (folderPath === '') {
        // Root folder: count audios where audio_path is empty, null, or undefined
        countQuery += `&or=(audio_path.is.null,audio_path.eq."")`;
      } else {
        // Subfolder: count audios that are in the specific folder path
        countQuery += `&audio_path=eq.${encodeURIComponent(folderPath)}`;
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
        console.log('Total audios count for path:', folderPath, count);
        setTotalAudiosCount(count);
        
        // Set current path for future queries
        setCurrentPath(folderPath);
      }
    } catch (error) {
      console.error('Error fetching audio count:', error);
      toast.error('Failed to load audio count');
    } finally {
      setAudiosLoading(false);
    }
  };

  // Function to fetch audios with search, sort, and pagination
  const fetchAudiosWithFilters = useCallback(async () => {
    if (!userData.id) return;

    try {
      setAudiosLoading(true);

      // Build the base query
      let query = `${config.supabase_server_url}/audio?user_uuid=eq.${userData.id}&status=eq.created`;
      
      // Add path filter
      if (currentPath === '') {
        // Root folder: show audios where audio_path is empty, null, or undefined
        query += `&or=(audio_path.is.null,audio_path.eq."")`;
          } else {
            // Subfolder: show audios that are in the specific folder path
        query += `&audio_path=eq.${encodeURIComponent(currentPath)}`;
      }

      // Add search filter if search term exists
      if (searchTerm.trim()) {
        query += `&or=(prompt.ilike.*${encodeURIComponent(searchTerm)}*,filename.ilike.*${encodeURIComponent(searchTerm)}*)`;
      }

      // Add sorting
      let orderBy = '';
      switch (sortBy) {
        case 'newest':
          orderBy = 'created_at.desc';
          break;
        case 'oldest':
          orderBy = 'created_at.asc';
          break;
        case 'character_cost':
          orderBy = sortOrder === 'asc' ? 'character_cost.asc' : 'character_cost.desc';
          break;
        case 'name':
          orderBy = sortOrder === 'asc' ? 'filename.asc' : 'filename.desc';
          break;
        default:
          orderBy = 'created_at.desc';
      }
      query += `&order=${orderBy}`;

      // Add pagination
      const offset = (currentPage - 1) * itemsPerPage;
      query += `&limit=${itemsPerPage}&offset=${offset}`;

      console.log('Fetch audios query:', query);
      
      const response = await fetch(query, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched audios with filters:', data);
        setAudios(data);
      }
    } catch (error) {
      console.error('Error fetching audios with filters:', error);
      toast.error('Failed to load audios');
    } finally {
      setAudiosLoading(false);
    }
  }, [userData.id, currentPath, searchTerm, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Fetch initial audio count
  useEffect(() => {
    fetchFolderFiles('');
  }, [userData.id]);

  // Fetch audios when search, sort, or pagination changes
  useEffect(() => {
    if (currentPath !== undefined && totalAudiosCount > 0) {
      fetchAudiosWithFilters();
    }
  }, [fetchAudiosWithFilters, totalAudiosCount]);

  // Keyboard event listener for clipboard operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
            e.preventDefault();
            if (selectedAudios.size > 0) {
              handleMultiCopy();
            } else if (fileCopyState > 0) {
              handleFilePaste();
            }
            break;
          case 'x':
            e.preventDefault();
            if (selectedAudios.size > 0) {
              handleMultiCut();
            } else if (fileCopyState > 0) {
              handleFilePaste();
            }
            break;
          case 'v':
            e.preventDefault();
            // Paste audios
            if (fileClipboard && fileCopyState > 0) {
              handleFilePaste();
            }
            break;

          case 'd':
            e.preventDefault();
            if (selectedAudios.size > 0 && !isMultiDownloading) {
              handleMultiDownload();
            }
          break;
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            if (selectedAudios.size > 0) {
              handleMultiDelete();
            }
          break;
        }
      } else {
        // Non-Ctrl/Cmd shortcuts
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            if (fileCopyState > 0) {
              clearFileClipboard();
              toast.info('Clipboard cleared', {
                description: 'Audio clipboard has been cleared',
                duration: 2000
              });
            }
            clearSelection();
            setIsMultiSelectMode(false);
          break;
          case 'v':
            e.preventDefault();
            if (selectedAudios.size > 0 && !isMultiPasting) {
              handleMultiPaste();
            }
          break;
          case 'd':
            e.preventDefault();
            if (selectedAudios.size > 0 && !isMultiDownloading) {
              handleMultiDownload();
            }
          break;
      }
      }
    };
      
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fileCopyState, selectedAudios, isMultiPasting, isMultiDownloading, isMultiSelectMode]);

  // Generate QR code when share modal opens
  useEffect(() => {
    if (shareModal.open && shareModal.itemId && shareModal.itemPath) {
      // Find the audio data for the given itemId
      const audio = audios.find(a => a.audio_id === shareModal.itemId);
      if (audio) {
        const audioUrl = getAudioUrl(audio);
        generateQRCode(audioUrl);
      }
    }
  }, [shareModal.open, shareModal.itemId, shareModal.itemPath, userData.id, audios]);

  // Pagination calculations
  const totalPages = Math.ceil(totalAudiosCount / itemsPerPage);
  const currentAudios = audios; // audios now contains only the current page data

  // Multi-selection helper functions
  const toggleAudioSelection = (audioId: string) => {
    console.log('toggleAudioSelection called with audioId:', audioId);
    setSelectedAudios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(audioId)) {
        newSet.delete(audioId);
        console.log('Removed audioId:', audioId);
      } else {
        newSet.add(audioId);
        console.log('Added audioId:', audioId);
      }
      console.log('New selection set:', Array.from(newSet));
      return newSet;
    });
  };



  const clearSelection = () => {
    setSelectedAudios(new Set());
  };

  const getSelectedAudios = () => {
    return audios.filter(audio => selectedAudios.has(audio.audio_id));
  };

  // Multi-operation functions
  const handleMultiCopy = () => {
    const selected = getSelectedAudios();
    if (selected.length === 0) return;

    // Store multiple audios for copy operation
    localStorage.setItem('multiCopiedAudios', JSON.stringify(selected));
    setFileCopyState(1); // Copy mode
    setFileClipboard({ type: 'copy', items: selected });
    setIsMultiCopyActive(true);
    toast.success(`Copied ${selected.length} audio${selected.length > 1 ? 's' : ''}`);
  };

  const handleMultiCut = () => {
    const selected = getSelectedAudios();
    if (selected.length === 0) return;

    // Store multiple audios for cut operation
    localStorage.setItem('multiCopiedAudios', JSON.stringify(selected));
    setFileCopyState(2); // Cut mode
    setFileClipboard({ type: 'cut', items: selected });
    setIsMultiCopyActive(true);
    toast.success(`Cut ${selected.length} audio${selected.length > 1 ? 's' : ''}`);
  };

  const handleMultiPaste = async () => {
    const multiCopiedAudios = localStorage.getItem('multiCopiedAudios');
    if (!multiCopiedAudios) return;

    try {
      const audios = JSON.parse(multiCopiedAudios) as AudioData[];
      setIsMultiPasting(true);

      // Show initial toast
      toast.info('Starting multi-paste operation...', {
        description: `Processing ${audios.length} audio${audios.length > 1 ? 's' : ''}`,
        duration: 2000
      });

      for (const audio of audios) {
        await handleFilePasteOperation(audio);
      }

      // Clear the multi-copy state
      localStorage.removeItem('multiCopiedAudios');
      setFileCopyState(0);
      setFileClipboard(null);
      setIsMultiCopyActive(false);
      clearSelection();

      // Refresh the current folder to show updated content
      await fetchFolderFiles(currentPath);
      await fetchAudiosWithFilters();

      toast.success(`Successfully pasted ${audios.length} audio${audios.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Multi-paste error:', error);
      toast.error('Failed to paste some audios');
    } finally {
      setIsMultiPasting(false);
    }
  };

  const handleMultiDownload = async () => {
    const selected = getSelectedAudios();
    if (selected.length === 0) return;

    try {
      setIsMultiDownloading(true);

      // Show initial toast
      toast.info('Starting multi-download operation...', {
        description: `Processing ${selected.length} audio${selected.length > 1 ? 's' : ''}`,
        duration: 2000
      });

      for (const audio of selected) {
        await handleDownload(audio.audio_id);
      }

      toast.success(`Successfully downloaded ${selected.length} audio${selected.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Multi-download error:', error);
      toast.error('Failed to download some audios');
    } finally {
      setIsMultiDownloading(false);
    }
  };

  const handleMultiDelete = async () => {
    const selected = getSelectedAudios();
    if (selected.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selected.length} audio${selected.length > 1 ? 's' : ''}?`)) {
      try {
        for (const audio of selected) {
          await handleDelete(audio);
        }
        clearSelection();
        toast.success(`Deleted ${selected.length} audio${selected.length > 1 ? 's' : ''}`);
      } catch (error) {
        console.error('Multi-delete error:', error);
        toast.error('Failed to delete some audios');
      }
    }
  };

  // Helper functions for file operations
  const checkFileExists = async (fileName: string): Promise<boolean> => {
    try {
      const response = await fetch(`${config.backend_url}/getfilenames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `audio/${currentPath}`
        })
      });

      if (response.ok) {
        const files = await response.json();
        return files.some((file: any) => file.Key === fileName);
      }
      return false;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  const checkFileExistsInDatabase = async (fileName: string): Promise<boolean> => {
    try {
      const response = await fetch(`${config.supabase_server_url}/audio?user_uuid=eq.${userData.id}&filename=eq.${encodeURIComponent(fileName)}&audio_path=eq.${encodeURIComponent(currentPath)}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const audios = await response.json();
        return audios.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Error checking file existence in database:', error);
      return false;
    }
  };

  // Helper function for paste operations
  const handleFilePasteOperation = async (audio: AudioData) => {
    const operationType = fileCopyState === 1 ? 'copying' : 'moving';
    const fileName = audio.filename;
    const route = audio.audio_path === "" ? "audio" : `audio/${audio.audio_path}`;
    const newRoute = `audio/${currentPath}`;

    // Check if file already exists in destination
    const fileExists = await checkFileExists(fileName);
    const fileExistsInDb = await checkFileExistsInDatabase(fileName);

    if (fileExists || fileExistsInDb) {
      toast.warning(`Audio "${fileName}" already exists in this location. Skipping paste operation.`, {
        description: 'Please rename the existing audio or choose a different location.',
        duration: 5000
      });
      return;
    }

    console.log("Copied Audio:", `${route}/${fileName}`);
    console.log("New Route:", `${newRoute}/${fileName}`);

    await fetch(`${config.backend_url}/copyfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify({
        user: userData.id,
        sourcefilename: `${route}/${fileName}`,
        destinationfilename: `${newRoute}/${fileName}`
      })
    });

    const postAudio = {
      ...audio,
      audio_path: currentPath
    };

    delete postAudio.audio_id;

    await fetch(`${config.supabase_server_url}/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify(postAudio)
    });

    if (fileCopyState === 2) {
      // Remove from current location if it's a cut operation
      await fetch(`${config.backend_url}/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `${route}/${fileName}`
        })
      });

      await fetch(`${config.supabase_server_url}/audio?audio_id=eq.${audio.audio_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });
    }
  };

  // Audio helper functions
  const getAudioUrl = (audio: AudioData) => {
    return `${config.data_url}/${userData.id}/audio/${audio.audio_path ? audio.audio_path + '/' : ''}${audio.filename}`;
  };

  const formatCharacterCost = (cost: number) => {
    return `${cost} chars`;
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
    // Prevent multiple downloads of the same audio
    if (downloadingAudios.has(audioId)) {
      return;
    }

    try {
      const audio = audios.find(a => a.audio_id === audioId);
      if (!audio) return;

      // Set downloading state
      setDownloadingAudios(prev => new Set(prev).add(audioId));
      setDownloadProgress(prev => ({ ...prev, [audioId]: 0 }));

      // Show initial toast
      toast.info('Preparing download...', {
        description: `Starting download for "${audio.filename || audio.audio_id}"`,
        duration: 2000
      });

      const path = currentPath === "" ? "audio" : `audio/${currentPath}`;

      // Update progress to 25%
      setDownloadProgress(prev => ({ ...prev, [audioId]: 25 }));

      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `${path}/${audio.filename}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Update progress to 50%
      setDownloadProgress(prev => ({ ...prev, [audioId]: 50 }));

      // Show downloading toast
      toast.info('Downloading audio...', {
        description: `Processing "${audio.filename || audio.audio_id}"`,
        duration: 2000
      });

      const blob = await response.blob();

      // Update progress to 75%
      setDownloadProgress(prev => ({ ...prev, [audioId]: 75 }));

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = audio.filename || `audio-${audioId}.mp3`;

      // Update progress to 90%
      setDownloadProgress(prev => ({ ...prev, [audioId]: 90 }));

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update progress to 100%
      setDownloadProgress(prev => ({ ...prev, [audioId]: 100 }));

      // Show success toast
      toast.success('Download completed!', {
        description: `"${audio.filename || audio.audio_id}" has been downloaded successfully`,
        duration: 3000
      });

      // Clear download state after a short delay
      setTimeout(() => {
        setDownloadingAudios(prev => {
          const newSet = new Set(prev);
          newSet.delete(audioId);
          return newSet;
        });
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[audioId];
          return newProgress;
        });
      }, 1000);

    } catch (error) {
      console.error('Error downloading audio:', error);

      // Find audio again for error message
      const audio = audios.find(a => a.audio_id === audioId);

      // Show error toast
      toast.error('Download failed', {
        description: `Failed to download "${audio?.filename || audioId}". Please try again.`,
        duration: 5000
      });

      // Clear download state
      setDownloadingAudios(prev => {
        const newSet = new Set(prev);
        newSet.delete(audioId);
        return newSet;
      });
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[audioId];
        return newProgress;
      });
    }
  };

  // Handle share
  const handleShare = (audioId: string) => {
    const audio = audios.find(a => a.audio_id === audioId);
    if (!audio) return;

    const audioPath = audio.audio_path || 'audio';
    setShareModal({ open: true, itemId: audioId, itemPath: audioPath });
  };

  const generateQRCode = async (url: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Handle delete
  const handleDelete = async (audio: AudioData) => {
    setDeleteAudioModal({ open: true, audio });
  };

  // Confirm delete audio
  const confirmDeleteAudio = async () => {
    if (!deleteAudioModal.audio) return;

    const audio = deleteAudioModal.audio;

    try {
      // Show loading toast
      const loadingToast = toast.loading('Deleting audio...', {
        description: `Removing "${audio.filename || audio.audio_id}"`,
        duration: Infinity
      });

      // Delete from database
      const response = await fetch(`${config.supabase_server_url}/audio?audio_id=eq.${audio.audio_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      // Delete the actual file
      const fileName = audio.filename || `${audio.audio_id}.mp3`;
      
      await fetch(`${config.backend_url}/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `audio/${currentPath ? currentPath + '/' : ''}${fileName}`
        })
      });

      if (response.ok) {
        // Refresh current folder content
        await fetchFolderFiles(currentPath);

        // Update toast to success
        toast.success('Audio deleted successfully!', {
          id: loadingToast,
          description: `"${audio.filename || audio.audio_id}" has been permanently deleted`,
          duration: 3000
        });
      } else {
        throw new Error('Failed to delete audio');
      }
    } catch (error) {
      console.error('Error deleting audio:', error);
      toast.error('Failed to delete audio', {
        description: 'An error occurred while deleting the audio. Please try again.',
        duration: 5000
      });
    } finally {
      // Close modal
      setDeleteAudioModal({ open: false, audio: null });
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await fetchFolderFiles(currentPath);
    toast.success('Audios refreshed');
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing search
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

      const response = await fetch(`${config.backend_url}/createfolder`, {
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
      const createResponse = await fetch(`${config.backend_url}/createfolder`, {
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
      const allAudiosResponse = await fetch(`${config.supabase_server_url}/audio?user_uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      const allAudios = await allAudiosResponse.json();
      const audiosInFolder = allAudios.filter(audio => audio.audio_path === oldPath || (oldPath === "" && audio.audio_path === ""));
      
      if (audiosInFolder.length > 0) {
        console.log('Moving', audiosInFolder.length, 'audios from old folder to new folder');
        
        for (const audio of audiosInFolder) {
          // Extract the filename from the audio path
          const audioPath = audio.audio_path || getAudioUrl(audio);
          const fileName = audio.filename || `${audio.audio_id}.mp3`;
          
          console.log(`Attempting to move audio: ${fileName}`);
          console.log(`From: audio/${oldPath}/${fileName}`);
          console.log(`To: audio/${newPath}/${fileName}`);
          
          // Copy the audio file from old location to new location
          const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              sourcefilename: `audio/${oldPath === '' ? '' : oldPath + '/'}${fileName}`,
              destinationfilename: `audio/${newPath === '' ? '' : newPath + '/'}${fileName}`
            })
          });

          if (!copyResponse.ok) {
            const errorText = await copyResponse.text();
            console.error(`Failed to copy audio file ${fileName}:`, errorText);
            console.error(`Response status: ${copyResponse.status}`);
            throw new Error(`Failed to copy audio file ${fileName}: ${errorText}`);
          }

          console.log(`Successfully copied audio file ${fileName}`);

          // Update the audio_path in database
          const updateResponse = await fetch(`${config.supabase_server_url}/audio?audio_id=eq.${audio.audio_id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              audio_path: newPath
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
      const getFoldersResponse = await fetch(`${config.backend_url}/getfoldernames`, {
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
            // Check if folder.Key exists before processing
            if (!folder.Key || typeof folder.Key !== 'string') {
              console.log('Skipping folder with invalid Key:', folder);
              continue;
            }

            const folderKey = folder.Key;
            const re = new RegExp(`^.*?audio/${oldPath}/`);
            const relativePath = folderKey.replace(re, "").replace(/\/$/, "");

            console.log("Folder Key:", folderKey);
            console.log("Relative Path:", relativePath);

            if (relativePath && relativePath !== folderKey) {
              // Create the subfolder in the new location
              const subfolderCreateResponse = await fetch(`${config.backend_url}/createfolder`, {
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
                const subfolderAudios = allAudios.filter(audio => audio.audio_path === `${oldPath}/${relativePath}`);
                
                for (const audio of subfolderAudios) {
                  // Extract the filename from the audio path
                  const audioPath = audio.audio_path || getAudioUrl(audio);
                  const fileName = audio.filename || `${audio.audio_id}.mp3`;
                  
                  console.log(`Attempting to move audio in subfolder: ${fileName}`);
                  console.log(`From: audio/${oldPath}/${relativePath}/${fileName}`);
                  console.log(`To: audio/${newPath}/${relativePath}/${fileName}`);
                  
                  // Copy the audio file from old subfolder location to new subfolder location
                  const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer WeInfl3nc3withAI'
                    },
                    body: JSON.stringify({
                      user: userData.id,
                      sourcefilename: `audio/${oldPath === '' ? '' : oldPath + '/'}${relativePath}/${fileName}`,
                      destinationfilename: `audio/${newPath === '' ? '' : newPath + '/'}${relativePath}/${fileName}`
                    })
                  });

                  if (!copyResponse.ok) {
                    const errorText = await copyResponse.text();
                    console.error(`Failed to copy audio file ${fileName} in subfolder ${relativePath}:`, errorText);
                    throw new Error(`Failed to copy audio file ${fileName} in subfolder ${relativePath}: ${errorText}`);
                  }

                  console.log(`Successfully copied audio file ${fileName} in subfolder ${relativePath}`);

                  // Update the audio_path in database
                  const updateResponse = await fetch(`${config.supabase_server_url}/audio?audio_id=eq.${audio.audio_id}`, {
                    method: 'PATCH',
                    headers: {
                      'Authorization': 'Bearer WeInfl3nc3withAI',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      audio_path: `${newPath}/${relativePath}`
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
      const deleteResponse = await fetch(`${config.backend_url}/deletefolder`, {
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
      const refreshResponse = await fetch(`${config.backend_url}/getfoldernames`, {
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

  // Delete folder modal state
  const [deleteFolderModal, setDeleteFolderModal] = useState<{ open: boolean; folderPath: string | null; folderName: string | null }>({ open: false, folderPath: null, folderName: null });

  // Delete audio modal state
  const [deleteAudioModal, setDeleteAudioModal] = useState<{ open: boolean; audio: AudioData | null }>({ open: false, audio: null });

  const handleDeleteFolder = async (folderPath: string) => {
    const folderName = decodeName(folderPath.split('/').pop() || '');
    setDeleteFolderModal({ open: true, folderPath, folderName });
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderModal.folderPath) return;

    try {
      // Show loading toast
      const loadingToast = toast.loading('Deleting folder...', {
        description: `Removing "${deleteFolderModal.folderName}" and all its contents`,
        duration: Infinity
      });

      const response = await fetch(`${config.backend_url}/deletefolder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `audio/${deleteFolderModal.folderPath}`
        })
      });

      if (response.ok) {
        // Refresh folders from API
        const refreshResponse = await fetch(`${config.backend_url}/getfoldernames`, {
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
          setFolderStructure(buildFolderStructure(data));
        }
        
        // Refresh current folder content
        await fetchFolderFiles(currentPath);

        // Update toast to success
        toast.success('Folder deleted successfully!', {
          id: loadingToast,
          description: `"${deleteFolderModal.folderName}" and all its contents have been permanently deleted`,
          duration: 3000
        });
        
        // Close modal
        setDeleteFolderModal({ open: false, folderPath: null, folderName: null });
      } else {
        throw new Error('Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder', {
        description: 'An error occurred while deleting the folder. Please try again.',
        duration: 5000
      });
    }
  };

  const handleCopy = (folderPath: string) => {
    setClipboard({ type: 'copy', items: [folderPath] });
    setCopyState(1);
    toast.success('Folder copied to clipboard', {
      description: `"${folderPath.split('/').pop() || folderPath}" is ready to be pasted`,
      duration: 3000
    });
  };

  const handleCut = (folderPath: string) => {
    setClipboard({ type: 'cut', items: [folderPath] });
    setCopyState(2);
    toast.success('Folder cut to clipboard', {
      description: `"${folderPath.split('/').pop() || folderPath}" is ready to be moved`,
      duration: 3000
    });
  };

  const handlePaste = async () => {
    if (!clipboard || copyState === 0) return;

    setIsPasting(true);
    try {
      // Show initial loading toast
      const loadingToast = toast.loading(`${clipboard.type === 'copy' ? 'Copying' : 'Moving'} folder...`, {
        description: `Processing "${clipboard.items[0].split('/').pop() || clipboard.items[0]}"`,
        duration: Infinity
      });
      for (const sourcePath of clipboard.items) {
        const sourceName = sourcePath.split('/').pop() || '';
        const destPath = currentPath ? `${currentPath}/${sourceName}` : sourceName;

        // Check if trying to copy/move folder into itself or its subfolder
        if (destPath === sourcePath || destPath.startsWith(sourcePath + '/')) {
          toast.error('Cannot copy/move folder into itself or its subfolder', {
            description: 'Please choose a different destination',
            duration: 5000
          });
          return;
        }

        console.log(`Starting ${clipboard.type} operation for folder: ${sourcePath} to ${destPath}`);

        // Step 1: Create the destination folder
        const createResponse = await fetch(`${config.backend_url}/createfolder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            parentfolder: `audio/${currentPath ? currentPath + '/' : ''}`,
            folder: sourceName
          })
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          if (errorText.includes('already exists') || errorText.includes('duplicate')) {
            toast.error('Folder already exists', {
              description: `A folder named "${sourceName}" already exists in this location`,
              duration: 5000
            });
            return;
          }
          throw new Error(`Failed to create destination folder: ${errorText}`);
        }

        console.log('Destination folder created successfully');

        // Step 2: Get all audios from the source folder and copy them
        const allAudiosResponse = await fetch(`${config.supabase_server_url}/audio?user_uuid=eq.${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI',
            'Content-Type': 'application/json'
          }
        });

        const allAudios = await allAudiosResponse.json();
        const audiosInSourceFolder = allAudios.filter(audio => audio.audio_path === sourcePath);
        
        if (audiosInSourceFolder.length > 0) {
          console.log(`Copying ${audiosInSourceFolder.length} audios from source folder`);
          
          for (const audio of audiosInSourceFolder) {
            const fileName = audio.filename || `${audio.audio_id}.mp3`;
            
            console.log(`Copying audio: ${fileName}`);
            console.log(`From: audio/${sourcePath}/${fileName}`);
            console.log(`To: audio/${destPath}/${fileName}`);
            
            // Copy the audio file
            const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              },
              body: JSON.stringify({
                user: userData.id,
                sourcefilename: `audio/${sourcePath === '' ? '' : sourcePath + '/'}${fileName}`,
                destinationfilename: `audio/${destPath === '' ? '' : destPath + '/'}${fileName}`
              })
            });

            if (!copyResponse.ok) {
              const errorText = await copyResponse.text();
              console.error(`Failed to copy audio file ${fileName}:`, errorText);
              throw new Error(`Failed to copy audio file ${fileName}: ${errorText}`);
            }

            console.log(`Successfully copied audio file ${fileName}`);

            if (clipboard.type === 'copy') {
              // For copy operation, create a new database entry
              const newAudioData = {
                ...audio,
                audio_path: destPath
              };
              delete newAudioData.audio_id; // Remove ID so database generates new one

              const createAudioResponse = await fetch(`${config.supabase_server_url}/audio`, {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer WeInfl3nc3withAI',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(newAudioData)
              });

              if (!createAudioResponse.ok) {
                const errorText = await createAudioResponse.text();
                console.warn(`Failed to create new audio record for ${fileName}:`, errorText);
              } else {
                console.log(`Successfully created new audio record for ${fileName}`);
              }
            } else {
              // For cut operation, update the existing database entry
              const updateResponse = await fetch(`${config.supabase_server_url}/audio?audio_id=eq.${audio.audio_id}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': 'Bearer WeInfl3nc3withAI',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  audio_path: destPath
                })
              });

              if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.warn(`Failed to update audio path for audio ${audio.audio_id}:`, errorText);
              } else {
                console.log(`Successfully updated audio path for audio ${audio.audio_id}`);
              }
            }
          }
        }

        // Step 3: Handle subfolders recursively
        const getFoldersResponse = await fetch(`${config.backend_url}/getfoldernames`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            folder: `audio/${sourcePath}`
          })
        });

        if (getFoldersResponse.ok) {
          const folders = await getFoldersResponse.json();
          console.log('Subfolders to copy:', folders);

          if (folders && folders.length > 0 && folders[0].Key) {
            for (const folder of folders) {
              // Check if folder.Key exists before processing
              if (!folder.Key || typeof folder.Key !== 'string') {
                console.log('Skipping folder with invalid Key:', folder);
                continue;
              }

              const folderKey = folder.Key;
              const re = new RegExp(`^.*?audio/${sourcePath}/`);
              const relativePath = folderKey.replace(re, "").replace(/\/$/, "");

              console.log("Processing subfolder:", relativePath);

              if (relativePath && relativePath !== folderKey) {
                // Create the subfolder in the destination
                const subfolderCreateResponse = await fetch(`${config.backend_url}/createfolder`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer WeInfl3nc3withAI'
                  },
                  body: JSON.stringify({
                    user: userData.id,
                    parentfolder: `audio/${destPath}/`,
                    folder: relativePath
                  })
                });

                if (subfolderCreateResponse.ok) {
                  // Copy audios in this subfolder
                  const subfolderAudios = allAudios.filter(audio => audio.audio_path === `${sourcePath}/${relativePath}`);
                  
                  for (const audio of subfolderAudios) {
                    const fileName = audio.filename || `${audio.audio_id}.mp3`;
                    
                    console.log(`Copying audio in subfolder: ${fileName}`);
                    console.log(`From: audio/${sourcePath}/${relativePath}/${fileName}`);
                    console.log(`To: audio/${destPath}/${relativePath}/${fileName}`);
                    
                    // Copy the audio file
                    const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WeInfl3nc3withAI'
                      },
                      body: JSON.stringify({
                        user: userData.id,
                        sourcefilename: `audio/${sourcePath === '' ? '' : sourcePath + '/'}${relativePath}/${fileName}`,
                        destinationfilename: `audio/${destPath === '' ? '' : destPath + '/'}${relativePath}/${fileName}`
                      })
                    });

                    if (!copyResponse.ok) {
                      const errorText = await copyResponse.text();
                      console.error(`Failed to copy audio file ${fileName} in subfolder ${relativePath}:`, errorText);
                      throw new Error(`Failed to copy audio file ${fileName} in subfolder ${relativePath}: ${errorText}`);
                    }

                    console.log(`Successfully copied audio file ${fileName} in subfolder ${relativePath}`);

                    if (clipboard.type === 'copy') {
                      // For copy operation, create a new database entry
                      const newAudioData = {
                        ...audio,
                        audio_path: `${destPath}/${relativePath}`
                      };
                      delete newAudioData.audio_id;

                      const createAudioResponse = await fetch(`${config.supabase_server_url}/audio`, {
                        method: 'POST',
                        headers: {
                          'Authorization': 'Bearer WeInfl3nc3withAI',
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newAudioData)
                      });

                      if (!createAudioResponse.ok) {
                        const errorText = await createAudioResponse.text();
                        console.warn(`Failed to create new audio record for ${fileName} in subfolder:`, errorText);
                      } else {
                        console.log(`Successfully created new audio record for ${fileName} in subfolder`);
                      }
                    } else {
                      // For cut operation, update the existing database entry
                      const updateResponse = await fetch(`${config.supabase_server_url}/audio?audio_id=eq.${audio.audio_id}`, {
                        method: 'PATCH',
                        headers: {
                          'Authorization': 'Bearer WeInfl3nc3withAI',
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          audio_path: `${destPath}/${relativePath}`
                        })
                      });

                      if (!updateResponse.ok) {
                        const errorText = await updateResponse.text();
                        console.warn(`Failed to update audio path for audio ${audio.audio_id} in subfolder:`, errorText);
                      } else {
                        console.log(`Successfully updated audio path for audio ${audio.audio_id} in subfolder`);
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
          console.log(`Deleting source folder: audio/${sourcePath}`);
          const deleteResponse = await fetch(`${config.backend_url}/deletefolder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              folder: `audio/${sourcePath}`
            })
          });

          if (!deleteResponse.ok) {
            console.warn('Failed to delete source folder, but cut operation completed');
          } else {
            console.log('Successfully deleted source folder');
          }
        }
      }

      // Update toast to success
      toast.success(`Folder ${clipboard.type === 'copy' ? 'copied' : 'moved'} successfully!`, {
        id: loadingToast,
        description: `"${clipboard.items[0].split('/').pop() || clipboard.items[0]}" has been ${clipboard.type === 'copy' ? 'copied' : 'moved'} to current location`,
        duration: 3000
      });

      // Clear clipboard
      setClipboard(null);
      setCopyState(0);
      
      // Refresh folders
      const response = await fetch(`${config.backend_url}/getfoldernames`, {
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

      // Refresh current folder content
      await fetchFolderFiles(currentPath);

    } catch (error) {
      console.error('Error pasting folder:', error);
      toast.error(`Failed to ${clipboard?.type === 'copy' ? 'copy' : 'move'} folder`, {
        description: 'An error occurred during the operation. Please try again.',
        duration: 5000
      });
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
    toast.success('Audio copied to clipboard', {
      description: `"${audio.filename || audio.audio_id}" is ready to be pasted`,
      duration: 3000
    });
  };

  const handleFileCut = (audio: AudioData) => {
    setFileClipboard({ type: 'cut', items: [audio] });
    setFileCopyState(2);
    toast.success('Audio cut to clipboard', {
      description: `"${audio.filename || audio.audio_id}" is ready to be moved`,
      duration: 3000
    });
  };

  const clearFileClipboard = () => {
    setFileClipboard(null);
    setFileCopyState(0);
  };

  const handleFilePaste = async () => {
    if (!fileClipboard || fileCopyState === 0) return;

    setIsPastingFile(true);
    try {
      // Show initial toast
      const loadingToast = toast.loading(`${fileClipboard.type === 'copy' ? 'Copying' : 'Moving'} audio...`, {
        description: `Processing ${fileClipboard.items.length} audio file(s)`,
        duration: Infinity
      });

      for (const audio of fileClipboard.items) {
        const fileName = audio.filename || `${audio.audio_id}.mp3`;

        // Determine source path from audio's current location
        const sourcePath = audio.audio_path || '';

        const targetPath = currentPath || '';

        // Check if file already exists in target folder
        const existingAudio = audios.find(a =>
          a.filename === fileName &&
          (a.audio_path || getAudioUrl(a)).includes(`/audio/${targetPath}/`)
        );

        if (existingAudio) {
          console.warn(`File ${fileName} already exists in target folder, skipping`);
          continue;
        }

        // Update toast to show progress
        toast.loading(`${fileClipboard.type === 'copy' ? 'Copying' : 'Moving'} ${fileName}...`, {
          id: loadingToast,
          description: `Processing "${fileName}"`
        });

        if (fileClipboard.type === 'copy') {
          // Copy operation: Create new file and database entry

          // Copy the file
          const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              sourcefilename: `audio/${sourcePath === '' ? '' : sourcePath + '/'}${fileName}`,
              destinationfilename: `audio/${targetPath === '' ? '' : targetPath + '/'}${fileName}`
            })
          });

          if (!copyResponse.ok) {
            const errorText = await copyResponse.text();
            console.error(`Failed to copy audio file ${fileName}:`, errorText);
            throw new Error(`Failed to copy audio file ${fileName}: ${errorText}`);
          }

          const newAudioData = {
            ...audio,
            audio_path: targetPath
          };
          delete newAudioData.audio_id; // Remove ID so database generates new one

          const createResponse = await fetch(`${config.supabase_server_url}/audio`, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newAudioData)
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.warn(`Failed to create new audio record for ${fileName}:`, errorText);
          } else {
            console.log(`Successfully created new audio record for ${fileName}`);
          }

        } else {
          // Cut operation: Move file and update database entry

          // Copy the file to new location
          const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              sourcefilename: `audio/${sourcePath === '' ? '' : sourcePath + '/'}${fileName}`,
              destinationfilename: `audio/${targetPath === '' ? '' : targetPath + '/'}${fileName}`
            })
          });

          if (!copyResponse.ok) {
            const errorText = await copyResponse.text();
            console.error(`Failed to copy audio file ${fileName}:`, errorText);
            throw new Error(`Failed to copy audio file ${fileName}: ${errorText}`);
          }

          // Update database entry
          const updateResponse = await fetch(`${config.supabase_server_url}/audio?audio_id=eq.${audio.audio_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              audio_path: targetPath
            })
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.warn(`Failed to update audio URL for audio ${audio.audio_id}:`, errorText);
          } else {
            console.log(`Successfully updated audio URL for audio ${audio.audio_id}`);
          }

          // Delete the file from the source location
          const deleteResponse = await fetch(`${config.backend_url}/deletefile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              filename: `audio/${sourcePath}/${fileName}`
            })
          });

          if (!deleteResponse.ok) {
            console.warn(`Failed to delete original file ${fileName}, but move operation completed`);
          }
        }

        console.log(`Successfully ${fileClipboard.type === 'copy' ? 'copied' : 'moved'} ${fileName}`);
      }

      // Refresh current folder content
      await fetchFolderFiles(currentPath);

      // Update toast to success
      toast.success(`Audio ${fileClipboard.type === 'copy' ? 'copied' : 'moved'} successfully!`, {
        id: loadingToast,
        description: `${fileClipboard.items.length} audio file(s) ${fileClipboard.type === 'copy' ? 'copied' : 'moved'} to current folder`,
        duration: 3000
      });

      // Clear clipboard
      setFileClipboard(null);
      setFileCopyState(0);
      
      // Refresh the current folder to show updated content
      await fetchFolderFiles(currentPath);
      await fetchAudiosWithFilters();

    } catch (error) {
      console.error('Error pasting audio:', error);
      toast.error(`Failed to ${fileClipboard?.type === 'copy' ? 'copy' : 'move'} audio`, {
        description: 'An error occurred during the operation. Please try again.',
        duration: 5000
      });
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
      const response = await fetch(`${config.backend_url}/getfilenames`, {
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
          // Check if file.Key exists before calling replace
          if (!file.Key || typeof file.Key !== 'string') {
            return false;
          }

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
      // Check if folder.Key exists before processing
      if (!folder.Key || typeof folder.Key !== 'string') {
        return false;
      }

      const folderPath = folder.Key;
      const currentPathParts = currentPath.split('/');
      const folderPathParts = folderPath.split('/');
      
      // Check if this folder is an immediate child of current path
      return folderPathParts.length === currentPathParts.length + 1 &&
             folderPathParts.slice(0, currentPathParts.length).join('/') === currentPath;
    });
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, audio: AudioData) => {
    setDraggedAudio(audio);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', audio.filename || audio.audio_id);

    // Show toast when drag starts
    toast.info('Drag started', {
      description: `Moving "${audio.filename || audio.audio_id}" - drop on a folder to move it`,
      duration: 3000
    });
  };

  const handleDragEnd = () => {
    setDraggedAudio(null);
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

    // Handle direct audio drag and drop
    if (!draggedAudio) return;

    // Don't allow dropping into the same folder
    const audioPath = draggedAudio.audio_path || getAudioUrl(draggedAudio);
    const currentAudioPath = audioPath.includes(`/audio/${targetFolderPath}/`) ? targetFolderPath : '';
    if (currentAudioPath === targetFolderPath) {
      toast.error('Audio is already in this folder');
      return;
    }

    // Show moving process toast
    const movingToast = toast.loading('Moving audio...', {
      description: `Moving "${draggedAudio.filename || draggedAudio.audio_id}" to ${targetFolderPath || 'root'}`,
      duration: Infinity
    });

    try {
      const fileName = draggedAudio.filename || `${draggedAudio.audio_id}.mp3`;
      const sourcePath = currentPath || '';
      const targetPath = targetFolderPath || '';

      // Update toast to show progress
      toast.loading('Updating database...', {
        id: movingToast,
        description: `Updating audio location in database`
      });

      // Update the audio's audio_path in the database
      const response = await fetch(`${config.supabase_server_url}/audio?audio_id=eq.${draggedAudio.audio_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          audio_path: targetPath
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update database');
      }

      // Copy the file to the target folder
      toast.loading('Copying file...', {
        id: movingToast,
        description: `Copying "${fileName}" to new location`
      });

      const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `audio/${sourcePath === '' ? '' : sourcePath + '/'}${fileName}`,
          destinationfilename: `audio/${targetPath === '' ? '' : targetPath + '/'}${fileName}`
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

      const deleteResponse = await fetch(`${config.backend_url}/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `audio/${sourcePath === '' ? '' : sourcePath + '/'}${fileName}`
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
      toast.success(`Audio moved successfully!`, {
        id: movingToast,
        description: `"${fileName}" has been moved to ${targetFolderPath || 'root'}`,
        duration: 4000
      });

    } catch (error) {
      console.error('Error moving audio:', error);
      toast.error('Failed to move audio', {
        id: movingToast,
        description: 'An error occurred during the move operation. Please try again.',
        duration: 5000
      });
    }
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
  
  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      handlePageChange(pageNumber);
      setGoToPageInput('');
    } else {
      toast.error(`Please enter a page number between 1 and ${totalPages}`);
    }
  };

  return (
    <div className="px-6 space-y-4">
      <LibraryRetentionNotice libraryType="audios" />
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
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
            title={fileClipboard ? `${fileClipboard.type === 'copy' ? 'Copy' : 'Move'} ${fileClipboard.items.length} audio file(s)` : 'No audio in clipboard'}
          >
            {isPastingFile ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                {fileCopyState === 1 ? `Paste Copy (${fileClipboard?.items.length || 0})` : fileCopyState === 2 ? `Paste Move (${fileClipboard?.items.length || 0})` : 'Paste Audio'}
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="character_cost">Character Cost</SelectItem>
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
            onClick={clearSearch}
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

      {/* Multi-selection toolbar */}
      {isMultiSelectMode && (
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm mb-4 justify-between">
                <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
                </div>
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              {selectedAudios.size > 0 
                ? `${selectedAudios.size} audio${selectedAudios.size > 1 ? 's' : ''} selected`
                : 'Multi-select mode - Click audios to select'
              }
            </span>
              </div>

          <div className="flex items-center gap-1">
                <Button
              variant="outline"
                  size="sm"
              onClick={handleMultiCopy}
              disabled={selectedAudios.size === 0 || isMultiCopyActive}
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
              disabled={selectedAudios.size === 0 || isMultiCopyActive}
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
              disabled={selectedAudios.size === 0 || isMultiDownloading}
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
              disabled={selectedAudios.size === 0}
              className="h-8 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={selectedAudios.size === 0}
              className="h-8 text-xs bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
                </Button>
              </div>
        </div>
      )}

      {/* Audio Grid */}
      {audiosLoading ? (
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
              ) : totalAudiosCount === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">

          {/* Empty state message */}
          <div className="col-span-full text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">No audios found</h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search criteria to find what you're looking for.</p>
                <Button onClick={clearSearch} variant="outline" className="gap-2">
                  <Search className="w-4 h-4" />
                  Clear Search
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">

          {/* Audio Cards */}
          {currentAudios.map((audio) => (
            <Card
              key={audio.audio_id}
              className={`group cursor-pointer overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isDragging && draggedAudio?.audio_id === audio.audio_id ? 'opacity-50 scale-95' : ''
                } ${fileClipboard && fileClipboard.items.some(item => item.audio_id === audio.audio_id)
                  ? 'ring-2 ring-green-500 ring-opacity-50 bg-green-50 dark:bg-green-950/20'
                  : ''
                } ${selectedAudios.has(audio.audio_id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, audio)}
              onDragEnd={handleDragEnd}
              onClick={(e) => {
                console.log('Audio card clicked:', audio.audio_id);
                console.log('isMultiSelectMode:', isMultiSelectMode);
                console.log('e.ctrlKey:', e.ctrlKey, 'e.metaKey:', e.metaKey);
                
                // Handle multi-selection with Ctrl/Cmd key or multi-select mode
                if (e.ctrlKey || e.metaKey || isMultiSelectMode) {
                  e.preventDefault();
                  console.log('Calling toggleAudioSelection for:', audio.audio_id);
                  toggleAudioSelection(audio.audio_id);
                } else {
                  console.log('Calling handleAudioSelect for:', audio.audio_id);
                  handleAudioSelect(audio);
                }
              }}
              onContextMenu={(e) => handleFileContextMenu(e, audio)}
            >
              {/* Audio Preview */}
              <div className="relative aspect-video bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>

                {/* Selection indicator */}
                {selectedAudios.has(audio.audio_id) && (
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                    
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
                  </div>

                  {/* Audio Info */}
                  <CardContent className="p-4 space-y-3">
                    {/* Title and format */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                    {audio.filename || audio.prompt.substring(0, 60)}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      MP3
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
                  <span>{formatAudioDate(audio.created_at)}</span>
                    </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1.5 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs font-medium hover:bg-purple-700 hover:border-purple-500 transition-colors"
                    disabled={downloadingAudios.has(audio.audio_id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(audio.audio_id);
                      }}
                    >
                    {downloadingAudios.has(audio.audio_id) ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1.5"></div>
                        <span className="hidden sm:inline">
                          {downloadProgress[audio.audio_id] === 100 ? 'Complete!' : `Downloading ${downloadProgress[audio.audio_id] || 0}%`}
                        </span>
                      </>
                    ) : (
                      <>
                      <Download className="w-3 h-3 mr-1.5" />
                      <span className="hidden sm:inline">Download</span>
                      </>
                    )}
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

                {/* Download Progress Bar */}
                {downloadProgress[audio.audio_id] && downloadProgress[audio.audio_id] < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
                      style={{ width: `${downloadProgress[audio.audio_id]}%` }}
                    />
                  </div>
                )}
                </CardContent>
            </Card>
          ))}
        </div>

      )}

      {/* Pagination Controls */}
              {totalAudiosCount > 0 && (
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
                            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalAudiosCount)} of {totalAudiosCount} audios
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

            {/* Go to page input */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Go to:</span>
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGoToPage();
                  }
                }}
                className="w-16 h-8 text-center text-sm"
                placeholder="Page"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToPage}
                className="h-8 px-2 text-sm"
              >
                Go
              </Button>
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
                  src={getAudioUrl(audios.find(a => a.audio_id === selectedAudio)!)}
                  controls
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => handleDownload(selectedAudio)}
                  variant="outline"
                  disabled={downloadingAudios.has(selectedAudio)}
                >
                  {downloadingAudios.has(selectedAudio) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      {downloadProgress[selectedAudio] === 100 ? 'Complete!' : `Downloading ${downloadProgress[selectedAudio] || 0}%`}
                    </>
                  ) : (
                    <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                    </>
                  )}
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
      <Dialog open={shareModal.open} onOpenChange={() => setShareModal({ open: false, itemId: null, itemPath: null })}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Share Content</h3>
              <p className="text-sm text-muted-foreground">Choose how you'd like to share this content</p>
            </div>

            {shareModal.itemId && (
              <>
                {/* Copy Link Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Direct Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={(() => {
                        const audio = audios.find(a => a.audio_id === shareModal.itemId);
                        return audio ? getAudioUrl(audio) : '';
                      })()}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const audio = audios.find(a => a.audio_id === shareModal.itemId);
                        if (audio) {
                          copyToClipboard(getAudioUrl(audio));
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">QR Code</Label>
                  <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg border">
                    {qrCodeDataUrl ? (
                      <>
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code" 
                          className="w-32 h-32 border border-gray-200 rounded-lg"
                        />
                        <div className="text-xs text-gray-600 text-center">
                          Scan to access content directly
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = qrCodeDataUrl;
                            link.download = 'qr-code.png';
                            link.click();
                          }}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download QR Code
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center w-32 h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Share on Social Media</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMediaFromModal('twitter', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMediaFromModal('facebook', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMediaFromModal('linkedin', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMediaFromModal('pinterest', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                      </svg>
                      Pinterest
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
                      This will permanently delete all audios and subfolders
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

      {/* Delete Audio Modal */}
      <Dialog open={deleteAudioModal.open} onOpenChange={(open) => !open && setDeleteAudioModal({ open: false, audio: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              Delete Audio
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. The audio file will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {deleteAudioModal.audio && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {deleteAudioModal.audio.filename || deleteAudioModal.audio.audio_id}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Audio file
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      This will permanently delete the audio file and its database record
                    </p>
                    {deleteAudioModal.audio.prompt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Prompt: {deleteAudioModal.audio.prompt.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteAudioModal({ open: false, audio: null })}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteAudio}
                className="bg-red-600 hover:bg-red-700 px-6"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Audio
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
            disabled={downloadingAudios.has(fileContextMenu.audio.audio_id)}
            onClick={() => {
              handleDownload(fileContextMenu.audio.audio_id);
              setFileContextMenu(null);
            }}
          >
            {downloadingAudios.has(fileContextMenu.audio.audio_id) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                {downloadProgress[fileContextMenu.audio.audio_id] === 100 ? 'Complete!' : `Downloading ${downloadProgress[fileContextMenu.audio.audio_id] || 0}%`}
              </>
            ) : (
              <>
            <Download className="w-4 h-4" />
            Download
              </>
            )}
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
    const audio = audios.find(a => a.audio_id === audioId);
    if (!audio) return;

    const audioUrl = audio.audio_path || getAudioUrl(audio);
    const shareText = `Check out this audio: ${audio.filename}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(audioUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(audioUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL
        navigator.clipboard.writeText(audioUrl);
        toast.success('Audio URL copied to clipboard for Instagram');
        return;
    }
    
    window.open(shareUrl, '_blank');
  }

  // Helper function for social media sharing from modal
  const shareToSocialMediaFromModal = (platform: string, itemId: string) => {
    // Find the audio data for the given itemId
    const audio = audios.find(a => a.audio_id === itemId);
    if (!audio) {
      toast.error('Audio not found');
      return;
    }
    
    const audioUrl = getAudioUrl(audio);
    const text = 'Check out this amazing audio!';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(audioUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(audioUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(audioUrl)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(audioUrl)}&description=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
} 