import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-[var(--radius-md)] font-[var(--weight-semibold)] " +
  "transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)] active:bg-[var(--color-interactive-brand-pressed)]",
  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]",
  ghost:
    "text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-[var(--text-sm)]",
  lg: "h-[var(--button-height)] px-6 text-[var(--text-base)]",
};

export function Button({
  variant = "primary",
  size = "lg",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}
