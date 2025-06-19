import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubscriptionState {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string | null;
  paymentMethod: string | null;
}

const initialState: SubscriptionState = {
  plan: 'free',
  status: 'inactive',
  billingCycle: 'monthly',
  nextBillingDate: null,
  paymentMethod: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscription: (state, action: PayloadAction<Partial<SubscriptionState>>) => {
      return { ...state, ...action.payload };
    },
    updatePlan: (state, action: PayloadAction<SubscriptionState['plan']>) => {
      state.plan = action.payload;
    },
    updateBillingCycle: (state, action: PayloadAction<SubscriptionState['billingCycle']>) => {
      state.billingCycle = action.payload;
    },
    updatePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    resetSubscription: () => initialState,
  },
});

export const { 
  setSubscription, 
  updatePlan, 
  updateBillingCycle, 
  updatePaymentMethod,
  resetSubscription 
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer; 