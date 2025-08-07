import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Brain,
  Image as ImageIcon,
  Settings,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  ArrowLeft,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';
import { LoraStatusIndicator } from '@/components/Influencers/LoraStatusIndicator';
import LoraManagement from '@/components/LoraManagement';
import config from '@/config/config';

interface Influencer {
  id: string;
  user_id: string;
  image_url: string;
  influencer_type: string;
  name_first: string;
  name_last: string;
  visual_only: boolean;
  sex: string;
  age_lifestyle: string;
  origin_birth: string;
  origin_residence: string;
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
  created_at: string;
  updated_at: string;
  image_num: number;
  age: string;
  lifestyle: string;
  eye_shape: string;
  lorastatus: number;
  bio?: any;
}

export default function Lora() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const isLoading = useSelector((state: RootState) => state.influencers.loading);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    lorastatus: null as number | null,
    favorites: null as boolean | null,
  });

  // Modal state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [warningType, setWarningType] = useState<'not-trained' | 'training' | null>(null);
  const [showLoraManagementModal, setShowLoraManagementModal] = useState(false);

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

  const handleManageLora = (influencer: Influencer) => {
    const loraStatus = influencer.lorastatus || 0;

    if (loraStatus === 0) {
      // Not trained - show warning with train button
      setSelectedInfluencer(influencer);
      setWarningType('not-trained');
      setShowWarningModal(true);
    } else if (loraStatus === 1) {
      // Training in progress - allow access to management modal
      setSelectedInfluencer(influencer);
      setShowLoraManagementModal(true);
    } else if (loraStatus === 2) {
      // Trained - show LoRA management component
      setSelectedInfluencer(influencer);
      setShowLoraManagementModal(true);
    } else {
      // Error or other status - treat as not trained
      setSelectedInfluencer(influencer);
      setWarningType('not-trained');
      setShowWarningModal(true);
    }
  };

  const handleTrainLora = () => {
    if (!selectedInfluencer) return;

    setShowWarningModal(false);
    // Navigate to InfluencerUse page with character consistency modal
    navigate('/influencers', {
      state: {
        openCharacterConsistency: true,
        selectedInfluencerId: selectedInfluencer.id
      }
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  const clearFilters = () => {
    setSelectedFilters({
      lorastatus: null,
      favorites: null,
    });
  };

  // Filter and sort influencers
  const filteredInfluencers = influencers.filter(influencer => {
    const matchesSearch = searchTerm === '' ||
      influencer.name_first.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.name_last.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLoraStatus = selectedFilters.lorastatus === null ||
      influencer.lorastatus === selectedFilters.lorastatus;

    return matchesSearch && matchesLoraStatus;
  });

  const sortedInfluencers = [...filteredInfluencers].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'newest':
        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        break;
      case 'oldest':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'name':
        comparison = `${a.name_first} ${a.name_last}`.localeCompare(`${b.name_first} ${b.name_last}`);
        break;
      case 'lorastatus':
        comparison = (a.lorastatus || 0) - (b.lorastatus || 0);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'desc' ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-ai-purple-500" />
          <p className="text-muted-foreground">Loading influencers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              LoRA Management
            </h1>
            <p className="text-muted-foreground">
              Manage character consistency training for your influencers
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search influencers by name or notes..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-background/50"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <span className="sr-only">Clear search</span>
              ×
            </Button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[120px] justify-between">
                {sortBy === 'newest' && 'Newest'}
                {sortBy === 'oldest' && 'Oldest'}
                {sortBy === 'name' && 'Name'}
                {sortBy === 'lorastatus' && 'LoRA Status'}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0" align="end">
              <div className="grid">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${sortBy === 'newest' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy('oldest')}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${sortBy === 'oldest' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                >
                  Oldest
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${sortBy === 'name' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy('lorastatus')}
                  className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${sortBy === 'lorastatus' ? 'bg-accent text-accent-foreground' : ''
                    }`}
                >
                  LoRA Status
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
          </Button>

          {/* Filter Menu Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className={`${filterMenuOpen ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' : ''}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(selectedFilters.lorastatus !== null || selectedFilters.favorites !== null) && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {[selectedFilters.lorastatus !== null ? 1 : 0, selectedFilters.favorites !== null ? 1 : 0].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Menu */}
      {filterMenuOpen && (
        <Card className="p-4 mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LoRA Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">LoRA Status</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedFilters.lorastatus === null && 'All Statuses'}
                    {selectedFilters.lorastatus === 0 && 'Not Trained'}
                    {selectedFilters.lorastatus === 1 && 'Training'}
                    {selectedFilters.lorastatus === 2 && 'Trained'}
                    {selectedFilters.lorastatus === 9 && 'Error'}
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0" align="start">
                  <div className="grid">
                    <button
                      onClick={() => setSelectedFilters(prev => ({ ...prev, lorastatus: null }))}
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${selectedFilters.lorastatus === null ? 'bg-accent text-accent-foreground' : ''
                        }`}
                    >
                      All Statuses
                    </button>
                    <button
                      onClick={() => setSelectedFilters(prev => ({ ...prev, lorastatus: 0 }))}
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${selectedFilters.lorastatus === 0 ? 'bg-accent text-accent-foreground' : ''
                        }`}
                    >
                      Not Trained
                    </button>
                    <button
                      onClick={() => setSelectedFilters(prev => ({ ...prev, lorastatus: 1 }))}
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${selectedFilters.lorastatus === 1 ? 'bg-accent text-accent-foreground' : ''
                        }`}
                    >
                      Training
                    </button>
                    <button
                      onClick={() => setSelectedFilters(prev => ({ ...prev, lorastatus: 2 }))}
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${selectedFilters.lorastatus === 2 ? 'bg-accent text-accent-foreground' : ''
                        }`}
                    >
                      Trained
                    </button>
                    <button
                      onClick={() => setSelectedFilters(prev => ({ ...prev, lorastatus: 9 }))}
                      className={`flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${selectedFilters.lorastatus === 9 ? 'bg-accent text-accent-foreground' : ''
                        }`}
                    >
                      Error
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Influencers</p>
                <p className="text-2xl font-bold">{influencers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Training</p>
                <p className="text-2xl font-bold">{influencers.filter(inf => inf.lorastatus === 1).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trained</p>
                <p className="text-2xl font-bold">{influencers.filter(inf => inf.lorastatus === 2).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Not Trained</p>
                <p className="text-2xl font-bold">{influencers.filter(inf => inf.lorastatus === 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {sortedInfluencers.map((influencer) => (
          <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col justify-between h-full space-y-4">
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
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No image found</h3>
                      </div>
                    )
                  }
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                        {influencer.name_first} {influencer.name_last}
                      </h3>
                    </div>
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

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManageLora(influencer)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Manage LoRA
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warning Modal */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${warningType === 'not-trained'
                ? 'bg-gradient-to-br from-orange-500 to-red-500'
                : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                }`}>
                {warningType === 'not-trained' ? (
                  <AlertTriangle className="w-5 h-5 text-white" />
                ) : (
                  <Clock className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className={`text-xl font-bold bg-clip-text text-transparent ${warningType === 'not-trained'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  }`}>
                  {warningType === 'not-trained' ? 'LoRA Not Trained' : 'LoRA Training in Progress'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {warningType === 'not-trained'
                    ? 'This influencer needs character consistency training'
                    : 'Character consistency training is currently active'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Card className={`border-2 ${warningType === 'not-trained'
            ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20'
            : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20'
            }`}>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {warningType === 'not-trained' ? (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Training Required
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedInfluencer?.name_first} needs character consistency training to enable high-quality AI generation.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                      <Zap className="w-3 h-3" />
                      <span>Training will improve generation quality</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <div className="relative">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Training in Progress
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedInfluencer?.name_first}'s LoRA model is currently being trained. This process typically takes 5-15 minutes.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <Clock className="w-3 h-3" />
                      <span>Training in progress...</span>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowWarningModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {warningType === 'not-trained' && (
                    <Button
                      onClick={handleTrainLora}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Train LoRA
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* LoRA Management Modal */}
      <Dialog open={showLoraManagementModal} onOpenChange={setShowLoraManagementModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0 overflow-y-auto">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold bg-ai-gradient bg-clip-text text-transparent">
              LoRA Management
            </DialogTitle>
            <DialogDescription className='text-muted-foreground'>
              Managing LoRA files for {selectedInfluencer?.name_first} {selectedInfluencer?.name_last}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0">
            {selectedInfluencer && (
              <LoraManagement
                influencerId={selectedInfluencer.id}
                influencerName={`${selectedInfluencer.name_first} ${selectedInfluencer.name_last}`}
                onClose={() => setShowLoraManagementModal(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 