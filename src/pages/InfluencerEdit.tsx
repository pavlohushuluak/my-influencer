import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { updateInfluencer } from '@/store/slices/influencersSlice';
import { X, Plus, Save, Crown, Lock, Image, Settings, User } from 'lucide-react';
import { InfluencerCard } from '@/components/Influencers/InfluencerCard';

const HAIR_LENGTHS = ['Short', 'Medium', 'Long', 'Shoulder-Length'];
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Dark Blonde', 'Light Brown'];
const HAIR_STYLES = ['Straight', 'Wavy', 'Curly', 'Natural'];
const EYE_COLORS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray'];
const LIP_STYLES = ['Natural', 'Full', 'Thin', 'Glossy'];
const NOSE_STYLES = ['Straight', 'Upturned', 'Button', 'Roman'];
const FACE_SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Diamond'];
const SKIN_TONES = ['Fair', 'Medium', 'Tan', 'Dark'];
const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus Size'];
const CLOTHING_STYLES = ['Casual', 'Formal', 'Sporty', 'Elegant', 'Bohemian', 'Minimalist'];
const HOME_ENVIRONMENTS = ['Modern', 'Traditional', 'Minimalist', 'Bohemian', 'Industrial'];
const JOB_AREAS = ['Creative', 'Corporate', 'Tech', 'Healthcare', 'Education', 'Entertainment'];
const SPEECH_STYLES = ['Friendly', 'Professional', 'Casual', 'Formal', 'Energetic', 'Calm'];
const HUMOR_STYLES = ['Witty', 'Sarcastic', 'Dry', 'Playful', 'Absurd'];

