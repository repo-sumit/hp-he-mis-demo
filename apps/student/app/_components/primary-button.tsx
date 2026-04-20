"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@hp-mis/ui";

const base =
  "inline-flex h-[var(--button-height)] w-full items-center justify-center rounded-[var(--radius-md)] px-5 text-[var(--text-sm)] font-[var(--weight-semibold)] tracking-[var(--tracking-snug)] transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary:
    "bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-interactive-brand-hover)] hover:shadow-[var(--shadow-md)] active:bg-[var(--color-interactive-brand-pressed)] active:shadow-none",
  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)]",
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
