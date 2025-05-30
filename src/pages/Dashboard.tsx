
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { RecentActivity } from '@/components/Dashboard/RecentActivity';
import { AnalyticsChart } from '@/components/Dashboard/AnalyticsChart';
import { User, Image, Star, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { influencers } = useSelector((state: RootState) => state.influencers);
  const { contentLibrary } = useSelector((state: RootState) => state.content);
  const { credits } = useSelector((state: RootState) => state.user);

  const totalContent = contentLibrary.length;
  const vaultItems = contentLibrary.filter(item => item.inVault).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your AI influencers.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Influencers"
          value={influencers.length}
          description="AI personalities created"
          icon={User}
          trend={{ value: 12, label: "from last month" }}
        />
        <StatsCard
          title="Content Generated"
          value={totalContent}
          description="Images and videos"
          icon={Image}
          trend={{ value: 8, label: "this week" }}
        />
        <StatsCard
          title="Credits Remaining"
          value={credits}
          description="Generation credits"
          icon={Star}
        />
        <StatsCard
          title="Vault Items"
          value={vaultItems}
          description="Permanently saved"
          icon={Calendar}
        />
      </div>

      {/* Analytics Charts */}
      <AnalyticsChart />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity and Generation Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        
        {/* Generation Queue Preview */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Generation Queue</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No active generations</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start generating content to see progress here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
