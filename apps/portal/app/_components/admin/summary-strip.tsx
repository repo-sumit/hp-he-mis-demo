"use client";

import { cn } from "@hp-mis/ui";

interface Tile {
  label: string;
  value: number | string;
  tone?: "default" | "brand" | "warning" | "success" | "danger";
  hint?: string;
}

/**
 * A KPI tile is a flat card with a 4px coloured stripe on the left edge
 * (tone-accented). This reads cleanly against the light-blue sidebar and
 * matches the governmental, data-forward tone of the Figma reference.
 */
const STRIPE: Record<NonNullable<Tile["tone"]>, string> = {
  default: "bg-[var(--color-border-strong)]",
  brand: "bg-[var(--color-interactive-primary)]",
  warning: "bg-[var(--color-interactive-success-hover)] bg-[var(--color-status-warning-fg)]",
  success: "bg-[var(--color-interactive-success)]",
  danger: "bg-[var(--color-interactive-danger)]",
};

const VALUE_TONE: Record<NonNullable<Tile["tone"]>, string> = {
  default: "text-[var(--color-text-primary)]",
  brand: "text-[var(--color-text-brand-strong)]",
  warning: "text-[var(--color-status-warning-fg)]",
  success: "text-[var(--color-status-success-fg)]",
  danger: "text-[var(--color-status-danger-fg)]",
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
      {tiles.map((tile) => {
        const tone = tile.tone ?? "default";
        return (
          <div
            key={tile.label}
            className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 pl-5 shadow-[var(--shadow-sm)]"
          >
            <span
              aria-hidden="true"
              className={cn("absolute inset-y-0 left-0 w-1.5", STRIPE[tone])}
            />
            <p className="text-[var(--text-xs)] font-[var(--weight-medium)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
              {tile.label}
            </p>
            <p className={cn("mt-1 text-[var(--text-3xl)] font-[var(--weight-bold)] tracking-[var(--tracking-tight)]", VALUE_TONE[tone])}>
              {tile.value}
            </p>
            {tile.hint ? (
              <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{tile.hint}</p>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
