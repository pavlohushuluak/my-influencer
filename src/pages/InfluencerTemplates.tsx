import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { RootState } from '@/store/store';
import { fetchTemplateInfluencers, TemplateInfluencer } from '@/store/slices/templateInfluencerSlice';
import { useEffect, useState } from 'react';
import { AppDispatch } from '@/store/store';

export default function InfluencerTemplates() {
  const userData = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [loadingButtons, setLoadingButtons] = useState<{ [key: string]: boolean }>({});

  const dispatch = useDispatch<AppDispatch>();
  const { templates, loading } = useSelector((state: RootState) => state.templateInfluencer);

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
    // Set loading state for this specific button
    setLoadingButtons(prev => ({ ...prev, [template.id]: true }));

    try {
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
          age: template.age,
          lifestyle: template.lifestyle,
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
          prompt: template.prompt || '', // Include the prompt field from template
          notes: template.notes || '', // Include the notes field from template
          new: true,
          image_url: template.image_url
        })
      });

      const responseId = await fetch(`https://db.nymia.ai/rest/v1/influencer?user_id=eq.${userData.id}&new=eq.true`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const data = await responseId.json();

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

      console.log(template);

      const copyResponse = await fetch('https://api.nymia.ai/v1/copyrootfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `${template.user_id}/models/${template.id}/profilepic/profilepic${template.image_num - 1}.png`,
          destinationfilename: `${userData.id}/models/${data[0].id}/profilepic/profilepic${data[0].image_num}.png`
        })
      });

      console.log(`${template.user_id}/models/${template.id}/profilepic/profilepic${template.image_num - 1}.png`);
      console.log(`${userData.id}/models/${data[0].id}/profilepic/profilepic${data[0].image_num}.png`);

      if (!copyResponse.ok) {
        throw new Error('Failed to copy image to profile picture');
      }

      const responseUpdate = await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${data[0].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          new: false,
          image_url: `https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/models/${data[0].id}/profilepic/profilepic${data[0].image_num}.png`,
          image_num: data[0].image_num + 1
        })
      });

      if (response.ok) {
        navigate('/influencers/edit', { state: { influencerData: data[0] } });
      }
    } catch (error) {
      console.error('Error using template:', error);
      // You might want to show a toast notification here
    } finally {
      // Clear loading state for this button
      setLoadingButtons(prev => ({ ...prev, [template.id]: false }));
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
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
                      {template.notes ? (
                        <span className="text-sm text-muted-foreground">
                          {template.notes.length > 50 
                            ? `${template.notes.substring(0, 50)}...` 
                            : template.notes
                          }
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {template.lifestyle || 'No lifestyle'} • {template.origin_residence || 'No residence'}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full"
                    disabled={loadingButtons[template.id]}
                  >
                    {loadingButtons[template.id] ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Use
                      </>
                    )}
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
