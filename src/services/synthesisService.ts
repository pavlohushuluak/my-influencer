import config from '@/config/config';

export interface SynthesisRequest {
  prompt: string;
  selectedInfluencers: string[];
  strength: number;
  guidance: number;
  userId: string;
}

export interface SynthesisResponse {
  success: boolean;
  imageUrl?: string;
  message: string;
  error?: string;
}

export const synthesisService = {
  // Generate AI synthesis content
  async generateSynthesis(request: SynthesisRequest): Promise<SynthesisResponse> {
    try {
      const response = await fetch(`${config.apiUrl}/api/synthesis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        imageUrl: data.imageUrl,
        message: data.message || 'Synthesis completed successfully!'
      };
    } catch (error) {
      console.error('Synthesis API error:', error);
      return {
        success: false,
        message: 'Failed to generate synthesis',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get synthesis history
  async getSynthesisHistory(userId: string): Promise<SynthesisResponse[]> {
    try {
      const response = await fetch(`${config.apiUrl}/api/synthesis/history/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Synthesis history API error:', error);
      return [];
    }
  },

  // Delete synthesis result
  async deleteSynthesis(synthesisId: string): Promise<boolean> {
    try {
      const response = await fetch(`${config.apiUrl}/api/synthesis/${synthesisId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Delete synthesis API error:', error);
      return false;
    }
  }
};
