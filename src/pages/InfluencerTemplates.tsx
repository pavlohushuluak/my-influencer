import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addInfluencer } from '@/store/slices/influencersSlice';

const INFLUENCER_TEMPLATES = [
  {
    id: 'template-1',
    name: 'Luna Sterling',
    age: 25,
    lifecycle: 'Young Professional',
    type: 'Fashion',
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face',
    templateData: {
      influencer_type: "Fashion",
      sex: "Woman",
      cultural_background: "European",
      hair_length: "Long",
      hair_color: "Dark Brown (#8B4513)",
      hair_style: "Straight",
      eye_color: "Blue (#0000FF)",
      lip_style: "Glossy",
      nose_style: "Straight",
      face_shape: "Heart",
      facial_features: "Elegant & Sophisticated",
      skin_tone: "Fair (#F5DEB3)",
      body_type: "Slim",
      color_palette: ["Classic Black & White (#000000, #FFFFFF)", "Bold Reds (#FF0000)"],
      clothing_style_everyday: "Chic",
      clothing_style_occasional: "Elegant",
      clothing_style_home: "Sophisticated Loungewear",
      clothing_style_sports: "Yoga",
      clothing_style_sexy_dress: "Little Black Dress",
      home_environment: "Modern Apartment",
      name_first: "Luna",
      name_last: "Sterling",
      age_lifestyle: "25, Young Professional",
      origin_birth: "Paris, France",
      origin_residence: "New York, USA",
      content_focus: ["Fashion", "Lifestyle"],
      content_focus_areas: ["Fashion & Style", "Urban Life"],
      job_area: "Creative",
      job_title: "Fashion Designer",
      job_vibe: "Creative Studio",
      hobbies: ["Fashion", "Photography", "Travel"],
      social_circle: "Fashion industry professionals, creative friends",
      strengths: ["Stylish", "Creative"],
      weaknesses: ["Perfectionist"],
      speech_style: ["Elegant", "Sophisticated"],
      humor: ["Witty", "Charming"],
      core_values: ["Beauty", "Authenticity"],
      current_goals: ["Building Fashion Brand"],
      background_elements: ["Art School", "Fashion Industry", "International Travel"],
      user_id: 1
    }
  },
  {
    id: 'template-2',
    name: 'Alex Nova',
    age: 28,
    lifecycle: 'Tech Enthusiast',
    type: 'Technology',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face',
    templateData: {
      influencer_type: "Technology",
      sex: "Man",
      cultural_background: "Asian American",
      hair_length: "Short",
      hair_color: "Black (#000000)",
      hair_style: "Modern Cut",
      eye_color: "Brown (#8B4513)",
      lip_style: "Natural",
      nose_style: "Straight",
      face_shape: "Square",
      facial_features: "Tech-savvy & Modern",
      skin_tone: "Medium (#DEB887)",
      body_type: "Athletic",
      color_palette: ["Tech Blues (#0066CC, #87CEEB)", "Modern Grays (#808080, #C0C0C0)"],
      clothing_style_everyday: "Smart Casual",
      clothing_style_occasional: "Business",
      clothing_style_home: "Comfortable Tech Wear",
      clothing_style_sports: "High-tech Sportswear",
      clothing_style_sexy_dress: "Modern Suit",
      home_environment: "Smart Home",
      name_first: "Alex",
      name_last: "Nova",
      age_lifestyle: "28, Tech Professional",
      origin_birth: "San Francisco, USA",
      origin_residence: "Silicon Valley, USA",
      content_focus: ["Technology", "Innovation"],
      content_focus_areas: ["Tech Reviews", "Future Tech"],
      job_area: "Technology",
      job_title: "Software Engineer",
      job_vibe: "Tech Startup",
      hobbies: ["Coding", "Gaming", "VR"],
      social_circle: "Tech professionals, startup founders, developers",
      strengths: ["Analytical", "Innovative"],
      weaknesses: ["Workaholic"],
      speech_style: ["Technical", "Informative"],
      humor: ["Geeky", "Clever"],
      core_values: ["Innovation", "Progress"],
      current_goals: ["Launching Tech Startup"],
      background_elements: ["Computer Science Degree", "Silicon Valley", "Startup Culture"],
      user_id: 1
    }
  },
  {
    id: 'template-3',
    name: 'Maya Chen',
    age: 24,
    lifecycle: 'Creative Artist',
    type: 'Art & Design',
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=400&fit=crop&crop=face',
    templateData: {
      influencer_type: "Art & Design",
      sex: "Woman",
      cultural_background: "Asian",
      hair_length: "Medium",
      hair_color: "Purple Highlights (#800080)",
      hair_style: "Artistic",
      eye_color: "Dark Brown (#654321)",
      lip_style: "Artistic",
      nose_style: "Button",
      face_shape: "Round",
      facial_features: "Creative & Expressive",
      skin_tone: "Light (#F5F5DC)",
      body_type: "Petite",
      color_palette: ["Artistic Colors (#FF69B4, #9370DB)", "Earth Tones (#D2B48C, #8FBC8F)"],
      clothing_style_everyday: "Artistic",
      clothing_style_occasional: "Bohemian",
      clothing_style_home: "Comfortable Art Clothes",
      clothing_style_sports: "Dance",
      clothing_style_sexy_dress: "Artistic Dress",
      home_environment: "Art Studio",
      name_first: "Maya",
      name_last: "Chen",
      age_lifestyle: "24, Creative Artist",
      origin_birth: "Tokyo, Japan",
      origin_residence: "Los Angeles, USA",
      content_focus: ["Art", "Creativity"],
      content_focus_areas: ["Digital Art", "Traditional Art"],
      job_area: "Creative",
      job_title: "Digital Artist",
      job_vibe: "Art Studio",
      hobbies: ["Painting", "Digital Art", "Photography"],
      social_circle: "Artists, designers, creative professionals",
      strengths: ["Creative", "Artistic"],
      weaknesses: ["Perfectionist"],
      speech_style: ["Artistic", "Expressive"],
      humor: ["Quirky", "Creative"],
      core_values: ["Creativity", "Expression"],
      current_goals: ["Art Gallery Exhibition"],
      background_elements: ["Art School", "Gallery Shows", "Creative Community"],
      user_id: 1
    }
  },
  {
    id: 'template-4',
    name: 'Jordan Rivers',
    age: 30,
    lifecycle: 'Fitness Coach',
    type: 'Fitness & Health',
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face',
    templateData: {
      influencer_type: "Fitness & Health",
      sex: "Man",
      cultural_background: "African American",
      hair_length: "Short",
      hair_color: "Black (#000000)",
      hair_style: "Fade",
      eye_color: "Brown (#8B4513)",
      lip_style: "Natural",
      nose_style: "Strong",
      face_shape: "Square",
      facial_features: "Athletic & Strong",
      skin_tone: "Dark (#8B4513)",
      body_type: "Muscular",
      color_palette: ["Athletic Colors (#FF4500, #32CD32)", "Bold Blues (#0000FF, #87CEEB)"],
      clothing_style_everyday: "Athletic",
      clothing_style_occasional: "Casual",
      clothing_style_home: "Gym Wear",
      clothing_style_sports: "Professional Athletic",
      clothing_style_sexy_dress: "Fitted Casual",
      home_environment: "Home Gym",
      name_first: "Jordan",
      name_last: "Rivers",
      age_lifestyle: "30, Fitness Professional",
      origin_birth: "Atlanta, USA",
      origin_residence: "Miami, USA",
      content_focus: ["Fitness", "Health"],
      content_focus_areas: ["Workout Routines", "Nutrition"],
      job_area: "Fitness",
      job_title: "Personal Trainer",
      job_vibe: "Gym & Fitness Studio",
      hobbies: ["Weightlifting", "Running", "Nutrition"],
      social_circle: "Fitness enthusiasts, athletes, health professionals",
      strengths: ["Disciplined", "Motivational"],
      weaknesses: ["Intense"],
      speech_style: ["Motivational", "Energetic"],
      humor: ["Encouraging", "Upbeat"],
      core_values: ["Health", "Discipline"],
      current_goals: ["Opening Fitness Studio"],
      background_elements: ["Sports Background", "Fitness Certification", "Athletic Training"],
      user_id: 1
    }
  }
];

