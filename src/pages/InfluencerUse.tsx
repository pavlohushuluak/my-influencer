import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { Search, MessageCircle, Instagram, Send, X, Filter, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

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
  { id: 'description', label: 'Description' },
  { id: 'tags', label: 'Tags' },
  { id: 'personality', label: 'Personality' }
];

export default function InfluencerUse() {
  const { influencers } = useSelector((state: RootState) => state.influencers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedSearchField, setSelectedSearchField] = useState(SEARCH_FIELDS[0]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Get unique tags from all influencers for suggestions
  const allTags = Array.from(new Set(influencers.flatMap(inf => inf.tags)));

  const filteredInfluencers = influencers.filter(influencer => {
    if (!debouncedSearchTerm) return true;

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    switch (selectedSearchField.id) {
      case 'name':
        return influencer.name.toLowerCase().includes(searchLower);
      case 'description':
        return influencer.description.toLowerCase().includes(searchLower);
      case 'tags':
        return influencer.tags.some(tag => tag.toLowerCase().includes(searchLower));
      case 'personality':
        return influencer.personality.toLowerCase().includes(searchLower);
      default:
        return (
          influencer.name.toLowerCase().includes(searchLower) ||
          influencer.description.toLowerCase().includes(searchLower) ||
          influencer.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          influencer.personality.toLowerCase().includes(searchLower)
        );
    }
  });

  const handleUseInfluencer = (influencerId: string) => {
    setSelectedInfluencer(influencerId);
    setShowPlatformModal(true);
  };

  const handlePlatformSelect = (platformId: string) => {
    const influencer = influencers.find(inf => inf.id === selectedInfluencer);
    const platform = PLATFORMS.find(p => p.id === platformId);
    
    if (influencer && platform) {
      console.log(`Creating content for ${influencer.name} on ${platform.name}`);
      setShowPlatformModal(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowSearchSuggestions(true);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setShowSearchSuggestions(false);
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    setShowSearchSuggestions(false);
  };

  const selectedInfluencerData = influencers.find(inf => inf.id === selectedInfluencer);

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
            
            {/* Search Suggestions */}
            {showSearchSuggestions && searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-md border">
                <div className="p-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Popular Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {allTags
                      .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                      .slice(0, 5)
                      .map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleTagClick(tag)}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            )}
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
          <Card key={influencer.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                  <img 
                    src={influencer.image} 
                    alt={influencer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{influencer.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{influencer.description}</p>
                  <p className="text-xs text-muted-foreground mb-3">{influencer.personality}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {influencer.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {influencer.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{influencer.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>Status: {influencer.status}</span>
                    <span>{influencer.generatedContent} posts</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleUseInfluencer(influencer.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Use for Content
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Selection Modal */}
      <Dialog open={showPlatformModal} onOpenChange={setShowPlatformModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Platform</DialogTitle>
          </DialogHeader>
          
          {selectedInfluencerData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <img 
                  src={selectedInfluencerData.image} 
                  alt={selectedInfluencerData.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium">{selectedInfluencerData.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedInfluencerData.description}</p>
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
    </div>
  );
}
