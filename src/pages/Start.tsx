import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setUser } from "@/store/slices/userSlice";
import {
  selectLatestTrainedInfluencer,
  selectLatestGeneratedInfluencer,
  setInfluencers,
  setError,
  setLoading,
  updateInfluencer,
} from "@/store/slices/influencersSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Circle,
  Play,
  Star,
  AlertTriangle,
  Brain,
  Copy,
  Upload,
  X,
  FileImage,
  FileVideo,
  Palette,
  RefreshCw,
  Zap,
  Sparkles,
  FolderOpen,
  Volume2,
  User,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import InstructionVideo from "@/components/InstructionVideo";
import { getInstructionVideoConfig } from "@/config/instructionVideos";
import { toast } from "sonner";
import axios from "axios";
import config from "@/config/config";
import { motion } from "framer-motion";

export default function Start() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const { influencers } = useSelector((state: RootState) => state.influencers);

  // Get latest generated influencer with lorastatus === 0
  const latestGeneratedInfluencerWithLora0 = useMemo(() => {
    const influencersWithLora0 = influencers.filter(
      (inf) => inf.lorastatus === 0,
    );
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
  const [showInfluencerSelectorModal, setShowInfluencerSelectorModal] =
    useState(false);
  const [
    showPhase2InfluencerSelectorModal,
    setShowPhase2InfluencerSelectorModal,
  ] = useState(false);
  const [showPhase3CreationModal, setShowPhase3CreationModal] = useState(false);
  const [showPhase4LibraryModal, setShowPhase4LibraryModal] = useState(false);
  const [showCharacterConsistencyModal, setShowCharacterConsistencyModal] = useState(false);
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [showPhase2InfluencerSelector, setShowPhase2InfluencerSelector] = useState(false);
  const [showActiveInfluencerSelector, setShowActiveInfluencerSelector] = useState(false);
  const [showCostWarningModal, setShowCostWarningModal] = useState(false);
  const [gemCostData, setGemCostData] = useState<any>(null);
  const [blinkState, setBlinkState] = useState(false);
  const [showNymiaGoModal, setShowNymiaGoModal] = useState(false);
  const [isTrainingPolling, setIsTrainingPolling] = useState(false);

  // Check localStorage for guide_step
  const [localGuideStep, setLocalGuideStep] = useState<number>(() => {
    const stored = localStorage.getItem("guide_step");
    return stored ? parseInt(stored, 10) : currentPhase;
  });

  // LoRA Training Modal States
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);

  // Phase 2 and Phase 3 selected influencer state
  const [selectedPhase2Influencer, setSelectedPhase2Influencer] = useState<any>(null);
  const [selectedPhase3Influencer, setSelectedPhase3Influencer] = useState<any>(null);

  // Initialize selectedPhase2Influencer with latestGeneratedInfluencerWithLora0 only once
  useEffect(() => {
    // Check if there's a newly created influencer from the wizard
    const newlyCreatedId = localStorage.getItem('newly_created_influencer_id');
    
    if (newlyCreatedId) {
      // Find the newly created influencer
      const newlyCreatedInfluencer = influencers.find(inf => inf.id.toString() === newlyCreatedId);
      if (newlyCreatedInfluencer) {
        setSelectedPhase2Influencer(newlyCreatedInfluencer);
        
        // Auto-jump to Phase 2 when coming from wizard
        const isComingFromWizard = localStorage.getItem('coming_from_wizard');
        if (isComingFromWizard === 'true') {
          dispatch(setUser({ guide_step: 2 }));
          localStorage.removeItem('coming_from_wizard');
          
          toast.success('Phase 2 activated!', {
            description: 'You are now on Lock the Look with your newly created influencer'
          });
        }
        
        localStorage.removeItem('newly_created_influencer_id'); // Clean up
        return;
      }
    }
    
    // Fall back to latest generated influencer if no newly created one or not found
    if (latestGeneratedInfluencerWithLora0 && !selectedPhase2Influencer) {
      setSelectedPhase2Influencer(latestGeneratedInfluencerWithLora0);
    }
  }, [latestGeneratedInfluencerWithLora0, influencers, dispatch]); // Add dispatch to dependencies

  // Handler for Phase 2 influencer selection
  const handlePhase2InfluencerSelection = async (influencer: any) => {
    setSelectedPhase2Influencer(influencer);
    setShowPhase2InfluencerSelector(false);

    // If user is in Phase 3 or 4 and selects an influencer with lorastatus !== 2, move back to Phase 2
    if ((currentPhase === 3 || currentPhase === 4) && influencer.lorastatus !== 2) {
      try {
        // Update local state immediately
        setLocalGuideStep(2);
        localStorage.setItem("guide_step", "2");

        // Update backend if user is logged in
        if (userData.id) {
          const response = await fetch(
            `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer WeInfl3nc3withAI",
                Prefer: "return=representation",
              },
              body: JSON.stringify({
                guide_step: 2,
              }),
            }
          );

          if (response.ok) {
            const updatedUser = await response.json();
            if (updatedUser && updatedUser[0]) {
              dispatch(setUser(updatedUser[0]));
            }
          }
        }

        toast.info("Moved back to Phase 2 because selected influencer needs AI Consistency Training");
      } catch (error) {
        console.error("Error updating user phase:", error);
      }
    }
  };

  // Cost checking function for LoRA training
  const checkGemCost = async () => {
    try {
      // Try to fetch pricing from API
      const response = await fetch(`${config.backend_url}/pricing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer WeInfl3nc3withAI`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: "nymia_lora"
        })
      });

      let gemCost = 50; // Default cost for LoRA training
      
      if (response.ok) {
        const costData = await response.json();
        // API returns { gems: 55 }, convert to our format
        const formattedCostData = {
          gem_cost: costData.gems || 50,
          product_name: "AI Consistency Training",
          description: "Character consistency training for your AI influencer"
        };
        setGemCostData(formattedCostData);
        gemCost = costData.gems || 50;
      } else {
        // API endpoint not available, use default cost
        console.log('Pricing API not available, using default cost');
        const defaultCostData = {
          gem_cost: 50,
          product_name: "AI Consistency Training",
          description: "Character consistency training for your AI influencer"
        };
        setGemCostData(defaultCostData);
      }
      
      const currentCredits = userData.credits || 0;
      
      // Check if user has enough credits
      if (currentCredits < gemCost) {
        toast.error(`Insufficient credits! You need ${gemCost} gems but only have ${currentCredits} gems.`, {
          description: "Please purchase more gems to continue with AI consistency training."
        });
        return false;
      }
      
      // Show cost confirmation modal if there's a cost
      if (gemCost > 0) {
        setShowCostWarningModal(true);
        return false; // Wait for user confirmation
      } else {
        return true; // Proceed with training (free)
      }
    } catch (error) {
      console.error('Error checking gem cost:', error);
      // Fallback to default cost even on network error
      const defaultCostData = {
        gem_cost: 50,
        product_name: "AI Consistency Training",
        description: "Character consistency training for your AI influencer"
      };
      setGemCostData(defaultCostData);
      
      const currentCredits = userData.credits || 0;
      if (currentCredits < 50) {
        toast.error(`Insufficient credits! You need 50 gems but only have ${currentCredits} gems.`, {
          description: "Please purchase more gems to continue with AI consistency training."
        });
        return false;
      }
      
      setShowCostWarningModal(true);
      return false;
    }
  };

  // Handle training start with cost check
  const handleStartTraining = async () => {
    const canProceed = await checkGemCost();
    if (canProceed) {
      startTraining();
    }
  };

  // Start training function
  const startTraining = async () => {
    if (!selectedPhase2Influencer) {
      toast.error("No influencer selected for training");
      return;
    }

    // Final check for sufficient credits
    const gemCost = gemCostData?.gem_cost || 50;
    const currentCredits = userData.credits || 0;
    
    if (currentCredits < gemCost) {
      toast.error(`Insufficient credits! You need ${gemCost} gems but only have ${currentCredits} gems.`);
      setShowCostWarningModal(false);
      setShowCharacterConsistencyModal(false);
      return;
    }

    setShowCharacterConsistencyModal(false);
    setShowCostWarningModal(false);
    
    try {
      const useridResponse = await fetch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        },
      );

      const useridData = await useridResponse.json();

      // Start LoRA training for the selected influencer
      await fetch(
        `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createlora`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            task: "createlora",
            fromsingleimage: true,
            modelid: selectedPhase2Influencer.id,
            inputimage: `/models/${selectedPhase2Influencer.id}/profilepic/profilepic${selectedPhase2Influencer.image_num - 1}.png`,
          }),
        },
      );

      toast.success("AI Consistency Training Started!", {
        description: `Training has begun for ${selectedPhase2Influencer.name_first}. This will take about 30 minutes.`
      });

      // Update influencer lorastatus to 1 (processing) and start polling
      try {
        const influencerUpdateResponse = await fetch(
          `${config.supabase_server_url}/influencer?id=eq.${selectedPhase2Influencer.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: JSON.stringify({ lorastatus: 1 }),
          },
        );
        
        if (influencerUpdateResponse.ok) {
          // Update local state to show processing status
          setSelectedPhase2Influencer({
            ...selectedPhase2Influencer,
            lorastatus: 1
          });
          
          // Update Redux store with updated influencer
          dispatch(updateInfluencer({
            ...selectedPhase2Influencer,
            lorastatus: 1
          }));
          
          // Start polling for training status
          setIsTrainingPolling(true);
          startTrainingStatusPolling(selectedPhase2Influencer.id);
        }
      } catch (error) {
        console.error("Failed to update influencer status:", error);
      }
    } catch (error) {
      console.error("Failed to start training:", error);
      toast.error("Failed to start training. Please try again.");
    }
  };

  useEffect(() => {
    const checkSubscription = async () => {
      let credits = userData.credits;
      const subscription = userData.subscription;
      if (subscription === "enterprise" && credits > 300) {
        credits = 300;
      } else if (subscription === "professional" && credits > 200) {
        credits = 200;
      } else if (subscription === "starter" && credits > 100) {
        credits = 100;
      }
      if (
        userData.billing_date <= Date.now() &&
        userData.subscription !== "free"
      ) {
        try {
          const response = await axios.patch(
            `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
            JSON.stringify({
              subscription: "free",
              billing_date: 0,
              free_purchase: true,
              credits: credits,
            }),
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer WeInfl3nc3withAI`,
              },
            },
          );
          return response.data;
        } catch (error) {
          console.error("Subscription update failed:", error);
          throw error;
        }
      } else if (
        userData.billing_date > Date.now() &&
        userData.subscription !== "free" &&
        userData.billed_date + 1 * 30 * 24 * 60 * 60 * 1000 >= Date.now()
      ) {
        try {
          const response = await axios.patch(
            `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
            JSON.stringify({
              billed_date: userData.billed_date + 1 * 30 * 24 * 60 * 60 * 1000,
              credits: credits,
            }),
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer WeInfl3nc3withAI`,
              },
            },
          );
          return response.data;
        } catch (error) {
          console.error("Subscription update failed:", error);
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
      localStorage.setItem("guide_step", currentPhase.toString());
    }
  }, [currentPhase, localGuideStep]);

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch(
          `${config.supabase_server_url}/influencer?user_id=eq.${userData.id}`,
          {
            headers: {
              Authorization: "Bearer WeInfl3nc3withAI",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch influencers");
        }

        const data = await response.json();
        dispatch(setInfluencers(data));
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error ? error.message : "An error occurred",
          ),
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    // Always fetch influencers when the component loads
    if (userData.id) {
      fetchInfluencers();
    }
  }, [dispatch, userData.id]);

  // Utility function to safely parse dates
  const parseDate = (dateString: string | null | undefined): number => {
    if (!dateString) return 0;

    try {
      // Handle different date formats that might come from the database
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    } catch (error) {
      console.warn("Error parsing date:", dateString, error);
      return 0;
    }
  };

  // Utility function to format dates for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.warn("Error formatting date:", dateString, error);
      return "Unknown";
    }
  };

  // Custom blinking animation: blink 3 times, wait, then loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState((prev) => !prev);
    }, 4000); // Blink every 4 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Debug: Log influencer data structure when influencers change
  useEffect(() => {
    if (influencers.length > 0) {
      console.log("Influencers data structure:", {
        count: influencers.length,
        sample: influencers[0],
        hasCreatedAt: influencers[0]?.created_at,
        hasUpdatedAt: influencers[0]?.updated_at,
        createdAtType: typeof influencers[0]?.created_at,
        updatedAtType: typeof influencers[0]?.updated_at,
      });
    }
  }, [influencers]);

  const phases = [
    {
      id: 1,
      phase: "Phase 1",
      title: "Create Influencer",
      description: "Set name, visuals, and backstory with guided prompts.",
      time: "Avg. setup: ~10 minutes.",
      icon: User,
      imageSrc: "/phase1.png",
      completed: currentPhase > 1,
      isPending: currentPhase === 1,
    },
    {
      id: 2,
      phase: "Phase 2",
      title: "Lock the Look",
      description: "We handle training automatically — no settings, no jargon.",
      time: "Runs ~30 minutes in the background.",
      icon: Brain,
      imageSrc: "/phase2.png",
      completed: currentPhase > 2 && selectedPhase2Influencer?.lorastatus === 2,
      isPending: currentPhase === 2 && (!selectedPhase2Influencer || selectedPhase2Influencer.lorastatus !== 1),
      isProcessing: currentPhase === 2 && selectedPhase2Influencer?.lorastatus === 1,
      showProgress: currentPhase === 2 && selectedPhase2Influencer?.lorastatus === 1,
      progressMessage:
        "This step takes about 30–60 minutes. You can keep working on other tasks while we train your AI.",
    },
    {
      id: 3,
      phase: "Phase 3",
      title: "Create Content",
      description:
        "Produce images, videos, audio and LipSync videos using curated templates or by using your own prompts.",
      time: "Ready‑to‑post packs for Instagram & Fanvue.",
      icon: ImageIcon,
      imageSrc: "/phase3.png",
      completed: currentPhase > 3,
      isPending: currentPhase === 3,
      disabled: !selectedPhase2Influencer || selectedPhase2Influencer.lorastatus !== 2,
    },
    {
      id: 4,
      phase: "Phase 4",
      title: "Publish",
      description:
        "Sort by series, prepare Fanvue PPV sets, export IG carousels, and queue ideas.",
      time: "Downloads available on paid plans.",
      icon: FolderOpen,
      imageSrc: "/phase4.png",
      completed: currentPhase > 4,
      isPending: currentPhase === 4,
      disabled: !selectedPhase2Influencer || selectedPhase2Influencer.lorastatus !== 2,
    },
  ];

  // Use Redux selectors for getting latest influencers
  const latestTrainedInfluencer = useSelector(selectLatestTrainedInfluencer);
  const latestGeneratedInfluencer = useSelector(
    selectLatestGeneratedInfluencer,
  );

  const handleCreateInfluencer = async () => {
    if (currentPhase === 0) {
      navigate("/dashboard");
    } else if (currentPhase === 1) {
      navigate("/influencers/new");
    } else if (currentPhase === 2) {
      setShowPhase2Modal(true);
    } else if (currentPhase === 3) {
      // Show creation options modal for Phase 3
      setShowPhase3CreationModal(true);
    } else if (currentPhase === 4) {
      // Show library options modal for Phase 4
      setShowPhase4LibraryModal(true);
    } else {
      navigate("/dashboard");
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
    // Check if Phase 3 or 4 is clicked without trained influencer
    if ((phaseId === 3 || phaseId === 4) && (!selectedPhase2Influencer || selectedPhase2Influencer.lorastatus !== 2)) {
      toast.error("Phase 3 and 4 require a trained influencer with AI Consistency Training completed", {
        description: "Please complete Phase 2 first or select a trained influencer"
      });
      return;
    }

    try {
      // Fetch current guide_step from database
      const response = await fetch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userDataFromDB = await response.json();
      const currentGuideStep = userDataFromDB[0]?.guide_step || 0;

      // Check if user is trying to access a phase higher than their current guide_step
      // Allow Phase 3 always, Phase 4 only if user has completed Phase 3
      if (phaseId > currentGuideStep && !(phaseId === 3 || (phaseId === 4 && currentGuideStep >= 3))) {
        toast.error(`Cannot access Phase ${phaseId}`, {
          description: `You need to complete the previous phases first. Your current progress is Phase ${currentGuideStep}.`,
        });
        return;
      }

      // Phase 2 - just activate the phase, no modal
      if (phaseId === 2) {
        if (!latestGeneratedInfluencerWithLora0) {
          toast.error("No influencers available for Phase 2", {
            description:
              "Please create an influencer first before starting Phase 2.",
          });
          return;
        }
        // Directly activate Phase 2
        dispatch(setUser({ guide_step: 2 }));
        toast.success(`Phase 2 activated!`, {
          description: `You are now on Lock the Look`,
        });
        return;
      }

      // Update the current phase in Redux store
      dispatch(setUser({ guide_step: phaseId }));

      // Show success message
      toast.success(`Phase ${phaseId} activated!`, {
        description: `You are now on ${phases.find((p) => p.id === phaseId)?.title}`,
      });
    } catch (error) {
      console.error("Failed to fetch user guide_step:", error);
      toast.error("Failed to verify phase access");
    }
  };

  const handleContinueWork = () => {
    // If localStorage guide_step > 2, navigate to that step
    if (localGuideStep > 2) {
      // Update the user's guide_step in Redux and localStorage
      dispatch(setUser({ guide_step: localGuideStep }));
      localStorage.setItem("guide_step", localGuideStep.toString());

      // Navigate to the appropriate step
      if (localGuideStep === 3) {
        // Show Phase 3 creation modal instead of directly navigating
        setShowPhase3CreationModal(true);
      } else if (localGuideStep === 4) {
        navigate("/create/optimizer");
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
      const response = await fetch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            guide_step: 3,
          }),
        },
      );

      if (response.ok) {
        dispatch(setUser({ guide_step: 3 }));
        toast.success("Progress updated! Moving to Phase 3...");
        setShowWarningModal(false);
        
        // Pass the selected influencer to content creation
        if (selectedPhase2Influencer) {
          navigate("/create/images", { 
            state: { 
              selectedInfluencer: selectedPhase2Influencer 
            } 
          });
        } else {
          navigate("/create/images");
        }
      } else {
        toast.error("Failed to update progress");
      }
    } catch (error) {
      console.error("Failed to update guide_step:", error);
      toast.error("Failed to update progress");
    }
  };

  // LoRA Training Modal Functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
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
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
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
    const trainingInfluencer =
      selectedPhase2Influencer || latestGeneratedInfluencerWithLora0;
    if (!trainingInfluencer) return;

    setIsCopyingImage(true);
    try {
      if (uploadedFile) {
        // Upload the image directly to the LoRA folder
        const loraFilePath = `models/${trainingInfluencer.id}/loratraining/${uploadedFile.name}`;

        // Upload file directly to LoRA folder
        const uploadResponse = await fetch(
          `${config.backend_url}/uploadfile?user=${userData.id}&filename=${loraFilePath}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: uploadedFile,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image to LoRA folder");
        }

        const useridResponse = await fetch(
          `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer WeInfl3nc3withAI",
            },
          },
        );

        const useridData = await useridResponse.json();

        await fetch(
          `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createlora`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: JSON.stringify({
              task: "createlora",
              fromsingleimage: false,
              modelid: trainingInfluencer.id,
              inputimage: `/models/${trainingInfluencer.id}/loratraining/${uploadedFile.name}`,
            }),
          },
        );

        toast.success(
          "Image uploaded for AI consistency training successfully",
        );
      } else {
        // Copy existing profile picture to LoRA folder
        const latestImageNum = trainingInfluencer.image_num - 1;

        const useridResponse = await fetch(
          `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer WeInfl3nc3withAI",
            },
          },
        );

        const useridData = await useridResponse.json();

        await fetch(
          `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createlora`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: JSON.stringify({
              task: "createlora",
              fromsingleimage: true,
              modelid: trainingInfluencer.id,
              inputimage: `/models/${trainingInfluencer.id}/profilepic/profilepic${latestImageNum}.png`,
            }),
          },
        );

        toast.success(
          "Profile image selected successfully for AI consistency training",
        );
      }

      // Set LoRA training status to indicate processing
      if (selectedPhase2Influencer) {
        try {
          // Update influencer lorastatus to 1 (processing)
          const influencerUpdateResponse = await fetch(
            `${config.supabase_server_url}/influencer?id=eq.${selectedPhase2Influencer.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer WeInfl3nc3withAI",
              },
              body: JSON.stringify({ lorastatus: 1 }),
            },
          );
          
          if (influencerUpdateResponse.ok) {
            // Update local state to show processing status
            setSelectedPhase2Influencer({
              ...selectedPhase2Influencer,
              lorastatus: 1
            });
            
            // Update Redux store with updated influencer
            dispatch(updateInfluencer({
              ...selectedPhase2Influencer,
              lorastatus: 1
            }));
            
            toast.success(`Starting training for ${selectedPhase2Influencer.name_first} ${selectedPhase2Influencer.name_last}`);
            
            // Start polling for training status
            setIsTrainingPolling(true);
            startTrainingStatusPolling(selectedPhase2Influencer.id);
          }
        } catch (error) {
          console.error("Failed to update influencer status:", error);
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
      console.error("Error copying profile image:", error);
      toast.error("Failed to copy profile image");
    } finally {
      setIsCopyingImage(false);
    }
  };

  // Training status polling function
  const startTrainingStatusPolling = (influencerId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `${config.supabase_server_url}/influencer?id=eq.${influencerId}`,
          {
            headers: {
              Authorization: "Bearer WeInfl3nc3withAI",
            },
          }
        );
        
        if (response.ok) {
          const influencerData = await response.json();
          if (influencerData && influencerData[0]) {
            const updatedInfluencer = influencerData[0];
            
            // Update Redux store
            dispatch(updateInfluencer(updatedInfluencer));
            
            // Update local state
            setSelectedPhase2Influencer(updatedInfluencer);
            
            // Check if training is complete
            if (updatedInfluencer.lorastatus === 2) {
              // Training completed successfully
              setIsTrainingPolling(false);
              clearInterval(pollInterval);
              
              // Update user's guide_step to 3
              try {
                const guideStepResponse = await fetch(
                  `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: "Bearer WeInfl3nc3withAI",
                    },
                    body: JSON.stringify({ guide_step: 3 }),
                  }
                );
                
                if (guideStepResponse.ok) {
                  dispatch(setUser({ guide_step: 3 }));
                  toast.success(`Training completed for ${updatedInfluencer.name_first}! Moving to Phase 3...`);
                }
              } catch (error) {
                console.error("Failed to update guide_step:", error);
              }
            } else if (updatedInfluencer.lorastatus === 9) {
              // Training failed
              setIsTrainingPolling(false);
              clearInterval(pollInterval);
              toast.error(`Training failed for ${updatedInfluencer.name_first}. Please try again.`);
            }
          }
        }
      } catch (error) {
        console.error("Error polling training status:", error);
      }
    }, 30000); // Poll every 30 seconds

    // Clear interval after 2 hours (safety measure)
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsTrainingPolling(false);
    }, 2 * 60 * 60 * 1000);
  };

  // Stop polling when component unmounts
  useEffect(() => {
    return () => {
      setIsTrainingPolling(false);
    };
  }, []);

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Large Image Overlay */}
      {hoveredImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-5 backdrop-blur-xl flex items-center justify-center"
          onClick={() => setHoveredImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-4xl max-h-[80vh] w-full mx-6"
          >
            <img
              src={hoveredImage}
              alt="Large preview"
              className="w-full h-full object-contain rounded-3xl shadow-2xl"
            />
            <button
              onClick={() => setHoveredImage(null)}
              className="absolute top-4 right-4 w-10 h-10 backdrop-blur-xl border border-slate-700/50 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
            Let's get started — the{" "}
            <span className="text-purple-400 font-medium">
              4‑phase assistant
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            All you need is 4 simple steps to launch your AI Influencer
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Process Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="AI Workflow Process"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 via-transparent to-slate-800/90" />
              </div>

              <div className="relative z-10 text-center">
                <div className="text-white text-3xl font-bold mb-2">
                  Less than 60 Minutes from Idea to Virtual Influencer
                </div>
                <div className="text-slate-300">
                  This includes render time in the background, you can work on while waiting for your AI Influencer to be ready.
                </div>
              </div>
            </div>

            {/* Compact Progress Breadcrumb */}
            <div className="mt-8 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                {/* Progress Line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-600/30">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${((currentPhase - 1) / 3) * 100}%` }}
                  />
                </div>

                {phases.map((phase, index) => (
                  <div key={phase.id} className="flex flex-col items-center z-10 relative">
                    {/* Smaller Step Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      phase.completed 
                        ? 'bg-green-500 border-green-400 shadow-md shadow-green-500/25' 
                        : phase.isProcessing
                          ? `bg-blue-500 border-blue-400 shadow-md shadow-blue-500/25 ${blinkState ? "opacity-100" : "opacity-75"}`
                        : phase.isPending 
                          ? 'bg-orange-500 border-orange-400 shadow-md shadow-orange-500/25' 
                          : 'bg-slate-600 border-slate-500'
                    }`}>
                      {phase.completed ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : phase.isProcessing ? (
                        <Brain className="w-4 h-4 text-white" />
                      ) : phase.isPending ? (
                        <phase.icon className="w-4 h-4 text-white" />
                      ) : (
                        <phase.icon className="w-4 h-4 text-slate-300" />
                      )}
                    </div>

                    {/* Compact Step Info */}
                    <div className="mt-2 text-center min-w-0">
                      <div className="text-xs font-medium text-slate-400 mb-1">
                        {phase.title}
                      </div>
                      <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        phase.completed 
                          ? 'bg-green-500/20 text-green-400' 
                          : phase.isProcessing
                            ? 'bg-blue-500/20 text-blue-400'
                          : phase.isPending 
                            ? 'bg-orange-500/20 text-orange-400' 
                            : 'bg-slate-600/20 text-slate-400'
                      }`}>
                        {phase.completed ? 'Done' : phase.isProcessing ? 'Processing' : phase.isPending ? 'Current' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                onClick={() => !phase.disabled && handlePhaseClick(phase.id)}
                className={`backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 relative ${
                  phase.disabled
                    ? "bg-slate-900/30 border-slate-600/30 opacity-50 cursor-not-allowed"
                    : phase.completed
                      ? "bg-green-900/20 border-green-500/50 ring-2 ring-green-500/30 shadow-lg shadow-green-500/10 hover:scale-[1.02] cursor-pointer"
                      : phase.isProcessing
                        ? "bg-blue-900/20 border-blue-500/50 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20 hover:scale-[1.02] cursor-pointer"
                      : phase.isPending
                        ? `bg-orange-900/20 border-orange-500/50 ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/20 hover:scale-[1.02] cursor-pointer ${blinkState ? "opacity-100" : "opacity-85"}`
                        : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:scale-[1.02] cursor-pointer"
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    phase.disabled
                      ? "bg-slate-700 text-slate-400"
                      : phase.completed
                        ? "bg-green-500 text-white"
                        : phase.isProcessing
                          ? "bg-blue-500 text-white"
                        : phase.isPending
                          ? "bg-orange-500 text-white"
                          : "bg-slate-600 text-slate-300"
                  }`}>
                    {phase.disabled ? "LOCKED" : phase.completed ? "COMPLETED" : phase.isProcessing ? "PROCESSING" : phase.isPending ? "CURRENT" : "PENDING"}
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  {/* Phase Image */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group/phase bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Show influencer image for Phase 2 if active, otherwise show phase image
                      if (phase.id === 2 && currentPhase === 2 && selectedPhase2Influencer?.image_url) {
                        setShowImagePreviewModal(true);
                      } else {
                        setHoveredImage(phase.imageSrc);
                      }
                    }}
                  >
                    <img
                      src={
                        ((phase.id === 2 && currentPhase === 2) || (phase.id === 3 && currentPhase === 3)) && selectedPhase2Influencer?.image_url
                          ? selectedPhase2Influencer.image_url
                          : phase.imageSrc
                      }
                      alt={
                        ((phase.id === 2 && currentPhase === 2) || (phase.id === 3 && currentPhase === 3)) && selectedPhase2Influencer
                          ? `${selectedPhase2Influencer.name_first} ${selectedPhase2Influencer.name_last}`
                          : phase.title
                      }
                      className="w-full h-full object-cover group-hover/phase:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/phase:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover/phase:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    {/* Influencer indicator for Phase 2 and 3 */}
                    {((phase.id === 2 && currentPhase === 2) || (phase.id === 3 && currentPhase === 3)) && selectedPhase2Influencer && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.div>

                  {/* Phase Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          phase.completed
                            ? "bg-green-500"
                            : phase.isPending
                              ? "bg-orange-500"
                              : "bg-slate-600"
                        }`}
                      >
                        {phase.completed ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <phase.icon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        phase.completed
                          ? "text-green-400"
                          : phase.isPending
                            ? "text-orange-400"
                            : "text-slate-400"
                      }`}>
                        {phase.phase}
                      </span>
                    </div>
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        phase.completed
                          ? "text-green-400"
                          : phase.isPending
                            ? "text-orange-400"
                            : "text-white"
                      }`}
                    >
                      {phase.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-300 leading-relaxed">
                    {phase.description}
                  </p>
                  <p className="text-sm text-slate-400 italic">{phase.time}</p>

                  {/* Current Progress Display */}
                  {phase.completed && phase.id === 1 && latestGeneratedInfluencerWithLora0 && (
                    <div className="mt-3 p-3 bg-green-950/30 border border-green-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Current Progress:</span>
                        <span>Influencer "{latestGeneratedInfluencerWithLora0.name_first} {latestGeneratedInfluencerWithLora0.name_last}" created</span>
                      </div>
                    </div>
                  )}

                  {/* Phase 2 Current Progress - Processing Status */}
                  {phase.id === 2 && selectedPhase2Influencer && selectedPhase2Influencer.lorastatus === 1 && (
                    <div className="mt-3 p-3 bg-blue-950/30 border border-blue-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-400">
                        <Brain className="w-4 h-4 animate-pulse" />
                        <span className="font-medium">Current Progress:</span>
                        <span>Training your influencer {selectedPhase2Influencer.name_first} {selectedPhase2Influencer.name_last}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-blue-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>AI consistency training in progress... Checking status every 30 seconds</span>
                      </div>
                    </div>
                  )}

                  {/* Phase 2 Current Progress - Completed Status */}
                  {phase.completed && phase.id === 2 && latestTrainedInfluencer && (
                    <div className="mt-3 p-3 bg-green-950/30 border border-green-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Current Progress:</span>
                        <span>Character consistency locked for "{latestTrainedInfluencer.name_first} {latestTrainedInfluencer.name_last}"</span>
                      </div>
                    </div>
                  )}

                  {phase.completed && phase.id === 3 && (
                    <div className="mt-3 p-3 bg-green-950/30 border border-green-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Current Progress:</span>
                        <span>Content created and ready for publishing</span>
                      </div>
                    </div>
                  )}

                  {phase.completed && phase.id === 4 && (
                    <div className="mt-3 p-3 bg-green-950/30 border border-green-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Current Progress:</span>
                        <span>Content successfully published to social media</span>
                      </div>
                    </div>
                  )}

                  {/* Training Animation for Phase 2 */}
                  {phase.showProgress && (
                    <div className="mt-4 space-y-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-blue-400 mb-2">Training your influencer</div>
                        <div className="flex justify-center items-center gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                              style={{
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '1s'
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs text-blue-300 mb-2">
                          <span>AI Consistency Training</span>
                          <span>~30-60 minutes</span>
                        </div>
                        <div className="w-full bg-blue-900/30 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: "45%" }}></div>
                        </div>
                        <div className="mt-2 text-xs text-blue-400 text-center">
                          Checking status automatically every 30 seconds...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mt-16"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Start?
              </h3>
              <p className="text-slate-300 mb-8">
                Your AI influencer journey begins with one click
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Phase 1 - Create Influencer */}
                {currentPhase === 1 && (
                  <Button
                    onClick={handleCreateInfluencer}
                    className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {getButtonText()}
                  </Button>
                )}

                {/* Phase 2 - Lock the Look Options */}
                {currentPhase === 2 && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      onClick={() => {
                        // Handle influencer selection - open compact selector like Phase 3
                        setShowPhase2InfluencerSelector(true);
                      }}
                      variant="outline"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-blue-500"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Select another influencer
                    </Button>
                    <Button
                      onClick={() => {
                        // Handle AI consistency training start
                        if (selectedPhase2Influencer) {
                          // Use the currently selected influencer
                          setShowCharacterConsistencyModal(true);
                        } else {
                          toast.error("Please select an influencer first");
                        }
                      }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      disabled={!selectedPhase2Influencer}
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Start AI Consistency training
                    </Button>
                  </div>
                )}

                {/* Phase 3 - Content Creation */}
                {localGuideStep === 3 && (
                  <Button
                    onClick={handleContinueWork}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continue Creating Content
                  </Button>
                )}

                {/* Phase 4 - Libraries and Nymia Go */}
                {localGuideStep >= 4 && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      onClick={() => {
                        // Navigate to Image Library
                        window.location.href = '/vault';
                      }}
                      variant="outline"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-lg px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-blue-500"
                    >
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Image Library
                    </Button>
                    <Button
                      onClick={() => {
                        // Navigate to Video Library (placeholder for now)
                        toast.info("Video Library coming soon!");
                      }}
                      variant="outline"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-purple-500"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Video Library
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNymiaGoModal(true);
                      }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Nymia Go
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Side Panel for Active Influencer Info */}
          {(currentPhase === 2 || currentPhase === 3 || currentPhase === 4) && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-16"
            >
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">
                  My Active Influencer
                </h3>

                {(() => {
                  // Always show the selected Phase 2 influencer as the active influencer
                  const displayInfluencer = selectedPhase2Influencer;

                  if (!displayInfluencer) {
                    return (
                      <div className="text-center py-8">
                        <Circle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                        <p className="text-slate-400">
                          No active influencer selected
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl overflow-hidden shadow-lg">
                          {displayInfluencer.image_url ? (
                            <img
                              src={displayInfluencer.image_url}
                              alt={`${displayInfluencer.name_first} ${displayInfluencer.name_last}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Circle className="w-8 h-8 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                          displayInfluencer.lorastatus === 0 
                            ? 'bg-orange-500' 
                            : 'bg-green-500'
                        }`}>
                          {displayInfluencer.lorastatus === 0 ? (
                            <Brain className="w-3 h-3 text-white" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white">
                          {displayInfluencer.name_first}{" "}
                          {displayInfluencer.name_last}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {displayInfluencer.influencer_type ||
                            "AI Influencer"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Created:{" "}
                          {formatDate(displayInfluencer.created_at)}
                        </p>
                        <div className={`flex items-center gap-2 text-xs mt-2 ${
                          displayInfluencer.lorastatus === 0 
                            ? 'text-orange-400' 
                            : 'text-green-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            displayInfluencer.lorastatus === 0 
                              ? 'bg-orange-500' 
                              : 'bg-green-500'
                          }`}></div>
                          {displayInfluencer.lorastatus === 0 
                            ? 'Ready for Training' 
                            : 'AI Consistency Trained'
                          }
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Button to select another influencer */}
                <div className="mt-6">
                  <Button
                    onClick={() => setShowActiveInfluencerSelector(true)}
                    variant="outline"
                    className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Pick a different influencer to work with
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
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
                By proceeding without AI consistency training, your influencer
                may look different in each generated image and video.
              </p>
              <p className="text-sm text-slate-400">
                AI consistency training ensures your influencer looks the same
                in every piece of content, creating a more professional and
                recognizable brand.
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
              const displayInfluencer =
                selectedPhase2Influencer || latestGeneratedInfluencerWithLora0;

              if (!displayInfluencer) {
                return (
                  <div className="text-center py-8">
                    <Circle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No influencers found
                    </p>
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
                          {displayInfluencer.name_first}{" "}
                          {displayInfluencer.name_last}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {displayInfluencer.influencer_type || "AI Influencer"}
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
                This step takes about 30–60 minutes. You can keep working on
                other tasks while we train your AI.
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
                  Select the latest profile picture for enhanced character
                  consistency training.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {(() => {
            const trainingInfluencer =
              selectedPhase2Influencer || latestGeneratedInfluencerWithLora0;
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
                          {trainingInfluencer.name_first}{" "}
                          {trainingInfluencer.name_last}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          Latest profile picture • Version{" "}
                          {trainingInfluencer.image_num === null ||
                          trainingInfluencer.image_num === undefined ||
                          isNaN(trainingInfluencer.image_num)
                            ? 0
                            : trainingInfluencer.image_num - 1}
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
                      Choose the profile picture to copy for character
                      consistency training
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
                              Version{" "}
                              {trainingInfluencer.image_num === null ||
                              trainingInfluencer.image_num === undefined ||
                              isNaN(trainingInfluencer.image_num) ||
                              trainingInfluencer.image_num === 0
                                ? 0
                                : trainingInfluencer.image_num - 1}{" "}
                              • High Quality
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
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          Character Consistency Training
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          This action will copy the selected profile picture for
                          AI consistency training, ensuring your influencer
                          looks the same in every generated image and video. The
                          image will be used as a reference for maintaining
                          consistent visual characteristics.
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
                    disabled={
                      isCopyingImage ||
                      (!latestGeneratedInfluencer?.image_url && !uploadedFile)
                    }
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
                        {uploadedFile
                          ? "Upload for AI consistency training"
                          : "Select Profile Image for AI consistency training"}
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
      <Dialog
        open={showInfluencerSelectorModal}
        onOpenChange={setShowInfluencerSelectorModal}
      >
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
                <p className="text-slate-600 dark:text-slate-400">
                  No influencers found
                </p>
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
                            {influencer.influencer_type || "AI Influencer"}
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

      {/* Phase 2 Influencer Selector Modal for Ready to Start Section */}
      <Dialog
        open={showPhase2InfluencerSelectorModal}
        onOpenChange={setShowPhase2InfluencerSelectorModal}
      >
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
              const availableInfluencers = influencers.filter(
                (inf) => inf.lorastatus === 0,
              );

              if (availableInfluencers.length === 0) {
                return (
                  <div className="text-center py-12">
                    <Circle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No influencers available for training
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      All influencers have already been trained or are in
                      training
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableInfluencers.map((influencer) => (
                    <Card
                      key={influencer.id}
                      onClick={() =>
                        handlePhase2InfluencerSelection(influencer)
                      }
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
                              {influencer.influencer_type || "AI Influencer"}
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

      {/* Active Influencer Selector Modal for My Active Influencer Section */}
      <Dialog
        open={showActiveInfluencerSelector}
        onOpenChange={setShowActiveInfluencerSelector}
      >
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Pick a different influencer to work with
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
              Choose any influencer from your collection to work with
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {influencers.length === 0 ? (
              <div className="text-center py-12">
                <Circle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                <p className="text-slate-600 dark:text-slate-400">
                  No influencers found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {influencers.map((influencer) => (
                  <Card
                    key={influencer.id}
                    onClick={() => {
                      setSelectedPhase2Influencer(influencer);
                      setShowActiveInfluencerSelector(false);
                      
                      // If selecting untrained influencer in Phase 3/4, move back to Phase 2
                      if ((currentPhase === 3 || currentPhase === 4) && influencer.lorastatus !== 2) {
                        setLocalGuideStep(2);
                        localStorage.setItem("guide_step", "2");
                        if (userData.id) {
                          fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: "Bearer WeInfl3nc3withAI",
                            },
                            body: JSON.stringify({ guide_step: 2 }),
                          }).then(response => {
                            if (response.ok) {
                              dispatch(setUser({ guide_step: 2 }));
                            }
                          });
                        }
                        toast.info("Moved back to Phase 2 because selected influencer needs AI Consistency Training");
                      }
                    }}
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
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                            {influencer.lorastatus === 2 ? (
                              <CheckCircle className="w-3 h-3 text-white" />
                            ) : (
                              <Brain className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Influencer Info */}
                        <div className="text-center space-y-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {influencer.name_first} {influencer.name_last}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {influencer.influencer_type || "AI Influencer"}
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

      {/* Phase 3 Creation Options Modal */}
      <Dialog
        open={showPhase3CreationModal}
        onOpenChange={setShowPhase3CreationModal}
      >
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
                Choose your preferred content creation method. Each option
                offers unique capabilities to bring your AI influencer to life.
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Influencer Info Card */}
            {(() => {
              const displayInfluencer = selectedPhase2Influencer;

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
                            {displayInfluencer.name_first}{" "}
                            {displayInfluencer.name_last}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Ready for content creation •{" "}
                            {displayInfluencer.influencer_type ||
                              "AI Influencer"}
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
                  const influencerToUse = selectedPhase2Influencer;
                  setShowPhase3CreationModal(false);
                  if (influencerToUse) {
                    navigate("/create/images", {
                      state: { influencerData: influencerToUse },
                    });
                  } else {
                    navigate("/create/images");
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
                    Create stunning AI-generated images with your influencer in
                    various scenarios, poses, and styles.
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
                  const influencerToUse = selectedPhase2Influencer;
                  setShowPhase3CreationModal(false);
                  if (influencerToUse) {
                    navigate("/create/videos", {
                      state: {
                        influencerData: influencerToUse,
                        autoSelect: "image",
                      },
                    });
                  } else {
                    navigate("/create/videos", {
                      state: { autoSelect: "image" },
                    });
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
                    Generate dynamic videos featuring your AI influencer with
                    lip-sync and motion capabilities.
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
                  navigate("/create/edit");
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
                    Edit and enhance existing images with AI-powered tools for
                    professional results.
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
                  navigate("/create/faceswap");
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
                    Seamlessly swap faces in images and videos with advanced AI
                    technology.
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
                  navigate("/create/optimizer");
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
                    Optimize and upscale your content for maximum quality and
                    performance.
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
      <Dialog
        open={showPhase4LibraryModal}
        onOpenChange={setShowPhase4LibraryModal}
      >
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
                Choose a library to organize and manage your generated content.
                Keep your AI influencer's assets well-organized for easy access.
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
                    const response = await fetch(
                      `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: "Bearer WeInfl3nc3withAI",
                        },
                        body: JSON.stringify({
                          guide_step: 5,
                        }),
                      },
                    );

                    if (response.ok) {
                      dispatch(setUser({ guide_step: 5 }));
                      toast.success("Progress updated! Moving to Phase 5...");
                    } else {
                      toast.error("Failed to update progress");
                    }
                  } catch (error) {
                    console.error("Failed to update guide_step:", error);
                    toast.error("Failed to update progress");
                  }
                  navigate("/library/images");
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
                    Organize and manage all your AI-generated images, edit
                    history, and image presets in one place.
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
                    const response = await fetch(
                      `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: "Bearer WeInfl3nc3withAI",
                        },
                        body: JSON.stringify({
                          guide_step: 5,
                        }),
                      },
                    );

                    if (response.ok) {
                      dispatch(setUser({ guide_step: 5 }));
                      toast.success("Progress updated! Moving to Phase 5...");
                    } else {
                      toast.error("Failed to update progress");
                    }
                  } catch (error) {
                    console.error("Failed to update guide_step:", error);
                    toast.error("Failed to update progress");
                  }
                  navigate("/library/videos");
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
                    Manage your video content, lip-sync videos, and video
                    presets with advanced organization tools.
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
                    const response = await fetch(
                      `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: "Bearer WeInfl3nc3withAI",
                        },
                        body: JSON.stringify({
                          guide_step: 5,
                        }),
                      },
                    );

                    if (response.ok) {
                      dispatch(setUser({ guide_step: 5 }));
                      toast.success("Progress updated! Moving to Phase 5...");
                    } else {
                      toast.error("Failed to update progress");
                    }
                  } catch (error) {
                    console.error("Failed to update guide_step:", error);
                    toast.error("Failed to update progress");
                  }
                  navigate("/library/audios");
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
                    Organize your audio files, voice samples, and audio presets
                    for lip-sync video creation.
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
                    const response = await fetch(
                      `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: "Bearer WeInfl3nc3withAI",
                        },
                        body: JSON.stringify({
                          guide_step: 5,
                        }),
                      },
                    );

                    if (response.ok) {
                      dispatch(setUser({ guide_step: 5 }));
                      toast.success("Progress updated! Moving to Phase 5...");
                    } else {
                      toast.error("Failed to update progress");
                    }
                  } catch (error) {
                    console.error("Failed to update guide_step:", error);
                    toast.error("Failed to update progress");
                  }
                  navigate("/library/images");
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
                  AI Consistency Training
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-1">
                  Start AI consistency training for your selected influencer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedPhase2Influencer && (
            <div className="p-6 space-y-8">
              {/* Influencer Info Card */}
              <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
                        <img
                          src={selectedPhase2Influencer.image_url}
                          alt={selectedPhase2Influencer.name_first}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Copy className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {selectedPhase2Influencer.name_first} {selectedPhase2Influencer.name_last}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Latest profile picture • Version {selectedPhase2Influencer.image_num === null || selectedPhase2Influencer.image_num === undefined || isNaN(selectedPhase2Influencer.image_num) ? 0 : selectedPhase2Influencer.image_num - 1}
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
                        This action will start AI consistency training for your influencer,
                        ensuring they look the same in every generated image and video. The training will be
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
                    setShowCharacterConsistencyModal(false);
                  }}
                  className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartTraining}
                  className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Brain className="w-5 h-5 mr-3" />
                  Start AI Consistency Training
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog
        open={showImagePreviewModal}
        onOpenChange={setShowImagePreviewModal}
      >
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {selectedPhase2Influencer && 
                    `${selectedPhase2Influencer.name_first} ${selectedPhase2Influencer.name_last}`
                  }
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Current influencer for Lock the Look phase
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedPhase2Influencer?.image_url && (
            <div className="p-6">
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={selectedPhase2Influencer.image_url}
                  alt={`${selectedPhase2Influencer.name_first} ${selectedPhase2Influencer.name_last}`}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
                
                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-1">
                      {selectedPhase2Influencer.name_first} {selectedPhase2Influencer.name_last}
                    </h3>
                    <p className="text-sm text-gray-200 mb-2">
                      {selectedPhase2Influencer.influencer_type || "AI Influencer"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-400/30">
                        Ready for Training
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-200 border border-green-400/30">
                        Phase 2: Lock the Look
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 text-center">
                <Button
                  onClick={() => setShowImagePreviewModal(false)}
                  variant="outline"
                  className="w-full h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Phase 2 Influencer Selector Modal */}
      <Dialog
        open={showPhase2InfluencerSelector}
        onOpenChange={setShowPhase2InfluencerSelector}
      >
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-b border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Select Influencer for Training
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Choose which influencer to use for AI consistency training
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6">
            {influencers.filter(influencer => influencer.lorastatus === 0).length === 0 ? (
              <div className="text-center py-12">
                <Circle className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                <p className="text-slate-600 dark:text-slate-400">
                  No influencers ready for training found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {influencers.filter(influencer => influencer.lorastatus === 0).map((influencer) => (
                  <Card
                    key={influencer.id}
                    onClick={() => handlePhase2InfluencerSelection(influencer)}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${
                      selectedPhase2Influencer?.id === influencer.id
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                        : 'hover:border-purple-300 dark:hover:border-purple-600'
                    } bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-800/50 dark:to-slate-700/50`}
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
                          {selectedPhase2Influencer?.id === influencer.id && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
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
                            {influencer.influencer_type || "AI Influencer"}
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cost Warning Modal */}
      <Dialog
        open={showCostWarningModal}
        onOpenChange={setShowCostWarningModal}
      >
        <DialogContent className="max-w-md w-[95vw] p-0">
          <DialogHeader className="px-6 py-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Training Cost
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  This action will consume gems from your account
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Cost Information */}
            <Card className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200/50 dark:border-purple-800/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    AI Consistency Training
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">💎</span>
                    </div>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {gemCostData?.gem_cost || 50} Gems
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Character consistency training for your AI influencer
                </p>
              </CardContent>
            </Card>

            {/* Current Balance */}
            <div className={`flex items-center justify-between p-4 rounded-xl ${
              (userData.credits || 0) < (gemCostData?.gem_cost || 50)
                ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Balance
              </span>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${
                  (userData.credits || 0) < (gemCostData?.gem_cost || 50)
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}>
                  <span className="text-white text-xs">💎</span>
                </div>
                <span className={`font-bold ${
                  (userData.credits || 0) < (gemCostData?.gem_cost || 50)
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {userData.credits || 0} Gems
                </span>
              </div>
            </div>

            {/* Insufficient Credits Warning */}
            {(userData.credits || 0) < (gemCostData?.gem_cost || 50) && (
              <Card className="bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200/50 dark:border-red-800/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-900 dark:text-red-100">
                        Insufficient Credits
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        You need {(gemCostData?.gem_cost || 50) - (userData.credits || 0)} more gems to start training.
                        Please purchase additional gems to continue.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCostWarningModal(false)}
                className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={startTraining}
                disabled={!gemCostData || (userData.credits || 0) < (gemCostData?.gem_cost || 50)}
                className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-5 h-5 mr-2" />
                {(userData.credits || 0) < (gemCostData?.gem_cost || 50) 
                  ? "Insufficient Credits" 
                  : "Confirm & Start Training"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nymia Go Modal */}
      <Dialog open={showNymiaGoModal} onOpenChange={setShowNymiaGoModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20 border-slate-700/50 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-2">
              Nymia Go
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-base">
              Get our companion app for easy data transfer on your phone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Download Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 text-base font-medium bg-black/20 border-gray-600 hover:bg-black/30 text-white"
                disabled
              >
                📱 Download from Apple Store
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-base font-medium bg-black/20 border-gray-600 hover:bg-black/30 text-white"
                disabled
              >
                🤖 Download from Google Play Store
              </Button>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                <div className="text-black text-xs text-center">
                  QR Code<br/>Coming Soon
                </div>
              </div>
            </div>

            {/* Beta Notice */}
            <div className="text-center">
              <p className="text-slate-400 text-sm italic">
                In beta test - coming soon
              </p>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setShowNymiaGoModal(false)}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
