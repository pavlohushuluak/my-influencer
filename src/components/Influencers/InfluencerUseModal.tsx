import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Copy, 
  Image as ImageIcon, 
  Video, 
  User, 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Zap,
  Star,
  Palette,
  Camera,
  Mic,
  Wand2,
  Brain,
  Heart,
  Target,
  Shield,
  Sparkle
} from 'lucide-react';
import React, { useState } from 'react';
import { setBio } from '@/store/slices/bioSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import config from '@/config/config';
interface Influencer {
  id: string;
  name_first: string;
  name_last: string;
  image_url: string;
  image_num?: number;
  bio?: { [key: string]: any }; // Added bio field
  lorastatus?: number; // LoRA training status: 0=not trained, 1=training, 2=trained, 9=error
  // ...other fields as needed
}

interface InfluencerUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  influencer: Influencer | null;
  onCreateImages: () => void;
  onCreateVideo: () => void;
  onCharacterConsistency: () => void;
}

export const InfluencerUseModal: React.FC<InfluencerUseModalProps> = ({
  open,
  onOpenChange,
  influencer,
  onCreateImages,
  onCreateVideo,
  onCharacterConsistency,
}) => {
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioMode, setBioMode] = useState<'view' | 'create' | null>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  
  // Character Consistency warning modal state
  const [showLoraWarningModal, setShowLoraWarningModal] = useState(false);
  const [loraWarningType, setLoraWarningType] = useState<'training' | 'trained' | null>(null);
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

  const handleCharacterConsistencyClick = () => {
    const loraStatus = influencer?.lorastatus || 0;
    
    if (loraStatus === 0) {
      // Allow character consistency training
      onCharacterConsistency();
    } else if (loraStatus === 1) {
      // Show warning for training in progress
      setLoraWarningType('training');
      setShowLoraWarningModal(true);
    } else if (loraStatus === 2) {
      // Show warning for already trained
      setLoraWarningType('trained');
      setShowLoraWarningModal(true);
    } else {
      // For any other status (including 9=error), show training warning
      setLoraWarningType('training');
      setShowLoraWarningModal(true);
    }
  };

  const handleCreateBio = async () => {
    if (!influencer) return;
    setBioLoading(true);
    setBioError(null);
    try {
      // Remove bio from influencer data
      const { bio, ...influencerData } = influencer;
      const response = await fetch(`${config.backend_url}/biowizard`, {
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
      const patchResponse = await fetch(`${config.supabase_server_url}/influencer?id=eq.${influencer.id}`, {
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
      toast.success('Bio generated successfully!');
      navigate(`/influencers/bio?id=${influencer.id}`);
    } catch (err: any) {
      setBioError(err.message || 'Failed to generate or save bio');
      toast.error('Failed to generate bio. Please try again.');
    } finally {
      setBioLoading(false);
    }
  };

  const handleViewBio = () => {
    if (influencer?.bio) {
      dispatch(setBio({ influencerId: influencer.id, bio: influencer.bio }));
    }
    navigate(`/influencers/bio?id=${influencer?.id}`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Influencer Actions
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Choose what you'd like to do with this influencer
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {influencer && (
            <div className="space-y-6">
              {/* Influencer Profile Card */}
              <Card className="border-2 border-gradient-to-r from-purple-500/20 to-blue-500/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={influencer.image_url}
                        alt={`${influencer.name_first} ${influencer.name_last}`}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {influencer.name_first} {influencer.name_last}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Create Images Option */}
                <Card 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 hover:scale-105"
                  onClick={onCreateImages}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          Create Images
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          Generate stunning AI-powered images using this influencer's style and characteristics
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Sparkles className="w-3 h-3" />
                          <span>AI-powered generation</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                {/* Create Video Option */}
                <Card 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 hover:scale-105"
                  onClick={() => {
                    if (influencer) {
                      // Navigate to video creation page with influencer data
                      navigate('/content/create-video', {
                        state: { 
                          influencerData: influencer,
                          autoSelect: 'image' // Auto-select "Create Influencer Video" option
                        }
                      });
                      onOpenChange(false); // Close the modal
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Create Video
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          Create engaging videos featuring this influencer with advanced AI video generation
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Camera className="w-3 h-3" />
                          <span>Video generation</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                {/* Character Consistency Option */}
                <Card 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:scale-105"
                  onClick={handleCharacterConsistencyClick}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          Character Consistency
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          Train LORA model for consistent character representation across all generations
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Target className="w-3 h-3" />
                          <span>LORA training</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>

                {/* BIO Option */}
                <Card 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-indigo-200 hover:border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 hover:scale-105"
                  onClick={handleBioClick}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Bio Management
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          View or create a professional bio for this influencer with AI assistance
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Wand2 className="w-3 h-3" />
                          <span>AI-powered bio</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* BIO Modal */}
      <Dialog open={showBioModal} onOpenChange={setShowBioModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Bio Management
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Manage influencer bio with AI assistance
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {bioLoading && (
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                      Generating Professional Bio
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Our AI is crafting a compelling bio for {influencer?.name_first}...
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>AI-powered generation in progress</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {bioError && (
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <div className="font-semibold text-red-700 dark:text-red-300">Generation Failed</div>
                    <div className="text-sm text-red-600 dark:text-red-400">{bioError}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {bioMode === 'create' && !bioLoading && !bioError && (
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Wand2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      No Bio Found
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Would you like to create a professional bio for {influencer?.name_first} using AI?
                    </p>
                  </div>
                  <Button 
                    onClick={handleCreateBio} 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI Bio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {bioMode === 'view' && influencer?.bio && !bioLoading && !bioError && (
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Bio Available
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {influencer.name_first} already has a professional bio ready to view and edit.
                    </p>
                  </div>
                  <Button 
                    onClick={handleViewBio} 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View & Edit Bio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* LoRA Warning Modal */}
      <Dialog open={showLoraWarningModal} onOpenChange={setShowLoraWarningModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                loraWarningType === 'training' 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                  : 'bg-gradient-to-br from-green-500 to-emerald-500'
              }`}>
                {loraWarningType === 'training' ? (
                  <Clock className="w-5 h-5 text-white" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className={`text-xl font-bold bg-clip-text text-transparent ${
                  loraWarningType === 'training' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600'
                }`}>
                  {loraWarningType === 'training' ? 'LoRA Training in Progress' : 'LoRA Already Trained'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {loraWarningType === 'training' 
                    ? 'Character consistency training is currently active' 
                    : 'This influencer has already completed character consistency training'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Card className={`border-2 ${
            loraWarningType === 'training' 
              ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20' 
              : 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
          }`}>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {loraWarningType === 'training' ? (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <div className="relative">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Training in Progress
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {influencer?.name_first}'s LoRA model is currently being trained for character consistency. 
                        This process typically takes 5-15 minutes. Please wait for completion before proceeding.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <Clock className="w-3 h-3" />
                      <span>Training in progress...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Already Trained
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {influencer?.name_first} has already completed character consistency training. 
                        The LoRA model is ready and optimized for high-quality AI generation.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      <span>LoRA model ready</span>
                    </div>
                  </>
                )}
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowLoraWarningModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {loraWarningType === 'training' && (
                    <Button 
                      onClick={() => {
                        setShowLoraWarningModal(false);
                        // Navigate to LoRA training page to check status
                        navigate(`/influencer/lora-training/${influencer?.id}`);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Check Status
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}; 