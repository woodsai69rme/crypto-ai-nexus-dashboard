
# Codebase Conventions - CryptoMax

## Overview
This document establishes coding standards, naming conventions, and architectural patterns for the CryptoMax platform to ensure consistency, maintainability, and team collaboration.

## General Principles

### Code Quality Standards
- **Clean Code**: Write self-documenting code with clear intent
- **DRY Principle**: Don't Repeat Yourself - extract common logic
- **SOLID Principles**: Follow object-oriented design principles
- **KISS Principle**: Keep It Simple, Stupid - prefer simple solutions

### Performance Guidelines
- Optimize for readability first, performance second
- Use React.memo() for expensive components
- Implement proper loading states and error boundaries
- Lazy load components and routes where appropriate

## File Structure

### Directory Organization
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── layout/          # Layout components
│   ├── trading/         # Trading-specific components
│   ├── portfolio/       # Portfolio management
│   ├── bots/           # AI bot components
│   ├── analytics/      # Analytics and charts
│   └── common/         # Common utility components
├── hooks/              # Custom React hooks
├── services/           # API services and integrations
├── pages/              # Page components
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── lib/                # Library configurations
└── integrations/       # External service integrations
```

### File Naming Conventions
- **Components**: PascalCase (`TradingChart.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useMarketData.ts`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase (`UserProfile.ts`)

## TypeScript Standards

### Type Definitions
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  displayName?: string;
}

// Use types for unions and computed types
type OrderStatus = 'pending' | 'filled' | 'cancelled';
type OrderWithStatus = Order & { status: OrderStatus };

// Use enums for constants with semantic meaning
enum TradingMode {
  PAPER = 'paper',
  LIVE = 'live'
}
```

### Strict Type Checking
- Enable strict mode in TypeScript
- Avoid `any` type - use `unknown` or proper types
- Use type assertions sparingly and with type guards
- Prefer type narrowing over type assertions

### Generic Constraints
```typescript
// Good: Constrained generics
interface ApiResponse<T extends Record<string, unknown>> {
  data: T;
  success: boolean;
  message?: string;
}

// Use utility types
type PartialUser = Partial<User>;
type RequiredSettings = Required<Settings>;
```

## React Component Standards

### Component Structure
```typescript
// 1. Imports (external, internal, types)
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatters';
import type { MarketData } from '@/types/market';

// 2. Types and interfaces
interface TradingCardProps {
  symbol: string;
  data: MarketData;
  onTrade?: (symbol: string) => void;
}

// 3. Component definition
export const TradingCard: React.FC<TradingCardProps> = ({
  symbol,
  data,
  onTrade
}) => {
  // 4. Hooks (state, effects, custom hooks)
  const [isLoading, setIsLoading] = useState(false);

  // 5. Event handlers
  const handleTrade = () => {
    onTrade?.(symbol);
  };

  // 6. Render
  return (
    <div className="trading-card">
      {/* JSX content */}
    </div>
  );
};
```

### Props Patterns
```typescript
// Use destructuring with default values
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children
}) => {
  // Component logic
};

// Use children prop appropriately
interface CardProps {
  title: string;
  children: React.ReactNode;
}
```

### State Management
```typescript
// Use descriptive state names
const [isSubmitting, setIsSubmitting] = useState(false);
const [errors, setErrors] = useState<ValidationError[]>([]);

// Group related state
interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

const [formState, setFormState] = useState<FormState>({
  values: {},
  errors: {},
  touched: {}
});
```

## CSS and Styling Standards

### Tailwind CSS Usage
```tsx
// Use semantic class groupings
const cardClasses = [
  // Layout
  'flex flex-col',
  // Spacing
  'p-6 gap-4',
  // Appearance
  'bg-slate-800 border border-slate-700 rounded-lg',
  // Interactive
  'hover:bg-slate-700 transition-colors'
].join(' ');

// Use conditional classes with clsx
import { clsx } from 'clsx';

const buttonClasses = clsx(
  'px-4 py-2 rounded font-medium transition-colors',
  {
    'bg-emerald-500 hover:bg-emerald-600 text-white': variant === 'primary',
    'bg-transparent border border-emerald-500 text-emerald-500': variant === 'secondary',
    'opacity-50 cursor-not-allowed': disabled
  }
);
```

### Component Styling
- Prefer Tailwind utility classes over custom CSS
- Use CSS variables for theme colors
- Create design tokens for consistent spacing and colors
- Use responsive design patterns (mobile-first)

## API and Data Handling

### Service Layer Structure
```typescript
// services/marketDataService.ts
import { supabase } from '@/integrations/supabase/client';

export interface MarketDataResponse {
  symbol: string;
  price: number;
  change24h: number;
}

export class MarketDataService {
  static async getCurrentPrices(): Promise<MarketDataResponse[]> {
    try {
      const { data, error } = await supabase
        .from('market_data_cache')
        .select('*')
        .order('market_cap_aud', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      throw error;
    }
  }
}
```

