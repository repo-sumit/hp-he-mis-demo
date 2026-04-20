"use client";

import { cn } from "@hp-mis/ui";

interface Props {
  reasonEn: string;
  reasonHi: string;
  deadline: string;
  className?: string;
}

/**
 * Bilingual preview of exactly what the student will see on their end. Per
 * §10.5, discrepancies are always rendered with both languages on the
 * student's dashboard — the operator sees the same thing here before they
 * click "Raise discrepancy".
 */
export function StudentMessagePreview({ reasonEn, reasonHi, deadline, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] p-4",
        className,
      )}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-brand)]">
          Student sees this
        </p>
        <span className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          EN + हिन्दी
        </span>
      </div>
      <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          Action needed · {deadline || "—"}
        </p>
        <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-primary)]">
          {reasonEn || "Add a reason above to see the student-facing English copy."}
        </p>
        <p
          lang="hi"
          className="mt-2 text-[var(--text-sm)] leading-[var(--leading-devanagari)] text-[var(--color-text-primary)]"
        >
          {reasonHi || "ऊपर कारण जोड़ें — यहाँ हिन्दी में छात्र को वही संदेश दिखेगा।"}
        </p>
      </div>
      <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        Both languages render together on the student dashboard, not a switch.
      </p>
    </section>
  );
}
