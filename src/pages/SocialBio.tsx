import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Search, MessageCircle, Instagram, Send, X, Filter, Crown, Plus, Sparkles, Image, Copy, Upload, Trash, Loader2, FileText, Wand2, Check, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate, useLocation } from 'react-router-dom';
import { Influencer } from '@/store/slices/influencersSlice';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { setUser } from '@/store/slices/userSlice';
import { toast } from 'sonner';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';
import { setBio } from '@/store/slices/bioSlice';
import config from '@/config/config';

const SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'name', label: 'Name' },
  { id: 'age_lifestyle', label: 'Age/Lifestyle' },
  { id: 'influencer_type', label: 'Type' }
];

export default function SocialBio() {
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const isLoading = useSelector((state: RootState) => state.influencers.loading);
  const { subscription } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [selectedSearchField, setSelectedSearchField] = useState(SEARCH_FIELDS[0]);
  const [openFilter, setOpenFilter] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedInfluencerData, setSelectedInfluencerData] = useState<Influencer | null>(null);
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioMode, setBioMode] = useState<'view' | 'create' | null>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  const filteredInfluencers = influencers.filter(influencer => {
    if (!debouncedSearchTerm) return true;

    const searchLower = debouncedSearchTerm.toLowerCase();

    switch (selectedSearchField.id) {
      case 'name':
        return `${influencer.name_first} ${influencer.name_last}`.toLowerCase().includes(searchLower);
      case 'age_lifestyle':
        return influencer.age_lifestyle.toLowerCase().includes(searchLower);
      case 'influencer_type':
        return influencer.influencer_type.toLowerCase().includes(searchLower);
      default:
        return (
          `${influencer.name_first} ${influencer.name_last}`.toLowerCase().includes(searchLower) ||
          influencer.age_lifestyle.toLowerCase().includes(searchLower) ||
          influencer.influencer_type.toLowerCase().includes(searchLower)
        );
    }
  });

  const userData = useSelector((state: RootState) => state.user);

  const fetchInfluencers = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`${config.supabase_server_url}/influencer?user_id=eq.${userData.id}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch influencers');
      }

      const data = await response.json();
      dispatch(setInfluencers(data));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [userData.id]);

  // Auto-trigger bio button click when navigating from Quick Actions modal
  useEffect(() => {
    if (location.state?.influencerData && location.state?.fromQuickActions && location.state?.autoClickBio && influencers.length > 0 && !isLoading) {
      const influencerData = location.state.influencerData;
      const targetInfluencer = influencers.find(inf => inf.id === influencerData.id);
      
      if (targetInfluencer) {
        console.log('Auto-clicking bio button for influencer:', targetInfluencer.name_first);
        
        // Simulate clicking the bio button on the influencer card
        // This is exactly what happens when user clicks the bio button
        setTimeout(() => {
          handleBioClick(targetInfluencer.id);
        }, 500); // Small delay to ensure page is fully loaded
        
        // Clear the location state to prevent re-triggering
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, influencers, isLoading]);

  const handleBioClick = (influencerId: string) => {
    const influencer = influencers.find(i => i.id === influencerId);
    if (!influencer) return;

    setSelectedInfluencer(influencerId);
    setSelectedInfluencerData(influencer);

    if (!influencer?.bio || Object.keys(influencer.bio).length === 0) {
      setBioMode('create');
    } else {
      setBioMode('view');
    }
    setShowBioModal(true);
  };

  const handleCreateBio = async () => {
    if (!selectedInfluencerData) return;
    setBioLoading(true);
    setBioError(null);
    try {
      // Remove bio from influencer data
      const { bio, ...influencerData } = selectedInfluencerData;
      const response = await fetch(`${config.backend_url}/biowizard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify([influencerData]),
      });
      if (!response.ok) {
        throw new Error('Failed to generate bio');
      }
      const data = await response.json();
      // Save to redux store
      dispatch(setBio({ influencerId: selectedInfluencerData.id, bio: data }));
      // Save to database
      const patchResponse = await fetch(`${config.supabase_server_url}/influencer?id=eq.${selectedInfluencerData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI',
        },
        body: JSON.stringify({ bio: data }),
      });
      if (!patchResponse.ok) {
        throw new Error('Failed to save bio to database');
      }
      setShowBioModal(false);
      toast.success('Bio generated successfully!');
      navigate(`/influencers/bio?id=${selectedInfluencerData.id}`);
    } catch (err: any) {
      setBioError(err.message || 'Failed to generate or save bio');
      toast.error('Failed to generate bio. Please try again.');
    } finally {
      setBioLoading(false);
    }
  };

  const handleViewBio = () => {
    if (selectedInfluencerData?.bio) {
      dispatch(setBio({ influencerId: selectedInfluencerData.id, bio: selectedInfluencerData.bio }));
    }
    navigate(`/influencers/bio?id=${selectedInfluencerData?.id}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Social Bio
          </h1>
          <p className="text-muted-foreground">
            Manage influencer bios for social media platforms.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search influencers..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={handleSearchClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Popover open={openFilter} onOpenChange={setOpenFilter}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {selectedSearchField.label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandList>
                  {SEARCH_FIELDS.map((field) => (
                    <CommandItem
                      key={field.id}
                      onSelect={() => {
                        setSelectedSearchField(field);
                        setOpenFilter(false);
                      }}
                    >
                      {field.label}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Results Count */}
        <div className="text-sm text-muted-foreground">
          Found {filteredInfluencers.length} influencer{filteredInfluencers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredInfluencers.map((influencer) => (
          <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
            <CardContent className="p-6 h-full">
              <div className="space-y-4 flex flex-col justify-between h-full">
                <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                  {/* LoraStatusIndicator positioned at top right */}
                  <div className="absolute right-[-15px] top-[-15px] z-10">
                    <LoraStatusIndicator 
                      status={influencer.lorastatus || 0} 
                      className="flex-shrink-0"
                    />
                  </div>
                  {
                    influencer.image_url ? (
                      <img
                        src={influencer.image_url}
                        alt={`${influencer.name_first} ${influencer.name_last}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No image found</h3>
                      </div>
                    )
                  }
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                      {influencer.name_first} {influencer.name_last}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex text-sm text-muted-foreground flex-col">
                      {influencer.notes ? (
                        <span className="text-sm text-muted-foreground">
                          {influencer.notes.length > 50 
                            ? `${influencer.notes.substring(0, 50)}...` 
                            : influencer.notes
                          }
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {influencer.lifestyle || 'No lifestyle'} • {influencer.origin_residence || 'No residence'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      size="sm"
                      onClick={() => handleBioClick(influencer.id)}
                      className="group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0 h-10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <FileText className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                      <span className="relative z-10">Bio</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bio Modal */}
      <Dialog
        open={showBioModal}
        onOpenChange={setShowBioModal}
      >
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 bg-white/5 rounded-full -translate-y-10 sm:-translate-y-16 lg:-translate-y-20 translate-x-10 sm:translate-x-16 lg:translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white/5 rounded-full translate-y-8 sm:translate-y-12 lg:translate-y-16 -translate-x-8 sm:-translate-x-12 lg:-translate-x-16"></div>

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-white/20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl sm:shadow-2xl">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Bio Management
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base lg:text-lg text-purple-100 leading-relaxed max-w-2xl mx-auto">
                Manage influencer bio with AI assistance and professional tools
              </DialogDescription>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Influencer Info Card */}
            {selectedInfluencerData && (
              <Card className="mb-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50 dark:border-indigo-800/50 shadow-xl">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
                        <img
                          src={selectedInfluencerData.image_url}
                          alt={selectedInfluencerData.name_first}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {selectedInfluencerData.name_first} {selectedInfluencerData.name_last}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {selectedInfluencerData.age_lifestyle || 'No age/lifestyle'} • {selectedInfluencerData.influencer_type || 'No type'}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          <FileText className="w-3 h-3 mr-1" />
                          Bio Management
                        </span>
                        {selectedInfluencerData.bio && Object.keys(selectedInfluencerData.bio).length > 0 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <Check className="w-3 h-3 mr-1" />
                            Bio Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {bioLoading && (
              <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50 dark:border-indigo-800/50 shadow-xl">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Generating Bio
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Creating a professional bio for {selectedInfluencerData?.name_first} using AI...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {bioError && (
              <Card className="bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200/50 dark:border-red-800/50 shadow-xl">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                    Generation Error
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{bioError}</p>
                  <Button 
                    onClick={() => setShowBioModal(false)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Create Bio State */}
            {bioMode === 'create' && !bioLoading && !bioError && (
              <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-200/50 dark:border-indigo-800/50 shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                      <Wand2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                        No Bio Found
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                        Would you like to create a professional bio for {selectedInfluencerData?.name_first} using AI? This will generate platform-specific bios optimized for engagement.
                      </p>
                    </div>
                    <Button 
                      onClick={handleCreateBio} 
                      className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] w-full sm:w-auto px-8 py-3 text-sm sm:text-base font-semibold"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-transform duration-300 group-hover:scale-110" />
                      <span className="relative z-10">Generate AI Bio</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* View Bio State */}
            {bioMode === 'view' && !bioLoading && !bioError && selectedInfluencerData && (
              <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200/50 dark:border-green-800/50 shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                      <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                        Bio Available
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
                        {selectedInfluencerData.name_first} already has a professional bio ready to view and edit. Access platform-specific content and optimization scores.
                      </p>
                    </div>
                    <Button 
                      onClick={handleViewBio} 
                      className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] w-full sm:w-auto px-8 py-3 text-sm sm:text-base font-semibold"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-transform duration-300 group-hover:scale-110" />
                      <span className="relative z-10">View & Edit Bio</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowBioModal(false)}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 sm:px-4"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 