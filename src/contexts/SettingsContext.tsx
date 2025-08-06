
import { createContext, useContext, useState, ReactNode } from 'react';

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr' | 'de';
  currency: 'AUD' | 'USD' | 'EUR' | 'GBP';
  animations: boolean;
  visualEffects: boolean;
  newsTickerEnabled: boolean;
  newsTickerSpeed: number;
  newsTickerPaused: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  priceAlerts: boolean;
  tradingAlerts: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  showAdvancedCharts: boolean;
  chartType: 'candlestick' | 'line' | 'area' | 'ohlc';
  showGrid: boolean;
  confirmTrades: boolean;
  defaultOrderType: 'market' | 'limit' | 'stop' | 'stop-limit';
  autoRefresh: boolean;
  refreshInterval: number;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  shareAnalytics: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  language: 'en',
  currency: 'AUD',
  animations: true,
  visualEffects: true,
  newsTickerEnabled: true,
  newsTickerSpeed: 5000,
  newsTickerPaused: false,
  notifications: true,
  emailNotifications: true,
  pushNotifications: true,
  priceAlerts: true,
  tradingAlerts: true,
  soundEnabled: true,
  soundVolume: 50,
  showAdvancedCharts: true,
  chartType: 'candlestick',
  showGrid: true,
  confirmTrades: true,
  defaultOrderType: 'market',
  autoRefresh: true,
  refreshInterval: 30,
  twoFactorEnabled: false,
  sessionTimeout: 30,
  shareAnalytics: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
