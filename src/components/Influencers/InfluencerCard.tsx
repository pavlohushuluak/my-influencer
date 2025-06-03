
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Influencer } from '@/store/slices/influencersSlice';
import { Image, Settings, User } from 'lucide-react';

interface InfluencerCardProps {
  influencer: Influencer;
  onGenerateContent: (id: string) => void;
  onEditInfluencer: (id: string) => void;
}

export function InfluencerCard({ influencer, onGenerateContent, onEditInfluencer }: InfluencerCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 ring-2 ring-ai-purple-500/20 group-hover:ring-ai-purple-500/40 transition-all">
            <AvatarImage src={influencer.image} alt={influencer.name} />
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                  {influencer.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {influencer.description}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {influencer.personality}
                </p>
              </div>
              <Badge variant={influencer.status === 'active' ? 'default' : 'secondary'}>
                {influencer.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {influencer.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {influencer.generatedContent} content items
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditInfluencer(influencer.id)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => onGenerateContent(influencer.id)}
                  className="bg-ai-gradient hover:opacity-90"
                >
                  <Image className="w-4 h-4 mr-1" />
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
