
# Testing Strategy - CryptoMax

## Overview
This document outlines the comprehensive testing strategy for the CryptoMax platform, ensuring high-quality, reliable, and maintainable code through automated testing practices.

## Testing Philosophy

### Quality Assurance Goals
- **Reliability**: Ensure critical trading functions work correctly
- **Security**: Validate authentication and data protection
- **Performance**: Maintain responsive user experience
- **Usability**: Verify intuitive user interactions
- **Maintainability**: Enable confident code changes

### Testing Pyramid
```
    /\
   /  \     E2E Tests (10%)
  /____\    Integration Tests (20%)
 /______\   Unit Tests (70%)
```

## Testing Levels

### 1. Unit Testing (70%)
Test individual functions, components, and modules in isolation.

#### Tools and Frameworks
- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing
- **Vitest**: Fast unit test runner for Vite projects

#### What to Test
- Pure functions and utilities
- Component rendering and behavior
- Hook logic and state management
- API service functions
- Business logic calculations

#### Unit Testing Standards
```typescript
// utils/formatters.test.ts
import { formatPrice, formatPercentage } from './formatters';

describe('formatPrice', () => {
  it('should format AUD currency correctly', () => {
    expect(formatPrice(1234.56, 'AUD')).toBe('$1,234.56');
  });

  it('should handle zero values', () => {
    expect(formatPrice(0, 'AUD')).toBe('$0.00');
  });

  it('should handle negative values', () => {
    expect(formatPrice(-100, 'AUD')).toBe('-$100.00');
  });
});

describe('formatPercentage', () => {
  it('should format positive percentages', () => {
    expect(formatPercentage(0.1523)).toBe('+15.23%');
  });

  it('should format negative percentages', () => {
    expect(formatPercentage(-0.0842)).toBe('-8.42%');
  });
});
```

#### Component Testing
```typescript
// components/trading/TradingCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TradingCard } from './TradingCard';

const mockMarketData = {
  symbol: 'BTC',
  price: 65000,
  change24h: 2.5
};

describe('TradingCard', () => {
  it('renders market data correctly', () => {
    render(<TradingCard data={mockMarketData} />);
    
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('$65,000.00')).toBeInTheDocument();
    expect(screen.getByText('+2.50%')).toBeInTheDocument();
  });

  it('calls onTrade when trade button is clicked', () => {
    const mockOnTrade = jest.fn();
    render(<TradingCard data={mockMarketData} onTrade={mockOnTrade} />);
    
    fireEvent.click(screen.getByText('Trade'));
    expect(mockOnTrade).toHaveBeenCalledWith('BTC');
  });

  it('shows loading state when data is fetching', () => {
    render(<TradingCard data={mockMarketData} isLoading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing (20%)
Test interactions between multiple components and services.

#### What to Test
- API integrations and data flow
- Component interactions and state sharing
- Authentication flows
- Real-time data updates
- Database operations (with test database)

#### Integration Test Examples
```typescript
// services/marketDataService.test.ts
import { MarketDataService } from './marketDataService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
jest.mock('@/integrations/supabase/client');

describe('MarketDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch current prices successfully', async () => {
    const mockData = [
      { symbol: 'BTC', price_aud: 65000, change_24h: 2.5 }
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      })
    });

    const result = await MarketDataService.getCurrentPrices();
    expect(result).toEqual(mockData);
  });

  it('should handle API errors gracefully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'API Error' }
        })
      })
    });

    await expect(MarketDataService.getCurrentPrices()).rejects.toThrow('API Error');
  });
});
```

#### Component Integration Testing
```typescript
// pages/TradingDashboard.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TradingDashboard } from './TradingDashboard';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

describe('TradingDashboard Integration', () => {
  it('loads and displays market data', async () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <TradingDashboard />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByText('ETH')).toBeInTheDocument();
    });
  });
});
```

### 3. End-to-End Testing (10%)
Test complete user workflows across the entire application.

#### Tools
- **Playwright**: Modern E2E testing framework
- **Cypress**: Alternative E2E testing solution

#### Critical E2E Test Scenarios
1. **User Registration and Login**
2. **Portfolio Creation and Management**
3. **Trading Operations (Paper Trading)**
4. **AI Bot Configuration and Monitoring**
5. **Price Alert Creation and Triggering**

#### E2E Test Examples
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can register and login', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/auth');
    await page.click('[data-testid="signup-tab"]');

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');
    
    // Submit registration
    await page.click('[data-testid="signup-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

```typescript
// e2e/trading.spec.ts
test.describe('Trading Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/');
  });

  test('user can place a paper trade order', async ({ page }) => {
    // Navigate to trading interface
    await page.click('[data-testid="btc-trade-button"]');
    
    // Fill order form
    await page.fill('[data-testid="quantity-input"]', '0.01');
    await page.click('[data-testid="buy-button"]');
    
    // Confirm order
    await page.click('[data-testid="confirm-order-button"]');
    
    // Verify order confirmation
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
  });
});
```

## Test Data Management

### Test Database Setup
```sql
-- Create test database schema
CREATE SCHEMA IF NOT EXISTS test;

