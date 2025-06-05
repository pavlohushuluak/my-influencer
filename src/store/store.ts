
import { configureStore } from '@reduxjs/toolkit';
import influencersReducer from './slices/influencersSlice';
import contentReducer from './slices/contentSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import clothingReducer from './slices/clothingSlice';
import locationReducer from './slices/locationSlice';
import posesReducer from './slices/posesSlice';
import accessoriesReducer from './slices/accessoriesSlice';

export const store = configureStore({
  reducer: {
    influencers: influencersReducer,
    content: contentReducer,
    user: userReducer,
    ui: uiReducer,
    clothing: clothingReducer,
    location: locationReducer,
    poses: posesReducer,
    accessories: accessoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
