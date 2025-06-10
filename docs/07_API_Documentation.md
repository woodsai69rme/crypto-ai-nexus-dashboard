
# API Documentation - CryptoMax

## Overview
This document provides comprehensive API documentation for the CryptoMax platform, including authentication, endpoints, request/response formats, and integration examples.

## Base URL
```
Production: https://api.cryptomax.com.au
Staging: https://staging-api.cryptomax.com.au
Development: http://localhost:54321
```

## Authentication

### Overview
CryptoMax uses JWT-based authentication with Supabase Auth. All API requests (except public endpoints) require a valid JWT token in the Authorization header.

### Authentication Flow
```
1. User Login → 2. Receive JWT → 3. Include in Headers → 4. API Access
```

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
apikey: <supabase_anon_key>
```

### Authentication Endpoints

#### Register User
```http
POST /auth/v1/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "data": {
    "display_name": "John Doe",
    "marketing_consent": true
  }
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "email_confirmed_at": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Login User
```http
POST /auth/v1/token?grant_type=password
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "email_confirmed_at": "2024-01-15T10:35:00Z"
  }
}
```

#### Refresh Token
```http
POST /auth/v1/token?grant_type=refresh_token
```

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

#### Logout
```http
POST /auth/v1/logout
```

## Market Data API

### Get Current Prices
```http
GET /rest/v1/market_data_cache
```

**Query Parameters:**
- `symbol`: Filter by specific symbol (optional)
- `limit`: Number of results (default: 100)
- `order`: Sort order (default: market_cap_aud.desc)

**Response:**
```json
{
  "data": [
    {
      "symbol": "BTC",
      "price_aud": 65000.50,
      "price_usd": 43500.25,
      "change_24h": 2.5,
      "change_percentage_24h": 3.85,
      "volume_24h_aud": 1500000000,
      "market_cap_aud": 1275000000000,
      "high_24h": 66000.00,
      "low_24h": 63000.00,
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 100
}
```

### Get Historical Data
```http
GET /functions/v1/market-history
```

**Query Parameters:**
- `symbol`: Cryptocurrency symbol (required)
- `days`: Number of days (1, 7, 30, 90, 365)
- `interval`: Data interval (daily, hourly)

**Response:**
```json
{
  "symbol": "BTC",
  "prices": [
    [1705308000000, 64500.25],
    [1705311600000, 64750.50],
    [1705315200000, 65000.75]
  ],
  "market_caps": [
    [1705308000000, 1270000000000],
    [1705311600000, 1275000000000]
  ],
  "total_volumes": [
    [1705308000000, 1400000000],
    [1705311600000, 1500000000]
  ]
}
```

## Portfolio Management API

### Get User Portfolio
```http
GET /rest/v1/portfolios?user_id=eq.{user_id}
```

**Response:**
```json
{
  "data": [
    {
      "id": "portfolio-uuid",
      "user_id": "user-uuid",
      "name": "Default Portfolio",
      "mode": "paper",
      "initial_balance": 10000.00,
      "current_balance": 9500.00,
      "total_value": 12500.00,
      "total_pnl": 2500.00,
      "total_pnl_percentage": 25.0,
      "positions": [
        {
          "symbol": "BTC",
          "quantity": 0.15,
          "average_price": 60000.00,
          "current_price": 65000.00,
          "value": 9750.00,
          "pnl": 750.00,
          "pnl_percentage": 8.33
        }
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Update Portfolio
```http
PATCH /rest/v1/portfolios?id=eq.{portfolio_id}
```

**Request Body:**
```json
{
  "positions": [
    {
      "symbol": "BTC",
      "quantity": 0.20,
      "average_price": 62500.00
    }
  ],
  "current_balance": 8000.00
}
```

## Trading API

### Place Order
```http
POST /rest/v1/orders
```

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "portfolio_id": "portfolio-uuid",
  "symbol": "BTC-AUD",
  "side": "buy",
  "type": "market",
  "quantity": 0.01,
  "price": null,
  "mode": "paper"
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "order-uuid",
      "user_id": "user-uuid",
      "symbol": "BTC-AUD",
      "side": "buy",
      "type": "market",
      "quantity": 0.01,
      "price": null,
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "filled_quantity": 0,
      "average_fill_price": 0,
      "fees": 0
    }
  ]
}
```

