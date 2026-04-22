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
  /**
   * Opt-in hover treatment for cards that are themselves clickable
   * (e.g. wrapped in a <Link> or rendered as an anchor). Adds a calm
   * border + shadow lift that matches every other interactive surface
   * in the system.
   */
  interactive?: boolean;
}

export function Card({
  variant = "default",
  padded = true,
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)]",
        variants[variant],
        padded && "p-5",
        interactive &&
          "cursor-pointer transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] hover:shadow-[var(--shadow-md)] focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none",
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
