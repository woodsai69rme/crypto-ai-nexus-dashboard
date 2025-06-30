
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, TrendingDown, ExternalLink, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  author: string;
  url: string;
  image_url: string;
  sentiment_score: number;
  symbols_mentioned: string[];
  published_at: string;
  created_at: string;
}

export const NewsFeed = () => {
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_news_feed')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news feed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-emerald-400';
    if (score < -0.1) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Very Positive';
    if (score > 0.1) return 'Positive';
    if (score < -0.3) return 'Very Negative';
    if (score < -0.1) return 'Negative';
    return 'Neutral';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.1) return <TrendingUp className="h-3 w-3" />;
    if (score < -0.1) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbols_mentioned.some(symbol => 
        symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'positive') return matchesSearch && item.sentiment_score > 0.1;
    if (activeTab === 'negative') return matchesSearch && item.sentiment_score < -0.1;
    if (activeTab === 'neutral') return matchesSearch && Math.abs(item.sentiment_score) <= 0.1;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-white">Loading news feed...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Crypto News</h1>
          <p className="text-slate-400">Latest cryptocurrency news with AI sentiment analysis</p>
        </div>
        <Button onClick={fetchNews} variant="outline">
          Refresh News
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search news or symbols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-600 focus:border-emerald-500"
        />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="all">All News</TabsTrigger>
          <TabsTrigger value="positive">Positive</TabsTrigger>
          <TabsTrigger value="negative">Negative</TabsTrigger>
          <TabsTrigger value="neutral">Neutral</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNews.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">No News Found</h3>
              <p className="text-slate-400">Try adjusting your search or filters</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <Card key={item.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                              {item.title}
                            </h3>
                            <p className="text-slate-300 text-sm line-clamp-3 mb-3">
                              {item.summary || item.content}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge className={`${getSentimentColor(item.sentiment_score)} bg-opacity-20`}>
                              <div className="flex items-center space-x-1">
                                {getSentimentIcon(item.sentiment_score)}
                                <span>{getSentimentLabel(item.sentiment_score)}</span>
                              </div>
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                              </span>
                            </div>
                            <span>by {item.author || item.source}</span>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(item.url, '_blank')}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Read More
                          </Button>
                        </div>

                        {item.symbols_mentioned && item.symbols_mentioned.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 text-sm">Mentions:</span>
                            <div className="flex flex-wrap gap-1">
                              {item.symbols_mentioned.slice(0, 5).map((symbol) => (
                                <Badge key={symbol} variant="outline" className="text-xs">
                                  {symbol}
                                </Badge>
                              ))}
                              {item.symbols_mentioned.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.symbols_mentioned.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
