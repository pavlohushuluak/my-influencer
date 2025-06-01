
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleItem {
  id: string;
  title: string;
  platform: 'instagram' | 'facebook' | 'twitter';
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  thumbnail?: string;
}

interface ScheduleCardProps {
  className?: string;
}

const mockScheduleItems: ScheduleItem[] = [
  {
    id: '1',
    title: 'Summer Fashion Collection',
    platform: 'instagram',
    scheduledTime: '2024-01-15T14:30:00',
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Behind the Scenes',
    platform: 'facebook',
    scheduledTime: '2024-01-15T16:00:00',
    status: 'scheduled',
  },
  {
    id: '3',
    title: 'Daily Inspiration',
    platform: 'twitter',
    scheduledTime: '2024-01-15T18:00:00',
    status: 'published',
  },
];

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
};

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export function ScheduleCard({ className }: ScheduleCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Schedule
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockScheduleItems.map((item) => {
          const PlatformIcon = platformIcons[item.platform];
          
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-100/50 dark:border-purple-800/30">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50">
                <PlatformIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">{item.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{formatTime(item.scheduledTime)}</span>
                  <Badge variant="secondary" className={cn("text-xs", statusColors[item.status])}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
        
        <Button variant="outline" className="w-full mt-4">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule New Post
        </Button>
      </CardContent>
    </Card>
  );
}
