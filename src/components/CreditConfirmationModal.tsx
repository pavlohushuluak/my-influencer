import { CreditPurchaseDialog } from "@/components/Payment/CreditPurchaseDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { refreshUserCredits } from "@/utils/creditUtils";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";

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
  processingText = "Processing...",
  confirmButtonText,
  title,
  numberOfItems = 1,
  itemType = "item",
}: CreditConfirmationModalProps) {
  const dispatch = useDispatch();
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);

  if (!gemCostData) return null;

  const hasInsufficientCredits = userCredits < gemCostData.gems;
  const modalTitle =
    title ||
    (hasInsufficientCredits ? "Insufficient Gems" : "Gem Cost Confirmation");
  const buttonText =
    confirmButtonText || `Confirm & Use ${gemCostData.gems} Gems`;

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
      console.error("Error in confirmation:", error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-[95vw] p-0">
          <DialogHeader className="px-6 py-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {modalTitle}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  This action will consume gems from your account
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Cost Information */}
            <Card className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200/50 dark:border-purple-800/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900 dark:text-gray-100 w-[70%]">
                    {gemCostData.description}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">💎</span>
                    </div>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {gemCostData.gems} Gems
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {itemType === "image"
                    ? `Engine: ${gemCostData.item}`
                    : gemCostData.item}
                </p>

                {gemCostData.originalGemsPerImage && numberOfItems > 1 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Cost per {itemType}:
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {gemCostData.originalGemsPerImage} Gems
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Number of {itemType}s:
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {numberOfItems}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Balance */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl ${
                userCredits < gemCostData.gems
                  ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                  : "bg-gray-50 dark:bg-gray-800/50"
              }`}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Balance
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    userCredits < gemCostData.gems
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                >
                  <span className="text-white text-xs">💎</span>
                </div>
                <span
                  className={`font-bold ${
                    userCredits < gemCostData.gems
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {userCredits} Gems
                </span>
              </div>
            </div>

            {/* Insufficient Gems Warning */}
            {hasInsufficientCredits && (
              <Card className="bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200/50 dark:border-red-800/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-900 dark:text-red-100">
                        Insufficient Gems
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        You need {gemCostData.gems - userCredits} more gems to{" "}
                        {numberOfItems > 1
                          ? `generate ${numberOfItems} ${itemType}${
                              numberOfItems > 1 ? "s" : ""
                            }`
                          : `start this operation`}
                        .
                        {gemCostData.originalGemsPerImage &&
                          numberOfItems > 1 && (
                            <span className="block mt-1">
                              ({gemCostData.originalGemsPerImage} gems per{" "}
                              {itemType} × {numberOfItems} {itemType}s ={" "}
                              {gemCostData.gems} total gems)
                            </span>
                          )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 text-base font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              {hasInsufficientCredits ? (
                <Button
                  onClick={handleInsufficientCredits}
                  className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Purchase Gems
                </Button>
              ) : (
                <Button
                  onClick={handleConfirmWithRefresh}
                  className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {processingText}
                    </>
                  ) : (
                    buttonText
                  )}
                </Button>
              )}
            </div>
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
