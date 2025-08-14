import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';
import { selectLatestTrainedInfluencer, selectLatestGeneratedInfluencer, setInfluencers, setError, setLoading } from '@/store/slices/influencersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Circle, Play, Star, AlertTriangle, Brain, Copy, Upload, X, FileImage, FileVideo, Palette, RefreshCw, Zap, Sparkles, FolderOpen, Volume2 } from 'lucide-react';
import InstructionVideo from '@/components/InstructionVideo';
import { getInstructionVideoConfig } from '@/config/instructionVideos';
import { toast } from 'sonner';
import axios from 'axios';
import config from '@/config/config';

export default function Start() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const { influencers } = useSelector((state: RootState) => state.influencers);

  // Get latest generated influencer with lorastatus === 0
  const latestGeneratedInfluencerWithLora0 = useMemo(() => {
    const influencersWithLora0 = influencers.filter(inf => inf.lorastatus === 0);
    if (influencersWithLora0.length === 0) return null;

    return influencersWithLora0.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    })[0];
  }, [influencers]);

  // console.log('Influencers:', influencers);

  const currentPhase = userData.guide_step;
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showPhase2Modal, setShowPhase2Modal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showInfluencerSelectorModal, setShowInfluencerSelectorModal] = useState(false);
  const [showPhase2InfluencerSelectorModal, setShowPhase2InfluencerSelectorModal] = useState(false);
  const [showPhase3CreationModal, setShowPhase3CreationModal] = useState(false);
  const [showPhase4LibraryModal, setShowPhase4LibraryModal] = useState(false);
  const [blinkState, setBlinkState] = useState(false);

  // Check localStorage for guide_step
  const [localGuideStep, setLocalGuideStep] = useState<number>(() => {
    const stored = localStorage.getItem('guide_step');
    return stored ? parseInt(stored, 10) : currentPhase;
  });

  // LoRA Training Modal States
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);

  // Phase 2 and Phase 3 selected influencer state
  const [selectedPhase2Influencer, setSelectedPhase2Influencer] = useState<any>(null);
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
  // Sync localStorage with current guide_step
  useEffect(() => {
    if (currentPhase !== localGuideStep) {
      setLocalGuideStep(currentPhase);
      localStorage.setItem('guide_step', currentPhase.toString());
    }
  }, [currentPhase, localGuideStep]);

  useEffect(() => {
    const fetchInfluencers = async () => {
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
        dispatch(setInfluencers(data));
      } catch (error) {
        dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchInfluencers();
  }, [dispatch, userData.id]);

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
      title: "Phase 2: AI Consistency",
      description: "Make sure your influencer looks the same in every image and video",
      completed: currentPhase > 2,
      icon: currentPhase > 2 ? CheckCircle : Circle,
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      isPending: currentPhase === 2,
      showProgress: currentPhase === 2,
      progressMessage: "This step takes about 30–60 minutes. You can keep working on other tasks while we train your AI."
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
      navigate('/influencers/new');
    } else if (currentPhase === 2) {
      setShowPhase2Modal(true);
    } else if (currentPhase === 3) {
      // Show creation options modal for Phase 3
      setShowPhase3CreationModal(true);
    } else if (currentPhase === 4) {
      // Show library options modal for Phase 4
      setShowPhase4LibraryModal(true);
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
        return "Start Phase 2 - AI Consistency";
      case 3:
        return "Start Phase 3 - Generate Exclusive Content";
      case 4:
        return "Start Phase 4 - Organize your Content";
      default:
        return "Start Your Journey";
    }
  };

  const handlePhaseClick = async (phaseId: number) => {
    try {
      // Fetch current guide_step from database
      const response = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userDataFromDB = await response.json();
      const currentGuideStep = userDataFromDB[0]?.guide_step || 0;

      // Check if user is trying to access a phase higher than their current guide_step
      if (phaseId > currentGuideStep) {
        toast.error(`Cannot access Phase ${phaseId}`, {
          description: `You need to complete the previous phases first. Your current progress is Phase ${currentGuideStep}.`
        });
        return;
      }

      // Special handling for Phase 2 - show modal with the influencer from right side
      if (phaseId === 2) {
        if (latestGeneratedInfluencerWithLora0) {
          setSelectedPhase2Influencer(latestGeneratedInfluencerWithLora0);
          setShowPhase2Modal(true);
        } else {
          toast.error('No influencers available for Phase 2', {
            description: 'Please create an influencer first before starting Phase 2.'
          });
        }
        return;
      }

      // Update the current phase in Redux store
      dispatch(setUser({ guide_step: phaseId }));

      // Show success message
      toast.success(`Phase ${phaseId} activated!`, {
        description: `You are now on ${phases.find(p => p.id === phaseId)?.title}`
      });
    } catch (error) {
      console.error('Failed to fetch user guide_step:', error);
      toast.error('Failed to verify phase access');
    }
  };

  const handleContinueWork = () => {
    // If localStorage guide_step > 2, navigate to that step
    if (localGuideStep > 2) {
      // Update the user's guide_step in Redux and localStorage
      dispatch(setUser({ guide_step: localGuideStep }));
      localStorage.setItem('guide_step', localGuideStep.toString());

      // Navigate to the appropriate step
      if (localGuideStep === 3) {
        // Show Phase 3 creation modal instead of directly navigating
        setShowPhase3CreationModal(true);
      } else if (localGuideStep === 4) {
        navigate('/create/optimizer');
      } else {
        // Default to content creation for any step > 2
        setShowPhase3CreationModal(true);
      }
    } else {
      // Original logic for phase 2
      setShowWarningModal(true);
    }
  };

  const handleConfirmContinueWork = async () => {
    try {
      const response = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
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

  const handlePhase2InfluencerSelection = (influencer: any) => {
    setSelectedPhase2Influencer(influencer);
    setShowPhase2InfluencerSelectorModal(false);
    setShowPhase2Modal(true);
  };

  const handleCopyProfileImage = async () => {
    const trainingInfluencer = selectedPhase2Influencer || latestGeneratedInfluencerWithLora0;
    if (!trainingInfluencer) return;

    setIsCopyingImage(true);
    try {
      if (uploadedFile) {
        // Upload the image directly to the LoRA folder
        const loraFilePath = `models/${trainingInfluencer.id}/loratraining/${uploadedFile.name}`;

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
            modelid: trainingInfluencer.id,
            inputimage: `/models/${trainingInfluencer.id}/loratraining/${uploadedFile.name}`,
          })
        });

        toast.success('Image uploaded for AI consistency training successfully');
      } else {
        // Copy existing profile picture to LoRA folder
        const latestImageNum = trainingInfluencer.image_num - 1;

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
            modelid: trainingInfluencer.id,
            inputimage: `/models/${trainingInfluencer.id}/profilepic/profilepic${latestImageNum}.png`,
          })
        });

        toast.success('Profile image selected successfully for AI consistency training');
      }

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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-5">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Start
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center md:text-left">
            Welcome to your AI influencer journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {/* Left Side - Main Card */}
        <div className="w-full">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 shadow-2xl grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3">
            <CardContent className="p-4 sm:p-6 lg:p-8 lg:col-span-3 xl:col-span-2">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Let's launch your AI Influencer
                  </h2>
                  <p className="text-base sm:text-lg text-slate-300">
                    All you need is 4 simple steps – start with Phase 1 below.
                  </p>
                </div>

                {/* Phases List */}
                <div className="space-y-3 sm:space-y-4">
                  {phases.map((phase) => (
                    <div
                      key={phase.id}
                      onClick={() => handlePhaseClick(phase.id)}
                      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg ${phase.completed
                        ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30 hover:border-green-400/50'
                        : phase.isPending
                          ? `bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-500/30 hover:border-blue-400/50 ${blinkState ? 'opacity-100' : 'opacity-50'}`
                          : 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30 hover:border-slate-500/50'
                        }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${phase.color} flex items-center justify-center shadow-lg transition-opacity duration-300 ${phase.isPending ? (blinkState ? 'opacity-100' : 'opacity-50') : ''
                        }`}>
                        <phase.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h3 className={`text-base sm:text-lg font-semibold transition-opacity duration-300 ${phase.completed ? 'text-green-400' : phase.isPending ? (blinkState ? 'text-blue-400' : 'text-blue-600') : 'text-slate-300'
                          }`}>
                          {phase.title}
                        </h3>
                        <p className="text-sm text-slate-400 break-words">
                          {phase.description}
                        </p>

                        {/* Progress Indicator for Phase 2 */}
                        {phase.showProgress && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-blue-400">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>Queued</span>
                              </div>
                              <div className="flex-1 h-0.5 bg-slate-600/30 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '33%' }}></div>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                <span className="text-slate-500">Training</span>
                              </div>
                              <div className="flex-1 h-0.5 bg-slate-600/30 rounded-full">
                                <div className="h-full bg-slate-500 rounded-full" style={{ width: '0%' }}></div>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                <span className="text-slate-500">Done</span>
                              </div>
                            </div>
                            <p className="text-xs text-blue-300 italic">
                              {phase.progressMessage}
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  ))}
                </div>

                {/* Call to Action Button */}
                <div className="pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <Button
                    onClick={handleCreateInfluencer}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {getButtonText()}
                  </Button>

                  {/* Continue my work button for Phase 2 and 3 */}
                  {(currentPhase === 2 || localGuideStep > 2) && (
                    <Button
                      onClick={handleContinueWork}
                      variant="outline"
                      disabled={currentPhase === 2 && !latestGeneratedInfluencerWithLora0}
                      className={`w-full sm:w-auto font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-xl transition-all duration-300 transform ${(currentPhase === 2 && !latestGeneratedInfluencerWithLora0)
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-400 border-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-2xl hover:scale-105 border-green-500'
                        }`}
                    >
                      {currentPhase === 3 ? 'Continue Creating Content' : 'Continue my work'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <div className="lg:col-span-2 xl:col-span-1 w-full h-full flex flex-col items-center justify-center p-4 lg:p-0">
              {currentPhase === 2 ? (
                // Always show latest generated influencer with lorastatus === 0
                (() => {
                  const displayInfluencer = latestGeneratedInfluencerWithLora0;

                  if (!displayInfluencer) {
                    return (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600/30 flex items-center justify-center">
                          <div className="text-slate-400">
                            <Circle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">No influencers found</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col items-center justify-center">
                      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-600/50 shadow-2xl w-48 sm:w-56 lg:w-64">
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
                              {displayInfluencer.lorastatus === 0 && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Brain className="w-4 h-4 text-white" />
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
                              <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Ready for AI Consistency
                              </div>
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
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600/30 flex items-center justify-center">
                          <div className="text-slate-400">
                            <Circle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">No influencers found</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-600/50 shadow-2xl w-48 sm:w-56 lg:w-64">
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
                                  AI Consistency Trained
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
                By proceeding without AI consistency training, your influencer may look different in each generated image and video.
              </p>
              <p className="text-sm text-slate-400">
                AI consistency training ensures your influencer looks the same in every piece of content, creating a more professional and recognizable brand.
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
        <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
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
                Choose how you'd like to proceed with AI consistency training
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Influencer Card */}
            {(() => {
              const displayInfluencer = selectedPhase2Influencer || latestGeneratedInfluencerWithLora0;

              if (!displayInfluencer) {
                return (
                  <div className="text-center py-8">
                    <Circle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                    <p className="text-slate-600 dark:text-slate-400">No influencers found</p>
                  </div>
                );
              }

              return (
                <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-600/50 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Profile Image */}
                      <div className="relative">
                        <div className="w-full aspect-square bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl overflow-hidden shadow-xl">
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
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Influencer Info */}
                      <div className="text-center space-y-3">
                        <h3 className="text-xl font-bold text-white">
                          {displayInfluencer.name_first} {displayInfluencer.name_last}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {displayInfluencer.influencer_type || 'AI Influencer'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Created: {formatDate(displayInfluencer.created_at)}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Ready for AI consistency training
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Progress Indicator */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-600 dark:text-blue-400 italic">
                This step takes about 30–60 minutes. You can keep working on other tasks while we train your AI.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowPhase2Modal(false);
                  setShowTrainingModal(true);
                }}
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-0"
              >
                <Brain className="w-5 h-5 mr-3" />
                Continue work
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPhase2Modal(false);
                  setShowPhase2InfluencerSelectorModal(true);
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
            const trainingInfluencer = selectedPhase2Influencer || latestGeneratedInfluencerWithLora0;
            if (!trainingInfluencer) return null;

            return (
              <div className="p-6 space-y-8">
                {/* Influencer Info Card */}
                <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
                          <img
                            src={trainingInfluencer.image_url}
                            alt={trainingInfluencer.name_first}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <Copy className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {trainingInfluencer.name_first} {trainingInfluencer.name_last}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          Latest profile picture • Version {trainingInfluencer.image_num === null || trainingInfluencer.image_num === undefined || isNaN(trainingInfluencer.image_num) ? 0 : trainingInfluencer.image_num - 1}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Character Consistency
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            AI Consistency Training
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
                                src={trainingInfluencer.image_url}
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
                              Version {trainingInfluencer.image_num === null || trainingInfluencer.image_num === undefined || isNaN(trainingInfluencer.image_num) || trainingInfluencer.image_num === 0 ? 0 : trainingInfluencer.image_num - 1} • High Quality
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
                          This action will copy the selected profile picture for AI consistency training,
                          ensuring your influencer looks the same in every generated image and video. The image will be
                          used as a reference for maintaining consistent visual characteristics.
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
                                AI Consistency Trained
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

      {/* Phase 2 Influencer Selector Modal */}
      <Dialog open={showPhase2InfluencerSelectorModal} onOpenChange={setShowPhase2InfluencerSelectorModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Select Influencer for AI consistency training
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
              Choose an influencer that needs AI consistency training
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {(() => {
              const availableInfluencers = influencers.filter(inf => inf.lorastatus === 0);

              if (availableInfluencers.length === 0) {
                return (
                  <div className="text-center py-12">
                    <Circle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                    <p className="text-slate-600 dark:text-slate-400">No influencers available for training</p>
                    <p className="text-sm text-slate-500 mt-2">All influencers have already been trained or are in training</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableInfluencers.map((influencer) => (
                    <Card
                      key={influencer.id}
                      onClick={() => handlePhase2InfluencerSelection(influencer)}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300 dark:hover:border-blue-600 bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-800/50 dark:to-slate-700/50"
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
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
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
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Ready for Training
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 3 Creation Options Modal */}
      <Dialog open={showPhase3CreationModal} onOpenChange={setShowPhase3CreationModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Generate Exclusive Content
              </DialogTitle>
              <DialogDescription className="text-lg text-purple-100 leading-relaxed max-w-2xl mx-auto">
                Choose your preferred content creation method. Each option offers unique capabilities to bring your AI influencer to life.
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Influencer Info Card */}
            {(() => {
              const displayInfluencer = selectedPhase3Influencer || latestTrainedInfluencer;

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Images */}
              <Card
                onClick={() => {
                  const influencerToUse = selectedPhase3Influencer || latestTrainedInfluencer;
                  setShowPhase3CreationModal(false);
                  if (influencerToUse) {
                    navigate('/create/images', { state: { influencerData: influencerToUse } });
                  } else {
                    navigate('/create/images');
                  }
                }}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-purple-300 dark:hover:border-purple-600 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800/50 dark:to-purple-900/20"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FileImage className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Generate Images
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
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
                  const influencerToUse = selectedPhase3Influencer || latestTrainedInfluencer;
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
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowPhase3CreationModal(false)}
                className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowPhase3CreationModal(false);
                  setShowInfluencerSelectorModal(true);
                }}
                className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-3" />
                Select Another Influencer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 4 Library Options Modal */}
      <Dialog open={showPhase4LibraryModal} onOpenChange={setShowPhase4LibraryModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-8 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl">
                <FolderOpen className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Organize Your Content
              </DialogTitle>
              <DialogDescription className="text-lg text-orange-100 leading-relaxed max-w-2xl mx-auto">
                Choose a library to organize and manage your generated content. Keep your AI influencer's assets well-organized for easy access.
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Library Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FileImage className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Images Library
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
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
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <FileVideo className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Videos Library
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
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
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Volume2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Audios Library
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
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
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowPhase4LibraryModal(false)}
                className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FolderOpen className="w-5 h-5 mr-3" />
                Go to Images Library (Default)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 