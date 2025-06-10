
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ExternalLink, Search, TrendingUp, TrendingDown, Calendar, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  symbols: string[];
  category: string;
}

export const CryptoNews = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock news data
  const mockNews: NewsArticle[] = [
    {
      id: '1',
      title: 'Bitcoin Reaches New All-Time High Above $100,000',
      description: 'Bitcoin continues its bullish momentum as institutional adoption accelerates and ETF inflows surge.',
      url: 'https://example.com/news/1',
      source: 'CoinDesk',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      symbols: ['BTC'],
      category: 'market'
    },
    {
      id: '2',
      title: 'Ethereum 2.0 Staking Rewards Hit Record Levels',
      description: 'Ethereum stakers are enjoying unprecedented rewards as network activity and fees increase significantly.',
      url: 'https://example.com/news/2',
      source: 'The Block',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      symbols: ['ETH'],
      category: 'defi'
    },
    {
      id: '3',
      title: 'Algorand Foundation Announces Major Partnership',
      description: 'New collaboration aims to bring blockchain technology to traditional finance sectors.',
      url: 'https://example.com/news/3',
      source: 'Crypto News',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      symbols: ['ALGO'],
      category: 'partnerships'
    },
    {
      id: '4',
      title: 'NFT Market Shows Signs of Recovery',
      description: 'Trading volumes and floor prices across major NFT collections have increased this week.',
      url: 'https://example.com/news/4',
      source: 'NFT Now',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      symbols: ['ETH'],
      category: 'nft'
    },
    {
      id: '5',
      title: 'Regulatory Clarity Boosts Institutional Interest',
      description: 'Recent regulatory developments provide clearer framework for institutional crypto adoption.',
      url: 'https://example.com/news/5',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      symbols: ['BTC', 'ETH'],
      category: 'regulation'
    },
    {
      id: '6',
      title: 'DeFi Protocol Suffers Security Breach',
      description: 'A major DeFi protocol has temporarily halted operations following a security incident.',
      url: 'https://example.com/news/6',
      source: 'DeFi Pulse',
      publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      sentiment: 'negative',
      symbols: ['ETH'],
      category: 'security'
    }
  ];

  useEffect(() => {
    // Simulate loading news
    const timer = setTimeout(() => {
      setArticles(mockNews);
      setFilteredArticles(mockNews);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filter articles based on search and category
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.symbols.some(symbol => symbol.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  }, [searchTerm, selectedCategory, articles]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInHours > 24) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInMinutes}m ago`;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-emerald-500/30 text-emerald-400';
      case 'negative':
        return 'border-red-500/30 text-red-400';
      default:
        return 'border-slate-500/30 text-slate-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-3 w-3" />;
      case 'negative':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'market', label: 'Market' },
    { value: 'defi', label: 'DeFi' },
    { value: 'nft', label: 'NFT' },
    { value: 'regulation', label: 'Regulation' },
    { value: 'partnerships', label: 'Partnerships' },
    { value: 'security', label: 'Security' }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 bg-slate-800/50 animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-2"></div>
            <div className="h-6 bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-700 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Globe className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Crypto News</h2>
        </div>
        <Badge variant="outline" className="border-blue-500/30 text-blue-400">
          Live Feed
        </Badge>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="border-slate-600"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* News Articles */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <Card className="p-8 bg-slate-800/50 text-center">
            <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No News Found</h3>
            <p className="text-slate-400">Try adjusting your search terms or filters</p>
          </Card>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article.id} className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getSentimentColor(article.sentiment)}>
                    {getSentimentIcon(article.sentiment)}
                    <span className="ml-1 capitalize">{article.sentiment}</span>
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                    {article.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTimeAgo(article.publishedAt)}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                {article.title}
              </h3>

              <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                {article.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400">Source: {article.source}</span>
                  <div className="flex gap-1">
                    {article.symbols.map((symbol) => (
                      <Badge key={symbol} variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Read More
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredArticles.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="border-slate-600">
            Load More Articles
          </Button>
        </div>
      )}
    </div>
  );
};
