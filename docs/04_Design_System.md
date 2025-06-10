
# Design System - CryptoMax

## Overview
The CryptoMax design system provides a comprehensive set of guidelines, components, and patterns that ensure consistency across the entire platform. This system is built on modern design principles with a focus on usability, accessibility, and visual appeal.

## Design Principles

### 1. Professional & Trustworthy
- Clean, sophisticated interfaces that build user confidence
- Consistent use of professional typography and spacing
- Subtle animations that enhance rather than distract

### 2. Data-Driven
- Clear hierarchy for financial data presentation
- Effective use of color to communicate meaning (gains/losses)
- Optimized layouts for data density without clutter

### 3. Accessible & Inclusive
- WCAG 2.1 AA compliance for accessibility
- High contrast ratios for readability
- Support for keyboard navigation and screen readers

### 4. Mobile-First
- Responsive design that works across all devices
- Touch-friendly interface elements
- Optimized performance for mobile networks

## Color Palette

### Primary Colors
```css
/* Emerald - Primary brand color */
--emerald-50: #ecfdf5
--emerald-100: #d1fae5
--emerald-200: #a7f3d0
--emerald-300: #6ee7b7
--emerald-400: #34d399
--emerald-500: #10b981  /* Primary */
--emerald-600: #059669
--emerald-700: #047857
--emerald-800: #065f46
--emerald-900: #064e3b

/* Purple - Secondary accent */
--purple-50: #faf5ff
--purple-100: #f3e8ff
--purple-200: #e9d5ff
--purple-300: #d8b4fe
--purple-400: #c084fc
--purple-500: #a855f7   /* Secondary */
--purple-600: #9333ea
--purple-700: #7c3aed
--purple-800: #6b21a8
--purple-900: #581c87
```

### Neutral Colors
```css
/* Slate - Primary neutral palette */
--slate-50: #f8fafc
--slate-100: #f1f5f9
--slate-200: #e2e8f0
--slate-300: #cbd5e1
--slate-400: #94a3b8
--slate-500: #64748b
--slate-600: #475569
--slate-700: #334155
--slate-800: #1e293b   /* Dark backgrounds */
--slate-900: #0f172a   /* Darkest backgrounds */
```

### Semantic Colors
```css
/* Success - Positive values, profits */
--success-50: #f0fdf4
--success-500: #22c55e
--success-600: #16a34a

/* Danger - Negative values, losses */
--danger-50: #fef2f2
--danger-500: #ef4444
--danger-600: #dc2626

/* Warning - Caution, alerts */
--warning-50: #fffbeb
--warning-500: #f59e0b
--warning-600: #d97706

/* Info - Information, neutral alerts */
--info-50: #eff6ff
--info-500: #3b82f6
--info-600: #2563eb
```

## Typography

### Font Stack
```css
/* Primary font family */
font-family: Inter, ui-sans-serif, system-ui, sans-serif;

/* Monospace for numbers and code */
font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
```

### Type Scale
```css
/* Display text */
.text-5xl { font-size: 3rem; line-height: 1; }      /* 48px */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; } /* 36px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */

/* Headings */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }    /* 24px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; } /* 20px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */

/* Body text */
.text-base { font-size: 1rem; line-height: 1.5rem; }   /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1rem; }    /* 12px */
```

### Font Weights
```css
.font-thin { font-weight: 100; }
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
```

## Spacing System

### Spacing Scale
```css
.space-0 { margin: 0; }
.space-1 { margin: 0.25rem; }  /* 4px */
.space-2 { margin: 0.5rem; }   /* 8px */
.space-3 { margin: 0.75rem; }  /* 12px */
.space-4 { margin: 1rem; }     /* 16px */
.space-5 { margin: 1.25rem; }  /* 20px */
.space-6 { margin: 1.5rem; }   /* 24px */
.space-8 { margin: 2rem; }     /* 32px */
.space-10 { margin: 2.5rem; }  /* 40px */
.space-12 { margin: 3rem; }    /* 48px */
.space-16 { margin: 4rem; }    /* 64px */
.space-20 { margin: 5rem; }    /* 80px */
.space-24 { margin: 6rem; }    /* 96px */
```

## Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background-color: var(--emerald-500);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--emerald-600);
  transform: translateY(-1px);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: var(--emerald-500);
  border: 1px solid var(--emerald-500);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--emerald-50);
}
```

#### Button Sizes
```css
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.btn-md { padding: 0.5rem 1rem; font-size: 1rem; }
.btn-lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }
```

### Cards

#### Basic Card
```css
.card {
  background-color: var(--slate-800);
  border: 1px solid var(--slate-700);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

#### Price Card
```css
.price-card {
  background: linear-gradient(135deg, var(--slate-800), var(--slate-700));
  border: 1px solid var(--slate-600);
  border-radius: 0.75rem;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.price-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Forms

#### Input Fields
```css
.input {
  background-color: var(--slate-700);
  border: 1px solid var(--slate-600);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: white;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.input:focus {
  border-color: var(--emerald-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  outline: none;
}
```

#### Labels
```css
.label {
  color: var(--slate-300);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  display: block;
}
```

### Data Display

#### Price Display
```css
.price-positive {
  color: var(--success-500);
  font-weight: 600;
}

.price-negative {
  color: var(--danger-500);
  font-weight: 600;
}

.price-neutral {
  color: var(--slate-300);
  font-weight: 500;
}
```

#### Percentage Change
```css
.change-positive::before {
  content: '+';
  color: var(--success-500);
}

.change-negative {
  color: var(--danger-500);
}

.change-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
```

### Navigation

#### Top Navigation
```css
.nav-top {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--slate-700);
  height: 4rem;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 50;
}
```

#### Side Navigation
```css
.nav-side {
  background-color: var(--slate-800);
  border-right: 1px solid var(--slate-700);
  width: 16rem;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 4rem;
}
```

### Tables

#### Data Table
```css
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--slate-800);
  border-radius: 0.5rem;
  overflow: hidden;
}

.table th {
  background-color: var(--slate-700);
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--slate-200);
}

.table td {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--slate-700);
  color: var(--slate-300);
}

.table tr:hover {
  background-color: var(--slate-700);
}
```

## Layout System

### Container
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { padding: 0 1.5rem; }
}

@media (min-width: 1024px) {
  .container { padding: 0 2rem; }
}
```

### Grid System
```css
.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

## Responsive Breakpoints

```css
/* Mobile First Approach */
/* Default: Mobile (320px+) */

/* Small tablets */
@media (min-width: 640px) { /* sm */ }

/* Large tablets */
@media (min-width: 768px) { /* md */ }

/* Desktop */
@media (min-width: 1024px) { /* lg */ }

/* Large desktop */
@media (min-width: 1280px) { /* xl */ }

/* Extra large desktop */
@media (min-width: 1536px) { /* 2xl */ }
```

## Animation & Transitions

### Standard Transitions
```css
.transition-standard {
  transition: all 0.2s ease-in-out;
}

.transition-slow {
  transition: all 0.3s ease-in-out;
}

.transition-fast {
  transition: all 0.15s ease-in-out;
}
```

### Hover Effects
```css
.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}
```

### Loading Animations
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Accessibility Guidelines

### Color Contrast
- All text must meet WCAG 2.1 AA standards (4.5:1 ratio for normal text)
- Large text (18pt+) must meet 3:1 ratio
- Interactive elements must have 3:1 ratio for non-text content

### Focus Management
```css
.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px var(--emerald-500);
}
```

### Screen Reader Support
- Use semantic HTML elements
- Provide alt text for images
- Include ARIA labels for complex interactions
- Ensure keyboard navigation works throughout

## Dark Theme Implementation

The CryptoMax platform uses a dark theme by default, optimized for extended trading sessions and reduced eye strain.

### Background Hierarchy
```css
/* Page backgrounds */
--bg-primary: var(--slate-900);      /* Main page background */
--bg-secondary: var(--slate-800);    /* Card backgrounds */
--bg-tertiary: var(--slate-700);     /* Interactive elements */

/* Text colors */
--text-primary: #ffffff;             /* Primary text */
--text-secondary: var(--slate-300);  /* Secondary text */
--text-muted: var(--slate-500);      /* Muted text */
```

## Usage Guidelines

### Do's
- Use the established color palette consistently
- Follow the spacing system for all layouts
- Implement hover states for interactive elements
- Ensure all components are accessible
- Use semantic color meanings (green for positive, red for negative)

### Don'ts
- Don't create custom colors outside the palette
- Don't use inconsistent spacing values
- Don't ignore hover states on interactive elements
- Don't rely solely on color to convey information
- Don't use bright colors that could cause eye strain

---

*This design system is a living document that evolves with the product. All changes should be documented and communicated to the development team.*
