
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  Settings, 
  Palette, 
  Bell, 
  TrendingUp, 
  Monitor, 
  Shield,
  Volume2,
  Zap,
  Globe,
  Clock,
  Eye
} from 'lucide-react';

interface SettingsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsManager = ({ isOpen, onClose }: SettingsManagerProps) => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('display');

  const handleReset = () => {
    resetSettings();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700 text-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Settings className="h-6 w-6 text-emerald-400" />
            <span>CryptoMax Settings</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50">
            <TabsTrigger value="display" className="flex items-center space-x-1">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center space-x-1">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Effects</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Palette className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold">Display & Theme</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Theme</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value: 'dark' | 'light' | 'auto') => updateSetting('theme', value)}
                    >
                      <SelectTrigger className="bg-slate-600/50 border-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Language</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value: 'en' | 'es' | 'fr' | 'de') => updateSetting('language', value)}
                    >
                      <SelectTrigger className="bg-slate-600/50 border-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Currency</Label>
                    <Select 
                      value={settings.currency} 
                      onValueChange={(value: 'AUD' | 'USD' | 'EUR' | 'GBP') => updateSetting('currency', value)}
                    >
                      <SelectTrigger className="bg-slate-600/50 border-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="AUD">AUD (Australian Dollar)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Show Advanced Charts</Label>
                    <Switch 
                      checked={settings.showAdvancedCharts} 
                      onCheckedChange={(checked) => updateSetting('showAdvancedCharts', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Chart Type</Label>
                    <Select 
                      value={settings.chartType} 
                      onValueChange={(value: 'candlestick' | 'line' | 'area' | 'ohlc') => updateSetting('chartType', value)}
                    >
                      <SelectTrigger className="bg-slate-600/50 border-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="candlestick">Candlestick</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                        <SelectItem value="ohlc">OHLC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Show Grid</Label>
                    <Switch 
                      checked={settings.showGrid} 
                      onCheckedChange={(checked) => updateSetting('showGrid', checked)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold">Notifications & Alerts</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Email Notifications</Label>
                    <Switch 
                      checked={settings.emailNotifications} 
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Push Notifications</Label>
                    <Switch 
                      checked={settings.pushNotifications} 
                      onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Price Alerts</Label>
                    <Switch 
                      checked={settings.priceAlerts} 
                      onCheckedChange={(checked) => updateSetting('priceAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Trading Alerts</Label>
                    <Switch 
                      checked={settings.tradingAlerts} 
                      onCheckedChange={(checked) => updateSetting('tradingAlerts', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Sound Enabled</Label>
                    <Switch 
                      checked={settings.soundEnabled} 
                      onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                    />
                  </div>

                  {settings.soundEnabled && (
                    <div className="space-y-2">
                      <Label className="text-slate-300">Sound Volume: {settings.soundVolume}%</Label>
                      <Slider
                        value={[settings.soundVolume]}
                        onValueChange={(value) => updateSetting('soundVolume', value[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Trading Settings */}
          <TabsContent value="trading" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold">Trading Preferences</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Confirm Trades</Label>
                    <Switch 
                      checked={settings.confirmTrades} 
                      onCheckedChange={(checked) => updateSetting('confirmTrades', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Default Order Type</Label>
                    <Select 
                      value={settings.defaultOrderType} 
                      onValueChange={(value: 'market' | 'limit' | 'stop' | 'stop-limit') => updateSetting('defaultOrderType', value)}
                    >
                      <SelectTrigger className="bg-slate-600/50 border-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                        <SelectItem value="stop">Stop Order</SelectItem>
                        <SelectItem value="stop-limit">Stop-Limit Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Auto Refresh</Label>
                    <Switch 
                      checked={settings.autoRefresh} 
                      onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
                    />
                  </div>

                  {settings.autoRefresh && (
                    <div className="space-y-2">
                      <Label className="text-slate-300">Refresh Interval: {settings.refreshInterval}s</Label>
                      <Slider
                        value={[settings.refreshInterval]}
                        onValueChange={(value) => updateSetting('refreshInterval', value[0])}
                        max={60}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Visual Effects Settings */}
          <TabsContent value="visual" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold">Visual Effects & Animations</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Animations</Label>
                      <p className="text-sm text-slate-400">Enable smooth transitions</p>
                    </div>
                    <Switch 
                      checked={settings.animations} 
                      onCheckedChange={(checked) => updateSetting('animations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Visual Effects</Label>
                      <p className="text-sm text-slate-400">Lightning, flames, particles</p>
                    </div>
                    <Switch 
                      checked={settings.visualEffects} 
                      onCheckedChange={(checked) => updateSetting('visualEffects', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="font-medium text-slate-200 mb-2">Effects Preview</h4>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Eye className="h-4 w-4" />
                      <span>Changes apply immediately</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* News Ticker Settings */}
          <TabsContent value="news" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold">News Ticker</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Enable News Ticker</Label>
                      <p className="text-sm text-slate-400">Show at bottom of screen</p>
                    </div>
                    <Switch 
                      checked={settings.newsTickerEnabled} 
                      onCheckedChange={(checked) => updateSetting('newsTickerEnabled', checked)}
                    />
                  </div>

                  {settings.newsTickerEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300">
                          Speed: {(settings.newsTickerSpeed / 1000).toFixed(1)}s per item
                        </Label>
                        <Slider
                          value={[settings.newsTickerSpeed]}
                          onValueChange={(value) => updateSetting('newsTickerSpeed', value[0])}
                          max={10000}
                          min={2000}
                          step={500}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-slate-300">Paused</Label>
                        <Switch 
                          checked={settings.newsTickerPaused} 
                          onCheckedChange={(checked) => updateSetting('newsTickerPaused', checked)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="font-medium text-slate-200 mb-2">News Ticker Status</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${settings.newsTickerEnabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                      <span className="text-sm text-slate-400">
                        {settings.newsTickerEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold">Security & Privacy</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Two-Factor Authentication</Label>
                    <Switch 
                      checked={settings.twoFactorEnabled} 
                      onCheckedChange={(checked) => updateSetting('twoFactorEnabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Session Timeout: {settings.sessionTimeout} minutes</Label>
                    <Slider
                      value={[settings.sessionTimeout]}
                      onValueChange={(value) => updateSetting('sessionTimeout', value[0])}
                      max={120}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Share Analytics</Label>
                    <Switch 
                      checked={settings.shareAnalytics} 
                      onCheckedChange={(checked) => updateSetting('shareAnalytics', checked)}
                    />
                  </div>

                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <h4 className="font-medium text-slate-200 mb-2">Privacy Notice</h4>
                    <p className="text-sm text-slate-400">
                      Your trading data remains private and secure
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t border-slate-700">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="border-red-600 text-red-400 hover:bg-red-600/20"
          >
            Reset to Defaults
          </Button>
          <Button 
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Save & Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
