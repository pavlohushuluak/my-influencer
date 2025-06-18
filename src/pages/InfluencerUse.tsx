import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Search, MessageCircle, Instagram, Send, X, Filter, Crown, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { Influencer } from '@/store/slices/influencersSlice';
import { setInfluencers, setLoading, setError } from '@/store/slices/influencersSlice';

const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'from-pink-500 to-purple-600',
    description: 'Create posts for Instagram'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'from-green-500 to-green-600',
    description: 'Generate WhatsApp messages'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: Send,
    color: 'from-blue-500 to-blue-600',
    description: 'Create Telegram content'
  }
];

const SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'name', label: 'Name' },
  { id: 'age_lifestyle', label: 'Age/Lifestyle' },
  { id: 'influencer_type', label: 'Type' }
];

export default function InfluencerUse() {
  const influencers = useSelector((state: RootState) => state.influencers.influencers);
  const { subscription } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedSearchField, setSelectedSearchField] = useState(SEARCH_FIELDS[0]);
  const [openFilter, setOpenFilter] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedInfluencerData, setSelectedInfluencerData] = useState<Influencer | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch(`https://db.nymia.ai/rest/v1/influencer?user_id=eq.${userData.id}`, {
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

    fetchInfluencers();
  }, [userData.id]);

  const handleUseInfluencer = (influencerId: string) => {
    const influencer = influencers.find(i => i.id === influencerId);
    if (!influencer) return;

    // Check if user has required subscription level
    if (subscription === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    setSelectedInfluencer(influencerId);
    setSelectedInfluencerData(influencer);
    setShowPlatformModal(true);
  };

  const handlePlatformSelect = (platformId: string) => {
    const influencer = influencers.find(inf => inf.id === selectedInfluencer);
    const platform = PLATFORMS.find(p => p.id === platformId);

    if (influencer && platform) {
      navigate('/content/create', {
        state: {
          influencerData: influencer,
          platform: platform,
          mode: 'create'
        }
      });
      setShowPlatformModal(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Use Influencer
        </h1>
        <p className="text-muted-foreground">
          Select an influencer and platform to create content.
        </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInfluencers.map((influencer) => (
          <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                  <img
                    src={influencer.image_url}
                    alt={`${influencer.name_first} ${influencer.name_last}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                      {influencer.name_first} {influencer.name_last}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex text-sm text-muted-foreground flex-col">
                      <span className="font-medium mr-2">Age/Lifestyle:</span>
                      {influencer.age_lifestyle}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-medium mr-2">Type:</span>
                      {influencer.influencer_type}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUseInfluencer(influencer.id)}
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

      {/* Platform Selection Modal */}
      <Dialog
        open={showPlatformModal}
        onOpenChange={(open) => setShowPlatformModal(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Platform</DialogTitle>
          </DialogHeader>

          {selectedInfluencerData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <img
                  src={selectedInfluencerData.image_url}
                  alt={selectedInfluencerData.name_first}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium">{selectedInfluencerData.name_first} {selectedInfluencerData.name_last}</h4>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Select a platform to create content:</p>
                {PLATFORMS.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => handlePlatformSelect(platform.id)}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${platform.color} flex items-center justify-center mr-3`}>
                      <platform.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-muted-foreground">{platform.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog
        open={showUpgradeModal}
        onOpenChange={(open) => setShowUpgradeModal(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              This influencer is only available with a Professional or Enterprise subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Professional Plan</h3>
                  <p className="text-sm text-muted-foreground">$19.99/month</p>
                </div>
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                  onClick={() => navigate('/pricing')}
                >
                  Upgrade
                </Button>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-600" />
                  Access to premium influencers
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-600" />
                  Advanced customization options
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-600" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
