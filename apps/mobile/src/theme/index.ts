import { extendTheme } from "native-base";

const config = {
  useSystemColorMode: false,
  initialColorMode: "light",
};

// Ultra-simple color definitions - just change these to customize your app
const colors = {
  // Primary brand color - change this to customize your app
  primary: "#0ea5e9", // Sky Blue - clean, professional, accessible

  // Secondary color - change this to customize your app
  secondary: "#64748b", // Slate Gray - versatile, professional
};

export const theme = extendTheme({
  config,
  colors: {
    // Primary color scale
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: colors.primary,
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },

    // Secondary color scale
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: colors.secondary,
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },

    // Simple background colors - properly configured for light/dark modes
    background: {
      50: "#ffffff", // Pure white (light mode)
      100: "#fafafa", // Very light gray (light mode)
      200: "#f5f5f5", // Light gray surface (light mode)
      300: "#e5e5e5", // Medium light surface (light mode)
      400: "#d4d4d4", // Medium surface (light mode)
      500: "#a3a3a3", // Medium dark surface (light mode)
      600: "#737373", // Dark surface (light mode)
      700: "#525252", // Very dark surface (light mode)
      800: "#404040", // Almost black surface (light mode)
      900: "#262626", // Black surface (light mode)
    },

    // Simple text colors - just 2 colors
    text: {
      dark: "#171717", // Dark text (light mode)
      light: "#fafafa", // Light text (dark mode)
    },
  },

  // Component defaults for consistency
  components: {
    Button: {
      defaultProps: {
        colorScheme: "primary",
        size: "md",
        borderRadius: "lg",
      },
      variants: {
        solid: {
          _pressed: {
            opacity: 0.8,
          },
        },
      },
    },
    Text: {
      defaultProps: {
        color: "text.dark",
      },
    },
    Input: {
      defaultProps: {
        borderRadius: "lg",
        borderWidth: 1,
      },
    },
    Box: {
      defaultProps: {
        borderRadius: "lg",
      },
    },
  },

  // Typography scale
  fontSizes: {
    "2xs": 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
  },

  // Spacing scale
  space: {
    px: "1px",
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    36: 144,
    40: 160,
    44: 176,
    48: 192,
    52: 208,
    56: 224,
    60: 240,
    64: 256,
    72: 288,
    80: 320,
    96: 384,
  },

  // Border radius scale
  radii: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    "2xl": 16,
    "3xl": 24,
    full: 9999,
  },
});

// Type for the theme
export type CustomThemeType = typeof theme;

// Export the colors object for easy customization
export { colors };
