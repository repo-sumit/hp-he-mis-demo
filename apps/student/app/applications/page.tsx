"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@hp-mis/ui";
import type { AppBaseStatus } from "@hp-mis/shared-mock";
import { PageShell } from "../_components/page-shell";
import { BottomTabBar } from "../_components/bottom-tab-bar";
import { useLocale } from "../_components/locale-provider";
import { getCourse } from "../_components/discover/mock-data";
import { useApplications } from "../_components/apply/applications-provider";
import { formatTimestamp } from "../_components/documents/format";
import { feeFor, maxPreferencesFor } from "../_components/apply/rules";
import { useScrutinyBridge } from "../_components/scrutiny-bridge/scrutiny-bridge-provider";

type RichStatus =
  | "draft"
  | "submitted"
  | "underReview"
  | "discrepancy"
  | "verified"
  | "conditional"
  | "rejected";

const RICH_STATUS_STYLE: Record<RichStatus, string> = {
  draft: "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]",
  submitted: "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]",
  underReview:
    "bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]",
  discrepancy:
    "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
  verified:
    "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
  conditional:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]",
  rejected:
    "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
};

function overlayToRich(status: AppBaseStatus | undefined): RichStatus | null {
  if (!status) return null;
  if (status === "submitted") return "submitted";
  if (status === "under_scrutiny") return "underReview";
  if (status === "discrepancy_raised") return "discrepancy";
  if (status === "verified") return "verified";
  if (status === "conditional") return "conditional";
  if (status === "rejected") return "rejected";
  return null;
}

export default function ApplicationsListPage() {
  const { t, locale } = useLocale();
  const { applications, hydrated } = useApplications();
  const bridge = useScrutinyBridge();

  const rows = useMemo(() => {
    return Object.values(applications)
      .filter((draft) => draft.itemIds.length > 0 || draft.status === "submitted")
      .sort((a, b) => {
        const scoreA = a.status === "submitted" ? 0 : 1;
        const scoreB = b.status === "submitted" ? 0 : 1;
        if (scoreA !== scoreB) return scoreA - scoreB;
        return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
      });
  }, [applications]);

  return (
    <PageShell
      eyebrow={t("nav.myApplications")}
      title={t("app.name")}
      backHref="/dashboard"
      footer={<BottomTabBar />}
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
          {t("apply.myApps.title")}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("apply.myApps.subtitle")}
        </p>
      </section>

      {!hydrated ? (
        <p className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("common.loading")}
        </p>
      ) : rows.length === 0 ? (
        <section className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-5 text-center">
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("apply.myApps.empty")}
          </p>
          <Link
            href="/discover"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
          >
            {t("cta.exploreCourses")}
          </Link>
        </section>
      ) : (
        <section className="mt-4 space-y-3">
          {rows.map((row) => {
            const course = getCourse(row.courseId);
            if (!course) return null;
            const submitted = row.status === "submitted";

            // Rich status is driven by bridge overlay when submitted; otherwise
            // stays "Draft".
            const bridgeStatus = row.applicationNumber
              ? overlayToRich(bridge.statusFor(row.applicationNumber))
              : null;
            const richStatus: RichStatus = submitted
              ? bridgeStatus ?? "underReview"
              : "draft";

            const issueCount = row.applicationNumber
              ? bridge
                  .byApplication(row.applicationNumber)
                  .filter((d) => !d.studentActionAt).length
              : 0;

            const primaryHref = submitted
              ? issueCount > 0
                ? `/applications/${row.courseId}/issues`
                : `/apply/${row.courseId}/submitted`
              : `/apply/${row.courseId}/review`;
            const primaryCta = submitted
              ? issueCount > 0
                ? t("cta.fixNow")
                : t("apply.myApps.viewCta")
              : t("apply.myApps.continueCta");

            return (
              <article
                key={row.courseId}
                className={cn(
                  "rounded-[var(--radius-lg)] border p-4",
                  richStatus === "discrepancy"
                    ? "border-[var(--color-text-danger)] bg-[var(--color-surface)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]",
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
                  <span
                    className={cn(
                      "rounded-[var(--radius-pill)] px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)]",
                      RICH_STATUS_STYLE[richStatus],
                    )}
                  >
                    {t(`apply.myApps.status.${richStatus}`)}
                  </span>
                </div>

                <dl className="mt-2 space-y-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                  <div>
                    {t("apply.myApps.preferencesCount", { n: row.itemIds.length })} ·{" "}
                    {t("apply.hub.maxPreferences", { n: maxPreferencesFor(row.courseId) })}
                  </div>
                  <div>{t("apply.hub.fee", { amount: feeFor(row.courseId) })}</div>
                  {submitted && row.applicationNumber ? (
                    <div className="text-[var(--color-text-primary)]">
                      <span className="font-[var(--weight-semibold)]">
                        {row.applicationNumber}
                      </span>
                      {row.submittedAt ? (
                        <> · {formatTimestamp(row.submittedAt, locale)}</>
                      ) : null}
                    </div>
                  ) : null}
                </dl>

                {issueCount > 0 ? (
                  <p className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-status-danger-bg)] px-3 py-1.5 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-status-danger-fg)]">
                    ⚠ {t("apply.myApps.issueCount", { n: issueCount })}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={primaryHref}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)]",
                      issueCount > 0 || !submitted
                        ? "bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)]"
                        : "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)]",
                    )}
                  >
                    {primaryCta}
                  </Link>
                  {submitted && issueCount > 0 ? (
                    <Link
                      href={`/apply/${row.courseId}/submitted`}
                      className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
                    >
                      {t("apply.myApps.viewCta")}
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </PageShell>
  );
}
