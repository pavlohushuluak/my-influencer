import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Loader2, Sparkles, Zap, Shield, Users, BarChart, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentMethodSelect } from '@/components/Payment/PaymentMethodSelect';
import { PayoneerPayment } from '@/components/Payment/PayoneerPayment';
import { PayPalPayment } from '@/components/Payment/PayPalPayment';
import { CryptoPayment } from '@/components/Payment/CryptoPayment';
import { SubscriptionSuccess } from '@/components/Payment/SubscriptionSuccess';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { updatePlan, updateBillingCycle, updatePaymentMethod } from '@/store/slices/subscriptionSlice';
import { subscriptionService } from '@/services/subscriptionService';
import { setUser } from '@/store/slices/userSlice';
import axios from 'axios';
import config from '@/config/config';

const SUBSCRIPTION_FEATURES = {
  starter: {
    name: 'Starter',
    price: '$19.95',
    description: 'Perfect for individual creators',
    icon: Sparkles,
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-blue-600',
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
    price: '$49.95',
    description: 'Best for growing creators',
    icon: Crown,
    color: 'text-purple-500',
    gradient: 'from-purple-600 to-blue-600',
    features: [
      'All Starter features',
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
    price: '$99.95',
    description: 'For teams and businesses',
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

type PaymentStep = 'select' | 'payoneer' | 'paypal' | 'crypto' | 'success';

export default function Pricing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { plan: currentPlan, billingCycle: currentBillingCycle } = useSelector((state: RootState) => state.subscription);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(currentBillingCycle);

  const handleMonthPassed = async () => {
    try {
      const newBillingDate = userData.billing_date - 1 * 30 * 24 * 60 * 60 * 1000;
      const response = await axios.patch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}`, 
        JSON.stringify({ billing_date: newBillingDate }), 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer WeInfl3nc3withAI`,
          },
        }
      );
      
      // Update local state
      dispatch(setUser({
        ...userData,
        billing_date: newBillingDate
      }));
      
      toast.success('Billed date updated successfully');
    } catch (error) {
      console.error('Failed to update billed date:', error);
      toast.error('Failed to update billed date');
    }
  };

  const handleSubscribe = async (plan: string) => {
    setSelectedPlan(plan);
    setPaymentStep('select');
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setPaymentStep(method as PaymentStep);
  };

  const userData = useSelector((state: RootState) => state.user);

  const handlePaymentSuccess = async () => {
    if (!selectedPlan || !paymentMethod) return;
    const billingDate = billingCycle === 'yearly' ? Date.now() + 1 * 365 * 24 * 60 * 60 * 1000 : Date.now() + 1 * 30 * 24 * 60 * 60 * 1000;

    try {
      await subscriptionService.updateSubscription({
        plan: selectedPlan as 'starter' | 'professional' | 'enterprise',
        user_id: userData.id,
        billingDate: billingDate,
        billedDate: Date.now()
      });

      dispatch(updatePlan(selectedPlan as 'starter' | 'professional' | 'enterprise'));
      dispatch(updateBillingCycle(billingCycle));
      dispatch(updatePaymentMethod(paymentMethod));

      setPaymentStep('success');
      dispatch(setUser({
        ...userData,
        subscription: selectedPlan as 'starter' | 'professional' | 'enterprise'
      }));
    } catch (error) {
      toast.error('Failed to update subscription');
      setPaymentStep('select');
    }
  };

  const handlePaymentCancel = () => {
    setPaymentStep('select');
    setPaymentMethod(null);
  };

  const getPlanPrice = (plan: string) => {
    const basePrice = {
      starter: 19.95,
      professional: 49.95,
      enterprise: 99.95
    }[plan] || 19.95;
    
    if (billingCycle === 'yearly') {
      // Yearly price with 20% discount: monthly_price * 12 * 0.8
      return Math.round((basePrice * 12 * 0.8) * 100) / 100;
    }
    return basePrice;
  };

  const getDisplayPrice = (plan: string) => {
    const basePrice = {
      starter: 19.95,
      professional: 49.95,
      enterprise: 99.95
    }[plan] || 19.95;
    
    if (billingCycle === 'yearly') {
      const yearlyPrice = Math.round((basePrice * 12 * 0.8) * 100) / 100;
      return `$${yearlyPrice}`;
    }
    return `$${basePrice}`;
  };

  if (paymentStep === 'success' && selectedPlan) {
    return (
      <SubscriptionSuccess
        plan={selectedPlan === 'professional' ? 'Professional' : selectedPlan === 'enterprise' ? 'Enterprise' : 'Starter'}
      />
    );
  }

  if (paymentStep === 'select' && selectedPlan) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <PaymentMethodSelect
          onSelect={handlePaymentMethodSelect}
          selectedPlan={selectedPlan}
          isLoading={loading !== null}
        />
      </div>
    );
  }

  if (paymentStep !== 'select' && selectedPlan) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        {paymentStep === 'payoneer' && (
          <PayoneerPayment
            amount={getPlanPrice(selectedPlan)}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
        {paymentStep === 'paypal' && (
          <PayPalPayment
            amount={getPlanPrice(selectedPlan)}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
        {paymentStep === 'crypto' && (
          <CryptoPayment
            amount={getPlanPrice(selectedPlan)}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <Button
            onClick={handleMonthPassed}
            variant="outline"
            size="sm"
            className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            <Clock className="w-4 h-4 mr-2" />
            A month has passed
          </Button>
          <h1 className="text-4xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Select the perfect plan for your needs. All plans include our core features,
            with additional benefits as you upgrade.
          </p>

          <div className="flex items-center gap-4 mt-4">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('monthly')}
              className="relative"
            >
              Monthly
              {billingCycle === 'monthly' && (
                <motion.div
                  layoutId="billingCycle"
                  className="absolute inset-0 bg-primary rounded-md"
                  style={{ zIndex: -1 }}
                />
              )}
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('yearly')}
              className="relative"
            >
              Yearly
              <span className="ml-2 text-xs bg-amber-500 text-amber-900 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
              {billingCycle === 'yearly' && (
                <motion.div
                  layoutId="billingCycle"
                  className="absolute inset-0 bg-primary rounded-md"
                  style={{ zIndex: -1 }}
                />
              )}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-5">
          {Object.entries(SUBSCRIPTION_FEATURES).map(([plan, details], index) => (
            <motion.div
              key={plan}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative h-full transition-all duration-200 hover:shadow-lg ${
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
                  <div className="flex items-center gap-2">
                    <details.icon className={`w-6 h-6 ${details.color}`} />
                    <CardTitle className="text-2xl">{details.name}</CardTitle>
                  </div>
                  <CardDescription>{details.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      {getDisplayPrice(plan)}
                      {plan !== 'free' && (
                        <span className="text-base font-normal text-muted-foreground">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      )}
                    </span>
                    {billingCycle === 'yearly' && plan !== 'free' && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="line-through">
                          ${(parseFloat(SUBSCRIPTION_FEATURES[plan as keyof typeof SUBSCRIPTION_FEATURES].price.replace('$', '')) * 12).toFixed(2)}
                        </span>
                        {' '}regular price
                      </div>
                    )}
                  </div>
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
                        ? `bg-gradient-to-r ${details.gradient}`
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
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-4 mt-12"
        >
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              <span>14-day Free Trial</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Need a custom plan?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/contact')}>
              Contact us
            </Button>
          </p>
        </motion.div>
      </div>
    </div>
  );
} 