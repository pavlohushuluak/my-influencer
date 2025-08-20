import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Plus, Search, Filter, Eye, Star, Crown, MapPin, Users, Sparkles, Image, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { RootState } from '@/store/store';
import { fetchTemplateInfluencers, TemplateInfluencer } from '@/store/slices/templateInfluencerSlice';
import { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/store/store';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';
import { cn } from '@/lib/utils';
import config from '@/config/config';

export default function InfluencerTemplates() {
  const userData = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [loadingButtons, setLoadingButtons] = useState<{ [key: string]: boolean }>({});

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProOnly, setShowProOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfluencer | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const dispatch = useDispatch<AppDispatch>();
  const { templates, loading } = useSelector((state: RootState) => state.templateInfluencer);

  useEffect(() => {
    dispatch(fetchTemplateInfluencers());
  }, [dispatch]);

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        template.name_first.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.name_last.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.lifestyle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.origin_residence?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content_focus?.some(focus => focus.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const categoryMatch = selectedCategory === 'all' || 
        template.lifestyle?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        template.content_focus?.some(focus => focus.toLowerCase().includes(selectedCategory.toLowerCase()));

      // PRO filter (using template_pro field for PRO templates)
      const proMatch = !showProOnly || template.template_pro === true;

      return searchMatch && categoryMatch && proMatch;
    });

    // Sort templates
    switch (sortBy) {
      case 'popularity':
        // Sort by name for now since popularity doesn't exist
        filtered.sort((a, b) => `${a.name_first} ${a.name_last}`.localeCompare(`${b.name_first} ${b.name_last}`));
        break;
      case 'newest':
        // Sort by name for now since created_at doesn't exist
        filtered.sort((a, b) => `${a.name_first} ${a.name_last}`.localeCompare(`${b.name_first} ${b.name_last}`));
        break;
      case 'name':
        filtered.sort((a, b) => `${a.name_first} ${a.name_last}`.localeCompare(`${b.name_first} ${b.name_last}`));
        break;
      case 'lifestyle':
        filtered.sort((a, b) => (a.lifestyle || '').localeCompare(b.lifestyle || ''));
        break;
    }

    return filtered;
  }, [templates, searchTerm, selectedCategory, showProOnly, sortBy]);

  // Get recommended templates (first 4 templates)
  const recommendedTemplates = useMemo(() => {
    return templates.slice(0, 4);
  }, [templates]);

  // Get unique categories from templates
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    templates.forEach(template => {
      if (template.lifestyle) categorySet.add(template.lifestyle);
      if (template.content_focus) {
        template.content_focus.forEach(focus => categorySet.add(focus));
      }
    });
    return Array.from(categorySet).sort();
  }, [templates]);

  const handlePreviewTemplate = (template: TemplateInfluencer) => {
    setSelectedTemplate(template);
    setCurrentImageIndex(0);
    setShowPreviewModal(true);
  };

  // Helper function to get available images for the template
  const getAvailableImages = (template: TemplateInfluencer) => {
    const images = [];
    
    // Add profile image
    if (template.image_url) {
      images.push({
        url: template.image_url,
        label: 'Profile',
        type: 'profile'
      });
    }
    
    // Add example images from template data
    if (template.example_pic1) {
      images.push({
        url: template.example_pic1,
        label: 'Example 1',
        type: 'example'
      });
    }
    
    if (template.example_pic2) {
      images.push({
        url: template.example_pic2,
        label: 'Example 2',
        type: 'example'
      });
    }
    
    if (template.example_pic3) {
      images.push({
        url: template.example_pic3,
        label: 'Example 3',
        type: 'example'
      });
    }
    
    return images;
  };

  const handlePrevImage = () => {
    if (selectedTemplate) {
      const images = getAvailableImages(selectedTemplate);
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleNextImage = () => {
    if (selectedTemplate) {
      const images = getAvailableImages(selectedTemplate);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handleUseTemplateFromPreview = () => {
    if (selectedTemplate) {
      setShowPreviewModal(false);
      handleUseTemplate(selectedTemplate);
    }
  };

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
      const response = await fetch(`${config.supabase_server_url}/influencer`, {
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

      const responseId = await fetch(`${config.supabase_server_url}/influencer?user_id=eq.${userData.id}&new=eq.true`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      const data = await responseId.json();

      await fetch(`${config.backend_url}/createfolder`, {
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

      await fetch(`${config.backend_url}/createfolder`, {
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

      await fetch(`${config.backend_url}/createfolder`, {
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



      await fetch(`${config.backend_url}/createfolder`, {
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

      const copyResponse = await fetch(`${config.backend_url}/copyrootfile`, {
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

      const responseUpdate = await fetch(`${config.supabase_server_url}/influencer?id=eq.${data[0].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          new: false,
          image_url: `${config.data_url}/cdn-cgi/image/w=400/${userData.id}/models/${data[0].id}/profilepic/profilepic${data[0].image_num}.png`,
          image_num: data[0].image_num + 1
        })
      });

      if (response.ok) {
        navigate('/influencers/profiles', { state: { influencerData: data[0] } });
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

      {/* Filter and Search Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 pb-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates by name, style, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>



            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
              </SelectContent>
            </Select>

            {/* PRO Filter */}
            <Button
              variant={showProOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowProOnly(!showProOnly)}
              className="flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              PRO Only
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-2 text-sm text-muted-foreground">
          {filteredAndSortedTemplates.length} template{filteredAndSortedTemplates.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Recommended Templates */}
      {recommendedTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommendedTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={cn(
                  "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
                  "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                )}
                onDoubleClick={() => handlePreviewTemplate(template)}
                title="Double-click to preview template"
              >
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
                    <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                      {/* Template Type Badge - Left Top */}
                      <div className="absolute top-2 left-2 z-20">
                        {template.template_pro ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white border-0 shadow-lg text-xs font-semibold px-2 py-1 backdrop-blur-sm">
                                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
                                  </svg>
                                  PRO
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Exclusive PRO template with premium features</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white border-0 shadow-lg text-xs font-semibold px-2 py-1 backdrop-blur-sm">
                                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                  </svg>
                                  FREE
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Free template available to all users</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      {/* LoraStatusIndicator positioned at top right */}
                      <div className="absolute right-[-15px] top-[-15px] z-10">
                        <LoraStatusIndicator
                          status={template.lorastatus || 0}
                          className="flex-shrink-0"
                        />
                      </div>

                      {/* Template Image */}
                      {template.image_url ? (
                        <img
                          src={template.image_url}
                          alt={`${template.name_first} ${template.name_last}`}
                          className="w-full h-full object-cover"
                          onDoubleClick={() => handlePreviewTemplate(template)}
                        />
                      ) : (
                        <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No image found</h3>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base sm:text-lg group-hover:text-ai-purple-500 transition-colors">
                            {template.name_first} {template.name_last}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex text-xs sm:text-sm text-muted-foreground flex-col">
                          {template.notes ? (
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {template.notes.length > 50
                                ? `${template.notes.substring(0, 50)}...`
                                : template.notes
                              }
                            </span>
                          ) : (
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {template.lifestyle || 'No lifestyle'} • {template.origin_residence || 'No residence'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Focus Badges */}
                      {template.content_focus && template.content_focus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.content_focus.slice(0, 2).map((focus, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {focus}
                            </Badge>
                          ))}
                          {template.content_focus.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.content_focus.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Template Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewTemplate(template);
                          }}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-2"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                          disabled={loadingButtons[template.id]}
                          className="relative overflow-hidden border-green-200 hover:border-green-300 bg-white hover:bg-green-50 text-green-600 hover:text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] text-xs sm:text-sm px-2 sm:px-3 py-2"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {loadingButtons[template.id] ? (
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
                          )}
                          <span className="relative z-10">
                            {loadingButtons[template.id] ? 'Creating...' : 'Use Template'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {filteredAndSortedTemplates.map((template) => (
          <Card 
            key={template.id} 
            className={cn(
              "group cursor-pointer transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105",
              "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
            )}
            onDoubleClick={() => handlePreviewTemplate(template)}
            title="Double-click to preview template"
          >
            <CardContent className="p-4 sm:p-6 h-full">
              <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
                <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                  {/* Template Type Badge - Left Top */}
                  <div className="absolute top-2 left-2 z-20">
                    {template.template_pro ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white border-0 shadow-lg text-xs font-semibold px-2 py-1 backdrop-blur-sm">
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
                              </svg>
                              PRO
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Exclusive PRO template with premium features</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white border-0 shadow-lg text-xs font-semibold px-2 py-1 backdrop-blur-sm">
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              FREE
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Free template available to all users</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {/* LoraStatusIndicator positioned at top right */}
                  <div className="absolute right-[-15px] top-[-15px] z-10">
                    <LoraStatusIndicator
                      status={template.lorastatus || 0}
                      className="flex-shrink-0"
                    />
                  </div>

                  {/* Template Image */}
                  {template.image_url ? (
                    <img
                      src={template.image_url}
                      alt={`${template.name_first} ${template.name_last}`}
                      className="w-full h-full object-cover"
                      onDoubleClick={() => handlePreviewTemplate(template)}
                    />
                  ) : (
                    <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No image found</h3>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base sm:text-lg group-hover:text-ai-purple-500 transition-colors">
                        {template.name_first} {template.name_last}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex text-xs sm:text-sm text-muted-foreground flex-col">
                      {template.notes ? (
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {template.notes.length > 50
                            ? `${template.notes.substring(0, 50)}...`
                            : template.notes
                          }
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {template.lifestyle || 'No lifestyle'} • {template.origin_residence || 'No residence'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Focus Badges */}
                  {template.content_focus && template.content_focus.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.content_focus.slice(0, 2).map((focus, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {focus}
                        </Badge>
                      ))}
                      {template.content_focus.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.content_focus.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Template Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTemplate(template);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-2"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template);
                      }}
                      disabled={loadingButtons[template.id]}
                      className="relative overflow-hidden border-green-200 hover:border-green-300 bg-white hover:bg-green-50 text-green-600 hover:text-green-700 font-medium shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] text-xs sm:text-sm px-2 sm:px-3 py-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {loadingButtons[template.id] ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
                      )}
                      <span className="relative z-10">
                        {loadingButtons[template.id] ? 'Creating...' : 'Use Template'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-ai-gradient bg-clip-text text-transparent">
              Template Preview
            </DialogTitle>
            <DialogDescription className="text-sm">
              See what this template looks like and learn more about it
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (() => {
            const availableImages = getAvailableImages(selectedTemplate);
            const currentImage = availableImages[currentImageIndex];
            
            return (
              <div className="space-y-4">
                {/* Image Gallery Section */}
                <div className="flex gap-4">
                  {/* Main Image Display */}
                  <div className="flex-1">
                    <div 
                      className="relative aspect-[3/4] w-full max-w-sm mx-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden shadow-md group cursor-pointer"
                      onMouseEnter={() => {}}
                    >
                      {currentImage && (
                        <img 
                          src={currentImage.url} 
                          alt={currentImage.label} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            // Fallback to profile image if example image fails to load
                            if (currentImage.type === 'example' && selectedTemplate.image_url) {
                              (e.target as HTMLImageElement).src = selectedTemplate.image_url;
                            }
                          }}
                        />
                      )}
                      
                      {/* Template Type Badge - Left Top */}
                      <div className="absolute top-4 left-4 z-10">
                        {selectedTemplate.template_pro ? (
                          <Badge className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white border-0 shadow-lg font-semibold px-3 py-2 backdrop-blur-sm">
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
                            </svg>
                            PRO Template
                          </Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white border-0 shadow-lg font-semibold px-3 py-2 backdrop-blur-sm">
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            FREE Template
                          </Badge>
                        )}
                      </div>

                      {/* Navigation Arrows - Only show on hover when more than 1 image */}
                      {availableImages.length > 1 && (
                        <>
                          {/* Left Arrow */}
                          <div 
                            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                            onClick={handlePrevImage}
                          >
                            <div className="bg-black/50 hover:bg-black/70 rounded-full p-1.5 backdrop-blur-sm">
                              <ChevronLeft className="w-4 h-4 text-white" />
                            </div>
                          </div>

                          {/* Right Arrow */}
                          <div 
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                            onClick={handleNextImage}
                          >
                            <div className="bg-black/50 hover:bg-black/70 rounded-full p-1.5 backdrop-blur-sm">
                              <ChevronRight className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Image Label */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <Badge variant="secondary" className="bg-black/50 text-white border-0 backdrop-blur-sm">
                          {currentImage?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="flex flex-col gap-2 w-20">
                    {availableImages.map((image, index) => (
                      <div
                        key={index}
                        className={`aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background' 
                            : 'hover:ring-1 hover:ring-blue-300 hover:ring-offset-1 hover:ring-offset-background'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img 
                          src={image.url} 
                          alt={image.label} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            // Fallback to profile image if example image fails to load
                            if (image.type === 'example' && selectedTemplate.image_url) {
                              (e.target as HTMLImageElement).src = selectedTemplate.image_url;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template Details - Compact */}
                <div className="space-y-3">
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-1">
                      {selectedTemplate.name_first} {selectedTemplate.name_last}
                    </h2>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      {selectedTemplate.lifestyle && <span>{selectedTemplate.lifestyle}</span>}
                      {selectedTemplate.origin_residence && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {selectedTemplate.origin_residence}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compact Information */}
                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-sm">
                    {selectedTemplate.age && (
                      <div className="text-center">
                        <div className="text-muted-foreground">Age</div>
                        <div className="font-medium">{selectedTemplate.age}</div>
                      </div>
                    )}
                    {selectedTemplate.sex && (
                      <div className="text-center">
                        <div className="text-muted-foreground">Gender</div>
                        <div className="font-medium capitalize">{selectedTemplate.sex}</div>
                      </div>
                    )}
                    {selectedTemplate.cultural_background && (
                      <div className="text-center">
                        <div className="text-muted-foreground">Background</div>
                        <div className="font-medium text-xs">{selectedTemplate.cultural_background}</div>
                      </div>
                    )}
                  </div>

                  {/* Compact Description */}
                  {selectedTemplate.notes && (
                    <div className="max-w-2xl mx-auto">
                      <p className="text-sm text-muted-foreground text-center line-clamp-3">
                        {selectedTemplate.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreviewModal(false)}
                      className="flex-1"
                      size="sm"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleUseTemplateFromPreview}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={loadingButtons[selectedTemplate.id]}
                      size="sm"
                    >
                      {loadingButtons[selectedTemplate.id] ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-2" />
                          Use Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
