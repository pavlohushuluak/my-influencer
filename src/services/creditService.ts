import axios from 'axios';

const API_URL = 'https://api.nymia.ai/v1';

export interface CreditPurchaseData {
  user_id: string;
  credits: number;
}

export const creditService = {
  async purchaseCredits(data: CreditPurchaseData) {
    try {
      const response = await axios.patch(`https://db.nymia.ai/rest/v1/user?uuid=eq.${data.user_id}`, JSON.stringify({
        credits: data.credits,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer WeInfl3nc3withAI`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Credit purchase failed:', error);
      throw error;
    }
  }
}; 