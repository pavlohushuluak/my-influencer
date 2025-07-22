import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';
import { selectLatestTrainedInfluencer, selectLatestGeneratedInfluencer, setInfluencers, setError, setLoading } from '@/store/slices/influencersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Circle, Play, Star, AlertTriangle, Brain, Copy, Upload, X } from 'lucide-react';
import InstructionVideo from '@/components/InstructionVideo';
import { getInstructionVideoConfig } from '@/config/instructionVideos';
import { toast } from 'sonner';
import axios from 'axios';

export default function Start() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const { influencers } = useSelector((state: RootState) => state.influencers);
  const currentPhase = userData.guide_step;
  const [showWarningModal, setShowWarningModal] = useState(false);
    const [showPhase2Modal, setShowPhase2Modal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showInfluencerSelectorModal, setShowInfluencerSelectorModal] = useState(false);
  const [blinkState, setBlinkState] = useState(false);
  
  // LoRA Training Modal States
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  
  // Phase 3 selected influencer state
  const [selectedPhase3Influencer, setSelectedPhase3Influencer] = useState<any>(null);

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

  // Utility function to safely parse dates
  const parseDate = (dateString: string | null | undefined): number => {
    if (!dateString) return 0;

    try {
      // Handle different date formats that might come from the database
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    } catch (error) {
      console.warn('Error parsing date:', dateString, error);
      return 0;
    }
  };

  // Utility function to format dates for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Unknown';
    }
  };

  // Custom blinking animation: blink 3 times, wait, then loop
  useEffect(() => {
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      if (blinkCount < 7) {
        setBlinkState(prev => !prev);
        blinkCount++;
      } else {
        // Wait for 2 seconds after 3 blinks
        setTimeout(() => {
          blinkCount = 0;
          setBlinkState(false);
        }, 3000);
      }
    }, 1000); // Blink every 500ms

    return () => clearInterval(blinkInterval);
  }, []);

  // Debug: Log influencer data structure when influencers change
  useEffect(() => {
    if (influencers.length > 0) {
      console.log('Influencers data structure:', {
        count: influencers.length,
        sample: influencers[0],
        hasCreatedAt: influencers[0]?.created_at,
        hasUpdatedAt: influencers[0]?.updated_at,
        createdAtType: typeof influencers[0]?.created_at,
        updatedAtType: typeof influencers[0]?.updated_at
      });
    }
  }, [influencers]);

  const phases = [
    {
      id: 1,
      title: "Phase 1: Create your Influencer",
      description: "Set up your AI influencer's profile and basic information",
      completed: currentPhase > 1,
      icon: currentPhase > 1 ? CheckCircle : Circle,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
      isPending: currentPhase === 1
    },
    {
      id: 2,
      title: "Phase 2: Train your AI Model",
      description: "Train your AI model for character consistency",
      completed: currentPhase > 2,
      icon: currentPhase > 2 ? CheckCircle : Circle,
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      isPending: currentPhase === 2
    },
    {
      id: 3,
      title: "Phase 3: Generate Exclusive Content",
      description: "Create unique content for your influencer",
      completed: currentPhase > 3,
      icon: currentPhase > 3 ? CheckCircle : Circle,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
      isPending: currentPhase === 3
    },
    {
      id: 4,
      title: "Phase 4: Organize your Content",
      description: "Manage and organize your generated content",
      completed: currentPhase > 4,
      icon: currentPhase > 4 ? CheckCircle : Circle,
      color: "from-orange-500 to-amber-500",
      bgColor: "from-orange-50 to-amber-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600",
      isPending: currentPhase === 4
    }
  ];

  // Use Redux selectors for getting latest influencers
  const latestTrainedInfluencer = useSelector(selectLatestTrainedInfluencer);
  const latestGeneratedInfluencer = useSelector(selectLatestGeneratedInfluencer);

  const handleCreateInfluencer = async () => {
    if (currentPhase === 0) {
      navigate('/dashboard');
    } else if (currentPhase === 1) {
      navigate('/influencers/create');
    } else if (currentPhase === 2) {
      setShowPhase2Modal(true);
    } else if (currentPhase === 3) {
      // Navigate to content create with selected influencer
      const influencerToUse = selectedPhase3Influencer || latestTrainedInfluencer;
      if (influencerToUse) {
        navigate('/content/create', { state: { influencerData: influencerToUse } });
      } else {
        navigate('/content/create');
      }
    } else if (currentPhase === 4) {
      // Update guide_step to 5 when user clicks "Organize Content"
      try {
        const response = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
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

      navigate('/content/vault');
    }
    else {
      navigate('/dashboard');
    }
  };

  const getButtonText = () => {
    switch (currentPhase) {
      case 0:
        return "Start Your Journey";
      case 1:
        return "Start Phase 1 - Create your Influencer";
      case 2:
        return "Start Phase 2 - Train your AI Model";
      case 3:
        return "Start Phase 3 - Generate Exclusive Content";
      case 4:
        return "Start Phase 4 - Organize your Content";
      default:
        return "Start Your Journey";
    }
  };

  const handlePhaseClick = (phaseId: number) => {
    // Update the current phase in Redux store
    dispatch(setUser({ guide_step: phaseId }));

    // Show success message
    toast.success(`Phase ${phaseId} activated!`, {
      description: `You are now on ${phases.find(p => p.id === phaseId)?.title}`
    });
  };

  const handleContinueWork = () => {
    // Skip warning and go directly to Phase 3
    handleConfirmContinueWork();
  };

  const handleConfirmContinueWork = async () => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          guide_step: 3
        })
      });

      if (response.ok) {
        dispatch(setUser({ guide_step: 3 }));
        toast.success('Progress updated! Moving to Phase 3...');
        setShowWarningModal(false);
        // Refresh the page to show updated phase
        window.location.reload();
      } else {
        toast.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Failed to update guide_step:', error);
      toast.error('Failed to update progress');
    }
  };

  // LoRA Training Modal Functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setUploadedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setUploadedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
    }
  };

  const handleRemoveUploadedImage = () => {
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    setUploadedFile(null);
    setUploadedImageUrl(null);
  };

  const handleInfluencerSelection = (influencer: any) => {
    setSelectedPhase3Influencer(influencer);
    setShowInfluencerSelectorModal(false);
  };

  const handleCopyProfileImage = async () => {
    if (!latestGeneratedInfluencer) return;

    setIsCopyingImage(true);
    try {
      if (uploadedFile) {
        // Upload the image directly to the LoRA folder
        const loraFilePath = `models/${latestGeneratedInfluencer.id}/loratraining/${uploadedFile.name}`;

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

        const useridResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        const useridData = await useridResponse.json();

        await fetch(`https://api.nymia.ai/v1/createtask?userid=${useridData[0].userid}&type=createlora`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            task: "createlora",
            fromsingleimage: false,
            modelid: latestGeneratedInfluencer.id,
            inputimage: `/models/${latestGeneratedInfluencer.id}/loratraining/${uploadedFile.name}`,
          })
        });

        toast.success('Image uploaded to LoRA training folder successfully');
      } else {
        // Copy existing profile picture to LoRA folder
        const latestImageNum = latestGeneratedInfluencer.image_num - 1;

        const useridResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        const useridData = await useridResponse.json();

        await fetch(`https://api.nymia.ai/v1/createtask?userid=${useridData[0].userid}&type=createlora`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            task: "createlora",
            fromsingleimage: true,
            modelid: latestGeneratedInfluencer.id,
            inputimage: `/models/${latestGeneratedInfluencer.id}/profilepic/profilepic${latestImageNum}.png`,
          })
        });

        toast.success('Profile image selected successfully for LoRA training');
      }

      // Update guide_step if it's currently 2
      if (userData.guide_step === 2) {
        try {
          const guideStepResponse = await fetch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${userData.id}`, {
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

      setShowTrainingModal(false);
      // Reset upload state
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
      setUploadedFile(null);
      setUploadedImageUrl(null);
    } catch (error) {
      console.error('Error copying profile image:', error);
      toast.error('Failed to copy profile image');
    } finally {
      setIsCopyingImage(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Start
          </h1>
          <p className="text-muted-foreground">
            Welcome to your AI influencer journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 w-full">
        {/* Left Side - Main Card */}
        <div className="w-full">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 shadow-2xl grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3">
            <CardContent className="p-8 lg:col-span-3 xl:col-span-2">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-white">
                    Let's launch your AI Influencer
                  </h2>
                  <p className="text-lg text-slate-300">
                    All you need is 4 simple steps – start with Phase 1 below.
                  </p>
                </div>

                {/* Phases List */}
                <div className="space-y-4">
                  {phases.map((phase) => (
                    <div
                      key={phase.id}
                      onClick={() => handlePhaseClick(phase.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg ${phase.completed
                          ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30 hover:border-green-400/50'
                          : phase.isPending
                            ? `bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-500/30 hover:border-blue-400/50 ${blinkState ? 'opacity-100' : 'opacity-50'}`
                            : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30 hover:border-slate-500/50'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${phase.color} flex items-center justify-center shadow-lg transition-opacity duration-300 ${phase.isPending ? (blinkState ? 'opacity-100' : 'opacity-50') : ''
                        }`}>
                        <phase.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`text-lg font-semibold transition-opacity duration-300 ${phase.completed ? 'text-green-400' : phase.isPending ? (blinkState ? 'text-blue-400' : 'text-blue-600') : 'text-slate-300'
                          }`}>
                          {phase.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {phase.description}
                        </p>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Call to Action Button */}
                <div className="pt-6 flex gap-4 justify-center">
                  <Button
                    onClick={handleCreateInfluencer}
                    className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {getButtonText()}
                  </Button>

                  {/* Continue my work button for Phase 2 */}
                  {currentPhase === 2 && (
                    <Button
                      onClick={handleContinueWork}
                      variant="outline"
                      disabled={!latestTrainedInfluencer}
                      className={`font-semibold text-lg px-8 py-4 rounded-xl shadow-xl transition-all duration-300 transform ${latestTrainedInfluencer
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-2xl hover:scale-105 border-green-500'
                          : 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-400 border-slate-500 cursor-not-allowed opacity-50'
                        }`}
                    >
                      Continue my work
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <div className="lg:col-span-2 xl:col-span-1 w-full h-full flex flex-col items-center justify-center">
              {currentPhase === 2 ? (
                // Show latest trained influencer or latest generated influencer
                (() => {
                  const displayInfluencer = latestTrainedInfluencer || latestGeneratedInfluencer;

                  if (!displayInfluencer) {
                    return (
                      <div className="m-4 flex flex-col items-center justify-center text-center">
                        <div className="w-64 h-64 bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600/30 flex items-center justify-center">
                          <div className="text-slate-400">
                            <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">No influencers found</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="m-4 flex flex-col items-center justify-center">
                      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-600/50 shadow-2xl w-64">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Profile Image */}
                            <div className="relative">
                              <div className="w-full aspect-square bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl overflow-hidden shadow-lg">
                                {displayInfluencer.image_url ? (
                                  <img
                                    src={displayInfluencer.image_url}
                                    alt={`${displayInfluencer.name_first} ${displayInfluencer.name_last}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Circle className="w-12 h-12 text-slate-500" />
                                  </div>
                                )}
                              </div>
                              {latestTrainedInfluencer && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Influencer Info */}
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-white">
                                {displayInfluencer.name_first} {displayInfluencer.name_last}
                              </h3>
                              <p className="text-sm text-slate-400">
                                {displayInfluencer.influencer_type || 'AI Influencer'}
                              </p>
                              <p className="text-xs text-slate-500">
                                Created: {formatDate(displayInfluencer.created_at)}
                              </p>
                              {latestTrainedInfluencer ? (
                                <div className="flex items-center justify-center gap-2 text-xs text-green-400">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  LoRA Trained
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  Ready for Training
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()
              ) : currentPhase === 3 ? (
                // Show selected influencer or latest trained influencer for Phase 3
                (() => {
                  const displayInfluencer = selectedPhase3Influencer || latestTrainedInfluencer;

                  if (!displayInfluencer) {
                    return (
                      <div className="m-4 flex flex-col items-center justify-center text-center">
                        <div className="w-64 h-64 bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600/30 flex items-center justify-center">
                          <div className="text-slate-400">
                            <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">No influencers found</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="m-4 flex flex-col items-center justify-center space-y-4">
                      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-600/50 shadow-2xl w-64">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Profile Image */}
                            <div className="relative">
                              <div className="w-full aspect-square bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl overflow-hidden shadow-lg">
                                {displayInfluencer.image_url ? (
                                  <img
                                    src={displayInfluencer.image_url}
                                    alt={`${displayInfluencer.name_first} ${displayInfluencer.name_last}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Circle className="w-12 h-12 text-slate-500" />
                                  </div>
                                )}
                              </div>
                              {displayInfluencer.lorastatus === 2 && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Influencer Info */}
                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-white">
                                {displayInfluencer.name_first} {displayInfluencer.name_last}
                              </h3>
                              <p className="text-sm text-slate-400">
                                {displayInfluencer.influencer_type || 'AI Influencer'}
                              </p>
                              <p className="text-xs text-slate-500">
                                Created: {formatDate(displayInfluencer.created_at)}
                              </p>
                              {displayInfluencer.lorastatus === 2 ? (
                                <div className="flex items-center justify-center gap-2 text-xs text-green-400">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  LoRA Trained
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  Ready for Training
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Select Another Influencer Button */}
                      <Button
                        onClick={() => setShowInfluencerSelectorModal(true)}
                        variant="outline"
                        className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
                      >
                        Select another influencer
                      </Button>
                    </div>
                  );
                })()
              ) : (
                <InstructionVideo {...getInstructionVideoConfig(`phase${currentPhase}`)} className="m-4 flex flex-col items-center justify-center " />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Move to Main Page Section */}
      <div className="flex justify-center mt-12">
        <div className="text-center space-y-6">
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 mx-auto rounded-full shadow-lg"></div>
          <Button
            onClick={() => navigate('/')}
            className="group relative overflow-hidden bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800 hover:from-slate-600 hover:via-gray-600 hover:to-slate-700 text-white font-semibold text-lg px-12 py-4 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:scale-105 border border-slate-600/50 hover:border-slate-500/70"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Star className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              Move to Main Page
              <Star className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Button>
        </div>
      </div>

      {/* Warning Modal for Continue Work */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 shadow-2xl">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Quality Consideration
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-base leading-relaxed">
              <p className="mb-4">
                By proceeding without LoRA training, you may experience reduced character consistency and quality in your generated content.
              </p>
              <p className="text-sm text-slate-400">
                LoRA training significantly enhances your AI influencer's visual consistency and produces more professional, cohesive results. We recommend completing the training for optimal results.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowWarningModal(false)}
              className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmContinueWork}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all duration-200"
            >
              Continue Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phase 2 Modal */}
      <Dialog open={showPhase2Modal} onOpenChange={setShowPhase2Modal}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Latest Generated Influencer
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-base leading-relaxed">
                Choose how you'd like to proceed with your AI model training
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Influencer Card */}
            {(() => {
              if (!latestGeneratedInfluencer) {
                return (
                  <div className="text-center py-8">
                    <Circle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                    <p className="text-slate-600 dark:text-slate-400">No influencers found</p>
                  </div>
                );
              }

              return (
                <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
                          <img
                            src={latestGeneratedInfluencer.image_url}
                            alt={latestGeneratedInfluencer.name_first}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <Copy className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {latestGeneratedInfluencer.name_first} {latestGeneratedInfluencer.name_last}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          Latest profile picture • Version {latestGeneratedInfluencer.image_num === null || latestGeneratedInfluencer.image_num === undefined || isNaN(latestGeneratedInfluencer.image_num) ? 0 : latestGeneratedInfluencer.image_num - 1}
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
              );
            })()}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowPhase2Modal(false);
                  setShowTrainingModal(true);
                }}
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-1.02] border-0"
              >
                <Brain className="w-5 h-5 mr-3" />
                Continue work
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPhase2Modal(false);
                  navigate('/influencers');
                }}
                className="w-full h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Select another influencer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Character Consistency Training Modal */}
      <Dialog
        open={showTrainingModal}
        onOpenChange={(open) => setShowTrainingModal(open)}
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

          {(() => {
            if (!latestGeneratedInfluencer) return null;

            return (
              <div className="p-6 space-y-8">
                {/* Influencer Info Card */}
                <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
                          <img
                            src={latestGeneratedInfluencer.image_url}
                            alt={latestGeneratedInfluencer.name_first}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <Copy className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {latestGeneratedInfluencer.name_first} {latestGeneratedInfluencer.name_last}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          Latest profile picture • Version {latestGeneratedInfluencer.image_num === null || latestGeneratedInfluencer.image_num === undefined || isNaN(latestGeneratedInfluencer.image_num) ? 0 : latestGeneratedInfluencer.image_num - 1}
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
                                src={latestGeneratedInfluencer.image_url}
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
                              Version {latestGeneratedInfluencer.image_num === null || latestGeneratedInfluencer.image_num === undefined || isNaN(latestGeneratedInfluencer.image_num) || latestGeneratedInfluencer.image_num === 0 ? 0 : latestGeneratedInfluencer.image_num - 1} • High Quality
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
                      setShowTrainingModal(false);
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
                    disabled={isCopyingImage || (!latestGeneratedInfluencer.image_url && !uploadedFile)}
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
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Influencer Selector Modal for Phase 3 */}
      <Dialog open={showInfluencerSelectorModal} onOpenChange={setShowInfluencerSelectorModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Select Influencer for Content Creation
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
              Choose an influencer to use for generating exclusive content
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {influencers.length === 0 ? (
              <div className="text-center py-12">
                <Circle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                <p className="text-slate-600 dark:text-slate-400">No influencers found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {influencers.map((influencer) => (
                  <Card
                    key={influencer.id}
                    onClick={() => handleInfluencerSelection(influencer)}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-300 dark:hover:border-purple-600 bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-800/50 dark:to-slate-700/50"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Profile Image */}
                        <div className="relative">
                          <div className="w-full aspect-square bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500 rounded-xl overflow-hidden shadow-md">
                            {influencer.image_url ? (
                              <img
                                src={influencer.image_url}
                                alt={`${influencer.name_first} ${influencer.name_last}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Circle className="w-8 h-8 text-slate-400" />
                              </div>
                            )}
                          </div>
                          {influencer.lorastatus === 2 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Influencer Info */}
                        <div className="text-center space-y-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {influencer.name_first} {influencer.name_last}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {influencer.influencer_type || 'AI Influencer'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Created: {formatDate(influencer.created_at)}
                          </p>
                          <div className="flex items-center justify-center gap-1">
                            {influencer.lorastatus === 2 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                LoRA Trained
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Ready for Training
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 