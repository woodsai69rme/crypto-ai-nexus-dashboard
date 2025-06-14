
# Database Schema - CryptoMax

## Overview
CryptoMax uses Supabase PostgreSQL as the primary database with Row Level Security (RLS) for user data isolation. The schema is designed for scalability, performance, and security.

## Schema Diagram
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   profiles  │    │ portfolios  │    │   orders    │
│             │────│             │────│             │
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ username    │    │ user_id(FK) │    │ user_id(FK) │
│ display_name│    │ name        │    │ symbol      │
└─────────────┘    │ mode        │    │ side        │
                   │ balance     │    │ quantity    │
                   └─────────────┘    └─────────────┘
```

## Core Tables

### 1. profiles
User profile information and preferences.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. portfolios
User portfolio management and tracking.

```sql
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  mode portfolio_mode NOT NULL DEFAULT 'paper',
  is_default BOOLEAN DEFAULT FALSE,
  initial_balance DECIMAL(20,8) DEFAULT 10000.00,
  current_balance DECIMAL(20,8) DEFAULT 10000.00,
  total_value DECIMAL(20,8) DEFAULT 0.00,
  total_pnl DECIMAL(20,8) DEFAULT 0.00,
  total_pnl_percentage DECIMAL(10,4) DEFAULT 0.00,
  positions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom types
CREATE TYPE portfolio_mode AS ENUM ('paper', 'live');

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own portfolios" ON public.portfolios
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_portfolios_default ON public.portfolios(user_id, is_default);
```

### 3. orders
Trading order management and history.

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  side order_side NOT NULL,
  type order_type NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,8),
  status order_status DEFAULT 'pending',
  filled_quantity DECIMAL(20,8) DEFAULT 0.00,
  average_fill_price DECIMAL(20,8) DEFAULT 0.00,
  fees DECIMAL(20,8) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  filled_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Custom types
CREATE TYPE order_side AS ENUM ('buy', 'sell');
CREATE TYPE order_type AS ENUM ('market', 'limit', 'stop_loss', 'take_profit');
CREATE TYPE order_status AS ENUM ('pending', 'filled', 'cancelled', 'partial', 'rejected');

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own orders" ON public.orders
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_portfolio_id ON public.orders(portfolio_id);
CREATE INDEX idx_orders_symbol ON public.orders(symbol);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
```

### 4. trading_bots
AI trading bot configuration and performance.

```sql
CREATE TABLE public.trading_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  strategy bot_strategy NOT NULL,
  status bot_status DEFAULT 'paused',
  target_symbols TEXT[] NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  risk_level risk_level DEFAULT 'medium',
  max_position_size DECIMAL(20,8),
  stop_loss_percentage DECIMAL(5,2),
  take_profit_percentage DECIMAL(5,2),
  performance JSONB DEFAULT '{"total_return": 0, "win_rate": 0, "total_trades": 0}',
  last_trade_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom types
CREATE TYPE bot_strategy AS ENUM ('dca', 'grid', 'momentum', 'mean_reversion', 'arbitrage');
CREATE TYPE bot_status AS ENUM ('active', 'paused', 'stopped', 'error');
CREATE TYPE risk_level AS ENUM ('conservative', 'medium', 'aggressive');

-- Enable RLS
ALTER TABLE public.trading_bots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own bots" ON public.trading_bots
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_trading_bots_user_id ON public.trading_bots(user_id);
CREATE INDEX idx_trading_bots_portfolio_id ON public.trading_bots(portfolio_id);
CREATE INDEX idx_trading_bots_status ON public.trading_bots(status);
CREATE INDEX idx_trading_bots_strategy ON public.trading_bots(strategy);
```

### 5. alerts
Price and volume alert system.

```sql
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  type alert_type NOT NULL,
  condition alert_condition NOT NULL,
  target_value DECIMAL(20,8) NOT NULL,
  current_value DECIMAL(20,8),
  is_active BOOLEAN DEFAULT TRUE,
  is_triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notification_methods TEXT[] DEFAULT ARRAY['in_app'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom types
CREATE TYPE alert_type AS ENUM ('price', 'volume', 'market_cap', 'change_percentage');
CREATE TYPE alert_condition AS ENUM ('above', 'below', 'crosses_above', 'crosses_below');

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own alerts" ON public.alerts
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_symbol ON public.alerts(symbol);
CREATE INDEX idx_alerts_active ON public.alerts(is_active);
CREATE INDEX idx_alerts_triggered ON public.alerts(is_triggered);
```

### 6. market_data_cache
Cached market data for performance optimization.

