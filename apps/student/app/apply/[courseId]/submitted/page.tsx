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

type Params = { courseId: string };

export default function SubmittedPage({ params }: { params: Promise<Params> }) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const router = useRouter();
  const { hydrated, getDraft } = useApplications();

  const course = getCourse(courseId);
  if (!course) notFound();

  const draft = getDraft(courseId);
  const courseLabel = `${course.code} · ${t(course.nameKey)}`;

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

      <section className="mt-5 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] p-4">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-success)] text-[var(--color-text-inverse)]"
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
        <PrimaryLink href="/dashboard">{t("cta.backToDashboard")}</PrimaryLink>
        <p className="text-center text-[var(--text-xs)]">
          <Link
            href="/applications"
            className="font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            {t("cta.viewApplications")}
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
