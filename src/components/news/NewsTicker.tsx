
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Settings, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsItem {
  id: string;
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
}

interface NewsTickerProps {
  onOpenSettings?: () => void;
}

export const NewsTicker = ({ onOpenSettings }: NewsTickerProps) => {
  const [news, setNews] = useState<NewsItem[]>([
    {
      id: '1',
      headline: 'Bitcoin reaches new monthly high as institutional adoption increases',
      sentiment: 'positive',
      source: 'CryptoNews',
      timestamp: '2m ago',
      impact: 'high'
    },
    {
      id: '2',
      headline: 'Ethereum 2.0 staking rewards show strong performance metrics',
      sentiment: 'positive',
      source: 'CoinDesk',
      timestamp: '5m ago',
      impact: 'medium'
    },
    {
      id: '3',
      headline: 'Market volatility expected due to upcoming Fed announcement',
      sentiment: 'neutral',
      source: 'Bloomberg',
      timestamp: '8m ago',
      impact: 'high'
    },
    {
      id: '4',
      headline: 'DeFi protocol launches new yield farming opportunities',
      sentiment: 'positive',
      source: 'DeFiPulse',
      timestamp: '12m ago',
      impact: 'medium'
    },
    {
      id: '5',
      headline: 'Regulatory clarity drives crypto market confidence',
      sentiment: 'positive',
      source: 'Reuters',
      timestamp: '15m ago',
      impact: 'high'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(4000);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, speed);

    return () => clearInterval(interval);
  }, [news.length, isPlaying, speed]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
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

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return (
      <div className={`h-2 w-2 rounded-full ${colors[impact as keyof typeof colors]}`} />
    );
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-[40] bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 shadow-lg">
      {/* Main ticker content */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {news.map((item, index) => (
            <div 
              key={item.id}
              className="min-w-full flex items-center justify-center py-3 px-4"
            >
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${getSentimentColor(item.sentiment)}`}>
                {getSentimentIcon(item.sentiment)}
                {getImpactBadge(item.impact)}
                <span className="text-sm font-medium text-white line-clamp-1">{item.headline}</span>
                <span className="text-xs text-slate-400">• {item.source}</span>
                <span className="text-xs text-slate-500">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Controls bar - separated and smaller */}
      <div className="flex items-center justify-between px-4 py-1 bg-slate-900/50 border-t border-slate-700/50">
        {/* Ticker indicators */}
        <div className="flex justify-center space-x-1 flex-1">
          {news.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 w-6 rounded-full transition-colors duration-300 ${
                index === currentIndex ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="h-6 w-6 p-0 hover:bg-slate-600/50"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-6 w-6 p-0 hover:bg-slate-600/50"
          >
            {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-6 w-6 p-0 hover:bg-slate-600/50"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
