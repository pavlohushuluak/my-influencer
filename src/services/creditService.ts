import axios from 'axios';

const API_URL = 'https://api.nymia.ai/v1';

export interface CreditPurchaseData {
  packageId: string;
  amount: number;
  paymentMethod: string;
  credits: number;
}

export const creditService = {
  async purchaseCredits(data: CreditPurchaseData) {
    try {
      const response = await axios.post(`${API_URL}/credits/purchase`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Credit purchase failed:', error);
      throw error;
    }
  },

  async getCreditBalance() {
    try {
      const response = await axios.get(`${API_URL}/credits/balance`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
      throw error;
    }
  }
}; 