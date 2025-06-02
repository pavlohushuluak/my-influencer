
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateInfluencer } from '@/store/slices/influencersSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Save, Crown } from 'lucide-react';

export default function InfluencerEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { influencers } = useSelector((state: RootState) => state.influencers);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name_first: '',
    name_last: '',
    influencer_type: '',
    sex: '',
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
    clothing_style_everyday: '',
    clothing_style_occasional: '',
    clothing_style_home: '',
    clothing_style_sports: '',
    clothing_style_sexy_dress: '',
    home_environment: '',
    age_lifestyle: '',
    origin_birth: '',
    origin_residence: '',
    job_area: '',
    job_title: '',
    job_vibe: '',
    social_circle: '',
    color_palette: [] as string[],
    content_focus: [] as string[],
    content_focus_areas: [] as string[],
    hobbies: [] as string[],
    strengths: [] as string[],
    weaknesses: [] as string[],
    speech_style: [] as string[],
    humor: [] as string[],
    core_values: [] as string[],
    current_goals: [] as string[],
    background_elements: [] as string[]
  });

  // Mock subscription level - in real app this would come from user state
  const subscriptionLevel = 'basic'; // 'basic', 'pro', 'premium'
  
  const premiumFields = [
    'cultural_background', 'hair_color', 'eye_color', 'skin_tone', 
    'color_palette', 'job_vibe', 'social_circle', 'speech_style', 
    'humor', 'core_values', 'background_elements'
  ];

  useEffect(() => {
    // Load data from location state or find influencer by ID
    const influencerData = location.state?.influencerData;
    if (influencerData) {
      setFormData(influencerData);
    } else {
      // Fallback - load first influencer or redirect
      if (influencers.length > 0) {
        const firstInfluencer = influencers[0];
        // Convert influencer to edit format
        const editData = {
          id: firstInfluencer.id,
          name_first: firstInfluencer.name.split(' ')[0] || '',
          name_last: firstInfluencer.name.split(' ')[1] || '',
          influencer_type: firstInfluencer.tags[0] || '',
          sex: 'Woman',
          cultural_background: 'North American',
          hair_length: 'Medium',
          hair_color: 'Brown',
          hair_style: 'Natural',
          eye_color: 'Brown',
          lip_style: 'Natural',
          nose_style: 'Natural',
          face_shape: 'Oval',
          facial_features: 'Natural',
          skin_tone: 'Medium',
          body_type: 'Average',
          clothing_style_everyday: 'Casual',
          clothing_style_occasional: 'Smart',
          clothing_style_home: 'Comfortable',
          clothing_style_sports: 'Athletic',
          clothing_style_sexy_dress: 'Elegant',
          home_environment: 'Modern',
          age_lifestyle: '25-30',
          origin_birth: 'Unknown',
          origin_residence: 'Unknown',
          job_area: 'Creative',
          job_title: 'Influencer',
          job_vibe: 'Creative',
          social_circle: 'Creative professionals',
          color_palette: ['Neutral'],
          content_focus: firstInfluencer.tags,
          content_focus_areas: firstInfluencer.tags,
          hobbies: ['Social Media'],
          strengths: ['Creative'],
          weaknesses: ['Perfectionist'],
          speech_style: ['Friendly'],
          humor: ['Light'],
          core_values: ['Authenticity'],
          current_goals: ['Growth'],
          background_elements: ['Social Media']
        };
        setFormData(editData);
      }
    }
  }, [location.state, influencers]);

  const handleFieldChange = (field: string, value: any) => {
    if (premiumFields.includes(field) && subscriptionLevel === 'basic') {
      setEditingField(field);
      setShowUpgradeModal(true);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field: string, values: string[]) => {
    if (premiumFields.includes(field) && subscriptionLevel === 'basic') {
      setEditingField(field);
      setShowUpgradeModal(true);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const handleSave = () => {
    // Update influencer in store
    dispatch(updateInfluencer({
      id: formData.id,
      name: `${formData.name_first} ${formData.name_last}`,
      description: `${formData.influencer_type} Influencer`,
      personality: formData.speech_style.join(', '),
      tags: formData.content_focus
    }));
    
    navigate('/influencers');
  };

  const renderFieldWithUpgrade = (field: string, children: React.ReactNode) => {
    const isLocked = premiumFields.includes(field) && subscriptionLevel === 'basic';
    
    return (
      <div className="relative">
        {children}
        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/80 to-blue-100/80 dark:from-purple-900/80 dark:to-blue-900/80 backdrop-blur-sm rounded-md flex items-center justify-center">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Premium Feature</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Edit Influencer
          </h1>
          <p className="text-muted-foreground">
            Customize your influencer's appearance and personality
          </p>
        </div>
        <Button onClick={handleSave} className="bg-ai-gradient hover:opacity-90">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_first">First Name</Label>
                <Input
                  id="name_first"
                  value={formData.name_first}
                  onChange={(e) => handleFieldChange('name_first', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="name_last">Last Name</Label>
                <Input
                  id="name_last"
                  value={formData.name_last}
                  onChange={(e) => handleFieldChange('name_last', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="influencer_type">Influencer Type</Label>
              <Select value={formData.influencer_type} onValueChange={(value) => handleFieldChange('influencer_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="Art">Art & Design</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="age_lifestyle">Age & Lifestyle</Label>
              <Input
                id="age_lifestyle"
                value={formData.age_lifestyle}
                onChange={(e) => handleFieldChange('age_lifestyle', e.target.value)}
                placeholder="e.g., 25, Young Professional"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sex">Sex</Label>
              <Select value={formData.sex} onValueChange={(value) => handleFieldChange('sex', value)}>
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

            {renderFieldWithUpgrade('cultural_background',
              <div>
                <Label htmlFor="cultural_background">Cultural Background</Label>
                <Input
                  id="cultural_background"
                  value={formData.cultural_background}
                  onChange={(e) => handleFieldChange('cultural_background', e.target.value)}
                  disabled={premiumFields.includes('cultural_background') && subscriptionLevel === 'basic'}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hair_length">Hair Length</Label>
                <Select value={formData.hair_length} onValueChange={(value) => handleFieldChange('hair_length', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short">Short</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Long">Long</SelectItem>
                    <SelectItem value="Shoulder-Length">Shoulder-Length</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderFieldWithUpgrade('hair_color',
                <div>
                  <Label htmlFor="hair_color">Hair Color</Label>
                  <Input
                    id="hair_color"
                    value={formData.hair_color}
                    onChange={(e) => handleFieldChange('hair_color', e.target.value)}
                    disabled={premiumFields.includes('hair_color') && subscriptionLevel === 'basic'}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Focus */}
        <Card>
          <CardHeader>
            <CardTitle>Content & Personality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Content Focus</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.content_focus.map((focus, index) => (
                  <Badge key={index} variant="secondary">
                    {focus}
                  </Badge>
                ))}
              </div>
            </div>

            {renderFieldWithUpgrade('speech_style',
              <div>
                <Label>Speech Style</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.speech_style.map((style, index) => (
                    <Badge key={index} variant="outline">
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Hobbies</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.hobbies.map((hobby, index) => (
                  <Badge key={index} variant="secondary">
                    {hobby}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional */}
        <Card>
          <CardHeader>
            <CardTitle>Professional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleFieldChange('job_title', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="job_area">Job Area</Label>
              <Select value={formData.job_area} onValueChange={(value) => handleFieldChange('job_area', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderFieldWithUpgrade('job_vibe',
              <div>
                <Label htmlFor="job_vibe">Job Vibe</Label>
                <Input
                  id="job_vibe"
                  value={formData.job_vibe}
                  onChange={(e) => handleFieldChange('job_vibe', e.target.value)}
                  disabled={premiumFields.includes('job_vibe') && subscriptionLevel === 'basic'}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              This field requires a premium subscription to edit. Upgrade to unlock advanced customization features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Premium features include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Advanced appearance customization</li>
                <li>Detailed personality traits</li>
                <li>Cultural background settings</li>
                <li>Color palette customization</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="flex-1">
                Maybe Later
              </Button>
              <Button className="flex-1 bg-ai-gradient hover:opacity-90">
                Upgrade Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
