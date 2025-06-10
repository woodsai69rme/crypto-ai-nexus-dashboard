import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, TrendingUp, TrendingDown, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'percent_change';
  target_value: number;
  current_value: number;
  condition_met: boolean;
  is_active: boolean;
  created_at: string;
}

export const PriceAlertSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'price_above' as const,
    target_value: ''
  });

  const cryptoSymbols = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'LINK', 'UNI', 'MATIC', 'ALGO'];

  useEffect(() => {
    if (!user) return;

    fetchAlerts();

    // Subscribe to alert updates
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Alert updated:', payload);
          fetchAlerts();
          
          if (payload.eventType === 'UPDATE' && payload.new.condition_met) {
            toast({
              title: "🔔 Price Alert Triggered!",
              description: `${payload.new.symbol} has reached your target price of $${payload.new.target_value}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedAlerts = data?.map(alert => ({
        id: alert.id,
        symbol: alert.symbol,
        type: alert.type as 'price_above' | 'price_below' | 'percent_change',
        target_value: alert.target_value,
        current_value: alert.current_value,
        condition_met: alert.condition_met,
        is_active: alert.is_active,
        created_at: alert.created_at
      })) || [];
      
      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!newAlert.symbol || !newAlert.target_value) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('alerts')
        .insert({
          user_id: user?.id,
          symbol: newAlert.symbol,
          type: newAlert.type,
          target_value: parseFloat(newAlert.target_value),
          current_value: 0,
          condition_met: false,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Alert Created",
        description: `Price alert set for ${newAlert.symbol}`,
      });

      setNewAlert({ symbol: '', type: 'price_above', target_value: '' });
      setShowCreateForm(false);
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive"
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Deleted",
        description: "Price alert has been removed",
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive"
      });
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_active: !isActive })
        .eq('id', alertId);

      if (error) throw error;

      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_above':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'price_below':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Bell className="h-4 w-4 text-blue-400" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_above':
        return 'Above';
      case 'price_below':
        return 'Below';
      case 'percent_change':
        return '% Change';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 bg-slate-800/50 animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-2"></div>
            <div className="h-6 bg-slate-700 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Price Alerts</h2>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Alert
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Create Price Alert</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cryptocurrency
              </label>
              <Select value={newAlert.symbol} onValueChange={(value) => setNewAlert({...newAlert, symbol: value})}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Select crypto" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoSymbols.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alert Type
              </label>
              <Select value={newAlert.type} onValueChange={(value: any) => setNewAlert({...newAlert, type: value})}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_above">Price Above</SelectItem>
                  <SelectItem value="price_below">Price Below</SelectItem>
                  <SelectItem value="percent_change">% Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Value (AUD)
              </label>
              <Input
                type="number"
                value={newAlert.target_value}
                onChange={(e) => setNewAlert({...newAlert, target_value: e.target.value})}
                placeholder="0.00"
                className="bg-slate-700/50 border-slate-600"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={createAlert}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Create Alert
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card className="p-8 bg-slate-800/50 text-center">
            <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Price Alerts</h3>
            <p className="text-slate-400">Create your first alert to get notified when prices hit your targets</p>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getAlertTypeIcon(alert.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">{alert.symbol}</span>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                      {alert.condition_met && (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                          Triggered
                        </Badge>
                      )}
                      {!alert.is_active && (
                        <Badge variant="outline" className="border-slate-500/30 text-slate-400">
                          Paused
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Target: {formatCurrency(alert.target_value)} | 
                      Current: {formatCurrency(alert.current_value || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAlert(alert.id, alert.is_active)}
                    className="border-slate-600"
                  >
                    {alert.is_active ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
