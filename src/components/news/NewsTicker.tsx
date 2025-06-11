
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Settings, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { FlameIcon } from '@/components/effects/VisualEffects';

interface NewsItem {
  id: string;
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  timestamp: string;
}

interface NewsTickerProps {
  onOpenSettings?: () => void;
}

export const NewsTicker = ({ onOpenSettings }: NewsTickerProps) => {
  const { settings, updateSetting } = useSettings();
  const [news, setNews] = useState<NewsItem[]>([
    {
      id: '1',
      headline: 'Bitcoin reaches new monthly high as institutional adoption increases',
      sentiment: 'positive',
      source: 'CryptoNews',
      timestamp: '2m ago'
    },
    {
      id: '2',
      headline: 'Ethereum 2.0 staking rewards show strong performance metrics',
      sentiment: 'positive',
      source: 'CoinDesk',
      timestamp: '5m ago'
    },
    {
      id: '3',
      headline: 'Market volatility expected due to upcoming Fed announcement',
      sentiment: 'neutral',
      source: 'Bloomberg',
      timestamp: '8m ago'
    },
    {
      id: '4',
      headline: 'DeFi protocol launches new yield farming opportunities',
      sentiment: 'positive',
      source: 'DeFiPulse',
      timestamp: '12m ago'
    },
    {
      id: '5',
      headline: 'Regulatory clarity drives crypto market confidence',
      sentiment: 'positive',
      source: 'Reuters',
      timestamp: '15m ago'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!settings.newsTickerEnabled || settings.newsTickerPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, settings.newsTickerSpeed);

    return () => clearInterval(interval);
  }, [news.length, settings.newsTickerEnabled, settings.newsTickerPaused, settings.newsTickerSpeed]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <FlameIcon className="h-4 w-4" trending={true} />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-emerald-500/30 bg-emerald-500/10';
      case 'negative':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-yellow-500/30 bg-yellow-500/10';
    }
  };

  const togglePlayPause = () => {
    updateSetting('newsTickerPaused', !settings.newsTickerPaused);
  };

  if (!settings.newsTickerEnabled) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700">
      <div className="overflow-hidden">
        <div 
          className={`flex ${settings.animations ? 'transition-transform duration-1000 ease-in-out' : ''}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {news.map((item, index) => (
            <div 
              key={item.id}
              className="min-w-full flex items-center justify-center py-3 px-4"
            >
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${getSentimentColor(item.sentiment)} ${settings.animations ? 'transition-all duration-300' : ''}`}>
                {getSentimentIcon(item.sentiment)}
                <span className="text-sm font-medium text-white">{item.headline}</span>
                <span className="text-xs text-slate-400">• {item.source}</span>
                <span className="text-xs text-slate-500">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between px-4 py-1 bg-slate-900/50 border-t border-slate-700/50">
        <div className="flex justify-center space-x-1 flex-1">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 w-8 rounded-full ${settings.animations ? 'transition-colors duration-300' : ''} ${
                index === currentIndex ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className={`h-6 w-6 p-0 hover:bg-slate-600/50 ${settings.animations ? 'transition-all duration-200' : ''}`}
          >
            {settings.newsTickerPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className={`h-6 w-6 p-0 hover:bg-slate-600/50 ${settings.animations ? 'transition-all duration-200' : ''}`}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
