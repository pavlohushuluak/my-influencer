import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft, Loader2, Save, X, User, Sparkles, Palette, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
interface CreateInfluencerStepsProps {
  onComplete: () => void;
}

interface InfluencerData {
  user_id: string;
  influencer_type: string;
  image_url: string;
  name_first: string;
  name_last: string;
  visual_only: boolean;
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
  prompt: string;
}

export function CreateInfluencerSteps({ onComplete }: CreateInfluencerStepsProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('basic');
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const userData = useSelector((state: RootState) => state.user);

  const [influencerData, setInfluencerData] = useState<InfluencerData>({
    user_id: userData.id,
    influencer_type: 'Lifestyle',
    image_url: '',
    name_first: '',
    name_last: '',
    visual_only: false,
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
    bust_size: '',
    skin_tone: '',
    body_type: '',
    color_palette: [],
    clothing_style_everyday: '',
    clothing_style_occasional: '',
    clothing_style_home: '',
    clothing_style_sports: '',
    clothing_style_sexy_dress: '',
    home_environment: '',
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
    background_elements: [],
    prompt: ''
  });

  const handleOptionSelect = (field: string, value: string | boolean) => {
    setInfluencerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const steps = [
    { 
      id: 1, 
      title: 'Visual', 
      description: 'Choose your visual style',
      icon: User
    },
    { 
      id: 2, 
      title: 'Influencer type', 
      description: 'Select your influencer type',
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
                  variant={influencerData.visual_only === true ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('visual_only', true)}
                  className={cn(
                    "h-24 transition-all duration-300",
                    influencerData.visual_only === true 
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
                  variant={influencerData.visual_only === false ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('visual_only', false)}
                  className={cn(
                    "h-24 transition-all duration-300",
                    influencerData.visual_only === false 
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
                  variant={influencerData.influencer_type === 'Lifestyle' ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('influencer_type', 'Lifestyle')}
                  className={cn(
                    "h-24 transition-all duration-300",
                    influencerData.influencer_type === 'Lifestyle' 
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
                  variant={influencerData.influencer_type === 'Educational' ? 'default' : 'outline'}
                  onClick={() => handleOptionSelect('influencer_type', 'Educational')}
                  className={cn(
                    "h-24 transition-all duration-300",
                    influencerData.influencer_type === 'Educational' 
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
      if(influencerData.name_first.length > 0 && influencerData.name_last.length > 0) {
        handleSubmit();
      }
      else {
        toast.error('Please enter your first and last name');
      }
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

  const handleSubmit = async() => {
    // console.log(influencerData);
    navigate('/influencers/edit', { state: { influencerData: influencerData, create: true } });
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
          <div>
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
                onClick={handleNext} 
                disabled={isOptionsLoading}
                className="px-6 bg-primary hover:bg-primary/90 transition-colors duration-300"
              >
                {isOptionsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Basic Info'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 