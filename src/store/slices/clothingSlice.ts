
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  style: string;
  color: string;
  season: string;
  occasions: string[];
  image?: string;
}

interface ClothingState {
  items: ClothingItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ClothingState = {
  items: [
    {
      id: '1',
      name: 'White Cotton T-Shirt',
      category: 'Tops',
      style: 'Casual',
      color: 'White',
      season: 'All Season',
      occasions: ['Casual', 'Work']
    },
    {
      id: '2',
      name: 'Blue Jeans',
      category: 'Bottoms',
      style: 'Casual',
      color: 'Blue',
      season: 'All Season',
      occasions: ['Casual', 'Date']
    },
    {
      id: '3',
      name: 'Black Blazer',
      category: 'Outerwear',
      style: 'Business',
      color: 'Black',
      season: 'Fall',
      occasions: ['Work', 'Formal']
    }
  ],
  loading: false,
  error: null,
};

const clothingSlice = createSlice({
  name: 'clothing',
  initialState,
  reducers: {
    addClothingItem: (state, action: PayloadAction<ClothingItem>) => {
      state.items.push(action.payload);
    },
    updateClothingItem: (state, action: PayloadAction<ClothingItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteClothingItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
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
  addClothingItem, 
  updateClothingItem, 
  deleteClothingItem, 
  setLoading, 
  setError 
} = clothingSlice.actions;

export default clothingSlice.reducer;
