"use client";

import Link from "next/link";
import { PageShell } from "../_components/page-shell";
import { StatusTracker } from "../_components/status-tracker";
import { NextActionCard } from "../_components/next-action-card";
import { NotificationItem } from "../_components/notification-item";
import { BottomTabBar } from "../_components/bottom-tab-bar";
import { useLocale } from "../_components/locale-provider";
import { useApplications } from "../_components/apply/applications-provider";
import { useProfile } from "../_components/profile/profile-provider";
import { remainingProfileSteps } from "../_components/discover/evaluate";
import { getCourse } from "../_components/discover/mock-data";
import { useScrutinyBridge } from "../_components/scrutiny-bridge/scrutiny-bridge-provider";
import { DiscrepancySummaryCard } from "../_components/scrutiny-bridge/discrepancy-summary-card";
import { DemoProgressControl } from "../_components/demo-progress/demo-progress-control";
import { useEffectiveStudentStep } from "../_components/use-effective-step";
import {
  AllotmentView,
  ConfirmedView,
  MeritView,
  ScrutinyView,
  SubmittedView,
} from "../_components/stage-views";

// Helpdesk moved into the footer — the body list keeps the two journey-
// specific shortcuts (documents, eligibility) so the dashboard stays
// focused on what the student needs to act on next.
const QUICK_LINKS = [
  { key: "documents", icon: "📄", href: "/profile/step/4" },
  { key: "eligibility", icon: "✓", href: "/discover" },
] as const;

const BASE_NOTIFICATIONS = [
  { key: "dates", time: "1 hr ago", unread: true },
  { key: "phaseOpen", time: "Today, 10:00 AM", unread: true },
  { key: "digilocker", time: "Yesterday", unread: false },
  { key: "helpdesk", time: "2 days ago", unread: false },
  { key: "language", time: "3 days ago", unread: false },
] as const;

export default function DashboardPage() {
  const { t } = useLocale();
  const { applications } = useApplications();
  const { draft } = useProfile();
  const bridge = useScrutinyBridge();

  // Single source of truth for "what step to render". When an operator
  // forces a demo stage via DemoProgressProvider, `step` reflects that
  // stage — every page in the app reads from this hook so the rendered
  // UI stays in lockstep with the demo. The underlying providers are
  // not touched, so the real submission / allocation pipeline still
  // behaves normally.
  const effective = useEffectiveStudentStep();
  const {
    step: currentStep,
    isDemo,
    firstSubmittedCourseId,
    firstApplicationNumber,
    firstAllocation,
  } = effective;
  const firstSubmittedCourse = firstSubmittedCourseId
    ? getCourse(firstSubmittedCourseId)
    : null;

  /*
   * Only surface an action-required card on the dashboard when there's at
   * least one OPEN discrepancy (student hasn't acted yet). When the demo
   * override is active the operator is curating the journey, so we hide
   * the discrepancy escalation — the staged view should not get drowned
   * out by genuine real-flow noise.
   */
  const openDiscrepancies = isDemo
    ? []
    : bridge.all.filter((d) => !d.studentActionAt);
  const headlineDiscrepancy = openDiscrepancies[0] ?? null;
  const hasOpenDiscrepancy = openDiscrepancies.length > 0;
  const headlineCourseId = headlineDiscrepancy
    ? (Object.values(applications).find(
        (a) => a.applicationNumber === headlineDiscrepancy.applicationId,
      )?.courseId ?? "")
    : "";
  const moreCount = Math.max(0, openDiscrepancies.length - 1);

  const stepsLeft = remainingProfileSteps(draft);
  const firstName = draft.fullName.trim().split(/\s+/)[0] ?? "";

  const allocationCollegeName = firstAllocation?.offer.collegeName ?? null;
  const allocationRollNumber = firstAllocation?.rollNumber ?? null;
  const allocationFeeAmount = firstAllocation?.offer.feeAmount ?? null;

  return (
    <PageShell
      eyebrow={t("screen.home.cycleTag")}
      title={t("app.name")}
      width="wide"
      footer={<BottomTabBar />}
    >
      <section>
        <p className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
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
          <h3 className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            {t("screen.dashboard.statusTitle")}
          </h3>
          <div className="mt-4">
            <StatusTracker currentStep={currentStep} />
          </div>
          <DemoProgressControl currentStep={currentStep} />
        </section>

        {!hasOpenDiscrepancy ? (
          <section>
            <h3 className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
              {t("screen.dashboard.nextActionTitle")}
            </h3>
            <div className="mt-3">
              {/*
                Stage-based UI switching — every step from `submitted` onwards
                renders a dedicated view component. The pre-submission steps
                (profileComplete) keep the existing finish-profile / find-
                courses cards because there's nothing to "stage" before an
                application exists.
              */}
              {currentStep === "admissionConfirmed" ? (
                <ConfirmedView
                  courseId={firstSubmittedCourseId}
                  applicationNumber={firstApplicationNumber}
                  collegeName={allocationCollegeName}
                  rollNumber={allocationRollNumber}
                />
              ) : currentStep === "allotted" ? (
                <AllotmentView
                  courseId={firstSubmittedCourseId}
                  applicationNumber={firstApplicationNumber}
                  collegeName={allocationCollegeName}
                  feeAmount={allocationFeeAmount}
                />
              ) : currentStep === "meritPublished" ? (
                <MeritView
                  courseId={firstSubmittedCourseId}
                  applicationNumber={firstApplicationNumber}
                />
              ) : currentStep === "underScrutiny" ? (
                <ScrutinyView
                  courseId={firstSubmittedCourseId}
                  applicationNumber={firstApplicationNumber}
                />
              ) : currentStep === "submitted" && firstSubmittedCourse ? (
                <SubmittedView
                  courseId={firstSubmittedCourseId}
                  applicationNumber={firstApplicationNumber}
                />
              ) : currentStep === "submitted" ? (
                /* Profile complete + ready to apply, but nothing submitted yet. */
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
          <h3 className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            {t("screen.dashboard.quickLinksTitle")}
          </h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="group flex h-full items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)] transition-colors duration-150 ease-out group-hover:bg-[var(--color-interactive-primary)] group-hover:text-[var(--color-text-on-brand)]"
                  >
                    {link.icon}
                  </span>
                  <span className="min-w-0 flex-1 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {t(`quickLink.${link.key}`)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex-none text-[var(--color-text-tertiary)] transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--color-text-brand)]"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
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
