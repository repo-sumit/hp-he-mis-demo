"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { cn, useToast } from "@hp-mis/ui";
import type { AllocationEntry } from "@hp-mis/shared-mock";
import { PageShell } from "../../_components/page-shell";
import { BottomTabBar } from "../../_components/bottom-tab-bar";
import { PrimaryButton, PrimaryLink } from "../../_components/primary-button";
import { useLocale } from "../../_components/locale-provider";
import { useProfile } from "../../_components/profile/profile-provider";
import { useApplications } from "../../_components/apply/applications-provider";
import { useAllotmentBridge } from "../../_components/allotment-bridge/allotment-bridge-provider";
import { getCollege, getCourse, offeringsFor } from "../../_components/discover/mock-data";
import { feeFor } from "../../_components/apply/rules";
import { useEffectiveStudentStep } from "../../_components/use-effective-step";

type Params = { courseId: string };

/**
 * Build a representative fee breakup from the total fee. The RFP calls for
 * 42 heads in the final product; for the demo we surface a realistic
 * five-head split that always sums to the total. Numbers come from the
 * RKMV sample in docs/project-context.md §2.7 (indicative).
 */
function buildFeeHeads(total: number): Array<{ label: string; amount: number }> {
  // Derive heads proportionally so "Pay ₹50" stays coherent for BA/BSc/BCom
  // and "Pay ₹300" for BCA/BBA still splits naturally.
  const tuition = Math.round(total * 0.5);
  const library = Math.round(total * 0.15);
  const exam = Math.round(total * 0.15);
  const sports = Math.round(total * 0.1);
  // The final head absorbs rounding so the total is always exact.
  const devFund = total - (tuition + library + exam + sports);
  return [
    { label: "Tuition fee", amount: tuition },
    { label: "Library fee", amount: library },
    { label: "Examination fee", amount: exam },
    { label: "Sports & cultural", amount: sports },
    { label: "Development fund", amount: devFund },
  ];
}

