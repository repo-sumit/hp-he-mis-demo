"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import type { Readiness } from "./readiness";

interface Props {
  readiness: Readiness;
  /** Course id threads through every targeted Edit link so the step pages
   *  know which review to bounce back to. */
  courseId: string;
  className?: string;
}

type PendingRow = {
  key: string;
  message: string;
  editHref: string;
};

/**
 * Readiness summary shown on the review screen.
 *
 * When all three gates pass, renders a success confirmation card.
 * When something is missing, renders one row per specific missing item with
 * a targeted Edit link that deep-links into the right section and scrolls
 * to the right field. "A few things are still pending" → gone.
 */
export function ReadinessChecklist({ readiness, courseId, className }: Props) {
  const { t } = useLocale();

  if (readiness.canSubmit) {
    return (
      <section
        className={cn(
          "rounded-[var(--radius-lg)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] p-4",
          className,
        )}
      >
        <p className="flex items-center gap-2 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-status-success-fg)]">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-interactive-success)] text-[var(--color-text-on-brand)]"
          >
            ✓
          </span>
          {t("readiness.allGoodTitle")}
        </p>
        <p className="mt-1 pl-7 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {t("readiness.allGoodHint")}
        </p>
      </section>
    );
  }

  const rows: PendingRow[] = [];

  // 1. One row per missing profile field — with the exact field name and
  //    a deep link to the step + focus anchor.
  for (const field of readiness.profile.missingFields) {
    rows.push({
      key: `profile:${field.key}`,
      message: t(field.labelKey),
      editHref: `/profile/step/${field.step}?from=review&courseId=${courseId}&focus=${field.focus}`,
    });
  }

  // 2. One row per missing required document.
  for (const item of readiness.documents.missingItems) {
    rows.push({
      key: `doc:${item.rule.code}`,
      message: t("readiness.documents.missingItem", {
        name: t(`document.name.${item.rule.code}`),
      }),
      editHref: `/documents/upload/${item.rule.code}`,
    });
  }

  // 3. Preferences row — only one, worded for the current count.
  if (!readiness.preferences.ok) {
    rows.push({
      key: "preferences",
      message: t("readiness.preferences.missing"),
      editHref: `/apply/${courseId}/preferences`,
    });
  }

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] p-4",
        className,
      )}
    >
      <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        {t("readiness.blockedTitle")}
      </p>
      <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        {t("readiness.blockedHint")}
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-start gap-2 text-[var(--text-sm)]">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[var(--color-text-danger)] text-[var(--text-xs)] font-[var(--weight-bold)] text-[var(--color-text-on-brand)]"
            >
              !
            </span>
            <span className="flex-1 text-[var(--color-text-primary)]">{row.message}</span>
            <Link
              href={row.editHref}
              className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-link)]"
            >
              {t("cta.edit")}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
