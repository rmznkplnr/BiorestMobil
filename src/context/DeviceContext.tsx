import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Device {
  id: string;
  name: string;
  type: 'faunus' | 'watch';
  connected: boolean;
  deviceId: string;
}

interface DeviceContextType {
  devices: Device[];
  addDevice: (device: Device) => void;
  removeDevice: (deviceId: string) => void;
  updateDeviceConnection: (deviceId: string, connected: boolean) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDevices = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);

  const addDevice = (device: Device) => {
    setDevices(prevDevices => {
      // Aynı cihaz zaten varsa ekleme
      if (prevDevices.some(d => d.deviceId === device.deviceId)) {
        return prevDevices;
      }
      return [...prevDevices, device];
    });
  };

  const removeDevice = (deviceId: string) => {
    setDevices(prevDevices => prevDevices.filter(d => d.deviceId !== deviceId));
  };

  const updateDeviceConnection = (deviceId: string, connected: boolean) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.deviceId === deviceId ? { ...device, connected } : device
      )
    );
  };

  return (
    <DeviceContext.Provider value={{ devices, addDevice, removeDevice, updateDeviceConnection }}>
      {children}
    </DeviceContext.Provider>
  );
}; 