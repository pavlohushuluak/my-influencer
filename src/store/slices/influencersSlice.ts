
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Influencer {
  id: string;
  name: string;
  image: string;
  description: string;
  personality: string;
  createdAt: string;
  generatedContent: number;
  status: 'active' | 'inactive';
  tags: string[];
}

interface InfluencersState {
  influencers: Influencer[];
  selectedInfluencer: Influencer | null;
  loading: boolean;
  error: string | null;
}

const initialState: InfluencersState = {
  influencers: [
    {
      id: '1',
      name: 'Luna Sterling',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face',
      description: 'Fashion & Lifestyle AI Influencer',
      personality: 'Sophisticated, trendy, and inspirational',
      createdAt: '2024-01-15',
      generatedContent: 127,
      status: 'active',
      tags: ['Fashion', 'Lifestyle', 'Beauty']
    },
    {
      id: '2',
      name: 'Alex Nova',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face',
      description: 'Tech & Innovation Enthusiast',
      personality: 'Tech-savvy, forward-thinking, and educational',
      createdAt: '2024-02-03',
      generatedContent: 89,
      status: 'active',
      tags: ['Technology', 'Innovation', 'Education']
    }
  ],
  selectedInfluencer: null,
  loading: false,
  error: null,
};

const influencersSlice = createSlice({
  name: 'influencers',
  initialState,
  reducers: {
    setInfluencers: (state, action: PayloadAction<Influencer[]>) => {
      state.influencers = action.payload;
    },
    addInfluencer: (state, action: PayloadAction<Influencer>) => {
      state.influencers.push(action.payload);
    },
    selectInfluencer: (state, action: PayloadAction<string>) => {
      state.selectedInfluencer = state.influencers.find(inf => inf.id === action.payload) || null;
    },
    updateInfluencer: (state, action: PayloadAction<Partial<Influencer> & { id: string }>) => {
      const index = state.influencers.findIndex(inf => inf.id === action.payload.id);
      if (index !== -1) {
        state.influencers[index] = { ...state.influencers[index], ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setInfluencers, addInfluencer, selectInfluencer, updateInfluencer, setLoading, setError } = influencersSlice.actions;
export default influencersSlice.reducer;
