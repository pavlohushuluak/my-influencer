import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Star, Search, Folder, ChevronRight, Home, ArrowLeft, Calendar, Image, Download, Upload, Edit, Share, Trash2, RefreshCcw, Filter, SortAsc, SortDesc, X, Plus, File, User, Music, Video } from 'lucide-react';
import { toast } from 'sonner';
import config from '@/config/config';

// Interface for folder data from API
interface FolderData {
  Key: string;
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

interface VaultSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (image: GeneratedImageData) => void;
  title?: string;
  description?: string;
}

export default function VaultSelector({ 
  open, 
  onOpenChange, 
  onImageSelect, 
  title = "Select Image from Library",
  description = "Browse your library and select an image to use"
}: VaultSelectorProps) {
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

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    // Remove the user ID and "vault/" prefix
    const pathWithoutPrefix = fullPath.replace(/^[^\/]+\/vault\//, '');
    return pathWithoutPrefix;
  };

  const encodeName = (name: string): string => {
    return name.replace(/\s/g, '_space_');
  };

  // Decode folder/file name from URL (replace %20 with spaces)
  const decodeName = (name: string): string => {
    return name.replace(/_space_/g, ' ');
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

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const navigateToParent = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const navigateToHome = () => {
    setCurrentPath('');
  };

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

  // Fetch file counts for folders
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

  const handleImageSelect = (image: GeneratedImageData) => {
    onImageSelect(image);
    onOpenChange(false);
    toast.success(`Selected: ${decodeName(image.system_filename)}`);
  };

  // Pagination functions
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = generatedImages;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(totalPages);
  const goToPreviousPage = () => handlePageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => handlePageChange(Math.min(totalPages, currentPage + 1));

  const getImageUrl = (image: GeneratedImageData) => {
    return `${config.data_url}/${userData.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Image className="w-5 h-5 text-white" />
            </div>
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-4">
          {/* Professional Search and Filter Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search library by title, notes, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="filename">Filename</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              </Button>

              {/* Filter Menu Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className={`${filterMenuOpen ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(selectedFilters.fileTypes.length > 0 || selectedFilters.favorites !== null || selectedFilters.ratingRange.min > 0 || selectedFilters.ratingRange.max < 5 || selectedFilters.withNotes !== null || selectedFilters.selectedTags.length > 0) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {[
                      selectedFilters.fileTypes.length,
                      selectedFilters.favorites !== null ? 1 : 0,
                      selectedFilters.ratingRange.min > 0 || selectedFilters.ratingRange.max < 5 ? 1 : 0,
                      selectedFilters.withNotes !== null ? 1 : 0,
                      selectedFilters.selectedTags.length
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>

              {/* Clear Filters */}
              {(selectedFilters.fileTypes.length > 0 || selectedFilters.favorites !== null || selectedFilters.ratingRange.min > 0 || selectedFilters.ratingRange.max < 5 || selectedFilters.withNotes !== null || selectedFilters.selectedTags.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter Menu */}
          {filterMenuOpen && (
            <Card className="p-4 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* File Type Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">File Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {['pic', 'video'].map((type) => (
                      <Button
                        key={type}
                        variant={selectedFilters.fileTypes.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedFilters(prev => ({
                            ...prev,
                            fileTypes: prev.fileTypes.includes(type)
                              ? prev.fileTypes.filter(t => t !== type)
                              : [...prev.fileTypes, type]
                          }));
                        }}
                        className="text-xs"
                      >
                        {type === 'pic' ? 'Image' : 'Video'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Favorite Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Favorite Status</Label>
                  <Select
                    value={selectedFilters.favorites === null ? 'all' : selectedFilters.favorites.toString()}
                    onValueChange={(value) => {
                      setSelectedFilters(prev => ({
                        ...prev,
                        favorites: value === 'all' ? null : value === 'true'
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="true">Favorites Only</SelectItem>
                      <SelectItem value="false">Non-Favorites Only</SelectItem>
                    </SelectContent>
                  </Select>
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
                        setSelectedFilters(prev => ({
                          ...prev,
                          ratingRange: { ...prev.ratingRange, min: parseInt(e.target.value) || 0 }
                        }));
                      }}
                      className="w-16"
                      placeholder="Min"
                    />
                    <span className="text-sm">to</span>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={selectedFilters.ratingRange.max}
                      onChange={(e) => {
                        setSelectedFilters(prev => ({
                          ...prev,
                          ratingRange: { ...prev.ratingRange, max: parseInt(e.target.value) || 5 }
                        }));
                      }}
                      className="w-16"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Notes Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notes Status</Label>
                  <Select
                    value={selectedFilters.withNotes === null ? 'all' : selectedFilters.withNotes.toString()}
                    onValueChange={(value) => {
                      setSelectedFilters(prev => ({
                        ...prev,
                        withNotes: value === 'all' ? null : value === 'true'
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="true">With Notes</SelectItem>
                      <SelectItem value="false">Without Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToHome}
              className="h-8 px-2 text-sm font-medium"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
            {getBreadcrumbItems().map((item, index) => (
              <div key={item.path} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToFolder(item.path)}
                  className="h-8 px-2 text-sm font-medium"
                >
                  {decodeName(item.name)}
                </Button>
              </div>
            ))}
          </div>

          {/* Folders Section */}
          {!searchTerm && (
            <div className="space-y-4">
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

          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Images</h3>
              <Badge variant="secondary">{currentItems.length} images</Badge>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-muted-foreground">Loading images...</p>
                </div>
              </div>
            )}

            {/* Images Grid */}
            {!isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {currentItems.map((image) => (
                  <Card
                    key={image.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 group"
                    onClick={() => handleImageSelect(image)}
                  >
                    <CardContent className="p-2">
                      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg overflow-hidden mb-2">
                        <img
                          src={getImageUrl(image)}
                          alt={decodeName(image.system_filename)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {image.favorite && (
                          <div className="absolute top-2 right-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          </div>
                        )}
                        {image.rating > 0 && (
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
                            ⭐ {image.rating}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium truncate">
                          {decodeName(image.system_filename)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(image.created_at).toLocaleDateString()}
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
            )}

            {/* Empty State */}
            {!isLoading && currentItems.length === 0 && (
              <div className="text-center py-12">
                <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No images found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedFilters.fileTypes.length > 0 || selectedFilters.favorites !== null || selectedFilters.ratingRange.min > 0 || selectedFilters.ratingRange.max < 5 || selectedFilters.withNotes !== null || selectedFilters.selectedTags.length > 0
                    ? 'Try adjusting your search or filters'
                    : 'This folder is empty. Upload some images to get started!'
                  }
                </p>
              </div>
            )}
          </div>

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
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                    <SelectItem value="96">96</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
