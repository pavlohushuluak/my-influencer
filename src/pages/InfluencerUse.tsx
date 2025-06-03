
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, MessageCircle, Instagram, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

export default function InfluencerUse() {
  const { influencers } = useSelector((state: RootState) => state.influencers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUseInfluencer = (influencerId: string) => {
    setSelectedInfluencer(influencerId);
    setShowPlatformModal(true);
  };

  const handlePlatformSelect = (platformId: string) => {
    const influencer = influencers.find(inf => inf.id === selectedInfluencer);
    const platform = PLATFORMS.find(p => p.id === platformId);
    
    if (influencer && platform) {
      // Here you would navigate to content creation with the selected influencer and platform
      console.log(`Creating content for ${influencer.name} on ${platform.name}`);
      setShowPlatformModal(false);
      // Navigate to content creation page with context
      // navigate('/content/create', { state: { influencer, platform } });
    }
  };

  const selectedInfluencerData = influencers.find(inf => inf.id === selectedInfluencer);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Use Influencers
        </h1>
        <p className="text-muted-foreground">
          Select an influencer to create content for different platforms
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search influencers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {filteredInfluencers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No influencers found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first influencer to get started'}
          </p>
        </div>
      )}

      {/* Platform Selection Modal */}
      <Dialog open={showPlatformModal} onOpenChange={setShowPlatformModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Platform</DialogTitle>
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
