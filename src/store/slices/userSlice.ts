import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  email: string | null;
  name: string | null;
  credits: number;
  subscription: 'free' | 'professional' | 'enterprise';
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: '1',
  email: 'user@example.com',
  name: 'Demo User',
  credits: 150,
  subscription: 'free',
  isAuthenticated: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
    },
    updateCredits: (state, action: PayloadAction<number>) => {
      state.credits = Math.max(0, state.credits + action.payload);
    },
    logout: (state) => {
      state.id = null;
      state.email = null;
      state.name = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateCredits, logout } = userSlice.actions;
export default userSlice.reducer;
