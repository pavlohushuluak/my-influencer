import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, MoreHorizontal, Filter, Image, MessageCircle, Instagram, Send, Sparkles, Copy, Upload, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StoryContentCard } from '@/components/Dashboard/StoryContentCard';
import { ScheduleCard } from '@/components/Dashboard/ScheduleCard';
import { Influencer } from '@/store/slices/influencersSlice';
import axios from 'axios';
import { toast } from 'sonner';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';

const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'from-pink-500 to-purple-600',
    description: 'Create posts for Instagram'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'from-green-500 to-green-600',
    description: 'Generate WhatsApp messages'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: Send,
    color: 'from-blue-500 to-blue-600',
    description: 'Create Telegram content'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const loading = useSelector((state: RootState) => state.influencers.loading);
  const error = useSelector((state: RootState) => state.influencers.error);
  const [showAllInfluencers, setShowAllInfluencers] = useState(false);
  const [showAllStoryContent, setShowAllStoryContent] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [selectedInfluencerData, setSelectedInfluencerData] = useState<Influencer | null>(null);
  const [showCharacterConsistencyModal, setShowCharacterConsistencyModal] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<string | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const displayedInfluencers = showAllInfluencers ? influencers : influencers.slice(0, 5);

  // Mock data for story content
  const mockStoryContent = [
    {
      id: '1',
      title: 'Sunlit Run - Post-Run Refresh at a Hidden Spot',
      format: 'Exclusive Outdoor Series',
      setting: 'Secluded coastal path near Avon Gorge, late afternoon sun casting golden rays, ocean in the background.',
      seo: "A long run along the Avon Gorge led me to this hidden gem. The sun's kissing my skin as I cool off with ocean...",
      instagramStatus: 'Not scheduled',
      fanvueSchedule: 'May 10, 2025 10:00 PM',
      images: [
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg'
      ],
      totalImages: 12
    },
    {
      id: '2',
      title: 'Urban Coffee Culture - Morning Vibes Downtown',
      format: 'Lifestyle Series',
      setting: 'Trendy downtown café, morning golden hour, bustling city life in the background, cozy interior lighting.',
      seo: 'Starting my day right in the heart of the city. This little café has become my morning sanctuary, perfect lighting and...',
      instagramStatus: 'Scheduled for today 9:00 AM',
      fanvueSchedule: 'May 8, 2025 7:30 AM',
      images: [
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg'
      ],
      totalImages: 12
    }
  ];

  const displayedStoryContent = showAllStoryContent ? mockStoryContent : mockStoryContent.slice(0, 2);

  const userData = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const checkSubscription = async () => {
      let credits = userData.credits;
      const subscription = userData.subscription;
      if (subscription === 'enterprise' && credits > 300) {
        credits = 300;
      }
      else if (subscription === 'professional' && credits > 200) {
        credits = 200;
      }
      else if (subscription === 'starter' && credits > 100) {
        credits = 100;
      }
      if (userData.billing_date <= Date.now() && userData.subscription !== 'free') {
        try {
          const response = await axios.patch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, JSON.stringify({
            subscription: 'free',
            billing_date: 0,
            free_purchase: true,
            credits: credits
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer WeInfl3nc3withAI`,
            },
          });
          return response.data;
        } catch (error) {
          console.error('Subscription update failed:', error);
          throw error;
        }
      }
      else if (userData.billing_date > Date.now() && userData.subscription !== 'free' && userData.billed_date + 1 * 30 * 24 * 60 * 60 * 1000 >= Date.now()) {
        try {
          const response = await axios.patch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, JSON.stringify({
            billed_date: userData.billed_date + 1 * 30 * 24 * 60 * 60 * 1000,
            credits: credits
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer WeInfl3nc3withAI`,
            },
          });
          return response.data;
        } catch (error) {
          console.error('Subscription update failed:', error);
          throw error;
        }
      }
    };

    checkSubscription();
  }, [userData.billing_date, userData.id]);

  // console.log('User Data:', userData);
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch(`https://db.nymia.ai/rest/v1/influencer?user_id=eq.${userData.id}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch influencers');
        }

        const data = await response.json();
        dispatch(setInfluencers(data));
      } catch (error) {
        dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchInfluencers();
  }, [dispatch]);

  const handleCreateNew = () => {
    navigate('/influencers/create');
  };

  const handleEditInfluencer = (id: string) => {
    navigate('/influencers/edit', { state: { influencerData: influencers.find(inf => inf.id === id) } });
  };

  const handleEditStoryContent = (id: string) => {
    console.log('Edit story content:', id);
    // Navigate to edit page or open modal
  };

  const handleFilterStoryContent = () => {
    console.log('Filter story content');
    // Open filter modal or dropdown
  };

  const handleUseInfluencer = (id: string) => {
    const selectedInfluencer = influencers.find(inf => inf.id === id);
    if (selectedInfluencer) {
      setSelectedInfluencer(id);
      setSelectedInfluencerData(selectedInfluencer);
      setShowPlatformModal(true);
    }
  };

  const handlePlatformSelect = (platformId: string) => {
    const influencer = influencers.find(inf => inf.id === selectedInfluencer);
    const platform = PLATFORMS.find(p => p.id === platformId);

    if (influencer && platform) {
      navigate('/content/create', {
        state: {
          influencerData: influencer,
          platform: platform,
          mode: 'create'
        }
      });
      setShowPlatformModal(false);
    }
  };

  const handleContentCreate = () => {
    const influencer = influencers.find(inf => inf.id === selectedInfluencer);

    if (influencer) {
      navigate('/content/create', {
        state: {
          influencerData: influencer,
          mode: 'create'
        }
      });
      setShowPlatformModal(false);
    }
  };

  const handleCharacterConsistency = () => {
    if (selectedInfluencerData) {
      // Get the latest profile picture URL with correct format
      const latestImageNum = selectedInfluencerData.image_num - 1;
      const profileImageUrl = `https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/models/${selectedInfluencerData.id}/profilepic/profilepic${latestImageNum}.png`;

      setSelectedProfileImage(profileImageUrl);
      setShowCharacterConsistencyModal(true);
      setShowPlatformModal(false);
    }
  };

  const handleCopyProfileImage = async () => {
    if (!selectedInfluencerData) return;

    setIsCopyingImage(true);
    try {
      if (uploadedFile) {
        // Upload the image directly to the LoRA folder
        const loraFilePath = `models/${selectedInfluencerData.id}/loratraining/${uploadedFile.name}`;

        // Upload file directly to LoRA folder
        const uploadResponse = await fetch(`https://api.nymia.ai/v1/uploadfile?user=${userData.id}&filename=${loraFilePath}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: uploadedFile
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image to LoRA folder');
        }

        await fetch(`https://api.nymia.ai/v1/createtask?userid=${userData.id}&type=createlora`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            task: "createlora",
            fromsingleimage: false,
            modelid: selectedInfluencerData.id,
            inputimage: `/models/${selectedInfluencerData.id}/loratraining/${uploadedFile.name}`,
          })
        });

        toast.success('Image uploaded to LoRA training folder successfully');
      } else {
        // Copy existing profile picture to LoRA folder
        const latestImageNum = selectedInfluencerData.image_num - 1;

        await fetch(`https://api.nymia.ai/v1/createtask?userid=${userData.id}&type=createlora`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            task: "createlora",
            fromsingleimage: true,
            modelid: selectedInfluencerData.id,
            inputimage: `/models/${selectedInfluencerData.id}/profilepic/profilepic${latestImageNum}.png`,
          })
        });

        toast.success('Profile image selected successfully for LoRA training');
      }

      setShowCharacterConsistencyModal(false);
      // Reset upload state
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
      setUploadedFile(null);
      setUploadedImageUrl(null);
    } catch (error) {
      console.error('Error uploading/copying image:', error);
      toast.error('Failed to upload/copy image to LoRA training folder');
    } finally {
      setIsCopyingImage(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
      toast.success('Image uploaded successfully');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50');

    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
      toast.success('Image uploaded successfully');
    }
  };

  const handleRemoveUploadedImage = () => {
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    setUploadedFile(null);
    setUploadedImageUrl(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to your AI influencer management dashboard
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Create New Influencer
        </Button>
      </div>

      {/* My Influencers Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">My Influencers</CardTitle>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700" onClick={() => setShowAllInfluencers(!showAllInfluencers)}>
              <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllInfluencers ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {displayedInfluencers.map((influencer) => (
              <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                <CardContent className="p-6 h-full">
                  <div className="flex flex-col justify-between h-full space-y-4">
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                      {
                        influencer.image_url ? (
                          <img
                            src={influencer.image_url}
                            alt={`${influencer.name_first} ${influencer.name_last}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No image found</h3>
                          </div>
                        )
                      }
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                            {influencer.name_first} {influencer.name_last}
                          </h3>
                          <LoraStatusIndicator 
                            status={influencer.lorastatus || 0} 
                            className="flex-shrink-0"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex text-sm text-muted-foreground flex-col">
                          {influencer.notes ? (
                            <span className="text-sm text-muted-foreground">
                              {influencer.notes.length > 50 
                                ? `${influencer.notes.substring(0, 50)}...` 
                                : influencer.notes
                              }
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {influencer.lifestyle || 'No lifestyle'} • {influencer.origin_residence || 'No residence'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditInfluencer(influencer.id)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUseInfluencer(influencer.id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Story Content Container */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Story Content</CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleFilterStoryContent}>
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All Content</DropdownMenuItem>
                  <DropdownMenuItem>Published</DropdownMenuItem>
                  <DropdownMenuItem>Scheduled</DropdownMenuItem>
                  <DropdownMenuItem>Not Scheduled</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700" onClick={() => setShowAllStoryContent(!showAllStoryContent)}>
                <MoreHorizontal className="w-4 h-4 mr-2" />
                {showAllStoryContent ? 'Show Less' : 'Show More'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedStoryContent.map((content) => (
              <StoryContentCard
                key={content.id}
                id={content.id}
                title={content.title}
                format={content.format}
                setting={content.setting}
                seo={content.seo}
                instagramStatus={content.instagramStatus}
                fanvueSchedule={content.fanvueSchedule}
                images={content.images}
                totalImages={content.totalImages}
                onEdit={handleEditStoryContent}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Container */}
      <ScheduleCard />

      {/* Platform Selection Modal */}
      <Dialog
        open={showPlatformModal}
        onOpenChange={(open) => setShowPlatformModal(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Platform</DialogTitle>
          </DialogHeader>

          {selectedInfluencerData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <img
                  src={selectedInfluencerData.image_url}
                  alt={selectedInfluencerData.name_first}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium">{selectedInfluencerData.name_first} {selectedInfluencerData.name_last}</h4>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Select a platform to create content:</p>

                {/* Content Create Option */}
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4 border-2 border-ai-purple-500/20 hover:border-ai-purple-500/40 bg-gradient-to-r from-ai-purple-50 to-blue-50 dark:from-ai-purple-900/10 dark:to-blue-900/10"
                  onClick={handleContentCreate}
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
                  onClick={handleCharacterConsistency}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-3">
                    <Copy className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Character Consistency</div>
                    <div className="text-sm text-muted-foreground">Select profile picture for LORA training.</div>
                  </div>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or select platform</span>
                  </div>
                </div>
                {PLATFORMS.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handlePlatformSelect(platform.id)}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${platform.color} flex items-center justify-center mr-3`}>
                      <platform.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-muted-foreground">{platform.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Character Consistency Modal */}
      <Dialog
        open={showCharacterConsistencyModal}
        onOpenChange={(open) => setShowCharacterConsistencyModal(open)}
      >
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Copy className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Character Consistency
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-1">
                  Select the latest profile picture for enhanced character consistency training.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedInfluencerData && selectedProfileImage && (
            <div className="p-6 space-y-8">
              {/* Influencer Info Card */}
              <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
                        <img
                          src={selectedInfluencerData.image_url}
                          alt={selectedInfluencerData.name_first}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Copy className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {selectedInfluencerData.name_first} {selectedInfluencerData.name_last}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Latest profile picture • Version {selectedInfluencerData.image_num - 1}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Character Consistency
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          LoRA Training
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Selection Section */}
              <div className="space-y-6">
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Profile Picture Selection
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose the profile picture to copy for character consistency training
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Profile Image Card */}
                  <Card className="group border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-950/10 dark:to-emerald-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <img
                              src={selectedProfileImage}
                              alt="Latest profile picture"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <Copy className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            Latest Profile Picture
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Version {selectedInfluencerData.image_num - 1} • High Quality
                          </p>
                          <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Ready for LoRA Training
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upload Card */}
                  <Card className="group border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-950/10 dark:to-purple-950/10">
                    <CardContent className="p-6">
                      {uploadedImageUrl ? (
                        // Show uploaded image
                        <div className="space-y-4">
                          <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl overflow-hidden shadow-lg">
                              <img
                                src={uploadedImageUrl}
                                alt="Uploaded profile picture"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={handleRemoveUploadedImage}
                              className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                            <div className="absolute top-3 left-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                              <Upload className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="text-center space-y-3">
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                              Uploaded Image
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {uploadedFile?.name} • {(uploadedFile?.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Ready for LoRA Training
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Show professional upload interface
                        <div
                          className="space-y-4"
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          {/* Drag & Drop Area - Looks like an image */}
                          <div className="relative group/drag">
                            <div className="aspect-square bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-2xl overflow-hidden shadow-lg border-2 border-dashed border-blue-300 dark:border-blue-600 group-hover/drag:border-blue-400 dark:group-hover/drag:border-blue-500 transition-all duration-300">
                              {/* Background Pattern */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30"></div>

                              {/* Upload Icon and Text */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mb-4 group-hover/drag:scale-110 transition-transform duration-300">
                                  <Upload className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                                  Upload New Image
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 max-w-xs">
                                  Drag & drop your image here or click to browse
                                </p>
                                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  PNG, JPG, JPEG up to 10MB
                                </div>
                              </div>

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover/drag:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                            </div>

                            {/* File Input */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              id="profile-image-upload"
                            />
                          </div>

                          {/* Additional Upload Options */}
                          <div className="text-center space-y-3">
                            <div className="flex items-center justify-center gap-4">
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                High Quality
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                Secure Upload
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                Instant Processing
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50">
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Tip:</span> Use high-resolution images for better character consistency training results.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Information Section */}
              <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Character Consistency Training
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        This action will copy the selected profile picture to the LoRA training folder,
                        enabling enhanced character consistency in AI-generated content. The image will be
                        used as a reference for maintaining the influencer's visual characteristics.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCharacterConsistencyModal(false);
                    // Reset upload state when closing
                    if (uploadedImageUrl) {
                      URL.revokeObjectURL(uploadedImageUrl);
                    }
                    setUploadedFile(null);
                    setUploadedImageUrl(null);
                  }}
                  className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCopyProfileImage}
                  disabled={isCopyingImage || (!selectedProfileImage && !uploadedFile)}
                  className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCopyingImage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Setting for LoRA training...
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-3" />
                      {uploadedFile ? 'Upload to LoRA training Folder' : 'Select Profile Image for LORA training'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
