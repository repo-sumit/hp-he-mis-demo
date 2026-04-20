"use client";

import Link from "next/link";
import { PageShell } from "../_components/page-shell";
import { StatusTracker, type StatusStep } from "../_components/status-tracker";
import { NextActionCard } from "../_components/next-action-card";
import { NotificationItem } from "../_components/notification-item";
import { BottomTabBar } from "../_components/bottom-tab-bar";
import { useLocale } from "../_components/locale-provider";
import { useApplications } from "../_components/apply/applications-provider";
import { getCourse } from "../_components/discover/mock-data";
import { formatTimestamp } from "../_components/documents/format";
import { useScrutinyBridge } from "../_components/scrutiny-bridge/scrutiny-bridge-provider";
import { DiscrepancySummaryCard } from "../_components/scrutiny-bridge/discrepancy-summary-card";

const QUICK_LINKS = [
  { key: "documents", icon: "📄", href: "/documents" },
  { key: "eligibility", icon: "✓", href: "/discover" },
  { key: "notifications", icon: "🔔", href: "/dashboard" },
  { key: "helpdesk", icon: "💬", href: "/help" },
] as const;

const BASE_NOTIFICATIONS = [
  { key: "welcome", time: "2 min ago", unread: true },
  { key: "dates", time: "1 hr ago", unread: true },
  { key: "language", time: "Today", unread: false },
] as const;

export default function DashboardPage() {
  const { t, locale } = useLocale();
  const { applications, submittedCourseIds } = useApplications();
  const bridge = useScrutinyBridge();

  const submittedIds = submittedCourseIds();
  const hasSubmitted = submittedIds.length > 0;

  // Any open discrepancies? Take the highest-priority one as the headline.
  const openDiscrepancies = bridge.all.filter((d) => !d.studentActionAt);
  const headlineDiscrepancy = openDiscrepancies[0] ?? bridge.all[0];
  const headlineCourseId =
    headlineDiscrepancy
      ? (Object.values(applications).find(
          (a) => a.applicationNumber === headlineDiscrepancy.applicationId,
        )?.courseId ?? "")
      : "";
  const moreCount = Math.max(0, openDiscrepancies.length - 1);

  // Advance the status tracker whenever the student has at least one
  // submitted application — keeps the 7-step pipeline honest.
  const currentStep: StatusStep = hasSubmitted ? "submitted" : "profileComplete";

  // Next-action flips from "finish profile" to "your application is being reviewed"
  // as soon as there's a submission in flight.
  const firstSubmitted = hasSubmitted ? applications[submittedIds[0]!] : null;
  const firstSubmittedCourse = firstSubmitted ? getCourse(firstSubmitted.courseId) : null;

  return (
    <PageShell
      eyebrow={t("screen.home.cycleTag")}
      title={t("app.name")}
      footer={<BottomTabBar />}
    >
      <section>
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("nav.home")}
        </p>
        <h2 className="mt-1 text-[var(--text-2xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
          {t("screen.dashboard.greeting", { name: "Asha" })}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("screen.dashboard.subGreeting")}
        </p>
      </section>

      {headlineDiscrepancy && headlineCourseId ? (
        <div className="mt-5">
          <DiscrepancySummaryCard
            courseId={headlineCourseId}
            headline={headlineDiscrepancy}
            moreCount={moreCount}
          />
        </div>
      ) : null}

      <section className="mt-5">
        <h3 className="mb-2 text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("screen.dashboard.statusTitle")}
        </h3>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <StatusTracker currentStep={currentStep} />
        </div>
      </section>

      {hasSubmitted ? (
        <section className="mt-5 space-y-2">
          <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("apply.myApps.title")}
          </h3>
          {submittedIds.map((cid) => {
            const entry = applications[cid];
            const course = getCourse(cid);
            if (!entry || !course) return null;
            return (
              <Link
                key={cid}
                href={`/apply/${cid}/submitted`}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-status-success-fg)]">
                    {t("status.applicationSubmitted")} · {course.code}
                  </p>
                  <p className="mt-0.5 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {entry.applicationNumber}
                  </p>
                  {entry.submittedAt ? (
                    <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      {formatTimestamp(entry.submittedAt, locale)}
                    </p>
                  ) : null}
                </div>
                <span aria-hidden="true" className="text-[var(--color-text-secondary)]">
                  →
                </span>
              </Link>
            );
          })}
        </section>
      ) : null}

      <section className="mt-5">
        <h3 className="mb-2 text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("screen.dashboard.nextActionTitle")}
        </h3>
        {hasSubmitted && firstSubmitted && firstSubmittedCourse ? (
          <NextActionCard
            title={t("status.underReview")}
            body={t("submitted.nextStepsBody")}
            cta={t("cta.viewApplications")}
            href="/applications"
            deadline={firstSubmitted.applicationNumber}
          />
        ) : (
          <NextActionCard
            title={t("screen.dashboard.nextActionTitle")}
            body={t("screen.dashboard.nextActionBody", { n: 3 })}
            cta={t("screen.dashboard.nextActionCta")}
            href="/profile/step/1"
            deadline={t("screen.home.datesLine")}
          />
        )}
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("screen.dashboard.notificationsTitle")}
          </h3>
          <Link
            href="/dashboard"
            className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            {t("screen.dashboard.viewAllNotifications")}
          </Link>
        </div>
        <ul className="mt-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
          {BASE_NOTIFICATIONS.map((item) => (
            <NotificationItem
              key={item.key}
              title={t(`screen.dashboard.mockNotifications.${item.key}`)}
              time={item.time}
              unread={item.unread}
            />
          ))}
        </ul>
      </section>

      <section className="mt-5 pb-4">
        <h3 className="mb-2 text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("screen.dashboard.quickLinksTitle")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:bg-[var(--color-background-subtle)]"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]"
              >
                {link.icon}
              </span>
              <span className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                {t(`quickLink.${link.key}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
