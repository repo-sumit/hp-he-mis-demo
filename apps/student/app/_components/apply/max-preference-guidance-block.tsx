"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

interface Props {
  courseLabel: string;
  max: number;
  current: number;
  className?: string;
}

/**
 * Persistent "you can add up to {n}" reminder used on both the preferences
 * pick screen and the ranking screen. Also surfaces the minimum rule and
 * progresses visually as the student fills up their list.
 */
export function MaxPreferenceGuidanceBlock({ courseLabel, max, current, className }: Props) {
  const { t } = useLocale();
  const pct = Math.min(100, Math.round((current / Math.max(max, 1)) * 100));

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4",
        className,
      )}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {t("apply.maxGuidance.title")}
        </p>
        <span className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-secondary)]">
          {current} / {max}
        </span>
      </div>
      <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("apply.maxGuidance.limit", { course: courseLabel, max })}
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-background-muted)]">
        <div
          style={{ width: `${pct}%` }}
          className="h-full bg-[var(--color-interactive-primary)] transition-[width] duration-200"
        />
      </div>
      <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        {t("apply.maxGuidance.min")}
      </p>
    </section>
  );
}
