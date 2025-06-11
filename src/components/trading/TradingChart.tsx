
import { TradingChart as NewTradingChart } from '@/components/charts/TradingChart';

interface TradingChartProps {
  selectedSymbol: string;
  onSymbolChange?: (symbol: string) => void;
}

export const TradingChart = ({ selectedSymbol, onSymbolChange }: TradingChartProps) => {
  return (
    <NewTradingChart 
      selectedSymbol={selectedSymbol} 
      onSymbolChange={onSymbolChange}
    />
  );
};
