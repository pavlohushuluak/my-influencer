import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RootState } from "@/store/store";
import { refreshUserCredits } from "@/utils/creditUtils";
import { useDispatch, useSelector } from "react-redux";
import { CreditPurchase } from "./CreditPurchase";

interface CreditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditPurchaseDialog({
  open,
  onOpenChange,
}: CreditPurchaseDialogProps) {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);

  const handleRefreshCredits = async () => {
    await refreshUserCredits(userData.id, dispatch);
  };

  const handleSuccess = async () => {
    // Refresh user credits before closing the dialog
    await handleRefreshCredits();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Gems</DialogTitle>
        </DialogHeader>
        <CreditPurchase onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}