-- Use separate test tables
CREATE TABLE test.users AS SELECT * FROM public.users WHERE false;
CREATE TABLE test.portfolios AS SELECT * FROM public.portfolios WHERE false;
CREATE TABLE test.orders AS SELECT * FROM public.orders WHERE false;
```

### Data Factories
```typescript
// __tests__/factories/userFactory.ts
export const createTestUser = (overrides = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date(),
  ...overrides
});

export const createTestPortfolio = (overrides = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440001',
  userId: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Portfolio',
  mode: 'paper',
  totalValue: 10000,
  ...overrides
});
```

### Mock Data
```typescript
// __tests__/mocks/marketData.ts
export const mockMarketData = [
  {
    symbol: 'BTC',
    price_aud: 65000,
    change_24h: 2.5,
    volume_24h_aud: 1500000000,
    market_cap_aud: 1275000000000
  },
  {
    symbol: 'ETH',
    price_aud: 4200,
    change_24h: -1.2,
    volume_24h_aud: 800000000,
    market_cap_aud: 505000000000
  }
];
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/main.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Setup
```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

## Continuous Integration Testing

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance Testing

### Load Testing
```typescript
// performance/loadTest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '20s', target: 0 },
  ],
};

export default function () {
  let response = http.get('https://api.cryptomax.com.au/market-data');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### Lighthouse Testing
```javascript
// performance/lighthouse.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {logLevel: 'info', output: 'html', port: chrome.port};
  const runnerResult = await lighthouse('http://localhost:3000', options);

  console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);
  
  await chrome.kill();
}

runLighthouse();
```

## Testing Best Practices

### Test Organization
1. **Arrange-Act-Assert Pattern**
   ```typescript
   test('should calculate portfolio value correctly', () => {
     // Arrange
     const positions = [{ symbol: 'BTC', quantity: 0.1 }];
     const prices = { BTC: 65000 };
     
     // Act
     const result = calculatePortfolioValue(positions, prices);
     
     // Assert
     expect(result).toBe(6500);
   });
   ```

2. **Test Naming Conventions**
   - Use descriptive test names
   - Start with "should" for behavior testing
   - Include the scenario being tested

3. **Test Independence**
   - Each test should be independent
   - Use setup/teardown for common operations
   - Avoid test interdependencies

### Code Coverage Goals
- **Critical Paths**: 95%+ coverage (authentication, trading, payments)
- **Business Logic**: 90%+ coverage (calculations, validations)
- **UI Components**: 80%+ coverage (rendering, interactions)
- **Utilities**: 95%+ coverage (pure functions)

### Test Maintenance
- Review and update tests with code changes
- Remove obsolete tests
- Refactor test code for maintainability
- Keep test data fresh and relevant

## Security Testing

### Authentication Testing
```typescript
// __tests__/security/auth.test.ts
describe('Authentication Security', () => {
  it('should reject weak passwords', () => {
    expect(validatePassword('123456')).toBe(false);
    expect(validatePassword('password')).toBe(false);
    expect(validatePassword('Password123!')).toBe(true);
  });

  it('should sanitize user inputs', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    expect(sanitizeInput(maliciousInput)).not.toContain('<script>');
  });
});
```

### API Security Testing
- Test for SQL injection vulnerabilities
- Validate input sanitization
- Check authorization and access controls
- Test rate limiting and abuse prevention

## Monitoring and Alerting

### Test Metrics Tracking
- Test execution time trends
- Code coverage over time
- Test failure rates
- Performance regression detection

### Error Tracking
- Integrate with error monitoring services
- Track test failures in CI/CD pipeline
- Alert on critical test failures
- Monitor performance degradation

---

*This testing strategy should be reviewed and updated regularly to ensure it meets the evolving needs of the CryptoMax platform.*
