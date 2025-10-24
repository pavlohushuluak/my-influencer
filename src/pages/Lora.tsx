import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreditConfirmationModal } from "@/components/CreditConfirmationModal";
import {
  Brain,
  Image as ImageIcon,
  Settings,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  ArrowLeft,
  Loader2,
  ChevronDown,
  Copy,
  Cog,
} from "lucide-react";
import { toast } from "sonner";
import {
  setInfluencers,
  setLoading,
  setError,
} from "@/store/slices/influencersSlice";
import { setUser } from "@/store/slices/userSlice";

import LoraManagement from "@/components/LoraManagement";
import config from "@/config/config";

interface Influencer {
  id: string;
  user_id: string;
  image_url: string;
  influencer_type: string;
  name_first: string;
  name_last: string;
  visual_only: boolean;
  sex: string;
  age_lifestyle: string;
  origin_birth: string;
  origin_residence: string;
  cultural_background: string;
  hair_length: string;
  hair_color: string;
  hair_style: string;
  eye_color: string;
  lip_style: string;
  nose_style: string;
  eyebrow_style: string;
  face_shape: string;
  facial_features: string;
  bust_size: string;
  skin_tone: string;
  body_type: string;
  color_palette: string[];
  clothing_style_everyday: string;
  clothing_style_occasional: string;
  clothing_style_home: string;
  clothing_style_sports: string;
  clothing_style_sexy_dress: string;
  home_environment: string;
  content_focus: string[];
  content_focus_areas: string[];
  job_area: string;
  job_title: string;
  job_vibe: string;
  hobbies: string[];
  social_circle: string;
  strengths: string[];
  weaknesses: string[];
  speech_style: string[];
  humor: string[];
  core_values: string[];
  current_goals: string[];
  background_elements: string[];
  prompt: string;
  notes: string;
  created_at: string;
  updated_at: string;
  image_num: number;
  age: string;
  lifestyle: string;
  eye_shape: string;
  lorastatus: number;
  bio?: any;
}

