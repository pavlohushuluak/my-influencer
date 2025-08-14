import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import config from '@/config/config';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { setUser } from '@/store/slices/userSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, MoreHorizontal, Image, Copy, Upload, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Influencer } from '@/store/slices/influencersSlice';
import axios from 'axios';
import { toast } from 'sonner';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';
import { InfluencerUseModal } from '@/components/Influencers/InfluencerUseModal';
import { CreditConfirmationModal } from '@/components/CreditConfirmationModal';
import InstructionVideo from '@/components/InstructionVideo';
import { getInstructionVideoConfig } from '@/config/instructionVideos';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const loading = useSelector((state: RootState) => state.influencers.loading);
  const error = useSelector((state: RootState) => state.influencers.error);
  const [showAllPhaseOne, setShowAllPhaseOne] = useState(false);
  const [showAllPhaseTwo, setShowAllPhaseTwo] = useState(false);
  const [showAllPhaseThree, setShowAllPhaseThree] = useState(false);
  const [showAllPhaseFour, setShowAllPhaseFour] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [selectedInfluencerData, setSelectedInfluencerData] = useState<Influencer | null>(null);
  const [showCharacterConsistencyModal, setShowCharacterConsistencyModal] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<string | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  // Credit checking state for LoRA training
  const [showGemWarning, setShowGemWarning] = useState(false);
  const [gemCostData, setGemCostData] = useState<{
    id: number;
    item: string;
    description: string;
    gems: number;
  } | null>(null);
  const [isCheckingGems, setIsCheckingGems] = useState(false);
  const displayedInfluencerOne = showAllPhaseOne ? influencers : influencers.slice(0, 3);
  const displayedInfluencerTwo = showAllPhaseTwo ? influencers : influencers.slice(0, 3);
  const displayedInfluencerThree = showAllPhaseThree ? influencers : influencers.slice(0, 3);
  const displayedInfluencerFour = showAllPhaseFour ? influencers : influencers.slice(0, 3);

  const userData = useSelector((state: RootState) => state.user);
  const userLoading = useSelector((state: RootState) => state.user.loading);

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
          const response = await axios.patch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, JSON.stringify({
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
          const response = await axios.patch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, JSON.stringify({
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
    const fetchInfluencers = async () => {
      console.log('fetchInfluencers called with userData.id:', userData.id);
      try {
        dispatch(setLoading(true));
        const response = await fetch(`${config.supabase_server_url}/influencer?user_id=eq.${userData.id}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch influencers');
        }

        const data = await response.json();
        console.log('fetchInfluencers response data:', data);
        dispatch(setInfluencers(data));
      } catch (error) {
        dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
      } finally {
        dispatch(setLoading(false));
      }
    };

  useEffect(() => {
    console.log('Dashboard useEffect - userData.id:', userData.id, 'userLoading:', userLoading, 'influencers.length:', influencers.length);
    if (userData.id && !userLoading) {
      fetchInfluencers();
    }
  }, [dispatch, userData.id, userLoading]);

  const handleCreateNew = () => {
            navigate('/influencers/new');
  };

  const handleEditInfluencer = (id: string) => {
            navigate('/influencers/profiles', { state: { influencerData: influencers.find(inf => inf.id === id) } });
  };

  const handleUseInfluencer = (id: string) => {
    const selectedInfluencer = influencers.find(inf => inf.id === id);
    if (selectedInfluencer) {
      setSelectedInfluencer(id);
      setSelectedInfluencerData(selectedInfluencer);
      setShowPlatformModal(true);
    }
  };

  const handleCreateImages = () => {
    const influencer = influencers.find(inf => inf.id === selectedInfluencer);

    if (influencer) {
              navigate('/create/images', {
        state: {
          influencerData: influencer,
          mode: 'create'
        }
      });
      setShowPlatformModal(false);
    }
  };

  const handleCreateVideo = () => {
    const influencer = influencers.find(inf => inf.id === selectedInfluencer);

    if (influencer) {
              navigate('/create/videos', {
        state: {
          influencerData: influencer,
          mode: 'create'
        }
      });
      setShowPlatformModal(false);
    }
  };

  const handleTrainCharacterConsistency = (influencerId: string) => {
    const selectedInfluencer = influencers.find(inf => inf.id === influencerId);
    if (selectedInfluencer) {
      const loraStatus = selectedInfluencer.lorastatus || 0;

      if (loraStatus === 0) {
        // Not trained - open Character Consistency modal directly
        setSelectedInfluencer(influencerId);
        setSelectedInfluencerData(selectedInfluencer);
        // Get the latest profile picture URL with correct format
        let latestImageNum = selectedInfluencer.image_num - 1;
        if (latestImageNum === -1) {
          latestImageNum = 0;
        }
        const profileImageUrl = `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/models/${selectedInfluencer.id}/profilepic/profilepic${latestImageNum}.png`;

        setSelectedProfileImage(profileImageUrl);
        setShowCharacterConsistencyModal(true);
      } else if (loraStatus === 1) {
        // Training in progress - show warning
        toast.error('AI consistency training is already in progress', {
          description: `${selectedInfluencer.name_first}'s training is currently active. Please wait for it to complete.`
        });
      } else if (loraStatus === 2) {
        // Trained - show success message
        toast.success('AI consistency training completed', {
          description: `${selectedInfluencer.name_first} has already been trained for AI consistency.`
        });
      } else {
        // Error or other status - treat as not trained
        setSelectedInfluencer(influencerId);
        setSelectedInfluencerData(selectedInfluencer);
        let latestImageNum = selectedInfluencer.image_num - 1;
        if (latestImageNum === -1) {
          latestImageNum = 0;
        }
        const profileImageUrl = `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/models/${selectedInfluencer.id}/profilepic/profilepic${latestImageNum}.png`;

        setSelectedProfileImage(profileImageUrl);
        setShowCharacterConsistencyModal(true);
      }
    }
  };

  const handleCreateSocialMedia = (influencerId: string) => {
    const influencer = influencers.find(inf => inf.id === influencerId);
    if (influencer) {
      navigate('/content/create', {
        state: {
          influencerData: influencer,
          mode: 'create'
        }
      });
    }
  };

  const handleCreatePPVSet = (influencerId: string) => {
    const influencer = influencers.find(inf => inf.id === influencerId);
    if (influencer) {
      navigate('/content/create', {
        state: {
          influencerData: influencer,
          mode: 'ppv'
        }
      });
    }
  };

  const handleCharacterConsistency = () => {
    if (selectedInfluencerData) {
      // Get the latest profile picture URL with correct format
      const latestImageNum = selectedInfluencerData.image_num - 1;
      const profileImageUrl = `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/models/${selectedInfluencerData.id}/profilepic/profilepic${latestImageNum}.png`;

      setSelectedProfileImage(profileImageUrl);
      setShowCharacterConsistencyModal(true);
      setShowPlatformModal(false);
    }
  };

  // Function to check gem cost for LoRA training
  const checkLoraGemCost = async () => {
    try {
      setIsCheckingGems(true);
      const response = await fetch('https://api.nymia.ai/v1/getgems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          item: 'lora_images_only'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gem cost: ${response.status}`);
      }

      const gemData = await response.json();
      return gemData;
    } catch (error) {
      console.error('Error checking LoRA gem cost:', error);
      toast.error('Failed to check training cost. Proceeding without verification.');
      return null;
    } finally {
      setIsCheckingGems(false);
    }
  };

  // Function to proceed with LoRA training after gem confirmation
  const proceedWithLoraTraining = async () => {
    try {
      setShowGemWarning(false);
      console.log('Starting AI consistency training after credit confirmation...');
      await executeLoraTraining();
    } catch (error) {
      console.error('Error in proceedWithLoraTraining:', error);
      toast.error('Failed to start AI consistency training. Please try again.');
      setIsCopyingImage(false);
    }
  };

  // Main LoRA training function with credit checking
  const handleCopyProfileImage = async () => {
    if (!selectedInfluencerData) return;

    // Check gem cost before proceeding
    const gemData = await checkLoraGemCost();
    if (gemData) {
      setGemCostData(gemData);
      
      // Check if user has enough credits
      if (userData.credits < gemData.gems) {
        setShowGemWarning(true);
        return;
      } else {
        // Show confirmation for gem cost
        setShowGemWarning(true);
        return;
      }
    }

    // If no gem checking needed or failed, show error and don't proceed
    toast.error('Unable to verify credit cost. Please try again.');
    return;
  };

  // Separated LoRA training execution function
  const executeLoraTraining = async () => {
    if (!selectedInfluencerData) return;

    setIsCopyingImage(true);
    try {
      if (uploadedFile) {
        // Upload the image directly to the LoRA folder
        const loraFilePath = `models/${selectedInfluencerData.id}/loratraining/${uploadedFile.name}`;

        // Upload file directly to LoRA folder
        const uploadResponse = await fetch(`${config.backend_url}/uploadfile?user=${userData.id}&filename=${loraFilePath}`, {
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

        const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
  
        const useridData = await useridResponse.json();

        await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createlora`, {
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

        toast.success('Image uploaded for AI consistency training successfully');
      } else {
        // Copy existing profile picture to LoRA folder
        const latestImageNum = selectedInfluencerData.image_num - 1;

        const useridResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
  
        const useridData = await useridResponse.json();

        await fetch(`${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createlora`, {
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

        toast.success('Profile image selected successfully for AI consistency training');
      }

      // Refresh influencer data to update lorastatus
      await fetchInfluencers();

      // Update guide_step if it's currently 2
      if (userData.guide_step === 2) {
        try {
          const guideStepResponse = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer WeInfl3nc3withAI' },
            body: JSON.stringify({ guide_step: 3 })
          });
          if (guideStepResponse.ok) {
            // Update Redux store
            dispatch(setUser({ guide_step: 3 }));
            toast.success('Progress updated! Moving to Phase 3...');
            navigate('/start');
          }
        } catch (error) {
          console.error('Failed to update guide_step:', error);
        }
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
      toast.error('Failed to upload/copy image for AI consistency training');
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

  if (loading || userLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-muted-foreground">
              {userLoading ? 'Loading user data...' : 'Loading influencers...'}
            </p>
          </div>
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

  // Don't render dashboard content if user data is not available
  if (!userData.id) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
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

      {/* Phase 1 - Create your Influencer Container */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b border-purple-200/50 dark:border-purple-800/50 p-3 px-10 mb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Phase 1 - Create your Influencer</CardTitle>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30" onClick={() => setShowAllPhaseOne(!showAllPhaseOne)}>
              <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllPhaseOne ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <div className="w-full p-6 xl:hidden">
          <InstructionVideo {...getInstructionVideoConfig('phase1')} />
        </div>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left side - Influencer cards (3 width) */}
            <div className="col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedInfluencerOne.map((influencer) => (
              <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                <CardContent className="p-6 h-full">
                  <div className="flex flex-col justify-between h-full space-y-4">
                    <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                      {/* LoraStatusIndicator positioned at top right */}
                      <div className="absolute right-[-15px] top-[-15px] z-10">
                        <LoraStatusIndicator 
                          status={influencer.lorastatus || 0} 
                          className="flex-shrink-0"
                        />
                      </div>
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
                        <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                          {influencer.name_first} {influencer.name_last}
                        </h3>
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

                          <div className="grid gap-2 grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
            </div>

            {/* Right side - Intro video (2 width) */}
            <div className="hidden xl:block col-span-2 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center p-4">
                <InstructionVideo {...getInstructionVideoConfig('phase1')} className="w-full max-w-lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 2 - Train Character Consistency Container */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b border-green-200/50 dark:border-green-800/50 p-3 px-10 mb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Phase 2 - Train Character Consistency</CardTitle>
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30" onClick={() => setShowAllPhaseTwo(!showAllPhaseTwo)}>
                <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllPhaseTwo ? 'Show Less' : 'Show More'}
              </Button>
            </div>
        </CardHeader>
        <div className="w-full p-6 xl:hidden">
          <InstructionVideo {...getInstructionVideoConfig('phase2')} />
        </div>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left side - Influencer cards (3 width) */}
            <div className="col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedInfluencerTwo.map((influencer) => (
                  <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                    <CardContent className="p-6 h-full">
                      <div className="flex flex-col justify-between h-full space-y-4">
                        <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                          {/* LoraStatusIndicator positioned at top right */}
                          <div className="absolute right-[-15px] top-[-15px] z-10">
                            <LoraStatusIndicator 
                              status={influencer.lorastatus || 0} 
                              className="flex-shrink-0"
                            />
                          </div>
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
                            <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                              {influencer.name_first} {influencer.name_last}
                            </h3>
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
                              onClick={() => handleTrainCharacterConsistency(influencer.id)}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Train CC
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right side - Intro video (2 width) */}
            <div className="hidden xl:block col-span-2 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center p-4">
                <InstructionVideo {...getInstructionVideoConfig('phase2')} className="w-full max-w-lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 3 - Create Social Media Content Container */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-200/50 dark:border-blue-800/50 p-3 px-10 mb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Phase 3 - Create Social Media Content</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30" onClick={() => setShowAllPhaseThree(!showAllPhaseThree)}>
              <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllPhaseThree ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <div className="w-full p-6 xl:hidden">
          <InstructionVideo {...getInstructionVideoConfig('phase3')} />
        </div>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left side - Influencer cards (3 width) */}
            <div className="col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedInfluencerThree.map((influencer) => (
                  <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                    <CardContent className="p-6 h-full">
                      <div className="flex flex-col justify-between h-full space-y-4">
                        <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                          {/* LoraStatusIndicator positioned at top right */}
                          <div className="absolute right-[-15px] top-[-15px] z-10">
                            <LoraStatusIndicator 
                              status={influencer.lorastatus || 0} 
                              className="flex-shrink-0"
                            />
                          </div>
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
                            <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                              {influencer.name_first} {influencer.name_last}
                            </h3>
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
                              onClick={() => handleCreateSocialMedia(influencer.id)}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <Image className="w-4 h-4 mr-2" />
                              Social Media
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right side - Intro video (2 width) */}
            <div className="hidden xl:block col-span-2 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center p-4">
                <InstructionVideo {...getInstructionVideoConfig('phase3')} className="w-full max-w-lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 4 - Monetize Container */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b border-orange-200/50 dark:border-orange-800/50 p-3 px-10 mb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Phase 4 - Monetize</CardTitle>
            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30" onClick={() => setShowAllPhaseFour(!showAllPhaseFour)}>
              <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllPhaseFour ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <div className="w-full p-6 xl:hidden">
          <InstructionVideo {...getInstructionVideoConfig('phase4')} />
        </div>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left side - Influencer cards (3 width) */}
            <div className="col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedInfluencerFour.map((influencer) => (
                  <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                    <CardContent className="p-6 h-full">
                      <div className="flex flex-col justify-between h-full space-y-4">
                        <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                          {/* LoraStatusIndicator positioned at top right */}
                          <div className="absolute right-[-15px] top-[-15px] z-10">
                            <LoraStatusIndicator 
                              status={influencer.lorastatus || 0} 
                              className="flex-shrink-0"
                            />
                          </div>
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
                            <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                              {influencer.name_first} {influencer.name_last}
                            </h3>
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
                              onClick={() => handleCreatePPVSet(influencer.id)}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create PPV Set
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right side - Intro video (2 width) */}
            <div className="hidden xl:block col-span-2 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center p-4">
                <InstructionVideo {...getInstructionVideoConfig('phase4')} className="w-full max-w-lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection Modal */}
      <InfluencerUseModal
        open={showPlatformModal}
        onOpenChange={setShowPlatformModal}
        influencer={selectedInfluencerData}
        onCreateImages={handleCreateImages}
        onCreateVideo={handleCreateVideo}
        onCharacterConsistency={handleCharacterConsistency}
      />

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
                          AI consistency training
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

                <div className="flex justify-center gap-6">
                  {/* Profile Image Card */}
                  <Card className="max-w-md group border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-950/10 dark:to-emerald-950/10">
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
                            Version {selectedInfluencerData.image_num === null || selectedInfluencerData.image_num === undefined || isNaN(selectedInfluencerData.image_num) || selectedInfluencerData.image_num === 0 ? 0 : selectedInfluencerData.image_num - 1} • High Quality
                          </p>
                          <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                          Ready for AI Consistency
                          </div>
                        </div>
                      </div>
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
                        This action will copy the selected profile picture to the AI consistency training folder,
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
                  disabled={isCopyingImage || isCheckingGems || (!selectedProfileImage && !uploadedFile)}
                  className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingGems ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Checking Cost...
                    </>
                  ) : isCopyingImage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Setting up AI consistency training...
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-3" />
                      {uploadedFile ? 'Upload for AI consistency training' : 'Select Profile Image for AI consistency training'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showGemWarning}
        onClose={() => setShowGemWarning(false)}
        onConfirm={proceedWithLoraTraining}
        gemCostData={gemCostData}
        userCredits={userData.credits}
        isProcessing={isCopyingImage}
        processingText="Setting up AI consistency training..."
        confirmButtonText="Start AI Consistency Training"
        title="AI Consistency Training Cost"
        itemType="training"
      />
    </div>
  );
}
