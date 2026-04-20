/**
 * TypeScript-accessible snapshot of the HP MIS design tokens.
 * The CSS in `./tokens.css` is the source of truth at runtime; these
 * constants exist so non-styled code (charts, canvas, server rendering)
 * can reference the same values.
 */

export const colors = {
  primary: {
    50: "#eff4ff",
    100: "#dbe5ff",
    200: "#bacfff",
    300: "#8aafff",
    400: "#5a85ff",
    500: "#3360f5",
    600: "#1f45d8",
    700: "#1b36ae",
    800: "#1c2f88",
    900: "#0b1d48",
    950: "#070f2b",
  },
  neutral: {
    0: "#ffffff",
    50: "#f7f8fa",
    100: "#eef0f4",
    200: "#dfe3ea",
    300: "#c4cad4",
    400: "#9aa2b1",
    500: "#6d7686",
    600: "#4c5567",
    700: "#343c4f",
    800: "#212838",
    900: "#121826",
    950: "#080c16",
  },
  success: { 100: "#dcfce7", 500: "#22c55e", 700: "#15803d" },
  warning: { 100: "#fef3c7", 500: "#f59e0b", 700: "#b45309" },
  danger: { 100: "#fee2e2", 500: "#ef4444", 700: "#b91c1c" },
  info: { 100: "#dbeafe", 500: "#3b82f6", 700: "#1d4ed8" },
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
  buttonHeight: 48,
  inputHeight: 56,
  mobileMax: 430,
} as const;

export type Colors = typeof colors;
export type Radii = typeof radii;
export type Spacing = typeof spacing;
