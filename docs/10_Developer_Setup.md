
# Developer Setup - CryptoMax

## Prerequisites

### Required Software
- **Node.js** v18+ (LTS recommended)
- **npm** v9+ or **yarn** v1.22+
- **Git** for version control
- **VS Code** (recommended editor)

### Optional Tools
- **Supabase CLI** for local development
- **Docker** for containerized development
- **Postman** for API testing

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd cryptomax
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create `.env.local` file in project root:
```bash
VITE_SUPABASE_URL=https://xtjowrewuuhmnvmuilcz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Database Setup
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize Supabase
supabase init

# Start local Supabase stack
supabase start

# Run migrations
supabase db reset
```

## Development Workflow

### Start Development Server
```bash
npm run dev
# or
yarn dev
```

Access the application at `http://localhost:5173`

### Available Scripts
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database
npm run db:reset     # Reset database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed test data

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Project Structure

```
cryptomax/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── common/       # Shared components
│   │   ├── trading/      # Trading features
│   │   ├── portfolio/    # Portfolio management
│   │   ├── auth/         # Authentication
│   │   └── layout/       # Layout components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── contexts/         # React contexts
│   ├── pages/            # Page components
│   └── types/            # TypeScript definitions
├── docs/                 # Documentation
├── supabase/            # Database migrations
└── tests/               # Test files
```

## Code Style & Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint Rules
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "react-refresh/only-export-components": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Component Development Guidelines

### Component Structure
```typescript
// ComponentName.tsx
import { FC } from 'react';

interface ComponentNameProps {
  // Props interface
}

export const ComponentName: FC<ComponentNameProps> = ({ 
  // props 
}) => {
  // Component logic
  
  return (
    // JSX
  );
};
```

### Custom Hooks Pattern
```typescript
// useCustomHook.ts
import { useState, useEffect } from 'react';

export const useCustomHook = (param: string) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Effect logic
  }, [param]);
  
  return { state, loading, error };
};
```

### Service Layer Pattern
```typescript
// apiService.ts
export class APIService {
  private baseURL = 'https://api.example.com';
  
  async getData(id: string) {
    try {
      const response = await fetch(`${this.baseURL}/data/${id}`);
      return response.json();
    } catch (error) {
      throw new Error('Failed to fetch data');
    }
  }
}

export const apiService = new APIService();
```

## Testing Guidelines

### Unit Testing with Vitest
```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// api.test.ts
import { describe, it, expect, vi } from 'vitest';
import { apiService } from './apiService';

describe('API Service', () => {
  it('fetches data correctly', async () => {
    const mockData = { id: '1', name: 'Test' };
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockData)
    });
    
    const result = await apiService.getData('1');
    expect(result).toEqual(mockData);
  });
});
```

## Database Development

### Migration Files
```sql
-- migrations/001_initial_schema.sql
CREATE TABLE public.example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data" 
ON public.example 
FOR ALL USING (auth.uid() = user_id);
```

### Seed Data
```sql
-- seed.sql
INSERT INTO public.example (name) VALUES 
  ('Example 1'),
  ('Example 2'),
  ('Example 3');
```

## API Integration

### Supabase Client Setup
```typescript
// supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Query Patterns
```typescript
// Data fetching
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);

// Real-time subscriptions
const subscription = supabase
  .channel('table-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'table_name'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

## Debugging & Development Tools

### Browser DevTools
- React Developer Tools
- Redux DevTools (if using Redux)
- Network tab for API debugging
- Console for error tracking

### VS Code Extensions
- TypeScript Hero
- ES7+ React/Redux snippets
- Prettier
- ESLint
- Tailwind CSS IntelliSense
- Error Lens

### Chrome Extensions
- React Developer Tools
- Redux DevTools
- Lighthouse for performance

## Performance Optimization

### Code Splitting
```typescript
// Lazy loading components
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Performance Monitoring
```typescript
// Performance timing
const startTime = performance.now();
// ... operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

#### Supabase Connection Issues
```bash
# Check Supabase status
supabase status

# Restart Supabase
supabase stop
supabase start
```

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'cryptomax:*');

// Custom debug logger
const debug = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] ${message}`, data);
  }
};
```

## Deployment Preparation

### Build Optimization
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```bash
# Production environment
VITE_SUPABASE_URL=<production_url>
VITE_SUPABASE_ANON_KEY=<production_key>
VITE_ENVIRONMENT=production
```

## Git Workflow

### Branch Naming
- `feature/feature-name`
- `bugfix/bug-description`
- `hotfix/critical-fix`
- `chore/maintenance-task`

### Commit Messages
```
feat: add new trading interface
fix: resolve portfolio calculation bug
docs: update API documentation
style: format trading components
refactor: optimize market data service
test: add portfolio tests
chore: update dependencies
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

*This developer setup guide should be your starting point for contributing to CryptoMax. Update it as the project evolves.*
