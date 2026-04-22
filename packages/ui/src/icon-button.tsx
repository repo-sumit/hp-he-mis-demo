import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Tone = "brand" | "neutral" | "danger" | "success";
type Size = "sm" | "md";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Accessible label — required; never decorative. */
  label: string;
  children: ReactNode;
  tone?: Tone;
  size?: Size;
}

const tones: Record<Tone, string> = {
  brand:
    "bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]",
  neutral:
    "bg-[var(--color-background-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-subtle)] hover:text-[var(--color-text-primary)]",
  danger:
    "bg-[var(--color-interactive-danger)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-danger-hover)]",
  success:
    "bg-[var(--color-interactive-success)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-success-hover)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 w-8 text-[var(--text-sm)]",
  md: "h-10 w-10 text-[var(--text-base)]",
};

/**
 * Small square action button used in table rows (Figma references). Icon or
 * single glyph child; never text. Default shape is a rounded square with
 * the brand fill — matches the blue chips in the Sports Management table.
 */
export function IconButton({
  label,
  children,
  tone = "brand",
  size = "sm",
  className,
  type,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type ?? "button"}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex flex-none items-center justify-center rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)]",
        "transition-[background-color,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:opacity-55 disabled:cursor-not-allowed",
        tones[tone],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
