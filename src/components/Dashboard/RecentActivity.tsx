import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Image, User, Star } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'content_generated' | 'influencer_created' | 'content_enhanced';
  title: string;
  subtitle: string;
  timestamp: string;
  avatar?: string;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'content_generated',
    title: 'Summer Fashion Shoot',
    subtitle: 'Generated for Luna Sterling',
    timestamp: '2 hours ago',
    avatar: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '2',
    type: 'influencer_created',
    title: 'Alex Nova',
    subtitle: 'New AI influencer created',
    timestamp: '1 day ago',
    avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: '3',
    type: 'content_enhanced',
    title: 'Tech Workspace Setup',
    subtitle: 'Enhanced and upscaled',
    timestamp: '2 days ago'
  }
];

export function RecentActivity() {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'content_generated':
        return <Image className="w-4 h-4 text-ai-blue-500" />;
      case 'influencer_created':
        return <User className="w-4 h-4 text-ai-purple-500" />;
      case 'content_enhanced':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0">
                {activity.avatar ? (
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activity.avatar} />
                    <AvatarFallback>
                      {getIcon(activity.type)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {getIcon(activity.type)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0">
                {activity.timestamp}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
