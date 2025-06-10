
import { EnhancedTradingChart } from './EnhancedTradingChart';

interface TradingChartProps {
  selectedSymbol: string;
  onSymbolChange?: (symbol: string) => void;
}

export const TradingChart = ({ selectedSymbol, onSymbolChange }: TradingChartProps) => {
  return (
    <EnhancedTradingChart 
      selectedSymbol={selectedSymbol} 
      onSymbolChange={onSymbolChange}
    />
  );
};
