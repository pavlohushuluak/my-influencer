import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateInfluencerSteps } from '@/components/Influencers/CreateInfluencerSteps';
import { useNavigate } from 'react-router-dom';

export function CreateInfluencer() {
  const [showSteps, setShowSteps] = useState(false);
  const navigate = useNavigate();
  
  if (showSteps) {
    return <CreateInfluencerSteps onComplete={() => setShowSteps(false)} />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Influencer</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Create from Scratch</h2>
            <p className="text-muted-foreground mb-4">
              Start with a blank slate and customize every aspect of your influencer.
            </p>
            <Button onClick={() => setShowSteps(true)}>Get Started</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Create by Wizard</h2>
            <p className="text-muted-foreground mb-4">
              Follow a step-by-step wizard to create your influencer profile.
            </p>
            <Button onClick={() => navigate('/influencers/wizard')}>Start Wizard</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Use a Template</h2>
            <p className="text-muted-foreground mb-4">
              Choose from pre-designed templates and customize as needed.
            </p>
            <Button onClick={() => navigate('/influencers/templates')}>Select Template</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
