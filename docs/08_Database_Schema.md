
# Database Schema - CryptoMax

## Overview
This document provides comprehensive documentation of the CryptoMax database schema, including table structures, relationships, indexes, and data management strategies.

## Database Technology
- **Primary Database**: PostgreSQL 15
- **Extensions**: uuid-ossp, pg_crypto, timescaledb
- **Connection Pooling**: PgBouncer
- **Replication**: Streaming replication with read replicas

## Schema Organization

### Schema Structure
```sql
-- Core application schemas
public          -- Main application tables
auth            -- Supabase authentication (managed)
storage         -- File storage (managed)
realtime        -- Real-time subscriptions (managed)

-- Custom schemas
trading         -- Trading-specific tables
analytics       -- Analytics and reporting
audit           -- Audit logging and compliance
```

## Core Tables

### Authentication & User Management

#### profiles
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  trading_mode trading_mode DEFAULT 'paper',
  paper_balance DECIMAL(20,8) DEFAULT 10000.00,
  live_balance DECIMAL(20,8) DEFAULT 0.00,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_tier, subscription_expires_at);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
```

#### user_settings
```sql
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_name TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, setting_name)
);

-- Indexes
CREATE INDEX idx_user_settings_user_name ON user_settings(user_id, setting_name);

-- RLS Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
```

### Market Data

#### market_data_cache
```sql
CREATE TABLE public.market_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  exchange TEXT DEFAULT 'coingecko',
  price_usd DECIMAL(20,8) NOT NULL,
  price_aud DECIMAL(20,8) NOT NULL,
  volume_24h_usd DECIMAL(20,2),
  volume_24h_aud DECIMAL(20,2),
  change_24h DECIMAL(10,4),
  change_percentage_24h DECIMAL(10,4),
  market_cap_usd DECIMAL(20,2),
  market_cap_aud DECIMAL(20,2),
  high_24h DECIMAL(20,8),
  low_24h DECIMAL(20,8),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, exchange)
);

-- Indexes
CREATE INDEX idx_market_data_symbol ON market_data_cache(symbol);
CREATE INDEX idx_market_data_updated ON market_data_cache(last_updated DESC);
CREATE INDEX idx_market_data_market_cap ON market_data_cache(market_cap_aud DESC NULLS LAST);

