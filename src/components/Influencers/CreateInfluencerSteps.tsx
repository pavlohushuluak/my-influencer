import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { addInfluencer } from '@/store/slices/influencersSlice';
import { ChevronRight, ChevronLeft, Loader2, Save, X, User, Sparkles, Palette, Settings } from 'lucide-react';
import { Influencer } from '@/types/influencer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Constants
const INFLUENCER_TYPES = ['Visual only', 'Full persona'];
const JOB_AREAS = ['Technology', 'Fashion', 'Fitness', 'Food', 'Travel', 'Lifestyle', 'Education', 'Business', 'Entertainment', 'Health'];
const SPEECH_STYLES = ['Casual', 'Professional', 'Friendly', 'Authoritative', 'Humorous', 'Educational', 'Inspirational', 'Confident'];
const HUMOR_STYLES = ['Witty', 'Sarcastic', 'Playful', 'Dry', 'Self-deprecating', 'Observational', 'Absurd', 'Clever'];

interface CreateInfluencerStepsProps {
  onComplete: () => void;
}

interface Option {
  label: string;
  value: string;
  image?: string;
}

interface InfluencerData {
  influencer_type: string;
  category: string;
  name_first: string;
  name_last: string;
  sex: string;
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
  makeup_style: string;
  skin_tone: string;
  body_type: string;
  color_palette: string[];
  clothing_style_everyday: string;
  clothing_style_occasional: string;
  clothing_style_home: string;
  clothing_style_sports: string;
  clothing_style_sexy_dress: string;
  home_environment: string;
  age_lifestyle: string;
  origin_birth: string;
  origin_residence: string;
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
}

export function CreateInfluencerSteps({ onComplete }: CreateInfluencerStepsProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('basic');
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);

  const [influencerData, setInfluencerData] = useState<InfluencerData>({
    influencer_type: '', // 'Visual only' or 'Full persona'
    category: '', // 'Lifestyle' or 'Educational'
    name_first: '',
    name_last: '',
    sex: '',
    cultural_background: '',
    hair_length: '',
    hair_color: '',
    hair_style: '',
    eye_color: '',
    lip_style: '',
    nose_style: '',
    eyebrow_style: '',
    face_shape: '',
    facial_features: '',
    makeup_style: '',
    skin_tone: '',
    body_type: '',
    color_palette: [],
    clothing_style_everyday: '',
    clothing_style_occasional: '',
    clothing_style_home: '',
    clothing_style_sports: '',
    clothing_style_sexy_dress: '',
    home_environment: '',
    // Full persona additional fields
    age_lifestyle: '',
    origin_birth: '',
    origin_residence: '',
    content_focus: [],
    content_focus_areas: [],
    job_area: '',
    job_title: '',
    job_vibe: '',
    hobbies: [],
    social_circle: '',
    strengths: [],
    weaknesses: [],
    speech_style: [],
    humor: [],
    core_values: [],
    current_goals: [],
    background_elements: []
  });

  const handleOptionSelect = (field: string, value: string) => {
    setInfluencerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const steps = [
    { 
      id: 1, 
      title: 'Type', 
      description: 'Choose influencer type',
      icon: User
    },
    { 
      id: 2, 
      title: 'Category', 
      description: 'Select content category',
      icon: Sparkles
    },
    { 
      id: 3, 
      title: 'Details', 
      description: 'Basic information',
      icon: Palette
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
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  isCurrent ? "text-primary" : "text-gray-500"
                )} />
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Influencer Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={influencerData.influencer_type === 'Visual only' ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('influencer_type', 'Visual only')}
                  className={cn(
                    "h-24 transition-all duration-300",
                    influencerData.influencer_type === 'Visual only' 
                      ? "bg-primary hover:bg-primary/90" 
                      : "hover:bg-amber-500"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <User className="w-6 h-6" />
                    <span className="font-medium">Visual only</span>
                  </div>
                </Button>
                <Button
                  variant={influencerData.influencer_type === 'Full persona' ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('influencer_type', 'Full persona')}
                  className={cn(
                    "h-24 transition-all duration-300",
                    influencerData.influencer_type === 'Full persona' 
                      ? "bg-primary hover:bg-primary/90" 
                      : "hover:bg-amber-500"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    <span className="font-medium">Full persona</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Category</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={influencerData.category === 'Lifestyle' ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('category', 'Lifestyle')}
                  className={cn(
                    "h-24 transition-all duration-300",
                    influencerData.category === 'Lifestyle' 
                      ? "bg-primary hover:bg-primary/90" 
                      : "hover:bg-amber-500"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    <span className="font-medium">Lifestyle</span>
                  </div>
                </Button>
                <Button
                  variant={influencerData.category === 'Educational' ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('category', 'Educational')}
                  className={cn(
                    "h-24 transition-all duration-300",
                    influencerData.category === 'Educational' 
                      ? "bg-primary hover:bg-primary/90" 
                      : "hover:bg-amber-500"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Palette className="w-6 h-6" />
                    <span className="font-medium">Educational</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={influencerData.name_first}
                      onChange={(e) => handleOptionSelect('name_first', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={influencerData.name_last}
                      onChange={(e) => handleOptionSelect('name_last', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </CardContent>
            </Tabs>
          </div>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
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

  const handleSubmit = () => {
    const newInfluencer: Influencer = {
      id: Date.now().toString(),
      name: `${influencerData.name_first} ${influencerData.name_last}`,
      name_first: influencerData.name_first,
      name_last: influencerData.name_last,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face',
      description: `${influencerData.category} Influencer`,
      personality: influencerData.speech_style?.join(', ') || '',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      generatedContent: 0,
      status: 'active',
      tags: influencerData.content_focus || [],
      ...influencerData
    };

    dispatch(addInfluencer(newInfluencer));
    navigate('/influencers/edit', { state: { influencerData: newInfluencer } });
    onComplete();
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl font-bold text-center mb-2">Create Your Influencer</CardTitle>
          <p className="text-center text-gray-500">Follow these steps to create your perfect influencer persona</p>
          <StepSlider />
        </CardHeader>
        <CardContent>
          <div className="pr-4">
            {renderStepContent()}
          </div>
          <div className="flex flex-col md:flex-row gap-2 justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="px-6 hover:bg-amber-600 transition-colors duration-300"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {currentStep < 3 ? (
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
                disabled={isOptionsLoading}
                className="px-6 bg-primary hover:bg-primary/90 transition-colors duration-300"
              >
                {isOptionsLoading ? (
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