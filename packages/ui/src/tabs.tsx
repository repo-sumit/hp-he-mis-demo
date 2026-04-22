"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

export interface Tab<V extends string = string> {
  value: V;
  label: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<V extends string = string> {
  tabs: readonly Tab<V>[];
  value: V;
  onChange: (next: V) => void;
  /** Tone of the active indicator — "underline" is the Figma default. */
  variant?: "underline" | "pill";
  className?: string;
  ariaLabel?: string;
}

/**
 * Horizontal tabs. "underline" is the Figma default (Sports Management:
 * Individual / Team / Leaderboard). "pill" is available for secondary
 * segmented contexts (filter chips, role switcher).
 */
export function Tabs<V extends string = string>({
  tabs,
  value,
  onChange,
  variant = "underline",
  className,
  ariaLabel,
}: TabsProps<V>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        variant === "underline"
          ? "flex items-stretch gap-1 border-b border-[var(--color-border)] overflow-x-auto"
          : "inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-background-muted)] p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={active}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap transition-colors",
              variant === "underline"
                ? cn(
                    "-mb-px h-10 border-b-2 px-4 text-[var(--text-sm)] font-[var(--weight-semibold)]",
                    active
                      ? "border-[var(--color-interactive-primary)] text-[var(--color-text-brand)]"
                      : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                    tab.disabled && "cursor-not-allowed opacity-55",
                  )
                : cn(
                    "h-9 rounded-[var(--radius-pill)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)]",
                    active
                      ? "bg-[var(--color-surface)] text-[var(--color-text-brand)] shadow-[var(--shadow-sm)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                    tab.disabled && "cursor-not-allowed opacity-55",
                  ),
            )}
          >
            <span>{tab.label}</span>
            {tab.badge ? <span className="inline-flex">{tab.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
