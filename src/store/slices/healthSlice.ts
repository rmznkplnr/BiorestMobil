import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HealthData } from '../../types/health';
import * as HealthDataService from '../../services/HealthDataService';
import healthDataSyncService from '../../services/HealthDataSyncService';

export interface HealthState {
  // Günlük veriler
  dailyData: HealthData | null;
  dailyLoading: boolean;
  dailyError: string | null;
  selectedDate: string; // ISO string format
  
  // Haftalık veriler
  weeklyData: HealthData | null;
  weeklyLoading: boolean;
  weeklyError: string | null;
  selectedWeek: string; // ISO string format
  
  // Aylık veriler
  monthlyData: HealthData | null;
  monthlyLoading: boolean;
  monthlyError: string | null;
  selectedMonth: string; // ISO string format
  
  // Senkronizasyon
  isSyncing: boolean;
  lastSync: string | null; // ISO string format
  syncError: string | null;
  
  // Genel state
  timeRange: 'day' | 'week' | 'month';
}

const initialState: HealthState = {
  // Günlük
  dailyData: null,
  dailyLoading: false,
  dailyError: null,
  selectedDate: new Date().toISOString(),
  
  // Haftalık
  weeklyData: null,
  weeklyLoading: false,
  weeklyError: null,
  selectedWeek: new Date().toISOString(),
  
  // Aylık
  monthlyData: null,
  monthlyLoading: false,
  monthlyError: null,
  selectedMonth: new Date().toISOString(),
  
  // Senkronizasyon
  isSyncing: false,
  lastSync: null,
  syncError: null,
  
  // Genel
  timeRange: 'day',
};

// Async Thunks
export const fetchDailyHealthData = createAsyncThunk(
  'health/fetchDaily',
  async (date: Date, { rejectWithValue }) => {
    try {
      const data = await HealthDataService.fetchHealthDataForDate(date);
      return { data, date: date.toISOString() };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Günlük sağlık verisi alınamadı');
    }
  }
);

export const fetchWeeklyHealthData = createAsyncThunk(
  'health/fetchWeekly',
  async ({ startDate, endDate }: { startDate: Date; endDate: Date }, { rejectWithValue }) => {
    try {
      const data = await HealthDataService.fetchHealthDataForRange(startDate, endDate);
      return { data, week: startDate.toISOString() };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Haftalık sağlık verisi alınamadı');
    }
  }
);

export const fetchMonthlyHealthData = createAsyncThunk(
  'health/fetchMonthly',
  async ({ startDate, endDate }: { startDate: Date; endDate: Date }, { rejectWithValue }) => {
    try {
      const data = await HealthDataService.fetchHealthDataForRange(startDate, endDate);
      return { data, month: startDate.toISOString() };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Aylık sağlık verisi alınamadı');
    }
  }
);

export const syncHealthData = createAsyncThunk(
  'health/sync',
  async (healthData: HealthData, { rejectWithValue }) => {
    try {
      const success = await healthDataSyncService.syncHealthData(healthData);
      if (success) {
        return new Date().toISOString();
      } else {
        throw new Error('Senkronizasyon başarısız');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Senkronizasyon hatası');
    }
  }
);

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    // Tarih değiştirme
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setSelectedWeek: (state, action: PayloadAction<string>) => {
      state.selectedWeek = action.payload;
    },
    setSelectedMonth: (state, action: PayloadAction<string>) => {
      state.selectedMonth = action.payload;
    },
    
    // Zaman aralığı değiştirme
    setTimeRange: (state, action: PayloadAction<'day' | 'week' | 'month'>) => {
      state.timeRange = action.payload;
    },
    
    // Hata temizleme
    clearDailyError: (state) => {
      state.dailyError = null;
    },
    clearWeeklyError: (state) => {
      state.weeklyError = null;
    },
    clearMonthlyError: (state) => {
      state.monthlyError = null;
    },
    clearSyncError: (state) => {
      state.syncError = null;
    },
    
    // Manuel veri güncelleme
    updateDailyData: (state, action: PayloadAction<HealthData>) => {
      state.dailyData = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Günlük veri
    builder
      .addCase(fetchDailyHealthData.pending, (state) => {
        state.dailyLoading = true;
        state.dailyError = null;
      })
      .addCase(fetchDailyHealthData.fulfilled, (state, action) => {
        state.dailyLoading = false;
        state.dailyData = action.payload.data;
        state.selectedDate = action.payload.date;
      })
      .addCase(fetchDailyHealthData.rejected, (state, action) => {
        state.dailyLoading = false;
        state.dailyError = action.payload as string;
      })
      
    // Haftalık veri
    builder
      .addCase(fetchWeeklyHealthData.pending, (state) => {
        state.weeklyLoading = true;
        state.weeklyError = null;
      })
      .addCase(fetchWeeklyHealthData.fulfilled, (state, action) => {
        state.weeklyLoading = false;
        state.weeklyData = action.payload.data;
        state.selectedWeek = action.payload.week;
      })
      .addCase(fetchWeeklyHealthData.rejected, (state, action) => {
        state.weeklyLoading = false;
        state.weeklyError = action.payload as string;
      })
      
    // Aylık veri
    builder
      .addCase(fetchMonthlyHealthData.pending, (state) => {
        state.monthlyLoading = true;
        state.monthlyError = null;
      })
      .addCase(fetchMonthlyHealthData.fulfilled, (state, action) => {
        state.monthlyLoading = false;
        state.monthlyData = action.payload.data;
        state.selectedMonth = action.payload.month;
      })
      .addCase(fetchMonthlyHealthData.rejected, (state, action) => {
        state.monthlyLoading = false;
        state.monthlyError = action.payload as string;
      })
      
    // Senkronizasyon
    builder
      .addCase(syncHealthData.pending, (state) => {
        state.isSyncing = true;
        state.syncError = null;
      })
      .addCase(syncHealthData.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.lastSync = action.payload;
      })
      .addCase(syncHealthData.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload as string;
      });
  },
});

export const {
  setSelectedDate,
  setSelectedWeek,
  setSelectedMonth,
  setTimeRange,
  clearDailyError,
  clearWeeklyError,
  clearMonthlyError,
  clearSyncError,
  updateDailyData,
} = healthSlice.actions;

export default healthSlice.reducer; 