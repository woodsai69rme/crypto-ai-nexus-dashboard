
# Developer Setup Guide - CryptoMax

## Overview
This guide provides step-by-step instructions for setting up a complete development environment for the CryptoMax platform, including local development, testing, and deployment preparation.

## Prerequisites

### System Requirements
- **Operating System**: macOS, Windows 10+, or Linux (Ubuntu 20.04+ recommended)
- **Node.js**: Version 18.0+ (LTS recommended)
- **Package Manager**: npm 9+ or Bun 1.0+
- **Git**: Version 2.30+
- **VS Code**: Latest version (recommended IDE)

### Account Requirements
- **GitHub Account**: For code repository access
- **Supabase Account**: For backend services
- **Vercel Account**: For deployment (optional)

## Quick Start

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/your-org/cryptomax-platform.git
cd cryptomax-platform

# Install dependencies
bun install
# or
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
bun dev
# or
npm run dev
```

The application will be available at `http://localhost:5173`

## Detailed Setup

### 1. Environment Configuration

#### Required Environment Variables
Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Keys (Optional for development)
VITE_COINGECKO_API_KEY=your-coingecko-api-key
VITE_NEWS_API_KEY=your-news-api-key

# Development Settings
VITE_ENV=development
VITE_API_BASE_URL=http://localhost:54321
VITE_DEBUG_MODE=true
```

#### Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Import the database schema:
```bash
# Using Supabase CLI
supabase db reset
```

### 2. Database Setup

#### Install Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# Windows (using Chocolatey)
choco install supabase

# Linux
curl -fsSL https://supabase.com/install.sh | sh
```

#### Initialize Local Database
```bash
# Start local Supabase services
supabase start

# Apply migrations
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

#### Seed Development Data
```bash
# Run seed script
supabase db reset --with-seed
```

### 3. IDE Setup (VS Code)

#### Required Extensions
Install these VS Code extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "supabase.supabase-sql"
  ]
}
```

#### VS Code Settings
Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    "cn\\(([^)]*)\\)"
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### Launch Configuration
Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### 4. Development Tools

#### ESLint Configuration
The project uses ESLint for code quality. Configuration in `eslint.config.js`:

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
)
```

#### Prettier Configuration
Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### Git Hooks with Husky
```bash
# Install husky
bun add -D husky lint-staged

# Setup pre-commit hooks
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

Create `.lintstagedrc`:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,scss,md}": ["prettier --write"]
}
```

### 5. Testing Setup

#### Unit Testing with Vitest
```bash
# Install testing dependencies
bun add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}))
```

#### E2E Testing with Playwright
```bash
# Install Playwright
bun add -D @playwright/test
npx playwright install
```

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'bun dev',
    port: 5173,
  },
})
```

### 6. API Development

#### Supabase Edge Functions
```bash
# Create new edge function
supabase functions new market-data-sync

# Serve functions locally
supabase functions serve

# Deploy function
supabase functions deploy market-data-sync
```

#### Local Development with Supabase
```bash
# Start all Supabase services
supabase start

# View local dashboard
# Navigate to http://localhost:54323
```

### 7. Debugging

#### Browser DevTools
- **React DevTools**: Install browser extension
- **Redux DevTools**: For state debugging (if using Redux)

#### VS Code Debugging
1. Set breakpoints in your code
2. Press F5 or use the Debug view
3. Select "Launch Chrome" configuration

#### Network Debugging
```typescript
// Add request/response logging
const debugRequest = (url: string, options: RequestInit) => {
  console.log('API Request:', { url, options });
  return fetch(url, options).then(response => {
    console.log('API Response:', { 
      url, 
      status: response.status, 
      statusText: response.statusText 
    });
    return response;
  });
};
```

### 8. Performance Monitoring

#### Bundle Analysis
```bash
# Install bundle analyzer
bun add -D rollup-plugin-visualizer

# Generate bundle report
bun run build
bun run analyze
```

Add to `vite.config.ts`:

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
    }),
  ],
})
```

#### Performance Testing
```typescript
// Component performance monitoring
import { Profiler } from 'react'

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Component render:', {
    id,
    phase,
    actualDuration,
  })
}

// Wrap components for profiling
<Profiler id="TradingChart" onRender={onRenderCallback}>
  <TradingChart />
</Profiler>
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-trading-bot

# Make changes and commit
git add .
git commit -m "feat: add momentum trading strategy"

# Push and create PR
git push origin feature/new-trading-bot
```

### 2. Code Review Process
1. Create pull request on GitHub
2. Ensure all checks pass (ESLint, tests, build)
3. Request review from team members
4. Address feedback and merge

### 3. Local Testing
```bash
# Run unit tests
bun test

# Run E2E tests
bun test:e2e

# Type checking
bun run type-check

# Linting
bun run lint

# Format code
bun run format
```

### 4. Database Changes
```bash
# Create new migration
supabase migration new add_trading_signals_table

# Apply migration
supabase db reset

# Generate types
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
bun dev --port 3000
```

#### Supabase Connection Issues
```bash
# Check Supabase status
supabase status

# Restart services
supabase stop
supabase start
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
bun install

# Regenerate types
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

#### Build Failures
```bash
# Clear build cache
rm -rf dist
rm -rf node_modules/.vite

# Reinstall dependencies
rm -rf node_modules
bun install
```

### Performance Issues
```bash
# Check bundle size
bun run build
ls -la dist/

# Analyze dependencies
bun run analyze

# Check for memory leaks
node --inspect-brk node_modules/.bin/vite dev
```

## Useful Commands

### Daily Development
```bash
# Start development server
bun dev

# Run tests in watch mode
bun test --watch

# Type check
bun run type-check

# Lint and fix
bun run lint --fix

# Format code
bun run format
```

### Database Operations
```bash
# Reset database with fresh data
supabase db reset

# Create new migration
supabase migration new migration_name

# Generate types
supabase gen types typescript --local > src/integrations/supabase/types.ts

# View database
supabase dashboard
```

### Deployment
```bash
# Build for production
bun run build

# Preview production build
bun run preview

# Deploy to Vercel
vercel --prod
```

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Community
- [CryptoMax Development Discord](https://discord.gg/cryptomax-dev)
- [GitHub Discussions](https://github.com/your-org/cryptomax-platform/discussions)
- [Stack Overflow Tag: cryptomax](https://stackoverflow.com/questions/tagged/cryptomax)

### Support
- **Internal**: Slack #dev-support channel
- **External**: dev-support@cryptomax.com.au
- **Emergency**: engineering-on-call@cryptomax.com.au

---

*This setup guide should get you productive quickly. For questions or improvements, please contribute to the documentation or reach out to the development team.*
