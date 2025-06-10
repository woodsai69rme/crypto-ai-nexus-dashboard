
# Technical Architecture - CryptoMax

## Overview
This document outlines the technical architecture of the CryptoMax platform, including system components, data flow, technology stack, and infrastructure design decisions.

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │  Admin Panel    │
│   (React SPA)   │    │   (React PWA)   │    │   (React SPA)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────────────────────────────┐
         │              Load Balancer                    │
         │            (Cloudflare/Vercel)               │
         └───────────────────────────────────────────────┘
                                 │
         ┌───────────────────────────────────────────────┐
         │              API Gateway                      │
         │            (Supabase Edge)                    │
         └───────────────────────────────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌───▼────┐              ┌───────▼────────┐              ┌────▼────┐
│Auth    │              │ Core API       │              │Real-time│
│Service │              │ (Supabase)     │              │Service  │
│        │              │                │              │         │
└────────┘              └────────────────┘              └─────────┘
                                 │
         ┌───────────────────────────────────────────────┐
         │            Database Layer                     │
         │          (PostgreSQL + Redis)                │
         └───────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── layout/         # Layout components
│   ├── trading/        # Trading-specific components
│   ├── portfolio/      # Portfolio management
│   ├── bots/          # AI bot management
│   └── analytics/     # Analytics and charts
├── hooks/              # Custom React hooks
├── services/           # API services and integrations
├── pages/              # Page components
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── lib/               # Library configurations
```

#### Backend Architecture (Supabase)
```
supabase/
├── migrations/         # Database schema migrations
├── functions/          # Edge functions (serverless)
│   ├── auth/          # Authentication functions
│   ├── trading/       # Trading-related functions
│   ├── market-data/   # Market data processing
│   └── notifications/ # Notification services
├── storage/           # File storage configuration
└── config.toml       # Supabase configuration
```

## Technology Stack

### Frontend Technologies

#### Core Framework
- **React 18**: Modern React with concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing

#### UI Framework
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Component library built on Radix UI
- **Lucide React**: Icon library
- **Recharts**: Data visualization and charting

#### State Management
- **React Query (TanStack)**: Server state management
- **React Context**: Local state management
- **Zustand**: Global state management (if needed)

#### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **TypeScript**: Type checking

### Backend Technologies

#### Core Platform
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Primary database
- **PostgREST**: Automatic API generation
- **GoTrue**: Authentication service

#### Edge Functions
- **Deno**: Runtime for edge functions
- **TypeScript**: Edge function development
- **Supabase Edge Runtime**: Serverless execution

#### External APIs
- **CoinGecko API**: Cryptocurrency market data
- **News API**: Cryptocurrency news feeds
- **OpenRouter**: AI model access

### Infrastructure

#### Hosting and Deployment
- **Vercel**: Frontend hosting and deployment
- **Supabase**: Backend infrastructure
- **Cloudflare**: CDN and DDoS protection
- **GitHub**: Version control and CI/CD

#### Monitoring and Analytics
- **Sentry**: Error tracking and monitoring
- **Supabase Analytics**: Database and API analytics
- **Google Analytics**: User behavior analytics
- **LogRocket**: Session replay and debugging

## Data Architecture

### Database Schema Design

#### Core Tables

**Users and Authentication**
```sql
-- Handled by Supabase Auth
auth.users              -- User authentication data
public.profiles         -- Extended user profiles
public.user_settings    -- User preferences and settings
```

**Trading Data**
```sql
public.portfolios       -- User portfolios
public.orders           -- Trading orders
public.positions        -- Current positions
public.trade_history    -- Historical trades
public.trading_bots     -- AI trading bot configurations
```

**Market Data**
```sql
public.market_data      -- Real-time market data cache
public.price_history    -- Historical price data
public.news_feed        -- Cryptocurrency news
public.alerts           -- Price and volume alerts
```

**Analytics and Reporting**
```sql
public.user_analytics   -- User behavior analytics
public.performance_metrics -- Trading performance data
public.system_logs      -- System activity logs
```

#### Database Relationships
```
Users (1) ──────── (M) Portfolios
Users (1) ──────── (M) Trading Bots
Users (1) ──────── (M) Orders
Users (1) ──────── (M) Alerts
Portfolios (1) ─── (M) Positions
Trading Bots (1) ─ (M) Bot Trades
```

### Data Flow Architecture

#### Real-Time Data Flow
```
External APIs → Supabase Functions → Database → Real-time → Frontend
     │                  │              │          │          │
CoinGecko API      Edge Functions   PostgreSQL  WebSockets  React App
News APIs          Data Processing   + Redis     + Pub/Sub   + State Mgmt
```

#### Trading Data Flow
```
User Input → Validation → Order Processing → Database → Portfolio Update
    │            │             │               │            │
Order Form   Business Rules  Trade Execution  PostgreSQL   Real-time UI
```

## API Design

### RESTful API Structure

#### Authentication Endpoints
```
POST /auth/signup        # User registration
POST /auth/signin        # User login
POST /auth/signout       # User logout
POST /auth/reset         # Password reset
GET  /auth/user          # Get current user
```

#### Trading Endpoints
```
GET    /api/portfolio         # Get user portfolio
POST   /api/orders           # Create new order
GET    /api/orders           # Get user orders
PUT    /api/orders/:id       # Update order
DELETE /api/orders/:id       # Cancel order
GET    /api/positions        # Get user positions
```

#### Market Data Endpoints
```
GET /api/market/prices       # Current prices
GET /api/market/history      # Historical data
GET /api/market/news         # Market news
GET /api/market/analytics    # Market analytics
```

#### Bot Management Endpoints
```
GET    /api/bots            # Get user bots
POST   /api/bots            # Create new bot
PUT    /api/bots/:id        # Update bot
DELETE /api/bots/:id        # Delete bot
POST   /api/bots/:id/start  # Start bot
POST   /api/bots/:id/stop   # Stop bot
```

### WebSocket API

#### Real-Time Subscriptions
```javascript
// Price updates
supabase
  .channel('price-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'market_data'
  }, handlePriceUpdate)
  .subscribe();