-- Partitioning for historical data
CREATE TABLE market_data_history (
  id UUID DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  exchange TEXT DEFAULT 'coingecko',
  price_usd DECIMAL(20,8) NOT NULL,
  price_aud DECIMAL(20,8) NOT NULL,
  volume_24h_usd DECIMAL(20,2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE market_data_history_2024_01 PARTITION OF market_data_history
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### crypto_news_feed
```sql
CREATE TABLE public.crypto_news_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  source TEXT NOT NULL,
  author TEXT,
  url TEXT NOT NULL UNIQUE,
  image_url TEXT,
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  symbols_mentioned TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_news_published ON crypto_news_feed(published_at DESC);
CREATE INDEX idx_news_symbols ON crypto_news_feed USING GIN(symbols_mentioned);
CREATE INDEX idx_news_sentiment ON crypto_news_feed(sentiment_score DESC NULLS LAST);
CREATE INDEX idx_news_source ON crypto_news_feed(source, published_at DESC);
```

### Trading System

#### portfolios
```sql
CREATE TYPE trading_mode AS ENUM ('paper', 'live');

CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Portfolio',
  mode trading_mode DEFAULT 'paper',
  initial_balance DECIMAL(20,8) DEFAULT 10000.00,
  current_balance DECIMAL(20,8) DEFAULT 10000.00,
  total_value DECIMAL(20,8) DEFAULT 10000.00,
  total_pnl DECIMAL(20,8) DEFAULT 0.00,
  total_pnl_percentage DECIMAL(10,4) DEFAULT 0.00,
  positions JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolios_user ON portfolios(user_id);
CREATE INDEX idx_portfolios_mode ON portfolios(mode);
CREATE UNIQUE INDEX idx_portfolios_user_default ON portfolios(user_id) 
  WHERE is_default = true;

-- RLS Policies
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own portfolios" ON portfolios
  FOR ALL USING (auth.uid() = user_id);
```

#### orders
```sql
CREATE TYPE order_type AS ENUM ('market', 'limit', 'stop', 'stop_limit');
CREATE TYPE order_status AS ENUM ('pending', 'partial', 'filled', 'cancelled', 'rejected');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  bot_id UUID REFERENCES trading_bots(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  type order_type NOT NULL,
  quantity DECIMAL(20,8) NOT NULL CHECK (quantity > 0),
  price DECIMAL(20,8),
  stop_price DECIMAL(20,8),
  filled_quantity DECIMAL(20,8) DEFAULT 0.00,
  average_fill_price DECIMAL(20,8) DEFAULT 0.00,
  fees DECIMAL(20,8) DEFAULT 0.00,
  status order_status DEFAULT 'pending',
  mode trading_mode DEFAULT 'paper',
  exchange TEXT DEFAULT 'internal',
  exchange_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  filled_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status) WHERE status IN ('pending', 'partial');
CREATE INDEX idx_orders_symbol ON orders(symbol, created_at DESC);
CREATE INDEX idx_orders_portfolio ON orders(portfolio_id, created_at DESC);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own orders" ON orders
  FOR ALL USING (auth.uid() = user_id);
```

#### trade_history
```sql
CREATE TABLE public.trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  amount DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,8),
  order_id TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trade_history_user ON trade_history(user_id, created_at DESC);
CREATE INDEX idx_trade_history_symbol ON trade_history(symbol, created_at DESC);
CREATE INDEX idx_trade_history_exchange ON trade_history(exchange_id, created_at DESC);

-- RLS Policies
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own trade history" ON trade_history
  FOR SELECT USING (auth.uid() = user_id);
```

### AI Trading Bots

#### trading_bots
```sql
CREATE TYPE bot_strategy AS ENUM (
  'dca', 'grid', 'momentum', 'mean_reversion', 'scalping',
  'arbitrage', 'trend_following', 'breakout', 'pattern_recognition'
);
CREATE TYPE bot_status AS ENUM ('active', 'paused', 'stopped', 'error');

CREATE TABLE public.trading_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  strategy bot_strategy NOT NULL,
  target_symbols TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  max_position_size DECIMAL(20,8) DEFAULT 1000.00,
  stop_loss_percentage DECIMAL(5,2) DEFAULT 5.00,
  take_profit_percentage DECIMAL(5,2) DEFAULT 10.00,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  status bot_status DEFAULT 'paused',
  mode trading_mode DEFAULT 'paper',
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  performance JSONB DEFAULT '{"win_rate": 0, "total_return": 0, "total_trades": 0, "current_value": 0}',
  initial_investment DECIMAL(20,8) DEFAULT 1000.00,
  current_value DECIMAL(20,8) DEFAULT 1000.00,
  total_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  last_trade_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bots_user ON trading_bots(user_id);
CREATE INDEX idx_bots_status ON trading_bots(status) WHERE status = 'active';
CREATE INDEX idx_bots_strategy ON trading_bots(strategy);
CREATE INDEX idx_bots_performance ON trading_bots((performance->>'total_return')::DECIMAL DESC);

-- RLS Policies
ALTER TABLE trading_bots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bots" ON trading_bots
  FOR ALL USING (auth.uid() = user_id);
```

#### trading_signals
```sql
CREATE TABLE public.trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES trading_bots(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 100),
  price DECIMAL(20,8) NOT NULL,
  reasoning TEXT,
  technical_indicators JSONB DEFAULT '{}',
  execution_status TEXT DEFAULT 'PENDING' CHECK (
    execution_status IN ('PENDING', 'EXECUTED', 'FAILED', 'IGNORED')
  ),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_signals_user ON trading_signals(user_id, created_at DESC);
CREATE INDEX idx_signals_bot ON trading_signals(bot_id, created_at DESC);
CREATE INDEX idx_signals_symbol ON trading_signals(symbol, signal_type, created_at DESC);
CREATE INDEX idx_signals_confidence ON trading_signals(confidence DESC, created_at DESC);

-- RLS Policies
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own signals" ON trading_signals
  FOR SELECT USING (auth.uid() = user_id);
```

### Alerts & Notifications

#### alerts
```sql
CREATE TYPE alert_type AS ENUM ('price_above', 'price_below', 'volume_spike', 'technical_indicator');

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type alert_type NOT NULL,
  target_value DECIMAL(20,8) NOT NULL,
  current_value DECIMAL(20,8),
  condition_met BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notification_sent BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alerts_user_active ON alerts(user_id) WHERE is_active = true;
CREATE INDEX idx_alerts_symbol_active ON alerts(symbol) WHERE is_active = true;
CREATE INDEX idx_alerts_type ON alerts(type, is_active);

-- RLS Policies
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own alerts" ON alerts
  FOR ALL USING (auth.uid() = user_id);
```

#### notifications
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = false;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
```

### Analytics & Reporting

#### user_analytics
```sql
CREATE TABLE analytics.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_analytics_user ON analytics.user_analytics(user_id, created_at DESC);
CREATE INDEX idx_user_analytics_event ON analytics.user_analytics(event_type, created_at DESC);
CREATE INDEX idx_user_analytics_session ON analytics.user_analytics(session_id);

-- Partition by month
ALTER TABLE analytics.user_analytics 
  PARTITION BY RANGE (created_at);
```

#### performance_metrics
```sql
CREATE TABLE analytics.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value DECIMAL(20,8) NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_perf_metrics_user ON analytics.performance_metrics(user_id, period_end DESC);
CREATE INDEX idx_perf_metrics_portfolio ON analytics.performance_metrics(portfolio_id, period_end DESC);
CREATE INDEX idx_perf_metrics_type ON analytics.performance_metrics(metric_type, period_end DESC);
```

### Audit & Compliance

#### audit_logs
```sql
CREATE TABLE audit.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit.audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit.audit_logs(action, timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit.audit_logs(resource_type, resource_id, timestamp DESC);

-- Partition by month for compliance
ALTER TABLE audit.audit_logs 
  PARTITION BY RANGE (timestamp);
```

## Views and Functions

### Portfolio Value Calculation
```sql
CREATE OR REPLACE VIEW portfolio_values AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.current_balance + COALESCE(
    SUM((pos->>'quantity')::DECIMAL * mdc.price_aud), 0
  ) AS total_value,
  p.initial_balance,
  (p.current_balance + COALESCE(
    SUM((pos->>'quantity')::DECIMAL * mdc.price_aud), 0
  ) - p.initial_balance) AS total_pnl
FROM portfolios p
LEFT JOIN LATERAL jsonb_array_elements(p.positions) AS pos ON true
LEFT JOIN market_data_cache mdc ON mdc.symbol = pos->>'symbol'
GROUP BY p.id, p.user_id, p.name, p.current_balance, p.initial_balance;
```

### Bot Performance Metrics
```sql
CREATE OR REPLACE FUNCTION calculate_bot_performance(bot_id UUID)
RETURNS JSONB AS $$
DECLARE
  total_trades INTEGER;
  winning_trades INTEGER;
  total_return DECIMAL;
  win_rate DECIMAL;
BEGIN
  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE (o.filled_quantity * o.average_fill_price) > 
                                (o.quantity * o.price)),
         SUM(CASE WHEN o.side = 'sell' 
                  THEN o.filled_quantity * o.average_fill_price 
                  ELSE -o.filled_quantity * o.average_fill_price END)
  INTO total_trades, winning_trades, total_return
  FROM orders o
  WHERE o.bot_id = bot_id AND o.status = 'filled';

  win_rate := CASE WHEN total_trades > 0 
                   THEN (winning_trades::DECIMAL / total_trades) * 100 
                   ELSE 0 END;

  RETURN jsonb_build_object(
    'total_trades', total_trades,
    'win_rate', win_rate,
    'total_return', COALESCE(total_return, 0),
    'last_calculated', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Database Triggers

### Updated At Trigger
```sql
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_portfolios
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
```

### Audit Trigger
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();
```

## Indexes and Performance

### Critical Indexes
```sql
-- Trading performance
CREATE INDEX CONCURRENTLY idx_orders_user_status_created 
  ON orders(user_id, status, created_at DESC) 
  WHERE status IN ('pending', 'partial');

-- Market data queries
CREATE INDEX CONCURRENTLY idx_market_data_symbol_updated 
  ON market_data_cache(symbol, last_updated DESC);

-- Portfolio calculations
CREATE INDEX CONCURRENTLY idx_portfolios_user_mode 
  ON portfolios(user_id, mode);

-- Bot performance
CREATE INDEX CONCURRENTLY idx_bots_active_updated 
  ON trading_bots(status, updated_at DESC) 
  WHERE status = 'active';
```

### Materialized Views for Performance
```sql
CREATE MATERIALIZED VIEW mv_user_portfolio_summary AS
SELECT 
  p.user_id,
  COUNT(p.id) as portfolio_count,
  SUM(p.total_value) as total_portfolio_value,
  AVG(p.total_pnl_percentage) as avg_return,
  MAX(p.updated_at) as last_updated
FROM portfolios p
GROUP BY p.user_id;

-- Refresh schedule
CREATE INDEX ON mv_user_portfolio_summary(user_id);
```

## Data Retention and Archival

### Retention Policies
```sql
-- Archive old market data (keep 2 years)
CREATE OR REPLACE FUNCTION archive_old_market_data()
RETURNS void AS $$
BEGIN
  DELETE FROM market_data_history 
  WHERE timestamp < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Clean old notifications (keep 6 months)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;
```

### Scheduled Jobs
```sql
-- Schedule cleanup jobs
SELECT cron.schedule('cleanup-market-data', '0 2 * * 0', 'SELECT archive_old_market_data();');
SELECT cron.schedule('cleanup-notifications', '0 3 * * 0', 'SELECT cleanup_old_notifications();');
```

## Backup and Recovery

### Backup Strategy
```sql
-- Full backup script
pg_dump --verbose --clean --no-acl --no-owner \
  --host=localhost --port=5432 --username=postgres \
  --dbname=cryptomax --file=cryptomax_backup_$(date +%Y%m%d).sql

-- Incremental backup using WAL-E
wal-e backup-push /var/lib/postgresql/data
```

### Point-in-Time Recovery
```sql
-- Create restore point before major operations
SELECT pg_create_restore_point('before_schema_migration');

-- Recovery command
pg_basebackup -h localhost -D /var/lib/postgresql/recovery -U postgres -v -P
```

## Monitoring and Maintenance

### Performance Monitoring Queries
```sql
-- Slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

*This database schema is designed to scale with the CryptoMax platform. Regular review and optimization should be performed as data volumes grow.*
