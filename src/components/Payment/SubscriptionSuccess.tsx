import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Crown, Zap } from 'lucide-react';

interface SubscriptionSuccessProps {
  plan: 'Professional' | 'Enterprise';
}

export function SubscriptionSuccess({ plan }: SubscriptionSuccessProps) {
  const navigate = useNavigate();

  const planDetails = {
    Professional: {
      icon: Crown,
      color: 'text-purple-500',
      gradient: 'from-purple-600 to-blue-600',
      features: [
        'Advanced appearance customization',
        'Detailed personality traits',
        'Style & environment options',
        'Content focus customization',
        'Unlimited color palettes',
        'Advanced content generation',
        'Priority support'
      ]
    },
    Enterprise: {
      icon: Zap,
      color: 'text-orange-500',
      gradient: 'from-orange-500 to-yellow-500',
      features: [
        'All Professional features',
        'Unlimited customization',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Team collaboration features'
      ]
    }
  };

  const details = planDetails[plan];

  return (
    <div className="container max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className={`p-3 rounded-full bg-${details.color}/10`}>
            <details.icon className={`h-12 w-12 ${details.color}`} />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to {plan} Plan!
        </h1>
        <p className="text-muted-foreground">
          Your subscription has been successfully activated. You now have access to all {plan} features.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your New Features</h2>
              <ul className="space-y-3">
                {details.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className={`h-5 w-5 ${details.color}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Next Steps</h2>
              <div className="grid gap-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className={`bg-gradient-to-r ${details.gradient} text-white hover:opacity-90`}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/settings')}
                >
                  Manage Subscription
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Need help getting started?</p>
        <Button
          variant="link"
          className="text-sm"
          onClick={() => navigate('/contact')}
        >
          Contact our support team
        </Button>
      </div>
    </div>
  );
} 