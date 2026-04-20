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
 * to actually close the loop.
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
      <div className="flex items-start gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 text-[var(--text-lg)]",
            awaiting ? "text-[var(--color-status-success-fg)]" : "text-[var(--color-text-danger)]",
          )}
        >
          {awaiting ? "✓" : "⚠"}
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
          {!awaiting ? (
            <>
              <p className="mt-1 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                {t("issue.banner.deadlinePrefix")}: {disc.deadline}
              </p>
              <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                {t("issue.banner.actionHint")}
              </p>
            </>
          ) : (
            <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {t("issue.banner.awaitingReviewHint")}
            </p>
          )}
        </div>
      </div>

      {!awaiting ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => markStudentAction(disc.applicationId, disc.id)}
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
          >
            {t("cta.markAsUpdated")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
