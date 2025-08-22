import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  // Genel UI durumları
  isLoading: boolean;
  activeTab: string;
  
  // Detaylı Loading States
  loadingStates: {
    // Auth operations
    authLoading: boolean;
    loginLoading: boolean;
    registerLoading: boolean;
    
    // Health data operations
    healthDataLoading: boolean;
    healthSyncLoading: boolean;
    sleepDataLoading: boolean;
    
    // Device operations
    deviceScanLoading: boolean;
    deviceConnectLoading: boolean;
    heartRateLoading: boolean;
    sleepMonitoringLoading: boolean;
    
    // Data operations
    dataFetchLoading: boolean;
    dataSaveLoading: boolean;
    awsSyncLoading: boolean;
  };
  
  // Modal durumları
  isPermissionModalVisible: boolean;
  showZzzInfoModal: boolean;
  cartVisible: boolean;
  checkoutVisible: boolean;
  
  // Animasyon durumları
  calculatingScore: boolean;
  
  // Tema ve görünüm
  darkMode: boolean;
  notifications: boolean;
  
  // Ayarlar
  sleepReminders: boolean;
  dataSync: boolean;
  healthSyncEnabled: boolean;
  autoBackupEnabled: boolean;
}

const initialState: UIState = {
  isLoading: false,
  activeTab: 'Home',
  
  // Detaylı Loading States
  loadingStates: {
    // Auth operations
    authLoading: false,
    loginLoading: false,
    registerLoading: false,
    
    // Health data operations
    healthDataLoading: false,
    healthSyncLoading: false,
    sleepDataLoading: false,
    
    // Device operations
    deviceScanLoading: false,
    deviceConnectLoading: false,
    heartRateLoading: false,
    sleepMonitoringLoading: false,
    
    // Data operations
    dataFetchLoading: false,
    dataSaveLoading: false,
    awsSyncLoading: false,
  },
  
  isPermissionModalVisible: false,
  showZzzInfoModal: false,
  cartVisible: false,
  checkoutVisible: false,
  calculatingScore: false,
  darkMode: true,
  notifications: true,
  sleepReminders: true,
  dataSync: true,
  healthSyncEnabled: true,
  autoBackupEnabled: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Genel UI
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Detaylı Loading State Actions
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.authLoading = action.payload;
    },
    
    setLoginLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.loginLoading = action.payload;
    },
    
    setRegisterLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.registerLoading = action.payload;
    },
    
    setHealthDataLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.healthDataLoading = action.payload;
    },
    
    setHealthSyncLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.healthSyncLoading = action.payload;
    },
    
    setSleepDataLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.sleepDataLoading = action.payload;
    },
    
    setDeviceScanLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.deviceScanLoading = action.payload;
    },
    
    setDeviceConnectLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.deviceConnectLoading = action.payload;
    },
    
    setHeartRateLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.heartRateLoading = action.payload;
    },
    
    setSleepMonitoringLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.sleepMonitoringLoading = action.payload;
    },
    
    setDataFetchLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.dataFetchLoading = action.payload;
    },
    
    setDataSaveLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.dataSaveLoading = action.payload;
    },
    
    setAwsSyncLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingStates.awsSyncLoading = action.payload;
    },
    
    // Batch loading state setter
    setMultipleLoadingStates: (state, action: PayloadAction<Partial<UIState['loadingStates']>>) => {
      state.loadingStates = { ...state.loadingStates, ...action.payload };
    },
    
    // Tüm loading state'leri sıfırla
    clearAllLoadingStates: (state) => {
      Object.keys(state.loadingStates).forEach(key => {
        (state.loadingStates as any)[key] = false;
      });
    },
    
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    
    // Modal yönetimi
    setPermissionModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isPermissionModalVisible = action.payload;
    },
    
    setShowZzzInfoModal: (state, action: PayloadAction<boolean>) => {
      state.showZzzInfoModal = action.payload;
    },
    
    setCartVisible: (state, action: PayloadAction<boolean>) => {
      state.cartVisible = action.payload;
    },
    
    setCheckoutVisible: (state, action: PayloadAction<boolean>) => {
      state.checkoutVisible = action.payload;
    },
    
    // Animasyonlar
    setCalculatingScore: (state, action: PayloadAction<boolean>) => {
      state.calculatingScore = action.payload;
    },
    
    // Tema ve ayarlar
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
    
    setSleepReminders: (state, action: PayloadAction<boolean>) => {
      state.sleepReminders = action.payload;
    },
    
    setDataSync: (state, action: PayloadAction<boolean>) => {
      state.dataSync = action.payload;
    },
    
    setHealthSyncEnabled: (state, action: PayloadAction<boolean>) => {
      state.healthSyncEnabled = action.payload;
    },
    
    setAutoBackupEnabled: (state, action: PayloadAction<boolean>) => {
      state.autoBackupEnabled = action.payload;
    },
    
    // Reset functions
    resetUI: (state) => {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setActiveTab,
  setPermissionModalVisible,
  setShowZzzInfoModal,
  setCartVisible,
  setCheckoutVisible,
  setCalculatingScore,
  setDarkMode,
  setNotifications,
  setSleepReminders,
  setDataSync,
  setHealthSyncEnabled,
  setAutoBackupEnabled,
  resetUI,
  setAuthLoading,
  setLoginLoading,
  setRegisterLoading,
  setHealthDataLoading,
  setHealthSyncLoading,
  setSleepDataLoading,
  setDeviceScanLoading,
  setDeviceConnectLoading,
  setHeartRateLoading,
  setSleepMonitoringLoading,
  setDataFetchLoading,
  setDataSaveLoading,
  setAwsSyncLoading,
  setMultipleLoadingStates,
  clearAllLoadingStates,
} = uiSlice.actions;

export default uiSlice.reducer; 