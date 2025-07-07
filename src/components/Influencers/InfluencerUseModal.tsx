import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy } from 'lucide-react';
import React, { useState } from 'react';
import { setBio } from '@/store/slices/bioSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
  bio?: { [key: string]: any }; // Added bio field
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
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioMode, setBioMode] = useState<'view' | 'create' | null>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBioClick = () => {
    if (!influencer?.bio || Object.keys(influencer.bio).length === 0) {
      setBioMode('create');
    } else {
      setBioMode('view');
    }
    setShowBioModal(true);
  };

  const handleCreateBio = async () => {
    if (!influencer) return;
    setBioLoading(true);
    setBioError(null);
    try {
      // Remove bio from influencer data
      const { bio, ...influencerData } = influencer;
      const response = await fetch('https://api.nymia.ai/v1/biowizard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify([influencerData]),
      });
      if (!response.ok) {
        throw new Error('Failed to generate bio');
      }
      const data = await response.json();
      // Save to redux store
      dispatch(setBio({ influencerId: influencer.id, bio: data }));
      // Save to database
      const patchResponse = await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${influencer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI',
        },
        body: JSON.stringify({ bio: data }),
      });
      if (!patchResponse.ok) {
        throw new Error('Failed to save bio to database');
      }
      setShowBioModal(false);
      navigate('/influencers/bio', { state: { influencerId: influencer.id } });
    } catch (err: any) {
      setBioError(err.message || 'Failed to generate or save bio');
    } finally {
      setBioLoading(false);
    }
  };

  const handleViewBio = () => {
    dispatch(setBio({ influencerId: influencer.id, bio: influencer.bio }));
    navigate('/influencers/bio', { state: { influencerId: influencer?.id } });
  };

  return (
    <>
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
                {/* BIO Option */}
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4 border-2 border-blue-500/20 hover:border-blue-500/40 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10"
                  onClick={handleBioClick}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                    <span className="font-bold text-white text-lg">BIO</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">BIO</div>
                    <div className="text-sm text-muted-foreground">View or create influencer bio</div>
                  </div>
                </Button>
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
      {/* BIO Modal */}
      <Dialog open={showBioModal} onOpenChange={setShowBioModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Influencer BIO</DialogTitle>
          </DialogHeader>
          {bioLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
              <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
              <div className="text-base font-medium text-blue-700 dark:text-blue-200">Generating professional bio...</div>
              <div className="text-xs text-muted-foreground">This may take a few seconds. Please wait.</div>
            </div>
          )}
          {bioError && <p className="text-red-500">{bioError}</p>}
          {bioMode === 'create' && (
            <div className="space-y-4">
              <p>No data found, you want to create now?</p>
              <Button onClick={handleCreateBio} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Create</Button>
            </div>
          )}
          {bioMode === 'view' && influencer?.bio && (
            <div className="space-y-4">
              <Button onClick={handleViewBio} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">View</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}; 