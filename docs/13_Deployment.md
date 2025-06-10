
# Deployment Guide - CryptoMax

## Overview
This document provides comprehensive deployment instructions for the CryptoMax platform across different environments (development, staging, production).

## Deployment Architecture

### Infrastructure Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ • Local DB      │    │ • Staging DB    │    │ • Production DB │
│ • Mock APIs     │    │ • Real APIs     │    │ • Real APIs     │
│ • Debug Mode    │    │ • Testing       │    │ • Live Users    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────────────────────────────┐
         │              CI/CD Pipeline                   │
         │         (GitHub Actions + Vercel)            │
         └───────────────────────────────────────────────┘
```

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All tests passing (`bun test`)
- [ ] ESLint checks passing (`bun run lint`)
- [ ] TypeScript compilation successful (`bun run type-check`)
- [ ] Build successful (`bun run build`)
- [ ] No console errors or warnings

### 2. Environment Configuration
- [ ] Environment variables configured
- [ ] API keys and secrets properly set
- [ ] Database migrations applied
- [ ] SSL certificates configured

### 3. Security
- [ ] Authentication flows tested
- [ ] Authorization policies verified
- [ ] Sensitive data encrypted
- [ ] CORS policies configured
- [ ] Rate limiting enabled

### 4. Performance
- [ ] Bundle size optimized
- [ ] Images compressed and optimized
- [ ] API response times acceptable
- [ ] Database queries optimized
- [ ] CDN configured

## Environment Configurations

### Development Environment

#### Local Setup
```bash
# Environment variables (.env.local)
VITE_ENV=development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_DEBUG_MODE=true
VITE_API_BASE_URL=http://localhost:54321

# Start development server
bun dev
```

#### Development Database
```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Seed development data
supabase db reset --with-seed
```

### Staging Environment

#### Vercel Staging Configuration
```bash
# Environment variables (Vercel Dashboard)
VITE_ENV=staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_DEBUG_MODE=false
VITE_API_BASE_URL=https://staging-project.supabase.co
```

#### Staging Database Setup
```sql
-- Create staging database
CREATE DATABASE cryptomax_staging;

-- Apply production schema with test data
supabase db reset --db-url postgresql://staging-connection-string
```

### Production Environment

#### Production Configuration
```bash
# Environment variables (Vercel Production)
VITE_ENV=production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
VITE_DEBUG_MODE=false
VITE_API_BASE_URL=https://prod-project.supabase.co
VITE_SENTRY_DSN=your-sentry-dsn
```

## Deployment Platforms

### 1. Vercel Deployment (Recommended)

#### Automatic Deployment
```yaml
# vercel.json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "installCommand": "bun install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
```

#### Manual Deployment
```bash
# Install Vercel CLI
bun add -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Environment Variables Setup
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add production environment variables
3. Configure different values for Preview and Production

### 2. Netlify Deployment

#### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "bun run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Cache-Control = "no-cache"
```

#### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod --dir=dist
```

### 3. AWS S3 + CloudFront

#### Build and Deploy Script
```bash
#!/bin/bash
# deploy-aws.sh

# Build the application
bun run build

# Sync to S3
aws s3 sync dist/ s3://cryptomax-frontend-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"

echo "Deployment complete!"
```

#### CloudFront Configuration
```json
{
  "Origins": [{
    "DomainName": "cryptomax-frontend-bucket.s3.amazonaws.com",
    "Id": "S3-cryptomax-frontend",
    "S3OriginConfig": {
      "OriginAccessIdentity": ""
    }
  }],
  "DefaultCacheBehavior": {
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "managed-caching-optimized"
  },
  "CustomErrorResponses": [{
    "ErrorCode": 404,
    "ResponsePagePath": "/index.html",
    "ResponseCode": 200
  }]
}
```

## Supabase Deployment

### Database Deployment

#### Production Database Setup
```bash
# Create production project in Supabase Dashboard

# Apply migrations to production
supabase db push --db-url postgresql://production-connection-string

# Verify migration status
supabase migration list --db-url postgresql://production-connection-string
```

#### Database Migration Strategy
```sql
-- Create migration with transaction
BEGIN;

-- Add new columns/tables
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS new_feature_flag BOOLEAN DEFAULT false;

-- Update existing data if needed
UPDATE portfolios SET new_feature_flag = true WHERE created_at > '2024-01-01';

-- Create indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolios_feature 
ON portfolios(new_feature_flag) WHERE new_feature_flag = true;

COMMIT;
```

### Edge Functions Deployment

#### Deploy Individual Functions
```bash
# Deploy market data function
supabase functions deploy market-data-sync --project-ref your-project-ref

# Deploy with environment variables
supabase secrets set COINGECKO_API_KEY=your-api-key --project-ref your-project-ref
supabase functions deploy trading-bot-engine --project-ref your-project-ref
```

