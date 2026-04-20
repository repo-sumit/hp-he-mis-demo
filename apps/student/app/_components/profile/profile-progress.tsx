"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

export type ProfileStep = 1 | 2 | 3 | 4 | 5;

const TOTAL = 5;

/**
 * Profile step header: bar + "Step N of 5" + per-step title & subtitle.
 * Consumed at the top of each /profile/step/* screen.
 */
export function ProfileProgress({
  step,
  className,
}: {
  step: ProfileStep;
  className?: string;
}) {
  const { t } = useLocale();
  const percent = Math.round((step / TOTAL) * 100);

  return (
    <section className={cn("mb-4", className)} aria-label={t("profile.header.title")}>
      <div className="flex items-baseline justify-between">
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("profile.header.progress", { step })}
        </p>
        <span className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-secondary)]">
          {percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-1 h-2 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-background-muted)]"
      >
        <div
          style={{ width: `${percent}%` }}
          className="h-full bg-[var(--color-interactive-brand)] transition-[width] duration-300"
        />
      </div>
      <h2 className="mt-4 text-[var(--text-xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
        {t(`profile.step${step}.title`)}
      </h2>
      <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t(`profile.step${step}.subtitle`)}
      </p>
    </section>
  );
}
