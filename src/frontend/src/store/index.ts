import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import thoughtsReducer from './slices/thoughtsSlice';
import connectionsReducer from './slices/connectionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    thoughts: thoughtsReducer,
    connections: connectionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;