#### Function Configuration
```typescript
// supabase/functions/market-data-sync/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Function logic here
    const data = await syncMarketData()

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Production Deployment
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
          
      - name: Install dependencies
        run: bun install
        
      - name: Run tests
        run: bun test
        
      - name: Run ESLint
        run: bun run lint
        
      - name: Type check
        run: bun run type-check
        
      - name: Build
        run: bun run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-i d: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: --prod
```

#### Preview Deployment
```yaml
# .github/workflows/preview.yml
name: Deploy Preview

on:
  pull_request:
    branches: [main]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: bun install
        
      - name: Run tests
        run: bun test
        
      - name: Deploy Preview
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-comment: true
```

### Deployment Scripts

#### Database Deployment Script
```bash
#!/bin/bash
# deploy-database.sh

ENV=$1
PROJECT_ID=$2

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
  echo "Environment must be 'staging' or 'production'"
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Project ID is required"
  exit 1
fi

echo "Deploying database migrations to $ENV environment..."

# Apply migrations
supabase db push --project-ref $PROJECT_ID

# Verify migrations
supabase migration list --project-ref $PROJECT_ID

echo "Database deployment complete!"
```

#### Edge Functions Deployment Script
```bash
#!/bin/bash
# deploy-functions.sh

ENV=$1
PROJECT_ID=$2

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
  echo "Environment must be 'staging' or 'production'"
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Project ID is required"
  exit 1
fi

echo "Deploying Edge Functions to $ENV environment..."

# Deploy all functions
for dir in supabase/functions/*/; do
  function_name=$(basename "$dir")
  echo "Deploying function: $function_name"
  supabase functions deploy "$function_name" --project-ref "$PROJECT_ID"
done

echo "Edge Functions deployment complete!"
```

## Domain Configuration

### Custom Domain Setup (Vercel)
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your domain (e.g., `cryptomax.com.au`)
3. Configure DNS settings as instructed:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
4. Set up CNAME for subdomains:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com.
   ```

### SSL Configuration
SSL certificates are automatically managed by Vercel. No additional configuration is needed.

## Post-Deployment Verification

### Health Checks
```bash
#!/bin/bash
# health-check.sh

BASE_URL=$1

if [ -z "$BASE_URL" ]; then
  echo "Base URL is required (e.g., https://app.cryptomax.com.au)"
  exit 1
fi

# Check main app
curl -f "$BASE_URL" || echo "Main app not accessible"

# Check API endpoints
curl -f "$BASE_URL/api/health" || echo "API health endpoint not accessible"

# Check authentication
curl -f "$BASE_URL/api/auth" -H "Authorization: Bearer $TEST_TOKEN" || echo "Auth endpoint not working"
```

### Smoke Testing
```javascript
// tests/smoke/smoke-test.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Testing homepage...');
    await page.goto('https://app.cryptomax.com.au');
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 5000 });
    
    console.log('Testing login...');
    await page.goto('https://app.cryptomax.com.au/auth');
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 5000 });
    
    console.log('All smoke tests passed!');
  } catch (error) {
    console.error('Smoke test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
```

## Database Backups

### Automated Backup Script
```bash
#!/bin/bash
# backup-database.sh

PROJECT_ID=$1
BACKUP_BUCKET=$2

if [ -z "$PROJECT_ID" ] || [ -z "$BACKUP_BUCKET" ]; then
  echo "Project ID and backup bucket are required"
  exit 1
fi

# Set timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="cryptomax_backup_${TIMESTAMP}.sql"

# Create backup
supabase db dump --project-ref "$PROJECT_ID" > "$BACKUP_FILE"

# Upload to backup storage
aws s3 cp "$BACKUP_FILE" "s3://$BACKUP_BUCKET/backups/$BACKUP_FILE"

# Clean up local file
rm "$BACKUP_FILE"

echo "Backup completed: $BACKUP_FILE"
```

### Backup Policy
- **Daily Backups**: Retained for 7 days
- **Weekly Backups**: Retained for 4 weeks
- **Monthly Backups**: Retained for 12 months
- **Point-in-Time Recovery**: Enabled with 5-minute resolution

## Rollback Procedures

### Frontend Rollback
```bash
#!/bin/bash
# rollback-frontend.sh

VERSION_ID=$1

if [ -z "$VERSION_ID" ]; then
  echo "Version ID is required"
  exit 1
fi

# Rollback to previous version
vercel rollback $VERSION_ID --yes
```

### Database Rollback
```sql
-- Create restore point before major changes
SELECT pg_create_restore_point('before_feature_launch');

-- Rollback to restore point
SELECT pg_restore_db('before_feature_launch');

-- Rollback specific migration
SELECT supabase.rollback_migration('20240601143022_add_trading_signals');
```

## Monitoring and Logging

### Monitoring Setup

#### Vercel Analytics
Monitor application performance via Vercel Analytics Dashboard:
- Page load times
- API response times
- Error rates
- User engagement

#### Supabase Monitoring
Monitor database and API usage via Supabase Dashboard:
- Query performance
- API call volume
- Authentication activity
- Storage usage

### Logging Configuration

#### Client-Side Error Logging
```typescript
// src/utils/errorLogging.ts
import * as Sentry from '@sentry/browser';

export const initErrorTracking = () => {
  if (import.meta.env.VITE_ENV !== 'development') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENV,
      tracesSampleRate: import.meta.env.VITE_ENV === 'production' ? 0.1 : 1.0,
    });
  }
};

