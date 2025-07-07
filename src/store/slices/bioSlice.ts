import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BioState {
  [influencerId: string]: any;
}

const initialState: BioState = {};

const bioSlice = createSlice({
  name: 'bio',
  initialState,
  reducers: {
    setBio: (state, action: PayloadAction<{ influencerId: string; bio: any }>) => {
      state[action.payload.influencerId] = action.payload.bio;
    },
    clearBio: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { setBio, clearBio } = bioSlice.actions;
export default bioSlice.reducer; 