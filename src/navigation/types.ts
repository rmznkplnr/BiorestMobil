import { SleepNotification } from '../types/sleep';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: { screen: keyof TabParamList };
  NightMode: undefined;
  Settings: undefined;
  SleepDetails: {
    sleepData: SleepNotification;
  };
};

export type TabParamList = {
  HomeTab: undefined;
  DevicesTab: undefined;
  StatisticsTab: undefined;
  ProfileTab: undefined;
}; 