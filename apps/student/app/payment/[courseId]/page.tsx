"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { cn } from "@hp-mis/ui";
import type { AllocationEntry } from "@hp-mis/shared-mock";
import { PageShell } from "../../_components/page-shell";
import { BottomTabBar } from "../../_components/bottom-tab-bar";
import { PrimaryButton, PrimaryLink } from "../../_components/primary-button";
import { useLocale } from "../../_components/locale-provider";
import { useProfile } from "../../_components/profile/profile-provider";
import { useAllotmentBridge } from "../../_components/allotment-bridge/allotment-bridge-provider";
import { getCourse } from "../../_components/discover/mock-data";

type Params = { courseId: string };
type Stage = "confirm" | "paying" | "success";

/** Fee-head split reused from the allotment page — kept local here so the
 *  two routes stay independently navigable. Change one, change the other. */
function buildFeeHeads(total: number): Array<{ label: string; amount: number }> {
  const tuition = Math.round(total * 0.5);
  const library = Math.round(total * 0.15);
  const exam = Math.round(total * 0.15);
  const sports = Math.round(total * 0.1);
  const devFund = total - (tuition + library + exam + sports);
  return [
    { label: "Tuition fee", amount: tuition },
    { label: "Library fee", amount: library },
    { label: "Examination fee", amount: exam },
    { label: "Sports & cultural", amount: sports },
    { label: "Development fund", amount: devFund },
  ];
}

export default function PaymentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const { draft } = useProfile();
  const {
    hydrated,
    allocationFor,
    markAdmissionConfirmed,
  } = useAllotmentBridge();

  const course = getCourse(courseId);
  if (!course) notFound();

  const courseLabel = `${course.code} · ${t(course.nameKey)}`;
  const firstName = (draft.fullName.trim().split(/\s+/)[0] ?? "").trim();

  const allocation = allocationFor(courseId);

  // If the allocation entry is already admission_confirmed (returning
  // visitor), open on the success screen. Otherwise open on confirm.
  const initialStage: Stage =
    allocation?.status === "admission_confirmed" || allocation?.status === "fee_paid"
      ? "success"
      : "confirm";

  const [stage, setStage] = useState<Stage>(initialStage);
  const [confirmedEntry, setConfirmedEntry] = useState<AllocationEntry | null>(
    allocation?.rollNumber ? allocation : null,
  );

  const feeHeads = useMemo(
    () => (allocation ? buildFeeHeads(allocation.offer.feeAmount) : []),
    [allocation],
  );

  if (!hydrated) {
    return (
      <PageShell eyebrow={t("student.payment.pageTitle")} title={courseLabel}>
        <p className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("common.loading")}
        </p>
      </PageShell>
    );
  }

  // Guard: student must have an allocation to be on this page.
  if (!allocation) {
    return (
      <PageShell
        eyebrow={t("student.payment.pageTitle")}
        title={courseLabel}
        backHref="/dashboard"
      >
        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center">
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("student.allotment.waitingBody")}
          </p>
          <div className="mt-4">
            <PrimaryLink href="/dashboard">{t("cta.backToDashboard")}</PrimaryLink>
          </div>
        </section>
      </PageShell>
    );
  }

  const handlePay = () => {
    setStage("paying");
    // Fake gateway delay — enough to feel real, short enough to not annoy.
    window.setTimeout(() => {
      const entry = markAdmissionConfirmed(courseId, course.code);
      setConfirmedEntry(entry);
      setStage("success");
    }, 1100);
  };

  // === SUCCESS SCREEN ===
  if (stage === "success") {
    const entry = confirmedEntry ?? allocation;
    return (
      <PageShell
        eyebrow={t("student.payment.eyebrow")}
        title={courseLabel}
        width="comfortable"
        footer={<BottomTabBar />}
      >
        <section className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] p-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-success)] text-[var(--text-xl)] text-[var(--color-text-inverse)]"
            >
              🎓
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[var(--text-lg)] font-[var(--weight-bold)] text-[var(--color-status-success-fg)] sm:text-[var(--text-xl)]">
                {t("student.payment.successTitle")}
              </h2>
              <p className="mt-1.5 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)]">
                {t("student.payment.successBody", {
                  college: entry.offer.collegeName,
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Roll number reveal */}
        <section className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("student.payment.rollNumberLabel")}
          </p>
          <p className="mt-2 font-mono text-[var(--text-xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
            {entry.rollNumber ?? "—"}
          </p>
          {firstName ? (
            <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {firstName} · {course.code}
            </p>
          ) : null}
        </section>

        {/* Next steps */}
        <section className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)] p-4">
          <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            <span aria-hidden="true" className="mr-1">📅</span>
            {t("student.payment.nextStepsTitle")}
          </p>
          <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            {t("student.payment.nextStepsBody")}
          </p>
        </section>

        {/* Download actions — hrefs stubbed with '#' so they're visually
            enabled but don't 404. Title attribute signals stub state for
            demo awareness without cluttering the UI with copy about it. */}
        <section className="mt-5 grid grid-cols-1 gap-2">
          <Link
            href="#"
            title="Demo stub — PDF generation wires up post-pilot"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
          >
            <span aria-hidden="true">📄</span>
            {t("student.payment.downloadReceipt")}
          </Link>
          <Link
            href="#"
            title="Demo stub — PDF generation wires up post-pilot"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
          >
            <span aria-hidden="true">🎓</span>
            {t("student.payment.downloadLetter")}
          </Link>
        </section>

        <div className="sticky bottom-0 -mx-4 mt-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <PrimaryLink href="/dashboard">
            {t("student.payment.backToDashboard")}
          </PrimaryLink>
        </div>
      </PageShell>
    );
  }

  // === CONFIRM SCREEN (default) ===
  const paying = stage === "paying";
  return (
    <PageShell
      eyebrow={t("student.payment.eyebrow")}
      title={courseLabel}
      backHref={`/allotment/${courseId}`}
      width="comfortable"
    >
      <section className="mt-3">
        <h2 className="text-[var(--text-lg)] font-[var(--weight-bold)] text-[var(--color-text-primary)] sm:text-[var(--text-xl)]">
          {t("student.payment.confirmTitle")}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
          {t("student.payment.confirmBody")}
        </p>
      </section>

      {/* Offer reminder */}
      <section className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)] p-4">
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {course.code}
        </p>
        <p className="mt-1 text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {allocation.offer.collegeName}
        </p>
        {allocation.offer.combinationLabel ? (
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {allocation.offer.combinationLabel}
          </p>
        ) : null}
      </section>

      {/* Fee breakup */}
      <section className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {t("student.payment.feeHeadsTitle")}
        </h3>
        <dl className="mt-3 divide-y divide-[var(--color-border-subtle)] text-[var(--text-sm)]">
          {feeHeads.map((h) => (
            <div key={h.label} className="flex items-center justify-between py-2">
              <dt className="text-[var(--color-text-secondary)]">{h.label}</dt>
              <dd className="font-mono text-[var(--color-text-primary)]">
                ₹{h.amount}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2.5">
            <dt className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {t("student.payment.totalLine")}
            </dt>
            <dd className="font-mono text-[var(--text-lg)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              ₹{allocation.offer.feeAmount}
            </dd>
          </div>
        </dl>
      </section>

      {/* Pay CTA */}
      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <PrimaryButton onClick={handlePay} disabled={paying} className={cn(paying && "!opacity-80")}>
          {paying
            ? t("student.payment.paying")
            : t("student.payment.payCta", { amount: allocation.offer.feeAmount })}
        </PrimaryButton>
      </div>
    </PageShell>
  );
}
