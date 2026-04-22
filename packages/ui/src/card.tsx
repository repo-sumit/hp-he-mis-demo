import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "default" | "raised" | "flat";

const variants: Record<Variant, string> = {
  default:
    "border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]",
  raised:
    "border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]",
  flat: "border border-[var(--color-border-subtle)] bg-[var(--color-surface)]",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padded?: boolean;
}

export function Card({
  variant = "default",
  padded = true,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)]",
        variants[variant],
        padded && "p-5",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]", className)}
      {...props}
    />
  );
}

/**
 * Divider line aligned with card padding — useful for splitting a card into
 * labeled sections (e.g. header / body / footer).
 */
export function CardDivider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("my-4 border-0 border-t border-[var(--color-border-subtle)]", className)}
      {...props}
    />
  );
}
