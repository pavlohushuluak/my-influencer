import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  level: number;
  credits: number;
  subscription: string;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  nickname: '',
  level: 0,
  credits: 0,
  subscription: 'free',
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearUser: (state) => {
      return initialState;
    }
  }
});

export const { setUser, setLoading, setError, clearUser } = userSlice.actions;
export default userSlice.reducer;
