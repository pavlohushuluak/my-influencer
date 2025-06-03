
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addInfluencer } from '@/store/slices/influencersSlice';
import { User, Wand2, Sparkles } from 'lucide-react';

const SCRATCH_TEMPLATE = {
  "id": "8f6b6d97-5614-401d-955e-dba8320d6f5d",
  "influencer_type": "Lifestyle",
  "sex": "Woman",
  "cultural_background": "North American",
  "hair_length": "Shoulder-Length",
  "hair_color": "Dark Blonde (#C0A080)",
  "hair_style": "Wavy",
  "eye_color": "Green (#008000)",
  "lip_style": "Natural",
  "nose_style": "Upturned",
  "face_shape": "Oval",
  "facial_features": "Youthful & Fresh",
  "skin_tone": "Medium (#C68E17)",
  "body_type": "Balanced",
  "color_palette": [
    "Neutral Tones (#D2B48C, #808080)",
    "Pastel Shades (#FFB6C1, #ADD8E6)"
  ],
  "clothing_style_everyday": "Casual",
  "clothing_style_occasional": "Party",
  "clothing_style_home": "Cozy Loungewear",
  "clothing_style_sports": "Running",
  "clothing_style_sexy_dress": "Slip Dress",
  "home_environment": "Modern Loft",
  "name_first": "Stella",
  "name_last": "Bolingi",
  "age_lifestyle": "23-27 years, Young professional",
  "origin_birth": "Miami, USA",
  "origin_residence": "Los Angeles, USA",
  "content_focus": [
    "Sexy Postings",
    "Flirty Vibes"
  ],
  "content_focus_areas": [
    "Music & Performance",
    "Dance & Choreography"
  ],
  "job_area": "Office",
  "job_title": "Customer Service Rep",
  "job_vibe": "Corporate Office",
  "hobbies": [
    "Cooking",
    "Fashion",
    "Dancing"
  ],
  "social_circle": "Friends from work, two old friends from school, one secret lover",
  "strengths": [
    "Creative",
    "Curious"
  ],
  "weaknesses": [
    "Perfectionist"
  ],
  "speech_style": [
    "Sarcastic",
    "Inspirational"
  ],
  "humor": [
    "Silly",
    "Absurd"
  ],
  "core_values": [
    "Creativity",
    "Freedom"
  ],
  "current_goals": [
    "Finding Balance"
  ],
  "background_elements": [
    "Grew up in Small Town",
    "Sports Background",
    "Farm Life"
  ],
  "user_id": 1
};

const INFLUENCER_TEMPLATES = [
  {
    id: 'template-1',
    name: 'Luna Sterling',
    age: 25,
    lifecycle: 'Young Professional',
    type: 'Fashion',
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: 'template-2',
    name: 'Alex Nova',
    age: 28,
    lifecycle: 'Tech Enthusiast',
    type: 'Technology',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: 'template-3',
    name: 'Maya Chen',
    age: 24,
    lifecycle: 'Creative Artist',
    type: 'Art & Design',
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: 'template-4',
    name: 'Jordan Rivers',
    age: 30,
    lifecycle: 'Fitness Coach',
    type: 'Fitness & Health',
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face'
  }
];