// Portfolio updates
supabase
  .channel('portfolio-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'portfolios',
    filter: `user_id=eq.${userId}`
  }, handlePortfolioUpdate)
  .subscribe();
```

## Security Architecture

### Authentication and Authorization

#### Multi-Factor Authentication
```
User Login → Email/Password → MFA Challenge → JWT Token → API Access
    │              │              │            │           │
Login Form    Supabase Auth    SMS/TOTP    Signed JWT    Protected Routes
```

#### Role-Based Access Control (RBAC)
```sql
-- User roles
CREATE TYPE user_role AS ENUM ('trader', 'premium', 'admin');

-- Permission system
CREATE TABLE user_permissions (
  user_id UUID REFERENCES auth.users(id),
  permission TEXT NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW()
);
```

### Data Security

#### Encryption
- **At Rest**: PostgreSQL encryption with AES-256
- **In Transit**: TLS 1.3 for all communications
- **API Keys**: Encrypted storage in Supabase Vault
- **PII Data**: Field-level encryption for sensitive data

#### Row Level Security (RLS)
```sql
-- Example RLS policy
CREATE POLICY "Users can only see their own portfolios"
  ON portfolios FOR ALL
  USING (auth.uid() = user_id);
```

### API Security

#### Rate Limiting
```javascript
// Edge function rate limiting
const rateLimit = {
  anonymous: '10/minute',
  authenticated: '100/minute',
  premium: '1000/minute'
};
```

#### Input Validation
```typescript
// Zod schema validation
const orderSchema = z.object({
  symbol: z.string().min(3).max(10),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  price: z.number().positive().optional()
});
```

## Performance Architecture

### Caching Strategy

#### Multi-Level Caching
```
Browser Cache → CDN Cache → API Cache → Database Cache
     │             │          │           │
Local Storage  Cloudflare   Redis      PostgreSQL
(5 minutes)    (1 hour)    (15 min)   (Persistent)
```

#### Cache Implementation
```typescript
// Service worker caching
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/market/prices')) {
    event.respondWith(
      caches.open('market-data').then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request);
        });
      })
    );
  }
});
```

### Database Optimization

#### Query Optimization
```sql
-- Optimized indexes
CREATE INDEX idx_market_data_symbol_timestamp 
ON market_data (symbol, last_updated DESC);

CREATE INDEX idx_orders_user_status 
ON orders (user_id, status) WHERE status IN ('pending', 'partial');
```

#### Connection Pooling
```typescript
// Supabase connection pooling
const supabase = createClient(url, key, {
  db: {
    poolSize: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }
});
```

### Real-Time Performance

#### WebSocket Optimization
```typescript
// Debounced updates
const debouncedUpdate = debounce((data) => {
  updatePortfolioDisplay(data);
}, 100);

supabase
  .channel('portfolio')
  .on('postgres_changes', {}, debouncedUpdate)
  .subscribe();
```

## Scalability Architecture

### Horizontal Scaling

#### Microservices Approach (Future)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Auth      │  │  Trading    │  │ Market Data │
│  Service    │  │  Service    │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Notification│  │ Analytics   │  │   Bot       │
│  Service    │  │  Service    │  │ Management  │
└─────────────┘  └─────────────┘  └─────────────┘
```

#### Database Scaling
```sql
-- Partitioning strategy
CREATE TABLE market_data_2024 PARTITION OF market_data
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Read replicas for analytics
CREATE SUBSCRIPTION analytics_replica
CONNECTION 'host=analytics-db port=5432'
PUBLICATION analytics_data;
```

### Load Balancing

#### CDN Strategy
```
User Request → Cloudflare → Vercel Edge → Supabase
     │             │           │            │
Geographic     Cache Layer   App Server   Database
Distribution   + DDoS        + Static      + API
```

## Monitoring and Observability

### Application Monitoring

#### Error Tracking
```typescript
// Sentry integration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

#### Performance Monitoring
```typescript
// Custom performance tracking
const trackPerformance = (action: string, duration: number) => {
  analytics.track('Performance', {
    action,
    duration,
    timestamp: Date.now()
  });
};
```

### Infrastructure Monitoring

#### Health Checks
```typescript
// Health check endpoint
export default async function handler(req: Request) {
  const checks = await Promise.all([
    checkDatabase(),
    checkExternalAPIs(),
    checkCache(),
    checkWebSockets()
  ]);
  
  return new Response(JSON.stringify({
    status: checks.every(c => c.healthy) ? 'healthy' : 'degraded',
    checks
  }));
}
```

## Deployment Architecture

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

#### Environment Strategy
```
Development → Staging → Production
     │           │          │
Feature     Integration   Live
Branch      Testing       Users
```

### Backup and Recovery

#### Database Backup Strategy
```sql
-- Automated backups
SELECT pg_create_restore_point('daily_backup');

-- Point-in-time recovery
SELECT pg_create_restore_point('pre_migration_' || NOW()::DATE);
```

#### Disaster Recovery
```
Primary Region (AWS us-east-1) → Backup Region (AWS ap-southeast-2)
         │                              │
    Live Database                   Read Replica
    + File Storage                  + File Backup
```

---

*This technical architecture provides a solid foundation for building and scaling the CryptoMax platform. Regular architecture reviews should be conducted as the system grows.*
