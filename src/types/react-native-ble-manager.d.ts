declare module 'react-native-ble-manager' {
  export interface Peripheral {
    id: string;
    name?: string;
    rssi?: number;
    advertising?: {
      isConnectable?: boolean;
      serviceUUIDs?: string[];
      manufacturerData?: any;
      serviceData?: any;
      txPowerLevel?: number;
    };
  }

  export interface StartOptions {
    showAlert?: boolean;
    restoreIdentifierKey?: string;
    queueIdentifierKey?: string;
  }

  export default class BleManager {
    static start(options?: StartOptions): Promise<void>;
    static scan(serviceUUIDs: string[], seconds: number, allowDuplicates?: boolean): Promise<void>;
    static stopScan(): Promise<void>;
    static connect(peripheralId: string): Promise<void>;
    static disconnect(peripheralId: string): Promise<void>;
    static retrieveServices(peripheralId: string): Promise<Peripheral>;
    static write(
      peripheralId: string,
      serviceUUID: string,
      characteristicUUID: string,
      data: number[],
      maxByteSize: number
    ): Promise<void>;
    static read(
      peripheralId: string,
      serviceUUID: string,
      characteristicUUID: string
    ): Promise<any>;
    static getDiscoveredPeripherals(): Promise<Peripheral[]>;
  }
} 