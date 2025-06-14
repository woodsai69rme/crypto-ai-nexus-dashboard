
# Deployment Guide - CryptoMax

## Overview
CryptoMax is deployed using modern cloud infrastructure with Vercel for frontend hosting and Supabase for backend services. This guide covers all deployment scenarios from development to production.

## Architecture Overview

```
GitHub Repository → Vercel Build → CDN Distribution
                 ↓
Supabase Backend ← Environment Variables ← Secrets Management
```

## Deployment Environments

### 1. Development Environment
- **Frontend**: Local development server (Vite)
- **Backend**: Local Supabase instance
- **Database**: Local PostgreSQL via Docker
- **Domain**: `localhost:5173`

### 2. Staging Environment
- **Frontend**: Vercel preview deployments
- **Backend**: Supabase staging project
- **Database**: Staging PostgreSQL instance
- **Domain**: `cryptomax-staging.vercel.app`

### 3. Production Environment
- **Frontend**: Vercel production deployment
- **Backend**: Supabase production project
- **Database**: Production PostgreSQL instance
- **Domain**: `cryptomax.com.au`

## Prerequisites

### Required Accounts
- GitHub account (code repository)
- Vercel account (frontend hosting)
- Supabase account (backend services)
- Domain registrar (custom domain)

### Required Tools
```bash
# Install Vercel CLI
npm install -g vercel

# Install Supabase CLI
npm install -g @supabase/cli

# Install Git
git --version
```

## Frontend Deployment (Vercel)

### 1. Initial Setup
```bash
# Connect to Vercel
vercel login

# Link project to Vercel
vercel link

# Configure project settings
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### 2. Automatic Deployment
Vercel automatically deploys on:
- Push to `main` branch (production)
- Push to any branch (preview)
- Pull request creation (preview)

### 3. Manual Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 4. Build Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

## Backend Deployment (Supabase)

### 1. Project Setup
```bash
# Create new Supabase project
supabase projects create cryptomax

# Link local project
supabase link --project-ref <project-id>

# Set up authentication
supabase auth set-config --project-ref <project-id>
```

### 2. Database Migration
```bash
# Generate migration
supabase db diff --file <migration-name>

# Apply migrations
supabase db push

# Reset database (development only)
supabase db reset
```

### 3. Edge Functions Deployment
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy <function-name>

# Set function secrets
supabase secrets set API_KEY=<value>
```

### 4. Environment Configuration
```bash
# Production environment variables
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

## Database Deployment

### 1. Schema Migration
```sql
-- Run in Supabase SQL editor or via CLI
-- migrations/001_initial_schema.sql

-- Create tables
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);
```

### 2. Data Seeding
```bash
# Seed production data
supabase db seed --project-ref <project-id>
```

### 3. Backup Configuration
```bash
# Schedule automated backups
supabase projects update --backup-retention-days 30
```

## Environment Variables

### Frontend Variables (Vercel)
```bash
# Public variables (prefixed with VITE_)
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_ENVIRONMENT=production
VITE_API_VERSION=v1
```

### Backend Variables (Supabase)
```bash
# Private variables
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
OPENAI_API_KEY=<openai_key>
COINAPI_KEY=<coinapi_key>
EMAIL_API_KEY=<email_key>
```

## SSL/TLS Configuration

### Automatic SSL (Vercel)
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### Custom Domain Setup
```bash
# Add custom domain in Vercel dashboard
# Configure DNS records:
# A record: @ → 76.76.19.61
# CNAME: www → cryptomax.vercel.app
```

## Performance Optimization

### Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-dialog']
        }
      }
    },
    minify: 'terser',
    sourcemap: false
  }
});
```

### Caching Strategy
```json
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Monitoring & Analytics

### Vercel Analytics
```typescript
// pages/_app.tsx (if using Next.js approach)
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Supabase Monitoring
```bash
# Monitor database performance
supabase projects logs --project-ref <project-id>

# Monitor function logs
supabase functions logs <function-name>
```

### Error Tracking
```typescript
// Error boundary with reporting
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to monitoring service
    console.error('Production error:', error, errorInfo);
  }
}
```

## Security Configuration

### Content Security Policy
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}
```

### Rate Limiting
```typescript
// Supabase Edge Function
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};
```

## Backup & Recovery

### Database Backups
```bash
# Manual backup
supabase db dump --project-ref <project-id> > backup.sql

# Restore from backup
supabase db reset --project-ref <project-id>
psql -f backup.sql
```

### Code Backups
```bash
# Tag releases
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Branch protection
# Configure in GitHub: Settings → Branches → Protection rules
```

## Rollback Procedures

### Frontend Rollback
```bash
# Revert to previous deployment
vercel rollback <deployment-url>

# Deploy specific commit
git checkout <commit-hash>
vercel --prod
```

### Backend Rollback
```bash
# Database migration rollback
supabase db reset --project-ref <project-id>
supabase db push --file <previous-migration>

# Function rollback
supabase functions deploy <function-name> --import-map <previous-version>
```

## Health Checks

### Frontend Health Check
```typescript
// public/health endpoint
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA 
  });
}
```

### Backend Health Check
```sql
-- Database health check
SELECT 
  'database' as service,
  'healthy' as status,
  NOW() as timestamp;
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] SSL certificates valid
- [ ] Performance metrics baseline
- [ ] Security scan completed

### Deployment Process
- [ ] Database migrations applied
- [ ] Backend services deployed
- [ ] Frontend build successful
- [ ] DNS records updated
- [ ] SSL/TLS configured
- [ ] Monitoring enabled
- [ ] Health checks passing

### Post-Deployment
- [ ] Smoke tests completed
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User acceptance testing
- [ ] Documentation updated
- [ ] Team notified
- [ ] Rollback plan confirmed

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear build cache
vercel --no-cache

# Check build logs
vercel logs <deployment-url>
```

#### Database Connection Issues
```bash
# Test database connection
supabase db ping --project-ref <project-id>

# Check connection pool
supabase projects show --project-ref <project-id>
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Monitor Core Web Vitals
# Use Lighthouse or PageSpeed Insights
```

### Emergency Procedures

#### Critical Bug Response
1. Immediately rollback to previous version
2. Investigate issue in staging environment
3. Apply hotfix and test thoroughly
4. Deploy fix with accelerated process
5. Monitor deployment closely

#### Database Emergency
1. Stop write operations if necessary
2. Restore from latest backup
3. Apply any missing transactions
4. Resume normal operations
5. Conduct post-incident review

---

*This deployment guide ensures reliable, secure, and performant deployments of CryptoMax. Regular updates reflect infrastructure changes and best practices.*
