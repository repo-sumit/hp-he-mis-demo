"use client";

import { useState } from "react";
import { cn } from "@hp-mis/ui";

type ViewMode = "overall" | "district" | "college";

interface Props {
  lastUpdatedLabel: string;
  financialYear: string;
  initialView?: ViewMode;
}

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "overall", label: "Overall" },
  { value: "district", label: "District" },
  { value: "college", label: "College" },
];

/**
 * Lightweight filter strip rendered above the KPI grid. Non-functional
 * in the demo — the state flips visually but data isn't rescoped — it
 * exists so the admin can see the dashboard is time- and scope-aware,
 * matching the "Year / View" filters on the reference layout.
 */
export function DashboardHeader({
  lastUpdatedLabel,
  financialYear,
  initialView = "overall",
}: Props) {
  const [view, setView] = useState<ViewMode>(initialView);

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        <span
          aria-hidden="true"
          className="inline-flex h-2 w-2 rounded-full bg-[var(--color-interactive-success)]"
        />
        <span className="inline-flex items-baseline gap-1">
          <span className="font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            Last updated
          </span>
          <span className="text-[var(--color-text-primary)]">{lastUpdatedLabel}</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[var(--text-xs)] text-[var(--color-text-primary)]">
          <span className="font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            Year
          </span>
          <span className="font-[var(--weight-semibold)]">{financialYear}</span>
        </label>

        <div
          role="tablist"
          aria-label="Dashboard view"
          className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-background-muted)] p-1"
        >
          {VIEW_OPTIONS.map((opt) => {
            const active = opt.value === view;
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(opt.value)}
                className={cn(
                  "inline-flex h-8 items-center rounded-[var(--radius-pill)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] transition-colors duration-150 ease-out",
                  active
                    ? "bg-[var(--color-surface)] text-[var(--color-text-brand)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
