# Design System & Best Practices

## Overview
This document outlines the design system and best practices implemented in the AlphaOPT application.

## Best Practices Implemented

### 1. **Design Tokens (CSS Custom Properties)**
All design values are defined as CSS variables in `src/index.css`:

```css
:root {
  /* Colors, spacing, typography, etc. */
}
```

**Benefits:**
- Centralized theming
- Easy maintenance
- Consistent design language
- Dark mode support (future)
- Better performance than preprocessors

### 2. **Spacing System (8px Grid)**
Uses an 8px base grid for consistent spacing:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- And so on...

**Why 8px?**
- Most common screen sizes are divisible by 8
- Easy mental math
- Industry standard

### 3. **Typography Scale**
Modular scale with clear hierarchy:
- `--font-size-xs`: 12px
- `--font-size-sm`: 14px
- `--font-size-base`: 16px
- `--font-size-lg`: 18px
- Up to `--font-size-4xl`: 40px

**Line Heights:**
- `--line-height-tight`: 1.25 (headings)
- `--line-height-normal`: 1.5 (body)
- `--line-height-relaxed`: 1.625 (reading)
- `--line-height-loose`: 1.75 (wide)

### 4. **Accessibility (WCAG AA Compliance)**

#### Color Contrast
- Text-primary (#1a1a1a) on white: 16.1:1 (AAA)
- Text-secondary (#666) on white: 5.74:1 (AA)
- Text-tertiary (#999) on white: 2.85:1 (for non-essential text)

#### Keyboard Navigation
```css
*:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

#### Touch Targets
All interactive elements are minimum 44x44px (iOS/Android guidelines):
```css
min-height: 44px;
min-width: 44px;
```

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. **Responsive Design**

#### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

#### Mobile-First Approach
Base styles are for mobile, with `@media (max-width: 768px)` for overrides.

#### Fluid Typography
Uses `rem` units for scalability with user preferences.

### 6. **Performance**

#### CSS Optimization
- No nested selectors beyond 3 levels
- Uses CSS custom properties (faster than Sass variables)
- Minimal specificity conflicts
- No !important unless absolutely necessary

#### Animation
- Uses `transform` and `opacity` (GPU accelerated)
- Respects `prefers-reduced-motion`
- Smooth scrolling: `scroll-behavior: smooth`

### 7. **UX Patterns**

#### Interactive States
All interactive elements have:
1. **Default** state
2. **Hover** state (`:hover`)
3. **Active** state (`:active`)
4. **Focus** state (`:focus-visible`)
5. **Disabled** state (`:disabled`)

#### Transitions
- Fast: 150ms (hover effects)
- Base: 200ms (standard transitions)
- Slow: 300ms (complex animations)

#### Visual Feedback
- Buttons lift on hover (`translateY(-1px)`)
- Active states press down (`translateY(0)`)
- Loading states with animated dots
- Clear focus indicators

### 8. **Code Quality**

#### Naming Convention
- BEM-inspired but simplified
- Component-based (`.chat-interface`, `.message-content`)
- Descriptive names (`.loading-avatar`, `.regenerate-btn`)

#### Organization
```
component/
  ├── Component.js
  ├── Component.css  (styles for this component only)
  └── index.js       (optional barrel export)
```

#### Comments
CSS includes comments for:
- Touch target sizes
- Color contrast ratios
- Accessibility features
- Complex calculations

### 9. **Browser Support**

#### Modern Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

#### Progressive Enhancement
- CSS custom properties with fallbacks where needed
- Feature detection for advanced features
- Graceful degradation

### 10. **Semantic HTML**

#### Proper Elements
- `<button>` for clickable actions
- `<form>` for input submission
- `<nav>` for navigation
- `<main>` for main content
- `<section>` for content sections

#### ARIA Labels
```jsx
<button aria-label="Send message">
  <SendIcon />
</button>
```

## Design Principles

### 1. Simplicity
- Clean, uncluttered interface
- Focus on content over decoration
- Generous whitespace

### 2. Consistency
- Uniform spacing throughout
- Consistent interaction patterns
- Predictable behavior

### 3. Hierarchy
- Clear visual hierarchy
- Proper use of typography scale
- Strategic use of color and weight

### 4. Accessibility First
- Keyboard navigable
- Screen reader friendly
- High contrast
- Large touch targets

### 5. Performance
- Fast loading
- Smooth animations
- Efficient CSS
- Optimized assets

## Color Palette

### Neutral Colors
- **Text Primary**: #1a1a1a (near black)
- **Text Secondary**: #666666 (medium gray)
- **Text Tertiary**: #999999 (light gray)
- **Background Primary**: #ffffff (white)
- **Background Secondary**: #fafafa (off-white)
- **Background Tertiary**: #f5f5f5 (light gray)

### Borders
- **Subtle**: #f0f0f0 (very light)
- **Default**: #e8e8e8 (light)
- **Strong**: #d0d0d0 (medium)

### Accent Colors
- **Primary**: #1a1a1a (black)
- **Hover**: #333333 (dark gray)
- **Success**: #10b981 (green)

## Usage Examples

### Using Design Tokens
```css
.my-component {
  padding: var(--space-4);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}
```

### Creating Responsive Components
```css
.my-component {
  padding: var(--space-8);
}

@media (max-width: 768px) {
  .my-component {
    padding: var(--space-4);
  }
}
```

### Accessible Interactive Elements
```css
.my-button {
  min-height: 44px;
  min-width: 44px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.my-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.my-button:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

.my-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

## Future Improvements

1. **Dark Mode**: All tokens are ready for dark mode implementation
2. **Animations Library**: Standardized animation keyframes
3. **Component Library**: Reusable component patterns
4. **Accessibility Testing**: Automated a11y testing
5. **Performance Monitoring**: Core Web Vitals tracking

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)

