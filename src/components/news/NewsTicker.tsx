
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface NewsItem {
  id: string;
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  timestamp: string;
}

export const NewsTicker = () => {
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
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [news.length]);

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

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {news.map((item, index) => (
            <div 
              key={item.id}
              className="min-w-full flex items-center justify-center py-2 px-4"
            >
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${getSentimentColor(item.sentiment)}`}>
                {getSentimentIcon(item.sentiment)}
                <span className="text-sm font-medium text-white">{item.headline}</span>
                <span className="text-xs text-slate-400">• {item.source}</span>
                <span className="text-xs text-slate-500">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Ticker indicators */}
      <div className="flex justify-center space-x-1 pb-1">
        {news.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-8 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
