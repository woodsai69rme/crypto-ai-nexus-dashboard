
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSettings } from '@/contexts/SettingsContext';

interface PortfolioChartProps {
  className?: string;
}

export const PortfolioChart = ({ className }: PortfolioChartProps) => {
  const { settings } = useSettings();
  const [chartType, setChartType] = useState<'performance' | 'allocation'>('performance');

  const performanceData = [
    { date: '1/1', value: 10000 },
    { date: '1/7', value: 10240 },
    { date: '1/14', value: 9890 },
    { date: '1/21', value: 10580 },
    { date: '1/28', value: 11200 },
    { date: '2/4', value: 10950 },
    { date: '2/11', value: 11680 },
    { date: '2/18', value: 12100 },
    { date: '2/25', value: 11890 },
    { date: '3/4', value: 12450 }
  ];

  const allocationData = [
    { name: 'BTC', value: 65.3, amount: 83234 },
    { name: 'ETH', value: 22.3, amount: 28456 },
    { name: 'ADA', value: 9.4, amount: 12000 },
    { name: 'SOL', value: 2.8, amount: 3619 }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <Card className={`bg-slate-800/50 backdrop-blur-sm border-slate-700 ${className}`}>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Portfolio Overview</h3>
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            <Button
              size="sm"
              variant={chartType === 'performance' ? "default" : "ghost"}
              className={`h-7 px-3 text-xs ${
                chartType === 'performance' 
                  ? 'bg-emerald-500 text-white' 
                  : 'hover:bg-slate-600/50'
              } ${settings.animations ? 'transition-all duration-200' : ''}`}
              onClick={() => setChartType('performance')}
            >
              Performance
            </Button>
            <Button
              size="sm"
              variant={chartType === 'allocation' ? "default" : "ghost"}
              className={`h-7 px-3 text-xs ${
                chartType === 'allocation' 
                  ? 'bg-emerald-500 text-white' 
                  : 'hover:bg-slate-600/50'
              } ${settings.animations ? 'transition-all duration-200' : ''}`}
              onClick={() => setChartType('allocation')}
            >
              Allocation
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {chartType === 'performance' ? (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 3 }}
                  activeDot={{ r: 5, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="w-full lg:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value.toFixed(1)}% (${formatCurrency(props.payload.amount)})`, 
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-3">
              {allocationData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{item.value.toFixed(1)}%</div>
                    <div className="text-sm text-slate-400">{formatCurrency(item.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
