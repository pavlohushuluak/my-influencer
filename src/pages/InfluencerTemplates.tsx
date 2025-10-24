import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Eye, Settings, Search, Users, Crown, Sparkles, Heart, Image as ImageIcon, AlertTriangle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { RootState } from '@/store/store';
import { fetchTemplateInfluencers, TemplateInfluencer } from '@/store/slices/templateInfluencerSlice';
import { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/store/store';

import { cn } from '@/lib/utils';

export default function InfluencerTemplates() {
  const navigate = useNavigate();
  const [loadingButtons, setLoadingButtons] = useState<{ [key: string]: boolean }>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfluencer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [templateImages, setTemplateImages] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const { templates, loading } = useSelector((state: RootState) => state.templateInfluencer);

  useEffect(() => {
    dispatch(fetchTemplateInfluencers());
  }, [dispatch]);

  // Generate dataset images for each template (profile + examples)
  const generateTemplateImages = useMemo(() => {
    const imageMap: { [key: string]: string[] } = {};
    templates.forEach(template => {
      const datasetImages = [];
      
      // Profile picture
      if (template.image_url) {
        datasetImages.push(template.image_url);
      }
      
      // Example images from dataset
      if (template.example_pic1) {
        datasetImages.push(template.example_pic1);
      }
      if (template.example_pic2) {
        datasetImages.push(template.example_pic2);
      }
      if (template.example_pic3) {
        datasetImages.push(template.example_pic3);
      }
      
      imageMap[template.id] = datasetImages;
    });
    return imageMap;
  }, [templates]);

  // Handle functions
  const handlePreviewTemplate = (template: TemplateInfluencer) => {
    setSelectedTemplate(template);
    setTemplateImages(generateTemplateImages[template.id] || []);
    setSelectedImageIndex(0);
    setShowPreviewModal(true);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % templateImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + templateImages.length) % templateImages.length);
  };

  // Function to get image labels for dataset images
  const getImageLabel = (index: number) => {
    switch (index) {
      case 0: return 'Profile Picture';
      case 1: return 'Example 1';
      case 2: return 'Example 2';
      case 3: return 'Example 3';
      default: return `Image ${index + 1}`;
    }
  };

  const handleUseTemplate = async (template: TemplateInfluencer) => {
    setLoadingButtons(prev => ({ ...prev, [template.id]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/influencers/edit', { 
        state: { 
          influencerData: template,
          create: true,
          fromTemplate: true
        }
      });
    } catch (error) {
      console.error('Error using template:', error);
    } finally {
      setLoadingButtons(prev => ({ ...prev, [template.id]: false }));
    }
  };

  // Filter templates based on search
  const filteredTemplates = templates.filter(template => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      template.name_first.toLowerCase().includes(searchLower) ||
      template.name_last.toLowerCase().includes(searchLower) ||
      template.lifestyle?.toLowerCase().includes(searchLower) ||
      template.origin_residence?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Templates</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Make sure your influencers look the same in every image and video</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search influencers by name or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 bg-gray-900/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>


      </div>

      {/* Templates Grid - Exact same spacing as Consistency page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 px-4">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="group transition-all duration-300 hover:shadow-xl border-2 transform hover:scale-105 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
            onClick={() => handlePreviewTemplate(template)}
          >
            <CardContent className="p-4 sm:p-6 h-full">
              <div className="flex flex-col justify-between h-full space-y-3 sm:space-y-4">
                <div 
                  className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden cursor-pointer"
                  title="Click to preview template"
                >
                  {/* AI Consistency Status Badge positioned at top right */}
                  <div className="absolute right-1 top-0.5 z-10">
                    {(template.lorastatus || 0) === 2 ? (
                      <Badge className="bg-green-600/50 text-white text-[10px] px-1.5 py-0.5 font-medium rounded-sm shadow-sm">
                        Trained
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/50 text-white text-[10px] px-1.5 py-0.5 font-medium rounded-sm shadow-sm">
                        Pending
                      </Badge>
                    )}
                  </div>
                  
                  {template.image_url ? (
                    <img
                      src={template.image_url}
                      alt={`${template.name_first} ${template.name_last}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {template.lifestyle || 'No lifestyle'} • {template.origin_residence || 'No residence'}
                      </span>
                    </div>
                  </div>

                  {/* Template Action Buttons - Exact same as Consistency page */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTemplate(template);
                      }}
                      className="flex-1 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template);
                      }}
                      disabled={loadingButtons[template.id]}
                      className="flex-1 h-10 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {loadingButtons[template.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Settings className="w-4 h-4 mr-2" />
                      )}
                      {loadingButtons[template.id] ? "Creating..." : "Use"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 px-4">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No templates found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Template Preview Modal - Original Working Version */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-b border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Template Preview
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 dark:text-gray-300 mt-1">
                  {selectedTemplate?.name_first} {selectedTemplate?.name_last} - Browse multiple images and details
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedTemplate && (
            <div className="flex flex-col lg:flex-row gap-6 p-6">
              {/* Left Column - Template Details */}
              <div className="lg:w-80 space-y-6">
                {/* Template Info Card */}
                <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200/50 dark:border-purple-800/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
                          <img
                            src={selectedTemplate.image_url}
                            alt={selectedTemplate.name_first}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {selectedTemplate.name_first} {selectedTemplate.name_last}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {selectedTemplate.lifestyle || 'Template'} • {selectedTemplate.origin_residence || 'Location'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            Template
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Preview
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic Information */}
                <div className="bg-gray-800/50 dark:bg-gray-900/50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Basic Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Age</span>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedTemplate.age || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Location</span>
                      <p className="text-gray-900 dark:text-white">{selectedTemplate.origin_residence || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Background</span>
                      <p className="text-gray-900 dark:text-white">{selectedTemplate.cultural_background || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Lifestyle & Style */}
                <div className="bg-gray-800/50 dark:bg-gray-900/50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    Lifestyle & Style
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Lifestyle</span>
                      <p className="text-gray-900 dark:text-white">{selectedTemplate.lifestyle || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Body Type</span>
                      <p className="text-gray-900 dark:text-white">{selectedTemplate.body_type || 'Not specified'}</p>
                    </div>
                  </div>
                </div>


              </div>

              {/* Right Column - Large Image with Small Thumbnails */}
              <div className="flex-1 relative">
                <div className="flex gap-4 h-full">
                  {/* Large Main Image Display */}
                  <div className="flex-1">
                    <div className="relative bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl overflow-hidden aspect-[3/4] h-[500px]">
                      {templateImages.length > 0 ? (
                        <>
                          <img
                            src={templateImages[selectedImageIndex]}
                            alt={`${selectedTemplate.name_first} ${selectedTemplate.name_last} - ${getImageLabel(selectedImageIndex)}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Navigation Arrows */}
                          {templateImages.length > 1 && (
                            <>
                              <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all duration-200 z-10"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all duration-200 z-10"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {/* Image Label */}
                          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                            {getImageLabel(selectedImageIndex)}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <ImageIcon className="w-16 h-16 mb-4" />
                          <span className="text-lg">No images available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Small Thumbnail Gallery - Right Side */}
                  <div className="w-20 space-y-3">
                    {templateImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          "relative w-full h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                          selectedImageIndex === index
                            ? "border-purple-500 opacity-100 ring-2 ring-purple-300 shadow-lg"
                            : "border-gray-300 dark:border-gray-600 opacity-70 hover:opacity-100 hover:border-purple-400"
                        )}
                        title={getImageLabel(index)}
                      >
                        <img
                          src={image}
                          alt={getImageLabel(index)}
                          className="w-full h-full object-cover"
                        />
                        {/* Strong indicator for selected image */}
                        {selectedImageIndex === index && (
                          <div className="absolute top-1 right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>
                        )}
                        {/* Small label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 text-center truncate">
                          {getImageLabel(index)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons - Bottom Right */}
                <div className="absolute bottom-0 right-0 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreviewModal(false)}
                    className="h-12 px-6 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Close Preview
                  </Button>
                  <Button
                    onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate)}
                    disabled={loadingButtons[selectedTemplate.id]}
                    className="h-12 px-6 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loadingButtons[selectedTemplate.id] ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Creating Influencer...
                      </>
                    ) : (
                      <>
                        <Settings className="w-5 h-5 mr-3" />
                        Use This Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}