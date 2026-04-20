"use client";

import { cn } from "@hp-mis/ui";
import { REVIEWER_COLLEGE, REVIEWER_NAME, REVIEWER_ROLE } from "../data/mock-applications";

interface Props {
  className?: string;
  /** Optional action hint line, e.g. "Signing this discrepancy as Priya Negi". */
  hint?: string;
}

/**
 * Shows who the current reviewer is — rendered on the scrutiny workbench and
 * discrepancy form so the operator sees whose name will be attached to
 * their actions in the audit log.
 */
export function ReviewerIdentityBlock({ className, hint }: Props) {
  return (
    <section
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-3",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-brand)] text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)]"
      >
        {REVIEWER_NAME.split(" ")
          .map((p) => p.charAt(0))
          .slice(0, 2)
          .join("")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {REVIEWER_NAME}
        </p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {REVIEWER_ROLE} · {REVIEWER_COLLEGE}
        </p>
        {hint ? (
          <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">{hint}</p>
        ) : null}
      </div>
    </section>
  );
}
