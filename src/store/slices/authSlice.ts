import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signIn, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

export interface User {
  username: string;
  email: string;
  attributes?: any;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initializing: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initializing: true,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { isSignedIn } = await signIn({
        username: email,
        password,
      });

      if (isSignedIn) {
        const currentUser = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();
        
        return {
          username: currentUser.username,
          email: userAttributes.email || email,
          attributes: userAttributes,
        };
      }
      
      throw new Error('Giriş başarısız');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Giriş yapılırken hata oluştu');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Çıkış yapılırken hata oluştu');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      return {
        username: currentUser.username,
        email: userAttributes.email || '',
        attributes: userAttributes,
      };
    } catch (error: any) {
      return rejectWithValue('Kullanıcı giriş yapmamış');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.initializing = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      })
      
    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      
    // Check Auth Status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.initializing = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.initializing = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.initializing = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError, setInitializing } = authSlice.actions;
export default authSlice.reducer; 