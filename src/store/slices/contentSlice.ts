
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ContentItem {
  id: string;
  influencerId: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  platform: 'instagram' | 'tiktok' | 'fanvue' | 'general';
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  tags: string[];
  inVault: boolean;
}

interface ContentState {
  contentLibrary: ContentItem[];
  generationQueue: ContentItem[];
  vaultItems: ContentItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ContentState = {
  contentLibrary: [
    {
      id: '1',
      influencerId: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=800&fit=crop',
      title: 'Summer Fashion Shoot',
      platform: 'instagram',
      status: 'completed',
      createdAt: '2024-05-20',
      tags: ['Fashion', 'Summer', 'Portrait'],
      inVault: true
    },
    {
      id: '2',
      influencerId: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop',
      title: 'Tech Workspace Setup',
      platform: 'instagram',
      status: 'completed',
      createdAt: '2024-05-19',
      tags: ['Technology', 'Workspace', 'Lifestyle'],
      inVault: false
    }
  ],
  generationQueue: [],
  vaultItems: [],
  loading: false,
  error: null,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    addContentItem: (state, action: PayloadAction<ContentItem>) => {
      state.contentLibrary.push(action.payload);
    },
    updateContentItem: (state, action: PayloadAction<Partial<ContentItem> & { id: string }>) => {
      const index = state.contentLibrary.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.contentLibrary[index] = { ...state.contentLibrary[index], ...action.payload };
      }
    },
    addToQueue: (state, action: PayloadAction<ContentItem>) => {
      state.generationQueue.push(action.payload);
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.generationQueue = state.generationQueue.filter(item => item.id !== action.payload);
    },
    addToVault: (state, action: PayloadAction<string>) => {
      const item = state.contentLibrary.find(item => item.id === action.payload);
      if (item) {
        item.inVault = true;
        state.vaultItems.push(item);
      }
    },
    removeFromVault: (state, action: PayloadAction<string>) => {
      const item = state.contentLibrary.find(item => item.id === action.payload);
      if (item) {
        item.inVault = false;
      }
      state.vaultItems = state.vaultItems.filter(item => item.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  addContentItem, 
  updateContentItem, 
  addToQueue, 
  removeFromQueue, 
  addToVault, 
  removeFromVault, 
  setLoading, 
  setError 
} = contentSlice.actions;
export default contentSlice.reducer;
