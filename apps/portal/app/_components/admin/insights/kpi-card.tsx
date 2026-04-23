"use client";

import type { ReactNode } from "react";
import { cn } from "@hp-mis/ui";

export type KPITone = "brand" | "success" | "warning" | "danger" | "neutral";
type TrendDirection = "up" | "down" | "neutral";

export interface KPICardProps {
  label: ReactNode;
  value: ReactNode;
  /** Small visual icon in a circle at the top-right. */
  icon?: ReactNode;
  /** Tone drives the bottom accent stripe + icon chip color. */
  tone?: KPITone;
  /** Secondary line under the value. Rendered in muted text. */
  context?: ReactNode;
  /** Directional trend chip. Colour can diverge from `tone` via `trend.tone`. */
  trend?: {
    label: ReactNode;
    direction?: TrendDirection;
    tone?: KPITone;
  };
}

const STRIPE: Record<KPITone, string> = {
  brand: "bg-[var(--color-interactive-primary)]",
  success: "bg-[var(--color-interactive-success)]",
  warning: "bg-[var(--color-status-warning-fg)]",
  danger: "bg-[var(--color-interactive-danger)]",
  neutral: "bg-[var(--color-border-strong)]",
};

const ICON_CHIP: Record<KPITone, string> = {
  brand: "bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]",
  success: "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
  warning: "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]",
  danger: "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
  neutral: "bg-[var(--color-background-muted)] text-[var(--color-text-secondary)]",
};

const TREND_TEXT: Record<KPITone, string> = {
  brand: "text-[var(--color-text-brand)]",
  success: "text-[var(--color-status-success-fg)]",
  warning: "text-[var(--color-status-warning-fg)]",
  danger: "text-[var(--color-status-danger-fg)]",
  neutral: "text-[var(--color-text-secondary)]",
};

const TREND_GLYPH: Record<TrendDirection, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

/**
 * Executive KPI tile used on the State Admin command center. Matches the
 * page-1 layout of the "Higher Education Command Center" reference —
 * label + icon / big number / coloured trend line / muted context.
 */
export function KPICard({ label, value, icon, tone = "neutral", context, trend }: KPICardProps) {
  const trendTone = trend?.tone ?? tone;
  return (
    <article className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow duration-150 ease-out hover:shadow-[var(--shadow-md)]">
      <header className="flex items-start justify-between gap-3">
        <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-secondary)]">
          {label}
        </p>
        {icon ? (
          <span
            aria-hidden="true"
            className={cn(
              "flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-pill)] text-[var(--text-base)]",
              ICON_CHIP[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </header>
      <p className="mt-3 text-[var(--text-3xl)] font-[var(--weight-bold)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)] sm:text-[var(--text-4xl)]">
        {value}
      </p>
      {trend ? (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-[var(--text-xs)] font-[var(--weight-semibold)]",
            TREND_TEXT[trendTone],
          )}
        >
          {trend.direction ? (
            <span aria-hidden="true">{TREND_GLYPH[trend.direction]}</span>
          ) : null}
          {trend.label}
        </p>
      ) : null}
      {context ? (
        <p
          className={cn(
            "text-[var(--text-xs)] text-[var(--color-text-tertiary)]",
            trend ? "mt-1" : "mt-2",
          )}
        >
          {context}
        </p>
      ) : null}
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 bottom-0 h-1", STRIPE[tone])}
      />
    </article>
  );
}