export default function InfluencerTemplates() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleUseTemplate = (template: typeof INFLUENCER_TEMPLATES[0]) => {
    // Copy template data and navigate to edit with the data
    const newInfluencerData = {
      ...template.templateData,
      id: Date.now().toString(),
      image: template.image
    };
    
    // Add to store and navigate to edit
    dispatch(addInfluencer({
      ...newInfluencerData,
      id: newInfluencerData.id,
      name: `${newInfluencerData.name_first} ${newInfluencerData.name_last}`,
      image: template.image,
      description: `${newInfluencerData.influencer_type} Influencer`,
      personality: newInfluencerData.speech_style.join(', '),
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      generatedContent: 0,
      status: 'active' as const,
      tags: newInfluencerData.content_focus
    }));
    
    navigate('/influencers/edit', { state: { influencerData: newInfluencerData } });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Influencer Templates
        </h1>
        <p className="text-muted-foreground">
          Choose from our pre-made influencer templates to get started quickly.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <p className="text-sm text-muted-foreground mb-1">{template.age}, {template.lifecycle}</p>
                  <p className="text-sm text-muted-foreground mb-2">{template.type} Influencer</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Use
                  </Button>
                  <Button 
                    onClick={() => handleUseTemplate(template)}
                    variant="outline"
                    className="flex-1"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
