import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreditCard, Bitcoin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectProps {
  onSelect: (method: string) => void;
  selectedPlan: string;
  isLoading?: boolean;
  purchaseType?: 'subscription' | 'credits';
}

export function PaymentMethodSelect({ onSelect, selectedPlan, isLoading, purchaseType = 'subscription' }: PaymentMethodSelectProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const paymentMethods = [
    {
      id: 'payoneer',
      name: 'Payoneer',
      description: 'Pay securely with your Payoneer account',
      icon: CreditCard,
      color: 'text-blue-500'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Pay with Bitcoin, Ethereum, or other cryptocurrencies',
      icon: Bitcoin,
      color: 'text-orange-500'
    }
  ];

  const handleContinue = () => {
    if (selectedMethod) {
      onSelect(selectedMethod);
    }
  };

  const getDescription = () => {
    if (purchaseType === 'credits') {
      return `Choose your preferred payment method to complete your credit purchase`
    }
    return `Choose your preferred payment method to complete your ${selectedPlan} subscription`
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Select Payment Method</h2>
        <p className="text-muted-foreground">
          {getDescription()}
        </p>
      </div>

      <RadioGroup
        value={selectedMethod}
        onValueChange={setSelectedMethod}
        className="grid gap-4"
      >
        {paymentMethods.map((method) => (
          <Label
            key={method.id}
            htmlFor={method.id}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent",
              selectedMethod === method.id && "border-primary"
            )}
          >
            <div className="flex items-center gap-4">
              <RadioGroupItem value={method.id} id={method.id} />
              <div className="flex items-center gap-3">
                <method.icon className={cn("h-6 w-6", method.color)} />
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>

      <Button
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
        onClick={handleContinue}
        disabled={!selectedMethod || isLoading}
      >
        {isLoading ? (
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