import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentMethodSelect } from './PaymentMethodSelect';
import { PayoneerPayment } from './PayoneerPayment';
import { PayPalPayment } from './PayPalPayment';
import { CryptoPayment } from './CryptoPayment';
import { cn } from '@/lib/utils';
import { creditService } from '@/services/creditService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'basic',
    credits: 100,
    price: 9.95,
    bonus: 0
  },
  {
    id: 'standard',
    credits: 500,
    price: 49.95,
    bonus: 50,
    popular: true
  },
  {
    id: 'premium',
    credits: 1000,
    price: 99.95,
    bonus: 150
  }
];

type PaymentStep = 'select' | 'payoneer' | 'paypal' | 'crypto' | 'success' | 'payment-method';

interface CreditPurchaseProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreditPurchase({ onSuccess, onCancel }: CreditPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state: RootState) => state.user);

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setPaymentStep(method as PaymentStep);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPackage || !paymentMethod) return;

    setLoading(true);
    try {
      const packageData = CREDIT_PACKAGES.find(pkg => pkg.id === selectedPackage);
      if (!packageData) throw new Error('Invalid package selected');

      await creditService.purchaseCredits({
        user_id: userData.id,
        credits: packageData.credits + packageData.bonus + userData.credits
      });

      toast.success('Credits purchased successfully!', {
        description: `Added ${packageData.credits + packageData.bonus} credits to your account.`
      });
      
      onSuccess();
    } catch (error) {
      toast.error('Failed to purchase credits');
      setPaymentStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setPaymentStep('select');
    setPaymentMethod(null);
  };

  if (paymentStep === 'select') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Purchase Credits</h2>
          <p className="text-muted-foreground">
            Choose a credit package that suits your needs
          </p>
        </div>

        <RadioGroup
          value={selectedPackage}
          onValueChange={setSelectedPackage}
          className="grid gap-4"
        >
          {CREDIT_PACKAGES.map((pkg) => (
            <Label
              key={pkg.id}
              htmlFor={pkg.id}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent",
                selectedPackage === pkg.id && "border-primary",
                pkg.popular && "border-ai-purple-500"
              )}
            >
              <div className="flex items-center gap-4">
                <RadioGroupItem value={pkg.id} id={pkg.id} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{pkg.credits} Credits</p>
                    {pkg.bonus > 0 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        +{pkg.bonus} bonus
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ${pkg.price.toFixed(2)}
                  </p>
                </div>
              </div>
              {pkg.popular && (
                <span className="text-xs bg-ai-purple-100 text-ai-purple-800 px-2 py-0.5 rounded-full">
                  Most Popular
                </span>
              )}
            </Label>
          ))}
        </RadioGroup>

        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          onClick={() => setPaymentStep('payment-method')}
          disabled={!selectedPackage || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Continue to Payment'
          )}
        </Button>
      </div>
    );
  }

  if (paymentStep === 'payment-method') {
    return (
      <PaymentMethodSelect
        onSelect={handlePaymentMethodSelect}
        selectedPlan={selectedPackage}
        isLoading={loading}
        purchaseType="credits"
      />
    );
  }

  const packageData = CREDIT_PACKAGES.find(pkg => pkg.id === selectedPackage);
  if (!packageData) return null;

  return (
    <div className="space-y-6">
      {paymentStep === 'payoneer' && (
        <PayoneerPayment
          amount={packageData.price}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
      {paymentStep === 'paypal' && (
        <PayPalPayment
          amount={packageData.price}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
      {paymentStep === 'crypto' && (
        <CryptoPayment
          amount={packageData.price}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
} 