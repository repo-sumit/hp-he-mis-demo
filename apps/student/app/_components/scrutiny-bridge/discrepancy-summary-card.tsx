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
 * Dashboard action-required card. Rendered only when the student has at least
 * one OPEN discrepancy (see dashboard/page.tsx) — the awaiting/"sent for
 * re-check" case is intentionally not shown here because it turned into a
 * passive dead-end. The card always leads with the problem, the specific
 * reason, a deadline chip, and a targeted primary CTA that opens the exact
 * screen needed to fix it.
 */
export function DiscrepancySummaryCard({ courseId, headline, moreCount, className }: Props) {
  const { t, locale } = useLocale();
  const scopeLabel = t(scopeLabelKey(headline.scope));
  const reason = locale === "hi" ? headline.reasonHi : headline.reasonEn;

  // For document-scope issues we want one-click access to the upload screen
  // rather than a rejection-details stop along the way. Everything else
  // falls back to the general route mapping.
  const isDocumentIssue = headline.scope === "document" && Boolean(headline.targetRef);
  const ctaHref = isDocumentIssue
    ? `/documents/upload/${headline.targetRef}`
    : routeForIssue(headline);
  const ctaLabel = isDocumentIssue
    ? t("issue.dashboard.reuploadCta", {
        name: t(`document.name.${headline.targetRef}`),
      })
    : t("issue.dashboard.fixCta");

  return (
    <section
      role="alert"
      aria-live="polite"
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-text-danger)] text-[var(--text-lg)] font-[var(--weight-bold)] text-[var(--color-text-inverse)]"
        >
          !
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-status-danger-fg)]">
            {scopeLabel}
          </p>
          <h3 className="mt-0.5 text-[var(--text-lg)] font-[var(--weight-semibold)] leading-tight text-[var(--color-text-primary)]">
            {t("issue.dashboard.actionRequiredTitle")}
          </h3>
          <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-primary)]">{reason}</p>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 py-2">
        <span className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("issue.banner.deadlinePrefix")}
        </span>
        <span className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {headline.deadline}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={ctaHref}
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-interactive-brand-hover)]"
        >
          {ctaLabel}
        </Link>
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
