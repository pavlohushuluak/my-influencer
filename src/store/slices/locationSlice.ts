
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  mood: string;
  lighting: string;
  season: string;
  tags: string[];
  image?: string;
}

interface LocationState {
  locations: Location[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  locations: [
    {
      id: '1',
      name: 'Modern Coffee Shop',
      type: 'Cafe',
      description: 'Trendy coffee shop with industrial decor and large windows',
      mood: 'Bright & Cheerful',
      lighting: 'Natural Light',
      season: 'All Season',
      tags: ['Urban', 'Trendy', 'Social']
    },
    {
      id: '2',
      name: 'City Rooftop',
      type: 'Outdoor',
      description: 'High-rise rooftop with city skyline views',
      mood: 'Modern & Clean',
      lighting: 'Golden Hour',
      season: 'Summer',
      tags: ['Urban', 'Luxurious', 'Views']
    },
    {
      id: '3',
      name: 'Home Studio',
      type: 'Studio',
      description: 'Clean white backdrop with professional lighting setup',
      mood: 'Modern & Clean',
      lighting: 'Studio Lighting',
      season: 'All Season',
      tags: ['Professional', 'Clean', 'Controlled']
    }
  ],
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    addLocation: (state, action: PayloadAction<Location>) => {
      state.locations.push(action.payload);
    },
    updateLocation: (state, action: PayloadAction<Location>) => {
      const index = state.locations.findIndex(location => location.id === action.payload.id);
      if (index !== -1) {
        state.locations[index] = action.payload;
      }
    },
    deleteLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter(location => location.id !== action.payload);
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
  addLocation, 
  updateLocation, 
  deleteLocation, 
  setLoading, 
  setError 
} = locationSlice.actions;

export default locationSlice.reducer;
