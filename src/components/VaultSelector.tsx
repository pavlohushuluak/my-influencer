import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Star, Search, Folder, ChevronRight, Home, ArrowLeft, Calendar, Image, Download, Upload, Edit, Share, Trash2, RefreshCcw, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedImageData {
  id: string;
  system_filename: string;
  user_filename: string | null;
  user_notes: string | null;
  user_tags: string[] | null;
  file_path: string;
  file_size_bytes: number;
  image_format: string;
  rating: number;
  favorite: boolean;
  created_at: string;
  file_type: string;
  task_id?: string;
  model_version?: string;
  quality_setting?: string;
}

interface FolderData {
  Key: string;
}

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
  title = "Select Image from Vault",
  description = "Browse your vault and select an image to use"
}: VaultSelectorProps) {
  const userData = useSelector((state: RootState) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  
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

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    // Remove the user ID and "vault/" prefix
    const pathWithoutPrefix = fullPath.replace(/^[^\/]+\/vault\//, '');
    return pathWithoutPrefix;
  };

  const encodeName = (name: string): string => {
    return name.replace(/\s/g, '_space_');
  };

  // Decode folder/file name from URL (replace _space_ with spaces)
  const decodeName = (name: string): string => {
    return name.replace(/_space_/g, ' ');
  };

  // Build folder structure from raw folder data
  const buildFolderStructure = (folderData: FolderData[]): FolderStructure[] => {
    const structure: FolderStructure[] = [];
    const pathMap = new Map<string, FolderStructure>();

    folderData.forEach(folder => {
      // Extract the folder path from the key
      const folderPath = extractFolderName(folder.Key);

      if (!folderPath) {
        return;
      }

      const pathParts = folderPath.split('/').filter(part => part.length > 0);

      let currentPath = '';

      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(currentPath)) {
          const folderNode: FolderStructure = {
            name: part,
            path: currentPath,
            children: [],
            isFolder: true
          };

          pathMap.set(currentPath, folderNode);

          if (parentPath && pathMap.has(parentPath)) {
            pathMap.get(parentPath)!.children.push(folderNode);
          } else if (!parentPath) {
            structure.push(folderNode);
          }
        }
      });
    });

    return structure;
  };

  // Navigate to folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  // Navigate to parent folder
  const navigateToParent = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
  };

  // Navigate to home (root)
  const navigateToHome = () => {
    setCurrentPath('');
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

  // Get folders for current path
  const getCurrentPathFolders = (): FolderStructure[] => {
    if (!currentPath) {
      return folderStructure;
    }

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

  // Filter and sort images
  const filteredAndSortedImages = generatedImages
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

      return sortOrder === 'desc' ? comparison : -comparison;
    });

  const hasActiveFilters = searchTerm ||
    selectedFilters.fileTypes.length > 0 ||
    selectedFilters.favorites !== null ||
    selectedFilters.ratingRange.min > 0 ||
    selectedFilters.ratingRange.max < 5 ||
    selectedFilters.withNotes !== null ||
    selectedFilters.selectedTags.length > 0;

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
        setFolders(data);

        const structure = buildFolderStructure(data);
        setFolderStructure(structure);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setFolders([]);
        setFolderStructure([]);
      } finally {
        setFoldersLoading(false);
      }
    };

    if (userData.id && open) {
      fetchFolders();
    }
  }, [userData.id, open]);

  // Fetch files for current path
  useEffect(() => {
    if (open) {
      fetchCurrentPathFiles();
    }
  }, [open, currentPath]);

  const fetchCurrentPathFiles = async () => {
    try {
      setFilesLoading(true);
      const folder = currentPath === '' ? 'output' : `vault/${currentPath}`;

      // Step 1: Get files from getfilenames API
      const filesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: folder
        })
      });

      if (!filesResponse.ok) {
        throw new Error('Failed to fetch files');
      }

      const filesData = await filesResponse.json();
      console.log('Files from API:', filesData);

      // Step 2: Get detailed information for each file from database
      const detailedImages: GeneratedImageData[] = [];

      for (const file of filesData) {
        // Extract filename from the Key (remove path and get just the filename)
        if (file.Key === undefined) continue;
        const filename = file.Key.split('/').pop();
        console.log('Filename:', filename);
        console.log('Current path:', currentPath);
        if (!filename) continue;

        try {
          const detailResponse = await fetch(`https://db.nymia.ai/rest/v1/generated_images?system_filename=eq.${filename}&user_filename=eq.${currentPath}`, {
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
      console.error('Error fetching files:', error);
      setGeneratedImages([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleImageSelect = (image: GeneratedImageData) => {
    onImageSelect(image);
    onOpenChange(false);
    toast.success(`Selected: ${decodeName(image.system_filename)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden">
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
            <div className={`absolute bg-background border shadow-2xl transform transition-transform duration-300 ${filterMenuOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
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
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Other</div>
                        <SelectItem value="rating">By Rating</SelectItem>
                        <SelectItem value="filename">By Filename</SelectItem>
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
                      onClick={() => navigateToFolder(folder.path)}
                    >
                      <div className="flex flex-col items-center p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                          <Folder className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {decodeName(folder.name)}
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
              <Badge variant="secondary">{filteredAndSortedImages.length} images</Badge>
            </div>

            {filesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading images...</p>
              </div>
            ) : filteredAndSortedImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-96">
                {filteredAndSortedImages.map((image) => (
                  <Card
                    key={image.id}
                    className={`group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-yellow-500/30 backdrop-blur-sm ${image.task_id?.startsWith('upload_')
                      ? 'bg-gradient-to-br from-purple-50/20 to-pink-50/20 dark:from-purple-950/5 dark:to-pink-950/5 hover:border-purple-500/30'
                      : 'bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5'
                      } cursor-pointer`}
                    onClick={() => handleImageSelect(image)}
                  >
                    <CardContent className="p-4">
                      {/* Top Row: File Type, Ratings, Favorite */}
                      <div className="flex items-center justify-between mb-3">
                        {/* File Type Icon */}
                        <div className={`rounded-full w-8 h-8 flex items-center justify-center shadow-md ${image.task_id?.startsWith('upload_')
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                          {image.task_id?.startsWith('upload_') ? (
                            <Upload className="w-4 h-4 text-white" />
                          ) : image.file_type === 'video' ? (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15V7l8 5-8 5z" opacity="0.3" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                              <circle cx="8.5" cy="8.5" r="1.5" opacity="0.8" />
                            </svg>
                          )}
                        </div>

                        {/* Rating Stars */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= (image.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>

                        {/* Favorite Heart */}
                        <div>
                          {image.favorite ? (
                            <div className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image */}
                      <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                        {/* Uploaded/Edited Image Indicator */}
                        {(image.model_version === 'edited' || image.quality_setting === 'edited') && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium shadow-lg">
                              <Edit className="w-3 h-3 mr-1" />
                              Edited
                            </Badge>
                          </div>
                        )}

                        <img
                          src={`https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/${image.user_filename === "" ? "output" : "vault/" + image.user_filename}/${image.system_filename}`}
                          alt={image.system_filename}
                          className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                          onError={(e) => {
                            // Fallback for uploaded files that might not be accessible via CDN
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'absolute inset-0 w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-md flex items-center justify-center';
                            fallback.innerHTML = `
                              <div class="text-center">
                                <Upload class="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <p class="text-xs text-purple-600 dark:text-purple-400">Uploaded File</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${image.system_filename}</p>
                              </div>
                            `;
                            target.parentNode?.appendChild(fallback);
                          }}
                        />
                      </div>

                      {/* User Notes */}
                      {image.user_notes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{image.user_notes}</p>
                        </div>
                      )}

                      {/* User Tags */}
                      {image.user_tags && image.user_tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {image.user_tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                          {image.user_tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{image.user_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Filename and Date */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                          {decodeName(image.system_filename)}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(image.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || hasActiveFilters ? 'No images found matching your search and filters.' : 'No images in this location.'}
                </p>
                {(searchTerm || hasActiveFilters) && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
