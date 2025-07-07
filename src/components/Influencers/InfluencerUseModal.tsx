import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy } from 'lucide-react';
import React from 'react';

interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

interface Influencer {
  id: string;
  name_first: string;
  name_last: string;
  image_url: string;
  image_num?: number;
  // ...other fields as needed
}

interface InfluencerUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencer: Influencer | null;
  platforms: Platform[];
  onPlatformSelect: (platformId: string) => void;
  onContentCreate: () => void;
  onCharacterConsistency: () => void;
}

export const InfluencerUseModal: React.FC<InfluencerUseModalProps> = ({
  open,
  onOpenChange,
  influencer,
  platforms,
  onPlatformSelect,
  onContentCreate,
  onCharacterConsistency,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Platform</DialogTitle>
        </DialogHeader>
        {influencer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <img
                src={influencer.image_url}
                alt={influencer.name_first}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-medium">{influencer.name_first} {influencer.name_last}</h4>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Select a platform to create content:</p>
              {/* Content Create Option */}
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-2 border-ai-purple-500/20 hover:border-ai-purple-500/40 bg-gradient-to-r from-ai-purple-50 to-blue-50 dark:from-ai-purple-900/10 dark:to-blue-900/10"
                onClick={onContentCreate}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-ai-purple-500 to-blue-500 flex items-center justify-center mr-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Content Create</div>
                  <div className="text-sm text-muted-foreground">Advanced content generation</div>
                </div>
              </Button>
              {/* Character Consistency Option */}
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-2 border-green-500/20 hover:border-green-500/40 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10"
                onClick={onCharacterConsistency}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-3">
                  <Copy className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Character Consistency</div>
                  <div className="text-sm text-muted-foreground">Select profile picture for LORA training.</div>
                </div>
              </Button>
              {/* Remove the divider and 'Or select platform' label */}
              {platforms.length > 0 && platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Button
                    key={platform.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => onPlatformSelect(platform.id)}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${platform.color} flex items-center justify-center mr-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-muted-foreground">{platform.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 