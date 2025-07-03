import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Loader2, User, Sparkles, Palette, Settings, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RootState } from '@/store/store';
import { toast } from 'sonner';

interface InfluencerWizardProps {
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
  notes: string;
}

interface Option {
  label: string;
  image: string;
  description?: string;
}

interface SexOption {
  value: string;
  label: string;
  description: string;
  image: string;
}

const steps = [
  { 
    id: 1, 
    title: 'Sex Selection', 
    description: 'Choose the sex of your influencer',
    icon: User
  },
  { 
    id: 2, 
    title: 'Influencer Type', 
    description: 'Select your influencer type',
    icon: Sparkles
  },
  { 
    id: 3, 
    title: 'Basic Details', 
    description: 'Add basic information',
    icon: Palette
  },
  { 
    id: 4, 
    title: 'Review & Create', 
    description: 'Review and create your influencer',
    icon: Settings
  }
];

export function InfluencerWizard({ onComplete }: InfluencerWizardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sexOptions, setSexOptions] = useState<SexOption[]>([]);
  const [isLoadingSexOptions, setIsLoadingSexOptions] = useState(true);
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
    prompt: '',
    notes: ''
  });

  // Fetch sex options from API
  useEffect(() => {
    const fetchSexOptions = async () => {
      try {
        setIsLoadingSexOptions(true);
        const response = await fetch('https://api.nymia.ai/v1/fieldoptions?fieldtype=sex', {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          if (responseData && responseData.fieldoptions && Array.isArray(responseData.fieldoptions)) {
            setSexOptions(responseData.fieldoptions.map((item: any) => ({
              value: item.label,
              label: item.label,
              image: item.image,
              description: item.description
            })));
          } else {
            console.error('Invalid response format or no fieldoptions found');
            // Fallback to default options
            setSexOptions([
              {
                value: 'Female',
                label: 'Female',
                description: 'Create a female influencer persona',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
              },
              {
                value: 'Male',
                label: 'Male',
                description: 'Create a male influencer persona',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setIsLoadingSexOptions(false);
      }
    };

    fetchSexOptions();
  }, []);

  const handleOptionSelect = (field: string, value: string | boolean) => {
    setInfluencerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Create the influencer in the database
      const response = await fetch('https://db.nymia.ai/rest/v1/influencer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify(influencerData)
      });

      if (response.ok) {
        const newInfluencer = await response.json();
        toast.success('Influencer created successfully!');
        navigate('/influencers/edit', { state: { influencerData: newInfluencer[0] } });
        onComplete();
      } else {
        throw new Error('Failed to create influencer');
      }
    } catch (error) {
      console.error('Error creating influencer:', error);
      toast.error('Failed to create influencer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">
                  Choose Your Influencer's Sex
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  As a first step, please select the desired sex of your influencer.
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              {isLoadingSexOptions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Loading sex options...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                  {sexOptions.map((option) => (
                    <Card
                      key={option.label}
                      className={cn(
                        "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                        influencerData.sex === option.value
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-xl scale-105"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                      )}
                      onClick={() => handleOptionSelect('sex', option.value)}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="relative">
                            <img
                              src={`https://images.nymia.ai/cdn-cgi/image/w=400/wizard/${option.image}`}
                              alt={option.label}
                              className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                            />
                            {influencerData.sex === option.value && (
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
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 via-pink-600 to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Select Influencer Type
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Choose the type of influencer you want to create. This will define their content focus, personality, and overall brand direction.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {['Lifestyle', 'Educational', 'Fashion', 'Fitness', 'Food', 'Travel'].map((type) => (
                <Card
                  key={type}
                  className={cn(
                    "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                    influencerData.influencer_type === type
                      ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-xl scale-105"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                  )}
                  onClick={() => handleOptionSelect('influencer_type', type)}
                >
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <div className={cn(
                        "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300",
                        influencerData.influencer_type === type
                          ? "bg-gradient-to-br from-purple-500 to-pink-600 scale-110"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 group-hover:from-purple-100 group-hover:to-pink-100 dark:group-hover:from-purple-900/30 dark:group-hover:to-pink-900/30"
                      )}>
                        <Sparkles className={cn(
                          "w-8 h-8 transition-colors duration-300",
                          influencerData.influencer_type === type
                            ? "text-white"
                            : "text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                        )} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {type}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {type} content and lifestyle focus with engaging personality
                        </p>
                      </div>
                      {influencerData.influencer_type === type && (
                        <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-2xl">
                <Palette className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Basic Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Add some basic details to personalize your influencer. You can modify everything later in the detailed editor.
                </p>
              </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
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

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Age & Lifestyle
                </label>
                <select
                  value={influencerData.age_lifestyle}
                  onChange={(e) => handleOptionSelect('age_lifestyle', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:border-green-300 dark:hover:border-green-600"
                >
                  <option value="">Select age & lifestyle</option>
                  <option value="Teen (16-19)">Teen (16-19)</option>
                  <option value="Young Adult (20-25)">Young Adult (20-25)</option>
                  <option value="Adult (26-35)">Adult (26-35)</option>
                  <option value="Mature (36-50)">Mature (36-50)</option>
                  <option value="Senior (50+)">Senior (50+)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Review & Create
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                  Review your influencer details and create your new influencer persona. You can customize everything further after creation.
                </p>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sex:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1">
                          {influencerData.sex}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type:</span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1">
                          {influencerData.influencer_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {influencerData.name_first} {influencerData.name_last}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Age & Lifestyle:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {influencerData.age_lifestyle}
                        </span>
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return influencerData.sex !== '';
      case 2:
        return influencerData.influencer_type !== '';
      case 3:
        return influencerData.name_first !== '' && influencerData.name_last !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="justify-center items-center flex">
      <Card className="w-full max-w-5xl border-0">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Create Your Influencer
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
            This wizard will guide you step by step through the creation of a basic influencer with your desired details.
            <br />
            <span className="font-medium text-gray-700 dark:text-gray-300">You can modify everything later in the influencer dataset.</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-8">

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-base font-medium border-2 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Influencer
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 