export default function Lora() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const influencers = useSelector(
    (state: RootState) => state.influencers.influencers,
  );
  const isLoading = useSelector(
    (state: RootState) => state.influencers.loading,
  );

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    lorastatus: null as number | null,
    favorites: null as boolean | null,
  });

  // Modal state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);
  const [warningType, setWarningType] = useState<
    "not-trained" | "training" | null
  >(null);
  const [showLoraManagementModal, setShowLoraManagementModal] = useState(false);

  // Character Consistency Modal state
  const [showCharacterConsistencyModal, setShowCharacterConsistencyModal] =
    useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<
    string | null
  >(null);
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

  // Training Options Modal state
  const [showTrainingOptionsModal, setShowTrainingOptionsModal] =
    useState(false);
  const [trainingInfluencer, setTrainingInfluencer] =
    useState<Influencer | null>(null);
  const [currentTrainingType, setCurrentTrainingType] = useState<
    "basic" | "plus"
  >("basic");

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
        setError(error instanceof Error ? error.message : "An error occurred"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [userData.id]);

  // Auto-trigger functionality when navigating from Quick Actions modal
  useEffect(() => {
    if (
      location.state?.influencerData &&
      location.state?.fromQuickActions &&
      influencers.length > 0 &&
      !isLoading
    ) {
      const influencerData = location.state.influencerData;
      const targetInfluencer = influencers.find(
        (inf) => inf.id === influencerData.id,
      );

      if (targetInfluencer) {
        console.log(
          "Auto-triggering AI Consistency for influencer:",
          targetInfluencer.name_first,
        );
        // Automatically trigger the manage/train action
        handleManageLora(targetInfluencer);

        // Clear the location state to prevent re-triggering
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, influencers, isLoading]);

  // Handle Train action - opens training options modal
  const handleTrainLora = (influencer: Influencer) => {
    setTrainingInfluencer(influencer);
    setShowTrainingOptionsModal(true);
  };

  // Handle start training with specific type
  const handleStartTraining = async (trainingType: "basic" | "plus") => {
    if (!trainingInfluencer) return;

    // Check gem cost before proceeding
    setCurrentTrainingType(trainingType);
    const gemData = await checkLoraGemCost(trainingType);
    if (gemData) {
      setGemCostData(gemData);
      setSelectedInfluencer(trainingInfluencer);

      // Check if user has enough credits
      if (userData.credits < gemData.gems) {
        setShowGemWarning(true);
        setShowTrainingOptionsModal(false);
        return;
      } else {
        // Show confirmation for gem cost
        setShowGemWarning(true);
        setShowTrainingOptionsModal(false);
        return;
      }
    }

    // If no gem checking needed or failed, show error and don't proceed
    toast.error("Unable to verify credit cost. Please try again.");
  };

  // Handle Manage action - always opens management modal
  const handleManageLora = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setShowLoraManagementModal(true);
  };

  const handleCharacterConsistency = (influencer?: Influencer) => {
    const targetInfluencer = influencer || selectedInfluencer;
    if (targetInfluencer) {
      // Get the latest profile picture URL with correct format
      let latestImageNum = targetInfluencer.image_num - 1;
      if (latestImageNum === -1) {
        latestImageNum = 0;
      }
      console.log(targetInfluencer.image_num);
      const profileImageUrl = `${config.data_url}/${userData.id}/models/${targetInfluencer.id}/profilepic/profilepic${latestImageNum}.png`;

      setSelectedProfileImage(profileImageUrl);
      setShowCharacterConsistencyModal(true);
    }
  };

  // Function to check gem cost for LoRA training
  const checkLoraGemCost = async (trainingType?: "basic" | "plus") => {
    try {
      setIsCheckingGems(true);
      const response = await fetch("https://api.nymia.ai/v1/getgems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          item:
            trainingType === "basic"
              ? "nymia_lora"
              : trainingType === "plus"
                ? "nymia_lora_plus"
                : "lora_images_only",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gem cost: ${response.status}`);
      }

      const gemData = await response.json();
      return gemData;
    } catch (error) {
      console.error("Error checking LoRA gem cost:", error);
      toast.error(
        "Failed to check training cost. Proceeding without verification.",
      );
      return null;
    } finally {
      setIsCheckingGems(false);
    }
  };

  // Function to proceed with LoRA training after gem confirmation
  const proceedWithLoraTraining = async () => {
    try {
      setShowGemWarning(false);
      console.log(
        "Starting AI consistency training after credit confirmation...",
      );
      await executeLoraTraining();
    } catch (error) {
      console.error("Error in proceedWithLoraTraining:", error);
      toast.error("Failed to start AI consistency training. Please try again.");
      setIsCopyingImage(false);
    }
  };

  // Main LoRA training function with credit checking
  const handleCopyProfileImage = async () => {
    if (!selectedInfluencer) return;

    // Check gem cost before proceeding
    const gemData = await checkLoraGemCost(currentTrainingType || "basic");
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
    toast.error("Unable to verify credit cost. Please try again.");
    return;
  };

  // Separated LoRA training execution function
  const executeLoraTraining = async () => {
    if (!selectedInfluencer) return;

    setIsCopyingImage(true);
    try {
      if (uploadedFile) {
        // Upload the image directly to the LoRA folder
        const loraFilePath = `models/${selectedInfluencer.id}/loratraining/${uploadedFile.name}`;

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
              modelid: selectedInfluencer.id,
              inputimage: `/models/${selectedInfluencer.id}/loratraining/${uploadedFile.name}`,
            }),
          },
        );

        toast.success(
          "Image uploaded for AI consistency training successfully",
        );
      } else {
        // Copy existing profile picture to LoRA folder
        const latestImageNum = selectedInfluencer.image_num - 1;

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
              modelid: selectedInfluencer.id,
              inputimage: `/models/${selectedInfluencer.id}/profilepic/profilepic${latestImageNum}.png`,
            }),
          },
        );

        toast.success(
          "Profile image selected successfully for AI consistency training",
        );
      }

      // Refresh influencer data to update lorastatus
      await fetchInfluencers();

      // Update guide_step if it's currently 2
      if (userData.guide_step === 2) {
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
            },
          );
          if (guideStepResponse.ok) {
            // Update Redux store
            dispatch(setUser({ guide_step: 3 }));
            toast.success("Progress updated! Moving to Phase 3...");
            navigate("/start");
          }
        } catch (error) {
          console.error("Failed to update guide_step:", error);
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
      console.error("Error uploading/copying image:", error);
      toast.error("Failed to upload/copy image for AI consistency training");
    } finally {
      setIsCopyingImage(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
  };

  const clearFilters = () => {
    setSelectedFilters({
      lorastatus: null,
      favorites: null,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setUploadedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
      setSelectedProfileImage(imageUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setUploadedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
      setSelectedProfileImage(imageUrl);
    }
  };

  const handleRemoveUploadedImage = () => {
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    setUploadedFile(null);
    setUploadedImageUrl(null);

    // Reset to original profile image
    if (selectedInfluencer) {
      let latestImageNum = selectedInfluencer.image_num - 1;
      if (latestImageNum === -1) {
        latestImageNum = 0;
      }
      const profileImageUrl = `${config.data_url}/${userData.id}/models/${selectedInfluencer.id}/profilepic/profilepic${latestImageNum}.png`;
      setSelectedProfileImage(profileImageUrl);
    }
  };

  // Filter and sort influencers
  const filteredInfluencers = influencers.filter((influencer) => {
    const matchesSearch =
      searchTerm === "" ||
      influencer.name_first.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.name_last.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLoraStatus =
      selectedFilters.lorastatus === null ||
      influencer.lorastatus === selectedFilters.lorastatus;

    return matchesSearch && matchesLoraStatus;
  });

  const sortedInfluencers = [...filteredInfluencers].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "newest":
        comparison =
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        break;
      case "oldest":
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "name":
        comparison = `${a.name_first} ${a.name_last}`.localeCompare(
          `${b.name_first} ${b.name_last}`,
        );
        break;
      case "lorastatus":
        comparison = (a.lorastatus || 0) - (b.lorastatus || 0);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "desc" ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-ai-purple-500" />
          <p className="text-muted-foreground">Loading influencers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Consistency
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Train the AI so that your influencers look the same in every
                image and video
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search influencers by name or notes..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-background/50"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <span className="sr-only">Clear search</span>×
            </Button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="min-w-[120px] justify-between"
              >
                {sortBy === "newest" && "Newest"}
                {sortBy === "oldest" && "Oldest"}
                {sortBy === "name" && "Name"}
                {sortBy === "lorastatus" && "AI Consistency Status"}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0" align="end">
              <div className="grid">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    sortBy === "newest"
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy("oldest")}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    sortBy === "oldest"
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  Oldest
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    sortBy === "name" ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy("lorastatus")}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                    sortBy === "lorastatus"
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  AI Consistency Status
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          >
            {sortOrder === "desc" ? (
              <SortDesc className="w-4 h-4" />
            ) : (
              <SortAsc className="w-4 h-4" />
            )}
          </Button>

          {/* Filter Menu Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className={`${filterMenuOpen ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" : ""}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(selectedFilters.lorastatus !== null ||
              selectedFilters.favorites !== null) && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {[
                  selectedFilters.lorastatus !== null ? 1 : 0,
                  selectedFilters.favorites !== null ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Menu */}
      {filterMenuOpen && (
        <Card className="p-4 mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LoRA Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                AI Consistency Status
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedFilters.lorastatus === null && "All Statuses"}
                    {selectedFilters.lorastatus === 0 && "Not Trained"}
                    {selectedFilters.lorastatus === 1 && "Training"}
                    {selectedFilters.lorastatus === 2 && "Trained"}
                    {selectedFilters.lorastatus === 9 && "Error"}
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0" align="start">
                  <div className="grid">
                    <button
                      onClick={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          lorastatus: null,
                        }))
                      }
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                        selectedFilters.lorastatus === null
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      All Statuses
                    </button>
                    <button
                      onClick={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          lorastatus: 0,
                        }))
                      }
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                        selectedFilters.lorastatus === 0
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      Not Trained
                    </button>
                    <button
                      onClick={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          lorastatus: 1,
                        }))
                      }
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                        selectedFilters.lorastatus === 1
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      Training
                    </button>
                    <button
                      onClick={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          lorastatus: 2,
                        }))
                      }
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                        selectedFilters.lorastatus === 2
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      Trained
                    </button>
                    <button
                      onClick={() =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          lorastatus: 9,
                        }))
                      }
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                        selectedFilters.lorastatus === 9
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      Error
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Influencers
                </p>
                <p className="text-2xl font-bold">{influencers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Training</p>
                <p className="text-2xl font-bold">
                  {influencers.filter((inf) => inf.lorastatus === 1).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trained</p>
                <p className="text-2xl font-bold">
                  {influencers.filter((inf) => inf.lorastatus === 2).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Not Trained</p>
                <p className="text-2xl font-bold">
                  {influencers.filter((inf) => inf.lorastatus === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {sortedInfluencers.map((influencer) => (
          <Card
            key={influencer.id}
            className="group transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
          >
            <CardContent className="p-4 sm:p-6 h-full">
              <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
                <div
                  className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden cursor-pointer"
                  onDoubleClick={() => handleManageLora(influencer)}
                  title="Double-click to manage AI Consistency"
                >
                  {/* LoraStatusIndicator positioned at top right */}
                  <div className="absolute right-1 top-0.5 z-10">
                    {(influencer.lorastatus || 0) === 2 ? (
                      <Badge className="bg-green-600/50 text-white text-[10px] px-1.5 py-0.5 font-medium rounded-sm shadow-sm">
                        Trained
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/50 text-white text-[10px] px-1.5 py-0.5 font-medium rounded-sm shadow-sm">
                        Pending
                      </Badge>
                    )}
                  </div>

                  {influencer.image_url ? (
                    <img
                      src={influencer.image_url}
                      alt={`${influencer.name_first} ${influencer.name_last}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No image found
                      </h3>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                        {influencer.name_first} {influencer.name_last}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex text-sm text-muted-foreground flex-col">
                      {influencer.notes ? (
                        <span className="text-sm text-muted-foreground">
                          {influencer.notes.length > 50
                            ? `${influencer.notes.substring(0, 50)}...`
                            : influencer.notes}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {influencer.lifestyle || "No lifestyle"} •{" "}
                          {influencer.origin_residence || "No residence"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTrainLora(influencer);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Train
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleManageLora(influencer);
                      }}
                      className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0"
                    >
                      <Cog className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warning Modal */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  warningType === "not-trained"
                    ? "bg-gradient-to-br from-orange-500 to-red-500"
                    : "bg-gradient-to-br from-blue-500 to-indigo-500"
                }`}
              >
                {warningType === "not-trained" ? (
                  <AlertTriangle className="w-5 h-5 text-white" />
                ) : (
                  <Clock className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <DialogTitle
                  className={`text-xl font-bold bg-clip-text text-transparent ${
                    warningType === "not-trained"
                      ? "bg-gradient-to-r from-orange-600 to-red-600"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600"
                  }`}
                >
                  {warningType === "not-trained"
                    ? "AI Consistency Not Trained"
                    : "AI Consistency Training in Progress"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {warningType === "not-trained"
                    ? "This influencer needs AI consistency training"
                    : "AI consistency training is currently active"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Card
            className={`border-2 ${
              warningType === "not-trained"
                ? "border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
                : "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
            }`}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {warningType === "not-trained" ? (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Training Required
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedInfluencer?.name_first} needs AI consistency
                        training to look the same in every image and video.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                      <Zap className="w-3 h-3" />
                      <span>Training will improve generation quality</span>
                    </div>
                  </>
                ) : (
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
                        {selectedInfluencer?.name_first}'s AI consistency is
                        currently being trained. This process typically takes
                        5-15 minutes.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <Clock className="w-3 h-3" />
                      <span>Training in progress...</span>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowWarningModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {warningType === "not-trained" && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (selectedInfluencer) {
                          setShowWarningModal(false);
                          handleTrainLora(selectedInfluencer);
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Train Consistency
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* LoRA Management Modal */}
      <Dialog
        open={showLoraManagementModal}
        onOpenChange={setShowLoraManagementModal}
      >
        <DialogContent className="max-w-7xl max-h-[90vh] p-0 overflow-y-auto">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold bg-ai-gradient bg-clip-text text-transparent">
              AI Consistency
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Managing AI consistency files for {selectedInfluencer?.name_first}{" "}
              {selectedInfluencer?.name_last}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0">
            {selectedInfluencer && (
              <LoraManagement
                influencerId={selectedInfluencer.id}
                influencerName={`${selectedInfluencer.name_first} ${selectedInfluencer.name_last}`}
                onClose={() => setShowLoraManagementModal(false)}
              />
            )}
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
                  Character Consistency
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-1">
                  Select the latest profile picture for enhanced character
                  consistency training.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedInfluencer && selectedProfileImage && (
            <div className="p-6 space-y-8">
              {/* Influencer Info Card */}
              <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
                        <img
                          src={selectedInfluencer.image_url}
                          alt={selectedInfluencer.name_first}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Copy className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {selectedInfluencer.name_first}{" "}
                        {selectedInfluencer.name_last}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Latest profile picture • Version{" "}
                        {selectedInfluencer.image_num === null ||
                        selectedInfluencer.image_num === undefined ||
                        isNaN(selectedInfluencer.image_num)
                          ? 0
                          : selectedInfluencer.image_num - 1}
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
                    Choose the profile picture to copy for character consistency
                    training
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
                            Version{" "}
                            {selectedInfluencer.image_num === null ||
                            selectedInfluencer.image_num === undefined ||
                            isNaN(selectedInfluencer.image_num) ||
                            selectedInfluencer.image_num === 0
                              ? 0
                              : selectedInfluencer.image_num - 1}{" "}
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
                        AI consistency training, ensuring your influencer looks
                        the same in every generated image and video. The image
                        will be used as a reference for maintaining consistent
                        visual characteristics.
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
                  disabled={
                    isCopyingImage ||
                    isCheckingGems ||
                    (!selectedProfileImage && !uploadedFile)
                  }
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
                      {uploadedFile
                        ? "Upload for AI consistency training"
                        : "Select Profile Image for AI consistency training"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Training Options Modal */}
      <Dialog
        open={showTrainingOptionsModal}
        onOpenChange={(open) => setShowTrainingOptionsModal(open)}
      >
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Choose Training Type
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-1">
                  Select the AI consistency training option that best fits your
                  needs
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Profile Picture Info Card */}
            {trainingInfluencer && (
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
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {trainingInfluencer.name_first}{" "}
                        {trainingInfluencer.name_last}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Training will be performed based on the current profile
                        picture. Choose "Manage" instead for a more customizable
                        approach.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          AI Consistency Training
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Current Profile Picture
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Basic Training Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-green-300 dark:border-gray-700 dark:hover:border-green-600">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Basic Character Consistency Training
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      This will automatically create 12 images to Lock the Look
                      and perform a normal training process. Good for creating
                      normal, consistent Influencer images.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
                        12 Images
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                        ~10 - 15 minutes
                      </span>
                    </div>
                    <Button
                      onClick={() => handleStartTraining("basic")}
                      className="w-full h-12 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Brain className="w-5 h-5 mr-3" />
                      Start Basic Training
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plus Training Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-600">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Character Consistency Training Plus
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      This will automatically create 25 images to Lock the Look
                      and will execute an enhanced training process with 3x more
                      steps. This is good for creating professional grade,
                      consistent Influencer images.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium">
                        25 Images
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-medium">
                        Professional Grade
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                        ~20 - 25 minutes
                      </span>
                    </div>
                    <Button
                      onClick={() => handleStartTraining("plus")}
                      className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Brain className="w-5 h-5 mr-3" />
                      Start Plus Training
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancel Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowTrainingOptionsModal(false)}
                className="w-full h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
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
        userId={userData.id}
        isProcessing={isCopyingImage}
        processingText="Setting up AI consistency training..."
        confirmButtonText="Start AI Consistency Training"
        title="AI Consistency Training Cost"
        itemType="training"
      />
    </div>
  );
}
