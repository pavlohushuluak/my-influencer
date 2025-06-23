import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { removeFromVault } from '@/store/slices/contentSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Image, Video, SortAsc, SortDesc, ZoomIn } from 'lucide-react';

// Interface for task data from API
interface TaskData {
  id: string;
  type: string;
  created_at: string;
}

export default function Vault() {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [vaultItems, setVaultItems] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        console.log(data);
        setVaultItems(data);
      } catch (error) {
        console.error('Error fetching vault data:', error);
        setVaultItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (userData.id) {
      fetchVaultData();
    }
  }, [userData.id]);

  const filteredAndSortedItems = vaultItems
    .filter(item => {
      const matchesSearch = item.id;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

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

  const handleRemoveFromVault = (contentId: string) => {
    dispatch(removeFromVault(contentId));
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

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setSortBy('newest');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || sortBy !== 'newest' || sortOrder !== 'desc';

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Vault
            </h1>
            <p className="text-muted-foreground">
              Your premium collection of saved content that never expires
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading vault items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Vault
          </h1>
          <p className="text-muted-foreground">
            Your premium collection of saved content that never expires
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="w-4 h-4 text-yellow-500" />
          {vaultItems.length} items saved
        </div>
      </div>

      {/* Professional Search and Filter Bar */}
      <Card className="border-yellow-500/20 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search vault by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images Only</SelectItem>
                <SelectItem value="video">Videos Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Date Added</SelectItem>
                <SelectItem value="title">Title</SelectItem>
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

              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <span className="text-sm text-muted-foreground">
                  Search: "{searchTerm}"
                </span>
              )}
              {typeFilter !== 'all' && (
                <span className="text-sm text-muted-foreground">
                  Type: {typeFilter}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedItems.length} of {vaultItems.length} vault items
        </p>
      </div>

      {/* Content Grid */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedItems.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-yellow-500/20 bg-gradient-to-br from-yellow-50/30 to-orange-50/30 dark:from-yellow-950/10 dark:to-orange-950/10"
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
                <CardTitle className="text-lg">{item.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                  <img
                    src={`https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/output/${item.id}.png`}
                    alt={item.id}
                    className="absolute inset-0 w-full h-full object-cover rounded-md"
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
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-xs"
                      onClick={() => handleDownload(item.id)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Share className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
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
          <Star className="w-12 h-12 text-yellow-500/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* Image Zoom Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size image"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
