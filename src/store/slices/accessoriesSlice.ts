
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Accessory {
  id: string;
  name: string;
  category: string;
  description: string;
  material: string;
  color: string;
  style: string;
  occasions: string[];
  brand?: string;
  image?: string;
}

interface AccessoriesState {
  accessories: Accessory[];
  loading: boolean;
  error: string | null;
}

const initialState: AccessoriesState = {
  accessories: [
    {
      id: '1',
      name: 'Gold Chain Necklace',
      category: 'Jewelry',
      description: 'Delicate gold chain with minimal design',
      material: 'Gold',
      color: 'Gold',
      style: 'Minimalist',
      occasions: ['Work', 'Casual', 'Date'],
      brand: 'Tiffany & Co.'
    },
    {
      id: '2',
      name: 'Black Leather Handbag',
      category: 'Bags',
      description: 'Classic structured handbag with gold hardware',
      material: 'Leather',
      color: 'Black',
      style: 'Classic',
      occasions: ['Work', 'Formal'],
      brand: 'Coach'
    },
    {
      id: '3',
      name: 'Aviator Sunglasses',
      category: 'Sunglasses',
      description: 'Classic aviator style with gold frame',
      material: 'Metal',
      color: 'Gold',
      style: 'Classic',
      occasions: ['Casual', 'Beach', 'Travel'],
      brand: 'Ray-Ban'
    }
  ],
  loading: false,
  error: null,
};

const accessoriesSlice = createSlice({
  name: 'accessories',
  initialState,
  reducers: {
    addAccessory: (state, action: PayloadAction<Accessory>) => {
      state.accessories.push(action.payload);
    },
    updateAccessory: (state, action: PayloadAction<Accessory>) => {
      const index = state.accessories.findIndex(accessory => accessory.id === action.payload.id);
      if (index !== -1) {
        state.accessories[index] = action.payload;
      }
    },
    deleteAccessory: (state, action: PayloadAction<string>) => {
      state.accessories = state.accessories.filter(accessory => accessory.id !== action.payload);
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
  addAccessory, 
  updateAccessory, 
  deleteAccessory, 
  setLoading, 
  setError 
} = accessoriesSlice.actions;

export default accessoriesSlice.reducer;
