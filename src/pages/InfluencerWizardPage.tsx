import { InfluencerWizard } from '@/components/Influencers/InfluencerWizard';
import { useNavigate } from 'react-router-dom';

export default function InfluencerWizardPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate back to influencers page after completion
    navigate('/influencers');
  };

  return <InfluencerWizard onComplete={handleComplete} />;
} 