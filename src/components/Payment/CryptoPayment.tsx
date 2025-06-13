import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bitcoin, Copy, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CryptoPaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CryptoPayment({ amount, onSuccess, onCancel }: CryptoPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [isCopied, setIsCopied] = useState(false);

  // Mock wallet addresses - replace with actual addresses
  const walletAddresses = {
    btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    usdt: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddresses[selectedCrypto as keyof typeof walletAddresses]);
    setIsCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePaymentComplete = async () => {
    setIsLoading(true);

    try {
      // TODO: Implement actual crypto payment verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Payment verified successfully');
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Cryptocurrency Payment</h2>
        <p className="text-muted-foreground">
          Complete your payment of ${amount} using cryptocurrency
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <Bitcoin className="h-16 w-16 text-orange-500" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Cryptocurrency</label>
                <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Send Payment To</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-muted rounded-md text-sm font-mono break-all">
                    {walletAddresses[selectedCrypto as keyof typeof walletAddresses]}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyAddress}
                    className="shrink-0"
                  >
                    {isCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="font-medium">Important Instructions</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Send exactly the required amount</li>
                  <li>• Include the payment reference in the memo field</li>
                  <li>• Wait for network confirmation</li>
                </ul>
              </div>
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
                onClick={handlePaymentComplete}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'I Have Sent the Payment'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 