### Get Orders
```http
GET /rest/v1/orders?user_id=eq.{user_id}&order=created_at.desc
```

**Query Parameters:**
- `status`: Filter by order status (pending, filled, cancelled)
- `symbol`: Filter by trading pair
- `limit`: Number of results (default: 50)

**Response:**
```json
{
  "data": [
    {
      "id": "order-uuid",
      "user_id": "user-uuid",
      "symbol": "BTC-AUD",
      "side": "buy",
      "type": "market",
      "quantity": 0.01,
      "price": null,
      "status": "filled",
      "filled_quantity": 0.01,
      "average_fill_price": 65000.00,
      "fees": 3.25,
      "created_at": "2024-01-15T10:30:00Z",
      "filled_at": "2024-01-15T10:30:05Z"
    }
  ],
  "count": 25
}
```

### Cancel Order
```http
PATCH /rest/v1/orders?id=eq.{order_id}
```

**Request Body:**
```json
{
  "status": "cancelled",
  "cancelled_at": "2024-01-15T10:35:00Z"
}
```

## AI Trading Bots API

### Create Trading Bot
```http
POST /rest/v1/trading_bots
```

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "name": "Bitcoin DCA Bot",
  "strategy": "dca",
  "target_symbols": ["BTC"],
  "config": {
    "investment_amount": 100.00,
    "frequency": "weekly",
    "start_date": "2024-01-15"
  },
  "max_position_size": 1000.00,
  "stop_loss_percentage": 10.0,
  "take_profit_percentage": 20.0,
  "risk_level": "medium",
  "mode": "paper"
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "bot-uuid",
      "user_id": "user-uuid",
      "name": "Bitcoin DCA Bot",
      "strategy": "dca",
      "status": "paused",
      "config": {
        "investment_amount": 100.00,
        "frequency": "weekly",
        "start_date": "2024-01-15"
      },
      "performance": {
        "total_return": 0,
        "win_rate": 0,
        "total_trades": 0,
        "current_value": 1000.00
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Trading Bots
```http
GET /rest/v1/trading_bots?user_id=eq.{user_id}
```

**Response:**
```json
{
  "data": [
    {
      "id": "bot-uuid",
      "name": "Bitcoin DCA Bot",
      "strategy": "dca",
      "status": "active",
      "performance": {
        "total_return": 15.5,
        "win_rate": 65.0,
        "total_trades": 20,
        "current_value": 1155.00
      },
      "last_trade_at": "2024-01-14T09:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Start/Stop Bot
```http
PATCH /rest/v1/trading_bots?id=eq.{bot_id}
```

**Request Body:**
```json
{
  "status": "active"
}
```

## Alerts API

### Create Price Alert
```http
POST /rest/v1/alerts
```

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "symbol": "BTC",
  "type": "price_above",
  "target_value": 70000.00,
  "expires_at": "2024-02-15T00:00:00Z"
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "alert-uuid",
      "user_id": "user-uuid",
      "symbol": "BTC",
      "type": "price_above",
      "target_value": 70000.00,
      "current_value": 65000.00,
      "condition_met": false,
      "is_active": true,
      "expires_at": "2024-02-15T00:00:00Z",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get User Alerts
```http
GET /rest/v1/alerts?user_id=eq.{user_id}&is_active=eq.true
```

## News API

### Get Crypto News
```http
GET /rest/v1/crypto_news_feed?order=published_at.desc&limit=20
```

**Query Parameters:**
- `symbols_mentioned`: Filter by mentioned cryptocurrencies
- `source`: Filter by news source
- `sentiment_score`: Filter by sentiment (gte.0.5 for positive)

**Response:**
```json
{
  "data": [
    {
      "id": "news-uuid",
      "title": "Bitcoin Reaches New All-Time High",
      "content": "Bitcoin has surged to a new record high...",
      "summary": "BTC hits $70,000 amid institutional adoption",
      "source": "CoinDesk",
      "author": "Jane Smith",
      "url": "https://coindesk.com/article",
      "image_url": "https://images.coindesk.com/bitcoin.jpg",
      "sentiment_score": 0.85,
      "symbols_mentioned": ["BTC", "ETH"],
      "published_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

## WebSocket API

### Real-Time Subscriptions

#### Price Updates
```javascript
const supabase = createClient(url, key);

// Subscribe to price updates
const priceChannel = supabase
  .channel('price-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'market_data_cache'
  }, (payload) => {
    console.log('Price update:', payload.new);
  })
  .subscribe();
```

#### Portfolio Updates
```javascript
// Subscribe to portfolio changes
const portfolioChannel = supabase
  .channel('portfolio-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'portfolios',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Portfolio update:', payload);
  })
  .subscribe();
```

#### Order Updates
```javascript
// Subscribe to order status changes
const orderChannel = supabase
  .channel('order-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Order update:', payload.new);
  })
  .subscribe();
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {
      "field": "password",
      "reason": "authentication_failed"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123abc"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid authentication credentials |
| `INSUFFICIENT_FUNDS` | 400 | Not enough balance for operation |
| `INVALID_SYMBOL` | 400 | Cryptocurrency symbol not supported |
| `ORDER_NOT_FOUND` | 404 | Order ID does not exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `MARKET_CLOSED` | 503 | Market is currently closed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Rate Limiting

### Rate Limits by Endpoint Type

| Endpoint Type | Anonymous | Authenticated | Premium |
|---------------|-----------|---------------|---------|
| Market Data | 60/min | 300/min | 1000/min |
| Trading | N/A | 100/min | 500/min |
| Portfolio | N/A | 200/min | 1000/min |
| Bot Management | N/A | 50/min | 200/min |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705315200
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get portfolio
const { data: portfolio } = await supabase
  .from('portfolios')
  .select('*')
  .eq('user_id', userId)
  .single();

// Place order
const { data: order } = await supabase
  .from('orders')
  .insert({
    symbol: 'BTC-AUD',
    side: 'buy',
    type: 'market',
    quantity: 0.01
  });
```

### Python
```python
from supabase import create_client

supabase = create_client(
    "https://your-project.supabase.co",
    "your-anon-key"
)

# Login
auth_response = supabase.auth.sign_in_with_password({
    "email": "user@example.com",
    "password": "password"
})

# Get market data
market_data = supabase.table('market_data_cache') \
    .select('*') \
    .order('market_cap_aud', desc=True) \
    .limit(10) \
    .execute()
```

## Webhooks

### Webhook Events

#### Order Filled
```json
{
  "event": "order.filled",
  "data": {
    "order_id": "order-uuid",
    "user_id": "user-uuid",
    "symbol": "BTC-AUD",
    "side": "buy",
    "quantity": 0.01,
    "price": 65000.00,
    "filled_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Alert Triggered
```json
{
  "event": "alert.triggered",
  "data": {
    "alert_id": "alert-uuid",
    "user_id": "user-uuid",
    "symbol": "BTC",
    "type": "price_above",
    "target_value": 70000.00,
    "current_value": 70050.00,
    "triggered_at": "2024-01-15T10:30:00Z"
  }
}
```

### Webhook Security
```http
X-Webhook-Signature: sha256=calculated_signature
```

---

*This API documentation is continuously updated. For the latest changes, check the changelog or contact the development team.*
