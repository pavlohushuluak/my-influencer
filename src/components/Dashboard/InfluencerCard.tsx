
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Play, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfluencerCardProps {
  id?: string;
  name?: string;
  age?: number;
  lifecycle?: string;
  type?: string;
  imageUrl?: string;
  isCreateCard?: boolean;
  className?: string;
  onEdit?: (id: string) => void;
  onUse?: (id: string) => void;
  onCreate?: () => void;
}

export function InfluencerCard({ 
  id,
  name, 
  age, 
  lifecycle, 
  type, 
  imageUrl, 
  isCreateCard = false,
  className,
  onEdit,
  onUse,
  onCreate
}: InfluencerCardProps) {
  const handleEdit = () => {
    if (id && onEdit) {
      onEdit(id);
    }
  };

  const handleUse = () => {
    if (id && onUse) {
      onUse(id);
    }
  };

  const handleCreate = () => {
    if (onCreate) {
      onCreate();
    }
  };

  if (isCreateCard) {
    return (
      <Card 
        className={cn("group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-purple-400", className)}
        onClick={handleCreate}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-80">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Create New</h3>
          <p className="text-sm text-muted-foreground text-center">
            Start creating your AI influencer with our advanced tools
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {name?.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">Age {age}</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {type}
            </Badge>
          </div>
          
          <div className="mb-4">
            <span className="text-xs text-muted-foreground">Lifecycle: </span>
            <Badge variant="outline" className="text-xs">
              {lifecycle}
            </Badge>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" onClick={handleUse}>
              <Play className="w-4 h-4 mr-2" />
              Use
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
