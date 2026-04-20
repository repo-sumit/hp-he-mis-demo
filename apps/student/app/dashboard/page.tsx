"use client";

import Link from "next/link";
import { PageShell } from "../_components/page-shell";
import { StatusTracker, type StatusStep } from "../_components/status-tracker";
import { NextActionCard } from "../_components/next-action-card";
import { NotificationItem } from "../_components/notification-item";
import { BottomTabBar } from "../_components/bottom-tab-bar";
import { useLocale } from "../_components/locale-provider";
import { useApplications } from "../_components/apply/applications-provider";
import { useProfile } from "../_components/profile/profile-provider";
import { hasEnoughProfile, remainingProfileSteps } from "../_components/discover/evaluate";
import { getCourse } from "../_components/discover/mock-data";
import { useScrutinyBridge } from "../_components/scrutiny-bridge/scrutiny-bridge-provider";
import { DiscrepancySummaryCard } from "../_components/scrutiny-bridge/discrepancy-summary-card";

const QUICK_LINKS = [
  { key: "documents", icon: "📄", href: "/documents" },
  { key: "eligibility", icon: "✓", href: "/discover" },
  { key: "helpdesk", icon: "💬", href: "/help" },
] as const;

// Two notifications on top is less noisy than three; show a third only when the
// rest of the dashboard is quiet (no submissions, no discrepancies).
const BASE_NOTIFICATIONS = [
  { key: "welcome", time: "2 min ago", unread: true },
  { key: "dates", time: "1 hr ago", unread: true },
] as const;

type NextActionVariant = "finishProfile" | "findCourses" | "underReview";

export default function DashboardPage() {
  const { t } = useLocale();
  const { applications, submittedCourseIds } = useApplications();
  const { draft } = useProfile();
  const bridge = useScrutinyBridge();

  const submittedIds = submittedCourseIds();
  const hasSubmitted = submittedIds.length > 0;

  // Highest-priority discrepancy drives the alert card. Everything behind it
  // de-escalates so the dashboard has a single, obvious focal point.
  const openDiscrepancies = bridge.all.filter((d) => !d.studentActionAt);
  const headlineDiscrepancy = openDiscrepancies[0] ?? bridge.all[0];
  const hasOpenDiscrepancy = openDiscrepancies.length > 0;
  const headlineCourseId = headlineDiscrepancy
    ? (Object.values(applications).find(
        (a) => a.applicationNumber === headlineDiscrepancy.applicationId,
      )?.courseId ?? "")
    : "";
  const moreCount = Math.max(0, openDiscrepancies.length - 1);

  const currentStep: StatusStep = hasSubmitted ? "submitted" : "profileComplete";

  const firstSubmitted = hasSubmitted ? applications[submittedIds[0]!] : null;
  const firstSubmittedCourse = firstSubmitted ? getCourse(firstSubmitted.courseId) : null;

  const stepsLeft = remainingProfileSteps(draft);
  const firstName = draft.fullName.trim().split(/\s+/)[0] ?? "";

  // When there's an open discrepancy, the dedicated alert card above owns
  // the primary action — we don't render a next-action card at all to keep
  // a single focal point. Otherwise we pick the variant that matches the
  // student's current state.
  const nextActionVariant: NextActionVariant = hasSubmitted && firstSubmittedCourse
    ? "underReview"
    : !hasEnoughProfile(draft)
      ? "finishProfile"
      : "findCourses";

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
          {firstName
            ? t("screen.dashboard.greeting", { name: firstName })
            : t("screen.dashboard.greetingGeneric")}
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

      {/* When there's no discrepancy, the Next Action card adapts to the student's
          current state. When there IS a discrepancy, the alert card above is the
          primary action — no need to compete for attention with a second card. */}
      {!hasOpenDiscrepancy ? (
        <section className="mt-5">
          <h3 className="mb-2 text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("screen.dashboard.nextActionTitle")}
          </h3>
          {nextActionVariant === "underReview" && firstSubmitted && firstSubmittedCourse ? (
            <NextActionCard
              title={t("screen.dashboard.underReview.title")}
              body={t("screen.dashboard.underReview.body")}
              cta={t("screen.dashboard.underReview.cta")}
              href="/applications"
              meta={firstSubmitted.applicationNumber}
              icon="⏱"
            />
          ) : nextActionVariant === "findCourses" ? (
            <NextActionCard
              title={t("screen.dashboard.findCourses.title")}
              body={t("screen.dashboard.findCourses.body")}
              cta={t("screen.dashboard.findCourses.cta")}
              href="/discover"
              icon="🧭"
            />
          ) : (
            <NextActionCard
              title={t("screen.dashboard.nextActionTitle")}
              body={t("screen.dashboard.nextActionBody", { n: stepsLeft })}
              cta={t("screen.dashboard.nextActionCta")}
              href="/profile/step/1"
              deadline={t("screen.home.datesLine")}
            />
          )}
        </section>
      ) : null}

      <section className="mt-5">
        <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("screen.dashboard.notificationsTitle")}
        </h3>
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
