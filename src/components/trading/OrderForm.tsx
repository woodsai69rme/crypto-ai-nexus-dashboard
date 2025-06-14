
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders } from '@/hooks/useOrders';
import { usePortfolio } from '@/hooks/usePortfolio';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  symbol: string;
  currentPrice: number;
}

export const OrderForm = ({ symbol, currentPrice }: OrderFormProps) => {
  const { createOrder, loading: ordersLoading } = useOrders();
  const { portfolio } = usePortfolio();
  const { toast } = useToast();
  
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop_loss'>('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (side: 'buy' | 'sell') => {
    if (!portfolio) {
      toast({
        title: "Error",
        description: "Portfolio not loaded",
        variant: "destructive"
      });
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrder({
        portfolio_id: portfolio.id,
        symbol,
        side,
        type: orderType,
        quantity: parseFloat(quantity),
        price: orderType === 'market' ? undefined : parseFloat(price),
        status: 'pending'
      });

      // Reset form
      setQuantity('');
      if (orderType === 'market') {
        setPrice(currentPrice.toString());
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const orderPrice = orderType === 'market' ? currentPrice : parseFloat(price) || 0;
    return qty * orderPrice;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Place Order - {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-300">Order Type</Label>
            <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
                <SelectItem value="stop_loss">Stop Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-300">Quantity</Label>
            <Input
              type="number"
              step="0.00001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {orderType !== 'market' && (
            <div>
              <Label className="text-slate-300">Price (AUD)</Label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          )}

          <div className="p-3 bg-slate-700/50 rounded">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Current Price:</span>
              <span className="text-white">${currentPrice.toFixed(2)} AUD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Estimated Total:</span>
              <span className="text-white">${calculateTotal().toFixed(2)} AUD</span>
            </div>
            {portfolio && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Available Balance:</span>
                <span className="text-white">${portfolio.current_balance.toFixed(2)} AUD</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleSubmit('buy')}
              disabled={isSubmitting || ordersLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Buy {symbol.split('-')[0]}
            </Button>
            <Button
              onClick={() => handleSubmit('sell')}
              disabled={isSubmitting || ordersLoading}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/20"
            >
              {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Sell {symbol.split('-')[0]}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
