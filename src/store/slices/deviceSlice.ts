import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Device } from '../../types/device';
import MiBand3Service from '../../services/MiBand3Service';

// Mi Band interface'leri
export interface HeartRateData {
  heartRate: number;
  timestamp: string;
  sensorContact: boolean;
}

export interface MiBandConnectionStatus {
  connected: boolean;
  authenticated: boolean;
}

// Mi Band 3 Async Thunks
export const scanForMiBand3 = createAsyncThunk(
  'device/scanForMiBand3',
  async (timeoutMs: number = 10000, { rejectWithValue }) => {
    try {
      const devices = await MiBand3Service.scanForMiBand3Devices();
      return devices;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Mi Band 3 tarama hatası');
    }
  }
);

export const connectToMiBand3 = createAsyncThunk(
  'device/connectToMiBand3',
  async (device: any, { dispatch, rejectWithValue }) => {
    try {
      const success = await MiBand3Service.connectToDevice(device);
      if (success) {
        const status = MiBand3Service.getConnectionStatus();
        dispatch(setMiBand3Connection({ 
          connected: status.connected, 
          paired: status.paired 
        }));
        
        return { success: true, device };
      } else {
        throw new Error('Bağlantı kurulamadı');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Mi Band 3 bağlantı hatası');
    }
  }
);

export const startMiBand3HeartRate = createAsyncThunk(
  'device/startMiBand3HeartRate',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await MiBand3Service.startHeartRateMonitoring();
      dispatch(setMiBand3Monitoring(true));
      return { success: true, message: 'Heart rate monitoring başlatıldı' };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Heart rate monitoring hatası');
    }
  }
);

export const stopMiBand3HeartRate = createAsyncThunk(
  'device/stopMiBand3HeartRate',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setMiBand3Monitoring(false));
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Heart rate durdurma hatası');
    }
  }
);

export const disconnectMiBand3 = createAsyncThunk(
  'device/disconnectMiBand3',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await MiBand3Service.disconnect();
      dispatch(setMiBand3Connection({ connected: false, paired: false }));
      dispatch(clearMiBand3Data());
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Mi Band 3 bağlantı kesme hatası');
    }
  }
);

export interface DeviceState {
  // Genel cihazlar
  connectedDevices: Device[];
  
  // MiBand 9 spesifik
  miBandStatus: MiBandConnectionStatus;
  heartRateData: HeartRateData[];
  latestHeartRate: HeartRateData | null;
  isMonitoring: boolean;
  
  // MiBand 3 spesifik
  miBand3: {
    connected: boolean;
    paired: boolean;
    deviceInfo: any | null;
    heartRateData: any[];
    latestHeartRate: number | null;
    isMonitoring: boolean;
    batteryLevel: number | null;
  };
  
  // Uyku monitoring
  isRealtimeSleepMonitoring: boolean;
  currentSleepSession: any | null;
  sleepMonitoringDuration: number;
  recentSleepHeartRate: HeartRateData[];
  
  // Bluetooth
  isScanning: boolean;
  availableDevices: any[];
  
  // Loading states
  connecting: boolean;
  error: string | null;
}

