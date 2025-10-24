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
import { Loader2, RefreshCw, Calendar as CalendarIcon, ZoomIn, Download, Share, Trash2, Edit3, RotateCcw, Search, Filter, X, SortAsc, SortDesc, QrCode, Heart, Star, Info } from 'lucide-react';
// import QRCode from 'qrcode'; // Removed unused import
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
  
  // Simplified state - only images, no tasks
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [zoomModal, setZoomModal] = useState<{ open: boolean; imageUrl: string; imageName: string }>({ open: false, imageUrl: '', imageName: '' });
  const [regeneratingImages, setRegeneratingImages] = useState<Set<string>>(new Set());
  const [shareModal, setShareModal] = useState<{ open: boolean; itemId: string | null; itemPath: string | null }>({ open: false, itemId: null, itemPath: null });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [imageInfoModal, setImageInfoModal] = useState<{ open: boolean; image: any | null }>({ open: false, image: null });
  const [editingImageData, setEditingImageData] = useState<any>(null);
  const [tempRating, setTempRating] = useState<number>(0);
  const [newTag, setNewTag] = useState<string>('');

  // Search and filter state - Default to today's date range
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'filename'>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return { from: startOfDay, to: endOfDay };
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(['today']);

  // Direct image loading from generated_images table
  useEffect(() => {
    console.log('=== FETCHING IMAGES DIRECTLY ===');
    console.log('userId:', userId);
    console.log('dateRange:', dateRange);
    
    if (!userId) {
      console.log('No userId provided, skipping fetch');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Helper function to fetch images with optional date filter
    const fetchImages = async (withDateFilter: boolean) => {
      let imageUrl = `${config.supabase_server_url}/generated_images?user_uuid=eq.${userId}&generation_status=eq.completed&order=created_at.desc`;
      
      if (withDateFilter) {
        // Add date range filters server-side
        imageUrl += '&limit=100';
        if (dateRange?.from) {
          const fromISO = dateRange.from.toISOString();
          imageUrl += `&created_at=gte.${fromISO}`;
          console.log('Adding from date filter:', fromISO);
        }
        if (dateRange?.to) {
          const toISO = dateRange.to.toISOString();
          imageUrl += `&created_at=lte.${toISO}`;
          console.log('Adding to date filter:', toISO);
        }
      } else {
        // No date filter, just get last 15 images
        imageUrl += '&limit=15';
        console.log('Fetching last 15 images without date filter');
      }
      
      console.log('Image query URL:', imageUrl);
      
      const response = await fetch(imageUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });
      
      console.log('Image response status:', response.status);
      const fetchedImages = await response.json();
      console.log('Images fetched:', fetchedImages.length);
      
      return fetchedImages;
    };

    // Fetch images with smart fallback logic
    const fetchWithFallback = async () => {
      try {
        // Check if we should try with today's date filter first  
        const hasDateFilter = dateRange?.from && dateRange?.to;
        
        if (hasDateFilter) {
          console.log('Trying with today date filter first...');
          const todayImages = await fetchImages(true);
          
          if (todayImages.length === 0) {
            console.log('No images found for today, fallback to last 15 images...');
            // No images found for today, try without date filter
            const fallbackImages = await fetchImages(false);
            
            // Update active filters to show we're no longer filtering by today
            setActiveFilters(prev => prev.filter(f => f !== 'today'));
            setDateRange(undefined);
            
            return fallbackImages;
          }
          
          return todayImages;
        } else {
          // No date filter set, fetch with current constraints  
          console.log('Fetching without date filter...');
          return await fetchImages(false);
        }
      } catch (error) {
        console.error('Image fetch error:', error);
        setError('Failed to fetch history.');
        return [];
      }
    };

    // Execute the fetch with fallback
    fetchWithFallback()
      .then(fetchedImages => {
        // Transform to match existing data structure
        const transformedImages = fetchedImages.map((img: any) => ({
          ...img,
          task: { id: img.task_id } // Use task_id directly from generated_images
        }));
        
        setImages(transformedImages);
        console.log('Final images set:', transformedImages.length);
      })
      .finally(() => setIsLoading(false));
  }, [userId, refreshKey]);

  // Apply search and filters to direct images
  const filteredImages = images.filter(image => {
    // Search by filename
    if (searchTerm && !image.system_filename.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Date range filter (already handled server-side, but kept for client-side date changes)
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
      default:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    if (sortBy === 'oldest') {
      comparison = -comparison;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const handleDownload = async (image: any) => {
    try {
      toast({
        title: 'Downloading image...',
        description: 'This may take a moment',
        variant: 'default'
      });

      console.log('Image object:', image);
      console.log('Image file_path:', image.file_path);
      console.log('Config data_url:', config.data_url);
      console.log('Full download URL:', `${config.data_url}/${image.file_path}`);

      const filename = image.file_path.split('/').pop();
      console.log('Extracted filename:', filename);

      // Use local backend proxy for proper download  
      const downloadUrl = '/api/proxy-download';
      console.log('Using local backend proxy for download');
      
      const response = await fetch(downloadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: `${config.data_url}/${image.file_path}`,
          filename: image.user_filename || image.system_filename || `generated-image-${Date.now()}.png`
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = image.user_filename || image.system_filename || `generated-image-${Date.now()}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success!',
        description: 'Image downloaded successfully',
        variant: 'default'
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: `Failed to download image: ${error instanceof Error ? error.message : 'Please try again.'}`,
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

      // Delete from database first
      const deleteDbResponse = await fetch(`${config.supabase_server_url}/generated_images?id=eq.${image.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!deleteDbResponse.ok) {
        throw new Error(`Database delete failed: ${deleteDbResponse.status}`);
      }

      // Delete file from server (optional - file can remain on server if needed)
      try {
        await fetch('/api/delete-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: image.system_filename,
            filepath: image.file_path
          })
        });
      } catch (fileDeleteError) {
        console.warn('File delete failed, but database delete succeeded:', fileDeleteError);
        // Continue - database delete succeeded, which is most important
      }

      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== image.id));

      toast({
        title: 'Success!',
        description: 'Image deleted successfully',
        variant: 'default'
      });

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete image: ${error instanceof Error ? error.message : 'Please try again.'}`,
        variant: 'destructive'
      });
    }
  };

  const handleShare = (image: any) => {
    // Use the complete file_path which includes user_uuid
    setShareModal({ open: true, itemId: image.system_filename, itemPath: image.file_path });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Success!',
        description: 'Link copied to clipboard',
        variant: 'default'
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (shareModal.open && shareModal.itemId && shareModal.itemPath) {
      const generateQRCode = async () => {
        try {
          const url = `${config.data_url}/${shareModal.itemPath}`;
          // QR Code generation temporarily disabled
          setQrCodeDataUrl('');
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      };

      generateQRCode();
    }
  }, [shareModal.open, shareModal.itemId, shareModal.itemPath]);

  const handleEdit = (image: any) => {
    navigate('/create/edit', {
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

      // Convert task_id (VARCHAR) to BIGINT and query tasks table for jsonjob
      const taskIdAsInt = parseInt(image.task_id, 10);
      console.log('Converting task_id to integer:', image.task_id, '->', taskIdAsInt);
      
      if (isNaN(taskIdAsInt)) {
        throw new Error(`Invalid task_id: ${image.task_id} cannot be converted to integer`);
      }
      
      const taskResponse = await fetch(`${config.supabase_server_url}/tasks?id=eq.${taskIdAsInt}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!taskResponse.ok) {
        throw new Error('Failed to fetch original task');
      }

      const taskData = await taskResponse.json();
      if (!taskData || taskData.length === 0) {
        throw new Error('Original task not found');
      }

      const originalTask = taskData[0];
      console.log('Task details loaded on-demand for regeneration');
      console.log("OriginalTask jsonjob:", originalTask.jsonjob);

      // Parse the JSON job data
      const jsonjob = JSON.parse(originalTask.jsonjob);
      console.log("Parsed JSON job:", jsonjob);
      
      // Build URL parameters and reload page for regeneration
      const params = new URLSearchParams();
      params.set('regenerate', 'true');
      params.set('regenerated_from', image.system_filename);
      
      // Core generation parameters
      if (jsonjob.prompt) {
        console.log('Original prompt:', jsonjob.prompt);
        params.set('prompt', encodeURIComponent(jsonjob.prompt));
        console.log('Encoded prompt:', encodeURIComponent(jsonjob.prompt));
      }
      if (jsonjob.negative_prompt) params.set('negative_prompt', jsonjob.negative_prompt);
      if (jsonjob.model?.id) params.set('influencer_id', jsonjob.model.id.toString());
      if (jsonjob.format) params.set('format', jsonjob.format);
      if (jsonjob.quality) params.set('quality', jsonjob.quality);
      if (jsonjob.engine) params.set('engine', jsonjob.engine);
      if (jsonjob.guidance) params.set('guidance', jsonjob.guidance.toString());
      if (jsonjob.lora_strength) params.set('lora_strength', jsonjob.lora_strength.toString());
      if (jsonjob.nsfw_strength) params.set('nsfw_strength', jsonjob.nsfw_strength.toString());
      if (jsonjob.number_of_images) params.set('number_of_images', jsonjob.number_of_images.toString());
      
      // Scene components for Component Picker
      if (jsonjob.scene) {
        const scene = jsonjob.scene;
        if (scene.framing) params.set('framing', scene.framing);
        if (scene.rotation) params.set('rotation', scene.rotation);
        if (scene.lighting_preset) params.set('lighting_preset', scene.lighting_preset);
        if (scene.scene_setting) params.set('scene_setting', scene.scene_setting);
        if (scene.pose) params.set('pose', scene.pose);
        if (scene.clothes) params.set('clothes', scene.clothes);
      }
      
      console.log('NAVIGATE with params:', params.toString());
      console.log('Prompt being set:', jsonjob.prompt);
      
      // Use React Router navigation instead of window.location
      navigate(`/create/images?${params.toString()}`, {
        state: {
          regenerateData: {
            prompt: jsonjob.prompt,
            negative_prompt: jsonjob.negative_prompt,
            influencer_id: jsonjob.model?.id?.toString(),
            format: jsonjob.format,
            quality: jsonjob.quality,
            engine: jsonjob.engine,
            guidance: jsonjob.guidance,
            lora_strength: jsonjob.lora_strength,
            nsfw_strength: jsonjob.nsfw_strength,
            number_of_images: jsonjob.number_of_images,
            scene: jsonjob.scene
          },
          regenerateFrom: image.system_filename
        }
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

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange(undefined);
    setStatusFilter('all');
    setActiveFilters([]);
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    
    // Update active filters
    if (newDateRange?.from && newDateRange?.to) {
      const today = new Date();
      const isToday = 
        newDateRange.from.toDateString() === today.toDateString() &&
        newDateRange.to.toDateString() === today.toDateString();
      
      if (isToday) {
        setActiveFilters(['today']);
      } else {
        setActiveFilters(['custom-date']);
      }
    } else {
      setActiveFilters([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Image History
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your generated images • {sortedImages.length} images
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setRefreshKey(prev => prev + 1)}
            variant="outline"
            size="sm"
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search filenames..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} -{" "}
                          {format(dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status" className="text-sm font-medium mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <Label htmlFor="sort" className="text-sm font-medium mb-2 block">Sort</Label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'filename') => setSortBy(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="filename">Filename</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                    onClick={() => {
                      if (filter === 'today' || filter === 'custom-date') {
                        setDateRange(undefined);
                      }
                      setActiveFilters(prev => prev.filter(f => f !== filter));
                    }}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-6 px-2"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-slate-600 dark:text-slate-400">Loading images...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {sortedImages.map((image) => (
            <Card
              key={image.id}
              className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-blue-500/50 backdrop-blur-sm bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5 hover:from-blue-50/30 hover:to-purple-50/30 dark:hover:from-blue-950/10 dark:hover:to-purple-950/10 cursor-pointer"
            >
              <CardContent className="p-4">
                {/* Top Row: Discrete Info, Clickable Stars, Clickable Heart */}
                <div className="flex items-center justify-between mb-3">
                  {/* Discrete Info Icon */}
                  <div 
                    className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Load the most up-to-date data immediately
                      const currentImage = images.find(img => img.id === image.id) || image;
                      
                      setEditingImageData({
                        user_filename: currentImage.user_filename || '',
                        user_notes: currentImage.user_notes || '',
                        user_tags: Array.isArray(currentImage.user_tags) ? currentImage.user_tags.join(', ') : (currentImage.user_tags || ''),
                        rating: currentImage.rating || 0,
                        favorite: currentImage.favorite || false
                      });
                      setTempRating(currentImage.rating || 0);
                      
                      setImageInfoModal({ open: true, image: currentImage });
                    }}
                    title="Image Details"
                  >
                    <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  {/* Clickable rating stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 cursor-pointer transition-all duration-150 hover:scale-110 ${
                          star <= (image.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-white fill-white stroke-slate-300 stroke-1'
                        }`}
                        viewBox="0 0 24 24"
                        onClick={async (e) => {
                          e.stopPropagation();
                          // Toggle logic: first star can go from 1 to 0, others always set the rating
                          const currentRating = image.rating || 0;
                          const newRating = (star === 1 && currentRating === 1) ? 0 : star;
                          
                          // Update immediately in local state
                          setImages(prev => prev.map(img => 
                            img.id === image.id 
                              ? { ...img, rating: newRating }
                              : img
                          ));
                          
                          // Save to backend
                          try {
                            const response = await fetch(`${config.supabase_server_url}/generated_images?id=eq.${image.id}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer WeInfl3nc3withAI',
                              },
                              body: JSON.stringify({
                                user_filename: image.user_filename || '',
                                user_notes: image.user_notes || '',
                                user_tags: image.user_tags || [],
                                rating: newRating,
                                favorite: image.favorite || false
                              })
                            });
                            if (!response.ok) {
                              throw new Error('Failed to save rating');
                            }
                          } catch (error) {
                            console.error('Failed to save rating:', error);
                          }
                        }}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  {/* Clickable favorite heart - old style */}
                  <div
                    className="cursor-pointer transition-all duration-200 hover:scale-110"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const newFavorite = !image.favorite;
                      
                      // Update immediately in local state
                      setImages(prev => prev.map(img => 
                        img.id === image.id 
                          ? { ...img, favorite: newFavorite }
                          : img
                      ));
                      
                      // Save to backend
                      try {
                        const response = await fetch(`${config.supabase_server_url}/generated_images?id=eq.${image.id}`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer WeInfl3nc3withAI',
                          },
                          body: JSON.stringify({
                            user_filename: image.user_filename || '',
                            user_notes: image.user_notes || '',
                            user_tags: image.user_tags || [],
                            rating: image.rating || 0,
                            favorite: newFavorite
                          })
                        });
                        if (!response.ok) {
                          throw new Error('Failed to save favorite');
                        }
                      } catch (error) {
                        console.error('Failed to save favorite:', error);
                      }
                    }}
                    title={image.favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg 
                      className={`w-5 h-5 transition-colors duration-200 ${
                        image.favorite
                          ? 'text-red-500 fill-red-500'
                          : 'text-slate-400 fill-none stroke-slate-400'
                      }`} 
                      viewBox="0 0 24 24" 
                      fill={image.favorite ? "currentColor" : "none"} 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
                {/* Image */}
                <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                  <img
                    src={`${config.data_url}/${image.file_path}`}
                    alt={image.system_filename}
                    className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={() => setZoomModal({ open: true, imageUrl: `${config.data_url}/${image.file_path}`, imageName: image.system_filename })}
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
                          setZoomModal({ open: true, imageUrl: `${config.data_url}/${image.file_path}`, imageName: image.system_filename });
                        }}
                      >
                        <ZoomIn className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Action Buttons - Single Row */}
                <div className="flex gap-1.5 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-500 hover:from-purple-600 hover:to-indigo-700 hover:border-purple-600 transition-all duration-200 shadow-sm"
                    onClick={() => handleDownload(image)}
                    title="Download"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 hover:from-blue-600 hover:to-purple-700 hover:border-blue-600 transition-all duration-200 shadow-sm"
                    onClick={() => handleEdit(image)}
                    title="Edit this image with professional tools"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => handleRegenerate(image)}
                    disabled={regeneratingImages.has(image.system_filename)}
                    title={regeneratingImages.has(image.system_filename) ? "Regenerating..." : "Regenerate"}
                  >
                    <RotateCcw className={`w-3 h-3 ${regeneratingImages.has(image.system_filename) ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-teal-500 hover:from-teal-600 hover:to-cyan-700 hover:border-teal-600 transition-all duration-200 shadow-sm"
                    onClick={() => handleShare(image)}
                    title="Share"
                  >
                    <Share className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-gradient-to-r from-red-600 to-red-800 text-white border-red-600 hover:from-red-700 hover:to-red-900 hover:border-red-700 transition-all duration-200 shadow-sm"
                    onClick={() => handleDelete(image)}
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
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
      <Dialog open={shareModal.open} onOpenChange={(open) => setShareModal({ ...shareModal, open })}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center space-y-4 py-4">
            <h3 className="text-lg font-semibold">Share Image</h3>
            
            {qrCodeDataUrl && (
              <div className="bg-white p-4 rounded-lg">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
            
            <div className="w-full space-y-2">
              <Label htmlFor="share-url" className="text-sm font-medium">
                Image URL
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="share-url"
                  value={shareModal.itemPath ? `${config.data_url}/${shareModal.itemPath}` : ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => shareModal.itemPath && copyToClipboard(`${config.data_url}/${shareModal.itemPath}`)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Info Modal */}
      <Dialog open={imageInfoModal.open} onOpenChange={(open) => {
        if (!open) {
          setImageInfoModal({ open: false, image: null });
          setEditingImageData(null);
          setTempRating(0);
          setNewTag('');
        } else if (imageInfoModal.image) {
          // Find the current image data from the images state (most up-to-date)
          const currentImage = images.find(img => img.id === imageInfoModal.image.id) || imageInfoModal.image;
          
          setEditingImageData({
            user_filename: currentImage.user_filename || '',
            user_notes: currentImage.user_notes || '',
            user_tags: Array.isArray(currentImage.user_tags) ? currentImage.user_tags.join(', ') : (currentImage.user_tags || ''),
            rating: currentImage.rating || 0,
            favorite: currentImage.favorite || false
          });
          setTempRating(currentImage.rating || 0);
        }
      }}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          {imageInfoModal.image && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Image Details</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 ${editingImageData?.favorite ? 'text-red-500' : 'text-gray-400'}`}
                    onClick={() => setEditingImageData((prev: any) => ({ ...(prev || {}), favorite: !(prev?.favorite || false) }))}
                  >
                    <Heart className={`w-5 h-5 ${editingImageData?.favorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Image Preview - Smaller */}
              <div className="flex justify-center">
                <img 
                  src={`${config.data_url}/${imageInfoModal.image.file_path}`}
                  alt={imageInfoModal.image.system_filename}
                  className="max-w-[150px] w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">Editable Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-filename" className="text-sm font-medium">User Filename</Label>
                    <Input
                      id="user-filename"
                      value={editingImageData?.user_filename || ''}
                      onChange={(e) => setEditingImageData((prev: any) => ({ ...(prev || {}), user_filename: e.target.value }))}
                      placeholder="Enter custom filename"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Rating</Label>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            const newRating = tempRating === star ? 0 : star;
                            setTempRating(newRating);
                            setEditingImageData((prev: any) => ({ ...(prev || {}), rating: newRating }));
                          }}
                          className="focus:outline-none transition-colors"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= tempRating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="user-notes" className="text-sm font-medium">Notes</Label>
                  <textarea
                    id="user-notes"
                    value={editingImageData?.user_notes || ''}
                    onChange={(e) => setEditingImageData((prev: any) => ({ ...(prev || {}), user_notes: e.target.value }))}
                    placeholder="Add your notes..."
                    className="mt-1 w-full min-h-[60px] px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-vertical bg-background text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="mt-2 space-y-2">
                    {/* Tag Input */}
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTag.trim()) {
                              setEditingImageData((prev: any) => ({
                                ...(prev || {}),
                                user_tags: (prev?.user_tags || '') ? `${prev.user_tags}, ${newTag.trim()}` : newTag.trim()
                              }));
                              setNewTag('');
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (newTag.trim()) {
                            setEditingImageData((prev: any) => ({
                              ...(prev || {}),
                              user_tags: (prev?.user_tags || '') ? `${prev.user_tags}, ${newTag.trim()}` : newTag.trim()
                            }));
                            setNewTag('');
                          }
                        }}
                        className="px-3"
                      >
                        Add
                      </Button>
                    </div>
                    {/* Tag Display */}
                    {editingImageData?.user_tags && (
                      <div className="flex flex-wrap gap-2">
                        {editingImageData.user_tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag).map((tag: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                if (editingImageData?.user_tags) {
                                  const tags = editingImageData.user_tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== tag);
                                  setEditingImageData((prev: any) => ({
                                    ...(prev || {}),
                                    user_tags: tags.join(', ')
                                  }));
                                }
                              }}
                              className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Read-only Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">System Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">System Filename</Label>
                    <p className="text-sm break-all bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">{imageInfoModal.image.system_filename}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Generation Status</Label>
                    <div className="mt-1">
                      <Badge variant={imageInfoModal.image.generation_status === 'completed' ? 'default' : 'secondary'}>
                        {imageInfoModal.image.generation_status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</Label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">
                      {new Date(imageInfoModal.image.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Model Version</Label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">{imageInfoModal.image.model_version}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">NSFW Strength</Label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">{imageInfoModal.image.nsfw_strength}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">LoRA Strength</Label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1">{imageInfoModal.image.lora_strength}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Optimized Prompt</Label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded mt-1 max-h-20 overflow-y-auto">
                    {imageInfoModal.image.t5xxl_prompt || 'No prompt available'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => {
                    setImageInfoModal({ open: false, image: null });
                    setEditingImageData(null);
                    setTempRating(0);
                    setNewTag('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    if (!editingImageData || !imageInfoModal.image) return;
                    
                    try {
                      const updateData = {
                        user_filename: editingImageData.user_filename || '',
                        user_notes: editingImageData.user_notes || '',
                        user_tags: editingImageData.user_tags ? editingImageData.user_tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
                        rating: editingImageData.rating || 0,
                        favorite: editingImageData.favorite || false
                      };

                      const response = await fetch(`${config.supabase_server_url}/generated_images?id=eq.${imageInfoModal.image.id}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': 'Bearer WeInfl3nc3withAI'
                        },
                        body: JSON.stringify(updateData)
                      });

                      if (response.ok) {
                        // Update local state with correct data structure
                        setImages(prev => prev.map(img => 
                          img.id === imageInfoModal.image.id 
                            ? { 
                                ...img, 
                                user_filename: updateData.user_filename,
                                user_notes: updateData.user_notes,
                                user_tags: updateData.user_tags,
                                rating: updateData.rating,
                                favorite: updateData.favorite
                              }
                            : img
                        ));
                        
                        toast({
                          title: 'Success!',
                          description: 'Image information updated successfully',
                          variant: 'default'
                        });
                        
                        setImageInfoModal({ open: false, image: null });
                        setEditingImageData(null);
                        setTempRating(0);
                        setNewTag('');
                      } else {
                        const errorText = await response.text();
                        throw new Error(`Failed to update: ${response.status} - ${errorText}`);
                      }
                    } catch (error) {
                      console.error('Save error:', error);
                      toast({
                        title: 'Error',
                        description: `Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        variant: 'destructive'
                      });
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}