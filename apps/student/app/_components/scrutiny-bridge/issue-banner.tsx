"use client";

import { cn } from "@hp-mis/ui";
import type { DiscrepancyScope } from "@hp-mis/shared-mock";
import { useLocale } from "../locale-provider";
import { useScrutinyBridge, type BridgeDiscrepancy } from "./scrutiny-bridge-provider";

interface Props {
  /** Which profile scope this banner covers — personal / academic / reservation. */
  scope: DiscrepancyScope;
  /** Optional application id to filter discrepancies by. When omitted, the
   *  banner shows discrepancies for ANY application (first match wins). */
  applicationId?: string;
  className?: string;
}

/**
 * Shown at the top of a profile step when the college has flagged that step.
 * The banner stays visible but flips to "sent for re-check" after the student
 * taps "Mark as updated", giving them reassurance without needing the portal
 * to actually close the loop. Deadline sits in its own emphasised row so the
 * student doesn't miss it; a reassurance line reminds them their fee and
 * earlier work are safe.
 */
export function IssueBanner({ scope, applicationId, className }: Props) {
  const { t, locale } = useLocale();
  const { all, byScope, markStudentAction } = useScrutinyBridge();

  const candidates: BridgeDiscrepancy[] = applicationId
    ? byScope(applicationId, scope)
    : all.filter((d) => d.scope === scope);

  if (candidates.length === 0) return null;
  const disc = candidates[0];
  if (!disc) return null;

  const awaiting = Boolean(disc.studentActionAt);
  const reason = locale === "hi" ? disc.reasonHi : disc.reasonEn;

  return (
    <section
      aria-live="polite"
      className={cn(
        "mb-5 rounded-[var(--radius-lg)] border p-4",
        awaiting
          ? "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)]"
          : "border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-pill)] text-[var(--text-base)] font-[var(--weight-bold)]",
            awaiting
              ? "bg-[var(--color-interactive-success)] text-[var(--color-text-inverse)]"
              : "bg-[var(--color-text-danger)] text-[var(--color-text-inverse)]",
          )}
        >
          {awaiting ? "✓" : "!"}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide",
              awaiting
                ? "text-[var(--color-status-success-fg)]"
                : "text-[var(--color-status-danger-fg)]",
            )}
          >
            {awaiting ? t("issue.banner.awaitingReview") : t("issue.banner.title")}
          </p>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-primary)]">
            <span className="font-[var(--weight-semibold)]">
              {t("issue.banner.reasonPrefix")}:
            </span>{" "}
            {reason}
          </p>
        </div>
      </div>

      {!awaiting ? (
        <>
          <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {t("issue.banner.reassurance")}
          </p>
          <div className="mt-3 flex items-baseline gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 py-2">
            <span className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {t("issue.banner.deadlinePrefix")}
            </span>
            <span className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {disc.deadline}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 flex-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {t("issue.banner.actionHint")}
            </p>
            <button
              type="button"
              onClick={() => markStudentAction(disc.applicationId, disc.id)}
              className="inline-flex h-9 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
            >
              {t("cta.markAsUpdated")}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {t("issue.banner.awaitingReviewHint")}
        </p>
      )}
    </section>
  );
}
