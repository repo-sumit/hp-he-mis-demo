"use client";

import { cn } from "@hp-mis/ui";

export interface TabItem {
  key: string;
  label: string;
  badge?: string | number;
}

interface Props {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * Horizontal tab strip used on the application detail page. Scrolls
 * horizontally under 1024px so the queue→detail experience stays usable on
 * tablets.
 */
export function TabNav({ tabs, active, onChange, className }: Props) {
  return (
    <nav
      role="tablist"
      aria-label="Application sections"
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-[var(--color-border)]",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative inline-flex h-10 items-center gap-2 whitespace-nowrap px-4 text-[var(--text-sm)] font-[var(--weight-medium)]",
              isActive
                ? "text-[var(--color-text-brand)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge !== 0 ? (
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-background-brand-subtle)] px-1.5 py-0.5 text-[10px] font-[var(--weight-semibold)] text-[var(--color-text-brand)]">
                {tab.badge}
              </span>
            ) : null}
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 bottom-0 h-0.5 rounded-[var(--radius-pill)] bg-[var(--color-interactive-brand)]"
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