export default function AllotmentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const router = useRouter();
  const { draft } = useProfile();
  const { hydrated: appsHydrated, getDraft } = useApplications();
  const {
    hydrated: bridgeHydrated,
    allocationFor,
    meritPublishedFor,
    setResponse,
  } = useAllotmentBridge();

  const [declineOpen, setDeclineOpen] = useState(false);
  const { toast } = useToast();

  const course = getCourse(courseId);
  if (!course) notFound();

  const appDraft = getDraft(courseId);
  const realAllocation = allocationFor(courseId);
  const meritPublished = meritPublishedFor(courseId);

  // Effective step — when the operator forces "allotted" or
  // "admissionConfirmed" via the demo panel, synthesise a read-only
  // allocation so the student sees the offer card instead of the
  // waiting state. The bridge is NEVER written from here — this is a
  // pure display fallback.
  const effective = useEffectiveStudentStep();
  const demoAllocation: AllocationEntry | null = useMemo(() => {
    if (realAllocation) return null;
    if (
      !effective.isDemo ||
      (effective.step !== "allotted" &&
        effective.step !== "admissionConfirmed")
    ) {
      return null;
    }
    const offering = offeringsFor(undefined, courseId)[0];
    const college = offering ? getCollege(offering.collegeId) : undefined;
    const studentName = draft.fullName.trim() || "Student";
    return {
      applicationId: appDraft.applicationNumber ?? "DEMO-APP",
      rank: 47,
      studentName,
      category: "general",
      offer: {
        collegeId: college?.id ?? "demo-college",
        collegeName: college?.name ?? "Your first preference college",
        feeAmount: feeFor(courseId),
      },
      status:
        effective.step === "admissionConfirmed" ? "admission_confirmed" : "pending",
      offeredAt: Date.now(),
      rollNumber:
        effective.step === "admissionConfirmed"
          ? `${(college?.id ?? "DEMO").toUpperCase()}/2026/0047`
          : undefined,
    };
  }, [effective.isDemo, effective.step, realAllocation, courseId, draft.fullName, appDraft.applicationNumber]);

  const allocation = realAllocation ?? demoAllocation;

  const feeHeads = useMemo(
    () => (allocation ? buildFeeHeads(allocation.offer.feeAmount) : []),
    [allocation],
  );

  const courseLabel = `${course.code} · ${t(course.nameKey)}`;
  const firstName = (draft.fullName.trim().split(/\s+/)[0] ?? "").trim();

  // Loading: either the bridge or applications provider is still hydrating.
  if (!bridgeHydrated || !appsHydrated) {
    return (
      <PageShell eyebrow={t("student.allotment.pageTitle")} title={courseLabel} backHref="/dashboard">
        <p className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("common.loading")}
        </p>
      </PageShell>
    );
  }

  // Guard: if the student hasn't actually submitted for this course, send
  // them back to the apply hub. Prevents deep-linking from showing an
  // allocation for a course the student never applied to.
  if (appDraft.status !== "submitted") {
    return (
      <PageShell eyebrow={t("student.allotment.pageTitle")} title={courseLabel} backHref="/dashboard">
        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center">
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("apply.myApps.empty")}
          </p>
          <div className="mt-4">
            <PrimaryLink href="/dashboard">{t("cta.backToDashboard")}</PrimaryLink>
          </div>
        </section>
      </PageShell>
    );
  }

  // Waiting state: application submitted, merit not yet published OR
  // allocation hasn't run. Students see a calm "wait for next step" card,
  // NOT an empty page.
  if (!allocation) {
    return (
      <PageShell eyebrow={t("student.allotment.pageTitle")} title={courseLabel} backHref="/dashboard" width="comfortable">
        <WaitingCard
          title={t("student.allotment.waitingTitle")}
          body={t("student.allotment.waitingBody")}
          meritPublished={meritPublished}
          t={t}
        />
        <div className="mt-6">
          <PrimaryLink href="/dashboard">{t("cta.backToDashboard")}</PrimaryLink>
        </div>
      </PageShell>
    );
  }

  const status = allocation.status;
  const alreadyResponded =
    status === "float" || status === "decline" || status === "auto_cancelled";
  const alreadyFrozen = status === "freeze";
  const alreadyPaid = status === "fee_paid" || status === "admission_confirmed";

  const onFreeze = () => {
    // Freeze routes directly into payment; the bridge write happens there
    // to keep the "pay to confirm" flow one intentional gesture. We still
    // flip the status here so a refresh doesn't lose the user's choice.
    setResponse(courseId, "freeze");
    router.push(`/payment/${courseId}`);
  };

  const onFloat = () => {
    setResponse(courseId, "float");
    toast(t("student.allotment.toastFloat"), { tone: "success" });
    window.setTimeout(() => router.push("/dashboard"), 900);
  };

  const onDeclineConfirmed = () => {
    setDeclineOpen(false);
    setResponse(courseId, "decline");
    toast(t("student.allotment.toastDecline"), { tone: "info" });
    window.setTimeout(() => router.push("/dashboard"), 900);
  };

  return (
    <PageShell
      eyebrow={t("student.allotment.eyebrow", { n: 1 })}
      title={courseLabel}
      backHref="/dashboard"
      width="comfortable"
      footer={<BottomTabBar />}
    >
      {/* Hero celebratory card */}
      <section className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-softer)] p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-primary)] text-[var(--text-xl)]"
          >
            🎉
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[var(--text-lg)] font-[var(--weight-bold)] text-[var(--color-text-primary)] sm:text-[var(--text-xl)]">
              {firstName
                ? t("student.allotment.heroTitle", { name: firstName })
                : "Congratulations!"}
            </h2>
            <p className="mt-2 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)] sm:text-[var(--text-base)]">
              {t("student.allotment.heroBody", {
                course: course.code,
                college: allocation.offer.collegeName,
              })}
            </p>
            <p className="mt-2 text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-brand)]">
              {t("student.allotment.rankLine", {
                rank: allocation.rank,
                category: allocation.category.toUpperCase(),
              })}
            </p>
            {allocation.offer.combinationLabel ? (
              <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                {t("student.allotment.combinationLine", {
                  combination: allocation.offer.combinationLabel,
                })}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Post-response status banner (only when already chosen Float / Decline / Frozen) */}
      {alreadyResponded || alreadyFrozen || alreadyPaid ? (
        <ResponseStatusBanner entry={allocation} t={t} />
      ) : null}

      {/* Fee breakup */}
      <section className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {t("student.allotment.feeSectionTitle")}
        </h3>
        <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {t("student.allotment.feeBreakupHint")}
        </p>
        <dl className="mt-3 divide-y divide-[var(--color-border-subtle)] text-[var(--text-sm)]">
          {feeHeads.map((h) => (
            <div key={h.label} className="flex items-center justify-between py-2">
              <dt className="text-[var(--color-text-secondary)]">{h.label}</dt>
              <dd className="font-mono text-[var(--color-text-primary)]">
                ₹{h.amount}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2.5 text-[var(--color-text-primary)]">
            <dt className="font-[var(--weight-semibold)]">
              {t("student.payment.totalLine")}
            </dt>
            <dd className="font-mono font-[var(--weight-bold)]">
              ₹{allocation.offer.feeAmount}
            </dd>
          </div>
        </dl>
      </section>

      {/* Action area — only if no final response yet */}
      {!alreadyResponded && !alreadyPaid ? (
        <section className="mt-5">
          <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t("student.allotment.choose")}
          </h3>
          <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
            {t("student.allotment.chooseHelp")}
          </p>

          <div className="mt-3 space-y-2">
            <ActionRow
              kind="primary"
              label={t("student.allotment.freezeCta")}
              help={t("student.allotment.freezeHelp")}
              onClick={onFreeze}
              disabled={alreadyFrozen}
              highlight={alreadyFrozen}
            />
            <ActionRow
              kind="secondary"
              label={t("student.allotment.floatCta")}
              help={t("student.allotment.floatHelp")}
              onClick={onFloat}
            />
            <ActionRow
              kind="ghost"
              label={t("student.allotment.declineCta")}
              help={t("student.allotment.declineHelp")}
              onClick={() => setDeclineOpen(true)}
            />
          </div>
        </section>
      ) : null}

      {/* Decline confirmation modal — simple centered dialog, no portal pkg */}
      {declineOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="decline-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center"
        >
          <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-lg)]">
            <h4
              id="decline-title"
              className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]"
            >
              {t("student.allotment.declineConfirmTitle")}
            </h4>
            <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {t("student.allotment.declineConfirmBody", {
                college: allocation.offer.collegeName,
              })}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
              <PrimaryButton
                onClick={onDeclineConfirmed}
                className="!bg-[var(--color-text-danger)] hover:!bg-[var(--color-text-danger)]"
              >
                {t("student.allotment.declineConfirmCta")}
              </PrimaryButton>
              <PrimaryButton variant="secondary" onClick={() => setDeclineOpen(false)}>
                {t("student.allotment.declineCancelCta")}
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}

      {/* Post-action path: if student already frozen + not yet paid, nudge them into payment */}
      {alreadyFrozen && !alreadyPaid ? (
        <div className="mt-5">
          <PrimaryLink href={`/payment/${courseId}`}>
            {t("student.allotment.statusFrozen")} →
          </PrimaryLink>
        </div>
      ) : null}

      {/* Ambient footer nav when already responded */}
      {alreadyResponded ? (
        <div className="mt-5">
          <PrimaryLink href="/dashboard" variant="secondary">
            {t("cta.backToDashboard")}
          </PrimaryLink>
        </div>
      ) : null}

      {/* Fallback link back if user scrolled past */}
      <div className="mt-8 text-center">
        <Link
          href="/dashboard"
          className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("cta.backToDashboard")}
        </Link>
      </div>
    </PageShell>
  );
}

