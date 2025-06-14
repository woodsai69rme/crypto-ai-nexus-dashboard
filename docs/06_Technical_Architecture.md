
# Technical Architecture - CryptoMax

## Overview
CryptoMax is built as a modern, scalable web application using React, TypeScript, and Supabase for backend services. The architecture follows a modular, component-based approach with clear separation of concerns.

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality UI component library
- **Recharts** - Data visualization and charting library
- **Lucide React** - Icon library

### Backend & Infrastructure
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - Row Level Security (RLS)
  - Edge Functions for serverless computing
- **Vercel** - Deployment and hosting platform

### External APIs
- **CoinGecko API** - Cryptocurrency market data
- **News APIs** - Crypto news aggregation
- **WebSocket Connections** - Real-time price feeds

## Architecture Patterns

### Component Architecture
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   ├── trading/         # Trading-specific components
│   ├── portfolio/       # Portfolio management
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── utils/              # Utility functions
├── contexts/           # React contexts
└── pages/              # Page components
```

### Data Flow Architecture
```
UI Components → Custom Hooks → Services → Supabase/APIs
     ↓              ↓           ↓           ↓
State Management ← Data Processing ← Response ← External Data
```

## Core Modules

### 1. Authentication Module
**Components:**
- `AuthGuard` - Route protection
- `Auth` - Login/registration page
- `useAuth` - Authentication hook

**Features:**
- Email/password authentication
- Session management
- Route protection
- User profile management

### 2. Market Data Module
**Components:**
- `MarketOverview` - Market data table
- `TradingChart` - Price charts
- `useMarketData` - Market data hook

**Features:**
- Real-time price updates
- Historical data visualization
- Market sentiment analysis
- Multi-currency support

### 3. Trading Module
**Components:**
- `OrderForm` - Order placement interface
- `OrderHistory` - Order management
- `useOrders` - Order management hook

**Features:**
- Paper trading
- Order management (market, limit, stop-loss)
- Real-time order updates
- Portfolio integration

### 4. Portfolio Module
**Components:**
- `Portfolio` - Portfolio overview
- `RealTimePortfolio` - Live portfolio tracking
- `usePortfolio` - Portfolio management hook

**Features:**
- Real-time valuation
- Performance analytics
- Asset allocation
- P&L tracking

### 5. AI Trading Module
**Components:**
- `BotManager` - Bot creation and management
- `AdvancedBotManager` - Advanced bot features
- `useTradingBots` - Bot management hook

**Features:**
- Strategy templates
- Bot backtesting
- Performance monitoring
- Risk management

## Database Architecture

### Core Tables
```sql
-- User profiles
profiles (id, username, display_name, preferences)

-- Portfolio management
portfolios (id, user_id, name, mode, balance, positions)

-- Trading orders
orders (id, user_id, symbol, side, type, quantity, price, status)

-- AI trading bots
trading_bots (id, user_id, strategy, config, performance)

-- Price alerts
alerts (id, user_id, symbol, condition, target_value)

-- Market data cache
market_data_cache (symbol, price, change_24h, volume, timestamp)
```

### Security Model
- Row Level Security (RLS) on all user data
- User isolation through user_id filters
- Secure API endpoints with authentication
- Real-time subscriptions with user context

## Real-time Data Flow

### WebSocket Architecture
```
CoinGecko API → Supabase Edge Function → Database → Real-time Subscriptions → UI
```

### Data Update Cycle
1. **Market Data**: Updates every 10 seconds
2. **Portfolio Values**: Calculated on price changes
3. **Order Status**: Real-time updates via Supabase
4. **Bot Performance**: Updated on trade execution

## State Management

### Context Providers
- `AuthProvider` - User authentication state
- `SettingsProvider` - User preferences
- `QueryClient` - Server state caching (React Query)

### Local State
- Component state for UI interactions
- Custom hooks for business logic
- React Query for server state

## Performance Optimizations

### Frontend
- Component lazy loading
- Virtualized scrolling for large datasets
- Debounced API calls
- Memoized expensive calculations
- Optimized re-renders with React.memo

### Backend
- Database indexing on frequently queried columns
- Connection pooling
- Query optimization
- Cached market data
- Edge function caching

### Real-time Features
- Efficient WebSocket connections
- Selective data subscriptions
- Batched updates
- Connection retry logic

## Security Architecture

### Frontend Security
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure HTTP headers

### Backend Security
- Row Level Security (RLS)
- JWT token authentication
- API rate limiting
- SQL injection prevention
- Data encryption at rest and in transit

### API Security
- Authentication required for all endpoints
- User context validation
- Input validation
- Error handling without information leakage

## Deployment Architecture

### Build Process
```
Source Code → TypeScript Compilation → Vite Build → Static Assets
```

### Hosting
- **Frontend**: Vercel for static site hosting
- **Backend**: Supabase managed infrastructure
- **CDN**: Global content delivery
- **SSL**: Automatic HTTPS certificates

### Environment Management
- Development: Local with Supabase dev instance
- Staging: Preview deployments on Vercel
- Production: Production Supabase + Vercel

## Monitoring & Observability

### Error Tracking
- React Error Boundaries
- Supabase function logs
- Client-side error reporting
- API error monitoring

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database query performance
- Real-time connection health

### Analytics
- User behavior tracking
- Trading volume metrics
- Feature usage analytics
- Performance metrics

## Scalability Considerations

### Frontend Scaling
- CDN distribution
- Code splitting
- Lazy loading
- Efficient bundling

### Backend Scaling
- Supabase auto-scaling
- Database connection pooling
- Edge function scaling
- Caching strategies

### Data Scaling
- Database partitioning
- Archive old data
- Efficient queries
- Data compression

## Integration Points

### External Services
- **CoinGecko**: Market data provider
- **News APIs**: Crypto news aggregation
- **Email Services**: Notifications and alerts
- **Payment Processors**: Future real trading

### Internal Services
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (future)
- **Functions**: Supabase Edge Functions

## Development Workflow

### Code Organization
- Feature-based folder structure
- Shared components and utilities
- Type definitions and interfaces
- Consistent naming conventions

### Quality Assurance
- TypeScript type checking
- ESLint code linting
- Prettier code formatting
- Component testing
- Integration testing

---

*This architecture document provides the foundation for understanding and extending the CryptoMax platform. Regular reviews ensure it stays aligned with the evolving codebase.*
