"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Stepper, type Step } from "@hp-mis/ui";
import { PageShell } from "../../../_components/page-shell";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { useProfile } from "../../../_components/profile/profile-provider";
import { useDocuments } from "../../../_components/documents/documents-provider";
import { getCourse } from "../../../_components/discover/mock-data";
import { useApplications } from "../../../_components/apply/applications-provider";
import { DeclarationBlock } from "../../../_components/apply/declaration-block";
import { feeFor } from "../../../_components/apply/rules";
import { computeReadiness } from "../../../_components/apply/readiness";

type Params = { courseId: string };

export default function DeclarationPage({ params }: { params: Promise<Params> }) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const router = useRouter();
  const { draft } = useProfile();
  const { documents } = useDocuments();
  const { getDraft } = useApplications();

  const course = getCourse(courseId);
  if (!course) notFound();

  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const appDraft = getDraft(courseId);
  const readiness = useMemo(
    () => computeReadiness(draft, documents, appDraft.itemIds.length),
    [draft, documents, appDraft.itemIds.length],
  );

  const courseLabel = `${course.code} · ${t(course.nameKey)}`;
  const fee = feeFor(courseId);

  function handleSubmit() {
    if (!accepted) {
      setError(t("declaration.consentError"));
      return;
    }
    if (!readiness.canSubmit) {
      router.push(`/apply/${courseId}/review`);
      return;
    }
    router.push(`/apply/${courseId}/submit`);
  }

  // Compact numeric stepper — labels would need new bilingual keys; the
  // page title already provides context.
  const applySteps: readonly Step[] = [
    { number: 1, state: "done" },
    { number: 2, state: "done" },
    { number: 3, state: "done" },
    { number: 4, state: "active" },
    { number: 5, state: "idle" },
  ];

  return (
    <PageShell
      eyebrow={t("apply.hub.title")}
      title={courseLabel}
      backHref={`/apply/${courseId}/review`}
    >
      <div className="mx-auto max-w-3xl">
        <Stepper steps={applySteps} variant="compact" className="mb-6" />

        <section>
          <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
            {t("declaration.title")}
          </h2>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("declaration.subtitle")}
          </p>
        </section>

      <section className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-brand-subtle)] p-4">
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("declaration.feeTitle")}
        </p>
        <p className="mt-1 text-[var(--text-2xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
          ₹{fee}
        </p>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("declaration.feeBody", { amount: fee, course: course.code })}
        </p>
        <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {t("declaration.paymentLaterNote")}
        </p>
      </section>

      <section className="mt-5">
        <DeclarationBlock
          accepted={accepted}
          onChange={(next) => {
            setAccepted(next);
            if (next) setError(undefined);
          }}
          error={error}
        />
      </section>

      <div className="sticky bottom-0 -mx-4 mt-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <PrimaryButton type="button" onClick={handleSubmit} disabled={!readiness.canSubmit}>
          {t("cta.submitApplication")}
        </PrimaryButton>
        <p className="mt-2 text-center text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          <Link
            href={`/apply/${courseId}/review`}
            className="font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            {t("cta.backToReview")}
          </Link>
          {" · "}
          {t("declaration.backHint")}
        </p>
      </div>
      </div>
    </PageShell>
  );
}
