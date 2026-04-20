"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import type { BridgeDiscrepancy } from "./scrutiny-bridge-provider";
import { routeForIssue, scopeLabelKey } from "./issue-mappers";

interface Props {
  /** Application this card belongs to — used to link into /issues. */
  courseId: string;
  headline: BridgeDiscrepancy;
  /** Count of remaining open discrepancies after the headline. */
  moreCount: number;
  className?: string;
}

/**
 * Top-priority discrepancy card on the dashboard. Per §10.5, one discrepancy
 * per card — any remaining items collapse into a single "+{n} more" link.
 * Copy is bilingual by picking the locale-aware reason from the bridge.
 */
export function DiscrepancySummaryCard({ courseId, headline, moreCount, className }: Props) {
  const { t, locale } = useLocale();
  const scopeLabel = t(scopeLabelKey(headline.scope));
  const reason = locale === "hi" ? headline.reasonHi : headline.reasonEn;
  const awaiting = Boolean(headline.studentActionAt);

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border p-4",
        awaiting
          ? "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)]"
          : "border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)]",
        className,
      )}
    >
      <p
        className={cn(
          "text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide",
          awaiting ? "text-[var(--color-status-success-fg)]" : "text-[var(--color-status-danger-fg)]",
        )}
      >
        {awaiting ? t("issue.banner.awaitingReview") : t("issue.dashboard.title")}
      </p>
      <h3 className="mt-1 text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        {scopeLabel}
      </h3>
      <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-primary)]">{reason}</p>
      {!awaiting ? (
        <p className="mt-2 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
          {t("issue.banner.deadlinePrefix")}: {headline.deadline}
        </p>
      ) : (
        <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {t("issue.banner.awaitingReviewHint")}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!awaiting ? (
          <Link
            href={routeForIssue(headline)}
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
          >
            {t("issue.dashboard.fixCta")}
          </Link>
        ) : null}
        <Link
          href={`/applications/${courseId}/issues`}
          className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("issue.dashboard.viewAll")}
        </Link>
        {moreCount > 0 ? (
          <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {t("issue.dashboard.moreCount", { n: moreCount })}
          </span>
        ) : null}
      </div>
    </section>
  );
}
