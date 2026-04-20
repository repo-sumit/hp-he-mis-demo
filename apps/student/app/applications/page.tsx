"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@hp-mis/ui";
import { PageShell } from "../_components/page-shell";
import { BottomTabBar } from "../_components/bottom-tab-bar";
import { useLocale } from "../_components/locale-provider";
import { getCourse } from "../_components/discover/mock-data";
import { useApplications } from "../_components/apply/applications-provider";
import { formatTimestamp } from "../_components/documents/format";
import { feeFor, maxPreferencesFor } from "../_components/apply/rules";

export default function ApplicationsListPage() {
  const { t, locale } = useLocale();
  const { applications, hydrated } = useApplications();

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
            const href = submitted
              ? `/apply/${row.courseId}/submitted`
              : `/apply/${row.courseId}/review`;
            const cta = submitted
              ? t("apply.myApps.viewCta")
              : t("apply.myApps.continueCta");
            return (
              <article
                key={row.courseId}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
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
                      submitted
                        ? "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]"
                        : "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]",
                    )}
                  >
                    {submitted ? t("apply.myApps.status.submitted") : t("apply.myApps.status.draft")}
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

                <div className="mt-3">
                  <Link
                    href={href}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)]",
                      submitted
                        ? "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                        : "bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)]",
                    )}
                  >
                    {cta}
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </PageShell>
  );
}
