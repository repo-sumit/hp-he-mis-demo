import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";
type Size = "sm" | "md" | "lg";
type Shape = "pill" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  shape?: Shape;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-[var(--weight-semibold)] " +
  "tracking-[var(--tracking-snug)] transition-[background-color,box-shadow,border-color,color] " +
  "duration-150 select-none focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] " +
  "disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<Variant, string> = {
  // Primary button — design system §Buttons (verified): bg =
  // color/interactive/primary, text = color/text/onBrand. Aliased to HP's
  // sky-blue primitive so the product identity stays HP Admission, not
  // SwiftChat, while the token names match the system vocabulary.
  primary:
    "bg-[var(--color-interactive-primary)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)] " +
    "hover:bg-[var(--color-interactive-primary-hover)] hover:shadow-[var(--shadow-md)] " +
    "active:bg-[var(--color-interactive-primary-active)] active:shadow-none",
  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] " +
    "hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] " +
    "hover:text-[var(--color-text-brand)]",
  ghost:
    "text-[var(--color-text-brand)] hover:bg-[var(--color-background-brand-subtle)]",
  danger:
    "bg-[var(--color-interactive-danger)] text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)] " +
    "hover:bg-[var(--color-interactive-danger-hover)] hover:shadow-[var(--shadow-md)] " +
    "focus-visible:shadow-[var(--focus-ring-danger)]",
  success:
    "bg-[var(--color-interactive-success)] text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)] " +
    "hover:bg-[var(--color-interactive-success-hover)] hover:shadow-[var(--shadow-md)]",
  warning:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)] border border-[var(--color-status-warning-fg)] " +
    "hover:bg-[var(--color-status-warning-fg)] hover:text-[var(--color-text-inverse)]",
};

const sizes: Record<Size, string> = {
  sm: "h-[var(--button-height-sm)] px-4 text-[var(--text-xs)]",
  md: "h-[var(--button-height)] px-5 text-[var(--text-sm)]",
  lg: "h-12 px-6 text-[var(--text-base)]",
};

const shapes: Record<Shape, string> = {
  pill: "rounded-[var(--radius-pill)]",
  md: "rounded-[var(--radius-md)]",
};

export function Button({
  variant = "primary",
  size = "md",
  shape = "pill",
  fullWidth,
  className,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        shapes[shape],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
