"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import type { ActionSeverity, PriorityAction } from "./insights-data";

interface Props {
  actions: readonly PriorityAction[];
}

const SEVERITY_GLYPH: Record<ActionSeverity, string> = {
  critical: "🔥",
  warning: "⚠",
  info: "●",
};

const SEVERITY_CLASS: Record<ActionSeverity, string> = {
  critical:
    "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
  warning:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]",
  info: "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]",
};

/**
 * Priority Actions Today — compact ribbon that sits directly below the
 * executive KPI strip. Surfaces the top three items the State Admin
 * should act on, ordered by severity, each with a direct route out.
 */
export function PriorityActions({ actions }: Props) {
  if (actions.length === 0) return null;
  return (
    <section
      aria-label="Priority actions today"
      className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-background-brand-softer)] px-5 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-[var(--text-base)]">
            🔥
          </span>
          <h3 className="text-[var(--text-sm)] font-[var(--weight-bold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-primary)]">
            Priority actions today
          </h3>
        </div>
        <span className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {actions.length} to review
        </span>
      </div>
      <ol className="grid grid-cols-1 gap-0 divide-y divide-[var(--color-border-subtle)] md:grid-cols-3 md:divide-x md:divide-y-0">
        {actions.map((action, i) => (
          <li key={action.id} className="min-w-0">
            <Link
              href={action.href}
              className="group flex h-full items-start gap-3 px-5 py-4 transition-colors duration-150 ease-out hover:bg-[var(--color-background-brand-softer)] focus-visible:bg-[var(--color-background-brand-softer)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-pill)] text-[var(--text-sm)] font-[var(--weight-bold)]",
                  SEVERITY_CLASS[action.severity],
                )}
              >
                {SEVERITY_GLYPH[action.severity]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="text-[var(--text-2xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {action.title}
                  </span>
                </span>
                <span className="mt-1 block text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                  {action.context}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="flex-none text-[var(--color-text-tertiary)] transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--color-text-brand)]"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
