
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { InfluencerCard } from '@/components/Influencers/InfluencerCard';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Influencers() {
  const navigate = useNavigate();
  const { influencers } = useSelector((state: RootState) => state.influencers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateContent = (influencerId: string) => {
    navigate('/content');
  };

  const handleEditInfluencer = (influencerId: string) => {
    navigate('/create');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            My Influencers
          </h1>
          <p className="text-muted-foreground">
            Manage your AI personalities and generate content
          </p>
        </div>
        <Button
          onClick={() => navigate('/create')}
          className="bg-ai-gradient hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Influencer
        </Button>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInfluencers.map((influencer) => (
          <InfluencerCard
            key={influencer.id}
            influencer={influencer}
            onGenerateContent={handleGenerateContent}
            onEditInfluencer={handleEditInfluencer}
          />
        ))}
      </div>

      {filteredInfluencers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No influencers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first AI influencer to get started'}
          </p>
          <Button
            onClick={() => navigate('/create')}
            className="bg-ai-gradient hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Influencer
          </Button>
        </div>
      )}
    </div>
  );
}
