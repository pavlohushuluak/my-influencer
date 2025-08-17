import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { CreditPurchaseDialog } from '@/components/Payment/CreditPurchaseDialog';
import { refreshUserCredits } from '@/utils/creditUtils';

interface GemCostData {
  id: number;
  item: string;
  description: string;
  gems: number;
  originalGemsPerImage?: number;
}

interface CreditConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gemCostData: GemCostData | null;
  userCredits: number;
  userId: string;
  isProcessing?: boolean;
  processingText?: string;
  confirmButtonText?: string;
  title?: string;
  numberOfItems?: number;
  itemType?: string;
}

export function CreditConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  gemCostData,
  userCredits,
  userId,
  isProcessing = false,
  processingText = 'Processing...',
  confirmButtonText,
  title,
  numberOfItems = 1,
  itemType = 'item'
}: CreditConfirmationModalProps) {
  const dispatch = useDispatch();
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);

  if (!gemCostData) return null;

  const hasInsufficientCredits = userCredits < gemCostData.gems;
  const modalTitle = title || (hasInsufficientCredits ? 'Insufficient Credits' : 'Credit Cost Confirmation');
  const buttonText = confirmButtonText || `Confirm & Use ${gemCostData.gems} Credits`;

  const handleInsufficientCredits = () => {
    onClose();
    setShowCreditPurchase(true);
  };

  const handleConfirmWithRefresh = async () => {
    try {
      // Call the original onConfirm function
      await onConfirm();
      
      // Refresh credits after successful payment
      // Use a timeout to ensure the payment has been processed
      setTimeout(async () => {
        await refreshUserCredits(userId, dispatch);
      }, 1000);
    } catch (error) {
      console.error('Error in confirmation:', error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              {modalTitle}
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="font-medium">{gemCostData.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {itemType === 'image' ? `Engine: ${gemCostData.item}` : gemCostData.item}
                  </p>
                </div>
                
                {gemCostData.originalGemsPerImage && numberOfItems > 1 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cost per {itemType}:</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {gemCostData.originalGemsPerImage} credits
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Number of {itemType}s:</span>
                      <span className="text-sm font-bold">{numberOfItems}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                  <span className="font-medium">Total Required Credits:</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {gemCostData.gems}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium">Your Current Credits:</span>
                  <span className={`text-xl font-bold ${userCredits >= gemCostData.gems ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {userCredits}
                  </span>
                </div>

                {hasInsufficientCredits && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      You need {gemCostData.gems - userCredits} more credits to {
                        numberOfItems > 1 
                          ? `generate ${numberOfItems} ${itemType}${numberOfItems > 1 ? 's' : ''}`
                          : `start this operation`
                      }.
                    </p>
                    {gemCostData.originalGemsPerImage && numberOfItems > 1 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        ({gemCostData.originalGemsPerImage} credits per {itemType} × {numberOfItems} {itemType}s = {gemCostData.gems} total credits)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            {hasInsufficientCredits ? (
              <Button
                onClick={handleInsufficientCredits}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Purchase Credits
              </Button>
            ) : (
              <Button
                onClick={handleConfirmWithRefresh}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {processingText}
                  </>
                ) : (
                  buttonText
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreditPurchaseDialog
        open={showCreditPurchase}
        onOpenChange={setShowCreditPurchase}
      />
    </>
  );
} 