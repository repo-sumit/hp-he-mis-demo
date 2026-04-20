"use client";

import { cn } from "@hp-mis/ui";

interface Tile {
  label: string;
  value: number | string;
  tone?: "default" | "brand" | "warning" | "success" | "danger";
}

const TONE: Record<NonNullable<Tile["tone"]>, string> = {
  default: "border-[var(--color-border)] bg-[var(--color-surface)]",
  brand:
    "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]",
  warning:
    "border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]",
  success:
    "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
  danger:
    "border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
};

/**
 * Compact KPI strip used above the queue and detail pages. Four tiles wide on
 * desktop, wraps to 2 on tablet, 1 on mobile.
 */
export function SummaryStrip({ tiles, className }: { tiles: Tile[]; className?: string }) {
  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={cn(
            "rounded-[var(--radius-lg)] border p-4",
            TONE[tile.tone ?? "default"],
          )}
        >
          <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {tile.label}
          </p>
          <p className="mt-1 text-[var(--text-3xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
            {tile.value}
          </p>
        </div>
      ))}
    </section>
  );
}
