import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditPurchase } from './CreditPurchase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser } from '@/store/slices/userSlice';
import { toast } from 'sonner';
import config from '@/config/config';

interface CreditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditPurchaseDialog({ open, onOpenChange }: CreditPurchaseDialogProps) {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);

  const refreshUserCredits = async () => {
    try {
      // Fetch updated user data from the server
      const response = await fetch(`${config.supabase_server_url}/user?uuid=eq.${userData.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch updated user data');
      }

      const userDataArray = await response.json();
      if (userDataArray.length > 0) {
        const updatedUser = userDataArray[0];
        
        // Update Redux store with new user data
        dispatch(setUser({
          id: updatedUser.uuid,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          nickname: updatedUser.nickname,
          credits: updatedUser.credits || 0,
          subscription: updatedUser.subscription || 'free',
          billing_date: updatedUser.billing_date || 0,
          billed_date: updatedUser.billed_date || 0,
          free_purchase: updatedUser.free_purchase,
          guide_step: updatedUser.guide_step || 1
        }));

        toast.success('Credits refreshed successfully!');
      }
    } catch (error) {
      console.error('Error refreshing credits:', error);
      toast.error('Failed to refresh credits. Please check your account manually.');
    }
  };

  const handleSuccess = async () => {
    // Refresh user credits before closing the dialog
    await refreshUserCredits();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
        </DialogHeader>
        <CreditPurchase
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
} 