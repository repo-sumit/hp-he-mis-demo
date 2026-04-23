"use client";

import Link from "next/link";
import { use, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { PageShell } from "../../../_components/page-shell";
import { PrimaryLink } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { getCourse } from "../../../_components/discover/mock-data";
import { useApplications } from "../../../_components/apply/applications-provider";
import { SuccessSummaryCard } from "../../../_components/apply/success-summary-card";
import { useEffectiveStudentStep } from "../../../_components/use-effective-step";
import type { StatusStep } from "../../../_components/status-tracker";

interface DemoBanner {
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: "info" | "success" | "brand";
}

function bannerForStep(step: StatusStep, courseId: string): DemoBanner | null {
  if (step === "underScrutiny") {
    return {
      title: "College has started scrutiny",
      body: "A reviewer is verifying your documents. Outcome usually within 3 working days.",
      cta: "View application",
      href: "/applications",
      tone: "info",
    };
  }
  if (step === "meritPublished") {
    return {
      title: "Merit list published",
      body: "Your name is on the merit list. Allotment runs next — we'll notify you when your seat is offered.",
      cta: "View application",
      href: "/applications",
      tone: "brand",
    };
  }
  if (step === "allotted") {
    return {
      title: "Seat offered to you",
      body: "Review your offer and choose Freeze, Float, or Decline before the deadline.",
      cta: "View offer",
      href: `/allotment/${courseId}`,
      tone: "success",
    };
  }
  if (step === "admissionConfirmed") {
    return {
      title: "Admission confirmed",
      body: "Your fee is acknowledged and your roll number is issued. Welcome aboard.",
      cta: "View admission",
      href: `/payment/${courseId}`,
      tone: "success",
    };
  }
  return null;
}

type Params = { courseId: string };

export default function SubmittedPage({ params }: { params: Promise<Params> }) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const router = useRouter();
  const { hydrated, getDraft } = useApplications();
  const effective = useEffectiveStudentStep();

  const course = getCourse(courseId);
  if (!course) notFound();

  const draft = getDraft(courseId);
  const courseLabel = `${course.code} · ${t(course.nameKey)}`;
  const demoBanner =
    effective.isDemo && effective.step !== "submitted"
      ? bannerForStep(effective.step, courseId)
      : null;

  // Guard: if the user lands here without having submitted (e.g. deep link
  // before any draft exists), send them back to review.
  useEffect(() => {
    if (!hydrated) return;
    if (draft.status !== "submitted") {
      router.replace(`/apply/${courseId}/review`);
    }
  }, [hydrated, draft.status, courseId, router]);

  if (!hydrated || draft.status !== "submitted" || !draft.applicationNumber || !draft.submittedAt) {
    return (
      <PageShell eyebrow={t("apply.hub.title")} title={courseLabel}>
        <p className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("common.loading")}
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow={t("apply.hub.title")} title={courseLabel} width="comfortable">
      <SuccessSummaryCard
        applicationNumber={draft.applicationNumber}
        submittedAt={draft.submittedAt}
        courseLabel={course.code}
      />

      {demoBanner ? (
        <section
          className={
            demoBanner.tone === "success"
              ? "mt-5 rounded-[var(--radius-lg)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] p-4"
              : demoBanner.tone === "brand"
                ? "mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-softer)] p-4"
                : "mt-5 rounded-[var(--radius-lg)] border border-[var(--color-status-info-fg)] bg-[var(--color-status-info-bg)] p-4"
          }
        >
          <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {demoBanner.title}
          </p>
          <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            {demoBanner.body}
          </p>
          <div className="mt-3">
            <Link
              href={demoBanner.href}
              className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-primary)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)] hover:bg-[var(--color-interactive-primary-hover)]"
            >
              {demoBanner.cta} →
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-5 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] p-4">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-success)] text-[var(--color-text-on-brand)]"
        >
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-status-success-fg)]">
            {t("submitted.trustTitle")}
          </p>
          <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)]">
            {t("submitted.trustBody")}
          </p>
        </div>
      </section>

      <section className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
        <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          <span aria-hidden="true" className="mr-1">📅</span>
          {t("submitted.nextStepsTitle")}
        </p>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("submitted.nextStepsBody")}
        </p>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-2">
        <button
          type="button"
          disabled
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-tertiary)]"
        >
          <span aria-hidden="true">📄</span>
          {t("cta.downloadReceipt")}
        </button>
        <button
          type="button"
          disabled
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-tertiary)]"
        >
          <span aria-hidden="true">🎓</span>
          {t("cta.downloadLetter")}
        </button>
      </section>

      <div className="sticky bottom-0 -mx-4 mt-5 space-y-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <PrimaryLink href="/discover">{t("cta.applyToAnother")}</PrimaryLink>
        <p className="flex items-center justify-center gap-3 text-center text-[var(--text-xs)]">
          <Link
            href="/applications"
            className="font-[var(--weight-medium)] text-[var(--color-text-link)] hover:underline underline-offset-4"
          >
            {t("cta.viewApplications")}
          </Link>
          <span aria-hidden="true" className="text-[var(--color-text-tertiary)]">·</span>
          <Link
            href="/dashboard"
            className="font-[var(--weight-medium)] text-[var(--color-text-link)] hover:underline underline-offset-4"
          >
            {t("cta.backToDashboard")}
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
