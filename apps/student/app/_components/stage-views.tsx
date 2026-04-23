"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@hp-mis/ui";
import { NextActionCard } from "./next-action-card";
import { useLocale } from "./locale-provider";
import { getCourse } from "./discover/mock-data";

/**
 * Stage views — one per DemoStage. Each renders the "what's happening
 * right now" panel on the dashboard for the corresponding effective
 * step.
 *
 * Every view is composed of:
 *   - a NextActionCard headline (primary CTA)
 *   - a stage-specific detail card (timeline, checklist, decision
 *     options, or summary depending on stage)
 *   - a secondary action row so the operator can demo more than one
 *     navigation path per stage
 *
 * All data shown comes from props passed in (firstSubmitted course,
 * application number, allocation snapshot). No new logic — just
 * presentational composition over existing primitives.
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
  /** Fee amount (₹) for the allotted seat. Used in the fee-preview strip. */
  feeAmount?: number | null;
}

/* ============================================================ */
/* Shared primitives                                             */
/* ============================================================ */

function CourseStrip({ courseId, applicationNumber }: BaseProps) {
  const { t } = useLocale();
  if (!courseId) return null;
  const course = getCourse(courseId);
  if (!course) return null;
  return (
    <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--color-border-subtle)] pt-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
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

interface TimelineItem {
  label: string;
  hint?: string;
}

function StageTimeline({
  steps,
  activeIndex,
}: {
  steps: readonly TimelineItem[];
  activeIndex: number;
}) {
  return (
    <ol className="mt-3 space-y-2.5">
      {steps.map((item, idx) => {
        const state =
          idx < activeIndex ? "done" : idx === activeIndex ? "current" : "upcoming";
        return (
          <li
            key={item.label}
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
            <div className="min-w-0 flex-1">
              <p
                className={
                  state === "current"
                    ? "font-[var(--weight-semibold)] text-[var(--color-text-primary)]"
                    : state === "done"
                      ? "text-[var(--color-text-secondary)]"
                      : "text-[var(--color-text-tertiary)]"
                }
              >
                {item.label}
              </p>
              {item.hint ? (
                <p className="mt-0.5 text-[var(--text-2xs)] text-[var(--color-text-tertiary)]">
                  {item.hint}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface SecondaryCta {
  label: string;
  href: string;
  icon?: string;
}

function SecondaryActionRow({
  primary,
  secondary,
}: {
  primary?: SecondaryCta;
  secondary?: SecondaryCta;
}) {
  if (!primary && !secondary) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-border-subtle)] pt-3">
      {primary ? (
        <Link
          href={primary.href}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-brand)] hover:text-[var(--color-text-brand)]"
        >
          {primary.icon ? <span aria-hidden="true">{primary.icon}</span> : null}
          {primary.label}
        </Link>
      ) : null}
      {secondary ? (
        <Link
          href={secondary.href}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-brand)]"
        >
          {secondary.icon ? <span aria-hidden="true">{secondary.icon}</span> : null}
          {secondary.label}
        </Link>
      ) : null}
    </div>
  );
}

function DetailCard({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <Card className="!border-[var(--color-border-subtle)] !p-4">
      <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
        {eyebrow}
      </p>
      {children}
    </Card>
  );
}

/* ============================================================ */
/* Stage 1 · Submitted                                           */
/* ============================================================ */

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
      <DetailCard eyebrow="What happens next">
        <StageTimeline
          steps={[
            { label: "Application received by college", hint: "Just now" },
            { label: "Scrutiny by college reviewer", hint: "Usually within 1 working day" },
            { label: "Merit list published" },
            { label: "Seat allotment" },
          ]}
          activeIndex={0}
        />
        <SecondaryActionRow
          primary={{
            label: "View application",
            href: courseId ? `/apply/${courseId}/submitted` : "/applications",
            icon: "📨",
          }}
          secondary={{
            label: "Review documents",
            href: "/profile/step/4",
            icon: "📄",
          }}
        />
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </DetailCard>
    </div>
  );
}

/* ============================================================ */
/* Stage 2 · Under scrutiny                                      */
/* ============================================================ */

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
      <DetailCard eyebrow="Reviewer is checking">
        <ul className="mt-3 space-y-2 text-[var(--text-xs)]">
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[var(--color-interactive-success)] text-[10px] text-[var(--color-text-on-brand)]"
            >
              ✓
            </span>
            <span className="text-[var(--color-text-secondary)]">
              Class 12 marksheet (HP Board, 2025)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[var(--color-interactive-success)] text-[10px] text-[var(--color-text-on-brand)]"
            >
              ✓
            </span>
            <span className="text-[var(--color-text-secondary)]">
              Domicile certificate
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 flex-none animate-pulse items-center justify-center rounded-full border-2 border-[var(--color-interactive-primary)] bg-[var(--color-surface)]"
            />
            <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              Category certificate · in review
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]"
            />
            <span className="text-[var(--color-text-tertiary)]">
              Eligibility (best-of-five) recheck
            </span>
          </li>
        </ul>
        <p className="mt-3 text-[var(--text-2xs)] text-[var(--color-text-tertiary)]">
          Most applications complete scrutiny within 3 working days. We&apos;ll
          notify you the moment the outcome is recorded.
        </p>
        <SecondaryActionRow
          primary={{
            label: "View application",
            href: "/applications",
            icon: "📨",
          }}
          secondary={{
            label: "Manage documents",
            href: "/profile/step/4",
            icon: "📄",
          }}
        />
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </DetailCard>
    </div>
  );
}

