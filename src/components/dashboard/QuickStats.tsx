
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Users } from 'lucide-react';

export const QuickStats = () => {
  const stats = [
    {
      title: 'Portfolio Value',
      value: 'AUD $127,432.50',
      change: '+5.24%',
      changeType: 'positive',
      icon: DollarSign,
      description: '24h change'
    },
    {
      title: 'Active Bots',
      value: '3',
      change: '100% uptime',
      changeType: 'positive',
      icon: Zap,
      description: 'All systems operational'
    },
    {
      title: 'Total Trades',
      value: '1,247',
      change: '+23 today',
      changeType: 'positive',
      icon: Activity,
      description: 'Successful executions'
    },
    {
      title: 'Market Index',
      value: '2.47M',
      change: '-1.2%',
      changeType: 'negative',
      icon: Users,
      description: 'Global market cap'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4 hover:bg-slate-800/70 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <stat.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{stat.title}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {stat.changeType === 'positive' ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <Badge 
                variant="outline" 
                className={`${
                  stat.changeType === 'positive' 
                    ? 'border-emerald-500/30 text-emerald-400' 
                    : 'border-red-500/30 text-red-400'
                }`}
              >
                {stat.change}
              </Badge>
            </div>
            <span className="text-xs text-slate-500">{stat.description}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};
