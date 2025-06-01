
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Settings, Calendar, Instagram, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryContentCardProps {
  id: string;
  title: string;
  format: string;
  setting: string;
  seo: string;
  instagramStatus: string;
  fanvueSchedule: string;
  images: string[];
  totalImages: number;
  className?: string;
  onEdit?: (id: string) => void;
}

export function StoryContentCard({ 
  id,
  title, 
  format,
  setting,
  seo,
  instagramStatus,
  fanvueSchedule,
  images, 
  totalImages,
  className,
  onEdit
}: StoryContentCardProps) {
  const displayImages = images.slice(0, 6);
  const remainingImages = totalImages - displayImages.length;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <Button size="sm" variant="ghost" className="h-7 px-2">
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-3 mb-4">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Format:</span>
            <p className="text-sm text-foreground">{format}</p>
          </div>
          
          <div>
            <span className="text-xs font-medium text-muted-foreground">Setting:</span>
            <p className="text-sm text-foreground line-clamp-2">{setting}</p>
          </div>
          
          <div>
            <span className="text-xs font-medium text-muted-foreground">SEO:</span>
            <p className="text-sm text-foreground line-clamp-2">{seo}</p>
          </div>
        </div>

        {/* Schedule Status */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-foreground">Instagram:</span>
            <Badge variant="outline" className="text-xs">
              {instagramStatus}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-foreground">Fanvue:</span>
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {fanvueSchedule}
            </Badge>
          </div>
        </div>

        {/* Images Grid */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-foreground">Selected/Candidate Images</span>
            <Badge variant="secondary" className="text-xs">
              {totalImages} total
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {displayImages.map((image, index) => (
              <div 
                key={index} 
                className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden"
              >
                {image ? (
                  <img 
                    src={image} 
                    alt={`Content ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-lg"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            {remainingImages > 0 && (
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 p-0 h-auto">
                +{remainingImages} more
              </Button>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
