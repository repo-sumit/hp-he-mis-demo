"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

type Step = 1 | 2;

/**
 * Two-dot progress indicator for the preferences flow (Pick → Rank).
 * Renders the step label and a compact dot strip.
 */
export function StepProgress({ step, className }: { step: Step; className?: string }) {
  const { t } = useLocale();
  const label = step === 1 ? t("apply.step.pickLabel") : t("apply.step.rankLabel");
  const title = step === 1 ? t("apply.step.pickTitle") : t("apply.step.rankTitle");

  return (
    <section className={cn("mb-3", className)} aria-label={label}>
      <div className="flex items-baseline justify-between">
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {label}
        </p>
        <span className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-brand)]">
          {title}
        </span>
      </div>
      <div className="mt-1 flex gap-1">
        <span
          aria-hidden="true"
          className="h-1.5 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-interactive-primary)]"
        />
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 flex-1 rounded-[var(--radius-pill)]",
            step === 2 ? "bg-[var(--color-interactive-primary)]" : "bg-[var(--color-background-muted)]",
          )}
        />
      </div>
    </section>
  );
}
