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
import { useAllotmentBridge } from "../_components/allotment-bridge/allotment-bridge-provider";

// Helpdesk moved into the footer — the body list keeps the two journey-
// specific shortcuts (documents, eligibility) so the dashboard stays
// focused on what the student needs to act on next.
const QUICK_LINKS = [
  { key: "documents", icon: "📄", href: "/profile/step/4" },
  { key: "eligibility", icon: "✓", href: "/discover" },
] as const;

const BASE_NOTIFICATIONS = [
  { key: "dates", time: "1 hr ago", unread: true },
] as const;

type NextActionVariant =
  | "finishProfile"
  | "findCourses"
  | "underReview"
  | "meritPublished"
  | "seatOffered"
  | "admissionConfirmed";

export default function DashboardPage() {
  const { t } = useLocale();
  const { applications, submittedCourseIds } = useApplications();
  const { draft } = useProfile();
  const bridge = useScrutinyBridge();
  const allotment = useAllotmentBridge();

  const submittedIds = submittedCourseIds();
  const hasSubmitted = submittedIds.length > 0;

  /*
   * Only surface an action-required card on the dashboard when there's at
   * least one OPEN discrepancy (student hasn't acted yet). Showing the
   * awaiting/"sent for re-check" state here previously turned into a
   * dead-end — green card with no CTA and "nothing more to do" copy even
   * when the reason was an unresolved issue like a blurry photo. Awaiting
   * status still lives on /applications and /issues where it belongs.
   */
  const openDiscrepancies = bridge.all.filter((d) => !d.studentActionAt);
  const headlineDiscrepancy = openDiscrepancies[0] ?? null;
  const hasOpenDiscrepancy = openDiscrepancies.length > 0;
  const headlineCourseId = headlineDiscrepancy
    ? (Object.values(applications).find(
        (a) => a.applicationNumber === headlineDiscrepancy.applicationId,
      )?.courseId ?? "")
    : "";
  const moreCount = Math.max(0, openDiscrepancies.length - 1);

  const firstSubmitted = hasSubmitted ? applications[submittedIds[0]!] : null;
  const firstSubmittedCourse = firstSubmitted ? getCourse(firstSubmitted.courseId) : null;

  // Derive allocation state for the first submitted course. The tracker +
  // next-action card both read from this — the dashboard is the one place
  // where merit and allocation overlays actually animate the student's
  // progress through steps 4, 5, 6, 7.
  const firstAllocation = firstSubmitted
    ? allotment.allocationFor(firstSubmitted.courseId)
    : null;
  const firstMeritPublished =
    firstSubmitted && allotment.meritPublishedFor(firstSubmitted.courseId);

  // Current step: walk backwards from the most advanced state. Once the
  // profile meets the submission bar, the "Profile complete" step is done —
  // the student is now sitting at the submission stage waiting to pick a
  // course. Previously this case collapsed back into "profileComplete",
  // which left the Profile Complete node perpetually un-ticked even after
  // the profile was actually complete.
  const currentStep: StatusStep = (() => {
    if (
      firstAllocation?.status === "fee_paid" ||
      firstAllocation?.status === "admission_confirmed"
    ) {
      return "admissionConfirmed";
    }
    if (firstAllocation) return "allotted";
    if (firstMeritPublished) return "meritPublished";
    if (hasSubmitted) return "submitted";
    if (hasEnoughProfile(draft)) return "submitted";
    return "profileComplete";
  })();

  const stepsLeft = remainingProfileSteps(draft);
  const firstName = draft.fullName.trim().split(/\s+/)[0] ?? "";

  // Priority order for the next-action card. More advanced states win —
  // a confirmed admission takes precedence over "seat offered" which takes
  // precedence over "merit published" / "under review".
  const nextActionVariant: NextActionVariant = (() => {
    if (
      firstAllocation?.status === "fee_paid" ||
      firstAllocation?.status === "admission_confirmed"
    ) {
      return "admissionConfirmed";
    }
    if (firstAllocation) return "seatOffered";
    if (firstMeritPublished) return "meritPublished";
    if (hasSubmitted && firstSubmittedCourse) return "underReview";
    if (!hasEnoughProfile(draft)) return "finishProfile";
    return "findCourses";
  })();

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
              {nextActionVariant === "admissionConfirmed" &&
              firstSubmitted &&
              firstAllocation ? (
                <NextActionCard
                  title={t("screen.dashboard.admissionConfirmed.title")}
                  body={t("screen.dashboard.admissionConfirmed.body", {
                    college: firstAllocation.offer.collegeName,
                  })}
                  cta={t("screen.dashboard.admissionConfirmed.cta")}
                  href={`/payment/${firstSubmitted.courseId}`}
                  meta={firstAllocation.rollNumber ?? firstSubmitted.applicationNumber}
                  icon="🎓"
                />
              ) : nextActionVariant === "seatOffered" &&
                firstSubmitted &&
                firstAllocation ? (
                <NextActionCard
                  title={t("screen.dashboard.seatOffered.title", {
                    college: firstAllocation.offer.collegeName,
                  })}
                  body={t("screen.dashboard.seatOffered.body")}
                  cta={t("screen.dashboard.seatOffered.cta")}
                  href={`/allotment/${firstSubmitted.courseId}`}
                  meta={firstSubmitted.applicationNumber}
                  icon="🎉"
                />
              ) : nextActionVariant === "meritPublished" && firstSubmitted ? (
                <NextActionCard
                  title={t("screen.dashboard.meritPublished.title")}
                  body={t("screen.dashboard.meritPublished.body")}
                  cta={t("screen.dashboard.meritPublished.cta")}
                  href={`/allotment/${firstSubmitted.courseId}`}
                  meta={firstSubmitted.applicationNumber}
                  icon="🏅"
                />
              ) : nextActionVariant === "underReview" && firstSubmitted && firstSubmittedCourse ? (
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
