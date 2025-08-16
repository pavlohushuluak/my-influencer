import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addInfluencer } from '@/store/slices/influencersSlice';
import { ChevronRight, ChevronLeft, Loader2, Check, User, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CreateInfluencerWizardProps {
  onComplete: () => void;
}

interface InfluencerWizardData {
  name: string;
  description: string;
  personality: string[];
  niche: string;
}

const PERSONALITY_TRAITS = [
  'Friendly',
  'Creative',
  'Professional',
  'Humorous',
  'Authentic',
  'Confident',
  'Relatable',
  'Inspirational',
  'Educational',
  'Entertaining'
];

const NICHE_OPTIONS = [
  'Fashion & Beauty',
  'Technology',
  'Fitness & Health',
  'Food & Cooking',
  'Travel',
  'Lifestyle',
  'Business & Finance',
  'Education',
  'Entertainment',
  'Gaming'
];

export function CreateInfluencerWizard({ onComplete }: CreateInfluencerWizardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [influencerData, setInfluencerData] = useState<InfluencerWizardData>({
    name: '',
    description: '',
    personality: [],
    niche: ''
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setInfluencerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Influencer Name</Label>
              <Input
                id="name"
                value={influencerData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter influencer name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={influencerData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your influencer's persona and style"
                className="h-32"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Personality Traits</Label>
              <div className="grid grid-cols-2 gap-2">
                {PERSONALITY_TRAITS.map((trait) => (
                  <Button
                    key={trait}
                    variant={influencerData.personality.includes(trait) ? 'default' : 'outline'}
                    onClick={() => {
                      const newTraits = influencerData.personality.includes(trait)
                        ? influencerData.personality.filter(t => t !== trait)
                        : [...influencerData.personality, trait];
                      handleInputChange('personality', newTraits);
                    }}
                  >
                    {trait}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="niche">Niche/Type</Label>
              <Select
                value={influencerData.niche}
                onValueChange={(value) => handleInputChange('niche', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a niche" />
                </SelectTrigger>
                <SelectContent>
                  {NICHE_OPTIONS.map((niche) => (
                    <SelectItem key={niche} value={niche}>
                      {niche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
    else {
      onComplete();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to create the influencer
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the influencers list page
      navigate('/influencers/profiles');
      onComplete();
    } catch (error) {
      console.error('Error creating influencer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { 
      id: 1, 
      title: 'Basic Info', 
      description: 'Name and Description',
      icon: User
    },
    { 
      id: 2, 
      title: 'Personality', 
      description: 'Traits and Niche',
      icon: Sparkles
    }
  ];

  const StepSlider = () => (
    <div className="relative mb-12">
      {/* Progress Line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 -translate-y-1/2" />
      
      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;
          
          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center cursor-pointer transition-all duration-300",
                (isCompleted || isCurrent) ? "opacity-100" : "opacity-60"
              )}
              onClick={() => {
                if (isCompleted || isCurrent) {
                  setCurrentStep(step.id);
                }
              }}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  "shadow-lg hover:shadow-xl",
                  isCompleted && "bg-primary border-primary text-primary-foreground scale-110",
                  isCurrent && "border-primary bg-white scale-110",
                  !isCompleted && !isCurrent && "border-gray-300 bg-white"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isCurrent ? "text-primary" : "text-gray-500"
                  )} />
                )}
              </div>

              {/* Step Info */}
              <div className="mt-4 text-center">
                <div className={cn(
                  "text-sm font-semibold transition-colors duration-300",
                  isCurrent ? "text-primary" : "text-gray-700"
                )}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1 max-w-[120px]">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl font-bold text-center mb-2">Create Your Influencer</CardTitle>
          <p className="text-center text-gray-500">Follow these simple steps to create your perfect influencer persona</p>
          <StepSlider />
        </CardHeader>
        <CardContent>
          <div className="pr-4">
            {renderStepContent()}
          </div>
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="px-6 hover:bg-gray-100 transition-colors duration-300"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {currentStep < 2 ? (
              <Button 
                onClick={handleNext}
                className="px-6 bg-primary hover:bg-primary/90 transition-colors duration-300"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="px-6 bg-primary hover:bg-primary/90 transition-colors duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Influencer'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 