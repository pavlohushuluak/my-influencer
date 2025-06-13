import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PayPalPaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PayPalPayment({ amount, onSuccess, onCancel }: PayPalPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayPalPayment = async () => {
    setIsLoading(true);

    try {
      // TODO: Implement actual PayPal payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Payment processed successfully');
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">PayPal Payment</h2>
        <p className="text-muted-foreground">
          Complete your payment of ${amount} using PayPal
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <CreditCard className="h-16 w-16 text-blue-600" />
            </div>

            <div className="text-center space-y-2">
              <p className="font-medium">You will be redirected to PayPal</p>
              <p className="text-sm text-muted-foreground">
                Complete your payment securely on PayPal's website
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayPalPayment}
                disabled={isLoading}
                className="flex-1 bg-[#0070ba] text-white hover:bg-[#005ea6]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay with PayPal'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 