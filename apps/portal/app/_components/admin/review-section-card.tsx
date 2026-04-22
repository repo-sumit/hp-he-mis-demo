"use client";

import type { ReactNode } from "react";
import { Card, cn } from "@hp-mis/ui";

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Shared container for grouped information blocks on the detail and
 * scrutiny pages. Delegates to the shared `Card` so the radius, elevation,
 * and surface tokens stay consistent with the rest of the system.
 */
export function ReviewSectionCard({ title, description, action, children, className }: Props) {
  return (
    <Card variant="default" className={cn("p-5", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="flex-none">{action}</div> : null}
      </header>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export function KeyValue({ label, value }: { label: string; value: string }) {
  const empty = !value || value.trim() === "";
  return (
    <div className="flex flex-col gap-0.5 py-1 sm:flex-row sm:items-start sm:gap-3">
      <dt className="w-full text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)] sm:w-40 sm:flex-none">
        {label}
      </dt>
      <dd
        className={cn(
          "flex-1 break-words text-[var(--text-sm)]",
          empty ? "italic text-[var(--color-text-tertiary)]" : "text-[var(--color-text-primary)]",
        )}
      >
        {empty ? "Not provided" : value}
      </dd>
    </div>
  );
}
