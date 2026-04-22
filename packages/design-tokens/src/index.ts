/**
 * TypeScript-accessible snapshot of the HP MIS design tokens.
 * The CSS in `./tokens.css` is the source of truth at runtime; these
 * constants exist so non-styled code (charts, canvas, server rendering)
 * can reference the same values.
 */

export const colors = {
  primary: {
    50: "#e8f3fd",
    100: "#d0e6fb",
    200: "#a6d0f5",
    300: "#73b3ee",
    400: "#4597e6",
    500: "#1f88de",
    600: "#1976d2",
    700: "#1565c0",
    800: "#0f4fa0",
    900: "#0b3a80",
    950: "#06265a",
  },
  neutral: {
    0: "#ffffff",
    50: "#f6f8fb",
    100: "#ebedf1",
    200: "#dbdee5",
    300: "#bec2cc",
    400: "#9499a4",
    500: "#6a707d",
    600: "#4e535f",
    700: "#373b44",
    800: "#24272e",
    900: "#14161b",
    950: "#0a0b0e",
  },
  success: { 100: "#ceead6", 500: "#34a853", 700: "#1e7a38" },
  warning: { 100: "#ffe6bf", 500: "#f4a017", 700: "#9a6306" },
  danger: { 100: "#fbd1ce", 500: "#ea4335", 700: "#b3261e" },
  info: { 100: "#c5e2fb", 500: "#1e88e5", 700: "#1565c0" },
} as const;

export const radii = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  pill: "9999px",
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

export const layout = {
  tapTargetMin: 44,
  buttonHeight: 44,
  inputHeight: 48,
  mobileMax: 430,
  sidebarWidth: 240,
  headerHeight: 64,
} as const;

export type Colors = typeof colors;
export type Radii = typeof radii;
export type Spacing = typeof spacing;
