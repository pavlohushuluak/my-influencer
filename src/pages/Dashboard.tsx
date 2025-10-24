import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import config from "@/config/config";
import { cleanImageUrl } from "@/lib/utils";
import {
  Influencer,
  setError,
  setInfluencers,
  setLoading,
} from "@/store/slices/influencersSlice";
import { RootState } from "@/store/store";
import axios from "axios";
import {
  Brain,
  Copy,
  Image,
  Loader2,
  MoreHorizontal,
  Plus,
  Settings,
  Sparkles,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { CreditConfirmationModal } from "@/components/CreditConfirmationModal";

export default function Dashboard() {
  console.log("Dashboard component rendered");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const influencers = useSelector(
    (state: RootState) => state.influencers.influencers
  );
  const loading = useSelector((state: RootState) => state.influencers.loading);
  const error = useSelector((state: RootState) => state.influencers.error);
  const [showAllInfluencers, setShowAllInfluencers] = useState(false);
  const [selectedInfluencerData, setSelectedInfluencerData] =
    useState<Influencer | null>(null);
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

  // Ref to prevent double fetching in StrictMode
  const hasFetchedRef = useRef(false);

  // Filter influencers to only show those with show_on_dashboard === true
  const dashboardInfluencers = influencers.filter(
    (influencer) => influencer.show_on_dashboard === true
  );
  const displayedInfluencers = showAllInfluencers
    ? dashboardInfluencers
    : dashboardInfluencers.slice(0, 6);

  const userData = useSelector((state: RootState) => state.user);
  const userLoading = useSelector((state: RootState) => state.user.loading);

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
            }
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
            }
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
  const fetchInfluencers = async () => {
    console.log("fetchInfluencers called with userData.id:", userData.id);
    try {
      dispatch(setLoading(true));
      const response = await fetch(
        `${config.supabase_server_url}/influencer?user_id=eq.${userData.id}`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      if (response.ok) {
        const influencers = await response.json();
        console.log("Fetched influencers:", influencers);
        dispatch(setInfluencers(influencers));
      } else {
        console.error("Failed to fetch influencers");
        dispatch(setError("Failed to fetch influencers"));
      }
    } catch (error) {
      console.error("Error:", error);
      dispatch(setError("Error fetching influencers"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    console.log(
      "Dashboard useEffect triggered - userData.id:",
      userData.id,
      "userLoading:",
      userLoading,
      "hasFetched:",
      hasFetchedRef.current
    );
    if (userData.id && !userLoading && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      console.log("Dashboard: Fetching influencers (prevented double fetch)");
      fetchInfluencers();
    }

    // Cleanup function to reset the flag when component unmounts
    return () => {
      console.log("Dashboard component unmounting, resetting fetch flag");
      hasFetchedRef.current = false;
    };
  }, [userData.id, userLoading]);

  // Reset the fetch flag when userData.id changes (e.g., user logs out and back in)
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [userData.id]);

  const handleCreateNewInfluencer = () => {
    navigate("/influencers/create");
  };

  const handleEditInfluencer = (id: string) => {
    const influencer = influencers.find((inf) => inf.id === id);
    if (influencer) {
      navigate("/influencers/edit", { state: { influencerData: influencer } });
    } else {
      toast.error("Influencer not found");
    }
  };

  const handleManageBio = (id: string) => {
    const influencer = influencers.find((inf) => inf.id === id);
    if (influencer) {
      navigate("/social/bio", {
        state: {
          influencerData: influencer,
          fromDashboard: true,
          autoShowBioModal: true,
        },
      });
    } else {
      toast.error("Influencer not found");
    }
  };

  const handleCreateImage = (id: string) => {
    navigate(`/create/images?influencer=${id}`);
  };

  const handleCreateVideo = (id: string) => {
    navigate(`/create/videos?influencer=${id}&section=influencer`);
  };

  const handleDeleteInfluencer = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this influencer? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${config.supabase_server_url}/influencer?id=eq.${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Influencer deleted successfully");
        fetchInfluencers(); // Refresh the list
      } else {
        toast.error("Failed to delete influencer");
      }
    } catch (error: any) {
      console.error("Error deleting influencer:", error);
      toast.error("Error deleting influencer");
    }
  };

  const handleTrainCharacterConsistency = async (influencerId: string) => {
    const influencer = influencers.find((inf) => inf.id === influencerId);
    if (!influencer) {
      toast.error("Influencer not found");
      return;
    }

    setSelectedInfluencerData(influencer);
    setSelectedProfileImage(cleanImageUrl(influencer.image_url) || null);
    setShowCharacterConsistencyModal(true);
  };

  const proceedWithLoraTraining = async () => {
    if (!selectedInfluencerData || !uploadedFile) {
      toast.error("Missing required data for training");
      return;
    }

    setIsCopyingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("influencer_id", selectedInfluencerData.id.toString());

      const response = await fetch("/api/upload_training_image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowCharacterConsistencyModal(false);
        if (uploadedImageUrl) {
          URL.revokeObjectURL(uploadedImageUrl);
        }
        setUploadedFile(null);
        setUploadedImageUrl(null);
        toast.success("Training image uploaded successfully");
        navigate("/lora");
      } else {
        toast.error("Failed to upload training image");
      }
    } catch (error: any) {
      console.error("Error uploading training image:", error);
      toast.error("Error uploading training image");
    } finally {
      setIsCopyingImage(false);
    }
  };

  const handleCopyProfileImage = async () => {
    if (!selectedInfluencerData || !selectedProfileImage) {
      toast.error("No profile image available");
      return;
    }

    setIsCopyingImage(true);

    try {
      const response = await fetch(selectedProfileImage);
      const blob = await response.blob();
      const file = new File(
        [blob],
        `${selectedInfluencerData.name_first}_profile.jpg`,
        { type: blob.type }
      );

      setUploadedFile(file);
      setUploadedImageUrl(URL.createObjectURL(blob));
      toast.success("Profile image copied successfully");
    } catch (error) {
      console.error("Error copying profile image:", error);
      toast.error("Failed to copy profile image");
    } finally {
      setIsCopyingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchInfluencers}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and create content for your featured AI personalities
          </p>
        </div>
        <Button
          onClick={handleCreateNewInfluencer}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          data-testid="button-create-new-influencer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Influencer
        </Button>
      </div>

      {dashboardInfluencers.length === 0 ? (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No dashboard influencers yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create influencers and set them to show on dashboard to get started
          </p>
          <Button
            onClick={handleCreateNewInfluencer}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            data-testid="button-create-first-influencer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Influencer
          </Button>
        </div>
      ) : (
        <>
          {/* Dashboard Influencers Container */}
          <Card>
            <div className="w-full justify-end flex mt-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-sm px-3 sm:px-4 py-2"
                onClick={() => setShowAllInfluencers(!showAllInfluencers)}
              >
                <MoreHorizontal className="w-4 h-4 mr-2" />
                {showAllInfluencers ? "Show Less" : "Show More"}
              </Button>
            </div>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayedInfluencers.map((influencer) => (
                  <Card
                    key={influencer.id}
                    className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20"
                  >
                    <CardContent className="p-6 h-full">
                      {/* First Row: Image on left, Quick Actions on right */}
                      <div className="flex gap-6 mb-6">
                        {/* Left: Image */}
                        <div className="relative w-48 h-48 flex-shrink-0">
                          <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                            {/* AI Consistency Status Badge positioned at top right */}
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
                                src={cleanImageUrl(influencer.image_url) || ""}
                                alt={`${influencer.name_first} ${influencer.name_last}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col w-full h-full items-center justify-center">
                                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-sm font-semibold text-center">
                                  No image found
                                </h3>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Quick Actions */}
                        <div className="flex-1 flex flex-col justify-center space-y-3">
                          <h3 className="font-semibold text-xl group-hover:text-ai-purple-500 transition-colors mb-4">
                            {influencer.name_first} {influencer.name_last}
                          </h3>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm px-3 py-2 h-auto"
                              onClick={() => handleCreateImage(influencer.id)}
                              data-testid={`button-create-image-${influencer.id}`}
                            >
                              <Image className="w-4 h-4 mr-2" />
                              Create Image
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm px-3 py-2 h-auto"
                              onClick={() => handleCreateVideo(influencer.id)}
                              data-testid={`button-create-video-${influencer.id}`}
                            >
                              <Volume2 className="w-4 h-4 mr-2" />
                              Create Video
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm px-3 py-2 h-auto"
                              onClick={() =>
                                handleEditInfluencer(influencer.id)
                              }
                              data-testid={`button-edit-influencer-${influencer.id}`}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm px-3 py-2 h-auto"
                              onClick={() => handleManageBio(influencer.id)}
                              data-testid={`button-manage-bio-${influencer.id}`}
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Bio
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                            onClick={() =>
                              handleTrainCharacterConsistency(influencer.id)
                            }
                            data-testid={`button-train-consistency-${influencer.id}`}
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            Train Character Consistency
                          </Button>
                        </div>
                      </div>

                      {/* Second Row: Influencer Information */}
                      <div className="space-y-4">
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                            Influencer Details
                          </h4>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Type:
                              </span>
                              <span className="ml-2 font-medium">
                                {influencer.influencer_type || "Not specified"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Age:
                              </span>
                              <span className="ml-2 font-medium">
                                {influencer.age || "Not specified"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Sex:
                              </span>
                              <span className="ml-2 font-medium">
                                {influencer.sex || "Not specified"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Origin:
                              </span>
                              <span className="ml-2 font-medium">
                                {influencer.origin_birth || "Not specified"}
                              </span>
                            </div>
                          </div>

                          {influencer.notes && (
                            <div className="mt-4">
                              <span className="text-muted-foreground text-sm">
                                Description:
                              </span>
                              <p className="mt-1 text-sm text-foreground">
                                {influencer.notes.length > 100
                                  ? `${influencer.notes.substring(0, 100)}...`
                                  : influencer.notes}
                              </p>
                            </div>
                          )}

                          {influencer.lifestyle && (
                            <div className="mt-4">
                              <span className="text-muted-foreground text-sm">
                                Lifestyle:
                              </span>
                              <p className="mt-1 text-sm text-foreground">
                                {influencer.lifestyle}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Character Consistency Training Modal */}
          <Dialog
            open={showCharacterConsistencyModal}
            onOpenChange={setShowCharacterConsistencyModal}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Train Character Consistency</DialogTitle>
                <DialogDescription>
                  Upload a high-quality image to train your AI influencer for
                  consistent character generation.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {selectedInfluencerData && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Training for: {selectedInfluencerData.name_first}{" "}
                      {selectedInfluencerData.name_last}
                    </h3>
                  </div>
                )}

                {/* Profile Image Section */}
                {selectedProfileImage && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Profile Image:</h4>
                    <div className="flex flex-col items-center space-y-4">
                      <img
                        src={selectedProfileImage}
                        alt="Profile"
                        className="w-48 h-48 object-cover rounded-lg border"
                      />
                      <Button
                        onClick={handleCopyProfileImage}
                        disabled={isCopyingImage}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isCopyingImage ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Use Profile Image
                      </Button>
                    </div>
                  </div>
                )}

                {/* File Upload Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Or Upload New Training Image:</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          setUploadedImageUrl(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                      id="training-image-upload"
                    />
                    <label
                      htmlFor="training-image-upload"
                      className="cursor-pointer flex flex-col items-center space-y-4"
                    >
                      <Upload className="w-12 h-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium">
                          Click to upload training image
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Uploaded Image Preview */}
                  {uploadedImageUrl && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Training Image Preview:</h4>
                      <div className="flex flex-col items-center space-y-4">
                        <img
                          src={uploadedImageUrl}
                          alt="Training preview"
                          className="w-48 h-48 object-cover rounded-lg border"
                        />
                        <Button
                          onClick={() => {
                            setUploadedFile(null);
                            if (uploadedImageUrl) {
                              URL.revokeObjectURL(uploadedImageUrl);
                            }
                            setUploadedImageUrl(null);
                          }}
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCharacterConsistencyModal(false);
                      setUploadedFile(null);
                      if (uploadedImageUrl) {
                        URL.revokeObjectURL(uploadedImageUrl);
                      }
                      setUploadedImageUrl(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={proceedWithLoraTraining}
                    disabled={!uploadedFile || isCopyingImage}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isCopyingImage ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Start Training
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Credit Confirmation Modal */}
          {showGemWarning && gemCostData && (
            <CreditConfirmationModal
              isOpen={showGemWarning}
              onClose={() => setShowGemWarning(false)}
              onConfirm={() => {
                setShowGemWarning(false);
                // Additional confirmation logic would go here
              }}
              gemCostData={gemCostData}
              userCredits={userData.credits || 0}
              userId={userData.id || ""}
            />
          )}
        </>
      )}
    </div>
  );
}
