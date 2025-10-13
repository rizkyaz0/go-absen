/**
 * Typography System
 * 
 * Defines consistent typography styles using design tokens
 * and provides utility classes for text styling.
 */

import { designTokens } from "./design-tokens"

export const typography = {
  // Heading styles
  h1: {
    fontSize: designTokens.typography.fontSize["4xl"][0],
    lineHeight: designTokens.typography.fontSize["4xl"][1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.bold,
    letterSpacing: "-0.025em",
  },
  
  h2: {
    fontSize: designTokens.typography.fontSize["3xl"][0],
    lineHeight: designTokens.typography.fontSize["3xl"][1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.semibold,
    letterSpacing: "-0.025em",
  },
  
  h3: {
    fontSize: designTokens.typography.fontSize["2xl"][0],
    lineHeight: designTokens.typography.fontSize["2xl"][1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.semibold,
    letterSpacing: "-0.025em",
  },
  
  h4: {
    fontSize: designTokens.typography.fontSize.xl[0],
    lineHeight: designTokens.typography.fontSize.xl[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.semibold,
    letterSpacing: "-0.025em",
  },
  
  h5: {
    fontSize: designTokens.typography.fontSize.lg[0],
    lineHeight: designTokens.typography.fontSize.lg[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.semibold,
    letterSpacing: "-0.025em",
  },
  
  h6: {
    fontSize: designTokens.typography.fontSize.base[0],
    lineHeight: designTokens.typography.fontSize.base[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.semibold,
    letterSpacing: "-0.025em",
  },
  
  // Body text styles
  body: {
    fontSize: designTokens.typography.fontSize.base[0],
    lineHeight: designTokens.typography.fontSize.base[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.normal,
  },
  
  bodyLarge: {
    fontSize: designTokens.typography.fontSize.lg[0],
    lineHeight: designTokens.typography.fontSize.lg[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.normal,
  },
  
  bodySmall: {
    fontSize: designTokens.typography.fontSize.sm[0],
    lineHeight: designTokens.typography.fontSize.sm[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.normal,
  },
  
  // Caption and small text
  caption: {
    fontSize: designTokens.typography.fontSize.xs[0],
    lineHeight: designTokens.typography.fontSize.xs[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.normal,
  },
  
  // Code styles
  code: {
    fontSize: designTokens.typography.fontSize.sm[0],
    lineHeight: designTokens.typography.fontSize.sm[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.normal,
    fontFamily: designTokens.typography.fontFamily.mono.join(", "),
  },
  
  // Lead text (larger intro text)
  lead: {
    fontSize: designTokens.typography.fontSize.xl[0],
    lineHeight: designTokens.typography.fontSize.xl[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.normal,
  },
  
  // Large text
  large: {
    fontSize: designTokens.typography.fontSize.lg[0],
    lineHeight: designTokens.typography.fontSize.lg[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.normal,
  },
  
  // Small text
  small: {
    fontSize: designTokens.typography.fontSize.sm[0],
    lineHeight: designTokens.typography.fontSize.sm[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.normal,
  },
  
  // Muted text
  muted: {
    fontSize: designTokens.typography.fontSize.sm[0],
    lineHeight: designTokens.typography.fontSize.sm[1].lineHeight,
    fontWeight: designTokens.typography.fontWeight.normal,
    opacity: 0.8,
  },
} as const

// Utility function to get typography styles as CSS properties
export function getTypographyStyles(style: keyof typeof typography) {
  return typography[style]
}

// CSS class generator for typography
export function generateTypographyClasses() {
  const classes: Record<string, string> = {}
  
  Object.entries(typography).forEach(([key, styles]) => {
    const cssProperties = Object.entries(styles)
      .map(([prop, value]) => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()
        return `${cssProp}: ${value}`
      })
      .join('; ')
    
    classes[`.text-${key}`] = cssProperties
  })
  
  return classes
}

// Responsive typography utilities
export const responsiveTypography = {
  // Responsive heading that scales with screen size
  responsiveHeading: {
    base: typography.h3,
    sm: typography.h2,
    lg: typography.h1,
  },
  
  // Responsive body text
  responsiveBody: {
    base: typography.bodySmall,
    sm: typography.body,
    lg: typography.bodyLarge,
  },
  
  // Responsive caption
  responsiveCaption: {
    base: typography.caption,
    sm: typography.small,
  },
} as const

// Type exports
export type TypographyStyle = keyof typeof typography
export type ResponsiveTypographyStyle = keyof typeof responsiveTypography