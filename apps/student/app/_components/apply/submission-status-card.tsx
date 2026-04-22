"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

interface Props {
  className?: string;
}

/**
 * Reassuring loading panel shown on the /apply/[courseId]/submit route while
 * the (simulated) submission is processed. Kept deliberately calm — no scary
 * spinner colours, no error copy here.
 */
export function SubmissionStatusCard({ className }: Props) {
  const { t } = useLocale();
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] p-5 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-interactive-primary)] border-t-transparent"
      />
      <p className="mt-3 text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        {t("submit.title")}
      </p>
      <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("submit.body")}
      </p>
      <p className="mt-3 text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
        {t("submit.processing")}
      </p>
    </section>
  );
}