```sql
CREATE TABLE public.market_data_cache (
  symbol TEXT PRIMARY KEY,
  name TEXT,
  price_usd DECIMAL(20,8),
  price_aud DECIMAL(20,8),
  change_24h DECIMAL(20,8),
  change_percentage_24h DECIMAL(10,4),
  volume_24h_usd DECIMAL(20,2),
  volume_24h_aud DECIMAL(20,2),
  market_cap_usd DECIMAL(20,2),
  market_cap_aud DECIMAL(20,2),
  high_24h DECIMAL(20,8),
  low_24h DECIMAL(20,8),
  circulating_supply DECIMAL(20,2),
  total_supply DECIMAL(20,2),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access (no RLS)
-- This table is publicly readable for market data

-- Indexes
CREATE INDEX idx_market_data_symbol ON public.market_data_cache(symbol);
CREATE INDEX idx_market_data_updated ON public.market_data_cache(last_updated);
CREATE INDEX idx_market_data_market_cap ON public.market_data_cache(market_cap_aud DESC);
```

### 7. watchlists
User cryptocurrency watchlists.

```sql
CREATE TABLE public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  symbols TEXT[] NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own watchlists" ON public.watchlists
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX idx_watchlists_default ON public.watchlists(user_id, is_default);
```

### 8. crypto_news_feed
Cryptocurrency news aggregation.

```sql
CREATE TABLE public.crypto_news_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source TEXT NOT NULL,
  author TEXT,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  symbols_mentioned TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access (no RLS)
-- This table is publicly readable for news

-- Indexes
CREATE INDEX idx_news_published_at ON public.crypto_news_feed(published_at DESC);
CREATE INDEX idx_news_source ON public.crypto_news_feed(source);
CREATE INDEX idx_news_symbols ON public.crypto_news_feed USING GIN(symbols_mentioned);
CREATE INDEX idx_news_sentiment ON public.crypto_news_feed(sentiment_score);
```

## Database Functions

### 1. Updated At Trigger
Automatically update the `updated_at` column.

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON public.trading_bots
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON public.watchlists
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### 2. New User Handler
Create default portfolio and watchlist for new users.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default profile
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  -- Create default portfolio
  INSERT INTO public.portfolios (user_id, name, mode, is_default)
  VALUES (NEW.id, 'Default Portfolio', 'paper', true);
  
  -- Create default watchlist
  INSERT INTO public.watchlists (user_id, name, symbols, is_default)
  VALUES (NEW.id, 'My Watchlist', ARRAY['BTC', 'ETH', 'SOL'], true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3. Portfolio Value Calculator
Calculate portfolio value based on current positions and market prices.

```sql
CREATE OR REPLACE FUNCTION calculate_portfolio_value(portfolio_uuid UUID)
RETURNS DECIMAL(20,8) AS $$
DECLARE
  total_value DECIMAL(20,8) := 0;
  position RECORD;
  current_price DECIMAL(20,8);
BEGIN
  -- Get portfolio positions
  FOR position IN 
    SELECT jsonb_array_elements(positions) as pos 
    FROM portfolios 
    WHERE id = portfolio_uuid
  LOOP
    -- Get current price for the symbol
    SELECT price_aud INTO current_price
    FROM market_data_cache
    WHERE symbol = (position.pos->>'symbol');
    
    -- Add position value to total
    IF current_price IS NOT NULL THEN
      total_value := total_value + (
        (position.pos->>'quantity')::DECIMAL(20,8) * current_price
      );
    END IF;
  END LOOP;
  
  RETURN total_value;
END;
$$ LANGUAGE plpgsql;
```

## Data Migration Scripts

### Initial Data Population
```sql
-- Insert popular cryptocurrencies
INSERT INTO public.market_data_cache (symbol, name) VALUES
  ('BTC', 'Bitcoin'),
  ('ETH', 'Ethereum'),
  ('SOL', 'Solana'),
  ('ADA', 'Cardano'),
  ('DOT', 'Polkadot'),
  ('LINK', 'Chainlink'),
  ('AVAX', 'Avalanche'),
  ('MATIC', 'Polygon'),
  ('UNI', 'Uniswap'),
  ('ATOM', 'Cosmos');
```

## Performance Optimization

### Indexes
All frequently queried columns have appropriate indexes:
- User ID foreign keys
- Status fields
- Timestamp fields for ordering
- Symbol fields for market data

### Query Optimization
- Use of prepared statements
- Efficient JOIN operations
- Proper use of WHERE clauses
- Limited result sets with pagination

### Connection Management
- Connection pooling via Supabase
- Optimized connection usage
- Proper connection cleanup

## Backup and Recovery

### Automated Backups
- Daily database backups via Supabase
- Point-in-time recovery available
- Cross-region backup replication

### Data Retention
- User data: Indefinite (until account deletion)
- Market data: 1 year rolling window
- Order history: Indefinite for compliance
- News data: 6 months rolling window

## Security Considerations

### Row Level Security
- All user tables have RLS enabled
- Policies enforce user data isolation
- No cross-user data access possible

### Data Encryption
- Encryption at rest (Supabase default)
- Encryption in transit (TLS)
- Sensitive data hashing where appropriate

### Access Control
- Role-based access to functions
- Secure database functions with SECURITY DEFINER
- API access controlled by authentication

---

*This schema documentation serves as the authoritative source for database structure and should be updated when schema changes are made.*
