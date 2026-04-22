"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

interface Props {
  total: number;
  eligible: number;
  conditional: number;
  notEligible: number;
  className?: string;
}

/**
 * Three-pill summary above the results list. Counts reflect the *un-filtered*
 * results so the user always sees how their profile maps to the full catalog.
 */
export function SummaryHeader({
  total,
  eligible,
  conditional,
  notEligible,
  className,
}: Props) {
  const { t } = useLocale();

  const pills: Array<{ count: number; label: string; tone: string }> = [
    {
      count: eligible,
      label: t("discover.summary.eligible", { n: eligible }),
      tone:
        "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)] border-transparent",
    },
    {
      count: conditional,
      label: t("discover.summary.conditional", { n: conditional }),
      tone:
        "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)] border-transparent",
    },
    {
      count: notEligible,
      label: t("discover.summary.notEligible", { n: notEligible }),
      tone:
        "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)] border-transparent",
    },
  ];

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4",
        className,
      )}
    >
      <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        {t("discover.summary.total", { n: total })}
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {pills.map((pill) => (
          <li
            key={pill.label}
            className={cn(
              "rounded-[var(--radius-pill)] border px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-medium)]",
              pill.tone,
            )}
          >
            {pill.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
