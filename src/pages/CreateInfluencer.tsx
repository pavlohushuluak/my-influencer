import { CreditConfirmationModal } from "@/components/CreditConfirmationModal";
import { CreateInfluencerSteps } from "@/components/Influencers/CreateInfluencerSteps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RootState } from "@/store/store";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function CreateInfluencer() {
  const [showSteps, setShowSteps] = useState(false);
  const [isCheckingGems, setIsCheckingGems] = useState(false);
  const [showGemWarning, setShowGemWarning] = useState(false);
  const [gemCostData, setGemCostData] = useState<any>(null);
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);

  // Check gem cost for influencer wizard
  const checkGemCost = async (itemType: string) => {
    try {
      setIsCheckingGems(true);
      const response = await fetch("https://api.nymia.ai/v1/getgems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user_id: userData.id,
          item: itemType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check credit cost");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking gem cost:", error);
      toast.error("Failed to check gem cost. Please try again.");
      return null;
    } finally {
      setIsCheckingGems(false);
    }
  };

  // Handle start wizard with gem check
  const handleStartWizard = async () => {
    const gemData = await checkGemCost("nymia_image");
    if (!gemData) return;

    // Calculate total required gems for preview generation (3 images)
    const totalRequiredGems = gemData.gems * 3;

    setGemCostData({
      ...gemData,
      gems: totalRequiredGems,
      originalGemsPerImage: gemData.gems,
    });

    // Check if user has enough gems
    if (userData.credits < totalRequiredGems) {
      setShowGemWarning(true);
      return;
    } else {
      // Show confirmation for gem cost
      setShowGemWarning(true);
      return;
    }
  };

  // Execute navigation after gem confirmation
  const executeStartWizard = () => {
    navigate("/influencers/wizard");
  };

  if (showSteps) {
    return <CreateInfluencerSteps onComplete={() => setShowSteps(false)} />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent mb-12">
        Create New Influencer
      </h1>

      {/* New Title and Description */}
      <div className="flex flex-col items-center justify-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-white">
          How do you want to create your AI Influencer?
        </h2>
        <p className="text-md md:text-lg text-muted-foreground text-center">
          Choose the path that fits your style - no wrong answer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center justify-center flex flex-col items-center">
            <img
              src="/tool.png"
              alt="Create from Scratch"
              className="w-20 h-16 mb-8 mt-4"
            />
            <h2 className="text-xl font-semibold mb-4">Build from Scratch</h2>
            <p className="text-muted-foreground mb-4">
              Start with a blank slate and customize every aspect of your
              influencer.
            </p>
            <Button onClick={() => setShowSteps(true)}>Get Started</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center justify-center flex flex-col items-center relative">
            {/* Recommend Badge */}
            <Badge className="absolute top-3 right-3 bg-blue-600 text-white z-10">
              RECOMMENDED
            </Badge>
            <img
              src="/brain.png"
              alt="Create from Scratch"
              className="w-24 h-24 mb-4"
            />
            <h2 className="text-xl font-semibold mb-4">Guided Wizard</h2>
            <p className="text-muted-foreground mb-4">
              Let us walk you through the process of creating your influencer
              profile.
            </p>
            <Button onClick={handleStartWizard} disabled={isCheckingGems}>
              {isCheckingGems ? "Checking Gems..." : "Start Wizard"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center justify-center flex flex-col items-center">
            <img
              src="/template.png"
              alt="Create from Scratch"
              className="w-30 h-24 mb-4"
            />
            <h2 className="text-xl font-semibold mb-4">Use a Template</h2>
            <p className="text-muted-foreground mb-4">
              Choose from pre-designed templates and customize as needed.
            </p>
            <Button onClick={() => navigate("/influencers/templates")}>
              Select Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Gem Warning Modal */}
      <CreditConfirmationModal
        isOpen={showGemWarning}
        onClose={() => setShowGemWarning(false)}
        onConfirm={() => {
          setShowGemWarning(false);
          executeStartWizard();
        }}
        gemCostData={
          gemCostData
            ? {
                id: 1,
                item: "nymia_image",
                description: "Generate preview images for influencer wizard",
                gems: gemCostData.gems,
                originalGemsPerImage: gemCostData.originalGemsPerImage,
              }
            : null
        }
        userCredits={userData.credits}
        userId={userData.id}
        numberOfItems={3}
        itemType="preview image"
        confirmButtonText="Continue to Wizard"
      />
    </div>
  );
}
