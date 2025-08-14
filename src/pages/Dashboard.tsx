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
import { Plus, Settings, MoreHorizontal, Image, Copy, Upload, X, Loader2, Sparkles, FileVideo, Palette, RefreshCw, Zap, CheckCircle, Brain, FolderOpen, Volume2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Influencer } from '@/store/slices/influencersSlice';
import axios from 'axios';
import { toast } from 'sonner';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';

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
  
  // Phase 3 Content Creation Modal state
  const [showPhase3CreationModal, setShowPhase3CreationModal] = useState(false);
  const [selectedPhase3Influencer, setSelectedPhase3Influencer] = useState<Influencer | null>(null);
  
  // Phase 4 Library Organization Modal state
  const [showPhase4LibraryModal, setShowPhase4LibraryModal] = useState(false);
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





  const handleTrainCharacterConsistency = (influencerId: string) => {
    const selectedInfluencer = influencers.find(inf => inf.id === influencerId);
    if (selectedInfluencer) {
      const loraStatus = selectedInfluencer.lorastatus || 0;

      if (loraStatus === 0) {
        // Not trained - open Character Consistency modal directly
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
      setSelectedPhase3Influencer(influencer);
      setShowPhase3CreationModal(true);
    }
  };

  const handleCreatePPVSet = (influencerId: string) => {
    setShowPhase4LibraryModal(true);
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome to your AI influencer management dashboard
          </p>
        </div>
        <Button 
          onClick={handleCreateNew} 
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Influencer
        </Button>
      </div>

      {/* Phase 1 - Create your Influencer Container */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-b border-purple-200/50 dark:border-purple-800/50 p-3 sm:px-6 lg:px-10 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <CardTitle className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Phase 1 - Create your Influencer</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-sm px-3 sm:px-4 py-2" 
              onClick={() => setShowAllPhaseOne(!showAllPhaseOne)}
            >
              <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllPhaseOne ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <div className="w-full p-4 sm:p-6 xl:hidden">
          <InstructionVideo {...getInstructionVideoConfig('phase1')} />
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
            {/* Left side - Influencer cards (3 width) */}
            <div className="col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedInfluencerOne.map((influencer) => (
              <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
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
                            <h3 className="font-semibold text-base sm:text-lg group-hover:text-ai-purple-500 transition-colors">
                              {influencer.name_first} {influencer.name_last}
                            </h3>
                          </div>

                          <div className="flex flex-col gap-1 mb-3">
                            <div className="flex text-xs sm:text-sm text-muted-foreground flex-col">
                              {influencer.notes ? (
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {influencer.notes.length > 50 
                                    ? `${influencer.notes.substring(0, 50)}...` 
                                    : influencer.notes
                                  }
                                </span>
                              ) : (
                                <span className="text-xs sm:text-sm text-muted-foreground">
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
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-2"
                        >
                          <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Edit
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
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b border-green-200/50 dark:border-green-800/50 p-3 sm:px-6 lg:px-10 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <CardTitle className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Phase 2 - Train Character Consistency</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-sm px-3 sm:px-4 py-2" 
              onClick={() => setShowAllPhaseTwo(!showAllPhaseTwo)}
            >
                <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllPhaseTwo ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <div className="w-full p-4 sm:p-6 xl:hidden">
          <InstructionVideo {...getInstructionVideoConfig('phase2')} />
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
            {/* Left side - Influencer cards (3 width) */}
            <div className="col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedInfluencerTwo.map((influencer) => (
                  <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                    <CardContent className="p-4 sm:p-6 h-full">
                      <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
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
                            <h3 className="font-semibold text-base sm:text-lg group-hover:text-ai-purple-500 transition-colors">
                              {influencer.name_first} {influencer.name_last}
                            </h3>
                          </div>

                          <div className="flex flex-col gap-1 mb-3">
                            <div className="flex text-xs sm:text-sm text-muted-foreground flex-col">
                              {influencer.notes ? (
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {influencer.notes.length > 50 
                                    ? `${influencer.notes.substring(0, 50)}...` 
                                    : influencer.notes
                                  }
                                </span>
                              ) : (
                                <span className="text-xs sm:text-sm text-muted-foreground">
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
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs sm:text-sm px-2 sm:px-3 py-2"
                            >
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b border-blue-200/50 dark:border-blue-800/50 p-3 sm:px-6 lg:px-10 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <CardTitle className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Phase 3 - Create Social Media Content</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-sm px-3 sm:px-4 py-2" 
              onClick={() => setShowAllPhaseThree(!showAllPhaseThree)}
            >
              <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllPhaseThree ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <div className="w-full p-4 sm:p-6 xl:hidden">
          <InstructionVideo {...getInstructionVideoConfig('phase3')} />
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
            {/* Left side - Influencer cards (3 width) */}
            <div className="col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedInfluencerThree.map((influencer) => (
                  <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                    <CardContent className="p-4 sm:p-6 h-full">
                      <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
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
                            <h3 className="font-semibold text-base sm:text-lg group-hover:text-ai-purple-500 transition-colors">
                              {influencer.name_first} {influencer.name_last}
                            </h3>
                          </div>

                          <div className="flex flex-col gap-1 mb-3">
                            <div className="flex text-xs sm:text-sm text-muted-foreground flex-col">
                              {influencer.notes ? (
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {influencer.notes.length > 50 
                                    ? `${influencer.notes.substring(0, 50)}...` 
                                    : influencer.notes
                                  }
                                </span>
                              ) : (
                                <span className="text-xs sm:text-sm text-muted-foreground">
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
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs sm:text-sm px-2 sm:px-3 py-2"
                            >
                              <Image className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b border-orange-200/50 dark:border-orange-800/50 p-3 sm:px-6 lg:px-10 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <CardTitle className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Phase 4 - Organize your Content</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-sm px-3 sm:px-4 py-2" 
              onClick={() => setShowAllPhaseFour(!showAllPhaseFour)}
            >
              <MoreHorizontal className="w-4 h-4 mr-2" />
              {showAllPhaseFour ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardHeader>
        <div className="w-full p-4 sm:p-6 xl:hidden">
          <InstructionVideo {...getInstructionVideoConfig('phase4')} />
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
            {/* Left side - Influencer cards (3 width) */}
            <div className="col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedInfluencerFour.map((influencer) => (
                  <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                    <CardContent className="p-4 sm:p-6 h-full">
                      <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
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
                            <h3 className="font-semibold text-base sm:text-lg group-hover:text-ai-purple-500 transition-colors">
                              {influencer.name_first} {influencer.name_last}
                            </h3>
                          </div>

                          <div className="flex flex-col gap-1 mb-3">
                            <div className="flex text-xs sm:text-sm text-muted-foreground flex-col">
                              {influencer.notes ? (
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {influencer.notes.length > 50 
                                    ? `${influencer.notes.substring(0, 50)}...` 
                                    : influencer.notes
                                  }
                                </span>
                              ) : (
                                <span className="text-xs sm:text-sm text-muted-foreground">
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
                              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-xs sm:text-sm px-2 sm:px-3 py-2"
                            >
                              <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Organize
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

      {/* Phase 3 Creation Options Modal */}
      <Dialog open={showPhase3CreationModal} onOpenChange={setShowPhase3CreationModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 bg-white/5 rounded-full -translate-y-10 sm:-translate-y-16 lg:-translate-y-20 translate-x-10 sm:translate-x-16 lg:translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white/5 rounded-full translate-y-8 sm:translate-y-12 lg:translate-y-16 -translate-x-8 sm:-translate-x-12 lg:-translate-x-16"></div>

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-white/20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl sm:shadow-2xl">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Generate Exclusive Content
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base lg:text-lg text-purple-100 leading-relaxed max-w-2xl mx-auto">
                Choose your preferred content creation method. Each option offers unique capabilities to bring your AI influencer to life.
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Influencer Info Card */}
            {(() => {
              const displayInfluencer = selectedPhase3Influencer;

              if (displayInfluencer) {
                return (
                  <Card className="mb-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200/50 dark:border-purple-800/50 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
                            <img
                              src={displayInfluencer.image_url}
                              alt={displayInfluencer.name_first}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {displayInfluencer.lorastatus === 2 && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {displayInfluencer.name_first} {displayInfluencer.name_last}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Ready for content creation • {displayInfluencer.influencer_type || 'AI Influencer'}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {displayInfluencer.lorastatus === 2 ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                AI Consistency Trained
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                <Brain className="w-3 h-3 mr-1" />
                                Ready for Training
                              </span>
                            )}
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Content Ready
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}

            {/* Creation Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Images */}
              <Card 
                onClick={() => {
                  const influencerToUse = selectedPhase3Influencer;
                  setShowPhase3CreationModal(false);
                  if (influencerToUse) {
                    navigate('/create/images', { state: { influencerData: influencerToUse } });
                  } else {
                    navigate('/create/images');
                  }
                }}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-purple-300 dark:hover:border-purple-600 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800/50 dark:to-purple-900/20"
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Image className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Generate Images
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    Create stunning AI-generated images with your influencer in various scenarios, poses, and styles.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    High-quality AI generation
                  </div>
                </CardContent>
              </Card>

              {/* Videos */}
              <Card 
                onClick={() => {
                  const influencerToUse = selectedPhase3Influencer;
                  setShowPhase3CreationModal(false);
                  if (influencerToUse) {
                    navigate('/create/videos', { state: { influencerData: influencerToUse, autoSelect: 'image' } });
                  } else {
                    navigate('/create/videos', { state: { autoSelect: 'image' } });
                  }
                }}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-blue-300 dark:hover:border-blue-600 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/20"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FileVideo className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Create Videos
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    Generate dynamic videos featuring your AI influencer with lip-sync and motion capabilities.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Advanced video generation
                  </div>
                </CardContent>
              </Card>

              {/* Edit */}
              <Card 
                onClick={() => {
                  setShowPhase3CreationModal(false);
                  navigate('/create/edit');
                }}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-green-300 dark:hover:border-green-600 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800/50 dark:to-green-900/20"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Edit & Enhance
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    Edit and enhance existing images with AI-powered tools for professional results.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Professional editing tools
                  </div>
                </CardContent>
              </Card>

              {/* Face Swap */}
              <Card 
                onClick={() => {
                  setShowPhase3CreationModal(false);
                  navigate('/create/faceswap');
                }}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-orange-300 dark:hover:border-orange-600 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800/50 dark:to-orange-900/20"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <RefreshCw className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Face Swap
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    Seamlessly swap faces in images and videos with advanced AI technology.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Advanced face swapping
                  </div>
                </CardContent>
              </Card>

              {/* Optimizer */}
              <Card 
                onClick={() => {
                  setShowPhase3CreationModal(false);
                  navigate('/create/optimizer');
                }}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-indigo-300 dark:hover:border-indigo-600 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800/50 dark:to-indigo-900/20"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Content Optimizer
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                    Optimize and upscale your content for maximum quality and performance.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Quality optimization
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowPhase3CreationModal(false)}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 sm:px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowPhase3CreationModal(false);
                  // Navigate to images creation as default
                  const influencerToUse = selectedPhase3Influencer;
                  if (influencerToUse) {
                    navigate('/create/images', { state: { influencerData: influencerToUse } });
                  } else {
                    navigate('/create/images');
                  }
                }}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-4"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Start with Images (Default)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 4 Library Options Modal */}
      <Dialog open={showPhase4LibraryModal} onOpenChange={setShowPhase4LibraryModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 bg-white/5 rounded-full -translate-y-10 sm:-translate-y-16 lg:-translate-y-20 translate-x-10 sm:translate-x-16 lg:translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white/5 rounded-full translate-y-8 sm:translate-y-12 lg:translate-y-16 -translate-x-8 sm:-translate-x-12 lg:-translate-x-16"></div>

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-white/20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl sm:shadow-2xl">
                <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Organize Your Content
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base lg:text-lg text-orange-100 leading-relaxed max-w-2xl mx-auto">
                Choose a library to organize and manage your generated content. Keep your AI influencer's assets well-organized for easy access.
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Library Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Images Library */}
              <Card
                onClick={async () => {
                  setShowPhase4LibraryModal(false);
                  // Update guide_step to 5
                  try {
                    const response = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WeInfl3nc3withAI'
                      },
                      body: JSON.stringify({
                        guide_step: 5
                      })
                    });

                    if (response.ok) {
                      dispatch(setUser({ guide_step: 5 }));
                      toast.success('Progress updated! Moving to Phase 5...');
                    } else {
                      toast.error('Failed to update progress');
                    }
                  } catch (error) {
                    console.error('Failed to update guide_step:', error);
                    toast.error('Failed to update progress');
                  }
                  navigate('/library/images');
                }}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-orange-300 dark:hover:border-orange-600 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800/50 dark:to-orange-900/20"
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Image className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Images Library
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    Organize and manage all your AI-generated images, edit history, and image presets in one place.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Image management & organization
                  </div>
                </CardContent>
              </Card>

              {/* Videos Library */}
              <Card
                onClick={async () => {
                  setShowPhase4LibraryModal(false);
                  // Update guide_step to 5
                  try {
                    const response = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WeInfl3nc3withAI'
                      },
                      body: JSON.stringify({
                        guide_step: 5
                      })
                    });

                    if (response.ok) {
                      dispatch(setUser({ guide_step: 5 }));
                      toast.success('Progress updated! Moving to Phase 5...');
                    } else {
                      toast.error('Failed to update progress');
                    }
                  } catch (error) {
                    console.error('Failed to update guide_step:', error);
                    toast.error('Failed to update progress');
                  }
                  navigate('/library/videos');
                }}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-amber-300 dark:hover:border-amber-600 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-800/50 dark:to-amber-900/20"
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FileVideo className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Videos Library
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    Manage your video content, lip-sync videos, and video presets with advanced organization tools.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    Video management & organization
                  </div>
                </CardContent>
              </Card>

              {/* Audios Library */}
              <Card
                onClick={async () => {
                  setShowPhase4LibraryModal(false);
                  // Update guide_step to 5
                  try {
                    const response = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WeInfl3nc3withAI'
                      },
                      body: JSON.stringify({
                        guide_step: 5
                      })
                    });

                    if (response.ok) {
                      dispatch(setUser({ guide_step: 5 }));
                      toast.success('Progress updated! Moving to Phase 5...');
                    } else {
                      toast.error('Failed to update progress');
                    }
                  } catch (error) {
                    console.error('Failed to update guide_step:', error);
                    toast.error('Failed to update progress');
                  }
                  navigate('/library/audios');
                }}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-yellow-300 dark:hover:border-yellow-600 bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-800/50 dark:to-yellow-900/20"
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Volume2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Audios Library
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    Organize your audio files, voice samples, and audio presets for lip-sync video creation.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Audio management & organization
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowPhase4LibraryModal(false)}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 sm:px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setShowPhase4LibraryModal(false);
                  // Update guide_step to 5 and navigate to images library as default
                  try {
                    const response = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WeInfl3nc3withAI'
                      },
                      body: JSON.stringify({
                        guide_step: 5
                      })
                    });

                    if (response.ok) {
                      dispatch(setUser({ guide_step: 5 }));
                      toast.success('Progress updated! Moving to Phase 5...');
                    } else {
                      toast.error('Failed to update progress');
                    }
                  } catch (error) {
                    console.error('Failed to update guide_step:', error);
                    toast.error('Failed to update progress');
                  }
                  navigate('/library/images');
                }}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-4"
              >
                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Go to Images Library (Default)
              </Button>
            </div>
          </div>
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
