import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { User, Sparkles, Loader2, Check, Settings, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';
import { formatDate, parseDate } from '@/store/slices/influencersSlice';
import { toast } from 'sonner';
import config from '@/config/config';

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
  age: string;
  lifestyle: string;
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
  notes: string;
  created_at?: string;
  updated_at?: string;
}

interface Option {
  label: string;
  image: string;
  description?: string;
}

interface SexOption {
  label: string;
  description: string;
  image: string;
}



const INFLUENCER_TYPES = ['Lifestyle', 'Educational'];

export function CreateInfluencerSteps({ onComplete }: CreateInfluencerStepsProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSexOptions, setIsLoadingSexOptions] = useState(false);
  const [isLoadingAge, setIsLoadingAge] = useState(false);
  // Options state
  const [sexOptions, setSexOptions] = useState<SexOption[]>([]);
  const [ageOptions, setAgeOptions] = useState<Option[]>([]);

  // Influencer data state
  const [influencerData, setInfluencerData] = useState<InfluencerData>({
    user_id: userData.id,
    influencer_type: 'Lifestyle',
    image_url: '',
    name_first: '',
    name_last: '',
    visual_only: true,
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
    age: '',
    lifestyle: '',
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
    prompt: '',
    notes: ''
  });

  // Fetch options on component mount
  useEffect(() => {
    fetchSexOptions();
    fetchAgeOptions();
  }, []);

  const fetchSexOptions = async () => {
    setIsLoadingSexOptions(true);
    try {
      const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=sex`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Handle the response structure - extract fieldoptions array
        if (data && Array.isArray(data.fieldoptions)) {
          setSexOptions(data.fieldoptions);
        } else {
          console.error('Unexpected sex options response structure:', data);
          setSexOptions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching sex options:', error);
      setSexOptions([]);
    } finally {
      setIsLoadingSexOptions(false);
    }
  };

  const fetchAgeOptions = async () => {
    setIsLoadingAge(true);
    try {
      const response = await fetch(`${config.backend_url}/fieldoptions?fieldtype=age`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Handle the response structure - extract fieldoptions array
        if (data && Array.isArray(data.fieldoptions)) {
          setAgeOptions(data.fieldoptions);
        } else {
          console.error('Unexpected age options response structure:', data);
          setAgeOptions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching age options:', error);
      setAgeOptions([]);
    } finally {
      setIsLoadingAge(false);
    }
  };



  const handleOptionSelect = (field: string, value: string | boolean) => {
    setInfluencerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const StepSlider = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center w-full max-w-4xl">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle and Content */}
            <div className="flex flex-col items-center relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 shadow-lg border-2",
                currentStep >= step.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-blue-200 dark:shadow-blue-900/30"
                  : "bg-white text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
              )}>
                {currentStep > step.id ? (
                  <Check className="w-6 h-6" />
                ) : (
                  step.icon ? <step.icon className="w-6 h-6" /> : step.id
                )}
              </div>
              <div className="mt-3 text-center">
                <div className={cn(
                  "text-sm font-semibold transition-colors duration-300",
                  currentStep >= step.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 relative">
                <div className={cn(
                  "h-1 rounded-full transition-all duration-500 relative overflow-hidden",
                  currentStep > step.id
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700"
                )}>
                  {/* Animated progress line */}
                  {currentStep > step.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                  )}
                </div>
                {/* Subtle shadow for depth */}
                <div className="absolute inset-0 h-1 bg-black/5 dark:bg-white/5 rounded-full blur-sm"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const steps = [
    {
      id: 1,
      title: 'Type & Mode',
      description: 'Visual only & Lifestyle',
      icon: Settings
    },
    {
      id: 2,
      title: 'Sex Selection',
      description: 'Choose gender',
      icon: User
    },
    {
      id: 3,
      title: 'Age Selection',
      description: 'Choose age range',
      icon: User
    },
    {
      id: 4,
      title: 'Name Your Influencer',
      description: 'Enter or generate name',
      icon: User
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">
                  Choose Your Influencer Type & Mode
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Select the type and mode for your influencer. Visual only influencers focus on appearance, while full influencers include personality and content details.
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Visual Only Toggle */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Visual Only Mode
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Focus on appearance and visual characteristics only. Perfect for fashion, beauty, and lifestyle content.
                      </p>
                    </div>
                    <Switch
                      checked={influencerData.visual_only}
                      onCheckedChange={(checked) => handleOptionSelect('visual_only', checked)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Influencer Type Selection */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Influencer Type
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Choose the primary focus area for your influencer
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {INFLUENCER_TYPES.map((type) => (
                        <Card
                          key={type}
                          className={cn(
                            "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                            influencerData.influencer_type === type
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-xl scale-105"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                          )}
                          onClick={() => handleOptionSelect('influencer_type', type)}
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="text-center space-y-2">
                                <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                  {type}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  {type === 'Lifestyle'
                                    ? 'Fashion, beauty, travel, and lifestyle content'
                                    : 'Educational, informative, and knowledge-sharing content'
                                  }
                                </p>
                              </div>
                              {influencerData.influencer_type === type && (
                                <div className="flex justify-center">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">
                  Select Your Influencer's Gender
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  As a first step, please select the desired sex of your influencer.
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              {isLoadingSexOptions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading sex options...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                  {Array.isArray(sexOptions) && sexOptions.length > 0 ? (
                    sexOptions.map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.sex === option.label
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                        )}
                        onClick={() => handleOptionSelect('sex', option.label)}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings400/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.sex === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No sex options available. Please try refreshing the page.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">
                  Age Selection
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the age range that best represents your influencer. This will help define their personality, interests, and content style.
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-4xl">
              {isLoadingAge ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading age options...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(ageOptions) && ageOptions.length > 0 ? (
                    ageOptions.map((option) => (
                      <Card
                        key={option.label}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                          influencerData.age === option.label
                            ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-xl scale-105"
                            : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                        )}
                        onClick={() => {
                          handleOptionSelect('age', option.label);
                          toast.success(`${option.label} selected`, {
                            id: 'age-selection',
                            position: 'bottom-center'
                          });
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={`${config.data_url}/wizard/mappings400/${option.image}`}
                                alt={option.label}
                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                              />
                              {influencerData.age === option.label && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No age options available. Please try refreshing the page.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Name Your Influencer
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Give your influencer a unique and memorable name. We'll also suggest some names based on your selections.
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Name Input Fields */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={influencerData.name_first}
                          onChange={(e) => handleOptionSelect('name_first', e.target.value)}
                          placeholder="Enter first name"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-green-300 dark:hover:border-green-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={influencerData.name_last}
                          onChange={(e) => handleOptionSelect('name_last', e.target.value)}
                          placeholder="Enter last name"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-green-300 dark:hover:border-green-600"
                        />
                      </div>
                    </div>


                  </div>
                </CardContent>
              </Card>


            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!influencerData.name_first || !influencerData.name_last) {
      toast.error('Please enter both first and last name');
      return;
    }

    // Add current timestamp for new influencer
    const currentTimestamp = new Date().toISOString();
    const influencerDataWithDates = {
      ...influencerData,
      created_at: currentTimestamp,
      updated_at: currentTimestamp
    };

            navigate('/influencers/profiles', { state: { influencerData: influencerDataWithDates, create: true } });
    onComplete();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return influencerData.visual_only !== undefined && influencerData.influencer_type;
      case 2:
        return influencerData.sex !== '';
      case 3:
        return influencerData.age !== '';
      case 4:
        return influencerData.name_first !== '' && influencerData.name_last !== '';
      default:
        return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <StepSlider />

      <div className="space-y-8">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            Back
          </Button>

          <div className="flex gap-4">
            {currentStep === steps.length ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create your Influencer now
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>


    </div>
  );
} 