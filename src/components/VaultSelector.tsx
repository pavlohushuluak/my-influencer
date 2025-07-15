import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Search, Folder, ChevronRight, Home, ArrowLeft, Calendar, Image, Download } from 'lucide-react';
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
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageData[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  const decodeName = (name: string): string => {
    return decodeURIComponent(name.replace(/\+/g, ' '));
  };

  useEffect(() => {
    if (open) {
      fetchHomeFiles();
    }
  }, [open]);

  const fetchHomeFiles = async () => {
    try {
      setFilesLoading(true);
      const response = await fetch(`https://db.nymia.ai/rest/v1/generated_images?user_id=eq.${userData.id}&file_path=like.output/%`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImages(data);
      }
    } catch (error) {
      console.error('Error fetching home files:', error);
    } finally {
      setFilesLoading(false);
    }
  };

  const filteredImages = generatedImages.filter(image => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const filename = decodeName(image.system_filename).toLowerCase();
    const userFilename = image.user_filename ? decodeName(image.user_filename).toLowerCase() : '';
    const notes = image.user_notes ? image.user_notes.toLowerCase() : '';
    const tags = image.user_tags ? image.user_tags.join(' ').toLowerCase() : '';
    
    return filename.includes(searchLower) || 
           userFilename.includes(searchLower) || 
           notes.includes(searchLower) || 
           tags.includes(searchLower);
  });

  const handleImageSelect = (image: GeneratedImageData) => {
    onImageSelect(image);
    onOpenChange(false);
    toast.success(`Selected: ${decodeName(image.system_filename)}`);
  };

  const handleDownload = async (image: GeneratedImageData) => {
    try {
      toast.info('Downloading image...');
      const filename = image.file_path.split('/').pop();
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

      if (!response.ok) throw new Error('Failed to download file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.system_filename || `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Images</h3>
            <Badge variant="secondary">{filteredImages.length} images</Badge>
          </div>

          {filesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading images...</p>
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto">
              {filteredImages.map((image) => (
                <Card
                  key={image.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleImageSelect(image)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="rounded-full w-8 h-8 flex items-center justify-center shadow-md bg-gradient-to-br from-blue-500 to-purple-600">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                          <circle cx="8.5" cy="8.5" r="1.5" opacity="0.8" />
                        </svg>
                      </div>

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

                      {image.favorite && (
                        <div className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
                          <Star className="w-4 h-4 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                      <img
                        src={`https://images.nymia.ai/cdn-cgi/image/w=400/${image.file_path}`}
                        alt={image.system_filename}
                        className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm transition-all duration-200 hover:scale-105"
                      />
                    </div>

                    {image.user_notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2">{image.user_notes}</p>
                      </div>
                    )}

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

                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-gray-800 truncate">
                        {decodeName(image.system_filename)}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(image.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-1.5 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image);
                        }}
                      >
                        <Download className="w-3 h-3 mr-1.5" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 h-8 text-xs font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageSelect(image);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No images found matching your search.' : 'No images available.'}
              </p>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="mt-2">
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
