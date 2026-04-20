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

  const nextActionVariant: NextActionVariant = hasSubmitted && firstSubmittedCourse
    ? "underReview"
    : !hasEnoughProfile(draft)
      ? "finishProfile"
      : "findCourses";

  return (
    <PageShell
      eyebrow={t("screen.home.cycleTag")}
      title={t("app.name")}
      width="wide"
      footer={<BottomTabBar />}
    >
      <section>
        <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {t("nav.home")}
        </p>
        <h2 className="mt-2 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)] sm:text-[var(--text-3xl)]">
          {firstName
            ? t("screen.dashboard.greeting", { name: firstName })
            : t("screen.dashboard.greetingGeneric")}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)] sm:text-[var(--text-base)]">
          {t("screen.dashboard.subGreeting")}
        </p>
      </section>

      {headlineDiscrepancy && headlineCourseId ? (
        <div className="mt-6">
          <DiscrepancySummaryCard
            courseId={headlineCourseId}
            headline={headlineDiscrepancy}
            moreCount={moreCount}
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr] lg:gap-6">
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
          <h3 className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            {t("screen.dashboard.statusTitle")}
          </h3>
          <div className="mt-4">
            <StatusTracker currentStep={currentStep} />
          </div>
        </section>

        {!hasOpenDiscrepancy ? (
          <section>
            <h3 className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
              {t("screen.dashboard.nextActionTitle")}
            </h3>
            <div className="mt-3">
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
            </div>
          </section>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr] lg:gap-6">
        <section>
          <h3 className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            {t("screen.dashboard.quickLinksTitle")}
          </h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="group flex h-full items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)]"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]"
                  >
                    {link.icon}
                  </span>
                  <span className="min-w-0 flex-1 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {t(`quickLink.${link.key}`)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex-none text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            {t("screen.dashboard.notificationsTitle")}
          </h3>
          <ul className="mt-3 divide-y divide-[var(--color-border-subtle)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4">
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
      </div>
    </PageShell>
  );
}
