"use client";

import Link from "next/link";
import { Card } from "@hp-mis/ui";
import { NextActionCard } from "./next-action-card";
import { useLocale } from "./locale-provider";
import { getCourse } from "./discover/mock-data";

/**
 * Stage views — one per DemoStage. Each renders the "what's happening
 * right now" panel on the dashboard for the corresponding effective step.
 *
 * They reuse NextActionCard for the headline action and add a small
 * timeline / context strip below so each stage feels distinct without
 * introducing new logic. The strip is purely presentational — the data
 * shown comes from the props passed in (firstSubmitted course, app
 * number, allocation if any).
 */

interface BaseProps {
  /** First submitted application's courseId, or null when nothing submitted yet. */
  courseId: string | null;
  /** First submitted application number, or null. */
  applicationNumber: string | null;
}

interface AllotmentProps extends BaseProps {
  /** College name to surface in the offer card. */
  collegeName: string | null;
  /** Roll number when admission is paid/confirmed. */
  rollNumber?: string | null;
}

function CourseStrip({ courseId, applicationNumber }: BaseProps) {
  const { t } = useLocale();
  if (!courseId) return null;
  const course = getCourse(courseId);
  if (!course) return null;
  return (
    <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
      <div>
        <dt className="sr-only">Course</dt>
        <dd>
          <span className="font-mono text-[var(--color-text-secondary)]">
            {course.code}
          </span>{" "}
          · {t(course.nameKey)}
        </dd>
      </div>
      {applicationNumber ? (
        <div>
          <dt className="sr-only">Application number</dt>
          <dd className="font-mono text-[var(--color-text-secondary)]">
            {applicationNumber}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function StageTimeline({
  steps,
  activeIndex,
}: {
  steps: readonly string[];
  activeIndex: number;
}) {
  return (
    <ol className="mt-4 space-y-2">
      {steps.map((label, idx) => {
        const state =
          idx < activeIndex ? "done" : idx === activeIndex ? "current" : "upcoming";
        return (
          <li
            key={label}
            className="flex items-start gap-2 text-[var(--text-xs)] leading-[var(--leading-snug)]"
          >
            <span
              aria-hidden="true"
              className={
                state === "done"
                  ? "mt-0.5 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[var(--color-interactive-success)] text-[10px] text-[var(--color-text-on-brand)]"
                  : state === "current"
                    ? "mt-0.5 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full border-2 border-[var(--color-interactive-primary)] bg-[var(--color-surface)]"
                    : "mt-0.5 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]"
              }
            >
              {state === "done" ? "✓" : ""}
            </span>
            <span
              className={
                state === "current"
                  ? "font-[var(--weight-semibold)] text-[var(--color-text-primary)]"
                  : state === "done"
                    ? "text-[var(--color-text-secondary)]"
                    : "text-[var(--color-text-tertiary)]"
              }
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------------------------------------------------------------- */
/* Stage 1 · Submitted — application just landed, sitting in college queue */
/* ---------------------------------------------------------------------- */

export function SubmittedView({ courseId, applicationNumber }: BaseProps) {
  const { t } = useLocale();
  const course = courseId ? getCourse(courseId) : null;
  return (
    <div className="space-y-3">
      <NextActionCard
        title="Application submitted"
        body={
          course
            ? `Your application for ${course.code} · ${t(course.nameKey)} reached the college. Scrutiny begins shortly — no action needed from you right now.`
            : "Your application has been submitted. Scrutiny begins shortly — no action needed from you right now."
        }
        cta={t("screen.dashboard.underReview.cta")}
        href="/applications"
        meta={applicationNumber ?? undefined}
        icon="📨"
      />
      <Card className="!border-[var(--color-border-subtle)] !p-4">
        <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          What happens next
        </p>
        <StageTimeline
          steps={[
            "Application received by college",
            "Scrutiny by college reviewer",
            "Merit list published",
            "Seat allotment",
          ]}
          activeIndex={0}
        />
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Stage 2 · Under scrutiny — college actively checking documents          */
/* ---------------------------------------------------------------------- */

export function ScrutinyView({ courseId, applicationNumber }: BaseProps) {
  const { t } = useLocale();
  return (
    <div className="space-y-3">
      <NextActionCard
        title={t("screen.dashboard.underReview.title")}
        body={t("screen.dashboard.underReview.body")}
        cta={t("screen.dashboard.underReview.cta")}
        href="/applications"
        meta={applicationNumber ?? undefined}
        icon="🔍"
      />
      <Card className="!border-[var(--color-border-subtle)] !p-4">
        <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          Scrutiny in progress
        </p>
        <StageTimeline
          steps={[
            "Application received",
            "College reviewer assigned",
            "Documents being verified",
            "Outcome shared with you",
          ]}
          activeIndex={2}
        />
        <p className="mt-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          Most applications complete scrutiny within 3 working days. We&apos;ll
          notify you the moment the outcome is recorded.
        </p>
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Stage 3 · Merit published — student is on the merit list                */
/* ---------------------------------------------------------------------- */

export function MeritView({ courseId, applicationNumber }: BaseProps) {
  const { t } = useLocale();
  return (
    <div className="space-y-3">
      <NextActionCard
        title={t("screen.dashboard.meritPublished.title")}
        body={t("screen.dashboard.meritPublished.body")}
        cta={t("screen.dashboard.meritPublished.cta")}
        href={courseId ? `/allotment/${courseId}` : "/applications"}
        meta={applicationNumber ?? undefined}
        icon="🏅"
      />
      <Card className="!border-[var(--color-border-subtle)] !p-4">
        <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          You made the cut
        </p>
        <StageTimeline
          steps={[
            "Scrutiny completed",
            "Merit list published",
            "Allotment round runs next",
            "You'll see your seat offer here",
          ]}
          activeIndex={1}
        />
        <p className="mt-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          Allotment runs every working day at 4:00 PM. Keep this dashboard open
          — your offer will land here automatically.
        </p>
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Stage 4 · Allotted — seat offered, awaiting Freeze / Float / Decline    */
/* ---------------------------------------------------------------------- */

export function AllotmentView({
  courseId,
  applicationNumber,
  collegeName,
}: AllotmentProps) {
  const { t } = useLocale();
  const college = collegeName ?? "your first preference";
  return (
    <div className="space-y-3">
      <NextActionCard
        title={t("screen.dashboard.seatOffered.title", { college })}
        body={t("screen.dashboard.seatOffered.body")}
        cta={t("screen.dashboard.seatOffered.cta")}
        href={courseId ? `/allotment/${courseId}` : "/applications"}
        meta={applicationNumber ?? undefined}
        icon="🎉"
      />
      <Card className="!border-[var(--color-border-subtle)] !p-4">
        <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          Decide before the deadline
        </p>
        <ul className="mt-3 space-y-2 text-[var(--text-xs)] leading-[var(--leading-snug)]">
          <li className="flex items-start gap-2">
            <span aria-hidden="true">🔒</span>
            <span className="text-[var(--color-text-secondary)]">
              <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                Freeze
              </span>
              {" — "}accept this seat and pay the admission fee.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true">⤴</span>
            <span className="text-[var(--color-text-secondary)]">
              <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                Float
              </span>
              {" — "}hold this seat, try for a higher preference next round.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true">✗</span>
            <span className="text-[var(--color-text-secondary)]">
              <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                Decline
              </span>
              {" — "}exit allotment for this cycle.
            </span>
          </li>
        </ul>
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Stage 5 · Admission confirmed — seat frozen, fee paid, roll number out  */
/* ---------------------------------------------------------------------- */

export function ConfirmedView({
  courseId,
  applicationNumber,
  collegeName,
  rollNumber,
}: AllotmentProps) {
  const { t } = useLocale();
  const college = collegeName ?? "your college";
  return (
    <div className="space-y-3">
      <NextActionCard
        title={t("screen.dashboard.admissionConfirmed.title")}
        body={t("screen.dashboard.admissionConfirmed.body", { college })}
        cta={t("screen.dashboard.admissionConfirmed.cta")}
        href={courseId ? `/payment/${courseId}` : "/applications"}
        meta={rollNumber ?? applicationNumber ?? undefined}
        icon="🎓"
      />
      <Card className="!border-[var(--color-border-subtle)] !p-4">
        <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          You&apos;re officially in
        </p>
        <ul className="mt-3 space-y-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-2">
            <span aria-hidden="true">✓</span>
            <span>Admission fee received and acknowledged by the college.</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true">✓</span>
            <span>
              {rollNumber
                ? `Roll number ${rollNumber} issued for the academic year.`
                : "Roll number will be issued by the college shortly."}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true">📅</span>
            <span>Watch this dashboard for orientation date and reporting instructions.</span>
          </li>
        </ul>
        <div className="mt-4">
          <Link
            href="/applications"
            className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)] hover:underline underline-offset-4"
          >
            View admission record →
          </Link>
        </div>
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </Card>
    </div>
  );
}
