import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Slices
import authSlice from './slices/authSlice';
import healthSlice from './slices/healthSlice';
import deviceSlice from './slices/deviceSlice';
import uiSlice from './slices/uiSlice';

// Persist konfigürasyonu
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'health', 'device'], // UI state'i persist etmiyoruz
};

const rootReducer = combineReducers({
  auth: authSlice,
  health: healthSlice,
  device: deviceSlice,
  ui: uiSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Development'ta bile middleware'leri kapat (performance için)
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch; 