### Error Handling Patterns
```typescript
// Use Result pattern for error handling
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// Implement in services
export async function fetchUserProfile(id: string): Promise<Result<User>> {
  try {
    const user = await api.getUser(id);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### Data Validation
```typescript
// Use Zod for runtime validation
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().optional()
});

type User = z.infer<typeof UserSchema>;

// Validate API responses
export function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}
```

## Testing Standards

### Unit Testing
```typescript
// Use descriptive test names
describe('formatPrice utility', () => {
  it('should format AUD currency with 2 decimal places', () => {
    expect(formatPrice(1234.56, 'AUD')).toBe('$1,234.56');
  });

  it('should handle zero values correctly', () => {
    expect(formatPrice(0, 'AUD')).toBe('$0.00');
  });
});

// Test component behavior, not implementation
describe('TradingCard component', () => {
  it('should call onTrade when trade button is clicked', () => {
    const mockOnTrade = jest.fn();
    render(<TradingCard symbol="BTC" onTrade={mockOnTrade} />);
    
    fireEvent.click(screen.getByText('Trade'));
    expect(mockOnTrade).toHaveBeenCalledWith('BTC');
  });
});
```

### Integration Testing
- Test critical user flows end-to-end
- Mock external API calls consistently
- Use test data factories for consistent test setup
- Test error scenarios and edge cases

## Performance Standards

### React Performance
```typescript
// Use React.memo for expensive components
export const ExpensiveChart = React.memo<ChartProps>(({ data }) => {
  // Expensive rendering logic
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.data === nextProps.data;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers passed to children
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### Bundle Optimization
- Use dynamic imports for code splitting
- Implement proper lazy loading
- Minimize bundle size with tree shaking
- Optimize images and assets

## Security Standards

### Input Validation
```typescript
// Sanitize user inputs
import DOMPurify from 'dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

// Validate all form inputs
const formSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});
```

### Authentication
- Never store sensitive data in localStorage
- Use secure HTTP-only cookies when possible
- Implement proper session management
- Validate permissions on both client and server

## Documentation Standards

### Code Comments
```typescript
/**
 * Calculates the portfolio's total value in AUD
 * @param positions - Array of portfolio positions
 * @param prices - Current market prices
 * @returns Total portfolio value in AUD
 */
export function calculatePortfolioValue(
  positions: Position[],
  prices: Record<string, number>
): number {
  return positions.reduce((total, position) => {
    const currentPrice = prices[position.symbol] || 0;
    return total + (position.quantity * currentPrice);
  }, 0);
}

// Use inline comments for complex logic
const adjustedPrice = basePrice * (1 + slippage); // Account for market slippage
```

### README and Documentation
- Keep README updated with setup instructions
- Document API endpoints and data models
- Provide usage examples for complex utilities
- Maintain changelog for significant updates

## Git Workflow

### Commit Messages
```
feat: add real-time price updates to trading dashboard
fix: resolve portfolio calculation error for negative balances
docs: update API documentation for trading endpoints
refactor: extract common chart utilities to shared module
test: add unit tests for price formatting utilities
```

### Branch Naming
- `feature/trading-bot-automation`
- `fix/portfolio-calculation-bug`
- `refactor/chart-components`
- `docs/api-documentation-update`

### Pull Request Standards
- Clear title and description
- Link to relevant issues
- Include testing instructions
- Request appropriate reviewers
- Update documentation if needed

## Error Handling and Logging

### Error Boundaries
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Logging Standards
```typescript
// Use structured logging
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error: Error, data?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, { error: error.message, ...data });
  }
};

// Log important events
logger.info('User login successful', { userId: user.id });
logger.error('Failed to fetch market data', error, { symbol: 'BTC' });
```

## Accessibility Standards

### ARIA and Semantic HTML
```tsx
// Use semantic HTML elements
<main role="main">
  <section aria-labelledby="portfolio-heading">
    <h2 id="portfolio-heading">Portfolio Overview</h2>
    {/* Portfolio content */}
  </section>
</main>

// Provide ARIA labels for interactive elements
<button
  aria-label="Close trading modal"
  aria-expanded={isOpen}
  onClick={onClose}
>
  <X size={16} />
</button>
```

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Implement proper focus management
- Use skip links for navigation
- Test with screen readers

## Code Review Guidelines

### What to Look For
1. **Functionality**: Does the code work as intended?
2. **Readability**: Is the code easy to understand?
3. **Performance**: Are there any performance concerns?
4. **Security**: Are there any security vulnerabilities?
5. **Testing**: Is the code adequately tested?

### Review Checklist
- [ ] Code follows established conventions
- [ ] Types are properly defined
- [ ] Error handling is implemented
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] Tests are included and passing
- [ ] Documentation is updated

---

*This document should be reviewed and updated regularly as the codebase evolves and new patterns emerge.*