const initialState: DeviceState = {
  connectedDevices: [],
  miBandStatus: { connected: false, authenticated: false },
  heartRateData: [],
  latestHeartRate: null,
  isMonitoring: false,
  miBand3: {
    connected: false,
    paired: false,
    deviceInfo: null,
    heartRateData: [],
    latestHeartRate: null,
    isMonitoring: false,
    batteryLevel: null,
  },
  isRealtimeSleepMonitoring: false,
  currentSleepSession: null,
  sleepMonitoringDuration: 0,
  recentSleepHeartRate: [],
  isScanning: false,
  availableDevices: [],
  connecting: false,
  error: null,
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    // Cihaz yönetimi
    addDevice: (state, action: PayloadAction<Device>) => {
      const exists = state.connectedDevices.some(d => d.id === action.payload.id);
      if (!exists) {
        state.connectedDevices.push(action.payload);
      }
    },
    
    removeDevice: (state, action: PayloadAction<string>) => {
      state.connectedDevices = state.connectedDevices.filter(d => d.id !== action.payload);
    },
    
    updateDeviceConnection: (state, action: PayloadAction<{deviceId: string, connected: boolean}>) => {
      const device = state.connectedDevices.find(d => d.id === action.payload.deviceId);
      if (device) {
        device.isConnected = action.payload.connected;
      }
    },
    
    // MiBand bağlantı durumu
    setMiBandStatus: (state, action: PayloadAction<MiBandConnectionStatus>) => {
      state.miBandStatus = action.payload;
    },
    
    // Nabız verisi
    addHeartRateData: (state, action: PayloadAction<HeartRateData>) => {
      state.heartRateData.push(action.payload);
      state.latestHeartRate = action.payload;
      
      // Son 10 ölçümü tut
      if (state.heartRateData.length > 10) {
        state.heartRateData = state.heartRateData.slice(-10);
      }
      
      // Uyku monitoring aktifse recent sleep data'ya da ekle
      if (state.isRealtimeSleepMonitoring) {
        state.recentSleepHeartRate.push(action.payload);
        // Son 20 uyku ölçümü tut
        if (state.recentSleepHeartRate.length > 20) {
          state.recentSleepHeartRate = state.recentSleepHeartRate.slice(-20);
        }
      }
    },
    
    setHeartRateData: (state, action: PayloadAction<HeartRateData[]>) => {
      state.heartRateData = action.payload;
      if (action.payload.length > 0) {
        state.latestHeartRate = action.payload[action.payload.length - 1];
      }
    },
    
    // Monitoring durumları
    setIsMonitoring: (state, action: PayloadAction<boolean>) => {
      state.isMonitoring = action.payload;
    },
    
    setIsRealtimeSleepMonitoring: (state, action: PayloadAction<boolean>) => {
      state.isRealtimeSleepMonitoring = action.payload;
      // Uyku monitoring kapatılırsa recent data'yı temizle
      if (!action.payload) {
        state.recentSleepHeartRate = [];
        state.currentSleepSession = null;
        state.sleepMonitoringDuration = 0;
      }
    },
    
    // Uyku session yönetimi
    setCurrentSleepSession: (state, action: PayloadAction<any>) => {
      state.currentSleepSession = action.payload;
    },
    
    setSleepMonitoringDuration: (state, action: PayloadAction<number>) => {
      state.sleepMonitoringDuration = action.payload;
    },
    
    // Bluetooth tarama
    setIsScanning: (state, action: PayloadAction<boolean>) => {
      state.isScanning = action.payload;
    },
    
    setAvailableDevices: (state, action: PayloadAction<any[]>) => {
      state.availableDevices = action.payload;
    },
    
    addAvailableDevice: (state, action: PayloadAction<any>) => {
      const exists = state.availableDevices.some(d => d.id === action.payload.id);
      if (!exists) {
        state.availableDevices.push(action.payload);
      }
    },
    
    // Loading ve hata yönetimi
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.connecting = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Veri temizleme
    clearHeartRateData: (state) => {
      state.heartRateData = [];
      state.latestHeartRate = null;
    },
    
    clearSleepData: (state) => {
      state.recentSleepHeartRate = [];
      state.currentSleepSession = null;
      state.sleepMonitoringDuration = 0;
    },

    // Mi Band 3 actions
    setMiBand3Connection: (state, action: PayloadAction<{ connected: boolean; paired?: boolean }>) => {
      // miBand3 state'ini güvenli başlat
      if (!state.miBand3) {
        state.miBand3 = {
          connected: false,
          paired: false,
          deviceInfo: null,
          heartRateData: [],
          latestHeartRate: null,
          isMonitoring: false,
          batteryLevel: null,
        };
      }
      
      state.miBand3.connected = action.payload.connected;
      if (action.payload.paired !== undefined) {
        state.miBand3.paired = action.payload.paired;
      }
      if (!action.payload.connected) {
        state.miBand3.paired = false;
        state.miBand3.isMonitoring = false;
        state.miBand3.latestHeartRate = null;
      }
    },

    setMiBand3DeviceInfo: (state, action: PayloadAction<any>) => {
      state.miBand3.deviceInfo = action.payload;
      if (action.payload?.batteryInfo?.level !== undefined) {
        state.miBand3.batteryLevel = action.payload.batteryInfo.level;
      }
    },

    addMiBand3HeartRate: (state, action: PayloadAction<{ heartRate: number; timestamp: string; sensorContact?: boolean }>) => {
      const newData = {
        ...action.payload,
        timestamp: action.payload.timestamp,
      };
      state.miBand3.heartRateData.push(newData);
      state.miBand3.latestHeartRate = action.payload.heartRate;
      
      // Sadece son 100 ölçümü sakla
      if (state.miBand3.heartRateData.length > 100) {
        state.miBand3.heartRateData = state.miBand3.heartRateData.slice(-100);
      }
    },

    setMiBand3Monitoring: (state, action: PayloadAction<boolean>) => {
      state.miBand3.isMonitoring = action.payload;
    },

    clearMiBand3Data: (state) => {
      state.miBand3.heartRateData = [];
      state.miBand3.latestHeartRate = null;
      state.miBand3.isMonitoring = false;
    },
  },
});

export const {
  addDevice,
  removeDevice,
  updateDeviceConnection,
  setMiBandStatus,
  addHeartRateData,
  setHeartRateData,
  setIsMonitoring,
  setIsRealtimeSleepMonitoring,
  setCurrentSleepSession,
  setSleepMonitoringDuration,
  setIsScanning,
  setAvailableDevices,
  addAvailableDevice,
  setConnecting,
  setError,
  clearError,
  clearHeartRateData,
  clearSleepData,
  // Mi Band 3 actions
  setMiBand3Connection,
  setMiBand3DeviceInfo,
  addMiBand3HeartRate,
  setMiBand3Monitoring,
  clearMiBand3Data,
} = deviceSlice.actions;

export default deviceSlice.reducer; 