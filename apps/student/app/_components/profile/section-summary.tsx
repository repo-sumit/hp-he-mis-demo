"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

export interface SummaryRow {
  label: string;
  value: string;
}

interface Props {
  title: string;
  editHref: string;
  rows: SummaryRow[];
  className?: string;
}

/**
 * Read-only preview block used on step 5 (and anywhere else we want to show a
 * collapsed view of an earlier section with an Edit jump-link).
 */
export function SectionSummary({ title, editHref, rows, className }: Props) {
  const { t } = useLocale();
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {title}
        </p>
        <Link
          href={editHref}
          className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("profile.summary.edit")}
        </Link>
      </div>
      <dl className="mt-2 space-y-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-2 text-[var(--text-sm)]">
            <dt className="w-[42%] flex-none text-[var(--color-text-tertiary)]">{label}</dt>
            <dd
              className={cn(
                "flex-1",
                value
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-tertiary)] italic",
              )}
            >
              {value || t("profile.summary.notProvided")}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
