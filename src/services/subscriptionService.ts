import axios from 'axios';

export interface SubscriptionData {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  billingDate: number;
  user_id: string;
  billedDate: number;
}

export const subscriptionService = {
  async updateSubscription(data: SubscriptionData) {
    try {
      console.log(data);
      const response = await axios.patch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${data.user_id}`, JSON.stringify({
        subscription: data.plan,
        billing_date: data.billingDate,
        billed_date: data.billedDate
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer WeInfl3nc3withAI`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Subscription update failed:', error);
      throw error;
    }
  }
}; 