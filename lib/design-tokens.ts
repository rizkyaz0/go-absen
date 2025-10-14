/**
 * Design Tokens - Shadcn/UI v3.40 + Tailwind CSS
 * 
 * This file defines all design tokens following shadcn/ui v3.40 conventions
 * and ensures consistency across light and dark modes.
 */

// Color tokens following shadcn/ui v3.40 naming convention
export const designTokens = {
  colors: {
    // Primary colors - Shadcn UI v3.40 compatible
    primary: {
      50: "hsl(210 40% 98%)",
      100: "hsl(210 40% 96%)",
      200: "hsl(214 32% 91%)",
      300: "hsl(213 27% 84%)",
      400: "hsl(215 20% 65%)",
      500: "hsl(215 16% 47%)",
      600: "hsl(215 19% 35%)",
      700: "hsl(215 25% 27%)",
      800: "hsl(217 33% 17%)",
      900: "hsl(222 84% 5%)",
      950: "hsl(229 84% 5%)",
      DEFAULT: "hsl(222.2 84% 4.9%)",
      foreground: "hsl(210 40% 98%)",
    },
    
    // Secondary colors
    secondary: {
      50: "hsl(210 40% 98%)",
      100: "hsl(210 40% 96%)",
      200: "hsl(214 32% 91%)",
      300: "hsl(213 27% 84%)",
      400: "hsl(215 20% 65%)",
      500: "hsl(215 16% 47%)",
      600: "hsl(215 19% 35%)",
      700: "hsl(215 25% 27%)",
      800: "hsl(217 33% 17%)",
      900: "hsl(222 84% 5%)",
      950: "hsl(229 84% 5%)",
      DEFAULT: "hsl(210 40% 96%)",
      foreground: "hsl(222.2 84% 4.9%)",
    },
    
    // Background colors
    background: "hsl(0 0% 100%)",
    foreground: "hsl(222.2 84% 4.9%)",
    
    // Card colors
    card: {
      DEFAULT: "hsl(0 0% 100%)",
      foreground: "hsl(222.2 84% 4.9%)",
    },
    
    // Popover colors
    popover: {
      DEFAULT: "hsl(0 0% 100%)",
      foreground: "hsl(222.2 84% 4.9%)",
    },
    
    // Muted colors
    muted: {
      DEFAULT: "hsl(210 40% 96%)",
      foreground: "hsl(215.4 16.3% 46.9%)",
    },
    
    // Accent colors
    accent: {
      DEFAULT: "hsl(210 40% 96%)",
      foreground: "hsl(222.2 84% 4.9%)",
    },
    
    // Destructive colors
    destructive: {
      DEFAULT: "hsl(0 84.2% 60.2%)",
      foreground: "hsl(210 40% 98%)",
    },
    
    // Border colors
    border: "hsl(214.3 31.8% 91.4%)",
    input: "hsl(214.3 31.8% 91.4%)",
    ring: "hsl(222.2 84% 4.9%)",
    
    // Chart colors
    chart: {
      1: "hsl(12 76% 61%)",
      2: "hsl(173 58% 39%)",
      3: "hsl(197 37% 24%)",
      4: "hsl(43 74% 66%)",
      5: "hsl(27 87% 67%)",
    },
  },
  
  // Typography scale
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "Consolas", "monospace"],
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
    },
    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
  },
  
  // Spacing scale
  spacing: {
    0: "0px",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    11: "2.75rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },
  
  // Border radius
  borderRadius: {
    none: "0px",
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
  
  // Shadows
  boxShadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    none: "none",
  },
  
  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const

// Dark mode color overrides
export const darkModeTokens = {
  colors: {
    background: "hsl(222.2 84% 4.9%)",
    foreground: "hsl(210 40% 98%)",
    
    card: {
      DEFAULT: "hsl(222.2 84% 4.9%)",
      foreground: "hsl(210 40% 98%)",
    },
    
    popover: {
      DEFAULT: "hsl(222.2 84% 4.9%)",
      foreground: "hsl(210 40% 98%)",
    },
    
    primary: {
      DEFAULT: "hsl(217.2 91.2% 59.8%)",
      foreground: "hsl(222.2 84% 4.9%)",
    },
    
    secondary: {
      DEFAULT: "hsl(217.2 32.6% 17.5%)",
      foreground: "hsl(210 40% 98%)",
    },
    
    muted: {
      DEFAULT: "hsl(217.2 32.6% 17.5%)",
      foreground: "hsl(215 20.2% 65.1%)",
    },
    
    accent: {
      DEFAULT: "hsl(217.2 32.6% 17.5%)",
      foreground: "hsl(210 40% 98%)",
    },
    
    destructive: {
      DEFAULT: "hsl(0 62.8% 30.6%)",
      foreground: "hsl(210 40% 98%)",
    },
    
    border: "hsl(217.2 32.6% 17.5%)",
    input: "hsl(217.2 32.6% 17.5%)",
    ring: "hsl(224.3 76.3% 94.1%)",
    
    chart: {
      1: "hsl(220 70% 50%)",
      2: "hsl(160 60% 45%)",
      3: "hsl(30 80% 55%)",
      4: "hsl(280 65% 60%)",
      5: "hsl(340 75% 55%)",
    },
  },
} as const

// CSS Variables generator
export function generateCSSVariables() {
  const lightVars = Object.entries(designTokens.colors).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subKey === 'DEFAULT') {
          acc[`--${key}`] = subValue
        } else {
          acc[`--${key}-${subKey}`] = subValue
        }
      })
    } else {
      acc[`--${key}`] = value
    }
    return acc
  }, {} as Record<string, string>)

  const darkVars = Object.entries(darkModeTokens.colors).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subKey === 'DEFAULT') {
          acc[`--${key}`] = subValue
        } else {
          acc[`--${key}-${subKey}`] = subValue
        }
      })
    } else {
      acc[`--${key}`] = value
    }
    return acc
  }, {} as Record<string, string>)

  return { lightVars, darkVars }
}

// Type exports
export type DesignTokens = typeof designTokens
export type DarkModeTokens = typeof darkModeTokens