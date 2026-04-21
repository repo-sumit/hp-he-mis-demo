"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

interface Props {
  title: string;
  /**
   * Path to the editor (e.g. "/profile/step/1", "/profile/step/4"). The card
   * appends `?from=review&courseId=<courseId>` when `courseId` is set so
   * the target page can bounce back to the review after saving.
   */
  editHref: string;
  /** Course id attached to the edit link — lets the step page return here. */
  courseId?: string;
  children: ReactNode;
  className?: string;
}

function withReviewReturn(href: string, courseId: string | undefined): string {
  if (!courseId) return href;
  // Preserve any existing query (unusual here, but safe).
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}from=review&courseId=${encodeURIComponent(courseId)}`;
}

/**
 * Standard container for a review section — title + Edit link on the right,
 * free-form content below. Used for profile / academic / claims / documents /
 * preferences blocks on the review screen.
 */
export function ReviewSectionCard({ title, editHref, courseId, children, className }: Props) {
  const { t } = useLocale();
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {title}
        </h3>
        <Link
          href={withReviewReturn(editHref, courseId)}
          className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("cta.edit")}
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * Tiny key/value row helper paired with ReviewSectionCard.
 */
export function SummaryRow({ label, value }: { label: string; value: string }) {
  const { t } = useLocale();
  const empty = !value.trim();
  return (
    <div className="flex gap-2 py-1 text-[var(--text-sm)]">
      <dt className="w-[42%] flex-none text-[var(--color-text-tertiary)]">{label}</dt>
      <dd
        className={cn(
          "flex-1 break-words",
          empty ? "italic text-[var(--color-text-tertiary)]" : "text-[var(--color-text-primary)]",
        )}
      >
        {empty ? t("review.notProvided") : value}
      </dd>
    </div>
  );
}
