import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SUBSCRIPTION_FEATURES = {
  free: {
    name: 'Free',
    price: '$0',
    features: [
      'Basic influencer information',
      'Limited appearance customization',
      'Basic style options',
      'Up to 3 color palettes',
      'Basic content generation'
    ]
  },
  professional: {
    name: 'Professional',
    price: '$19.99/month',
    features: [
      'All Free features',
      'Advanced appearance customization',
      'Detailed personality traits',
      'Style & environment options',
      'Content focus customization',
      'Unlimited color palettes',
      'Advanced content generation',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: '$49.99/month',
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

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    setLoading(plan);
    try {
      // TODO: Implement actual payment processing
      // This is a placeholder for the payment integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Subscription Successful', {
        description: `You have successfully subscribed to the ${plan} plan!`,
      });
      
      // Redirect to dashboard or profile settings
      navigate('/settings');
    } catch (error) {
      toast.error('Subscription Failed', {
        description: 'There was an error processing your subscription. Please try again.',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Select the perfect plan for your needs. All plans include our core features,
          with additional benefits as you upgrade.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-5">
        {Object.entries(SUBSCRIPTION_FEATURES).map(([plan, details]) => (
          <Card 
            key={plan}
            className={`relative ${
              plan === 'professional' 
                ? 'border-ai-purple-500 shadow-lg scale-105' 
                : 'border-border/50'
            }`}
          >
            {plan === 'professional' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-ai-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  Most Popular
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{details.name}</CardTitle>
              <CardDescription className="text-3xl font-bold mt-2">
                {details.price}
                <span className="text-base font-normal text-muted-foreground">
                  {plan !== 'free' ? '/month' : ''}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {details.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-ai-purple-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  plan === 'professional'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : 'bg-secondary'
                }`}
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan}
              >
                {loading === plan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : plan === 'free' ? (
                  'Get Started'
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>All plans include a 14-day free trial. No credit card required.</p>
        <p className="mt-2">
          Need a custom plan?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/contact')}>
            Contact us
          </Button>
        </p>
      </div>
    </div>
  );
} 