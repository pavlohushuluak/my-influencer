import axios from 'axios';

import config from '@/config/config';

const API_URL = config.backend_url;

export interface CreditPurchaseData {
  user_id: string;
  credits: number;
  subscription: string;
}

export const creditService = {
  async purchaseCredits(data: CreditPurchaseData) {
    try {
      if (data.subscription === 'free') {
        const response = await axios.patch(`${config.supabase_server_url}/user?uuid=eq.${data.user_id}`, JSON.stringify({
          credits: data.credits,
          free_purchase: false
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer WeInfl3nc3withAI`,
          },
        });
        return response.data;
      }
      else {
        const response = await axios.patch(`${config.supabase_server_url}/user?uuid=eq.${data.user_id}`, JSON.stringify({
          credits: data.credits,
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer WeInfl3nc3withAI`,
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Credit purchase failed:', error);
      throw error;
    }
  }
}; 