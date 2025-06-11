
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSettings {
  // Theme & Display
  theme: 'dark' | 'light' | 'auto';
  language: 'en' | 'es' | 'fr' | 'de';
  currency: 'AUD' | 'USD' | 'EUR' | 'GBP';
  timezone: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  priceAlerts: boolean;
  tradingAlerts: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  
  // Trading
  confirmTrades: boolean;
  defaultOrderType: 'market' | 'limit' | 'stop' | 'stop-limit';
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Display
  showAdvancedCharts: boolean;
  chartType: 'candlestick' | 'line' | 'area' | 'ohlc';
  showGrid: boolean;
  animations: boolean;
  visualEffects: boolean;
  
  // News Ticker
  newsTickerEnabled: boolean;
  newsTickerSpeed: number;
  newsTickerPaused: boolean;
  
  // Security
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  shareAnalytics: boolean;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'en',
  currency: 'AUD',
  timezone: 'Australia/Sydney',
  emailNotifications: true,
  pushNotifications: true,
  priceAlerts: true,
  tradingAlerts: true,
  soundEnabled: true,
  soundVolume: 70,
  confirmTrades: true,
  defaultOrderType: 'market',
  autoRefresh: true,
  refreshInterval: 5,
  showAdvancedCharts: true,
  chartType: 'candlestick',
  showGrid: true,
  animations: true,
  visualEffects: true,
  newsTickerEnabled: true,
  newsTickerSpeed: 4000,
  newsTickerPaused: false,
  twoFactorEnabled: false,
  sessionTimeout: 30,
  shareAnalytics: false,
};

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem('cryptomax-settings');
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('cryptomax-settings', JSON.stringify(settings));
    
    // Apply theme changes
    document.documentElement.className = settings.theme === 'dark' ? 'dark' : '';
    
    // Apply visual effects
    document.body.style.setProperty('--animations-enabled', settings.animations ? '1' : '0');
    document.body.style.setProperty('--visual-effects-enabled', settings.visualEffects ? '1' : '0');
  }, [settings]);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
