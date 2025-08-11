
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'create-influencer',
      title: 'Create New Influencer',
      description: 'Design your next AI personality',
      icon: User,
      gradient: 'from-ai-purple-500 to-ai-blue-500',
              onClick: () => navigate('/influencers/new')
    },
    {
      id: 'generate-content',
      title: 'Generate Content',
      description: 'Create images and videos',
      icon: Image,
      gradient: 'from-ai-blue-500 to-ai-purple-500',
      onClick: () => navigate('/content')
    },
    {
      id: 'schedule-posts',
      title: 'Schedule Posts',
      description: 'Plan your content calendar',
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-500',
      onClick: () => navigate('/content')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              onClick={action.onClick}
              className={`h-auto p-6 flex flex-col items-center gap-3 bg-gradient-to-r ${action.gradient} hover:opacity-90 transition-all duration-300 group`}
            >
              <action.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="font-semibold text-white">{action.title}</div>
                <div className="text-xs text-white/80 mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