export const logError = (error: Error, context?: Record<string, any>) => {
  console.error(error);
  
  if (import.meta.env.VITE_ENV !== 'development') {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};
```

#### Server-Side Logging (Edge Functions)
```typescript
// supabase/functions/utils/logger.ts
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export const logger = {
  debug: (message: string, data?: any) => log(LogLevel.DEBUG, message, data),
  info: (message: string, data?: any) => log(LogLevel.INFO, message, data),
  warn: (message: string, data?: any) => log(LogLevel.WARN, message, data),
  error: (message: string, data?: any) => log(LogLevel.ERROR, message, data),
};

const log = (level: LogLevel, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const formattedMessage = {
    timestamp,
    level,
    message,
    data,
    environment: Deno.env.get('SUPABASE_ENV'),
    functionName: Deno.env.get('SUPABASE_FUNCTION_NAME'),
  };
  
  console.log(JSON.stringify(formattedMessage));
};
```

## Performance Optimization

### Frontend Optimizations
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'CryptoMax',
        short_name: 'CryptoMax',
        theme_color: '#0f172a',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['@/components/ui'],
        },
      },
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
```

### Backend Optimizations
```sql
-- Optimize database performance
ALTER TABLE market_data_cache SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE market_data_cache SET (autovacuum_analyze_scale_factor = 0.025);

-- Create materialized view for common queries
CREATE MATERIALIZED VIEW mv_top_cryptocurrencies AS
SELECT 
  symbol, 
  price_aud, 
  market_cap_aud, 
  change_percentage_24h
FROM market_data_cache
ORDER BY market_cap_aud DESC
LIMIT 100;

-- Create index for efficient queries
CREATE INDEX idx_market_data_symbol_price ON market_data_cache(symbol, price_aud);
```

## Security Hardening

### Security Headers
```typescript
// vercel.json with security headers
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://assets.cryptomax.com.au; connect-src 'self' https://api.coingecko.com https://*.supabase.co;"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "same-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

### API Security
```typescript
// src/lib/api-client.ts
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    });
    
    if (!response.ok) {
      handleApiError(response);
    }
    
    return response.json();
  },
  
  // Add similar methods for post, put, delete
};

const handleApiError = (response: Response) => {
  const status = response.status;
  
  if (status === 401) {
    // Unauthorized - redirect to login
    toast({
      title: 'Session expired',
      description: 'Please sign in again',
      variant: 'destructive',
    });
    window.location.href = '/auth';
  } else if (status === 403) {
    // Forbidden
    toast({
      title: 'Access denied',
      description: 'You don\'t have permission to perform this action',
      variant: 'destructive',
    });
  } else {
    // Generic error
    toast({
      title: 'Something went wrong',
      description: 'Please try again later',
      variant: 'destructive',
    });
  }
  
  throw new Error(`API Error: ${status}`);
};
```

## Emergency Contacts and Procedures

### Emergency Contact List
- **Engineering Lead**: engineering-lead@cryptomax.com.au, +61 400 123 456
- **DevOps Engineer**: devops@cryptomax.com.au, +61 400 456 789
- **Security Officer**: security@cryptomax.com.au, +61 400 789 123

### Incident Management
1. **Identify**: Confirm issue exists and assess severity
2. **Notify**: Alert appropriate team members via on-call system
3. **Mitigate**: Apply immediate fixes or rollback as necessary
4. **Resolve**: Implement permanent fix with testing
5. **Document**: Create post-mortem analysis

### Emergency Access
```bash
# Emergency access to production database
export PGPASSWORD=$PROD_DB_PASSWORD
psql -h $PROD_DB_HOST -U $PROD_DB_USER -d cryptomax_production

# Emergency rollback to previous deployment
vercel rollback --prod

# Emergency function update
supabase functions deploy critical-fix --no-verify-jwt --project-ref $PROJECT_ID
```

---

*This deployment guide provides comprehensive instructions for deploying and maintaining the CryptoMax platform. For questions or emergencies, contact the DevOps team.*
