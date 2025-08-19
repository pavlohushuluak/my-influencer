import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateInfluencerSteps } from '@/components/Influencers/CreateInfluencerSteps';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { toast } from 'sonner';

export function CreateInfluencer() {
  const [showSteps, setShowSteps] = useState(false);
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [creditCostData, setCreditCostData] = useState<any>(null);
  const navigate = useNavigate();
  const userData = useSelector((state: RootState) => state.user);

  // Check credit cost for influencer wizard
  const checkCreditCost = async (itemType: string) => {
    try {
      setIsCheckingCredits(true);
      const response = await fetch('https://api.nymia.ai/v1/getgems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user_id: userData.id,
          item: itemType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to check credit cost');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking credit cost:', error);
      toast.error('Failed to check credit cost. Please try again.');
      return null;
    } finally {
      setIsCheckingCredits(false);
    }
  };

  // Handle start wizard with credit check
  const handleStartWizard = async () => {
    const creditData = await checkCreditCost('nymia_image');
    if (!creditData) return;

    // Calculate total required credits for preview generation (3 images)
    const totalRequiredCredits = creditData.gems * 3;
    
    setCreditCostData({
      ...creditData,
      gems: totalRequiredCredits,
      originalGemsPerImage: creditData.gems
    });

    // Check if user has enough credits
    if (userData.credits < totalRequiredCredits) {
      setShowCreditWarning(true);
      return;
    } else {
      // Show confirmation for credit cost
      setShowCreditWarning(true);
      return;
    }
  };

  // Execute navigation after credit confirmation
  const executeStartWizard = () => {
    navigate('/influencers/wizard');
  };

  if (showSteps) {
    return <CreateInfluencerSteps onComplete={() => setShowSteps(false)} />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent mb-12">Create New Influencer</h1>

      {/* New Title and Description */}
      <div className="flex flex-col items-center justify-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-white">How do you want to create your AI Influencer?</h2>
        <p className="text-md md:text-lg text-muted-foreground text-center">Choose the path that fits your style - no wrong answer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center justify-center flex flex-col items-center">
            <img src="/tool.png" alt="Create from Scratch" className="w-20 h-16 mb-8 mt-4" />
            <h2 className="text-xl font-semibold mb-4">Build from Scratch</h2>
            <p className="text-muted-foreground mb-4">
              Start with a blank slate and customize every aspect of your influencer.
            </p>
            <Button onClick={() => setShowSteps(true)}>Get Started</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center justify-center flex flex-col items-center relative">
            {/* Recommend Badge */}
            <Badge className="absolute top-3 right-3 bg-blue-600 text-white z-10">RECOMMENDED</Badge>
            <img src="/brain.png" alt="Create from Scratch" className="w-24 h-24 mb-4" />
            <h2 className="text-xl font-semibold mb-4">Guided Wizard</h2>
            <p className="text-muted-foreground mb-4">
              Let us walk you through the process of creating your influencer profile.
            </p>
            <Button 
              onClick={handleStartWizard}
              disabled={isCheckingCredits}
            >
              {isCheckingCredits ? 'Checking Credits...' : 'Start Wizard'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center justify-center flex flex-col items-center">
            <img src="/template.png" alt="Create from Scratch" className="w-30 h-24 mb-4" />
            <h2 className="text-xl font-semibold mb-4">Use a Template</h2>
            <p className="text-muted-foreground mb-4">
              Choose from pre-designed templates and customize as needed.
            </p>
            <Button onClick={() => navigate('/influencers/templates')}>Select Template</Button>
          </CardContent>
        </Card>
      </div>

      {/* Credit Warning Modal */}
      <Dialog open={showCreditWarning} onOpenChange={setShowCreditWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Credit Cost Information</DialogTitle>
            <DialogDescription>
              {userData.credits >= (creditCostData?.gems || 0) ? (
                <>
                  Using the wizard will generate preview images that cost <strong>{creditCostData?.gems} credits</strong> total.
                  You currently have <strong>{userData.credits} credits</strong>.
                  {creditCostData?.originalGemsPerImage && (
                    <div className="mt-2 text-sm text-gray-600">
                      ({creditCostData.originalGemsPerImage} credits per preview image)
                    </div>
                  )}
                </>
              ) : (
                <>
                  Insufficient credits! The wizard preview generation requires <strong>{creditCostData?.gems} credits</strong>,
                  but you only have <strong>{userData.credits} credits</strong>.
                  Please purchase more credits to continue.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreditWarning(false)}>
              Cancel
            </Button>
            {userData.credits >= (creditCostData?.gems || 0) ? (
              <Button 
                onClick={() => {
                  setShowCreditWarning(false);
                  executeStartWizard();
                }}
              >
                Continue to Wizard
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setShowCreditWarning(false);
                  toast.info('Please purchase credits to continue');
                }}
              >
                Buy Credits
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
