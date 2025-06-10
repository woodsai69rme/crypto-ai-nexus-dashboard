
export const TRADING_SYMBOLS = [
  'BTC-AUD', 'ETH-AUD', 'SOL-AUD', 'ADA-AUD', 'DOT-AUD',
  'MATIC-AUD', 'AVAX-AUD', 'LINK-AUD', 'UNI-AUD', 'AAVE-AUD'
] as const;

export const CURRENCY_SYMBOLS = {
  AUD: '$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥'
} as const;

export const APP_CONFIG = {
  name: 'CryptoMax',
  version: '1.0.0',
  description: 'Advanced Cryptocurrency Trading Platform',
  defaultCurrency: 'AUD',
  apiEndpoints: {
    coinGecko: 'https://api.coingecko.com/api/v3',
    news: 'https://newsapi.org/v2'
  },
  features: {
    paperTrading: true,
    realTrading: false, // Enable when ready for production
    notifications: true,
    darkMode: true
  }
} as const;

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['Basic charts', 'Paper trading', '3 AI bots'],
    limits: { bots: 3, alerts: 10 }
  },
  pro: {
    name: 'Pro',
    price: 29,
    features: ['Advanced charts', 'Real trading', 'Unlimited bots', 'Premium support'],
    limits: { bots: -1, alerts: 100 }
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    features: ['All features', 'API access', 'Custom integrations', 'Dedicated support'],
    limits: { bots: -1, alerts: -1 }
  }
} as const;
