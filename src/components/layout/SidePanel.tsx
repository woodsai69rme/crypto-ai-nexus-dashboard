
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Bot, 
  Wallet, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Zap
} from 'lucide-react';

export const SidePanel = () => {
  const quickActions = [
    { label: 'Quick Buy', icon: TrendingUp, color: 'emerald' },
    { label: 'Bot Settings', icon: Bot, color: 'blue' },
    { label: 'Portfolio', icon: Wallet, color: 'purple' },
    { label: 'Analytics', icon: BarChart3, color: 'orange' },
  ];

  const alerts = [
    { type: 'success', message: 'BTC target reached', time: '2m' },
    { type: 'warning', message: 'High volatility detected', time: '5m' },
    { type: 'info', message: 'Bot strategy updated', time: '10m' },
  ];

  return (
    <aside className="w-80 bg-slate-800/30 backdrop-blur-sm border-r border-slate-700 p-4 space-y-4">
      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <h3 className="font-semibold mb-3 text-slate-200">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-3 flex flex-col items-center space-y-1 hover:bg-slate-700/50"
            >
              <action.icon className={`h-5 w-5 text-${action.color}-400`} />
              <span className="text-xs text-slate-300">{action.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Active Bots */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-200">Active Bots</h3>
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
            3 Running
          </Badge>
        </div>
        <div className="space-y-2">
          {['DCA Bot #1', 'Grid Bot #2', 'Momentum Bot #3'].map((bot, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">{bot}</span>
              </div>
              <span className="text-xs text-emerald-400">+2.3%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Alerts */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <h3 className="font-semibold text-slate-200">Recent Alerts</h3>
        </div>
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div key={index} className="p-2 bg-slate-700/30 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{alert.message}</span>
                <span className="text-xs text-slate-400">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Status */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="h-4 w-4 text-blue-400" />
          <h3 className="font-semibold text-slate-200">System Status</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">API Latency</span>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
              12ms
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Data Feed</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-emerald-400">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Trading Engine</span>
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-yellow-400">Active</span>
            </div>
          </div>
        </div>
      </Card>
    </aside>
  );
};