function WaitingCard({
  title,
  body,
  meritPublished,
  t,
}: {
  title: string;
  body: string;
  meritPublished: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <section className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]"
        >
          ⏱
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {title}
          </h3>
          <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            {body}
          </p>
          {meritPublished ? (
            <p className="mt-2 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-brand)]">
              {t("status.meritPublished")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ResponseStatusBanner({
  entry,
  t,
}: {
  entry: AllocationEntry;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  let key = "student.allotment.statusFrozen";
  let tone = "success";
  if (entry.status === "float") {
    key = "student.allotment.statusFloat";
    tone = "warning";
  } else if (entry.status === "decline" || entry.status === "auto_cancelled") {
    key = "student.allotment.statusDecline";
    tone = "danger";
  } else if (entry.status === "fee_paid") {
    key = "student.allotment.statusFeePaid";
    tone = "success";
  } else if (entry.status === "admission_confirmed") {
    key = "student.allotment.statusConfirmed";
    tone = "success";
  }

  const toneClass =
    tone === "warning"
      ? "border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]"
      : tone === "danger"
        ? "border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]"
        : "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]";

  return (
    <section className={cn("mt-4 rounded-[var(--radius-lg)] border p-3 text-[var(--text-sm)]", toneClass)}>
      {t(key)}
    </section>
  );
}

function ActionRow({
  kind,
  label,
  help,
  onClick,
  disabled,
  highlight,
}: {
  kind: "primary" | "secondary" | "ghost";
  label: string;
  help: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  const wrap =
    kind === "primary"
      ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-softer)]"
      : highlight
        ? "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)]"
        : "border-[var(--color-border)] bg-[var(--color-surface)]";
  const btn =
    kind === "primary"
      ? "primary"
      : kind === "secondary"
        ? "secondary"
        : "ghost";
  return (
    <div className={cn("rounded-[var(--radius-lg)] border p-3", wrap)}>
      <PrimaryButton
        variant={btn as "primary" | "secondary" | "ghost"}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </PrimaryButton>
      <p className="mt-2 text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-tertiary)]">
        {help}
      </p>
    </div>
  );
}