// Subscription level features
const SUBSCRIPTION_FEATURES = {
  free: {
    name: 'Free',
    price: '$0',
    features: [
      'Basic influencer information',
      'Limited appearance customization',
      'Basic style options'
    ]
  },
  professional: {
    name: 'Professional',
    price: '$19.99/month',
    features: [
      'All Free features',
      'Advanced appearance customization',
      'Detailed personality traits',
      'Style & environment options',
      'Content focus customization'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: '$49.99/month',
    features: [
      'All Professional features',
      'Unlimited customization',
      'Priority support',
      'Advanced analytics',
      'API access'
    ]
  }
};

// Feature restrictions by subscription level
const FEATURE_RESTRICTIONS = {
  free: [
    'cultural_background',
    'hair_color',
    'eye_color',
    'skin_tone',
    'color_palette',
    'clothing_style_occasional',
    'clothing_style_sexy_dress',
    'home_environment',
    'content_focus',
    'content_focus_areas',
    'job_vibe',
    'social_circle',
    'speech_style',
    'humor',
    'core_values',
    'current_goals',
    'background_elements'
  ],
  professional: [
    'content_focus_areas',
    'job_vibe',
    'social_circle',
    'background_elements'
  ],
  enterprise: []
};

export default function InfluencerEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  
  const [showEditView, setShowEditView] = useState(false);
  const [subscriptionLevel, setSubscriptionLevel] = useState<'free' | 'professional' | 'enterprise'>('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);
  const [influencerData, setInfluencerData] = useState(location.state?.influencerData || {
    influencer_type: '',
    name_first: '',
    name_last: '',
    sex: '',
    age_lifestyle: '',
    origin_birth: '',
    origin_residence: '',
    cultural_background: '',
    hair_length: '',
    hair_color: '',
    hair_style: '',
    eye_color: '',
    lip_style: '',
    nose_style: '',
    face_shape: '',
    facial_features: '',
    skin_tone: '',
    body_type: '',
    color_palette: [],
    clothing_style_everyday: '',
    clothing_style_occasional: '',
    clothing_style_home: '',
    clothing_style_sports: '',
    clothing_style_sexy_dress: '',
    home_environment: '',
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

  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const isFeatureLocked = (feature: string) => {
    return FEATURE_RESTRICTIONS[subscriptionLevel].includes(feature);
  };

  const handleInputChange = (field: string, value: string) => {
    if (isFeatureLocked(field)) {
      setLockedFeature(field);
      setShowUpgradeModal(true);
      return;
    }
    
    setInfluencerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: string, value: string) => {
    if (value && value.includes(',')) {
      const values = value.split(',').map(v => v.trim());
      setInfluencerData(prev => ({
        ...prev,
        [field]: values
      }));
    }
  };

  const handleAddTag = (field: string) => {
    if (isFeatureLocked(field)) {
      setLockedFeature(field);
      setShowUpgradeModal(true);
      return;
    }
    
    if (newTag && !influencerData[field].includes(newTag)) {
      setInfluencerData(prev => ({
        ...prev,
        [field]: [...prev[field], newTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (field: string, tag: string) => {
    setInfluencerData(prev => ({
      ...prev,
      [field]: prev[field].filter(t => t !== tag)
    }));
  };

  const handleSave = () => {
    dispatch(updateInfluencer(influencerData));
    navigate('/influencers');
  };

  const renderFieldWithUpgrade = (field: string, children: React.ReactNode) => {
    const isLocked = isFeatureLocked(field);
    
    return (
      <div className="relative">
        {children}
        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/80 to-blue-100/80 dark:from-purple-900/80 dark:to-blue-900/80 backdrop-blur-sm rounded-md flex items-center justify-center">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Upgrade Required</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleEditInfluencer = (id: string) => {
    const influencer = influencers.find(inf => inf.id === id);
    if (influencer) {
      setInfluencerData(influencer);
      setShowEditView(true);
    }
  };

  const handleGenerateContent = (id: string) => {
    navigate(`/influencers/generate/${id}`);
  };

  const handleCreateNew = () => {
    setInfluencerData({
      influencer_type: '',
      name_first: '',
      name_last: '',
      sex: '',
      age_lifestyle: '',
      origin_birth: '',
      origin_residence: '',
      cultural_background: '',
      hair_length: '',
      hair_color: '',
      hair_style: '',
      eye_color: '',
      lip_style: '',
      nose_style: '',
      face_shape: '',
      facial_features: '',
      skin_tone: '',
      body_type: '',
      color_palette: [],
      clothing_style_everyday: '',
      clothing_style_occasional: '',
      clothing_style_home: '',
      clothing_style_sports: '',
      clothing_style_sexy_dress: '',
      home_environment: '',
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
    setShowEditView(true);
  };

  const handleUseTemplate = () => {
    navigate('/influencers/templates');
  };

  if (!showEditView) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              Influencers
            </h1>
            <p className="text-muted-foreground">
              Manage your AI influencers and their content
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUseTemplate} variant="outline">
              <Image className="w-4 h-4 mr-2" />
              Use Template
            </Button>
            <Button onClick={handleCreateNew} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.map((influencer) => (
            <InfluencerCard
              key={influencer.id}
              influencer={influencer}
              onGenerateContent={handleGenerateContent}
              onEditInfluencer={handleEditInfluencer}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Edit Influencer
          </h1>
          <p className="text-muted-foreground">
            Customize your influencer's appearance and personality
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEditView(false)} variant="outline">
            Back to List
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="style">Style & Environment</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <TabsContent value="basic" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                <Input
                      value={influencerData.name_first}
                      onChange={(e) => handleInputChange('name_first', e.target.value)}
                      placeholder="Enter first name"
                />
              </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                <Input
                      value={influencerData.name_last}
                      onChange={(e) => handleInputChange('name_last', e.target.value)}
                      placeholder="Enter last name"
                />
              </div>
            </div>
            
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Influencer Type</Label>
              <Input
                      value={influencerData.influencer_type}
                      onChange={(e) => handleInputChange('influencer_type', e.target.value)}
                      placeholder="e.g., Fashion, Tech, Lifestyle"
              />
            </div>
                  <div className="space-y-2">
                    <Label>Sex</Label>
                    <Select
                      value={influencerData.sex}
                      onValueChange={(value) => handleInputChange('sex', value)}
                    >
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Woman">Woman</SelectItem>
                  <SelectItem value="Man">Man</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
                  </div>
            </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age & Lifestyle</Label>
                    <Input
                      value={influencerData.age_lifestyle}
                      onChange={(e) => handleInputChange('age_lifestyle', e.target.value)}
                      placeholder="e.g., 25, Young Professional"
                    />
                  </div>
            {renderFieldWithUpgrade('cultural_background',
                    <div className="space-y-2">
                      <Label>Cultural Background</Label>
                <Input
                        value={influencerData.cultural_background}
                        onChange={(e) => handleInputChange('cultural_background', e.target.value)}
                        placeholder="e.g., North American, European"
                />
              </div>
            )}
                </div>

            <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Birth Origin</Label>
                    <Input
                      value={influencerData.origin_birth}
                      onChange={(e) => handleInputChange('origin_birth', e.target.value)}
                      placeholder="e.g., New York, USA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Residence</Label>
                    <Input
                      value={influencerData.origin_residence}
                      onChange={(e) => handleInputChange('origin_residence', e.target.value)}
                      placeholder="e.g., Los Angeles, USA"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Physical Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hair Length</Label>
                    <Select
                      value={influencerData.hair_length}
                      onValueChange={(value) => handleInputChange('hair_length', value)}
                    >
                  <SelectTrigger>
                        <SelectValue placeholder="Select hair length" />
                  </SelectTrigger>
                  <SelectContent>
                        {HAIR_LENGTHS.map(length => (
                          <SelectItem key={length} value={length}>{length}</SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
              {renderFieldWithUpgrade('hair_color',
                    <div className="space-y-2">
                      <Label>Hair Color</Label>
                      <Select
                        value={influencerData.hair_color}
                        onValueChange={(value) => handleInputChange('hair_color', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hair color" />
                        </SelectTrigger>
                        <SelectContent>
                          {HAIR_COLORS.map(color => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hair Style</Label>
                    <Select
                      value={influencerData.hair_style}
                      onValueChange={(value) => handleInputChange('hair_style', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hair style" />
                      </SelectTrigger>
                      <SelectContent>
                        {HAIR_STYLES.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Eye Color</Label>
                    <Select
                      value={influencerData.eye_color}
                      onValueChange={(value) => handleInputChange('eye_color', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select eye color" />
                      </SelectTrigger>
                      <SelectContent>
                        {EYE_COLORS.map(color => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lip Style</Label>
                    <Select
                      value={influencerData.lip_style}
                      onValueChange={(value) => handleInputChange('lip_style', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lip style" />
                      </SelectTrigger>
                      <SelectContent>
                        {LIP_STYLES.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nose Style</Label>
                    <Select
                      value={influencerData.nose_style}
                      onValueChange={(value) => handleInputChange('nose_style', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select nose style" />
                      </SelectTrigger>
                      <SelectContent>
                        {NOSE_STYLES.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Face Shape</Label>
                    <Select
                      value={influencerData.face_shape}
                      onValueChange={(value) => handleInputChange('face_shape', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select face shape" />
                      </SelectTrigger>
                      <SelectContent>
                        {FACE_SHAPES.map(shape => (
                          <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Skin Tone</Label>
                    <Select
                      value={influencerData.skin_tone}
                      onValueChange={(value) => handleInputChange('skin_tone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select skin tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {SKIN_TONES.map(tone => (
                          <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Facial Features</Label>
                  <Textarea
                    value={influencerData.facial_features}
                    onChange={(e) => handleInputChange('facial_features', e.target.value)}
                    placeholder="Describe facial features"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Body Type</Label>
                  <Select
                    value={influencerData.body_type}
                    onValueChange={(value) => handleInputChange('body_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
        <Card>
          <CardHeader>
                <CardTitle>Style & Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Color Palette</Label>
                  <div className="flex gap-2 flex-wrap">
                    {influencerData.color_palette.map((color, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {color}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTag('color_palette', color)}
                        />
                  </Badge>
                ))}
              </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add color (e.g., Neutral Tones)"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag('color_palette')}
                    />
                    <Button onClick={() => handleAddTag('color_palette')}>Add</Button>
                  </div>
            </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Everyday Style</Label>
                    <Select
                      value={influencerData.clothing_style_everyday}
                      onValueChange={(value) => handleInputChange('clothing_style_everyday', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select everyday style" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLOTHING_STYLES.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Occasional Style</Label>
                    <Select
                      value={influencerData.clothing_style_occasional}
                      onValueChange={(value) => handleInputChange('clothing_style_occasional', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occasional style" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLOTHING_STYLES.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Home Style</Label>
                    <Select
                      value={influencerData.clothing_style_home}
                      onValueChange={(value) => handleInputChange('clothing_style_home', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select home style" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLOTHING_STYLES.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
              </div>
                  <div className="space-y-2">
                    <Label>Sports Style</Label>
                    <Select
                      value={influencerData.clothing_style_sports}
                      onValueChange={(value) => handleInputChange('clothing_style_sports', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sports style" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLOTHING_STYLES.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
              </div>
            </div>

                <div className="space-y-2">
                  <Label>Home Environment</Label>
                  <Select
                    value={influencerData.home_environment}
                    onValueChange={(value) => handleInputChange('home_environment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select home environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOME_ENVIRONMENTS.map(env => (
                        <SelectItem key={env} value={env}>{env}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="personality" className="space-y-4">
        <Card>
          <CardHeader>
                <CardTitle>Personality & Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Content Focus</Label>
                  <div className="flex gap-2 flex-wrap">
                    {influencerData.content_focus.map((focus, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {focus}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTag('content_focus', focus)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
              <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add content focus"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag('content_focus')}
                    />
                    <Button onClick={() => handleAddTag('content_focus')}>Add</Button>
                  </div>
            </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Area</Label>
                    <Select
                      value={influencerData.job_area}
                      onValueChange={(value) => handleInputChange('job_area', value)}
                    >
                <SelectTrigger>
                        <SelectValue placeholder="Select job area" />
                </SelectTrigger>
                <SelectContent>
                        {JOB_AREAS.map(area => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                </SelectContent>
              </Select>
            </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                <Input
                      value={influencerData.job_title}
                      onChange={(e) => handleInputChange('job_title', e.target.value)}
                      placeholder="Enter job title"
                />
              </div>
                </div>

                <div className="space-y-2">
                  <Label>Speech Style</Label>
                  <div className="flex gap-2 flex-wrap">
                    {influencerData.speech_style.map((style, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {style}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTag('speech_style', style)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={newTag}
                      onValueChange={(value) => {
                        setNewTag(value);
                        handleAddTag('speech_style');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select speech style" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPEECH_STYLES.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Humor Style</Label>
                  <div className="flex gap-2 flex-wrap">
                    {influencerData.humor.map((style, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {style}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTag('humor', style)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={newTag}
                      onValueChange={(value) => {
                        setNewTag(value);
                        handleAddTag('humor');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select humor style" />
                      </SelectTrigger>
                      <SelectContent>
                        {HUMOR_STYLES.map(style => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Core Values</Label>
                  <div className="flex gap-2 flex-wrap">
                    {influencerData.core_values.map((value, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {value}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTag('core_values', value)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add core value"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag('core_values')}
                    />
                    <Button onClick={() => handleAddTag('core_values')}>Add</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Current Goals</Label>
                  <div className="flex gap-2 flex-wrap">
                    {influencerData.current_goals.map((goal, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {goal}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTag('current_goals', goal)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add current goal"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag('current_goals')}
                    />
                    <Button onClick={() => handleAddTag('current_goals')}>Add</Button>
                  </div>
                </div>
          </CardContent>
        </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              This feature requires a higher subscription level. Choose a plan that fits your needs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {Object.entries(SUBSCRIPTION_FEATURES).map(([level, plan]) => (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.price}</p>
            </div>
                  <Button
                    variant={level === subscriptionLevel ? "outline" : "default"}
                    className={level === subscriptionLevel ? "" : "bg-gradient-to-r from-purple-600 to-blue-600"}
                    onClick={() => {
                      setSubscriptionLevel(level as 'free' | 'professional' | 'enterprise');
                      setShowUpgradeModal(false);
                    }}
                  >
                    {level === subscriptionLevel ? "Current Plan" : "Upgrade"}
              </Button>
            </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-purple-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