export default function CreateInfluencer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [wizardData, setWizardData] = useState({
    name: '',
    description: '',
    personality: '',
    niche: ''
  });
  const [uploadedImage, setUploadedImage] = useState<string>('');

  const handleScratchUse = () => {
    // Create a new scratch template with unique ID
    const scratchData = {
      ...SCRATCH_TEMPLATE,
      id: Date.now().toString(),
      name_first: 'New',
      name_last: 'Influencer'
    };
    
    navigate('/influencers/edit', { 
      state: { 
        influencerData: scratchData
      }
    });
  };

  const handleWizardUse = () => {
    setShowWizardModal(true);
  };

  const handleWizardSubmit = () => {
    const newInfluencer = {
      id: Date.now().toString(),
      name: wizardData.name,
      image: uploadedImage || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face',
      description: wizardData.description,
      personality: wizardData.personality,
      createdAt: new Date().toISOString().split('T')[0],
      generatedContent: 0,
      status: 'active' as const,
      tags: [wizardData.niche]
    };
    
    dispatch(addInfluencer(newInfluencer));
    setShowWizardModal(false);
    navigate('/influencers');
  };

  const handleTemplateUse = (template: typeof INFLUENCER_TEMPLATES[0]) => {
    // Create template data structure and navigate to edit
    const templateData = {
      id: Date.now().toString(),
      name_first: template.name.split(' ')[0],
      name_last: template.name.split(' ')[1] || '',
      influencer_type: template.type,
      sex: 'Woman',
      cultural_background: 'North American',
      hair_length: 'Medium',
      hair_color: 'Brown (#8B4513)',
      hair_style: 'Natural',
      eye_color: 'Brown (#654321)',
      lip_style: 'Natural',
      nose_style: 'Natural',
      face_shape: 'Oval',
      facial_features: 'Natural',
      skin_tone: 'Medium (#C68E17)',
      body_type: 'Average',
      color_palette: ['Neutral Tones (#D2B48C, #808080)'],
      clothing_style_everyday: 'Casual',
      clothing_style_occasional: 'Smart',
      clothing_style_home: 'Comfortable',
      clothing_style_sports: 'Athletic',
      clothing_style_sexy_dress: 'Elegant',
      home_environment: 'Modern',
      age_lifestyle: `${template.age}, ${template.lifecycle}`,
      origin_birth: 'Unknown',
      origin_residence: 'Unknown',
      content_focus: [template.type],
      content_focus_areas: [template.type],
      job_area: 'Creative',
      job_title: 'Influencer',
      job_vibe: 'Creative',
      hobbies: ['Social Media'],
      social_circle: 'Creative professionals',
      strengths: ['Creative'],
      weaknesses: ['Perfectionist'],
      speech_style: ['Friendly'],
      humor: ['Light'],
      core_values: ['Authenticity'],
      current_goals: ['Growth'],
      background_elements: ['Social Media']
    };
    
    navigate('/influencers/edit', { state: { influencerData: templateData } });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Create New Influencer
        </h1>
        <p className="text-muted-foreground">
          Create your new influencer or clone template.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* From Scratch Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-dashed border-purple-200 hover:border-purple-400">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Upload" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <User className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">From Scratch</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" size="sm" className="mb-3" asChild>
                    <span>Upload Picture</span>
                  </Button>
                </label>
              </div>
              
              <Button 
                onClick={handleScratchUse}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Use
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wizard Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-dashed border-green-200 hover:border-green-400">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
                <Wand2 className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Wizard</h3>
                <p className="text-sm text-muted-foreground">AI-guided creation</p>
              </div>
              
              <Button 
                onClick={handleWizardUse}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Use
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Template Cards */}
        {INFLUENCER_TEMPLATES.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <Badge variant="secondary">Template</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Age {template.age}</p>
                  <p className="text-sm text-muted-foreground mb-2">{template.lifecycle}</p>
                  <Badge variant="outline" className="text-xs">
                    {template.type}
                  </Badge>
                </div>
                
                <Button 
                  onClick={() => handleTemplateUse(template)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Use
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wizard Modal */}
      <Dialog open={showWizardModal} onOpenChange={setShowWizardModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Wizard Creation
            </DialogTitle>
            <DialogDescription>
              Our AI agent will help you create the perfect influencer. Please provide some basic information to get started.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="wizard-name">Influencer Name</Label>
              <Input
                id="wizard-name"
                value={wizardData.name}
                onChange={(e) => setWizardData({...wizardData, name: e.target.value})}
                placeholder="Enter name"
              />
            </div>
            
            <div>
              <Label htmlFor="wizard-description">Description</Label>
              <Textarea
                id="wizard-description"
                value={wizardData.description}
                onChange={(e) => setWizardData({...wizardData, description: e.target.value})}
                placeholder="Describe the influencer"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="wizard-personality">Personality</Label>
              <Input
                id="wizard-personality"
                value={wizardData.personality}
                onChange={(e) => setWizardData({...wizardData, personality: e.target.value})}
                placeholder="e.g., Friendly, Creative, Professional"
              />
            </div>
            
            <div>
              <Label htmlFor="wizard-niche">Niche/Type</Label>
              <Input
                id="wizard-niche"
                value={wizardData.niche}
                onChange={(e) => setWizardData({...wizardData, niche: e.target.value})}
                placeholder="e.g., Fashion, Tech, Fitness"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowWizardModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleWizardSubmit} className="flex-1 bg-ai-gradient hover:opacity-90">
                Create Influencer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
