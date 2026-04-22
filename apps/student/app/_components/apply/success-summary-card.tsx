"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import { formatTimestamp } from "../documents/format";

interface Props {
  applicationNumber: string;
  submittedAt: number;
  courseLabel: string;
  className?: string;
}

/**
 * Green-accented confirmation card rendered on the /submitted screen. Shows
 * the mock application number, formatted submission time, and a short "what
 * next" line; download CTAs for receipt + provisional letter are wired to
 * placeholders.
 */
export function SuccessSummaryCard({
  applicationNumber,
  submittedAt,
  courseLabel,
  className,
}: Props) {
  const { t, locale } = useLocale();
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-success)] text-[var(--color-text-on-brand)] text-lg"
        >
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-status-success-fg)]">
            {t("submitted.title")}
          </p>
          <h2 className="mt-0.5 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
            {t("submitted.subtitle", { course: courseLabel })}
          </h2>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-[var(--text-sm)]">
        <div className="flex gap-2">
          <dt className="w-[40%] text-[var(--color-text-tertiary)]">
            {t("submitted.applicationNumberLabel")}
          </dt>
          <dd className="flex-1 font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {applicationNumber}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-[40%] text-[var(--color-text-tertiary)]">
            {t("submitted.submittedAtLabel")}
          </dt>
          <dd className="flex-1 text-[var(--color-text-primary)]">
            {formatTimestamp(submittedAt, locale)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        {t("submitted.receiptNote")}
      </p>
    </section>
  );
}
