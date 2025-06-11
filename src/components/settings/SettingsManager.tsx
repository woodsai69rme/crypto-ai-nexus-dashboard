
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  DollarSign,
  X,
  Volume2,
  Eye,
  Zap
} from 'lucide-react';

interface SettingsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsManager = ({ isOpen, onClose }: SettingsManagerProps) => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-800/95 backdrop-blur-sm border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-auto max-h-[calc(90vh-140px)]">
          <Tabs defaultValue="general" className="p-6">
            <TabsList className="grid w-full grid-cols-6 bg-slate-700/50 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Alerts</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="p-6 bg-slate-700/30 border-slate-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-emerald-400" />
                  General Preferences
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Theme</Label>
                    <Select value={settings.theme} onValueChange={(value: 'dark' | 'light' | 'auto') => updateSetting('theme', value)}>
                      <SelectTrigger className="bg-slate-600/50 border-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Language</Label>
                    <Select value={settings.language} onValueChange={(value: 'en' | 'es' | 'fr' | 'de') => updateSetting('language', value)}>
                      <SelectTrigger className="bg-slate-600/50 border-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Default Currency</Label>
                    <Select value={settings.currency} onValueChange={(value: 'AUD' | 'USD' | 'EUR' | 'GBP') => updateSetting('currency', value)}>
                      <SelectTrigger className="bg-slate-600/50 border-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUD">🇦🇺 Australian Dollar (AUD)</SelectItem>
                        <SelectItem value="USD">🇺🇸 US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">🇬🇧 British Pound (GBP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                      <SelectTrigger className="bg-slate-600/50 border-slate-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Australia/Sydney">Sydney (UTC+11)</SelectItem>
                        <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="p-6 bg-slate-700/30 border-slate-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-emerald-400" />
                  Notification Settings
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Email Notifications</Label>
                      <p className="text-sm text-slate-400">Receive important updates via email</p>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Push Notifications</Label>
                      <p className="text-sm text-slate-400">Browser notifications for real-time alerts</p>
                    </div>
                    <Switch 
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Sound Notifications</Label>
                      <p className="text-sm text-slate-400">Play sounds for important alerts</p>
                    </div>
                    <Switch 
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                    />
                  </div>

                  {settings.soundEnabled && (
                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Sound Volume: {settings.soundVolume}%
                      </Label>
                      <Slider
                        value={[settings.soundVolume]}
                        onValueChange={(value) => updateSetting('soundVolume', value[0])}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="effects" className="space-y-6">
              <Card className="p-6 bg-slate-700/30 border-slate-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-emerald-400" />
                  Visual Effects & News
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Visual Effects</Label>
                      <p className="text-sm text-slate-400">Enable flames, lightning, and particle effects</p>
                    </div>
                    <Switch 
                      checked={settings.visualEffects}
                      onCheckedChange={(checked) => updateSetting('visualEffects', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Animations</Label>
                      <p className="text-sm text-slate-400">Enable smooth transitions and animations</p>
                    </div>
                    <Switch 
                      checked={settings.animations}
                      onCheckedChange={(checked) => updateSetting('animations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">News Ticker</Label>
                      <p className="text-sm text-slate-400">Show scrolling news ticker</p>
                    </div>
                    <Switch 
                      checked={settings.newsTickerEnabled}
                      onCheckedChange={(checked) => updateSetting('newsTickerEnabled', checked)}
                    />
                  </div>

                  {settings.newsTickerEnabled && (
                    <div className="space-y-2">
                      <Label className="text-slate-300">News Ticker Speed: {settings.newsTickerSpeed}ms</Label>
                      <Slider
                        value={[settings.newsTickerSpeed]}
                        onValueChange={(value) => updateSetting('newsTickerSpeed', value[0])}
                        max={10000}
                        min={1000}
                        step={500}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="trading" className="space-y-6">
              <Card className="p-6 bg-slate-700/30 border-slate-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-emerald-400" />
                  Trading Preferences
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Confirm Trades</Label>
                      <p className="text-sm text-slate-400">Require confirmation before executing trades</p>
                    </div>
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
                      <SelectContent>
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                        <SelectItem value="stop">Stop Order</SelectItem>
                        <SelectItem value="stop-limit">Stop-Limit Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Auto Refresh Data</Label>
                      <p className="text-sm text-slate-400">Automatically update market data</p>
                    </div>
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
              </Card>
            </TabsContent>

            <TabsContent value="display" className="space-y-6">
              <Card className="p-6 bg-slate-700/30 border-slate-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-emerald-400" />
                  Display Options
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Advanced Charts</Label>
                      <p className="text-sm text-slate-400">Show technical indicators and advanced tools</p>
                    </div>
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
                      <SelectContent>
                        <SelectItem value="candlestick">Candlestick</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="ohlc">OHLC Bars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Show Grid Lines</Label>
                      <p className="text-sm text-slate-400">Display grid lines on charts</p>
                    </div>
                    <Switch 
                      checked={settings.showGrid}
                      onCheckedChange={(checked) => updateSetting('showGrid', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Animations</Label>
                      <p className="text-sm text-slate-400">Enable smooth animations</p>
                    </div>
                    <Switch 
                      checked={settings.animations}
                      onCheckedChange={(checked) => updateSetting('animations', checked)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="p-6 bg-slate-700/30 border-slate-600">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-emerald-400" />
                  Security Settings
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Two-Factor Authentication</Label>
                      <p className="text-sm text-slate-400">Add an extra layer of security</p>
                    </div>
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

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Share Analytics</Label>
                      <p className="text-sm text-slate-400">Help improve the platform with anonymous usage data</p>
                    </div>
                    <Switch 
                      checked={settings.shareAnalytics}
                      onCheckedChange={(checked) => updateSetting('shareAnalytics', checked)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between p-6 border-t border-slate-700">
          <Button variant="outline" onClick={handleReset} className="border-red-600 text-red-400 hover:bg-red-600/20">
            Reset to Defaults
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600">
              Save Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
