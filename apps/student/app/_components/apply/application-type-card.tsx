"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import { getCourse, type Course } from "../discover/mock-data";
import { feeFor, maxPreferencesFor } from "./rules";

interface Props {
  courseId: string;
  /** Number of eligible + conditional candidates for this student. */
  optionCount: number;
  /** Number of preferences already saved in the draft. */
  selectedCount: number;
}

export function ApplicationTypeCard({ courseId, optionCount, selectedCount }: Props) {
  const { t } = useLocale();
  const course: Course | undefined = getCourse(courseId);
  if (!course) return null;

  const applicable = optionCount > 0;
  const fee = feeFor(courseId);
  const max = maxPreferencesFor(courseId);
  const hasDraft = selectedCount > 0;

  return (
    <article
      className={cn(
        "rounded-[var(--radius-lg)] border p-4",
        applicable
          ? "border-[var(--color-border)] bg-[var(--color-surface)]"
          : "border-[var(--color-border)] bg-[var(--color-background-subtle)] opacity-80",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {course.code}
          </p>
          <h3 className="mt-0.5 text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t(course.nameKey)}
          </h3>
        </div>
        {hasDraft ? (
          <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-info-bg)] px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-status-info-fg)]">
            {t("apply.hub.selectedCount", { n: selectedCount })}
          </span>
        ) : null}
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        <div>
          {applicable
            ? t("apply.hub.eligibleCount", { n: optionCount })
            : t("apply.hub.noneEligible")}
        </div>
        <div>{t("apply.hub.fee", { amount: fee })}</div>
        <div>{t("apply.hub.maxPreferences", { n: max })}</div>
      </dl>

      {applicable ? (
        <div className="mt-3">
          <Link
            href={hasDraft ? `/apply/${courseId}/rank` : `/apply/${courseId}/preferences`}
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-primary)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)] hover:bg-[var(--color-interactive-primary-hover)]"
          >
            {hasDraft ? t("cta.continue") : t("cta.startApplication")}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