/* ============================================================ */
/* Stage 3 · Merit published                                     */
/* ============================================================ */

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
      <DetailCard eyebrow="Your merit position">
        <dl className="mt-3 grid grid-cols-3 gap-3 text-[var(--text-xs)]">
          <div>
            <dt className="text-[var(--color-text-tertiary)]">Rank</dt>
            <dd className="mt-1 text-[var(--text-lg)] font-[var(--weight-bold)] text-[var(--color-text-brand)]">
              #47
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-tertiary)]">Best-of-five</dt>
            <dd className="mt-1 font-mono text-[var(--text-lg)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              87.4%
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-tertiary)]">Category</dt>
            <dd className="mt-1 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              General
            </dd>
          </div>
        </dl>
        <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-background-brand-softer)] p-3">
          <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-brand)]">
            <span aria-hidden="true" className="mr-1">⏱</span>
            Allotment runs today at 4:00 PM
          </p>
          <p className="mt-1 text-[var(--text-2xs)] text-[var(--color-text-secondary)]">
            Keep this dashboard open — your seat offer will land here as soon as
            allotment completes.
          </p>
        </div>
        <SecondaryActionRow
          primary={{
            label: "Look up merit list",
            href: "/merit-lookup",
            icon: "🔎",
          }}
          secondary={{
            label: "View application",
            href: "/applications",
            icon: "📨",
          }}
        />
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </DetailCard>
    </div>
  );
}

/* ============================================================ */
/* Stage 4 · Allotted                                            */
/* ============================================================ */

export function AllotmentView({
  courseId,
  applicationNumber,
  collegeName,
  feeAmount,
}: AllotmentProps) {
  const { t } = useLocale();
  const college = collegeName ?? "your first preference";
  const fee = feeAmount ?? null;
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
      <DetailCard eyebrow="Decide before the deadline">
        <div className="mt-3 flex items-baseline justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--color-status-warning-bg)] px-3 py-2">
          <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-status-warning-fg)]">
            <span aria-hidden="true" className="mr-1">⏱</span>
            Response window
          </p>
          <p className="font-mono text-[var(--text-xs)] font-[var(--weight-bold)] text-[var(--color-status-warning-fg)]">
            48h 00m left
          </p>
        </div>
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
        {fee !== null ? (
          <div className="mt-3 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-xs)]">
            <span className="text-[var(--color-text-tertiary)]">
              Total payable on freeze
            </span>
            <span className="font-mono text-[var(--text-sm)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              ₹{fee}
            </span>
          </div>
        ) : null}
        <SecondaryActionRow
          primary={{
            label: "Pay & freeze",
            href: courseId ? `/payment/${courseId}` : "/applications",
            icon: "💳",
          }}
          secondary={{
            label: "Compare preferences",
            href: "/applications",
            icon: "📋",
          }}
        />
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </DetailCard>
    </div>
  );
}

/* ============================================================ */
/* Stage 5 · Admission confirmed                                 */
/* ============================================================ */

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
      <DetailCard eyebrow="You're officially in">
        {rollNumber ? (
          <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-softer)] p-3">
            <p className="text-[var(--text-2xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-brand)]">
              Roll number
            </p>
            <p className="mt-1 font-mono text-[var(--text-lg)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              {rollNumber}
            </p>
          </div>
        ) : null}
        <ul className="mt-3 space-y-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-2">
            <span aria-hidden="true">✓</span>
            <span>Admission fee received and acknowledged by the college.</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true">📅</span>
            <span>
              Orientation on <strong className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">15 July 2026</strong>
              {" "}at {college}.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true">📞</span>
            <span>
              College helpdesk: 0177-2830-150 (Mon–Fri, 10 AM – 5 PM).
            </span>
          </li>
        </ul>
        <SecondaryActionRow
          primary={{
            label: "Download admission letter",
            href: courseId ? `/payment/${courseId}` : "/applications",
            icon: "🎓",
          }}
          secondary={{
            label: "View payment receipt",
            href: courseId ? `/payment/${courseId}` : "/applications",
            icon: "🧾",
          }}
        />
        <CourseStrip courseId={courseId} applicationNumber={applicationNumber} />
      </DetailCard>
    </div>
  );
}
