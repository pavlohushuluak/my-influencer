import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addInfluencer } from '@/store/slices/influencersSlice';
import { Loader2, Plus, Shirt } from 'lucide-react';
import { RootState } from '@/store/store';
import { fetchTemplateInfluencers, TemplateInfluencer } from '@/store/slices/templateInfluencerSlice';
import { useEffect, useState } from 'react';
import { AppDispatch } from '@/store/store';

export default function InfluencerTemplates() {
  const userData = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const { templates, loading, error } = useSelector((state: RootState) => state.templateInfluencer);

  useEffect(() => {
    dispatch(fetchTemplateInfluencers());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleUseTemplate = async (template: TemplateInfluencer) => {

    console.log(template);
    // Create a new influencer with default values for required fields
    const response = await fetch('https://db.nymia.ai/rest/v1/influencer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify({
        user_id: userData.id,
        name_first: template.name_first,
        name_last: template.name_last,
        influencer_type: template.influencer_type,
        visual_only: template.visual_only,
        sex: template.sex,
        cultural_background: template.cultural_background,
        hair_length: template.hair_length,
        hair_color: template.hair_color,
        hair_style: template.hair_style,
        eye_color: template.eye_color,
        lip_style: template.lip_style,
        nose_style: template.nose_style,
        eyebrow_style: template.eyebrow_style,
        face_shape: template.face_shape,
        facial_features: template.facial_features,
        bust_size: template.bust_size,
        skin_tone: template.skin_tone,
        body_type: template.body_type,
        color_palette: template.color_palette,
        clothing_style_everyday: template.clothing_style_everyday,
        clothing_style_occasional: template.clothing_style_occasional,
        clothing_style_home: template.clothing_style_home,
        clothing_style_sports: template.clothing_style_sports,
        clothing_style_sexy_dress: template.clothing_style_sexy_dress,
        home_environment: template.home_environment,
        age_lifestyle: template.age_lifestyle,
        origin_birth: template.origin_birth,
        origin_residence: template.origin_residence,
        content_focus: template.content_focus,
        content_focus_areas: template.content_focus_areas,
        job_area: template.job_area,
        job_title: template.job_title,
        job_vibe: template.job_vibe,
        hobbies: template.hobbies,
        social_circle: template.social_circle,
        strengths: template.strengths,
        weaknesses: template.weaknesses,
        speech_style: template.speech_style,
        humor: template.humor,
        core_values: template.core_values,
        current_goals: template.current_goals,
        background_elements: template.background_elements,
        new: true
      })
    });

    console.log(response);

    console.log(userData);
    const responseId = await fetch(`https://db.nymia.ai/rest/v1/influencer?user_id=eq.${userData.id}&new=eq.true`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      }
    });

    const data = await responseId.json();
    console.log(data);

    await fetch('https://api.nymia.ai/v1/createfolder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify({
        user: userData.id,
        parentfolder: `models/${data[0].id}/`,
        folder: "lora"
      })
    });

    await fetch('https://api.nymia.ai/v1/createfolder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify({
        user: userData.id,
        parentfolder: `models/${data[0].id}/`,
        folder: "loratraining"
      })
    });

    await fetch('https://api.nymia.ai/v1/createfolder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify({
        user: userData.id,
        parentfolder: `models/${data[0].id}/`,
        folder: "profilepic"
      })
    });

    await fetch('https://api.nymia.ai/v1/createfolder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify({
        user: userData.id,
        parentfolder: `models/${data[0].id}/`,
        folder: "reference"
      })
    });

    const responseUpdate = await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${data[0].id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer WeInfl3nc3withAI'
      },
      body: JSON.stringify({
        new: false
      })
    });

    if (response.ok) {
      navigate('/influencers/edit', { state: { influencerData: data[0] } });
    }
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
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                  {
                    template.image_url && (
                      <img src={template.image_url} alt={template.id} className="w-full h-full object-cover rounded-lg" />
                    )
                  }
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                      {template.name_first} {template.name_last}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex text-sm text-muted-foreground flex-col">
                      <span className="font-medium mr-2">Age/Lifestyle:</span>
                      {template.age_lifestyle}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-medium mr-2">Type:</span>
                      {template.influencer_type}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Use
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
