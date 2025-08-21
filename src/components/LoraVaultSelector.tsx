import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Upload,
  Eye,
  Heart,
  Tag,
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Home,
  ExternalLink
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DialogContentZoom } from '@/components/ui/zoomdialog';
import { DialogZoom } from '@/components/ui/zoomdialog';
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

interface LoraVaultSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageUpload: (image: GeneratedImageData) => void;
  title?: string;
  description?: string;
}

export default function LoraVaultSelector({ 
  open, 
  onOpenChange, 
  onImageUpload, 
  title = "Select Image from Library",
  description = "Browse your library and select an image to copy to AI consistency training folder"
}: LoraVaultSelectorProps) {
  const userData = useSelector((state: RootState) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Filter state
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

  // Filter menu state
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  
  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);

  // Folder file counts
  const [folderFileCounts, setFolderFileCounts] = useState<{ [key: string]: number }>({});
  const [loadingFileCounts, setLoadingFileCounts] = useState<{ [key: string]: boolean }>({});

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Full-size image modal state
  const [showFullSizeModal, setShowFullSizeModal] = useState(false);
  const [fullSizeImage, setFullSizeImage] = useState<{ url: string; title: string; description: string } | null>(null);

  // Upload loading state
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    // Remove the user ID and "vault/" prefix
    const pathWithoutPrefix = fullPath.replace(/^[^\/]+\/vault\//, '');
    return pathWithoutPrefix;
  };

  // Encode folder name for URL
  const encodeName = (name: string): string => {
    return encodeURIComponent(name);
  };

  // Decode folder name from URL
  const decodeName = (name: string): string => {
    return decodeURIComponent(name);
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
            const parent = pathMap.get(parentPath);
            if (parent) {
              parent.children.push(folderNode);
            }
          } else if (parentPath === '') {
            // console.log(`Adding to root structure`);
            structure.push(folderNode);
          }
        }
      });
    });

    // console.log('Final structure:', structure);
    return structure;
  };

  // Navigate to a specific folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setCurrentPage(1);
  };

  // Navigate to parent folder
  const navigateToParent = () => {
    const pathParts = currentPath.split('/').filter(part => part !== '');
    if (pathParts.length > 0) {
      pathParts.pop();
      const newPath = pathParts.join('/');
      setCurrentPath(newPath);
      setCurrentPage(1);
    }
  };

  // Navigate to home (root)
  const navigateToHome = () => {
    setCurrentPath('');
    setCurrentPage(1);
  };

  // Get breadcrumb items for navigation
  const getBreadcrumbItems = () => {
    const items = [{ name: 'Home', path: '' }];
    if (currentPath) {
      const pathParts = currentPath.split('/').filter(part => part !== '');
      let currentFullPath = '';
      pathParts.forEach(part => {
        currentFullPath = currentFullPath ? `${currentFullPath}/${part}` : part;
        items.push({
          name: decodeName(part),
          path: currentFullPath
        });
      });
    }
    return items;
  };

  // Get current path folders
  const getCurrentPathFolders = (): FolderStructure[] => {
    const findFolder = (folders: FolderStructure[], path: string): FolderStructure | null => {
      for (const folder of folders) {
        if (folder.path === path) {
          return folder;
        }
        const found = findFolder(folder.children, path);
        if (found) return found;
      }
      return null;
    };

    const currentFolder = findFolder(folderStructure, currentPath);
    return currentFolder ? currentFolder.children : folderStructure;
  };

  // Get current path raw folders for API calls
  const getCurrentPathRawFolders = (): FolderData[] => {
    return folders.filter(folder => {
      const folderPath = extractFolderName(folder.Key);
      if (!folderPath) return false;

      if (!currentPath) {
        // Root level - show folders that don't have subfolders
        return !folderPath.includes('/');
      } else {
        // Show immediate children of current path
        const pathParts = folderPath.split('/');
        return pathParts.length > 0 && 
               pathParts[0] === currentPath.split('/')[0] && 
               folderPath.startsWith(currentPath + '/') &&
               folderPath.split('/').length === currentPath.split('/').length + 1;
      }
    });
  };

  // Fetch file count for a specific folder
  const fetchFolderFileCount = async (folderPath: string) => {
    if (!userData.id) return;

    try {
      setLoadingFileCounts(prev => ({ ...prev, [folderPath]: true }));

      const response = await fetch(`${config.supabase_server_url}/generated_images?user_uuid=eq.${userData.id}&generation_status=eq.completed&user_filename=eq.${folderPath}&select=count`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const count = data[0]?.count || 0;
        setFolderFileCounts(prev => ({ ...prev, [folderPath]: count }));
      }
    } catch (error) {
      console.error(`Error fetching file count for folder ${folderPath}:`, error);
    } finally {
      setLoadingFileCounts(prev => ({ ...prev, [folderPath]: false }));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      fileTypes: [],
      favorites: null,
      ratingRange: { min: 0, max: 5 },
      withNotes: null,
      withTags: null,
      selectedTags: []
    });
  };

  // Fetch folders
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
            folder: "vault"
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

    if (open && userData.id) {
      fetchFolders();
    }
  }, [open, userData.id]);

  // Fetch all folder file counts
  useEffect(() => {
    const fetchAllFolderFileCounts = async () => {
      const currentFolders = getCurrentPathRawFolders();
      for (const folder of currentFolders) {
        await fetchFolderFileCount(folder.Key);
      }
    };

    if (folders.length > 0) {
      fetchAllFolderFileCounts();
    }
  }, [folders, currentPath]);

  // Handle image selection
  const handleImageUpload = (image: GeneratedImageData) => {
    onImageUpload(image);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Pagination helpers
  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(totalPages);
  const goToPreviousPage = () => handlePageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => handlePageChange(Math.min(totalPages, currentPage + 1));

  // Get image URL
  const getImageUrl = (image: GeneratedImageData) => {
    return `${config.data_url}/${userData.id}/${image.user_filename === "" || image.user_filename === null ? "output" : "vault/" + image.user_filename}/${image.system_filename}`;
  };

  // Get full size image URL
  const getFullSizeImageUrl = (image: GeneratedImageData) => {
    return `${config.data_url}/${userData.id}/${image.user_filename === "" || image.user_filename === null ? "output" : "vault/" + image.user_filename}/${image.system_filename}`;
  };

  // Handle view full size
  const handleViewFullSize = (image: GeneratedImageData) => {
    const imageUrl = getFullSizeImageUrl(image);
    const title = image.user_filename || image.system_filename;
    const description = `Generated on ${new Date(image.created_at).toLocaleDateString()}`;
    
    setFullSizeImage({ url: imageUrl, title, description });
    setShowFullSizeModal(true);
  };

  // Professional data fetching with proper user_uuid filtering, search, and pagination
  const fetchVaultDataWithFilters = useCallback(async () => {
    if (!userData.id) return;

    try {
      setIsLoading(true);
      setFilesLoading(true);

      // Build query parameters for database
      const queryParams = new URLSearchParams();
      
      // Base user filter
      queryParams.append('user_uuid', 'eq.' + userData.id);
      
      // Generation status filter - only show completed images
      queryParams.append('generation_status', 'eq.completed');
      
      // Current path filter - show files from current folder
      if (currentPath === '') {
        // Root folder - show files with empty user_filename or null
        queryParams.append('or', '(user_filename.is.null,user_filename.eq.)');
      } else {
        // Specific folder - show files with matching user_filename
        queryParams.append('user_filename', 'eq.' + currentPath);
      }
      
      // Search filter
      if (searchTerm.trim()) {
        queryParams.append('or', `(system_filename.ilike.*${searchTerm}*,user_filename.ilike.*${searchTerm}*,user_notes.ilike.*${searchTerm}*,user_tags.cs.{${searchTerm}})`);
      }
      
      // File type filter
      if (selectedFilters.fileTypes.length > 0) {
        queryParams.append('file_type', 'in.(' + selectedFilters.fileTypes.join(',') + ')');
      }
      
      // Favorite filter
      if (selectedFilters.favorites !== null) {
        queryParams.append('favorite', 'eq.' + selectedFilters.favorites);
      }
      
      // Rating range filter
      if (selectedFilters.ratingRange.min > 0) {
        queryParams.append('rating', 'gte.' + selectedFilters.ratingRange.min);
      }
      if (selectedFilters.ratingRange.max < 5) {
        queryParams.append('rating', 'lte.' + selectedFilters.ratingRange.max);
      }
      
      // Notes filter
      if (selectedFilters.withNotes === true) {
        queryParams.append('user_notes', 'not.is.null');
        queryParams.append('user_notes', 'neq.');
      } else if (selectedFilters.withNotes === false) {
        queryParams.append('or', '(user_notes.is.null,user_notes.eq.)');
      }
      
      // Tags filter
      if (selectedFilters.selectedTags.length > 0) {
        queryParams.append('user_tags', 'cs.{' + selectedFilters.selectedTags.join(',') + '}');
      }
      
      // Sorting
      let orderBy = 'created_at';
      if (sortBy === 'newest' || sortBy === 'oldest') {
        orderBy = 'created_at';
      } else if (sortBy === 'rating') {
        orderBy = 'rating';
      } else if (sortBy === 'filename') {
        orderBy = 'system_filename';
      }
      
      queryParams.append('order', orderBy + '.' + (sortOrder === 'desc' ? 'desc' : 'asc'));
      
      // Pagination
      const offset = (currentPage - 1) * itemsPerPage;
      queryParams.append('limit', itemsPerPage.toString());
      queryParams.append('offset', offset.toString());

      // Fetch data from database with all filters
      const response = await fetch(`${config.supabase_server_url}/generated_images?${queryParams.toString()}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch library data');
      }

      const data: GeneratedImageData[] = await response.json();
      
      // Get total count for pagination
      const countParams = new URLSearchParams();
      countParams.append('user_uuid', 'eq.' + userData.id);
      
      // Generation status filter for count query - only show completed images
      countParams.append('generation_status', 'eq.completed');
      
      // Current path filter for count query
      if (currentPath === '') {
        // Root folder - show files with empty user_filename or null
        countParams.append('or', '(user_filename.is.null,user_filename.eq.)');
      } else {
        // Specific folder - show files with matching user_filename
        countParams.append('user_filename', 'eq.' + currentPath);
      }
      
      if (searchTerm.trim()) {
        countParams.append('or', `(system_filename.ilike.*${searchTerm}*,user_filename.ilike.*${searchTerm}*,user_notes.ilike.*${searchTerm}*,user_tags.cs.{${searchTerm}})`);
      }
      
      if (selectedFilters.fileTypes.length > 0) {
        countParams.append('file_type', 'in.(' + selectedFilters.fileTypes.join(',') + ')');
      }
      
      if (selectedFilters.favorites !== null) {
        countParams.append('favorite', 'eq.' + selectedFilters.favorites);
      }
      
      if (selectedFilters.ratingRange.min > 0) {
        countParams.append('rating', 'gte.' + selectedFilters.ratingRange.min);
      }
      if (selectedFilters.ratingRange.max < 5) {
        countParams.append('rating', 'lte.' + selectedFilters.ratingRange.max);
      }
      
      if (selectedFilters.withNotes === true) {
        countParams.append('user_notes', 'not.is.null');
        countParams.append('user_notes', 'neq.');
      } else if (selectedFilters.withNotes === false) {
        countParams.append('or', '(user_notes.is.null,user_notes.eq.)');
      }
      
      if (selectedFilters.selectedTags.length > 0) {
        countParams.append('user_tags', 'cs.{' + selectedFilters.selectedTags.join(',') + '}');
      }

      const countResponse = await fetch(`${config.supabase_server_url}/generated_images?${countParams.toString()}&select=count`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI',
          'Content-Type': 'application/json'
        }
      });

      if (countResponse.ok) {
        const countData = await countResponse.json();
        setTotalItems(countData[0]?.count || 0);
      }

      setGeneratedImages(data);
      console.log('Fetched library data:', data);

    } catch (error) {
      console.error('Error fetching library data:', error);
      toast.error('Failed to fetch library data', {
        description: 'Please try again later.',
        duration: 5000
      });
      setGeneratedImages([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
      setFilesLoading(false);
    }
  }, [userData.id, currentPath, searchTerm, selectedFilters, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Fetch data when filters or pagination changes
  useEffect(() => {
    if (open) {
      fetchVaultDataWithFilters();
    }
  }, [fetchVaultDataWithFilters, open]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilters, sortBy, sortOrder]);

  // Current items (same as VaultSelector)
  const currentItems = generatedImages;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Header with search and filters */}
          <div className="flex flex-col gap-4 p-4 border-b">
            {/* Search and view controls */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>

                <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filters</h4>
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear All
                        </Button>
                      </div>

                      {/* Rating Filter */}
                      <div>
                        <Label className="text-sm font-medium">Rating</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            value={selectedFilters.ratingRange.min}
                            onChange={(e) => setSelectedFilters(prev => ({
                              ...prev,
                              ratingRange: { ...prev.ratingRange, min: Number(e.target.value) }
                            }))}
                            className="w-20"
                          />
                          <span>to</span>
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            value={selectedFilters.ratingRange.max}
                            onChange={(e) => setSelectedFilters(prev => ({
                              ...prev,
                              ratingRange: { ...prev.ratingRange, max: Number(e.target.value) }
                            }))}
                            className="w-20"
                          />
                        </div>
                      </div>

                      {/* Favorites Filter */}
                      <div>
                        <Label className="text-sm font-medium">Favorites</Label>
                        <div className="flex gap-2 mt-1">
                          <Button
                            variant={selectedFilters.favorites === true ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilters(prev => ({
                              ...prev,
                              favorites: prev.favorites === true ? null : true
                            }))}
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            Favorites
                          </Button>
                          <Button
                            variant={selectedFilters.favorites === false ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilters(prev => ({
                              ...prev,
                              favorites: prev.favorites === false ? null : false
                            }))}
                          >
                            Not Favorites
                          </Button>
                        </div>
                      </div>

                      {/* Notes Filter */}
                      <div>
                        <Label className="text-sm font-medium">Notes</Label>
                        <div className="flex gap-2 mt-1">
                          <Button
                            variant={selectedFilters.withNotes === true ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilters(prev => ({
                              ...prev,
                              withNotes: prev.withNotes === true ? null : true
                            }))}
                          >
                            With Notes
                          </Button>
                          <Button
                            variant={selectedFilters.withNotes === false ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilters(prev => ({
                              ...prev,
                              withNotes: prev.withNotes === false ? null : false
                            }))}
                          >
                            Without Notes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SortAsc className="w-4 h-4 mr-2" />
                      Sort
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="end">
                    <div className="space-y-2">
                      <Button
                        variant={sortBy === 'created_at' ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSortBy('created_at')}
                      >
                        Date
                      </Button>
                      <Button
                        variant={sortBy === 'rating' ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSortBy('rating')}
                      >
                        Rating
                      </Button>
                      <Button
                        variant={sortBy === 'system_filename' ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSortBy('system_filename')}
                      >
                        Name
                      </Button>
                      <div className="border-t pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Breadcrumb navigation */}
            <div className="flex items-center gap-2 text-sm">
              {getBreadcrumbItems().map((item, index) => (
                <div key={item.path} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToFolder(item.path)}
                    className="h-auto p-1 text-sm"
                  >
                    {index === 0 ? <Home className="w-4 h-4" /> : item.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Folders Section */}
          {!searchTerm && (
            <div className="space-y-4 p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Folders</h3>
                <Badge variant="secondary">{getCurrentPathFolders().length} folders</Badge>
              </div>

              {foldersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading folders...</p>
                </div>
              ) : getCurrentPathFolders().length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {getCurrentPathFolders().map((folder) => (
                    <div
                      key={folder.path}
                      className="group cursor-pointer"
                      onDoubleClick={() => navigateToFolder(folder.path)}
                    >
                      <div className="flex flex-col items-center p-3 rounded-lg border-2 border-transparent transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-110">
                          <Folder className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {decodeName(folder.name)}
                        </span>
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No folders in this location</p>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCcw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading images...</p>
                </div>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileImage className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-semibold mb-2">No images found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search' : 'No images in this folder'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto p-4">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {currentItems.map((image) => (
                      <Card key={image.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-3">
                          <div className="relative aspect-square mb-3">
                            <img
                              src={getImageUrl(image)}
                              alt={image.system_filename}
                              className="w-full h-full object-cover rounded-lg cursor-pointer"
                              onClick={() => handleViewFullSize(image)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewFullSize(image);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageUpload(image);
                                  }}
                                  disabled={uploadingImages.has(image.id)}
                                >
                                  {uploadingImages.has(image.id) ? (
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate" title={image.system_filename}>
                                {image.system_filename}
                              </p>
                              {image.favorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {image.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="text-xs">{image.rating}</span>
                                </div>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(image.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            {image.user_tags && image.user_tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {image.user_tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {image.user_tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{image.user_tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentItems.map((image) => (
                      <Card key={image.id} className="group hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <img
                                src={getImageUrl(image)}
                                alt={image.system_filename}
                                className="w-full h-full object-cover rounded-lg cursor-pointer"
                                onClick={() => handleViewFullSize(image)}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium truncate" title={image.system_filename}>
                                  {image.system_filename}
                                </p>
                                <div className="flex items-center gap-2">
                                  {image.favorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewFullSize(image)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleImageUpload(image)}
                                    disabled={uploadingImages.has(image.id)}
                                  >
                                    {uploadingImages.has(image.id) ? (
                                      <RefreshCcw className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Upload className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {image.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span>{image.rating}</span>
                                  </div>
                                )}
                                <span>{new Date(image.created_at).toLocaleDateString()}</span>
                                <span>{image.user_filename || 'output'}</span>
                              </div>

                              {image.user_tags && image.user_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {image.user_tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} images
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Full Size Image Modal */}
        {showFullSizeModal && fullSizeImage && (
          <DialogZoom open={showFullSizeModal} onOpenChange={setShowFullSizeModal}>
            <DialogContentZoom className="flex max-h-[90vh] max-w-[90vw] p-0">
              <div>
                <img
                  src={fullSizeImage.url}
                  alt={fullSizeImage.title}
                  className="h-full w-full object-contain"
                />
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/30 hover:bg-black/50 border-white/30 text-white backdrop-blur-sm"
                    onClick={() => window.open(fullSizeImage.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{fullSizeImage.title}</span>
                        <span>•</span>
                        <span className="text-white/70">Generated with AI</span>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs mt-1">{fullSizeImage.description}</p>
                  </div>
                </div>
              </div>
            </DialogContentZoom>
          </DialogZoom>
        )}
      </DialogContent>
    </Dialog>
  );
} 