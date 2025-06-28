import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Image, Video, SortAsc, SortDesc, ZoomIn, Folder, Plus, Upload, ChevronRight, Home, ArrowLeft, Pencil, Menu, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DialogContentZoom } from '@/components/ui/zoomdialog';
import { DialogZoom } from '@/components/ui/zoomdialog';
import { removeFromVault } from '@/store/slices/contentSlice';

// Interface for folder data from API
interface FolderData {
  Key: string;
}

// Interface for task data from API
interface TaskData {
  id: string;
  type: string;
  created_at: string;
}

// Interface for file data from getfilenames API
interface FileData {
  Key: string;
  Size: string;
  LastModified: string;
  ETag: string;
  StorageClass: string;
}

// Interface for generated image data from database
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

// Interface for folder structure
interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
  isFolder: boolean;
}

export default function Vault() {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [vaultItems, setVaultItems] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ open: boolean; itemId: string | null }>({ open: false, itemId: null });

  // New folder modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderIcon, setSelectedFolderIcon] = useState('');
  const [uploadedIcon, setUploadedIcon] = useState<File | null>(null);
  const [folderIcons, setFolderIcons] = useState<string[]>([]);

  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [currentFolderItems, setCurrentFolderItems] = useState<TaskData[]>([]);

  // Folder renaming state
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderPath: string } | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);

  // File management state for home route
  const [files, setFiles] = useState<FileData[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // Detailed image modal state
  const [detailedImageModal, setDetailedImageModal] = useState<{ open: boolean; image: GeneratedImageData | null }>({ open: false, image: null });

  // Editing state for user notes and tags
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');

  // Multi-select filter state
  const [selectedFilters, setSelectedFilters] = useState<{
    fileTypes: string[];
    favorites: boolean | null;
    ratingRange: { min: number; max: number };
    withNotes: boolean | null;
    withTags: boolean | null;
    selectedTags: string[];
  }>({
    fileTypes: [],
    favorites: null,
    ratingRange: { min: 0, max: 5 },
    withNotes: null,
    withTags: null,
    selectedTags: []
  });

  // Tag selection modal state
  const [tagSelectionModal, setTagSelectionModal] = useState<{ open: boolean }>({ open: false });

  // Copy/Cut state
  const [copyState, setCopyState] = useState<number>(0); // 0 = none, 1 = copy, 2 = cut
  const [copiedPath, setCopiedPath] = useState<string>('');
  const [isPasting, setIsPasting] = useState<boolean>(false);

  // Filter menu state
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);

  // Load copy state from localStorage on component mount
  useEffect(() => {
    const savedCopyState = localStorage.getItem('copystate');
    const savedCopiedPath = localStorage.getItem('copiedPath');

    if (savedCopyState) {
      setCopyState(parseInt(savedCopyState));
    }
    if (savedCopiedPath) {
      setCopiedPath(savedCopiedPath);
    }
  }, []);

  // Save copy state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('copystate', copyState.toString());
    localStorage.setItem('copiedPath', copiedPath);
  }, [copyState, copiedPath]);

  // Add tag to filter when clicked on card
  const addTagToFilter = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedFilters.selectedTags.includes(trimmedTag)) {
      setSelectedFilters(prev => ({
        ...prev,
        selectedTags: [...prev.selectedTags, trimmedTag]
      }));
    }
  };

  // Get all available tags from generated images
  const getAllAvailableTags = (): string[] => {
    const allTags = new Set<string>();
    generatedImages.forEach(image => {
      if (image.user_tags && image.user_tags.length > 0) {
        image.user_tags.forEach(tag => {
          if (tag.trim()) {
            allTags.add(tag.trim());
          }
        });
      }
    });
    return Array.from(allTags).sort();
  };

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    // Remove the user ID and "vault/" prefix
    const pathWithoutPrefix = fullPath.replace(/^[^\/]+\/vault\//, '');
    return pathWithoutPrefix;
  };

  // Build folder structure from raw folder data
  const buildFolderStructure = (folderData: FolderData[]): FolderStructure[] => {
    const structure: FolderStructure[] = [];
    const pathMap = new Map<string, FolderStructure>();

    // console.log('Building folder structure from:', folderData);

    folderData.forEach(folder => {
      // console.log('Processing folder:', folder);
      // console.log('Folder key:', folder.Key);

      // Extract the folder path from the key
      const folderPath = extractFolderName(folder.Key);
      // console.log('Extracted folder path:', folderPath);

      if (!folderPath) {
        // console.log('No folder path extracted, skipping');
        return;
      }

      const pathParts = folderPath.split('/').filter(part => part.length > 0);
      // console.log('Path parts:', pathParts);

      let currentPath = '';

      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        // console.log(`Processing part "${part}", currentPath: "${currentPath}", parentPath: "${parentPath}"`);

        if (!pathMap.has(currentPath)) {
          const folderNode: FolderStructure = {
            name: part,
            path: currentPath,
            children: [],
            isFolder: true
          };

          pathMap.set(currentPath, folderNode);
          // console.log(`Created folder node:`, folderNode);

          if (parentPath && pathMap.has(parentPath)) {
            // console.log(`Adding to parent "${parentPath}"`);
            pathMap.get(parentPath)!.children.push(folderNode);
          } else if (!parentPath) {
            // console.log(`Adding to root structure`);
            structure.push(folderNode);
          }
        }
      });
    });

    // console.log('Final folder structure:', structure);
    return structure;
  };

  // Get items in current folder
  const getCurrentFolderItems = (): TaskData[] => {
    if (!currentPath) {
      return vaultItems;
    }

    // Filter items that belong to the current folder path
    // This is a simplified implementation - in a real system, items would have folder metadata
    return vaultItems.filter(item => {
      // For now, return all items since we don't have folder association yet
      // In the future, this would check item.folder_path === currentPath
      return true;
    });
  };

  // Update current folder items when path changes
  useEffect(() => {
    setCurrentFolderItems(getCurrentFolderItems());
  }, [currentPath, vaultItems]);

  // Navigate to folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setCurrentFolderItems(getCurrentFolderItems());
  };

  // Navigate to parent folder
  const navigateToParent = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
    setCurrentFolderItems(getCurrentFolderItems());
  };

  // Navigate to home (root)
  const navigateToHome = () => {
    setCurrentPath('');
    setCurrentFolderItems(vaultItems);
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
            folder: "vault"
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }

        const data = await response.json();
        // console.log('Raw folders data from API:', data);
        setFolders(data);

        // Build folder structure
        const structure = buildFolderStructure(data);
        // console.log('Built folder structure:', structure);
        setFolderStructure(structure);

        // If no structure was built, create a fallback from the raw data
        if (structure.length === 0 && data.length > 0) {
          // console.log('No structure built, creating fallback folders');
          const fallbackFolders = data.map((folder: FolderData) => ({
            name: folder.Key || extractFolderName(folder.Key) || 'Unknown Folder',
            path: folder.Key || extractFolderName(folder.Key) || 'unknown',
            children: [],
            isFolder: true
          }));
          // console.log('Fallback folders:', fallbackFolders);
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

  // Fetch data from API
  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://db.nymia.ai/rest/v1/tasks?uuid=eq.${userData.id}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vault data');
        }

        const data = await response.json();
        // console.log(data);
        setVaultItems(data);
        setCurrentFolderItems(data);
      } catch (error) {
        console.error('Error fetching vault data:', error);
        setVaultItems([]);
        setCurrentFolderItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (userData.id) {
      fetchVaultData();
    }
  }, [userData.id]);

  // Fetch files from home route
  const fetchHomeFiles = async () => {
    if (!userData.id || currentPath !== '') return; // Only fetch when on home route

    try {
      setFilesLoading(true);

      // Step 1: Get files from getfilenames API
      const filesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: "output"
        })
      });

      if (!filesResponse.ok) {
        throw new Error('Failed to fetch files');
      }

      const filesData: FileData[] = await filesResponse.json();
      console.log('Files from API:', filesData);
      setFiles(filesData);

      // Step 2: Get detailed information for each file from database
      const detailedImages: GeneratedImageData[] = [];

      for (const file of filesData) {
        // Extract filename from the Key (remove path and get just the filename)
        const filename = file.Key.split('/').pop();
        if (!filename) continue;

        try {
          const detailResponse = await fetch(`https://db.nymia.ai/rest/v1/generated_images?system_filename=eq.${filename}`, {
            headers: {
              'Authorization': 'Bearer WeInfl3nc3withAI'
            }
          });

          if (detailResponse.ok) {
            const imageDetails: GeneratedImageData[] = await detailResponse.json();
            if (imageDetails.length > 0) {
              detailedImages.push(imageDetails[0]);
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch details for ${filename}:`, error);
        }
      }

      console.log('Detailed images:', detailedImages);
      setGeneratedImages(detailedImages);

    } catch (error) {
      console.error('Error fetching home files:', error);
      setFiles([]);
      setGeneratedImages([]);
    } finally {
      setFilesLoading(false);
    }
  };

  // Fetch home files when on home route
  useEffect(() => {
    if (currentPath === '') {
      fetchHomeFiles();
    }
  }, [currentPath, userData.id]);

  // Update favorite status
  const updateFavorite = async (systemFilename: string, favorite: boolean) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/generated_images?system_filename=eq.${systemFilename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          favorite: favorite
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      // Update local state
      setGeneratedImages(prev => prev.map(img =>
        img.system_filename === systemFilename
          ? { ...img, favorite: favorite }
          : img
      ));

      toast.success(favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  // Update rating
  const updateRating = async (systemFilename: string, rating: number) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/generated_images?system_filename=eq.${systemFilename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          rating: rating
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update rating');
      }

      // Update local state
      setGeneratedImages(prev => prev.map(img =>
        img.system_filename === systemFilename
          ? { ...img, rating: rating }
          : img
      ));

      toast.success(`Rating updated to ${rating} stars`);
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Failed to update rating');
    }
  };

  // Update user notes
  const updateUserNotes = async (systemFilename: string, userNotes: string) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/generated_images?system_filename=eq.${systemFilename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user_notes: userNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user notes');
      }

      // Update local state
      setGeneratedImages(prev => prev.map(img =>
        img.system_filename === systemFilename
          ? { ...img, user_notes: userNotes }
          : img
      ));

      toast.success('Notes updated successfully');
    } catch (error) {
      console.error('Error updating user notes:', error);
      toast.error('Failed to update notes');
    }
  };

  // Update user tags
  const updateUserTags = async (systemFilename: string, userTags: string[]) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/generated_images?system_filename=eq.${systemFilename}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user_tags: userTags
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user tags');
      }

      // Update local state
      setGeneratedImages(prev => prev.map(img =>
        img.system_filename === systemFilename
          ? { ...img, user_tags: userTags }
          : img
      ));

      toast.success('Tags updated successfully');
    } catch (error) {
      console.error('Error updating user tags:', error);
      toast.error('Failed to update tags');
    }
  };

  const filteredAndSortedItems = currentFolderItems
    .filter(item => {
      const matchesSearch = item.id;
      const matchesType = selectedFilters.fileTypes.length === 0 ||
        selectedFilters.fileTypes.includes(item.type);

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'newest':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // Filter and sort generated images for home route
  const filteredAndSortedGeneratedImages = generatedImages
    .filter(image => {
      // Search filter - search across multiple fields
      const searchMatch = !searchTerm ||
        (image.user_filename && image.user_filename.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (image.system_filename && image.system_filename.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (image.user_notes && image.user_notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (image.user_tags && image.user_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      // File type filter - multi-select
      const fileTypeMatch = selectedFilters.fileTypes.length === 0 ||
        selectedFilters.fileTypes.includes(image.file_type);

      // Favorite filter
      const favoriteMatch = selectedFilters.favorites === null ||
        image.favorite === selectedFilters.favorites;

      // Rating range filter
      const ratingMatch = image.rating >= selectedFilters.ratingRange.min &&
        image.rating <= selectedFilters.ratingRange.max;

      // Notes filter
      const notesMatch = selectedFilters.withNotes === null ||
        (selectedFilters.withNotes === true && !!(image.user_notes && image.user_notes.trim() !== '')) ||
        (selectedFilters.withNotes === false && !(image.user_notes && image.user_notes.trim() !== ''));

      // Tags filter
      const tagsMatch = selectedFilters.selectedTags.length === 0 ||
        (image.user_tags && image.user_tags.some(tag => selectedFilters.selectedTags.includes(tag.trim())));

      return searchMatch && fileTypeMatch && favoriteMatch && ratingMatch && notesMatch && tagsMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'newest':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'filename':
          const aName = (a.user_filename || a.system_filename || '').toLowerCase();
          const bName = (b.user_filename || b.system_filename || '').toLowerCase();
          comparison = aName.localeCompare(bName);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const hasActiveFilters = searchTerm ||
    selectedFilters.fileTypes.length > 0 ||
    selectedFilters.favorites !== null ||
    selectedFilters.ratingRange.min > 0 ||
    selectedFilters.ratingRange.max < 5 ||
    selectedFilters.withNotes !== null ||
    selectedFilters.selectedTags.length > 0;

  // Helper function to get descriptive filter names
  const getFilterDisplayName = (filter: string): string => {
    switch (filter) {
      case 'pic': return 'Images Only';
      case 'video': return 'Videos Only';
      case 'favorite': return 'Favorites Only';
      case 'rated': return 'Rated Only';
      case 'with_notes': return 'With Notes';
      case 'with_tags': return 'With Tags';
      case 'image': return 'Images Only';
      default: return filter;
    }
  };

  // Helper function to get sort display name
  const getSortDisplayName = (sort: string): string => {
    switch (sort) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'rating': return 'By Rating';
      case 'filename': return 'By Filename';
      default: return sort;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilters({
      fileTypes: [],
      favorites: null,
      ratingRange: { min: 0, max: 5 },
      withNotes: null,
      withTags: null,
      selectedTags: []
    });
    setSortBy('newest');
    setSortOrder('desc');
  };

  const handleRemoveFromVault = async (contentId: string) => {
    try {
      // Delete from database
      const dbResponse = await fetch(`https://db.nymia.ai/rest/v1/tasks?uuid=eq.${userData.id}&id=eq.${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to delete from database');
      }

      // Delete file from API
      const fileResponse = await fetch('https://api.nymia.ai/v1/deletefile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `output/${contentId}.png`
        })
      });

      if (!fileResponse.ok) {
        throw new Error('Failed to delete file');
      }

      // Remove from local state
      dispatch(removeFromVault(contentId));

      // Update local vault items
      setVaultItems(prev => prev.filter(item => item.id !== contentId));
      setCurrentFolderItems(prev => prev.filter(item => item.id !== contentId));

      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleDownload = async (itemId: string) => {
    try {
      const response = await fetch('https://api.nymia.ai/v1/downloadfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `output/${itemId}.png`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${itemId}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = (itemId: string) => {
    setShareModal({ open: true, itemId });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareToSocialMedia = (platform: string, itemId: string) => {
    const imageUrl = `https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/output/${itemId}.png`;
    const shareText = `Check out this amazing content!`;

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(imageUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imageUrl)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(shareText)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Handle new folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      const folderPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;

      const response = await fetch('https://api.nymia.ai/v1/createfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          parentfolder: `vault/${currentPath ? currentPath + '/' : ''}`,
          folder: newFolderName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      // Add the new folder to the structure
      const newFolder: FolderStructure = {
        name: newFolderName,
        path: folderPath,
        children: [],
        isFolder: true
      };

      if (currentPath) {
        // Add to current folder's children
        setFolderStructure(prev => {
          const updated = [...prev];
          const updateFolder = (folders: FolderStructure[]): FolderStructure[] => {
            return folders.map(folder => {
              if (folder.path === currentPath) {
                return { ...folder, children: [...folder.children, newFolder] };
              }
              if (folder.children.length > 0) {
                return { ...folder, children: updateFolder(folder.children) };
              }
              return folder;
            });
          };
          return updateFolder(updated);
        });
      } else {
        // Add to root level
        setFolderStructure(prev => [...prev, newFolder]);
      }

      // Reset form
      setNewFolderName('');
      setSelectedFolderIcon('');
      setUploadedIcon(null);
      setShowNewFolderModal(false);

      toast.success(`Folder "${newFolderName}" created successfully`);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Handle file upload for folder icon
  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedIcon(file);
      setSelectedFolderIcon('');
    }
  };

  // Get folders for current path
  const getCurrentPathFolders = (): FolderStructure[] => {
    if (!currentPath) {
      return folderStructure;
    }

    // Find the current folder and return its children
    const findFolder = (folders: FolderStructure[], path: string): FolderStructure | null => {
      for (const folder of folders) {
        if (folder.path === path) {
          return folder;
        }
        if (folder.children.length > 0) {
          const found = findFolder(folder.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const currentFolder = findFolder(folderStructure, currentPath);
    return currentFolder ? currentFolder.children : [];
  };

  // Get raw folders for current path (fallback)
  const getCurrentPathRawFolders = (): FolderData[] => {
    if (!currentPath) {
      // For root level, only show folders that have valid paths
      return folders.filter(folder => {
        const folderPath = extractFolderName(folder.Key);
        if (!folderPath || folderPath.trim() === '') return false;

        // Only show root level folders (single part paths)
        const pathParts = folderPath.split('/').filter(part => part.length > 0);
        return pathParts.length === 1;
      });
    }

    // Filter folders that belong to the current path
    return folders.filter(folder => {
      const folderPath = extractFolderName(folder.Key);
      if (!folderPath || folderPath.trim() === '') return false;

      // Check if this folder is a direct child of the current path
      const pathParts = folderPath.split('/').filter(part => part.length > 0);
      const currentPathParts = currentPath.split('/').filter(part => part.length > 0);

      // Check if this folder is one level deeper than current path
      if (pathParts.length !== currentPathParts.length + 1) {
        return false;
      }

      // Check if the folder path starts with current path
      return folderPath.startsWith(currentPath + '/');
    });
  };

  // Get all subfolders in a folder recursively
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
          folder: `vault/${folderPath}`
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

  // Create folder structure recursively
  const createFolderStructure = async (basePath: string, subfolders: string[]): Promise<void> => {
    for (const subfolder of subfolders) {
      const relativePath = subfolder.replace(basePath + '/', '');
      if (relativePath) {
        try {
          const response = await fetch('https://api.nymia.ai/v1/createfolder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              parentfolder: `vault/${basePath}/`,
              folder: relativePath
            })
          });

          if (!response.ok) {
            console.warn(`Failed to create subfolder: ${relativePath}`);
          }
        } catch (error) {
          console.error(`Error creating subfolder ${relativePath}:`, error);
        }
      }
    }
  };

  // Handle folder rename
  const handleFolderRename = async (oldPath: string, newName: string) => {
    try {
      // Get the old folder name from the path
      const oldFolderName = oldPath.split('/').pop() || '';

      // Check if the new name is the same as the old name
      if (oldFolderName === newName) {
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

      console.log('Renaming folder:', oldPath, 'to:', newName);

      // Get the parent path and construct the new path
      const pathParts = oldPath.split('/');
      const oldFolderNameFromPath = pathParts.pop() || '';
      const parentPath = pathParts.join('/');
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;

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
          parentfolder: `vault/${parentPath ? parentPath + '/' : ''}`,
          folder: newName
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create new folder');
      }

      console.log('New folder created successfully');

      // Step 2: Get all files and subfolders from the old folder
      console.log(`vault/${oldPath}`);
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${oldPath}`
        })
      });

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        console.log('Files to copy:', files);

        // Step 3: Copy all files to the new folder
        if (files && files.length > 0 && files[0].Key) {
          const copyPromises = files.map(async (file: any) => {
            console.log("File:", file);
            const fileKey = file.Key;
            const re = new RegExp(`^.*?vault/${oldPath}/`);
            const fileName = fileKey.replace(re, "");
            console.log("File Name:", fileName);

            const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              },
              body: JSON.stringify({
                user: userData.id,
                sourcefilename: `vault/${oldPath}/${fileName}`,
                destinationfilename: `vault/${newPath}/${fileName}`
              })
            });

            if (!copyResponse.ok) {
              console.warn(`Failed to copy file ${file}`);
              throw new Error(`Failed to copy file ${file}`);
            }
          });

          await Promise.all(copyPromises);
          console.log('All files copied successfully');
        }
      }

      // Step 4: Get all subfolders from the old folder
      const getFoldersResponse = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${oldPath}`
        })
      });

      if (getFoldersResponse.ok) {
        const folders = await getFoldersResponse.json();
        console.log('Subfolders to copy:', folders);

        // Step 5: Copy all subfolders recursively
        if (folders && folders.length > 0 && folders[0].Key) {
          for (const folder of folders) {
            const folderKey = folder.Key;
            const re = new RegExp(`^.*?vault/${oldPath}/`);

            // Then just do:
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
                  parentfolder: `vault/${newPath}/`,
                  folder: relativePath
                })
              });

              if (subfolderCreateResponse.ok) {
                // Copy files from this subfolder
                await copyFilesFromFolder(`${oldPath}/${relativePath}`, `${newPath}/${relativePath}`);
              }

              const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer WeInfl3nc3withAI'
                },
                body: JSON.stringify({
                  user: userData.id,
                  folder: `vault/${oldPath}/${relativePath}`
                })
              });

              if (getFilesResponse.ok) {
                const files = await getFilesResponse.json();
                console.log('Files to copy:', files);

                // Step 3: Copy all files to the new folder
                if (files && files.length > 0 && files[0].Key) {
                  const copyPromises = files.map(async (file: any) => {
                    console.log("File:", file);
                    const fileKey = file.Key;
                    const re = new RegExp(`^.*?vault/${oldPath}/${relativePath}/`);
                    const fileName = fileKey.replace(re, "");
                    console.log("File Name:", fileName);

                    const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WeInfl3nc3withAI'
                      },
                      body: JSON.stringify({
                        user: userData.id,
                        sourcefilename: `vault/${oldPath}/${relativePath}/${fileName}`,
                        destinationfilename: `vault/${newPath}/${relativePath}/${fileName}`
                      })
                    });

                    if (!copyResponse.ok) {
                      console.warn(`Failed to copy file ${file}`);
                      throw new Error(`Failed to copy file ${file}`);
                    }
                  });

                  await Promise.all(copyPromises);
                  console.log('All files copied successfully');
                }
              }
            }
          }
        }
      }

      // Step 6: Delete the old folder
      const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${oldPath}`
        })
      });

      if (!deleteResponse.ok) {
        console.warn('Failed to delete old folder, but rename operation completed');
      }

      // Step 7: Refresh folder structure
      const refreshResponse = await fetch('https://api.nymia.ai/v1/getfoldernames', {
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

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setFolders(data);

        // Rebuild folder structure
        const structure = buildFolderStructure(data);
        setFolderStructure(structure);
      }

      // Step 8: Update current path if we're in the renamed folder
      if (currentPath === oldPath) {
        setCurrentPath(newPath);
      } else if (currentPath.startsWith(oldPath + '/')) {
        const newCurrentPath = currentPath.replace(oldPath, newPath);
        setCurrentPath(newCurrentPath);
      }

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

  // Helper function to copy files from a specific folder
  const copyFilesFromFolder = async (sourceFolder: string, destFolder: string): Promise<void> => {
    try {
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${sourceFolder}`
        })
      });

      if (!getFilesResponse.ok) {
        console.warn(`Failed to get files from folder: ${sourceFolder}`);
        return;
      }

      const filesData = await getFilesResponse.json();
      // console.log(`Files in folder ${sourceFolder}:`, filesData);

      if (filesData && filesData.length > 0) {
        const copyPromises = filesData.map(async (file: any) => {
          const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              sourcefilename: `vault/${sourceFolder}/${file}`,
              destinationfilename: `vault/${destFolder}/${file}`
            })
          });

          if (!copyResponse.ok) {
            console.warn(`Failed to copy file ${file} from ${sourceFolder} to ${destFolder}`);
            throw new Error(`Failed to copy file ${file}`);
          }
        });

        await Promise.all(copyPromises);
      }
    } catch (error) {
      console.error(`Error copying files from ${sourceFolder}:`, error);
    }
  };

  // Handle F2 key press
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F2' && contextMenu) {
      e.preventDefault();
      setEditingFolder(contextMenu.folderPath);
      setEditingFolderName(contextMenu.folderPath.split('/').pop() || '');
      setContextMenu(null);
    }
    
    // Close filter menu with Escape key
    if (e.key === 'Escape' && filterMenuOpen) {
      e.preventDefault();
      setFilterMenuOpen(false);
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, filterMenuOpen]);

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, folderPath: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, folderPath });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Delete folder and all its contents recursively
  const deleteFolderRecursively = async (folderPath: string): Promise<void> => {
    try {
      // Use the correct deletefolder API endpoint
      const response = await fetch('https://api.nymia.ai/v1/deletefolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${folderPath}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      console.log(`Successfully deleted folder: ${folderPath}`);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  // Helper function to delete all files from a specific folder (keeping for reference but not used in new implementation)
  const deleteFilesFromFolder = async (folderPath: string): Promise<void> => {
    try {
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${folderPath}`
        })
      });

      if (!getFilesResponse.ok) {
        console.warn(`Failed to get files from folder: ${folderPath}`);
        return;
      }

      const filesData = await getFilesResponse.json();
      console.log(`Files in folder ${folderPath}:`, filesData);

      if (filesData && filesData.length > 0) {
        const deletePromises = filesData.map(async (file: any) => {
          const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              filename: `vault/${folderPath}/${file}`
            })
          });

          if (!deleteResponse.ok) {
            console.warn(`Failed to delete file ${file} from ${folderPath}`);
            throw new Error(`Failed to delete file ${file}`);
          }
        });

        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error(`Error deleting files from ${folderPath}:`, error);
    }
  };

  // Handle folder deletion
  const handleDeleteFolder = async (folderPath: string) => {
    try {
      toast.info('Deleting folder...', {
        description: 'This may take a moment depending on the folder contents'
      });

      await deleteFolderRecursively(folderPath);

      // Refresh folders from API to get updated structure
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

        // Rebuild folder structure
        const structure = buildFolderStructure(data);
        setFolderStructure(structure);
      }

      // If we're currently in the deleted folder or one of its subfolders, navigate to parent
      if (currentPath === folderPath || currentPath.startsWith(folderPath + '/')) {
        const pathParts = folderPath.split('/');
        pathParts.pop();
        const parentPath = pathParts.join('/');
        setCurrentPath(parentPath);
        setCurrentFolderItems(getCurrentFolderItems());
      }

      setContextMenu(null);
      toast.success(`Folder "${folderPath.split('/').pop()}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder. Please try again.');
      setContextMenu(null);
    }
  };

  // Handle copy operation
  const handleCopy = (folderPath: string) => {
    setCopyState(1);
    setCopiedPath(folderPath);
    setContextMenu(null);
    toast.success(`Folder "${folderPath.split('/').pop()}" copied to clipboard`);
  };

  // Handle cut operation
  const handleCut = (folderPath: string) => {
    setCopyState(2);
    setCopiedPath(folderPath);
    setContextMenu(null);
    toast.success(`Folder "${folderPath.split('/').pop()}" cut to clipboard`);
  };

  // Handle paste operation
  const handlePaste = async () => {
    if (copyState === 0 || !copiedPath) {
      toast.error('No folder to paste');
      return;
    }

    if (currentPath === copiedPath || copiedPath.includes(currentPath) || copiedPath.includes(currentPath + '/') || copiedPath.includes(currentPath + '/vault') || currentPath === 'vault') {
      toast.error('Cannot paste into the same folder or a subfolder of the same folder');
      return;
    }

    setIsPasting(true);

    try {
      const sourceFolderName = copiedPath.split('/').pop() || '';
      const operationType = copyState === 1 ? 'copying' : 'moving';

      toast.info(`${operationType.charAt(0).toUpperCase() + operationType.slice(1)} folder...`, {
        description: `Processing "${sourceFolderName}" - this may take a moment depending on the folder contents`,
        duration: 5000
      });

      console.log('currentPath', currentPath);
      console.log('copiedPath', copiedPath);
      console.log('copiedPath.split(/).pop()', copiedPath.split('/').pop() || '');

      const newFolderName = copiedPath.split('/').pop() || '';

      const createResponse = await fetch('https://api.nymia.ai/v1/createfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          parentfolder: `vault/${currentPath ? currentPath + '/' : ''}`,
          folder: newFolderName
        })
      });

      console.log('createResponse', createResponse);

      if (!createResponse.ok) {
        throw new Error('Failed to create new folder');
      }

      console.log('New folder created successfully');

      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${copiedPath}`
        })
      });

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        console.log('Files to copy:', files);

        // Step 3: Copy all files to the new folder
        if (files && files.length > 0 && files[0].Key) {
          const copyPromises = files.map(async (file: any) => {
            console.log("File:", file);
            const fileKey = file.Key;
            const re = new RegExp(`^.*?vault/${copiedPath}/`);
            const fileName = fileKey.replace(re, "");
            console.log("File Name:", fileName);

            const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              },
              body: JSON.stringify({
                user: userData.id,
                sourcefilename: `vault/${copiedPath}/${fileName}`,
                destinationfilename: `vault/${currentPath}/${newFolderName}/${fileName}`
              })
            });

            if (!copyResponse.ok) {
              console.warn(`Failed to copy file ${file}`);
              throw new Error(`Failed to copy file ${file}`);
            }
          });

          await Promise.all(copyPromises);
          console.log('All files copied successfully');
        }
      }

      const getFoldersResponse = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${copiedPath}`
        })
      });

      if (getFoldersResponse.ok) {
        const folders = await getFoldersResponse.json();
        console.log('Subfolders to copy:', folders);

        // Step 5: Copy all subfolders recursively
        if (folders && folders.length > 0 && folders[0].Key) {
          for (const folder of folders) {
            const folderKey = folder.Key;
            const re = new RegExp(`^.*?vault/${copiedPath}/`);

            // Then just do:
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
                  parentfolder: `vault/${currentPath}/${newFolderName}/`,
                  folder: relativePath
                })
              });

              if (subfolderCreateResponse.ok) {
                // Copy files from this subfolder
                await copyFilesFromFolder(`${copiedPath}/${relativePath}`, `${currentPath}/${newFolderName}/${relativePath}`);
              }

              const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer WeInfl3nc3withAI'
                },
                body: JSON.stringify({
                  user: userData.id,
                  folder: `vault/${copiedPath}/${relativePath}`
                })
              });

              if (getFilesResponse.ok) {
                const files = await getFilesResponse.json();
                console.log('Files to copy:', files);

                // Step 3: Copy all files to the new folder
                if (files && files.length > 0 && files[0].Key) {
                  const copyPromises = files.map(async (file: any) => {
                    console.log("File:", file);
                    const fileKey = file.Key;
                    const re = new RegExp(`^.*?vault/${copiedPath}/${relativePath}/`);
                    const fileName = fileKey.replace(re, "");
                    console.log("File Name:", fileName);

                    const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WeInfl3nc3withAI'
                      },
                      body: JSON.stringify({
                        user: userData.id,
                        sourcefilename: `vault/${copiedPath}/${relativePath}/${fileName}`,
                        destinationfilename: `vault/${currentPath}/${newFolderName}/${relativePath}/${fileName}`
                      })
                    });

                    if (!copyResponse.ok) {
                      console.warn(`Failed to copy file ${file}`);
                      throw new Error(`Failed to copy file ${file}`);
                    }
                  });

                  await Promise.all(copyPromises);
                  console.log('All files copied successfully');
                }
              }
            }
          }
        }
      }

      if (copyState === 2) {
        const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefolder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            folder: `vault/${copiedPath}`
          })
        });

        if (!deleteResponse.ok) {
          throw new Error('Failed to delete folder');
        }

        console.log(`Successfully deleted folder: ${copiedPath}`);
      }

      // Refresh folder structure
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
        const structure = buildFolderStructure(data);
        setFolderStructure(structure);
      }

      // Clear copy state
      setCopyState(0);
      setCopiedPath('');

      // Show success message
      const operation = copyState === 1 ? 'copied' : 'moved';
      const destination = currentPath ? `to "${currentPath}"` : 'to root';

      toast.success(`Folder "${sourceFolderName}" ${operation} successfully!`, {
        description: `The folder has been ${operation} ${destination} with all its contents.`,
        duration: 4000
      });

    } catch (error) {
      console.error('Error pasting folder:', error);
      toast.error('Failed to paste folder. Please try again.', {
        description: 'An error occurred during the paste operation. Please check your connection and try again.',
        duration: 5000
      });
    } finally {
      setIsPasting(false);
    }
  };

  if (loading || foldersLoading) {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              File Manager of nymia
          </h1>
          <p className="text-muted-foreground">
              Organize and manage your content with folders
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading file manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-6">
        <div>
          <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            File Manager of nymia
          </h1>
          <p className="text-muted-foreground">
            Organize and manage your content with folders
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="w-4 h-4 text-yellow-500" />
          {vaultItems.length} items saved
        </div>
      </div>

      {/* Professional Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
          {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
            placeholder="Search vault by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>

        {/* Filter Menu Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterMenuOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-500/20"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
              {selectedFilters.fileTypes.length + 
               (selectedFilters.favorites !== null ? 1 : 0) + 
               (selectedFilters.withNotes !== null ? 1 : 0) + 
               selectedFilters.selectedTags.length +
               (selectedFilters.ratingRange.min > 0 || selectedFilters.ratingRange.max < 5 ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Menu Slide-out Panel */}
      <div className={`fixed top-0 inset-0 z-50 transition-opacity duration-300 ${filterMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setFilterMenuOpen(false)}
        />
        
        {/* Mobile Bottom Sheet / Desktop Side Panel */}
        <div className={`absolute bg-background border shadow-2xl transform transition-transform duration-300 ${
          filterMenuOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
        } ${
          // Mobile: bottom sheet, Desktop: side panel
          'bottom-0 left-0 right-0 h-[85vh] sm:h-full sm:right-0 sm:left-auto sm:w-full sm:max-w-md sm:border-l'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Search & Filter</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterMenuOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Drag Handle */}
            <div className="sm:hidden flex justify-center py-2 border-b bg-gray-50 dark:bg-gray-900">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 md:overflow-y-hidden">
              {/* Search Bar */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search vault by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* File Type Multi-Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">File Types</Label>
                <div className="flex flex-wrap gap-2">
                  {['pic', 'video'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedFilters.fileTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        setSelectedFilters(prev => ({
                          ...prev,
                          fileTypes: prev.fileTypes.includes(type)
                            ? prev.fileTypes.filter(t => t !== type)
                            : [...prev.fileTypes, type]
                        }));
                      }}
                    >
                      {type === 'pic' ? 'Images' : 'Videos'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rating Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rating Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={selectedFilters.ratingRange.min}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setSelectedFilters(prev => ({
                        ...prev,
                        ratingRange: { ...prev.ratingRange, min: Math.min(value, prev.ratingRange.max) }
                      }));
                    }}
                    className="w-16 h-8 text-xs"
                    placeholder="Min"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={selectedFilters.ratingRange.max}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 5;
                      setSelectedFilters(prev => ({
                        ...prev,
                        ratingRange: { ...prev.ratingRange, max: Math.max(value, prev.ratingRange.min) }
                      }));
                    }}
                    className="w-16 h-8 text-xs"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Other Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Other Filters</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedFilters.favorites === true ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setSelectedFilters(prev => ({
                        ...prev,
                        favorites: prev.favorites === true ? null : true
                      }));
                    }}
                  >
                    Favorites
                  </Button>
                  <Button
                    variant={selectedFilters.withNotes === true ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setSelectedFilters(prev => ({
                        ...prev,
                        withNotes: prev.withNotes === true ? null : true
                      }));
                    }}
                  >
                    With Notes
                  </Button>
                  <Button
                    variant={selectedFilters.selectedTags.length > 0 ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setTagSelectionModal({ open: true })}
                  >
                    Tags {selectedFilters.selectedTags.length > 0 && `(${selectedFilters.selectedTags.length})`}
                  </Button>
                </div>
              </div>

              {/* Sort Controls */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Date</div>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    {currentPath === '' && (
                      <>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Other</div>
                        <SelectItem value="rating">By Rating</SelectItem>
                        <SelectItem value="filename">By Filename</SelectItem>
                      </>
                    )}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchTerm}"
                </Badge>
              )}
                    {selectedFilters.fileTypes.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                        Types: {selectedFilters.fileTypes.map(type => type === 'pic' ? 'Images' : 'Videos').join(', ')}
                </Badge>
              )}
                    {selectedFilters.favorites === true && (
                <Badge variant="secondary" className="text-xs">
                        Favorites Only
                </Badge>
              )}
                    {(selectedFilters.ratingRange.min > 0 || selectedFilters.ratingRange.max < 5) && (
                      <Badge variant="secondary" className="text-xs">
                        Rating: {selectedFilters.ratingRange.min}-{selectedFilters.ratingRange.max} stars
                      </Badge>
                    )}
                    {selectedFilters.withNotes === true && (
                      <Badge variant="secondary" className="text-xs">
                        With Notes
                      </Badge>
                    )}
                    {selectedFilters.selectedTags.length > 0 && (
                      <>
                        {selectedFilters.selectedTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs flex items-center gap-1"
                          >
                            Tag: {tag}
                            <button
                              className="ml-1 hover:text-red-500 transition-colors"
                              onClick={() => {
                                setSelectedFilters(prev => ({
                                  ...prev,
                                  selectedTags: prev.selectedTags.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
            </div>
          )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20 space-y-2">
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
              <Button 
                onClick={() => setFilterMenuOpen(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Folders Section */}
      <Card className="border-blue-500/20 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 mb-6">
        <CardHeader className="pt-5 pb-2">
          {/* Breadcrumb Navigation */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToHome}
                  className="h-6 px-2 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                >
                  Home
                </Button>
              </div>
              {getBreadcrumbItems().map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/30 dark:to-slate-900/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    <Folder className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToFolder(item.path)}
                      className={`h-6 px-2 text-xs font-medium transition-colors ${index === getBreadcrumbItems().length - 1
                        ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                    >
                      {item.name}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToParent}
                className="flex items-center gap-1"
                disabled={currentPath === ''}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={copyState > 0 ? "default" : "outline"}
                size="sm"
                onClick={handlePaste}
                disabled={copyState === 0 || currentPath === '' || isPasting}
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Folder Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {/* Show folders for current path */}
            {(() => {
              const currentFolders = getCurrentPathFolders();

              // console.log('Current folders to display:', currentFolders);
              // console.log('Current path:', currentPath);
              // console.log('Folder structure:', folderStructure);

              return currentFolders.map((folder) => (
                <div
                  key={folder.path}
                  className={`group ${renamingFolder === folder.path ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  onDoubleClick={() => renamingFolder !== folder.path && navigateToFolder(folder.path)}
                  onContextMenu={(e) => renamingFolder !== folder.path && handleContextMenu(e, folder.path)}
                >
                  <div className={`flex flex-col items-center p-3 rounded-lg border-2 border-transparent transition-all duration-200 ${renamingFolder === folder.path
                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20'
                    : 'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                    }`}>
                    <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 transition-transform duration-200 ${renamingFolder === folder.path ? 'animate-pulse' : 'group-hover:scale-110'
                      }`}>
                      {renamingFolder === folder.path ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <Folder className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {editingFolder === folder.path && renamingFolder !== folder.path ? (
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
                      <span className={`text-xs font-medium text-center transition-colors ${renamingFolder === folder.path
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        }`}>
                        {folder.name}
                        {renamingFolder === folder.path && ' (Renaming...)'}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground mt-1">
                      {folder.children.length} items
                    </span>
                  </div>
                </div>
              ));
            })()}

            {/* Fallback folders with renaming */}
            {(() => {
              const currentFolders = getCurrentPathFolders();
              if (currentFolders.length === 0 && folders.length > 0) {
                // console.log('No structured folders, showing raw folders as fallback');
                const rawFolders = getCurrentPathRawFolders();

                if (rawFolders.length === 0) {
                  return null; // Don't show anything if no valid folders
                }

                return rawFolders.map((folder) => {
                  const folderPath = extractFolderName(folder.Key);
                  if (!folderPath || folderPath.trim() === '') {
                    return null; // Skip invalid folders
                  }

                  const folderName = folderPath.split('/').pop();
                  if (!folderName || folderName.trim() === '') {
                    return null; // Skip folders with empty names
                  }

                  return (
                    <div
                      key={folder.Key}
                      className={`group ${renamingFolder === folderPath ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      onClick={() => {
                        if (folderPath && renamingFolder !== folderPath) {
                          navigateToFolder(folderPath);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (folderPath && renamingFolder !== folderPath) {
                          handleContextMenu(e, folderPath);
                        }
                      }}
                    >
                      <div className={`flex flex-col items-center p-3 rounded-lg border-2 border-transparent transition-all duration-200 ${renamingFolder === folderPath
                        ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20'
                        : 'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                        }`}>
                        <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 transition-transform duration-200 ${renamingFolder === folderPath ? 'animate-pulse' : 'group-hover:scale-110'
                          }`}>
                          {renamingFolder === folderPath ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          ) : (
                            <Folder className="w-6 h-6 text-white" />
                          )}
                        </div>
                        {editingFolder === folderPath && renamingFolder !== folderPath ? (
                          <div className="w-full">
                            <Input
                              value={editingFolderName}
                              onChange={(e) => setEditingFolderName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleFolderRename(folderPath, editingFolderName);
                                } else if (e.key === 'Escape') {
                                  setEditingFolder(null);
                                  setEditingFolderName('');
                                }
                              }}
                              onBlur={() => handleFolderRename(folderPath, editingFolderName)}
                              className="text-xs h-6 text-center"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className={`text-xs font-medium text-center transition-colors ${renamingFolder === folderPath
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                            }`}>
                            {folderName}
                            {renamingFolder === folderPath && ' (Renaming...)'}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground mt-1">
                          0 items
                        </span>
                      </div>
                    </div>
                  );
                }).filter(Boolean); // Remove null entries
              }
              return null;
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
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
            {currentPath === '' ? (
              `Showing ${filteredAndSortedGeneratedImages.length} of ${generatedImages.length} files`
            ) : (
              `Showing ${filteredAndSortedItems.length} of ${currentFolderItems.length} items in "${currentPath}"`
            )}
          </p>
          {currentPath && (
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Folder className="w-3 h-3 mr-1" />
              {currentPath}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="w-4 h-4 text-yellow-500" />
          {currentPath === '' ? `${files.length} total files` : `${vaultItems.length} total items`}
        </div>
      </div>

      {/* Content Grid */}
      {currentPath === '' ? (
        // Show generated images on home route
        filesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading files...</p>
          </div>
        ) : generatedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredAndSortedGeneratedImages.map((image) => (
            <Card 
                key={image.id}
                className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-yellow-500/30 bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5 backdrop-blur-sm"
              >
                <CardContent className="p-4">
                  {/* Top Row: File Type, Ratings, Favorite */}
                  <div className="flex items-center justify-between mb-3">
                    {/* File Type Icon */}
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                      {image.file_type === 'video' ? (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15V7l8 5-8 5z" opacity="0.3"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          <circle cx="8.5" cy="8.5" r="1.5" opacity="0.8"/>
                        </svg>
                      )}
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform ${star <= image.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          viewBox="0 0 24 24"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateRating(image.system_filename, star);
                          }}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>

                    {/* Favorite Heart */}
                    <div>
                      {image.favorite ? (
                        <div
                          className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateFavorite(image.system_filename, false);
                          }}
                        >
                          <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      ) : (
                        <div
                          className="bg-black/50 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateFavorite(image.system_filename, true);
                          }}
                        >
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                    <img
                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/output/${image.system_filename}`}
                      alt={image.user_filename || image.system_filename}
                      className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer"
                      onClick={() => setDetailedImageModal({ open: true, image })}
                    />
                  </div>

                  {/* User Notes */}
                  {editingNotes === image.system_filename ? (
                    <div className="mb-3 space-y-2">
                      <Input
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add notes..."
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateUserNotes(image.system_filename, notesInput);
                            setEditingNotes(null);
                            setNotesInput('');
                          } else if (e.key === 'Escape') {
                            setEditingNotes(null);
                            setNotesInput('');
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => {
                            updateUserNotes(image.system_filename, notesInput);
                            setEditingNotes(null);
                            setNotesInput('');
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => {
                            setEditingNotes(null);
                            setNotesInput('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      {image.user_notes ? (
                        <p
                          className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                          onClick={() => {
                            setEditingNotes(image.system_filename);
                            setNotesInput(image.user_notes || '');
                          }}
                        >
                          {image.user_notes}
                        </p>
                      ) : (
                        <div
                          className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                          onClick={() => {
                            setEditingNotes(image.system_filename);
                            setNotesInput('');
                          }}
                        >
                          Add notes
                    </div>
                  )}
                    </div>
                  )}

                  {/* User Tags */}
                  {image.user_tags && image.user_tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {image.user_tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs flex items-center gap-1 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            addTagToFilter(tag);
                          }}
                        >
                          {tag.trim()}
                          <button
                            className="ml-1 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedTags = image.user_tags?.filter((_, i) => i !== index) || [];
                              updateUserTags(image.system_filename, updatedTags);
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Editable User Tags */}
                  <div className="mb-3">
                    {editingTags === image.system_filename ? (
                      <div className="space-y-2">
                        <Input
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          placeholder="Add tags (comma separated)..."
                          className="text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newTags = tagsInput.trim() ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                              const existingTags = image.user_tags || [];
                              const combinedTags = [...existingTags, ...newTags];
                              const uniqueTags = [...new Set(combinedTags)]; // Remove duplicates
                              updateUserTags(image.system_filename, uniqueTags);
                              setEditingTags(null);
                              setTagsInput('');
                            } else if (e.key === 'Escape') {
                              setEditingTags(null);
                              setTagsInput('');
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs"
                            onClick={() => {
                              const newTags = tagsInput.trim() ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                              const existingTags = image.user_tags || [];
                              const combinedTags = [...existingTags, ...newTags];
                              const uniqueTags = [...new Set(combinedTags)]; // Remove duplicates
                              updateUserTags(image.system_filename, uniqueTags);
                              setEditingTags(null);
                              setTagsInput('');
                            }}
                          >
                            Add
                      </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs"
                            onClick={() => {
                              setEditingTags(null);
                              setTagsInput('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => {
                          setEditingTags(image.system_filename);
                          setTagsInput('');
                        }}
                      >
                        Add tags
                      </div>
                    )}
                  </div>

                  {/* Filename and Date */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                      {image.user_filename || image.system_filename}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(image.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1.5 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs font-medium hover:bg-purple-700 hover:border-purple-500 transition-colors"
                      onClick={() => handleDownload(image.system_filename.replace('.png', ''))}
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:bg-green-700 hover:border-green-500 transition-colors"
                      onClick={() => handleShare(image.system_filename.replace('.png', ''))}
                    >
                        <Share className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-amber-500 hover:border-amber-300 transition-colors"
                      onClick={() => handleRemoveFromVault(image.system_filename.replace('.png', ''))}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                </CardContent>
              </Card>
            ))}
                  </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Image className="w-12 h-12 text-blue-500/50" />
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground">
                No generated images found in your output folder.
              </p>
                </div>
          </div>
        )
      ) : (
        // Show vault items when in folders
        filteredAndSortedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredAndSortedItems.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-yellow-500/30 bg-gradient-to-br from-yellow-50/20 to-orange-950/5 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.type === 'video' ? (
                        <Video className="w-4 h-4 text-purple-500" />
                      ) : (
                        <Image className="w-4 h-4 text-blue-500" />
                      )}
                  </div>
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">{item.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                    <img
                      src={`https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/output/${item.id}.png`}
                      alt={item.id}
                      className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm"
                    />
                    <div
                      className="absolute right-2 top-2 bg-black/50 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                      onClick={() => setSelectedImage(`https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/output/${item.id}.png`)}
                    >
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs font-medium hover:bg-purple-700 hover:border-purple-500 transition-colors"
                        onClick={() => handleDownload(item.id)}
                      >
                        <Download className="w-3 h-3 mr-1.5" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:bg-green-700 hover:border-green-500 transition-colors"
                        onClick={() => handleShare(item.id)}
                      >
                        <Share className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-amber-500 hover:border-amber-300 transition-colors"
                        onClick={() => handleRemoveFromVault(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              {currentPath ? (
                <>
                  <Folder className="w-12 h-12 text-blue-500/50" />
                  <h3 className="text-lg font-semibold mb-2">No items in this folder</h3>
                  <p className="text-muted-foreground">
                    The folder "{currentPath}" is empty. Try navigating to a different folder or create some content.
                  </p>
                </>
              ) : (
                <>
                  <Star className="w-12 h-12 text-yellow-500/50" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
                </>
              )}
        </div>
          </div>
        )
      )}

      {/* Image Zoom Modal */}
      <DialogZoom open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContentZoom className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size image"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContentZoom>
      </DialogZoom>

      {/* Share Modal */}
      <Dialog open={shareModal.open} onOpenChange={() => setShareModal({ open: false, itemId: null })}>
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
                      value={`https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/output/${shareModal.itemId}.png`}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/output/${shareModal.itemId}.png`)}
                    >
                      Copy
                    </Button>
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
                      onClick={() => shareToSocialMedia('twitter', shareModal.itemId)}
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
                      onClick={() => shareToSocialMedia('facebook', shareModal.itemId)}
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
                      onClick={() => shareToSocialMedia('linkedin', shareModal.itemId)}
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
                      onClick={() => shareToSocialMedia('pinterest', shareModal.itemId)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-500" />
              Create New Folder
            </DialogTitle>
            <DialogDescription>
              {currentPath ? (
                <>
                  Create a new folder in <span className="font-medium text-blue-600">{currentPath}</span>
                </>
              ) : (
                'Create a new folder in the root directory'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Path Display */}
            {currentPath && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm">
                  <Folder className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Location:</span>
                  <span className="text-blue-600 dark:text-blue-300">{currentPath}</span>
                </div>
              </div>
            )}

            {/* Folder Name Input */}
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    handleCreateFolder();
                  }
                }}
              />
            </div>

            {/* Folder Icon Selection */}
            <div className="space-y-2">
              <Label>Folder Icon (Optional)</Label>
              <div className="grid grid-cols-4 gap-2">
                {folderIcons.map((icon, index) => (
                  <Button
                    key={index}
                    variant={selectedFolderIcon === icon ? "default" : "outline"}
                    size="sm"
                    className="h-12 w-12 p-0"
                    onClick={() => {
                      setSelectedFolderIcon(icon);
                      setUploadedIcon(null);
                    }}
                  >
                    <img src={icon} alt={`Icon ${index + 1}`} className="w-6 h-6" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Upload Custom Icon */}
            <div className="space-y-2">
              <Label>Upload Custom Icon (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="flex-1"
                />
                {uploadedIcon && (
                  <div className="w-8 h-8 rounded border overflow-hidden">
                    <img
                      src={URL.createObjectURL(uploadedIcon)}
                      alt="Uploaded icon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                  setSelectedFolderIcon('');
                  setUploadedIcon(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              // Navigate to folder
              navigateToFolder(contextMenu.folderPath);
              setContextMenu(null);
            }}
          >
            <Folder className="w-4 h-4" />
            Open
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              setEditingFolder(contextMenu.folderPath);
              setEditingFolderName(contextMenu.folderPath.split('/').pop() || '');
              setContextMenu(null);
            }}
          >
            <Pencil className="w-4 h-4" />
            Rename
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => handleCopy(contextMenu.folderPath)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => handleCut(contextMenu.folderPath)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cut
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
            onClick={() => {
              // Delete folder functionality would go here
              handleDeleteFolder(contextMenu.folderPath);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Detailed Image Modal */}
      <Dialog open={detailedImageModal.open} onOpenChange={(open) => setDetailedImageModal({ open, image: null })}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-50/50 to-slate-50/50 dark:from-gray-950/50 dark:to-slate-950/50 backdrop-blur-sm border-0 shadow-2xl">
          {detailedImageModal.image && (
            <div className="space-y-8">
              {/* Enhanced Header */}
              <DialogHeader className="text-center pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                    {detailedImageModal.image.file_type === 'video' ? (
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15V7l8 5-8 5z" opacity="0.3"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        <circle cx="8.5" cy="8.5" r="1.5" opacity="0.8"/>
                      </svg>
                    )}
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {detailedImageModal.image.user_filename || detailedImageModal.image.system_filename}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-400">
                  Comprehensive details and metadata for this generated {detailedImageModal.image.file_type}
                </DialogDescription>
              </DialogHeader>

              {/* Enhanced Image Display */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <img
                    src={`https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/output/${detailedImageModal.image.system_filename}`}
                    alt={detailedImageModal.image.user_filename || detailedImageModal.image.system_filename}
                    className="relative max-w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  {/* Image Overlay Info */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-between text-sm">
                      <span>{(detailedImageModal.image.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                      <span>{detailedImageModal.image.image_format.toUpperCase()}</span>
                      <span>{detailedImageModal.image.file_type}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Image Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-t-lg border-b border-blue-200/50 dark:border-blue-800/50">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Filename:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{detailedImageModal.image.system_filename}</span>
                    </div>
                    {detailedImageModal.image.user_filename && (
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Custom Name:</span>
                        <span className="text-gray-600 dark:text-gray-400">{detailedImageModal.image.user_filename}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">File Type:</span>
                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        {detailedImageModal.image.file_type}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Format:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono">{detailedImageModal.image.image_format}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">File Size:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono">{(detailedImageModal.image.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
                      <Badge variant={detailedImageModal.image.generation_status === 'completed' ? 'default' : 'secondary'} className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                        {detailedImageModal.image.generation_status}
                      </Badge>
                    </div>
                    {detailedImageModal.image.favorite && (
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Favorite:</span>
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Generation Settings */}
                <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg border-b border-purple-200/50 dark:border-purple-800/50">
                    <CardTitle className="text-lg flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                      </svg>
                      Generation Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Model:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{detailedImageModal.image.model_version}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Seed:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono">{detailedImageModal.image.seed}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Steps:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono">{detailedImageModal.image.steps}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Guidance:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono">{detailedImageModal.image.guidance}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">NSFW Strength:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono">{detailedImageModal.image.nsfw_strength}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">LoRA Strength:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-mono">{detailedImageModal.image.lora_strength}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Quality Setting:</span>
                      <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                        {detailedImageModal.image.quality_setting}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Prompts */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg border-b border-green-200/50 dark:border-green-800/50">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                      Prompts & Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div>
                      <Label className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 block">T5XXL Prompt:</Label>
                      <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-green-200/50 dark:border-green-800/50 text-sm leading-relaxed">
                        {detailedImageModal.image.t5xxl_prompt}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 block">CLIP Prompt:</Label>
                      <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-green-200/50 dark:border-green-800/50 text-sm leading-relaxed">
                        {detailedImageModal.image.clip_l_prompt}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 block">Negative Prompt:</Label>
                      <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-green-200/50 dark:border-green-800/50 text-sm leading-relaxed">
                        {detailedImageModal.image.negative_prompt}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Generation Details */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200/50 dark:border-orange-800/50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-t-lg border-b border-orange-200/50 dark:border-orange-800/50">
                    <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                      </svg>
                      Generation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Task ID:</span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{detailedImageModal.image.task_id}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Image Sequence:</span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono">{detailedImageModal.image.image_sequence_number}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Generation Time:</span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono">{detailedImageModal.image.generation_time_seconds}s</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Retry Count:</span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono">{detailedImageModal.image.retry_count}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Started At:</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{new Date(detailedImageModal.image.generation_started_at).toLocaleString()}</span>
                      </div>
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Completed At:</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{new Date(detailedImageModal.image.generation_completed_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button
                  onClick={() => handleDownload(detailedImageModal.image.system_filename.replace('.png', ''))}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare(detailedImageModal.image.system_filename.replace('.png', ''))}
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-600 transition-all duration-300"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRemoveFromVault(detailedImageModal.image.system_filename.replace('.png', ''))}
                  className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-600 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tag Selection Modal */}
      <Dialog open={tagSelectionModal.open} onOpenChange={(open) => setTagSelectionModal({ open })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge className="w-5 h-5" />
              Select Tags to Filter
            </DialogTitle>
            <DialogDescription>
              Choose tags to filter your images. Images must have at least one of the selected tags to be shown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Currently Selected Tags */}
            {selectedFilters.selectedTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Currently Selected:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedFilters.selectedTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="text-xs flex items-center gap-1"
                    >
                      {tag}
                      <button
                        className="ml-1 hover:text-red-300 transition-colors"
                        onClick={() => {
                          setSelectedFilters(prev => ({
                            ...prev,
                            selectedTags: prev.selectedTags.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Available Tags:</Label>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                {getAllAvailableTags().map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedFilters.selectedTags.includes(tag) ? "default" : "outline"}
                    className="text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                    onClick={() => {
                      if (selectedFilters.selectedTags.includes(tag)) {
                        setSelectedFilters(prev => ({
                          ...prev,
                          selectedTags: prev.selectedTags.filter(t => t !== tag)
                        }));
                      } else {
                        setSelectedFilters(prev => ({
                          ...prev,
                          selectedTags: [...prev.selectedTags, tag]
                        }));
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setTagSelectionModal({ open: false })}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedFilters(prev => ({
                    ...prev,
                    selectedTags: []
                  }));
                }}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                Clear All Tags
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
