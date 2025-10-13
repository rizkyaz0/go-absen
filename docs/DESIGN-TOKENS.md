# Design Tokens Documentation

## Overview

This document describes the design token system used in Go Absen. Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.

## Color Tokens

### Primary Colors
- `primary-50` to `primary-950`: Primary color scale
- `primary`: Default primary color
- `primary-foreground`: Text color on primary background

### Secondary Colors
- `secondary-50` to `secondary-950`: Secondary color scale
- `secondary`: Default secondary color
- `secondary-foreground`: Text color on secondary background

### Semantic Colors
- `background`: Main background color
- `foreground`: Main text color
- `card`: Card background color
- `card-foreground`: Text color on cards
- `popover`: Popover background color
- `popover-foreground`: Text color on popovers
- `muted`: Muted background color
- `muted-foreground`: Muted text color
- `accent`: Accent background color
- `accent-foreground`: Text color on accent background
- `destructive`: Destructive/danger color
- `destructive-foreground`: Text color on destructive background

### Border Colors
- `border`: Default border color
- `input`: Input border color
- `ring`: Focus ring color

### Chart Colors
- `chart-1` to `chart-5`: Chart data colors

## Typography Tokens

### Font Families
- `font-sans`: Inter, system-ui, sans-serif
- `font-mono`: JetBrains Mono, Consolas, monospace

### Font Sizes
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)
- `text-5xl`: 3rem (48px)
- `text-6xl`: 3.75rem (60px)

### Font Weights
- `font-thin`: 100
- `font-extralight`: 200
- `font-light`: 300
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700
- `font-extrabold`: 800
- `font-black`: 900

## Spacing Tokens

### Spacing Scale
- `space-0`: 0px
- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-3`: 0.75rem (12px)
- `space-4`: 1rem (16px)
- `space-5`: 1.25rem (20px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)
- `space-10`: 2.5rem (40px)
- `space-12`: 3rem (48px)
- `space-16`: 4rem (64px)
- `space-20`: 5rem (80px)
- `space-24`: 6rem (96px)
- `space-32`: 8rem (128px)

## Border Radius Tokens

- `rounded-none`: 0px
- `rounded-sm`: 0.125rem (2px)
- `rounded`: 0.25rem (4px)
- `rounded-md`: 0.375rem (6px)
- `rounded-lg`: 0.5rem (8px)
- `rounded-xl`: 0.75rem (12px)
- `rounded-2xl`: 1rem (16px)
- `rounded-3xl`: 1.5rem (24px)
- `rounded-full`: 9999px

## Shadow Tokens

- `shadow-sm`: Small shadow
- `shadow`: Default shadow
- `shadow-md`: Medium shadow
- `shadow-lg`: Large shadow
- `shadow-xl`: Extra large shadow
- `shadow-2xl`: 2x large shadow
- `shadow-inner`: Inner shadow
- `shadow-none`: No shadow

## Breakpoint Tokens

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Dark Mode

All color tokens have corresponding dark mode variants that are automatically applied when the `.dark` class is present on the root element.

## Usage

### In CSS
```css
.my-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: var(--spacing-4);
}
```

### In Tailwind CSS
```html
<div class="bg-background text-foreground border border-border rounded-lg p-4">
  Content
</div>
```

### In JavaScript/TypeScript
```typescript
import { designTokens } from '@/lib/design-tokens'

const primaryColor = designTokens.colors.primary.DEFAULT
const fontSize = designTokens.typography.fontSize.lg[0]
```

## Customization

Design tokens can be customized by modifying the values in `lib/design-tokens.ts`. Changes will automatically propagate throughout the application.

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic tokens** (e.g., `primary`, `destructive`) rather than specific color values
3. **Test in both light and dark modes** to ensure proper contrast
4. **Use the spacing scale** for consistent spacing throughout the application
5. **Follow the typography scale** for consistent text sizing

## Accessibility

All color combinations have been tested for WCAG AA compliance:
- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3:1 contrast ratio minimum
- Interactive elements: 3:1 contrast ratio minimum

## Migration Guide

When updating design tokens:

1. Update the token value in `lib/design-tokens.ts`
2. Update the corresponding CSS variables in `app/globals.css`
3. Test all components that use the token
4. Update documentation if necessary
5. Test in both light and dark modes