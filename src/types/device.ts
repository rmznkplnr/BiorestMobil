export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected';
  lastSync?: string;
  batteryLevel?: number;
  manufacturer: string;
  model: string;
  firmwareVersion?: string;
  lastConnected?: string;
  isConnected: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceConnectionStatus {
  isConnected: boolean;
  lastConnected?: string;
  batteryLevel?: number;
  signalStrength?: number;
} 