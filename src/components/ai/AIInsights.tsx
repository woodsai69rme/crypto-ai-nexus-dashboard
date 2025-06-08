
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

export const AIInsights = () => {
  const insights = [
    {
      type: 'bullish',
      title: 'Strong Buy Signal for BTC',
      description: 'Technical indicators suggest a bullish trend with RSI at 45 and MACD showing positive divergence.',
      confidence: 87,
      timeframe: '4H',
      action: 'Consider increasing BTC allocation'
    },
    {
      type: 'warning',
      title: 'High Volatility Expected',
      description: 'Market volatility is expected to increase due to upcoming Fed announcement. Consider reducing position sizes.',
      confidence: 72,
      timeframe: '1D',
      action: 'Implement stop-loss orders'
    },
    {
      type: 'opportunity',
      title: 'Arbitrage Opportunity',
      description: 'Price difference detected between Binance and KuCoin for ETH-USDT pair.',
      confidence: 94,
      timeframe: '5m',
      action: 'Execute arbitrage strategy'
    },
    {
      type: 'bearish',
      title: 'Resistance Level Reached',
      description: 'SOL has reached a strong resistance level at $240. Potential pullback expected.',
      confidence: 65,
      timeframe: '1H',
      action: 'Consider taking profits'
    }
  ];

  const marketSentiment = {
    overall: 'Bullish',
    score: 68,
    fear_greed: 72,
    social_sentiment: 'Positive',
    news_sentiment: 'Neutral'
  };

  const aiPredictions = [
    { asset: 'BTC', prediction: '+5.2%', timeframe: '24h', confidence: 76 },
    { asset: 'ETH', prediction: '-2.1%', timeframe: '24h', confidence: 68 },
    { asset: 'ADA', prediction: '+8.7%', timeframe: '24h', confidence: 82 },
    { asset: 'SOL', prediction: '+3.4%', timeframe: '24h', confidence: 71 }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case 'bearish':
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-blue-400" />;
      default:
        return <Brain className="h-5 w-5 text-purple-400" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'bullish':
        return 'border-emerald-500/30 bg-emerald-500/10';
      case 'bearish':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'opportunity':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-purple-500/30 bg-purple-500/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Market Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-purple-400" />
            <div>
              <p className="text-sm text-slate-400">Market Sentiment</p>
              <p className="text-lg font-bold text-emerald-400">{marketSentiment.overall}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Sentiment Score</p>
              <p className="text-lg font-bold text-white">{marketSentiment.score}/100</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <div>
              <p className="text-sm text-slate-400">Fear & Greed</p>
              <p className="text-lg font-bold text-yellow-400">{marketSentiment.fear_greed}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="text-sm text-slate-400">AI Confidence</p>
              <p className="text-lg font-bold text-emerald-400">High</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Insights */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AI Market Insights</h3>
            <Badge variant="outline" className="border-purple-500/30 text-purple-400">
              Real-time
            </Badge>
          </div>

          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-medium text-white">{insight.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.timeframe}
                    </Badge>
                    <span className="text-xs text-slate-400">{insight.confidence}%</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{insight.action}</span>
                  <Button size="sm" variant="ghost" className="text-xs">
                    Act Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Predictions */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AI Price Predictions</h3>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              24h Forecast
            </Badge>
          </div>

          <div className="space-y-4">
            {aiPredictions.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{prediction.asset.slice(0, 2)}</span>
                  </div>
                  <span className="font-medium text-white">{prediction.asset}</span>
                </div>

                <div className="text-right">
                  <div className={`font-bold ${prediction.prediction.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {prediction.prediction}
                  </div>
                  <div className="text-xs text-slate-400">
                    {prediction.confidence}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Model Accuracy (7d)</span>
              <span className="text-sm font-medium text-emerald-400">78.3%</span>
            </div>
            <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '78.3%' }}></div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Trading Recommendations */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Trading Recommendations</h3>
          <div className="flex space-x-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              3 Active
            </Badge>
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
              Generate New
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              strategy: 'DCA Bitcoin',
              risk: 'Low',
              expectedReturn: '+12.5%',
              timeframe: '30 days',
              confidence: 85
            },
            {
              strategy: 'Grid Trade ETH',
              risk: 'Medium',
              expectedReturn: '+8.7%',
              timeframe: '14 days',
              confidence: 72
            },
            {
              strategy: 'Momentum SOL',
              risk: 'High',
              expectedReturn: '+24.3%',
              timeframe: '7 days',
              confidence: 63
            }
          ].map((rec, index) => (
            <div key={index} className="bg-slate-700/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{rec.strategy}</h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    rec.risk === 'Low' ? 'border-emerald-500/30 text-emerald-400' :
                    rec.risk === 'Medium' ? 'border-yellow-500/30 text-yellow-400' :
                    'border-red-500/30 text-red-400'
                  }`}
                >
                  {rec.risk} Risk
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Return:</span>
                  <span className="text-emerald-400 font-medium">{rec.expectedReturn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timeframe:</span>
                  <span className="text-white">{rec.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="text-white">{rec.confidence}%</span>
                </div>
              </div>

              <Button size="sm" className="w-full mt-3 bg-slate-600 hover:bg-slate-500">
                Deploy Strategy
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
