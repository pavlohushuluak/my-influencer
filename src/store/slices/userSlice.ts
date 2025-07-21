import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  credits: number;
  subscription: string;
  loading: boolean;
  error: string | null;
  billing_date: number;
  free_purchase: boolean;
  billed_date: number;
  guide_step: number;
}

const initialState: UserState = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  nickname: '',
  credits: 0,
  subscription: 'free',
  loading: false,
  error: null,
  billing_date: 0,
  free_purchase: true,
  billed_date: 0,
  guide_step: 1
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
