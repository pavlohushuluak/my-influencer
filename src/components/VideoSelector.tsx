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
import { Star, Search, Folder, ChevronRight, Home, ArrowLeft, Calendar, Video, Download, Upload, Edit, Share, Trash2, RefreshCcw, Filter, SortAsc, SortDesc, X, Plus, File, User, Play, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import config from '@/config/config';

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

interface VideoSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoSelect: (video: VideoData) => void;
  title?: string;
  description?: string;
}

export default function VideoSelector({ 
  open, 
  onOpenChange, 
  onVideoSelect, 
  title = "Select Video from Vault",
  description = "Browse your video vault and select a video to use"
}: VideoSelectorProps) {
  const userData = useSelector((state: RootState) => state.user);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [totalVideosCount, setTotalVideosCount] = useState(0);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);

  // File counts and loading states
  const [folderFileCounts, setFolderFileCounts] = useState<{ [key: string]: number }>({});
  const [loadingFileCounts, setLoadingFileCounts] = useState<{ [key: string]: boolean }>({});

  // Filter state - simplified like VideoFolder
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [lipSyncFilter, setLipSyncFilter] = useState<string>('all');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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
    navigateToFolder(parentPath);
  };

  // Navigate to home (root)
  const navigateToHome = () => {
    navigateToFolder('');
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

  // Fetch videos from current folder
  const fetchFolderFiles = async (folderPath: string) => {
    if (!userData.id) return;
    
    try {
      setVideosLoading(true);

      // Build the query for counting videos in the current path
      let countQuery = `${config.supabase_server_url}/video?user_uuid=eq.${userData.id}&status=eq.completed&select=count`;
      
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
      let query = `${config.supabase_server_url}/video?user_uuid=eq.${userData.id}&status=eq.completed`;
      
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

  // Fetch videos when filters change
  useEffect(() => {
    if (open && userData.id) {
      fetchVideosWithFilters();
    }
  }, [fetchVideosWithFilters, open, userData.id]);

  // Fetch folder file count
  const fetchFolderFileCount = async (folderPath: string) => {
    if (!userData.id) return;

    try {
      setLoadingFileCounts(prev => ({ ...prev, [folderPath]: true }));

      const response = await fetch(`${config.supabase_server_url}/video?user_uuid=eq.${userData.id}&status=eq.completed&video_path=eq.${encodeURIComponent(folderPath)}&select=count`, {
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
      console.error('Error fetching folder file count:', error);
    } finally {
      setLoadingFileCounts(prev => ({ ...prev, [folderPath]: false }));
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setModelFilter('all');
    setLipSyncFilter('all');
    setFavoriteFilter(null);
    setSortBy('newest');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Get current path folders
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

  // Get current path raw folders
  const getCurrentPathRawFolders = (): FolderData[] => {
    if (!currentPath) return folders;

    return folders.filter(folder => {
      const extractedPath = extractFolderName(folder.Key);
      return extractedPath.startsWith(currentPath + '/') && 
             extractedPath.split('/').length === currentPath.split('/').length + 1;
    });
  };

  // Handle video selection
  const handleVideoSelect = (video: VideoData) => {
    // Ensure the video has the correct URL before passing it
    const videoWithUrl = {
      ...video,
      video_url: getVideoUrl(video)
    };
    onVideoSelect(videoWithUrl);
    onOpenChange(false);
    toast.success(`Selected: ${video.prompt.substring(0, 50)}...`);
  };

  // Pagination functions
  const totalPages = Math.ceil(totalVideosCount / itemsPerPage);

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

  // Video helper functions
  const getVideoUrl = (video: VideoData) => {
    // Use video_url if available, otherwise construct from video_path and video_name
    if(video.video_url){
      return video.video_url;
    }
    const fileName = video.video_name && video.video_name.trim() !== '' ? video.video_name : video.video_id;
    return `${config.data_url}/${userData.id}/video/${video.video_path ? video.video_path + '/' : ''}${fileName}.mp4`;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Button variant="ghost" size="sm" onClick={navigateToHome} className="h-8 px-2 text-sm font-medium">
              <Home className="w-4 h-4 mr-1" /> Home
            </Button>
            {getBreadcrumbItems().map((item, index) => (
              <div key={item.path} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Button variant="ghost" size="sm" onClick={() => navigateToFolder(item.path)} className="h-8 px-2 text-sm font-medium">
                  {decodeName(item.name)}
                </Button>
              </div>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search videos by prompt, model, or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Model Filter */}
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Model" />
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

            {/* Lip Sync Filter */}
            <Select value={lipSyncFilter} onValueChange={setLipSyncFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lip_sync">Lip Sync</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>

            {/* Favorite Filter */}
            <Select 
              value={favoriteFilter === null ? 'all' : favoriteFilter ? 'true' : 'false'} 
              onValueChange={(value) => setFavoriteFilter(value === 'all' ? null : value === 'true')}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Favorite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="true">Favorites</SelectItem>
                <SelectItem value="false">Not Favorites</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
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

            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            </Button>

            {/* Clear Filters */}
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Folders Section */}
          {getCurrentPathFolders().length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Folders</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {getCurrentPathFolders().map((folder) => (
                  <Card
                    key={folder.path}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 group"
                    onClick={() => navigateToFolder(folder.path)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                        <Folder className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs font-medium truncate">{decodeName(folder.name)}</p>
                      <p className="text-xs text-muted-foreground">
                        {loadingFileCounts[folder.path] ? (
                          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-3 w-8 rounded mx-auto mt-1"></div>
                        ) : (
                          `${folderFileCounts[folder.path] || 0} videos`
                        )}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Videos ({totalVideosCount})
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Show:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Videos Grid */}
            {videosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(itemsPerPage)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos.map((video) => (
                  <Card
                    key={video.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 group"
                    onClick={() => handleVideoSelect(video)}
                  >
                    <CardContent className="p-4">
                      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg overflow-hidden mb-3">
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
                      <div className="space-y-3">
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No videos found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || modelFilter !== 'all' || lipSyncFilter !== 'all' || favoriteFilter !== null
                    ? 'Try adjusting your search or filters'
                    : 'This folder is empty. Create some videos to get started!'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalVideosCount > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalVideosCount)} of {totalVideosCount} videos
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  First
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
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
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