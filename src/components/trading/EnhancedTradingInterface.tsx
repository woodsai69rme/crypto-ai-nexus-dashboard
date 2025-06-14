
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TradingChart } from '@/components/trading/TradingChart';
import { OrderForm } from '@/components/trading/OrderForm';
import { OrderHistory } from '@/components/trading/OrderHistory';
import { useMarketData } from '@/hooks/useMarketData';

interface EnhancedTradingInterfaceProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

export const EnhancedTradingInterface = ({ selectedSymbol, onSymbolChange }: EnhancedTradingInterfaceProps) => {
  const { marketData } = useMarketData([selectedSymbol]);
  
  const currentPrice = marketData.find(data => data.symbol === selectedSymbol)?.price || 0;

  return (
    <div className="space-y-4">
      <TradingChart selectedSymbol={selectedSymbol} onSymbolChange={onSymbolChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <OrderForm symbol={selectedSymbol} currentPrice={currentPrice} />
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">Order History</TabsTrigger>
              <TabsTrigger value="positions">Open Positions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              <OrderHistory />
            </TabsContent>
            
            <TabsContent value="positions">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="text-center text-slate-400">
                  <p>Open positions will be displayed here</p>
                  <p className="text-sm mt-2">This feature will show your active trading positions</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
