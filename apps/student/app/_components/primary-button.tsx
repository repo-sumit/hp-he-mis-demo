"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@hp-mis/ui";

const base =
  "inline-flex h-[var(--button-height)] w-full items-center justify-center rounded-[var(--radius-md)] px-4 text-[var(--text-base)] font-[var(--weight-semibold)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)] active:bg-[var(--color-interactive-brand-pressed)]",
  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]",
  ghost:
    "text-[var(--color-text-brand)] hover:bg-[var(--color-background-brand-subtle)]",
} as const;

type Variant = keyof typeof variants;

export function PrimaryButton({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function PrimaryLink({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={cn(base, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
