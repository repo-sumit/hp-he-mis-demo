import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type Tone = "brand" | "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  brand:
    "bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]",
  neutral:
    "bg-[var(--color-background-muted)] text-[var(--color-text-secondary)]",
  success:
    "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
  warning:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]",
  danger:
    "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
  info: "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({ tone = "neutral", dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)]",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  );
}
