import axios from 'axios';

const API_URL = 'https://nymia.ai';

export interface SubscriptionData {
  plan: 'free' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: string;
  amount: number;
}

export const subscriptionService = {
  async updateSubscription(data: SubscriptionData) {
    try {
      const response = await axios.post(`${API_URL}/subscription/`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Subscription update failed:', error);
      throw error;
    }
  },

  async getSubscriptionStatus() {
    try {
      const response = await axios.get(`${API_URL}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      throw error;
    }
  },
}; 