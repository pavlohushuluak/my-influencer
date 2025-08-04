import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, RefreshCw, Calendar as CalendarIcon, ZoomIn, Download, Share, Trash2, Edit3, RotateCcw, Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import config from '@/config/config';

export default function HistoryCard({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userData = useSelector((state: RootState) => state.user);
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [imagesByTask, setImagesByTask] = useState<{ [taskId: string]: any[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [jumpPage, setJumpPage] = useState('');
  const [zoomModal, setZoomModal] = useState<{ open: boolean; imageUrl: string; imageName: string }>({ open: false, imageUrl: '', imageName: '' });
  const [regeneratingImages, setRegeneratingImages] = useState<Set<string>>(new Set());
  const [shareModal, setShareModal] = useState<{ open: boolean; itemId: string | null; itemPath: string | null }>({ open: false, itemId: null, itemPath: null });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'filename'>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${config.supabase_server_url}/tasks?uuid=eq.${userId}&type=eq.generate_image&order=id.desc`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      }
    })
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(() => setError('Failed to fetch history.'))
      .finally(() => setIsLoading(false));
  }, [userId, refreshKey]);

  useEffect(() => {
    if (!tasks.length) return;
    setIsImagesLoading(true);
    
    // Fetch images for all tasks if not already loaded
    Promise.all(
      tasks.map(task =>
        imagesByTask[task.id]
          ? Promise.resolve()
          : fetch(`${config.supabase_server_url}/generated_images?task_id=eq.${task.id}&generation_status=eq.completed`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              }
            })
              .then(res => res.json())
              .then(imgs => setImagesByTask(prev => ({ ...prev, [task.id]: imgs })))
              .catch(() => {})
      )
    ).finally(() => setIsImagesLoading(false));
    // eslint-disable-next-line
  }, [tasks, imagesByTask]);

  // Get all images from all tasks
  const allImages = tasks.flatMap(task => 
    (imagesByTask[task.id] || []).map(image => ({
      ...image,
      task: task // Include task info for display
    }))
  );

  // Apply search and filters
  const filteredImages = allImages.filter(image => {
    // Search by filename
    if (searchTerm && !image.system_filename.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Date range filter
    if (dateRange?.from || dateRange?.to) {
      const imageDate = new Date(image.created_at);
      if (dateRange.from && imageDate < dateRange.from) return false;
      if (dateRange.to && imageDate > dateRange.to) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && image.generation_status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Apply sorting
  const sortedImages = [...filteredImages].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'newest':
      case 'oldest':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'filename':
        comparison = a.system_filename.localeCompare(b.system_filename);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Update active filters
  useEffect(() => {
    const filters = [];
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    if (dateRange?.from || dateRange?.to) filters.push('Date Range');
    if (statusFilter !== 'all') filters.push(`Status: ${statusFilter}`);
    setActiveFilters(filters);
  }, [searchTerm, dateRange, statusFilter]);

  // Paginate images instead of tasks
  const start = pageSize === -1 ? 0 : (page - 1) * pageSize;
  const end = pageSize === -1 ? sortedImages.length : start + pageSize;
  const pageImages = sortedImages.slice(start, end);
  const pageCount = pageSize === -1 ? 1 : Math.ceil(sortedImages.length / pageSize);

  const handleRefresh = () => {
    setImagesByTask({});
    setRefreshKey(k => k + 1);
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpPage, 10);
    if (!isNaN(num) && num >= 1 && num <= pageCount) setPage(num);
    setJumpPage('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange(undefined);
    setStatusFilter('all');
    setSortBy('newest');
    setSortOrder('desc');
    setPage(1);
  };

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'date':
        setDateRange(undefined);
        break;
      case 'status':
        setStatusFilter('all');
        break;
    }
    setPage(1);
  };

  const handleDownload = async (image: any) => {
    try {
      toast({
        title: 'Downloading image...',
        description: 'This may take a moment',
        variant: 'default'
      });

      const filename = image.file_path.split('/').pop();
      console.log(filename);

      const response = await fetch('https://api.nymia.ai/v1/downloadfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: 'output/' + filename
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
      link.download = image.system_filename || `generated-image-${Date.now()}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success!',
        description: 'Image downloaded successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to download image. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (image: any) => {
    try {
      toast({
        title: 'Deleting image...',
        description: 'This may take a moment',
        variant: 'default'
      });

      const filename = image.file_path.split('/').pop();

      await fetch(`https://api.nymia.ai/v1/deletefile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: 'output/' + filename
        })
      });

      await fetch(`${config.supabase_server_url}/generated_images?id=eq.${image.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      // Remove from local state
      setImagesByTask(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(taskId => {
          newState[taskId] = newState[taskId].filter(img => img.id !== image.id);
        });
        return newState;
      });

      toast({
        title: 'Success!',
        description: `Image "${filename}" deleted successfully`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleShare = (systemFilename: string) => {
    setShareModal({ open: true, itemId: systemFilename, itemPath: 'output' });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Success!',
        description: 'Link copied to clipboard',
        variant: 'default'
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareToSocialMedia = (platform: string, itemId: string) => {
    const imageUrl = `${config.data_url}/cdn-cgi/image/w=800/${userData.id}/output/${itemId}`;
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

  const handleEdit = (image: any) => {
    navigate('/content/edit', {
      state: {
        imageData: image
      }
    });
  };

  const handleRegenerate = async (image: any) => {
    // Only allow regeneration for non-uploaded and non-edited images
    if (image.model_version === 'edited' || image.quality_setting === 'edited' || image.task_id?.startsWith('upload_')) {
      toast({
        title: 'Error',
        description: 'Cannot regenerate uploaded or edited images',
        variant: 'destructive'
      });
      return;
    }

    setRegeneratingImages(prev => new Set(prev).add(image.system_filename));

    try {
      toast({
        title: 'Regenerating image...',
        description: 'Fetching original task data and creating new generation',
        variant: 'default'
      });

      // Step 1: Get the task_id from the generated image
      const imageResponse = await fetch(`${config.supabase_server_url}/generated_images?file_path=eq.${image.file_path}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image data');
      }

      const imageData = await imageResponse.json();
      if (!imageData || imageData.length === 0) {
        throw new Error('Image data not found');
      }

      const taskId = imageData[0].task_id;

      // Step 2: Get the original task data
      const taskResponse = await fetch(`${config.supabase_server_url}/tasks?id=eq.${taskId}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!taskResponse.ok) {
        throw new Error('Failed to fetch task data');
      }

      const taskData = await taskResponse.json();
      if (!taskData || taskData.length === 0) {
        throw new Error('Task data not found');
      }

      const originalTask = taskData[0];
      console.log("OriginalTask:", originalTask.jsonjob);

      // Step 3: Parse the JSON job data
      const jsonjob = JSON.parse(originalTask.jsonjob);
      console.log("Parsed JSON job:", jsonjob);
      if (jsonjob.seed === -1) {
        jsonjob.seed = null;
      }

      // Step 4: Set the regenerated_from field to the original image ID
      jsonjob.regenerated_from = image.id || '12345678-1111-2222-3333-caffebabe0123';

      // Step 5: Navigate to ContentCreate with the JSON job data
      navigate('/content/create', {
        state: {
          jsonjobData: jsonjob,
          isRegeneration: true,
          originalImage: image
        }
      });

      toast({
        title: 'Success!',
        description: 'Redirecting to ContentCreate for regeneration',
        variant: 'default'
      });

    } catch (error) {
      console.error('Regeneration error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setRegeneratingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(image.system_filename);
        return newSet;
      });
    }
  };

  return (
    <div className="mt-12 mb-8 w-full mx-auto bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl shadow-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">Generation History</h3>
          <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh history">
            <RefreshCw className="w-5 h-5 text-blue-400" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <label className="text-sm text-slate-300 mr-2">Show per page:</label>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="rounded-md px-2 py-1 bg-slate-800 text-white border border-slate-700 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={-1}>ALL</option>
          </select>
          {pageCount > 1 && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <span className="text-slate-300">Page {page} / {pageCount}</span>
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</Button>
              <form onSubmit={handleJump} className="inline-flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={jumpPage}
                  onChange={e => setJumpPage(e.target.value)}
                  className="w-14 rounded-md px-2 py-1 bg-slate-800 text-white border border-slate-700 focus:outline-none"
                  placeholder="Go to"
                  aria-label="Jump to page"
                />
                <Button type="submit" size="sm" variant="outline" className="px-2 py-1">Go</Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
            {searchTerm && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {filter}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFilter(filter.toLowerCase().includes('search') ? 'search' : filter.toLowerCase().includes('date') ? 'date' : 'status')}
                  className="ml-1 h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Results Summary */}
        <div className="text-sm text-slate-400">
          Showing {pageImages.length} of {sortedImages.length} images
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {error && <div className="text-center py-8 text-red-400">{error}</div>}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-2" />
          <div className="text-slate-400">Loading history...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-slate-400 text-lg mb-2">No generation history found.</div>
          <div className="text-slate-500 text-sm">Your generated images will appear here.</div>
        </div>
      ) : sortedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-slate-400 text-lg mb-2">No images match your filters.</div>
          <div className="text-slate-500 text-sm">Try adjusting your search criteria.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {pageImages.map(image => (
            <Card
              key={image.id}
              className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/50 backdrop-blur-sm bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5 hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-blue-950/10 dark:hover:to-purple-950/10 cursor-pointer"
            >
              <CardContent className="p-4">
                {/* Top Row: File Type, Static Stars, Static Heart */}
                <div className="flex items-center justify-between mb-3">
                  {/* File Type Icon */}
                  <div className="rounded-full w-8 h-8 flex items-center justify-center shadow-md bg-gradient-to-br from-blue-500 to-purple-600">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                      <circle cx="8.5" cy="8.5" r="1.5" opacity="0.8" />
                    </svg>
                  </div>
                  {/* Static 5 gray stars */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 text-gray-300"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  {/* Static gray heart */}
                  <div>
                    <div className="bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Image */}
                <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                  <img
                    src={`${config.data_url}/cdn-cgi/image/w=400/${image.file_path}`}
                    alt={image.system_filename}
                    className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={() => setZoomModal({ open: true, imageUrl: `${config.data_url}/cdn-cgi/image/w=1200/${image.file_path}`, imageName: image.system_filename })}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {/* Zoom Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md flex items-end justify-end p-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomModal({ open: true, imageUrl: `${config.data_url}/cdn-cgi/image/w=1200/${image.file_path}`, imageName: image.system_filename });
                        }}
                      >
                        <ZoomIn className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Filename and Date */}
                <div className="space-y-2 mb-2">
                  <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                    {image.system_filename}
                  </h3>
                </div>
                {/* Prompt and Task ID */}
                <div className="space-y-1 mb-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Task ID:</span> {image.task.id}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-1.5 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs font-medium hover:bg-purple-700 hover:border-purple-500 transition-colors"
                    onClick={() => handleDownload(image)}
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 hover:bg-green-50 hover:bg-green-700 hover:border-green-500 transition-colors"
                    onClick={() => handleShare(image.system_filename)}
                  >
                    <Share className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-amber-500 hover:border-amber-300 transition-colors"
                    onClick={() => handleDelete(image)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 hover:from-blue-600 hover:to-purple-700 hover:border-blue-600 transition-all duration-200 shadow-sm"
                    onClick={() => handleEdit(image)}
                    title="Edit this image with professional tools"
                  >
                    <Edit3 className="w-3 h-3 mr-1.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </div>
                {/* Regenerate Button */}
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => handleRegenerate(image)}
                    disabled={regeneratingImages.has(image.system_filename)}
                  >
                    {regeneratingImages.has(image.system_filename) ? (
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-3 h-3 animate-spin" />
                        <span>Regenerating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Zoom Modal */}
      {zoomModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setZoomModal({ open: false, imageUrl: '', imageName: '' })}>
          <div className="relative max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <img src={zoomModal.imageUrl} alt={zoomModal.imageName} className="w-full h-auto rounded-lg shadow-2xl" />
            <button className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-2 hover:bg-black/90" onClick={() => setZoomModal({ open: false, imageUrl: '', imageName: '' })}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
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
                      value={`${config.data_url}/cdn-cgi/image/w=800/${userData.id}/${shareModal.itemPath}/${shareModal.itemId}`}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`${config.data_url}/cdn-cgi/image/w=800/${userData.id}/${shareModal.itemPath}/${shareModal.itemId}`)}
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
    </div>
  );
} 